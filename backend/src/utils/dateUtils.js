/**
 * Returns today's date as an ISO 8601 date string (YYYY-MM-DD).
 * @returns {string} Today's date
 */
export const today = () => new Date().toISOString().split('T')[0];

/**
 * Returns the first day of a given month.
 * @param {number} year  - Full year (e.g. 2026)
 * @param {number} month - Month number (1-12)
 * @returns {string} Date in YYYY-MM-DD format
 */
export const firstDayOfMonth = (year, month) => {
  const m = String(month).padStart(2, '0');
  return `${year}-${m}-01`;
};

/**
 * Returns the last day of a given month.
 * @param {number} year  - Full year (e.g. 2026)
 * @param {number} month - Month number (1-12)
 * @returns {string} Date in YYYY-MM-DD format
 */
export const lastDayOfMonth = (year, month) => {
  // Day 0 of the *next* month gives the last day of the current month
  const date = new Date(Date.UTC(year, month, 0));
  return date.toISOString().split('T')[0];
};

/**
 * Validates that a string is a well-formed YYYY-MM-DD date.
 * @param {string} dateStr - Date string to validate
 * @returns {boolean} True if valid
 */
export const isValidDate = (dateStr) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return false;
  }
  const date = new Date(dateStr + 'T00:00:00Z');
  return !isNaN(date.getTime());
};

/**
 * Adds (or subtracts) a number of months to a YYYY-MM-DD date string.
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @param {number} months  - Months to add (negative to subtract)
 * @returns {string} Resulting date in YYYY-MM-DD format
 */
export const addMonths = (dateStr, months) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1 + months, day));
  return date.toISOString().split('T')[0];
};

/**
 * Parses a YYYY-MM-DD string into its numeric components.
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @returns {{ year: number, month: number, day: number }}
 */
export const parseDate = (dateStr) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return { year, month, day };
};
