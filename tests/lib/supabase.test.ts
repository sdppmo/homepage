import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createClient as createBrowserClient } from '@/lib/supabase/client';

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    getAll: vi.fn(() => []),
    set: vi.fn(),
  })),
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
    it('should initialize without error', () => {
      expect(() => {
        createBrowserClient();
      }).not.toThrow();
    });

    it('should return client with auth methods', () => {
      const client = createBrowserClient();
      expect(client).toBeDefined();
      expect(client.auth).toBeDefined();
      expect(client.from).toBeDefined();
    });
  });
});
