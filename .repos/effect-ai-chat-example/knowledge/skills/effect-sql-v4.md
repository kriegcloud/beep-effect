---
name: effect-sql-v4
description: Effect SQL v4 patterns with effect/unstable/sql and @effect/sql-pg. Use when working with database code, repositories, SQL queries, migrations, SqlResolver, SqlModel, or PostgreSQL in Effect v4. Triggers on effect/unstable/sql, SqlClient, PgClient, SqlSchema, SqlResolver, SqlModel, migration.
---

# Effect SQL (v4 / effect-smol)

Patterns for database access using `effect/unstable/sql` and `@effect/sql-pg` in Effect v4.

## Prefer SqlSchema For Runtime Validated Queries

Use `SqlSchema` when you want request and result validation at runtime. Plain typed `sql<A>\`...\`` statements are also valid when runtime schema validation is not needed:

```ts
// valid typed statement without runtime validation
sql<{ id: string; name: string; }>`SELECT * FROM users`;

// runtime validated query
SqlSchema.findAll({
  Request: Schema.Void,
  Result: UserModel,
  execute: () => sql`SELECT * FROM users`,
});
```

Use `SqlSchema` for runtime validation. Use plain typed statements when that is enough.

## Imports

SQL modules live under `effect/unstable/sql`. PgClient is a separate package.

```ts
import { PgClient, PgMigrator } from "@effect/sql-pg";
import { Model } from "effect/unstable/schema";
import {
  Migrator,
  SqlClient,
  SqlError,
  SqlModel,
  SqlResolver,
  SqlSchema,
  Statement,
} from "effect/unstable/sql";
```

## SqlSchema Methods

v4 uses `SchemaError` (not `ParseError`).

```ts
SqlSchema.findAll({
  Request: Schema.Schema,
  Result: Schema.Schema,
  execute: (encodedRequest) => sql`...`,
});
// Returns: (request) => Effect<Array<A>, E | SchemaError>

SqlSchema.findNonEmpty({
  Request: Schema.Schema,
  Result: Schema.Schema,
  execute: (encodedRequest) => sql`...`,
});
// Returns: (request) => Effect<NonEmptyArray<A>, E | SchemaError | NoSuchElementError>

SqlSchema.findOne({
  Request: Schema.Schema,
  Result: Schema.Schema,
  execute: (encodedRequest) => sql`...`,
});
// Returns: (request) => Effect<A, E | SchemaError | NoSuchElementError>

SqlSchema.findOneOption({
  Request: Schema.Schema,
  Result: Schema.Schema,
  execute: (encodedRequest) => sql`...`,
});
// Returns: (request) => Effect<Option<A>, E | SchemaError>

SqlSchema.void({
  Request: Schema.Schema,
  execute: (encodedRequest) => sql`...`,
});
// Returns: (request) => Effect<void, E | SchemaError>
```

| Method          | Returns            | Fails on empty             |
| --------------- | ------------------ | -------------------------- |
| `findAll`       | `Array<A>`         | No (returns `[]`)          |
| `findNonEmpty`  | `NonEmptyArray<A>` | Yes (`NoSuchElementError`) |
| `findOne`       | `A`                | Yes (`NoSuchElementError`) |
| `findOneOption` | `Option<A>`        | No (returns `None`)        |
| `void`          | `void`             | N/A                        |

## SqlClient

`SqlClient` is defined via `ServiceMap.Service` (not `Context.Tag`):

```ts
export const SqlClient = ServiceMap.Service<SqlClient>("effect/sql/SqlClient");
```

The client IS the template literal tag (it extends `Constructor`):

```ts
const sql = yield * SqlClient.SqlClient;
const rows = yield * sql`SELECT * FROM users WHERE id = ${id}`;
```

Statements are effects. They extend `Effect.Effect<ReadonlyArray<A>, SqlError>` directly.

### SqlClient Methods

