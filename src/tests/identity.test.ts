import { describe, it, expect } from 'vitest';
import { IdentityService } from '../service/IdentityService.js';
import { OidcDiscoveryService } from '../service/OidcDiscoveryService.js';
import { EventTypes } from '../domain/events.js';

describe('OENEXA Identity Service & OpenID Connect', () => {
  it('registers user, hashes password securely, and records CloudEvent outbox', () => {
    const service = new IdentityService();
    const result = service.register({
      email: 'founder@oenexa.com',
      username: 'founder',
      password: 'SuperSecretPassword2026!',
    });

    expect(result.user.id.startsWith('usr_')).toBe(true);
    expect(result.user.email).toBe('founder@oenexa.com');
    expect(result.user.passwordHash).not.toContain('SuperSecretPassword2026!');
    expect(result.event.type).toBe(EventTypes.IDENTITY_USER_REGISTERED);
    expect(result.event.specversion).toBe('1.0');
    expect(service.getOutbox()).toHaveLength(1);
  });

  it('authenticates user and returns scoped Bearer tokens', () => {
    const service = new IdentityService();
    service.register({
      email: 'trader@oenexa.com',
      username: 'trader1',
      password: 'SecureTradingPass2026!',
    });

    const tokens = service.authenticate('trader@oenexa.com', 'SecureTradingPass2026!');
    expect(tokens.tokenType).toBe('Bearer');
    expect(tokens.accessToken.startsWith('oen_at_')).toBe(true);
    expect(tokens.expiresIn).toBe(900);
    expect(tokens.tier).toBe('TIER_1');
  });

  it('verifies RFC 7636 PKCE S256 code challenge correctly', () => {
    const service = new IdentityService();
    const codeVerifier = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';
    // SHA256 of codeVerifier in base64url: E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM
    const codeChallenge = 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM';

    expect(service.verifyPkceS256(codeVerifier, codeChallenge)).toBe(true);
    expect(service.verifyPkceS256('invalid-verifier', codeChallenge)).toBe(false);
  });

  it('exposes compliant OIDC discovery document matching id.oenexa.com', () => {
    const config = OidcDiscoveryService.getConfiguration();
    expect(config.issuer).toBe('https://id.oenexa.com');
    expect(config.jwks_uri).toBe('https://id.oenexa.com/.well-known/jwks.json');
    expect(config.scopes_supported).toContain('wallet:read');
    expect(config.code_challenge_methods_supported).toContain('S256');

    const jwks = OidcDiscoveryService.getJwks();
    expect(jwks.keys).toHaveLength(1);
    expect(jwks.keys[0].alg).toBe('RS256');
  });
});
