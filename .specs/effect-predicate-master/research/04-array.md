# Effect Array Module - Predicate Functions Research

## Executive Summary

The `effect/Array` module provides comprehensive predicate-based operations for array manipulation, with over 30 functions that either consume predicates or act as predicates themselves. All functions support type refinements for type narrowing, integrate seamlessly with `effect/Predicate`, and provide indexed predicate support where applicable.

## Source Files

- **Primary Source**: `tmp/effect/packages/effect/src/Array.ts`
- **Type Definitions**: `node_modules/effect/dist/dts/Array.d.ts`
- **Lines Analyzed**: ~3600 lines (partial analysis due to file size)

---

## Categories of Predicate-Related Functions

### 1. Type Guards (Boolean Predicates)

Functions that return boolean values to check array properties.

#### `isEmptyArray` / `isEmptyReadonlyArray`
**Line**: 534, 551
**Type Signature**:
```typescript
const isEmptyArray: <A>(self: Array<A>) => self is []
const isEmptyReadonlyArray: <A>(self: ReadonlyArray<A>) => self is readonly []
```

**Description**: Type guards that narrow array types to empty arrays.

**Example**:
```typescript
import * as A from "effect/Array"
import * as F from "effect/Function"

const arr: Array<number> = []
if (A.isEmptyArray(arr)) {
  // arr is narrowed to type: []
  console.log("Empty array")
}
```

---

#### `isNonEmptyArray` / `isNonEmptyReadonlyArray`
**Line**: 570, 589
**Type Signature**:
```typescript
const isNonEmptyArray: <A>(self: Array<A>) => self is NonEmptyArray<A>
const isNonEmptyReadonlyArray: <A>(self: ReadonlyArray<A>) => self is NonEmptyReadonlyArray<A>
```

**Description**: Type guards that narrow array types to non-empty arrays (at least one element).

**Example**:
```typescript
import * as A from "effect/Array"

const arr: Array<number> = [1, 2, 3]
if (A.isNonEmptyArray(arr)) {
  // arr is narrowed to type: NonEmptyArray<number>
  const first = arr[0] // Safe access - guaranteed to exist
}
```

---

#### `contains` / `containsWith`
**Line**: 1856, 1826
**Type Signature**:
```typescript
const contains: {
  <A>(a: A): (self: Iterable<A>) => boolean
  <A>(self: Iterable<A>, a: A): boolean
}

const containsWith: <A>(isEquivalent: (self: A, that: A) => boolean) => {
  (a: A): (self: Iterable<A>) => boolean
  (self: Iterable<A>, a: A): boolean
}
```

**Description**: Check if an array contains a specific value. `contains` uses default equality, `containsWith` accepts custom equivalence function.

**Example**:
```typescript
import * as A from "effect/Array"
import * as F from "effect/Function"

// Using contains (default equality)
const hasTwo = F.pipe([1, 2, 3], A.contains(2))
console.log(hasTwo) // true

// Using containsWith (custom equivalence)
const users = [{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }]
const hasUser = F.pipe(
  users,
  A.containsWith<typeof users[number]>((a, b) => a.id === b.id)({ id: 2, name: "Robert" })
)
console.log(hasUser) // true (matches by id)
```

---

### 2. Element Search Functions

Functions that find elements based on predicates.

#### `findFirst`
**Line**: 1053
**Type Signature**:
```typescript
const findFirst: {
  <A, B>(f: (a: NoInfer<A>, i: number) => Option.Option<B>): (self: Iterable<A>) => Option.Option<B>
  <A, B extends A>(refinement: (a: NoInfer<A>, i: number) => a is B): (self: Iterable<A>) => Option.Option<B>
  <A>(predicate: (a: NoInfer<A>, i: number) => boolean): (self: Iterable<A>) => Option.Option<A>
  <A, B>(self: Iterable<A>, f: (a: A, i: number) => Option.Option<B>): Option.Option<B>
  <A, B extends A>(self: Iterable<A>, refinement: (a: A, i: number) => a is B): Option.Option<B>
  <A>(self: Iterable<A>, predicate: (a: A, i: number) => boolean): Option.Option<A>
}
```

**Description**: Find the first element satisfying a predicate. Supports three modes: predicate, refinement, or mapper function returning Option.

**Example**:
```typescript
import * as A from "effect/Array"
import * as F from "effect/Function"
import * as O from "effect/Option"

// With predicate
const firstEven = F.pipe(
  [1, 3, 4, 5],
  A.findFirst((n) => n % 2 === 0)
)
console.log(firstEven) // Option.some(4)

// With refinement
type User = { type: "admin" } | { type: "user" }
const users: Array<User> = [{ type: "user" }, { type: "admin" }]
const firstAdmin = F.pipe(
  users,
  A.findFirst((u): u is { type: "admin" } => u.type === "admin")
)
// firstAdmin: Option.Option<{ type: "admin" }>
```

