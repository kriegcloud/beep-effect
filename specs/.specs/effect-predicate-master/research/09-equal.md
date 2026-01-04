# Effect Equal Module - Comprehensive Research

## Executive Summary

The `effect/Equal` module provides **structural equality** for Effect types, implementing a hash-based equality protocol that works with both primitive and complex data structures. Unlike JavaScript's referential `===` operator, `Equal.equals` performs deep value comparison for objects, arrays, and custom types that implement the `Equal` interface.

**Key capabilities**:
- Structural equality via symbol-based protocol
- Hash-based optimization for performance
- Native support for Date, URL, arrays, and plain objects
- Seamless integration with Effect Data types
- Type-safe equality checking

**Source location**: `tmp/effect/packages/effect/src/Equal.ts`

---

## Problem Statement

JavaScript's native equality operators have significant limitations:

```typescript
// ❌ Referential equality fails for structurally identical objects
const obj1 = { name: "Alice", age: 30 };
const obj2 = { name: "Alice", age: 30 };
obj1 === obj2; // false (different references!)

// ❌ Arrays with same values are not equal
[1, 2, 3] === [1, 2, 3]; // false

// ❌ Dates with same timestamp are not equal
new Date("2025-01-15") === new Date("2025-01-15"); // false
```

The `Equal` module solves this by providing **value-based structural equality** with performance optimizations through hashing.

---

## Research Sources

### Primary Sources
- **Source file**: `tmp/effect/packages/effect/src/Equal.ts` (99 lines)
- **Type definitions**: `node_modules/effect/dist/dts/Equal.d.ts`
- **Test suite**: `tmp/effect/packages/effect/test/Equal.test.ts`
- **Integration tests**: `tmp/effect/packages/effect/test/Data.test.ts`

### Related Modules
- `effect/Hash` - Hashing protocol and functions
- `effect/Equivalence` - Equivalence relation type class
- `effect/Predicate` - Type guards (used internally)
- `effect/Data` - Data types that implement Equal

---

## The Equal Protocol

### Symbol-Based Interface

```typescript
// Line 13: Unique symbol for equality protocol
export const symbol: unique symbol = Symbol.for("effect/Equal")

// Lines 19-21: Equal interface extends Hash
export interface Equal extends Hash.Hash {
  [symbol](that: Equal): boolean
}
```

The `Equal` interface requires:
1. **Hash protocol**: `[Hash.symbol](): number` - Returns a hash code
2. **Equality protocol**: `[Equal.symbol](that: Equal): boolean` - Implements equality logic

### Hash.Hash Interface

From `effect/Hash`:

```typescript
// Hash.ts, Line 25-27
export interface Hash {
  [symbol](): number
}
```

Types implementing `Equal` must also implement `Hash` because `Equal.equals` uses hash codes for optimization (lines 47-48 in Equal.ts).

---

## Core Functions

### 1. equals - Structural Equality Checker

**Location**: Lines 27-34
**Signatures**:
```typescript
export function equals<B>(that: B): <A>(self: A) => boolean
export function equals<A, B>(self: A, that: B): boolean
```

**Description**: Compares two values for structural equality. Supports both curried and direct invocation.

**Algorithm** (implemented in `compareBoth`, lines 36-86):

1. **Reference equality fast-path** (line 37-39):
   ```typescript
   if (self === that) return true
   ```

2. **Type check** (lines 40-43):
   ```typescript
   const selfType = typeof self
   if (selfType !== typeof that) return false
   ```

3. **Hash-based comparison for Equal types** (lines 46-48):
   ```typescript
   if (isEqual(self) && isEqual(that)) {
     if (Hash.hash(self) === Hash.hash(that) && self[symbol](that)) {
       return true
   ```
   First checks hash codes for fast inequality detection, then calls custom equality logic.

4. **Native type support**:
   - **Date** (lines 54-57): Compares timestamps, handles invalid dates
   - **URL** (lines 58-60): Compares `href` strings

5. **Structural comparison** (when `structuralRegionState.enabled`):
   - **Arrays** (lines 63-65): Length check + element-wise comparison
   - **Plain objects** (lines 66-78): Key count + recursive property comparison

**Usage examples**:

