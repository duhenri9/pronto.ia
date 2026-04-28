import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db, users, eq } from '@pronto-ia/database';
import { hashPassword, signToken } from '@pronto-ia/auth';
import { UserRole } from '@pronto-ia/types';

const registerSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(10),
  email: z.string().email().optional(),
  password: z.string().min(6),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);

    // Check if phone already exists
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.phone, data.phone))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Telefone já cadastrado' },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(data.password);

    const [user] = await db
      .insert(users)
      .values({
        name: data.name,
        phone: data.phone,
        email: data.email ?? null,
        passwordHash,
      })
      .returning({ id: users.id, phone: users.phone, role: users.role });

    const token = signToken({
      userId: user.id,
      phone: user.phone,
      role: user.role as UserRole,
    });

    return NextResponse.json({ success: true, data: { user, token } }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: err.errors },
        { status: 400 },
      );
    }
    console.error('Register error:', err);
    return NextResponse.json(
      { success: false, error: 'Erro interno' },
      { status: 500 },
    );
  }
}