---

#### `findLast`
**Line**: 1078
**Type Signature**:
```typescript
const findLast: {
  <A, B>(f: (a: NoInfer<A>, i: number) => Option.Option<B>): (self: Iterable<A>) => Option.Option<B>
  <A, B extends A>(refinement: (a: NoInfer<A>, i: number) => a is B): (self: Iterable<A>) => Option.Option<B>
  <A>(predicate: (a: NoInfer<A>, i: number) => boolean): (self: Iterable<A>) => Option.Option<A>
  <A, B>(self: Iterable<A>, f: (a: A, i: number) => Option.Option<B>): Option.Option<B>
  <A, B extends A>(self: Iterable<A>, refinement: (a: A, i: number) => a is B): Option.Option<B>
  <A>(self: Iterable<A>, predicate: (a: A, i: number) => boolean): Option.Option<A>
}
```

**Description**: Find the last element satisfying a predicate. Iterates backwards from the end.

**Example**:
```typescript
import * as A from "effect/Array"
import * as F from "effect/Function"

const lastEven = F.pipe(
  [1, 2, 3, 4, 5],
  A.findLast((n) => n % 2 === 0)
)
console.log(lastEven) // Option.some(4)
```

---

#### `findFirstWithIndex`
**Line**: 1125
**Type Signature**:
```typescript
const findFirstWithIndex: {
  <A, B>(f: (a: NoInfer<A>, i: number) => Option.Option<B>): (self: Iterable<A>) => Option.Option<[B, number]>
  <A, B extends A>(refinement: (a: NoInfer<A>, i: number) => a is B): (self: Iterable<A>) => Option.Option<[B, number]>
  <A>(predicate: (a: NoInfer<A>, i: number) => boolean): (self: Iterable<A>) => Option.Option<[A, number]>
  <A, B>(self: Iterable<A>, f: (a: A, i: number) => Option.Option<B>): Option.Option<[B, number]>
  <A, B extends A>(self: Iterable<A>, refinement: (a: A, i: number) => a is B): Option.Option<[B, number]>
  <A>(self: Iterable<A>, predicate: (a: A, i: number) => boolean): Option.Option<[A, number]>
}
```

**Description**: Returns tuple of `[element, index]` for the first element satisfying the predicate.

**Example**:
```typescript
import * as A from "effect/Array"
import * as F from "effect/Function"

const result = F.pipe(
  [1, 2, 3, 4, 5],
  A.findFirstWithIndex((x) => x > 3)
)
console.log(result) // Option.some([4, 3])
```

---

#### `findFirstIndex`
**Line**: 995
**Type Signature**:
```typescript
const findFirstIndex: {
  <A>(predicate: (a: NoInfer<A>, i: number) => boolean): (self: Iterable<A>) => Option.Option<number>
  <A>(self: Iterable<A>, predicate: (a: A, i: number) => boolean): Option.Option<number>
}
```

**Description**: Return the first index where a predicate holds.

**Example**:
```typescript
import * as A from "effect/Array"
import * as F from "effect/Function"

const index = F.pipe(
  [5, 3, 8, 9],
  A.findFirstIndex((x) => x > 5)
)
console.log(index) // Option.some(2)
```

---

#### `findLastIndex`
**Line**: 1024
**Type Signature**:
```typescript
const findLastIndex: {
  <A>(predicate: (a: NoInfer<A>, i: number) => boolean): (self: Iterable<A>) => Option.Option<number>
  <A>(self: Iterable<A>, predicate: (a: A, i: number) => boolean): Option.Option<number>
}
```

**Description**: Return the last index where a predicate holds.

**Example**:
```typescript
import * as A from "effect/Array"
import * as F from "effect/Function"

const index = F.pipe(
  [1, 3, 8, 9],
  A.findLastIndex((x) => x < 5)
)
console.log(index) // Option.some(1)
```

---

### 3. Filtering Functions

Functions that filter arrays based on predicates.

#### `filter`
**Line**: 2756
**Type Signature**:
```typescript
const filter: {
  <A, B extends A>(refinement: (a: NoInfer<A>, i: number) => a is B): (self: Iterable<A>) => Array<B>
  <A>(predicate: (a: NoInfer<A>, i: number) => boolean): (self: Iterable<A>) => Array<A>
  <A, B extends A>(self: Iterable<A>, refinement: (a: A, i: number) => a is B): Array<B>
  <A>(self: Iterable<A>, predicate: (a: A, i: number) => boolean): Array<A>
}
```

**Description**: Filter array elements that satisfy a predicate. Supports type refinements for narrowing.

