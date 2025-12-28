# Effect Equivalence Module - Comprehensive Research

## Executive Summary

The `effect/Equivalence` module provides a type class for defining equivalence relations—binary relations that are reflexive, symmetric, and transitive. This is a fundamental building block for comparing values in a type-safe, composable manner. Equivalences are used extensively throughout Effect for equality checks, deduplication, memoization, and data structure operations.

**Key insight**: While predicates return `boolean` for a single value, equivalences return `boolean` for comparing *two* values. They work hand-in-hand with predicates and ordering to create a complete comparison toolkit.

## Module Overview

**Source Files**:
- `/tmp/effect/packages/effect/src/Equivalence.ts` (236 lines)
- `/node_modules/effect/dist/dts/Equivalence.d.ts` (158 lines)

**Core Concept**: An `Equivalence<A>` is a function `(self: A, that: A) => boolean` that determines if two values of type `A` are equivalent.

**Mathematical Properties** (from line 2-4):
1. **Reflexive**: `equiv(a, a) === true` — every value is equivalent to itself
2. **Symmetric**: `equiv(a, b) === equiv(b, a)` — order doesn't matter
3. **Transitive**: if `equiv(a, b)` and `equiv(b, c)`, then `equiv(a, c)`

## Type Definitions

### Core Type Class

**Location**: Lines 15-17

```typescript
interface Equivalence<in A> {
  (self: A, that: A): boolean
}
```

**Note**: The `in` modifier makes `A` contravariant, which is correct for function parameters that consume values.

### Type Lambda

**Location**: Lines 23-25

```typescript
interface EquivalenceTypeLambda extends TypeLambda {
  readonly type: Equivalence<this["Target"]>
}
```

Used for higher-kinded type operations with Equivalences.

## Constructors

### 1. `make`

**Location**: Lines 31-32
**Category**: constructors
**Since**: 2.0.0

```typescript
const make: <A>(isEquivalent: (self: A, that: A) => boolean) => Equivalence<A>
```

**Description**: Creates a custom `Equivalence` from a comparison function. The constructor automatically adds a short-circuit check for reference equality (`===`) before calling the custom comparison.

**Implementation Detail** (line 31-32):
```typescript
(self: A, that: A): boolean => self === that || isEquivalent(self, that)
```

**Example**:
```typescript
import * as Equivalence from "effect/Equivalence"

// Custom equivalence for case-insensitive string comparison
const caseInsensitive = Equivalence.make<string>(
  (a, b) => a.toLowerCase() === b.toLowerCase()
)

caseInsensitive("Hello", "HELLO") // true
caseInsensitive("Hello", "World") // false
caseInsensitive("same", "same")   // true (short-circuits with ===)
```

### 2. `strict`

**Location**: Lines 42 (declaration), 34 (implementation)
**Category**: constructors
**Since**: 2.0.0

```typescript
const strict: <A>() => Equivalence<A>
```

**Description**: Returns an `Equivalence` that uses strict equality (`===`) to compare values.

**Implementation** (line 34):
```typescript
const isStrictEquivalent = (x: unknown, y: unknown) => x === y
```

**Example**:
```typescript
import * as Equivalence from "effect/Equivalence"

const objEquiv = Equivalence.strict<{ name: string }>()

const obj1 = { name: "Alice" }
const obj2 = { name: "Alice" }

objEquiv(obj1, obj1) // true (same reference)
objEquiv(obj1, obj2) // false (different references, even though structurally equal)
```

## Built-in Instances

### Primitive Types

All primitive equivalences use strict equality internally (lines 48, 54, 60, 66, 72):

#### 1. `string`

**Location**: Line 48
**Category**: instances
**Since**: 2.0.0

```typescript
const string: Equivalence<string>
```

**Example**:
```typescript
import * as Equivalence from "effect/Equivalence"

Equivalence.string("hello", "hello") // true
Equivalence.string("hello", "world") // false
```

