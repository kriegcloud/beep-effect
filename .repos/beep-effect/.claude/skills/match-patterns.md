# Match Patterns

## When to Use

Apply this skill when:
- Handling discriminated unions (tagged types with `_tag`)
- Replacing switch statements or long if-else chains
- Needing exhaustive type checking
- Applying type guards and predicates

## Forbidden: Switch Statements

```typescript
// NEVER use switch - not type-safe, easy to miss cases
switch (response._tag) {
  case "loading":
    return "Loading...";
  case "success":
    return `Found ${response.data.length} items`;
  case "error":
    return `Error: ${response.error}`;
  default:
    return "Unknown";  // Compiler won't catch missing cases!
}
```

## Forbidden: Long If-Else Chains

```typescript
// NEVER use long if-else chains
if (typeof value === "string") {
  return `String: ${value}`;
} else if (typeof value === "number") {
  return `Number: ${value}`;
} else if (Array.isArray(value)) {
  return `Array: ${value.length}`;
} else {
  return "Unknown";
}
```

## Required: Effect Match

```typescript
import * as Match from "effect/Match";
import * as P from "effect/Predicate";
```

## Match.tag for Discriminated Unions

```typescript
// Match on _tag field with exhaustive checking
const result = Match.value(response).pipe(
  Match.tag("loading", () => "Loading..."),
  Match.tag("success", (r) => `Found ${r.data.length} items`),
  Match.tag("error", (r) => `Error: ${r.error}`),
  Match.exhaustive  // Compile error if cases missing!
);
```

## Match.when with Predicates

```typescript
// Match using predicate functions
const result = Match.value(value).pipe(
  Match.when(P.isString, (s) => `String: ${s}`),
  Match.when(P.isNumber, (n) => `Number: ${n}`),
  Match.when(P.isArray, (a) => `Array: ${a.length}`),
  Match.orElse(() => "Unknown")
);
```

## Match Patterns Reference

| Pattern                    | Purpose                                |
|----------------------------|----------------------------------------|
| `Match.value(x)`           | Start matching on a value              |
| `Match.type<T>()`          | Start matching on a type (reusable)    |
| `Match.tag("name", fn)`    | Match discriminated union by `_tag`    |
| `Match.when(pred, fn)`     | Match with custom predicate            |
| `Match.exhaustive`         | Compile error if not all cases handled |
| `Match.orElse(fn)`         | Fallback handler (use sparingly)       |
| `Match.option`             | Returns `Option<A>` instead of throw   |

## Predicate Guards

```typescript
// FORBIDDEN - bare typeof/instanceof
typeof x === "string"
x instanceof Date
Array.isArray(x)
x && typeof x === "object" && "name" in x

// REQUIRED - Effect Predicate
P.isString(x)
P.isDate(x)
P.isArray(x)
P.hasProperty(x, "name")
P.isTagged("success")(x)  // For discriminated unions
```

## Predicate Composition

```typescript
import * as Num from "effect/Number";

// FORBIDDEN - manual boolean logic
if (x > 0 && x < 100 && x % 2 === 0) { ... }

// REQUIRED - composed predicates
const isValidRange = P.and(
  Num.greaterThan(0),
  Num.lessThan(100)
);
const isValidEven = P.and(isValidRange, (n: number) => n % 2 === 0);

if (isValidEven(x)) { ... }

// With Match
Match.value(x).pipe(
  Match.when(isValidEven, (n) => `Valid: ${n}`),
  Match.orElse(() => "Invalid")
);
```

## Examples: API Response Handling

```typescript
type ApiResponse<T> = { _tag: "loading" } | { _tag: "success"; data: T } | { _tag: "error"; message: string };

const handleResponse = <T>(response: ApiResponse<T>) =>
  Match.value(response).pipe(
    Match.tag("loading", () => ({ status: "pending" as const })),
    Match.tag("success", (r) => ({ status: "ok" as const, data: r.data })),
    Match.tag("error", (r) => ({ status: "failed" as const, error: r.message })),
    Match.exhaustive
  );
```
