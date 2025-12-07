# apps/notes AGENTS.md

Collaborative note-taking and document editing application within the beep-effect monorepo.

## Overview

`@beep/notes` is a Next.js 15-based application that provides real-time collaborative document editing powered by Plate editor and YJS. It serves as a bridge between legacy Prisma-based architecture and the emerging Effect-based beep-effect ecosystem.

This application is **in active transition** from standalone patterns to full Effect integration. It currently operates in a hybrid mode, gradually adopting Effect patterns while maintaining Prisma, tRPC, and traditional React state management.

## Architecture Status

### Current (Hybrid) Stack

| Layer | Current Technology | Future Direction |
|-------|-------------------|------------------|
| **Database** | Prisma + PostgreSQL | Migrating to Drizzle (via `@beep/*-tables`) |
| **API** | tRPC + Hono | Migrating to `@effect/rpc` |
| **State** | Jotai, Zustand, React Query | Migrating to Effect state management |
| **Auth** | Custom Better Auth setup | Integrating `@beep/iam-infra` |
| **Files** | Custom Prisma models | Integrating `@beep/documents-infra` |

### Effect Integration Progress

The application **does** use these beep-effect packages:

- `@beep/utils` - Effect collection utilities (`debounce`, `omit`, `exact`, `defaultsDeep`, `merge`, `dedent`)
- `@beep/schema` - Effect Schema utilities (`BS` namespace)
- `@beep/ui` - Shared UI hooks (`useCopyToClipboard`)

The application **imports but may not fully integrate**:

- `@beep/constants`, `@beep/contract`, `@beep/errors`, `@beep/identity`, `@beep/invariant`, `@beep/mock`
- `@beep/iam-domain`, `@beep/iam-infra`, `@beep/iam-sdk`, `@beep/iam-tables`, `@beep/iam-ui`
- `@beep/documents-domain`, `@beep/documents-infra`, `@beep/documents-sdk`, `@beep/documents-tables`, `@beep/documents-ui`
- `@beep/shared-domain`, `@beep/shared-tables`
- `@beep/runtime-client`, `@beep/runtime-server`
- `@beep/ui-core` - Design tokens and MUI configuration

## Application Structure

```
apps/notes/
├── src/
│   ├── app/                      # Next.js 15 App Router
│   │   ├── (dev)/               # Development-only routes
│   │   ├── (dynamic)/           # Main application routes
│   │   │   ├── (main)/          # Main layout wrapper
│   │   │   │   ├── (auth)/      # Auth flows (sign-in, sign-up)
│   │   │   │   └── (protected)/ # Protected app routes
│   │   ├── api/                 # Next.js API routes (tRPC handler, auth callbacks)
│   │   ├── editor/              # Document editor page
│   │   ├── globals.css          # Global styles
│   │   └── layout.tsx           # Root layout
│   ├── components/              # React components
│   │   ├── auth/                # Authentication components & hooks
│   │   ├── editor/              # Editor-specific components
│   │   ├── context-panel/       # Document context sidebar
│   │   ├── navbar/              # Navigation bar components
│   │   ├── settings/            # Settings UI
│   │   ├── sidebar/             # Document list sidebar
│   │   └── ui/                  # Reusable UI components
│   ├── registry/                # Plate editor component registry
│   │   ├── app/                 # Application editor configuration
│   │   ├── components/          # Plate editor plugin components
│   │   ├── ui/                  # Editor UI primitives
│   │   ├── lib/                 # Editor utilities
│   │   ├── hooks/               # Editor hooks
│   │   └── examples/            # Editor examples
│   ├── server/                  # Backend services
│   │   ├── api/                 # tRPC API layer
│   │   │   ├── routers/         # API route definitions
│   │   │   ├── middlewares/     # Auth, rate limiting, logging
│   │   │   └── trpc.ts          # tRPC configuration
│   │   ├── hono/                # Hono API layer (AI, export)
│   │   │   ├── routes/          # HTTP routes
│   │   │   └── middlewares/     # Request processing
│   │   ├── auth/                # Authentication logic
│   │   │   ├── providers/       # OAuth providers (GitHub, Google)
│   │   │   ├── lucia.ts         # Lucia auth config
│   │   │   └── session-cookie.ts
│   │   ├── yjs/                 # YJS collaboration server
│   │   │   ├── server.ts        # Hocuspocus WebSocket server
│   │   │   ├── auth.ts          # YJS authentication
│   │   │   └── document.ts      # Document persistence
│   │   ├── db.ts                # Prisma client
│   │   ├── redis.ts             # Redis client
│   │   └── ratelimit.ts         # Rate limiting
│   ├── trpc/                    # tRPC client configuration
│   │   └── hooks/               # tRPC React hooks
│   ├── lib/                     # Utility functions
│   │   ├── navigation/          # Route definitions, metadata helpers
│   │   ├── date/                # Date utilities
│   │   ├── storage/             # Local storage helpers
│   │   └── url/                 # URL utilities
│   ├── hooks/                   # React hooks
│   ├── generated/               # Generated code
│   │   └── prisma/              # Prisma client types
│   ├── config.ts                # Application config
│   └── env.ts                   # Environment variables (T3 Env)
├── prisma/
│   ├── schema.prisma            # Prisma database schema
│   ├── migrations/              # Database migrations
│   ├── seed.ts                  # Database seeding
│   └── scripts/                 # Database scripts
├── public/                      # Static assets
├── tooling/                     # Build & automation scripts
│   └── scripts/                 # Custom scripts (sync-plate, vendor, etc.)
├── test/                        # Test files
├── package.json                 # Package manifest
├── tsconfig.json                # TypeScript config
├── next.config.ts               # Next.js config
├── docker-compose.yml           # Local services (Postgres, Redis)
└── Dockerfile                   # Production container
```

