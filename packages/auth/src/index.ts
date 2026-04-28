// ============================================
// PRONTO.IA — Auth Utilities (jose-based, Edge-compatible)
// ============================================

import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import type { AuthPayload } from '@pronto-ia/types';

const SALT_ROUNDS = 12;

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');
  return new TextEncoder().encode(secret);
};

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signToken(payload: AuthPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<AuthPayload> {
  const { payload } = await jwtVerify(token, getSecret(), {
    algorithms: ['HS256'],
  });
  return payload as unknown as AuthPayload;
}

export { AuthPayload };
