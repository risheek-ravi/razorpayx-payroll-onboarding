# Dockerfile for Railway deployment
# This file is at the project root and builds the backend

# Use Debian-based Node.js image (better OpenSSL compatibility than Alpine)
FROM node:20-bookworm-slim

# Install OpenSSL and other dependencies
RUN apt-get update -y && \
    apt-get install -y openssl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./
COPY backend/yarn.lock* ./

# Install dependencies
RUN npm ci --only=production

# Copy backend source code
COPY backend/ ./

# Generate Prisma client with correct binary target
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Expose port (Railway will override this)
EXPOSE 3001

# Set environment to production
ENV NODE_ENV=production

# Start the application with database initialization
CMD npx prisma db push --accept-data-loss && node dist/index.js

