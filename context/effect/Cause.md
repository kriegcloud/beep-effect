# Cause — Agent Context

> Best practices for using `effect/Cause` in this codebase.

## Quick Reference

| Function | Purpose | Example |
|----------|---------|---------|
| `Cause.fail` | Create cause from expected error | `Cause.fail(new NotFoundError({ id }))` |
| `Cause.die` | Create cause from defect (unexpected) | `Cause.die(new Error("Invariant violated"))` |
| `Cause.interrupt` | Create cause from fiber interruption | `Cause.interrupt(fiberId)` |
| `Cause.empty` | Create empty cause (no failure) | `Cause.empty` |
| `Cause.pretty` | Human-readable cause formatting | `Cause.pretty(cause)` |
| `Cause.squash` | Extract single error from cause | `Cause.squash(cause)` |
| `Cause.isEmpty` | Check if cause has failures | `Cause.isEmpty(cause)` |
| `Cause.failureOption` | Extract expected error as Option | `Cause.failureOption(cause)` |
| `Cause.defects` | Extract all defects as Chunk | `Cause.defects(cause)` |
| `Cause.sequential` | Compose causes sequentially | `Cause.sequential(cause1, cause2)` |
| `Cause.parallel` | Compose causes in parallel | `Cause.parallel(cause1, cause2)` |

## Codebase Patterns

### ALWAYS Use Namespace Import

```typescript
// REQUIRED - Import as namespace
import * as Cause from "effect/Cause";

// FORBIDDEN - Named imports
import { fail, pretty } from "effect/Cause";  // WRONG!
```

### Extract and Log Causes in Error Handlers

The primary use of Cause in this codebase is introspecting failures for logging and telemetry:

```typescript
import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";

// CODEBASE PATTERN - From packages/common/errors
const program = Effect.gen(function* () {
  const result = yield* someEffect;
  return result;
}).pipe(
  Effect.tapErrorCause((cause) =>
    Effect.gen(function* () {
      // Pretty-print for human-readable logs
      yield* Effect.logError(Cause.pretty(cause));

      // Check if cause is empty (no actual failure)
      if (!Cause.isEmpty(cause)) {
        yield* Effect.logDebug({
          message: "Failure detected",
          cause: Cause.pretty(cause),
          causeSquash: Cause.squash(cause)  // Single error
        });
      }
    })
  )
);
```

**Pattern location**: `packages/shared/client/src/atom/services/Upload/Upload.service.ts:626`, `packages/common/errors/src/shared.ts:161`

### Extract Primary Error from Cause

Use `Cause.failureOption` and `Cause.defects` to extract structured errors:

```typescript
import * as Cause from "effect/Cause";
import * as O from "effect/Option";
import * as Chunk from "effect/Chunk";
import * as A from "effect/Array";

// CODEBASE PATTERN - From packages/common/errors/src/shared.ts:173
function extractPrimaryError(cause: Cause.Cause<unknown>): {
  readonly error?: Error | undefined;
  readonly message: string;
} {
  // First try to extract expected error (Fail)
  const failOpt = Cause.failureOption(cause);
  if (O.isSome(failOpt)) {
    const val = failOpt.value;
    if (val instanceof Error) return { error: val, message: val.message };
    return { message: String(val) };
  }

  // Fall back to defects (Die)
  const defects = Cause.defects(cause);
  const arr = Chunk.toArray(defects);
  const err = A.findFirst(arr, (d): d is Error => d instanceof Error);

  if (O.isSome(err)) {
    return { error: err.value, message: err.value.message };
  }

  return { message: "Unknown error" };
}
```

**Why**: `failureOption` returns expected errors (from `Effect.fail`), while `defects` returns unexpected errors (from `Effect.die`).

### Check for Empty Cause

ALWAYS check `Cause.isEmpty` before logging or processing:

```typescript
import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";

// CODEBASE PATTERN - From packages/common/errors/src/shared.ts:150
function shouldIncludePretty(cause: Cause.Cause<unknown>): boolean {
  // Don't waste resources formatting empty causes
  if (!Cause.isEmpty(cause)) return true;
  return false;
}

const logCause = (cause: Cause.Cause<unknown>) =>
  Effect.gen(function* () {
    if (Cause.isEmpty(cause)) {
      return;  // Skip logging empty causes
    }

    const pretty = Cause.pretty(cause);
    yield* Effect.logError({ cause: pretty });
  });
```

**Pattern location**: `packages/common/errors/src/shared.ts:150`, `packages/common/errors/src/server.ts:228`

### Pretty-Print Causes for Observability

Use `Cause.pretty` for human-readable error formatting:

