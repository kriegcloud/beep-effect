# Record — Agent Context

> Best practices for using `effect/Record` in this codebase.

## Quick Reference

| Function | Purpose | Example |
|----------|---------|---------|
| `Record.empty()` | Create empty record | `Record.empty<string, number>()` |
| `Record.isEmptyRecord` | Check if empty | `Record.isEmptyRecord(rec)` |
| `Record.map` | Transform values | `Record.map(rec, (v) => v * 2)` |
| `Record.filter` | Filter by predicate | `Record.filter(rec, (v) => v > 0)` |
| `Record.get(key)` | Get value (returns Option) | `Record.get(rec, "key")` |
| `Record.has(key)` | Check if key exists | `Record.has(rec, "key")` |
| `Record.set(key, value)` | Add/update key | `Record.set(rec, "key", value)` |
| `Record.remove(key)` | Remove key | `Record.remove(rec, "key")` |
| `Record.keys` | Get keys array | `Record.keys(rec)` |
| `Record.values` | Get values array | `Record.values(rec)` |

## Codebase Patterns

### When to Use Record vs Struct

**Use `Record`** when:
- Keys are dynamic/runtime values
- Working with dictionaries or lookup tables
- Keys are not known at compile time

**Use `Struct`** when:
- Keys are static/known at compile time
- Working with object literals
- Type safety for specific keys is needed

```typescript
import * as Record from "effect/Record";
import * as Struct from "effect/Struct";

// Record - dynamic keys
const cache: Record<string, User> = {};
const user = Record.get(cache, userId);  // Option<User>

// Struct - static keys
const config = { host: "localhost", port: 3000 };
const host = Struct.get(config, "host");  // Option<string>
```

### Creating and Populating Records

```typescript
import * as Record from "effect/Record";
import * as A from "effect/Array";
import * as F from "effect/Function";

// Start with empty record
const cache = Record.empty<string, User>();

// Add entries
const updated = F.pipe(
  cache,
  Record.set("user-1", user1),
  Record.set("user-2", user2)
);

// Build from array
const userMap = F.pipe(
  users,
  A.reduce(
    Record.empty<string, User>(),
    (acc, user) => Record.set(acc, user.id, user)
  )
);
```

### Transforming Records

```typescript
import * as Record from "effect/Record";
import * as F from "effect/Function";

const prices = { apple: 1.0, banana: 0.5, orange: 0.75 };

// Map values
const discounted = Record.map(prices, (price) => price * 0.9);
// { apple: 0.9, banana: 0.45, orange: 0.675 }

// Map with key
const labeled = Record.map(prices, (price, key) => `${key}: $${price}`);

// Filter values
const expensive = Record.filter(prices, (price) => price > 0.6);
// { apple: 1.0, orange: 0.75 }
```

### Safe Access

```typescript
import * as Record from "effect/Record";
import * as O from "effect/Option";
import * as F from "effect/Function";

const cache: Record<string, User> = { /* ... */ };

// Option-based access
const maybeUser = Record.get(cache, userId);

const userName = F.pipe(
  maybeUser,
  O.map((user) => user.name),
  O.getOrElse(() => "Unknown")
);

// Check existence
if (Record.has(cache, userId)) {
  const user = cache[userId];  // Safe to access
}
```

### Merging Records

```typescript
import * as Record from "effect/Record";
import * as F from "effect/Function";

const defaults = { timeout: 30, retries: 3 };
const overrides = { timeout: 60 };

// Merge (right-biased)
const config = F.pipe(
  defaults,
  Record.union(overrides)
);
// { timeout: 60, retries: 3 }

// Custom merge
const merged = Record.unionWith(
  defaults,
  overrides,
  (defaultVal, overrideVal) => overrideVal ?? defaultVal
);
```

### Iteration

```typescript
import * as Record from "effect/Record";
import * as A from "effect/Array";
import * as F from "effect/Function";

const scores = { alice: 95, bob: 87, charlie: 92 };

// Get all keys
const names = Record.keys(scores);  // ["alice", "bob", "charlie"]

// Get all values
const allScores = Record.values(scores);  // [95, 87, 92]

// Convert to array of tuples
const entries = F.pipe(
  scores,
  Record.toEntries
);  // [["alice", 95], ["bob", 87], ["charlie", 92]]

// Process entries
const results = F.pipe(
  scores,
  Record.toEntries,
  A.map(([name, score]) => ({ name, score, grade: getGrade(score) }))
);
```

## Anti-Patterns

### NEVER use plain object operations on Records

```typescript
// FORBIDDEN - Direct object mutation
const cache: Record<string, User> = {};
cache[userId] = user;          // Direct assignment
delete cache[userId];          // Direct deletion

// REQUIRED - Immutable operations
import * as Record from "effect/Record";

const cache = Record.empty<string, User>();
const updated = Record.set(cache, userId, user);
const removed = Record.remove(cache, userId);
```

### NEVER assume keys exist

```typescript
// FORBIDDEN - Unsafe access
const user = cache[userId];  // May be undefined!

// REQUIRED - Option-based access
import * as O from "effect/Option";

const maybeUser = Record.get(cache, userId);  // Option<User>

const user = F.pipe(
  maybeUser,
  O.getOrThrow(() => new Error("User not found"))
);
```

### NEVER use Object methods on Records

```typescript
// FORBIDDEN - Object methods
Object.keys(record)
Object.values(record)
Object.entries(record)

// REQUIRED - Record utilities
import * as Record from "effect/Record";

Record.keys(record)
Record.values(record)
Record.toEntries(record)
```

## Type Safety

Record operations preserve type information:

```typescript
import * as Record from "effect/Record";

const scores: Record<string, number> = { alice: 95, bob: 87 };

// Type inference
const doubled = Record.map(scores, (score) => score * 2);
// Type: Record<string, number>

const high = Record.filter(scores, (score) => score > 90);
// Type: Record<string, number>
```

## Performance Considerations

For large dictionaries:
- `Record.get` is O(1) lookup
- `Record.set` creates a new object (immutable)
- Consider `MutableHashMap` for frequent updates

```typescript
import * as MutableHashMap from "effect/MutableHashMap";

// For frequent mutations
const cache = MutableHashMap.empty<string, User>();
MutableHashMap.set(cache, userId, user);  // In-place mutation
```

## Related Modules

- [Struct.md](./Struct.md) - Static object operations
- [Array.md](./Array.md) - Array operations (for entries)
- [Option.md](./Option.md) - Handling missing values
- [MutableHashMap.md](./MutableHashMap.md) - Mutable alternative

## Source Reference

[.repos/effect/packages/effect/src/Record.ts](../../.repos/effect/packages/effect/src/Record.ts)
