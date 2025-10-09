# Getting Started | kriegcloud/beep-effect | DeepWiki

_Source: https://deepwiki.com/kriegcloud/beep-effect/3-getting-started_

Relevant source files
*   [apps/web/next.config.ts](https://github.com/kriegcloud/beep-effect/blob/b64126f6/apps/web/next.config.ts)
*   [apps/web/package.json](https://github.com/kriegcloud/beep-effect/blob/b64126f6/apps/web/package.json)
*   [apps/web/src/libs/next/index.ts](https://github.com/kriegcloud/beep-effect/blob/b64126f6/apps/web/src/libs/next/index.ts)
*   [apps/web/tsconfig.json](https://github.com/kriegcloud/beep-effect/blob/b64126f6/apps/web/tsconfig.json)
*   [apps/web/tsconfig.test.json](https://github.com/kriegcloud/beep-effect/blob/b64126f6/apps/web/tsconfig.test.json)
*   [package.json](https://github.com/kriegcloud/beep-effect/blob/b64126f6/package.json)
*   [packages/_internal/db-admin/drizzle/0000_melted_killer_shrike.sql](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/_internal/db-admin/drizzle/0000_melted_killer_shrike.sql)
*   [packages/_internal/db-admin/drizzle/meta/0000_snapshot.json](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/_internal/db-admin/drizzle/meta/0000_snapshot.json)
*   [packages/_internal/db-admin/drizzle/meta/_journal.json](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/_internal/db-admin/drizzle/meta/_journal.json)
*   [packages/common/constants/src/Csp.ts](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/common/constants/src/Csp.ts)
*   [packages/core/env/src/client.ts](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/core/env/src/client.ts)
*   [packages/core/env/src/server.ts](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/core/env/src/server.ts)
*   [packages/iam/infra/package.json](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/iam/infra/package.json)
*   [packages/iam/ui/src/sign-up/sign-up-email.form.tsx](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/iam/ui/src/sign-up/sign-up-email.form.tsx)
*   [tsconfig.base.json](https://github.com/kriegcloud/beep-effect/blob/b64126f6/tsconfig.base.json)
*   [tsconfig.build.json](https://github.com/kriegcloud/beep-effect/blob/b64126f6/tsconfig.build.json)
*   [tsconfig.json](https://github.com/kriegcloud/beep-effect/blob/b64126f6/tsconfig.json)

This page provides practical instructions for setting up the development environment and running the beep-effect applications. It covers initial repository setup, common development workflows, and essential commands needed to begin working with the codebase.

For detailed environment variable configuration, see [Environment Configuration](https://deepwiki.com/kriegcloud/beep-effect/3.2-environment-configuration). For database-specific setup including migrations and seeding, see [Database Setup](https://deepwiki.com/kriegcloud/beep-effect/3.3-database-setup). For understanding the overall architecture before diving into setup, see [Architecture](https://deepwiki.com/kriegcloud/beep-effect/2-architecture).

Prerequisites
-------------

The following tools must be installed on your development machine:

| Tool              | Version | Purpose |
|-------------------| --- | --- |
| Node.js           | 18+ | JavaScript runtime |
| bun               | 1.2.4" | Package manager (exact version enforced) |
| Docker            | Latest | Container runtime for services |
| Docker Compose    | Latest | Multi-container orchestration |
| PostgreSQL Client | 14+ | Database CLI tools (optional) |

**Sources:**[package.json 5-8](https://github.com/kriegcloud/beep-effect/blob/b64126f6/package.json#L5-L8)

Repository Structure
--------------------

**Sources:**[package.json 9-13](https://github.com/kriegcloud/beep-effect/blob/b64126f6/package.json#L9-L13)[tsconfig.base.json 49-341](https://github.com/kriegcloud/beep-effect/blob/b64126f6/tsconfig.base.json#L49-L341)[apps/web/tsconfig.json 41-96](https://github.com/kriegcloud/beep-effect/blob/b64126f6/apps/web/tsconfig.json#L41-L96)

Quick Start
-----------

### 1. Clone and Install

```
# Clone the repository
git clone git@github.com:kriegcloud/beep-effect.git
cd beep-effect

# Install dependencies via Bun
bun install
```

### 2. Environment Setup

```
# Generate required secrets for .env file
bun run gen:secrets

# Review and customize .env file
# Edit .env with your local configuration
```

The `.env` file must contain variables for:

*   Database connection (`DB_PG_URL`, `DB_PG_PASSWORD`)
*   Authentication (`BETTER_AUTH_SECRET`)
*   OAuth providers (if enabled)
*   OpenTelemetry endpoints (`OTLP_TRACE_EXPORTER_URL`)

See [Environment Configuration](https://deepwiki.com/kriegcloud/beep-effect/3.2-environment-configuration) for complete variable reference.

### 3. Start Services

```
# Start PostgreSQL, Redis, and other Docker services
bun run services:up

# Verify services are running
docker compose ps
```

### 4. Initialize Database

```
# Generate Drizzle types from schema
bun run db:generate

# Run migrations
bun run db:migrate

# (Optional) Open Drizzle Studio to inspect database
bun run db:studio
```

See [Database Setup](https://deepwiki.com/kriegcloud/beep-effect/3.3-database-setup) for detailed migration and seeding instructions.

### 5. Start Development Servers

```
# Start all applications in development mode
bun run dev

# Or start individual applications:
bunx turbo run dev --filter=@beep/web
bunx turbo run dev --filter=@beep/server
bunx turbo run dev --filter=@beep/mcp
```

**Sources:**[package.json 21-52](https://github.com/kriegcloud/beep-effect/blob/b64126f6/package.json#L21-L52)[apps/web/package.json 8-11](https://github.com/kriegcloud/beep-effect/blob/b64126f6/apps/web/package.json#L8-L11)

Development Workflow
--------------------

**Sources:**[package.json 21-52](https://github.com/kriegcloud/beep-effect/blob/b64126f6/package.json#L21-L52)[apps/web/package.json 8-11](https://github.com/kriegcloud/beep-effect/blob/b64126f6/apps/web/package.json#L8-L11)

Common Commands Reference
-------------------------

### Package Management

| Command | Description |
| --- | --- |
| `bun install` | Install all dependencies |
| `bun pm update` | Update `bun.lock` without reinstalling |
| `bun run lint:deps` | Check dependency version consistency with syncpack |
| `bun run lint:deps:fix` | Auto-fix dependency version mismatches |

### Build and Development

| Command | Description |
| --- | --- |
| `bun run dev` | Start all applications in development mode with hot reload |
| `bun run build` | Build all packages and applications |
| `bun run start` | Start production builds |
| `bun run clean` | Remove build artifacts |
| `bun run clean:workspaces` | Clean all workspace packages |

### Database Operations

| Command | Description |
| --- | --- |
| `bun run db:generate` | Generate TypeScript types from Drizzle schemas |
| `bun run db:migrate` | Apply pending database migrations |
| `bun run db:push` | Push schema changes directly to database (dev only) |
| `bun run db:studio` | Open Drizzle Studio GUI |
| `bun run db:exec` | Open PostgreSQL shell in Docker container |

### Quality Assurance

| Command | Description |
| --- | --- |
| `bun run check` | Type-check all TypeScript code with tsc |
| `bun run lint` | Run Biome linter and check circular dependencies |
| `bun run lint:fix` | Auto-fix linting issues |
| `bun run lint:circular` | Check for circular dependencies with Madge |
| `bun run test` | Run test suites with Vitest |
| `bun run coverage` | Generate test coverage reports |

### Docker Services

| Command | Description |
| --- | --- |
| `bun run services:up` | Start all Docker services (PostgreSQL, Redis, etc.) |
| `docker compose down` | Stop all services |
| `docker compose ps` | List running services |
| `bun run nuke` | Completely remove all Docker resources |

**Sources:**[package.json 21-52](https://github.com/kriegcloud/beep-effect/blob/b64126f6/package.json#L21-L52)

Application-Specific Commands
-----------------------------

Each application can be targeted individually using Turbo filters:

```
# Web application (Next.js)
bunx turbo run dev --filter=@beep/web           # Development server
bunx turbo run build --filter=@beep/web         # Production build
bunx turbo run lint --filter=@beep/web          # Lint web code
bunx turbo run check --filter=@beep/web         # Type check

# Server application (Effect Platform Node)
bunx turbo run dev --filter=@beep/server
bunx turbo run build --filter=@beep/server

# MCP application (AI Tools Server)
bunx turbo run dev --filter=@beep/mcp
bunx turbo run build --filter=@beep/mcp
```

**Sources:**[apps/web/package.json 1-3](https://github.com/kriegcloud/beep-effect/blob/b64126f6/apps/web/package.json#L1-L3)[package.json 9-13](https://github.com/kriegcloud/beep-effect/blob/b64126f6/package.json#L9-L13)

Service Architecture for Local Development
------------------------------------------

**Sources:**[package.json 32-35](https://github.com/kriegcloud/beep-effect/blob/b64126f6/package.json#L32-L35)[apps/web/next.config.ts 9-20](https://github.com/kriegcloud/beep-effect/blob/b64126f6/apps/web/next.config.ts#L9-L20)[packages/core/env/src/server.ts 81-94](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/core/env/src/server.ts#L81-L94)

TypeScript Configuration
------------------------

The monorepo uses TypeScript project references for incremental builds:

*   **Root config**: [tsconfig.base.json 1-343](https://github.com/kriegcloud/beep-effect/blob/b64126f6/tsconfig.base.json#L1-L343) defines shared compiler options
*   **Build config**: [tsconfig.build.json 1-111](https://github.com/kriegcloud/beep-effect/blob/b64126f6/tsconfig.build.json#L1-L111) references all packages for production builds
*   **Application configs**: Each app has its own tsconfig.json extending the base

Key compiler settings:

*   `strict: true` for maximum type safety
*   `moduleResolution: "bundler"` for modern module resolution
*   `noUncheckedIndexedAccess: true` for safer array/object access
*   Project references enabled via `composite: true` and `incremental: true`
*   Effect Language Service plugin configured at [tsconfig.base.json 44-48](https://github.com/kriegcloud/beep-effect/blob/b64126f6/tsconfig.base.json#L44-L48)

**Sources:**[tsconfig.base.json 1-343](https://github.com/kriegcloud/beep-effect/blob/b64126f6/tsconfig.base.json#L1-L343)[apps/web/tsconfig.json 1-201](https://github.com/kriegcloud/beep-effect/blob/b64126f6/apps/web/tsconfig.json#L1-L201)

Environment Variable Loading
----------------------------

The codebase uses `@dotenvx/dotenvx` to load environment variables with enhanced security:

1.   **Root .env file**: Store all environment variables in the repository root
2.   **Prefixed commands**: All commands that need env vars use `bun run dotenvx -- <command>`
3.   **Client vs Server split**:
    *   Client variables: `NEXT_PUBLIC_*` prefix, loaded by [packages/core/env/src/client.ts 1-58](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/core/env/src/client.ts#L1-L58)
    *   Server variables: Loaded by [packages/core/env/src/server.ts 1-214](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/core/env/src/server.ts#L1-L214) using Effect Config

Example of how dotenvx wraps commands:

```
# Defined in package.json
"dotenvx": "bunx dotenvx run -f .env --"

# Used in other scripts
"dev": "bun run dotenvx -- bunx turbo run dev --concurrency=36"
"db:migrate": "bun run dotenvx -- bunx turbo run db:migrate"
```

**Sources:**[package.json 45](https://github.com/kriegcloud/beep-effect/blob/b64126f6/package.json#L45-L45)[package.json 40-41](https://github.com/kriegcloud/beep-effect/blob/b64126f6/package.json#L40-L41)[packages/core/env/src/client.ts 36-57](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/core/env/src/client.ts#L36-L57)[packages/core/env/src/server.ts 210-213](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/core/env/src/server.ts#L210-L213)

Next Steps
----------

Once your development environment is running:

1.   **Configure environment variables**: See [Environment Configuration](https://deepwiki.com/kriegcloud/beep-effect/3.2-environment-configuration) for complete variable reference including OAuth providers, AWS S3, Stripe, and observability endpoints

2.   **Set up the database**: See [Database Setup](https://deepwiki.com/kriegcloud/beep-effect/3.3-database-setup) for detailed instructions on running migrations, seeding test data, and using Drizzle Studio

3.   **Explore the architecture**: Read [Monorepo Structure](https://deepwiki.com/kriegcloud/beep-effect/2.1-monorepo-structure) to understand workspace organization and [Domain-Driven Design](https://deepwiki.com/kriegcloud/beep-effect/2.3-domain-driven-design) to understand the vertical slice architecture

4.   **Build features**: Start with [IAM Context](https://deepwiki.com/kriegcloud/beep-effect/5.1-iam-context) for authentication flows or [Files Context](https://deepwiki.com/kriegcloud/beep-effect/5.2-files-context) for file storage implementation

5.   **Learn Effect patterns**: Review [Effect Ecosystem Integration](https://deepwiki.com/kriegcloud/beep-effect/2.2-effect-ecosystem-integration) and [Runtime and Service Composition](https://deepwiki.com/kriegcloud/beep-effect/4.2-runtime-and-service-composition) to understand the functional programming patterns used throughout the codebase

Troubleshooting Common Issues
-----------------------------

### Port Conflicts

If you encounter port binding errors, check for conflicting services:

```
# Check what's using PostgreSQL default port
lsof -i :5432

# Check Next.js development port
lsof -i :3000
```

### Docker Service Issues

```
# Restart all services
docker compose down
bun run services:up

# View service logs
docker compose logs -f postgres
docker compose logs -f redis
```

### Build Cache Issues

```
# Clear Turbo cache
rm -rf .turbo

# Clear all build artifacts
bun run clean:workspaces

# Reinstall dependencies
bun run clean
bun install
```

### TypeScript Errors

```
# Check all projects
bun run check

# Check specific application
bunx turbo run check --filter=@beep/web

# Rebuild all packages
bun run build
```

**Sources:**[package.json 22-29](https://github.com/kriegcloud/beep-effect/blob/b64126f6/package.json#L22-L29)[package.json 32-35](https://github.com/kriegcloud/beep-effect/blob/b64126f6/package.json#L32-L35)
