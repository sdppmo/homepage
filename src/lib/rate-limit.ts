/**
 * In-memory rate limiter
 * Limits requests per IP address
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of store.entries()) {
    if (entry.resetAt < now) {
      store.delete(ip);
    }
  }
}, 5 * 60 * 1000);

/**
 * Check if IP is within rate limit
 * @param ip - IP address to check
 * @param limit - Maximum requests per window (default: 10)
 * @param windowMs - Time window in milliseconds (default: 1000 = 1 second)
 * @returns true if within limit, false if exceeded
 */
export function rateLimit(ip: string, limit: number = 10, windowMs: number = 1000): boolean {
  const now = Date.now();
  const key = `${ip}:${windowMs}`;
  
  const entry = store.get(key);
  
  if (!entry || entry.resetAt < now) {
    store.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return true;
  }
  
  if (entry.count >= limit) {
    return false;
  }
  
  entry.count++;
  return true;
}

/**
 * Get current rate limit status for an IP
 * @param ip - IP address to check
 * @returns Current count and reset time, or null if no entry
 */
export function getRateLimitStatus(ip: string): { count: number; resetAt: number } | null {
  return store.get(ip) || null;
}

/**
 * Clear rate limit for an IP (useful for testing)
 * @param ip - IP address to clear
 */
export function clearRateLimit(ip: string): void {
  store.delete(ip);
}

/**
 * Clear all rate limits (useful for testing)
 */
export function clearAllRateLimits(): void {
  store.clear();
}
