import { MongoClient, ServerApiVersion } from "mongodb";
import { SiteData } from "./types.js";

const {
  MONGODB_URI,
  MONGODB_DATABASE,
  MONGODB_COLLECTION,
  MONTHS_TO_KEEP = "3",
} = process.env;

if (!MONGODB_URI) {
  throw new Error("MongoDB config missing.");
}

if (!MONGODB_DATABASE || !MONGODB_COLLECTION) {
  throw new Error("MongoDB database or collection not specified.");
}

const monthsToKeep = parseInt(MONTHS_TO_KEEP, 10);
if (isNaN(monthsToKeep) || monthsToKeep < 0) {
  throw new Error("MONTHS_TO_KEEP must be a valid non-negative number.");
}

export async function cleanupOldEntries() {
  if (!MONGODB_URI) {
    throw new Error("MongoDB config missing.");
  }

  if (!MONGODB_DATABASE || !MONGODB_COLLECTION) {
    throw new Error("MongoDB database or collection not specified.");
  }

  const monthsToKeep = parseInt(MONTHS_TO_KEEP || "3", 10);
  if (isNaN(monthsToKeep) || monthsToKeep < 0) {
    throw new Error("MONTHS_TO_KEEP must be a valid non-negative number.");
  }

  const client = new MongoClient(MONGODB_URI, {
    tls: true,
    serverSelectionTimeoutMS: 3000,
    autoSelectFamily: false,
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

  try {
    const db = client.db(MONGODB_DATABASE);
    const collection = db.collection<SiteData>(MONGODB_COLLECTION);

    // Calculate the cutoff date (monthsToKeep months ago)
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - monthsToKeep);

    console.log(`Deleting entries older than ${monthsToKeep} months (before ${cutoffDate.toISOString()})...`);

    // Count entries before deletion
    const countBefore = await collection.countDocuments({
      date: { $lt: cutoffDate }
    });

    console.log(`Found ${countBefore} entries to delete.`);

    if (countBefore === 0) {
      console.log("No entries to delete.");
      return;
    }

    // Delete entries where date is older than cutoff
    // MongoDB handles both Date objects and ISO string dates in comparisons
    const result = await collection.deleteMany({
      date: { $lt: cutoffDate }
    });

    console.log(`Successfully deleted ${result.deletedCount} entries.`);
  } catch (error: any) {
    console.error(`Error cleaning up old entries: ${error?.message}`);
    throw error;
  } finally {
    await client.close();
    console.log("MongoDB client closed.");
  }
}

// Run if executed directly (not imported)
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('cleanupOldEntries.ts') || process.argv[1]?.endsWith('cleanupOldEntries.js')) {
  cleanupOldEntries()
    .then(() => {
      console.log("Cleanup completed successfully.");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Cleanup failed:", error);
      process.exit(1);
    });
}
