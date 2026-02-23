# Predicate — Agent Context

> Best practices for using `effect/Predicate` in this codebase.

## Quick Reference

| Function | Purpose | Example |
|----------|---------|---------|
| `P.isString` | Type guard for string | `P.isString(value)` |
| `P.isNumber` | Type guard for number | `P.isNumber(value)` |
| `P.isBoolean` | Type guard for boolean | `P.isBoolean(value)` |
| `P.isDate` | Type guard for Date | `P.isDate(value)` |
| `P.isObject` | Type guard for object | `P.isObject(value)` |
| `P.isNullable` | Check if null or undefined | `P.isNullable(value)` |
| `P.isNotNullable` | Check if not null/undefined | `P.isNotNullable(value)` |
| `P.and(p1, p2)` | Combine with AND | `P.and(P.isString, P.isNonEmpty)` |
| `P.or(p1, p2)` | Combine with OR | `P.or(P.isString, P.isNumber)` |
| `P.not(pred)` | Negate predicate | `P.not(P.isNullable)` |

## Codebase Patterns

### Type Guards (REQUIRED)

ALWAYS use Predicate type guards instead of `typeof` or `instanceof`:

```typescript
import * as P from "effect/Predicate";

// Type-safe narrowing
function process(value: unknown) {
  if (P.isString(value)) {
    // value is string
    const upper = value.toUpperCase();
  }

  if (P.isNumber(value)) {
    // value is number
    const doubled = value * 2;
  }

  if (P.isDate(value)) {
    // value is Date
    const time = value.getTime();
  }
}
```

### Null/Undefined Checking

```typescript
import * as P from "effect/Predicate";
import * as Str from "effect/String";

// Check for nullable values
function formatOptional(value: string | null | undefined): string {
  if (P.isNullable(value)) {
    return "N/A";
  }
  return Str.toUpperCase(value);
}

// Check for non-nullable
function requireValue<T>(value: T | null | undefined): T {
  if (!P.isNotNullable(value)) {
    throw new Error("Value is required");
  }
  return value;  // Type: T
}
```

### Combining Predicates

```typescript
import * as P from "effect/Predicate";

// AND combination
const isPositiveNumber = P.and(
  P.isNumber,
  (n): n is number => n > 0
);

// OR combination
const isStringOrNumber = P.or(P.isString, P.isNumber);

// NOT combination
const isNotNull = P.not(P.isNullable);

// Complex composition
const isValidInput = P.and(
  P.isNotNullable,
  P.or(P.isString, P.isNumber)
);

if (isValidInput(input)) {
  // input is string | number (not null/undefined)
}
```

### Custom Predicates

```typescript
import * as P from "effect/Predicate";

// Custom refinement
const isNonEmptyString = (u: unknown): u is string =>
  P.isString(u) && u.length > 0;

// Combine with existing predicates
const isValidEmail = (u: unknown): u is string =>
  P.isString(u) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(u);

// Use in pipelines
import * as A from "effect/Array";
import * as F from "effect/Function";

const validEmails = F.pipe(
  inputs,
  A.filter(isValidEmail)
);
```

### Real Codebase Examples

**Nullable Filtering (packages/ui/core/src/theme/core/components/link.tsx)**:
```typescript
import * as P from "effect/Predicate";
import * as Struct from "effect/Struct";
import * as A from "effect/Array";
import * as F from "effect/Function";

const filtered = F.pipe(
  themeConfig,
  Struct.entries,
  A.filter(([_k, v]) => P.isNullable(v))
);
```

**Value Validation (packages/ui/core/src/utils/transform-number.ts)**:
```typescript
import * as P from "effect/Predicate";

export function transformNumber(value: unknown, defaultValue: number) {
  if (!P.and(P.isNotNullable, P.isNumber)(value)) {
    return defaultValue;
  }
  return value;
}
```

