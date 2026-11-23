import { describe, it, expect, beforeEach } from 'vitest';
import crypto from 'node:crypto';
import { PasskeyRelyingPartyService } from '../service/PasskeyRelyingPartyService.js';
import { RiskBasedAuthEngine, AuthContext } from '../service/RiskBasedAuthEngine.js';

describe('PasskeyRelyingPartyService & RiskBasedAuthEngine', () => {
  let rpService: PasskeyRelyingPartyService;
  let riskEngine: RiskBasedAuthEngine;
  let keyPair: crypto.KeyPairSyncResult<string, string>;

  beforeEach(() => {
    rpService = new PasskeyRelyingPartyService('oenexa.com', 'OENEXA Test Vault');
    riskEngine = new RiskBasedAuthEngine();
    keyPair = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });
  });

  describe('Passkey WebAuthn Flows', () => {
    it('generates a valid registration challenge and verifies registration attestation', () => {
      const challenge = rpService.createRegistrationChallenge('usr_test_100', 'institutional@oenexa.com');
      expect(challenge.challenge).toBeDefined();
      expect(challenge.rp.id).toBe('oenexa.com');

      const clientDataObj = {
        type: 'webauthn.create',
        challenge: challenge.challenge,
        origin: 'https://oenexa.com',
      };
      const clientDataJson = Buffer.from(JSON.stringify(clientDataObj)).toString('base64url');

      const cred = rpService.verifyRegistration({
        userId: 'usr_test_100',
        credentialId: 'cred_institutional_hw1',
        publicKeyPem: keyPair.publicKey,
        clientDataJson,
        deviceLabel: 'YubiKey 5C NFC',
      });

      expect(cred.userId).toBe('usr_test_100');
      expect(cred.signCount).toBe(0);
      expect(rpService.getCredential('cred_institutional_hw1')).toBeDefined();
    });

    it('successfully verifies authentic assertions and increments signCount', () => {
      // Register credential first
      const regChallenge = rpService.createRegistrationChallenge('usr_test_200', 'treasury@oenexa.com');
      const regClientData = Buffer.from(
        JSON.stringify({
          type: 'webauthn.create',
          challenge: regChallenge.challenge,
          origin: 'https://oenexa.com',
        })
      ).toString('base64url');
      rpService.verifyRegistration({
        userId: 'usr_test_200',
        credentialId: 'cred_test_200',
        publicKeyPem: keyPair.publicKey,
        clientDataJson: regClientData,
      });

      // Issue authentication challenge
      const authChallenge = rpService.createAuthenticationChallenge('usr_test_200');
      const authClientData = Buffer.from(
        JSON.stringify({
          type: 'webauthn.get',
          challenge: authChallenge.challenge,
          origin: 'https://oenexa.com',
        })
      ).toString('base64url');

      const authData = crypto.randomBytes(37).toString('base64url');
      const clientHash = crypto.createHash('sha256').update(Buffer.from(authClientData, 'base64url')).digest();
      const signedData = Buffer.concat([Buffer.from(authData, 'base64url'), clientHash]);

      const signer = crypto.createSign('SHA256');
      signer.update(signedData);
      const signature = signer.sign(keyPair.privateKey).toString('base64url');

      const result = rpService.verifyAuthentication({
        userId: 'usr_test_200',
        credentialId: 'cred_test_200',
        clientDataJson: authClientData,
        authenticatorData: authData,
        signature,
        newSignCount: 1,
      });

      expect(result.verified).toBe(true);
      expect(result.credential.signCount).toBe(1);
    });

    it('rejects passkey assertion with clone detection when signCount does not increment', () => {
      const regChallenge = rpService.createRegistrationChallenge('usr_clone_test', 'clone@oenexa.com');
      const regClientData = Buffer.from(
        JSON.stringify({
          type: 'webauthn.create',
          challenge: regChallenge.challenge,
          origin: 'https://oenexa.com',
        })
      ).toString('base64url');
      const cred = rpService.verifyRegistration({
        userId: 'usr_clone_test',
        credentialId: 'cred_clone_test',
        publicKeyPem: keyPair.publicKey,
        clientDataJson: regClientData,
      });
      cred.signCount = 10; // Already executed 10 signatures

      const authChallenge = rpService.createAuthenticationChallenge('usr_clone_test');
      const authClientData = Buffer.from(
        JSON.stringify({
          type: 'webauthn.get',
          challenge: authChallenge.challenge,
          origin: 'https://oenexa.com',
        })
      ).toString('base64url');

      expect(() => {
        rpService.verifyAuthentication({
          userId: 'usr_clone_test',
          credentialId: 'cred_clone_test',
          clientDataJson: authClientData,
          authenticatorData: 'abc',
          signature: 'sig',
          newSignCount: 10, // Clone replay: same or lesser counter
        });
      }).toThrow(/CRITICAL CLONE DETECTED/);
    });
  });

  describe('Risk-Based Authentication (RBA)', () => {
    it('classifies trusted device in normal geo as LOW risk (ALLOW)', () => {
      const ctx: AuthContext = {
        userId: 'usr_normal',
        ipAddress: '192.168.1.50',
        userAgent: 'Mozilla/5.0 Chrome/120',
        deviceFingerprint: 'fp_trusted_macbook_pro',
        coordinates: { latitude: 48.8566, longitude: 2.3522 }, // Paris
        timestamp: Date.now(),
        isKnownDevice: true,
        failedAttemptsLast15m: 0,
      };

      const result = riskEngine.evaluate(ctx);
      expect(result.tier).toBe('LOW');
      expect(result.action).toBe('ALLOW');
      expect(result.riskScore).toBe(0);
    });

    it('triggers CHALLENGE_MFA for unknown device with recent failed attempts', () => {
      const ctx: AuthContext = {
        userId: 'usr_unknown_dev',
        ipAddress: '82.65.10.22',
        userAgent: 'Mozilla/5.0 Safari/17',
        deviceFingerprint: 'fp_unregistered_ipad',
        coordinates: { latitude: 48.8566, longitude: 2.3522 },
        timestamp: Date.now(),
        isKnownDevice: false, // +25
        failedAttemptsLast15m: 2, // +15
      };

      const result = riskEngine.evaluate(ctx);
      expect(result.tier).toBe('MEDIUM');
      expect(result.action).toBe('CHALLENGE_MFA');
      expect(result.riskScore).toBe(40);
      expect(result.triggers).toContain('UNKNOWN_DEVICE_FINGERPRINT');
    });

    it('detects impossible travel (>900 km/h) and blocks with HIGH risk', () => {
      const now = Date.now();
      // Step 1: Login in London
      riskEngine.evaluate({
        userId: 'usr_traveler',
        ipAddress: '81.2.69.142',
        userAgent: 'Mozilla/5.0',
        deviceFingerprint: 'fp_iphone',
        coordinates: { latitude: 51.5074, longitude: -0.1278 }, // London
        timestamp: now,
        isKnownDevice: true,
        failedAttemptsLast15m: 0,
      });

      // Step 2: Login in Tokyo 1 hour later (approx 9500 km away)
      const result = riskEngine.evaluate({
        userId: 'usr_traveler',
        ipAddress: '133.242.1.1',
        userAgent: 'Mozilla/5.0',
        deviceFingerprint: 'fp_iphone',
        coordinates: { latitude: 35.6762, longitude: 139.6503 }, // Tokyo
        timestamp: now + 3600 * 1000, // 1 hr later
        isKnownDevice: true,
        failedAttemptsLast15m: 0,
      });

      expect(result.tier).toBe('HIGH');
      expect(result.action).toBe('BLOCK_AND_ALERT');
      expect(result.triggers.some((t) => t.startsWith('IMPOSSIBLE_TRAVEL'))).toBe(true);
      expect(result.geoVelocityKmH).toBeGreaterThan(5000);
    });
  });
});
