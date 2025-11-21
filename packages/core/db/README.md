# @beep/core-db — Postgres + Zero layers

Effect-first database toolkit that wires Postgres, Drizzle, and Rocicorp Zero into reusable Layers. It centralizes connection policy, tagged errors, repo factories, and Zero mutator bridges so slices can compose DB services without duplicating orchestration.

## Purpose and fit
- Provide `Db.layer` and `Db.Live` with retry and telemetry baked in (only retries `SqlError`).
- Normalize CRUD through `Repo.make`, enforcing schema-safe queries, spans, and `DbError` tagging.
- Map Postgres/Drizzle failures into discriminated errors for pattern matching and logging.
- Bridge Zero mutators to Effect runtimes for Bun/Node parity.

## Public surface map
- `Db/Db.ts` — `Db.make`, `Db.layer`, `Db.Live`, transaction helpers.
- `Repo/Repo.ts` — repo factory with span-aware queries and non-empty bulk insert guarantees.
- `errors.ts` + `postgres/postgres-error.enum.ts` — error classifiers and matchers.
- `drizzleEffect.ts` — Drizzle helpers for query execution and tracing.
- `zero-effect/*` — Zero client/server wrappers that turn mutators into typed Effects or Promises.
- `types.ts` — shared aliases for connections, transactions, and execution helpers.

## Quickstart — configure a slice database
```ts
import { Db } from "@beep/core-db";
import { serverEnv } from "@beep/core-env/server";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as S from "effect/Schema";

const Tables = {
  account: {
    Model: S.Struct({
      id: S.String,
      email: S.String,
    }),
  },
};

const { serviceEffect } = Db.make(Tables);

export class AccountDb extends Context.Tag("@beep/example/AccountDb")<
  AccountDb,
  Db.Db<typeof Tables>
>() {
  static readonly Live = Layer.scoped(this, serviceEffect.pipe(Effect.orDie));
}

export const AccountDbConfigured = Layer.provide(
  AccountDb.Live,
  Db.layer({
    url: serverEnv.db.pg.url,
    ssl: serverEnv.db.pg.ssl,
  })
);
```

## Quickstart — add a repo with custom queries
```ts
import { Db, Repo } from "@beep/core-db";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Str from "effect/String";
import * as S from "effect/Schema";
import { AccountDb } from "./db.layer";

export const AccountRepo = Repo.make(
  S.String,
  S.Struct({ id: S.String, email: S.String }),
  Effect.gen(function* () {
    const db = yield* AccountDb;

    const findByEmail = db.makeQuery((execute, email) =>
      execute((client) =>
        client.query.account.findFirst({
          where: (table, { eq }) =>
            eq(table.email, F.pipe(email, Str.toLowerCase)),
        })
      )
    );

    return { findByEmail };
  })
);
```

## Validation and scripts
- `bun run check --filter @beep/core-db`
- `bun run lint --filter @beep/core-db`
- `bun run test --filter @beep/core-db`
- `bun run build --filter @beep/core-db` (before publishing)

## Notes and guardrails
- Import Effect modules with namespaces (`Effect`, `Layer`, `A`, `Str`, etc.) and avoid native array/string/object helpers.
- Compose new services through `Db.layer`/`Db.Live` so retry and tracing stay coherent.
- Extend Postgres enums when handling new constraint codes; keep `DbError.match` exhaustive.
- Keep Zero adapters provided with an explicit runtime to retain telemetry and auth checks.
- See `packages/core/db/AGENTS.md` for deeper patterns, Zero recipes, and contributor checklists.
