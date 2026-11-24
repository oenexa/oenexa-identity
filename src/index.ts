import http from 'node:http';
import { IdentityService } from './service/IdentityService.js';
import { OidcDiscoveryService } from './service/OidcDiscoveryService.js';
import { DPoPTokenService } from './service/DPoPTokenService.js';
import { ZeroTrustServiceGuard } from './service/ZeroTrustServiceGuard.js';
import { SiemAuditLogger } from './service/SiemAuditLogger.js';
import { SessionSecurityService } from './service/SessionSecurityService.js';
import { CountryRegistry } from './registry/CountryRegistry.js';

export * from './domain/types.js';
export * from './domain/events.js';
export * from './service/IdentityService.js';
export * from './service/OidcDiscoveryService.js';
export * from './service/PasskeyRelyingPartyService.js';
export * from './service/RiskBasedAuthEngine.js';
export * from './service/DPoPTokenService.js';
export * from './service/ZeroTrustServiceGuard.js';
export * from './service/SiemAuditLogger.js';
export * from './service/SessionSecurityService.js';
export * from './registry/CountryRegistry.js';

export const identity = new IdentityService();
export const oidc = new OidcDiscoveryService();
export const dpopTokenService = new DPoPTokenService();
export const zeroTrustGuard = new ZeroTrustServiceGuard();
export const siemLogger = new SiemAuditLogger();
export const sessionSecurity = new SessionSecurityService();
export const countryRegistry = CountryRegistry.getInstance();

const PORT = Number(process.env.PORT) || 8083;

function parseJson(req: http.IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (c) => {
      body += c.toString();
      if (body.length > 1e6) { req.destroy(); reject(new Error('Payload too large')); }
    });
    req.on('end', () => {
      if (!body.trim()) return resolve({});
      try { resolve(JSON.parse(body)); } catch (e) { reject(new Error('Malformed JSON')); }
    });
    req.on('error', reject);
  });
}

export const server = http.createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }

  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;
  const method = req.method || 'GET';

  try {
    if (pathname === '/health' && method === 'GET') {
      res.writeHead(200);
      return res.end(JSON.stringify({ status: 'UP', service: 'oenexa-identity', timestamp: new Date().toISOString() }));
    }

    if (pathname === '/.well-known/openid-configuration' && method === 'GET') {
      res.writeHead(200);
      return res.end(JSON.stringify(OidcDiscoveryService.getConfiguration()));
    }

    // 1. Dynamic World Country Registry for KYC & Travel Rule
    if ((pathname === '/api/identity/config/countries' || pathname === '/api/v1/identity/config/countries') && method === 'GET') {
      res.writeHead(200);
      return res.end(JSON.stringify({ success: true, data: countryRegistry.getAll(), total: countryRegistry.getTotalCount() }));
    }

    // 2. Anti-Enumeration Pre-Auth Discovery
    if ((pathname === '/api/identity/auth/discover' || pathname === '/api/v1/auth/discover') && method === 'POST') {
      const body = await parseJson(req);
      const data = sessionSecurity.discoverAuthMethods(body.identifier || '');
      res.writeHead(200);
      return res.end(JSON.stringify({ success: true, data }));
    }

    // 3. QR Login State Machine
    if ((pathname === '/api/identity/auth/qr/init' || pathname === '/api/v1/auth/qr/init') && method === 'POST') {
      const data = sessionSecurity.createQrSession();
      res.writeHead(200);
      return res.end(JSON.stringify({ success: true, data }));
    }

    if ((pathname === '/api/identity/auth/qr/scan' || pathname === '/api/v1/auth/qr/scan') && method === 'POST') {
      const body = await parseJson(req);
      const data = sessionSecurity.scanQrSession(body.qrId, body.scannerDeviceId);
      res.writeHead(200);
      return res.end(JSON.stringify({ success: true, data }));
    }

    if ((pathname === '/api/identity/auth/qr/approve' || pathname === '/api/v1/auth/qr/approve') && method === 'POST') {
      const body = await parseJson(req);
      const data = sessionSecurity.approveQrSession(body.qrId, body.approvingUserId, body.tokens);
      res.writeHead(200);
      return res.end(JSON.stringify({ success: true, data }));
    }

    // 4. Token Family Rotation
    if ((pathname === '/api/identity/auth/token/refresh' || pathname === '/api/v1/auth/token/refresh') && method === 'POST') {
      const body = await parseJson(req);
      const data = sessionSecurity.rotateRefreshToken(body.refreshToken);
      res.writeHead(200);
      return res.end(JSON.stringify({ success: true, data }));
    }

    // 5. Country Verification
    if ((pathname === '/api/identity/auth/kyc/verify-country' || pathname === '/api/v1/identity/auth/kyc/verify-country') && method === 'POST') {
      const body = await parseJson(req);
      const result = countryRegistry.verifyForKyc(body.country || '');
      const code = result.valid ? 200 : result.sanctionBlocked ? 403 : 400;
      res.writeHead(code);
      return res.end(JSON.stringify({ success: result.valid, data: result }));
    }

    res.writeHead(404);
    return res.end(JSON.stringify({ success: false, error: 'Endpoint Not Found' }));
  } catch (err: any) {
    res.writeHead(500);
    return res.end(JSON.stringify({ success: false, error: err?.message || 'Internal Server Error' }));
  }
});

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[oenexa-identity] Identity & Auth Microservice listening on port ${PORT}`);
  });
}
