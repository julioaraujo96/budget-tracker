import {
  today,
  firstDayOfMonth,
  lastDayOfMonth,
  isValidDate,
  addMonths,
  parseDate,
} from '../../utils/dateUtils.js';

describe('dateUtils', () => {
  // ─── today ──────────────────────────────────────────────────────

  describe('today', () => {
    it('should return a string in YYYY-MM-DD format', () => {
      const result = today();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should return the current date', () => {
      const result = today();
      const expected = new Date().toISOString().split('T')[0];
      expect(result).toBe(expected);
    });
  });

  // ─── firstDayOfMonth ───────────────────────────────────────────

  describe('firstDayOfMonth', () => {
    it('should return the first day of a given month', () => {
      expect(firstDayOfMonth(2026, 3)).toBe('2026-03-01');
    });

    it('should zero-pad single-digit months', () => {
      expect(firstDayOfMonth(2026, 1)).toBe('2026-01-01');
      expect(firstDayOfMonth(2026, 9)).toBe('2026-09-01');
    });

    it('should handle December correctly', () => {
      expect(firstDayOfMonth(2026, 12)).toBe('2026-12-01');
    });

    it('should handle different years', () => {
      expect(firstDayOfMonth(2025, 6)).toBe('2025-06-01');
      expect(firstDayOfMonth(2030, 1)).toBe('2030-01-01');
    });
  });

  // ─── lastDayOfMonth ────────────────────────────────────────────

  describe('lastDayOfMonth', () => {
    it('should return the last day of a 31-day month', () => {
      expect(lastDayOfMonth(2026, 1)).toBe('2026-01-31');
      expect(lastDayOfMonth(2026, 3)).toBe('2026-03-31');
      expect(lastDayOfMonth(2026, 7)).toBe('2026-07-31');
    });

    it('should return the last day of a 30-day month', () => {
      expect(lastDayOfMonth(2026, 4)).toBe('2026-04-30');
      expect(lastDayOfMonth(2026, 6)).toBe('2026-06-30');
      expect(lastDayOfMonth(2026, 11)).toBe('2026-11-30');
    });

    it('should return Feb 28 for non-leap years', () => {
      expect(lastDayOfMonth(2026, 2)).toBe('2026-02-28');
      expect(lastDayOfMonth(2025, 2)).toBe('2025-02-28');
    });

    it('should return Feb 29 for leap years', () => {
      expect(lastDayOfMonth(2024, 2)).toBe('2024-02-29');
      expect(lastDayOfMonth(2028, 2)).toBe('2028-02-29');
    });

    it('should handle December correctly', () => {
      expect(lastDayOfMonth(2026, 12)).toBe('2026-12-31');
    });
  });

  // ─── isValidDate ───────────────────────────────────────────────

  describe('isValidDate', () => {
    it('should return true for valid YYYY-MM-DD dates', () => {
      expect(isValidDate('2026-01-15')).toBe(true);
      expect(isValidDate('2026-12-31')).toBe(true);
      expect(isValidDate('2024-02-29')).toBe(true); // Leap year
    });

    it('should return false for invalid format', () => {
      expect(isValidDate('2026/01/15')).toBe(false);
      expect(isValidDate('15-01-2026')).toBe(false);
      expect(isValidDate('2026-1-15')).toBe(false);
      expect(isValidDate('Jan 15, 2026')).toBe(false);
      expect(isValidDate('')).toBe(false);
    });

    it('should accept date strings where JS Date overflows (e.g. Feb 30 becomes Mar 2)', () => {
      // Note: isValidDate only checks regex + Date.parse; it does NOT detect
      // overflow dates like Feb 30 because JS Date silently rolls them over.
      expect(isValidDate('2026-02-30')).toBe(true);
      expect(isValidDate('2025-02-29')).toBe(true);
    });

    it('should return false for clearly invalid month/day values', () => {
      expect(isValidDate('2026-13-01')).toBe(false);
      expect(isValidDate('2026-00-01')).toBe(false);
    });
  });

  // ─── addMonths ─────────────────────────────────────────────────

  describe('addMonths', () => {
    it('should add months to a date', () => {
      expect(addMonths('2026-01-15', 1)).toBe('2026-02-15');
      expect(addMonths('2026-01-15', 3)).toBe('2026-04-15');
    });

    it('should handle year rollover', () => {
      expect(addMonths('2026-11-15', 2)).toBe('2027-01-15');
      expect(addMonths('2026-12-15', 1)).toBe('2027-01-15');
    });

    it('should subtract months with negative values', () => {
      expect(addMonths('2026-06-15', -1)).toBe('2026-05-15');
      expect(addMonths('2026-03-15', -3)).toBe('2025-12-15');
    });

    it('should handle month-end overflow (Jan 31 + 1 month)', () => {
      // Jan 31 + 1 month → Feb 28 or Mar 3 depending on implementation
      // The Date constructor overflows to the next month
      const result = addMonths('2026-01-31', 1);
      // Date.UTC(2026, 1, 31) → March 3rd (overflow)
      expect(result).toBe('2026-03-03');
    });

    it('should handle leap year edge case', () => {
      // Jan 29 + 1 month in a leap year
      expect(addMonths('2024-01-29', 1)).toBe('2024-02-29');
    });

    it('should add zero months and return the same date', () => {
      expect(addMonths('2026-06-15', 0)).toBe('2026-06-15');
    });

    it('should handle adding 12 months', () => {
      expect(addMonths('2026-02-14', 12)).toBe('2027-02-14');
    });
  });

  // ─── parseDate ─────────────────────────────────────────────────

  describe('parseDate', () => {
    it('should parse a valid date into numeric components', () => {
      expect(parseDate('2026-02-14')).toEqual({
        year: 2026,
        month: 2,
        day: 14,
      });
    });

    it('should return numeric types for all components', () => {
      const result = parseDate('2026-01-05');
      expect(typeof result.year).toBe('number');
      expect(typeof result.month).toBe('number');
      expect(typeof result.day).toBe('number');
    });

    it('should strip leading zeros when converting to numbers', () => {
      const result = parseDate('2026-01-05');
      expect(result.month).toBe(1);
      expect(result.day).toBe(5);
    });

    it('should handle end-of-year dates', () => {
      expect(parseDate('2026-12-31')).toEqual({
        year: 2026,
        month: 12,
        day: 31,
      });
    });
  });
});
