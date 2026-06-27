---
name: effect-sql-testing-v4
description: Testing patterns for Effect SQL v4 with @effect/vitest, testcontainers, transaction rollback, Layer.mock, and SqlResolver batching. Use when testing database code, repositories, SqlResolver, or writing integration tests in Effect v4. Triggers on effect/unstable/sql test, SqlClient test, PgClient test, SqlResolver test, testcontainers, transaction rollback, database test.
---

# Effect SQL Testing (v4 / effect-smol)

Testing patterns for `effect/unstable/sql` and `@effect/sql-pg` in Effect v4.

> **See also**: Load the `effect-sql-v4` skill for the full SQL API reference, and `effect-testing` for general Effect testing patterns.

## CRITICAL: v4 Service Layer Patterns

In v4, `Effect.Service` is replaced by `ServiceMap.Service`. There is no `Default`, `DefaultWithoutDependencies`, or `dependencies` option. Layers are built explicitly with `Layer.effect(this, this.make)`.

### Defining a Repository

```ts
import { Effect, Layer, ServiceMap } from "effect";
import { SqlClient, SqlSchema } from "effect/unstable/sql";

class UserRepo extends ServiceMap.Service<UserRepo, {
  readonly insert: (request: typeof User.insert.Type) => Effect.Effect<User>;
  readonly findById: (id: UserId) => Effect.Effect<User, UserNotFoundError>;
}>()("UserRepo", {
  make: Effect.gen(function*() {
    const sql = yield* SqlClient.SqlClient;
    // ... build queries
    return { insert, findById };
  }),
}) {
  static layer = Layer.effect(this, this.make).pipe(
    Layer.provide(PgLive),
  );
}
```

### Building Test Layers

Since there is no `Default` or `DefaultWithoutDependencies`, construct the layer from `make` and provide test dependencies:

```ts
// Layer.effect(Service, Service.make) creates a layer from the make effect
// Then provide test deps instead of production deps
const TestLive = Layer.effect(UserRepo, UserRepo.make).pipe(
  Layer.provide(PgContainer.ClientLive),
);
```

The `make` property is the raw constructor effect with its requirements exposed in the type. Production layers wire in production deps via `Layer.provide`. Test layers wire in test deps the same way.

### Layer Naming Convention

Treat names like `layer`, `Live`, `layerTest`, and `ClientLive` as local conventions. Effect itself does not require one naming style:

| Purpose            | Name                  |
| ------------------ | --------------------- |
| Primary layer      | `Service.layer`       |
| Test layer         | `Service.layerTest`   |
| Config-based layer | `Service.layerConfig` |

## Testcontainers Setup

### Container Service

```ts
import { PgClient } from "@effect/sql-pg";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
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
      });
    }),
  ).pipe(Layer.provide(this.layer));

  static ClientTransformLive = Layer.unwrap(
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

### Shared Container via globalSetup

For faster test suites, start one container for all tests:

```ts
// vitest.global-setup.ts
import { PostgreSqlContainer, StartedPostgreSqlContainer } from "@testcontainers/postgresql";

let container: StartedPostgreSqlContainer;

export async function setup({ provide }: { provide: (key: string, value: unknown) => void; }) {
  container = await new PostgreSqlContainer("postgres:alpine").start();
  provide("dbUrl", container.getConnectionUri());
}

export async function teardown() {
  await container?.stop();
}
```

```ts
// test/utils.ts
import { PgClient } from "@effect/sql-pg";
import { Layer, Redacted } from "effect";
import { inject } from "vitest";

export const SharedPgClientLive = PgClient.layer({
  url: Redacted.make(inject("dbUrl")),
});
```

## Using it.layer for Database Tests

```ts
import { it } from "@effect/vitest";
import { Effect } from "effect";
import { SqlClient } from "effect/unstable/sql";

it.layer(PgContainer.ClientLive, { timeout: "30 seconds" })("UserRepo", (it) => {
  it.effect("creates and retrieves user", () =>
    Effect.gen(function*() {
      const sql = yield* SqlClient.SqlClient;

      yield* sql`CREATE TABLE users (id SERIAL PRIMARY KEY, name TEXT NOT NULL)`;
      yield* sql`INSERT INTO users (name) VALUES ('Alice')`;

      const rows = yield* sql`SELECT * FROM users WHERE name = 'Alice'`;
      expect(rows[0].name).toBe("Alice");
    }));
});
```

## Transaction Rollback in Tests

### Fail-and-Ignore Pattern

The canonical v4 pattern uses `Effect.fail` inside `withTransaction` piped to `Effect.ignore`:

```ts
it.effect("withTransaction rollback", () =>
  Effect.gen(function*() {
    const sql = yield* SqlClient.SqlClient;

    yield* sql`INSERT INTO test (name) VALUES ('hello')`.pipe(
      Effect.andThen(Effect.fail("boom")),
      sql.withTransaction,
      Effect.ignore,
    );

    const rows = yield* sql`SELECT * FROM test`;
    assert.deepStrictEqual(rows, []);
  }));
