import { NextResponse } from 'next/server';
import { startWhatsApp, getStatus } from '@/lib/baileys/connection';

export async function GET() {
  const status = getStatus();
  return NextResponse.json(status);
}

export async function POST() {
  const result = await startWhatsApp();
  return NextResponse.json(result);
}
