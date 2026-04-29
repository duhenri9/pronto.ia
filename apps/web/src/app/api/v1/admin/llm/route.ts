// ============================================
// PRONTO.IA — Admin: LLM Kill Switch Status
// ============================================
// Reads the Redis key `pronto:llm:disabled` directly.
// The LLM client in @pronto-ia/llm checks the same key.

import { NextRequest, NextResponse } from 'next/server';
import IORedis from 'ioredis';

const ADMIN_SECRET = process.env.ADMIN_SECRET ?? '';
const LLM_KILL_SWITCH_KEY = 'pronto:llm:disabled';

function verifyAuth(request: NextRequest): boolean {
  const auth = request.headers.get('authorization');
  if (!auth) return false;
  const token = auth.replace('Bearer ', '');
  return token === ADMIN_SECRET && ADMIN_SECRET.length > 0;
}

export async function GET(request: NextRequest) {
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check env var first
  if (process.env.LLM_DISABLED === 'true') {
    return NextResponse.json({ disabled: true, source: 'env' });
  }

  // Check Redis flag
  try {
    const redis = new IORedis(process.env.REDIS_URL!, { lazyConnect: true, maxRetriesPerRequest: 1 });
    const val = await redis.get(LLM_KILL_SWITCH_KEY);
    await redis.quit();
    return NextResponse.json({ disabled: val === '1' || val === 'true', source: 'redis' });
  } catch {
    return NextResponse.json({ disabled: false, source: 'error' });
  }
}
