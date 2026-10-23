# Effect development patterns

## Scope and authority

This is the repository's pattern reference for writing Effect code in
beep-effect packages. It is subordinate to
[Effect-first development](../standards/effect-first-development.md), which is
the canonical law, and to [the architecture standard](../standards/ARCHITECTURE.md)
for package topology. The applicable package's `AGENTS.md` still governs work
inside that package.

Every TypeScript example below is compiled by `bun run beep laws markdown-fences --check`.
Examples that show a forbidden form keep it visible and mark the failing line
with `// @ts-expect-error`, so the gate proves the form is rejected.

Disposition recorded 2026-10-23 for #1856 wave 3: rewritten for this
repository. The earlier text was an adapted copy of upstream Effect library
guidance; its library-internal and upstream-command material is gone.

## Forbidden patterns

### Never: try/catch in a generator

Effect generators carry failures in the error channel, not as JavaScript
exceptions. A `try/catch` around `yield*` never sees a typed failure.

```ts
import * as Console from "effect/Console"
import * as Effect from "effect/Effect"

declare const someEffect: Effect.Effect<number, string>

// Wrong: the catch block never runs for a typed failure.
const wrong = Effect.gen(function* () {
  try {
    return yield* someEffect
  } catch (error) {
    return yield* Console.error(error)
  }
})

// Right: read the outcome with Effect.result and branch on it.
const right = Effect.gen(function* () {
  const result = yield* Effect.result(someEffect)
  if (result._tag === "Failure") {
    yield* Console.error("Effect failed:", result.failure)
    return yield* Effect.fail("Handled error")
  }
  return result.success
})
```

### Never: type assertions

Type assertions hide real type errors. Fix the types instead: use generic
parameters and the Effect constructors that model the failure.

```ts
import * as Effect from "effect/Effect"

declare const urlString: string

// Wrong: `as` widens or forges a type the value does not have.
// @ts-expect-error a string is not a number, and an assertion cannot make it one
const forged: number = urlString as number

// Right: a generic parameter keeps the caller's type.
const processValue = <T>(value: T): Effect.Effect<T> => Effect.succeed(value)

// Right: a fallible constructor puts the failure in the error channel.
const safeUrl = Effect.try({
  try: () => new URL(urlString),
  catch: (cause) => `Invalid URL: ${String(cause)}`,
})
```

## Mandatory patterns

### `return yield*` for terminal effects

Always `return yield*` a failure or an interruption. At runtime a bare
`yield* Effect.fail(...)` already stops the generator, but TypeScript cannot
see that: without `return`, the branch looks like it falls through, so values
are not narrowed after it and the reader has to know the runtime rule.
`return yield*` makes the termination visible to both.

```ts
import * as Effect from "effect/Effect"

declare const input: string | undefined
declare const shouldInterrupt: boolean

// Right: termination is explicit, so `input` is narrowed to `string` below.
const checked = Effect.gen(function* () {
  if (input === undefined) {
    return yield* Effect.fail("Input is required")
  }

  if (shouldInterrupt) {
    return yield* Effect.interrupt
  }

  return input.length
})

// Wrong: without `return`, TypeScript still thinks `input` may be undefined.
const unchecked = Effect.gen(function* () {
  if (input === undefined) {
    yield* Effect.fail("Input is required") // Missing return!
  }

  // @ts-expect-error 'input' is possibly 'undefined'
  return input.length
})
```

## Core development patterns

### Sequential composition with `Effect.fn`

Generator functions are always `Effect.fn` (traced) or `Effect.fnUntraced`.

```ts
import * as Console from "effect/Console"
import * as Effect from "effect/Effect"
import * as S from "effect/Schema"

const decodeJson = S.decodeUnknownEffect(S.fromJsonString(S.Unknown))

const processData = Effect.fn("processData")(function* (input: string) {
  if (input.length === 0) {
    return yield* Effect.fail("Input cannot be empty")
  }

  const processed = yield* decodeJson(input)

  yield* Console.log("Processed input", processed)
  return processed
})
```

### `Effect.gen` vs `Effect.fn` vs `Effect.fnUntraced`

