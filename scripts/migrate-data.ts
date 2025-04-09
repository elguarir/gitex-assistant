import fs from 'fs';
import path from 'path';
import { db, schema } from '../lib/drizzle/db';
import { eq, inArray } from 'drizzle-orm';

async function migrateData() {
  console.log('Starting data migration...');

  try {
    // Read sectors data from JSON file first
    const sectorsFilePath = path.join(process.cwd(), 'data', 'gitex_sectors_flat.json');
    const sectorsRawData = fs.readFileSync(sectorsFilePath, 'utf-8');
    const sectorsData = JSON.parse(sectorsRawData);

    console.log(`Found ${sectorsData.length} sectors in JSON file`);

    // Step 1: Create all sectors in batch
    const sectorNameToIdMap = new Map<string, number>();
    const sectorsToInsert = [];

    // Prepare batch insert data
    for (const sector of sectorsData) {
      if (!sector.name) continue;

      sectorsToInsert.push({
        name: sector.name,
        is_parent: sector.is_parent || false,
        original_id: sector.id,
      });
    }

    // Perform batch insert for sectors
    if (sectorsToInsert.length > 0) {
      const insertedSectors = await db
        .insert(schema.sectors)
        .values(sectorsToInsert)
        .onConflictDoNothing()
        .returning({ id: schema.sectors.id, name: schema.sectors.name })
        .execute();

      // Update map with newly inserted sectors
      for (const sector of insertedSectors) {
        sectorNameToIdMap.set(sector.name, sector.id);
      }
    }

    // Get existing sectors that weren't inserted
    const existingSectorNames = sectorsData
      // @ts-ignore
      .map(s => s.name)
      // @ts-ignore
      .filter(name => name && !sectorNameToIdMap.has(name));

    if (existingSectorNames.length > 0) {
      const existingSectors = await db
        .select({ id: schema.sectors.id, name: schema.sectors.name })
        .from(schema.sectors)
        .where(inArray(schema.sectors.name, existingSectorNames))
        .execute();

      for (const sector of existingSectors) {
        sectorNameToIdMap.set(sector.name, sector.id);
      }
    }

    console.log(`Processed ${sectorNameToIdMap.size} sectors`);

    // Step 2: Update parent-child relationships for sectors in batch
    const sectorUpdates = [];

    for (const sector of sectorsData) {
      if (!sector.name || !sector.parent_name || !sector.parent_id) continue;

      const sectorId = sectorNameToIdMap.get(sector.name);
      const parentId = sectorNameToIdMap.get(sector.parent_name);

      if (sectorId && parentId) {
        sectorUpdates.push({
          id: sectorId,
          parent_id: parentId,
        });
      }
    }

    // Perform batch updates in chunks to avoid too many parameters
    const CHUNK_SIZE = 100;
    for (let i = 0; i < sectorUpdates.length; i += CHUNK_SIZE) {
      const chunk = sectorUpdates.slice(i, i + CHUNK_SIZE);

      // Use Promise.all to run updates in parallel
      await Promise.all(
        chunk.map(update =>
          db
            .update(schema.sectors)
            .set({ parent_id: update.parent_id })
            .where(eq(schema.sectors.id, update.id))
            .execute()
        )
      );
    }

    console.log(`Updated parent relationships for ${sectorUpdates.length} sectors`);

    // Step 3: Process exhibitors data
    const exhibitorsFilePath = path.join(process.cwd(), 'data', 'exhibitor_profiles_full.json');
    const exhibitorsRawData = fs.readFileSync(exhibitorsFilePath, 'utf-8');
    const exhibitorsData = JSON.parse(exhibitorsRawData);

    console.log(`Found ${exhibitorsData.length} exhibitors in JSON file`);

    // Collect all sector names from exhibitors to ensure they exist
    const allExhibitorSectorNames = new Set<string>();
    for (const exhibitor of exhibitorsData) {
      if (exhibitor.sectors && Array.isArray(exhibitor.sectors)) {
        for (const sectorName of exhibitor.sectors) {
          if (sectorName) allExhibitorSectorNames.add(sectorName);
        }
      }
    }

    // @ts-ignore
    // Create any missing sectors in batch
    const missingSectorNames = [...allExhibitorSectorNames].filter(
      name => !sectorNameToIdMap.has(name)
    );

    if (missingSectorNames.length > 0) {
      const missingSectors = missingSectorNames.map(name => ({ name }));

      const insertedMissingSectors = await db
        .insert(schema.sectors)
        .values(missingSectors)
        .onConflictDoNothing()
        .returning({ id: schema.sectors.id, name: schema.sectors.name })
        .execute();

      for (const sector of insertedMissingSectors) {
        sectorNameToIdMap.set(sector.name, sector.id);
      }

      // Get IDs for any sectors that already existed
      const remainingMissingSectors = missingSectorNames.filter(
        name => !sectorNameToIdMap.has(name)
      );

      if (remainingMissingSectors.length > 0) {
        const existingSectors = await db
          .select({ id: schema.sectors.id, name: schema.sectors.name })
          .from(schema.sectors)
          .where(inArray(schema.sectors.name, remainingMissingSectors))
          .execute();

        for (const sector of existingSectors) {
          sectorNameToIdMap.set(sector.name, sector.id);
        }
      }
    }

    // Process exhibitors in chunks to avoid memory issues
    const exhibitorChunks = [];
    const EXHIBITOR_CHUNK_SIZE = 50;

    for (let i = 0; i < exhibitorsData.length; i += EXHIBITOR_CHUNK_SIZE) {
      exhibitorChunks.push(exhibitorsData.slice(i, i + EXHIBITOR_CHUNK_SIZE));
    }

    let processedCount = 0;

    for (const exhibitorChunk of exhibitorChunks) {
      const exhibitorsToInsert = [];

      // Prepare batch insert data
      for (const exhibitor of exhibitorChunk) {
        if (!exhibitor.name) continue;

        exhibitorsToInsert.push({
          name: exhibitor.name,
          logo_url: exhibitor.logo_url || null,
          stand_number: exhibitor.stand_number || null,
          country: exhibitor.country || null,
          description: exhibitor.description || null,
          profile_url: exhibitor.profile_url || null,
          social_links: exhibitor.social_links || null,
          products: exhibitor.products || null,
        });
      }

      if (exhibitorsToInsert.length === 0) continue;

      // Perform batch insert for exhibitors
      const insertedExhibitors = await db
        .insert(schema.exhibitors)
        .values(exhibitorsToInsert)
        .onConflictDoNothing()
        .returning({ id: schema.exhibitors.id, name: schema.exhibitors.name })
        .execute();

      // Build a map of exhibitor name to ID for this chunk
      const exhibitorNameToIdMap = new Map<string, number>();
      for (const exhibitor of insertedExhibitors) {
        exhibitorNameToIdMap.set(exhibitor.name, exhibitor.id);
      }

      // Find exhibitors that already exist but weren't inserted
      const missingExhibitorNames = exhibitorsToInsert
        .map(e => e.name)
        .filter(name => !exhibitorNameToIdMap.has(name));

      if (missingExhibitorNames.length > 0) {
        const existingExhibitors = await db
          .select({ id: schema.exhibitors.id, name: schema.exhibitors.name })
          .from(schema.exhibitors)
          .where(inArray(schema.exhibitors.name, missingExhibitorNames))
          .execute();

        for (const exhibitor of existingExhibitors) {
          exhibitorNameToIdMap.set(exhibitor.name, exhibitor.id);
        }
      }

      // Prepare batch insert for exhibitor-sector relationships
      const relationshipsToInsert = [];

      for (const exhibitor of exhibitorChunk) {
        if (!exhibitor.name) continue;

        const exhibitorId = exhibitorNameToIdMap.get(exhibitor.name);
        if (!exhibitorId) continue;

        if (exhibitor.sectors && Array.isArray(exhibitor.sectors)) {
          for (const sectorName of exhibitor.sectors) {
            if (!sectorName) continue;

            const sectorId = sectorNameToIdMap.get(sectorName);
            if (!sectorId) continue;

            relationshipsToInsert.push({
              exhibitor_id: exhibitorId,
              sector_id: sectorId,
            });
          }
        }
      }

      // Insert relationships in batch
      if (relationshipsToInsert.length > 0) {
        await db
          .insert(schema.exhibitorSectors)
          .values(relationshipsToInsert)
          .onConflictDoNothing()
          .execute();
      }

      processedCount += exhibitorsToInsert.length;
      console.log(`Processed ${processedCount}/${exhibitorsData.length} exhibitors`);
    }

    console.log('Data migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
}

// Execute the migration
migrateData()
  .then(() => {
    console.log('Migration script finished');
    process.exit(0);
  })
  .catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
