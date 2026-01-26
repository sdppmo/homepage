import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { UsageLog } from '@/lib/db/types';

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    getAll: vi.fn(() => []),
    set: vi.fn(),
  })),
}));

const mockSupabaseClient = {
  from: vi.fn(() => ({
    insert: vi.fn(() => Promise.resolve({ error: null })),
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        order: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ 
            data: [], 
            error: null 
          })),
        })),
      })),
    })),
  })),
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => mockSupabaseClient),
}));

describe('Usage Database Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('logUsage', () => {
    it('should log usage without error', async () => {
      const { logUsage } = await import('@/lib/db/usage');
      await expect(
        logUsage('user-id', 'test-feature', { test: 'data' })
      ).resolves.toBeUndefined();
    });

    it('should handle errors gracefully', async () => {
      (mockSupabaseClient.from as any).mockReturnValueOnce({
        insert: vi.fn(() => Promise.resolve({ 
          error: new Error('Database error') 
        })),
      });

      const { logUsage } = await import('@/lib/db/usage');
      await expect(
        logUsage('user-id', 'test-feature')
      ).resolves.toBeUndefined();
    });
  });

  describe('getUserUsage', () => {
    it('should return empty array when no usage found', async () => {
      const { getUserUsage } = await import('@/lib/db/usage');
      const result = await getUserUsage('user-id');
      expect(result).toEqual([]);
    });

    it('should return usage logs', async () => {
      const mockLogs: UsageLog[] = [
        {
          id: 'log-1',
          user_id: 'user-id',
          feature: 'test-feature',
          metadata: { test: 'data' },
          created_at: '2024-01-01T00:00:00Z',
        },
      ];

      (mockSupabaseClient.from as any).mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => Promise.resolve({ 
                data: mockLogs, 
                error: null 
              })),
            })),
          })),
        })),
      });

      const { getUserUsage } = await import('@/lib/db/usage');
      const result = await getUserUsage('user-id');
      expect(result).toEqual(mockLogs);
    });

    it('should respect limit parameter', async () => {
      const mockLimit = vi.fn(() => Promise.resolve({ data: [], error: null }));
      
      (mockSupabaseClient.from as any).mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: mockLimit,
            })),
          })),
        })),
      });

      const { getUserUsage } = await import('@/lib/db/usage');
      await getUserUsage('user-id', 50);
      expect(mockLimit).toHaveBeenCalledWith(50);
    });
  });
});
