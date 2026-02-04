# Effect — Agent Context

> Best practices for using `effect/Effect` in this codebase.

## Quick Reference

| Function | Purpose | Example |
|----------|---------|---------|
| `Effect.gen` | Generator-based composition (PREFERRED) | `Effect.gen(function* () { yield* effect })` |
| `Effect.succeed` | Lift pure value into Effect | `Effect.succeed(42)` |
| `Effect.fail` | Create failing Effect with tagged error | `Effect.fail(new MyError({ message }))` |
| `Effect.map` | Transform success value | `Effect.map(effect, x => x + 1)` |
| `Effect.flatMap` | Chain Effects (use sparingly) | `Effect.flatMap(effect, x => nextEffect(x))` |
| `Effect.catchTag` | Handle specific error by tag | `Effect.catchTag(effect, "NotFound", handler)` |
| `Effect.tryPromise` | Wrap Promise with error handling | `Effect.tryPromise({ try: () => fetch(), catch: e => new FetchError() })` |
| `Effect.all` | Run Effects concurrently | `Effect.all([a, b, c], { concurrency: "unbounded" })` |
| `Effect.withSpan` | Add OpenTelemetry span | `Effect.withSpan(effect, "operationName")` |
| `Effect.log` | Structured logging | `Effect.log({ message: "Starting", userId })` |

## Codebase Patterns

### Generator-Based Composition (PRIMARY PATTERN)

ALWAYS prefer `Effect.gen` over `Effect.flatMap` chains:

```typescript
import * as Effect from "effect/Effect";

// REQUIRED - Generator pattern
const program = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const content = yield* fs.readFileString(path);
  const parsed = yield* Effect.tryPromise({
    try: () => JSON.parse(content),
    catch: () => new ParseError({ path })
  });
  return parsed;
});

// FORBIDDEN - flatMap chains (hard to read, error-prone)
const program = FileSystem.FileSystem.pipe(
  Effect.flatMap(fs => fs.readFileString(path)),
  Effect.flatMap(content => Effect.tryPromise({
    try: () => JSON.parse(content),
    catch: () => new ParseError({ path })
  }))
);
```

**Why**: Generator syntax is more readable, easier to debug, and makes control flow explicit.

### Span Instrumentation for Observability

Wrap Effect operations with `Effect.withSpan` for OpenTelemetry tracing:

```typescript
// Codebase pattern (from tooling/build-utils)
const createHeadersObject = (config: SecurityConfig) =>
  Effect.gen(function* () {
    const headers = {};
    // ... build headers
    return headers;
  }).pipe(Effect.withSpan("createHeadersObject"));

const transpilePackages = (packages: Package[]) =>
  Effect.gen(function* () {
    // ... transpile logic
    return result;
  }).pipe(
    Effect.withSpan("computeTranspilePackages"),
    Effect.catchAll(Effect.die)  // Fatal error handling
  );
```

**Usage pattern**: Place `Effect.withSpan` AFTER the generator, before `Effect.provide`.

### Error Handling by Tag

Use `Effect.catchTag` for type-safe error recovery:

```typescript
import * as S from "effect/Schema";

class NotFoundError extends S.TaggedError<NotFoundError>()("NotFoundError", {
  id: S.String,
}) {}

class PermissionError extends S.TaggedError<PermissionError>()("PermissionError", {
  userId: S.String,
}) {}

const program = Effect.gen(function* () {
  const user = yield* UserRepo.findById(userId);
  return user;
}).pipe(
  Effect.catchTag("NotFoundError", (error) =>
    Effect.succeed({ ...defaultUser, id: error.id })
  ),
  Effect.catchTag("PermissionError", (error) =>
    Effect.fail(new AccessDeniedError({ userId: error.userId }))
  )
);
```

**Key insight**: `catchTag` preserves error type information, unlike `catchAll`.

### Concurrent Execution with Effect.all

Use `Effect.all` for running multiple Effects in parallel:

```typescript
// Sequential (slow)
const a = yield* fetchUser();
const b = yield* fetchOrg();
const c = yield* fetchTeam();

// REQUIRED - Concurrent execution
const [user, org, team] = yield* Effect.all(
  [fetchUser(), fetchOrg(), fetchTeam()],
  { concurrency: "unbounded" }
);

// For objects
const result = yield* Effect.all(
  {
    user: fetchUser(),
    org: fetchOrg(),
    team: fetchTeam()
  },
  { concurrency: "unbounded" }
);
// result has type { user: User, org: Org, team: Team }
```