```typescript
import * as Equal from "effect/Equal";
import * as F from "effect/Function";

// Direct invocation
Equal.equals(
  { name: "Alice", age: 30 },
  { name: "Alice", age: 30 }
); // true

// Curried for piping
F.pipe(
  [1, 2, 3],
  Equal.equals([1, 2, 3])
); // true

// Date comparison
Equal.equals(
  new Date("2025-01-15"),
  new Date("2025-01-15")
); // true

// Invalid dates
const invalid1 = new Date("invalid");
const invalid2 = new Date("invalid");
Equal.equals(invalid1, invalid2); // true (both NaN timestamps)

// URL comparison
Equal.equals(
  new URL("https://effect.website"),
  new URL("https://effect.website")
); // true
```

**Anti-patterns**:

```typescript
// ❌ NEVER use === for objects/arrays
const obj1 = { id: 1 };
const obj2 = { id: 1 };
obj1 === obj2; // false

// ✅ REQUIRED - Use Equal.equals
Equal.equals(obj1, obj2); // true

// ❌ NEVER manually compare object properties
function areUsersEqual(a: User, b: User) {
  return a.id === b.id && a.name === b.name && a.email === b.email;
}

// ✅ REQUIRED - Let Equal handle it
Equal.equals(userA, userB);
```

---

### 2. isEqual - Type Guard

**Location**: Line 92
**Signature**:
```typescript
export const isEqual = (u: unknown): u is Equal => hasProperty(u, symbol)
```

**Description**: Type guard that checks if a value implements the `Equal` interface by testing for the equality symbol.

**Usage**:

```typescript
import * as Equal from "effect/Equal";
import * as Data from "effect/Data";

const plainObj = { name: "Alice" };
const dataObj = Data.struct({ name: "Alice" });

Equal.isEqual(plainObj); // false (no Equal protocol)
Equal.isEqual(dataObj);  // true (Data types implement Equal)

// Use in type narrowing
function processValue(value: unknown) {
  if (Equal.isEqual(value)) {
    // value is Equal - can use with equals()
    const hash = value[Hash.symbol]();
    console.log(`Hash: ${hash}`);
  }
}
```

---

### 3. equivalence - Equivalence Instance

**Location**: Line 98
**Signature**:
```typescript
export const equivalence: <A>() => Equivalence<A> = () => equals
```

**Description**: Returns an `Equivalence<A>` instance (from `effect/Equivalence`) using the `equals` function. Useful for composing with other Equivalence combinators.

**Equivalence type** (from `effect/Equivalence`):
```typescript
export interface Equivalence<in A> {
  (self: A, that: A): boolean
}
```

**Usage**:

```typescript
import * as Equal from "effect/Equal";
import * as Eq from "effect/Equivalence";

// Get an Equivalence instance
const userEquivalence = Equal.equivalence<User>();

// Use with Equivalence combinators
const productEquivalence = Eq.product(
  userEquivalence,
  Equal.equivalence<Order>()
); // Equivalence<readonly [User, Order]>

// Combine multiple equivalences
const combinedEquivalence = Eq.combineMany(
  Equal.equivalence<User>(),
  [Eq.Date, Eq.string]
);
```

---

## Implementing Equal for Custom Types

### Using Data Module (Recommended)

The easiest way to get `Equal` support is using `effect/Data`:

```typescript
import * as Data from "effect/Data";
import * as Equal from "effect/Equal";

// 1. Data.struct - Plain objects with equality
const person1 = Data.struct({ name: "Alice", age: 30 });
const person2 = Data.struct({ name: "Alice", age: 30 });
Equal.equals(person1, person2); // true

// 2. Data.Class - Class-based approach
class Person extends Data.Class<{ name: string; age: number }> {}
const alice1 = new Person({ name: "Alice", age: 30 });
const alice2 = new Person({ name: "Alice", age: 30 });
Equal.equals(alice1, alice2); // true

// 3. Data.TaggedClass - With discriminant
class User extends Data.TaggedClass("User")<{ id: string; name: string }> {}
const user1 = new User({ id: "123", name: "Alice" });
const user2 = new User({ id: "123", name: "Alice" });
Equal.equals(user1, user2); // true
user1._tag; // "User"

// 4. Data.case - Constructor function
interface PersonData {
  readonly name: string;
  readonly age: number;
}
const Person = Data.case<PersonData>();
const p1 = Person({ name: "Alice", age: 30 });
const p2 = Person({ name: "Alice", age: 30 });
Equal.equals(p1, p2); // true

// 5. Data.tagged - Constructor with tag
interface UserData {
  readonly _tag: "User";
  readonly name: string;
}
const User = Data.tagged<UserData>("User");
const u1 = User({ name: "Alice" });
const u2 = User({ name: "Alice" });
Equal.equals(u1, u2); // true
```

