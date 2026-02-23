# beep-effect2 Agent Guide

## Overview

Effect v4 TypeScript monorepo. All code uses the Effect ecosystem exclusively.

## Critical Rules

1. **Always use Effect APIs** - Never use native Array, Map, Set, or string methods. Use `effect/Array`, `effect/Option`, `MutableHashMap`, `effect/String`.
2. **Never use type assertions** - No `as X` (except `as const`). Fix types properly.
3. **Use `S.TaggedErrorClass`** for errors, not `Data.TaggedError`.
4. **Annotate schemas** with `identifier`, `title`, `description` at minimum.
5. **Use `Effect.fn`** for all functions returning Effects.
6. **Test with Vitest** - Run `npx vitest run`, never `bun test`.

## Workspace Layout

| Path | Purpose |
|------|---------|
| `packages/common/*` | Shared kernel packages |
| `packages/shared/*` | Cross-cutting services |
| `tooling/*` | Developer tooling |
| `apps/*` | Applications |

## Verification

```bash
bun run build       # Build all packages
bun run check       # Type check
npx vitest run      # Unit tests
bun run lint        # Full lint suite
```

## Per-Package Guidance

Each package has its own `CLAUDE.md` and `AGENTS.md` with specific module maps, recipes, and checklists.