**Example**:
```typescript
import * as A from "effect/Array"
import * as F from "effect/Function"
import * as P from "effect/Predicate"

// Basic filtering
const evens = F.pipe(
  [1, 2, 3, 4, 5],
  A.filter((n) => n % 2 === 0)
)
console.log(evens) // [2, 4]

// With type refinement
type Value = string | number
const values: Array<Value> = [1, "hello", 2, "world", 3]
const numbers = F.pipe(
  values,
  A.filter(P.isNumber)
)
// numbers: Array<number> (type narrowed!)
console.log(numbers) // [1, 2, 3]
```

---

#### `filterMap`
**Line**: 2574
**Type Signature**:
```typescript
const filterMap: {
  <A, B>(f: (a: A, i: number) => Option.Option<B>): (self: Iterable<A>) => Array<B>
  <A, B>(self: Iterable<A>, f: (a: A, i: number) => Option.Option<B>): Array<B>
}
```

**Description**: Combines filter and map in a single pass. Function returns `Option<B>` - `Some` values are kept and unwrapped, `None` values are filtered out.

**Example**:
```typescript
import * as A from "effect/Array"
import * as F from "effect/Function"
import * as O from "effect/Option"

const result = F.pipe(
  [1, 2, 3, 4, 5],
  A.filterMap((n) => (n % 2 === 0 ? O.some(n * 2) : O.none()))
)
console.log(result) // [4, 8] (even numbers doubled)
```

---

#### `filterMapWhile`
**Line**: 2611
**Type Signature**:
```typescript
const filterMapWhile: {
  <A, B>(f: (a: A, i: number) => Option.Option<B>): (self: Iterable<A>) => Array<B>
  <A, B>(self: Iterable<A>, f: (a: A, i: number) => Option.Option<B>): Array<B>
}
```

**Description**: Like `filterMap`, but stops processing when the function returns `None` (short-circuits).

**Example**:
```typescript
import * as A from "effect/Array"
import * as F from "effect/Function"
import * as O from "effect/Option"

const toSquareTillOdd = (x: number) =>
  x % 2 === 0 ? O.some(x * x) : O.none()

const result = F.pipe([2, 4, 5, 6, 8], A.filterMapWhile(toSquareTillOdd))
console.log(result) // [4, 16] (stops at 5, doesn't process 6 and 8)
```

---

### 4. Partitioning Functions

Functions that split arrays based on predicates.

#### `partition`
**Line**: 2790
**Type Signature**:
```typescript
const partition: {
  <A, B extends A>(refinement: (a: NoInfer<A>, i: number) => a is B): (
    self: Iterable<A>
  ) => [excluded: Array<Exclude<A, B>>, satisfying: Array<B>]
  <A>(
    predicate: (a: NoInfer<A>, i: number) => boolean
  ): (self: Iterable<A>) => [excluded: Array<A>, satisfying: Array<A>]
  <A, B extends A>(
    self: Iterable<A>,
    refinement: (a: A, i: number) => a is B
  ): [excluded: Array<Exclude<A, B>>, satisfying: Array<B>]
  <A>(self: Iterable<A>, predicate: (a: A, i: number) => boolean): [excluded: Array<A>, satisfying: Array<A>]
}
```

**Description**: Separate elements into two arrays: `[failing, passing]`. With refinements, provides precise typing for both partitions.

**Example**:
```typescript
import * as A from "effect/Array"
import * as F from "effect/Function"

const [odds, evens] = F.pipe(
  [1, 2, 3, 4],
  A.partition((n) => n % 2 === 0)
)
console.log([odds, evens]) // [[1, 3], [2, 4]]

// With refinement
type Value = string | number
const values: Array<Value> = [1, "hello", 2, "world"]
const [strings, numbers] = F.pipe(
  values,
  A.partition((v): v is number => typeof v === "number")
)
// strings: Array<string>, numbers: Array<number> (precisely typed!)
```

---

#### `partitionMap`
**Line**: 2655
**Type Signature**:
```typescript
const partitionMap: {
  <A, B, C>(f: (a: A, i: number) => Either.Either<C, B>): (self: Iterable<A>) => [left: Array<B>, right: Array<C>]
  <A, B, C>(self: Iterable<A>, f: (a: A, i: number) => Either.Either<C, B>): [left: Array<B>, right: Array<C>]
}
```

**Description**: Maps each element to an `Either` and partitions into left and right arrays.

**Example**:
```typescript
import * as A from "effect/Array"
import * as E from "effect/Either"
import * as F from "effect/Function"

const isEven = (x: number) => x % 2 === 0

const [odds, evens] = F.pipe(
  [1, 2, 3, 4, 5],
  A.partitionMap((x) => (isEven(x) ? E.right(x) : E.left(x)))
)
console.log([odds, evens]) // [[1, 3, 5], [2, 4]]
```

