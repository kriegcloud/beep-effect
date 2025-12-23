# @beep/invariant

Runtime assertion contracts for Effect-first applications. Provides a unified `invariant(...)` function with typed helpers that throw schema-backed `InvariantViolation` errors when conditions fail.

## Purpose

Consistent, environment-agnostic assertion library for runtime validation across the monorepo. Prevents inconsistent error handling patterns and makes assertion failures easy to parse, serialize, and map to domain/HTTP errors.

## Why This Package Exists

- **Consistency** — Single canonical API for preconditions, postconditions, and impossible branches
- **Observability-friendly** — Failures are `InvariantViolation` error instances with structured metadata suitable for logging/telemetry
- **Architecture-safe** — Pure runtime code with no I/O, logging, or platform dependencies; safe in all layers

## Installation

```bash
# This package is internal to the monorepo
# Add as a dependency in your package.json:
"@beep/invariant": "workspace:*"
```

## Key Exports

| Export                  | Description                                                                                  |
|-------------------------|----------------------------------------------------------------------------------------------|
| `invariant`             | Core assertion function that throws `InvariantViolation` when condition is falsy             |
| `invariant.nonNull`     | Type-narrowing helper that asserts value is `NonNullable<T>`                                 |
| `invariant.unreachable` | Exhaustiveness guard for impossible code paths (accepts `never`)                             |
| `InvariantViolation`    | Error class with `message`, `file`, `line`, and `args` metadata                             |
| `CallMetadata`          | Effect Schema struct for validation of assertion metadata (`file`, `line`, `args`)          |

## Integration

`@beep/invariant` is a foundational package used throughout the monorepo for runtime assertions:

- **Safe for all layers**: domain, tables, server, client, ui (pure runtime code with no I/O or platform dependencies)
- **Effect-first**: `InvariantViolation` carries structured metadata, enabling pattern-matching and error mapping in application layers
- **Production-ready**: Integrates with logging strategies without coupling to specific implementations
- **Path alias**: Import as `@beep/invariant` (configured in `tsconfig.base.jsonc`)

## Module Structure

```
src/
├── invariant.ts   # Core assertion implementation with helpers
├── error.ts       # InvariantViolation error class
├── meta.ts        # CallMetadata schema for validation
└── index.ts       # Public API barrel
```

## Usage

### Basic Assertions

```typescript
import { invariant } from "@beep/invariant";
import * as Effect from "effect/Effect";

// Simple truthiness check
invariant(
  user != null,
  "User must exist",
  { file: "packages/iam/domain/User.ts", line: 42, args: [] }
);

// Lazy message for expensive operations
invariant(
  config.isValid(),
  () => `BUG: invalid config ${JSON.stringify(config)}`,
  { file: "packages/shared/server/Config.ts", line: 89, args: [config] }
);
```

### Type-Narrowing Helpers

```typescript
import { invariant } from "@beep/invariant";

// Non-null assertion with type narrowing
function processToken(maybeToken: string | null | undefined) {
  invariant.nonNull(
    maybeToken,
    "Token is required",
    { file: "auth.ts", line: 15, args: [maybeToken] }
  );
  // maybeToken is now typed as string
  return maybeToken.toUpperCase();
}

// Exhaustiveness check for union types
import * as Match from "effect/Match";

type Action = { type: "create" } | { type: "update" } | { type: "delete" };

function handle(action: Action): number {
  return Match.value(action).pipe(
    Match.when(
      (a): a is Extract<Action, { type: "create" }> => a.type === "create",
      () => 1
    ),
    Match.when(
      (a): a is Extract<Action, { type: "update" }> => a.type === "update",
      () => 2
    ),
    Match.when(
      (a): a is Extract<Action, { type: "delete" }> => a.type === "delete",
      () => 3
    ),
    Match.orElse((a) =>
      invariant.unreachable(
        a,
        "Unhandled action type",
        { file: "handlers.ts", line: 42, args: [a] }
      )
    )
  );
}
```

### Effect Integration

