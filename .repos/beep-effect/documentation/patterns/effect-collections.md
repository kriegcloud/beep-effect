# Effect Collections Migration Guide

Comprehensive guide to migrating from native JavaScript collections to Effect collections.

## Why Effect Collections?

Effect collections provide:

1. **Type-safe operations** - No runtime errors from undefined/null
2. **Immutability by default** - Prevents accidental mutation bugs
3. **Composability** - Pipe operations with `F.pipe()`
4. **Effect integration** - Seamless composition with `Effect.gen`

## Quick Reference

| Native | Effect | Import |
|--------|--------|--------|
| `array.map()` | `A.map(array, fn)` | `import * as A from "effect/Array"` |
| `array.filter()` | `A.filter(array, pred)` | `import * as A from "effect/Array"` |
| `array.reduce()` | `A.reduce(array, init, fn)` | `import * as A from "effect/Array"` |
| `array.sort()` | `A.sort(array, Order.number)` | `import * as Order from "effect/Order"` |
| `array.length === 0` | `A.isEmptyReadonlyArray(array)` | `import * as A from "effect/Array"` |
| `array[0]` | `A.head(array)` | Returns `Option<T>` |
| `new Set()` | `MutableHashSet.make()` | `import * as MutableHashSet from "effect/MutableHashSet"` |
| `new Map()` | `MutableHashMap.make()` | `import * as MutableHashMap from "effect/MutableHashMap"` |
| `Object.entries()` | `Struct.entries()` | `import * as Struct from "effect/Struct"` |
| `Object.keys()` | `Struct.keys()` | `import * as Struct from "effect/Struct"` |
| `string.toLowerCase()` | `Str.toLowerCase(string)` | `import * as Str from "effect/String"` |
| `string.toUpperCase()` | `Str.toUpperCase(string)` | `import * as Str from "effect/String"` |
| `string.split(",")` | `Str.split(string, ",")` | `import * as Str from "effect/String"` |
| `string.slice(0, 5)` | `Str.slice(string, 0, 5)` | `import * as Str from "effect/String"` |
| `new Date()` | `DateTime.now` | `import * as DateTime from "effect/DateTime"` |
| `Date.now()` | `DateTime.unsafeNow()` | `import * as DateTime from "effect/DateTime"` |

## Migration Patterns

### Array → effect/Array

```typescript
// BEFORE (Native)
const doubled = array.map(x => x * 2);
const evens = array.filter(x => x % 2 === 0);
const sorted = array.sort((a, b) => a - b);
const isEmpty = array.length === 0;
const first = array[0];
const total = array.reduce((acc, x) => acc + x, 0);

// AFTER (Effect)
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as Order from "effect/Order";

const doubled = A.map(array, x => x * 2);
const evens = A.filter(array, x => x % 2 === 0);
const sorted = A.sort(array, Order.number);
const isEmpty = A.isEmptyReadonlyArray(array);
const first = A.head(array);  // Returns Option<T>
const total = A.reduce(array, 0, (acc, x) => acc + x);
```

### Set → effect/MutableHashSet

```typescript
// BEFORE (Native)
const set = new Set([1, 2, 3]);
set.add(4);
const has = set.has(2);
const size = set.size;
for (const item of set) { ... }

// AFTER (Effect)
import * as MutableHashSet from "effect/MutableHashSet";

const set = MutableHashSet.make(1, 2, 3);
MutableHashSet.add(set, 4);
const has = MutableHashSet.has(set, 2);
const size = MutableHashSet.size(set);
for (const item of MutableHashSet.values(set)) { ... }
```

### Map → effect/MutableHashMap

```typescript
// BEFORE (Native)
const map = new Map([["a", 1], ["b", 2]]);
map.set("c", 3);
const value = map.get("a");  // T | undefined - dangerous!
const has = map.has("a");

// AFTER (Effect)
import * as MutableHashMap from "effect/MutableHashMap";
import * as O from "effect/Option";

const map = MutableHashMap.make(["a", 1], ["b", 2]);
MutableHashMap.set(map, "c", 3);
const value = MutableHashMap.get(map, "a");  // Option<T> - safe!
const has = MutableHashMap.has(map, "a");
```

### String Operations → effect/String

```typescript
// BEFORE (Native)
const lower = str.toLowerCase();
const upper = str.toUpperCase();
const parts = str.split(",");
const sub = str.slice(0, 5);
const trimmed = str.trim();

// AFTER (Effect)
import * as Str from "effect/String";

const lower = Str.toLowerCase(str);
const upper = Str.toUpperCase(str);
const parts = Str.split(str, ",");
const sub = Str.slice(str, 0, 5);
const trimmed = Str.trim(str);
```

### Object Operations → effect/Struct

```typescript
// BEFORE (Native)
const entries = Object.entries(obj);
const keys = Object.keys(obj);
const values = Object.values(obj);

// AFTER (Effect)
import * as Struct from "effect/Struct";

const entries = Struct.entries(obj);
const keys = Struct.keys(obj);
// For values, use: A.map(Struct.entries(obj), ([_, v]) => v)
```

