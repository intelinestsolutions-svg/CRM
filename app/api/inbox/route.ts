import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/require-admin';

export async function GET(req: Request) {
  const unauthorized = await requireAdmin(req);
  if (unauthorized) return unauthorized;

  const conversations = await prisma.conversation.findMany({
    include: {
      contact: true,
      messages: { orderBy: { timestamp: 'desc' }, take: 1 },
    },
    orderBy: { lastMessageAt: 'desc' },
  });
  return NextResponse.json({ conversations });
}