```typescript
import * as Effect from "effect/Effect";
import { invariant, InvariantViolation } from "@beep/invariant";

// Wrap invariants in Effect.try for error handling
const validateUser = (user: unknown) =>
  Effect.try({
    try: () => {
      invariant(
        typeof user === "object" && user !== null,
        "User must be an object",
        { file: "validation.ts", line: 12, args: [user] }
      );
      return user;
    },
    catch: (error) =>
      error instanceof InvariantViolation
        ? error
        : new Error("Unexpected validation error"),
  });

// Pattern match on InvariantViolation
const program = Effect.gen(function* () {
  const result = yield* Effect.try(() => {
    invariant.nonNull(
      process.env.API_KEY,
      "API_KEY environment variable required",
      { file: "env.ts", line: 8, args: [] }
    );
    return process.env.API_KEY;
  }).pipe(
    Effect.catchTag("UnknownException", (error) => {
      if (error.error instanceof InvariantViolation) {
        return Effect.fail(error.error);
      }
      return Effect.fail(new Error("Unknown error"));
    })
  );
  return result;
});
```

## Message Semantics

### BUG Prefix Convention

Messages prefixed with `BUG:` trigger debugger breakpoints in development:

```typescript
import { invariant } from "@beep/invariant";

// Programmer error - triggers debugger in dev mode
invariant(
  false,
  () => "BUG: this code path should be unreachable",
  { file: "domain/logic.ts", line: 156, args: [] }
);

// User/input error - no debugger trigger
invariant(
  email.includes("@"),
  "Invalid email format",
  { file: "validation.ts", line: 23, args: [email] }
);
```

### Lazy Messages

Use lazy messages `() => string` to avoid expensive string operations on the happy path:

```typescript
import { invariant } from "@beep/invariant";
import * as F from "effect/Function";
import * as A from "effect/Array";

// Lazy: serialization only happens if assertion fails
invariant(
  users.length > 0,
  () => `Expected users but got: ${JSON.stringify(users)}`,
  { file: "users.ts", line: 45, args: [users] }
);

// Not lazy: serialization happens every time
invariant(
  users.length > 0,
  `Expected users but got: ${JSON.stringify(users)}`, // ❌ expensive
  { file: "users.ts", line: 45, args: [users] }
);
```

## Metadata Guidelines

### File Paths

Provide repo-relative paths for clarity. Internal trimming extracts `packages/...` segments:

```typescript
import { invariant } from "@beep/invariant";

// ✅ Good: repo-relative path
invariant(condition, "message", {
  file: "packages/iam/domain/User/Register.ts",
  line: 78,
  args: []
});

// ✅ Also good: short relative path (will be trimmed)
invariant(condition, "message", {
  file: "src/domain/User.ts",
  line: 42,
  args: []
});
```

### Arguments

Keep `args` small, serializable, and PII-free:

```typescript
import { invariant } from "@beep/invariant";

// ✅ Good: primitive values and small objects
invariant(isValid, "Validation failed", {
  file: "validator.ts",
  line: 34,
  args: [userId, role, timestamp]
});

// ❌ Bad: PII, large objects, or circular references
invariant(isValid, "message", {
  file: "auth.ts",
  line: 12,
  args: [user.password, entireDatabase] // Don't do this!
});
```

Non-serializable values are handled defensively:

```typescript
// Circular references, BigInts, Symbols → best-effort formatting
invariant(false, "Failed", {
  file: "test.ts",
  line: 1,
  args: [BigInt(123), Symbol("test"), circularRef]
});
// Error message includes: "[object BigInt]", "[object Symbol]", etc.
```

## What Belongs Here

- **Pure assertion helpers** that validate conditions and throw structured errors
- **Schema-backed error types** for consistent failure representation
- **Type-narrowing utilities** that enhance TypeScript's control flow analysis
- **Metadata schemas** for validating assertion context

## What Must NOT Go Here

- **No I/O or side effects**: no network, DB, file system, timers, logging, or environment mutation
- **No platform dependencies**: avoid Node APIs (fs/path/process), DOM/React/Next, `@effect/platform-*`, `@effect/sql-*`
  - Note: Dev mode detection uses non-fatal `typeof process !== 'undefined'` check without Node dependency
- **No domain logic**: keep business rules in slice `domain` or `application` code
- **No cross-slice imports**: do not depend on `@beep/iam-*`, `@beep/documents-*`, etc.

## Dependencies

| Package    | Purpose                                                          |
|------------|------------------------------------------------------------------|
| `effect`   | Core Effect runtime, Schema for tagged errors and validation    |

## Development

```bash
# Type check
bun run --filter @beep/invariant check

# Lint
bun run --filter @beep/invariant lint

# Lint and auto-fix
bun run --filter @beep/invariant lint:fix

# Build
bun run --filter @beep/invariant build

# Run tests
bun run --filter @beep/invariant test

# Test with coverage
bun run --filter @beep/invariant coverage

# Check for circular dependencies
bun run --filter @beep/invariant lint:circular
```

