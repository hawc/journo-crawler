export type AttributeType = 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';

export type ContentType = 'text' | 'html' | 'attribute';

export type Count = 'unique' | 'multiple';

export interface Selector {
  // The CSS selector to identify the element
  selector: string;
  // The content type to extract from the element
  content: ContentType;
  // The attribute to extract from the element
  attribute: string;
  // The type of the attribute value
  type: AttributeType;
  // The expected count of matching elements
  count: Count;
}

export interface ArticleData {
  teaser: Selector;
  headline: Selector;
  subline?: Selector;
  content: Selector;
  date: Selector;
}

export interface SitesConfig {
  // The framework or CMS of the website
  framework?: string;
  // The base URL of the site
  url: string;
  // The name of the website
  name: string;
  // The location of the website
  location: string;
  // The globs to match URLs for the site
  globs: string[];
  // The mapping of article data
  articles: {
    data: ArticleData;
  };
};

export interface SiteData {
  sourceUrl: string;
  sourceName: string;
  url: string;
  teaser: string;
  headline: string;
  subline: string;
  content: string;
  date: Date | string;
}