/**
 * Simple in-memory rate limiter.
 * Works for single-process deployments (Bun / Node.js).
 * For multi-instance production use Upstash Redis instead.
 */

interface Entry {
  count: number;
  resetAt: number;
}

const store = new Map<string, Entry>();

// Clean up expired entries every 5 minutes to avoid memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}, 5 * 60 * 1000);

/**
 * Returns true if the request is allowed, false if rate limit exceeded.
 * @param key       Unique key (e.g. "sign-in:1.2.3.4")
 * @param limit     Max requests per window
 * @param windowMs  Window size in milliseconds
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) return false;

  entry.count += 1;
  return true;
}
