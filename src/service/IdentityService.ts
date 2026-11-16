import crypto from 'node:crypto';
import {
  createCloudEvent,
  EventTypes,
  type CloudEvent,
  type UserRegisteredPayload,
} from '../domain/events.js';
import type { User, Session, AuthTokens, UserRole, KycTier } from '../domain/types.js';

export class IdentityService {
  private users = new Map<string, User>();
  private sessions = new Map<string, Session>();
  private outbox: CloudEvent<any>[] = [];

  /**
   * Hashes a password using SHA-256 + salt
   */
  public hashPassword(password: string, salt: string = crypto.randomBytes(16).toString('hex')): string {
    const hash = crypto.createHmac('sha256', salt).update(password).digest('hex');
    return `${salt}:${hash}`;
  }

  /**
   * Verifies password against stored salted hash
   */
  public verifyPassword(password: string, storedHash: string): boolean {
    const [salt, expectedHash] = storedHash.split(':');
    if (!salt || !expectedHash) return false;
    const actualHash = crypto.createHmac('sha256', salt).update(password).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(actualHash), Buffer.from(expectedHash));
  }

  /**
   * Verifies PKCE S256 code challenge: BASE64URL(SHA256(code_verifier)) == code_challenge
   */
  public verifyPkceS256(codeVerifier: string, codeChallenge: string): boolean {
    const hash = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
    return hash === codeChallenge;
  }

  /**
   * Registers a new user and appends an outbox domain event
   */
  public register(params: { email: string; username: string; password: string }): { user: User; event: CloudEvent<any> } {
    if (this.users.has(params.email.toLowerCase())) {
      throw new Error(`User with email '${params.email}' already exists.`);
    }

    const userId = `usr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const user: User = {
      id: userId,
      email: params.email.toLowerCase(),
      username: params.username,
      passwordHash: this.hashPassword(params.password),
      tier: 'TIER_1',
      roles: ['ROLE_USER'],
      mfaEnabled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.users.set(user.email, user);

    const payload: UserRegisteredPayload = {
      userId: user.id,
      email: user.email,
      tier: user.tier,
      createdAt: user.createdAt,
    };

    const event = createCloudEvent({
      type: EventTypes.IDENTITY_USER_REGISTERED,
      source: 'https://id.oenexa.com/auth',
      data: payload,
      subject: user.id,
    });

    this.outbox.push(event);

    return { user, event };
  }

  /**
   * Authenticates user credentials and issues session tokens
   */
  public authenticate(email: string, password: string, ipAddress: string = '127.0.0.1'): AuthTokens {
    const user = this.users.get(email.toLowerCase());
    if (!user || !this.verifyPassword(password, user.passwordHash)) {
      throw new Error('Invalid email or password credentials.');
    }

    const sessionId = `ses_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;
    const session: Session = {
      id: sessionId,
      userId: user.id,
      ipAddress,
      userAgent: 'Mozilla/5.0 (Oenexa Ecosystem Client)',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      revoked: false,
    };

    this.sessions.set(session.id, session);

    return {
      accessToken: `oen_at_${crypto.randomBytes(32).toString('hex')}`,
      refreshToken: `oen_rt_${crypto.randomBytes(48).toString('hex')}`,
      expiresIn: 900, // 15 minutes
      tokenType: 'Bearer',
      tier: user.tier,
      roles: user.roles,
    };
  }

  /**
   * Revokes an active user session
   */
  public revokeSession(sessionId: string): CloudEvent {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session '${sessionId}' not found.`);
    }

    session.revoked = true;

    const event = createCloudEvent({
      type: EventTypes.IDENTITY_SESSION_REVOKED,
      source: 'https://id.oenexa.com/sessions',
      data: { sessionId, userId: session.userId, revokedAt: new Date().toISOString() },
      subject: session.userId,
    });

    this.outbox.push(event);
    return event;
  }

  public getOutbox(): CloudEvent<any>[] {
    return [...this.outbox];
  }
}
