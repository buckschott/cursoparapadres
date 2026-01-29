/**
 * Centralized admin configuration.
 * 
 * Edit this ONE file to manage admin access across:
 * - /admin/support page
 * - /api/admin/support/* routes (6 endpoints)
 * - /admin/attorneys page
 * - /admin/testing page
 */

export const ADMIN_EMAILS = [
  'jonescraig@me.com',
] as const;

/**
 * Check if an email is an admin.
 * Case-insensitive comparison.
 */
export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.toLowerCase().trim();
  return ADMIN_EMAILS.some(admin => admin.toLowerCase() === normalized);
}
