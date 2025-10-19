# React Native Wearable App Build
FROM node:20-alpine

WORKDIR /app

# Copy workspace files
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./

# Install pnpm and dependencies
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build wearable app
RUN pnpm run build -F cerebral-wearable

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "process.exit(0)" || exit 1

EXPOSE 8081

# Start app development server
CMD ["pnpm", "run", "dev", "-F", "cerebral-wearable"]
