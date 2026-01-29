# P9 Switch Statement Discovery Agent

## Your Mission

Scan the specified scope for `switch` statements and produce a checklist document.

## Scope

Same batching as previous phases.

Base path: `apps/todox/src/app/lexical/`

## Target Patterns

Search for switch statements:

```
switch\s*\(
case\s+['"]:
default\s*:
```

## Replacement Pattern

```typescript
// BEFORE
switch (status) {
  case "active":
    return handleActive();
  case "inactive":
    return handleInactive();
  default:
    return handleUnknown();
}

// AFTER
import * as Match from "effect/Match";

Match.value(status).pipe(
  Match.when("active", () => handleActive()),
  Match.when("inactive", () => handleInactive()),
  Match.orElse(() => handleUnknown())
)
```

## Output Format

Create: `specs/lexical-effect-alignment/outputs/P9-discovery-[batch].md`

```markdown
# P9 Switch Discovery - Batch [N]

## Summary
- Files scanned: [count]
- Switch statements found: [count]
- Total cases: [count]

## Checklist

### [relative/path/to/file.ts]
- [ ] `full/path:LINE` - `switch (type)` - 5 cases + default - Replace with `Match.value(type).pipe(...)`
  - Cases: "a", "b", "c", "d", "e"
  - Has default: yes
```

## Analysis Requirements

For each switch statement, document:
1. **Discriminant expression** - What's being switched on
2. **Case count** - Number of case clauses
3. **Case values** - The literal values or types
4. **Has default** - Whether default clause exists
5. **Return type** - What the switch returns/does

## Special Cases

### Type Switches (typeof)

```typescript
// BEFORE
switch (typeof value) {
  case "string": return "str";
  case "number": return "num";
}

// AFTER
Match.value(value).pipe(
  Match.when(Match.string, () => "str"),
  Match.when(Match.number, () => "num"),
  Match.orElse(() => "unknown")
)
```

### Discriminated Unions

```typescript
// BEFORE
switch (node._type) {
  case "paragraph": ...
  case "heading": ...
}

// AFTER (if _type is a discriminator)
Match.type<MyUnion>().pipe(
  Match.tag("paragraph", (p) => ...),
  Match.tag("heading", (h) => ...),
  Match.exhaustive
)
```

### Fall-through Cases

Flag these specially as they need careful migration:

```typescript
switch (val) {
  case "a":
  case "b":
    return "ab";  // Fall-through
}

// AFTER
Match.value(val).pipe(
  Match.whenOr("a", "b", () => "ab"),
  Match.orElse(() => "other")
)
```

## Critical Rules

1. **NO CODE CHANGES** - Only produce the checklist
2. **DOCUMENT COMPLEXITY** - Note fall-through, nested switches
3. **IDENTIFY DISCRIMINANTS** - What expression is being switched
4. **COUNT CASES** - For batch sizing

## Exclusions

Do NOT flag:
- Switch statements inside third-party library code
- Comments containing switch examples
