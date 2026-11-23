import crypto from 'node:crypto';

export interface DPoPProofHeader {
  typ: 'dpop+jwt';
  alg: 'ES256' | 'RS256';
  jwk: {
    kty: string;
    crv?: string;
    x?: string;
    y?: string;
    n?: string;
    e?: string;
  };
}

export interface DPoPProofPayload {
  jti: string; // Unique proof identifier (replay protection)
  htm: string; // HTTP method (e.g. "POST", "GET")
  htu: string; // HTTP target URI without query/fragment (e.g. "https://api.oenexa.com/v1/trade")
  iat: number; // Issued at timestamp (seconds)
  ath?: string; // Access Token Hash (Base64URL SHA-256 of access token)
}

export interface DPoPVerificationResult {
  valid: boolean;
  thumbprint: string;
  error?: string;
}

export class DPoPTokenService {
  private seenJtis = new Map<string, number>(); // jti -> expiresAt
  private readonly MAX_SKEW_SECONDS = 300; // 5 minutes max clock skew
  private readonly JTI_RETENTION_MS = 10 * 60 * 1000; // 10 minutes

  public generateJwkThumbprint(jwk: DPoPProofHeader['jwk']): string {
    let canonical = '';
    if (jwk.kty === 'EC') {
      canonical = JSON.stringify({ crv: jwk.crv, kty: jwk.kty, x: jwk.x, y: jwk.y });
    } else {
      canonical = JSON.stringify({ e: jwk.e, kty: jwk.kty, n: jwk.n });
    }
    return crypto.createHash('sha256').update(canonical).digest('base64url');
  }

  public computeAccessTokenHash(accessToken: string): string {
    return crypto.createHash('sha256').update(accessToken).digest('base64url');
  }

  public verifyProof(params: {
    dpopProofJwt: string;
    expectedHttpMethod: string;
    expectedHttpUri: string;
    accessToken?: string;
  }): DPoPVerificationResult {
    try {
      const parts = params.dpopProofJwt.split('.');
      if (parts.length !== 3) {
        return { valid: false, thumbprint: '', error: 'Malformed DPoP JWT format' };
      }

      const header: DPoPProofHeader = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
      const payload: DPoPProofPayload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
      const signature = Buffer.from(parts[2], 'base64url');

      if (header.typ !== 'dpop+jwt') {
        return { valid: false, thumbprint: '', error: 'Invalid DPoP header typ. Expected dpop+jwt' };
      }
      if (!header.jwk || !header.jwk.kty) {
        return { valid: false, thumbprint: '', error: 'Missing public JWK in DPoP header' };
      }

      // 1. Clock skew verification
      const nowSec = Math.floor(Date.now() / 1000);
      if (Math.abs(nowSec - payload.iat) > this.MAX_SKEW_SECONDS) {
        return { valid: false, thumbprint: '', error: 'DPoP proof timestamp outside acceptable skew window' };
      }

      // 2. Replay protection (jti cache)
      this.purgeExpiredJtis();
      if (this.seenJtis.has(payload.jti)) {
        return { valid: false, thumbprint: '', error: `DPoP jti replay detected: ${payload.jti}` };
      }
      this.seenJtis.set(payload.jti, Date.now() + this.JTI_RETENTION_MS);

      // 3. HTTP method & URI matching
      if (payload.htm.toUpperCase() !== params.expectedHttpMethod.toUpperCase()) {
        return {
          valid: false,
          thumbprint: '',
          error: `HTTP method mismatch. Expected ${params.expectedHttpMethod}, got ${payload.htm}`,
        };
      }

      const normalizedExpectedUri = params.expectedHttpUri.split('?')[0].toLowerCase();
      const normalizedPayloadUri = payload.htu.split('?')[0].toLowerCase();
      if (normalizedPayloadUri !== normalizedExpectedUri) {
        return {
          valid: false,
          thumbprint: '',
          error: `HTTP target URI mismatch. Expected ${normalizedExpectedUri}, got ${normalizedPayloadUri}`,
        };
      }

      // 4. Access Token Hash (ath) verification when token is provided
      if (params.accessToken) {
        const expectedAth = this.computeAccessTokenHash(params.accessToken);
        if (payload.ath !== expectedAth) {
          return { valid: false, thumbprint: '', error: 'DPoP ath does not match provided access token hash' };
        }
      }

      // 5. Cryptographic signature check
      const signedData = Buffer.from(`${parts[0]}.${parts[1]}`);
      const publicKey = crypto.createPublicKey({ key: header.jwk as any, format: 'jwk' });
      const verifier = crypto.createVerify('SHA256');
      verifier.update(signedData);
      const isSigValid = verifier.verify(publicKey, signature);

      if (!isSigValid) {
        return { valid: false, thumbprint: '', error: 'DPoP cryptographic signature verification failed' };
      }

      const thumbprint = this.generateJwkThumbprint(header.jwk);
      return { valid: true, thumbprint };
    } catch (err: any) {
      return { valid: false, thumbprint: '', error: err.message || 'DPoP verification exception' };
    }
  }

  private purgeExpiredJtis(): void {
    const now = Date.now();
    for (const [jti, exp] of this.seenJtis.entries()) {
      if (now > exp) {
        this.seenJtis.delete(jti);
      }
    }
  }
}
