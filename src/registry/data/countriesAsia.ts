/**
 * ISO 3166-1 Asia & Middle East Region Country Definitions
 * Compliance: Law 7 (< 385 LOC)
 */

import type { CountryRecord } from './countriesEurope.js';

export const COUNTRIES_ASIA: CountryRecord[] = [
  { name: 'Armenia', alpha2: 'AM', alpha3: 'ARM', numeric: '051', region: 'ASIA', dialCode: '+374', currencyCode: 'AMD', sanctionStatus: 'NONE' },
  { name: 'Azerbaijan', alpha2: 'AZ', alpha3: 'AZE', numeric: '031', region: 'ASIA', dialCode: '+994', currencyCode: 'AZN', sanctionStatus: 'NONE' },
  { name: 'Bahrain', alpha2: 'BH', alpha3: 'BHR', numeric: '048', region: 'ASIA', dialCode: '+973', currencyCode: 'BHD', sanctionStatus: 'NONE' },
  { name: 'Bangladesh', alpha2: 'BD', alpha3: 'BGD', numeric: '050', region: 'ASIA', dialCode: '+880', currencyCode: 'BDT', sanctionStatus: 'NONE' },
  { name: 'China', alpha2: 'CN', alpha3: 'CHN', numeric: '156', region: 'ASIA', dialCode: '+86', currencyCode: 'CNY', sanctionStatus: 'NONE' },
  { name: 'Georgia', alpha2: 'GE', alpha3: 'GEO', numeric: '268', region: 'ASIA', dialCode: '+995', currencyCode: 'GEL', sanctionStatus: 'NONE' },
  { name: 'Hong Kong', alpha2: 'HK', alpha3: 'HKG', numeric: '344', region: 'ASIA', dialCode: '+852', currencyCode: 'HKD', sanctionStatus: 'NONE' },
  { name: 'India', alpha2: 'IN', alpha3: 'IND', numeric: '356', region: 'ASIA', dialCode: '+91', currencyCode: 'INR', sanctionStatus: 'NONE' },
  { name: 'Indonesia', alpha2: 'ID', alpha3: 'IDN', numeric: '360', region: 'ASIA', dialCode: '+62', currencyCode: 'IDR', sanctionStatus: 'NONE' },
  { name: 'Iran', alpha2: 'IR', alpha3: 'IRN', numeric: '364', region: 'ASIA', dialCode: '+98', currencyCode: 'IRR', sanctionStatus: 'FATF_BLACK' },
  { name: 'Iraq', alpha2: 'IQ', alpha3: 'IRQ', numeric: '368', region: 'ASIA', dialCode: '+964', currencyCode: 'IQD', sanctionStatus: 'FATF_GREY' },
  { name: 'Israel', alpha2: 'IL', alpha3: 'ISR', numeric: '376', region: 'ASIA', dialCode: '+972', currencyCode: 'ILS', sanctionStatus: 'NONE' },
  { name: 'Japan', alpha2: 'JP', alpha3: 'JPN', numeric: '392', region: 'ASIA', dialCode: '+81', currencyCode: 'JPY', sanctionStatus: 'NONE' },
  { name: 'Jordan', alpha2: 'JO', alpha3: 'JOR', numeric: '400', region: 'ASIA', dialCode: '+962', currencyCode: 'JOD', sanctionStatus: 'NONE' },
  { name: 'Kazakhstan', alpha2: 'KZ', alpha3: 'KAZ', numeric: '398', region: 'ASIA', dialCode: '+7', currencyCode: 'KZT', sanctionStatus: 'NONE' },
  { name: 'Kuwait', alpha2: 'KW', alpha3: 'KWT', numeric: '414', region: 'ASIA', dialCode: '+965', currencyCode: 'KWD', sanctionStatus: 'NONE' },
  { name: 'Malaysia', alpha2: 'MY', alpha3: 'MYS', numeric: '458', region: 'ASIA', dialCode: '+60', currencyCode: 'MYR', sanctionStatus: 'NONE' },
  { name: 'North Korea', alpha2: 'KP', alpha3: 'PRK', numeric: '408', region: 'ASIA', dialCode: '+850', currencyCode: 'KPW', sanctionStatus: 'FATF_BLACK' },
  { name: 'Oman', alpha2: 'OM', alpha3: 'OMN', numeric: '512', region: 'ASIA', dialCode: '+968', currencyCode: 'OMR', sanctionStatus: 'NONE' },
  { name: 'Pakistan', alpha2: 'PK', alpha3: 'PAK', numeric: '586', region: 'ASIA', dialCode: '+92', currencyCode: 'PKR', sanctionStatus: 'NONE' },
  { name: 'Philippines', alpha2: 'PH', alpha3: 'PHL', numeric: '608', region: 'ASIA', dialCode: '+63', currencyCode: 'PHP', sanctionStatus: 'FATF_GREY' },
  { name: 'Qatar', alpha2: 'QA', alpha3: 'QAT', numeric: '634', region: 'ASIA', dialCode: '+974', currencyCode: 'QAR', sanctionStatus: 'NONE' },
  { name: 'Saudi Arabia', alpha2: 'SA', alpha3: 'SAU', numeric: '682', region: 'ASIA', dialCode: '+966', currencyCode: 'SAR', sanctionStatus: 'NONE' },
  { name: 'Singapore', alpha2: 'SG', alpha3: 'SGP', numeric: '702', region: 'ASIA', dialCode: '+65', currencyCode: 'SGD', sanctionStatus: 'NONE' },
  { name: 'South Korea', alpha2: 'KR', alpha3: 'KOR', numeric: '410', region: 'ASIA', dialCode: '+82', currencyCode: 'KRW', sanctionStatus: 'NONE' },
  { name: 'Syria', alpha2: 'SY', alpha3: 'SYR', numeric: '760', region: 'ASIA', dialCode: '+963', currencyCode: 'SYP', sanctionStatus: 'OFAC_COMPREHENSIVE' },
  { name: 'Taiwan', alpha2: 'TW', alpha3: 'TWN', numeric: '158', region: 'ASIA', dialCode: '+886', currencyCode: 'TWD', sanctionStatus: 'NONE' },
  { name: 'Thailand', alpha2: 'TH', alpha3: 'THA', numeric: '764', region: 'ASIA', dialCode: '+66', currencyCode: 'THB', sanctionStatus: 'NONE' },
  { name: 'Turkey', alpha2: 'TR', alpha3: 'TUR', numeric: '792', region: 'ASIA', dialCode: '+90', currencyCode: 'TRY', sanctionStatus: 'NONE' },
  { name: 'United Arab Emirates', alpha2: 'AE', alpha3: 'ARE', numeric: '784', region: 'ASIA', dialCode: '+971', currencyCode: 'AED', sanctionStatus: 'NONE' },
  { name: 'Uzbekistan', alpha2: 'UZ', alpha3: 'UZB', numeric: '860', region: 'ASIA', dialCode: '+998', currencyCode: 'UZS', sanctionStatus: 'NONE' },
  { name: 'Vietnam', alpha2: 'VN', alpha3: 'VNM', numeric: '704', region: 'ASIA', dialCode: '+84', currencyCode: 'VND', sanctionStatus: 'FATF_GREY' },
];
