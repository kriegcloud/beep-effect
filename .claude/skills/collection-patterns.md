# Collection Patterns

## When to Use

Apply this skill when:
- Working with key-value data (use HashMap instead of Map)
- Working with unique values (use HashSet instead of Set)
- Manipulating arrays with functional patterns
- Working with object keys, values, or transformations
- Needing Option-returning lookups instead of undefined

## Required: Effect Collections

```typescript
import * as HashMap from "effect/HashMap";
import * as HashSet from "effect/HashSet";
import * as A from "effect/Array";
import * as R from "effect/Record";
import * as Struct from "effect/Struct";
import * as F from "effect/Function";
```

## HashMap (Instead of Map)

```typescript
// Create empty HashMap
HashMap.empty<string, number>();

// Set values (immutable - returns new HashMap)
F.pipe(hashMap, HashMap.set(key, value));
F.pipe(hashMap, HashMap.set("a", 1), HashMap.set("b", 2));

// Get values (returns Option, not undefined)
F.pipe(hashMap, HashMap.get(key));  // Option<V>

// Check existence
F.pipe(hashMap, HashMap.has(key));

// Remove
F.pipe(hashMap, HashMap.remove(key));

// From entries
HashMap.fromIterable([["a", 1], ["b", 2]]);

// Iterate
F.pipe(hashMap, HashMap.forEach((value, key) => { ... }));
F.pipe(hashMap, HashMap.map((value) => value * 2));
```

## HashSet (Instead of Set)

```typescript
// Create empty HashSet
HashSet.empty<string>();

// Add values (immutable)
F.pipe(hashSet, HashSet.add(value));
F.pipe(hashSet, HashSet.add("a"), HashSet.add("b"));

// Check membership
F.pipe(hashSet, HashSet.has(value));

// Remove
F.pipe(hashSet, HashSet.remove(value));

// From iterable
HashSet.fromIterable(["a", "b", "c"]);

// Set operations
HashSet.union(set1, set2);
HashSet.intersection(set1, set2);
HashSet.difference(set1, set2);
```

## Array Utilities

```typescript
// FORBIDDEN
items.map(fn);
items.filter(fn);
items.find(fn);
Array.from(iter);

// REQUIRED
F.pipe(items, A.map(fn));
F.pipe(items, A.filter(fn));
F.pipe(items, A.findFirst(fn));  // Returns Option
F.pipe(iter, A.fromIterable);

// Additional Array utilities
F.pipe(items, A.head);           // Option<A> - first element
F.pipe(items, A.tail);           // Option<Array<A>> - all but first
F.pipe(items, A.get(index));     // Option<A> - element at index
F.pipe(items, A.findLast(fn));   // Option<A> - last matching
F.pipe(items, A.some(fn));       // boolean
F.pipe(items, A.every(fn));      // boolean
F.pipe(items, A.groupBy(fn));    // Record<string, Array<A>>
F.pipe(items, A.partition(fn));  // [Array<A>, Array<A>]
F.pipe(items, A.reduce(init, fn));
```

## Record Utilities (Object Manipulation)

```typescript
// FORBIDDEN
Object.keys(obj);
Object.values(obj);
Object.entries(obj);

// REQUIRED
F.pipe(obj, Struct.keys);    // Array of keys
F.pipe(obj, R.values);       // Array of values

// Transform records
F.pipe(obj, R.map(fn));           // Transform values
F.pipe(obj, R.filter(fn));        // Filter entries
F.pipe(obj, R.filterMap(fn));     // Filter + transform
F.pipe(obj, R.collect(fn));       // Collect to array
```

## Struct Utilities

```typescript
// Pick specific keys
F.pipe(obj, Struct.pick("name", "email"));

// Omit specific keys
F.pipe(obj, Struct.omit("password", "secret"));

// Get keys as array
F.pipe(obj, Struct.keys);
```

## Examples: Common Patterns

```typescript
// Build a lookup map from array
const userById = F.pipe(
  users,
  A.map((user) => [user.id, user] as const),
  HashMap.fromIterable
);

// Unique tags from items
const allTags = F.pipe(items, A.flatMap((item) => item.tags), HashSet.fromIterable);

// Group items by category
const byCategory = F.pipe(items, A.groupBy((item) => item.category));
```
