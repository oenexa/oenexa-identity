import http from 'node:http';
import { IdentityService } from './service/IdentityService.js';
import { OidcDiscoveryService } from './service/OidcDiscoveryService.js';
import { DPoPTokenService } from './service/DPoPTokenService.js';
import { ZeroTrustServiceGuard } from './service/ZeroTrustServiceGuard.js';
import { SiemAuditLogger } from './service/SiemAuditLogger.js';

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

const identity = new IdentityService();
const oidc = new OidcDiscoveryService();
const dpopTokenService = new DPoPTokenService();
const zeroTrustGuard = new ZeroTrustServiceGuard();
const siemLogger = new SiemAuditLogger();
const PORT = Number(process.env.PORT) || 8083;

export const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');

  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200);
    return res.end(JSON.stringify({ status: 'UP', service: 'oenexa-identity', timestamp: new Date().toISOString() }));
  }

  if (req.url === '/.well-known/openid-configuration' && req.method === 'GET') {
    res.writeHead(200);
    return res.end(JSON.stringify(OidcDiscoveryService.getConfiguration()));
  }

  res.writeHead(404);
  return res.end(JSON.stringify({ success: false, error: 'Endpoint Not Found' }));
});

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[oenexa-identity] Identity & Auth Microservice listening on port ${PORT}`);
  });
}
