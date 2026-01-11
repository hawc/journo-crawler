import { config } from "dotenv";
import { readFile } from "fs/promises";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";
import { SiteData } from "./types.js";

// Load environment variables from .env file
config();

const {
  MONGODB_URI,
  MONGODB_DATABASE,
  MONGODB_COLLECTION,
  BACKUP_FILE = "./backups/collection-backup.json",
  RESTORE_MODE = "replace", // "replace" or "merge"
} = process.env;

if (!MONGODB_URI) {
  throw new Error("MongoDB config missing.");
}

if (!MONGODB_DATABASE || !MONGODB_COLLECTION) {
  throw new Error("MongoDB database or collection not specified.");
}

if (RESTORE_MODE !== "replace" && RESTORE_MODE !== "merge") {
  throw new Error("RESTORE_MODE must be either 'replace' or 'merge'.");
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

function transformDocument(doc: any): any {
  const transformed = { ...doc };

  // Convert _id string to ObjectId
  if (transformed._id && typeof transformed._id === "string") {
    transformed._id = new ObjectId(transformed._id);
  }

  // Convert date string to Date object
  if (transformed.date) {
    if (typeof transformed.date === "string") {
      transformed.date = new Date(transformed.date);
    }
  }

  return transformed;
}

async function restoreCollection() {
  try {
    // Read backup file
    console.log(`Reading backup file: ${BACKUP_FILE}`);
    const fileContent = await readFile(BACKUP_FILE, "utf-8");
    const backupData = JSON.parse(fileContent);

    if (!backupData.data || !Array.isArray(backupData.data)) {
      throw new Error("Invalid backup file format. Expected 'data' array.");
    }

    console.log(`Backup file info:`);
    console.log(`  Timestamp: ${backupData.timestamp || "unknown"}`);
    console.log(`  Database: ${backupData.database || "unknown"}`);
    console.log(`  Collection: ${backupData.collection || "unknown"}`);
    console.log(`  Document count: ${backupData.data.length}`);

    const db = client.db(MONGODB_DATABASE);
    const collection = db.collection<SiteData>(MONGODB_COLLECTION);

    if (RESTORE_MODE === "replace") {
      console.log("Replacing all existing documents...");
      // Delete all existing documents
      const deleteResult = await collection.deleteMany({});
      console.log(`Deleted ${deleteResult.deletedCount} existing documents.`);

      // Insert all documents from backup
      if (backupData.data.length > 0) {
        // Transform documents to restore proper types
        const transformedDocuments = backupData.data.map(transformDocument);
        const insertResult = await collection.insertMany(transformedDocuments);
        console.log(`Restored ${insertResult.insertedCount} documents.`);
      } else {
        console.log("No documents to restore.");
      }
    } else {
      // Merge mode: only insert documents that don't already exist
      console.log("Merging with existing documents (skipping duplicates)...");
      
      const existingItems = await collection.find({}).toArray();
      console.log(`Found ${existingItems.length} existing documents.`);

      // Create a set of existing document IDs for quick lookup
      const existingIds = new Set(
        existingItems.map((item: any) => item._id?.toString())
      );

      // Filter out documents that already exist
      const newDocuments = backupData.data.filter((doc: any) => {
        return !existingIds.has(doc._id?.toString());
      });

      console.log(`${newDocuments.length} new documents to insert (${backupData.data.length - newDocuments.length} duplicates skipped).`);

      if (newDocuments.length > 0) {
        // Transform documents to restore proper types
        const transformedDocuments = newDocuments.map(transformDocument);
        const insertResult = await collection.insertMany(transformedDocuments);
        console.log(`Restored ${insertResult.insertedCount} new documents.`);
      } else {
        console.log("No new documents to restore (all already exist).");
      }
    }

    const finalCount = await collection.countDocuments();
    console.log(`Final document count: ${finalCount}`);
  } catch (error: any) {
    if (error.code === "ENOENT") {
      console.error(`Backup file not found: ${BACKUP_FILE}`);
    } else {
      console.error(`Error restoring collection: ${error?.message}`);
    }
    throw error;
  } finally {
    await client.close();
    console.log("MongoDB client closed.");
  }
}

restoreCollection()
  .then(() => {
    console.log("Restore process completed successfully.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Restore failed:", error);
    process.exit(1);
  });