| Feature         | `Effect.gen`               | `Effect.fn`                    | `Effect.fnUntraced`            |
|-----------------|----------------------------|--------------------------------|--------------------------------|
| **Purpose**     | One-off effect composition | Reusable effectful functions   | Internal/performance-critical  |
| **Returns**     | `Effect<A, E, R>`          | `(...args) => Effect<A, E, R>` | `(...args) => Effect<A, E, R>` |
| **Tracing**     | Uses parent span           | Creates new span + stack trace | No tracing overhead            |
| **Use case**    | Inline composition         | Public API and service methods | Internal helpers, hot paths    |

#### `Effect.gen`: inline composition

```ts
import * as Effect from "effect/Effect"

type User = { readonly id: string }
declare const fetchUser: (id: string) => Effect.Effect<User>
declare const fetchPosts: (userId: string) => Effect.Effect<ReadonlyArray<string>>

const program = Effect.gen(function* () {
  const user = yield* fetchUser("123")
  const posts = yield* fetchPosts(user.id)
  return { user, posts }
})
```

#### `Effect.fn`: traced reusable functions

```ts
import * as Effect from "effect/Effect"

type User = { readonly id: string }
declare const fetchUser: (id: string) => Effect.Effect<User>
declare const fetchPosts: (userId: string) => Effect.Effect<ReadonlyArray<string>>

// Calling creates a span named "fetchUserPosts" with stack traces.
const fetchUserPosts = Effect.fn("fetchUserPosts")(function* (userId: string) {
  yield* Effect.annotateCurrentSpan("userId", userId)
  const user = yield* fetchUser(userId)
  const posts = yield* fetchPosts(user.id)
  return { user, posts }
})

const program = fetchUserPosts("123")
```

`Effect.fn` also takes pipeable transformations after the function body. HTTP
goes through `effect/http/HttpClient`, never native `fetch`, so the client is an
explicit requirement:

```ts
import * as Effect from "effect/Effect"
import * as HttpClient from "effect/http/HttpClient"

const fetchWithTimeout = Effect.fn("fetchWithTimeout")(
  function* (url: string) {
    return yield* HttpClient.get(url)
  },
  Effect.timeout("5 seconds"),
  Effect.retry({ times: 3 })
)
```

#### `Effect.fnUntraced`: untraced internal helpers

```ts
import * as Effect from "effect/Effect"
import * as Scope from "effect/Scope"

declare const openReader: () => { readonly releaseLock: () => void }

// No span: a helper called many times per operation.
const withReader = Effect.fnUntraced(function* (scope: Scope.Scope) {
  const reader = openReader()
  yield* Scope.addFinalizer(scope, Effect.sync(() => reader.releaseLock()))
  return reader
})
```

#### When to use what

- **`Effect.gen`**: inline composition and one-off programs, or the body of a
  function that is already traced.
- **`Effect.fn`**: reusable effectful functions, public APIs and service
  methods, and anything whose spans and stack traces help debugging.
- **`Effect.fnUntraced`**: internal helpers on hot paths where a span per call
  costs more than it tells.

### Typed errors with `S.TaggedError`

Model failures as schema-backed tagged errors with an identity from the owning
package's composer (`$I`).

```ts
import { $SchemaId } from "@beep/identity/packages"
import * as Effect from "effect/Effect"
import * as HttpClient from "effect/http/HttpClient"
import * as S from "effect/Schema"
import * as Str from "effect/String"

// Use the composer of the package that owns the file.
const $I = $SchemaId.create("relative/path/to/file")

class ValidationError extends S.TaggedError<ValidationError>($I`ValidationError`)(
  "ValidationError",
  {
    field: S.String,
    message: S.String,
  },
  $I.annoteError<ValidationError>("ValidationError", {
    description: "A request field failed validation.",
  })
) {}

class NetworkError extends S.TaggedError<NetworkError>($I`NetworkError`)(
  "NetworkError",
  {
    status: S.Int,
    url: S.String,
  },
  $I.annoteError<NetworkError>("NetworkError", {
    description: "A network request failed.",
  })
) {}

const validateAndFetch = Effect.fn("validateAndFetch")(function* (url: string) {
  if (!Str.startsWith("https://")(url)) {
    return yield* new ValidationError({ field: "url", message: "URL must use HTTPS" })
  }

  const response = yield* HttpClient.get(url).pipe(Effect.mapError(() => new NetworkError({ status: 0, url })))

  if (response.status >= 400) {
    return yield* new NetworkError({ status: response.status, url })
  }

  return response
})
```

