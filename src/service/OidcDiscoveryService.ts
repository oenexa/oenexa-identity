export interface OidcConfiguration {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint: string;
  jwks_uri: string;
  registration_endpoint: string;
  response_types_supported: string[];
  subject_types_supported: string[];
  id_token_signing_alg_values_supported: string[];
  scopes_supported: string[];
  token_endpoint_auth_methods_supported: string[];
  claims_supported: string[];
  code_challenge_methods_supported: string[];
  service_documentation: string;
}

export class OidcDiscoveryService {
  private static readonly ISSUER = 'https://id.oenexa.com';

  public static getConfiguration(): OidcConfiguration {
    return {
      issuer: this.ISSUER,
      authorization_endpoint: `${this.ISSUER}/login`,
      token_endpoint: `${this.ISSUER}/api/v1/auth/login`,
      userinfo_endpoint: `${this.ISSUER}/api/v1/auth/v2/me`,
      jwks_uri: `${this.ISSUER}/.well-known/jwks.json`,
      registration_endpoint: `${this.ISSUER}/register`,
      response_types_supported: ['code', 'token', 'id_token'],
      subject_types_supported: ['public'],
      id_token_signing_alg_values_supported: ['HS256', 'RS256'],
      scopes_supported: [
        'openid',
        'profile',
        'email',
        'wallet:read',
        'trade:write',
        'pay:execute',
        'ai:use',
        'oengo:order',
      ],
      token_endpoint_auth_methods_supported: ['client_secret_post', 'client_secret_basic', 'none'],
      claims_supported: ['sub', 'iss', 'aud', 'exp', 'iat', 'email', 'name', 'role', 'tier'],
      code_challenge_methods_supported: ['S256', 'plain'],
      service_documentation: 'https://docs.oenexa.com/identity',
    };
  }

  public static getJwks(): { keys: Array<Record<string, unknown>> } {
    return {
      keys: [
        {
          kty: 'RSA',
          use: 'sig',
          alg: 'RS256',
          kid: 'oenexa-id-2026-v1',
          n: 'uQ2...oenexa-auth-token-verification-key',
          e: 'AQAB',
        },
      ],
    };
  }
}
