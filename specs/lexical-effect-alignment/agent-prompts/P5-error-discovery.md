# P5 Error Discovery Agent

## Your Mission

Scan the specified scope for native JavaScript Error usage and produce a checklist document.

## Scope

Same batching as previous phases.

Base path: `apps/todox/src/app/lexical/`

## Target Patterns

Search for these Error patterns:

### Error Construction
```
new Error\(
throw new Error\(
Error\(
```

### Error Throwing
```
throw\s+
```

### Error Types (Built-in)
```
new TypeError\(
new RangeError\(
new SyntaxError\(
new ReferenceError\(
```

## Error Schema Location Decision

| Context | Location |
|---------|----------|
| Error used across multiple files in lexical module | `apps/todox/src/app/lexical/schema/errors.ts` |
| Error specific to single file | Top of that file |

## Replacement Pattern

```typescript
// BEFORE
throw new Error("Something went wrong");

// AFTER
import * as S from "effect/Schema";
import * as Effect from "effect/Effect";

// Define once (in schema/errors.ts or file top)
export class SomethingWentWrongError extends S.TaggedError<SomethingWentWrongError>()(
  "SomethingWentWrongError",
  {
    message: S.String,
    // Add context fields as needed
  }
) {}

// Use
Effect.fail(new SomethingWentWrongError({ message: "Something went wrong" }))
```

## Output Format

Create: `specs/lexical-effect-alignment/outputs/P5-discovery-[batch].md`

```markdown
# P5 Error Discovery - Batch [N]

## Summary
- Files scanned: [count]
- Violations found: [count]
- Unique error types needed: [count]

## Checklist

### [relative/path/to/file.ts]
- [ ] `full/path:LINE` - `throw new Error("msg")` - Replace with `Effect.fail(new XError({ message: "msg" }))`
- [ ] `full/path:LINE` - `new Error("msg")` - Replace with `new XError({ message: "msg" })`

## Suggested Error Schemas

Based on error messages found:
- [ ] `ParseError` - For parsing failures
- [ ] `ValidationError` - For validation failures
- [ ] `NetworkError` - For network failures
- [ ] [Additional based on findings]
```

## Critical Rules

1. **NO CODE CHANGES** - Only produce the checklist
2. **CATEGORIZE ERRORS** - Group similar error messages into schema candidates
3. **PRESERVE CONTEXT** - Note error messages for schema field design
4. **IDENTIFY PATTERNS** - Look for error types that should be shared

## Special Considerations

### Synchronous Code

For synchronous code that throws, consider:
- Can it be wrapped in Effect?
- Does the caller handle errors?
- Is it a Lexical/React callback that must throw?

If the code MUST throw (e.g., Lexical API requirement), document but don't flag for migration.

### Error Propagation

Note where errors propagate to help design error hierarchy.
