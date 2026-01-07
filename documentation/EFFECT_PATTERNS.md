# Effect Patterns

This document contains the Effect-first development patterns and critical rules for the beep-effect codebase.

---

## Effect-First Development

- No `async/await` or bare Promises in application code
- Use `Effect.gen`, `Effect.fn`, `Effect.tryPromise` with tagged errors
- Errors via `Schema.TaggedError` from `effect/Schema`
- Collections via Effect utilities (`Array`, `Option`, `HashMap`)

---

## Import Conventions

```typescript
// Namespace imports for Effect modules
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Context from "effect/Context";
import * as Struct from "effect/Struct";
import * as Cause from "effect/Cause";

// Single-letter aliases for frequently used modules
import * as A from "effect/Array";
import * as BI from "effect/BigInt";
import * as Num from "effect/Number";
import * as P from "effect/Predicate";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as M from "@effect/sql/Model";
import * as B from "effect/Brand";
import * as Bool from "effect/Boolean";
import * as AST from "effect/SchemaAST";
import * as DateTime from "effect/DateTime";
import * as Match from "effect/Match";
```

### Uppercase Constructors

Always use PascalCase exports: `S.Struct`, `S.Array`, `S.String` (never `S.struct`, `S.array`).

---

## Critical Rules

### NEVER Use Native Array Methods

```typescript
// FORBIDDEN
items.map((item) => item.name);
items.filter((item) => item.active);
Array.from(iterable);

// REQUIRED - Effect Array utilities with pipe
F.pipe(items, A.map((item) => item.name));
F.pipe(items, A.filter((item) => item.active));
F.pipe(iterable, A.fromIterable);
```

**Required Effect Array methods**: `A.map`, `A.filter`, `A.forEach`, `A.findFirst`, `A.findLast`, `A.some`, `A.every`, `A.reduce`, `A.groupBy`, `A.partition`, `A.fromIterable`, `A.head`, `A.tail`, `A.get`

---

### NEVER Use Native String Methods

```typescript
// FORBIDDEN
str.charAt(0).toUpperCase();
str.split(" ");
str.trim();

// REQUIRED - Effect String utilities
F.pipe(str, Str.charAt(0), Str.toUpperCase);
F.pipe(str, Str.split(" "));
F.pipe(str, Str.trim);
```

**Required Effect String methods**: `Str.charAt`, `Str.slice`, `Str.indexOf`, `Str.includes`, `Str.startsWith`, `Str.endsWith`, `Str.toUpperCase`, `Str.toLowerCase`, `Str.capitalize`, `Str.trim`, `Str.split`, `Str.replace`, `Str.match`, `Str.isEmpty`, `Str.isNonEmpty`

---

### Use Effect Struct & Record Utilities

```typescript
// REQUIRED
F.pipe(obj, Struct.keys);        // not Object.keys(obj)
F.pipe(obj, R.values);           // not Object.values(obj)
F.pipe(obj, R.map(fn));          // not manual iteration
```

---

### Use Effect Collections

```typescript
// HashMap instead of Map
import * as HashMap from "effect/HashMap";
HashMap.empty<string, number>();
F.pipe(hashMap, HashMap.set(key, value));
F.pipe(hashMap, HashMap.get(key)); // returns Option<V>

// HashSet instead of Set
import * as HashSet from "effect/HashSet";
HashSet.empty<string>();
F.pipe(hashSet, HashSet.add(value));
```

---

### Use @beep/utils No-ops

```typescript
import { nullOp, noOp, nullOpE } from "@beep/utils";

// REQUIRED
nullOp      // instead of () => null
noOp        // instead of () => {}
nullOpE     // instead of () => Effect.succeed(null)

// NEVER use async no-ops
// async () => null  -> use nullOpE
```

---

### NEVER Use Native Date

The native `Date` object is mutable, error-prone, and lacks timezone safety. Use `effect/DateTime` instead.

```typescript
import * as DateTime from "effect/DateTime";

// FORBIDDEN - Native Date
new Date();
new Date("2025-01-15");
date.setDate(date.getDate() + 1);  // Mutation!
date.getMonth() + 1;               // 0-indexed months
date.toISOString();

// REQUIRED - Effect DateTime (immutable, type-safe)
DateTime.unsafeNow();                              // Current time (Utc)
yield* DateTime.now;                               // In Effect context
DateTime.unsafeMake("2025-01-15");                 // From string
DateTime.make("2025-01-15");                       // Returns Option<Utc>
DateTime.add(date, { days: 1 });                   // Immutable arithmetic
DateTime.add(date, { months: 1, days: -5 });       // Combined adjustments
DateTime.formatIso(date);                          // ISO string
DateTime.format(date, { dateStyle: "medium" });    // Localized formatting
```

