import { MongoClient, ServerApiVersion } from "mongodb";
import { SiteData, SitesConfig } from "./types.js";
import { filterExistingItems } from "./utils/filterExistingItems.js";
import { removeDuplicates } from "./utils/removeDuplicates.js";
import { setId } from "./utils/setId.js";

const {
  MONGODB_URI,
  MONGODB_DATABASE,
  MONGODB_COLLECTION,
  MONGODB_COLLECTION_CONFIGS,
} = process.env;

if (!MONGODB_URI) {
  throw new Error("MongoDB config missing.");
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


export async function insertData(data: SiteData[]) {
  if (!MONGODB_DATABASE || !MONGODB_COLLECTION) {
    throw new Error("MongoDB database or collection not specified.");
  }

  try {
    const db = client.db(MONGODB_DATABASE);
    const collection = db.collection<SiteData>(MONGODB_COLLECTION);

    const existingItems = await collection.find({}).toArray();

    console.log("Data to insert:", data.length);
    console.log("Existing items:", existingItems.length);

    const withoutDuplicates = removeDuplicates(data);
    const newItems = filterExistingItems(withoutDuplicates, existingItems);
    const itemsWithId = newItems.map(setId);

    console.log("New items to insert:", itemsWithId.length);

    let result = { insertedCount: 0 };
    if (itemsWithId.length > 0) {
      result = await collection.insertMany(itemsWithId);
    }

    console.log("Items inserted:", result.insertedCount);
  } catch (error: any) {
    console.error(`Error inserting data: ${error?.message}`);
  }
}

export async function getConfigs() {
  if (!MONGODB_DATABASE || !MONGODB_COLLECTION_CONFIGS) {
    throw new Error("MongoDB database or collection not specified.");
  }

  let configs: SitesConfig[] = [];

  try {
    const db = client.db(MONGODB_DATABASE);
    const collection = db.collection<SitesConfig>(MONGODB_COLLECTION_CONFIGS);

    configs = await collection.find({}).toArray();
  } catch (error: any) {
    console.error(`Error inserting data: ${error?.message}`);
  }

  return configs;
}

export async function closeClient() {
  try {
    await client.close();
    console.log("MongoDB client closed.");
  } catch (error: any) {
    console.error(`Error closing MongoDB client: ${error?.message}`);
  }
}