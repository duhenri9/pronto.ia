// ============================================
// PRONTO.IA — Admin LGPD Actions API
// ============================================
// Export user data and delete accounts per LGPD compliance.

import { NextRequest, NextResponse } from 'next/server';
import { db, eq, sql, users, whatsappSessions, whatsappMessages, llmCalls, payments, enrollments } from '@pronto-ia/database';

function isAdmin(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const adminSecret = process.env.ADMIN_SECRET ?? '';
  return authHeader === `Bearer ${adminSecret}`;
}

// POST /api/v1/admin/users/[id]/export
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Verify user exists
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Gather all user data
    const [sessions, messages, calls, userPayments, userEnrollments] = await Promise.all([
      db.select().from(whatsappSessions).where(eq(whatsappSessions.userId, id)),
      db.select().from(whatsappMessages).where(eq(whatsappMessages.userId, id)),
      db.select().from(llmCalls).where(eq(llmCalls.userId, id)),
      db.select().from(payments).where(eq(payments.userId, id)),
      db.select().from(enrollments).where(eq(enrollments.userId, id)),
    ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        vertical: user.vertical,
        lifecycleState: user.lifecycleState,
        isPro: user.isPro,
        createdAt: user.createdAt,
      },
      sessions,
      messages,
      llmCalls: calls,
      payments: userPayments,
      enrollments: userEnrollments,
    };

    return NextResponse.json(exportData);
  } catch (err) {
    console.error('[ADMIN] Failed to export user data:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
