import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const { conversationId, mode } = await req.json();
  if (!conversationId) return NextResponse.json({ error: 'missing' }, { status: 400 });
  const conv = await prisma.conversation.update({
    where: { id: conversationId },
    data: { mode: mode === 'bot' ? 'bot' : 'human' },
  });
  return NextResponse.json(conv);
}
