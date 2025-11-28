FROM node:20.15-alpine AS base

# Install Chromium and dependencies
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
    && update-ms-fonts \
    && fc-cache -f 


# Set Chrome executable path
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy root package.json and lockfile
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
COPY patches ./patches
COPY prisma ./prisma

RUN npm install -g corepack@latest
RUN corepack enable pnpm && pnpm i

# Build the app
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

RUN npm install -g corepack@latest
RUN corepack enable pnpm && pnpm build && pnpm db:deploy

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
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# 复制 YJS 服务器代码和依赖
COPY --from=builder --chown=nextjs:nodejs /app/src ./src
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/tsconfig.json ./tsconfig.json

# 创建启动脚本
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'set -e' >> /app/start.sh && \
    echo 'echo "Starting YJS collaboration server..."' >> /app/start.sh && \
    echo 'node --import tsx/esm src/server/yjs/server.ts &' >> /app/start.sh && \
    echo 'echo "Starting Next.js application..."' >> /app/start.sh && \
    echo 'exec node server.js' >> /app/start.sh && \
    chmod +x /app/start.sh && \
    chown nextjs:nodejs /app/start.sh

USER nextjs

# 暴露 Next.js 端口和 YJS WebSocket 端口
EXPOSE 3000 4444

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 使用启动脚本同时启动 Next.js 和 YJS 服务器
CMD ["/app/start.sh"]