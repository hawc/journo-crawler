import { createPlaywrightRouter } from "crawlee";
import { getConfigs } from "./mongoClient.js";
import { SiteData, SitesConfig } from "./types.js";
import { filterDataByLastWeek } from "./utils/filterDataByLastWeek.js";
import { handleSite } from "./utils/handleSite.js";

export const router = createPlaywrightRouter();

const result: SiteData[] = [];

async function addDefaultHander(configs: SitesConfig[]) {
  router.addDefaultHandler(async (data) => {
    const { request, enqueueLinks, log } = data;

    const config = configs.find((config) => request.url.includes(config.url));

    if (!config) {
      log.info(`Config not found for ${request.url}.`);

      return;
    }

    log.info(`Enqueueing "${config.name}".`);

    await enqueueLinks({
      globs: config.globs,
      label: config.name,
    });
  });
}

async function addHandlers(configs: SitesConfig[]) {
  configs.forEach((siteConfig) => {
    const label = siteConfig.name;

    router.addHandler(label, async ({ page }) => {
      const data = await handleSite(siteConfig, page);

      result.push(data);
    });
  });
}

export function getResult() {
  return filterDataByLastWeek(result);
}

async function init() {
  const configs = await getConfigs();

  addDefaultHander(configs);
  addHandlers(configs);
}

init();