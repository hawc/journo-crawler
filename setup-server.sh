#!/bin/bash

set -e

# Configuration
APP_DIR="$(pwd)"
APP_USER="journo"
NODE_VERSION="20"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root (use sudo)"
    exit 1
fi

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "Error: This script must be run from within the cloned repository directory"
    exit 1
fi

# Update system
echo "Updating system packages..."
apt update && apt upgrade -y

# Install Node.js
echo "Installing Node.js ${NODE_VERSION}..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
    apt install -y nodejs
fi

# Create application user
echo "Setting up application user..."
if ! id "$APP_USER" &>/dev/null; then
    adduser --disabled-password --gecos "" $APP_USER
fi

# Install npm dependencies
echo "Installing npm dependencies..."
npm install

# Install Playwright system dependencies
echo "Installing Playwright system dependencies..."
npx playwright install-deps

# Set up environment file
if [ ! -f ".env" ]; then
    echo "Setting up environment configuration..."
    read -p "MongoDB URI: " MONGODB_URI
    read -p "MongoDB Database: " MONGODB_DATABASE
    read -p "MongoDB Collection: " MONGODB_COLLECTION
    read -p "MongoDB Configs Collection: " MONGODB_COLLECTION_CONFIGS

    cat > .env << EOF
MONGODB_URI=$MONGODB_URI
MONGODB_DATABASE=$MONGODB_DATABASE
MONGODB_COLLECTION=$MONGODB_COLLECTION
MONGODB_COLLECTION_CONFIGS=$MONGODB_COLLECTION_CONFIGS
EOF
fi

# Build the project
echo "Building the project..."
npm run build

# Set permissions
chown -R $APP_USER:$APP_USER "$APP_DIR"
chmod +x dist/*.js 2>/dev/null || true

# Make cron script executable
if [ -f "scripts/cron-daily.sh" ]; then
    chmod +x scripts/cron-daily.sh
    chown $APP_USER:$APP_USER scripts/cron-daily.sh
fi

# Create log directory
mkdir -p /var/log/journo-crawler
chown $APP_USER:$APP_USER /var/log/journo-crawler
chmod 755 /var/log/journo-crawler

echo "Setup complete!"
echo "Application directory: $APP_DIR"
echo "Test with: npm run start:prod"
echo ""
echo "To set up daily cron job, run:"
echo "  sudo crontab -u $APP_USER -e"
echo "  Add: 0 2 * * * cd $APP_DIR && $APP_DIR/scripts/cron-daily.sh"