---

### 5. Boolean Testing Functions

Functions that test all/some elements against predicates.

#### `every`
**Line**: 2997
**Type Signature**:
```typescript
const every: {
  <A, B extends A>(
    refinement: (a: NoInfer<A>, i: number) => a is B
  ): (self: ReadonlyArray<A>) => self is ReadonlyArray<B>
  <A>(predicate: (a: NoInfer<A>, i: number) => boolean): (self: ReadonlyArray<A>) => boolean
  <A, B extends A>(self: ReadonlyArray<A>, refinement: (a: A, i: number) => a is B): self is ReadonlyArray<B>
  <A>(self: ReadonlyArray<A>, predicate: (a: A, i: number) => boolean): boolean
}
```

**Description**: Check if all elements satisfy a predicate. With refinements, narrows the entire array type.

**Example**:
```typescript
import * as A from "effect/Array"
import * as F from "effect/Function"
import * as P from "effect/Predicate"

const allEven = F.pipe(
  [2, 4, 6],
  A.every((n) => n % 2 === 0)
)
console.log(allEven) // true

// With refinement for type narrowing
type Value = string | number
const values: Array<Value> = [1, 2, 3]
if (F.pipe(values, A.every(P.isNumber))) {
  // values is narrowed to Array<number> in this branch
  const sum = values.reduce((a, b) => a + b, 0)
}
```

---

#### `some`
**Line**: 3016
**Type Signature**:
```typescript
const some: {
  <A>(
    predicate: (a: NoInfer<A>, i: number) => boolean
  ): (self: ReadonlyArray<A>) => self is NonEmptyReadonlyArray<A>
  <A>(self: ReadonlyArray<A>, predicate: (a: A, i: number) => boolean): self is NonEmptyReadonlyArray<A>
}
```

**Description**: Check if at least one element satisfies a predicate. Narrows to `NonEmptyArray` if true.

**Example**:
```typescript
import * as A from "effect/Array"
import * as F from "effect/Function"

const hasEven = F.pipe(
  [1, 3, 4, 5],
  A.some((n) => n % 2 === 0)
)
console.log(hasEven) // true

const arr: Array<number> = [1, 2, 3]
if (F.pipe(arr, A.some((n) => n > 0))) {
  // arr is narrowed to NonEmptyArray<number>
  const first = arr[0] // Safe access
}
```

---

### 6. Prefix/Suffix Operations

Functions that take/drop elements while predicates hold.

#### `takeWhile`
**Line**: 852
**Type Signature**:
```typescript
const takeWhile: {
  <A, B extends A>(refinement: (a: NoInfer<A>, i: number) => a is B): (self: Iterable<A>) => Array<B>
  <A>(predicate: (a: NoInfer<A>, i: number) => boolean): (self: Iterable<A>) => Array<A>
  <A, B extends A>(self: Iterable<A>, refinement: (a: A, i: number) => a is B): Array<B>
  <A>(self: Iterable<A>, predicate: (a: A, i: number) => boolean): Array<A>
}
```

**Description**: Take elements from the start while predicate holds, stop at first failure.

**Example**:
```typescript
import * as A from "effect/Array"
import * as F from "effect/Function"

const result = F.pipe(
  [2, 4, 6, 1, 8],
  A.takeWhile((n) => n % 2 === 0)
)
console.log(result) // [2, 4, 6] (stops at 1)
```

---

#### `dropWhile`
**Line**: 971
**Type Signature**:
```typescript
const dropWhile: {
  <A>(predicate: (a: NoInfer<A>, i: number) => boolean): (self: Iterable<A>) => Array<A>
  <A>(self: Iterable<A>, predicate: (a: A, i: number) => boolean): Array<A>
}
```

**Description**: Drop elements from the start while predicate holds, keep rest.

**Example**:
```typescript
import * as A from "effect/Array"
import * as F from "effect/Function"

const result = F.pipe(
  [2, 4, 6, 1, 8],
  A.dropWhile((n) => n % 2 === 0)
)
console.log(result) // [1, 8] (dropped [2, 4, 6])
```

---

#### `span`
**Line**: 890
**Type Signature**:
```typescript
const span: {
  <A, B extends A>(
    refinement: (a: NoInfer<A>, i: number) => a is B
  ): (self: Iterable<A>) => [init: Array<B>, rest: Array<Exclude<A, B>>]
  <A>(predicate: (a: NoInfer<A>, i: number) => boolean): (self: Iterable<A>) => [init: Array<A>, rest: Array<A>]
  <A, B extends A>(
    self: Iterable<A>,
    refinement: (a: A, i: number) => a is B
  ): [init: Array<B>, rest: Array<Exclude<A, B>>]
  <A>(self: Iterable<A>, predicate: (a: A, i: number) => boolean): [init: Array<A>, rest: Array<A>]
}
```

