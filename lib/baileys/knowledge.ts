import { prisma } from '@/lib/prisma';

export type KnowledgeEntry = {
  id: string;
  title: string;
  content: string;
  enabled: boolean;
  createdAt: string;
};

// Seeded on first use so a fresh install already knows the business basics.
const DEFAULT_ENTRIES: KnowledgeEntry[] = [
  {
    id: 'default-deposit',
    title: 'Payment policy',
    content: 'We require a 50% upfront deposit before starting work.',
    enabled: true,
    createdAt: new Date().toISOString(),
  },
];

export async function readKnowledgeEntries(): Promise<KnowledgeEntry[]> {
  const row = await prisma.setting.findUnique({ where: { key: 'knowledgeBase' } });
  if (!row) {
    await prisma.setting.create({
      data: { key: 'knowledgeBase', value: JSON.stringify(DEFAULT_ENTRIES) },
    });
    return DEFAULT_ENTRIES;
  }
  if (!row.value) return [];
  try {
    const parsed = JSON.parse(row.value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function writeKnowledgeEntries(entries: KnowledgeEntry[]) {
  await prisma.setting.upsert({
    where: { key: 'knowledgeBase' },
    update: { value: JSON.stringify(entries) },
    create: { key: 'knowledgeBase', value: JSON.stringify(entries) },
  });
}

export function formatKnowledge(entries: KnowledgeEntry[]): string {
  const enabled = entries.filter((e) => e.enabled !== false && (e.title || e.content));
  if (!enabled.length) return '';
  return enabled.map((e) => `- ${e.title || 'Note'}: ${e.content || ''}`).join('\n');
}
