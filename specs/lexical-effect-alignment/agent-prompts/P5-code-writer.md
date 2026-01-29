# P5 Error Code Writer Agent

## Your Mission

Replace native Error usage with Effect TaggedError schemas in your assigned file.

## Import Statements

Add these imports if not already present:

```typescript
import * as S from "effect/Schema";
import * as Effect from "effect/Effect";
```

## Error Schema Definition

### Schema Location Decision

| Scenario | Location |
|----------|----------|
| Error used in multiple files | `apps/todox/src/app/lexical/schema/errors.ts` |
| Error specific to this file | Top of this file, after imports |

### Schema Template

```typescript
export class MyError extends S.TaggedError<MyError>()("MyError", {
  message: S.String,
  // Add contextual fields based on error usage
}) {}
```

### Naming Convention

| Error Message Pattern | Suggested Name |
|----------------------|----------------|
| "Invalid X" | `InvalidXError` |
| "X not found" | `XNotFoundError` |
| "Failed to X" | `XFailureError` |
| "X is required" | `MissingXError` |
| "Cannot X" | `CannotXError` |

## Migration Patterns

### Simple Throw

```typescript
// BEFORE
throw new Error("User not found");

// AFTER
// At file top:
export class UserNotFoundError extends S.TaggedError<UserNotFoundError>()(
  "UserNotFoundError",
  { message: S.String }
) {}

// At throw site:
// If in Effect context:
yield* Effect.fail(new UserNotFoundError({ message: "User not found" }));

// If must remain synchronous (rare):
throw new UserNotFoundError({ message: "User not found" });
```

### Error with Context

```typescript
// BEFORE
throw new Error(`Invalid node type: ${type}`);

// AFTER
export class InvalidNodeTypeError extends S.TaggedError<InvalidNodeTypeError>()(
  "InvalidNodeTypeError",
  {
    message: S.String,
    nodeType: S.String,
  }
) {}

yield* Effect.fail(new InvalidNodeTypeError({
  message: `Invalid node type: ${type}`,
  nodeType: type,
}));
```

### Conditional Throw

```typescript
// BEFORE
if (!valid) {
  throw new Error("Validation failed");
}

// AFTER
if (!valid) {
  return yield* Effect.fail(new ValidationError({ message: "Validation failed" }));
}

// OR using Effect.when:
yield* Effect.when(
  Effect.fail(new ValidationError({ message: "Validation failed" })),
  () => !valid
);
```

### Error in Callback

```typescript
// BEFORE
array.map(item => {
  if (!item.valid) throw new Error("Invalid item");
  return item.value;
});

// AFTER (if context allows Effect):
Effect.forEach(array, item =>
  item.valid
    ? Effect.succeed(item.value)
    : Effect.fail(new InvalidItemError({ message: "Invalid item" }))
);
```

## Shared Errors File

If creating `apps/todox/src/app/lexical/schema/errors.ts`:

```typescript
import * as S from "effect/Schema";

// Lexical-specific errors
export class LexicalParseError extends S.TaggedError<LexicalParseError>()(
  "LexicalParseError",
  {
    message: S.String,
    input: S.optional(S.String),
  }
) {}

export class LexicalNodeError extends S.TaggedError<LexicalNodeError>()(
  "LexicalNodeError",
  {
    message: S.String,
    nodeType: S.optional(S.String),
  }
) {}

export class LexicalPluginError extends S.TaggedError<LexicalPluginError>()(
  "LexicalPluginError",
  {
    message: S.String,
    pluginName: S.optional(S.String),
  }
) {}

// Add more as discovered
```

## Special Cases

### Lexical/React Callbacks That Must Throw

Some Lexical callbacks MUST throw for error propagation. Document but preserve:

```typescript
// This MUST throw - Lexical expects it
// TODO: Consider Effect wrapper at higher level
importJSON(json: SerializedNode): void {
  if (!json.valid) throw new Error("Invalid JSON");  // KEEP AS IS
}
```

### Try-Catch Blocks

```typescript
// BEFORE
try {
  riskyOperation();
} catch (e) {
  throw new Error(`Failed: ${e}`);
}

// AFTER
yield* Effect.tryPromise({
  try: () => riskyOperation(),
  catch: (e) => new OperationFailedError({
    message: `Failed: ${String(e)}`,
    cause: String(e),
  }),
});
```

## Critical Rules

1. **PRESERVE ERROR SEMANTICS** - Errors should convey same information
2. **ADD CONTEXT FIELDS** - Extract useful info into schema fields
3. **USE CONSISTENT NAMING** - Follow naming convention
4. **DOCUMENT EXCEPTIONS** - Add TODO for forced synchronous throws
5. **CREATE SHARED ERRORS** - If error is used in 2+ files, put in errors.ts

## Verification

After changes:
```bash
bun tsc --noEmit --isolatedModules path/to/file.ts
```

## Completion

Mark checklist items complete:
```markdown
- [x] `path/to/file.ts:42` - `throw new Error()` - Replaced with `Effect.fail(new XError())`
```
