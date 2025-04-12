import { Page } from "playwright";
import { SiteData, SitesConfig } from "../types.js";
import { getLocatorContent } from "./getLocatorContent.js";
import { parseContentByType } from "./parseContentByType.js";

const EMPTY_SITE_DATA: SiteData = {
  sourceUrl: '',
  sourceName: '',
  url: '',
  teaser: '',
  headline: '',
  subline: '',
  content: '',
  date: '',
};

export async function handleSite(site: SitesConfig, page: Page) {
  const dataConfig = site.articles.data;

  const data: SiteData = { ...EMPTY_SITE_DATA };

  for (const key in dataConfig) {
    const siteSelectors = dataConfig[key as keyof typeof dataConfig];

    if (!siteSelectors) {
      continue;
    }

    const { selector, content, attribute, type, count } = siteSelectors;

    const value = await getLocatorContent(page, selector, attribute, content, count);
    data[key as keyof SiteData] = parseContentByType(value, type) as string;
  }
  data.sourceUrl = site.url;
  data.sourceName = site.name;
  data.url = page.url();

  return data;
}