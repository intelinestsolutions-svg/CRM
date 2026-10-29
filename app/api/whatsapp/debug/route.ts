import { NextResponse } from 'next/server';
import { getStatus } from '@/lib/baileys/connection';
import { waDebug } from '@/lib/baileys/debug';

export async function GET() {
  return NextResponse.json({ ...getStatus(), debug: waDebug });
}