**Description**: Split into `[prefix_matching, rest]` where prefix is the longest initial segment satisfying the predicate.

**Example**:
```typescript
import * as A from "effect/Array"
import * as F from "effect/Function"

const [prefix, rest] = F.pipe(
  [2, 4, 6, 1, 8],
  A.span((n) => n % 2 === 0)
)
console.log([prefix, rest]) // [[2, 4, 6], [1, 8]]
```

---

### 7. Splitting Functions

Functions that split arrays at predicate boundaries.

#### `splitWhere`
**Line**: 2009
**Type Signature**:
```typescript
const splitWhere: {
  <A>(
    predicate: (a: NoInfer<A>, i: number) => boolean
  ): (self: Iterable<A>) => [beforeMatch: Array<A>, fromMatch: Array<A>]
  <A>(self: Iterable<A>, predicate: (a: A, i: number) => boolean): [beforeMatch: Array<A>, fromMatch: Array<A>]
}
```

**Description**: Split at the first element where predicate holds. Returns `[before_match, from_match_onwards]`.

**Example**:
```typescript
import * as A from "effect/Array"
import * as F from "effect/Function"

const [before, from] = F.pipe(
  [1, 2, 3, 4, 5],
  A.splitWhere((n) => n > 2)
)
console.log([before, from]) // [[1, 2], [3, 4, 5]]
```

---

### 8. Grouping Functions

Functions that group elements based on predicates or key functions.

#### `groupBy`
**Line**: 2238
**Type Signature**:
```typescript
const groupBy: {
  <A, K extends string | symbol>(
    f: (a: A) => K
  ): (self: Iterable<A>) => Record<Record.ReadonlyRecord.NonLiteralKey<K>, NonEmptyArray<A>>
  <A, K extends string | symbol>(
    self: Iterable<A>,
    f: (a: A) => K
  ): Record<Record.ReadonlyRecord.NonLiteralKey<K>, NonEmptyArray<A>>
}
```

**Description**: Group elements by a key function. Returns a record where each key maps to a non-empty array of elements.

**Example**:
```typescript
import * as A from "effect/Array"
import * as F from "effect/Function"

type User = { name: string; group: string }
const users: Array<User> = [
  { name: "Alice", group: "A" },
  { name: "Bob", group: "B" },
  { name: "Charlie", group: "A" }
]

const byGroup = F.pipe(
  users,
  A.groupBy((u) => u.group)
)
console.log(byGroup)
// {
//   A: [{ name: "Alice", group: "A" }, { name: "Charlie", group: "A" }],
//   B: [{ name: "Bob", group: "B" }]
// }
```

---

### 9. Deduplication Functions

Functions that remove duplicates based on equivalence predicates.

#### `dedupeWith`
**Line**: 3172
**Type Signature**:
```typescript
const dedupeWith: {
  <S extends Iterable<any>>(
    isEquivalent: (self: ReadonlyArray.Infer<S>, that: ReadonlyArray.Infer<S>) => boolean
  ): (self: S) => ReadonlyArray.With<S, ReadonlyArray.Infer<S>>
  <A>(self: NonEmptyReadonlyArray<A>, isEquivalent: (self: A, that: A) => boolean): NonEmptyArray<A>
  <A>(self: Iterable<A>, isEquivalent: (self: A, that: A) => boolean): Array<A>
}
```

**Description**: Remove duplicates using custom equivalence function. Preserves order of first occurrence.

**Example**:
```typescript
import * as A from "effect/Array"
import * as F from "effect/Function"

type User = { id: number; name: string }
const users: Array<User> = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
  { id: 1, name: "Alice (duplicate)" }
]

const unique = F.pipe(
  users,
  A.dedupeWith((a, b) => a.id === b.id)
)
console.log(unique)
// [{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }]
```

---

#### `dedupe`
**Line**: 3202
**Type Signature**:
```typescript
const dedupe: <S extends Iterable<any>>(
  self: S
) => S extends NonEmptyReadonlyArray<infer A> ? NonEmptyArray<A>
  : S extends Iterable<infer A> ? Array<A>
  : never
```

**Description**: Remove duplicates using default `Equal.equivalence()`. Shorthand for `dedupeWith(Equal.equivalence())`.

**Example**:
```typescript
import * as A from "effect/Array"
import * as F from "effect/Function"

const result = F.pipe([1, 2, 2, 3, 1, 4], A.dedupe)
console.log(result) // [1, 2, 3, 4]
```

---

