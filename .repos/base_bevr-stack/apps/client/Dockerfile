FROM oven/bun:alpine AS base
RUN apk update && apk add --no-cache jq libc6-compat
WORKDIR /app

# Step 1: Install dependencies only when needed
FROM base AS pruner
WORKDIR /app
COPY --chown=node:node . .
RUN bun add turbo --global
RUN turbo prune client --docker

# Step 2: Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

ARG SERVER_URL
ARG SERVER_HOST=localhost
ARG SERVER_PORT=9000
ENV VITE_SERVER_URL=${SERVER_URL:-http://${SERVER_HOST}:${SERVER_PORT}}


COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/full/ .

RUN bun install
RUN bun run build --filter=client...

# Step 3: Production image, copy all the files and run next
FROM nginx:mainline-alpine AS runner
WORKDIR /app

# Spawns command as a child process.
RUN apk update && apk add --no-cache tini

COPY --from=pruner /app/support/nginx-spa.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/client/dist ./

EXPOSE 80 443

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["nginx", "-g", "daemon off;"]