### Manual Implementation

For custom types that can't use `Data`, implement both protocols:

```typescript
import * as Equal from "effect/Equal";
import * as Hash from "effect/Hash";

class Point implements Equal.Equal {
  constructor(
    readonly x: number,
    readonly y: number
  ) {}

  // Hash protocol
  [Hash.symbol](): number {
    return Hash.hash(this.x) * 31 + Hash.hash(this.y);
  }

  // Equal protocol
  [Equal.symbol](that: Equal.Equal): boolean {
    if (that instanceof Point) {
      return this.x === that.x && this.y === that.y;
    }
    return false;
  }
}

const p1 = new Point(10, 20);
const p2 = new Point(10, 20);
const p3 = new Point(15, 25);

Equal.equals(p1, p2); // true
Equal.equals(p1, p3); // false
```

**Critical implementation rules**:

1. **Reflexive**: `equals(a, a) === true`
2. **Symmetric**: `equals(a, b) === equals(b, a)`
3. **Transitive**: If `equals(a, b)` and `equals(b, c)`, then `equals(a, c)`
4. **Hash consistency**: If `equals(a, b)`, then `hash(a) === hash(b)`

---

## Replacing === with Structural Equality

### When to Use Each

| Use Case | Operator | Reason |
|----------|----------|--------|
| Primitive equality | `===` | Faster for numbers, strings, booleans |
| Object/array comparison | `Equal.equals` | Structural comparison needed |
| Reference equality check | `===` | Explicitly checking same instance |
| Data type comparison | `Equal.equals` | Data types implement Equal protocol |
| null/undefined check | `===` | Simple and clear |
| Effect type comparison | `Equal.equals` | Effect types implement Equal |

### Migration Patterns

```typescript
// ❌ BEFORE - Referential equality
function areArraysEqual<A>(a: A[], b: A[]): boolean {
  return a === b || (
    a.length === b.length &&
    a.every((val, i) => val === b[i])
  );
}

// ✅ AFTER - Structural equality
function areArraysEqual<A>(a: A[], b: A[]): boolean {
  return Equal.equals(a, b);
}

// ❌ BEFORE - Manual object comparison
function areUsersEqual(a: User, b: User): boolean {
  return (
    a.id === b.id &&
    a.name === b.name &&
    a.email === b.email &&
    a.createdAt.getTime() === b.createdAt.getTime()
  );
}

// ✅ AFTER - Equal.equals handles all fields
function areUsersEqual(a: User, b: User): boolean {
  return Equal.equals(a, b);
}

// ✅ EVEN BETTER - Use Data types
class User extends Data.Class<{
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}> {}

// Now equality just works:
Equal.equals(user1, user2);
```

### Effect-First Patterns

```typescript
import * as Equal from "effect/Equal";
import * as F from "effect/Function";
import * as A from "effect/Array";
import * as O from "effect/Option";

// Array deduplication with structural equality
const dedup = <A>(arr: ReadonlyArray<A>): ReadonlyArray<A> =>
  F.pipe(
    arr,
    A.dedupeWith(Equal.equals)
  );

// Find in array with structural equality
const findInArray = <A>(target: A) => (arr: ReadonlyArray<A>): O.Option<A> =>
  F.pipe(
    arr,
    A.findFirst((item) => Equal.equals(item, target))
  );

// Check if array contains value
const contains = <A>(target: A) => (arr: ReadonlyArray<A>): boolean =>
  F.pipe(
    arr,
    A.some((item) => Equal.equals(item, target))
  );

// Usage
const users = [
  Data.struct({ id: "1", name: "Alice" }),
  Data.struct({ id: "2", name: "Bob" }),
  Data.struct({ id: "1", name: "Alice" }) // duplicate
];

const uniqueUsers = dedup(users);
// [{ id: "1", name: "Alice" }, { id: "2", name: "Bob" }]

const found = F.pipe(
  users,
  findInArray(Data.struct({ id: "2", name: "Bob" }))
);
// Some({ id: "2", name: "Bob" })
```

