# @beep/drizzle Agent Guide

## Purpose & Fit
- Product-neutral Drizzle execution capability for server-side adapters.
- Owns technical Drizzle failures and transaction boundaries, not product repositories.

## Surface Map
| Surface | Key exports | Notes |
| --- | --- | --- |
| entry module | Drizzle, DrizzleError | package entry point |
| Drizzle.errors | DrizzleError | single public technical driver error with optional query context |
| Drizzle.service | Drizzle, DrizzleClient, DrizzleShape | product-neutral execution Layer |
| interop | installDrizzleEffectYieldables, native cache/logger/error/query-effect types | exact upstream Drizzle Effect interop |

## Laws
- Follow repository laws through command discovery.
- Run `bun run beep docs laws`.
- Prefer tersest equivalent helper forms when behavior is unchanged.
- In `test/` and `dtslint/`, import package source through `@beep/drizzle` or other `@beep/*` package aliases; keep relative imports for local helpers, fixtures, and snapshots only.
- Keep package guidance concise and avoid duplicating long policy prose.

## Quick Recipes
```ts
import { Drizzle, DrizzleError } from "@beep/drizzle"
import { installDrizzleEffectYieldables } from "@beep/drizzle/interop"
```

## Verifications
- `bunx turbo run test --filter=@beep/drizzle`
- `bunx turbo run test:integration --filter=@beep/drizzle`
- `bunx turbo run docgen --filter=@beep/drizzle`
- `bunx turbo run lint --filter=@beep/drizzle`
- `bunx turbo run check --filter=@beep/drizzle`

## Contributor Checklist
- [ ] New exports include jsdoc metadata
- [ ] Tests added or updated for behavior changes
- [ ] `bun run check` passes
- [ ] `bun run test` passes
- [ ] `bun run docgen` passes
- [ ] `bun run lint` passes
