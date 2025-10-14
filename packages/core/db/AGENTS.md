# @beep/core-db — Agent Guide

## Purpose & Fit
- Provides Postgres connectivity layers built on `@effect/sql-pg`, wiring environment-driven configuration and exponential retry logic so slices can boot reliably (`packages/core/db/src/db.factory.ts:37`).
- Normalizes CRUD orchestration through `Repo.make`, wrapping Drizzle models with Effect spans, schema validation, and `DbError` tagging for consistent telemetry (`packages/core/db/src/Repo.ts:58`).
- Centralizes database error detection by mapping Drizzle and Postgres failures to tagged errors that downstream services can pattern-match without losing diagnostics (`packages/core/db/src/errors.ts:151`).
- Bridges Rocicorp Zero mutators into the Effect runtime to keep real-time sync handlers type-safe across Bun and Node deployments (`packages/core/db/src/zero-effect/server/pg.ts:198`).

## Surface Map
- `db.factory.ts` — exposes `Db.layer`, `Db.Live`, and `Db.make`. Handles Config access, retry policy (limited to `SqlError`), transaction scoping, and query helpers (`packages/core/db/src/db.factory.ts:53`).
- `Repo.ts` — builds span-aware repositories on top of `SqlSchema.*` adapters, guarantees non-empty bulk inserts, and merges contributor-provided extras into the repo API (`packages/core/db/src/Repo.ts:75`).
- `errors.ts` & `postgres/postgres-error.enum.ts` — detect nested `PostgresError` causes, wrap `DrizzleQueryError`, and classify codes via enums consumed through `DbError.match` (`packages/core/db/src/errors.ts:94`).
- `sql-pg-bun/PgClient.ts` & `PgMigrator.ts` — Bun-native SQL client/migrator with `Redacted` credentials, JSON transformers, and observability attributes (`packages/core/db/src/sql-pg-bun/PgClient.ts:61`).
- `dialect/postgres/*` — typed error + connection helpers shared by Bun and Node clients (`packages/core/db/src/dialect/postgres/PgClient.errors.ts:1`).
- `zero-effect/*` — wraps Zero transactions with Effect tagging, converts mutators to promises, and provides schema-specific stores (`packages/core/db/src/zero-effect/client.ts:90`).
- `types.ts` — shared aliases for `ExecuteFn`, `Transaction`, `TransactionContextShape`, and `ConnectionOptions` (`packages/core/db/src/types.ts:3`).

## Usage Snapshots
- IAM slice provides its database layer by re-exporting `Db.make`’s service effect (`packages/iam/infra/src/db/Db.ts:10`).
- The server runtime merges slice DB layers and contributes them to the global `Db.Live` layer (`packages/runtime/server/src/server-runtime.ts:75`).
- IAM repositories extend the base repo factory to add slice-specific accessors while inheriting telemetry and error semantics (`packages/iam/infra/src/adapters/repos/User.repo.ts:11`).
- Database admin tests provision Pg containers by layering `Db.Live` with slice-specific repos to exercise migrations end-to-end (`packages/_internal/db-admin/test/pg-container.ts:242`).

## Tooling & Docs Shortcuts
- `context7__resolve-library-id` — `{"libraryName":"effect"}`
- `context7__get-library-docs` — `{"context7CompatibleLibraryID":"/effect-ts/effect","tokens":2000,"topic":"Layer"}`
- `effect_docs__effect_docs_search` — `{"query":"SqlSchema single update effect mapError"}`
- `effect_docs__get_effect_doc` — `{"documentId":4325}`