### Resource management

Pair every acquisition with its release through `Effect.acquireUseRelease` (or
`Effect.acquireRelease` in a scope).

```ts
import * as Console from "effect/Console"
import * as Effect from "effect/Effect"
import * as S from "effect/Schema"

class DatabaseError extends S.TaggedError<DatabaseError>()("DatabaseError", { cause: S.Defect() }) {}
class QueryError extends S.TaggedError<QueryError>()("QueryError", { query: S.String, cause: S.Defect() }) {}

type User = { readonly name: string }
type Database = {
  readonly query: (sql: string, params: ReadonlyArray<string>) => Promise<User>
  readonly close: () => Promise<void>
}
declare const createDatabaseConnection: () => Promise<Database>

const withDatabase = <A, E>(operation: (db: Database) => Effect.Effect<A, E>): Effect.Effect<A, E | DatabaseError> =>
  Effect.acquireUseRelease(
    Effect.tryPromise({
      try: () => createDatabaseConnection(),
      catch: (cause) => new DatabaseError({ cause }),
    }),
    operation,
    (db) => Effect.promise(() => db.close())
  )

const queryUser = (id: string) =>
  withDatabase(
    Effect.fnUntraced(function* (db: Database) {
      const user = yield* Effect.tryPromise({
        try: () => db.query("SELECT * FROM users WHERE id = ?", [id]),
        catch: (cause) => new QueryError({ query: "users", cause }),
      })

      yield* Console.log(`Found user: ${user.name}`)
      return user
    })
  )
```

### Layer composition

Declare each dependency as a `Context.Service`, implement it as a layer, and
compose the layers once at the entry point.

```ts
import { $SchemaId } from "@beep/identity/packages"
import * as A from "effect/Array"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as S from "effect/Schema"

const $I = $SchemaId.create("relative/path/to/file")

class DatabaseError extends S.TaggedError<DatabaseError>()("DatabaseError", { cause: S.Defect() }) {}
class UserError extends S.TaggedError<UserError>()("UserError", { message: S.String }) {}

class User extends S.Class<User>("User")({ id: S.String, name: S.String }) {}

declare const database: { readonly execute: (sql: string) => Promise<ReadonlyArray<unknown>> }

class DatabaseService extends Context.Service<
  DatabaseService,
  { readonly query: (sql: string) => Effect.Effect<ReadonlyArray<unknown>, DatabaseError> }
>()($I`DatabaseService`) {}

class UserService extends Context.Service<
  UserService,
  { readonly getUser: (id: string) => Effect.Effect<User, UserError | DatabaseError> }
>()($I`UserService`) {}

const DatabaseServiceLive = Layer.succeed(
  DatabaseService,
  DatabaseService.of({
    query: (sql) =>
      Effect.tryPromise({
        try: () => database.execute(sql),
        catch: (cause) => new DatabaseError({ cause }),
      }),
  })
)

const decodeUser = S.decodeUnknownEffect(User)

const UserServiceLive = Layer.effect(
  UserService,
  Effect.gen(function* () {
    const db = yield* DatabaseService

    return UserService.of({
      getUser: Effect.fn("UserService.getUser")(function* (id: string) {
        const rows = yield* db.query(`SELECT * FROM users WHERE id = '${id}'`)
        const row = A.head(rows)
        if (row._tag === "None") {
          return yield* new UserError({ message: "User not found" })
        }
        return yield* decodeUser(row.value).pipe(Effect.mapError(() => new UserError({ message: "Malformed row" })))
      }),
    })
  })
)

const AppLayer = UserServiceLive.pipe(Layer.provide(DatabaseServiceLive))
```

## Development workflow

### Lint after every edit

```bash
# After editing a TypeScript file
bunx biome check --write packages/<family>/<package>/src/ModifiedFile.ts
```

### Validation checkpoint

Run the owning package's gates before handing work back
(`bun run beep quality package-verify <@beep/package>` runs the full set):

```bash
# 1. Lint the modified files
bunx biome check --write packages/<family>/<package>/src/*.ts

# 2. Validate JSDoc examples compile (bounded to the branch diff)
bun run docgen:local

# 3. Check types
bun run --cwd packages/<family>/<package> check

# 4. Run the affected tests
bunx --bun vitest run packages/<family>/<package>/test/ModifiedTest.test.ts
```

