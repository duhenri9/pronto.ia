// ============================================
// PRONTO.IA — Admin Users API
// ============================================
// Returns user list with masked phone, vertical,
// lifecycle state, and days since last contact.

import { NextRequest, NextResponse } from 'next/server';
import { db, eq, sql, desc, users, whatsappSessions, llmCalls } from '@pronto-ia/database';

// Simple admin auth check via env var
function isAdmin(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const adminSecret = process.env.ADMIN_SECRET ?? '';
  return authHeader === `Bearer ${adminSecret}`;
}

// Mask phone: +55 11 *****1234
function maskPhone(phone: string): string {
  if (phone.length <= 4) return '****';
  return phone.slice(0, -4).replace(/\d/g, '*') + phone.slice(-4);
}

// GET /api/v1/admin/users
export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') ?? '1', 10);
  const limit = parseInt(searchParams.get('limit') ?? '50', 10);
  const offset = (page - 1) * limit;

  try {
    // Fetch users with last contact info
    const result = await db
      .select({
        id: users.id,
        name: users.name,
        displayName: users.displayName,
        phone: users.phone,
        vertical: users.vertical,
        lifecycleState: users.lifecycleState,
        isPro: users.isPro,
        createdAt: users.createdAt,
        lastMessageAt: whatsappSessions.lastMessageAt,
      })
      .from(users)
      .leftJoin(whatsappSessions, eq(users.id, whatsappSessions.userId))
      .where(sql`${users.deletedAt} IS NULL`)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    // Count total
    const countResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(sql`${users.deletedAt} IS NULL`);

    const total = countResult[0]?.count ?? 0;

    const now = new Date();

    const usersList = result.map((u) => {
      const daysSinceLastContact = u.lastMessageAt
        ? Math.floor((now.getTime() - u.lastMessageAt.getTime()) / (1000 * 60 * 60 * 24))
        : null;

      return {
        id: u.id,
        name: u.displayName ?? u.name,
        phone: maskPhone(u.phone),
        vertical: u.vertical,
        lifecycleState: u.lifecycleState,
        isPro: u.isPro,
        daysSinceLastContact,
        createdAt: u.createdAt.toISOString(),
      };
    });

    return NextResponse.json({
      users: usersList,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('[ADMIN] Failed to fetch users:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
