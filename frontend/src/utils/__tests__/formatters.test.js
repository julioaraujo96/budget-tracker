import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatDate,
  formatDateForInput,
  today,
  capitalize,
  typeLabel,
} from '../formatters';

describe('formatters', () => {
  // ─── formatCurrency ────────────────────────────────────────────

  describe('formatCurrency', () => {
    it('should format a positive number as EUR currency', () => {
      const result = formatCurrency(1234.56);
      // German locale formats: 1.234,56 €
      expect(result).toContain('1.234,56');
      expect(result).toContain('€');
    });

    it('should format zero', () => {
      const result = formatCurrency(0);
      expect(result).toContain('0,00');
      expect(result).toContain('€');
    });

    it('should format a negative number', () => {
      const result = formatCurrency(-500);
      expect(result).toContain('500,00');
      expect(result).toContain('€');
    });

    it('should include two decimal places', () => {
      const result = formatCurrency(10);
      expect(result).toContain('10,00');
    });

    it('should format large numbers with thousand separators', () => {
      const result = formatCurrency(1000000);
      expect(result).toContain('1.000.000,00');
    });
  });

  // ─── formatDate ────────────────────────────────────────────────

  describe('formatDate', () => {
    it('should format an ISO date to "day month year" format', () => {
      const result = formatDate('2026-02-14');
      expect(result).toBe('14 Feb 2026');
    });

    it('should return an empty string for empty input', () => {
      expect(formatDate('')).toBe('');
    });

    it('should return an empty string for null input', () => {
      expect(formatDate(null)).toBe('');
    });

    it('should return an empty string for undefined input', () => {
      expect(formatDate(undefined)).toBe('');
    });

    it('should handle different months', () => {
      expect(formatDate('2026-01-01')).toBe('1 Jan 2026');
      expect(formatDate('2026-06-15')).toBe('15 Jun 2026');
      expect(formatDate('2026-12-31')).toBe('31 Dec 2026');
    });
  });

  // ─── formatDateForInput ────────────────────────────────────────

  describe('formatDateForInput', () => {
    it('should return the date string as-is', () => {
      expect(formatDateForInput('2026-02-14')).toBe('2026-02-14');
    });

    it('should return an empty string for falsy input', () => {
      expect(formatDateForInput('')).toBe('');
      expect(formatDateForInput(null)).toBe('');
      expect(formatDateForInput(undefined)).toBe('');
    });
  });

  // ─── today ─────────────────────────────────────────────────────

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

  // ─── capitalize ────────────────────────────────────────────────

  describe('capitalize', () => {
    it('should capitalize the first letter', () => {
      expect(capitalize('hello')).toBe('Hello');
    });

    it('should handle already-capitalized strings', () => {
      expect(capitalize('Hello')).toBe('Hello');
    });

    it('should handle single character strings', () => {
      expect(capitalize('a')).toBe('A');
    });

    it('should return empty string for empty input', () => {
      expect(capitalize('')).toBe('');
    });

    it('should return empty string for null input', () => {
      expect(capitalize(null)).toBe('');
    });

    it('should return empty string for undefined input', () => {
      expect(capitalize(undefined)).toBe('');
    });

    it('should not modify the rest of the string', () => {
      expect(capitalize('hELLO')).toBe('HELLO');
    });
  });

  // ─── typeLabel ─────────────────────────────────────────────────

  describe('typeLabel', () => {
    it('should return a capitalized label for each transaction type', () => {
      expect(typeLabel('expense')).toBe('Expense');
      expect(typeLabel('income')).toBe('Income');
      expect(typeLabel('investment')).toBe('Investment');
    });
  });
});
