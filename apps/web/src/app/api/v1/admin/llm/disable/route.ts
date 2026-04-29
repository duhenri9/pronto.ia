// ============================================
// PRONTO.IA — Admin: Disable LLM (Kill Switch)
// ============================================
// Sets Redis key `pronto:llm:disabled` = "1"
// The LLM client checks this key before every call.

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

export async function POST(request: NextRequest) {
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const redis = new IORedis(process.env.REDIS_URL!, { lazyConnect: true, maxRetriesPerRequest: 1 });
    await redis.set(LLM_KILL_SWITCH_KEY, '1');
    await redis.quit();
    return NextResponse.json({ disabled: true, message: 'LLM kill switch ACTIVATED — all LLM calls will return fallback message' });
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to activate kill switch', details: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
