# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

beep-effect is an Effect-first, vertical-slice monorepo designed to eliminate technical debt from the start. This is a production starter kit for launching SaaS ideas without rebuilding authentication, uploads, theming, and other common infrastructure from scratch every time.

## Tech Stack

- **Runtime**: Bun 1.3.2 (see `.bun-version`), Node 22 for compatibility
- **Language**: TypeScript (strict mode, see `tsconfig.base.jsonc`)
- **Core Framework**: Effect 3 with `@effect/platform` for dependency injection and effect-based programming
- **Database**: PostgreSQL + Drizzle ORM + `@effect/sql-pg`
- **Authentication**: better-auth (wrapped via Contract system)
- **Frontend**: React 19, Next.js 16, MUI, Tailwind, shadcn/ui, TanStack Query
- **State**: XState 5 for state machines
- **Monorepo**: Turborepo with Bun workspaces
- **Linting**: Biome (see `biome.jsonc`)
- **Testing**: Vitest
- **Infrastructure**: Docker Compose + dotenvx for environment management

## Essential Commands

### Development

```bash
bun install                          # Install dependencies
bun run bootstrap                    # Start Docker services + run migrations
bun run dev                          # Start all dev servers (orchestrated by Turbo)
bunx turbo run dev --filter=@beep/web  # Run specific package dev server
```

### Database Operations

```bash
bun run services:up                  # Start Docker services (Postgres, Redis, Jaeger)
bun run db:generate                  # Generate Drizzle migrations
bun run db:migrate                   # Run migrations
bun run db:push                      # Push schema changes to DB
bun run db:studio                    # Open Drizzle Studio
bun run db:exec                      # Connect to Postgres container shell
```

### Quality & Validation

```bash
bun run check                        # TypeScript type checking
bun run lint                         # Lint codebase (includes dependency sync check)
bun run lint:fix                     # Auto-fix lint issues
bun run lint:circular                # Check for circular dependencies
bun run test                         # Run tests
bun run coverage                     # Generate coverage report
bun run knip                         # Find unused dependencies and exports
```

### Build & Deploy

```bash
bun run build                        # Build all packages
bun run start                        # Start production build
```

### Utilities

```bash
bun run gen:beep-paths              # Generate typed asset paths from public/ directory
bun run iconify                      # Process icons
bun run gen:secrets                  # Generate environment secrets
```

## Architecture Principles

### Vertical Slice Architecture

Each feature slice lives in `packages/{slice-name}/*` with hexagonal layering:

