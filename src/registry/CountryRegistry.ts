/**
 * CountryRegistry — Comprehensive ISO 3166-1 World Country & Sanctions Directory.
 * Features:
 * - ISO 3166-1 Alpha-2, Alpha-3, Numeric standard resolution
 * - OFAC Comprehensive Sanctions & FATF High-Risk Grey/Blacklist identification
 * - Dialing code and national currency resolution
 * - Banking-Grade KYC & FATF Travel Rule validation
 * Compliance: Law 7 (< 385 LOC).
 */

import { COUNTRIES_EUROPE, type CountryRecord } from './data/countriesEurope.js';
import { COUNTRIES_AMERICAS } from './data/countriesAmericas.js';
import { COUNTRIES_ASIA } from './data/countriesAsia.js';
import { COUNTRIES_AFRICA_OCEANIA } from './data/countriesAfricaOceania.js';

export { type CountryRecord } from './data/countriesEurope.js';

export interface CountryVerificationResult {
  valid: boolean;
  country?: CountryRecord;
  sanctionBlocked: boolean;
  fatfEnhancedDueDiligenceRequired: boolean;
  error?: string;
}

export class CountryRegistry {
  private static instance: CountryRegistry;
  private allCountries: CountryRecord[] = [];
  private byAlpha2 = new Map<string, CountryRecord>();
  private byAlpha3 = new Map<string, CountryRecord>();
  private byNumeric = new Map<string, CountryRecord>();
  private byName = new Map<string, CountryRecord>();

  constructor() {
    this.allCountries = [
      ...COUNTRIES_EUROPE,
      ...COUNTRIES_AMERICAS,
      ...COUNTRIES_ASIA,
      ...COUNTRIES_AFRICA_OCEANIA,
    ];

    for (const c of this.allCountries) {
      this.byAlpha2.set(c.alpha2.toUpperCase(), c);
      this.byAlpha3.set(c.alpha3.toUpperCase(), c);
      this.byNumeric.set(c.numeric, c);
      this.byName.set(c.name.toLowerCase(), c);
    }
  }

  public static getInstance(): CountryRegistry {
    if (!CountryRegistry.instance) {
      CountryRegistry.instance = new CountryRegistry();
    }
    return CountryRegistry.instance;
  }

  public getAll(): CountryRecord[] {
    return [...this.allCountries];
  }

  public getTotalCount(): number {
    return this.allCountries.length;
  }

  public find(identifier: string): CountryRecord | undefined {
    const trimmed = identifier.trim();
    if (!trimmed) return undefined;

    if (/^\d{3}$/.test(trimmed)) return this.byNumeric.get(trimmed);
    const upper = trimmed.toUpperCase();
    if (upper.length === 2) return this.byAlpha2.get(upper);
    if (upper.length === 3) return this.byAlpha3.get(upper);

    return this.byName.get(trimmed.toLowerCase());
  }

  public isSanctioned(identifier: string): boolean {
    const country = this.find(identifier);
    if (!country) return false;
    return country.sanctionStatus === 'OFAC_COMPREHENSIVE' || country.sanctionStatus === 'FATF_BLACK';
  }

  public isFatfHighRisk(identifier: string): boolean {
    const country = this.find(identifier);
    if (!country) return false;
    return (
      country.sanctionStatus === 'FATF_GREY' ||
      country.sanctionStatus === 'FATF_BLACK' ||
      country.sanctionStatus === 'OFAC_COMPREHENSIVE'
    );
  }

  /**
   * Evaluates jurisdiction for KYC on-boarding and institutional asset transfers
   */
  public verifyForKyc(identifier: string): CountryVerificationResult {
    const country = this.find(identifier);
    if (!country) {
      return {
        valid: false,
        sanctionBlocked: false,
        fatfEnhancedDueDiligenceRequired: false,
        error: `INVALID_COUNTRY: Country '${identifier}' is not a recognized ISO 3166-1 jurisdiction`,
      };
    }

    if (this.isSanctioned(country.alpha2)) {
      return {
        valid: false,
        country,
        sanctionBlocked: true,
        fatfEnhancedDueDiligenceRequired: true,
        error: `SANCTIONS_BLOCKED: Country '${country.name}' (${country.alpha2}) is subject to comprehensive international sanctions`,
      };
    }

    const eddRequired = country.sanctionStatus === 'FATF_GREY';
    return {
      valid: true,
      country,
      sanctionBlocked: false,
      fatfEnhancedDueDiligenceRequired: eddRequired,
    };
  }
}