```ts
const sql = yield * SqlClient.SqlClient;

sql`SELECT ...`; // Statement<A> (is an Effect)
sql.safe; // client copy for SafeQL style tooling
sql.withoutTransforms(); // client without row transforms
sql.reserve; // Effect<Connection, SqlError, Scope>
sql.withTransaction(effect); // wraps effect in a transaction
sql.reactive(keys, effect); // Stream that re-runs on key changes
sql.reactiveMailbox(keys, effect); // Dequeue that re-runs on key changes
```

## PostgreSQL Client Configuration

### Production Layer

```ts
import { PgClient } from "@effect/sql-pg";
import { Config, Effect, Layer, Redacted, String } from "effect";

export const PgLive = Layer.unwrap(
  Effect.gen(function*() {
    const env = yield* Config.literal("local")("ENV").pipe(
      Config.orElse(() => Config.succeed("prod" as const)),
    );
    const ssl = env !== "local" ? { rejectUnauthorized: false } : false;
    const databaseUrl = yield* Config.redacted("DATABASE_URL");

    return PgClient.layer({
      url: databaseUrl,
      ssl,
      idleTimeout: "10 seconds",
      connectTimeout: "10 seconds",
      transformQueryNames: String.camelToSnake,
      transformResultNames: String.snakeToCamel,
      transformJson: true,
    });
  }),
).pipe(Layer.orDie);
```

`PgClient.layer` provides both `PgClient` AND `SqlClient` services.

### PgClient Config Options

```ts
PgClient.layer({
  url?: Redacted.Redacted,
  host?: string,
  port?: number,
  database?: string,
  username?: string,
  password?: Redacted.Redacted,
  ssl?: boolean | ConnectionOptions,
  idleTimeout?: DurationInput,
  connectTimeout?: DurationInput,
  maxConnections?: number,
  minConnections?: number,
  connectionTTL?: DurationInput,
  path?: string,
  stream?: boolean,
  spanAttributes?: Readonly<Record<string, unknown>>,
  types?: Record<number, { parse: (value: string) => unknown }>,
  applicationName?: string,
  transformResultNames?: (str: string) => string,
  transformQueryNames?: (str: string) => string,
  transformJson?: boolean,
})
```

### Layer from Existing Pool

```ts
import * as Pg from "pg";

PgClient.layerFromPool({
  acquire: Effect.acquireRelease(
    Effect.sync(() => new Pg.Pool({ connectionString: url })),
    (pool) => Effect.promise(() => pool.end()),
  ),
  transformResultNames: String.snakeToCamel,
  transformQueryNames: String.camelToSnake,
});
```

### Test Layer with Testcontainers

```ts
import { PgClient } from "@effect/sql-pg";
import { Data, Effect, Layer, Redacted, ServiceMap, String } from "effect";

class ContainerError extends Data.TaggedError("ContainerError")<{
  cause: unknown;
}> {}

class PgContainer extends ServiceMap.Service<PgContainer, {
  readonly getConnectionUri: () => string;
}>()("test/PgContainer", {
  make: Effect.acquireRelease(
    Effect.tryPromise({
      try: () => new PostgreSqlContainer("postgres:alpine").start(),
      catch: (cause) => new ContainerError({ cause }),
    }),
    (container) => Effect.promise(() => container.stop()),
  ),
}) {
  static layer = Layer.effect(this, this.make);

  static ClientLive = Layer.unwrap(
    Effect.gen(function*() {
      const container = yield* PgContainer;
      return PgClient.layer({
        url: Redacted.make(container.getConnectionUri()),
        transformResultNames: String.snakeToCamel,
        transformQueryNames: String.camelToSnake,
      });
    }),
  ).pipe(Layer.provide(this.layer));
}
```

## Query Patterns with SqlSchema

### SqlSchema.findOne

```ts
const findById = SqlSchema.findOne({
  Request: Schema.Struct({ id: UserId, orgId: OrgId }),
  Result: UserModel,
  execute: ({ id, orgId }) =>
    sql`
    SELECT * FROM users
    WHERE id = ${id} AND organization_id = ${orgId}
  `,
});

const user = yield * findById({ id, orgId });
```

### SqlSchema.findOneOption

```ts
const findByEmail = SqlSchema.findOneOption({
  Request: Schema.String,
  Result: UserModel,
  execute: (email) =>
    sql`
    SELECT * FROM users WHERE email = ${email}
  `,
});

const maybeUser = yield * findByEmail("user@example.com");
```