#### 2. `number`

**Location**: Line 54
**Category**: instances
**Since**: 2.0.0

```typescript
const number: Equivalence<number>
```

**Example**:
```typescript
import * as Equivalence from "effect/Equivalence"

Equivalence.number(42, 42)     // true
Equivalence.number(42, 43)     // false
Equivalence.number(NaN, NaN)   // false (NaN !== NaN in JavaScript)
```

#### 3. `boolean`

**Location**: Line 60
**Category**: instances
**Since**: 2.0.0

```typescript
const boolean: Equivalence<boolean>
```

#### 4. `bigint`

**Location**: Line 66
**Category**: instances
**Since**: 2.0.0

```typescript
const bigint: Equivalence<bigint>
```

#### 5. `symbol`

**Location**: Line 72
**Category**: instances
**Since**: 2.0.0

```typescript
const symbol: Equivalence<symbol>
```

### Complex Types

#### 6. `Date`

**Location**: Line 128
**Category**: instances
**Since**: 2.0.0

```typescript
const Date: Equivalence<Date>
```

**Implementation**: Uses `mapInput` to compare dates by their timestamp (line 128):
```typescript
mapInput(number, (date) => date.getTime())
```

**Example**:
```typescript
import * as Equivalence from "effect/Equivalence"

const date1 = new Date("2025-01-15")
const date2 = new Date("2025-01-15")
const date3 = new Date("2025-01-16")

Equivalence.Date(date1, date2) // true (same timestamp)
Equivalence.Date(date1, date3) // false (different timestamps)
```

## Combining Operations

### 7. `combine`

**Location**: Lines 78-81
**Category**: combining
**Since**: 2.0.0

```typescript
const combine: {
  <A>(that: Equivalence<A>): (self: Equivalence<A>) => Equivalence<A>
  <A>(self: Equivalence<A>, that: Equivalence<A>): Equivalence<A>
}
```

**Description**: Combines two equivalences using logical AND. Both equivalences must return `true` for the combined equivalence to return `true`.

**Implementation** (line 81):
```typescript
make((x, y) => self(x, y) && that(x, y))
```

**Example**:
```typescript
import * as Equivalence from "effect/Equivalence"
import * as F from "effect/Function"

// Custom equivalence: strings must match AND have same length
const stringAndLength = F.pipe(
  Equivalence.string,
  Equivalence.combine(
    Equivalence.make<string>((a, b) => a.length === b.length)
  )
)

stringAndLength("hello", "hello") // true
stringAndLength("hello", "world") // false (different strings)
stringAndLength("hi", "by")       // false (same length but different strings)
```

### 8. `combineMany`

**Location**: Lines 87-101
**Category**: combining
**Since**: 2.0.0

```typescript
const combineMany: {
  <A>(collection: Iterable<Equivalence<A>>): (self: Equivalence<A>) => Equivalence<A>
  <A>(self: Equivalence<A>, collection: Iterable<Equivalence<A>>): Equivalence<A>
}
```

**Description**: Combines a base equivalence with multiple equivalences. All must return `true`.

**Implementation** (lines 90-101):
```typescript
make((x, y) => {
  if (!self(x, y)) {
    return false
  }
  for (const equivalence of collection) {
    if (!equivalence(x, y)) {
      return false
    }
  }
  return true
})
```

**Example**:
```typescript
import * as Equivalence from "effect/Equivalence"
import * as F from "effect/Function"

interface Person {
  name: string
  age: number
  email: string
}

const nameEquiv = Equivalence.make<Person>((a, b) => a.name === b.name)
const ageEquiv = Equivalence.make<Person>((a, b) => a.age === b.age)
const emailEquiv = Equivalence.make<Person>((a, b) => a.email === b.email)

const personEquiv = F.pipe(
  nameEquiv,
  Equivalence.combineMany([ageEquiv, emailEquiv])
)

const alice1 = { name: "Alice", age: 30, email: "alice@example.com" }
const alice2 = { name: "Alice", age: 30, email: "alice@example.com" }
const alice3 = { name: "Alice", age: 31, email: "alice@example.com" }

personEquiv(alice1, alice2) // true (all fields match)
personEquiv(alice1, alice3) // false (age differs)
```

