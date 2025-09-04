# beep-effect

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

See `Project Structure & Architecture` in:
- [.windsurfrules](.windsurfrules) → repository-enforced boundaries and “allowed imports”
- [CLAUDE.md](CLAUDE.md) → task-focused guidance for AI assistants

## Monorepo layout

- `apps/` — application surfaces (e.g., `web`, `server`, `mcp`)
- `packages/` — vertical slices and shared libs
  - Slices: `iam/*`, `wms/*` with `domain`, `application`, `api`, `db`, `ui`, `tables`
  - Cross-cutting: `shared/*`, `common/*`, `adapters/*`, `persistence/*`, `ai/*`, `email/*`, `env/*`, `ui/*`
- `tooling/*` — repo scripts, config, testkit

Authoritative module boundaries via [tsconfig.base.json](tsconfig.base.json) path aliases (e.g., `@beep/iam-domain`, `@beep/wms-application`, `@beep/shared-*`, `@/*` for `apps/web`).

## Tech stack

- Language: TypeScript (strict)
- Core: Effect 3, @effect/platform
- DB: Postgres, Drizzle ORM, `@effect/sql*`
- Auth: better-auth
- UI: React + MUI (+ Tailwind utilities via @beep/ui)
- State/machines: XState (v5)
- Build & workspace: pnpm + Turborepo
- Quality: Biome, Vitest
- Optional/infra: Docker + dotenvx
- AI: @effect/ai (+ IDE assistant rules in [.windsurfrules](.windsurfrules), `.cursorrules`, [CLAUDE.md](CLAUDE.md))

## Quick start

Prereqs
- Node LTS, pnpm 10.15.0
- Docker (for local Postgres)
- Optional: direnv

Install & run
```bash
pnpm install
cp .env.example .env

# Start DB (optional if using Docker)
pnpm db:up

# Dev (all)
pnpm dev

# Dev (web only)
pnpm dev --filter=@beep/web