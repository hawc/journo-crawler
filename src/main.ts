import { PlaywrightCrawler } from 'crawlee';

import { closeClient, getConfigs, insertData } from "./mongoClient.js";
import { getResult, router } from './routes.js';

const crawler = new PlaywrightCrawler({
  requestHandler: router,
  maxRequestsPerCrawl: 1000,
  sameDomainDelaySecs: 1,
  maxRequestRetries: 1,
});

const configs = await getConfigs();

if (!configs.length) {
  console.error("No site configurations found. Please add site configurations to the database.");

  process.exit(1);
}

const startUrls = configs.map((config) => config.url);

console.log("Start crawling.");
await crawler.run(startUrls);
console.log("Finished crawling.");

const result = getResult();

await insertData(result);

await closeClient();