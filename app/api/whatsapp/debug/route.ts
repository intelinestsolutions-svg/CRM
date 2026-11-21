import { NextResponse } from 'next/server';
import { getStatus } from '@/lib/baileys/connection';
import { waDebug } from '@/lib/baileys/debug';
import { requireAdmin } from '@/lib/require-admin';

export async function GET(req: Request) {
  const unauthorized = await requireAdmin(req);
  if (unauthorized) return unauthorized;

  return NextResponse.json({ ...getStatus(), debug: waDebug });
}
