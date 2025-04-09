'use server';
import { db } from '@/lib/drizzle/db';
import { exhibitors, embeddings } from '@/lib/drizzle/schema';
import { sql } from 'drizzle-orm';
import { mistral } from '@ai-sdk/mistral';
import { embedMany } from 'ai';
