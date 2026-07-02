import { PrismaClient } from '@prisma/client';

// We will instantiate two different prisma clients by passing the datasources URL directly
const localDb = new PrismaClient({
  datasources: {
    db: {
      url: "mysql://root:root@localhost:3306/ayurwed?connection_limit=5"
    }
  }
});

const remoteDb = new PrismaClient({
  datasources: {
    db: {
      url: "mysql://u886831643_ayurwed:Black_4Black_4@srv2203.hstgr.io:3306/u886831643_ayurwed?connection_limit=5"
    }
  }
});

async function main() {
  try {
    console.log("Fetching preparations and indications from LOCAL database...");
    const localPreps = await localDb.preparation.findMany({
      include: {
        indications: true
      }
    });
    const localIndications = await localDb.indication.findMany();

    console.log(`Found ${localPreps.length} preparations and ${localIndications.length} indications locally.`);

    console.log("\nSynchronizing indications to REMOTE database...");
    for (const ind of localIndications) {
      await remoteDb.indication.upsert({
        where: { name: ind.name },
        update: {
          slug: ind.slug,
          description: ind.description,
        },
        create: {
          name: ind.name,
          slug: ind.slug,
          description: ind.description,
        }
      });
    }
    console.log("Indications synchronized.");

    // Fetch remote indications to map names to remote IDs
    const remoteIndications = await remoteDb.indication.findMany();
    const remoteIndicationMap = new Map<string, number>();
    remoteIndications.forEach(ind => {
      remoteIndicationMap.set(ind.name.toLowerCase().trim(), ind.id);
    });

    console.log("\nDeleting mock preparations on REMOTE database that are not in local database...");
    const remotePrepsBefore = await remoteDb.preparation.findMany();
    const localSlugs = new Set(localPreps.map(p => p.slug));
    
    let deletedCount = 0;
    for (const remotePrep of remotePrepsBefore) {
      if (!localSlugs.has(remotePrep.slug)) {
        await remoteDb.preparation.delete({
          where: { id: remotePrep.id }
        });
        deletedCount++;
      }
    }
    console.log(`Deleted ${deletedCount} mock preparations from remote.`);

    console.log("\nUpserting real preparations and mapping indications to REMOTE database...");
    let upsertedCount = 0;
    for (const localPrep of localPreps) {
      // Find the remote indication IDs for this preparation
      const remoteIndicationIds: number[] = [];
      for (const localInd of localPrep.indications) {
        const remoteId = remoteIndicationMap.get(localInd.name.toLowerCase().trim());
        if (remoteId !== undefined) {
          remoteIndicationIds.push(remoteId);
        }
      }

      // Upsert the preparation
      await remoteDb.preparation.upsert({
        where: { slug: localPrep.slug },
        update: {
          name: localPrep.name,
          type: localPrep.type,
          description: localPrep.description,
          botanicalName: localPrep.botanicalName,
          volume: localPrep.volume,
          volumeUnit: localPrep.volumeUnit,
          mrp: localPrep.mrp,
          stock: localPrep.stock,
          ingredients: localPrep.ingredients,
          benefits: localPrep.benefits,
          usage: localPrep.usage,
          images: localPrep.images,
          isActive: localPrep.isActive,
          rating: localPrep.rating,
          totalReviews: localPrep.totalReviews,
          indications: {
            set: remoteIndicationIds.map(id => ({ id }))
          }
        },
        create: {
          name: localPrep.name,
          slug: localPrep.slug,
          type: localPrep.type,
          description: localPrep.description,
          botanicalName: localPrep.botanicalName,
          volume: localPrep.volume,
          volumeUnit: localPrep.volumeUnit,
          mrp: localPrep.mrp,
          stock: localPrep.stock,
          ingredients: localPrep.ingredients,
          benefits: localPrep.benefits,
          usage: localPrep.usage,
          images: localPrep.images,
          isActive: localPrep.isActive,
          rating: localPrep.rating,
          totalReviews: localPrep.totalReviews,
          indications: {
            connect: remoteIndicationIds.map(id => ({ id }))
          }
        }
      });
      upsertedCount++;
    }

    console.log(`Successfully synchronized ${upsertedCount} real preparations to the remote database.`);
  } catch (e) {
    console.error("Error during synchronization:", e);
  } finally {
    await localDb.$disconnect();
    await remoteDb.$disconnect();
  }
}

main();