- **domain/** — Entities, value objects, pure business logic (no side effects)
- **tables/** — Drizzle schema definitions, table factories
- **infra/** — Adapters (database, external APIs, storage)
- **sdk/** — Client-side services and contracts
- **ui/** — React components specific to this slice

Slices must import from other slices ONLY through `packages/shared/*`, `packages/common/*`, or `packages/core/*`.

### Effect-First Development

- All side effects are modeled as `Effect<Success, Error, Requirements>`
- Dependency injection via `Layer`s and `Context`
- No sneaky `Promise` or `async/await` in domain code
- Use Effect's built-in error handling, retries, and resource management

### Contract System

Third-party SDKs and APIs are wrapped via `@beep/contract`:

1. **Define contracts** with `Contract.make()` — specify payload, success, and failure schemas
2. **Group contracts** with `ContractKit.make()` to organize related operations
3. **Implement** with `.toLayer()` or `.liftService()` to get DI-friendly services
4. **Use in UI** with typed Effect-based APIs, no raw fetch responses

See `packages/iam/sdk/src/clients/passkey/` for a complete example.

### Slice-Scoped Database Clients

Instead of one God object that knows every table:

- Use `Db.make()` from `@beep/core-db` to create per-slice Drizzle clients
- Each slice defines its own `{Slice}Db` service that only knows about relevant tables
- TypeScript inference stays fast, IntelliSense stays responsive

Examples:
- `packages/iam/infra/src/db/Db/Db.ts`
- `packages/documents/infra/src/db/Db/Db.ts`
- `packages/tasks/infra/src/db/Db/Db.ts`

### Path Aliases (tsconfig.base.jsonc)

The repo uses strict path aliases. Never use relative imports across packages:

- `@beep/{slice}-domain` — domain layer of a slice
- `@beep/{slice}-infra` — infrastructure layer
- `@beep/{slice}-tables` — Drizzle tables
- `@beep/{slice}-sdk` — client SDKs
- `@beep/{slice}-ui` — UI components
- `@beep/shared-domain` — shared domain logic
- `@beep/shared-tables` — shared table factories
- `@beep/contract` — contract system
- `@beep/schema` — Effect Schema utilities
- `@beep/utils` — common utilities
- `@/*` — Next.js app (`apps/web/src/*`)

## Key Patterns & Utilities

### EntityId Factory

Use `EntityId` from `@beep/schema` to create branded ID types with both Effect Schema and Drizzle column builders:

```typescript
import { EntityId } from "@beep/schema";

export const UserId = EntityId.make("user__");
// Exports: .Schema, .uuid(), .text(), .make(), etc.
```

### PathBuilder (Typed Routes)

Never hardcode route strings. Use `PathBuilder` from `@beep/shared-domain/factories`:

```typescript
import { PathBuilder } from "@beep/shared-domain/factories";

const dashboard = PathBuilder.createRoot("/dashboard");
const user = dashboard.child("user");
const userProfile = user.child("profile");

const paths = PathBuilder.collection({
  user: {
    root: user.root,
    profile: userProfile.root,
  },
});

// Usage: paths.user.profile.root
```

### Asset Paths (Typed Public Files)

- Run `bun run gen:beep-paths` to generate typed accessors for `apps/web/public/`
- Import from `@beep/constants/paths/asset-paths`
- Access as `assetPaths.logos.windows` etc.

### Table Factories

- `Table.make()` from `@beep/shared-tables` — base factory with audit columns
- `OrgTable.make()` — extends Table.make with tenancy (`orgId`)
- `makeFields()` from `@beep/shared-domain/common` — compose audit fields for domain models

### String Literal Kits

Instead of scattered enums, use `stringLiteralKit` from `@beep/schema/kits`:

```typescript
import { stringLiteralKit } from "@beep/schema/kits";

const StatusKit = stringLiteralKit({
  literals: ["active", "pending", "archived"] as const,
  annotations: { identifier: "Status" },
});

// Exports: .Schema, .Enum, .Options, .Guard, etc.
```

### Upload Paths (Structured S3 Keys)

File keys follow deterministic structure via `UploadPath` from `@beep/shared-domain/entities/File`:

```
/env/tenants/{shard}/{orgType}/{orgId}/{entityKind}/{entityId}/{attribute}/{year}/{month}/{fileId}.{ext}
```

- `ShardPrefix` hashes `FileId` to avoid S3 hotspotting
- Bidirectional Schema transformations: encode payload → key, decode key → payload

## Monorepo Structure

```
beep-effect2/
├── apps/
│   ├── web/          # Next.js 16 App Router frontend
│   ├── server/       # Effect-based backend runtime
│   └── mcp/          # Model Context Protocol tooling
├── packages/
│   ├── ai/           # AI integrations
│   ├── common/       # Cross-slice foundations
│   │   ├── contract/ # Contract system (wraps third-party SDKs)
│   │   ├── schema/   # Effect Schema utilities
│   │   ├── utils/    # Common utilities
│   │   ├── types/    # Shared types
│   │   ├── errors/   # Error definitions
│   │   └── ...
│   ├── core/         # Core infrastructure
│   │   ├── db/       # Database client factory
│   │   ├── env/      # Environment config
│   │   └── email/    # Email services
│   ├── shared/       # Shared domain & tables
│   │   ├── domain/   # Cross-slice domain logic
│   │   └── tables/   # Drizzle table factories
│   ├── ui/           # UI libraries
│   │   ├── core/     # Theme system, MUI setup
│   │   └── ui/       # shadcn/ui + shared components
│   ├── iam/          # Identity & Access Management slice
│   ├── files/        # File management slice
│   ├── tasks/        # Task management slice
│   ├── party/        # Party/social features slice
│   ├── comms/        # Communications slice
│   └── ...
├── tooling/
│   ├── cli/          # Repo CLI tools
│   ├── repo-scripts/ # Automation scripts
│   ├── testkit/      # Testing utilities
│   └── utils/        # Tooling utilities
└── turbo.json        # Turborepo task orchestration
```

## Environment & Services

### Docker Services

Docker Compose runs:
- **PostgreSQL** on port 5432 (configurable via `DB_PG_PORT`)
- **Redis** on port 6379 (configurable via `REDIS_PORT`)
- **Jaeger** on port 16686 for tracing (OTLP on 4318)

Start services: `bun run services:up`
Stop and clean: `bun run nuke`

### Environment Management

- Primary env file: `.env` (gitignored)
- Template: `.env.example`
- All scripts automatically use `dotenvx` wrapper (via `bun run dotenvx -- <command>`)
- Generate secrets: `bun run gen:secrets`
- Initialize env: `bun run init:env`

## Development Workflow

### Adding a New Slice

1. Create directory structure: `packages/{slice}/{domain,tables,infra,sdk,ui}`
2. Add path aliases to `tsconfig.base.jsonc`
3. Create `package.json` for each layer with proper workspace references
4. Define domain models in `{slice}/domain/src/`
5. Create Drizzle tables in `{slice}/tables/src/`
6. Implement infrastructure adapters in `{slice}/infra/src/`
7. Build SDK contracts in `{slice}/sdk/src/`
8. Create UI components in `{slice}/ui/src/`

### Testing a Single Package

```bash
bunx turbo run test --filter=@beep/iam-domain
bunx turbo run check --filter=@beep/documents-infra
```

### Type Checking Workflow

- Run `bun run check` before committing
- TypeScript is configured with strict mode, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`
- Effect Language Service is enabled (see `tsconfig.base.jsonc` plugins)

### Dependency Management

- Use `bun run lint:deps` to check version sync across packages
- Use `bun run lint:deps:fix` to auto-fix mismatches
- Catalog versions defined in root `package.json`
- Use `syncpack` for cross-package dependency alignment

## Common Gotchas

### Circular Dependencies

- Run `bun run lint:circular` to detect cycles
- Madge config: `.madgerc`
- Common cause: bidirectional imports between slices (use `shared/*` as intermediary)

### TypeScript Memory Issues

If `tsserver` crashes or slows down:
1. Check for God objects (shared clients that import entire DB schema)
2. Use slice-scoped clients via `Db.make()`
3. Ensure proper `composite: true` and `incremental: true` in tsconfigs
4. Run `bun run check` instead of relying on editor type checking

### Effect-Specific Patterns

- Always use `Effect.gen` or `pipe` for composition
- Avoid `Effect.runPromise` in production code (use Layers instead)
- Tag errors with `Effect.withSpan` for observability
- Use `Layer.provide` for dependency injection, not manual context passing

### Path Alias Issues

- Never use relative imports like `../../../packages/xyz`
- Always use `@beep/*` aliases defined in `tsconfig.base.jsonc`
- Rebuild if IntelliSense doesn't resolve aliases: `bun run build`

## Production Considerations

Refer to `docs/PRODUCTION_CHECKLIST.md` (if exists) for deployment guidance.

Key environment variables for production:
- `NODE_ENV=production`
- `APP_LOG_FORMAT=json`
- `APP_LOG_LEVEL=error`
- `DB_PG_SSL=true`

## Additional Resources

- README.md — Project philosophy and design rationale
- turbo.json — Task dependency graph
- biome.jsonc — Linting and formatting rules
- tsconfig.base.jsonc — TypeScript compiler settings and path aliases