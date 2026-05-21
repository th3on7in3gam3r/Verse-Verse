import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;

if (!globalForPrisma.prisma) {
  // Prefer the Neon pooled connection; fall back to the standard DATABASE_URL.
  const connectionString = process.env.DATABASE_URL_NEON_DB || process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      'No database connection string found. ' +
      'Set DATABASE_URL_NEON_DB or DATABASE_URL in your .env file.'
    );
  }

  const pool    = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);

  globalForPrisma.prisma = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  });
}

export const prisma = globalForPrisma.prisma;