## Key Features

### Real-time Collaboration

- **YJS Integration**: Conflict-free replicated data type (CRDT) for collaborative editing
- **Hocuspocus Server**: WebSocket server (`src/server/yjs/server.ts`) for YJS synchronization
- **Redis Persistence**: Document state cached in Redis for fast access
- **Database Snapshots**: Periodic snapshots saved to PostgreSQL

### Rich Text Editor

- **Plate Editor**: Highly extensible React rich text editor
- **Plugin System**: Extensive plugin library in `src/registry/components/`
  - Basic nodes: paragraphs, headings, lists, blockquotes
  - Formatting: bold, italic, underline, strikethrough, code
  - Advanced: tables, callouts, code blocks, math equations
  - Media: images, videos, embeds
  - Collaboration: comments, mentions, suggestions
  - AI: AI-powered content generation
  - Layout: columns, toggles, tabs

### Authentication

- **Better Auth**: OAuth-based authentication
- **Providers**: GitHub, Google (configurable in `src/server/auth/providers/`)
- **Session Management**: Lucia-based sessions with Redis storage
- **Authorization**: Role-based middleware in tRPC and Hono

### API Layers

#### tRPC API (`src/server/api/`)

Primary API layer for client-server communication:

```typescript
// Example usage in components
import { api } from "@beep/notes/trpc/react";

const { data: document } = api.document.getById.useQuery({ id: "..." });
const createDoc = api.document.create.useMutation();
```

**Routers**:
- `document.ts` - Document CRUD operations
- `file.ts` - File attachment handling
- `user.ts` - User profile management
- `comment.ts` - Comment system
- `version.ts` - Version history
- `layout.ts` - Layout preferences

#### Hono API (`src/server/hono/`)

Secondary API layer for streaming and special endpoints:

**Routes**:
- `ai.ts` - AI-powered content generation (streaming)
- `auth.ts` - Authentication endpoints
- `export.ts` - Document export (PDF, DOCX)
- `prompts.ts` - AI prompt management

### Database Schema (Prisma)

Located at `prisma/schema.prisma`:

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  username      String    @unique
  image         String?
  role          UserRole  @default(USER)
  documents     Document[]
  oauthAccounts OauthAccount[]
  sessions      Session[]
  // ... more fields
}

model Document {
  id          String    @id @default(cuid())
  title       String
  content     Json?
  ownerId     String
  owner       User      @relation(...)
  files       File[]
  versions    Version[]
  yjsSnapshots YjsSnapshot[]
  // ... more fields
}

model YjsSnapshot {
  id          String   @id @default(cuid())
  documentId  String
  document    Document @relation(...)
  snapshot    Bytes
  createdAt   DateTime @default(now())
}

