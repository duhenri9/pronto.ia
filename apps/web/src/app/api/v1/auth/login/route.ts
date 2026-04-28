import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db, users, eq } from '@pronto-ia/database';
import { verifyPassword, signToken } from '@pronto-ia/auth';
import { UserRole } from '@pronto-ia/types';

const loginSchema = z.object({
  phone: z.string().min(10),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = loginSchema.parse(body);

    const [user] = await db
      .select({
        id: users.id,
        phone: users.phone,
        role: users.role,
        passwordHash: users.passwordHash,
      })
      .from(users)
      .where(eq(users.phone, data.phone))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Credenciais inválidas' },
        { status: 401 },
      );
    }

    const valid = await verifyPassword(data.password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { success: false, error: 'Credenciais inválidas' },
        { status: 401 },
      );
    }

    const token = signToken({
      userId: user.id,
      phone: user.phone,
      role: user.role as UserRole,
    });

    return NextResponse.json({
      success: true,
      data: {
        user: { id: user.id, phone: user.phone, role: user.role },
        token,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: err.errors },
        { status: 400 },
      );
    }
    console.error('Login error:', err);
    return NextResponse.json(
      { success: false, error: 'Erro interno' },
      { status: 500 },
    );
  }
}