```

### Nested Transaction Rollback (SAVEPOINTs)

Inner transactions use SAVEPOINTs. Rolling back inner leaves outer intact:

```ts
it.effect("nested rollback", () =>
  Effect.gen(function*() {
    const sql = yield* SqlClient.SqlClient;

    yield* sql`INSERT INTO test (name) VALUES ('outer')`.pipe(
      Effect.andThen(() =>
        sql`INSERT INTO test (name) VALUES ('inner')`.pipe(
          Effect.andThen(Effect.fail("boom")),
          sql.withTransaction,
          Effect.ignore,
        )
      ),
      sql.withTransaction,
    );

    const rows = yield* sql`SELECT * FROM test`;
    assert.strictEqual(rows.length, 1);
  }));
```

### Exit-Based Rollback Assertion

Use `Effect.exit` to assert the transaction failed without losing the error:

```ts
it.effect("transaction rolls back on error", () =>
  Effect.gen(function*() {
    const sql = yield* SqlClient.SqlClient;

    const result = yield* sql.withTransaction(
      Effect.gen(function*() {
        yield* sql`INSERT INTO users ${sql.insert({ name: "Alice" })}`;
        return yield* Effect.fail("rollback");
      }),
    ).pipe(Effect.exit);

    if (Exit.isSuccess(result)) assert.fail("should not succeed");

    const rows = yield* sql`SELECT * FROM users`;
    assert.deepStrictEqual(rows, []);
  }));
```

## Testing SqlResolver

### ordered (1:1 batch)

```ts
it.effect("ordered resolver batches inserts", () =>
  Effect.gen(function*() {
    const sql = yield* SqlClient.SqlClient;
    const batches: Array<ReadonlyArray<string>> = [];

    const Insert = SqlResolver.ordered({
      Request: Schema.String,
      Result: Schema.Struct({ id: Schema.Number, name: Schema.String }),
      execute: (names) => {
        batches.push(names);
        return sql`INSERT INTO test ${sql.insert(names.map((name) => ({ name })))} RETURNING *`;
      },
    });

    const execute = SqlResolver.request(Insert);
    const result = yield* Effect.all(
      { one: execute("one"), two: execute("two") },
      { concurrency: "unbounded" },
    );

    assert.deepStrictEqual(result, {
      one: { id: 1, name: "one" },
      two: { id: 2, name: "two" },
    });
    assert.deepStrictEqual(batches, [["one", "two"]]);
  }));
```

### findById

```ts
it.effect("findById resolver", () =>
  Effect.gen(function*() {
    const sql = yield* SqlClient.SqlClient;

    const FindById = SqlResolver.findById({
      Id: Schema.Number,
      Result: Schema.Struct({ id: Schema.Number, name: Schema.String }),
      ResultId: (result) => result.id,
      execute: (ids) => sql`SELECT * FROM test WHERE id IN ${sql.in(ids)}`,
    });

    const execute = SqlResolver.request(FindById);
    const result = yield* Effect.all(
      {
        one: execute(1),
        two: execute(2),
      },
      { concurrency: "unbounded" },
    );

    assert.deepStrictEqual(result, {
      one: { id: 1, name: "name1" },
      two: { id: 2, name: "name2" },
    });

    const missing = yield* execute(999).pipe(Effect.flip);
    assert.strictEqual(missing._tag, "NoSuchElementError");
  }));
```

### grouped (many results per request)

```ts
it.effect("grouped resolver", () =>
  Effect.gen(function*() {
    const sql = yield* SqlClient.SqlClient;

    const FindByName = SqlResolver.grouped({
      Request: Schema.String,
      RequestGroupKey: (name) => name,
      Result: Schema.Struct({ id: Schema.Number, name: Schema.String }),
      ResultGroupKey: (result) => result.name,
      execute: (names) => sql`SELECT * FROM test WHERE name IN ${sql.in(names)}`,
    });

    const execute = SqlResolver.request(FindByName);
    const result = yield* Effect.all(
      {
        alice: execute("alice"),
        bob: execute("bob"),
      },
      { concurrency: "unbounded" },
    );

    assert.strictEqual(result.alice.length, 2);
    assert.strictEqual(result.bob.length, 1);

    const missing = yield* execute("nobody").pipe(Effect.flip);
    assert.strictEqual(missing._tag, "NoSuchElementError");
  }));
```

## Testing Streaming

```ts
import { Chunk, Stream } from "effect";

it.effect("stream query results", () =>
  Effect.gen(function*() {
    const sql = yield* SqlClient.SqlClient;

    const rows = yield* sql`SELECT generate_series(1, 3)`.stream.pipe(
      Stream.runCollect,
      Effect.map(Chunk.toReadonlyArray),
    );

    assert.deepStrictEqual(rows, [
      { generate_series: 1 },
      { generate_series: 2 },
      { generate_series: 3 },
    ]);
  }));
```

## Layer.mock for Partial Service Mocking

Mock only the methods your test needs. Unimplemented methods become defects:

```ts
import { Layer } from "effect";

const MockUserRepo = Layer.mock(UserRepo)({
  findById: (id) => Effect.succeed(Option.some(new User({ id, name: "Mock", age: 30 }))),
});

