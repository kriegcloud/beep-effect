# beep-effect
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/kriegcloud/beep-effect)

A TypeScript monorepo template for Effect enjoyers, vertical-slice fanatics, and startup gremlins. Monads? beep. Ports and adapters? beep beep.

## Why “beep”?

“Beep” is an inside joke that roughly means “you beast.” When someone walks by and catches a dev grokking monads or orchestrating ports/adapters like a deity—beep.

## What is this?

An open-source, batteries-included TypeScript monorepo built around Effect and a vertical-slice, hexagonal/clean architecture. It’s a long-lived playground and launchpad: a place to learn, iterate quickly on new ideas, and keep a serious toolbox sharp.

## Goals

- Open-source template for Effect TS developers to bootstrap serious projects fast
- Learn-by-doing: hexagonal/clean/DDD, Effect (+ ecosystem), and AI agents with @effect/ai
- Rapid prototyping for startup ideas via reusable internal packages
- Extremely maintainable and long-lasting over “simple at all costs”



## Architecture

Vertical Slice Architecture with a hexagonal/clean flavor:
- Each slice owns its domain and exposes use cases via application ports
- Infrastructure adapters implement those ports; IO stays out of domain logic
- Cross-slice sharing only through shared/common modules

Source of truth for rules and boundaries:
- [.windsurfrules](.windsurfrules) → repository-enforced boundaries and allowed imports
- [tsconfig.base.json](tsconfig.base.json) → authoritative path aliases and module boundaries
- [turbo.json](turbo.json) → task graph and pipeline conventions
- [docs/patterns/](docs/patterns/) → Effect patterns and project conventions
- [docs/PRODUCTION_CHECKLIST.md](docs/PRODUCTION_CHECKLIST.md) → production posture, logging defaults

## Monorepo layout

- `apps/` — application surfaces (e.g., `web`, `server`, `mcp`)
- `packages/` — vertical slices and shared libs
  - Slices today: `iam/*`, `files/*` (layers: `domain`, `application`, `infra`, `tables`, `ui`, `sdk`)
  - Cross-cutting: `shared/*`, `common/*`, `core/*`, `ui/*`
- `tooling/*` — repo scripts, config, testkit

Authoritative module boundaries via [tsconfig.base.json](tsconfig.base.json) path aliases (e.g., `@beep/iam-domain`, `@beep/files-services`, `@beep/shared-*`, `@/*` for `apps/web`).

## Tech stack

- Language: TypeScript (strict)
- Core: Effect 3, @effect/platform
- DB: Postgres, Drizzle ORM, `@effect/sql*`
- Auth: better-auth
- UI: React + MUI (+ Tailwind utilities via @beep/ui)
- State/machines: XState (v5)
- Build & workspace: bun + Turborepo
- Quality: Biome, Vitest
- Optional/infra: Docker + dotenvx
- AI: @effect/ai (+ IDE assistant rules in [.windsurfrules](.windsurfrules), `.cursor/rules/`)

## Quick start

Prereqs
- Bun >= 1.2.4 (pinned in [`.bun-version`](.bun-version))
- Node 22 LTS (still required for remaining Node-targeted tooling until runtime migration completes)
- Docker (for local Postgres)
- Optional: direnv

Install & run
```bash
# install dependencies
bun install

# bootstrap: spins up Docker services + runs migrations
bun run bootstrap

# Dev (all)
bun run dev

# Dev (web only)
bunx turbo run dev --filter=@beep/web
```

Notes
- Run `bun run bootstrap` after installing to launch Docker services and apply migrations before development.
- Prefer running via root scripts in [`package.json`](package.json). Scripts use `dotenvx` so you don’t have to.
- If a tool isn’t in your PATH in your environment, you can prefix with `direnv exec .` (see `.windsurfrules`).

## Tasks and pipelines

- Lint/format: `bun run lint`, `bun run lint:fix` (see [biome.jsonc](biome.jsonc))
- Typecheck: `bun run check`
- Circular import check: `bun run lint:circular`
- Build: `bun run build`
- Dev: `bun run dev` / `bun run dev:https`
- Bootstrap: `bun run bootstrap`
- DB lifecycle: `bun run db:generate`, `bun run db:push`, `bun run db:migrate`, `bun run db:studio` (wired via [turbo.json](turbo.json))

See [turbo.json](turbo.json) for the authoritative task graph.

## Database, cache, and telemetry (local)

Defined in [docker-compose.yml](docker-compose.yml):
- Postgres (`beep-db`) — exposed on `${DB_PG_PORT:-5432}`
- Redis (`beep-redis`) — exposed on `${REDIS_PORT:-6379}`
- Jaeger UI — exposed on `${JAEGER_PORT:-16686}` with OTLP `${OTLP_TRACE_EXPORTER_PORT:-4318}`

Bring services up with `bun run db:up`.

## Layering and imports (enforced)

Canonical rules live in [.windsurfrules](.windsurfrules). Highlights:
- `S/domain` → entities, value objects, domain services. Pure; no IO.
- `S/application` → use cases and ports. Depends on `S/domain`.
- `S/infra` → adapters (DB, auth, email, file stores, etc.) implementing ports.
- `S/tables` → DB schema/table definitions.
- `S/ui` and app surfaces live in `apps/*` (e.g., Next.js in `apps/web`).

Path aliases in [tsconfig.base.json](tsconfig.base.json) are the single source of truth for module boundaries (e.g., `@beep/iam-*`, `@beep/files-*`, `@beep/shared-*`, `@/*`).

## Slices today

- IAM: `packages/iam/*`
  - Layers: [`domain`](packages/iam/domain/), [`application`](packages/iam/services/), [`infra`](packages/iam/infra/), [`tables`](packages/iam/tables/), [`ui`](packages/iam/ui/), [`sdk`](packages/iam/sdk/)
- Files: `packages/files/*`
  - Layers: [`domain`](packages/files/domain/), [`application`](packages/files/services/), [`infra`](packages/files/infra/), [`tables`](packages/files/tables/), [`ui`](packages/files/ui/), [`sdk`](packages/files/sdk/)
- Shared foundations: [`packages/shared/`](packages/shared/), [`packages/common/`](packages/common/), [`packages/core/`](packages/core/)

File storage approach: shared file primitives (IDs, base tables) live under `packages/shared/*`; slice-specific business logic (uploads, processing) lives in `packages/files/*`. See `packages/files/_SPEC/design_research.md` for research and `packages/common/schema/src/custom/` for related schemas (e.g., `FileExtension.schema.ts`, `MimeType.schema.ts`).

## Docs and patterns

- Production posture: [docs/PRODUCTION_CHECKLIST.md](docs/PRODUCTION_CHECKLIST.md)
- Effect patterns and references: [docs/patterns/](docs/patterns/)
- Assistant rules: [.windsurfrules](.windsurfrules)

## Applications

- Web (Next.js): `apps/web` (uses `@/*` path alias)
- Server (Effect + RPC/HTTP-ready): `apps/server`
- MCP tools: `apps/mcp`

CI is defined in [.github/workflows/check.yml](.github/workflows/check.yml) and runs types, lint, and tests.

## Production defaults (tl;dr)

See [docs/PRODUCTION_CHECKLIST.md](docs/PRODUCTION_CHECKLIST.md) for details. Defaults today:
- `APP_LOG_FORMAT=json`
- `APP_LOG_LEVEL=error`
- `NODE_ENV=production`
