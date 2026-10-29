import { prisma } from '@/lib/prisma';
import { isDirectChatJid, toDirectJid } from './guard';
import { waDebug } from './debug';
import { readKnowledgeEntries, formatKnowledge } from './knowledge';

/**
 * The only path through which this app sends WhatsApp messages.
 * It refuses anything that is not a single-person chat, so we can never
 * broadcast, post to a group/channel, or update status.
 */
async function sendDirectText(sock: any, jid: string, text: string) {
  const target = toDirectJid(jid);
  await sock.sendMessage(target, { text });
}

async function askAgent(message: string, history: any[], knowledge: string) {
  const fullMessage = knowledge
    ? `Knowledge base (use it to answer accurately and stay consistent with it):\\n${knowledge}\\n\\nCustomer message: ${message}`
    : message;
  try {
    const res = await fetch('https://ai.prostudio.my/api/chat.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        message: fullMessage,
        history: Array.isArray(history) ? history : [],
        stream: false,
        knowledge: knowledge ? knowledge.split('\\n') : undefined,
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
  // Never reply to groups, channels, status, or broadcast lists.
  if (!isDirectChatJid(from)) return;

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
      try {
        await sendDirectText(sock, from, welcome);
        waDebug.lastReplyAt = new Date().toISOString();
      } catch (e) {
        waDebug.lastReplyError = e instanceof Error ? e.message : String(e);
        throw e;
      }
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
    const knowledge = formatKnowledge(await readKnowledgeEntries());
    let reply = await askAgent(body, hist, knowledge);
    if (!reply) {
      reply = `Terima kasih atas mesej anda: "${body}". Staf kami akan segera membantu anda!`;
    }
    if (reply) {
      try {
        await sendDirectText(sock, from, reply);
        waDebug.lastReplyAt = new Date().toISOString();
      } catch (e) {
        waDebug.lastReplyError = e instanceof Error ? e.message : String(e);
        throw e;
      }
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
  const body = (text ?? '').trim();
  if (!body) throw new Error('Message text is required.');

  const { getSocket } = await import('./connection');
  const sock = getSocket();
  if (!sock) throw new Error('Not connected');

  try {
    await sendDirectText(sock, to, body);
    waDebug.lastReplyAt = new Date().toISOString();
    waDebug.lastSendError = null;
  } catch (e) {
    waDebug.lastSendError = e instanceof Error ? e.message : String(e);
    throw e;
  }
}
