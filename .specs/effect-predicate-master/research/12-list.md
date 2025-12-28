# Effect List Module - Predicate Functions Research

## Executive Summary

The `effect/List` module provides an immutable linked list data structure optimized for LIFO (last-in-first-out) operations with `O(1)` prepend and head/tail access. The module includes comprehensive predicate-based functions for filtering, searching, testing, and partitioning list elements. Unlike `effect/Array`, `List` is optimized for stack-like access patterns and implements structural sharing for memory efficiency.

**Key Characteristics**:
- Immutable linked list (Cons/Nil structure)
- Supports both `Predicate<A>` and `Refinement<A, B>` for type narrowing
- Returns `Option` for safe element access
- Optimized for sequential traversal (not random access)
- Structural sharing reduces memory overhead

---

## Research Sources

- **Source File**: `tmp/effect/packages/effect/src/List.ts`
- **Type Definitions**: `node_modules/effect/dist/dts/List.d.ts`
- **Module Version**: Effect 3.x (v2.0.0 module API)

---

## List Data Structure

### Core Types

```typescript
// List is a discriminated union of Cons and Nil
export type List<A> = Cons<A> | Nil<A>

// Non-empty list with head and tail
export interface Cons<out A> extends NonEmptyIterable<A> {
  readonly _tag: "Cons"
  readonly head: A
  readonly tail: List<A>
}

// Empty list
export interface Nil<out A> extends Iterable<A> {
  readonly _tag: "Nil"
}
```

### Performance Characteristics

| Operation | Time Complexity | Notes |
|-----------|----------------|-------|
| `prepend` | O(1) | Optimal for stack operations |
| `head`/`tail` | O(1) | Direct access to first element |
| `append` | O(n) | Requires full traversal |
| `filter` | O(n) | Single pass with structural sharing |
| `findFirst` | O(n) | Early termination on match |
| `every`/`some` | O(n) | Early termination possible |
| `partition` | O(n) | Single pass, builds two arrays |
| `reverse` | O(n) | Full traversal required |

---

## Predicate-Related Functions

### 1. Type Guards & Refinements

#### `isList` (Line 208-211)

**Type Signature**:
```typescript
export const isList: {
  <A>(u: Iterable<A>): u is List<A>
  (u: unknown): u is List<unknown>
}
```

**Description**: Type guard that checks if a value is a `List` by verifying the presence of the `TypeId` symbol.

**Implementation**:
```typescript
export const isList = (u: unknown): u is List<unknown> =>
  hasProperty(u, TypeId)
```

**Example Usage**:
```typescript
import * as List from "effect/List"
import * as F from "effect/Function"

const maybeList: unknown = List.make(1, 2, 3)

if (List.isList(maybeList)) {
  // Type narrowed to List<unknown>
  F.pipe(maybeList, List.head) // ✅ Type-safe
}
```

---

#### `isNil` (Line 219)

**Type Signature**:
```typescript
export const isNil: <A>(self: List<A>) => self is Nil<A>
```

**Description**: Refinement that checks if a list is empty (Nil variant).

**Implementation**:
```typescript
export const isNil = <A>(self: List<A>): self is Nil<A> =>
  self._tag === "Nil"
```

**Example Usage**:
```typescript
const list = List.make(1, 2, 3)

if (List.isNil(list)) {
  // Never reached - list is Cons
} else {
  // Type narrowed to Cons<number>
  console.log(list.head) // ✅ Safe access
}
```

---

#### `isCons` (Line 227)

**Type Signature**:
```typescript
export const isCons: <A>(self: List<A>) => self is Cons<A>
```

**Description**: Refinement that checks if a list is non-empty (Cons variant).

**Implementation**:
```typescript
export const isCons = <A>(self: List<A>): self is Cons<A> =>
  self._tag === "Cons"
```

**Example Usage**:
```typescript
const processNonEmpty = (list: List<number>) => {
  if (List.isCons(list)) {
    // Type narrowed to Cons<number>
    return list.head * 2
  }
  return 0
}
```

---

### 2. Universal & Existential Tests

#### `every` (Line 452-464)

**Type Signature**:
```typescript
export const every: {
  <A, B extends A>(refinement: Refinement<NoInfer<A>, B>):
    (self: List<A>) => self is List<B>
  <A>(predicate: Predicate<A>):
    (self: List<A>) => boolean
  <A, B extends A>(self: List<A>, refinement: Refinement<A, B>):
    self is List<B>
  <A>(self: List<A>, predicate: Predicate<A>):
    boolean
}
```