// Also: Session, OauthAccount, File, Version, Comment
```

## Dependencies on beep-effect Packages

### Actively Used

#### `@beep/utils`

Provides Effect-based collection and data utilities:

```typescript
import { debounce } from "@beep/utils";
import { omit, defaultsDeep, cloneDeep } from "@beep/utils/data/object.utils";
import { merge } from "@beep/utils/data/record.utils";
import { exact } from "@beep/utils/struct";
import { dedent } from "@beep/utils";
```

**Common use cases**:
- `debounce` - Debouncing editor changes
- `omit`, `defaultsDeep`, `merge` - Object manipulation in API handlers
- `exact` - Type-safe object validation
- `dedent` - Template string formatting for AI prompts

#### `@beep/schema`

Effect Schema utilities (limited usage):

```typescript
import { BS } from "@beep/schema";
```

Currently used sparingly; expected to increase as migration progresses.

#### `@beep/ui`

Shared UI component hooks:

```typescript
import { useCopyToClipboard } from "@beep/ui/hooks/use-copy-to-clipboard";
```

Used in code blocks and share functionality.

### Imported But Not Fully Integrated

These packages are listed in `package.json` but are not yet deeply integrated into the codebase. They represent **future migration targets**:

#### IAM Layer

- `@beep/iam-domain` - IAM entity models (planned integration)
- `@beep/iam-infra` - Better Auth integration (planned migration)
- `@beep/iam-sdk` - Auth contracts (planned migration)
- `@beep/iam-tables` - IAM Drizzle schemas (planned migration)
- `@beep/iam-ui` - Auth UI components (planned migration)

**Current state**: Application has custom Better Auth setup. Plan is to migrate to `@beep/iam-infra`.

#### Documents Layer

- `@beep/documents-domain` - Files domain logic (planned integration)
- `@beep/documents-infra` - DocumentsDb, S3 storage (planned migration)
- `@beep/documents-sdk` - Documents client contracts (planned migration)
- `@beep/documents-tables` - Documents Drizzle schemas (planned migration)
- `@beep/documents-ui` - Documents React components (planned migration)

**Current state**: Application has custom Prisma models for documents and files. Plan is to migrate to `@beep/documents-infra`.

#### Common Layer

- `@beep/constants` - Schema-backed enums (available)
- `@beep/contract` - Effect-first contract system (available)
- `@beep/errors` - Logging and telemetry (available)
- `@beep/identity` - Package identity (available)
- `@beep/invariant` - Assertion contracts (available)
- `@beep/mock` - Mock data for testing (available)

#### Shared Layer

- `@beep/shared-domain` - Cross-slice entities (available)
- `@beep/shared-tables` - Table factories (available)

#### Runtime Layer

- `@beep/runtime-client` - Client ManagedRuntime (available)
- `@beep/runtime-server` - Server ManagedRuntime (available)

#### UI Layer

- `@beep/ui-core` - Design tokens, MUI overrides (available)

## Environment Configuration

Uses `@t3-oss/env-nextjs` for type-safe environment variables (`src/env.ts`):

### Required Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/db?schema=public

# Redis (required for collaboration)
REDIS_HOST=localhost
REDIS_PORT=6379

# Authentication
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# YJS WebSocket Server
YJS_PORT=4444
YJS_HOST=0.0.0.0
NEXT_PUBLIC_YJS_URL=ws://localhost:4444/yjs
```

### Optional Services

```env
# OpenAI (for AI features)
OPENAI_API_KEY=your_openai_api_key

# UploadThing (for file uploads)
UPLOADTHING_TOKEN=your_uploadthing_token

# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

## Development Workflow

### Getting Started

From monorepo root:

```bash
# Install dependencies
bun install

# Start infrastructure (Postgres, Redis)
bun run services:up

# Navigate to notes app
cd apps/notes

# Run database migrations
bun run migrate

# Start development servers
bun run dev
```

This runs three processes concurrently:
1. Next.js dev server (http://localhost:3000)
2. YJS WebSocket server (port 4444)
3. Docker services (Postgres, Redis)

### Available Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Start all dev servers (Next.js + YJS + Docker) |
| `bun run dev:app` | Start Next.js only |
| `bun run dev:yjs` | Start YJS server only |
| `bun run dev:db` | Start Docker services only |
| `bun run build` | Production build |
| `bun run start` | Start production servers |
| `bun run check` | Type check |
| `bun run lint` | Biome lint |
| `bun run lint:fix` | Auto-fix linting issues |
| `bun run test` | Run tests |
| `bun run migrate` | Run Prisma migrations |
| `bun run generate` | Generate Prisma client |
| `bun run push` | Push schema changes (dev) |
| `bun run studio` | Open Prisma Studio |
| `bun run seed` | Seed database |
| `bun run reset` | Reset database (destructive) |

### Database Workflow

```bash
# After editing prisma/schema.prisma:
bun run generate        # Regenerate Prisma client types
bun run migrate         # Create and apply migration

# Quick development cycle (skips migrations):
bun run push            # Push schema directly to DB

