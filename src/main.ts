import { Configuration, PlaywrightCrawler, PlaywrightCrawlerOptions } from 'crawlee';
import { chromium } from 'playwright';

import { closeClient, getConfigs, insertData } from "./mongoClient.js";
import { getResult, router } from './routes.js';

export async function runCrawler() {
  // Use browserless when configured (assumed when API is used on Vercel)
  const browserlessUrl = process.env.BROWSERLESS_URL;
  const browserlessToken = process.env.BROWSERLESS_TOKEN;

  // Configure storage to use /tmp in serverless environments (Vercel)
  // This prevents ENOENT errors when trying to create storage directories
  if (browserlessUrl) {
    Configuration.getGlobalConfig().set('storageClientOptions', {
      localDataDirectory: '/tmp',
    });
    Configuration.getGlobalConfig().set('systemInfoV2', true);
  }

  const crawlerOptions: PlaywrightCrawlerOptions = {
    requestHandler: router,
    maxRequestsPerCrawl: 1000,
    sameDomainDelaySecs: 1,
    maxRequestRetries: 1,
    minConcurrency: 1,
    maxConcurrency: 1,
  };

  // Configure browserless if URL is provided
  if (browserlessUrl) {
    const wsEndpoint = browserlessToken 
      ? `${browserlessUrl}?token=${browserlessToken}`
      : browserlessUrl;

    crawlerOptions.launchContext = {
      // @ts-ignore -- PlaywrightCrawlerOptions type is not compatible with PlaywrightLauncherOptions
      launcher: async () => {
        return await chromium.connectOverCDP(wsEndpoint);
      },
    };
  }

  const crawler = new PlaywrightCrawler(crawlerOptions);

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