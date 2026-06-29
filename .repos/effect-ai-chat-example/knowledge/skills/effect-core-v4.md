---
name: effect-core-v4
description: "Core Effect v4 patterns including error handling (catchReason, catchReasons, catchCause, catchTag, catchIf, unwrapReason, catchNoSuchElement), tap overloads, asEffect() and Yieldable protocol, Effect.fn, forkChild, Schema.TaggedErrorClass, Data.TaggedError, tagDefaultOmit, Latch, Deferred, Ref, Queue, filterOrFail, acquireRelease, andThen. Use when working with Effect v4 code. Triggers on catchReason, catchReasons, catchCause, catchTag, catchIf, unwrapReason, catchNoSuchElement, Effect.fn, Effect.tap, asEffect, Yieldable, forkChild, forkDetach, Schema.TaggedErrorClass, Data.TaggedError, Schema.tagDefaultOmit, Latch, Deferred, Ref, Queue, filterOrFail, acquireRelease, addFinalizer, andThen, Effect.result."
---

# Effect Core (v4)

Core patterns and APIs for Effect v4.

```ts
import { Cause, Deferred, Effect, Exit, Latch, Queue, Ref, Schema } from "effect";
```

## Yieldable Protocol and `asEffect()`

In v4, many types implement `Yieldable`: Effects, services, Options, Results,
Configs, and errors. `yield*` in `Effect.gen` calls `.asEffect()` internally.

**Being yieldable does NOT make something an Effect.** Outside generators, you
must call `.asEffect()` explicitly to get a pipeable `Effect`:

```ts
const program = Effect.gen(function*() {
  const db = yield* Database;
});

const program = Database.asEffect().pipe(
  Effect.flatMap((db) => db.query("SELECT 1")),
);
```

What `.asEffect()` does per type:

| Type                 | `.asEffect()` returns                                         |
| -------------------- | ------------------------------------------------------------- |
| `Effect<A, E, R>`    | itself                                                        |
| `ServiceMap.Service` | `Effect<Shape, never, Identifier>` (reads from fiber context) |
| `Option.Some<A>`     | `Effect.succeed(value)`                                       |
| `Option.None`        | `Effect.fail(new NoSuchElementError())`                       |
| `Result.Success<A>`  | `Effect.succeed(value)`                                       |
| `Result.Failure<E>`  | `Effect.fail(error)`                                          |
| `YieldableError`     | `Effect.fail(this)`                                           |
| `Config<A>`          | reads from ConfigProvider                                     |

`Effect.fromYieldable(yieldable)` is the explicit converter (just calls
`.asEffect()`).

## `Effect.fn`

Wraps an effectful body into a function. The unnamed form wraps the body and preserves stack context. The named form adds a tracing span:

```ts
const greet = Effect.fn(function*(name: string) {
  yield* Effect.log(`Hello, ${name}`);
  return name.length;
});

greet("world"); // Effect<number>
```

With a named span:

```ts
const greet = Effect.fn("greet")(function*(name: string) {
  yield* Effect.log(`Hello, ${name}`);
  return name.length;
});
```

With pipeline transforms after the body:

```ts
const greet = Effect.fn("greet")(
  function*(name: string) {
    yield* Effect.log(`Hello, ${name}`);
    return name.length;
  },
  Effect.map((length) => length + 1),
);
```

**How it differs from `Effect.gen`:**

- `Effect.fn` takes `(...args) => Generator | Effect` and returns a callable wrapper
- `Effect.gen` takes `() => Generator` and returns `Effect`
- `Effect.fn("name")` adds a span for tracing
- unnamed `Effect.fn(body)` does not add a named span
- `Effect.fn` accepts pipeline transforms as additional arguments

Use `Effect.fnUntraced` to skip span creation.

## Error Handling

### `Effect.catch`

Recover from all typed errors (renamed from `catchAll`):

```ts
effect.pipe(
  Effect.catch((error) => Effect.succeed(fallback)),
);
```

### `Effect.catchTag`

Match one or more error tags. Optional `orElse` handles remaining errors:

