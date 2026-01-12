#!/bin/bash

# Daily cron job script for Journo Crawler
# This script runs the crawler and cleanup tasks

set -e

APP_DIR="/opt/journo-crawler"
LOG_DIR="/home/journo/logs/journo-crawler"
APP_USER="journo"

# Ensure we're in the app directory
cd "$APP_DIR"

# Load environment variables
if [ -f "$APP_DIR/.env" ]; then
    export $(cat "$APP_DIR/.env" | grep -v '^#' | xargs)
fi

# Run crawler
echo "$(date): Starting crawler..." >> "$LOG_DIR/cron.log"
/usr/bin/node "$APP_DIR/dist/main.js" >> "$LOG_DIR/crawler.log" 2>&1
CRAWLER_EXIT=$?

if [ $CRAWLER_EXIT -eq 0 ]; then
    echo "$(date): Crawler completed successfully" >> "$LOG_DIR/cron.log"
else
    echo "$(date): Crawler failed with exit code $CRAWLER_EXIT" >> "$LOG_DIR/cron.log"
fi

# Run cleanup
echo "$(date): Starting cleanup..." >> "$LOG_DIR/cron.log"
/usr/bin/node "$APP_DIR/dist/cleanupOldEntries.js" >> "$LOG_DIR/cleanup.log" 2>&1
CLEANUP_EXIT=$?

if [ $CLEANUP_EXIT -eq 0 ]; then
    echo "$(date): Cleanup completed successfully" >> "$LOG_DIR/cron.log"
else
    echo "$(date): Cleanup failed with exit code $CLEANUP_EXIT" >> "$LOG_DIR/cron.log"
fi

# Exit with error if either task failed
if [ $CRAWLER_EXIT -ne 0 ] || [ $CLEANUP_EXIT -ne 0 ]; then
    exit 1
fi

echo "$(date): Daily cron job completed successfully" >> "$LOG_DIR/cron.log"