### 9. `combineAll`

**Location**: Lines 109-110
**Category**: combining
**Since**: 2.0.0

```typescript
const combineAll: <A>(collection: Iterable<Equivalence<A>>) => Equivalence<A>
```

**Description**: Combines multiple equivalences with an "always true" base equivalence.

**Implementation** (line 109-110):
```typescript
combineMany(isAlwaysEquivalent, collection)
// where isAlwaysEquivalent: Equivalence<unknown> = (_x, _y) => true
```

**Example**:
```typescript
import * as Equivalence from "effect/Equivalence"

const multiCheck = Equivalence.combineAll([
  Equivalence.string,
  Equivalence.make<string>((a, b) => a.length === b.length),
  Equivalence.make<string>((a, b) => a[0] === b[0]) // first char match
])

multiCheck("hello", "hello") // true
multiCheck("hello", "world") // false
```

## Mapping Operations

### 10. `mapInput`

**Location**: Lines 116-122
**Category**: mapping
**Since**: 2.0.0

```typescript
const mapInput: {
  <B, A>(f: (b: B) => A): (self: Equivalence<A>) => Equivalence<B>
  <A, B>(self: Equivalence<A>, f: (b: B) => A): Equivalence<B>
}
```

**Description**: Transforms an `Equivalence<A>` into an `Equivalence<B>` by mapping inputs through a function `f: B => A`. Also known as "contravariant map".

**Implementation** (lines 121-122):
```typescript
make((x, y) => self(f(x), f(y)))
```

**Example**:
```typescript
import * as Equivalence from "effect/Equivalence"
import * as F from "effect/Function"

interface User {
  id: number
  name: string
}

// Compare users by their ID only
const userEquivById = F.pipe(
  Equivalence.number,
  Equivalence.mapInput((user: User) => user.id)
)

const user1 = { id: 1, name: "Alice" }
const user2 = { id: 1, name: "Bob" }
const user3 = { id: 2, name: "Alice" }

userEquivById(user1, user2) // true (same ID)
userEquivById(user1, user3) // false (different IDs)
```

## Product Operations

### 11. `product`

**Location**: Lines 134-141
**Category**: combining
**Since**: 2.0.0

```typescript
const product: {
  <B>(that: Equivalence<B>): <A>(self: Equivalence<A>) => Equivalence<readonly [A, B]>
  <A, B>(self: Equivalence<A>, that: Equivalence<B>): Equivalence<readonly [A, B]>
}
```

**Description**: Combines two equivalences into an equivalence for tuples. Both elements must be equivalent.

**Implementation** (lines 139-140):
```typescript
make(([xa, xb], [ya, yb]) => self(xa, ya) && that(xb, yb))
```

**Example**:
```typescript
import * as Equivalence from "effect/Equivalence"
import * as F from "effect/Function"

const pairEquiv = F.pipe(
  Equivalence.string,
  Equivalence.product(Equivalence.number)
)

pairEquiv(["hello", 42], ["hello", 42]) // true
pairEquiv(["hello", 42], ["hello", 43]) // false (number differs)
pairEquiv(["hello", 42], ["world", 42]) // false (string differs)
```

### 12. `productMany`

**Location**: Lines 169-175
**Category**: combining
**Since**: 2.0.0

```typescript
const productMany: <A>(
  self: Equivalence<A>,
  collection: Iterable<Equivalence<A>>
) => Equivalence<readonly [A, ...Array<A>]>
```

**Description**: Creates an equivalence for non-empty tuples by combining a head equivalence with a collection of tail equivalences.

