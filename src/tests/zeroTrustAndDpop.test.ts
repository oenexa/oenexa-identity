import { describe, it, expect, beforeEach } from 'vitest';
import crypto from 'node:crypto';
import { DPoPTokenService } from '../service/DPoPTokenService.js';
import { ZeroTrustServiceGuard } from '../service/ZeroTrustServiceGuard.js';
import { SiemAuditLogger } from '../service/SiemAuditLogger.js';

describe('Banking-Grade Zero-Trust, DPoP & SIEM Audit Suite', () => {
  describe('DPoP Token Service (RFC 9449)', () => {
    let dpopService: DPoPTokenService;
    let ecKeyPair: crypto.KeyPairSyncResult<string, string>;

    beforeEach(() => {
      dpopService = new DPoPTokenService();
      ecKeyPair = crypto.generateKeyPairSync('ec', {
        namedCurve: 'P-256',
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
      });
    });

    it('verifies a valid DPoP proof bound to an HTTP method, URI, and Access Token', () => {
      const pubKeyObj = crypto.createPublicKey(ecKeyPair.publicKey).export({ format: 'jwk' });
      const accessToken = 'eyJhbGciOiJFRDI1NTE5In0.valid_jwt_payload_123';
      const ath = dpopService.computeAccessTokenHash(accessToken);

      const header = {
        typ: 'dpop+jwt',
        alg: 'ES256',
        jwk: pubKeyObj,
      };

      const payload = {
        jti: 'jti_random_proof_1',
        htm: 'POST',
        htu: 'https://api.oenexa.com/v1/orders/limit',
        iat: Math.floor(Date.now() / 1000),
        ath,
      };

      const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
      const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');

      const signer = crypto.createSign('SHA256');
      signer.update(`${encodedHeader}.${encodedPayload}`);
      const signature = signer.sign(ecKeyPair.privateKey).toString('base64url');

      const dpopJwt = `${encodedHeader}.${encodedPayload}.${signature}`;

      const res = dpopService.verifyProof({
        dpopProofJwt: dpopJwt,
        expectedHttpMethod: 'POST',
        expectedHttpUri: 'https://api.oenexa.com/v1/orders/limit',
        accessToken,
      });

      expect(res.valid).toBe(true);
      expect(res.thumbprint).toBeDefined();
    });

    it('rejects DPoP proof replay when the same jti is reused', () => {
      const pubKeyObj = crypto.createPublicKey(ecKeyPair.publicKey).export({ format: 'jwk' });
      const header = { typ: 'dpop+jwt', alg: 'ES256', jwk: pubKeyObj };
      const payload = {
        jti: 'jti_replay_attack',
        htm: 'GET',
        htu: 'https://api.oenexa.com/v1/account',
        iat: Math.floor(Date.now() / 1000),
      };

      const encH = Buffer.from(JSON.stringify(header)).toString('base64url');
      const encP = Buffer.from(JSON.stringify(payload)).toString('base64url');
      const signer = crypto.createSign('SHA256');
      signer.update(`${encH}.${encP}`);
      const signature = signer.sign(ecKeyPair.privateKey).toString('base64url');
      const dpopJwt = `${encH}.${encP}.${signature}`;

      // First call succeeds
      const first = dpopService.verifyProof({
        dpopProofJwt: dpopJwt,
        expectedHttpMethod: 'GET',
        expectedHttpUri: 'https://api.oenexa.com/v1/account',
      });
      expect(first.valid).toBe(true);

      // Replay attempt fails
      const replay = dpopService.verifyProof({
        dpopProofJwt: dpopJwt,
        expectedHttpMethod: 'GET',
        expectedHttpUri: 'https://api.oenexa.com/v1/account',
      });
      expect(replay.valid).toBe(false);
      expect(replay.error).toContain('replay detected');
    });
  });

  describe('Zero-Trust Service Guard & SPIFFE Mesh Access Control', () => {
    let guard: ZeroTrustServiceGuard;

    beforeEach(() => {
      guard = new ZeroTrustServiceGuard();
    });

    it('mints and verifies ephemeral inter-service tokens between authorized services', () => {
      const callerSpiffe = 'spiffe://oenexa.internal/ns/prod/sa/oenexa-wallet';
      const targetService = 'oenexa-security';

      const token = guard.mintServiceToken(callerSpiffe, targetService);
      expect(token.spiffeId).toBe(callerSpiffe);
      expect(token.targetService).toBe(targetService);

      const isValid = guard.verifyServiceToken(token, 'oenexa-security');
      expect(isValid).toBe(true);
    });

    it('rejects unauthorized communication paths across the microservice mesh', () => {
      const callerSpiffe = 'spiffe://oenexa.internal/ns/prod/sa/oenexa-identity';
      // Identity cannot directly communicate with oenexa-node (must go through wallet/core)
      expect(() => {
        guard.mintServiceToken(callerSpiffe, 'oenexa-node');
      }).toThrow(/Zero-Trust Violation/);
    });
  });

  describe('SIEM Audit Logger & Cryptographic Chaining', () => {
    let siem: SiemAuditLogger;

    beforeEach(() => {
      siem = new SiemAuditLogger();
    });

    it('records security events with tamper-evident hash chaining and validates integrity', () => {
      siem.recordEvent({
        severity: 'INFO',
        service: 'oenexa-identity',
        eventType: 'USER_LOGIN_PASSKEY_SUCCESS',
        actor: { userId: 'usr_100', ipAddress: '192.168.1.1' },
        details: { device: 'YubiKey 5C', signCount: 42 },
      });

      siem.recordEvent({
        severity: 'CRITICAL',
        service: 'oenexa-wallet',
        eventType: 'HIGH_VELOCITY_WITHDRAWAL_DETECTED',
        actor: { userId: 'usr_100' },
        details: { amountUsd: 150000, actionTaken: 'TIMELOCK_ENFORCED' },
      });

      const integrity = siem.verifyChainIntegrity();
      expect(integrity.isValid).toBe(true);
      expect(siem.getEvents().length).toBe(2);
    });

    it('detects tampering if any historical audit entry in the log chain is mutated', () => {
      siem.recordEvent({
        severity: 'INFO',
        service: 'oenexa-identity',
        eventType: 'SESSION_START',
        actor: { userId: 'usr_200' },
        details: {},
      });

      siem.recordEvent({
        severity: 'WARNING',
        service: 'oenexa-identity',
        eventType: 'MFA_CHALLENGE',
        actor: { userId: 'usr_200' },
        details: {},
      });

      // Mutate historical event in memory
      const events = siem.getEvents();
      events[0].details = { tampered: true };

      const integrity = siem.verifyChainIntegrity();
      expect(integrity.isValid).toBe(false);
      expect(integrity.brokenAtEventId).toBe(events[0].eventId);
    });
  });
});
