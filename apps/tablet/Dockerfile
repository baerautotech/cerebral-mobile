# React Tablet Web App - Multi-stage Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy workspace files
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./

# Install pnpm and dependencies
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build tablet app
RUN pnpm run build -F cerebral-tablet

# Production image
FROM node:20-alpine

WORKDIR /app

# Install serve to run the app
RUN npm install -g serve

# Copy built files from builder
COPY --from=builder /app/apps/tablet/dist ./dist

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3001/index.html || exit 1

EXPOSE 3001

# Serve the app
CMD ["serve", "-s", "dist", "-p", "3001"]
