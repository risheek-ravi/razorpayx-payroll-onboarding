# Dockerfile for deploying to Fly.io, DigitalOcean, or any container platform

FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN yarn build

# Expose port
EXPOSE 3001

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["node", "dist/index.js"]

