# Build from monorepo root: docker build -f apps/notes/Dockerfile .
#
# Required build args:
#   --build-arg DATABASE_URL=postgresql://user:pass@host:5432/db
#
# Example:
#   docker build -f apps/notes/Dockerfile \
#     --build-arg DATABASE_URL="postgresql://admin:password@host.docker.internal:5432/db" \
#     -t beep-notes .

FROM oven/bun:1.2-alpine AS base

# Install Chromium and dependencies for Puppeteer
RUN apk add --no-cache \
    chromium \
    nss \
    harfbuzz \
    ca-certificates \
    font-inter \
    font-jetbrains-mono \
    font-noto-emoji \
    font-dejavu \
    ttf-liberation \
    ttf-opensans \
    font-noto \
    msttcorefonts-installer \
    fontconfig \
    nodejs \
    npm \
    && update-ms-fonts \
    && fc-cache -f

# Set Chrome executable path
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy entire monorepo for workspace resolution (catalog: dependencies require root package.json)
COPY . .

# Install all workspace dependencies with Bun
RUN bun install --frozen-lockfile

# Build the app (use Node.js for Next.js build due to worker_threads compatibility)
FROM base AS builder
WORKDIR /app

COPY --from=deps /app .

# Build-time environment variables
ARG DATABASE_URL
ARG NEXT_PUBLIC_SITE_URL="http://localhost:3000"
ARG NEXT_PUBLIC_YJS_URL="ws://localhost:4444/yjs"

ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL=${DATABASE_URL}
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV NEXT_PUBLIC_YJS_URL=${NEXT_PUBLIC_YJS_URL}

# Build the notes app using Node.js for better Next.js compatibility
WORKDIR /app/apps/notes
RUN node ../../node_modules/.bin/next build
# Note: db:deploy requires a running database, run separately after container starts
# RUN bun run db:deploy

# Run the app
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/apps/notes/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/notes/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/notes/public ./public

# Copy YJS server code and dependencies
COPY --from=builder --chown=nextjs:nodejs /app/apps/notes/src ./src
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/apps/notes/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/apps/notes/tsconfig.json ./tsconfig.json

# Create startup script using Bun
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'set -e' >> /app/start.sh && \
    echo 'echo "Starting YJS collaboration server..."' >> /app/start.sh && \
    echo 'bun run src/server/yjs/server.ts &' >> /app/start.sh && \
    echo 'echo "Starting Next.js application..."' >> /app/start.sh && \
    echo 'exec bun run server.js' >> /app/start.sh && \
    chmod +x /app/start.sh && \
    chown nextjs:nodejs /app/start.sh

USER nextjs

# Expose Next.js port and YJS WebSocket port
EXPOSE 3000 4444

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Use startup script to run both Next.js and YJS server
CMD ["/app/start.sh"]