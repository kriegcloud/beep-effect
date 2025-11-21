# @beep/db-admin — migrations, schema barrel, and Postgres harness

Admin-facing bundle for Drizzle migrations, schema aggregation, and testable Postgres layers. Lives under `_internal` so apps pull schemas through their own slice barrels while tooling and CI share a single migration source of truth.

## What this package provides
- **Schema barrel** (`src/schema.ts`) re-exports IAM, Files, Tasks, and Comms Drizzle tables for `drizzle-kit`.
- **Admin Layer** (`src/Db/AdminDb.ts`) wraps `@beep/core-db` so tooling can merge a migrations-aware DB into Effect runtimes.
- **Generated SQL & journal** (`drizzle/**`) kept in sync via `bun run db:generate`.
- **Postgres test harness** (`test/container.ts`) spins a container with `pg_uuidv7`, applies migrations, and exposes a Pg client Layer for repository tests.
- **TypeScript builds** (`build/**`) produced by `tsc` + Babel transforms; do not edit generated output directly.

## When to reach for it
- Running migrations or schema pushes from CI or local dev without duplicating Drizzle config.
- Assembling tooling runtimes (seeders, data scrubbers, admin CLIs) that need the full schema plus the admin DB layer.
- Integration tests that must apply real migrations inside an ephemeral Postgres instance.
- Never add this package as a dependency of shipping apps; keep it `_internal` and rely on slice barrels or `@beep/core-db` instead.

## Quickstart
1) Set `DB_PG_URL` in the repo `.env` (used by drizzle-kit).
2) From `packages/_internal/db-admin` run:
   - `bun run db:generate` — regenerate SQL + journal from the schema barrel.
   - `bun run db:migrate` — apply migrations to the database pointed to by `DB_PG_URL`.
   - `bun run db:push` — synchronize schema without generating SQL (use sparingly; prefer migrations).
   - `bun run db:studio` — open drizzle-kit studio (requires `DB_PG_URL`).
3) Optional: `bun run test` to execute the container-backed smoke tests (Docker required).

## Using the Admin DB Layer in tooling
```ts
import { AdminDb } from "@beep/db-admin/Db";
import { IamDb } from "@beep/iam-infra/db";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Layer from "effect/Layer";

const ToolRuntime = Layer.mergeAll(
  AdminDb.AdminDb.Live,
  IamDb.IamDb.Live
);

export const listUserEmails = Effect.gen(function* () {
  const adminDb = yield* AdminDb.AdminDb;
  const rows = yield* adminDb.db.select().from(adminDb.schema.user);
  return F.pipe(rows, A.map((row) => row.email));
});
```
- Reach for `AdminDb.AdminDb.Live` when you need migrations-aware connections in seeds or diagnostics.
- Pull tables from `adminDb.schema` instead of importing slice schemas directly to keep migrations aligned.

## Postgres container harness for tests
- `test/container.ts` provisions Postgres 15 + `pg_uuidv7`, runs `drizzle` migrations, and exposes `PgContainer.Live`.
- Example (Bun test):
```ts
import { PgContainer } from "@beep/db-admin/test/container";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

const TestRuntime = Layer.mergeAll(PgContainer.Live);

export const checkHealth = Effect.gen(function* () {
  const { container } = yield* PgContainer;
  yield* Effect.logInfo(container.getConnectionUri());
}).pipe(Effect.provide(TestRuntime));
```
- Docker must be available; guard your tests with the container preflight if you add new suites.

## Notes and gotchas
- Keep `drizzle.config.ts` pointed at `src/schema.ts`; update the barrel when slices add/remove tables.
- `db:reset` references `src/scripts/ResetDatabase.ts` which is not yet present—do not rely on it until implemented.
- Generated files under `build/**` and `drizzle/**` should only change via the scripts above.
- Respect Effect import patterns (namespace imports, `pipe` + `effect/Array` / `effect/String`) in any snippets or new code added here.
