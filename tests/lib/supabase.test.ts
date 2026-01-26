import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the Supabase SSR package
const mockClient = {
  auth: {
    getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
    getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  },
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
    insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
  })),
};

vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(() => mockClient),
  createServerClient: vi.fn(() => mockClient),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    getAll: vi.fn(() => []),
    set: vi.fn(),
  })),
}));

vi.mock('@/lib/config', () => ({
  config: {
    supabase: {
      url: 'https://test.supabase.co',
      anonKey: 'test-anon-key',
    },
  },
}));

describe('Supabase Clients', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Server Client', () => {
    it('should initialize without error', async () => {
      const { createClient: createServerClient } = await import('@/lib/supabase/server');
      
      await expect(createServerClient()).resolves.toBeDefined();
    });

    it('should return client with auth methods', async () => {
      const { createClient: createServerClient } = await import('@/lib/supabase/server');
      const client = await createServerClient();
      
      expect(client).toBeDefined();
      expect(client.auth).toBeDefined();
      expect(client.from).toBeDefined();
    });
  });

  describe('Browser Client', () => {
    it('should initialize without error', async () => {
      const { createClient: createBrowserClient } = await import('@/lib/supabase/client');
      
      expect(() => {
        createBrowserClient();
      }).not.toThrow();
    });

    it('should return client with auth methods', async () => {
      const { createClient: createBrowserClient } = await import('@/lib/supabase/client');
      const client = createBrowserClient();
      
      expect(client).toBeDefined();
      expect(client.auth).toBeDefined();
      expect(client.from).toBeDefined();
    });
  });
});
