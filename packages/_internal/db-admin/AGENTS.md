# @beep/db-admin — Agent Guide

## Purpose & Fit
- Aggregates every Drizzle schema used across slices by re-exporting IAM and shared tables so migrations have a single source of truth (`packages/_internal/db-admin/src/schema.ts:3`).
- Wraps `@beep/core-db`’s factory into an admin-only Layer that can be merged into tooling runtimes without duplicating configuration logic (`packages/_internal/db-admin/src/Db.ts:12`).
- Hosts generated SQL migrations and Drizzle metadata consumed by CI, Docker-backed tests, and local seed/reset workflows (`packages/_internal/db-admin/drizzle/0000_melted_killer_shrike.sql`).
- Provides Pg container harnesses so repository tests can exercise migrations end-to-end with real Postgres + slice layers (`packages/_internal/db-admin/test/pg-container.ts:214`).
- Lives under `_internal` because it is not shipped to apps directly; other guides (for example `packages/core/db/AGENTS.md`) describe how production runtimes depend on these exports.

## Surface Map
- `src/Db.ts` — Defines `AdminDb.AdminDb` Context tag and `AdminDb.AdminDb.Live` Layer via `Db.make(DbSchema)`, exposing migrations-aware schema bundles to tooling (`packages/_internal/db-admin/src/Db.ts:17`).
- `src/schema.ts` — Barrel re-export that stitches IAM + shared Drizzle tables for CLI usage and slice seeding; referenced by `drizzle.config.ts` (`packages/_internal/db-admin/src/schema.ts:4`).
- `drizzle/**` — Generated SQL and migration journal that must stay in sync with slice schema changes (`packages/_internal/db-admin/drizzle/meta/_journal.json`).
- `drizzle.config.ts` — `drizzle-kit` entrypoint pointing to `src/schema.ts` and expecting `DB_PG_URL`; update when secrets move to redacted env handling (`packages/_internal/db-admin/drizzle.config.ts:5`).
- `test/pg-container.ts` — Testcontainers-backed Layer that provisions Postgres 15 + `pg_uuidv7`, applies migrations, and wires IAM + Files repos for integration testing (`packages/_internal/db-admin/test/pg-container.ts:214`).
- `test/coreDb.test.ts` — Smoke test ensuring `DbError` mapping handles unique violations using the admin Layer plus IAM repo bundle (`packages/_internal/db-admin/test/coreDb.test.ts:31`).
- `test/iam-infra/repos/AccountRepo.test.ts` — Cross-slice repository tests that import the container Layer through the public test path alias (`packages/_internal/db-admin/test/iam-infra/repos/AccountRepo.test.ts:2`).
- Workspace scripts — `package.json` exposes `db:generate`, `db:migrate`, `db:push`, `db:reset` (placeholder), and `test` commands wired through `dotenvx` and `tsconfig.src.json` (`packages/_internal/db-admin/package.json:20`).

## Usage Snapshots
- `packages/_internal/db-admin/src/Db.ts:17` — `AdminDb.AdminDb.Live` uses `Layer.scoped` so downstream tooling can merge it with slice Layers without managing memoization or scope lifetimes manually.
- `packages/_internal/db-admin/test/coreDb.test.ts:19` — `layer(PgContainer.Live)` demonstrates how to run admin migrations inside Bun’s test harness while validating `DbError` tagging.
- `packages/_internal/db-admin/test/iam-infra/repos/AccountRepo.test.ts:34` — IAM repo contract tests merge the admin container Layer with slice repositories to cover insert/update/delete flows against the generated schema.
- `packages/_internal/db-admin/test/pg-container.ts:240` — Provides `PgClient.layer` with `Str.camelToSnake`/`Str.snakeToCamel` transforms so Drizzle output aligns with Effect string utilities.
- `packages/iam/infra/AGENTS.md:103` — Downstream guidance already points contributors to run `@beep/db-admin` tests for Docker-backed validation, so keep messaging consistent when updating this package.

