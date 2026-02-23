# Either — Agent Context

> Best practices for using `effect/Either` in this codebase.

## Quick Reference

| Function | Purpose | Example |
|----------|---------|---------|
| `Either.left(error)` | Create Left (error) | `Either.left("Invalid input")` |
| `Either.right(value)` | Create Right (success) | `Either.right(42)` |
| `Either.map(either, fn)` | Transform Right value | `Either.map(result, x => x * 2)` |
| `Either.flatMap(either, fn)` | Chain Eithers | `Either.flatMap(validated, process)` |
| `Either.match(either, {onLeft, onRight})` | Pattern match | `Either.match(result, { onLeft: handleErr, onRight: handleOk })` |
| `Either.isLeft(either)` | Check if Left | `Either.isLeft(result)` |
| `Either.isRight(either)` | Check if Right | `Either.isRight(result)` |
| `Either.getOrElse(either, fallback)` | Extract with fallback | `Either.getOrElse(result, () => defaultValue)` |
| `Either.all(eithers)` | Combine multiple | `Either.all([e1, e2, e3])` |

## Codebase Patterns

### ALWAYS Use Namespace Import

```typescript
// REQUIRED - Import as namespace
import * as Either from "effect/Either";

// FORBIDDEN - Named imports
import { left, right } from "effect/Either";  // WRONG!
```

### When to Use Either vs Option

**Use Either when:**
- You need to know **why** an operation failed
- Validation with specific error messages
- Result has success value OR error information
- Parsing/decoding operations

**Use Option when:**
- Value simply may or may not exist
- No error information needed (just presence/absence)
- "Not found" scenarios without details

```typescript
// Use Option for simple presence
const maybeUser = O.fromNullable(users.get(id));

// Use Either for validation with error details
const validateEmail = (input: string): Either.Either<string, Email> =>
  input.includes("@")
    ? Either.right(input as Email)
    : Either.left("Email must contain @");
```

### Create Either Values

```typescript
import * as Either from "effect/Either";

// Success case
const success = Either.right(42);

// Error case
const failure = Either.left("Something went wrong");

// From Option with error message
const eitherFromOption = O.match(maybeValue, {
  onNone: () => Either.left("Value not found"),
  onSome: (value) => Either.right(value)
});
```

### Pattern Match with Either.match

```typescript
import * as Either from "effect/Either";

const result = Either.match(validated, {
  onLeft: (error) => `Error: ${error}`,
  onRight: (value) => `Success: ${value}`
});
```

### Transform Right Values

```typescript
import * as Either from "effect/Either";

// map only affects Right values, Left passes through
const doubled = Either.map(numberEither, n => n * 2);

// If Left("error") → Left("error")
// If Right(5) → Right(10)
```

### Chain Either Operations

```typescript
import * as Either from "effect/Either";

const result = Either.pipe(
  validateInput(input),
  Either.flatMap(valid => processData(valid)),
  Either.flatMap(processed => save(processed))
);

// If any step returns Left, chain short-circuits
```

### Combine Multiple Eithers

```typescript
import * as Either from "effect/Either";

// All must be Right, or returns first Left
const combined = Either.all([
  validateName(name),
  validateEmail(email),
  validateAge(age)
]);

// If all Right → Right([name, email, age])
// If any Left → that Left value

// With struct
const combined = Either.all({
  name: validateName(name),
  email: validateEmail(email),
  age: validateAge(age)
});
// Returns Either<Error, { name, email, age }>
```

### Validation Patterns

```typescript
import * as Either from "effect/Either";
import * as F from "effect/Function";

// Single field validation
const validateAge = (age: number): Either.Either<string, number> =>
  age >= 0 && age < 150
    ? Either.right(age)
    : Either.left("Age must be between 0 and 150");

// Compose validations
const validateUser = (input: unknown) =>
  F.pipe(
    validateShape(input),
    Either.flatMap(validateEmail),
    Either.flatMap(validateAge),
    Either.flatMap(validatePassword)
  );
```

### File Type Detection Example

From `packages/common/schema/src/integrations/files/file-types/detection.ts`:

```typescript
import * as Either from "effect/Either";

// Returns Either for validation result
const detectFileType = (
  buffer: Uint8Array
): Either.Either<InvalidFileTypeError, FileType> => {
  const chunk = getFileChunkEither(buffer, 0, 4100);

  if (Either.isLeft(chunk)) {
    return Either.left(new InvalidFileTypeError({
      message: "Buffer too small"
    }));
  }

  const detected = detectFromMagicBytes(Either.getRight(chunk));

  return detected
    ? Either.right(detected)
    : Either.left(new InvalidFileTypeError({
      message: "Unknown file type"
    }));
};
```

### Convert to Effect

```typescript
import * as Effect from "effect/Effect";
import * as Either from "effect/Either";

// Convert Either to Effect
const effect = Either.match(result, {
  onLeft: (error) => Effect.fail(new MyError({ message: error })),
  onRight: (value) => Effect.succeed(value)
});

// Or use Effect.fromEither (when error is already an error type)
const effect2 = Effect.fromEither(result);
```

## Anti-Patterns

### NEVER Use try/catch for Expected Errors

```typescript
// FORBIDDEN - try/catch for validation
try {
  const valid = validate(input);
  return valid;
} catch (e) {
  return null;
}

// REQUIRED - Either for validation
const result = validate(input);  // Returns Either<ValidationError, Valid>

return Either.match(result, {
  onLeft: (error) => null,
  onRight: (value) => value
});
```

### NEVER Throw from Pure Functions

```typescript
// FORBIDDEN - Throwing in pure validation
const validateAge = (age: number): number => {
  if (age < 0) throw new Error("Age must be positive");
  return age;
};

// REQUIRED - Return Either
const validateAge = (age: number): Either.Either<string, number> =>
  age >= 0
    ? Either.right(age)
    : Either.left("Age must be positive");
```

### NEVER Ignore Left Values

```typescript
// FORBIDDEN - Assuming success
const value = Either.getRight(result);  // Throws if Left!

// REQUIRED - Handle both cases
const value = Either.match(result, {
  onLeft: (error) => defaultValue,
  onRight: (value) => value
});

// Or use getOrElse
const value = Either.getOrElse(result, () => defaultValue);
```

### NEVER Mix Either with Exceptions

```typescript
// FORBIDDEN - Mixed error handling
const process = (input: string): Either.Either<string, Result> => {
  if (!input) return Either.left("Input required");
  if (input.length < 3) throw new Error("Too short");  // WRONG!
  return Either.right(parse(input));
};

// REQUIRED - Consistent Either usage
const process = (input: string): Either.Either<string, Result> => {
  if (!input) return Either.left("Input required");
  if (input.length < 3) return Either.left("Too short");
  return Either.right(parse(input));
};
```

## Related Modules

- **[Option.md](./Option.md)** - Use Option when no error information needed
- **[Match.md](./Match.md)** - Alternative pattern matching approach
- **effect/Effect** - Convert Either to Effect with `Effect.fromEither`
- **effect/ParseResult** - Schema validation returns Either-like results

## Source Reference

[`.repos/effect/packages/effect/src/Either.ts`](../../.repos/effect/packages/effect/src/Either.ts)

## Key Takeaways

1. **ALWAYS** use `import * as Either from "effect/Either"`
2. **Use Either** when you need error information (validation, parsing)
3. **Use Option** when you only care about presence/absence
4. **Either.left** for error, **Either.right** for success
5. **Either.match** for exhaustive pattern matching
6. **Either.flatMap** to chain operations that may fail
7. **Either.all** to combine multiple validations
8. **NEVER throw** in pure functions - return Either instead
