import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'missing' }, { status: 400 });
  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: { contact: true },
  });
  const messages = await prisma.message.findMany({
    where: { conversationId: id },
    orderBy: { timestamp: 'asc' },
  });
  await prisma.conversation.update({ where: { id }, data: { unreadCount: 0 } });
  return NextResponse.json({ conversation, messages });
}
