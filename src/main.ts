import { PlaywrightCrawler } from 'crawlee';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

import { closeClient, getConfigs, insertData } from "./mongoClient.js";
import { getResult, router } from './routes.js';

export async function runCrawler() {
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