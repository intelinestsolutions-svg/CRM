import { NextResponse } from 'next/server';
import { readKnowledgeEntries, writeKnowledgeEntries } from '@/lib/baileys/knowledge';
import { requireAdmin } from '@/lib/require-admin';

export async function GET(req: Request) {
  const unauthorized = await requireAdmin(req);
  if (unauthorized) return unauthorized;

  const entries = await readKnowledgeEntries();
  return NextResponse.json({ entries });
}

export async function POST(req: Request) {
  const unauthorized = await requireAdmin(req);
  if (unauthorized) return unauthorized;

  const body = await req.json().catch(() => ({}));

  if (body?.id) {
    const entries = await readKnowledgeEntries();
    const idx = entries.findIndex((e) => e.id === body.id);
    if (idx === -1) return NextResponse.json({ error: 'not found' }, { status: 404 });
    if (typeof body.title === 'string') entries[idx].title = body.title.trim();
    if (typeof body.content === 'string') entries[idx].content = body.content.trim();
    if (typeof body.enabled === 'boolean') entries[idx].enabled = body.enabled;
    await writeKnowledgeEntries(entries);
    return NextResponse.json({ entry: entries[idx], entries });
  }

  const title = String(body?.title ?? '').trim();
  const content = String(body?.content ?? '').trim();
  if (!title && !content) {
    return NextResponse.json({ error: 'title or content required' }, { status: 400 });
  }

  const { randomUUID } = await import('node:crypto');
  const entry = {
    id: randomUUID(),
    title: title || 'Untitled',
    content,
    enabled: true,
    createdAt: new Date().toISOString(),
  };
  const entries = await readKnowledgeEntries();
  entries.unshift(entry);
  await writeKnowledgeEntries(entries);
  return NextResponse.json({ entry, entries }, { status: 201 });
}

export async function DELETE(req: Request) {
  const unauthorized = await requireAdmin(req);
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'missing id' }, { status: 400 });
  const entries = await readKnowledgeEntries();
  const next = entries.filter((e) => e.id !== id);
  await writeKnowledgeEntries(next);
  return NextResponse.json({ entries: next });
}
