#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting deployment process..."

# Build the Next.js application
echo "📦 Building Next.js application..."
npm install
npm run build

# Create necessary directories
echo "📁 Creating necessary directories..."
sudo mkdir -p /var/www/todakureader.com

# Copy the application files
echo "📋 Copying application files..."
sudo cp -r .next package.json package-lock.json node_modules /var/www/todakureader.com/

# Copy Nginx configuration
echo "🔧 Setting up Nginx configuration..."
sudo cp todakureader.com.conf /etc/nginx/sites-available/
sudo ln -sf /etc/nginx/sites-available/todakureader.com.conf /etc/nginx/sites-enabled/

# Test Nginx configuration
echo "🔍 Testing Nginx configuration..."
sudo nginx -t

# Reload Nginx
echo "🔄 Reloading Nginx..."
sudo systemctl reload nginx

# Start the application with PM2
echo "🚀 Starting application with PM2..."
cd /var/www/todakureader.com
pm2 start ecosystem.config.js --env production
pm2 save

echo "✅ Deployment completed successfully!" 