import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock sessionStorage for jsdom environment
const mockSessionStorage: Record<string, string> = {};
Object.defineProperty(globalThis, 'sessionStorage', {
  value: {
    setItem: vi.fn((key: string, value: string) => {
      mockSessionStorage[key] = value;
    }),
    getItem: vi.fn((key: string) => mockSessionStorage[key] || null),
    removeItem: vi.fn((key: string) => {
      delete mockSessionStorage[key];
    }),
    clear: vi.fn(() => {
      Object.keys(mockSessionStorage).forEach(key => delete mockSessionStorage[key]);
    }),
    length: 0,
    key: vi.fn(() => null),
  },
  writable: true,
  configurable: true,
});

const mockSupabaseClient = {
  auth: {
    getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
    getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
    signInWithPassword: vi.fn(() => Promise.resolve({ data: { user: null, session: null }, error: null })),
    signUp: vi.fn(() => Promise.resolve({ data: { user: null, session: null }, error: null })),
    signOut: vi.fn(() => Promise.resolve({ error: null })),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    })),
  },
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
      order: vi.fn(() => Promise.resolve({ data: [], error: null })),
    })),
    insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
    update: vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
    })),
    delete: vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
    })),
  })),
};

export function createMockSupabaseClient() {
  return mockSupabaseClient;
}

export function mockSupabaseAuth(overrides = {}) {
  return {
    ...mockSupabaseClient.auth,
    ...overrides,
  };
}

export function mockSupabaseQuery(overrides = {}) {
  return {
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
      order: vi.fn(() => Promise.resolve({ data: [], error: null })),
    })),
    insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
    update: vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
    })),
    delete: vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
    })),
    ...overrides,
  };
}
