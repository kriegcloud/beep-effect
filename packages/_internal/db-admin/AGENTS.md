# @beep/db-admin — Agent Guide

## Purpose & Fit
- Aggregates every Drizzle schema used across slices by re-exporting IAM and shared tables so migrations have a single source of truth (`packages/_internal/db-admin/src/schema.ts:3`).
- Wraps `@beep/shared-server/Db` factory into an admin-only Layer that can be merged into tooling runtimes without duplicating configuration logic (`packages/_internal/db-admin/src/Db/AdminDb.ts:14`).
- Hosts generated SQL migrations and Drizzle metadata consumed by CI, Docker-backed tests, and local seed/reset workflows (`packages/_internal/db-admin/drizzle/0000_plain_leper_queen.sql`).
- Provides Pg container harnesses so repository tests can exercise migrations end-to-end with real Postgres + slice layers (`packages/_internal/db-admin/test/container.ts`).
- Lives under `_internal` because it is not shipped to apps directly; `packages/shared/server/AGENTS.md` describes how production runtimes depend on these exports.

## Surface Map
- `src/Db/AdminDb.ts` — Defines `AdminDb` Context tag and `AdminDb.Live` Layer via `Db.make(DbSchema)`, exposing migrations-aware schema bundles to tooling.
- `src/schema.ts` — Barrel re-export that stitches IAM, Documents, and shared Drizzle tables for CLI usage and slice seeding; referenced by `drizzle.config.ts`.
- `src/relations.ts` — Drizzle relations definitions for cross-table queries and joins.
- `drizzle/**` — Generated SQL and migration journal that must stay in sync with slice schema changes.
- `drizzle.config.ts` — `drizzle-kit` entrypoint pointing to `src/schema.ts` and expecting `DB_PG_URL`; uses `dotenvx` for secret handling.
- `test/container.ts` — Testcontainers-backed Layer (currently commented out) that provisions Postgres 15 + `pg_uuidv7`, applies migrations, and wires repos for integration testing.
- `test/repo.test.ts` — Repository integration tests (currently commented out) demonstrating Layer composition with IAM repos.
- `test/Dummy.test.ts` — Placeholder test ensuring test infrastructure works.
- Workspace scripts — `package.json` exposes `db:generate`, `db:migrate`, `db:push`, `db:reset` (references non-existent script), and `test` commands wired through `dotenvx` and `tsconfig.src.json`.

## Usage Snapshots
- `src/Db/AdminDb.ts:14` — `AdminDb.Live` uses `Layer.scoped` so downstream tooling can merge it with slice Layers without managing memoization or scope lifetimes manually.
- `test/container.ts` — Contains commented-out Testcontainers implementation that previously demonstrated how to run admin migrations inside Bun's test harness.
- `test/repo.test.ts` — Contains commented-out IAM repo contract tests that previously merged the admin container Layer with slice repositories to cover insert/update/delete flows.
- Note: Integration tests are currently disabled - container and repo test files contain implementation but are commented out.

## Authoring Guardrails
- Always import Effect modules with namespace bindings (`Effect`, `Layer`, `F`, `A`, `Str`, `O`, etc.); never fall back to native array/string/object helpers in scripts, tests, or docs.
- Treat `AdminDb.Live` as the single entrypoint for admin DB access—if a new tool needs direct Drizzle clients, expose them through the Context tag rather than instantiating new connections.
- Migrations must be generated through `bun run db:generate` so the SQL and journal stay in sync; manual edits belong in `--custom` migrations committed alongside generated ones.
- The `db:reset` script in `package.json` references `src/scripts/ResetDatabase.ts`, which does not exist—either add the implementation or remove the script to avoid dead references.
- When layering repositories, reuse slice Layers from `@beep/iam-server` and `@beep/documents-server` instead of duplicating repository construction.
- Coordinate with `packages/shared/tables/AGENTS.md` and `packages/shared/server/AGENTS.md` so schema or repo guidance is not duplicated; link out rather than restating cross-slice rules.
- Keep this package `_internal`—it must never be declared as a dependency of other workspaces. Consumers should pull schemas through their slice barrels or `@beep/shared-server/Db` layers instead.
- Integration tests in `test/container.ts` and `test/repo.test.ts` are currently commented out; restore them when Testcontainers setup is needed again.

## Quick Recipes
- **Merge the admin database Layer into a tooling runtime**
```ts
import { AdminDb } from "@beep/db-admin/Db/AdminDb";
import { DocumentsDb } from "@beep/documents-server/db";
import { IamDb } from "@beep/iam-server/db";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Layer from "effect/Layer";

const ToolRuntime = Layer.mergeAll(
  AdminDb.Live,
  DocumentsDb.Live,
  IamDb.Live
);

const confirmMigration = Effect.gen(function* () {
  const adminDb = yield* AdminDb;
  const rows = yield* adminDb.db.select().from(adminDb.schema.user);
  return F.pipe(rows, A.head);
});
```
- **Locate a seeded user inside a Drizzle result using Effect collections**
```ts
import { AdminDb } from "@beep/db-admin/Db/AdminDb";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";

const findUserByEmail = (email: string) =>
  Effect.gen(function* () {
    const adminDb = yield* AdminDb;
    const rows = yield* adminDb.db.select().from(adminDb.schema.user);
    return F.pipe(
      rows,
      A.findFirst((row) => row.email === email)
    );
  });
```
- **Note**: Testcontainer integration tests are currently commented out in `test/container.ts`. Restore when needed for integration testing.

