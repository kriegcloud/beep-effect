# Effect-TS Migration Audit Report

**Generated**: 2025-11-30
**Codebase**: beep-effect monorepo

---

## Executive Summary

This audit identifies native JavaScript Array, String, Set, and Map methods that can be replaced with Effect-TS equivalents from the `effect` library. The goal is to improve type safety, functional consistency, and leverage Effect's immutable data structures.

### Current State

The codebase already demonstrates **excellent Effect-first patterns** in critical areas:
- `packages/common/utils/src/data/array.utils/order-by.ts` - Exemplary use of `A.reduce`, `A.get`, `A.append`, `A.match`, `Order.combineAll`
- `packages/common/utils/src/data/string.utils.ts` - Great use of `Str.split`, `Str.trim`, `Str.capitalize`, `Str.replace`, `A.filter`, `A.take`, `A.map`, `A.join`
- `packages/shared/domain/src/policy/policy-types.ts` - Excellent Effect patterns with `A.filter`, `A.some`, `A.head`, `A.contains`, `O.match`, `Order.reverse`
- `packages/common/contract/src/internal/contract/contract.ts` - Good patterns with `A.reduce`, `O.fromNullable`, `F.pipe`

However, there are opportunities to migrate additional native methods to Effect equivalents.

---

## Part 1: Effect Module Reference

### Array Module (`effect/Array` as `A`)

| Effect Function | Description | Returns |
|-----------------|-------------|---------|
| `A.map(arr, f)` | Map over array elements | `Array<B>` |
| `A.filter(arr, f)` | Filter elements | `Array<A>` |
| `A.filterMap(arr, f)` | Filter + map combined | `Array<B>` |
| `A.flatMap(arr, f)` | FlatMap elements | `Array<B>` |
| `A.reduce(arr, init, f)` | Left fold | `B` |
| `A.reduceRight(arr, init, f)` | Right fold | `B` |
| `A.findFirst(arr, f)` | Find first match | `Option<A>` |
| `A.findFirstIndex(arr, f)` | Find first index | `Option<number>` |
| `A.findLast(arr, f)` | Find last match | `Option<A>` |
| `A.some(arr, f)` | Any element matches | `boolean` |
| `A.every(arr, f)` | All elements match | `boolean` |
| `A.contains(arr, x)` | Contains element | `boolean` |
| `A.head(arr)` | First element | `Option<A>` |
| `A.last(arr)` | Last element | `Option<A>` |
| `A.get(arr, i)` | Element at index | `Option<A>` |
| `A.take(arr, n)` | Take first n | `Array<A>` |
| `A.drop(arr, n)` | Drop first n | `Array<A>` |
| `A.slice(arr, start, end)` | Slice array | `Array<A>` |
| `A.append(arr, x)` | Append element | `Array<A>` |
| `A.prepend(arr, x)` | Prepend element | `Array<A>` |
| `A.appendAll(arr, other)` | Concatenate arrays | `Array<A>` |
| `A.reverse(arr)` | Reverse array | `Array<A>` |
| `A.flatten(arr)` | Flatten nested | `Array<A>` |
| `A.sort(arr, order)` | Sort with Order | `Array<A>` |
| `A.join(arr, sep)` | Join to string | `string` |
| `A.length(arr)` | Get length | `number` |
| `A.isEmpty(arr)` | Check empty | `boolean` |
| `A.isNonEmptyArray(arr)` | Check non-empty | type guard |
| `A.fromIterable(iter)` | From iterable | `Array<A>` |
| `A.isArray(x)` | Type guard | `boolean` |

### String Module (`effect/String` as `Str`)

| Effect Function | Description | Returns |
|-----------------|-------------|---------|
| `Str.length(s)` | String length | `number` |
| `Str.isEmpty(s)` | Check empty | `boolean` |
| `Str.isNonEmpty(s)` | Check non-empty | `boolean` |
| `Str.slice(start, end)(s)` | Slice string | `string` |
| `Str.split(sep)(s)` | Split string | `Array<string>` |
| `Str.indexOf(search)(s)` | Find index | `Option<number>` |
| `Str.lastIndexOf(search)(s)` | Last index | `Option<number>` |
| `Str.includes(search)(s)` | Contains | `boolean` |
| `Str.startsWith(prefix)(s)` | Starts with | `boolean` |
| `Str.endsWith(suffix)(s)` | Ends with | `boolean` |
| `Str.toUpperCase(s)` | Uppercase | `string` |
| `Str.toLowerCase(s)` | Lowercase | `string` |
| `Str.capitalize(s)` | Capitalize first | `string` |
| `Str.uncapitalize(s)` | Lowercase first | `string` |
| `Str.trim(s)` | Trim whitespace | `string` |
| `Str.trimStart(s)` | Trim start | `string` |
| `Str.trimEnd(s)` | Trim end | `string` |
| `Str.replace(search, repl)(s)` | Replace first | `string` |
| `Str.replaceAll(search, repl)(s)` | Replace all | `string` |
| `Str.concat(s2)(s1)` | Concatenate | `string` |
| `Str.charAt(i)(s)` | Char at index | `Option<string>` |

