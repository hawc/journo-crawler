import { Locator } from "playwright";
import { ContentType } from "../types.js";

const TIMEOUT = 3000;

export async function resolveLocatorContent(content: ContentType, attribute: string, locator: Locator) {
  switch (content) {
    case 'text':
      return await locator.innerText({ timeout: TIMEOUT }) ?? '';
    case 'html':
      return await locator.innerHTML({ timeout: TIMEOUT });
    case 'attribute':
      return await locator.getAttribute(attribute, { timeout: TIMEOUT }) ?? '';
    default:
      return '';
  }
}