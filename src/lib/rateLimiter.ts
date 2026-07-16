/**
 * In-memory rate limiter for StadiumSaathi API routes.
 *
 * Security measures applied:
 * - Limits each client IP to MAX_REQUESTS_PER_WINDOW requests per WINDOW_MS (default: 10/min).
 * - Sliding-window algorithm: entries older than WINDOW_MS are discarded before each check.
 * - Module-level Map persists across requests in the same Node.js process (single-server deployment).
 * - Stale key cleanup runs on each request to prevent unbounded memory growth.
 */

const MAX_REQUESTS_PER_WINDOW = 10;
const WINDOW_MS = 60_000; // 1 minute

/** Per-key list of request timestamps within the current window. */
const requestLog = new Map<string, number[]>();

/**
 * Checks whether the given key (e.g. client IP) is within the allowed rate limit.
 *
 * @param key - A unique identifier for the client, typically derived from the request IP.
 * @returns `{ allowed: boolean; remaining: number; resetMs: number }`
 */
export function checkRateLimit(key: string): {
  allowed: boolean;
  remaining: number;
  resetMs: number;
} {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  // Retrieve and prune timestamps outside the current window
  const timestamps = (requestLog.get(key) ?? []).filter((t) => t > windowStart);

  if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    // Oldest timestamp in the window determines when the client can retry
    const oldestInWindow = timestamps[0];
    const resetMs = oldestInWindow + WINDOW_MS - now;
    return { allowed: false, remaining: 0, resetMs };
  }

  // Record this request and save back
  timestamps.push(now);
  requestLog.set(key, timestamps);

  // Periodically clean up keys with empty windows to avoid memory leaks
  if (Math.random() < 0.05) {
    for (const [k, ts] of requestLog.entries()) {
      if (ts.every((t) => t <= windowStart)) {
        requestLog.delete(k);
      }
    }
  }

  return {
    allowed: true,
    remaining: MAX_REQUESTS_PER_WINDOW - timestamps.length,
    resetMs: WINDOW_MS,
  };
}

/**
 * Extracts the best available client IP from a Next.js request.
 * Falls back through standard proxy headers before defaulting to "unknown".
 */
export function getClientIp(request: { headers: { get: (name: string) => string | null } }): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}