```typescript
import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";

// CODEBASE PATTERN - From packages/common/errors/src/shared.ts:160
export function formatCausePretty(
  cause: Cause.Cause<unknown>,
  enableColors = true
): string {
  // Check if empty first
  const pretty = Cause.isEmpty(cause) ? "" : Cause.pretty(cause);

  if (!enableColors || !pretty) return pretty;

  // Add color for terminal output
  return `\u001b[31m${pretty}\u001b[39m`;
}

// Usage in Effect
const handleError = Effect.tapErrorCause((cause) =>
  Effect.sync(() => console.error(Cause.pretty(cause)))
);
```

**Pattern location**: `packages/common/errors/src/shared.ts:160`, `packages/common/errors/src/client.ts:69`

### Squash Cause to Single Error

Use `Cause.squash` to extract a single error (useful for tests and simple error paths):

```typescript
import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";

// CODEBASE PATTERN - From packages/iam/client/test
const program = Effect.gen(function* () {
  const result = yield* someEffect;
  return result;
});

const test = Effect.gen(function* () {
  const exit = yield* Effect.exit(program);

  if (Exit.isFailure(exit)) {
    // Squash cause to single error for assertion
    const error = Cause.squash(exit.cause);
    console.log(error.message);
  }
});
```

**Pattern location**: `packages/iam/client/test/_internal/transformation.test.ts:148`

### Compose Causes (Advanced)

Use `Cause.sequential` and `Cause.parallel` to combine multiple failures:

```typescript
import * as Cause from "effect/Cause";

// Sequential failures (one after another)
const sequentialCause = Cause.sequential(
  Cause.fail(new ValidationError({ field: "email" })),
  Cause.fail(new ValidationError({ field: "password" }))
);

// Parallel failures (concurrent operations)
const parallelCause = Cause.parallel(
  Cause.fail(new NotFoundError({ id: "user-1" })),
  Cause.fail(new NotFoundError({ id: "user-2" }))
);
```

**Note**: This is rarely needed in application code. Effect automatically composes causes when using `Effect.all` with `mode: "validate"`.

## Anti-Patterns

### NEVER Ignore Cause Structure

```typescript
// FORBIDDEN - Losing cause information
yield* someEffect.pipe(
  Effect.catchAll((error) => Effect.log(`Error: ${error}`))  // Lost stack trace, defects
);

// REQUIRED - Preserve cause for observability
yield* someEffect.pipe(
  Effect.tapErrorCause((cause) =>
    Effect.logError({
      message: "Operation failed",
      cause: Cause.pretty(cause)  // Full error context
    })
  ),
  Effect.catchTag("NotFound", (error) => Effect.succeed(defaultValue))
);
```

### NEVER Format Empty Causes

```typescript
// FORBIDDEN - Wasting resources on empty causes
const pretty = Cause.pretty(cause);  // Always formats
yield* Effect.logError(pretty);

// REQUIRED - Check isEmpty first
if (!Cause.isEmpty(cause)) {
  const pretty = Cause.pretty(cause);
  yield* Effect.logError(pretty);
}
```

**Pattern location**: `packages/common/errors/src/shared.ts:161`

### NEVER Use Cause Directly for Expected Errors

```typescript
// FORBIDDEN - Manual cause construction for business logic
const error = Cause.fail(new NotFoundError({ id }));
return Effect.failCause(error);  // Over-engineering

// REQUIRED - Use Effect.fail directly
return Effect.fail(new NotFoundError({ id }));
```

**Why**: `Effect.fail` automatically wraps errors in a `Cause.Fail`. Manual cause construction is only needed for advanced metaprogramming.

### NEVER Squash in Production Logging

```typescript
// FORBIDDEN - Losing parallel/sequential error structure
yield* Effect.tapErrorCause((cause) =>
  Effect.logError({
    error: Cause.squash(cause)  // Lost multi-error context
  })
);

// REQUIRED - Use Cause.pretty to preserve structure
yield* Effect.tapErrorCause((cause) =>
  Effect.logError({
    cause: Cause.pretty(cause)  // Full context for debugging
  })
);
```

**Why**: `squash` collapses all errors into one, losing information about parallel failures or sequential error chains.

### NEVER Access Cause Without Exit

```typescript
// FORBIDDEN - Can't access cause without Exit
const result = yield* someEffect;
const cause = result.cause;  // Type error - result is not Exit

// REQUIRED - Use Effect.exit to access cause
const exit = yield* Effect.exit(someEffect);
if (Exit.isFailure(exit)) {
  const cause = exit.cause;
  yield* Effect.logError(Cause.pretty(cause));
}
```

**Pattern**: Cause is only accessible through `Effect.exit` or `Effect.tapErrorCause`.

## Related Modules

- **[Effect.md](./Effect.md)** - Use `Effect.tapErrorCause` to access causes in pipelines
- **[Schema.md](./Schema.md)** - Define tagged errors that appear in Cause.Fail
- **[Match.md](./Match.md)** - Pattern match on cause structure (advanced)
- **`packages/common/errors/`** - Codebase error handling utilities using Cause

## Source Reference

[.repos/effect/packages/effect/src/Cause.ts](../../.repos/effect/packages/effect/src/Cause.ts)

## Key Takeaways

1. **ALWAYS** use `import * as Cause from "effect/Cause"`
2. **Use `Cause.pretty`** for human-readable error logging
3. **Use `Cause.isEmpty`** before formatting to avoid overhead
4. **Use `Cause.failureOption`** to extract expected errors
5. **Use `Cause.defects`** to extract unexpected errors (defects)
6. **Use `Cause.squash`** only for tests or simple error paths
7. **NEVER** manually construct causes with `Cause.fail` in business logic
8. **Access causes** via `Effect.exit` or `Effect.tapErrorCause`
9. **Preserve cause structure** in production logs (use `pretty`, not `squash`)
