import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { proxy } from '@/proxy';

vi.mock('@/lib/supabase/middleware', () => ({
  updateSession: vi.fn(async (request: NextRequest) => ({
    user: null,
    response: NextResponse.next({ request }),
  })),
}));

vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn(() => true),
}));

describe('Proxy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Protected Routes', () => {
    it('should redirect to login when accessing protected route without session', async () => {
      const request = new NextRequest('http://localhost:3000/k-col/auto-find-section');
      const response = await proxy(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/login');
      expect(response.headers.get('location')).toContain('redirect=%2Fk-col%2Fauto-find-section');
    });

    it('should redirect to login for calculator route', async () => {
      const request = new NextRequest('http://localhost:3000/k-col/calculator');
      const response = await proxy(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/login');
    });

    it('should redirect to login for admin route', async () => {
      const request = new NextRequest('http://localhost:3000/admin');
      const response = await proxy(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/login');
    });
  });

  describe('Blocked Patterns', () => {
    it('should return 404 for .git paths', async () => {
      const request = new NextRequest('http://localhost:3000/.git/config');
      const response = await proxy(request);

      expect(response.status).toBe(404);
    });

    it('should return 404 for .env files', async () => {
      const request = new NextRequest('http://localhost:3000/.env');
      const response = await proxy(request);

      expect(response.status).toBe(404);
    });

    it('should return 404 for wp-admin paths', async () => {
      const request = new NextRequest('http://localhost:3000/wp-admin/index.php');
      const response = await proxy(request);

      expect(response.status).toBe(404);
    });

    it('should return 404 for .php files', async () => {
      const request = new NextRequest('http://localhost:3000/test.php');
      const response = await proxy(request);

      expect(response.status).toBe(404);
    });
  });

  describe('Rate Limiting', () => {
    it('should return 429 when rate limit exceeded', async () => {
      const rateLimitModule = await import('@/lib/rate-limit');
      const mockRateLimit = vi.spyOn(rateLimitModule, 'rateLimit');
      mockRateLimit.mockReturnValueOnce(false);

      const request = new NextRequest('http://localhost:3000/');
      const response = await proxy(request);

      expect(response.status).toBe(429);
      mockRateLimit.mockRestore();
    });
  });
});
