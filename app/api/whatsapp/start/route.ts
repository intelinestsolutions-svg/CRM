import { NextResponse } from 'next/server';
import { startWhatsApp, getStatus, resetSession } from '@/lib/baileys/connection';

export async function GET() {
  return NextResponse.json(getStatus());
}

export async function POST() {
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

export async function DELETE() {
  return NextResponse.json(resetSession());
}