**Description**: Tests whether all elements in the list satisfy the predicate. Returns `true` for empty lists. With refinements, narrows the entire list type.

**Implementation**:
```typescript
export const every = dual(
  2,
  <A, B extends A>(self: List<A>, refinement: Refinement<A, B>): self is List<B> => {
    for (const a of self) {
      if (!refinement(a)) {
        return false
      }
    }
    return true
  }
)
```

**Example Usage**:
```typescript
import * as List from "effect/List"
import * as P from "effect/Predicate"
import * as F from "effect/Function"

// Predicate form
const allPositive = F.pipe(
  List.make(1, 2, 3),
  List.every((n) => n > 0)
) // true

// Refinement form with type narrowing
const isNumberList = (list: List<string | number>): list is List<number> =>
  F.pipe(list, List.every(P.isNumber))

const mixed: List<string | number> = List.make(1, 2, 3)
if (isNumberList(mixed)) {
  // Type narrowed to List<number>
}
```

---

#### `some` (Line 472-484)

**Type Signature**:
```typescript
export const some: {
  <A>(predicate: Predicate<NoInfer<A>>):
    (self: List<A>) => self is Cons<A>
  <A>(self: List<A>, predicate: Predicate<A>):
    self is Cons<A>
}
```

**Description**: Tests whether at least one element satisfies the predicate. If true, narrows the list to `Cons<A>` (non-empty).

**Implementation**:
```typescript
export const some = dual(
  2,
  <A>(self: List<A>, predicate: Predicate<A>): self is Cons<A> => {
    let these = self
    while (!isNil(these)) {
      if (predicate(these.head)) {
        return true
      }
      these = these.tail
    }
    return false
  }
)
```

**Example Usage**:
```typescript
const list = List.make(1, 2, 3)

if (F.pipe(list, List.some((n) => n > 2))) {
  // Type narrowed to Cons<number> (non-empty)
  console.log(list.head) // ✅ Safe - list must be non-empty
}

// Early termination optimization
const hasEven = F.pipe(
  List.make(1, 3, 5, 4, 7, 9),
  List.some((n) => n % 2 === 0)
) // Stops at 4, doesn't process 7, 9
```

---

### 3. Filtering Functions

#### `filter` (Line 492-497)

**Type Signature**:
```typescript
export const filter: {
  <A, B extends A>(refinement: Refinement<NoInfer<A>, B>):
    (self: List<A>) => List<B>
  <A>(predicate: Predicate<NoInfer<A>>):
    (self: List<A>) => List<A>
  <A, B extends A>(self: List<A>, refinement: Refinement<A, B>):
    List<B>
  <A>(self: List<A>, predicate: Predicate<A>):
    List<A>
}
```

**Description**: Filters a list using a predicate, preserving only elements that satisfy the condition. Uses structural sharing for memory efficiency.

**Implementation**:
```typescript
export const filter = dual(
  2,
  <A>(self: List<A>, predicate: Predicate<A>): List<A> =>
    noneIn(self, predicate, false)
)

// Optimized implementation with structural sharing
const noneIn = <A>(
  self: List<A>,
  predicate: Predicate<A>,
  isFlipped: boolean
): List<A> => {
  // Skips non-matching elements
  while (true) {
    if (isNil(self)) return nil()
    if (predicate(self.head) !== isFlipped) {
      return allIn(self, self.tail, predicate, isFlipped)
    }
    self = self.tail
  }
}
```

**Example Usage**:
```typescript
// Basic filtering
const evens = F.pipe(
  List.make(1, 2, 3, 4, 5, 6),
  List.filter((n) => n % 2 === 0)
) // List(2, 4, 6)

// Refinement with type narrowing
const numbers = F.pipe(
  List.make(1, "hello", 2, "world", 3),
  List.filter(P.isNumber)
) // List<number>

// Structural sharing example
const original = List.make(1, 2, 3, 4, 5)
const filtered = F.pipe(original, List.filter((n) => n >= 3))
// filtered shares tail structure with original (no deep copy)
```

---

#### `partition` (Line 778-796)

**Type Signature**:
```typescript
export const partition: {
  <A, B extends A>(refinement: Refinement<NoInfer<A>, B>):
    (self: List<A>) => [excluded: List<Exclude<A, B>>, satisfying: List<B>]
  <A>(predicate: Predicate<NoInfer<A>>):
    (self: List<A>) => [excluded: List<A>, satisfying: List<A>]
  <A, B extends A>(self: List<A>, refinement: Refinement<A, B>):
    [excluded: List<Exclude<A, B>>, satisfying: List<B>]
  <A>(self: List<A>, predicate: Predicate<A>):
    [excluded: List<A>, satisfying: List<A>]
}
```

