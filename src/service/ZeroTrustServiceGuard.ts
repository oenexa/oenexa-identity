import crypto from 'node:crypto';

export interface SpiffeSvidClaim {
  spiffeId: string; // e.g. "spiffe://oenexa.internal/ns/prod/sa/oenexa-wallet"
  cluster: string;
  namespace: string;
  serviceAccount: string;
  issuedAt: number;
  expiresAt: number;
}

export interface InterServiceAuthToken {
  sourceService: string;
  targetService: string;
  spiffeId: string;
  nonce: string;
  timestamp: number;
  signature: string;
}

export class ZeroTrustServiceGuard {
  private allowedSpiffePatterns = new Set<string>([
    'spiffe://oenexa.internal/ns/prod/sa/oenexa-wallet',
    'spiffe://oenexa.internal/ns/prod/sa/oenexa-identity',
    'spiffe://oenexa.internal/ns/prod/sa/oenexa-security',
    'spiffe://oenexa.internal/ns/prod/sa/oenexa-core',
    'spiffe://oenexa.internal/ns/prod/sa/oenexa-node',
  ]);

  private rbacAccessMatrix: Record<string, string[]> = {
    // callerSpiffeId -> allowedTargetServices
    'spiffe://oenexa.internal/ns/prod/sa/oenexa-identity': ['oenexa-wallet', 'oenexa-security'],
    'spiffe://oenexa.internal/ns/prod/sa/oenexa-wallet': ['oenexa-security', 'oenexa-node'],
    'spiffe://oenexa.internal/ns/prod/sa/oenexa-core': ['oenexa-wallet', 'oenexa-identity', 'oenexa-security'],
  };

  private secretKey: string;

  constructor(secretKey = 'prod-mesh-zero-trust-secret-key-32b-oenexa') {
    this.secretKey = secretKey;
  }

  public mintServiceToken(callerSpiffeId: string, targetService: string): InterServiceAuthToken {
    if (!this.allowedSpiffePatterns.has(callerSpiffeId)) {
      throw new Error(`Caller SPIFFE ID not authorized: ${callerSpiffeId}`);
    }

    const allowedTargets = this.rbacAccessMatrix[callerSpiffeId] || [];
    if (!allowedTargets.includes(targetService)) {
      throw new Error(`Zero-Trust Violation: ${callerSpiffeId} cannot communicate with ${targetService}`);
    }

    const nonce = crypto.randomBytes(16).toString('hex');
    const timestamp = Date.now();
    const sourceService = callerSpiffeId.split('/').pop() || 'unknown';

    const payload = `${callerSpiffeId}:${targetService}:${nonce}:${timestamp}`;
    const signature = crypto.createHmac('sha256', this.secretKey).update(payload).digest('hex');

    return {
      sourceService,
      targetService,
      spiffeId: callerSpiffeId,
      nonce,
      timestamp,
      signature,
    };
  }

  public verifyServiceToken(token: InterServiceAuthToken, expectedTarget: string): boolean {
    if (token.targetService !== expectedTarget) {
      throw new Error(`Target service mismatch. Expected ${expectedTarget}, got ${token.targetService}`);
    }

    // Token expires after 60 seconds (ephemeral inter-service ticket)
    if (Date.now() - token.timestamp > 60000) {
      throw new Error('Inter-service authentication token expired');
    }

    const payload = `${token.spiffeId}:${token.targetService}:${token.nonce}:${token.timestamp}`;
    const expectedSig = crypto.createHmac('sha256', this.secretKey).update(payload).digest('hex');

    if (token.signature !== expectedSig) {
      throw new Error('Invalid inter-service token signature');
    }

    return true;
  }
}
