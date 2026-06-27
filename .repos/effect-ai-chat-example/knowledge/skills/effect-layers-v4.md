---
name: effect-layers-v4
description: "Effect v4 services, layers, memoization, composition, and test isolation. Use when defining services with ServiceMap.Service, building layers, wiring dependencies, Layer.fresh, ManagedRuntime, or understanding memoization. Triggers on ServiceMap.Service, ServiceMap.Reference, Layer.effect, Layer.provide, Layer.merge, Layer.fresh, Layer.mock, ManagedRuntime, static layer."
---

# Effect Services & Layers (v4)

## Defining Services

### Function Syntax

For simple services without effectful constructors:

```ts
import { ServiceMap } from "effect";

const Port = ServiceMap.Service<{ readonly port: number; }>("Port");
```

`ServiceMap.Service<Shape>(key)` returns a tag that is both a type-level
identifier and a runtime key. The tag is `Yieldable`, so `yield* Port`
inside `Effect.gen` retrieves the service from context.

### Class Syntax

When the service identity and shape are separate types:

```ts
import { ServiceMap } from "effect";

class Database extends ServiceMap.Service<Database, {
  readonly query: (sql: string) => Effect.Effect<string>;
}>()("Database") {}
```

Type parameters come first via `ServiceMap.Service<Self, Shape>()`, then
the identifier string is passed to the returned constructor `(id)`.

### Class Syntax with `make`

Attach an effectful constructor to the class. The `Shape` is inferred from
the success type of `make`:

```ts
import { Effect, Layer, ServiceMap } from "effect";

const Config = ServiceMap.Service<{ readonly prefix: string; }>("Config");

class Logger extends ServiceMap.Service<Logger>()("Logger", {
  make: Effect.gen(function*() {
    const config = yield* Config;
    return { log: (msg: string) => Effect.log(`[${config.prefix}] ${msg}`) };
  }),
}) {
  static layer = Layer.effect(this, this.make).pipe(
    Layer.provide(Config.layer),
  );
}
```

`make` can be an `Effect<Shape, E, R>` or a function
`(...args) => Effect<Shape, E, R>`. When provided, the class gets a static
`.make` property. Build the layer explicitly with `Layer.effect`.

Wire dependencies with `Layer.provide` directly on the layer definition.
Name the primary layer `layer` and use descriptive suffixes for variants
(`layerTest`, `layerConfig`).

### `make` with Arguments

`make` can be a function that accepts arguments, enabling parameterized
service construction:

```ts
class HttpClient extends ServiceMap.Service<HttpClient>()("HttpClient", {
  make: (baseUrl: string) =>
    Effect.gen(function*() {
      return { get: (path: string) => Effect.succeed(`${baseUrl}${path}`) };
    }),
}) {
  static layer = Layer.effect(this, this.make("https://api.example.com"));
}
```

## Accessing Services

### Generator Yield (Preferred)

```ts
const program = Effect.gen(function*() {
  const db = yield* Database;
  const result = yield* db.query("SELECT 1");
});
```

Explicit, co-located with the rest of your effect logic, makes dependencies
visible at the call site.

### `.use` and `.useSync`

`.use` takes an effectful callback and returns an Effect that requires the
service:

```ts
const program = Database.use((db) => db.query("SELECT 1"));
```

`.useSync` takes a pure callback:

```ts
const port = Config.useSync((c) => c.port);
```

Prefer `yield*` over `.use` in most cases. `.use` makes it easy to
accidentally leak service dependencies into return values. The dependency is
not visible at the call site, making it harder to track what your code
depends on. Reserve `.use` for one-liners where the service is accessed once
and the dependency is obvious.

### `.asEffect()`

Returns `Effect<Shape, never, Identifier>`. Equivalent to `yield*` but
usable outside generators:

```ts
const program = Database.asEffect().pipe(
  Effect.flatMap((db) => db.query("SELECT 1")),
);
```

## References (Services with Defaults)

A `Reference` is a service that always resolves. If not provided in the
service map, it falls back to `defaultValue`. It never appears in the `R`
(requirements) channel of an Effect.

```ts
import { ServiceMap } from "effect";

const LogLevel = ServiceMap.Reference<"info" | "warn" | "error">("LogLevel", {
  defaultValue: () => "info",
});
```

Override in a specific scope by providing a layer:

```ts
const verbose = Layer.succeed(LogLevel, "warn");
```

The default value is computed lazily and cached on first access.

## Building Layers

### `Layer.effect`

The primary constructor. Takes a service tag and an effect that produces the
service implementation. It is the v4 replacement for old scoped layer patterns:

```ts
const layer = Layer.effect(
  Database,
  Effect.gen(function*() {
    const scope = yield* Scope.Scope;
    const pool = yield* Pool.make({/* ... */});
    return { query: (sql) => pool.execute(sql) };
  }),
);
```