#### `dedupeAdjacentWith`
**Line**: 3221
**Type Signature**:
```typescript
const dedupeAdjacentWith: {
  <A>(isEquivalent: (self: A, that: A) => boolean): (self: Iterable<A>) => Array<A>
  <A>(self: Iterable<A>, isEquivalent: (self: A, that: A) => boolean): Array<A>
}
```

**Description**: Remove consecutive duplicates using custom equivalence function.

**Example**:
```typescript
import * as A from "effect/Array"
import * as F from "effect/Function"

const result = F.pipe(
  [1, 1, 2, 2, 3, 3, 2],
  A.dedupeAdjacentWith((a, b) => a === b)
)
console.log(result) // [1, 2, 3, 2] (last 2 is kept as it's not adjacent to previous 2s)
```

---

#### `dedupeAdjacent`
**Line**: 3250
**Type Signature**:
```typescript
const dedupeAdjacent: <A>(self: Iterable<A>) => Array<A>
```

**Description**: Remove consecutive duplicates using default equality.

**Example**:
```typescript
import * as A from "effect/Array"
import * as F from "effect/Function"

const result = F.pipe([1, 1, 2, 2, 3, 3], A.dedupeAdjacent)
console.log(result) // [1, 2, 3]
```

---

### 10. Set Operations

Functions performing set operations with custom equivalence predicates.

#### `intersectionWith`
**Line**: 2348
**Type Signature**:
```typescript
const intersectionWith: <A>(isEquivalent: (self: A, that: A) => boolean) => {
  (that: Iterable<A>): (self: Iterable<A>) => Array<A>
  (self: Iterable<A>, that: Iterable<A>): Array<A>
}
```

**Description**: Create intersection of two arrays using custom equivalence function.

**Example**:
```typescript
import * as A from "effect/Array"
import * as F from "effect/Function"

type User = { id: number; name: string }
const users1: Array<User> = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" }
]
const users2: Array<User> = [
  { id: 2, name: "Robert" },
  { id: 3, name: "Charlie" }
]

const common = F.pipe(
  users1,
  A.intersectionWith<User>((a, b) => a.id === b.id)(users2)
)
console.log(common) // [{ id: 2, name: "Bob" }] (matches by id)
```

---

#### `intersection`
**Line**: 2377
**Type Signature**:
```typescript
const intersection: {
  <B>(that: Iterable<B>): <A>(self: Iterable<A>) => Array<A & B>
  <A, B>(self: Iterable<A>, that: Iterable<B>): Array<A & B>
}
```

**Description**: Create intersection using default equality.

**Example**:
```typescript
import * as A from "effect/Array"
import * as F from "effect/Function"

const result = F.pipe([1, 2, 3], A.intersection([3, 4, 1]))
console.log(result) // [1, 3]
```

---

#### `unionWith` (partial info from line 2276)
**Type Signature**:
```typescript
const unionWith: {
  <S extends Iterable<any>, T extends Iterable<any>>(
    that: T,
    isEquivalent: (self: ReadonlyArray.Infer<S>, that: ReadonlyArray.Infer<T>) => boolean
  ): (self: S) => ReadonlyArray.OrNonEmpty<S, T, ReadonlyArray.Infer<S> | ReadonlyArray.Infer<T>>
  <A, B>(
    self: NonEmptyReadonlyArray<A>,
    that: Iterable<B>,
    isEquivalent: (self: A, that: B) => boolean
  ): NonEmptyArray<A | B>
  <A, B>(
    self: Iterable<A>,
    that: NonEmptyReadonlyArray<B>,
    isEquivalent: (self: A, that: B) => boolean
  ): NonEmptyArray<A | B>
  <A, B>(self: Iterable<A>, that: Iterable<B>, isEquivalent: (self: A, that: B) => boolean): Array<A | B>
}
```

**Description**: Create union of two arrays with custom equivalence, removing duplicates.

---

#### `differenceWith` (partial info from line 2399)
**Type Signature**:
```typescript
const differenceWith: <A>(isEquivalent: (self: A, that: A) => boolean) => {
  (that: Iterable<A>): (self: Iterable<A>) => Array<A>
  (self: Iterable<A>, that: Iterable<A>): Array<A>
}
```

**Description**: Create array of elements from first array not present in second, using custom equivalence.

**Example**:
```typescript
import * as A from "effect/Array"
import * as F from "effect/Function"

const array1 = [1, 2, 3]
const array2 = [2, 3, 4]
const difference = F.pipe(
  array1,
  A.differenceWith<number>((a, b) => a === b)(array2)
)
console.log(difference) // [1]
```

---

### 11. Lifting Functions

Functions that lift predicates into the Array context.

