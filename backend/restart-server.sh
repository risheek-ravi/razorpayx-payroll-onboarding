#!/bin/bash

# Backend Server Restart Script
# Run this after Prisma schema changes

set -e

echo "🔄 Restarting Backend Server..."
echo ""

# Navigate to backend directory
cd "$(dirname "$0")"

echo "📍 Current directory: $(pwd)"
echo ""

# Check if server is running
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⏹️  Stopping existing server on port 3001..."
    lsof -ti:3001 | xargs kill -9 2>/dev/null || true
    sleep 2
    echo "✅ Server stopped"
    echo ""
fi

# Regenerate Prisma client (just to be sure)
echo "🔧 Regenerating Prisma client..."
npx prisma generate
echo ""

# Start the server
echo "🚀 Starting backend server..."
echo ""
yarn dev

