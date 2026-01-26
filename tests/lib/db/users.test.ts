import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { UserProfile } from '@/lib/db/types';

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    getAll: vi.fn(() => []),
    set: vi.fn(),
  })),
}));

const mockSupabaseClient = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        maybeSingle: vi.fn(() => Promise.resolve({ 
          data: null, 
          error: null 
        })),
        single: vi.fn(() => Promise.resolve({ 
          data: null, 
          error: null 
        })),
      })),
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ 
            data: null, 
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

describe('User Database Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserProfile', () => {
    it('should return null when user not found', async () => {
      const { getUserProfile } = await import('@/lib/db/users');
      const result = await getUserProfile('non-existent-id');
      expect(result).toBeNull();
    });

    it('should return user profile when found', async () => {
      const mockProfile: UserProfile = {
        id: 'test-id',
        email: 'test@example.com',
        business_name: 'Test Business',
        phone: '010-1234-5678',
        role: 'user',
        is_approved: true,
        access_column: true,
        access_beam: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      (mockSupabaseClient.from as any).mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn(() => Promise.resolve({ 
              data: mockProfile, 
              error: null 
            })),
          })),
        })),
      });

      const { getUserProfile } = await import('@/lib/db/users');
      const result = await getUserProfile('test-id');
      expect(result).toEqual(mockProfile);
    });
  });

  describe('updateUserProfile', () => {
    it('should return null on error', async () => {
      const { updateUserProfile } = await import('@/lib/db/users');
      const result = await updateUserProfile('test-id', { 
        business_name: 'Updated Business' 
      });
      expect(result).toBeNull();
    });

    it('should update and return profile', async () => {
      const mockProfile: UserProfile = {
        id: 'test-id',
        email: 'test@example.com',
        business_name: 'Updated Business',
        phone: '010-1234-5678',
        role: 'user',
        is_approved: true,
        access_column: true,
        access_beam: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: new Date().toISOString(),
      };

      (mockSupabaseClient.from as any).mockReturnValueOnce({
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ 
                data: mockProfile, 
                error: null 
              })),
            })),
          })),
        })),
      });

      const { updateUserProfile } = await import('@/lib/db/users');
      const result = await updateUserProfile('test-id', { 
        business_name: 'Updated Business' 
      });
      expect(result).toEqual(mockProfile);
    });
  });
});