it.effect("uses mocked repo", () =>
  Effect.gen(function*() {
    const repo = yield* UserRepo;
    const user = yield* repo.findById(1);
    assert.deepStrictEqual(Option.map(user, (u) => u.name), Option.some("Mock"));
  }).pipe(Effect.provide(MockUserRepo)));
```

### Dynamic Mock with Effect

```ts
const DynamicMock = Layer.unwrap(
  Effect.gen(function*() {
    const now = yield* DateTime.now;
    return Layer.mock(AuditService)({
      log: (event) => Effect.succeed({ ...event, timestamp: now }),
    });
  }),
);
```

### Side-Effect Tracking

```ts
let calls: Array<unknown> = [];

const TrackingMock = Layer.mock(UserRepo, {
  _tag: "UserRepo",
  insert: (user) =>
    Effect.sync(() => {
      calls.push(user);
      return new User({ id: 1, ...user });
    }),
});

beforeEach(() => {
  calls = [];
});
```

## Composing Test Layers for Services

### Service with `make`

```ts
class UserRepo extends ServiceMap.Service<UserRepo, {
  readonly insert: (request: typeof User.insert.Type) => Effect.Effect<User>
  readonly findById: (id: UserId) => Effect.Effect<Option.Option<User>>
}>()("UserRepo", {
  make: Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient
    const insertUser = SqlSchema.single({ ... })
    const findUserById = SqlSchema.findOne({ ... })
    return { insert: insertUser, findById: findUserById }
  }),
}) {
  static layer = Layer.effect(this, this.make).pipe(
    Layer.provide(PgLive),
  )

  static layerTest = Layer.effect(this, this.make).pipe(
    Layer.provide(PgContainer.ClientLive),
  )
}

it.layer(UserRepo.layerTest, { timeout: "30 seconds" })("UserRepo", (it) => {
  it.effect("insert", () =>
    Effect.gen(function* () {
      const repo = yield* UserRepo
      // ...
    }),
  )
})
```

### Ad-Hoc Test Layer (no static property)

```ts
const TestLive = Layer.effect(UserRepo, UserRepo.make).pipe(
  Layer.provide(PgContainer.ClientLive),
);
```

### Multiple Services Sharing a Database

```ts
const TestLive = Layer.mergeAll(
  Layer.effect(UserRepo, UserRepo.make),
  Layer.effect(OrderRepo, OrderRepo.make),
).pipe(
  Layer.provideMerge(MigrationLayer),
  Layer.provideMerge(PgContainer.ClientLive),
);

it.layer(TestLive, { timeout: "30 seconds" })("Repositories", (it) => {
  it.effect("cross-repo query", () =>
    Effect.gen(function*() {
      const users = yield* UserRepo;
      const orders = yield* OrderRepo;
      // ...
    }));
});
```

### Full Mock (no database)

```ts
class UserRepo extends ServiceMap.Service<UserRepo, { ... }>()("UserRepo", {
  make: Effect.gen(function* () { ... }),
}) {
  static layerMock = Layer.succeed(this, {
    insert: () => Effect.succeed(new User({ id: 1, name: "Mock", age: 30 })),
    findById: () => Effect.succeed(Option.none()),
  })
}
```

## Migration Layer for Tests

Run migrations once per test layer setup:

```ts
import { PgMigrator } from "@effect/sql-pg";
import { Layer } from "effect";

const MigrationLayer = Layer.effectDiscard(
  PgMigrator.run({
    loader: PgMigrator.fromFileSystem(path.join(__dirname, "../migrations")),
  }),
);

const TestLive = Layer.mergeAll(
  Layer.effect(UserRepo, UserRepo.make),
  Layer.effect(OrderRepo, OrderRepo.make),
).pipe(
  Layer.provideMerge(MigrationLayer),
  Layer.provideMerge(PgContainer.ClientLive),
);
```

## Test Data Isolation

When sharing a database across tests, make test data unique:

```ts
const uniqueEmail = () => `test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;

it.effect("insert unique user", () =>
  Effect.gen(function*() {
    const repo = yield* UserRepo;
    const user = yield* repo.insert(
      User.insert.make({ name: "Test", email: uniqueEmail() }),
    );
    expect(user.name).toBe("Test");
  }));
```

## Testing LISTEN/NOTIFY

```ts
import { PgClient } from "@effect/sql-pg";
import { Stream } from "effect";

it.effect("listen receives notifications", () =>
  Effect.gen(function*() {
    const sql = yield* PgClient.PgClient;

    const collected: Array<string> = [];

    yield* sql.listen("test_channel").pipe(
      Stream.take(2),
      Stream.tap((msg) => Effect.sync(() => collected.push(msg))),
      Stream.runDrain,
      Effect.fork,
    );

    yield* Effect.sleep("200 millis");

    yield* sql.notify("test_channel", "hello");
    yield* sql.notify("test_channel", "world");

    yield* Effect.sleep("200 millis");

    assert.deepStrictEqual(collected, ["hello", "world"]);
  }));
```

The `Effect.sleep("200 millis")` before notify ensures the listener fiber has started. Use `it.effect` or `it.live` depending on whether the test needs the real clock.