### SqlSchema.findAll

Returns `Array<A>`. Returns empty array if no rows found.

```ts
const listByOrg = SqlSchema.findAll({
  Request: Schema.Struct({ orgId: OrgId, limit: Schema.Number }),
  Result: UserModel,
  execute: ({ orgId, limit }) =>
    sql`
    SELECT * FROM users
    WHERE organization_id = ${orgId}
    LIMIT ${limit}
  `,
});

const users = yield * listByOrg({ orgId, limit: 100 });
```

### SqlSchema.findNonEmpty

Returns `NonEmptyArray<A>`. Fails with `NoSuchElementError` if no rows found.

```ts
const listActiveByOrg = SqlSchema.findNonEmpty({
  Request: Schema.Struct({ orgId: OrgId }),
  Result: UserModel,
  execute: ({ orgId }) =>
    sql`
    SELECT * FROM users
    WHERE organization_id = ${orgId} AND active = true
  `,
});
```

### SqlSchema.void

```ts
const deleteUser = SqlSchema.void({
  Request: Schema.Struct({ id: UserId, orgId: OrgId }),
  execute: ({ id, orgId }) =>
    sql`
    DELETE FROM users
    WHERE id = ${id} AND organization_id = ${orgId}
  `,
});

yield * deleteUser({ id, orgId });
```

## SQL Template Helpers

```ts
const sql = yield* SqlClient.SqlClient

// Safe parameter interpolation
sql`SELECT * FROM users WHERE id = ${userId}`

// Dynamic identifiers (escaped table/column names)
sql`SELECT * FROM ${sql("users")} WHERE ${sql("name")} = ${name}`

// Insert single or multiple rows
sql`INSERT INTO accounts ${sql.insert({ name, accountType })}`
sql`INSERT INTO accounts ${sql.insert([row1, row2, row3])}`
sql`INSERT INTO users ${sql.insert({ name, email }).returning("*")}`

// Update
sql`UPDATE accounts SET ${sql.update({ name, accountType })} WHERE id = ${id}`
sql`UPDATE users SET ${sql.update(request, ["id", "orgId"])} WHERE id = ${request.id}`
sql`UPDATE users SET ${sql.update({ name }).returning("*")}`

// Update values (batch update, NOT sqlite)
sql`UPDATE people SET name = data.name FROM ${
  sql.updateValues([{ name: "Tim" }, { name: "John" }], "data")
}`

// IN clause helper
sql`SELECT * FROM accounts WHERE id IN ${sql.in(ids)}`
// empty `ids` here compiles to `()`
sql`DELETE FROM users WHERE ${sql.in("id", userIds)}`
// empty `userIds` here becomes `1=0`

// AND / OR combinators (fallback: 1=1 when empty)
sql`SELECT * FROM accounts WHERE ${sql.and([
  sql`company_id = ${companyId}`,
  sql`active = true`,
])}`
sql`SELECT * FROM accounts WHERE ${sql.or([cond1, cond2])}`

// CSV (for ORDER BY, GROUP BY)
sql.csv(["col1", "col2"])
sql.csv("ORDER BY", ["col1", "col2"])

// Raw SQL (use sparingly)
sql.unsafe("SELECT * FROM users")
sql.literal("NOW()")

// Dialect branching
sql.onDialect({ pg: () => ..., sqlite: () => ..., mysql: () => ..., mssql: () => ..., clickhouse: () => ... })
sql.onDialectOrElse({ pg: () => ..., orElse: () => ... })
```

### Statement Properties

```ts
sql`SELECT * FROM users`.stream; // Stream<A, SqlError>
sql`SELECT * FROM users`.raw; // raw driver result
sql`SELECT * FROM users`.values; // rows as arrays
sql`SELECT * FROM users`.unprepared; // skip prepared statements
sql`SELECT * FROM users`.withoutTransform; // rows without name transforms
sql`SELECT * FROM users`.compile(); // [sqlString, params] tuple
```

