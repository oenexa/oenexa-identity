/**
 * SessionSecurityService — Enterprise Login & Session Security Suite.
 * Implements:
 * 1. Anti-Enumeration Pre-Auth Discovery
 * 2. QR Login State Machine (PENDING -> SCANNED -> APPROVED / EXPIRED)
 * 3. Refresh Token Family Rotation with Replay Invalidation
 * 4. Device Trust & "Stay Logged In" Persistence
 * 5. Progressive Lockout & IP Rate Limiting
 * Compliance: NIST SP 800-63B · RFC 6749 · RFC 6819
 */

import crypto from 'node:crypto';

export type QrSessionStatus = 'PENDING' | 'SCANNED' | 'APPROVED' | 'EXPIRED';

export interface QrSession {
  qrId: string;
  status: QrSessionStatus;
  createdAt: number;
  expiresAt: number;
  scannerDeviceId?: string;
  approvingUserId?: string;
  issuedTokens?: { accessToken: string; refreshToken: string };
}

export interface TokenFamilyRecord {
  familyId: string;
  userId: string;
  activeToken: string;
  usedTokens: Set<string>;
  isRevoked: boolean;
  revocationReason?: string;
  createdAt: number;
  expiresAt: number;
  stayLoggedIn: boolean;
  deviceId: string;
}

export interface DeviceTrustRecord {
  deviceId: string;
  userId: string;
  isTrusted: boolean;
  rememberChoice: boolean;
  lastUsedAt: number;
}

export interface LockoutState {
  failedAttempts: number;
  lockedUntil: number;
}

export class SessionSecurityService {
  private qrSessions = new Map<string, QrSession>();
  private tokenFamilies = new Map<string, TokenFamilyRecord>(); // familyId -> record
  private refreshTokenToFamily = new Map<string, string>(); // token -> familyId
  private deviceTrusts = new Map<string, DeviceTrustRecord>(); // deviceId -> record
  private identifierLockouts = new Map<string, LockoutState>(); // identifier -> state
  private ipLockouts = new Map<string, LockoutState>(); // ip -> state

  private readonly QR_TTL_MS = 120_000; // 2 minutes
  private readonly STANDARD_REFRESH_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours
  private readonly TRUSTED_REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

  /**
   * 1. Anti-Enumeration Pre-Auth Discovery
   * Always returns uniform response format regardless of whether identifier exists
   */
  public discoverAuthMethods(identifier: string): {
    identifierHash: string;
    allowedMethods: ('PASSWORD_OTP' | 'PASSKEY' | 'GOOGLE' | 'APPLE' | 'SSO' | 'QR_LOGIN')[];
    requiresMfa: boolean;
    supportsWebAuthn: boolean;
  } {
    const identifierHash = crypto.createHash('sha256').update(identifier.trim().toLowerCase()).digest('hex');
    return {
      identifierHash,
      allowedMethods: ['PASSWORD_OTP', 'PASSKEY', 'GOOGLE', 'APPLE', 'SSO', 'QR_LOGIN'],
      requiresMfa: true,
      supportsWebAuthn: true,
    };
  }

  /**
   * 2. Progressive Lockout Check & Failure Recording
   */
  public checkLockout(identifier: string, ip: string, now = Date.now()): { locked: boolean; retryAfterSeconds: number } {
    const identState = this.identifierLockouts.get(identifier);
    if (identState && identState.lockedUntil > now) {
      return { locked: true, retryAfterSeconds: Math.ceil((identState.lockedUntil - now) / 1000) };
    }
    const ipState = this.ipLockouts.get(ip);
    if (ipState && ipState.lockedUntil > now) {
      return { locked: true, retryAfterSeconds: Math.ceil((ipState.lockedUntil - now) / 1000) };
    }
    return { locked: false, retryAfterSeconds: 0 };
  }

  public recordAuthFailure(identifier: string, ip: string, now = Date.now()): void {
    const updateLockout = (current: LockoutState | undefined): LockoutState => {
      const attempts = (current?.failedAttempts || 0) + 1;
      let lockoutDuration = 0;
      if (attempts >= 10) {
        lockoutDuration = 24 * 60 * 60 * 1000; // 24 hours
      } else if (attempts >= 5) {
        lockoutDuration = 15 * 60 * 1000; // 15 mins
      } else if (attempts >= 3) {
        lockoutDuration = 60 * 1000; // 1 min
      }
      return { failedAttempts: attempts, lockedUntil: now + lockoutDuration };
    };

    this.identifierLockouts.set(identifier, updateLockout(this.identifierLockouts.get(identifier)));
    this.ipLockouts.set(ip, updateLockout(this.ipLockouts.get(ip)));
  }

  public resetAuthFailure(identifier: string, ip: string): void {
    this.identifierLockouts.delete(identifier);
    this.ipLockouts.delete(ip);
  }

