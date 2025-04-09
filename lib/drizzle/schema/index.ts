import { sql } from 'drizzle-orm';
import {
  pgTable,
  text,
  serial,
  varchar,
  json,
  integer,
  primaryKey,
  index,
  timestamp,
  boolean,
} from 'drizzle-orm/pg-core';
import { vector } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

const timestamps = {
  created_at: timestamp({ withTimezone: false, mode: 'string' })
    .default(sql`(now() AT TIME ZONE 'utc'::text)`)
    .notNull(),
  updated_at: timestamp({ withTimezone: false, mode: 'string' })
    .default(sql`(now() AT TIME ZONE 'utc'::text)`)
    .notNull()
    .$onUpdate(() => sql`(now() AT TIME ZONE 'utc'::text)`),
};

// Exhibitors table
export const exhibitors = pgTable('exhibitors', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  logo_url: text('logo_url'),
  stand_number: varchar('stand_number', { length: 100 }),
  country: varchar('country', { length: 100 }),
  description: text('description'),
  profile_url: text('profile_url'),
  social_links: json('social_links'),
  products: json('products').$type<Array<{ name: string; category: string }>>(),
  ...timestamps,
});

// Sectors table
export const sectors = pgTable('sectors', {
  id: serial('id').primaryKey(),
  original_id: varchar('original_id', { length: 100 }),
  name: varchar('name', { length: 255 }).notNull().unique(),
  is_parent: boolean('is_parent').default(false),
  parent_id: integer('parent_id'),
  ...timestamps,
});

// Exhibitor to Sectors relation (many-to-many)
export const exhibitorSectors = pgTable(
  'exhibitor_sectors',
  {
    exhibitor_id: integer('exhibitor_id')
      .notNull()
      .references(() => exhibitors.id, { onDelete: 'cascade' }),
    sector_id: integer('sector_id')
      .notNull()
      .references(() => sectors.id, { onDelete: 'cascade' }),
  },
  t => [primaryKey({ columns: [t.exhibitor_id, t.sector_id] })]
);

// Embeddings table
export const embeddings = pgTable(
  'embeddings',
  {
    id: serial('id').primaryKey(),
    exhibitor_id: integer('exhibitor_id')
      .notNull()
      .references(() => exhibitors.id, { onDelete: 'cascade' }),
    embedding: vector('embedding', { dimensions: 1024 }).notNull(),
    ...timestamps,
  },
  table => [
    // Add HNSW index for efficient vector similarity search
    index('embedding_idx').using('hnsw', table.embedding.op('vector_cosine_ops')),
  ]
);

export const sectorsRelations = relations(sectors, ({ one, many }) => ({
  parent: one(sectors, {
    fields: [sectors.parent_id],
    references: [sectors.id],
  }),
  children: many(sectors),
  exhibitorSectors: many(exhibitorSectors),
}));

export const exhibitorsRelations = relations(exhibitors, ({ many }) => ({
  exhibitorSectors: many(exhibitorSectors),
}));

export const exhibitorSectorsRelations = relations(exhibitorSectors, ({ one }) => ({
  exhibitor: one(exhibitors, {
    fields: [exhibitorSectors.exhibitor_id],
    references: [exhibitors.id],
  }),
  sector: one(sectors, {
    fields: [exhibitorSectors.sector_id],
    references: [sectors.id],
  }),
}));

// Define types for our models
export type Exhibitor = typeof exhibitors.$inferSelect;
export type NewExhibitor = typeof exhibitors.$inferInsert;

export type Sector = typeof sectors.$inferSelect;
export type NewSector = typeof sectors.$inferInsert;

export type ExhibitorSector = typeof exhibitorSectors.$inferSelect;
export type NewExhibitorSector = typeof exhibitorSectors.$inferInsert;

export type Embedding = typeof embeddings.$inferSelect;
export type NewEmbedding = typeof embeddings.$inferInsert;
