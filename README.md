# Journo Crawler

A web scraping application built with **Crawlee** and **Playwright** that automatically extracts article content from news websites and stores the data in MongoDB.

## 🎯 What it does

Journo Crawler is a specialized web scraper designed to extract structured article data from news websites. It can:

- **Crawl multiple news sites** simultaneously using configurable selectors
- **Extract article metadata** including headlines, teasers, content, dates, and more
- **Filter content by time** (e.g., articles from the last week)
- **Store data in MongoDB** for further analysis or processing

## 🏗️ Architecture

The application uses a modular architecture with the following key components:

- **PlaywrightCrawler**: Handles browser automation and page navigation
- **Configurable selectors**: Site-specific CSS selectors for content extraction
- **MongoDB integration**: Stores both site configurations and scraped data
- **TypeScript**: Full type safety and modern JavaScript features

## 🚀 Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- MongoDB instance
- Playwright browsers (automatically installed)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd journo-crawler
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your MongoDB connection string
```

4. Build the project:
```bash
npm run build
```

### Running the Application

**Development mode:**
```bash
npm run start:dev
```

**Production mode:**
```bash
npm run build
npm run start:prod
```

## ⚙️ Configuration

The crawler reads site configurations from MongoDB. Each site configuration includes:

- **Basic info**: URL, name, location
- **URL patterns**: Globs to match article URLs
- **Content selectors**: CSS selectors for extracting article data
- **Framework type**: Website framework or CMS

### Example Site Configuration

```typescript
{
  framework: "example",
  url: "https://example-news.com",
  name: "Example News",
  location: "Berlin",
  globs: ["**/article/**", "**/news/**"],
  articles: {
    data: {
      headline: {
        selector: "h1.article-title",
        content: "text",
        attribute: "",
        type: "string",
        count: "unique"
      },
      content: {
        selector: ".article-body",
        content: "html",
        attribute: "",
        type: "string",
        count: "unique"
      },
      date: {
        selector: ".publish-date",
        content: "attribute",
        attribute: "datetime",
        type: "date",
        count: "unique"
      }
    }
  }
}
```

## 🔧 Content Types

The crawler supports different content extraction types:

- **`text`**: Extracts visible text content
- **`html`**: Extracts HTML markup
- **`attribute`**: Extracts specific HTML attributes

### Data Types

- **`string`**: Text content
- **`number`**: Numeric values
- **`boolean`**: True/false values
- **`date`**: Date/time values
- **`object`**: Complex objects
- **`array`**: Arrays of values

## 📊 Data Structure

Scraped articles are stored with the following structure:

```typescript
interface SiteData {
  sourceUrl: string;      // Base URL of the source site
  sourceName: string;     // Name of the source site
  url: string;            // Full URL of the article
  teaser: string;         // Article teaser/summary
  headline: string;       // Article headline
  subline: string;        // Article subline
  content: string;        // Main article content
  date: Date | string;    // Publication date
}
```

## 🛠️ Development

### Project Structure

```
src/
├── main.ts              # Main entry point
├── mongoClient.ts       # MongoDB connection and operations
├── routes.ts            # Crawler routing logic
├── types.ts             # TypeScript type definitions
└── utils/               # Utility functions
```

### Adding New Sites

1. Add a new site configuration to your MongoDB database
2. Define appropriate CSS selectors for content extraction
3. Configure URL patterns (globs) for article discovery

### Customizing Content Extraction

Modify the `handleSite.ts` utility to add new content extraction logic or modify existing behavior.

## 📝 Scripts

### Main Scripts

- **`npm start`**: Start in development mode
- **`npm run start:dev`**: Start with hot reload
- **`npm run start:prod`**: Start production build
- **`npm run build`**: Build TypeScript to JavaScript
- **`npm test`**: Run tests (currently placeholder)

### Maintenance Scripts

#### Cleanup Old Entries

Removes entries from the database that are older than a configured number of months (defaults to 3 months).

```bash
npm run cleanup
```

**Environment Variables:**
- `MONTHS_TO_KEEP` (optional): Number of months to keep. Defaults to `3`.

**Example:**
```bash
# Keep entries from the last 6 months
MONTHS_TO_KEEP=6 npm run cleanup
```

**Usage Tip:** The cleanup script can be run daily together with the start script to always keep up-to-date data. For example, you can set up a cron job or scheduled task to run both:

```bash
npm start && npm run cleanup
```

#### Backup Collection

Creates a local backup of the entire collection as a JSON file.

```bash
npm run backup
```

**Environment Variables:**
- `BACKUP_FILE` (optional): Path to the backup file. Defaults to `./backups/collection-backup.json`.

**Example:**
```bash
# Backup to a specific file with timestamp
BACKUP_FILE=./backups/backup-$(date +%Y%m%d).json npm run backup
```

The backup file includes:
- Timestamp of when the backup was created
- Database and collection information
- Document count
- All documents in JSON format

#### Restore Collection

Restores the collection from a backup file.

```bash
npm run restore
```

**Environment Variables:**
- `BACKUP_FILE` (optional): Path to the backup file to restore from. Defaults to `./backups/collection-backup.json`.
- `RESTORE_MODE` (optional): Restoration mode. Options:
  - `replace` (default): Deletes all existing documents and restores from backup
  - `merge`: Only inserts documents that don't already exist (skips duplicates)

**Examples:**
```bash
# Replace mode (default) - deletes all existing data first
npm run restore

# Merge mode - only adds new documents
RESTORE_MODE=merge npm run restore

# Restore from a specific backup file
BACKUP_FILE=./backups/backup-20240101.json npm run restore
```

**Note:** The restore script automatically converts:
- `_id` strings back to MongoDB `ObjectId` instances
- Date strings back to `Date` objects

This ensures data types are preserved correctly when restoring from backups.