#### `liftPredicate`
**Line**: 2895
**Type Signature**:
```typescript
const liftPredicate: {
  <A, B extends A>(refinement: Predicate.Refinement<A, B>): (a: A) => Array<B>
  <A>(predicate: Predicate.Predicate<A>): <B extends A>(b: B) => Array<B>
}
```

**Description**: Lift a predicate into the Array context. Returns `[value]` if predicate passes, `[]` if it fails.

**Example**:
```typescript
import * as A from "effect/Array"
import * as F from "effect/Function"

const isEven = (n: number) => n % 2 === 0
const toArrayIfEven = A.liftPredicate(isEven)

console.log(toArrayIfEven(1)) // []
console.log(toArrayIfEven(2)) // [2]

// Usage in chains
const result = F.pipe(
  5,
  A.liftPredicate((n: number) => n > 3),
  A.map((n) => n * 2)
)
console.log(result) // [10]
```

---

## Type Narrowing Patterns

### Pattern 1: Filter with Refinement
```typescript
import * as A from "effect/Array"
import * as P from "effect/Predicate"
import * as F from "effect/Function"

type Value = string | number | boolean
const values: Array<Value> = [1, "hello", true, 2, "world"]

// Narrow to numbers
const numbers = F.pipe(values, A.filter(P.isNumber))
// Type: Array<number>

// Narrow to strings
const strings = F.pipe(values, A.filter(P.isString))
// Type: Array<string>
```

---

### Pattern 2: Partition with Refinement
```typescript
import * as A from "effect/Array"
import * as P from "effect/Predicate"
import * as F from "effect/Function"

type Response = { _tag: "success"; data: string } | { _tag: "error"; error: string }
const responses: Array<Response> = [
  { _tag: "success", data: "ok" },
  { _tag: "error", error: "failed" }
]

const [errors, successes] = F.pipe(
  responses,
  A.partition((r): r is { _tag: "success"; data: string } => r._tag === "success")
)
// errors: Array<{ _tag: "error"; error: string }>
// successes: Array<{ _tag: "success"; data: string }>
```

---

### Pattern 3: Every with Refinement
```typescript
import * as A from "effect/Array"
import * as P from "effect/Predicate"
import * as F from "effect/Function"

type Value = string | number
const values: Array<Value> = [1, 2, 3]

if (F.pipe(values, A.every(P.isNumber))) {
  // Inside this block, values is narrowed to Array<number>
  const sum = values.reduce((a, b) => a + b, 0)
}
```

---

### Pattern 4: FindFirst with Refinement
```typescript
import * as A from "effect/Array"
import * as O from "effect/Option"
import * as F from "effect/Function"

type User = { type: "admin"; adminLevel: number } | { type: "user"; userId: string }
const users: Array<User> = [
  { type: "user", userId: "123" },
  { type: "admin", adminLevel: 5 }
]

const firstAdmin = F.pipe(
  users,
  A.findFirst((u): u is { type: "admin"; adminLevel: number } => u.type === "admin")
)
// Type: Option<{ type: "admin"; adminLevel: number }>

F.pipe(
  firstAdmin,
  O.map((admin) => {
    // admin.adminLevel is accessible here (type narrowed)
    console.log(admin.adminLevel)
  })
)
```

---

## Integration with effect/Predicate

All Array predicate functions integrate seamlessly with the `effect/Predicate` module:

```typescript
import * as A from "effect/Array"
import * as P from "effect/Predicate"
import * as F from "effect/Function"

// Using Predicate guards
const values: Array<unknown> = [1, "hello", null, 2, undefined, "world"]

const numbers = F.pipe(values, A.filter(P.isNumber))
// Type: Array<number>

const nonNullable = F.pipe(values, A.filter(P.isNotNullable))
// Type: Array<string | number>

// Combining predicates
const isPositive = (n: number) => n > 0
const isEven = (n: number) => n % 2 === 0

const isPositiveEven = P.and(isPositive, isEven)

const result = F.pipe([-2, -1, 0, 1, 2, 3, 4], A.filter(isPositiveEven))
console.log(result) // [2, 4]
```

---

## Indexed Predicate Support

Most predicate functions provide index as second parameter:

```typescript
import * as A from "effect/Array"
import * as F from "effect/Function"

// Filter by index
const everyOtherElement = F.pipe(
  [10, 20, 30, 40, 50],
  A.filter((_, i) => i % 2 === 0)
)
console.log(everyOtherElement) // [10, 30, 50]

// Find by index
const afterIndex2 = F.pipe(
  [10, 20, 30, 40],
  A.findFirst((n, i) => i > 2)
)
console.log(afterIndex2) // Option.some(40)

// Partition by index
const [firstHalf, secondHalf] = F.pipe(
  [1, 2, 3, 4, 5, 6],
  A.partition((_, i) => i < 3)
)
console.log([firstHalf, secondHalf]) // [[4, 5, 6], [1, 2, 3]]
```

