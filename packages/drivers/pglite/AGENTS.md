# @beep/pglite Agent Guide

## Purpose & Fit
- Driver-level in-process PGlite (embedded PostgreSQL) runtime via `@effect/sql-pglite`.
- Aliases the PGlite client under the `@effect/sql-pg` PgClient tag (tag-shim) so
  `drizzle-orm/effect-postgres` / `@beep/postgres` repositories run unchanged
  against the in-process database — no PGlite-socket bridge.
- Owns technical PGlite failures and the in-memory test layer, not product repositories.

## Surface Map
| Surface | Key exports | Notes |
| --- | --- | --- |
| entry module | PgliteError, PgliteClient, make, makeLayer, PgliteTestLayer | package entry point |
| Pglite.errors | PgliteError | single public technical driver error |
| PgliteClient.service | PgliteClient, makeLayer, make, PgliteClientOptions | in-process client + PgClient tag-shim layer |
| Pglite.test-layer | PgliteTestLayer | docker-free in-memory test layer |

## Laws
- Follow repository laws through command discovery.
- Run `bun run beep docs laws`.
- Prefer tersest equivalent helper forms when behavior is unchanged.
- In `test/` and `dtslint/`, import package source through `@beep/pglite` or other `@beep/*` package aliases; keep relative imports for local helpers, fixtures, and snapshots only.
- Keep package guidance concise and avoid duplicating long policy prose.

## Quick Recipes
```ts
import { VERSION } from "@beep/pglite"
```

## Verifications
- `bunx turbo run test --filter=@beep/pglite`
- `bunx turbo run test:integration --filter=@beep/pglite`
- `bunx turbo run lint --filter=@beep/pglite`
- `bunx turbo run check --filter=@beep/pglite`

## Contributor Checklist
- [ ] New exports include jsdoc metadata
- [ ] Tests added or updated for behavior changes
- [ ] `bun run check` passes
- [ ] `bun run test` passes
- [ ] `bun run lint` passes
