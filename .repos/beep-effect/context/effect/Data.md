# Data — Agent Context

> Quick reference for AI agents working with `effect/Data`

## Quick Reference

| Function | Purpose | Example |
|----------|---------|---------|
| `Data.TaggedError("Tag")<Fields>` | Create typed error with structural equality | `class MyError extends Data.TaggedError("MyError")<{ message: string }>` |
| `Data.Class<Fields>` | Immutable class with structural equality | `class Person extends Data.Class<{ name: string }>` |
| `Data.TaggedClass("Tag")<Fields>` | Immutable class with `_tag` discriminator | `class Action extends Data.TaggedClass("Action")<{ type: string }>` |
| `Data.struct(obj)` | Create structural value object | `const point = Data.struct({ x: 1, y: 2 })` |
| `Data.tuple(...values)` | Create structural tuple | `const pair = Data.tuple("Alice", 30)` |
| `Data.case<Interface>()` | Create case constructor | `const Person = Data.case<Person>()` |
| `Data.tagged<Interface>("Tag")` | Create tagged case constructor | `const Person = Data.tagged<Person>("Person")` |
| `Data.array(arr)` | Create structural array | `const items = Data.array([1, 2, 3])` |

## Codebase Patterns

### Tagged Errors (Primary Pattern)

ALWAYS use `Data.TaggedError` for domain errors. This provides structural equality, pattern matching via `_tag`, and integration with Effect error handling.

```typescript
import * as Data from "effect/Data";

// REQUIRED - Tagged error for domain failures
export class MetadataParseError extends Data.TaggedError("MetadataParseError")<{
  readonly message: string;
  readonly cause: unknown;
  readonly fileName?: string | undefined;
  readonly phase?: "read" | "parse" | "decode" | undefined;
}> {}

export class FileReadError extends Data.TaggedError("FileReadError")<{
  readonly message: string;
  readonly cause: unknown;
  readonly fileName?: string | undefined;
}> {}

// Usage in Effect programs
import * as Effect from "effect/Effect";

const program = Effect.gen(function* () {
  const content = yield* readFile(path).pipe(
    Effect.catchTag("FileReadError", (error) =>
      Effect.logError("file.read.failed", { error })
    )
  );
  return content;
});
```

**Key Benefits:**
- Structural equality: `Equal.equals(error1, error2)` compares by value
- Pattern matching: `Effect.catchTag("FileReadError", handler)` works automatically
- Type safety: `_tag` field enables discriminated union handling
- Integration: Works seamlessly with Effect's error channel

### Immutable Value Objects

Use `Data.Class` for immutable domain value objects that need structural equality.

```typescript
import * as Data from "effect/Data";

// REQUIRED - Immutable value object
export class CookieConsentKey extends Data.Class {
  static readonly schema: BS.LiteralWithDefault.Schema<"cookieConsent"> =
    BS.LiteralWithDefault("cookieConsent").annotations(
      $I.annotations("CookieConsentKey", {
        description: "Key for cookie consent",
      })
    );
  static readonly default = "cookieConsent";

  constructor() {
    super();
  }
}

export class CookiePreferenceKey extends Data.Class {
  static readonly schema: BS.LiteralWithDefault.Schema<"cookiePreferences"> =
    BS.LiteralWithDefault("cookiePreferences");
  static readonly default = "cookiePreferences";

  constructor() {
    super();
  }
}
```

**When to Use:**
- Configuration objects that need equality checks
- Value objects in domain models
- Cache keys or identifiers that need structural comparison

### Tagged Classes for Discriminated Unions

Use `Data.TaggedClass` when building discriminated unions or state machines.

```typescript
import * as Data from "effect/Data";

// REQUIRED - Tagged class for union types
export class TaggedUnionFactory<
  Discriminator extends string,
  Fields extends Record<string, any>
> extends Data.TaggedClass("TaggedUnionFactory")<{
  readonly discriminator: Discriminator;
  readonly fields: Fields;
}> {}

// FlexLayout-React model pattern
export abstract class Node extends Data.Class {
  abstract toJson(): any;
  abstract getModel(): Model;
}

export class Actions extends Data.Class {
  // Immutable action class for layout operations
}
```

**When to Use:**
- ADTs (Algebraic Data Types) requiring `_tag` discrimination
- State machine states
- Command/Event patterns
- Model objects requiring structural equality

### Structural Values with Data.struct

Use `Data.struct` for creating ad-hoc structural values with equality.

