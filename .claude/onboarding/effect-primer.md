# Effect Primer for beep-effect

This document explains Effect basics for agents who know TypeScript but are new to Effect. Read this before working on any code in this repository.

## Why Effect?

Effect replaces `async/await` and `try/catch` with a system that:
- Tracks errors in the type system (no surprise `catch` blocks)
- Makes dependencies explicit (no hidden globals)
- Composes operations safely (no forgotten `await`)

## The Effect Type

```typescript
Effect<Success, Error, Requirements>
//     A        E      R
```

Every Effect describes a computation that:
- **Success (A)**: The value returned on success
- **Error (E)**: The typed errors that can occur (tracked at compile time)
- **Requirements (R)**: The services/dependencies needed to run

Example type signatures:
```typescript
// Returns string, can fail with NetworkError, needs HttpClient
Effect<string, NetworkError, HttpClient>

// Returns User, can fail with NotFound or DbError, needs Database
Effect<User, NotFound | DbError, Database>

// Returns void, never fails, needs nothing
Effect<void, never, never>
```

## Effect.gen - The Core Pattern

`Effect.gen` is how you write sequential Effect code. It replaces `async/await`:

```typescript
import * as Effect from "effect/Effect";

// EFFECT WAY (used in this codebase)
const program = Effect.gen(function* () {
  const user = yield* getUser(id);      // "unwrap" the Effect
  const posts = yield* getPosts(user);  // errors propagate automatically
  return { user, posts };               // return value becomes Success type
});

// JAVASCRIPT WAY (NOT used in this codebase)
// async function program() {
//   const user = await getUser(id);
//   const posts = await getPosts(user);
//   return { user, posts };
// }
```

Key concepts:
- `function* ()` is a generator function (the `*` is required)
- `yield*` "unwraps" an Effect to get its success value
- Errors propagate automatically (like `throw` but typed)
- The return value becomes the Success type

## yield* Explained

`yield*` is to Effect what `await` is to Promises:

```typescript
// Promise world
const data = await fetchData();  // unwrap Promise<T> to get T

// Effect world
const data = yield* fetchData(); // unwrap Effect<T, E, R> to get T
```

When you `yield*` an Effect:
1. The Effect runs
2. If successful, you get the success value
3. If it fails, the error propagates (no need for try/catch)

```typescript
Effect.gen(function* () {
  // Each yield* can fail - errors propagate automatically
  const config = yield* loadConfig();     // ConfigError
  const db = yield* connectDb(config);    // DbError
  const user = yield* findUser(db, id);   // NotFoundError

  // Type system tracks: ConfigError | DbError | NotFoundError
  return user;
});
```

## Getting Services with yield*

Services are dependencies your code needs. You get them with `yield*`:

```typescript
import * as Effect from "effect/Effect";
import { Database } from "./Database";

const program = Effect.gen(function* () {
  // Get the Database service
  const db = yield* Database;

  // Use it
  const users = yield* db.findAll();
  return users;
});
```

This creates an Effect that **requires** Database in its R type:
```typescript
// Effect<User[], DbError, Database>
//                          ^^^^^^^^ requirement
```

## Layers - Providing Dependencies

Layers provide implementations for required services. They connect services to Effects:

```typescript
import * as Layer from "effect/Layer";
import * as Effect from "effect/Effect";

// Define a service
class UserRepo extends Context.Tag("UserRepo")<UserRepo, {
  findById: (id: string) => Effect.Effect<User, NotFoundError>
}>() {}

// Create a Layer that provides the service
const UserRepoLive = Layer.succeed(UserRepo, {
  findById: (id) => Effect.gen(function* () {
    // implementation
  })
});

// Use the service
const program = Effect.gen(function* () {
  const repo = yield* UserRepo;
  const user = yield* repo.findById("123");
  return user;
});

// Provide the layer to run
const runnable = Effect.provide(program, UserRepoLive);
```

Common Layer constructors:
- `Layer.succeed(Tag, implementation)` - Provide a static value
- `Layer.effect(Tag, Effect)` - Provide via an Effect (can fail)
- `Layer.scoped(Tag, Effect)` - Provide with resource cleanup