Statement extends `Effect.Effect<ReadonlyArray<A>, SqlError>` directly, so `yield* sql\`...\``works in generators. In callback based APIs,`.asEffect()` can still be useful.

## Transactions

```ts
const sql = yield * SqlClient.SqlClient;

yield * sql.withTransaction(
  Effect.gen(function*() {
    yield* sql`INSERT INTO orders ${sql.insert(order)}`;
    yield* sql`UPDATE inventory SET quantity = quantity - ${qty} WHERE id = ${itemId}`;
  }),
);

// Nested transactions automatically use SAVEPOINTs
yield * sql.withTransaction(
  Effect.gen(function*() {
    yield* sql`INSERT INTO ...`;
    yield* sql.withTransaction(
      sql`INSERT INTO ...`, // SAVEPOINT
    );
  }),
);
```

## Model System

Define domain models with variant schemas. Model lives under `effect/unstable/schema`.

### Model.Class

```ts
import { Schema } from "effect";
import { Model } from "effect/unstable/schema";

const GroupId = Schema.Number.pipe(Schema.brand("GroupId"));

class Group extends Model.Class<Group>("Group")({
  id: Model.Generated(GroupId),
  name: Schema.NonEmptyTrimmedString,
  createdAt: Model.DateTimeInsertFromDate,
  updatedAt: Model.DateTimeUpdateFromDate,
}) {}

Group; // select schema (all fields)
Group.insert; // omits Generated fields (id)
Group.update; // includes Generated fields
Group.json; // JSON API schema
Group.jsonCreate; // omits Generated + GeneratedByApp
Group.jsonUpdate; // omits Generated + GeneratedByApp
```

### Field Modifiers

| Modifier                  | select            | insert            | update            | json                      | jsonCreate                | jsonUpdate                |
| ------------------------- | ----------------- | ----------------- | ----------------- | ------------------------- | ------------------------- | ------------------------- |
| `Model.Generated(s)`      | yes               | no                | yes               | yes                       | no                        | no                        |
| `Model.GeneratedByApp(s)` | yes               | yes               | yes               | yes                       | no                        | no                        |
| `Model.Sensitive(s)`      | yes               | yes               | yes               | no                        | no                        | no                        |
| `Model.FieldOption(s)`    | `Option` via null | `Option` via null | `Option` via null | optional or null `Option` | optional or null `Option` | optional or null `Option` |
| `Model.JsonFromString(s)` | parseJson         | parseJson         | parseJson         | object                    | object                    | object                    |

### DateTime Field Modifiers

All DateTime modifiers auto-generate the current time on insert (and on update for Update variants).

| Modifier                         | DB format | Insert   | Update   |
| -------------------------------- | --------- | -------- | -------- |
| `Model.DateTimeInsert`           | string    | auto-now | omitted  |
| `Model.DateTimeInsertFromDate`   | Date      | auto-now | omitted  |
| `Model.DateTimeInsertFromNumber` | number    | auto-now | omitted  |
| `Model.DateTimeUpdate`           | string    | auto-now | auto-now |
| `Model.DateTimeUpdateFromDate`   | Date      | auto-now | auto-now |
| `Model.DateTimeUpdateFromNumber` | number    | auto-now | auto-now |

### UUID Field Modifier

`Model.UuidV4Insert` works with a branded `Uint8Array` schema and auto-generates UUID v4 bytes on insert:

```ts
class Token extends Model.Class<Token>("Token")({
  id: Model.UuidV4Insert(TokenId),
  name: Schema.String,
}) {}
```

Here `TokenId` should be a branded `Schema.Uint8Array` schema.

## SqlModel (CRUD from Model schemas)

### SqlModel.makeRepository

Creates simple CRUD operations from a Model. Requires `SqlClient`.

```ts
import { SqlModel } from "effect/unstable/sql"

const repo = yield* SqlModel.makeRepository(User, {
  tableName: "users",
  spanPrefix: "UserRepo",
  idColumn: "id",
})

repo.insert(User.insert.make({ name: "Alice", email: "alice@example.com" }))
repo.insertVoid(User.insert.make({ name: "Bob", email: "bob@example.com" }))
repo.update(User.update.make({ id: userId, name: "Alice Updated" }))
repo.updateVoid(User.update.make({ id: userId, name: "Alice Updated" }))
repo.findById(userId)    // Effect<User, NoSuchElementError | SchemaError | SqlError>
repo.delete(userId)
```

