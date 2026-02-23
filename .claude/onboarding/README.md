# Agent Onboarding

Welcome to beep-effect. This document provides the entry point for new AI agents working in this codebase.

## What is beep-effect?

An Effect-first TypeScript monorepo delivering a full-stack application. The codebase uses Effect 3 for all business logic, dependency injection, and error handling. If you know TypeScript but not Effect, start with `effect-primer.md`.

**Key characteristics**:
- No `async/await` in domain code - uses `Effect.gen` pattern
- No `try/catch` anywhere - errors are typed values
- Dependency injection via Layers
- Branded EntityIds for type-safe IDs
- Strict import rules via `@beep/*` path aliases

## Quick Orientation

| Area | Description |
|------|-------------|
| `apps/` | Deployable applications (web, server, marketing) |
| `packages/` | Vertical slices (iam, documents, calendar, knowledge, comms, customization) |
| `packages/shared/` | Cross-slice shared code (domain, server, tables, client, ui) |
| `packages/common/` | Utilities (errors, schema, types, utils) |
| `tooling/` | CLI, testkit, build utilities |

## Essential Reading Order

1. **This file** - You are here
2. **[verification-checklist.md](./verification-checklist.md)** - Readiness gates to complete before contributing
3. **[effect-primer.md](./effect-primer.md)** - Effect basics for this codebase (REQUIRED if new to Effect)
4. **[first-contribution.md](./first-contribution.md)** - Step-by-step guide for your first task
5. **[common-tasks.md](./common-tasks.md)** - Patterns for frequent development tasks
6. **[CLAUDE.md](/home/elpresidank/YeeBois/projects/beep-effect2/CLAUDE.md)** - Commands and configuration
7. **[.claude/rules/effect-patterns.md](/home/elpresidank/YeeBois/projects/beep-effect2/.claude/rules/effect-patterns.md)** - Required patterns and NEVER rules

## Prerequisites for Local Development

Before running any commands:

1. **Docker must be running** - PostgreSQL and Redis run in containers
2. **Bun 1.3.x installed** - Primary runtime
3. **Node 22 installed** - Some tooling requires Node

## First Commands

```bash
# 1. Install dependencies
bun install

# 2. Start infrastructure (REQUIRED before db:migrate)
bun run services:up

# 3. Wait for services to be healthy (10-15 seconds)

# 4. Apply database migrations
bun run db:migrate

# 5. Start development
bun run dev
```

## Command Reference

| Category | Command | Purpose |
|----------|---------|---------|
| **Install** | `bun install` | Install all dependencies |
| **Dev** | `bun run dev` | Start all development servers |
| **Build** | `bun run build` | Production build |
| **Check** | `bun run check` | Type-check entire monorepo |
| **Lint** | `bun run lint:fix` | Lint and auto-fix |
| **Test** | `bun run test` | Run all tests |
| **Services** | `bun run services:up` | Start Docker services |
| **DB** | `bun run db:migrate` | Apply migrations |

## Import Alias Quick Reference

This codebase requires namespace imports with specific aliases:

```typescript
// Core Effect modules - full names
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Context from "effect/Context";

// Frequently used - single-letter aliases
import * as A from "effect/Array";      // NOT array.map()
import * as O from "effect/Option";     // NOT null/undefined
import * as S from "effect/Schema";     // NOT plain interfaces
import * as Str from "effect/String";   // NOT string.split()
import * as P from "effect/Predicate";  // NOT typeof/instanceof
import * as Match from "effect/Match";  // NOT switch statements
```

**Critical**: Native JavaScript methods are forbidden. Use Effect utilities.

## Key Rules Reference

| File | Purpose |
|------|---------|
| [behavioral.md](/home/elpresidank/YeeBois/projects/beep-effect2/.claude/rules/behavioral.md) | Critical thinking, no reflexive agreement |
| [general.md](/home/elpresidank/YeeBois/projects/beep-effect2/.claude/rules/general.md) | Code quality, boundaries, commands |
| [effect-patterns.md](/home/elpresidank/YeeBois/projects/beep-effect2/.claude/rules/effect-patterns.md) | Effect conventions, EntityIds, testing |
| [code-standards.md](/home/elpresidank/YeeBois/projects/beep-effect2/.claude/rules/code-standards.md) | Style, patterns, documentation philosophy |

## Architecture Boundaries

Each vertical slice follows this dependency order:

```
domain -> tables -> server -> client -> ui
```

**Rules**:
- Domain is the core - no infrastructure imports
- Cross-slice imports go through `packages/shared/*` or `packages/common/*`
- NEVER use relative `../../../` paths
- ALWAYS use `@beep/*` path aliases

## Testing Framework

ALWAYS use `@beep/testkit` for Effect-based tests:

```typescript
import { effect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";

effect("test name", () =>
  Effect.gen(function* () {
    const result = yield* someEffect();
    strictEqual(result, expected);
  })
);
```

NEVER use raw `bun:test` with `Effect.runPromise`.

## Troubleshooting

### "services:up" fails
- Verify Docker is running: `docker ps`
- Check port conflicts: PostgreSQL (5432), Redis (6379)
- Try `bun run nuke` then `bun run services:up`

### "bun run check" fails on unrelated packages
Turborepo cascades through dependencies. If `@beep/iam-tables` depends on `@beep/iam-domain`, errors in domain fail the tables check.

**Debug**:
```bash
# Isolate error source
bun run check --filter @beep/upstream-package

# Syntax-only check (no dependencies)
bun tsc --noEmit path/to/file.ts
```

### Effect code looks unfamiliar
Read [effect-primer.md](./effect-primer.md) before proceeding. The `yield*` syntax and Layer system are foundational.

## Next Steps

1. Complete [verification-checklist.md](./verification-checklist.md) to confirm readiness
2. Read [effect-primer.md](./effect-primer.md) if Effect is unfamiliar
3. Follow [first-contribution.md](./first-contribution.md) for your first task
4. Reference [common-tasks.md](./common-tasks.md) for patterns on frequent tasks
5. Review [effect-patterns.md](/home/elpresidank/YeeBois/projects/beep-effect2/.claude/rules/effect-patterns.md) for required patterns
6. Use `bun run check --filter @beep/package-name` to verify changes
7. Follow the slice dependency order: domain -> tables -> server -> client -> ui