### Date → effect/DateTime

```typescript
// BEFORE (Native)
const now = new Date();
const timestamp = Date.now();
const millis = date.getTime();

// AFTER (Effect)
import * as DateTime from "effect/DateTime";

const now = yield* DateTime.now;  // In Effect.gen
const timestamp = DateTime.unsafeNow();  // Outside Effect
const millis = DateTime.toEpochMillis(dateTime);
```

## Handling Option Results

Many Effect collection operations return `Option<T>` instead of `T | undefined`:

```typescript
// WRONG - Non-null assertion
const first = A.head(array)!;  // FORBIDDEN

// CORRECT - Option handling
import * as O from "effect/Option";

// Get with default value
const first = O.getOrElse(A.head(array), () => defaultValue);

// Get or null
const firstOrNull = O.getOrNull(A.head(array));

// Pattern match
const result = O.match(A.head(array), {
  onNone: () => "empty",
  onSome: (value) => `found: ${value}`,
});

// In Effect.gen - fails if None
const result = yield* Effect.gen(function* () {
  const first = yield* A.head(array);  // Fails Effect if None
  return first * 2;
});
```

## Sorting with Order

Effect sorting requires an `Order` instance:

```typescript
import * as A from "effect/Array";
import * as Order from "effect/Order";

// Sort numbers
const sortedNums = A.sort(numbers, Order.number);

// Sort strings
const sortedStrs = A.sort(strings, Order.string);

// Sort by property
const sortedByName = A.sort(users, Order.mapInput(Order.string, u => u.name));

// Reverse order
const descending = A.sort(numbers, Order.reverse(Order.number));

// Multiple sort keys
const byNameThenAge = Order.combine(
  Order.mapInput(Order.string, (u: User) => u.name),
  Order.mapInput(Order.number, (u: User) => u.age)
);
const sorted = A.sort(users, byNameThenAge);
```

## Common Migration Issues

### Issue 1: Array.sort mutates in-place

```typescript
// WRONG - mutates original array
const sorted = array.sort((a, b) => a - b);
// array is now mutated!

// CORRECT - A.sort returns new array
const sorted = A.sort(array, Order.number);
// Original array unchanged
```

### Issue 2: Map.get returns undefined

```typescript
// WRONG - value might be undefined
const value = map.get(key)!;  // FORBIDDEN

// CORRECT - Option handling
const value = O.getOrNull(MutableHashMap.get(map, key));

// Or with default
const value = O.getOrElse(MutableHashMap.get(map, key), () => defaultValue);
```

### Issue 3: Array index access

```typescript
// WRONG - might be undefined
const item = array[index]!;  // FORBIDDEN

// CORRECT - Use A.get
const item = A.get(array, index);  // Returns Option<T>
```

### Issue 4: Empty array initialization

```typescript
// WRONG
const items: string[] = [];

// CORRECT
const items = A.empty<string>();
```

## When to Use Chunk Instead of Array

Prefer `effect/Chunk` for:
- Large collections (>1000 elements)
- Frequent append operations
- Streaming data
- Functional transformations

Prefer `effect/Array` for:
- Small collections (<100 elements)
- Random access patterns
- Interop with existing APIs

```typescript
import * as Chunk from "effect/Chunk";

// Create Chunk
const chunk = Chunk.make(1, 2, 3);
const fromArray = Chunk.fromIterable([1, 2, 3]);

// Operations (similar to Array)
const doubled = Chunk.map(chunk, x => x * 2);
const filtered = Chunk.filter(chunk, x => x > 0);

// Convert back to Array when needed
const array = Chunk.toReadonlyArray(chunk);
```

## Verification Commands

Use the `repo-cli verify` commands to detect Effect pattern violations:

```bash
# Run all verifications (EntityId + Effect patterns)
bun run verify:all

# Check only Effect pattern violations (native Set, Map, Error, Date)
bun run verify:patterns

# Filter to a specific package
bun run verify:patterns --filter @beep/iam-server

# Output as JSON (for CI integration)
bun run verify:patterns --format json

# Show only critical violations (excludes Date warnings)
bun run verify:patterns --severity critical

# CI mode (exit code 1 if violations found)
bun run verify:patterns --ci
```

### Detection Patterns

| Pattern | Severity | Suggestion |
|---------|----------|------------|
| `new Set(...)` | critical | Use `MutableHashSet.make()` |
| `new Map(...)` | critical | Use `MutableHashMap.make()` |
| `new Error(...)` | critical | Use `S.TaggedError` |
| `new Date(...)` | warning | Use `DateTime.now` |

## Related Documentation

- [Effect Patterns](../../.claude/rules/effect-patterns.md) - Core Effect patterns and NEVER patterns
- [Effect Documentation](https://effect.website) - Official Effect documentation
