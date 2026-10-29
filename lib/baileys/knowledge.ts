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
  {
    id: 'default-studio-pro',
    title: 'About Studio Pro',
    content:
      'Studio Pro is a web design studio based in Kota Kinabalu, Sabah, Malaysia. We specialise in clean, modern design paired with smart SEO - handling everything from wireframe to launch, all in-house. We work with clients across Malaysia and Singapore. Our core services include UX/UI design + wireframes, web design, and SEO optimisation, plus ongoing care plans to keep your site fast, secure and visible on Google. Visit us at prostudio.my.',
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
  if (!row.value) {
    await prisma.setting.update({
      where: { key: 'knowledgeBase' },
      data: { value: JSON.stringify(DEFAULT_ENTRIES) },
    });
    return DEFAULT_ENTRIES;
  }
  let parsed: KnowledgeEntry[] = [];
  try {
    const v = JSON.parse(row.value);
    parsed = Array.isArray(v) ? v : [];
  } catch {
    parsed = [];
  }
  // Ensure any new default entries are present (idempotent seed for upgrades).
  let changed = false;
  for (const def of DEFAULT_ENTRIES) {
    if (!parsed.some((e) => e.id === def.id)) {
      parsed.push(def);
      changed = true;
    }
  }
  if (changed) {
    await prisma.setting.update({
      where: { key: 'knowledgeBase' },
      data: { value: JSON.stringify(parsed) },
    });
  }
  return parsed;
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
