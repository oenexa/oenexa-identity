/**
 * ISO 3166-1 Africa & Oceania Region Country Definitions
 * Compliance: Law 7 (< 385 LOC)
 */

import type { CountryRecord } from './countriesEurope.js';

export const COUNTRIES_AFRICA_OCEANIA: CountryRecord[] = [
  // Oceania
  { name: 'Australia', alpha2: 'AU', alpha3: 'AUS', numeric: '036', region: 'OCEANIA', dialCode: '+61', currencyCode: 'AUD', sanctionStatus: 'NONE' },
  { name: 'Fiji', alpha2: 'FJ', alpha3: 'FJI', numeric: '242', region: 'OCEANIA', dialCode: '+679', currencyCode: 'FJD', sanctionStatus: 'NONE' },
  { name: 'New Zealand', alpha2: 'NZ', alpha3: 'NZL', numeric: '554', region: 'OCEANIA', dialCode: '+64', currencyCode: 'NZD', sanctionStatus: 'NONE' },
  { name: 'Papua New Guinea', alpha2: 'PG', alpha3: 'PNG', numeric: '598', region: 'OCEANIA', dialCode: '+675', currencyCode: 'PGK', sanctionStatus: 'NONE' },
  { name: 'Samoa', alpha2: 'WS', alpha3: 'WSM', numeric: '882', region: 'OCEANIA', dialCode: '+685', currencyCode: 'WST', sanctionStatus: 'NONE' },
  // Africa
  { name: 'Algeria', alpha2: 'DZ', alpha3: 'DZA', numeric: '012', region: 'AFRICA', dialCode: '+213', currencyCode: 'DZD', sanctionStatus: 'NONE' },
  { name: 'Angola', alpha2: 'AO', alpha3: 'AGO', numeric: '024', region: 'AFRICA', dialCode: '+244', currencyCode: 'AOA', sanctionStatus: 'NONE' },
  { name: 'Botswana', alpha2: 'BW', alpha3: 'BWA', numeric: '072', region: 'AFRICA', dialCode: '+267', currencyCode: 'BWP', sanctionStatus: 'NONE' },
  { name: 'Cameroon', alpha2: 'CM', alpha3: 'CMR', numeric: '120', region: 'AFRICA', dialCode: '+237', currencyCode: 'XAF', sanctionStatus: 'FATF_GREY' },
  { name: 'Cote d\'Ivoire', alpha2: 'CI', alpha3: 'CIV', numeric: '384', region: 'AFRICA', dialCode: '+225', currencyCode: 'XOF', sanctionStatus: 'NONE' },
  { name: 'Egypt', alpha2: 'EG', alpha3: 'EGY', numeric: '818', region: 'AFRICA', dialCode: '+20', currencyCode: 'EGP', sanctionStatus: 'NONE' },
  { name: 'Ethiopia', alpha2: 'ET', alpha3: 'ETH', numeric: '231', region: 'AFRICA', dialCode: '+251', currencyCode: 'ETB', sanctionStatus: 'NONE' },
  { name: 'Ghana', alpha2: 'GH', alpha3: 'GHA', numeric: '288', region: 'AFRICA', dialCode: '+233', currencyCode: 'GHS', sanctionStatus: 'NONE' },
  { name: 'Kenya', alpha2: 'KE', alpha3: 'KEN', numeric: '404', region: 'AFRICA', dialCode: '+254', currencyCode: 'KES', sanctionStatus: 'FATF_GREY' },
  { name: 'Mauritius', alpha2: 'MU', alpha3: 'MUS', numeric: '480', region: 'AFRICA', dialCode: '+230', currencyCode: 'MUR', sanctionStatus: 'NONE' },
  { name: 'Morocco', alpha2: 'MA', alpha3: 'MAR', numeric: '504', region: 'AFRICA', dialCode: '+212', currencyCode: 'MAD', sanctionStatus: 'NONE' },
  { name: 'Mozambique', alpha2: 'MZ', alpha3: 'MOZ', numeric: '508', region: 'AFRICA', dialCode: '+258', currencyCode: 'MZN', sanctionStatus: 'FATF_GREY' },
  { name: 'Namibia', alpha2: 'NA', alpha3: 'NAM', numeric: '516', region: 'AFRICA', dialCode: '+264', currencyCode: 'NAD', sanctionStatus: 'FATF_GREY' },
  { name: 'Nigeria', alpha2: 'NG', alpha3: 'NGA', numeric: '566', region: 'AFRICA', dialCode: '+234', currencyCode: 'NGN', sanctionStatus: 'FATF_GREY' },
  { name: 'Rwanda', alpha2: 'RW', alpha3: 'RWA', numeric: '646', region: 'AFRICA', dialCode: '+250', currencyCode: 'RWF', sanctionStatus: 'NONE' },
  { name: 'Senegal', alpha2: 'SN', alpha3: 'SEN', numeric: '686', region: 'AFRICA', dialCode: '+221', currencyCode: 'XOF', sanctionStatus: 'FATF_GREY' },
  { name: 'Seychelles', alpha2: 'SC', alpha3: 'SYC', numeric: '690', region: 'AFRICA', dialCode: '+248', currencyCode: 'SCR', sanctionStatus: 'NONE' },
  { name: 'South Africa', alpha2: 'ZA', alpha3: 'ZAF', numeric: '710', region: 'AFRICA', dialCode: '+27', currencyCode: 'ZAR', sanctionStatus: 'FATF_GREY' },
  { name: 'Tanzania', alpha2: 'TZ', alpha3: 'TZA', numeric: '834', region: 'AFRICA', dialCode: '+255', currencyCode: 'TZS', sanctionStatus: 'FATF_GREY' },
  { name: 'Tunisia', alpha2: 'TN', alpha3: 'TUN', numeric: '788', region: 'AFRICA', dialCode: '+216', currencyCode: 'TND', sanctionStatus: 'NONE' },
  { name: 'Uganda', alpha2: 'UG', alpha3: 'UGA', numeric: '800', region: 'AFRICA', dialCode: '+256', currencyCode: 'UGX', sanctionStatus: 'NONE' },
  { name: 'Zambia', alpha2: 'ZM', alpha3: 'ZMB', numeric: '894', region: 'AFRICA', dialCode: '+260', currencyCode: 'ZMW', sanctionStatus: 'NONE' },
  { name: 'Zimbabwe', alpha2: 'ZW', alpha3: 'ZWE', numeric: '716', region: 'AFRICA', dialCode: '+263', currencyCode: 'ZWG', sanctionStatus: 'NONE' },
];
