import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/require-admin';

export async function GET(req: Request) {
  const unauthorized = await requireAdmin(req);
  if (unauthorized) return unauthorized;

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
