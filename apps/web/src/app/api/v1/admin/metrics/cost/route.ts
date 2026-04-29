// ============================================
// PRONTO.IA — Admin Cost Metrics API
// ============================================
// Returns average cost per active student in the last 30 days.

import { NextRequest, NextResponse } from 'next/server';
import { db, sql, llmCalls } from '@pronto-ia/database';

function isAdmin(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const adminSecret = process.env.ADMIN_SECRET ?? '';
  return authHeader === `Bearer ${adminSecret}`;
}

// GET /api/v1/admin/metrics/cost
export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await db
      .select({
        totalCostCents: sql<number>`COALESCE(SUM(${llmCalls.estimatedCostCents}), 0)::int`,
        totalUsers: sql<number>`COUNT(DISTINCT ${llmCalls.userId})::int`,
        totalCalls: sql<number>`COUNT(*)::int`,
        avgCostPerUserCents: sql<number>`COALESCE(
          SUM(${llmCalls.estimatedCostCents})::float / NULLIF(COUNT(DISTINCT ${llmCalls.userId}), 0),
          0
        )::int`,
      })
      .from(llmCalls)
      .where(
        sql`${llmCalls.createdAt} > NOW() - INTERVAL '30 days'`,
      );

    const metrics = result[0] ?? {
      totalCostCents: 0,
      totalUsers: 0,
      totalCalls: 0,
      avgCostPerUserCents: 0,
    };

    // Also get per-model breakdown
    const modelBreakdown = await db
      .select({
        model: llmCalls.model,
        costCents: sql<number>`SUM(${llmCalls.estimatedCostCents})::int`,
        calls: sql<number>`COUNT(*)::int`,
        inputTokens: sql<number>`SUM(${llmCalls.inputTokens})::bigint`,
        outputTokens: sql<number>`SUM(${llmCalls.outputTokens})::bigint`,
      })
      .from(llmCalls)
      .where(sql`${llmCalls.createdAt} > NOW() - INTERVAL '30 days'`)
      .groupBy(llmCalls.model);

    return NextResponse.json({
      period: '30d',
      metrics: {
        totalCostBRL: (metrics.totalCostCents / 100).toFixed(2),
        totalUsers: metrics.totalUsers,
        totalCalls: metrics.totalCalls,
        avgCostPerUserBRL: (metrics.avgCostPerUserCents / 100).toFixed(2),
      },
      modelBreakdown: modelBreakdown.map((m) => ({
        model: m.model,
        costBRL: (m.costCents / 100).toFixed(2),
        calls: m.calls,
        inputTokens: Number(m.inputTokens),
        outputTokens: Number(m.outputTokens),
      })),
    });
  } catch (err) {
    console.error('[ADMIN] Failed to fetch cost metrics:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
