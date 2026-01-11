# Journo Crawler

Web scraper built with **Crawlee** and **Playwright** that extracts article content from news websites and stores data in MongoDB.

## Local Development

### Prerequisites

- Node.js 18+
- MongoDB instance

### Setup

```bash
# Clone and install
git clone <repository-url>
cd journo-crawler
npm install

# Create .env file
MONGODB_URI=mongodb://your-connection-string
MONGODB_DATABASE=your-database
MONGODB_COLLECTION=your-collection
MONGODB_COLLECTION_CONFIGS=your-configs-collection

# Build and run
npm run build
npm run start:dev
```

## Scripts

- `npm run start:dev` - Development mode
- `npm run start:prod` - Production mode
- `npm run cleanup` - Remove old entries (default: 3 months)
- `npm run backup` - Backup collection to JSON
- `npm run restore` - Restore from backup

## Configuration

Site configurations are stored in MongoDB. Each config includes:
- URL and name
- URL patterns (globs) for article discovery
- CSS selectors for content extraction

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for Hetzner Cloud Server setup.
