# syntax=docker/dockerfile:1.7
# packages/@core-v2/Dockerfile
# Multi-stage build for Effect-TS entity extraction service

# Build arguments for OCI labels and metadata
ARG GIT_SHA=""
ARG BUILD_ID=""
ARG HEALTH_PATH=/health/live

# Stage 1: Build
FROM oven/bun:1.2.23-debian AS builder

# Disable telemetry and configure cache directory for stable cache keys
ENV BUN_INSTALL_CACHE_DIR=/root/.cache/bun
ENV BUN_CONFIG_NO_TELEMETRY=1

WORKDIR /app

# Copy workspace files
COPY package.json bun.lock ./
COPY packages/@core-v2/package.json ./packages/@core-v2/
COPY packages/web/package.json ./packages/web/
COPY tools/deploy/package.json ./tools/deploy/

# Install dependencies with BuildKit cache mount
RUN --mount=type=cache,target=/root/.cache/bun \
    bun install --frozen-lockfile

# Copy source
COPY packages/@core-v2/ ./packages/@core-v2/

# Copy ontologies
COPY ontologies/ ./ontologies/

# Build TypeScript
WORKDIR /app/packages/@core-v2
RUN bun run build

# Stage 2: Production
FROM oven/bun:1.2.23-debian

# Re-declare ARGs after FROM (they don't persist across stages)
ARG GIT_SHA=""
ARG BUILD_ID=""
ARG HEALTH_PATH=/health/live

WORKDIR /app

# Create non-root user first (so we can use --chown)
RUN groupadd -g 1001 nodejs && \
    useradd -m -u 1001 -g nodejs effect

# Copy built files and dependencies with proper ownership
COPY --from=builder --chown=effect:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=effect:nodejs /app/packages/@core-v2/dist/src ./dist
COPY --from=builder --chown=effect:nodejs /app/packages/@core-v2/package.json ./
COPY --from=builder --chown=effect:nodejs /app/ontologies ./ontologies

# Create writable directories for non-root user
RUN mkdir -p /app/output/cache /app/output/runs && \
    chown -R effect:nodejs /app/output

USER effect

# Health check with configurable path
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD bun -e "fetch('http://localhost:8080${HEALTH_PATH}').then(r => process.exit(r.ok ? 0 : 1))"

# Expose port
EXPOSE 8080

# Environment defaults
ENV NODE_ENV=production
ENV PORT=8080
ENV HEALTH_PATH=${HEALTH_PATH}
# Ontology path - absolute path to bundled ontology file
ENV ONTOLOGY_PATH=/app/ontologies/football/ontology_skos.ttl

# OCI Labels for image metadata
LABEL org.opencontainers.image.source="https://github.com/pooks/effect-ontology"
LABEL org.opencontainers.image.revision="${GIT_SHA}"
LABEL org.opencontainers.image.created=""
LABEL org.opencontainers.image.title="effect-ontology-core"
LABEL org.opencontainers.image.description="Effect-TS entity extraction service"

# Start server
CMD ["bun", "run", "dist/server.js"]
