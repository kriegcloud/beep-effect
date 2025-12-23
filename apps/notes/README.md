# @beep/notes

Collaborative note-taking and document editing application built with Next.js 15, Plate editor, and YJS real-time collaboration.

## Purpose

`@beep/notes` is a full-stack collaborative document editing application that demonstrates incremental migration from traditional Next.js patterns to Effect-based architecture. It provides:

- **Real-time Collaboration**: YJS CRDT with Hocuspocus WebSocket server and Redis persistence
- **Rich Text Editing**: Plate editor with 50+ plugins (tables, callouts, code blocks, AI, media)
- **Hybrid Architecture**: Combines Prisma database layer with Effect utilities from beep-effect packages
- **Reference Implementation**: Showcases how to adopt Effect patterns incrementally while maintaining production stability

This application operates in **transition mode**, serving as a practical example of gradual Effect adoption in an existing Next.js codebase. It actively uses `@beep/utils`, `@beep/schema`, `@beep/ui`, and `@beep/types`, with planned migration to IAM and Documents infrastructure packages.

## Installation

This application is part of the beep-effect monorepo. It is not published as a standalone package.

```bash
# From monorepo root
bun install

# Navigate to notes app
cd apps/notes
```

## Key Features

| Feature | Implementation |
|---------|---------------|
| **Rich Text Editing** | Plate editor with 50+ plugins for tables, callouts, code blocks, math, media |
| **Real-time Collaboration** | YJS CRDT + Hocuspocus WebSocket server with Redis persistence |
| **Authentication** | Better Auth with OAuth providers (GitHub, Google) + Lucia sessions |
| **Database** | PostgreSQL via Prisma (migrating to Drizzle) |
| **API Layers** | tRPC for type-safe queries, Hono for streaming/AI endpoints |
| **File Management** | UploadThing integration for attachments |
| **AI Integration** | Vercel AI SDK + OpenAI for content generation |
| **State Management** | Jotai, Zustand, TanStack Query (migrating to Effect) |
| **Styling** | TailwindCSS + Material-UI + Radix UI components |

## Key Exports

This application does not export packages for consumption by other apps. Instead, it **consumes** packages from the beep-effect monorepo:

| Package | Usage |
|---------|-------|
| `@beep/utils` | Effect collection utilities (`debounce`, `omit`, `merge`, `exact`) |
| `@beep/schema` | Effect Schema utilities (`BS` namespace) |
| `@beep/ui` | Shared UI hooks (`useCopyToClipboard`) |
| `@beep/types` | TypeScript utility types (`UnsafeTypes`) |
| `@beep/*-domain` | Planned integration for IAM and documents domain logic |
| `@beep/*-infra` | Planned migration target for auth and documents infrastructure |

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

| Category | Current Technology | Future Direction |
|----------|-------------------|------------------|
| **Frontend** | Next.js 15, React 19, Plate Editor | Continue |
| **State Management** | Jotai, Zustand, TanStack Query | Migrate to Effect state management |
| **Backend** | tRPC, Hono, Better Auth | Migrate to `@effect/rpc`, `@beep/iam-server` |
| **Database** | PostgreSQL (Prisma) | Migrate to Drizzle via `@beep/*-tables` |
| **Caching** | Redis (ioredis) | Continue with Effect wrappers |
| **Collaboration** | YJS, Hocuspocus, Redis | Continue |
| **AI** | Vercel AI SDK, OpenAI | Continue |
| **File Upload** | UploadThing | Migrate to `@beep/documents-server` |
| **Styling** | TailwindCSS, MUI, Radix UI | Continue with `@beep/ui-core` theming |
| **Effect Integration** | Limited (`@beep/utils`, `@beep/schema`) | Full adoption across all layers |

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
- `@beep/iam-server` - Better Auth integration
- `@beep/iam-client` - Auth contracts
- `@beep/iam-tables` - IAM Drizzle schemas
- `@beep/iam-ui` - Auth UI components

#### Documents Layer
- `@beep/documents-domain` - Files domain logic
- `@beep/documents-server` - DocumentsDb, repos, S3 storage
- `@beep/documents-client` - Documents client contracts
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

