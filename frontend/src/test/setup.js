import '@testing-library/jest-dom/vitest';

// Mock ResizeObserver which is required by Recharts but not available in jsdom
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = ResizeObserver;

// Mock window.confirm to return true by default
globalThis.confirm = vi.fn(() => true);

// Mock window.alert
globalThis.alert = vi.fn();
