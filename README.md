# OENEXA Identity Service (`oenexa-identity`)

> **Sovereign Single Sign-On (SSO), OAuth2, OIDC & Passkey Authentication Authority**  
> Governed by the OENEXA Security Architecture & Identity Engineering Organizations.

## 1. Domain Ownership
This repository authoritatively owns the **Identity Domain** (`id.oenexa.com`):
- **Owned Data**: User credentials (bcrypt/Argon2id), MFA secrets (TOTP), Passkeys (WebAuthn credentials), Active Sessions, OAuth Client registrations.
- **Owned APIs**: `POST /oauth2/token`, `GET /.well-known/openid-configuration`, `GET /.well-known/jwks.json`, `POST /v1/auth/passkey/verify`.
- **Owned Events**: `com.oenexa.identity.user.registered.v1`, `com.oenexa.identity.session.revoked.v1`.
- **Database Boundary**: Isolated `oenexa-identity-prod-db`. Zero cross-domain database coupling.

---

## 2. Security Standards
- **PKCE S256**: Mandatory cryptographic code verification for authorization code grants.
- **Zero-LocalStorage**: In-memory token management via `@oenexa/auth-sdk`.
- **Transactional Outbox**: Events emitted to Kafka using standard CloudEvents v1.0 schemas (`@oenexa/event-schemas`).