  /**
   * 3. QR Login State Machine
   */
  public createQrSession(now = Date.now()): QrSession {
    const qrId = `qr_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
    const session: QrSession = {
      qrId,
      status: 'PENDING',
      createdAt: now,
      expiresAt: now + this.QR_TTL_MS,
    };
    this.qrSessions.set(qrId, session);
    return session;
  }

  public scanQrSession(qrId: string, scannerDeviceId: string, now = Date.now()): QrSession {
    const session = this.qrSessions.get(qrId);
    if (!session) throw new Error('QR session not found');
    if (session.expiresAt < now) {
      session.status = 'EXPIRED';
      throw new Error('QR session has expired');
    }
    if (session.status !== 'PENDING') {
      throw new Error(`Invalid QR transition from ${session.status} to SCANNED`);
    }
    session.status = 'SCANNED';
    session.scannerDeviceId = scannerDeviceId;
    return session;
  }

  public approveQrSession(
    qrId: string,
    approvingUserId: string,
    tokens: { accessToken: string; refreshToken: string },
    now = Date.now()
  ): QrSession {
    const session = this.qrSessions.get(qrId);
    if (!session) throw new Error('QR session not found');
    if (session.expiresAt < now) {
      session.status = 'EXPIRED';
      throw new Error('QR session has expired');
    }
    if (session.status !== 'SCANNED') {
      throw new Error(`QR session must be in SCANNED state to approve, currently: ${session.status}`);
    }
    session.status = 'APPROVED';
    session.approvingUserId = approvingUserId;
    session.issuedTokens = tokens;
    return session;
  }

  public getQrSession(qrId: string, now = Date.now()): QrSession {
    const session = this.qrSessions.get(qrId);
    if (!session) throw new Error('QR session not found');
    if (session.status === 'PENDING' && session.expiresAt < now) {
      session.status = 'EXPIRED';
    }
    return session;
  }

  /**
   * 4. Refresh Token Family Rotation & Replay Attack Protection
   */
  public issueInitialTokens(
    userId: string,
    deviceId: string,
    stayLoggedIn: boolean,
    now = Date.now()
  ): { accessToken: string; refreshToken: string; familyId: string } {
    const familyId = `fam_${crypto.randomUUID()}`;
    const refreshToken = `rt_${crypto.randomBytes(32).toString('hex')}`;
    const accessToken = `at_${crypto.randomBytes(24).toString('hex')}`;
    const ttl = stayLoggedIn ? this.TRUSTED_REFRESH_TTL_MS : this.STANDARD_REFRESH_TTL_MS;

    const record: TokenFamilyRecord = {
      familyId,
      userId,
      activeToken: refreshToken,
      usedTokens: new Set<string>(),
      isRevoked: false,
      createdAt: now,
      expiresAt: now + ttl,
      stayLoggedIn,
      deviceId,
    };

    this.tokenFamilies.set(familyId, record);
    this.refreshTokenToFamily.set(refreshToken, familyId);

    // Save device trust choice
    this.deviceTrusts.set(deviceId, {
      deviceId,
      userId,
      isTrusted: stayLoggedIn,
      rememberChoice: true,
      lastUsedAt: now,
    });

    return { accessToken, refreshToken, familyId };
  }

  public rotateRefreshToken(
    presentedToken: string,
    now = Date.now()
  ): { accessToken: string; newRefreshToken: string } {
    const familyId = this.refreshTokenToFamily.get(presentedToken);
    if (!familyId) {
      throw new Error('Invalid or unrecognized refresh token');
    }

    const family = this.tokenFamilies.get(familyId);
    if (!family) {
      throw new Error('Token family record missing');
    }

    // 1. Check if family is already revoked
    if (family.isRevoked) {
      throw new Error(`Token family revoked: ${family.revocationReason}`);
    }

    // 2. REUSE DETECTION (Replay Attack Check)
    if (family.usedTokens.has(presentedToken)) {
      family.isRevoked = true;
      family.revocationReason = 'REPLAY_ATTACK_DETECTED: Stolen refresh token reuse detected';
      throw new Error('CRITICAL_SECURITY_ALERT: Refresh token reuse detected. Whole token family revoked.');
    }

    // 3. Expiration Check
    if (family.expiresAt < now) {
      family.isRevoked = true;
      family.revocationReason = 'TOKEN_EXPIRED';
      throw new Error('Refresh token has expired');
    }

    if (family.activeToken !== presentedToken) {
      family.isRevoked = true;
      family.revocationReason = 'TOKEN_MISMATCH';
      throw new Error('Presented token is not the active refresh token');
    }

    // 4. Rotate: move presented token to usedTokens, create new child token
    family.usedTokens.add(presentedToken);
    const newRefreshToken = `rt_${crypto.randomBytes(32).toString('hex')}`;
    const newAccessToken = `at_${crypto.randomBytes(24).toString('hex')}`;

    family.activeToken = newRefreshToken;
    this.refreshTokenToFamily.set(newRefreshToken, familyId);

    return { accessToken: newAccessToken, newRefreshToken };
  }

  public getDeviceTrust(deviceId: string): DeviceTrustRecord | undefined {
    return this.deviceTrusts.get(deviceId);
  }
}