---

## Performance Characteristics

### Short-Circuiting Functions
These functions stop processing once a condition is met:
- `findFirst` - stops at first match
- `findLast` - iterates backwards, stops at first match
- `findFirstIndex` - stops at first match
- `findLastIndex` - iterates backwards, stops at first match
- `takeWhile` - stops at first failure
- `dropWhile` - stops at first failure
- `span` - stops at first failure
- `splitWhere` - stops at first match
- `filterMapWhile` - stops at first `None`
- `some` - stops at first `true`
- `every` - stops at first `false`

### Full Traversal Functions
These functions always process the entire array:
- `filter`
- `filterMap`
- `partition`
- `partitionMap`
- `dedupe`
- `dedupeWith`
- `dedupeAdjacent`
- `dedupeAdjacentWith`
- `groupBy`
- `intersection`
- `intersectionWith`
- `union`
- `unionWith`
- `difference`
- `differenceWith`

---

## Best Practices

### 1. Prefer Refinements for Type Safety
```typescript
// ❌ Lose type information
const numbers = F.pipe(values, A.filter((v): boolean => typeof v === "number"))

// ✅ Keep type information
const numbers = F.pipe(values, A.filter((v): v is number => typeof v === "number"))

// ✅ Use Predicate module guards
const numbers = F.pipe(values, A.filter(P.isNumber))
```

---

### 2. Use Partition Instead of Double Filter
```typescript
// ❌ Two passes
const evens = F.pipe(numbers, A.filter((n) => n % 2 === 0))
const odds = F.pipe(numbers, A.filter((n) => n % 2 !== 0))

// ✅ Single pass
const [odds, evens] = F.pipe(numbers, A.partition((n) => n % 2 === 0))
```

---

### 3. Use FilterMap Instead of Map + Filter
```typescript
// ❌ Two passes
const result = F.pipe(
  numbers,
  A.map((n) => (n > 0 ? O.some(n * 2) : O.none())),
  A.filterMap(F.identity)
)

// ✅ Single pass
const result = F.pipe(
  numbers,
  A.filterMap((n) => (n > 0 ? O.some(n * 2) : O.none()))
)
```

---

### 4. Leverage Short-Circuiting
```typescript
// ✅ Stops early if any element fails
const allValid = F.pipe(data, A.every(isValid))

// ✅ Stops early if any element passes
const hasValid = F.pipe(data, A.some(isValid))

// ✅ Stops at first match
const firstValid = F.pipe(data, A.findFirst(isValid))
```

---

### 5. Use Index Parameter Judiciously
```typescript
// ✅ Good use - filtering by position
const firstThree = F.pipe(items, A.filter((_, i) => i < 3))

// ⚠️ Be careful - index is tracked even if unused
const evens = F.pipe(items, A.filter((n, _i) => n % 2 === 0))
```

---

## Summary

The `effect/Array` module provides:

### Functions Consuming Predicates (25+)
- **Search**: `findFirst`, `findLast`, `findFirstWithIndex`, `findFirstIndex`, `findLastIndex`
- **Filter**: `filter`, `filterMap`, `filterMapWhile`
- **Partition**: `partition`, `partitionMap`
- **Prefix/Suffix**: `takeWhile`, `dropWhile`, `span`
- **Split**: `splitWhere`
- **Test**: `every`, `some`
- **Contains**: `contains`, `containsWith`
- **Dedupe**: `dedupeWith`, `dedupeAdjacentWith`
- **Set Ops**: `intersectionWith`, `unionWith`, `differenceWith`

### Functions That Are Predicates (4)
- **Type Guards**: `isEmptyArray`, `isEmptyReadonlyArray`, `isNonEmptyArray`, `isNonEmptyReadonlyArray`

### Functions Returning Predicates (3)
- **Lifting**: `liftPredicate`
- **Contains**: `contains`, `containsWith`

### Key Features
1. **Type refinement support** - Most functions accept refinements for type narrowing
2. **Indexed predicates** - Most functions provide index as second parameter
3. **Short-circuiting** - Many functions optimize by stopping early
4. **Predicate integration** - Seamless integration with `effect/Predicate` module
5. **Dual API** - All support both piped and direct-call styles
6. **Type safety** - Precise type inference with refinements and guards

---

## Cross-References

- **Predicate Module**: See `01-predicate.md` for predicate composition patterns
- **Option Module**: See `02-option.md` for Option-returning functions integration
- **Match Module**: See `03-match.md` for pattern matching with arrays
- **Struct Module**: See `05-struct.md` for struct predicate patterns with arrays
- **Record Module**: See `06-record.md` for record operations on grouped arrays
