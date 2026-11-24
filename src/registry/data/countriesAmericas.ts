/**
 * ISO 3166-1 Americas Region Country Definitions
 * Compliance: Law 7 (< 385 LOC)
 */

import type { CountryRecord } from './countriesEurope.js';

export const COUNTRIES_AMERICAS: CountryRecord[] = [
  { name: 'Argentina', alpha2: 'AR', alpha3: 'ARG', numeric: '032', region: 'AMERICAS', dialCode: '+54', currencyCode: 'ARS', sanctionStatus: 'NONE' },
  { name: 'Bahamas', alpha2: 'BS', alpha3: 'BHS', numeric: '044', region: 'AMERICAS', dialCode: '+1-242', currencyCode: 'BSD', sanctionStatus: 'NONE' },
  { name: 'Barbados', alpha2: 'BB', alpha3: 'BRB', numeric: '052', region: 'AMERICAS', dialCode: '+1-246', currencyCode: 'BBD', sanctionStatus: 'NONE' },
  { name: 'Belize', alpha2: 'BZ', alpha3: 'BLZ', numeric: '084', region: 'AMERICAS', dialCode: '+501', currencyCode: 'BZD', sanctionStatus: 'NONE' },
  { name: 'Bermuda', alpha2: 'BM', alpha3: 'BMU', numeric: '060', region: 'AMERICAS', dialCode: '+1-441', currencyCode: 'BMD', sanctionStatus: 'NONE' },
  { name: 'Bolivia', alpha2: 'BO', alpha3: 'BOL', numeric: '068', region: 'AMERICAS', dialCode: '+591', currencyCode: 'BOB', sanctionStatus: 'NONE' },
  { name: 'Brazil', alpha2: 'BR', alpha3: 'BRA', numeric: '076', region: 'AMERICAS', dialCode: '+55', currencyCode: 'BRL', sanctionStatus: 'NONE' },
  { name: 'Canada', alpha2: 'CA', alpha3: 'CAN', numeric: '124', region: 'AMERICAS', dialCode: '+1', currencyCode: 'CAD', sanctionStatus: 'NONE' },
  { name: 'Cayman Islands', alpha2: 'KY', alpha3: 'CYM', numeric: '136', region: 'AMERICAS', dialCode: '+1-345', currencyCode: 'KYD', sanctionStatus: 'NONE' },
  { name: 'Chile', alpha2: 'CL', alpha3: 'CHL', numeric: '152', region: 'AMERICAS', dialCode: '+56', currencyCode: 'CLP', sanctionStatus: 'NONE' },
  { name: 'Colombia', alpha2: 'CO', alpha3: 'COL', numeric: '170', region: 'AMERICAS', dialCode: '+57', currencyCode: 'COP', sanctionStatus: 'NONE' },
  { name: 'Costa Rica', alpha2: 'CR', alpha3: 'CRI', numeric: '188', region: 'AMERICAS', dialCode: '+506', currencyCode: 'CRC', sanctionStatus: 'NONE' },
  { name: 'Cuba', alpha2: 'CU', alpha3: 'CUB', numeric: '192', region: 'AMERICAS', dialCode: '+53', currencyCode: 'CUP', sanctionStatus: 'OFAC_COMPREHENSIVE' },
  { name: 'Dominican Republic', alpha2: 'DO', alpha3: 'DOM', numeric: '214', region: 'AMERICAS', dialCode: '+1-809', currencyCode: 'DOP', sanctionStatus: 'NONE' },
  { name: 'Ecuador', alpha2: 'EC', alpha3: 'ECU', numeric: '218', region: 'AMERICAS', dialCode: '+593', currencyCode: 'USD', sanctionStatus: 'NONE' },
  { name: 'El Salvador', alpha2: 'SV', alpha3: 'SLV', numeric: '222', region: 'AMERICAS', dialCode: '+503', currencyCode: 'USD', sanctionStatus: 'NONE' },
  { name: 'Guatemala', alpha2: 'GT', alpha3: 'GTM', numeric: '320', region: 'AMERICAS', dialCode: '+502', currencyCode: 'GTQ', sanctionStatus: 'NONE' },
  { name: 'Honduras', alpha2: 'HN', alpha3: 'HND', numeric: '340', region: 'AMERICAS', dialCode: '+504', currencyCode: 'HNL', sanctionStatus: 'NONE' },
  { name: 'Jamaica', alpha2: 'JM', alpha3: 'JAM', numeric: '388', region: 'AMERICAS', dialCode: '+1-876', currencyCode: 'JMD', sanctionStatus: 'FATF_GREY' },
  { name: 'Mexico', alpha2: 'MX', alpha3: 'MEX', numeric: '484', region: 'AMERICAS', dialCode: '+52', currencyCode: 'MXN', sanctionStatus: 'NONE' },
  { name: 'Nicaragua', alpha2: 'NI', alpha3: 'NIC', numeric: '558', region: 'AMERICAS', dialCode: '+505', currencyCode: 'NIO', sanctionStatus: 'NONE' },
  { name: 'Panama', alpha2: 'PA', alpha3: 'PAN', numeric: '591', region: 'AMERICAS', dialCode: '+507', currencyCode: 'PAB', sanctionStatus: 'NONE' },
  { name: 'Paraguay', alpha2: 'PY', alpha3: 'PRY', numeric: '600', region: 'AMERICAS', dialCode: '+595', currencyCode: 'PYG', sanctionStatus: 'NONE' },
  { name: 'Peru', alpha2: 'PE', alpha3: 'PER', numeric: '604', region: 'AMERICAS', dialCode: '+51', currencyCode: 'PEN', sanctionStatus: 'NONE' },
  { name: 'Trinidad and Tobago', alpha2: 'TT', alpha3: 'TTO', numeric: '780', region: 'AMERICAS', dialCode: '+1-868', currencyCode: 'TTD', sanctionStatus: 'NONE' },
  { name: 'United States', alpha2: 'US', alpha3: 'USA', numeric: '840', region: 'AMERICAS', dialCode: '+1', currencyCode: 'USD', sanctionStatus: 'NONE' },
  { name: 'Uruguay', alpha2: 'UY', alpha3: 'URY', numeric: '858', region: 'AMERICAS', dialCode: '+598', currencyCode: 'UYU', sanctionStatus: 'NONE' },
  { name: 'Venezuela', alpha2: 'VE', alpha3: 'VEN', numeric: '862', region: 'AMERICAS', dialCode: '+58', currencyCode: 'VES', sanctionStatus: 'OFAC_COMPREHENSIVE' },
];
