# Forbidden Patterns

## When to Use

Apply this skill when:
- Reviewing or writing code that uses arrays, strings, dates, or control flow
- Spotting native JavaScript patterns that should use Effect equivalents
- Refactoring existing code to Effect idioms

## Forbidden: Native Array Methods

```typescript
// NEVER use native array methods
items.map((item) => item.name);
items.filter((item) => item.active);
items.find((item) => item.id === id);
items.forEach((item) => console.log(item));
items.reduce((acc, item) => acc + item.value, 0);
Array.from(iterable);
```

## Required: Effect Array Utilities

```typescript
import * as A from "effect/Array";
import * as F from "effect/Function";

F.pipe(items, A.map((item) => item.name));
F.pipe(items, A.filter((item) => item.active));
F.pipe(items, A.findFirst((item) => item.id === id));
F.pipe(items, A.forEach((item) => console.log(item)));
F.pipe(items, A.reduce(0, (acc, item) => acc + item.value));
F.pipe(iterable, A.fromIterable);
```

## Forbidden: Native String Methods

```typescript
// NEVER use native string methods
str.charAt(0).toUpperCase();
str.split(" ");
str.trim();
str.includes("search");
str.startsWith("prefix");
```

## Required: Effect String Utilities

```typescript
import * as Str from "effect/String";
import * as F from "effect/Function";

F.pipe(str, Str.charAt(0), Str.toUpperCase);
F.pipe(str, Str.split(" "));
F.pipe(str, Str.trim);
F.pipe(str, Str.includes("search"));
F.pipe(str, Str.startsWith("prefix"));
```

## Forbidden: Native Date

```typescript
// NEVER use native Date
new Date();
new Date("2025-01-15");
date.setDate(date.getDate() + 1);  // Mutation!
date.getMonth() + 1;               // 0-indexed months
date.toISOString();
```

## Required: Effect DateTime

```typescript
import * as DateTime from "effect/DateTime";

DateTime.unsafeNow();
DateTime.unsafeMake("2025-01-15");
DateTime.add(date, { days: 1 });
DateTime.formatIso(date);
```

## Forbidden: Switch Statements

```typescript
// NEVER use switch statements
switch (response._tag) {
  case "loading": return "Loading...";
  case "success": return response.data;
  default: return "Unknown";  // Not type-safe!
}
```

## Required: Effect Match

```typescript
import * as Match from "effect/Match";

Match.value(response).pipe(
  Match.tag("loading", () => "Loading..."),
  Match.tag("success", (r) => r.data),
  Match.exhaustive  // Compile error if cases missing!
);
```

## Forbidden: Bare typeof/instanceof

```typescript
// NEVER use bare type checks
typeof x === "string"
x instanceof Date
Array.isArray(x)
```

## Required: Effect Predicate

```typescript
import * as P from "effect/Predicate";

P.isString(x)
P.isDate(x)
P.isArray(x)
```

## Forbidden: No-op Functions

```typescript
// NEVER create inline no-ops
() => null
() => {}
async () => null
```

## Required: @beep/utils No-ops

```typescript
import { nullOp, noOp, nullOpE } from "@beep/utils";

nullOp   // instead of () => null
noOp     // instead of () => {}
nullOpE  // instead of () => Effect.succeed(null)
```