```typescript
import * as Data from "effect/Data";

// REQUIRED - Structural value objects
const defaultExponentialBackoffOptions = Data.struct({
  base: 2,
  factor: 1000,
  maxDelay: 60000,
});

export const Retry = Data.struct({
  exponential: defaultExponentialBackoffOptions,
  fixed: Data.struct({ delay: 1000 }),
});

// Cache configuration
const cacheConfig = Data.struct({
  maxSize: 1000,
  ttl: 60000,
  evictionPolicy: "lru" as const,
});
```

**When to Use:**
- Configuration objects
- Options/settings bundles
- Return values needing structural equality
- Test fixtures requiring value comparison

### Relationship to Schema

**CRITICAL:** `Schema.TaggedError` extends `Data.TaggedError`, inheriting structural equality and pattern matching while adding schema validation.

```typescript
import * as S from "effect/Schema";
import * as Data from "effect/Data";

// Schema.TaggedError - Preferred for validated errors
export class ValidationError extends S.TaggedError<ValidationError>()(
  "ValidationError",
  {
    message: S.String,
    field: S.String,
    code: S.Literal("required", "invalid", "too_long"),
  }
) {}

// Data.TaggedError - Use when schema validation not needed
export class SimpleError extends Data.TaggedError("SimpleError")<{
  message: string;
}> {}
```

**Decision Guide:**
- Use `S.TaggedError` when error fields need validation/transformation
- Use `Data.TaggedError` for simple errors with known-good values
- Both support `Effect.catchTag` pattern matching

## Anti-Patterns

### NEVER use plain Error constructors

```typescript
// FORBIDDEN - Plain Error loses type information
throw new Error("Something went wrong");
Effect.fail(new Error("Bad input"));

// REQUIRED - Tagged error with structured data
export class InvalidInputError extends Data.TaggedError("InvalidInputError")<{
  message: string;
  field: string;
}> {}

Effect.fail(new InvalidInputError({
  message: "Invalid email format",
  field: "email"
}));
```

### NEVER use plain classes without Data.Class

```typescript
// FORBIDDEN - No structural equality
class Point {
  constructor(
    readonly x: number,
    readonly y: number
  ) {}
}

const p1 = new Point(1, 2);
const p2 = new Point(1, 2);
Equal.equals(p1, p2); // false - reference equality only

// REQUIRED - Structural equality via Data.Class
class Point extends Data.Class<{ readonly x: number; readonly y: number }> {}

const p1 = new Point({ x: 1, y: 2 });
const p2 = new Point({ x: 1, y: 2 });
Equal.equals(p1, p2); // true - value equality
```

### NEVER manually implement equality methods

```typescript
// FORBIDDEN - Manual equality implementation
class Config {
  constructor(readonly host: string, readonly port: number) {}

  equals(other: Config): boolean {
    return this.host === other.host && this.port === other.port;
  }
}

// REQUIRED - Automatic structural equality
class Config extends Data.Class<{
  readonly host: string;
  readonly port: number;
}> {}

// Or use Data.struct for ad-hoc values
const config = Data.struct({ host: "localhost", port: 3000 });
```

### NEVER mix Data types with plain objects in equality checks

```typescript
// FORBIDDEN - Comparing Data with plain objects
const dataPoint = Data.struct({ x: 1, y: 2 });
const plainPoint = { x: 1, y: 2 };
Equal.equals(dataPoint, plainPoint); // false - type mismatch

// REQUIRED - Compare Data types only
const dataPoint1 = Data.struct({ x: 1, y: 2 });
const dataPoint2 = Data.struct({ x: 1, y: 2 });
Equal.equals(dataPoint1, dataPoint2); // true
```

### NEVER forget _tag in discriminated unions

```typescript
// FORBIDDEN - Missing _tag field
type Action =
  | { type: "increment"; value: number }
  | { type: "decrement"; value: number };

// REQUIRED - TaggedClass provides _tag automatically
class IncrementAction extends Data.TaggedClass("Increment")<{
  value: number;
}> {}

class DecrementAction extends Data.TaggedClass("Decrement")<{
  value: number;
}> {}

type Action = IncrementAction | DecrementAction;

// Now Effect.catchTag and Match.tag work correctly
Effect.gen(function* () {
  const action = yield* getAction();

  yield* Match.value(action).pipe(
    Match.tag("Increment", ({ value }) => increment(value)),
    Match.tag("Decrement", ({ value }) => decrement(value)),
    Match.exhaustive
  );
});
```

## Related Modules

- [Equal.md](./Equal.md) - Structural equality checking
- [Match.md](./Match.md) - Pattern matching on tagged types
- [Schema.md](./Schema.md) - Schema.TaggedError extends Data.TaggedError
- [Effect.md](./Effect.md) - Effect.catchTag for error handling

## Source Reference

[.repos/effect/packages/effect/src/Data.ts](../../.repos/effect/packages/effect/src/Data.ts)