## Tagged Errors

This codebase uses typed errors, not `new Error()`:

```typescript
import * as S from "effect/Schema";

// Define a tagged error
export class UserNotFound extends S.TaggedError<UserNotFound>()("UserNotFound", {
  userId: S.String,
}) {}

// Use it
const findUser = (id: string) => Effect.gen(function* () {
  const user = yield* db.query(id);
  if (!user) {
    return yield* Effect.fail(new UserNotFound({ userId: id }));
  }
  return user;
});

// Handle specific errors
const program = findUser("123").pipe(
  Effect.catchTag("UserNotFound", (error) =>
    Effect.succeed(defaultUser)
  )
);
```

## Required Imports in This Codebase

This codebase mandates namespace imports with specific aliases:

```typescript
// Core Effect modules - use full names
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Context from "effect/Context";
import * as Cause from "effect/Cause";

// Frequently used modules - use abbreviations
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as F from "effect/Function";
import * as B from "effect/Brand";
import * as Match from "effect/Match";
import * as DateTime from "effect/DateTime";
import * as M from "@effect/sql/Model";
```

## Alias Reference Table

| Module | Alias | Replaces |
|--------|-------|----------|
| effect/Array | `A` | `array.map()`, `array.filter()` |
| effect/Option | `O` | `null`, `undefined` |
| effect/Schema | `S` | Plain interfaces, Zod |
| effect/String | `Str` | `string.split()`, `string.toLowerCase()` |
| effect/Predicate | `P` | `typeof`, `instanceof` |
| effect/Record | `R` | `Object.keys()`, `Object.entries()` |
| effect/Function | `F` | `pipe`, `flow` |
| effect/Match | `Match` | `switch` statements |
| effect/DateTime | `DateTime` | `new Date()`, `Date.now()` |
| @effect/sql/Model | `M` | ORM model definitions |

## Forbidden Patterns

Native JavaScript methods are banned. Use Effect utilities:

```typescript
// FORBIDDEN
array.map(x => x + 1)
array.filter(x => x > 0)
string.split(",")
Object.keys(obj)
new Date()
typeof value === "string"
switch (status) { ... }

// REQUIRED
A.map(array, x => x + 1)
A.filter(array, x => x > 0)
Str.split(string, ",")
Struct.keys(obj)
DateTime.unsafeNow()
P.isString(value)
Match.value(status).pipe(...)
```

## Schema Basics

Schemas define and validate data structures:

```typescript
import * as S from "effect/Schema";

// Define a schema
const UserSchema = S.Struct({
  id: S.String,
  name: S.String,
  email: S.String,
  createdAt: S.Date,
});

// Derive the type
type User = S.Schema.Type<typeof UserSchema>;

// Validate data
const result = S.decodeUnknown(UserSchema)(data);
// Returns Effect<User, ParseError>
```

PascalCase constructors are required:
```typescript
// CORRECT
S.Struct({ name: S.String })
S.Array(S.Number)

// FORBIDDEN
S.struct({ name: S.string })  // lowercase forbidden
```

## Option for Nullable Values

Use Option instead of null/undefined:

```typescript
import * as O from "effect/Option";

// Create options
const some = O.some(42);           // Option<number> with value
const none = O.none<number>();     // Option<number> without value

// From nullable
const opt = O.fromNullable(maybeNull);  // null/undefined becomes None

// Pattern match
O.match(opt, {
  onNone: () => "default",
  onSome: (value) => `got ${value}`
});

// Get first element of array (returns Option)
const first = A.head(myArray);  // Option<T>
```

## pipe and flow

Compose operations left-to-right:

```typescript
import { pipe, flow } from "effect/Function";

// pipe: apply value through functions
const result = pipe(
  5,
  (n) => n * 2,    // 10
  (n) => n + 1,    // 11
  String           // "11"
);

// flow: compose functions into a new function
const transform = flow(
  (n: number) => n * 2,
  (n) => n + 1,
  String
);
transform(5); // "11"
```

