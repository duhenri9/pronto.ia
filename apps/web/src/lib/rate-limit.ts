// ============================================
// PRONTO.IA — WhatsApp Rate Limit Helper
// ============================================
// Rate limits inbound messages per phone number.
// Allowlisted phones bypass the limit entirely.
// Non-allowlisted phones: max 1 request/second.

import { getRedisConnection } from '@/lib/redis';

const ALLOWLIST = (process.env.RATE_LIMIT_ALLOWLIST ?? '').split(',').filter(Boolean);

/**
 * Check if a phone number is allowed to send a message.
 * Allowlisted phones always pass.
 * Others: max 1 request per second (Redis INCR with 1s TTL).
 */
export async function checkRateLimit(phone: string): Promise<boolean> {
  // Allowlist bypass
  if (ALLOWLIST.includes(phone)) {
    return true;
  }

  const redis = getRedisConnection();
  const key = `ratelimit:whatsapp:${phone}`;

  const current = await redis.incr(key);

  // Set 1s expiry only on first increment
  if (current === 1) {
    await redis.expire(key, 1);
  }

  return current <= 1;
}
