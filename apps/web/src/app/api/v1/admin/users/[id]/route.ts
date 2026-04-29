// ============================================
// PRONTO.IA — Admin LGPD Delete API
// ============================================
// Soft-deletes a user account per LGPD compliance.

import { NextRequest, NextResponse } from 'next/server';
import { db, eq, users } from '@pronto-ia/database';

function isAdmin(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const adminSecret = process.env.ADMIN_SECRET ?? '';
  return authHeader === `Bearer ${adminSecret}`;
}

// DELETE /api/v1/admin/users/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Soft delete — set deletedAt and clear PII
    await db
      .update(users)
      .set({
        name: '[deleted]',
        phone: `[deleted-${id.substring(0, 8)}]`,
        email: null,
        displayName: null,
        businessName: null,
        businessType: null,
        businessContext: null,
        onboardingData: {},
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));

    return NextResponse.json({ status: 'deleted', userId: id });
  } catch (err) {
    console.error('[ADMIN] Failed to delete user:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