**Description**: Splits a list into two lists based on a predicate - elements that fail the test and elements that pass.

**Implementation**:
```typescript
export const partition = dual(
  2,
  <A>(self: List<A>, predicate: Predicate<A>): [List<A>, List<A>] => {
    const left: Array<A> = []
    const right: Array<A> = []
    for (const a of self) {
      if (predicate(a)) {
        right.push(a)
      } else {
        left.push(a)
      }
    }
    return [fromIterable(left), fromIterable(right)]
  }
)
```

**Example Usage**:
```typescript
// Basic partition
const [odds, evens] = F.pipe(
  List.make(1, 2, 3, 4, 5),
  List.partition((n) => n % 2 === 0)
)
// odds: List(1, 3, 5)
// evens: List(2, 4)

// Refinement partition with type narrowing
const [nonNumbers, numbers] = F.pipe(
  List.make(1, "a", 2, "b", 3),
  List.partition(P.isNumber)
)
// nonNumbers: List<string>
// numbers: List<number>
```

---

### 4. Search Functions

#### `findFirst` (Line 626-640)

**Type Signature**:
```typescript
export const findFirst: {
  <A, B extends A>(refinement: Refinement<NoInfer<A>, B>):
    (self: List<A>) => Option.Option<B>
  <A>(predicate: Predicate<NoInfer<A>>):
    (self: List<A>) => Option.Option<A>
  <A, B extends A>(self: List<A>, refinement: Refinement<A, B>):
    Option.Option<B>
  <A>(self: List<A>, predicate: Predicate<A>):
    Option.Option<A>
}
```

**Description**: Returns the first element that satisfies the predicate, wrapped in `Option`. Returns `Option.none()` if no match found.

**Implementation**:
```typescript
export const findFirst = dual(
  2,
  <A>(self: List<A>, predicate: Predicate<A>): Option.Option<A> => {
    let these = self
    while (!isNil(these)) {
      if (predicate(these.head)) {
        return Option.some(these.head)
      }
      these = these.tail
    }
    return Option.none()
  }
)
```

**Example Usage**:
```typescript
// Basic search
const firstEven = F.pipe(
  List.make(1, 3, 4, 5, 6),
  List.findFirst((n) => n % 2 === 0)
) // Option.some(4)

// No match case
const firstNegative = F.pipe(
  List.make(1, 2, 3),
  List.findFirst((n) => n < 0)
) // Option.none()

// Refinement search with type narrowing
const firstString = F.pipe(
  List.make(1, "hello", 2, "world"),
  List.findFirst(P.isString)
) // Option<string> containing "hello"

// Pattern matching on result
F.pipe(
  List.make(1, 2, 3),
  List.findFirst((n) => n > 2),
  Option.match({
    onNone: () => "not found",
    onSome: (n) => `found: ${n}`
  })
)
```

---

### 5. Combined Filter-Map Functions

#### `filterMap` (Line 597-609)

**Type Signature**:
```typescript
export const filterMap: {
  <A, B>(f: (a: A) => Option.Option<B>):
    (self: List<A>) => List<B>
  <A, B>(self: List<A>, f: (a: A) => Option.Option<B>):
    List<B>
}
```

**Description**: Maps and filters simultaneously - the function returns `Option<B>`, and only `Some` values are included in the result.

**Implementation**:
```typescript
export const filterMap = dual(
  2,
  <A, B>(self: List<A>, f: (a: A) => Option.Option<B>): List<B> => {
    const bs: Array<B> = []
    for (const a of self) {
      const oa = f(a)
      if (Option.isSome(oa)) {
        bs.push(oa.value)
      }
    }
    return fromIterable(bs)
  }
)
```

**Example Usage**:
```typescript
// Parse numbers from strings
const parsed = F.pipe(
  List.make("1", "not a number", "2", "3"),
  List.filterMap((str) => {
    const n = Number(str)
    return Number.isNaN(n) ? Option.none() : Option.some(n)
  })
) // List(1, 2, 3)

// Extract property from objects
interface User {
  name: string
  email?: string
}

const emails = F.pipe(
  List.make(
    { name: "Alice", email: "alice@example.com" },
    { name: "Bob" }, // No email
    { name: "Charlie", email: "charlie@example.com" }
  ),
  List.filterMap((user) =>
    user.email ? Option.some(user.email) : Option.none()
  )
) // List("alice@example.com", "charlie@example.com")
```

