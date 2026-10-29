import path from 'node:path';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Fall back to the bundled SQLite database when DATABASE_URL is not set
// (e.g. on hosts that do not provide a .env file at build/runtime).
const datasourceUrl =
  process.env.DATABASE_URL ?? `file:${path.join(process.cwd(), 'prisma', 'dev.db')}`;

export const prisma = globalForPrisma.prisma || new PrismaClient({ datasourceUrl });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
