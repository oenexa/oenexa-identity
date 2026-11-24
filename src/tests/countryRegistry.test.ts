import { describe, it, expect } from 'vitest';
import { CountryRegistry } from '../registry/CountryRegistry.js';

describe('ISO 3166-1 World Country Registry & Sanctions Engine', () => {
  const registry = CountryRegistry.getInstance();

  it('contains comprehensive global jurisdictions across all continents', () => {
    const total = registry.getTotalCount();
    expect(total).toBeGreaterThanOrEqual(100);

    const all = registry.getAll();
    const regions = new Set(all.map((c) => c.region));
    expect(regions.has('EUROPE')).toBe(true);
    expect(regions.has('AMERICAS')).toBe(true);
    expect(regions.has('ASIA')).toBe(true);
    expect(regions.has('AFRICA')).toBe(true);
    expect(regions.has('OCEANIA')).toBe(true);
  });

  it('resolves countries by ISO Alpha-2, Alpha-3, Numeric, and Name', () => {
    const byA2 = registry.find('DE');
    expect(byA2?.name).toBe('Germany');
    expect(byA2?.currencyCode).toBe('EUR');

    const byA3 = registry.find('USA');
    expect(byA3?.name).toBe('United States');
    expect(byA3?.dialCode).toBe('+1');

    const byNum = registry.find('392');
    expect(byNum?.name).toBe('Japan');
    expect(byNum?.currencyCode).toBe('JPY');

    const byName = registry.find('switzerland');
    expect(byName?.alpha2).toBe('CH');
    expect(byName?.currencyCode).toBe('CHF');
  });

  it('detects comprehensive OFAC/FATF sanctioned countries and blocks KYC', () => {
    // North Korea (KP)
    const kycKp = registry.verifyForKyc('KP');
    expect(kycKp.valid).toBe(false);
    expect(kycKp.sanctionBlocked).toBe(true);
    expect(kycKp.error).toMatch(/SANCTIONS_BLOCKED/);

    // Iran (IR)
    const kycIr = registry.verifyForKyc('IRN');
    expect(kycIr.valid).toBe(false);
    expect(kycIr.sanctionBlocked).toBe(true);

    // Syria (SY)
    expect(registry.isSanctioned('Syria')).toBe(true);
  });

  it('flags FATF grey-list countries for Enhanced Due Diligence (EDD)', () => {
    // South Africa (ZA)
    const kycZa = registry.verifyForKyc('ZA');
    expect(kycZa.valid).toBe(true);
    expect(kycZa.sanctionBlocked).toBe(false);
    expect(kycZa.fatfEnhancedDueDiligenceRequired).toBe(true);

    // Nigeria (NG)
    const kycNg = registry.verifyForKyc('NGA');
    expect(kycNg.valid).toBe(true);
    expect(kycNg.fatfEnhancedDueDiligenceRequired).toBe(true);
  });

  it('approves standard compliant jurisdictions without friction', () => {
    const kycFr = registry.verifyForKyc('FR');
    expect(kycFr.valid).toBe(true);
    expect(kycFr.sanctionBlocked).toBe(false);
    expect(kycFr.fatfEnhancedDueDiligenceRequired).toBe(false);

    const kycSg = registry.verifyForKyc('Singapore');
    expect(kycSg.valid).toBe(true);
    expect(kycSg.country?.currencyCode).toBe('SGD');
  });

  it('rejects unknown or invalid country inputs', () => {
    const invalid = registry.verifyForKyc('Atlantis');
    expect(invalid.valid).toBe(false);
    expect(invalid.error).toMatch(/INVALID_COUNTRY/);
  });
});