---

## Integration with Effect Collections

### HashMap and HashSet

`effect/HashMap` and `effect/HashSet` use the `Equal` and `Hash` protocols for keys/values:

```typescript
import * as HashMap from "effect/HashMap";
import * as HashSet from "effect/HashSet";
import * as Data from "effect/Data";

// HashMap with Data keys
const user1 = Data.struct({ id: "1", name: "Alice" });
const user2 = Data.struct({ id: "1", name: "Alice" }); // Same structure

let map = HashMap.empty<typeof user1, string>();
map = HashMap.set(map, user1, "Value for Alice");

// Structural equality allows retrieval with different reference
HashMap.get(map, user2); // Some("Value for Alice")

// HashSet deduplication
let set = HashSet.empty<typeof user1>();
set = HashSet.add(set, user1);
set = HashSet.add(set, user2); // Won't add duplicate

HashSet.size(set); // 1 (structural deduplication)
```

---

## Performance Considerations

### Hash-Based Optimization

The `equals` function uses hashing for early inequality detection (line 47):

```typescript
if (Hash.hash(self) === Hash.hash(that) && self[symbol](that)) {
  return true
}
```

**Why this works**:
1. If hashes differ, objects cannot be equal → fast path rejection
2. If hashes match, perform full equality check (handles hash collisions)
3. Hash computation is cached in many Effect types

### Structural Region State

The module uses `structuralRegionState` (from `effect/Utils`) to control structural comparison behavior (lines 50-52, 62-79):

```typescript
// When enabled, performs deep structural comparison of arrays/objects
if (structuralRegionState.enabled) {
  // Array comparison
  if (Array.isArray(self) && Array.isArray(that)) {
    return self.length === that.length && self.every((v, i) => compareBoth(v, that[i]))
  }
  // Plain object comparison
  // ...
}
```

This allows Effect to optimize equality checks in certain contexts.

---

## Comparison with Equivalence Module

| Aspect | Equal | Equivalence |
|--------|-------|-------------|
| **Purpose** | Protocol for structural equality | Type class for equivalence relations |
| **Implementation** | Symbol-based interface | Function `(a, b) => boolean` |
| **Hashing** | Requires Hash protocol | No hashing requirement |
| **Built-in support** | Data types implement it | Provides built-in instances |
| **Composition** | Through Data combinators | Rich combinator library |

**When to use each**:

- **Use Equal**: For Effect Data types, custom types with identity
- **Use Equivalence**: For custom comparison logic, primitive types, functional composition

**Example**:

```typescript
// Equal - for Data types
const user1 = Data.struct({ id: "1", name: "Alice" });
const user2 = Data.struct({ id: "1", name: "Alice" });
Equal.equals(user1, user2); // true

// Equivalence - for custom comparison
const nameEquivalence = Eq.mapInput(
  Eq.string,
  (user: User) => user.name
);
nameEquivalence(
  { id: "1", name: "Alice", age: 30 },
  { id: "2", name: "Alice", age: 25 }
); // true (same name, different IDs)
```

---

## Complete Function Reference

### Core Functions

| Function | Line | Signature | Description |
|----------|------|-----------|-------------|
| `symbol` | 13 | `unique symbol` | Unique symbol for equality protocol |
| `equals` | 27-34 | `<A, B>(self: A, that: B) => boolean` | Structural equality comparison |
| `isEqual` | 92 | `(u: unknown) => u is Equal` | Type guard for Equal interface |
| `equivalence` | 98 | `<A>() => Equivalence<A>` | Returns Equivalence instance |

### Internal Helpers

| Function | Line | Description |
|----------|------|-------------|
| `compareBoth` | 36-86 | Core comparison algorithm with hash optimization |

---

## Integration with beep-effect

### Current Usage Patterns

The beep-effect codebase should use `Equal.equals` for:

1. **Data type comparison** - All types built with `effect/Data`
2. **Collection operations** - Deduplication, finding, filtering
3. **HashMap/HashSet keys** - Structural key comparison
4. **Test assertions** - Comparing expected vs actual values