**Implementation** (lines 173-174):
```typescript
make((x, y) => !self(x[0], y[0]) ? false : equivalence(x.slice(1), y.slice(1)))
```

**Example**:
```typescript
import * as Equivalence from "effect/Equivalence"

const tupleEquiv = Equivalence.productMany(
  Equivalence.string,
  [Equivalence.number, Equivalence.boolean]
)

tupleEquiv(["a", 1, true], ["a", 1, true])   // true
tupleEquiv(["a", 1, true], ["a", 1, false])  // false
tupleEquiv(["a", 1, true], ["b", 1, true])   // false
```

## Combinators

### 13. `tuple`

**Location**: Lines 190-192
**Category**: combinators
**Since**: 2.0.0

```typescript
const tuple: <T extends ReadonlyArray<Equivalence<any>>>(
  ...elements: T
) => Equivalence<Readonly<{ [I in keyof T]: [T[I]] extends [Equivalence<infer A>] ? A : never }>>
```

**Description**: Similar to `Promise.all` but for equivalences. Takes a tuple of equivalences and returns an equivalence for tuples.

**Type transformation**:
```
[Equivalence<A>, Equivalence<B>, ...] -> Equivalence<[A, B, ...]>
```

**Implementation** (line 192):
```typescript
all(elements) as any
```

**Example**:
```typescript
import * as Equivalence from "effect/Equivalence"

const personEquiv = Equivalence.tuple(
  Equivalence.string,  // name
  Equivalence.number,  // age
  Equivalence.string   // email
)

type Person = readonly [string, number, string]

const alice1: Person = ["Alice", 30, "alice@example.com"]
const alice2: Person = ["Alice", 30, "alice@example.com"]
const alice3: Person = ["Alice", 31, "alice@example.com"]

personEquiv(alice1, alice2) // true
personEquiv(alice1, alice3) // false (age differs)
```

### 14. `array`

**Location**: Lines 200-214
**Category**: combinators
**Since**: 2.0.0

```typescript
const array: <A>(item: Equivalence<A>) => Equivalence<ReadonlyArray<A>>
```

**Description**: Creates an equivalence for arrays by applying an element equivalence to each corresponding pair. Arrays must have the same length.

**Implementation** (lines 201-214):
```typescript
make((self, that) => {
  if (self.length !== that.length) {
    return false
  }

  for (let i = 0; i < self.length; i++) {
    const isEq = item(self[i], that[i])
    if (!isEq) {
      return false
    }
  }

  return true
})
```

**Example**:
```typescript
import * as Equivalence from "effect/Equivalence"

const numberArrayEquiv = Equivalence.array(Equivalence.number)

numberArrayEquiv([1, 2, 3], [1, 2, 3])    // true
numberArrayEquiv([1, 2, 3], [1, 2, 4])    // false (element differs)
numberArrayEquiv([1, 2, 3], [1, 2])       // false (length differs)

// Case-insensitive string array comparison
const caseInsensitiveArray = Equivalence.array(
  Equivalence.make<string>((a, b) => a.toLowerCase() === b.toLowerCase())
)

caseInsensitiveArray(["Hello", "World"], ["HELLO", "WORLD"]) // true
```

### 15. `struct`

**Location**: Lines 223-235
**Category**: combinators
**Since**: 2.0.0

```typescript
const struct: <R extends Record<string, Equivalence<any>>>(
  fields: R
) => Equivalence<{ readonly [K in keyof R]: [R[K]] extends [Equivalence<infer A>] ? A : never }>
```

**Description**: Creates an equivalence for structs/objects by applying field-specific equivalences to corresponding properties.

**Implementation** (lines 227-233):
```typescript
make((self, that) => {
  for (const key of keys) {
    if (!fields[key](self[key], that[key])) {
      return false
    }
  }
  return true
})
```

