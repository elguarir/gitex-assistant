import fs from "fs";
import path from "path";
import { db, schema } from "../lib/drizzle/db";
import { eq } from "drizzle-orm";

async function migrateData() {
  console.log("Starting data migration...");

  try {
    // Read sectors data from JSON file first
    const sectorsFilePath = path.join(
      process.cwd(),
      "data",
      "gitex_sectors_flat.json"
    );
    const sectorsRawData = fs.readFileSync(sectorsFilePath, "utf-8");
    const sectorsData = JSON.parse(sectorsRawData);

    console.log(`Found ${sectorsData.length} sectors in JSON file`);

    // Step 1: Create all sectors first
    const sectorNameToIdMap = new Map<string, number>();

    for (const sector of sectorsData) {
      if (!sector.name) continue;

      // Insert sector (without parent relationship yet)
      const [insertedSector] = await db
        .insert(schema.sectors)
        .values({
          name: sector.name,
          is_parent: sector.is_parent || false,
          original_id: sector.id,
        })
        .returning({ id: schema.sectors.id })
        .onConflictDoNothing()
        .execute();

      if (insertedSector) {
        sectorNameToIdMap.set(sector.name, insertedSector.id);
        console.log(
          `Created sector: ${sector.name} (ID: ${insertedSector.id})`
        );
      } else {
        // Get the ID if the sector already existed
        const existingSector = await db
          .select({ id: schema.sectors.id })
          .from(schema.sectors)
          .where(eq(schema.sectors.name, sector.name))
          .limit(1)
          .execute();

        if (existingSector.length > 0) {
          sectorNameToIdMap.set(sector.name, existingSector[0].id);
        }
      }
    }

    // Step 2: Update parent-child relationships for sectors
    console.log("Updating sector parent-child relationships...");
    for (const sector of sectorsData) {
      if (!sector.name) continue;

      // Skip if no parent
      if (!sector.parent_name || !sector.parent_id) continue;

      // Get the current sector ID
      const sectorId = sectorNameToIdMap.get(sector.name);
      if (!sectorId) continue;

      // Find parent sector ID
      const parentId = sectorNameToIdMap.get(sector.parent_name);
      if (!parentId) continue;

      // Update sector with parent_id
      await db
        .update(schema.sectors)
        .set({ parent_id: parentId })
        .where(eq(schema.sectors.id, sectorId))
        .execute();

      console.log(`Set parent for ${sector.name} → ${sector.parent_name}`);
    }

    // Step 3: Process exhibitors data
    const exhibitorsFilePath = path.join(
      process.cwd(),
      "data",
      "gitex_exhibitors.json"
    );
    const exhibitorsRawData = fs.readFileSync(exhibitorsFilePath, "utf-8");
    const exhibitorsData = JSON.parse(exhibitorsRawData);

    console.log(`Found ${exhibitorsData.length} exhibitors in JSON file`);

    // Process each exhibitor
    for (const exhibitor of exhibitorsData) {
      // Skip empty exhibitor entries
      if (!exhibitor.name) continue;

      console.log(`Processing exhibitor: ${exhibitor.name}`);

      // Insert exhibitor
      const [insertedExhibitor] = await db
        .insert(schema.exhibitors)
        .values({
          name: exhibitor.name,
          logo_url: exhibitor.logo_url || null,
          stand_number: exhibitor.stand_number || null,
          country: exhibitor.country || null,
          description: exhibitor.description || null,
          profile_url: exhibitor.profile_url || null,
          social_links: exhibitor.social_links || null,
        })
        .returning({ id: schema.exhibitors.id })
        .onConflictDoNothing() // Skip if exhibitor with same name already exists
        .execute();

      if (!insertedExhibitor) {
        console.log(`Exhibitor ${exhibitor.name} already exists, skipping...`);
        continue;
      }

      const exhibitorId = insertedExhibitor.id;

      // Process sectors
      if (exhibitor.sectors && Array.isArray(exhibitor.sectors)) {
        for (const sectorName of exhibitor.sectors) {
          if (!sectorName) continue;

          // Check if we have this sector in our map
          let sectorId = sectorNameToIdMap.get(sectorName);

          if (!sectorId) {
            // If sector wasn't in the flat JSON file, create it now
            const [insertedSector] = await db
              .insert(schema.sectors)
              .values({ name: sectorName })
              .returning({ id: schema.sectors.id })
              .onConflictDoNothing()
              .execute();

            if (insertedSector) {
              sectorId = insertedSector.id;
              sectorNameToIdMap.set(sectorName, sectorId);
              console.log(
                `Created new sector: ${sectorName} (ID: ${sectorId})`
              );
            } else {
              // Find the ID of the existing sector
              const existingSector = await db
                .select({ id: schema.sectors.id })
                .from(schema.sectors)
                .where(eq(schema.sectors.name, sectorName))
                .limit(1)
                .execute();

              if (existingSector.length > 0) {
                sectorId = existingSector[0].id;
                sectorNameToIdMap.set(sectorName, sectorId);
              }
            }
          }

          if (sectorId) {
            // Create relationship between exhibitor and sector
            await db
              .insert(schema.exhibitorSectors)
              .values({
                exhibitor_id: exhibitorId,
                sector_id: sectorId,
              })
              .onConflictDoNothing()
              .execute();
          }
        }
      }
    }

    console.log("Data migration completed successfully!");
  } catch (error) {
    console.error("Error during migration:", error);
    process.exit(1);
  }
}

// Execute the migration
migrateData()
  .then(() => {
    console.log("Migration script finished");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });
