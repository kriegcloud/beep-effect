# @beep/drizzle

Product-neutral Drizzle execution capability for Effect services. The package owns driver-level execution,
transaction boundaries, native Drizzle Effect interop, and technical error normalization.

## Installation

```bash
bun add @beep/drizzle
```

## Service Layer

```ts
import { Drizzle, type DrizzleClient } from "@beep/drizzle"
import { Effect } from "effect"

const client: DrizzleClient = {
  execute: (statement, parameters) =>
    Effect.succeed([
      {
        statement,
        parameters
      }
    ]),
  withTransaction: (use) => use(client)
}

const program = Effect.gen(function* () {
  const drizzle = yield* Drizzle
  const rows = yield* drizzle.execute("select * from documents where id = $1", ["doc_123"])

  return yield* drizzle.withTransaction((transaction) =>
    transaction.execute("select * from documents where id = $1", [rows.length])
  )
})

const runnable = program.pipe(Effect.provide(Drizzle.makeLayer(client)))
```

`DrizzleClient` is intentionally narrow. Runtime adapters can wrap Postgres, SQLite, PGLite, or another
Drizzle-backed boundary as long as they expose `execute` and `withTransaction` through Effects.

## Native Drizzle Interop

```ts
import { installDrizzleEffectYieldables } from "@beep/drizzle/interop"
import { Effect, type Effect as EffectType } from "effect"

class QueryBase {
  constructor(private readonly result: string) {}

  execute() {
    return Effect.succeed(this.result)
  }
}

interface QueryBase extends EffectType.Effect<string> {
  readonly commit: () => EffectType.Effect<string>
}

installDrizzleEffectYieldables(QueryBase)

const program = Effect.gen(function* () {
  const query = new QueryBase("ok")
  const yielded = yield* query
  const committed = yield* query.commit()

  return { yielded, committed }
})
```

`installDrizzleEffectYieldables` is idempotent and preserves an existing `commit` method. When a query
base does not already define `commit`, the installed fallback delegates to `execute`.

## Error Normalization

```ts
import { DrizzleError } from "@beep/drizzle"
import * as O from "effect/Option"

const cause = new Error("Failed query: select * from documents where id = $1\nparams: doc_123,opaque")
const error = DrizzleError.fromUnknown("execute", cause)

const query = O.getOrThrow(error.query)
const params = O.getOrThrow(error.params)

void query
void params
```

`DrizzleError.fromUnknown` preserves explicit query context first, then falls back to native Drizzle
Effect query errors or Drizzle's failed-query message text. Fallback message params are kept as one
opaque diagnostic value so comma-bearing values are not split incorrectly.

## Development

```bash
bun run check
bun run test
bun run docgen
bun run lint
```

Unit tests stay outside `test/integration`; package integration tests live under `test/integration` and use
`bun run test:integration`. Tests and dtslint files import package source through `@beep/drizzle` or other
`@beep/*` aliases. Use relative imports only for local helpers, fixtures, and snapshots.

## License

MIT