### SqlModel.makeDataLoaders

Creates batched CRUD operations using SqlResolver. Requires `SqlClient | Scope`.

```ts
const loaders = yield* SqlModel.makeDataLoaders(User, {
  tableName: "users",
  spanPrefix: "UserLoader",
  idColumn: "id",
  window: "50 millis",
  maxBatchSize: 100,
})

loaders.insert(User.insert.make({ ... }))
loaders.insertVoid(User.insert.make({ ... }))
loaders.findById(userId)
loaders.delete(userId)
```

## SqlResolver (Batched Request Resolvers)

Resolvers return `RequestResolver` directly (not effects). Use `SqlResolver.request(resolver)` to create the execute function.

### SqlResolver.ordered

1:1 mapping. Results must match request count and order.

```ts
const InsertResolver = SqlResolver.ordered({
  Request: InsertPersonSchema,
  Result: Person,
  execute: (requests) => sql`INSERT INTO people ${sql.insert(requests)} RETURNING people.*`,
});

const insertPerson = SqlResolver.request(InsertResolver);

const [john, joe] = yield * Effect.all(
  [insertPerson({ name: "John" }), insertPerson({ name: "Joe" })],
  { concurrency: "unbounded" },
);
```

### SqlResolver.findById

Returns `Res["Type"]` directly. Missing rows fail with `NoSuchElementError`.

```ts
const GetByIdResolver = SqlResolver.findById({
  Id: Schema.Number,
  Result: Person,
  ResultId: (result) => result.id,
  execute: (ids) => sql`SELECT * FROM people WHERE id IN ${sql.in(ids)}`,
});

const getPersonById = SqlResolver.request(GetByIdResolver);
const person = yield * getPersonById(42);
```

### SqlResolver.grouped

Many results per request, grouped by key. Returns `NonEmptyArray<A>` per group. Missing groups fail with `NoSuchElementError`.

```ts
const GetByNameResolver = SqlResolver.grouped({
  Request: Schema.String,
  RequestGroupKey: (name) => name,
  Result: Person,
  ResultGroupKey: (result) => result.name,
  execute: (names) => sql`SELECT * FROM people WHERE name IN ${sql.in(names)}`,
});

const getPersonsByName = SqlResolver.request(GetByNameResolver);
```

### SqlResolver.void

Side-effect only (no result decoding).

```ts
const DeleteByIdResolver = SqlResolver.void({
  Request: Schema.Number,
  execute: (ids) => sql`DELETE FROM people WHERE id IN ${sql.in(ids)}`,
});

const deletePerson = SqlResolver.request(DeleteByIdResolver);
```

### Configuring Resolvers

Resolvers are `RequestResolver` values. Use `RequestResolver` combinators for batching config:

```ts
import { RequestResolver } from "effect"

const resolver = SqlResolver.findById({ ... }).pipe(
  RequestResolver.setDelay("50 millis"),
  RequestResolver.batchN(100),
  RequestResolver.withSpan("PersonRepo.findById"),
)

const findById = SqlResolver.request(resolver)
```

## Repository as ServiceMap.Service

In v4, services use `ServiceMap.Service`. There is no `Default` layer or `dependencies` option. Build layers explicitly with `Layer.effect(this, this.make)`.