## Authoring Guardrails
- Keep Effect imports namespaced (`Effect`, `Layer`, `A`, `Str`, etc.) and avoid native array/string/object helpers when extending the package (mirror existing span helpers in `Repo.ts`).
- Do not bypass `Db.Live`’s retry logic—new layers must compose through `PgClient.layer` or provide equivalent scheduling that only retries `SqlError` (`packages/core/db/src/db.factory.ts:53`).
- Extend `PostgresErrorEnum` + `PostgresErrorTypeEnum` before adding new constraint handling; `DbError.match` assumes the enum covers every code you emit (`packages/core/db/src/errors.ts:180`).
- Use `TransactionContext` rather than manually invoking Drizzle transactions so repo code inherits the async bridge already vetted for Cause handling (`packages/core/db/src/db.factory.ts:117`).
- When augmenting repo extras, prefer `Effect.Service` accessors and avoid leaking raw Drizzle clients—route everything through `ExecuteFn` or `transaction` utilities (`packages/core/db/src/Repo.ts:210`).
- In Zero adapters, always pass the runtime you expect to run mutators on; skipping this breaks telemetry and auth checks during mutation processing (`packages/core/db/src/zero-effect/server/drizzle-effect.ts:644`).

- **Provision a slice database layer**
  ```ts
  import { Db } from "@beep/core-db";
  import { serverEnv } from "@beep/core-env/server";
  import * as Context from "effect/Context";
  import * as Effect from "effect/Effect";
  import * as Layer from "effect/Layer";

  const { serviceEffect } = Db.make(SliceSchema);

  export class SliceDb extends Context.Tag("@beep/slice/Db")<SliceDb, Db.Db<typeof SliceSchema>>() {
    static readonly Live = Layer.scoped(this, serviceEffect.pipe(Effect.orDie));
  }

  export const SliceDbConfigured = Layer.provide(
    SliceDb.Live,
    Db.layer({
      url: serverEnv.db.pg.url,
      ssl: serverEnv.db.pg.ssl,
    })
  );
  ```
- **Compose a repo with custom queries**
  ```ts
  import { Db, Repo } from "@beep/core-db";
  import { SharedEntityIds } from "@beep/shared-domain";
  import { Entities } from "@beep/iam-domain";
  import * as Effect from "effect/Effect";
  import * as F from "effect/Function";
  import * as Str from "effect/String";

  export class UserRepo extends Effect.Service<UserRepo>()("@beep/iam/UserRepo", {
    effect: Repo.make(
      SharedEntityIds.UserId,
      Entities.User.Model,
      Effect.gen(function* () {
        const db = yield* SliceDb; // SliceDb tag from the layer recipe above
        const searchByEmail = db.makeQuery((execute, email) =>
          execute((client) =>
            client.query.user.findFirst({
              where: (table, { eq }) => eq(table.email, F.pipe(email, Str.toLowerCase)),
            })
          )
        );
        return { searchByEmail };
      })
    ),
  }) {}
  ```
- **Convert Zero mutators to promises with a managed runtime**
  ```ts
  import { convertEffectMutatorsToPromise } from "@beep/core-db/zero-effect/client";
  import * as Effect from "effect/Effect";
  import * as Runtime from "effect/Runtime";

  const runtime = Runtime.defaultRuntime;
  // Provide additional services with Runtime.provideService(...) before converting if needed.

  const effectMutators = {
    accounts: {
      updateName: (tx, payload) =>
        Effect.gen(function* () {
          const normalized = yield* Effect.succeed(payload.name);
          yield* tx.mutate.accounts.update({ id: payload.id, name: normalized });
        }),
    },
  };

  export const promiseMutators = convertEffectMutatorsToPromise(effectMutators, runtime);
  ```

## Verifications
- `bun run check --filter @beep/core-db`
- `bun run lint --filter @beep/core-db`
- `bun run test --filter @beep/core-db`

## Contributor Checklist
- [ ] Schema alignment: update `packages/_internal/db-admin` migrations when `Repo` models change.
- [ ] Error coverage: extend Postgres enums + tests when introducing new constraint handling.
- [ ] Layer hygiene: ensure new services compose through `Db.layer`, `Db.Live`, or scoped equivalents.
- [ ] Telemetry: preserve span naming conventions established in `Repo.make`.
- [ ] Tooling: run verification commands above; add Vitest coverage beyond the current placeholder when touching critical code paths.