Prefer `pipe` in this codebase:
```typescript
// PREFERRED
pipe(users, A.filter(isActive), A.map(getName))

// AVOID
A.map(A.filter(users, isActive), getName)
```

## Match Instead of Switch

Use Match for pattern matching:

```typescript
import * as Match from "effect/Match";

// FORBIDDEN
switch (status) {
  case "active": return "Active";
  case "inactive": return "Inactive";
  default: return "Unknown";
}

// REQUIRED
Match.value(status).pipe(
  Match.when("active", () => "Active"),
  Match.when("inactive", () => "Inactive"),
  Match.orElse(() => "Unknown")
);
```

## Testing with @beep/testkit

ALWAYS use the testkit, NEVER raw bun:test with Effect.runPromise:

```typescript
import { effect, layer, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";

// Simple test
effect("computes result", () =>
  Effect.gen(function* () {
    const result = yield* myEffect();
    strictEqual(result, expected);
  })
);

// Test with dependencies
layer(TestLayer)("suite", (it) => {
  it.effect("uses service", () =>
    Effect.gen(function* () {
      const service = yield* MyService;
      const result = yield* service.doThing();
      strictEqual(result, expected);
    })
  );
});
```

## Complete Working Example

Here is a complete example combining all concepts:

```typescript
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Context from "effect/Context";
import * as S from "effect/Schema";
import * as A from "effect/Array";
import * as O from "effect/Option";
import { pipe } from "effect/Function";

// 1. Define tagged error
export class UserNotFound extends S.TaggedError<UserNotFound>()("UserNotFound", {
  userId: S.String,
}) {}

// 2. Define schema
const User = S.Struct({
  id: S.String,
  name: S.String,
  active: S.Boolean,
});
type User = S.Schema.Type<typeof User>;

// 3. Define service interface
class UserRepo extends Context.Tag("UserRepo")<UserRepo, {
  findById: (id: string) => Effect.Effect<User, UserNotFound>
  findAll: () => Effect.Effect<ReadonlyArray<User>>
}>() {}

// 4. Create service implementation
const UserRepoLive = Layer.succeed(UserRepo, {
  findById: (id) => Effect.gen(function* () {
    // Simulated lookup
    if (id === "not-found") {
      return yield* Effect.fail(new UserNotFound({ userId: id }));
    }
    return { id, name: "Test User", active: true };
  }),
  findAll: () => Effect.succeed([
    { id: "1", name: "Alice", active: true },
    { id: "2", name: "Bob", active: false },
  ])
});

// 5. Use the service
const getActiveUserNames = Effect.gen(function* () {
  const repo = yield* UserRepo;
  const users = yield* repo.findAll();

  // Use Effect utilities, not native methods
  return pipe(
    users,
    A.filter((u) => u.active),
    A.map((u) => u.name)
  );
});

// 6. Handle errors
const safeGetUser = (id: string) => pipe(
  Effect.gen(function* () {
    const repo = yield* UserRepo;
    return yield* repo.findById(id);
  }),
  Effect.catchTag("UserNotFound", (error) =>
    Effect.succeed({ id: error.userId, name: "Guest", active: false })
  )
);

// 7. Provide layer and run (only at application edge)
const program = Effect.provide(getActiveUserNames, UserRepoLive);
// Effect.runPromise(program) - only in main.ts or tests
```

## Key Takeaways

1. **Effect<A, E, R>** - Success type, Error type, Requirements
2. **Effect.gen(function* () { ... })** - Sequential Effect code
3. **yield*** - Unwraps Effect to get success value, propagates errors
4. **Layers** - Provide service implementations
5. **Tagged errors** - Typed errors with `S.TaggedError`
6. **Namespace imports** - Use `A`, `O`, `S`, etc. per alias table
7. **No native methods** - Use Effect utilities for arrays, strings, dates
8. **@beep/testkit** - Required for testing Effect code

## Next Steps

1. Review `/home/elpresidank/YeeBois/projects/beep-effect2/.claude/rules/effect-patterns.md` for complete patterns
2. Check EntityId usage patterns (branded IDs are mandatory)
3. Read testing patterns in effect-patterns.md Testing section