**Key DateTime operations**:
- **Creation**: `DateTime.unsafeNow`, `DateTime.now`, `DateTime.unsafeMake`, `DateTime.make`
- **Arithmetic**: `DateTime.add`, `DateTime.subtract` (immutable, handles edge cases)
- **Comparison**: `DateTime.lessThan`, `DateTime.greaterThan`, `DateTime.between`, `DateTime.distance`
- **Formatting**: `DateTime.formatIso`, `DateTime.format`, `DateTime.formatUtc`
- **Timezones**: `DateTime.makeZoned`, `DateTime.withZone`, `DateTime.toUtc`
- **Parts**: `DateTime.toParts`, `DateTime.getPartUtc`

```typescript
// FORBIDDEN - Manual timezone handling
new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
const offset = date.getTimezoneOffset();

// REQUIRED - Effect DateTime timezones
const zoned = DateTime.makeZoned(date, { timeZone: "America/New_York" });
DateTime.withZone(utcDate, "Europe/Rome");
DateTime.toUtc(zonedDate);
```

---

### NEVER Use Switch Statements or Long If-Else Chains

Use `effect/Match` for exhaustive pattern matching and `effect/Predicate` for type guards.

```typescript
import * as Match from "effect/Match";
import * as P from "effect/Predicate";

// FORBIDDEN - switch statements
switch (response._tag) {
  case "loading":
    return "Loading...";
  case "success":
    return `Found ${response.data.length} items`;
  case "error":
    return `Error: ${response.error}`;
  default:
    return "Unknown";  // Not type-safe!
}

// REQUIRED - Match.exhaustive for discriminated unions
const result = Match.value(response).pipe(
  Match.tag("loading", () => "Loading..."),
  Match.tag("success", (r) => `Found ${r.data.length} items`),
  Match.tag("error", (r) => `Error: ${r.error}`),
  Match.exhaustive  // Compile error if cases missing!
);
```

```typescript
// FORBIDDEN - long if-else chains
if (typeof value === "string") {
  return `String: ${value}`;
} else if (typeof value === "number") {
  return `Number: ${value}`;
} else if (Array.isArray(value)) {
  return `Array: ${value.length}`;
} else {
  return "Unknown";
}

// REQUIRED - Match with predicates
const result = Match.value(value).pipe(
  Match.when(P.isString, (s) => `String: ${s}`),
  Match.when(P.isNumber, (n) => `Number: ${n}`),
  Match.when(P.isArray, (a) => `Array: ${a.length}`),
  Match.orElse(() => "Unknown")
);
```

**Match patterns**:
- `Match.value(x)` - Start matching on a value
- `Match.type<T>()` - Start matching on a type (for reusable matchers)
- `Match.tag("tagName", fn)` - Match discriminated unions by `_tag`
- `Match.when(predicate, fn)` - Match with custom predicate
- `Match.exhaustive` - Compile error if not all cases handled
- `Match.orElse(fn)` - Fallback handler (use sparingly)
- `Match.option` - Returns `Option<A>` instead of throwing

---

### Predicate Guards

Replace `typeof` and `instanceof` with Effect Predicate:

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

**Predicate composition**:

```typescript
// FORBIDDEN - manual boolean logic
if (x > 0 && x < 100 && x % 2 === 0) { ... }

// REQUIRED - composed predicates
const isValidRange = P.and(
  Num.greaterThan(0),
  Num.lessThan(100)
);
const isValidEven = P.and(isValidRange, (n: number) => n % 2 === 0);

if (isValidEven(x)) { ... }

// Or with Match
Match.value(x).pipe(
  Match.when(isValidEven, (n) => `Valid: ${n}`),
  Match.orElse(() => "Invalid")
);
```

**Required Predicate methods**: `P.isString`, `P.isNumber`, `P.isBoolean`, `P.isObject`, `P.isArray`, `P.isNull`, `P.isUndefined`, `P.isNullable`, `P.isNotNull`, `P.isNotUndefined`, `P.isNotNullable`, `P.hasProperty`, `P.isTagged`, `P.and`, `P.or`, `P.not`, `P.struct`
