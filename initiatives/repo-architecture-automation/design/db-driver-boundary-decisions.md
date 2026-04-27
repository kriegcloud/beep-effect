# DB Driver Boundary Decisions

This note records the locked database-driver boundary decisions used by the
shared-kernel Organization proof and the current `@beep/drizzle` cleanup.
Production database capability is `@beep/postgres` plus `@beep/drizzle`;
`@beep/shared-server` does not become a database runtime bucket.

## Decisions

- Do not port legacy `Db.make`, `DbClient.make`, shared-domain
  `DatabaseError`, or shared-server `DbRepo.make`.
- Keep runtime capability in `packages/drivers/postgres` as `@beep/postgres`
  and `packages/drivers/drizzle` as `@beep/drizzle`.
- Expose root driver APIs by default, for example
  `import { Drizzle, DrizzleError } from "@beep/drizzle"`.
- Use one public `DrizzleError` tagged error with `operation` and optional
  `cause`.
- Delete or reject the drifted public Drizzle error surfaces:
  `DrizzleProviderError`, `ProviderError`, `ORMError`, and `QueryError`.
- Keep the future `PostgresError` technical and operation-scoped, with optional
  SQLSTATE, constraint, and other database diagnostics when known.
- Keep driver errors technical. Product server repositories translate them into
  product-named repository or application errors before crossing use-case ports.
- Make `Drizzle.makeLayer(client)` accept a narrow product-neutral Drizzle
  adapter. Composition decides whether that adapter came from Postgres.
- Prefer explicit Effect-native `withTransaction` callbacks over ambient
  transaction context.
- Defer any `DbRepo.make` successor until two real repositories prove repeated
  boilerplate; prefer a generator/template over a runtime factory unless the
  code proves otherwise.
- Leave `@beep/pglite` unchanged in this slice. It is not promoted to
  first-class production database doctrine by this decision.

## Transaction Shape

Driver services expose transaction boundaries as explicit callbacks:

```ts
PostgresClient.makeLayer(client)
Drizzle.makeLayer(client)

Drizzle.withTransaction((transaction) =>
  transaction.execute(statement, parameters)
)
```

The callback returns an Effect and receives an explicit transaction handle. Do
not model transaction state through ambient fiber context in the driver API.

## Rejected Symbols

Do not reintroduce these symbols without a new architecture decision:

- `Db.make`
- `DbClient.make`
- `DatabaseError`
- `DbRepo.make`
- `DrizzleProviderError`
- `ProviderError`
- `ORMError`
- `QueryError`

## Implication For The Organization Proof

The Organization slice proves schema, table metadata, and UI contracts only. It
does not add live database execution, repository helpers, shared server runtime
code, fixtures, or product repository implementations.

## Follow-Up Trigger

Revisit a `DbRepo.make` successor only after two real server repositories repeat
enough Drizzle boilerplate that a tiny helper or generator template is simpler
than leaving the code local.