---

#### `compact` (Line 617)

**Type Signature**:
```typescript
export const compact: <A>(self: List<Option.Option<A>>) => List<A>
```

**Description**: Removes all `None` values from a list of `Option`s, extracting the wrapped values from `Some`s.

**Implementation**:
```typescript
export const compact = <A>(self: List<Option.Option<A>>): List<A> =>
  filterMap(self, identity)
```

**Example Usage**:
```typescript
const options = List.make(
  Option.some(1),
  Option.none(),
  Option.some(2),
  Option.none(),
  Option.some(3)
)

const values = List.compact(options)
// List(1, 2, 3)

// Common pattern: map + compact
const safeHead = F.pipe(
  List.make(
    List.make(1, 2, 3),
    List.nil(),
    List.make(4, 5)
  ),
  List.map(List.head),
  List.compact
) // List(1, 4)
```

---

#### `partitionMap` (Line 806-821)

**Type Signature**:
```typescript
export const partitionMap: {
  <A, B, C>(f: (a: A) => Either.Either<C, B>):
    (self: List<A>) => [left: List<B>, right: List<C>]
  <A, B, C>(self: List<A>, f: (a: A) => Either.Either<C, B>):
    [left: List<B>, right: List<C>]
}
```

**Description**: Maps elements to `Either` and partitions based on `Left`/`Right` - combines mapping and partitioning in a single pass.

**Implementation**:
```typescript
export const partitionMap = dual(
  2,
  <A, B, C>(self: List<A>, f: (a: A) => Either.Either<C, B>): [List<B>, List<C>] => {
    const left: Array<B> = []
    const right: Array<C> = []
    for (const a of self) {
      const e = f(a)
      if (Either.isLeft(e)) {
        left.push(e.left)
      } else {
        right.push(e.right)
      }
    }
    return [fromIterable(left), fromIterable(right)]
  }
)
```

**Example Usage**:
```typescript
import * as Either from "effect/Either"

// Parse numbers, collecting errors
const [errors, numbers] = F.pipe(
  List.make("1", "not a number", "2", "invalid", "3"),
  List.partitionMap((str) => {
    const n = Number(str)
    return Number.isNaN(n)
      ? Either.left(str)
      : Either.right(n)
  })
)
// errors: List("not a number", "invalid")
// numbers: List(1, 2, 3)

// Validate and transform
interface ValidationResult {
  valid: List<number>
  invalid: List<string>
}

const validate = (items: List<string>): ValidationResult => {
  const [invalid, valid] = F.pipe(
    items,
    List.partitionMap((str) =>
      str.length > 0
        ? Either.right(str.length)
        : Either.left("empty string")
    )
  )
  return { valid, invalid }
}
```

---

## Comparison with Array Module

### Key Differences

| Feature | List | Array |
|---------|------|-------|
| **Data Structure** | Linked list (Cons/Nil) | Contiguous memory array |
| **Prepend** | O(1) | O(n) |
| **Append** | O(n) | O(1) amortized |
| **Head Access** | O(1) | O(1) |
| **Random Access** | O(n) | O(1) |
| **Memory** | Structural sharing | Full copies on mutation |
| **Best Use Case** | Stack operations, LIFO | Random access, iteration |
| **Empty Check** | `isNil` | `isEmpty` |
| **Non-Empty Check** | `isCons` | `isNonEmptyArray` |

### Predicate Function Comparison

```typescript
// Array - returns ReadonlyArray
const arrayEvens = F.pipe(
  [1, 2, 3, 4, 5],
  A.filter((n) => n % 2 === 0)
) // ReadonlyArray<number>

// List - returns List
const listEvens = F.pipe(
  List.make(1, 2, 3, 4, 5),
  List.filter((n) => n % 2 === 0)
) // List<number>
```

### When to Use List vs Array

**Use List when**:
- Frequent prepend operations
- Stack-like (LIFO) access patterns
- Building up collections incrementally from the front
- Memory efficiency via structural sharing is important

**Use Array when**:
- Random access needed
- Index-based operations common
- FIFO patterns (queue-like)
- Iteration over all elements (both are O(n) but Array is faster)

---

## Advanced Patterns

### Pattern 1: Safe Head Access with Type Narrowing

```typescript
const processFirst = (list: List<number>) =>
  List.isCons(list)
    ? list.head * 2  // ✅ Type-safe - no Option needed
    : 0

// Or with pipe + some
const hasLarge = (list: List<number>) =>
  F.pipe(
    list,
    List.some((n) => n > 100)
  )
  ? list.head  // ✅ Type narrowed to Cons<number>
  : 0
```