## Verifications
- `bun run check --filter @beep/db-admin`
- `bun run lint --filter @beep/db-admin`
- `bun run test --filter @beep/db-admin`
- `bun run db:generate`
- `bun run db:migrate`

## Security

### Database Credential Handling
- NEVER hardcode database credentials in source files, configuration, or scripts.
- ALWAYS use `dotenvx` for loading secrets; the `drizzle.config.ts` and workspace scripts expect `DB_PG_URL` to be injected via environment.
- NEVER log connection strings that include credentials—use masked versions or omit entirely from `Effect.log*` output.
- ALWAYS ensure `.env` files are listed in `.gitignore`; NEVER commit files containing database URLs with embedded passwords.

### Production Access Controls
- ALWAYS restrict `AdminDb` usage to internal tooling and CI pipelines—production apps should consume slices via `@beep/shared-server/Db` layers, not the admin bundle.
- NEVER expose admin database tooling endpoints in production deployments; the `_internal` designation exists to prevent accidental inclusion.
- ALWAYS audit migration scripts (`drizzle/**/*.sql`) for sensitive data exposure before committing.

### SQL Injection Prevention
- ALWAYS use parameterized queries via Drizzle ORM; NEVER concatenate user input into raw SQL strings.
- When writing custom SQL in `--custom` migrations, ALWAYS use parameter placeholders (`$1`, `$2`, etc.) rather than string interpolation.
- ALWAYS validate and sanitize any dynamic identifiers (table names, column names) if they must be interpolated—prefer schema-driven approaches that avoid dynamic SQL entirely.

### Secrets in Logs and Errors
- NEVER log the full `DB_PG_URL` or any connection string with embedded credentials.
- ALWAYS use Effect's error handling to wrap database errors without exposing sensitive context in stack traces.
- When debugging connection failures, log only the host/port/database name—NEVER the username or password.

## Gotchas

### Migration Generation Pitfalls
- **Schema barrel must include all slices**: The `src/schema.ts` barrel file must re-export every slice's tables. Forgetting to add a new slice causes `db:generate` to ignore those tables—migrations will be incomplete.
- **Drizzle Kit introspection mode**: Running `drizzle-kit introspect` on an existing database may generate schemas that conflict with the codebase. Only use introspection for initial setup or auditing—never overwrite existing schema files.
- **Migration journal corruption**: The `drizzle/meta/_journal.json` file tracks migration history. Manual edits to this file cause migration state inconsistencies—regenerate from scratch if corrupted.

### Migration Execution Pitfalls
- **Transaction boundaries**: Drizzle Kit runs each migration file in a single transaction by default. Long-running migrations on large tables may cause lock contention—consider splitting into multiple migration files.
- **Enum additions are non-transactional**: PostgreSQL `ALTER TYPE ... ADD VALUE` cannot run inside a transaction. Drizzle generates these correctly, but mixing enum additions with other changes in one migration file causes failures.
- **Extension dependencies**: The `pg_uuidv7` extension must be installed before UUID v7 columns can be used. Ensure the extension migration runs first, or use a setup script outside Drizzle.

### Relation Aggregation Gotchas
- **Relation name collisions**: When aggregating relations from multiple slices, ensure relation names are unique. Two slices defining `userRelations` will conflict—prefix with slice name (e.g., `iamUserRelations`).
- **Circular relation imports**: The aggregated `src/relations.ts` imports from slice packages. Circular dependencies between `db-admin` and slices cause build failures—slices should never import from `db-admin`.
- **Missing relation exports**: If a slice adds relations but does not export them via its barrel, `db-admin` queries will lack join metadata. Ensure all relations are exported from `@beep/<slice>-tables`.

### Integration with Slice Packages
- **`AdminDb` is for tooling only**: Production applications should use slice-specific `*Db` Layers (e.g., `IamDb`, `DocumentsDb`), not `AdminDb`. Using `AdminDb` in production bypasses slice-specific configuration.
- **Schema drift detection**: After running `db:migrate`, always run `bun run check` across all slices. Migration success does not guarantee type alignment—`_check.ts` files may fail after schema changes.
- **Testcontainers port conflicts**: The commented-out `test/container.ts` uses dynamic port allocation. If restored, ensure tests do not conflict with local PostgreSQL instances on port 5432.

### Common Operational Errors
- **`db:reset` script missing**: The `package.json` references a `ResetDatabase.ts` script that does not exist. Either implement the script or remove the npm script to avoid confusion.
- **`dotenvx` not installed**: Migration commands require `dotenvx` for environment variable handling. Missing installation causes `DB_PG_URL` to be undefined—install globally or via package dependencies.
- **Stale build artifacts**: Drizzle Kit reads compiled JavaScript, not TypeScript. Run `bun run build` in affected packages before `db:generate` if schema changes are not reflected.

## Contributor Checklist
- [ ] Regenerate migrations (`bun run db:generate`) after modifying schema exports and inspect the resulting SQL for unintended diffs.
- [ ] Keep `src/schema.ts` aligned with slice schema barrels—add or remove exports when new vertical slices appear.
- [ ] Keep `src/relations.ts` updated with cross-table relationship definitions.
- [ ] If restoring integration tests, update `test/container.ts` seed logic if schema migrations add mandatory columns to seeded tables.
- [ ] Document any new admin tooling here and cross-link sibling AGENTS guides when behavior spans multiple packages.
- [ ] Consider implementing or removing the `db:reset` script reference in `package.json`.