**Concurrency options**:
- `"unbounded"` - Run all at once (default for I/O operations)
- `"inherit"` - Use parent scope's concurrency setting
- `number` - Limit to N concurrent operations

### Promise Interop

Wrap external Promises with `Effect.tryPromise` for type-safe error handling:

```typescript
// REQUIRED - Explicit error mapping
const fetchData = (url: string) =>
  Effect.tryPromise({
    try: () => fetch(url).then(r => r.json()),
    catch: (error) => new FetchError({ url, cause: String(error) })
  });

// FORBIDDEN - Effect.promise (loses error information)
const fetchData = (url: string) =>
  Effect.promise(() => fetch(url).then(r => r.json()));
```

**Why**: `tryPromise` requires explicit error mapping, preventing untyped errors from leaking.

### Structured Logging

Use `Effect.log` with structured data (not string concatenation):

```typescript
// REQUIRED - Structured logging
yield* Effect.log({
  message: "User signed in",
  userId: user.id,
  timestamp: DateTime.now
});

// FORBIDDEN - String concatenation
yield* Effect.log(`User ${user.id} signed in`);

// Also available
yield* Effect.logInfo("Starting operation");
yield* Effect.logError({ message: "Failed", error });
yield* Effect.logDebug({ state: currentState });
```

**Key insight**: Structured logs are queryable in observability tools (Grafana, etc.).

## Anti-Patterns

### 1. NEVER use flatMap chains over 3 levels

```typescript
// FORBIDDEN - Nested flatMap (unreadable)
Effect.flatMap(getUser(), user =>
  Effect.flatMap(getOrg(user.orgId), org =>
    Effect.flatMap(getTeam(org.teamId), team =>
      Effect.succeed({ user, org, team })
    )
  )
);

// REQUIRED - Effect.gen
Effect.gen(function* () {
  const user = yield* getUser();
  const org = yield* getOrg(user.orgId);
  const team = yield* getTeam(org.teamId);
  return { user, org, team };
});
```

### 2. NEVER use Effect.runPromise in application code

```typescript
// FORBIDDEN - runPromise in application code
const handler = async (req: Request) => {
  const result = await Effect.runPromise(someEffect);  // Wrong!
  return result;
};

// REQUIRED - Keep Effect until the boundary
const handler = (req: Request) =>
  Effect.gen(function* () {
    const result = yield* someEffect;
    return result;
  }).pipe(Effect.provide(AppLayer));
```

**Why**: `runPromise` throws exceptions and loses Effect type safety. Only use at the very edge of the system.

### 3. NEVER ignore error channel

```typescript
// FORBIDDEN - Ignoring errors
yield* someEffect.pipe(Effect.catchAll(() => Effect.succeed(null)));

// REQUIRED - Handle or propagate errors
yield* someEffect.pipe(
  Effect.catchTag("NotFound", () => Effect.succeed(defaultValue)),
  // Other errors propagate
);
```

### 4. NEVER use bare promises in Effect.gen

```typescript
// FORBIDDEN - Bare promise in generator
const data = yield* fetch(url).then(r => r.json());  // Type error!

// REQUIRED - Wrap with Effect.tryPromise
const data = yield* Effect.tryPromise({
  try: () => fetch(url).then(r => r.json()),
  catch: error => new FetchError({ url, cause: String(error) })
});
```

### 5. NEVER use Effect.succeed for Effects

```typescript
// FORBIDDEN - Wrapping Effect in succeed
const result = Effect.succeed(Effect.gen(...));  // Effect<Effect<A>>

// REQUIRED - Return Effect directly
const result = Effect.gen(...);  // Effect<A>
```

## Related Modules

- [Schema.md](./Schema.md) - Error modeling with `S.TaggedError`
- [Layer.md](./Layer.md) - Providing services to Effects
- [Context.md](./Context.md) - Service definitions
- `documentation/EFFECT_PATTERNS.md` - Full pattern reference

## Source Reference

[.repos/effect/packages/effect/src/Effect.ts](../../.repos/effect/packages/effect/src/Effect.ts)
