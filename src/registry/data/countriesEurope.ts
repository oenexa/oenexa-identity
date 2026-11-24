/**
 * ISO 3166-1 Europe Region Country Definitions
 * Compliance: Law 7 (< 385 LOC)
 */

export interface CountryRecord {
  name: string;
  alpha2: string;
  alpha3: string;
  numeric: string;
  region: 'EUROPE' | 'AMERICAS' | 'ASIA' | 'AFRICA' | 'OCEANIA';
  dialCode: string;
  currencyCode: string;
  sanctionStatus: 'NONE' | 'FATF_GREY' | 'FATF_BLACK' | 'OFAC_COMPREHENSIVE';
}

export const COUNTRIES_EUROPE: CountryRecord[] = [
  { name: 'Albania', alpha2: 'AL', alpha3: 'ALB', numeric: '008', region: 'EUROPE', dialCode: '+355', currencyCode: 'ALL', sanctionStatus: 'NONE' },
  { name: 'Andorra', alpha2: 'AD', alpha3: 'AND', numeric: '020', region: 'EUROPE', dialCode: '+376', currencyCode: 'EUR', sanctionStatus: 'NONE' },
  { name: 'Austria', alpha2: 'AT', alpha3: 'AUT', numeric: '040', region: 'EUROPE', dialCode: '+43', currencyCode: 'EUR', sanctionStatus: 'NONE' },
  { name: 'Belarus', alpha2: 'BY', alpha3: 'BLR', numeric: '112', region: 'EUROPE', dialCode: '+375', currencyCode: 'BYN', sanctionStatus: 'FATF_GREY' },
  { name: 'Belgium', alpha2: 'BE', alpha3: 'BEL', numeric: '056', region: 'EUROPE', dialCode: '+32', currencyCode: 'EUR', sanctionStatus: 'NONE' },
  { name: 'Bosnia and Herzegovina', alpha2: 'BA', alpha3: 'BIH', numeric: '070', region: 'EUROPE', dialCode: '+387', currencyCode: 'BAM', sanctionStatus: 'NONE' },
  { name: 'Bulgaria', alpha2: 'BG', alpha3: 'BGR', numeric: '100', region: 'EUROPE', dialCode: '+359', currencyCode: 'BGN', sanctionStatus: 'FATF_GREY' },
  { name: 'Croatia', alpha2: 'HR', alpha3: 'HRV', numeric: '191', region: 'EUROPE', dialCode: '+385', currencyCode: 'EUR', sanctionStatus: 'NONE' },
  { name: 'Cyprus', alpha2: 'CY', alpha3: 'CYP', numeric: '196', region: 'EUROPE', dialCode: '+357', currencyCode: 'EUR', sanctionStatus: 'NONE' },
  { name: 'Czech Republic', alpha2: 'CZ', alpha3: 'CZE', numeric: '203', region: 'EUROPE', dialCode: '+420', currencyCode: 'CZK', sanctionStatus: 'NONE' },
  { name: 'Denmark', alpha2: 'DK', alpha3: 'DNK', numeric: '208', region: 'EUROPE', dialCode: '+45', currencyCode: 'DKK', sanctionStatus: 'NONE' },
  { name: 'Estonia', alpha2: 'EE', alpha3: 'EST', numeric: '233', region: 'EUROPE', dialCode: '+372', currencyCode: 'EUR', sanctionStatus: 'NONE' },
  { name: 'Finland', alpha2: 'FI', alpha3: 'FIN', numeric: '246', region: 'EUROPE', dialCode: '+358', currencyCode: 'EUR', sanctionStatus: 'NONE' },
  { name: 'France', alpha2: 'FR', alpha3: 'FRA', numeric: '250', region: 'EUROPE', dialCode: '+33', currencyCode: 'EUR', sanctionStatus: 'NONE' },
  { name: 'Germany', alpha2: 'DE', alpha3: 'DEU', numeric: '276', region: 'EUROPE', dialCode: '+49', currencyCode: 'EUR', sanctionStatus: 'NONE' },
  { name: 'Greece', alpha2: 'GR', alpha3: 'GRC', numeric: '300', region: 'EUROPE', dialCode: '+30', currencyCode: 'EUR', sanctionStatus: 'NONE' },
  { name: 'Hungary', alpha2: 'HU', alpha3: 'HUN', numeric: '348', region: 'EUROPE', dialCode: '+36', currencyCode: 'HUF', sanctionStatus: 'NONE' },
  { name: 'Iceland', alpha2: 'IS', alpha3: 'ISL', numeric: '352', region: 'EUROPE', dialCode: '+354', currencyCode: 'ISK', sanctionStatus: 'NONE' },
  { name: 'Ireland', alpha2: 'IE', alpha3: 'IRL', numeric: '372', region: 'EUROPE', dialCode: '+353', currencyCode: 'EUR', sanctionStatus: 'NONE' },
  { name: 'Italy', alpha2: 'IT', alpha3: 'ITA', numeric: '380', region: 'EUROPE', dialCode: '+39', currencyCode: 'EUR', sanctionStatus: 'NONE' },
  { name: 'Latvia', alpha2: 'LV', alpha3: 'LVA', numeric: '428', region: 'EUROPE', dialCode: '+371', currencyCode: 'EUR', sanctionStatus: 'NONE' },
  { name: 'Liechtenstein', alpha2: 'LI', alpha3: 'LIE', numeric: '438', region: 'EUROPE', dialCode: '+423', currencyCode: 'CHF', sanctionStatus: 'NONE' },
  { name: 'Lithuania', alpha2: 'LT', alpha3: 'LTU', numeric: '440', region: 'EUROPE', dialCode: '+370', currencyCode: 'EUR', sanctionStatus: 'NONE' },
  { name: 'Luxembourg', alpha2: 'LU', alpha3: 'LUX', numeric: '442', region: 'EUROPE', dialCode: '+352', currencyCode: 'EUR', sanctionStatus: 'NONE' },
  { name: 'Malta', alpha2: 'MT', alpha3: 'MLT', numeric: '470', region: 'EUROPE', dialCode: '+356', currencyCode: 'EUR', sanctionStatus: 'NONE' },
  { name: 'Monaco', alpha2: 'MC', alpha3: 'MCO', numeric: '492', region: 'EUROPE', dialCode: '+377', currencyCode: 'EUR', sanctionStatus: 'NONE' },
  { name: 'Netherlands', alpha2: 'NL', alpha3: 'NLD', numeric: '528', region: 'EUROPE', dialCode: '+31', currencyCode: 'EUR', sanctionStatus: 'NONE' },
  { name: 'Norway', alpha2: 'NO', alpha3: 'NOR', numeric: '578', region: 'EUROPE', dialCode: '+47', currencyCode: 'NOK', sanctionStatus: 'NONE' },
  { name: 'Poland', alpha2: 'PL', alpha3: 'POL', numeric: '616', region: 'EUROPE', dialCode: '+48', currencyCode: 'PLN', sanctionStatus: 'NONE' },
  { name: 'Portugal', alpha2: 'PT', alpha3: 'PRT', numeric: '620', region: 'EUROPE', dialCode: '+351', currencyCode: 'EUR', sanctionStatus: 'NONE' },
  { name: 'Romania', alpha2: 'RO', alpha3: 'ROU', numeric: '642', region: 'EUROPE', dialCode: '+40', currencyCode: 'RON', sanctionStatus: 'NONE' },
  { name: 'Russia', alpha2: 'RU', alpha3: 'RUS', numeric: '643', region: 'EUROPE', dialCode: '+7', currencyCode: 'RUB', sanctionStatus: 'OFAC_COMPREHENSIVE' },
  { name: 'Serbia', alpha2: 'RS', alpha3: 'SRB', numeric: '688', region: 'EUROPE', dialCode: '+381', currencyCode: 'RSD', sanctionStatus: 'NONE' },
  { name: 'Slovakia', alpha2: 'SK', alpha3: 'SVK', numeric: '703', region: 'EUROPE', dialCode: '+421', currencyCode: 'EUR', sanctionStatus: 'NONE' },
  { name: 'Slovenia', alpha2: 'SI', alpha3: 'SVN', numeric: '705', region: 'EUROPE', dialCode: '+386', currencyCode: 'EUR', sanctionStatus: 'NONE' },
  { name: 'Spain', alpha2: 'ES', alpha3: 'ESP', numeric: '724', region: 'EUROPE', dialCode: '+34', currencyCode: 'EUR', sanctionStatus: 'NONE' },
  { name: 'Sweden', alpha2: 'SE', alpha3: 'SWE', numeric: '752', region: 'EUROPE', dialCode: '+46', currencyCode: 'SEK', sanctionStatus: 'NONE' },
  { name: 'Switzerland', alpha2: 'CH', alpha3: 'CHE', numeric: '756', region: 'EUROPE', dialCode: '+41', currencyCode: 'CHF', sanctionStatus: 'NONE' },
  { name: 'Ukraine', alpha2: 'UA', alpha3: 'UKR', numeric: '804', region: 'EUROPE', dialCode: '+380', currencyCode: 'UAH', sanctionStatus: 'NONE' },
  { name: 'United Kingdom', alpha2: 'GB', alpha3: 'GBR', numeric: '826', region: 'EUROPE', dialCode: '+44', currencyCode: 'GBP', sanctionStatus: 'NONE' },
  { name: 'Vatican City', alpha2: 'VA', alpha3: 'VAT', numeric: '336', region: 'EUROPE', dialCode: '+39', currencyCode: 'EUR', sanctionStatus: 'NONE' },
];