### Order Module (`effect/Order`)

| Effect Function | Description |
|-----------------|-------------|
| `Order.number` | Numeric comparison |
| `Order.string` | String comparison |
| `Order.boolean` | Boolean comparison |
| `Order.Date` | Date comparison |
| `Order.bigint` | BigInt comparison |
| `Order.reverse(ord)` | Reverse order |
| `Order.mapInput(ord, f)` | Transform input |
| `Order.combineAll(ords)` | Combine orders |
| `Order.make(f)` | Create custom order |

### HashSet Module (`effect/HashSet`)

| Effect Function | Description | Returns |
|-----------------|-------------|---------|
| `HashSet.empty()` | Create empty set | `HashSet<A>` |
| `HashSet.fromIterable(iter)` | From iterable | `HashSet<A>` |
| `HashSet.make(...values)` | From values | `HashSet<A>` |
| `HashSet.add(set, x)` | Add element | `HashSet<A>` |
| `HashSet.remove(set, x)` | Remove element | `HashSet<A>` |
| `HashSet.has(set, x)` | Contains | `boolean` |
| `HashSet.size(set)` | Get size | `number` |
| `HashSet.isEmpty(set)` | Check empty | `boolean` |
| `HashSet.toValues(set)` | To array | `Array<A>` |
| `HashSet.map(set, f)` | Map values | `HashSet<B>` |
| `HashSet.filter(set, f)` | Filter values | `HashSet<A>` |

### HashMap Module (`effect/HashMap`)

| Effect Function | Description | Returns |
|-----------------|-------------|---------|
| `HashMap.empty()` | Create empty map | `HashMap<K, V>` |
| `HashMap.fromIterable(iter)` | From entries | `HashMap<K, V>` |
| `HashMap.make(...pairs)` | From key-values | `HashMap<K, V>` |
| `HashMap.set(map, k, v)` | Set entry | `HashMap<K, V>` |
| `HashMap.get(map, k)` | Get value | `Option<V>` |
| `HashMap.remove(map, k)` | Remove entry | `HashMap<K, V>` |
| `HashMap.has(map, k)` | Has key | `boolean` |
| `HashMap.size(map)` | Get size | `number` |
| `HashMap.isEmpty(map)` | Check empty | `boolean` |
| `HashMap.keys(map)` | Get keys | `Iterator<K>` |
| `HashMap.values(map)` | Get values | `Iterator<V>` |
| `HashMap.entries(map)` | Get entries | `Iterator<[K, V]>` |

---

## Part 2: Files Requiring Migration

### Priority 1: Domain Layer (packages/*/domain/)

These files should be migrated first as they contain core business logic.

#### `packages/documents/domain/src/value-objects/file-types/FileTypes.ts`
**Lines with native methods:**
- Line 888: `[...new Set(...)]` spread pattern
- Line 1022: `.map((df) => df.extension)`
- Line 1024: `.some((de) => ["m4v", "flv", "mp4", "heic"].includes(de))`
- Line 1032: `.some((de) => ["mkv", "webm"].includes(de))`
- Line 1757-1765: `new Set()`, `types.map()`, `.split()`, `.join()`
- Line 1779: `.concat(similarTypes)`
- Line 1799: `filesRequiredAdditionalCheck.filter(...)`
- Line 1807: `typeExtensions.some(...)`
- Line 1814-1815: `requiredTypes.some(...)`

**Recommended changes:**
```typescript
// Before
const uniqueTypes = [...new Set(types.map(t => t.toUpperCase()))];

// After
import * as A from "effect/Array";
import * as HashSet from "effect/HashSet";
import * as F from "effect/Function";

const uniqueTypes = F.pipe(
  types,
  A.map(Str.toUpperCase),
  HashSet.fromIterable,
  HashSet.toValues
);
```

