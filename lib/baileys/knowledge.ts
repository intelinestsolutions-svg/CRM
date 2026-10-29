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
      'Studio Pro is a web design studio based in Kota Kinabalu, Sabah, Malaysia. We specialise in UX/UI design + wireframes, web design, and SEO optimisation - handling everything from wireframe to launch, all in-house. We work with clients across Malaysia and Singapore. Our core services include UX/UI design + wireframes, web design, and SEO optimisation, plus ongoing care plans to keep your site fast, secure and visible on Google. Visit us at prostudio.my.',
    enabled: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'default-services-pricing',
    title: 'Services and pricing',
    content:
      'Website builds (one-time): Starter RM1,600 (up to 3 pages, ~2 weeks), Business RM3,800 (up to 8 pages, ~3-4 weeks, recommended), Pro/Commerce from RM7,500 (10+ pages, e-commerce/booking, ~5-8 weeks). All include custom design, mobile-first, on-page SEO, WhatsApp click-to-chat, domain + hosting free for year one, and analytics setup. Care Plans (monthly): Essential RM99/mo (hosting, backups, security, updates, 1 edit/mo), Growth RM249/mo (recommended, fair-use edits, monthly report, local SEO, Google Business Profile posts), Pro RM499/mo (edits as needed, 1 SEO article/mo, ads management, quarterly strategy call). Add-ons: logo/brand kit RM800-2,500, extra pages RM250/page, copywriting RM150/page, rush delivery +30%, migration RM300. Billing: 50% deposit to start, balance on launch. Care Plans billed monthly or annually (2 months free).',
    enabled: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'default-process',
    title: 'How a project runs',
    content:
      'Process: 1) Free quote - tell us your business and goal, fixed price reply within 1 working day. 2) Discovery - short call, then we recommend the right build and Care Plan. 3) Design & build - 50% deposit; you see the design early, we refine, then launch. 4) Handover & care - training, site goes live, Care Plan keeps it secure, updated and easy to find on Google. Most projects go live in 2-4 weeks. You own 100% of the code, design and content. No lock-in, no proprietary CMS.',
    enabled: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'default-contact',
    title: 'Contact and hours',
    content:
      'Contact: sales@prostudio.my, +60 13-869 9933 (WhatsApp), Facebook and Instagram @prostudio.my. Hours: Monday to Friday 9am-6pm Malaysia Time (GMT+8), replies within 1 working day. We serve Sabah/Kota Kinabalu small businesses, Malaysia-wide SMEs, and remote/English-language clients. We do not take enterprise projects, complex web apps, 24/7 SLA work, or price-only shoppers.',
    enabled: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'default-faq',
    title: 'Frequently asked questions',
    content:
      'FAQ: SEO is included in every tier (on-page SEO). Hosting and domain are free for year one; after that stay on a Care Plan (from RM99/mo) or renew at standard rates. Starter gets 1 revision round, Business 3, Pro revisions until sign-off. Business tier includes copy polish; Pro adds full copywriting. If something breaks on a Care Plan, we fix it (Essential within 3 business days, Growth 1 day, Pro 4 hours). You own 100% of the website. Starter ~2 weeks, Business ~3-4 weeks, Pro ~5-8 weeks.',
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