### Recommended Patterns for New Code

```typescript
import * as Equal from "effect/Equal";
import * as Data from "effect/Data";
import * as F from "effect/Function";
import * as A from "effect/Array";

// 1. Define domain models with Data
class UserId extends Data.Class<{ value: string }> {}
class User extends Data.Class<{
  id: UserId;
  name: string;
  email: string;
}> {}

// 2. Equality comes for free
const user1 = new User({
  id: new UserId({ value: "123" }),
  name: "Alice",
  email: "alice@example.com"
});

const user2 = new User({
  id: new UserId({ value: "123" }),
  name: "Alice",
  email: "alice@example.com"
});

Equal.equals(user1, user2); // true

// 3. Use in collection operations
const findUserById = (id: UserId) => (users: ReadonlyArray<User>) =>
  F.pipe(
    users,
    A.findFirst((user) => Equal.equals(user.id, id))
  );

// 4. Use in deduplication
const uniqueUsers = F.pipe(
  usersWithDuplicates,
  A.dedupeWith(Equal.equals)
);
```

---

## Testing Patterns

### Test Examples from Effect Source

```typescript
import { describe, it } from "@effect/vitest";
import { assertTrue, assertFalse } from "@effect/vitest/utils";
import * as Equal from "effect/Equal";
import * as Data from "effect/Data";

describe("Equal", () => {
  it("compares invalid dates", () => {
    const d1 = new Date("invalid");
    const d2 = new Date("invalid");
    assertTrue(Equal.equals(d1, d2));
  });

  it("distinguishes valid from invalid dates", () => {
    const epoch = new Date(0);
    const invalid = new Date("invalid");
    assertFalse(Equal.equals(epoch, invalid));
  });

  it("compares Data.struct instances", () => {
    const person1 = Data.struct({ name: "Alice", age: 30 });
    const person2 = Data.struct({ name: "Alice", age: 30 });
    assertTrue(Equal.equals(person1, person2));
  });

  it("handles nested structures", () => {
    const obj1 = Data.struct({
      user: Data.struct({ id: "1", name: "Alice" }),
      metadata: Data.array([1, 2, 3])
    });
    const obj2 = Data.struct({
      user: Data.struct({ id: "1", name: "Alice" }),
      metadata: Data.array([1, 2, 3])
    });
    assertTrue(Equal.equals(obj1, obj2));
  });
});
```

---

## Summary

### Key Takeaways

1. **Replace === for objects**: Use `Equal.equals` for structural comparison
2. **Use Data types**: Automatic `Equal` implementation with `Data.Class`, `Data.struct`, etc.
3. **Hash protocol required**: Custom types must implement both `Equal` and `Hash`
4. **Performance optimized**: Hash-based early rejection for inequality
5. **Native type support**: Works with Date, URL, arrays, plain objects
6. **Collection integration**: Works seamlessly with HashMap, HashSet, Array methods

### Effect-First Rules

```typescript
// ❌ NEVER compare objects with ===
obj1 === obj2

// ✅ ALWAYS use Equal.equals for structural comparison
Equal.equals(obj1, obj2)

// ❌ NEVER manually implement object comparison
function areEqual(a, b) {
  return a.x === b.x && a.y === b.y;
}

// ✅ ALWAYS use Data types for automatic equality
class Point extends Data.Class<{ x: number; y: number }> {}
Equal.equals(point1, point2)

// ❌ NEVER use JSON.stringify for equality
JSON.stringify(obj1) === JSON.stringify(obj2)

// ✅ ALWAYS use structural equality
Equal.equals(obj1, obj2)
```

---

## References

### Source Files
- `tmp/effect/packages/effect/src/Equal.ts` - Core implementation
- `tmp/effect/packages/effect/src/Hash.ts` - Hash protocol
- `tmp/effect/packages/effect/src/Equivalence.ts` - Equivalence type class
- `tmp/effect/packages/effect/test/Equal.test.ts` - Unit tests
- `tmp/effect/packages/effect/test/Data.test.ts` - Integration tests

### Related Documentation
- Effect Data module - Provides types with built-in equality
- Effect HashMap/HashSet - Use Equal protocol for keys
- Effect Equivalence - Functional equivalence relations
