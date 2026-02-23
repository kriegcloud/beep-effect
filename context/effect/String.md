# String — Agent Context

> Best practices for using `effect/String` in this codebase.

## Quick Reference

| Function | Purpose | Example |
|----------|---------|---------|
| `Str.toLowerCase` | Convert to lowercase | `Str.toLowerCase(s)` |
| `Str.toUpperCase` | Convert to uppercase | `Str.toUpperCase(s)` |
| `Str.split(sep)` | Split string by separator | `Str.split(",")(s)` |
| `Str.slice(start, end)` | Extract substring | `Str.slice(0, 5)(s)` |
| `Str.trim` | Remove whitespace | `Str.trim(s)` |
| `Str.includes(search)` | Check if contains substring | `Str.includes("foo")(s)` |
| `Str.startsWith(prefix)` | Check if starts with prefix | `Str.startsWith("http")(s)` |
| `Str.isEmpty` | Check if empty string | `Str.isEmpty(s)` |
| `Str.isNonEmpty` | Check if non-empty | `Str.isNonEmpty(s)` |
| `Str.capitalize` | Capitalize first letter | `Str.capitalize(s)` |

## Codebase Patterns

### Basic Transformations

ALWAYS use Effect String utilities, NEVER native methods:

```typescript
import * as Str from "effect/String";
import * as F from "effect/Function";

// Convert case
const upper = Str.toUpperCase("hello");  // "HELLO"
const lower = Str.toLowerCase("WORLD");  // "world"

// Pipeline transformations
const formatted = F.pipe(
  "  HELLO WORLD  ",
  Str.trim,
  Str.toLowerCase
);  // "hello world"
```

### String Splitting

```typescript
import * as Str from "effect/String";
import * as A from "effect/Array";
import * as F from "effect/Function";

// Split into array
const parts = Str.split(",")(csv);  // Returns ReadonlyArray<string>

// Complex pipeline
const processedParts = F.pipe(
  "foo,bar,baz",
  Str.split(","),
  A.map(Str.trim),
  A.filter(Str.isNonEmpty)
);
```

### Substring Extraction

```typescript
import * as Str from "effect/String";
import * as O from "effect/Option";

// Extract first N characters
const prefix = Str.slice(0, 5)("hello world");  // "hello"

// Find substring position (returns Option)
const idx = Str.indexOf("world")("hello world");
// idx is Option<number>

// Safe substring extraction with Option
const extracted = F.pipe(
  "https://example.com/path",
  Str.indexOf("/path"),
  O.map((idx) => Str.slice(0, idx)("https://example.com/path"))
);  // Option<string>
```

### Validation and Guards

```typescript
import * as Str from "effect/String";
import * as P from "effect/Predicate";

// Type guard
if (P.isString(value)) {
  // value is string
  const upper = Str.toUpperCase(value);
}

// String checks
if (Str.isEmpty(input)) {
  // Handle empty string
}

if (Str.startsWith("http")(url)) {
  // Valid URL prefix
}
```

### Common UI Patterns

```typescript
import * as Str from "effect/String";
import * as A from "effect/Array";
import * as F from "effect/Function";

// User initials
const initials = F.pipe(
  "John Doe",
  Str.split(" "),
  A.map((name) => F.pipe(name, Str.toUpperCase, (s) => s.charAt(0))),
  A.join("")
);  // "JD"

// Format labels
const label = F.pipe(
  "user-profile",
  Str.split("-"),
  A.map(Str.capitalize),
  A.join(" ")
);  // "User Profile"

// Case-insensitive search
const matches = (query: string, text: string) =>
  F.pipe(
    text,
    Str.toLowerCase,
    Str.includes(Str.toLowerCase(query))
  );
```

## Anti-Patterns

### NEVER use native string methods

```typescript
// FORBIDDEN - Native methods
str.toLowerCase()
str.toUpperCase()
str.trim()
str.split(",")
str.slice(0, 5)
str.includes("foo")
str.startsWith("http")

// REQUIRED - Effect utilities
import * as Str from "effect/String";

Str.toLowerCase(str)
Str.toUpperCase(str)
Str.trim(str)
Str.split(",")(str)
Str.slice(0, 5)(str)
Str.includes("foo")(str)
Str.startsWith("http")(str)
```

### NEVER use template literals for transformations

```typescript
// DISCOURAGED - Template literal for case conversion
const upper = `${str}`.toUpperCase();

// REQUIRED - Explicit Effect utility
const upper = Str.toUpperCase(str);
```

### NEVER mix native and Effect patterns

```typescript
// FORBIDDEN - Mixing native and Effect
const result = str.split(",").map(Str.trim);  // WRONG

// REQUIRED - All Effect
import * as A from "effect/Array";

const result = F.pipe(
  str,
  Str.split(","),
  A.map(Str.trim)
);
```

## Type Safety

String utilities preserve literal types when possible:

```typescript
import * as Str from "effect/String";

type Color = "red" | "blue";
const color: Color = "red";

// Type is preserved
const upper: Uppercase<Color> = Str.toUpperCase(color);  // "RED"
```

## Related Modules

- [Array.md](./Array.md) - Array operations (often used with `Str.split`)
- [Predicate.md](./Predicate.md) - Type guards including `P.isString`
- [Function.md](./Function.md) - Pipeline utilities for string transformations

## Source Reference

[.repos/effect/packages/effect/src/String.ts](../../.repos/effect/packages/effect/src/String.ts)
