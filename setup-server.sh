#!/bin/bash

set -e

# Configuration
APP_DIR="/opt/journo-crawler"
APP_USER="journo"
NODE_VERSION="20"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root (use sudo)"
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

# Install system dependencies for Playwright
echo "Installing system dependencies..."
apt install -y \
    libnss3 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libxss1 \
    libgtk-3-0 \
    fonts-liberation \
    libappindicator3-1 \
    xdg-utils

# Create application user
echo "Setting up application user..."
if ! id "$APP_USER" &>/dev/null; then
    adduser --disabled-password --gecos "" $APP_USER
fi

# Create application directory
echo "Setting up application directory..."
mkdir -p $APP_DIR

# Clone repository if not already present
if [ ! -d "$APP_DIR/.git" ]; then
    read -p "Enter your git repository URL: " REPO_URL
    if [ -n "$REPO_URL" ]; then
        cd /opt
        git clone $REPO_URL journo-crawler
    else
        echo "No repository URL provided. Please copy your files to $APP_DIR manually"
        echo "Press Enter when ready to continue..."
        read
    fi
fi

# Install npm dependencies
echo "Installing npm dependencies..."
cd $APP_DIR
npm install

# Set up environment file
if [ ! -f "$APP_DIR/.env" ]; then
    echo "Setting up environment configuration..."
    read -p "MongoDB URI: " MONGODB_URI
    read -p "MongoDB Database: " MONGODB_DATABASE
    read -p "MongoDB Collection: " MONGODB_COLLECTION
    read -p "MongoDB Configs Collection: " MONGODB_COLLECTION_CONFIGS

    cat > $APP_DIR/.env << EOF
MONGODB_URI=$MONGODB_URI
MONGODB_DATABASE=$MONGODB_DATABASE
MONGODB_COLLECTION=$MONGODB_COLLECTION
MONGODB_COLLECTION_CONFIGS=$MONGODB_COLLECTION_CONFIGS
EOF
fi

# Build the project
echo "Building the project..."
cd $APP_DIR
npm run build

# Set permissions
chown -R $APP_USER:$APP_USER $APP_DIR
chmod +x $APP_DIR/dist/*.js 2>/dev/null || true

# Make cron script executable
if [ -f "$APP_DIR/scripts/cron-daily.sh" ]; then
    chmod +x $APP_DIR/scripts/cron-daily.sh
    chown $APP_USER:$APP_USER $APP_DIR/scripts/cron-daily.sh
fi

# Create log directory
mkdir -p /var/log/journo-crawler
chown $APP_USER:$APP_USER /var/log/journo-crawler
chmod 755 /var/log/journo-crawler

echo "Setup complete!"
echo "Application directory: $APP_DIR"
echo "Test with: cd $APP_DIR && npm run start:prod"
echo ""
echo "To set up daily cron job, run:"
echo "  sudo crontab -u $APP_USER -e"
echo "  Add: 0 2 * * * $APP_DIR/scripts/cron-daily.sh"