### Progressive implementation

Break a feature into validated increments: schema first, then the service
contract, then the implementation.

```ts
import { $SchemaId } from "@beep/identity/packages"
import * as Console from "effect/Console"
import * as Effect from "effect/Effect"
import * as S from "effect/Schema"

const $I = $SchemaId.create("relative/path/to/file")

// Step 1: the data, as a branded Opaque over an annotated Struct.
class FeatureConfig extends S.Opaque<FeatureConfig, { readonly brand: unique symbol }>()(
  S.Struct({
    option1: S.String,
    option2: S.Number,
  }).pipe(
    $I.annoteSchema("FeatureConfig", {
      description: "Configuration for a feature",
    })
  )
) {}

// Step 2: the core implementation.
const createFeature = Effect.fn("createFeature")(function* (
  config: FeatureConfig // nominal through the brand; an unbranded schema class is only structural
) {
  yield* Console.log("Feature created")
  return { config }
})

// Step 3: error handling.
const createFeatureWithValidation = Effect.fn("createFeatureWithValidation")(function* (config: FeatureConfig) {
  if (config.option2 < 0) {
    return yield* Effect.fail("option2 must not be negative")
  }

  return yield* createFeature(config)
})
```

## Integration patterns

### Module export pattern

Each exported symbol carries JSDoc with a titled, compilable example
(`.patterns/jsdoc-documentation.md`), a category and a `@since` tag.

````ts
import * as Effect from "effect/Effect"

/**
 * A configured instance.
 *
 * @category models
 * @since 0.0.0
 */
export interface Instance<A> {
  readonly config: A
}

/**
 * Creates a new instance with the given configuration.
 *
 * **Example** (Create an instance)
 *
 * ```ts
 * import * as Effect from "effect/Effect"
 * import { create } from "@beep/demo/ModuleName"
 *
 * const program = Effect.map(create({ value: 42 }), (instance) => instance.config.value)
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const create = <A>(config: A): Effect.Effect<Instance<A>> => Effect.succeed({ config })

/**
 * Transforms an instance's configuration.
 *
 * **Example** (Double a value)
 *
 * ```ts
 * import * as Effect from "effect/Effect"
 * import { create, map } from "@beep/demo/ModuleName"
 *
 * const program = Effect.flatMap(create(10), (instance) => map(instance, (value) => value * 2))
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export const map = <A, B>(instance: Instance<A>, f: (a: A) => B): Effect.Effect<Instance<B>> =>
  Effect.succeed({ config: f(instance.config) })
````

### Testing integration

Test each export group with `@effect/vitest`; `.patterns/testing-patterns.md`
has the full set of patterns.

```ts
import { assert, describe, it } from "@effect/vitest"
import * as Duration from "effect/Duration"
import * as Effect from "effect/Effect"
import * as Fiber from "effect/Fiber"
import * as TestClock from "effect/testing/TestClock"

const ModuleName = {
  create: <A>(config: A) => Effect.succeed({ config }),
  map: <A, B>(instance: { readonly config: A }, f: (a: A) => B) => Effect.succeed({ config: f(instance.config) }),
  delayedOperation: (delay: Duration.Duration) => Effect.as(Effect.sleep(delay), "completed"),
}

describe("ModuleName", () => {
  describe("constructors", () => {
    it.effect("create initializes with the config", () =>
      Effect.gen(function* () {
        const config = { value: 42 }
        const instance = yield* ModuleName.create(config)

        assert.deepStrictEqual(instance.config, config)
      })
    )
  })

  describe("combinators", () => {
    it.effect("map transforms the instance", () =>
      Effect.gen(function* () {
        const instance = yield* ModuleName.create(10)
        const transformed = yield* ModuleName.map(instance, (value) => value * 2)

        assert.strictEqual(transformed.config, 20)
      })
    )
  })

  describe("time-dependent operations", () => {
    it.effect("completes once the clock moves", () =>
      Effect.gen(function* () {
        const fiber = yield* Effect.forkChild(ModuleName.delayedOperation(Duration.seconds(5)))

        yield* TestClock.adjust(Duration.seconds(5))

        const result = yield* Fiber.join(fiber)
        assert.strictEqual(result, "completed")
      })
    )
  })
})
```
