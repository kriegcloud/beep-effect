# Match — Agent Context

> Best practices for using `effect/Match` in this codebase.

## Quick Reference

| Function | Purpose | Example |
|----------|---------|---------|
| `Match.value(val)` | Start matching | `Match.value(status)` |
| `Match.when(pred, fn)` | Match case | `Match.when("active", () => "✓")` |
| `Match.orElse(fn)` | Default case | `Match.orElse(() => "?")` |
| `Match.type()` | Match constructor | `Match.type<User>()` |
| `Match.tag(tag, fn)` | Match by tag field | `Match.tag("Success", handleSuccess)` |
| `Match.typeTags()` | Match discriminated union | `Match.typeTags({ Success: handleSuccess, Failure: handleFailure })` |

## Codebase Patterns

### ALWAYS Use Namespace Import

```typescript
// REQUIRED - Import as namespace
import * as Match from "effect/Match";

// FORBIDDEN - Named imports
import { value, when } from "effect/Match";  // WRONG!
```

### ALWAYS Use Match Instead of Switch

This codebase has **banned switch statements**. Route ALL pattern matching through `effect/Match`:

```typescript
// FORBIDDEN - switch statement
switch (status) {
  case "active":
    return "✓";
  case "inactive":
    return "✗";
  default:
    return "?";
}

// REQUIRED - Match.value with when/orElse
import * as Match from "effect/Match";

const result = Match.value(status).pipe(
  Match.when("active", () => "✓"),
  Match.when("inactive", () => "✗"),
  Match.orElse(() => "?")
);
```

### Match Literal Values

```typescript
import * as Match from "effect/Match";

const statusIcon = Match.value(status).pipe(
  Match.when("pending", () => "⏳"),
  Match.when("active", () => "✓"),
  Match.when("complete", () => "✅"),
  Match.orElse(() => "❓")
);
```

### Match with Predicates

```typescript
import * as Match from "effect/Match";

const category = Match.value(age).pipe(
  Match.when((n) => n < 13, () => "child"),
  Match.when((n) => n < 20, () => "teen"),
  Match.when((n) => n < 65, () => "adult"),
  Match.orElse(() => "senior")
);
```

### Match Discriminated Unions with typeTags

**This is the RECOMMENDED pattern for tagged errors and domain types:**

```typescript
import * as Match from "effect/Match";
import * as S from "effect/Schema";

// Tagged error union
class NotFoundError extends S.TaggedError<NotFoundError>()(
  "NotFoundError",
  { id: S.String }
) {}

class ValidationError extends S.TaggedError<ValidationError>()(
  "ValidationError",
  { field: S.String, message: S.String }
) {}

type DomainError = NotFoundError | ValidationError;

// Match by _tag field
const handleError = (error: DomainError) =>
  Match.value(error).pipe(
    Match.typeTags({
      NotFoundError: (err) => `Not found: ${err.id}`,
      ValidationError: (err) => `Invalid ${err.field}: ${err.message}`
    })
  );
```

### Match Tagged Unions (Domain Events)

```typescript
import * as Match from "effect/Match";

type Event =
  | { _tag: "Created"; id: string; name: string }
  | { _tag: "Updated"; id: string; changes: Record<string, unknown> }
  | { _tag: "Deleted"; id: string };

const handleEvent = (event: Event) =>
  Match.value(event).pipe(
    Match.typeTags({
      Created: (e) => Effect.log(`Created ${e.name}`),
      Updated: (e) => Effect.log(`Updated ${e.id}`),
      Deleted: (e) => Effect.log(`Deleted ${e.id}`)
    })
  );
```

### Match with Type Guards

```typescript
import * as Match from "effect/Match";
import * as P from "effect/Predicate";

const processValue = (value: unknown) =>
  Match.type<unknown>().pipe(
    Match.when(P.isString, (s) => s.toUpperCase()),
    Match.when(P.isNumber, (n) => n * 2),
    Match.orElse(() => "unknown")
  )(value);
```

### Exhaustive Matching

When matching discriminated unions, **typeTags ensures exhaustiveness**:

```typescript
import * as Match from "effect/Match";

type Action =
  | { _tag: "Increment"; by: number }
  | { _tag: "Decrement"; by: number }
  | { _tag: "Reset" };

// TypeScript will error if a case is missing
const reducer = (state: number, action: Action): number =>
  Match.value(action).pipe(
    Match.typeTags({
      Increment: (a) => state + a.by,
      Decrement: (a) => state - a.by,
      Reset: () => 0
      // If you add a new action type, TypeScript will error here
    })
  );
```

### Practical Example from Codebase

From `packages/common/invariant/README.md`:

```typescript
import * as Match from "effect/Match";

type Action =
  | { _tag: "Insert"; entity: Entity }
  | { _tag: "Update"; entity: Entity }
  | { _tag: "Delete"; entityId: string };

const apply = (state: State, action: Action): State =>
  Match.value(action).pipe(
    Match.when(
      { _tag: "Insert" },
      ({ entity }) => addEntity(state, entity)
    ),
    Match.when(
      { _tag: "Update" },
      ({ entity }) => updateEntity(state, entity)
    ),
    Match.when(
      { _tag: "Delete" },
      ({ entityId }) => removeEntity(state, entityId)
    ),
    Match.orElse((a) =>
      Effect.die(`Unhandled action: ${a._tag}`)
    )
  );
```

### Combine with Effect

```typescript
import * as Match from "effect/Match";
import * as Effect from "effect/Effect";

const processResult = (result: Result) =>
  Match.value(result).pipe(
    Match.typeTags({
      Success: (r) => Effect.log(`Success: ${r.value}`),
      Failure: (r) => Effect.fail(new AppError({ message: r.error }))
    })
  );
```

### Match Option

```typescript
import * as Match from "effect/Match";
import * as O from "effect/Option";

const handleOption = (opt: O.Option<string>) =>
  Match.value(opt).pipe(
    Match.when({ _tag: "Some" }, ({ value }) => `Found: ${value}`),
    Match.when({ _tag: "None" }, () => "Not found"),
    Match.exhaustive  // Ensures all cases handled
  );

// Or use O.match (simpler for Option)
const handleOption2 = O.match(opt, {
  onNone: () => "Not found",
  onSome: (value) => `Found: ${value}`
});
```

## Anti-Patterns

### NEVER Use Switch Statements

```typescript
// FORBIDDEN - switch statements banned
switch (status) {
  case "active":
    return "✓";
  case "inactive":
    return "✗";
  default:
    return "?";
}

// REQUIRED - Match.value
import * as Match from "effect/Match";

Match.value(status).pipe(
  Match.when("active", () => "✓"),
  Match.when("inactive", () => "✗"),
  Match.orElse(() => "?")
);
```

### NEVER Use if/else Chains for Discriminated Unions

```typescript
// FORBIDDEN - if/else chains
if (error._tag === "NotFound") {
  return handleNotFound(error);
} else if (error._tag === "Validation") {
  return handleValidation(error);
} else {
  return handleUnknown(error);
}

// REQUIRED - Match.typeTags
import * as Match from "effect/Match";

Match.value(error).pipe(
  Match.typeTags({
    NotFound: handleNotFound,
    Validation: handleValidation
  }),
  Match.orElse(handleUnknown)
);
```

### NEVER Forget orElse

```typescript
// FORBIDDEN - No default case (may throw at runtime)
const result = Match.value(status).pipe(
  Match.when("active", () => "✓"),
  Match.when("inactive", () => "✗")
  // Missing orElse!
);

// REQUIRED - Always provide orElse OR use exhaustive
const result = Match.value(status).pipe(
  Match.when("active", () => "✓"),
  Match.when("inactive", () => "✗"),
  Match.orElse(() => "?")
);
```

### NEVER Mix Match with typeof Checks

```typescript
// FORBIDDEN - typeof checks
if (typeof value === "string") {
  return value.toUpperCase();
} else if (typeof value === "number") {
  return value * 2;
}

// REQUIRED - Match with predicates
import * as Match from "effect/Match";
import * as P from "effect/Predicate";

Match.type<unknown>().pipe(
  Match.when(P.isString, (s) => s.toUpperCase()),
  Match.when(P.isNumber, (n) => n * 2),
  Match.orElse(() => "unknown")
)(value);
```

## Related Modules

- **[Option.md](./Option.md)** - Use `O.match` for simpler Option matching
- **[Either.md](./Either.md)** - Use `Either.match` for simpler Either matching
- **effect/Schema** - Tagged errors for discriminated unions
- **effect/Predicate** - Type guards for `Match.when`

## Source Reference

[`.repos/effect/packages/effect/src/Match.ts`](../../.repos/effect/packages/effect/src/Match.ts)

## Key Takeaways

1. **ALWAYS** use `import * as Match from "effect/Match"`
2. **NEVER** use switch statements - use Match instead
3. **Use `Match.typeTags`** for discriminated unions (tagged errors, domain events)
4. **Use `Match.when`** for literal values or predicates
5. **ALWAYS provide `orElse`** or use `exhaustive` for type safety
6. **Match is exhaustive** - TypeScript checks all cases with typeTags
7. **Prefer `O.match`/`Either.match`** for simple Option/Either matching
