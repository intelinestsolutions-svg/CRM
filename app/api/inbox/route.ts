import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const conversations = await prisma.conversation.findMany({
    include: {
      contact: true,
      messages: { orderBy: { timestamp: 'desc' }, take: 1 },
    },
    orderBy: { lastMessageAt: 'desc' },
  });
  return NextResponse.json({ conversations });
}
