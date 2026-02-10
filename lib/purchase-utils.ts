// ============================================
// PURCHASE EXPIRATION UTILITIES
// ============================================
// Shared utility functions for 12-month purchase expiration logic.
// IMPORTANT: This is SEPARATE from certificate expiration (in panelpage.tsx).
// Do not confuse or merge these two concepts.
// ============================================

export const PURCHASE_VALIDITY_MONTHS = 12;
export const PURCHASE_WARNING_DAYS = 30;

/**
 * Check if a purchase has expired (older than 12 months from purchased_at)
 */
export function isPurchaseExpired(purchasedAt: string): boolean {
  const purchaseDate = new Date(purchasedAt);
  const expirationDate = new Date(purchaseDate);
  expirationDate.setMonth(expirationDate.getMonth() + PURCHASE_VALIDITY_MONTHS);
  return new Date() > expirationDate;
}

/**
 * Check if a purchase is within 30 days of expiring
 */
export function isPurchaseExpiringSoon(purchasedAt: string): boolean {
  if (isPurchaseExpired(purchasedAt)) return false;

  const purchaseDate = new Date(purchasedAt);
  const expirationDate = new Date(purchaseDate);
  expirationDate.setMonth(expirationDate.getMonth() + PURCHASE_VALIDITY_MONTHS);

  const now = new Date();
  const msRemaining = expirationDate.getTime() - now.getTime();
  const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));

  return daysRemaining <= PURCHASE_WARNING_DAYS;
}

/**
 * Get the expiration date string for display (formatted in Spanish)
 */
export function getPurchaseExpirationDate(purchasedAt: string): string {
  const purchaseDate = new Date(purchasedAt);
  const expirationDate = new Date(purchaseDate);
  expirationDate.setMonth(expirationDate.getMonth() + PURCHASE_VALIDITY_MONTHS);
  return expirationDate.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Get the number of days remaining before purchase expires.
 * Returns 0 if already expired.
 */
export function getDaysRemaining(purchasedAt: string): number {
  if (isPurchaseExpired(purchasedAt)) return 0;

  const purchaseDate = new Date(purchasedAt);
  const expirationDate = new Date(purchaseDate);
  expirationDate.setMonth(expirationDate.getMonth() + PURCHASE_VALIDITY_MONTHS);

  const now = new Date();
  const msRemaining = expirationDate.getTime() - now.getTime();
  return Math.ceil(msRemaining / (1000 * 60 * 60 * 24));
}