**Example**:
```typescript
import * as Equivalence from "effect/Equivalence"

interface Person {
  readonly name: string
  readonly age: number
  readonly active: boolean
}

const personEquiv = Equivalence.struct<{
  name: Equivalence<string>
  age: Equivalence<number>
  active: Equivalence<boolean>
}>({
  name: Equivalence.string,
  age: Equivalence.number,
  active: Equivalence.boolean
})

const alice1: Person = { name: "Alice", age: 30, active: true }
const alice2: Person = { name: "Alice", age: 30, active: true }
const alice3: Person = { name: "Alice", age: 31, active: true }

personEquiv(alice1, alice2) // true
personEquiv(alice1, alice3) // false (age differs)
```

### 16. `all`

**Location**: Lines 147-163
**Category**: combining
**Since**: 2.0.0

```typescript
const all: <A>(collection: Iterable<Equivalence<A>>) => Equivalence<ReadonlyArray<A>>
```

**Description**: Creates an equivalence for arrays by applying each equivalence from the collection to the corresponding element position.

**Implementation** (lines 148-162):
```typescript
make((x, y) => {
  const len = Math.min(x.length, y.length)

  let collectionLength = 0
  for (const equivalence of collection) {
    if (collectionLength >= len) {
      break
    }
    if (!equivalence(x[collectionLength], y[collectionLength])) {
      return false
    }
    collectionLength++
  }
  return true
})
```

**Note**: This is lower-level than `array`. Used internally by `tuple`.

**Example**:
```typescript
import * as Equivalence from "effect/Equivalence"

const mixedEquiv = Equivalence.all([
  Equivalence.string,
  Equivalence.number,
  Equivalence.boolean
])

mixedEquiv(["a", 1, true] as const, ["a", 1, true] as const)  // true
mixedEquiv(["a", 1, true] as const, ["a", 2, true] as const)  // false
```

## Practical Use Cases

### 1. Custom Domain Equivalence

```typescript
import * as Equivalence from "effect/Equivalence"
import * as F from "effect/Function"

interface EmailAddress {
  local: string
  domain: string
}

// Emails are equivalent if domains match (case-insensitive)
const emailEquiv = Equivalence.make<EmailAddress>((a, b) =>
  a.domain.toLowerCase() === b.domain.toLowerCase()
)

const email1: EmailAddress = { local: "user", domain: "Example.Com" }
const email2: EmailAddress = { local: "admin", domain: "example.com" }

emailEquiv(email1, email2) // true (same domain, different local parts)
```

### 2. Deep Struct Comparison

```typescript
import * as Equivalence from "effect/Equivalence"

interface Address {
  street: string
  city: string
  zip: number
}

interface User {
  id: number
  name: string
  address: Address
}

const addressEquiv = Equivalence.struct<{
  street: Equivalence<string>
  city: Equivalence<string>
  zip: Equivalence<number>
}>({
  street: Equivalence.string,
  city: Equivalence.string,
  zip: Equivalence.number
})

const userEquiv = Equivalence.struct<{
  id: Equivalence<number>
  name: Equivalence<string>
  address: Equivalence<Address>
}>({
  id: Equivalence.number,
  name: Equivalence.string,
  address: addressEquiv
})

const user1: User = {
  id: 1,
  name: "Alice",
  address: { street: "123 Main St", city: "Boston", zip: 12345 }
}

const user2: User = {
  id: 1,
  name: "Alice",
  address: { street: "123 Main St", city: "Boston", zip: 12345 }
}

userEquiv(user1, user2) // true (deep equality)
```

### 3. Collection Deduplication

