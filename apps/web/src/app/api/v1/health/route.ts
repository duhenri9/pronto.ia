import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'pronto-ia',
    timestamp: new Date().toISOString(),
  });
}