Both curried and uncurried calling conventions work:

```ts
Layer.effect(Database, myEffect);
Layer.effect(Database)(myEffect);
```

### `Layer.succeed`

For pure (non-effectful) service values:

```ts
const layer = Layer.succeed(Config, { prefix: "[app]", port: 3000 });
```

### `Layer.effectDiscard`

Run an effect during layer construction without producing a service. Useful
for initialization side effects:

```ts
const init = Layer.effectDiscard(Effect.log("starting up"));
```

### `Layer.effectServices`

Build a layer that provides multiple services from a single effect that
returns a `ServiceMap`:

```ts
const layer = Layer.effectServices(Effect.gen(function*() {
  const conn = yield* makeConnection();
  return ServiceMap.mergeAll(
    ServiceMap.make(Database, { query: conn.query }),
    ServiceMap.make(Cache, { get: conn.cacheGet }),
  );
}));
```

## Layer Composition

### `Layer.merge`: Combine Independent Layers

Produces a layer providing both service sets. Both layers build
independently:

```ts
const AppLayer = DatabaseLayer.pipe(Layer.merge(CacheLayer));
```

Accepts arrays for merging multiple layers at once:

```ts
const AppLayer = DatabaseLayer.pipe(
  Layer.merge([CacheLayer, LoggingLayer, MetricsLayer]),
);
```

### `Layer.provide`: Wire Dependencies

Feeds the output of one layer into the requirements of another without
exposing the dependency to downstream consumers:

```ts
const AppLayer = HttpServerLayer.pipe(
  Layer.provide(DatabaseLayer),
);
```

Accepts arrays:

```ts
const AppLayer = HttpServerLayer.pipe(
  Layer.provide([DatabaseLayer, CacheLayer]),
);
```

### `Layer.provideMerge`: Wire and Expose

Like `Layer.provide`, but the dependency's output is also exposed to
downstream consumers. Use when tests need direct access to the provided
service:

```ts
const TestLayer = AppLayer.pipe(
  Layer.provideMerge(MessageStorage.layerMemory),
);
```

### The `static layer` Pattern

The canonical way to define a service with its layer:

```ts
class UserRepo extends ServiceMap.Service<UserRepo>()("UserRepo", {
  make: Effect.gen(function*() {
    const db = yield* Database;
    return {
      findById: (id: string) => db.query(`SELECT * FROM users WHERE id = ${id}`),
    };
  }),
}) {
  static layer = Layer.effect(this, this.make).pipe(
    Layer.provide(Database.layer),
  );
}
```

In tests, build the layer with test dependencies instead:

```ts
const TestUserRepo = Layer.effect(UserRepo, UserRepo.make).pipe(
  Layer.provide(TestDatabase.layer),
);
```

This pattern keeps the service definition, constructor, and layer wiring
co-located. The `make` effect is reusable across different layer
compositions.

## Memoization

### Identity-Based Memoization (Default)

Layers built with `Layer.effect`, `Layer.effectServices`, etc. are
automatically memoized by object identity (reference equality) within a
single build. A `MemoMap` (keyed by layer object reference) tracks what has
been built:

```ts
const layer = Layer.effect(MyService, makeService());

const composed = layer.pipe(Layer.merge(layer));
```

Same layer reference used twice = one instance. The second encounter returns
the cached result from the MemoMap.

Different layer references (even with identical construction logic) produce
separate instances:

```ts
const layer1 = Layer.effect(MyService, makeService());
const layer2 = Layer.effect(MyService, makeService());
const composed = layer1.pipe(Layer.merge(layer2));
```

### `Layer.fresh`: Escape Memoization

Wraps a layer to bypass the MemoMap entirely. The layer is always rebuilt:

```ts
const layer = Layer.effect(MyService, createResource());

const two = layer.pipe(Layer.merge(Layer.fresh(layer)));
```

Only needed when the same layer reference appears multiple times in a
composition and you want separate instances. Factory functions that return
new layer objects on each call do not need `Layer.fresh` because they
already produce different references.

### `Layer.succeed` and `Layer.succeedServices`

These are not memoized (no `MemoMap` interaction) because they are pure.
They return the same value every time with no side effects.

### Memoization Is Per MemoMap

Memoization is tied to the `MemoMap`, not strictly to one build call. Top
level `Layer.build` and top level `it.layer()` create or use a memo map by
default. Reused or ambient memo maps share memoized layer results across
builds.

## ManagedRuntime

Persists a MemoMap across multiple effect runs:

```ts
import { ManagedRuntime } from "effect";

const runtime = ManagedRuntime.make(AppLayer);

await runtime.runPromise(effect1);
await runtime.runPromise(effect2);
```

Both runs share cached layer instances. Access the underlying services:

```ts
const services = await runtime.services();
```

Share a MemoMap across runtimes:

```ts
import { Layer } from "effect";

const sharedMemoMap = Layer.makeMemoMapUnsafe();
const runtime1 = ManagedRuntime.make(layer, { memoMap: sharedMemoMap });
const runtime2 = ManagedRuntime.make(layer, { memoMap: sharedMemoMap });
```

Dispose when done:

```ts
await runtime.dispose();
```

## Test Patterns

### `it.layer()`: Scoped Test Groups

Each top level `it.layer()` block creates a new MemoMap. All tests within the
block share the same layer instance. Nested `it.layer()` blocks reuse the
parent MemoMap:

```ts
import { it } from "@effect/vitest";

it.layer(TestLayer)("feature tests", (it) => {
  it.effect("reads from database", () =>
    Effect.gen(function*() {
      const db = yield* Database;
      const result = yield* db.query("SELECT 1");
      expect(result).toBe("1");
    }));

  it.effect("writes to database", () =>
    Effect.gen(function*() {
      const db = yield* Database;
      yield* db.query("INSERT ...");
    }));
});
```

With timeout options:

```ts
it.layer(TestLayer, { timeout: "30 seconds" })("slow tests", (it) => {
  // ...
});
```

### `Layer.mock`: Partial Mocks

Creates a layer with a Proxy-based implementation. Only the methods you
provide are implemented. Unimplemented methods throw at runtime:

```ts
const MockDatabase = Layer.mock(Database)({
  query: () => Effect.succeed("mocked"),
});
```

### Isolated Test Groups

Different `it.layer()` blocks get completely isolated layer instances:

```ts
describe("Feature A", () => {
  const TestLayer = makeTestLayer({ optionA: true })

  it.layer(TestLayer)("tests", (it) => {
    it.effect("test 1", () => /* shares layer with test 2 */)
    it.effect("test 2", () => /* shares layer with test 1 */)
  })
})

describe("Feature B", () => {
  const TestLayer = makeTestLayer({ optionB: true })

  it.layer(TestLayer)("tests", (it) => {
    it.effect("test 3", () => /* completely isolated from Feature A */)
  })
})
```

### Test Layer Wiring

Reuse the `make` effect from production services, swap in test dependencies:

```ts
const TestDatabase = Layer.effect(Database, Database.make).pipe(
  Layer.provide(TestConfig.layer),
);

const TestApp = Layer.effect(UserRepo, UserRepo.make).pipe(
  Layer.provide(TestDatabase),
);

it.layer(TestApp)("user repo", (it) => {
  it.effect("finds users", () =>
    Effect.gen(function*() {
      const repo = yield* UserRepo;
      const user = yield* repo.findById("1");
      expect(user).toBeDefined();
    }));
});
```

## ServiceMap Utilities

Build and manipulate service maps directly (rarely needed outside library
code):

```ts
import { ServiceMap } from "effect";

const map = ServiceMap.make(Database, dbImpl);

const merged = ServiceMap.mergeAll(
  ServiceMap.make(Database, dbImpl),
  ServiceMap.make(Cache, cacheImpl),
);

const db = ServiceMap.get(map, Database);

const extended = ServiceMap.add(map, Cache, cacheImpl);
```

`ServiceMap.pick` and `ServiceMap.omit` narrow or exclude services from an
existing map:

```ts
const dbOnly = map.pipe(ServiceMap.pick(Database));
const withoutCache = merged.pipe(ServiceMap.omit(Cache));
```

## Quick Reference

| Task                      | Pattern                                                     |
| ------------------------- | ----------------------------------------------------------- |
| Define a service (simple) | `ServiceMap.Service<Shape>(id)`                             |
| Define a service (class)  | `class Foo extends ServiceMap.Service<Foo, Shape>()(id) {}` |
| Define with constructor   | `ServiceMap.Service<Foo>()(id, { make })`                   |
| Build layer from make     | `static layer = Layer.effect(this, this.make)`              |
| Wire dependencies         | `.pipe(Layer.provide(Dep.layer))`                           |
| Access in generator       | `const foo = yield* Foo`                                    |
| One-liner access          | `Foo.use((f) => f.method())`                                |
| Sync one-liner            | `Foo.useSync((f) => f.prop)`                                |
| Service with default      | `ServiceMap.Reference<T>(id, { defaultValue })`             |
| Pure layer                | `Layer.succeed(tag, value)`                                 |
| Escape memoization        | `Layer.fresh(layer)`                                        |
| Partial mock              | `Layer.mock(tag)({ method: () => Effect.succeed(...) })`    |
| Test layer from make      | `Layer.effect(Foo, Foo.make).pipe(Layer.provide(testDeps))` |
| Scoped test group         | `it.layer(layer)("name", (it) => { ... })`                  |