### Pattern 2: Combining Predicates with Refinements

```typescript
import * as P from "effect/Predicate"

interface User {
  name: string
  age: number
  active: boolean
}

const isActiveAdult = (user: User) =>
  user.age >= 18 && user.active

const activeAdults = F.pipe(
  List.make(
    { name: "Alice", age: 25, active: true },
    { name: "Bob", age: 16, active: true },
    { name: "Charlie", age: 30, active: false }
  ),
  List.filter(isActiveAdult)
)
```

### Pattern 3: Early Termination with `some`/`every`

```typescript
// Efficient existence check - stops at first match
const hasInvalidItem = F.pipe(
  expensiveList,
  List.some((item) => validate(item).isLeft)
)

// Efficient validation - stops at first failure
const allValid = F.pipe(
  expensiveList,
  List.every((item) => validate(item).isRight)
)
```

### Pattern 4: Structural Sharing in Filters

```typescript
const original = List.make(1, 2, 3, 4, 5)

// Filter preserves tail structure when possible
const tail3 = F.pipe(original, List.filter((n) => n >= 3))
// tail3 shares structure with original's tail

// This is more memory-efficient than Array which copies
```

### Pattern 5: Combining filterMap with Refinements

```typescript
const extractNumbers = <A>(list: List<A>): List<number> =>
  F.pipe(
    list,
    List.filterMap((item) =>
      P.isNumber(item) ? Option.some(item) : Option.none()
    )
  )

// Or using partition for both types
const separateTypes = <A>(list: List<string | number>) =>
  F.pipe(
    list,
    List.partition(P.isNumber)
  )
```

---

## Integration with beep-effect

### Service Pattern with List Predicates

```typescript
import * as Effect from "effect/Effect"
import * as List from "effect/List"
import * as F from "effect/Function"

class ItemService extends Effect.Service<ItemService>()("ItemService", {
  effect: Effect.gen(function*() {
    return {
      findValid: (items: List<Item>) =>
        Effect.succeed(
          F.pipe(
            items,
            List.filter((item) => isValid(item))
          )
        ),

      partitionByStatus: (items: List<Item>) =>
        Effect.succeed(
          F.pipe(
            items,
            List.partition((item) => item.status === "active")
          )
        )
    }
  })
}) {}
```

### Error Handling with partitionMap

```typescript
import * as Schema from "effect/Schema"

class ValidationError extends Schema.TaggedError<ValidationError>()(
  "ValidationError",
  { message: Schema.String }
) {}

const validateItems = (items: List<unknown>) =>
  Effect.gen(function*() {
    const [invalid, valid] = F.pipe(
      items,
      List.partitionMap((item) =>
        Schema.decodeUnknownEither(ItemSchema)(item)
      )
    )

    if (List.isCons(invalid)) {
      return yield* new ValidationError({
        message: `Found ${List.size(invalid)} invalid items`
      })
    }

    return valid
  })
```

---

## References

### Source Files
- **Implementation**: `tmp/effect/packages/effect/src/List.ts`
- **Type Definitions**: `node_modules/effect/dist/dts/List.d.ts`

### Related Effect Modules
- `effect/Predicate` - Predicate types and combinators
- `effect/Option` - Used in search functions
- `effect/Either` - Used in partitionMap
- `effect/Array` - Alternative collection with different performance

### Key Sections in Source
- **Type Guards**: Lines 208-227
- **Universal/Existential Tests**: Lines 452-484
- **Filtering**: Lines 492-587
- **Search**: Lines 626-640
- **Partition**: Lines 778-821

---

## Summary

The `effect/List` module provides a comprehensive suite of predicate-based functions optimized for immutable linked list operations:

1. **Type Guards** (`isList`, `isNil`, `isCons`) - Enable type-safe operations
2. **Tests** (`every`, `some`) - Universal/existential quantification with type narrowing
3. **Filtering** (`filter`, `partition`) - Efficient with structural sharing
4. **Search** (`findFirst`) - Safe with `Option` return type
5. **Combined Operations** (`filterMap`, `partitionMap`, `compact`) - Single-pass efficiency

**Best for**: Stack-like operations, prepend-heavy workloads, structural sharing optimization.
**Not ideal for**: Random access, index-based operations, FIFO patterns.

Use `effect/Array` when you need random access; use `effect/List` when you need efficient prepending and LIFO access.
