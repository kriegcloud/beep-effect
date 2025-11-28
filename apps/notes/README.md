# Todox

## Getting Started

### Environment Variables

Copy the example env file:

```bash
cp .env.example .env.local
```

### Database & Redis

Todox requires both PostgreSQL and Redis for:
- **PostgreSQL**: Main database
- **Redis**: Real-time collaboration and rate limiting

#### Local Docker Compose (Recommended for Development)

1. Launch Docker Desktop
2. The provided `docker-compose.yml` includes both PostgreSQL and Redis
3. Set the database environment variables:

```dotenv
DATABASE_URL=postgresql://admin:password@localhost:5432/db?schema=public
POSTGRES_USER=admin
POSTGRES_PASSWORD=password
POSTGRES_DB=db

# Redis (for collaboration)
REDIS_HOST=localhost
REDIS_PORT=6379
```

#### Remote Services

1. Remove `dev:db` script from the `scripts` in `package.json`.
2. Set the environment variables to your remote services:

```dotenv
DATABASE_URL=your_postgresql_url
REDIS_HOST=your_redis_host
REDIS_PORT=6379
```

### Authentication

Create a new [GitHub OAuth](https://github.com/settings/developers) app with the following settings:

- Application Name: `Todox Local`
- Homepage URL: `http://localhost:3000`
- Authorization callback URL: `http://localhost:3000/api/auth/github/callback`

Then set these environment variables:

- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`

### AI

For AI, create a new [OpenAI](https://platform.openai.com/api-keys) account and set:

- `OPENAI_API_KEY`

### File Uploads

For file uploads, create a new [UploadThing](https://uploadthing.com/) account and set:

- `UPLOADTHING_TOKEN`

### Real-time Collaboration (Optional)

For real-time collaborative editing, configure the WebSocket server:

```dotenv
# YJS WebSocket Server
YJS_PORT=4444
YJS_HOST=0.0.0.0
YJS_PATH=/yjs
YJS_TIMEOUT=10000
YJS_DEBOUNCE=2000
YJS_MAX_DEBOUNCE=10000

# Frontend WebSocket URL
NEXT_PUBLIC_YJS_URL=ws://localhost:4444/yjs
```

### Development

1. `pnpm install`
2. `pnpm dev` - This starts:
   - Next.js app on port 3000
   - YJS WebSocket server on port 4444
   - Docker services (PostgreSQL & Redis)
3. `pnpm migrate`: db migration in another terminal

## Deployment

Todox is deployed on [Coolify](https://coolify.io/) using a Dockerfile. You could deploy it anywhere you want (Vercel, Fly.io, etc.) without Docker.

### Required Services

Your deployment needs the following services:

1. **PostgreSQL** - Main database
2. **Redis** - Real-time collaboration and caching
3. **Next.js App** - The application (includes WebSocket server)

### Environment Variables

```dotenv
NEXT_PUBLIC_ENVIRONMENT=production
# Use your own domain
NEXT_PUBLIC_SITE_URL=https://app.todox.com

# Database
DATABASE_URL=postgresql://user:password@postgres:5432/db?schema=public

# Redis (important for collaboration)
REDIS_HOST=redis
REDIS_PORT=6379

# YJS WebSocket Server
YJS_PORT=4444
YJS_HOST=0.0.0.0
YJS_PATH=/yjs
YJS_TIMEOUT=10000
YJS_DEBOUNCE=2000
YJS_MAX_DEBOUNCE=10000

# Frontend WebSocket URL (adjust based on your domain)
NEXT_PUBLIC_YJS_URL=wss://your-domain.com/yjs
# Or if exposing port directly: ws://your-domain.com:4444/yjs
```

### Coolify Setup

#### Services Configuration

1. **PostgreSQL Service**
   - Type: PostgreSQL
   - Persistent storage: Enabled

2. **Redis Service** ⚠️ **Required**
   - Type: Redis 7-alpine
   - Persistent storage: Enabled
   - Service name: `redis` (important for networking)

3. **Application**
   - Build Pack: `Dockerfile`
   - Exposed Ports: `3000` (HTTP) and `4444` (WebSocket)

#### General Settings

- Direction: `Redirect to non-www.`

#### Build Settings

- Build Command: `pnpm build && pnpm db:deploy`
- Start Command: `pnpm start` (starts both Next.js and YJS server)

#### Advanced Settings

- `Enable Gzip Compression`: disabled

#### Environment Variables

- Set each environment variable with `Build Variable?` enabled.

#### Network Configuration

Ensure all services (PostgreSQL, Redis, App) are on the same Docker network.

#### WebSocket Proxy (if using Nginx/Traefik)

If you're proxying the WebSocket connection, ensure WebSocket upgrade headers are configured:

```nginx
location /yjs {
    proxy_pass http://app:4444;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
}
```

### CloudFlare DNS

- SSL/TLS: Full
- WebSocket: Enabled (orange cloud proxied)

## App Architecture

### Frontend

- Routes
  - [`app/`](src/app/) - Next.js 15+ App Router
  - [`app/(dynamic)/(main)/`](<src/app/(dynamic)/(main)/>) - Main app routes
  - [`app/(dynamic)/(public)/`](<src/app/(dynamic)/(public)/>) - Public routes
  - [`app/(dynamic)/(admin)/`](<src/app/(dynamic)/(admin)/>) - Admin routes
- Components
  - [`components/`](src/components/) - Application-wide components
  - [`components/hooks/`](src/components/hooks/) - Application-wide hooks
  - [`components/ui/`](src/components/ui/) - Reusable UI components
  - [`components/editor/`](src/components/editor/) - Editor components coupled to the application
  - [`registry/`](src/registry/) - Core editor components from [pro.todox.com](https://pro.todox.com/)
  - [`components/auth/`](src/components/auth/) - Auth components
- Configuration
  - [`env`](src/env.ts) - Environment variables
  - [`config`](src/config.ts) - App configuration
  - Client state with Jotai, including persistent storage (localStorage/cookies)
  - Server state with React Query ([tRPC](src/trpc/react.tsx), [Hono](src/server/hono/hono-client.ts))

### Backend

- API tRPC

  - [`server/api/`](src/server/api/) - Default API layer using tRPC
  - [`server/api/middlewares/`](src/server/api/middlewares/) - tRPC middlewares
  - [`server/api/routers/`](src/server/api/routers/) - tRPC routers
  - [`trpc/hooks.ts`](src/trpc/hooks.ts) - React query and mutation hooks

- API Hono

  - [`server/hono/`](src/server/hono/) - API layer using Hono
  - [`server/hono/middlewares/`](src/server/hono/middlewares/) - Hono middlewares
  - [`server/hono/routes/`](src/server/hono/routes/) - Hono routes

- Auth

  - [`server/auth/`](src/server/auth/) - Authentication system
  - [`server/auth/findOrCreateUser.ts`](src/server/auth/findOrCreateUser.ts) - User creation
  - [`server/auth/providers/github.ts`](src/server/auth/providers/github.ts) - GitHub OAuth

- Database
  - [`prisma/schema.prisma`](prisma/schema.prisma) - Prisma schema
  - [`server/db.ts`](src/server/db.ts) - Prisma with PostgreSQL
  - [`server/ratelimit.ts`](src/server/ratelimit.ts) - Rate limiting with Redis

- Real-time Collaboration
  - [`server/yjs/`](src/server/yjs/) - YJS collaboration server
  - [`server/yjs/server.ts`](src/server/yjs/server.ts) - Hocuspocus WebSocket server
  - [`server/yjs/auth.ts`](src/server/yjs/auth.ts) - Collaboration authentication
  - [`server/yjs/document.ts`](src/server/yjs/document.ts) - Document sync with database
