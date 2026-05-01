# @beep/postgres Agent Guide

## Purpose & Fit
- Postgres driver runtime, SQLSTATE diagnostics, and Drizzle Effect composition.
- Owns technical Postgres failures and query logging helpers, not product repositories.
- Replaces the old placeholder `@beep/pglite` driver package; PGLite test harnesses remain in `@beep/test-utils`.

## Surface Map
| Surface | Key exports | Notes |
| --- | --- | --- |
| entry module | PostgresClient, PostgresError, makeDrizzle, migrate, formatSql | package entry point |
| Postgres.client | PostgresClient | native Effect PgClient layers |
| Postgres.drizzle | makeDrizzle, makeDrizzleLayer, migrate | Drizzle Effect Postgres composition |
| Postgres.errors | PostgresError, extractPostgresDiagnostics | technical driver error normalization |
| Postgres.format | formatSql, formatPostgresError, logPostgresError | terminal SQL/error rendering |
| Postgres.sqlstate | PgErrorCode, PgErrorName | typed SQLSTATE model |
| interop | native Drizzle and Effect Postgres exports | exact upstream interop |

## Laws
- Follow repository laws through command discovery.
- Run `bun run beep docs laws`.
- Prefer tersest equivalent helper forms when behavior is unchanged.
- In `test/` and `dtslint`, import package source through `@beep/postgres` or other `@beep/*` package aliases; keep relative imports for local helpers, fixtures, and snapshots only.
- Keep package guidance concise and avoid duplicating long policy prose.

## Quick Recipes
```ts
import { PostgresClient, PostgresError, formatSql, makeDrizzle } from "@beep/postgres"
```

## Verifications
- `bunx turbo run test --filter=@beep/postgres`
- `bunx turbo run lint --filter=@beep/postgres`
- `bunx turbo run check --filter=@beep/postgres`
- `bunx turbo run docgen --filter=@beep/postgres`

## Contributor Checklist
- [ ] New exports include jsdoc metadata
- [ ] Tests added or updated for behavior changes
- [ ] `bun run check` passes
- [ ] `bun run test` passes
- [ ] `bun run docgen` passes
- [ ] `bun run lint` passes