# Explore data:
bun run studio          # Opens Prisma Studio in browser
```

## Integration Points

### With Other Apps

- **apps/web** - Potential shared component library (future)
- **apps/server** - Future API integration (Effect RPC)

### With Packages

Currently minimal integration. Future integration targets:

1. **Authentication**: Migrate to `@beep/iam-infra` for unified auth
2. **Documents**: Migrate to `@beep/documents-infra` for file handling
3. **Database**: Migrate from Prisma to Drizzle via `@beep/*-tables`
4. **API**: Migrate from tRPC to `@effect/rpc` via `@beep/*-sdk`
5. **Runtime**: Adopt `@beep/runtime-server` and `@beep/runtime-client`

## Migration Roadmap

### Phase 1: Utilities & UI (Current)

- Use `@beep/utils` for data manipulation
- Use `@beep/ui` for shared hooks
- Use `@beep/ui-core` for theming

### Phase 2: Schema & Validation

- Replace Zod schemas with `@beep/schema` (Effect Schema)
- Adopt `@beep/invariant` for assertions
- Use `@beep/constants` for enums

### Phase 3: Database Layer

- Migrate Prisma models to Drizzle
- Adopt table factories from `@beep/shared-tables`
- Integrate `@beep/documents-tables` for document schemas

### Phase 4: Infrastructure

- Replace custom Better Auth setup with `@beep/iam-infra`
- Migrate file storage to `@beep/documents-infra`
- Adopt `@beep/runtime-server` and `@beep/runtime-client`

### Phase 5: API Layer

- Replace tRPC with `@effect/rpc`
- Adopt contract-based APIs from `@beep/*-sdk` packages
- Migrate to Effect-based request handlers

## Important Notes

### Non-Effect Code Warning

This application **does not** strictly follow Effect patterns yet. When working in this codebase:

- **Async/await is common** - Not all code uses `Effect.gen`
- **Promises are used** - Not all async operations are Effects
- **Native array methods exist** - Not all code uses `A.map`, `A.filter`, etc.
- **Traditional React patterns** - useState, useEffect are prevalent

### Gradual Migration Strategy

When making changes:

1. **New code**: Use Effect patterns from the start
2. **Refactoring**: Opportunistically convert to Effect patterns
3. **Legacy code**: Leave as-is unless actively updating
4. **Dependencies**: Prefer `@beep/*` packages over external alternatives

### Testing

Limited test coverage currently. Tests live in `test/` directory. Uses Bun's built-in test runner.

## Common Patterns

### API Route Creation (tRPC)

```typescript
// src/server/api/routers/example.ts
import { z } from "zod";
import { loggedInProcedure } from "../middlewares/procedures";

export const exampleRouter = {
  getById: loggedInProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      return ctx.prisma.example.findUnique({
        where: { id: input.id },
      });
    }),
};
```

### Client-side Usage

```typescript
// In a React component
import { api } from "@beep/notes/trpc/react";

function MyComponent() {
  const { data, isLoading } = api.example.getById.useQuery({ id: "123" });
  const mutation = api.example.create.useMutation();

  // ...
}
```

### YJS Document Access

```typescript
// src/server/yjs/document.ts handles persistence
// Frontend uses @platejs/yjs for editor integration
import { withYjs } from "@platejs/yjs";

const editor = createPlateEditor({
  plugins: [
    // ... other plugins
    withYjs,
  ],
});
```

## Production Deployment

### Docker

```bash
# Build production image
docker build -t beep-notes .

# Run with docker-compose
docker compose -f docker-compose.yml up
```

### Environment

Set `NODE_ENV=production` and configure:

```env
DATABASE_URL=postgresql://user:password@postgres:5432/db
REDIS_HOST=redis
NEXT_PUBLIC_YJS_URL=wss://your-domain.com/yjs
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### Build Process

```bash
bun run build          # Next.js production build
bun run deploy         # Deploy Prisma migrations
bun run start          # Start production servers
```

## Troubleshooting

### YJS Server Not Connecting

- Check `NEXT_PUBLIC_YJS_URL` matches YJS server host
- Ensure Redis is running (`bun run dev:db`)
- Verify WebSocket port is not blocked

### Prisma Client Out of Sync

```bash
bun run generate       # Regenerate Prisma client
```

### Database Migration Issues

```bash
bun run reset          # Nuclear option: reset entire DB
```

### Module Resolution Issues

This package uses custom path aliases in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@beep/notes/*": ["./src/*"]
    }
  }
}
```

If imports fail, ensure you're using the correct alias format.

## Future Directions

This application represents a **reference implementation** for migrating legacy Next.js apps to Effect architecture. Key learnings:

1. **Incremental migration is feasible** - Start with utilities, move to infrastructure
2. **Hybrid mode is acceptable** - Don't block on full Effect adoption
3. **Effect RPC is the target** - tRPC serves as temporary bridge
4. **Drizzle migration is valuable** - Type safety and Effect integration
5. **Runtime layers unlock observability** - `@beep/runtime-*` packages provide instrumentation

## Related Documentation

- `/home/elpresidank/YeeBois/projects/beep-effect/README.md` - Monorepo overview
- `/home/elpresidank/YeeBois/projects/beep-effect/AGENTS.md` - Root agent guide
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/iam/infra/AGENTS.md` - IAM infrastructure
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/documents/infra/AGENTS.md` - Documents infrastructure
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/runtime/server/AGENTS.md` - Server runtime
