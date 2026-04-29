// ============================================
// PRONTO.IA — Admin: Enable LLM (Release Kill Switch)
// ============================================
// Deletes Redis key `pronto:llm:disabled`
// The LLM client will resume normal calls.

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
    await redis.del(LLM_KILL_SWITCH_KEY);
    await redis.quit();
    return NextResponse.json({ disabled: false, message: 'LLM kill switch DEACTIVATED — normal LLM calls resumed' });
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to deactivate kill switch', details: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
