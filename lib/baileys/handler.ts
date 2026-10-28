import { prisma } from '@/lib/prisma';

async function askAgent(message: string, history: any[]) {
  try {
    const res = await fetch('https://ai.prostudio.my/api/chat.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        message,
        history: Array.isArray(history) ? history : [],
        stream: false,
      }),
    });
    const text = await res.text();
    let data: any = null;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return '';
    }
    if (data?.reply && typeof data.reply === 'string' && data.reply.trim()) {
      return data.reply.replace(/\[\[CTA[^\]]*\]\]/g, '').trim();
    }
    if (data?.error) {
      console.error('agent api error:', data.error);
    }
    return '';
  } catch (e) {
    console.error('agent error', e);
    return '';
  }
}

export async function handleIncomingMessage(sock: any, from: string, body: string, msg: any) {
  const waId = from.replace('@s.whatsapp.net', '');

  let contact = await prisma.contact.findFirst({ where: { waId } });
  if (!contact) {
    contact = await prisma.contact.create({
      data: {
        waId,
        name: waId,
        phone: waId,
      },
    });
  }

  let conv = await prisma.conversation.findFirst({ where: { contactId: contact.id } });
  if (!conv) {
    conv = await prisma.conversation.create({
      data: { contactId: contact.id, mode: 'bot' },
    });
  }

  try {
    await prisma.message.create({
      data: {
        conversationId: conv.id,
        direction: 'in',
        fromMe: false,
        type: 'text',
        body,
        waMessageId: msg.key.id,
        timestamp: new Date(),
      },
    });
  } catch (e) {}

  await prisma.conversation.update({
    where: { id: conv.id },
    data: { lastMessageAt: new Date(), unreadCount: { increment: 1 } },
  });

  if (conv.mode === 'bot') {
    const msgCount = await prisma.message.count({ where: { conversationId: conv.id, direction: 'in' } });
    const settings = await prisma.setting.findMany();
    const s: any = {};
    for (const st of settings) s[st.key] = st.value;

    const autoReplyFirst = s.autoReplyFirstMessage !== 'false';
    if (msgCount === 1 && autoReplyFirst && s.welcomeMessage) {
      const welcome = s.welcomeMessage;
      await sock.sendMessage(from, { text: welcome });
      await prisma.message.create({
        data: {
          conversationId: conv.id,
          direction: 'out',
          fromMe: true,
          type: 'text',
          body: welcome,
          sentBy: 'agent',
          timestamp: new Date(),
        },
      });
      await prisma.conversation.update({
        where: { id: conv.id },
        data: { lastMessageAt: new Date() },
      });
      return;
    }

    if (s.botEnabled === 'false') {
      return;
    }

    const history = await prisma.message.findMany({
      where: { conversationId: conv.id },
      orderBy: { timestamp: 'asc' },
      take: 20,
    });
    const hist = history.slice(0, -1).map((m: any) => ({
      role: m.direction === 'in' ? 'user' : 'assistant',
      content: m.body || '',
    }));
    const reply = await askAgent(body, hist);
    if (reply) {
      await sock.sendMessage(from, { text: reply });
      await prisma.message.create({
        data: {
          conversationId: conv.id,
          direction: 'out',
          fromMe: true,
          type: 'text',
          body: reply,
          sentBy: 'agent',
          timestamp: new Date(),
        },
      });
      await prisma.conversation.update({
        where: { id: conv.id },
        data: { lastMessageAt: new Date() },
      });
    }
  }
}

export async function sendMessage(to: string, text: string) {
  const { getSocket } = await import('./connection');
  const sock = getSocket();
  if (!sock) throw new Error('Not connected');
  const jid = to.includes('@') ? to : `${to}@s.whatsapp.net`;
  await sock.sendMessage(jid, { text });
}
