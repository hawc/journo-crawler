import { SiteData } from "../types.js";

const ONE_DAY_MS = 1000 * 3600 * 24;
const MAX_DAYS = 7;

export function filterDataByLastWeek(data: SiteData[]) {
  const filteredData = data.filter((item) => {
    const date = new Date(item.date);
    const now = new Date();
    const diff = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diff / ONE_DAY_MS);

    return diffDays <= MAX_DAYS;
  });

  return filteredData;
}