```typescript
import * as Equivalence from "effect/Equivalence"
import * as A from "effect/Array"
import * as F from "effect/Function"

interface Product {
  id: number
  name: string
  price: number
}

const productEquivById = F.pipe(
  Equivalence.number,
  Equivalence.mapInput((p: Product) => p.id)
)

const products: Product[] = [
  { id: 1, name: "Widget", price: 10 },
  { id: 2, name: "Gadget", price: 20 },
  { id: 1, name: "Widget", price: 15 }, // Duplicate ID
  { id: 3, name: "Doohickey", price: 30 }
]

// Use with Array.dedupeWith (hypothetical—Effect Array may have similar utilities)
const dedupe = (items: Product[]): Product[] => {
  const seen: Product[] = []
  for (const item of items) {
    if (!F.pipe(seen, A.findFirst((s) => productEquivById(s, item))).pipe(/* ... */)) {
      seen.push(item)
    }
  }
  return seen
}
```

### 4. Equivalence with Predicates

```typescript
import * as Equivalence from "effect/Equivalence"
import * as P from "effect/Predicate"

// Combine predicate checks with equivalence
const isValidPair = <A>(
  equiv: Equivalence.Equivalence<A>,
  pred: P.Predicate<A>
) => (a: A, b: A): boolean =>
  pred(a) && pred(b) && equiv(a, b)

const positiveNumberEquiv = isValidPair(
  Equivalence.number,
  (n: number) => n > 0
)

positiveNumberEquiv(5, 5)    // true (both positive and equal)
positiveNumberEquiv(5, -5)   // false (second is negative)
positiveNumberEquiv(-5, -5)  // false (both negative)
```

### 5. Approximate Numeric Equivalence

```typescript
import * as Equivalence from "effect/Equivalence"

const approxNumber = (epsilon: number): Equivalence.Equivalence<number> =>
  Equivalence.make((a, b) => Math.abs(a - b) < epsilon)

const floatEquiv = approxNumber(0.0001)

floatEquiv(0.1 + 0.2, 0.3)           // true (within epsilon)
floatEquiv(1.0000001, 1.0000002)     // true (very close)
floatEquiv(1.0, 2.0)                 // false (too far apart)
```

## Integration with Effect Ecosystem

### With HashMap

```typescript
import * as HashMap from "effect/HashMap"
import * as Equivalence from "effect/Equivalence"
import * as Hash from "effect/Hash"

interface UserId {
  value: number
}

// Custom equivalence for UserId
const userIdEquiv: Equivalence.Equivalence<UserId> =
  Equivalence.make((a, b) => a.value === b.value)

// Use with HashMap (requires Hash as well)
const userIdHash: Hash.Hash<UserId> = {
  hash: (id) => Hash.number(id.value)
}

// Note: HashMap.make accepts equivalence and hash together
```

### With HashSet

```typescript
import * as HashSet from "effect/HashSet"
import * as Equivalence from "effect/Equivalence"

// HashSet uses equivalence for deduplication
const caseInsensitiveSet = HashSet.empty<string>()
// Note: HashSet needs both Hash and Equivalence for custom types
```

### With Data.taggedEnum and Schema

```typescript
import * as Equivalence from "effect/Equivalence"
import * as S from "effect/Schema"

// Schema automatically derives equivalences
const PersonSchema = S.Struct({
  name: S.String,
  age: S.Number
})

// Get derived equivalence from schema
// const personEquiv = S.equivalence(PersonSchema)
// personEquiv(person1, person2)
```

## Comparison with Other Modules

### Equivalence vs Predicate

| Aspect | Equivalence | Predicate |
|--------|-------------|-----------|
| **Signature** | `(A, A) => boolean` | `(A) => boolean` |
| **Purpose** | Compare two values | Test one value |
| **Use Case** | Equality, deduplication | Filtering, validation |
| **Example** | `equiv(user1, user2)` | `pred(user)` |

### Equivalence vs Order

| Aspect | Equivalence | Order |
|--------|-------------|-------|
| **Returns** | `boolean` | `-1 \| 0 \| 1` |
| **Can determine** | Equality only | Equality + ordering |
| **Relations** | `a ≡ b` | `a < b`, `a = b`, `a > b` |
| **Use Case** | Dedup, equality | Sorting, min/max |

