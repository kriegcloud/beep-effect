# DB Driver Boundary Decisions

This note records the database-driver decisions used by the shared-kernel
Organization proof. It is intentionally docs-only; no driver package is created
in this phase.

## Decisions

- Do not port legacy `DbClient.make` into `packages/shared/server`.
- Do not introduce a generic `Db.make` facade or shared `DatabaseError`.
- Put the future Postgres client runtime in `packages/drivers/postgres` as
  `@beep/postgres`.
- Put future Drizzle execution helpers in `packages/drivers/drizzle` as
  `@beep/drizzle`.
- Prefer specific public names over a generic `Db` facade:
  `PostgresClient.makeLayer`, `PostgresError`, `Drizzle.makeLayer`, and
  `DrizzleError`.
- Keep driver errors technical. Product server repositories translate them into
  product repository or application errors.
- Prefer explicit `withTransaction` callbacks over ambient transaction context.
- Defer `DbRepo.make` until one real repository proves repeated boilerplate.

## Transaction Shape

Driver services expose transaction boundaries as explicit callbacks:

```ts
PostgresClient.makeLayer(client)
Drizzle.makeLayer(client)

Drizzle.withTransaction((transaction) =>
  transaction.execute(statement, parameters)
)
```

Do not model transaction state through ambient fiber context in the driver API.

## Implication For The Organization Proof

The Organization slice proves schema, table metadata, and UI contracts only.
It does not add live database execution, repository helpers, shared server
runtime code, fixtures, or driver implementations.

## Follow-Up Trigger

Revisit `DbRepo.make` only after a real server repository repeats enough
Drizzle boilerplate that a tiny helper or generator template is simpler than
leaving the code local.
