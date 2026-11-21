import { NextResponse } from 'next/server';
import { startWhatsApp, getStatus, resetSession } from '@/lib/baileys/connection';
import { requireAdmin } from '@/lib/require-admin';

export async function GET(req: Request) {
  const unauthorized = await requireAdmin(req);
  if (unauthorized) return unauthorized;

  return NextResponse.json(getStatus());
}

export async function POST(req: Request) {
  const unauthorized = await requireAdmin(req);
  if (unauthorized) return unauthorized;

  try {
    const result = await startWhatsApp();
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      {
        ...getStatus(),
        status: 'error',
        error: e instanceof Error ? e.message : String(e),
      },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  const unauthorized = await requireAdmin(req);
  if (unauthorized) return unauthorized;

  return NextResponse.json(resetSession());
}
