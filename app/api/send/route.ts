import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendMessage } from '@/lib/baileys/handler';

export async function POST(req: Request) {
  const { conversationId, text } = await req.json();
  if (!conversationId || !text) return NextResponse.json({ error: 'missing' }, { status: 400 });
  const conv = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { contact: true },
  });
  if (!conv) return NextResponse.json({ error: 'not found' }, { status: 404 });

  try {
    await sendMessage(conv.contact.waId, text);
  } catch (e) {
    // Includes the broadcast guard: only one-to-one chats are allowed.
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 400 },
    );
  }
  await prisma.message.create({
    data: {
      conversationId: conv.id,
      direction: 'out',
      fromMe: true,
      type: 'text',
      body: text,
      sentBy: 'human',
      timestamp: new Date(),
    },
  });
  await prisma.conversation.update({
    where: { id: conv.id },
    data: { lastMessageAt: new Date(), mode: 'human', unreadCount: 0 },
  });
  return NextResponse.json({ ok: true });
}
