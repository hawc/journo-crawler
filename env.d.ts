declare namespace NodeJS {
  interface ProcessEnv {
    MONGODB_URI: string;
    MONGODB_DATABASE: string;
    MONGODB_COLLECTION: string;
    MONGODB_COLLECTION_CONFIGS: string;
    BROWSERLESS_URL?: string;
    BROWSERLESS_TOKEN?: string;
  }
}