## Examples

### Domain Precondition

```typescript
import { invariant } from "@beep/invariant";
import * as Str from "effect/String";
import * as F from "effect/Function";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateEmail = (input: { email: string }) => {
  invariant(
    F.pipe(input.email, Str.match(emailRegex), (m) => m !== null),
    "Invalid email format",
    { file: "packages/iam/domain/User/Register.ts", line: 19, args: [input.email] }
  );
  return input.email;
};
```

### Exhaustiveness in Reducers

```typescript
import { invariant } from "@beep/invariant";
import * as Match from "effect/Match";

type Event = { type: "INCREMENT" } | { type: "DECREMENT" };

const reduce = (state: number, event: Event): number =>
  Match.value(event).pipe(
    Match.when(
      (e): e is Extract<Event, { type: "INCREMENT" }> => e.type === "INCREMENT",
      () => state + 1
    ),
    Match.when(
      (e): e is Extract<Event, { type: "DECREMENT" }> => e.type === "DECREMENT",
      () => state - 1
    ),
    Match.orElse((e) =>
      invariant.unreachable(
        e,
        "Unhandled event type",
        { file: "reducer.ts", line: 15, args: [e] }
      )
    )
  );
```

### Effect Error Mapping

```typescript
import * as Effect from "effect/Effect";
import { InvariantViolation } from "@beep/invariant";

const safeOperation = Effect.try({
  try: () => riskyFunction(),
  catch: (e) =>
    e instanceof InvariantViolation
      ? e
      : new Error("Unknown error"),
});

// Map to domain error
const domainError = Effect.catchTag(safeOperation, "InvariantViolation", (err) =>
  Effect.fail(new DomainError({ message: err.message, context: err.args }))
);
```

## Usage Guidance

- **Prefer lazy messages**: Use `() => string` for expensive formatting
- **Keep args small**: Only include values needed for debugging; avoid large objects
- **Mind PII**: Never include passwords, tokens, or sensitive data in messages or args
- **Edge errors**: Map `InvariantViolation` to HTTP/domain errors in API handlers; don't leak internal details to clients
- **Line numbers**: Treat as hints, not guarantees (toolchains may transform code)

## Testing

- Unit tests use Bun's built-in test runner
- Assert on `InvariantViolation` instances with `.toThrow(InvariantViolation)`
- Validate error properties: `message`, `file`, `line`, `args`
- Avoid testing exact line numbers (they may differ across builds)

```typescript
import { describe, expect, it } from "bun:test";
import { invariant, InvariantViolation } from "@beep/invariant";

describe("invariant", () => {
  it("throws InvariantViolation on false condition", () => {
    expect(() =>
      invariant(false, "Failed", { file: "test.ts", line: 1, args: [] })
    ).toThrow(InvariantViolation);
  });

  it("includes metadata in error", () => {
    try {
      invariant.nonNull(null, "Value required", {
        file: "test.ts",
        line: 42,
        args: ["context"]
      });
    } catch (error) {
      expect(error).toBeInstanceOf(InvariantViolation);
      expect((error as InvariantViolation).file).toBe("test.ts");
      expect((error as InvariantViolation).line).toBe(42);
      expect((error as InvariantViolation).args).toEqual(["context"]);
    }
  });
});
```

## Versioning and Changes

- Broadly used package — prefer **additive** changes
- For breaking changes to error shape/API, update all consumers in the same PR
- Document migration path in PR description and update relevant AGENTS.md files

## Relationship to Other Packages

| Package          | Relationship                                                                 |
|------------------|------------------------------------------------------------------------------|
| `@beep/types`    | Compile-time helpers only; no runtime overlap                               |
| `@beep/utils`    | Pure runtime helpers; no assertions or error types                           |
| `@beep/errors`   | Application/server error facades; `InvariantViolation` stays generic        |
| `@beep/schema`   | Uses `@beep/invariant` for schema validation assertions                     |

## Guidelines for Adding New Features

- **Stay minimal**: This package should remain focused on assertions
- **Effect patterns**: Use `F.pipe`, Effect Array/String utilities (`A.*`, `Str.*`); never native methods
- **No I/O**: Keep all code pure and side-effect-free
- **Schema-backed**: Use Effect Schema for any new error types
- **Attach to `invariant`**: New helpers should be properties on the main function (see `nonNull`, `unreachable`)
- **Document**: Add JSDoc, examples, and tests for new helpers
- **Update AGENTS.md**: Keep agent guidance synchronized with API changes