```ts
import { Effect, Layer, ServiceMap } from "effect";
import { SqlClient, SqlSchema } from "effect/unstable/sql";

class UserRepo extends ServiceMap.Service<UserRepo, {
  readonly insert: (request: typeof User.insert.Type) => Effect.Effect<User>;
  readonly findById: (id: UserId, orgId: OrgId) => Effect.Effect<User, UserNotFoundError>;
}>()("UserRepo", {
  make: Effect.gen(function*() {
    const sql = yield* SqlClient.SqlClient;

    const insertQuery = SqlSchema.findOne({
      Request: User.insert,
      Result: User,
      execute: (request) =>
        sql`
        INSERT INTO users ${sql.insert(request).returning("*")}
      `,
    });

    const findByIdQuery = SqlSchema.findOne({
      Request: Schema.Struct({ id: UserId, orgId: OrgId }),
      Result: User,
      execute: ({ id, orgId }) =>
        sql`
        SELECT * FROM users
        WHERE id = ${id} AND organization_id = ${orgId}
      `,
    });

    return {
      insert: (request: typeof User.insert.Type) =>
        insertQuery(request).pipe(
          Effect.catchTags({
            SchemaError: Effect.die,
            SqlError: Effect.die,
            NoSuchElementError: Effect.die,
          }),
        ),
      findById: (id: UserId, orgId: OrgId) =>
        findByIdQuery({ id, orgId }).pipe(
          Effect.catchTags({
            SchemaError: Effect.die,
            SqlError: Effect.die,
            NoSuchElementError: () => new UserNotFoundError({ id }),
          }),
        ),
    };
  }),
}) {
  static layer = Layer.effect(this, this.make).pipe(
    Layer.provide(PgLive),
  );
}
```

## Error Handling Patterns

### Convert to defects (internal errors)

v4 uses `SchemaError` (not `ParseError`):

```ts
const insertUser = (request: typeof User.insert.Type) =>
  insert(request).pipe(
    Effect.catchTags({
      SchemaError: Effect.die,
      SqlError: Effect.die,
    }),
  );
```

### Convert to domain errors

```ts
const findById = (id: UserId, orgId: OrgId) =>
  findByIdQuery({ id, orgId }).pipe(
    Effect.catchTags({
      SchemaError: Effect.die,
      SqlError: Effect.die,
      NoSuchElementError: () => new UserNotFoundError({ id }),
    }),
  );
```

## Schema.fromJsonString for JSON Columns

Use `Schema.fromJsonString` in Result schemas to parse JSON from the
database, and in Request schemas to encode objects to JSON strings for
storage:

```ts
const ResultSchema = Schema.Struct({
  id: UserId,
  name: Schema.String,
  variants: Schema.fromJsonString(Schema.Array(Variant)),
  metadata: Schema.NullOr(Schema.fromJsonString(MetadataSchema)),
});

const findWithVariants = SqlSchema.findOne({
  Request: Schema.Struct({ id: ExperimentId }),
  Result: ResultSchema,
  execute: ({ id }) =>
    sql`
    SELECT
      e.id, e.name,
      COALESCE(JSON_AGG(v.*), '[]')::text AS variants,
      e.metadata::text AS metadata
    FROM experiments e
    LEFT JOIN variants v ON v.experiment_id = e.id
    WHERE e.id = ${id}
    GROUP BY e.id
  `,
});
```

### Storing JSON (Request side)

```ts
const InsertChat = Schema.Struct({
  id: ChatId,
  config: Schema.fromJsonString(
    Schema.Struct({ model: Schema.String, temperature: Schema.Number }),
  ),
  segments: Schema.fromJsonString(Schema.Array(Segment)),
});

const insertChat = SqlSchema.findOne({
  Request: InsertChat,
  Result: ChatModel,
  execute: (request) =>
    sql`
    INSERT INTO chats ${sql.insert(request).returning("*")}
  `,
});

yield * insertChat({
  id: chatId,
  config: { model: "gpt-4", temperature: 0.7 },
  segments: [{ type: "text", content: "hello" }],
});
```

### `toCodecJson` for Non-JSON-Safe Types

If your schema contains types that are not JSON-safe (e.g., `Date`,
`BigInt`, `DateTime`), wrap with `Schema.toCodecJson` first. This is the
canonical pattern used by KeyValueStore and persistence layers:

```ts
const codec = Schema.fromJsonString(Schema.toCodecJson(mySchema));
```

`fromJsonString` alone does NOT apply JSON-safe transformations. Without
`toCodecJson`, `Date` fields will fail to round-trip through JSON.

### Model.JsonFromString

In Model.Class, `Model.JsonFromString` stores as text in DB but exposes the object type in JSON variants:

