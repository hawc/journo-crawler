import { Page } from "playwright";
import { ContentType, Count } from "../types.js";
import { resolveLocatorContent } from "./resolveLocatorContent.js";

export async function getLocatorContent(page: Page, selector: string, attribute: string, content: ContentType, count: Count) {
  if (count === 'multiple') {
    const locators = await page.locator(selector).all();
    const values = await Promise.all(locators.map(async (locator) =>
      await resolveLocatorContent(content, attribute, locator)
    ));
    return values.join('\n');
  }

  const locator = await page.locator(selector).first();

  return await resolveLocatorContent(content, attribute, locator);
}