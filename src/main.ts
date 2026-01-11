import { PlaywrightCrawler } from 'crawlee';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

import { closeClient, getConfigs, insertData } from "./mongoClient.js";
import { notify } from './notify.js';
import { getResult, router } from './routes.js';

export async function runCrawler() {
  try {
  const crawler = new PlaywrightCrawler({
    requestHandler: router,
    maxRequestsPerCrawl: 1000,
    sameDomainDelaySecs: 1,
    maxRequestRetries: 1,
  });

  const configs = await getConfigs();

  if (!configs.length) {
    throw new Error("No site configurations found. Please add site configurations to the database.");
  }

  const startUrls = configs.map((config) => config.url);

  console.log("Start crawling.");
  await crawler.run(startUrls);
  console.log("Finished crawling.");

  const result = getResult();

  await insertData(result);

  await closeClient();

  await notify("Crawler completed successfully", `Crawler completed successfully: ${result.length} articles found`);
  } catch (error) {
    console.error("Crawler failed:", error);
    await notify("Crawler failed", `Crawler failed: ${error}`);
    process.exit(1);
  }
}

// Run if executed directly (not imported)
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('main.ts') || process.argv[1]?.endsWith('main.js')) {
  runCrawler()
    .then(() => {
      console.log("Crawler completed successfully.");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Crawler failed:", error);
      process.exit(1);
    });
}