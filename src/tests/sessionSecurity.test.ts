import { describe, it, expect } from 'vitest';
import { SessionSecurityService } from '../service/SessionSecurityService.js';

describe('Enterprise Session Security & Auth Workflows (Area A)', () => {
  const service = new SessionSecurityService();

  describe('Anti-Enumeration Discovery', () => {
    it('returns uniform auth capabilities for known and unknown accounts', () => {
      const res1 = service.discoverAuthMethods('known.user@oenexa.com');
      const res2 = service.discoverAuthMethods('completely.random.unknown@nonexistent.domain');

      expect(res1.allowedMethods).toEqual(res2.allowedMethods);
      expect(res1.requiresMfa).toBe(true);
      expect(res2.requiresMfa).toBe(true);
      expect(res1.identifierHash).toBeDefined();
    });
  });

  describe('Progressive Lockout & Rate Limiting', () => {
    it('enforces progressive lockout across failed attempts', () => {
      const testService = new SessionSecurityService();
      const id = 'test.attacker@evil.org';
      const ip = '198.51.100.42';

      expect(testService.checkLockout(id, ip).locked).toBe(false);

      // Record 3 failures -> 1 min lockout
      testService.recordAuthFailure(id, ip);
      testService.recordAuthFailure(id, ip);
      testService.recordAuthFailure(id, ip);

      const check1 = testService.checkLockout(id, ip);
      expect(check1.locked).toBe(true);
      expect(check1.retryAfterSeconds).toBeGreaterThan(0);

      // Reset
      testService.resetAuthFailure(id, ip);
      expect(testService.checkLockout(id, ip).locked).toBe(false);
    });
  });

  describe('QR Login State Machine', () => {
    it('progresses through PENDING -> SCANNED -> APPROVED correctly', () => {
      const now = Date.now();
      const qr = service.createQrSession(now);
      expect(qr.status).toBe('PENDING');

      // Scan QR
      const scanned = service.scanQrSession(qr.qrId, 'dev_iphone_15_pro', now + 1000);
      expect(scanned.status).toBe('SCANNED');
      expect(scanned.scannerDeviceId).toBe('dev_iphone_15_pro');

      // Approve QR
      const approved = service.approveQrSession(
        qr.qrId,
        'usr_approver_1',
        { accessToken: 'at_123', refreshToken: 'rt_123' },
        now + 2000
      );
      expect(approved.status).toBe('APPROVED');
      expect(approved.approvingUserId).toBe('usr_approver_1');
      expect(approved.issuedTokens?.accessToken).toBe('at_123');
    });

    it('rejects approval on expired QR sessions', () => {
      const now = Date.now();
      const qr = service.createQrSession(now);
      expect(() => {
        service.scanQrSession(qr.qrId, 'dev_test', now + 150_000); // 150s > 120s TTL
      }).toThrow(/expired/i);
    });
  });

  describe('Token Family Rotation & Replay Attack Revocation', () => {
    it('rotates refresh token and issues new child credentials', () => {
      const { refreshToken } = service.issueInitialTokens('usr_alice', 'dev_macbook_pro', true);

      const rotation1 = service.rotateRefreshToken(refreshToken);
      expect(rotation1.accessToken).toBeDefined();
      expect(rotation1.newRefreshToken).toBeDefined();
      expect(rotation1.newRefreshToken).not.toBe(refreshToken);

      const rotation2 = service.rotateRefreshToken(rotation1.newRefreshToken);
      expect(rotation2.newRefreshToken).not.toBe(rotation1.newRefreshToken);
    });

    it('detects replay attack of spent refresh token and immediately revokes entire family', () => {
      const tokenService = new SessionSecurityService();
      const { refreshToken } = tokenService.issueInitialTokens('usr_bob', 'dev_workstation', false);

      // Normal rotation: refreshToken -> rt2
      const rotation1 = tokenService.rotateRefreshToken(refreshToken);
      const rt2 = rotation1.newRefreshToken;

      // ATTACK: Attacker steals and replays the old `refreshToken`
      expect(() => {
        tokenService.rotateRefreshToken(refreshToken);
      }).toThrow(/Refresh token reuse detected/i);

      // Subsequent attempt by legitimate user with `rt2` must also be rejected
      expect(() => {
        tokenService.rotateRefreshToken(rt2);
      }).toThrow(/Token family revoked/i);
    });
  });

  describe('Device Trust & Stay Logged In', () => {
    it('persists device trust preference', () => {
      const devId = 'dev_trusted_hardware_key';
      service.issueInitialTokens('usr_charlie', devId, true);

      const trust = service.getDeviceTrust(devId);
      expect(trust).toBeDefined();
      expect(trust?.isTrusted).toBe(true);
      expect(trust?.rememberChoice).toBe(true);
    });
  });
});
