import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const settings = await prisma.setting.findMany();
  const obj: any = {};
  for (const s of settings) {
    obj[s.key] = s.value;
  }
  if (!obj.welcomeMessage) obj.welcomeMessage = 'Hi! Thanks for messaging us. How can I help you today?';
  if (!obj.botEnabled) obj.botEnabled = 'true';
  if (!obj.autoReplyFirstMessage) obj.autoReplyFirstMessage = 'true';
  return NextResponse.json(obj);
}

export async function POST(req: Request) {
  const body = await req.json();
  for (const [key, value] of Object.entries(body)) {
    await prisma.setting.upsert({
      where: { key },
      update: { value: String(value ?? '') },
      create: { key, value: String(value ?? '') },
    });
  }
  return NextResponse.json({ ok: true });
}