## Tooling & Docs Shortcuts
- `jetbrains__list_directory_tree` — `{"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","directoryPath":"packages/_internal/db-admin","maxDepth":2}`
- `jetbrains__search_in_files_by_text` — `{"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","searchText":"@beep/db-admin","maxUsageCount":200}`
- `effect_docs__effect_docs_search` — `{"query":"Layer scoped provide Merge"}`
- `effect_docs__get_effect_doc` — `{"documentId":7093}`
- `effect_docs__get_effect_doc` — `{"documentId":7062}`
- `context7__resolve-library-id` — `{"libraryName":"drizzle-orm"}`
- `context7__get-library-docs` — `{"context7CompatibleLibraryID":"/llmstxt/orm_drizzle_team-llms.txt","tokens":2000,"topic":"migrations generate"}`

## Authoring Guardrails
- Always import Effect modules with namespace bindings (`Effect`, `Layer`, `F`, `A`, `Str`, `O`, etc.); never fall back to native array/string/object helpers in scripts, tests, or docs.
- Treat `AdminDb.AdminDb.Live` as the single entrypoint for admin DB access—if a new tool needs direct Drizzle clients, expose them through the Context tag rather than instantiating new connections.
- Migrations must be generated through `bun run db:generate` so the SQL and journal stay in sync; manual edits belong in `--custom` migrations committed alongside generated ones.
- `PgContainer` assumes Docker is available; respect `pgContainerPreflight` skip reasons and guard your tests with the same pattern to keep CI stable (`packages/_internal/db-admin/test/pg-container.ts:91`).
- The `db:reset` script references `src/scripts/ResetDatabase.ts`, which is not yet present—either add the implementation before wiring it into docs or remove the script to avoid dead references during onboarding.
- When layering repositories, reuse slice Layers from `@beep/iam-infra` and `@beep/documents-infra` instead of duplicating repository construction (see `packages/_internal/db-admin/test/pg-container.ts:234`).
- Coordinate with `packages/shared/tables/AGENTS.md` and `packages/core/db/AGENTS.md` so schema or repo guidance is not duplicated; link out rather than restating cross-slice rules.
- Keep this package `_internal`—it must never be declared as a dependency of other workspaces. Consumers should pull schemas through their slice barrels or `@beep/core-db` layers instead.

## Quick Recipes
- **Merge the admin database Layer into a tooling runtime**
```ts
import { AdminDb } from "@beep/db-admin/Db";
import { DocumentsDb } from "@beep/documents-infra/db";
import { IamDb } from "@beep/iam-infra/db";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Layer from "effect/Layer";

const ToolRuntime = Layer.mergeAll(
  AdminDb.AdminDb.Live,
  DocumentsDb.DocumentsDb.Live,
  IamDb.IamDb.Live
);

const confirmMigration = Effect.gen(function* () {
  const adminDb = yield* AdminDb.AdminDb;
  const rows = yield* adminDb.db.select().from(adminDb.schema.user);
  return F.pipe(rows, A.head);
});
```
- **Locate a seeded user inside a Drizzle result using Effect collections**
```ts
import { AdminDb } from "@beep/db-admin/Db";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";

const findUserByEmail = (email: string) =>
  Effect.gen(function* () {
    const adminDb = yield* AdminDb.AdminDb;
    const rows = yield* adminDb.db.select().from(adminDb.schema.user);
    return F.pipe(
      rows,
      A.findFirst((row) => row.email === email)
    );
  });
```
- **Spin up the Postgres Testcontainer inside a Bun test layer**
  ```ts
  import { PgContainer } from "@beep/db-admin/test/pg-container";
  import * as Effect from "effect/Effect";
  import * as Layer from "effect/Layer";

  export const withPg = Layer.mergeAll(
    PgContainer.Live,
    Layer.effectDiscard(Effect.logDebug("booting pg container"))
  );
  ```

## Verifications
- `bun run check --filter @beep/db-admin`
- `bun run lint --filter @beep/db-admin`
- `bun run test --filter @beep/db-admin`
- `bun run db:generate`
- `bun run db:migrate`

## Contributor Checklist
- [ ] Regenerate migrations (`bun run db:generate`) after modifying schema exports and inspect the resulting SQL for unintended diffs.
- [ ] Keep `src/schema.ts` aligned with slice schema barrels—add or remove exports when new vertical slices appear.
- [ ] Update `PgContainer` seed logic if schema migrations add mandatory columns to seeded tables (`packages/_internal/db-admin/test/pg-container.ts:222`).
- [ ] Document any new admin tooling here and cross-link sibling AGENTS guides when behavior spans multiple packages.
- [ ] Ensure Docker-dependent tests remain guardrailed by `pgContainerPreflight` skip logic before pushing.