**Type Narrowing (packages/ui/ui/src/components/chart.tsx)**:
```typescript
import * as P from "effect/Predicate";

if (P.isNullable(context)) {
  console.warn("Chart context is null");
  return;
}

// context is non-nullable here
const chartData = context.data;
```

### Schema Integration

Use predicates with Schema for custom validation:

```typescript
import * as S from "effect/Schema";
import * as P from "effect/Predicate";

// Custom validation in schema
const PositiveNumber = S.Number.pipe(
  S.filter((n): n is number => P.and(P.isNumber, (x): x is number => x > 0)(n), {
    message: () => "Number must be positive",
  })
);
```

## Anti-Patterns

### NEVER use typeof for type guards

```typescript
// FORBIDDEN - Native typeof
if (typeof value === "string") { ... }
if (typeof value === "number") { ... }
if (typeof value === "boolean") { ... }
if (typeof value === "object") { ... }

// REQUIRED - Predicate type guards
import * as P from "effect/Predicate";

if (P.isString(value)) { ... }
if (P.isNumber(value)) { ... }
if (P.isBoolean(value)) { ... }
if (P.isObject(value)) { ... }
```

### NEVER use instanceof for type checks

```typescript
// FORBIDDEN - instanceof
if (value instanceof Date) { ... }
if (value instanceof Error) { ... }
if (value instanceof Array) { ... }

// REQUIRED - Predicate guards
import * as P from "effect/Predicate";
import * as A from "effect/Array";

if (P.isDate(value)) { ... }
if (P.isError(value)) { ... }
if (A.isArray(value)) { ... }
```

### NEVER use == null for nullable checks

```typescript
// FORBIDDEN - Loose equality
if (value == null) { ... }
if (value != null) { ... }

// REQUIRED - Predicate guards
import * as P from "effect/Predicate";

if (P.isNullable(value)) { ... }
if (P.isNotNullable(value)) { ... }
```

### NEVER write custom typeof predicates

```typescript
// FORBIDDEN - Reinventing the wheel
const isString = (u: unknown): u is string => typeof u === "string";

// REQUIRED - Use built-in
import * as P from "effect/Predicate";

const check = P.isString;
```

## Type Safety

Predicates provide compile-time type narrowing:

```typescript
import * as P from "effect/Predicate";

function example(value: string | number | null) {
  if (P.isString(value)) {
    // TypeScript knows value is string
    const upper = value.toUpperCase();  // ✓ Valid
  }

  if (P.isNumber(value)) {
    // TypeScript knows value is number
    const doubled = value * 2;  // ✓ Valid
  }

  if (P.isNullable(value)) {
    // TypeScript knows value is null
    return;
  }

  // TypeScript knows value is string | number (not null)
  console.log(value);
}
```

## Common Patterns

### Optional Field Validation

```typescript
import * as P from "effect/Predicate";

interface Config {
  host: string;
  port?: number;
}

function validatePort(config: Config): boolean {
  if (P.isNullable(config.port)) {
    return true;  // Optional, no validation needed
  }
  return P.and(P.isNumber, (n): n is number => n > 0)(config.port);
}
```

### Array Filtering

```typescript
import * as A from "effect/Array";
import * as P from "effect/Predicate";
import * as F from "effect/Function";

const mixedArray: unknown[] = ["hello", 42, null, "world", undefined, 3.14];

const strings = F.pipe(mixedArray, A.filter(P.isString));
// Type: string[]

const numbers = F.pipe(mixedArray, A.filter(P.isNumber));
// Type: number[]

const nonNullable = F.pipe(mixedArray, A.filter(P.isNotNullable));
// Type: (string | number)[]
```

## Related Modules

- [String.md](./String.md) - String operations (after type narrowing)
- [Array.md](./Array.md) - Array filtering with predicates
- [Option.md](./Option.md) - Alternative to nullable checks
- [Schema.md](./Schema.md) - Schema validation with predicates

## Source Reference

[.repos/effect/packages/effect/src/Predicate.ts](../../.repos/effect/packages/effect/src/Predicate.ts)