```ts
class Chat extends Model.Class<Chat>("Chat")({
  id: Model.Generated(ChatId),
  config: Model.JsonFromString(
    Schema.Struct({ model: Schema.String, temperature: Schema.Number }),
  ),
}) {}
```

## PostgreSQL JSON Parameters

PgClient exposes a `json` method for wrapping values as jsonb parameters. This is PgClient-specific, not on the base Constructor:

```ts
const sql = yield * PgClient.PgClient;

sql`INSERT INTO people ${sql.insert({ name: "Tim", data: sql.json({ a: 1 }) })}`;
```

## PostgreSQL LISTEN/NOTIFY

```ts
const sql = yield * PgClient.PgClient;

yield * sql.listen("channel_name").pipe(
  Stream.tap((message) => Console.log("Received message", message)),
  Stream.runDrain,
  Effect.forkScoped,
);

yield * sql.notify("channel_name", "Hello, world!");
```

## Migrations

### PgMigrator

```ts
import { PgMigrator } from "@effect/sql-pg";

const runMigrations = PgMigrator.run({
  loader: PgMigrator.fromFileSystem(path.join(__dirname, "./migrations")),
}).pipe(Effect.provide(PgLive));
```

### Migration Loaders

```ts
import { Migrator } from "effect/unstable/sql";

Migrator.fromGlob(import.meta.glob("./migrations/*.ts"));
Migrator.fromBabelGlob(require.context("./migrations"));
Migrator.fromRecord({ "0001_create_users": myEffect });
Migrator.fromFileSystem("/absolute/path");
```

### Migration File Format

`migrations/0001_init.ts`:

```ts
import { Effect } from "effect";
import { SqlClient } from "effect/unstable/sql";

export default Effect.gen(function*() {
  const sql = yield* SqlClient.SqlClient;

  yield* sql`
    CREATE TABLE users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
});
```

## Statement.Transformer

Statement transformation is driven through `Statement.CurrentTransformer`:

```ts
import { Statement } from "effect/unstable/sql";

Layer.succeed(Statement.CurrentTransformer, transformer);
```

## Testing Database Code

In v4, there is no `Default` or `DefaultWithoutDependencies`. Build test layers with `Layer.effect(Service, Service.make)` and provide test dependencies:

```ts
import { it } from "@effect/vitest";
import { Effect, Layer, Option } from "effect";

const TestLive = Layer.effect(UserRepo, UserRepo.make).pipe(
  Layer.provide(PgContainer.ClientLive),
);

it.layer(TestLive, { timeout: "30 seconds" })("UserRepo", (it) => {
  it.effect("insert creates user", () =>
    Effect.gen(function*() {
      const repo = yield* UserRepo;
      const user = yield* repo.insert(
        User.insert.make({ name: "Test", email: "test@example.com" }),
      );
      expect(user.name).toBe("Test");
    }));
});
```

## Common Query Patterns

### CTE for INSERT...RETURNING with JOINs

```ts
sql`
  WITH inserted AS (
    INSERT INTO experiments ${sql.insert(request).returning("*")}
  )
  SELECT e.*, ee.data::text AS "eventData"
  FROM inserted e
  LEFT JOIN experiment_events ee ON e.event_id = ee.id
`;
```

### JSON aggregation for nested data

```ts
sql`
  SELECT
    f.*,
    COALESCE(
      JSON_AGG(
        JSON_BUILD_OBJECT('id', file.id, 'name', file.name)
      ) FILTER (WHERE file.id IS NOT NULL),
      '[]'
    )::text AS files
  FROM folders f
  LEFT JOIN files file ON file.folder_id = f.id
  GROUP BY f.id
`;
```

### Count with pagination

```ts
const [data, countResult] = yield * Effect.zip(
  findManyQuery({ orgId, limit, offset }),
  countQuery(orgId),
  { concurrent: true },
);
```

## Organization Isolation Pattern

Always include `organization_id` in WHERE clauses for multi-tenant data:

```ts
sql`
  SELECT * FROM experiments
  WHERE id = ${id} AND organization_id = ${orgId}
`;
```
