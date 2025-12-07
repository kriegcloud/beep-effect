# @beep/db-admin — Agent Guide

## Purpose & Fit
- Aggregates every Drizzle schema used across slices by re-exporting IAM and shared tables so migrations have a single source of truth (`packages/_internal/db-admin/src/schema.ts:3`).
- Wraps `@beep/shared-infra/Db` factory into an admin-only Layer that can be merged into tooling runtimes without duplicating configuration logic (`packages/_internal/db-admin/src/Db/AdminDb.ts:14`).
- Hosts generated SQL migrations and Drizzle metadata consumed by CI, Docker-backed tests, and local seed/reset workflows (`packages/_internal/db-admin/drizzle/0000_plain_leper_queen.sql`).
- Provides Pg container harnesses so repository tests can exercise migrations end-to-end with real Postgres + slice layers (`packages/_internal/db-admin/test/container.ts`).
- Lives under `_internal` because it is not shipped to apps directly; `packages/shared/infra/AGENTS.md` describes how production runtimes depend on these exports.

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
- When layering repositories, reuse slice Layers from `@beep/iam-infra` and `@beep/documents-infra` instead of duplicating repository construction.
- Coordinate with `packages/shared/tables/AGENTS.md` and `packages/shared/infra/AGENTS.md` so schema or repo guidance is not duplicated; link out rather than restating cross-slice rules.
- Keep this package `_internal`—it must never be declared as a dependency of other workspaces. Consumers should pull schemas through their slice barrels or `@beep/shared-infra/Db` layers instead.
- Integration tests in `test/container.ts` and `test/repo.test.ts` are currently commented out; restore them when Testcontainers setup is needed again.

## Quick Recipes
- **Merge the admin database Layer into a tooling runtime**
```ts
import { AdminDb } from "@beep/db-admin/Db/AdminDb";
import { DocumentsDb } from "@beep/documents-infra/db";
import { IamDb } from "@beep/iam-infra/db";
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

## Contributor Checklist
- [ ] Regenerate migrations (`bun run db:generate`) after modifying schema exports and inspect the resulting SQL for unintended diffs.
- [ ] Keep `src/schema.ts` aligned with slice schema barrels—add or remove exports when new vertical slices appear.
- [ ] Keep `src/relations.ts` updated with cross-table relationship definitions.
- [ ] If restoring integration tests, update `test/container.ts` seed logic if schema migrations add mandatory columns to seeded tables.
- [ ] Document any new admin tooling here and cross-link sibling AGENTS guides when behavior spans multiple packages.
- [ ] Consider implementing or removing the `db:reset` script reference in `package.json`.
