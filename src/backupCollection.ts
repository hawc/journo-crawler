import { mkdir, writeFile } from "fs/promises";
import { MongoClient, ServerApiVersion } from "mongodb";
import { dirname } from "path";
import { SiteData } from "./types.js";

const {
  MONGODB_URI,
  MONGODB_DATABASE,
  MONGODB_COLLECTION,
  BACKUP_FILE = "./backups/collection-backup.json",
} = process.env;

if (!MONGODB_URI) {
  throw new Error("MongoDB config missing.");
}

if (!MONGODB_DATABASE || !MONGODB_COLLECTION) {
  throw new Error("MongoDB database or collection not specified.");
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

async function backupCollection() {
  try {
    const db = client.db(MONGODB_DATABASE);
    const collection = db.collection<SiteData>(MONGODB_COLLECTION);

    console.log("Fetching all documents from collection...");
    const documents = await collection.find({}).toArray();
    
    console.log(`Found ${documents.length} documents to backup.`);

    if (documents.length === 0) {
      console.log("No documents to backup.");
      return;
    }

    // Create backup directory if it doesn't exist
    const backupDir = dirname(BACKUP_FILE);
    try {
      await mkdir(backupDir, { recursive: true });
    } catch (error: any) {
      // Directory might already exist, ignore error
      if (error.code !== "EEXIST") {
        throw error;
      }
    }

    // Add timestamp to backup
    const backupData = {
      timestamp: new Date().toISOString(),
      database: MONGODB_DATABASE,
      collection: MONGODB_COLLECTION,
      count: documents.length,
      data: documents,
    };

    // Write to file
    await writeFile(BACKUP_FILE, JSON.stringify(backupData, null, 2), "utf-8");

    console.log(`Backup completed successfully. Saved ${documents.length} documents to ${BACKUP_FILE}`);
  } catch (error: any) {
    console.error(`Error backing up collection: ${error?.message}`);
    throw error;
  } finally {
    await client.close();
    console.log("MongoDB client closed.");
  }
}

backupCollection()
  .then(() => {
    console.log("Backup process completed successfully.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Backup failed:", error);
    process.exit(1);
  });