```typescript
// Before
if (detectedExtensions.some((de) => ["m4v", "flv", "mp4", "heic"].includes(de))) { ... }

// After
const videoExtensions = HashSet.make("m4v", "flv", "mp4", "heic");
if (A.some(detectedExtensions, (de) => HashSet.has(videoExtensions, de))) { ... }
```

#### `packages/documents/domain/src/value-objects/file-types/utils.ts`
**Lines with native methods:**
- `.indexOf()` usage
- `.includes()` for array membership
- `.slice()` for array/string operations

#### `packages/documents/domain/src/value-objects/file-types/detection.ts`
**Lines with native methods:**
- `.find()` → Replace with `A.findFirst()`
- `.includes()` → Replace with `A.contains()` or `HashSet.has()`
- `.some()` → Replace with `A.some()`
- `.push()` → Replace with `A.append()` (immutable)

#### `packages/documents/domain/src/value-objects/exif-metadata/ExifMetadata.ts`
**Lines with native methods:**
- `.filter()`, `.map()`, `.some()`, `.includes()`
- `Array.isArray()` → `A.isArray()`

---

### Priority 2: Infrastructure Layer (packages/*/infra/)

#### `packages/iam/infra/src/adapters/better-auth/Auth.service.ts`
**Lines with native methods:**
- `.reduce()` for accumulating values
- `.slice()` for string operations
- `.replace()` for string manipulation
- `.flatMap()` for array operations
- `.toLowerCase()` for case conversion

#### `packages/documents/infra/src/handlers/*.handlers.ts`
**Lines with native methods:**
- Comment.handlers.ts, Discussion.handlers.ts, Document.handlers.ts
- `.flatMap()`, `.map()` in handler logic
- `.some()` for condition checks

#### `packages/documents/infra/src/adapters/repos/*.repo.ts`
**Lines with native methods:**
- `.flatMap()` for database operations
- `.some()` in query builders

---

### Priority 3: SDK Layer (packages/*/sdk/)

#### `packages/iam/sdk/src/clients/passkey/passkey.atoms.ts`
**Lines with native methods:**
- `.map()`, `.filter()`, `.find()` in React hooks

#### `packages/iam/sdk/src/clients/_internal/client-method-helpers.ts`
**Lines with native methods:**
- `.filter()` for filtering results

---

### Priority 4: Common Utilities

#### `packages/common/utils/src/object/path.ts`
**Lines with native methods:**
- `.split()`, `.map()`, `.reduce()`, `.flatMap()`

```typescript
// Before
const parts = path.split(".");
const result = parts.reduce((acc, part) => { ... }, obj);

// After
const parts = Str.split(".")(path);
const result = A.reduce(parts, obj, (acc, part) => { ... });
```

#### `packages/common/utils/src/deep-remove-null.ts`
**Lines with native methods:**
- `.filter()`, `.map()` for object transformation

#### `packages/common/utils/src/topo-sort/*.ts`
**Lines with native methods:**
- `.reduce()`, `.forEach()`, `.push()`, `.join()`

---

### Lower Priority: UI Components

Files in `packages/ui/*/src/` use native methods extensively. While these can be migrated, UI components often benefit from native method performance in tight render loops. Consider migrating on a case-by-case basis.

Notable files:
- `packages/ui/ui/src/components/editor/use-chat.ts`
- `packages/ui/ui/src/organisms/table/utils.ts`
- `packages/ui/ui/src/layouts/components/searchbar/utils.ts`

---

## Part 3: Migration Patterns

### Pattern 1: Native `.map()` to Effect `A.map()`

```typescript
// Native (data-last, chainable)
const result = arr.map(item => item.value);

// Effect data-first
const result = A.map(arr, item => item.value);

// Effect pipeable (data-last)
const result = pipe(arr, A.map(item => item.value));
```

### Pattern 2: Native `.filter()` to Effect `A.filter()`

```typescript
// Native
const active = users.filter(u => u.isActive);

// Effect
const active = A.filter(users, u => u.isActive);

// With type refinement
const active = A.filter(users, (u): u is ActiveUser => u.isActive);
```

### Pattern 3: Chained Operations with `pipe`

```typescript
// Native (chained)
const result = arr
  .filter(x => x > 0)
  .map(x => x * 2)
  .reduce((a, b) => a + b, 0);

// Effect (pipe)
const result = pipe(
  arr,
  A.filter(x => x > 0),
  A.map(x => x * 2),
  A.reduce(0, (a, b) => a + b)
);
```

### Pattern 4: Native `.find()` to Effect `A.findFirst()`