**Note**: Every `Order` can be converted to an `Equivalence` by checking if the result is `0`.

### Equivalence vs Equal

| Aspect | Equivalence | Equal |
|--------|-------------|-------|
| **Module** | `effect/Equivalence` | `effect/Equal` |
| **Type** | Function type | Protocol (interface) |
| **Extensibility** | Compose equivalences | Implement `Equal` trait |
| **Use Case** | Functional composition | OOP-style equality |

## Performance Considerations

### Short-circuit Optimization

The `make` constructor automatically checks reference equality first (line 32):
```typescript
self === that || isEquivalent(self, that)
```

**Benefit**: For large objects, reference equality is O(1) vs structural comparison which is O(n).

### Array Equivalence Complexity

- `array`: O(n) where n is array length
- `struct`: O(k) where k is number of keys
- `tuple`: O(m) where m is tuple length

All stop early on first mismatch.

## Common Patterns

### Pattern 1: Derive Equivalence from Existing Types

```typescript
import * as Equivalence from "effect/Equivalence"
import * as F from "effect/Function"

// Derive user equivalence from ID equivalence
const byId = <T extends { id: number }>(
  equiv: Equivalence.Equivalence<number> = Equivalence.number
): Equivalence.Equivalence<T> =>
  F.pipe(equiv, Equivalence.mapInput((x: T) => x.id))

const userEquiv = byId<{ id: number; name: string }>()
```

### Pattern 2: Combine Multiple Criteria

```typescript
import * as Equivalence from "effect/Equivalence"
import * as F from "effect/Function"

const multiCriteria = <A>(
  ...equivs: Equivalence.Equivalence<A>[]
): Equivalence.Equivalence<A> =>
  Equivalence.combineAll(equivs)

const strictPerson = multiCriteria(
  F.pipe(Equivalence.string, Equivalence.mapInput((p: Person) => p.name)),
  F.pipe(Equivalence.number, Equivalence.mapInput((p: Person) => p.age)),
  F.pipe(Equivalence.string, Equivalence.mapInput((p: Person) => p.email))
)
```

### Pattern 3: Nullable/Optional Equivalence

```typescript
import * as Equivalence from "effect/Equivalence"
import * as O from "effect/Option"

const optionEquiv = <A>(
  equiv: Equivalence.Equivalence<A>
): Equivalence.Equivalence<O.Option<A>> =>
  Equivalence.make((self, that) => {
    if (O.isNone(self) && O.isNone(that)) return true
    if (O.isNone(self) || O.isNone(that)) return false
    return equiv(self.value, that.value)
  })

const optionalNumber = optionEquiv(Equivalence.number)

optionalNumber(O.none(), O.none())       // true
optionalNumber(O.some(5), O.some(5))     // true
optionalNumber(O.some(5), O.none())      // false
```

## Anti-Patterns to Avoid

### ❌ Using `===` Directly for Objects

```typescript
// ❌ WRONG - Reference equality only
const user1 = { id: 1, name: "Alice" }
const user2 = { id: 1, name: "Alice" }
user1 === user2 // false (different references)

// ✅ CORRECT - Structural equivalence
const userEquiv = Equivalence.struct({
  id: Equivalence.number,
  name: Equivalence.string
})
userEquiv(user1, user2) // true (same structure)
```

### ❌ Manual Boolean Logic Instead of `combine`

```typescript
// ❌ WRONG - Repetitive manual checks
const equiv = (a: Person, b: Person): boolean =>
  a.name === b.name && a.age === b.age && a.email === b.email

// ✅ CORRECT - Composable equivalence
const personEquiv = Equivalence.struct({
  name: Equivalence.string,
  age: Equivalence.number,
  email: Equivalence.string
})
```

### ❌ Not Using `mapInput` for Projection

