/**
 * Formats a numeric value as a EUR currency string.
 *
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string (e.g. "1.234,56 €")
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

/**
 * Formats an ISO date string (YYYY-MM-DD) into a locale-friendly display format.
 *
 * @param {string} dateStr - ISO date string (e.g. "2026-02-14")
 * @returns {string} Formatted date string (e.g. "14 Feb 2026")
 */
export function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * Formats an ISO date string (YYYY-MM-DD) for use in HTML date inputs.
 * Returns as-is since the input format is already YYYY-MM-DD.
 *
 * @param {string} dateStr - ISO date string
 * @returns {string} Date in YYYY-MM-DD format
 */
export function formatDateForInput(dateStr) {
  return dateStr || '';
}

/**
 * Returns today's date in YYYY-MM-DD format.
 *
 * @returns {string} Today's date (e.g. "2026-02-14")
 */
export function today() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Capitalizes the first letter of a string.
 *
 * @param {string} str - Input string
 * @returns {string} Capitalized string
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Returns a human-readable label for a transaction type.
 *
 * @param {string} type - Transaction type ('expense' | 'income' | 'investment')
 * @returns {string} Capitalized type label
 */
export function typeLabel(type) {
  return capitalize(type);
}