```typescript
// Native (returns T | undefined)
const found = arr.find(x => x.id === id);
if (found) { ... }

// Effect (returns Option<T>)
const found = A.findFirst(arr, x => x.id === id);
if (O.isSome(found)) {
  const value = found.value;
  ...
}

// Or with Option matching
pipe(
  A.findFirst(arr, x => x.id === id),
  O.match({
    onNone: () => defaultValue,
    onSome: (value) => process(value)
  })
);
```

### Pattern 5: Native `.indexOf()` to Effect String Module

```typescript
// Native (returns number, -1 if not found)
const idx = str.indexOf("search");
if (idx !== -1) { ... }

// Effect (returns Option<number>)
const idx = Str.indexOf("search")(str);
if (O.isSome(idx)) {
  const position = idx.value;
  ...
}
```

### Pattern 6: Native `.sort()` to Effect `A.sort()`

```typescript
// Native (mutates, uses comparator function)
const sorted = [...arr].sort((a, b) => a.priority - b.priority);

// Effect (immutable, uses Order)
import * as Order from "effect/Order";

const sorted = A.sort(arr, Order.mapInput(Order.number, (x) => x.priority));

// For descending order
const sortedDesc = A.sort(arr, Order.reverse(Order.mapInput(Order.number, x => x.priority)));

// Combining multiple sort criteria
const byPriorityThenName = Order.combineAll([
  Order.mapInput(Order.number, (x: Item) => x.priority),
  Order.mapInput(Order.string, (x: Item) => x.name)
]);
const sorted = A.sort(items, byPriorityThenName);
```

### Pattern 7: Native `new Set()` to Effect `HashSet`

```typescript
// Native
const unique = [...new Set(arr)];
const set = new Set(values);
set.add(x);
if (set.has(x)) { ... }

// Effect (immutable)
import * as HashSet from "effect/HashSet";

const unique = HashSet.toValues(HashSet.fromIterable(arr));
const set = HashSet.fromIterable(values);
const newSet = HashSet.add(set, x);  // Returns NEW HashSet
if (HashSet.has(set, x)) { ... }
```

### Pattern 8: Native `.push()` to Effect `A.append()`

```typescript
// Native (mutates)
const arr = [1, 2, 3];
arr.push(4);  // arr is now [1, 2, 3, 4]

// Effect (immutable, returns new array)
const arr = [1, 2, 3];
const newArr = A.append(arr, 4);  // [1, 2, 3, 4]
// arr is still [1, 2, 3]

// Building arrays functionally
const items = pipe(
  A.empty<number>(),
  A.append(1),
  A.append(2),
  A.append(3)
);
```

### Pattern 9: Native `.forEach()` to Effect alternatives

```typescript
// Native (side effects)
items.forEach(item => console.log(item));

// Effect - for pure iteration, use A.map and ignore result
// For side effects in Effect context:
Effect.forEach(items, (item) => Effect.log(item))

// Or if you just need to process without Effect context:
// Keep forEach for simple logging, but avoid for building data
```

### Pattern 10: Object.entries/Object.keys to Effect Record

```typescript
// Native
const entries = Object.entries(obj);
const keys = Object.keys(obj);
const values = Object.values(obj);

// Effect
import * as Record from "effect/Record";

const entries = Record.toEntries(obj);
const keys = Record.keys(obj);
const values = Record.values(obj);
```

---

## Part 4: Important Behavioral Differences

### 1. Option vs undefined/-1
Effect functions that might fail return `Option<T>` instead of `undefined` or `-1`:

```typescript
// Native
const idx = str.indexOf("x");  // -1 if not found
const found = arr.find(x => x);  // undefined if not found

// Effect
const idx = Str.indexOf("x")(str);  // Option.none() if not found
const found = A.findFirst(arr, x => x);  // Option.none() if not found

// Handle with Option utilities
O.getOrElse(() => -1)(idx)  // Extract or default
O.isSome(found)  // Check if found
O.map(found, value => ...)  // Transform if present
```

### 2. Immutability
All Effect collection operations return NEW collections:

```typescript
// Native Set mutates
const set = new Set();
set.add(1);  // set now contains 1

// Effect HashSet is immutable
const set1 = HashSet.empty<number>();
const set2 = HashSet.add(set1, 1);  // set1 is still empty!
```

### 3. Order for Sorting
Effect sorting requires `Order<T>` instead of comparator functions:

```typescript
// Native: (a, b) => number
arr.sort((a, b) => a - b);

// Effect: Order<T>
A.sort(arr, Order.number);

// Custom order with mapInput
A.sort(users, Order.mapInput(Order.string, u => u.name));
```