```typescript
// ❌ WRONG - Inline extraction
const equiv = Equivalence.make<User>(
  (a, b) => a.id === b.id
)

// ✅ CORRECT - mapInput for clarity
const equiv = F.pipe(
  Equivalence.number,
  Equivalence.mapInput((u: User) => u.id)
)
```

### ❌ Forgetting Length Check in Array Equivalence

```typescript
// ❌ WRONG - Missing length check
const badArrayEquiv = <A>(item: Equivalence.Equivalence<A>) =>
  Equivalence.make<ReadonlyArray<A>>((a, b) => {
    for (let i = 0; i < a.length; i++) {
      if (!item(a[i], b[i])) return false
    }
    return true
  })

// ✅ CORRECT - Use built-in array combinator
const goodArrayEquiv = Equivalence.array(Equivalence.number)
```

## Complete Function Reference

| Function | Category | Returns | Description |
|----------|----------|---------|-------------|
| `make` | constructor | `Equivalence<A>` | Create custom equivalence |
| `strict` | constructor | `Equivalence<A>` | Reference equality (===) |
| `string` | instance | `Equivalence<string>` | String equality |
| `number` | instance | `Equivalence<number>` | Number equality |
| `boolean` | instance | `Equivalence<boolean>` | Boolean equality |
| `bigint` | instance | `Equivalence<bigint>` | BigInt equality |
| `symbol` | instance | `Equivalence<symbol>` | Symbol equality |
| `Date` | instance | `Equivalence<Date>` | Date equality by timestamp |
| `combine` | combining | `Equivalence<A>` | AND two equivalences |
| `combineMany` | combining | `Equivalence<A>` | AND multiple equivalences |
| `combineAll` | combining | `Equivalence<A>` | AND all in collection |
| `mapInput` | mapping | `Equivalence<B>` | Transform input type |
| `product` | combining | `Equivalence<[A, B]>` | Tuple equivalence |
| `productMany` | combining | `Equivalence<[A, ...A[]]>` | Non-empty tuple |
| `tuple` | combinator | `Equivalence<[A, B, ...]>` | Tuple from equivalences |
| `array` | combinator | `Equivalence<A[]>` | Array equivalence |
| `struct` | combinator | `Equivalence<{...}>` | Struct/object equivalence |
| `all` | combining | `Equivalence<A[]>` | Array from iterable |

## beep-effect Integration Checklist

- [ ] Use `Equivalence.struct` for domain model equality (User, Product, etc.)
- [ ] Use `Equivalence.mapInput` for ID-based comparisons
- [ ] Use `Equivalence.array` for list comparisons in tests
- [ ] Combine with `effect/Order` for sortable collections
- [ ] Use with `HashMap`/`HashSet` for custom equality semantics
- [ ] Derive equivalences from `Schema` where possible
- [ ] Use `Equivalence.make` for domain-specific equality rules
- [ ] Avoid bare `===` for structural equality checks
- [ ] Document equivalence relationships in domain models
- [ ] Use with `effect/Predicate` for filtering by equivalence class

## Next Steps for effect-predicate-master Agent

1. **Cross-reference with Predicate module**: Equivalences can be used to create predicates (e.g., `isEqualTo(x) = (y) => equiv(x, y)`)
2. **Cross-reference with Order module**: Every Order implies an Equivalence
3. **Integration with Schema**: Schema can auto-derive equivalences
4. **Use in data structures**: HashMap, HashSet, and collections use equivalences
5. **Testing utilities**: Create test equivalences for custom domain types

## References

- **Source**: `/tmp/effect/packages/effect/src/Equivalence.ts`
- **Type Definitions**: `/node_modules/effect/dist/dts/Equivalence.d.ts`
- **Related Modules**: `effect/Predicate`, `effect/Order`, `effect/Equal`, `effect/Hash`
- **Effect Docs**: https://effect.website/docs/equivalence
