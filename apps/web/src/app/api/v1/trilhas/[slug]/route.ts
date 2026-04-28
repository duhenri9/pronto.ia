import { NextRequest, NextResponse } from 'next/server';
import { db, trilhas, eq } from '@pronto-ia/database';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    const [trilha] = await db
      .select()
      .from(trilhas)
      .where(eq(trilhas.slug, slug))
      .limit(1);

    if (!trilha) {
      return NextResponse.json(
        { success: false, error: 'Trilha não encontrada' },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: trilha });
  } catch (err) {
    console.error('Trilha detail error:', err);
    return NextResponse.json(
      { success: false, error: 'Erro interno' },
      { status: 500 },
    );
  }
}
