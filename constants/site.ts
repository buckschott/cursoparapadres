/**
 * Site-wide constants for Putting Kids First®
 * 
 * Single source of truth for values used across multiple components.
 * Import these instead of hardcoding strings.
 */

// ===== CONTACT =====

/** Public support email - shown in UI */
export const SUPPORT_EMAIL = 'info@claseparapadres.com';

/** Support phone number */
export const SUPPORT_PHONE = '888-777-2298';

/** Internal customer service email - NEVER expose in UI */
// export const INTERNAL_CS_EMAIL = 'customerservice@...';

// ===== COMPANY =====

export const COMPANY_NAME = 'Putting Kids First®';
export const COMPANY_NAME_PLAIN = 'Putting Kids First'; // Without ®

/** Year company was founded - for trust messaging */
export const FOUNDED_YEAR = 1993;

/** Current year - for copyright */
export const CURRENT_YEAR = new Date().getFullYear();

// ===== URLS =====

export const SITE_URL = {
  /** Spanish site */
  ES: 'https://claseparapadres.com',
  /** English site */
  EN: 'https://puttingkidsfirst.org',
} as const;

// ===== COURSE INFO =====

export const COURSE = {
  COPARENTING: {
    name: 'Clase de Coparentalidad',
    nameEn: 'Co-Parenting Class',
    price: 60,
    duration: '4 horas',
    durationEn: '4 hours',
  },
  PARENTING: {
    name: 'Clase de Crianza',
    nameEn: 'Parenting Class',
    price: 60,
    duration: '4 horas',
    durationEn: '4 hours',
  },
  BUNDLE: {
    name: 'El Paquete Completo',
    nameEn: 'The Complete Bundle',
    price: 80,
    savings: 40,
  },
} as const;

// ===== SOCIAL PROOF =====

export const TRUST = {
  /** Years in business */
  yearsInBusiness: CURRENT_YEAR - FOUNDED_YEAR,
  /** States where accepted */
  statesAccepted: 50,
  /** Guarantee percentage */
  guaranteePercent: 100,
} as const;
