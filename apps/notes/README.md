# @beep/notes

Collaborative note-taking and document editing application built with Next.js 15, Effect, and Plate editor.

## Overview

`@beep/notes` is a full-featured document editing application within the beep-effect monorepo. It provides real-time collaborative editing capabilities powered by YJS, rich text editing via Plate, and integrates with the beep-effect IAM and documents infrastructure layers.

## Features

- **Rich Text Editing**: Powered by [Plate](https://platejs.org/) with extensive plugin support
- **Real-time Collaboration**: YJS-based collaborative editing with Hocuspocus WebSocket server
- **Authentication**: Better Auth integration via `@beep/iam-*` packages
- **File Management**: Document storage and versioning via `@beep/documents-*` packages
- **AI Integration**: OpenAI-powered features for content generation
- **Multi-database**: PostgreSQL (via Prisma) + Redis for caching and collaboration state

## Architecture

### Application Structure

```
apps/notes/
├── src/
│   ├── app/                    # Next.js 15 App Router
│   │   ├── (dev)/             # Development routes
│   │   ├── (dynamic)/         # Main app routes
│   │   │   ├── (main)/        # Main app layout
│   │   │   │   ├── (auth)/    # Authentication flows
│   │   │   │   └── (protected)/ # Protected routes
│   │   ├── api/               # Next.js API routes
│   │   └── editor/            # Editor page
│   ├── components/            # React components
│   │   ├── auth/              # Auth components & hooks
│   │   ├── editor/            # Editor-specific components
│   │   ├── context-panel/     # Document context panel
│   │   ├── navbar/            # Navigation components
│   │   ├── settings/          # Settings UI
│   │   └── ui/                # Reusable UI components
│   ├── registry/              # Plate editor registry
│   │   ├── app/               # App-specific editor config
│   │   ├── components/        # Editor components
│   │   ├── ui/                # Editor UI primitives
│   │   └── lib/               # Editor utilities
│   ├── server/                # Backend services
│   │   ├── api/               # tRPC API layer
│   │   ├── hono/              # Hono API layer
│   │   ├── auth/              # Better Auth configuration
│   │   ├── yjs/               # YJS collaboration server
│   │   ├── db.ts              # Prisma client
│   │   ├── redis.ts           # Redis client
│   │   └── ratelimit.ts       # Rate limiting
│   ├── trpc/                  # tRPC client configuration
│   ├── lib/                   # Utilities
│   └── env.ts                 # Environment variables
├── prisma/
│   ├── schema.prisma          # Prisma schema
│   ├── migrations/            # Database migrations
│   └── seed.ts                # Database seeding
├── public/                    # Static assets
└── tooling/                   # Build scripts
```

### Technology Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | Next.js 15, React 19, Plate Editor, TanStack Query |
| **State Management** | Jotai, Zustand, React Query |
| **Backend** | tRPC, Hono, Better Auth |
| **Database** | PostgreSQL (Prisma), Redis (ioredis) |
| **Collaboration** | YJS, Hocuspocus |
| **AI** | Vercel AI SDK, OpenAI |
| **File Upload** | UploadThing |
| **Styling** | TailwindCSS, Material-UI, Radix UI |
| **Effect Integration** | `@beep/*` workspace packages |

### Dependencies on beep-effect Packages

This application integrates with the following beep-effect workspace packages:

#### Common Layer
- `@beep/constants` - Schema-backed enums and constants
- `@beep/contract` - Effect-first contract system
- `@beep/errors` - Logging and telemetry
- `@beep/identity` - Package identity
- `@beep/invariant` - Assertion contracts
- `@beep/mock` - Mock data for testing
- `@beep/schema` - Effect Schema utilities
- `@beep/utils` - Pure runtime helpers

#### IAM Layer
- `@beep/iam-domain` - IAM entity models
- `@beep/iam-infra` - Better Auth integration
- `@beep/iam-sdk` - Auth contracts
- `@beep/iam-tables` - IAM Drizzle schemas
- `@beep/iam-ui` - Auth UI components

#### Documents Layer
- `@beep/documents-domain` - Files domain logic
- `@beep/documents-infra` - DocumentsDb, repos, S3 storage
- `@beep/documents-sdk` - Documents client contracts
- `@beep/documents-tables` - Documents Drizzle schemas
- `@beep/documents-ui` - Documents React components

#### Shared Layer
- `@beep/shared-domain` - Cross-slice entities
- `@beep/shared-tables` - Table factories

#### Runtime Layer
- `@beep/runtime-client` - Client ManagedRuntime
- `@beep/runtime-server` - Server ManagedRuntime

#### UI Layer
- `@beep/ui-core` - Design tokens, MUI overrides
- `@beep/ui` - Component library

## Development Setup

### Prerequisites

- Bun 1.3.x or Node.js 22+
- Docker Desktop (for PostgreSQL and Redis)
- GitHub OAuth App credentials
- OpenAI API key (optional, for AI features)
- UploadThing account (optional, for file uploads)

### Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Configure the following variables in `.env.local`:

#### Database & Redis

```dotenv
# PostgreSQL
DATABASE_URL=postgresql://admin:password@localhost:5432/db?schema=public
POSTGRES_USER=admin
POSTGRES_PASSWORD=password
POSTGRES_DB=db

# Redis (required for collaboration)
REDIS_HOST=localhost
REDIS_PORT=6379
```

#### Authentication

Create a [GitHub OAuth App](https://github.com/settings/developers):

- **Homepage URL**: `http://localhost:3000`
- **Callback URL**: `http://localhost:3000/api/auth/github/callback`

```dotenv
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

#### YJS Collaboration Server

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

#### Optional Services

```dotenv
# OpenAI (for AI features)
OPENAI_API_KEY=your_openai_api_key

# UploadThing (for file uploads)
UPLOADTHING_TOKEN=your_uploadthing_token

# Google Analytics (optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Installation & Running

From the **monorepo root**:

```bash
# Install dependencies
bun install

# Start infrastructure services
bun run services:up

# Run database migrations
cd apps/notes
bun run migrate

# Start development servers
bun run dev
```

This starts:
- Next.js app on `http://localhost:3000`
- YJS WebSocket server on port `4444`
- Docker services (PostgreSQL & Redis)

### Available Scripts

Run from `apps/notes/`:

| Command | Description |
|---------|-------------|
| `bun run dev` | Start all dev servers (Next.js + YJS + Docker) |
| `bun run dev:app` | Start Next.js only |
| `bun run dev:yjs` | Start YJS server only |
| `bun run dev:db` | Start Docker services only |
| `bun run build` | Production build |
| `bun run start` | Start production servers |
| `bun run check` | Type check |
| `bun run lint` | Lint code |
| `bun run lint:fix` | Fix linting issues |
| `bun run test` | Run tests |
| `bun run migrate` | Run database migrations |
| `bun run push` | Push schema changes |
| `bun run studio` | Open Prisma Studio |
| `bun run seed` | Seed database |

## Database Management

### Prisma Workflow

```bash
# Generate Prisma client
bun run generate

# Create a migration
bun run migrate

# Push schema changes (development)
bun run push

# Open Prisma Studio
bun run studio

# Reset database (destructive)
bun run reset

# Deploy migrations (production)
bun run deploy
```

### Schema Location

The Prisma schema is located at `prisma/schema.prisma` and includes:

- `User` - User accounts
- `Session` - User sessions
- `OauthAccount` - OAuth provider accounts
- `Document` - Documents and notes
- `File` - File attachments
- `Version` - Document version history
- `YjsSnapshot` - YJS collaboration snapshots

## Real-time Collaboration

The YJS collaboration server (`src/server/yjs/`) provides real-time collaborative editing:

- **Hocuspocus Server**: WebSocket server for YJS synchronization
- **Redis Persistence**: Document state persisted to Redis
- **Database Sync**: Periodic snapshots saved to PostgreSQL
- **Authentication**: Session-based access control

## API Layers

### tRPC API

Located in `src/server/api/`:

- `routers/` - API route definitions
- `middlewares/` - Auth, logging, rate limiting
- `trpc.ts` - tRPC configuration

Client usage via hooks in `src/trpc/hooks/`.

### Hono API

Located in `src/server/hono/`:

- `routes/` - HTTP route definitions
- `middlewares/` - Request processing
- `hono-client.ts` - Type-safe client

## Editor Architecture

The editor is built on [Plate](https://platejs.org/) with extensive customization:

### Plugin Categories

- **Basic Nodes**: Paragraphs, headings, lists
- **Formatting**: Bold, italic, underline, code
- **Advanced**: Tables, callouts, code blocks, math equations
- **Media**: Images, videos, embeds
- **Collaboration**: Comments, mentions, suggestions
- **AI**: AI-powered content generation
- **Layout**: Columns, toggles, tabs

### Registry Structure

The `src/registry/` directory contains:

- **components/**: Plate editor components
- **ui/**: UI primitives for the editor
- **lib/**: Editor utilities and configurations
- **app/**: Application-specific editor setup

## Deployment

### Docker Deployment

The included `Dockerfile` provides a production-ready container:

```bash
# Build image
docker build -t beep-notes .

# Run container
docker compose up
```

### Required Services

1. **PostgreSQL** - Primary database
2. **Redis** - Collaboration state and caching
3. **Next.js App** - Application server (includes YJS server)

### Environment Configuration

Set `NEXT_PUBLIC_ENVIRONMENT=production` and configure:

```dotenv
# Database
DATABASE_URL=postgresql://user:password@postgres:5432/db?schema=public

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# YJS WebSocket
NEXT_PUBLIC_YJS_URL=wss://your-domain.com/yjs

# Site URL
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### Build Commands

```bash
# Build
bun run build

# Deploy migrations
bun run deploy

# Start production servers
bun run start
```

## Testing

```bash
# Run all tests
bun run test

# Type checking
bun run check
bun run typecheck
```

## Integration with beep-effect

While this application uses Prisma for its primary database layer, it integrates with the beep-effect ecosystem through:

1. **IAM Integration**: Uses `@beep/iam-*` packages for authentication flows
2. **Document Management**: Leverages `@beep/documents-*` for file handling
3. **Shared UI**: Consumes `@beep/ui` and `@beep/ui-core` components
4. **Runtime Layers**: Uses `@beep/runtime-client` and `@beep/runtime-server`
5. **Utilities**: Effect utilities from `@beep/utils` and `@beep/schema`

## Migration Notes

This application is in transition from a standalone Prisma-based architecture to the beep-effect Effect-based architecture. Current hybrid approach:

- **Database**: Prisma (legacy) + Drizzle schemas from `@beep/*` packages
- **State**: Jotai/Zustand (legacy) + Effect state management (transitioning)
- **API**: tRPC/Hono (legacy) + Effect RPC (future)

## License

Private - Part of the beep-effect monorepo.