```ts
effect.pipe(
  Effect.catchTag("NotFound", () => Effect.succeed(defaultValue)),
);

effect.pipe(
  Effect.catchTag(["NotFound", "Timeout"], (e) => Effect.succeed(fallback)),
);

effect.pipe(
  Effect.catchTag(
    "NotFound",
    () => Effect.succeed(defaultValue),
    (otherError) => Effect.fail(otherError),
  ),
);
```

When `orElse` is provided, the matched error tag is fully removed from the
error channel.

### `Effect.catchReason`

Match a nested `reason` field within a tagged error. Models hierarchical
errors like `AiError` wrapping `RateLimitError`:

```ts
class AiError extends Schema.TaggedErrorClass<AiError>()("AiError", {
  reason: Schema.Union(RateLimitError, QuotaExceededError),
}) {}

effect.pipe(
  Effect.catchReason(
    "AiError",
    "RateLimitError",
    (reason) => Effect.succeed(`retry after ${reason.retryAfter}`),
  ),
);
```

With `orElse` for non-matching reasons:

```ts
effect.pipe(
  Effect.catchReason(
    "AiError",
    "RateLimitError",
    (reason) => handleRateLimit(reason),
    (otherReason) => handleOtherReason(otherReason),
  ),
);
```

Without `orElse`, the parent error stays in the channel. With `orElse`, the
parent error tag is fully removed.

### `Effect.catchReasons`

Handle multiple reason tags via an object of handlers (like `catchTags` but
for reasons):

```ts
effect.pipe(
  Effect.catchReasons("AiError", {
    RateLimitError: (r) => Effect.succeed(`rate: ${r.retryAfter}`),
    QuotaExceededError: (r) => Effect.succeed(`quota: ${r.limit}`),
  }),
);
```

### `Effect.catchCause`

Recover from the full `Cause` (including defects and interruptions). Renamed
from `catchAllCause`:

```ts
effect.pipe(
  Effect.catchCause((cause) => {
    if (Cause.isInterrupted(cause)) return Effect.succeed("interrupted");
    return Effect.failCause(cause);
  }),
);
```

### `Effect.catchIf`

Recover from errors matching a predicate or refinement. Replaces both
`catchSome` and the old `catchIf`:

```ts
effect.pipe(
  Effect.catchIf(
    (e): e is NetworkError => e._tag === "NetworkError",
    (e) => retryWithBackoff(e),
  ),
);
```

With `orElse`:

```ts
effect.pipe(
  Effect.catchIf(
    (e): e is NetworkError => e._tag === "NetworkError",
    (e) => retryWithBackoff(e),
    (otherError) => Effect.fail(otherError),
  ),
);
```

### `Effect.catchCauseIf`

Conditionally recover from a Cause. Renamed from `catchSomeCause`:

```ts
effect.pipe(
  Effect.catchCauseIf(
    Cause.isInterrupted,
    (cause) => Effect.succeed("interrupted"),
  ),
);
```

### `Effect.catchNoSuchElement`

Convert `NoSuchElementError` into `Option.None`. Useful after `yield*`-ing
an `Option` or using `filterOrFail` without `orFailWith`:

```ts
const maybeUser: Effect<Option<User>, OtherError> = findUser("id").pipe(Effect.catchNoSuchElement);
```

### `Effect.unwrapReason`

Promotes nested reason errors into the Effect error channel, replacing the
parent error:

```ts
const result: Effect<string, AiError> = doAiStuff();

const unwrapped: Effect<string, RateLimitError | QuotaExceededError> = result.pipe(
  Effect.unwrapReason("AiError"),
);
```

Transforms `Effect<A, AiError>` into
`Effect<A, RateLimitError | QuotaExceededError>`.

## `Effect.tap`

Runs a side effect without altering the result. v4 accepts both a callback
and a bare Effect:

```ts
effect.pipe(Effect.tap((a) => Effect.log(`got ${a}`)));

effect.pipe(Effect.tap(Effect.log("checkpoint")));
```

The bare Effect overload replaces `Effect.zipLeft` from v3.

`tapError`, `tapErrorTag`, `tapDefect`, `tapCause` also exist for tapping
into error/cause channels.