## Usage

### Basic Development Workflow

```bash
# From monorepo root
bun install
bun run services:up

# Navigate to notes app
cd apps/notes

# Run migrations
bun run migrate

# Start all dev servers (Next.js + YJS + Docker)
bun run dev
```

The application will be available at `http://localhost:3000`.

### Prerequisites

- **Bun 1.3.x** or Node.js 22+ (Bun recommended)
- **Docker Desktop** (for PostgreSQL and Redis services)
- **GitHub OAuth App** credentials ([Create one](https://github.com/settings/developers))
- **OpenAI API key** (optional, for AI-powered content generation)
- **UploadThing account** (optional, for file upload functionality)

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

### Working with the Application

#### Internal Path Aliases

This application uses internal path aliases for imports:

```typescript
// Import from within the app using @beep/notes/* alias
import { api } from "@beep/notes/trpc/react";
import { useSession } from "@beep/notes/components/auth/useSession";
import { cn } from "@beep/notes/lib/utils";
import { Button } from "@beep/notes/registry/ui/button";

// Import from workspace packages using @beep/* alias
import { debounce } from "@beep/utils";
import { BS } from "@beep/schema";
import type { UnsafeTypes } from "@beep/types";
```

#### tRPC API Usage

```typescript
"use client";
import { api } from "@beep/notes/trpc/react";

function DocumentList() {
  // Query documents
  const { data: documents } = api.document.list.useQuery();

  // Create document mutation
  const createDoc = api.document.create.useMutation({
    onSuccess: (doc) => {
      console.log("Created:", doc.id);
    },
  });

  return (
    <button onClick={() => createDoc.mutate({ title: "New Doc" })}>
      Create Document
    </button>
  );
}
```

#### YJS Collaboration Setup

The Plate editor is configured with YJS for real-time collaboration:

```typescript
import { withYjs } from "@platejs/yjs";
import { createPlateEditor } from "platejs";

const editor = createPlateEditor({
  plugins: [
    // ... other plugins
    withYjs,
  ],
});
```

Connection to Hocuspocus server is managed automatically via `NEXT_PUBLIC_YJS_URL`.

## Dependencies

### Active Workspace Dependencies

| Package | Purpose | Actual Usage |
|---------|---------|--------------|
| `@beep/types` | TypeScript utility types | `UnsafeTypes` type imported in 40+ files across components, hooks, and routers |
| `@beep/utils` | Effect collection and data manipulation utilities | `debounce`, `dedent`, `exact`, `omit`, `merge`, `defaultsDeep`, `cloneDeep` - used in API routers, hooks, and components |
| `@beep/schema` | Effect Schema utilities (`BS` namespace) | Schema validation in `src/server/api/routers/user.ts` |
| `@beep/ui` | Shared UI component hooks | `useCopyToClipboard` hook used in code blocks and share functionality (3 locations) |

### Planned Integration (Listed but Not Currently Used)

These packages are listed in `package.json` as dependencies but have **zero actual imports** in the codebase. They represent future migration targets:

| Layer | Packages | Current Alternative | Migration Priority |
|-------|----------|---------------------|-------------------|
| **IAM** | `@beep/iam-domain`, `@beep/iam-server`, `@beep/iam-client`, `@beep/iam-tables`, `@beep/iam-ui` | Custom Better Auth + Lucia sessions | High |
| **Documents** | `@beep/documents-domain`, `@beep/documents-server`, `@beep/documents-client`, `@beep/documents-tables`, `@beep/documents-ui` | Custom Prisma models + UploadThing | High |
| **Shared** | `@beep/shared-domain`, `@beep/shared-tables`, `@beep/shared-server`, `@beep/shared-client` | N/A | Medium |
| **Runtime** | `@beep/runtime-client`, `@beep/runtime-server` | Direct Effect usage, no managed runtime | Medium |
| **Common** | `@beep/constants`, `@beep/contract`, `@beep/errors`, `@beep/identity`, `@beep/invariant`, `@beep/mock` | Zod schemas, custom utilities | Low |

**Note**: These packages are included as `workspace:*` dependencies to ensure monorepo consistency and prepare for future integration, but they are not yet consumed by the application code.

## Integration

### With Other Monorepo Apps

- **apps/server**: Future integration via Effect RPC for unified API layer
- **apps/web**: Potential shared component library for consistent UI

### With Workspace Packages

This application serves as a **reference implementation** for gradually migrating a traditional Next.js app to Effect-based architecture:

1. **Current State**: Uses `@beep/utils` and `@beep/schema` for data utilities
2. **Next Steps**: Migrate authentication to `@beep/iam-server`, documents to `@beep/documents-server`
3. **Future State**: Full Effect adoption with `@effect/rpc`, Drizzle ORM, and Effect state management

### Database Schema (Prisma)

Located at `prisma/schema.prisma`:

```prisma
model User {
  id            String         @id
  username      String         @unique
  email         String?        @unique
  role          UserRole       @default(USER)
  sessions      Session[]
  oauthAccounts OauthAccount[]
  documents     Document[]
}

model Document {
  id           String        @id @default(cuid())
  title        String
  content      Json?
  ownerId      String
  owner        User          @relation(...)
  files        File[]
  versions     Version[]
  yjsSnapshots YjsSnapshot[]
}

model YjsSnapshot {
  id         String   @id @default(cuid())
  documentId String
  snapshot   Bytes
  createdAt  DateTime @default(now())
}

// Also: Session, OauthAccount, File, Version, Comment
```

## Development

### Available Scripts

Run from `apps/notes/` directory:

```bash
# Development
bun run dev              # Start all dev servers (Next.js + YJS + Docker)
bun run dev:app          # Start Next.js only
bun run dev:yjs          # Start YJS WebSocket server only
bun run dev:db           # Start Docker services (Postgres + Redis) only

# Type checking and linting
bun run check            # TypeScript type check
bun run lint             # Biome lint
bun run lint:fix         # Auto-fix linting issues

# Database
bun run generate         # Generate Prisma client types
bun run migrate          # Create and apply migration
bun run push             # Push schema directly to DB (dev)
bun run studio           # Open Prisma Studio in browser
bun run seed             # Seed database with test data
bun run reset            # Reset database (destructive)

# Building and testing
bun run build            # Production build
bun run start            # Start production servers
bun run test             # Run tests

# Deployment
bun run deploy           # Deploy Prisma migrations (production)
```

### Real-time Collaboration

The YJS collaboration server (`src/server/yjs/server.ts`) provides:

- **Hocuspocus Server**: WebSocket server for YJS CRDT synchronization
- **Redis Persistence**: Document state cached in Redis for fast access
- **Database Snapshots**: Periodic snapshots saved to PostgreSQL
- **Session Auth**: Access control via Better Auth sessions

### API Layers

#### tRPC API (`src/server/api/`)

Type-safe API layer for client-server communication:

**Available Routers**:
- `document.ts` - Document CRUD, archiving, version history
- `file.ts` - File attachment management
- `user.ts` - User profile operations
- `comment.ts` - Comment system (planned)
- `version.ts` - Document version control
- `layout.ts` - UI layout preferences

**Usage**:
```typescript
import { api } from "@beep/notes/trpc/react";

const { data } = api.document.getById.useQuery({ id: "..." });
const createMutation = api.document.create.useMutation();
```

#### Hono API (`src/server/hono/`)

Streaming and specialized endpoints:

**Available Routes**:
- `ai.ts` - AI-powered content generation (streaming)
- `auth.ts` - Authentication endpoints
- `export.ts` - Document export (PDF, DOCX)

### Editor Architecture

Built on [Plate](https://platejs.org/) with 50+ plugins:

**Plugin Categories** (`src/registry/components/`):
- **Basic**: Paragraphs, headings, lists, blockquotes
- **Formatting**: Bold, italic, underline, strikethrough, code
- **Advanced**: Tables, callouts, code blocks, math equations
- **Media**: Images, videos, embeds, file attachments
- **Collaboration**: Comments, mentions, suggestions (via YJS)
- **AI**: AI-powered content generation and assistance
- **Layout**: Columns, toggles, tabs, accordions

**Registry Structure** (`src/registry/`):
- `components/` - Plate plugin implementations
- `ui/` - UI primitives (buttons, dropdowns, etc.)
- `lib/` - Editor utilities and helpers
- `hooks/` - Custom React hooks for editor
- `app/` - Application-specific editor configuration

## Notes

### Hybrid Architecture Considerations

This application is **actively migrating** from traditional Next.js patterns to Effect-based architecture:

#### Current Patterns (Legacy)
- **Async/await** is prevalent throughout the codebase
- **Native array methods** (`.map()`, `.filter()`) are common
- **Promises** are used instead of Effects
- **useState/useEffect** for React state management
- **Prisma** for database operations
- **tRPC** for API layer

#### Effect Adoption Guidelines

When working in this codebase:

1. **New Code**: Write using Effect patterns from the start
   ```typescript
   // Prefer Effect.gen
   const program = Effect.gen(function* () {
     const result = yield* someEffect;
     return result;
   });

   // Use Effect Array utilities
   import * as A from "effect/Array";
   F.pipe(items, A.map(fn));
   ```

2. **Refactoring**: Opportunistically convert to Effect patterns when modifying existing code

3. **Legacy Code**: Leave as-is unless actively updating that module

4. **Dependencies**: Prefer `@beep/*` packages over external alternatives when available

### Internal vs Workspace Imports

Be aware of the distinction:

```typescript
// Internal app imports (path alias: @beep/notes/*)
import { api } from "@beep/notes/trpc/react";
import { useSession } from "@beep/notes/components/auth/useSession";

// Workspace package imports (path alias: @beep/*)
import { debounce } from "@beep/utils";
import type { UnsafeTypes } from "@beep/types";
```

### Testing

Limited test coverage currently. Tests use Bun's built-in test runner:

```bash
bun run test
```

### Common Patterns

#### Creating a tRPC Procedure

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

#### Using in Components

```typescript
"use client";
import { api } from "@beep/notes/trpc/react";

function MyComponent() {
  const { data, isLoading } = api.example.getById.useQuery({ id: "123" });
  const mutation = api.example.create.useMutation();
  // ...
}
```

### Production Deployment

#### Docker

```bash
# Build production image
docker build -t beep-notes .

# Run with docker-compose
docker compose up
```

#### Environment Requirements

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@postgres:5432/db
REDIS_HOST=redis
NEXT_PUBLIC_YJS_URL=wss://your-domain.com/yjs
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

#### Build Process

```bash
bun run build         # Next.js production build
bun run deploy        # Deploy Prisma migrations
bun run start         # Start production servers (Next.js + YJS)
```

### Troubleshooting

**YJS Server Not Connecting**
- Check `NEXT_PUBLIC_YJS_URL` matches the YJS server host
- Ensure Redis is running
- Verify WebSocket port is accessible

**Prisma Client Out of Sync**
```bash
bun run generate      # Regenerate Prisma client
```

**Database Migration Issues**
```bash
bun run reset         # Reset entire database (destructive)
```

**Module Resolution Issues**

Check `tsconfig.json` for path aliases:
```json
{
  "compilerOptions": {
    "paths": {
      "@beep/notes/*": ["./src/*"]
    }
  }
}
```

## Related Documentation

- [Monorepo Root README](/home/elpresidank/YeeBois/projects/beep-effect/README.md) - Overview and setup
- [Root AGENTS.md](/home/elpresidank/YeeBois/projects/beep-effect/AGENTS.md) - Architecture and patterns
- [Notes AGENTS.md](/home/elpresidank/YeeBois/projects/beep-effect/apps/notes/AGENTS.md) - Detailed implementation guide
- [IAM Infrastructure](/home/elpresidank/YeeBois/projects/beep-effect/packages/iam/server/AGENTS.md) - Auth integration target
- [Documents Infrastructure](/home/elpresidank/YeeBois/projects/beep-effect/packages/documents/server/AGENTS.md) - Document management target

---

**Documentation Audit**: Last verified 2025-12-23. All package dependencies, import paths, usage statistics, and structural information verified against source code via automated analysis.
