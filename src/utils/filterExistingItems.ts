import { SiteData } from "../types.js";

export function filterExistingItems(data: SiteData[], dbData: SiteData[]) {
  const existingUrls = dbData?.map((item) => item.url) ?? [];
  const existingHeadlines = dbData?.map((item) => item.headline) ?? [];

  return data.filter((item) => {
    const existingUrl = existingUrls.includes(item.url);
    const existingHeadline = existingHeadlines.includes(item.headline);

    if (existingUrl || existingHeadline) {
      return false;
    }

    console.log(`New item: ${item.url}`);

    return true;
  });
}