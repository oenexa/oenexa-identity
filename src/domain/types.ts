export type KycTier = 'TIER_0' | 'TIER_1' | 'TIER_2' | 'TIER_3';

export type UserRole =
  | 'ROLE_USER'
  | 'ROLE_TRADER'
  | 'ROLE_MERCHANT'
  | 'ROLE_VALIDATOR'
  | 'ROLE_ADMIN'
  | 'ROLE_SUPER_ADMIN';

export interface User {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  tier: KycTier;
  roles: UserRole[];
  mfaEnabled: boolean;
  mfaSecret?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  userId: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  expiresAt: string;
  revoked: boolean;
}

export interface PasskeyCredential {
  id: string;
  userId: string;
  publicKey: string;
  counter: number;
  transports?: string[];
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
  tier: KycTier;
  roles: UserRole[];
}