## `Effect.andThen`

Sequence two effects. The callback form receives the previous success value. The bare Effect form discards the previous result:

```ts
effect.pipe(Effect.andThen((a) => computeNext(a)));

effect.pipe(Effect.andThen(nextEffect));
```

Use the callback form when you need the previous success value. Use the bare Effect form for simple sequencing.

## `Effect.result`

Capture success or failure as a `Result<A, E>` (renamed from `either`):

```ts
const r = yield * Effect.result(riskyOperation);
```

## `Effect.filterOrFail`

Assert a condition on the success value or fail:

```ts
effect.pipe(
  Effect.filterOrFail(
    (user) => user.isActive,
    (user) => new InactiveUserError({ userId: user.id }),
  ),
);
```

Without `orFailWith`, defaults to `NoSuchElementError`:

```ts
effect.pipe(Effect.filterOrFail((n) => n > 0));
```

## Forking

Use the explicit fork helpers so ownership is obvious:

```ts
const fiber = yield * longRunning.pipe(Effect.forkChild);
```

With options:

```ts
yield * myEffect.pipe(
  Effect.forkChild({ startImmediately: true, uninterruptible: false }),
);
```

| Function            | Scope                                    |
| ------------------- | ---------------------------------------- |
| `Effect.forkChild`  | Parent fiber (auto-supervised)           |
| `Effect.forkScoped` | Requires `Scope` service                 |
| `Effect.forkDetach` | Global scope (renamed from `forkDaemon`) |
| `Effect.forkIn`     | Explicit scope                           |

## Resource Management

### `Effect.acquireRelease`

```ts
const resource = yield * Effect.acquireRelease(
  openConnection(),
  (conn, exit) => closeConnection(conn),
);
```

The release function receives `Exit<unknown, unknown>`.

### `Effect.addFinalizer`

```ts
yield
  * Effect.addFinalizer((exit) =>
    Effect.log(`exiting with ${Exit.isSuccess(exit) ? "success" : "failure"}`)
  );
```

## Schema.TaggedErrorClass

Schema-validated tagged errors. Yieldable in `Effect.gen`:

```ts
class NotFoundError extends Schema.TaggedErrorClass<NotFoundError>()(
  "NotFoundError",
  { id: Schema.String },
) {}

const err = new NotFoundError({ id: "123" });
err._tag; // "NotFoundError"
err.id; // "123"

yield * new NotFoundError({ id: "123" });
```

Zero-field errors need empty fields:

```ts
class UnauthorizedError extends Schema.TaggedErrorClass<UnauthorizedError>()(
  "UnauthorizedError",
  {},
) {}

yield * new UnauthorizedError();
```

`Schema.TaggedErrorClass` extends `YieldableError` (has `.stack`, yields as
`Effect.fail(this)`). Supports full schema encoding/decoding. By default,
`_tag` is required in the encoded form and present in the decoded form.

### `Data.TaggedError` (non-schema)

Still exists separately. Use when you do not need schema
encoding/decoding/validation:

```ts
import { Data } from "effect"

class SimpleError extends Data.TaggedError("SimpleError")<{
  readonly message: string
}> {}

yield* new SimpleError({ message: "oops" })
```

`Data.TaggedError` does `Object.assign(this, args)` with no validation.
`Schema.TaggedErrorClass` adds full schema validation in the constructor.

### `Schema.TaggedClass`

Same as `TaggedErrorClass` but extends `Data.Class` instead of
`YieldableError`. For data, not errors:

```ts
class User extends Schema.TaggedClass<User>()("User", {
  name: Schema.String,
  age: Schema.Number,
}) {}
```

## `Schema.tagDefaultOmit`

Makes `_tag` optional in the encoded (input) form and omits it from the
encoded output. The decoded form always has `_tag`:

```ts
const Shape = Schema.Struct({
  _tag: Schema.tagDefaultOmit("circle"),
  radius: Schema.Number,
});
```

Behavior:

```ts
Schema.decode(Shape)({ radius: 5 });
// => { _tag: "circle", radius: 5 }

Schema.decode(Shape)({ _tag: "circle", radius: 5 });
// => { _tag: "circle", radius: 5 }

Schema.encode(Shape)({ _tag: "circle", radius: 5 });
// => { radius: 5 }
```

