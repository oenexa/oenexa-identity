import crypto from 'node:crypto';

export interface WebAuthnPasskeyRecord {
  credentialId: string; // Base64URL
  userId: string;
  publicKeyPem: string;
  signCount: number;
  transports: string[];
  createdAt: string;
  aaguid: string;
  deviceLabel: string;
}

export interface RegistrationChallenge {
  challenge: string; // Base64URL
  rp: { name: string; id: string };
  user: { id: string; name: string; displayName: string };
  pubKeyCredParams: { alg: number; type: 'public-key' }[];
  timeout: number;
  attestation: 'none' | 'indirect' | 'direct';
}

export interface AuthenticationChallenge {
  challenge: string;
  rpId: string;
  timeout: number;
  allowCredentials: { id: string; type: 'public-key'; transports?: string[] }[];
}

export class PasskeyRelyingPartyService {
  private rpName = 'OENEXA Institutional Vault';
  private rpId = 'oenexa.com';
  private pendingChallenges = new Map<string, { challenge: string; userId: string; expiresAt: number }>();
  private credentials = new Map<string, WebAuthnPasskeyRecord>();

  constructor(rpId = 'oenexa.com', rpName = 'OENEXA Institutional Vault') {
    this.rpId = rpId;
    this.rpName = rpName;
  }

  public createRegistrationChallenge(userId: string, email: string): RegistrationChallenge {
    const rawChallenge = crypto.randomBytes(32).toString('base64url');
    this.pendingChallenges.set(`reg:${userId}`, {
      challenge: rawChallenge,
      userId,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    return {
      challenge: rawChallenge,
      rp: { name: this.rpName, id: this.rpId },
      user: {
        id: Buffer.from(userId).toString('base64url'),
        name: email,
        displayName: email.split('@')[0],
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' }, // ES256 (ECDSA P-256)
        { alg: -257, type: 'public-key' }, // RS256
      ],
      timeout: 60000,
      attestation: 'none',
    };
  }

  public verifyRegistration(params: {
    userId: string;
    credentialId: string;
    publicKeyPem: string;
    clientDataJson: string;
    aaguid?: string;
    deviceLabel?: string;
  }): WebAuthnPasskeyRecord {
    const key = `reg:${params.userId}`;
    const pending = this.pendingChallenges.get(key);
    if (!pending) {
      throw new Error('Registration challenge not found or expired.');
    }
    if (Date.now() > pending.expiresAt) {
      this.pendingChallenges.delete(key);
      throw new Error('Registration challenge expired.');
    }

    const clientData = JSON.parse(Buffer.from(params.clientDataJson, 'base64url').toString('utf8'));
    if (clientData.type !== 'webauthn.create') {
      throw new Error(`Invalid clientData type: ${clientData.type}`);
    }
    if (clientData.challenge !== pending.challenge) {
      throw new Error('Challenge mismatch in WebAuthn registration assertion.');
    }

    this.pendingChallenges.delete(key);

    const credential: WebAuthnPasskeyRecord = {
      credentialId: params.credentialId,
      userId: params.userId,
      publicKeyPem: params.publicKeyPem,
      signCount: 0,
      transports: ['internal', 'hybrid'],
      createdAt: new Date().toISOString(),
      aaguid: params.aaguid || '00000000-0000-0000-0000-000000000000',
      deviceLabel: params.deviceLabel || 'FIDO2 Hardware Key',
    };

    this.credentials.set(params.credentialId, credential);
    return credential;
  }

  public createAuthenticationChallenge(userId: string): AuthenticationChallenge {
    const rawChallenge = crypto.randomBytes(32).toString('base64url');
    this.pendingChallenges.set(`auth:${userId}`, {
      challenge: rawChallenge,
      userId,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    const userCreds = Array.from(this.credentials.values()).filter((c) => c.userId === userId);

    return {
      challenge: rawChallenge,
      rpId: this.rpId,
      timeout: 60000,
      allowCredentials: userCreds.map((c) => ({
        id: c.credentialId,
        type: 'public-key',
        transports: c.transports,
      })),
    };
  }

  public verifyAuthentication(params: {
    userId: string;
    credentialId: string;
    clientDataJson: string;
    authenticatorData: string; // Base64URL
    signature: string; // Base64URL
    newSignCount: number;
  }): { verified: boolean; credential: WebAuthnPasskeyRecord } {
    const pendingKey = `auth:${params.userId}`;
    const pending = this.pendingChallenges.get(pendingKey);
    if (!pending) {
      throw new Error('Authentication challenge expired or invalid.');
    }

    const cred = this.credentials.get(params.credentialId);
    if (!cred || cred.userId !== params.userId) {
      throw new Error('Passkey credential not registered for this user.');
    }

    const clientData = JSON.parse(Buffer.from(params.clientDataJson, 'base64url').toString('utf8'));
    if (clientData.type !== 'webauthn.get') {
      throw new Error(`Invalid assertion type: ${clientData.type}`);
    }
    if (clientData.challenge !== pending.challenge) {
      throw new Error('Authentication challenge mismatch.');
    }

    // Clone Protection: signCount must be strictly increasing if > 0
    if (params.newSignCount > 0 && params.newSignCount <= cred.signCount) {
      throw new Error(
        `CRITICAL CLONE DETECTED: Authenticator signCount (${params.newSignCount}) <= registered signCount (${cred.signCount}). Account suspended.`
      );
    }

    // Verify cryptographic signature over (authenticatorData || SHA256(clientDataJSON))
    const clientDataHash = crypto.createHash('sha256').update(Buffer.from(params.clientDataJson, 'base64url')).digest();
    const authDataBuf = Buffer.from(params.authenticatorData, 'base64url');
    const signedPayload = Buffer.concat([authDataBuf, clientDataHash]);

    const verifier = crypto.createVerify('SHA256');
    verifier.update(signedPayload);
    const isValid = verifier.verify(cred.publicKeyPem, Buffer.from(params.signature, 'base64url'));

    if (!isValid) {
      throw new Error('Invalid WebAuthn cryptographic signature.');
    }

    // Update verified sign count
    cred.signCount = params.newSignCount;
    this.pendingChallenges.delete(pendingKey);

    return { verified: true, credential: cred };
  }

  public getCredential(credentialId: string): WebAuthnPasskeyRecord | undefined {
    return this.credentials.get(credentialId);
  }

  public registerRawCredential(cred: WebAuthnPasskeyRecord): void {
    this.credentials.set(cred.credentialId, cred);
  }
}
