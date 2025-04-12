import { SiteData } from "../types.js";

export function removeDuplicates(data: SiteData[]) {
  return data.filter((item, index, self) => {
    const url = item.url;
    const headline = item.headline;

    return (
      self.findIndex((t) => t.url === url || t.headline === headline) === index
    );
  });
}