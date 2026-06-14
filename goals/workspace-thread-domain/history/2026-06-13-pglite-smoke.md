# P0 PGlite Migration Smoke

Date: 2026-06-13
Agent: Codex

## Scope

P0 requires proving the existing `db-admin` migration doctrine against the
repo's PGlite harness before adding workspace thread entities or migrations.

## Command

```sh
BEEP_TEST_DATABASE_DRIVER=pglite-testcontainers bun run --cwd packages/_internal/db-admin test:integration
```

## Result

Pass.

```text
Test Files  1 passed (1)
Tests       1 passed (1)
Duration    3.43s
```

## Notes

- The current root catalog pins `@electric-sql/pglite` 0.5.2 and
  `@electric-sql/pglite-socket` 0.2.2.
- The existing PGlite test harness image still installs
  `@electric-sql/pglite` 0.4.5 and `@electric-sql/pglite-socket` 0.1.5.
- This proof applies the existing `packages/_internal/db-admin/drizzle`
  migrations through the documented `pglite-testcontainers` path.
- No dependency or lockfile changes were made for this P0 proof.
