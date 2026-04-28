import { NextResponse } from 'next/server';
import { db, trilhas, eq } from '@pronto-ia/database';

export async function GET() {
  try {
    const allTrilhas = await db
      .select()
      .from(trilhas)
      .where(eq(trilhas.isPublished, true))
      .orderBy(trilhas.order);

    return NextResponse.json({ success: true, data: allTrilhas });
  } catch (err) {
    console.error('Trilhas list error:', err);
    return NextResponse.json(
      { success: false, error: 'Erro interno' },
      { status: 500 },
    );
  }
}
