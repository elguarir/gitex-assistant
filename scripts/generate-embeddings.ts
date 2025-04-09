import { db } from '@/lib/drizzle/db';
import { exhibitors, embeddings } from '@/lib/drizzle/schema';
import { eq, inArray } from 'drizzle-orm';
import { mistral } from '@ai-sdk/mistral';
import { embedMany } from 'ai';

const model = mistral.embedding('mistral-embed');

async function generateEmbeddings(texts: string[]) {
  const { embeddings } = await embedMany({
    model,
    values: texts,
  });
  return embeddings;
}

async function main() {
  console.log('Fetching exhibitors and existing embeddings...');

  // Get all exhibitors and existing embeddings in parallel
  const [allExhibitors, existingEmbeddings] = await Promise.all([
    db.select().from(exhibitors),
    db.select({ exhibitor_id: embeddings.exhibitor_id }).from(embeddings),
  ]);

  console.log(`Found ${allExhibitors.length} exhibitors`);

  // Create a Set of exhibitor IDs that already have embeddings for O(1) lookup
  const existingEmbeddingIds = new Set(existingEmbeddings.map(e => e.exhibitor_id));

  // Filter exhibitors that need embeddings
  const exhibitorsToProcess = allExhibitors.filter(
    exhibitor => !existingEmbeddingIds.has(exhibitor.id)
  );

  console.log(`Processing ${exhibitorsToProcess.length} exhibitors that need embeddings`);

  if (exhibitorsToProcess.length === 0) {
    console.log('No exhibitors need embeddings. Exiting.');
    return;
  }

  // Prepare texts for embedding
  const textsToEmbed = exhibitorsToProcess.map(exhibitor => {
    const productsText = exhibitor.products
      ? exhibitor.products
          .map((p: { name: string; category: string }) => `${p.name} (${p.category})`)
          .join(', ')
      : '';

    return [exhibitor.name, exhibitor.description, exhibitor.country, productsText]
      .filter(Boolean)
      .join(' ');
  });

  try {
    console.log('Generating embeddings in batch...');
    const batchEmbeddings = await generateEmbeddings(textsToEmbed);

    console.log('Storing embeddings in database...');
    // Batch insert all embeddings
    await db.insert(embeddings).values(
      exhibitorsToProcess.map((exhibitor, index) => ({
        exhibitor_id: exhibitor.id,
        embedding: batchEmbeddings[index],
      }))
    );

    console.log('Successfully generated and stored all embeddings');
  } catch (error) {
    console.error('Error processing embeddings:', error);
  }

  console.log('Finished generating embeddings');
}

main().catch(console.error);
