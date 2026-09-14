import { Env } from '../types';

/**
 * KV-Based Rate Limiting Helper
 * 
 * Protects endpoints by counting requests per IP within a 60-second window.
 */
export async function checkRateLimit(
  env: Env,
  ip: string,
  endpoint: string,
  limit: number
): Promise<{ isAllowed: boolean; retryAfter: number }> {
  // Use RATE_LIMIT_KV if available, falling back to other existing KV bindings
  const kv = env.RATE_LIMIT_KV || env.PRODUCT_PAYLOAD_KV || env.ASSETS_KV;
  if (!kv) {
    console.warn('No KV namespace configured for rate limiting. Skipping check.');
    return { isAllowed: true, retryAfter: 0 };
  }

  const key = `ratelimit:${ip}:${endpoint}`;
  try {
    const val = await kv.get(key);
    if (!val) {
      await kv.put(key, '1', { expirationTtl: 60 });
      return { isAllowed: true, retryAfter: 0 };
    }

    const count = parseInt(val, 10);
    if (isNaN(count)) {
      await kv.put(key, '1', { expirationTtl: 60 });
      return { isAllowed: true, retryAfter: 0 };
    }

    if (count >= limit) {
      return { isAllowed: false, retryAfter: 60 };
    }

    const newCount = count + 1;
    // Update the counter in KV with a 60-second expiration TTL
    await kv.put(key, String(newCount), { expirationTtl: 60 });
    return { isAllowed: true, retryAfter: 0 };
  } catch (err) {
    console.error(`Rate limiter KV error for key ${key}:`, err);
    // Fail-open: allow traffic if rate limiting store is temporarily unavailable
    return { isAllowed: true, retryAfter: 0 };
  }
}