### 4. Data-First vs Data-Last
Effect supports both styles:

```typescript
// Data-first (direct call)
A.map(arr, fn);
A.filter(arr, pred);

// Data-last (pipeable)
pipe(arr, A.map(fn), A.filter(pred));

// Both work, choose based on context
```

---

## Part 5: Files Already Well-Migrated (Reference Examples)

These files demonstrate excellent Effect patterns to follow:

1. **`packages/common/utils/src/data/array.utils/order-by.ts`**
   - Uses `A.reduce`, `A.get`, `A.append`, `A.match`, `Order.combineAll`
   - Demonstrates complex sorting with Effect's Order module

2. **`packages/common/utils/src/data/string.utils.ts`**
   - Uses `Str.split`, `Str.trim`, `Str.capitalize`, `Str.isEmpty`, `Str.normalize`
   - Great example of composing string operations with `F.flow`

3. **`packages/shared/domain/src/policy/policy-types.ts`**
   - Excellent use of `A.filter`, `A.some`, `A.contains`, `A.head`
   - Shows `Order.reverse`, `Order.mapInput` for sorting
   - Great predicate composition with `P.and`, `P.or`, `P.implies`

4. **`packages/common/contract/src/internal/contract/contract.ts`**
   - Uses `A.reduce` for building contexts
   - Shows `O.fromNullable`, `O.map`, `O.flatMap` patterns

---

## Part 6: Recommended Imports Template

Add this to files being migrated:

```typescript
import * as A from "effect/Array";
import * as F from "effect/Function";
import { pipe } from "effect/Function";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import * as Str from "effect/String";
import * as HashSet from "effect/HashSet";
import * as HashMap from "effect/HashMap";
import * as Record from "effect/Record";
import * as P from "effect/Predicate";
import * as Match from "effect/Match";
```

---

## Part 7: Migration Checklist

For each file being migrated:

- [ ] Replace `.map()` with `A.map()`
- [ ] Replace `.filter()` with `A.filter()`
- [ ] Replace `.flatMap()` with `A.flatMap()`
- [ ] Replace `.reduce()` with `A.reduce()` (note: argument order differs)
- [ ] Replace `.find()` with `A.findFirst()` (returns Option)
- [ ] Replace `.some()` with `A.some()`
- [ ] Replace `.every()` with `A.every()`
- [ ] Replace `.includes()` with `A.contains()` or `HashSet.has()`
- [ ] Replace `.indexOf()` with `Str.indexOf()` or `A.findFirstIndex()` (returns Option)
- [ ] Replace `.sort()` with `A.sort()` (use Order module)
- [ ] Replace `.reverse()` with `A.reverse()`
- [ ] Replace `.concat()` with `A.appendAll()`
- [ ] Replace `.push()` with `A.append()` (immutable)
- [ ] Replace `.slice()` with `A.slice()` or `Str.slice()`
- [ ] Replace `.join()` with `A.join()`
- [ ] Replace `Array.from()` with `A.fromIterable()`
- [ ] Replace `Array.isArray()` with `A.isArray()`
- [ ] Replace `.toLowerCase()` with `Str.toLowerCase()`
- [ ] Replace `.toUpperCase()` with `Str.toUpperCase()`
- [ ] Replace `.trim()` with `Str.trim()`
- [ ] Replace `.split()` with `Str.split()`
- [ ] Replace `.startsWith()` with `Str.startsWith()`
- [ ] Replace `.endsWith()` with `Str.endsWith()`
- [ ] Replace `.replace()` with `Str.replace()`
- [ ] Replace `new Set()` with `HashSet.empty()` or `HashSet.fromIterable()`
- [ ] Replace `new Map()` with `HashMap.empty()` or `HashMap.fromIterable()`
- [ ] Handle Option returns appropriately
- [ ] Ensure immutability is maintained
- [ ] Run type checking after migration

---

## Conclusion

This codebase has a strong foundation with Effect-first patterns in core utility and domain files. The main migration opportunities are:

1. **High Priority**: `packages/documents/domain/src/value-objects/file-types/FileTypes.ts` - Heavy use of native Set and array methods
2. **Medium Priority**: Infrastructure handlers and SDK helpers
3. **Lower Priority**: UI utilities (consider case-by-case)

The existing well-migrated files serve as excellent reference implementations. Focus on maintaining consistency with the patterns established in `order-by.ts`, `string.utils.ts`, and `policy-types.ts`.
