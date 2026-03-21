FROM oven/bun:alpine AS base
RUN apk update && apk add --no-cache jq libc6-compat
WORKDIR /app

# Step 1: Install dependencies only when needed
FROM base AS pruner
WORKDIR /app
COPY --chown=node:node . .
RUN bun add turbo --global
RUN turbo prune server --docker

# Step 2: Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/full/ .

RUN bun install
RUN bun run build --filter=server...

# Step 3: Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 server
USER server

COPY --from=builder /app/apps/server/dist/index.js ./server/index.js
COPY --from=builder /app/apps/server/package.json ./server/package.json

EXPOSE 9000

CMD ["bun", "run", "./server/index.js"]