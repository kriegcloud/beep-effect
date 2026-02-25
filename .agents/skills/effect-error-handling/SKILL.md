---
name: effect-error-handling
description: >
  Replacing try/catch, null/undefined, and if/else with Effect patterns.
  Trigger on: error handling, null checks, Option, Match, TaggedErrorClass, try/catch replacement.
version: 0.1.0
status: active
---

# Error Handling, Option, and Match (Effect v4)

## Replacing try/catch

Choose based on what throws:

| Situation | Use | Why |
|-----------|-----|-----|
| Sync code that throws | `Effect.try(() => JSON.parse(raw))` | Wraps sync exceptions |
| Promise that rejects | `Effect.tryPromise({ try: (signal) => fetch(url, { signal }), catch: (e) => new MyError({ cause: e }) })` | Wraps promise rejection with typed error |
| Pure computation | `Result.try(() => parseInt(s))` | No Effect overhead, returns `Result<A, E>` |

### Worked Example: Wrapping a Throwable API

```ts
import { Effect, Schema as S } from "effect"
import { $PackageNameId } from "@beep/identity/packages"

const $I = $PackageNameId.create("relative/path/to/file/from/package/src")

// Step 1: Define a tagged error with Schema annotations.
// WHY: TaggedErrorClass gives you a _tag discriminant for catchTag + Schema encode/decode.
class JsonParseError extends S.TaggedErrorClass<JsonParseError>($I`JsonParseError`)(
  "JsonParseError",
  { input: S.String, message: S.String },
  // WHY: Annotations make errors self-documenting and inspectable.
  $I.annote("JsonParseError", { title: "JSON Parse Error", description: "Failed to parse JSON string" })
) {}

// Step 2: Wrap the throwable call.
// WHY: Effect.try captures the exception and maps it to your tagged error.
const parseJson = Effect.fn("parseJson")(function*(raw: string) {
  return yield* Effect.try({
    try: () => JSON.parse(raw) as unknown,
    catch: (e) => new JsonParseError({ input: raw, message: String(e) })
  })
})

// Step 3: Handle by tag downstream.
const safe = parseJson("bad").pipe(
  Effect.catchTag("JsonParseError", (e) => Effect.succeed({ fallback: true }))
)
```

## Replacing null/undefined with Option

```ts
import * as O from "effect/Option"

// NEVER: return users.find(u => u.id === id) ?? null
// WHY: Option makes the absence case explicit in the type — callers must handle it.
const findUser = (id: string): O.Option<User> =>
  pipe(users, A.findFirst((u) => u.id === id))

// Consuming an Option:
const name = pipe(
  findUser("123"),
  O.map((u) => u.name),
  O.getOrElse(() => "Anonymous")
)
```

**Boundary rule:** `O.fromNullable(externalApi.getUser())` at library boundaries. Never let `null` leak inward.

## Replacing if/else and switch with Match

```ts
import * as Match from "effect/Match"

// NEVER: if (status === "active") ... else if (status === "pending") ...
// WHY: Match provides exhaustiveness checking — the compiler catches missing cases.

// For tagged unions (discriminated by _tag):
const handleEvent = Match.type<AppEvent>().pipe(
  Match.tags({
    UserCreated: (e) => notifyAdmin(e.userId),
    UserDeleted: (e) => cleanupUser(e.userId),
  }),
  Match.exhaustive  // Compile error if a tag is missing
)

// For plain values:
const label = Match.value(statusCode).pipe(
  Match.when(200, () => "OK"),
  Match.when((n) => n >= 400 && n < 500, () => "Client Error"),
  Match.when((n) => n >= 500, () => "Server Error"),
  Match.orElse(() => "Unknown")
)
```

## Verify

1. No `try`/`catch` blocks in your code — grep for `catch (` to confirm.
2. No `null` or `undefined` return types — grep for `: null` and `| undefined`.
3. No `if`/`else` chains longer than 2 branches — all use `Match`.
4. Every error class extends `S.TaggedErrorClass` with Identity-based key and annotations.
