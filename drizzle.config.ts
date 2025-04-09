import type { Config } from 'drizzle-kit';

export default {
  schema: './lib/drizzle/schema/index.ts',
  out: './lib/drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