| Function                     | Construction | Decoding input | Encoding output |
| ---------------------------- | ------------ | -------------- | --------------- |
| `Schema.tag("X")`            | optional     | required       | included        |
| `Schema.tagDefaultOmit("X")` | optional     | optional       | omitted         |

Use `mapFields` to apply `tagDefaultOmit` to existing class schemas:

```ts
Circle.mapFields((fields) => ({
  ...fields,
  kind: Schema.tagDefaultOmit("circle"),
}));
```

## Latch

Synchronization primitive. A gate that fibers can wait on:

```ts
import { Latch } from "effect"

const latch = yield* Latch.make()

const fiber = yield* latch.whenOpen(doWork).pipe(Effect.forkChild)

yield* latch.open
```

| Method                   | Description                                                   |
| ------------------------ | ------------------------------------------------------------- |
| `latch.await`            | Wait for the latch to open                                    |
| `latch.open`             | Open and release all waiters. Returns `false` if already open |
| `latch.close`            | Close the latch. Returns `false` if already closed            |
| `latch.whenOpen(effect)` | Run effect only when latch is open                            |
| `latch.openUnsafe()`     | Synchronous open                                              |
| `latch.closeUnsafe()`    | Synchronous close                                             |

Constructors:

```ts
const latch = yield * Latch.make();
const latch = yield * Latch.make(true);
const latch = Latch.makeUnsafe();
```

`Latch.make(true)` creates an already-open latch. Default is closed.

Use `Latch.makeUnsafe()` in non-effectful contexts (e.g., inside atom
callbacks, Layer construction).

## Deferred

One-shot async variable. Completed exactly once, all waiters get the result:

```ts
import { Deferred } from "effect"

const deferred = yield* Deferred.make<string, Error>()

yield* Deferred.await(deferred).pipe(Effect.forkChild)

yield* Deferred.succeed(deferred, "done")
```

| Function                           | Description                                             |
| ---------------------------------- | ------------------------------------------------------- |
| `Deferred.make<A, E>()`            | Create (effectful)                                      |
| `Deferred.makeUnsafe<A, E>()`      | Create (synchronous)                                    |
| `Deferred.await(d)`                | Wait for completion                                     |
| `Deferred.succeed(d, value)`       | Complete with success                                   |
| `Deferred.fail(d, error)`          | Complete with error                                     |
| `Deferred.failCause(d, cause)`     | Complete with Cause                                     |
| `Deferred.done(d, exit)`           | Complete with Exit                                      |
| `Deferred.complete(d, effect)`     | Run effect, memoize result for all waiters              |
| `Deferred.completeWith(d, effect)` | Store effect directly (each waiter re-runs it)          |
| `Deferred.interrupt(d)`            | Interrupt with calling fiber's ID                       |
| `Deferred.isDone(d)`               | Check if completed                                      |
| `Deferred.poll(d)`                 | Non-blocking check, returns `Effect<A, E> \| undefined` |
| `Deferred.into(effect, d)`         | Pipe effect outcome into deferred                       |

`complete` vs `completeWith`: `complete` runs the effect and caches the
`Exit` so all waiters see the same result. `completeWith` stores the raw
effect, so each waiter executes it independently.

## Ref

Mutable reference with effectful reads and writes:

```ts
import { Ref } from "effect"

const ref = yield* Ref.make(0)
const value = yield* Ref.get(ref)
yield* Ref.set(ref, 42)
yield* Ref.update(ref, (n) => n + 1)
const prev = yield* Ref.getAndSet(ref, 0)
const prev = yield* Ref.getAndUpdate(ref, (n) => n + 1)
const result = yield* Ref.modify(ref, (n) => [n.toString(), n + 1])
```

Unsafe variants for non-effectful contexts:

```ts
const ref = Ref.makeUnsafe(0);
const value = Ref.getUnsafe(ref);
```

## Queue

Concurrent queue with typed completion signals:

```ts
import { Queue, Cause } from "effect"

const queue = yield* Queue.bounded<number, Cause.Done>(16)

yield* Queue.offer(queue, 1)
yield* Queue.offer(queue, 2)
yield* Queue.end(queue)

const value = yield* Queue.take(queue)
```

Constructors:

| Constructor         | Behavior                 |
| ------------------- | ------------------------ |
| `Queue.bounded(n)`  | Backpressure when full   |
| `Queue.unbounded()` | No backpressure          |
| `Queue.sliding(n)`  | Oldest evicted when full |
| `Queue.dropping(n)` | Newest dropped when full |

Signaling (for stream integration):

| Function                              | Description            |
| ------------------------------------- | ---------------------- |
| `Queue.end(queue)`                    | Signal completion      |
| `Queue.endUnsafe(queue)`              | Synchronous completion |
| `Queue.fail(queue, error)`            | Signal error           |
| `Queue.failCause(queue, cause)`       | Signal error cause     |
| `Queue.failCauseUnsafe(queue, cause)` | Synchronous error      |

Unsafe variants (`offerUnsafe`, `endUnsafe`, `failCauseUnsafe`) are for
use inside `Stream.callback` and other non-effectful contexts.

## Key Renames from v3

| v3                   | v4                               |
| -------------------- | -------------------------------- |
| `catchAll`           | `catch`                          |
| `catchAllCause`      | `catchCause`                     |
| `catchAllDefect`     | `catchDefect`                    |
| `catchSome`          | `catchIf`                        |
| `catchSomeCause`     | `catchCauseIf`                   |
| `either`             | `result`                         |
| `zipRight`           | `andThen` (bare Effect overload) |
| `zipLeft`            | `tap` (bare Effect overload)     |
| `forkDaemon`         | `forkDetach`                     |
| `tapErrorCause`      | `tapCause`                       |
| `Schema.TaggedError` | `Schema.TaggedErrorClass`        |

## Quick Reference

| Task                      | Pattern                                             |
| ------------------------- | --------------------------------------------------- |
| Define effectful function | `Effect.fn(function*(arg) { ... })`                 |
| Named span                | `Effect.fn("name")(function*(arg) { ... })`         |
| Catch all errors          | `Effect.catch(handler)`                             |
| Catch by tag              | `Effect.catchTag("Tag", handler)`                   |
| Catch multiple tags       | `Effect.catchTag(["A", "B"], handler)`              |
| Catch nested reason       | `Effect.catchReason("Parent", "Reason", handler)`   |
| Catch multiple reasons    | `Effect.catchReasons("Parent", { R1: h1, R2: h2 })` |
| Unwrap reasons            | `Effect.unwrapReason("Parent")`                     |
| Catch full cause          | `Effect.catchCause(handler)`                        |
| Catch by predicate        | `Effect.catchIf(pred, handler)`                     |
| Side effect (callback)    | `Effect.tap((a) => sideEffect(a))`                  |
| Side effect (bare)        | `Effect.tap(sideEffect)`                            |
| Sequence (callback)       | `Effect.andThen((a) => next(a))`                    |
| Sequence (bare)           | `Effect.andThen(nextEffect)`                        |
| Fork child                | `Effect.forkChild`                                  |
| Fork detached             | `Effect.forkDetach`                                 |
| Acquire/release           | `Effect.acquireRelease(acquire, release)`           |
| Add finalizer             | `Effect.addFinalizer((exit) => cleanup)`            |
| Filter or fail            | `Effect.filterOrFail(pred, orFailWith)`             |
| Create latch              | `Latch.make()` / `Latch.makeUnsafe()`               |
| Create deferred           | `Deferred.make()` / `Deferred.makeUnsafe()`         |
| Create ref                | `Ref.make(initial)` / `Ref.makeUnsafe(initial)`     |
| Create queue              | `Queue.bounded(n)` / `Queue.unbounded()`            |
| Schema error class        | `Schema.TaggedErrorClass<Self>()("Tag", fields)`    |
| Omit _tag on encode       | `Schema.tagDefaultOmit("tag")`                      |
| Yieldable to Effect       | `service.asEffect()` / `Effect.fromYieldable(x)`    |
