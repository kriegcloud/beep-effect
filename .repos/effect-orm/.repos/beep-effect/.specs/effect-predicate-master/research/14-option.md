# Effect Option Module - Predicate Research

## Overview

The `effect/Option` module provides comprehensive support for working with optional values in a type-safe, functional way. It extensively uses predicates and refinements throughout its API, offering powerful alternatives to traditional null checks and conditional logic.

**Key Philosophy**: Replace `null`/`undefined` checks and throw-based error handling with explicit `Option<A>` types that compose cleanly.

## Source Files

- **Primary Source**: `/tmp/effect/packages/effect/src/Option.ts`
- **Type Definitions**: `node_modules/effect/dist/dts/Option.d.ts`

---

## Type Guards

### isOption (Line 216)

**Type Signature**:
```typescript
export const isOption: (input: unknown) => input is Option<unknown>
```

**Description**: Checks if an unknown value is an `Option` type (either `Some` or `None`).

**Example**:
```typescript
import * as O from "effect/Option"

console.log(O.isOption(O.some(1)))
// Output: true

console.log(O.isOption(O.none()))
// Output: true

console.log(O.isOption(1))
// Output: false
```

**Use Cases**:
- Type guard for validating Option instances
- Runtime type checking for Option values
- Safe downcasting from `unknown` to `Option<A>`

---

### isSome (Line 258)

**Type Signature**:
```typescript
export const isSome: <A>(self: Option<A>) => self is Some<A>
```

**Description**: Checks whether an `Option` contains a value (`Some`). Acts as a type guard that narrows `Option<A>` to `Some<A>`.

**Example**:
```typescript
import * as O from "effect/Option"

console.log(O.isSome(O.some(1)))
// Output: true

console.log(O.isSome(O.none()))
// Output: false

// Type narrowing in action
const opt = O.some(42)
if (O.isSome(opt)) {
  // TypeScript knows opt.value is available here
  console.log(opt.value) // 42
}
```

**Use Cases**:
- Replace `if (value !== null && value !== undefined)` checks
- Pattern matching on Option types
- Type narrowing for safe value extraction

---

### isNone (Line 237)

**Type Signature**:
```typescript
export const isNone: <A>(self: Option<A>) => self is None<A>
```

**Description**: Checks whether an `Option` represents the absence of a value (`None`). Acts as a type guard that narrows `Option<A>` to `None<A>`.

**Example**:
```typescript
import * as O from "effect/Option"

console.log(O.isNone(O.some(1)))
// Output: false

console.log(O.isNone(O.none()))
// Output: true
```

**Use Cases**:
- Replace `if (value === null || value === undefined)` checks
- Early returns for empty cases
- Inverse pattern matching

---

## Predicate-Based Constructors

### liftPredicate (Line 1805)

**Type Signature**:
```typescript
export const liftPredicate: {
  <A, B extends A>(refinement: Refinement<A, B>): (a: A) => Option<B>
  <B extends A, A = B>(predicate: Predicate<A>): (b: B) => Option<B>
  <A, B extends A>(self: A, refinement: Refinement<A, B>): Option<B>
  <B extends A, A = B>(self: B, predicate: Predicate<A>): Option<B>
}
```

**Description**: Lifts a `Predicate` or `Refinement` into the `Option` context. Returns `Some` if the predicate is satisfied, `None` otherwise.

**Example**:
```typescript
import * as O from "effect/Option"

// Check if a number is positive
const isPositive = (n: number) => n > 0

const parsePositive = O.liftPredicate(isPositive)

console.log(parsePositive(1))
// Output: { _id: 'Option', _tag: 'Some', value: 1 }

console.log(parsePositive(-1))
// Output: { _id: 'Option', _tag: 'None' }
```

**With Refinement**:
```typescript
import * as O from "effect/Option"
import * as P from "effect/Predicate"

const parseString = O.liftPredicate(P.isString)

console.log(parseString("hello"))
// Output: Some("hello")

console.log(parseString(42))
// Output: None
```

**Use Cases**:
- Replace `if (condition) return value else return null`
- Validation functions that may fail
- Converting predicates to Option-returning functions
- Type-safe parsing with refinements

---

### fromNullable (Line 684)

**Type Signature**:
```typescript
export const fromNullable = <A>(
  nullableValue: A
): Option<NonNullable<A>>
```

**Description**: Converts a nullable value (`null` or `undefined`) to an `Option`. Returns `Some` for non-null values, `None` for `null`/`undefined`.

**Example**:
```typescript
import * as O from "effect/Option"

console.log(O.fromNullable(1))
// Output: { _id: 'Option', _tag: 'Some', value: 1 }

console.log(O.fromNullable(null))
// Output: { _id: 'Option', _tag: 'None' }

console.log(O.fromNullable(undefined))
// Output: { _id: 'Option', _tag: 'None' }
```

**Real-World Example**:
```typescript
import * as O from "effect/Option"

// Interop with legacy code that returns null
function legacyFind(id: string): User | null {
  // ... legacy implementation
}

const findUser = (id: string) => O.fromNullable(legacyFind(id))

// Now returns Option<User>
```

**Use Cases**:
- Bridging nullable APIs to Option-based code
- Converting legacy code to Effect style
- Handling optional object properties
- Working with DOM APIs that return null

---

### liftNullable (Line 721)

**Type Signature**:
```typescript
export const liftNullable = <A extends ReadonlyArray<unknown>, B>(
  f: (...a: A) => B | null | undefined
): (...a: A) => Option<NonNullable<B>>
```

**Description**: Lifts a function that returns `null` or `undefined` into the `Option` context. The resulting function returns `Some` for non-null results, `None` for `null`/`undefined`.

**Example**:
```typescript
import * as O from "effect/Option"

const parse = (s: string): number | undefined => {
  const n = parseFloat(s)
  return isNaN(n) ? undefined : n
}

const parseOption = O.liftNullable(parse)

console.log(parseOption("1"))
// Output: { _id: 'Option', _tag: 'Some', value: 1 }

console.log(parseOption("not a number"))
// Output: { _id: 'Option', _tag: 'None' }
```

**Real-World Example**:
```typescript
import * as O from "effect/Option"

// Lifting Array.prototype.find
const findFirst = <A>(predicate: (a: A) => boolean) =>
  O.liftNullable((arr: A[]) => arr.find(predicate))

const findEven = findFirst((n: number) => n % 2 === 0)

console.log(findEven([1, 2, 3]))
// Output: Some(2)

console.log(findEven([1, 3, 5]))
// Output: None
```

**Use Cases**:
- Wrapping functions that may return null/undefined
- Converting callback-based APIs to Option-based
- Adapting external libraries to Effect style
- Type-safe wrappers for partial functions

---

### liftThrowable (Line 812)

**Type Signature**:
```typescript
export const liftThrowable = <A extends ReadonlyArray<unknown>, B>(
  f: (...a: A) => B
): (...a: A) => Option<B>
```

**Description**: Lifts a function that may throw into the `Option` context. Returns `Some` on success, `None` if an exception is thrown.

**Example**:
```typescript
import * as O from "effect/Option"

const parse = O.liftThrowable(JSON.parse)

console.log(parse("1"))
// Output: { _id: 'Option', _tag: 'Some', value: 1 }

console.log(parse(""))
// Output: { _id: 'Option', _tag: 'None' }
```

**Real-World Example**:
```typescript
import * as O from "effect/Option"

const parseJSON = O.liftThrowable(JSON.parse)
const atob = O.liftThrowable(globalThis.atob)

// Safe base64 decoding
const decodeBase64 = (encoded: string) => atob(encoded)

console.log(decodeBase64("SGVsbG8="))
// Output: Some("Hello")

console.log(decodeBase64("invalid!!!"))
// Output: None
```

**Use Cases**:
- Wrapping functions that throw exceptions
- Converting try/catch patterns to Option
- Safe parsing operations (JSON, numbers, dates)
- Error-prone DOM operations

---

### fromIterable (Line 390)

**Type Signature**:
```typescript
export const fromIterable = <A>(collection: Iterable<A>): Option<A>
```

**Description**: Converts an `Iterable` into an `Option`, wrapping the first element if it exists. Returns `None` for empty iterables.

**Example**:
```typescript
import * as O from "effect/Option"

console.log(O.fromIterable([1, 2, 3]))
// Output: { _id: 'Option', _tag: 'Some', value: 1 }

console.log(O.fromIterable([]))
// Output: { _id: 'Option', _tag: 'None' }
```

**Use Cases**:
- Getting first element safely
- Converting iterables to optional values
- Working with generators

---

### toRefinement (Line 356)

**Type Signature**:
```typescript
export const toRefinement = <A, B extends A>(
  f: (a: A) => Option<B>
): (a: A) => a is B
```

**Description**: Converts an Option-returning function into a type guard refinement. The resulting function returns `true` if the input produces `Some`, `false` for `None`.

**Example**:
```typescript
import * as O from "effect/Option"
import * as P from "effect/Predicate"

const parseString = (u: unknown) =>
  P.isString(u) ? O.some(u) : O.none()

const isString = O.toRefinement(parseString)

const value: unknown = "hello"

if (isString(value)) {
  // TypeScript knows value is string here
  console.log(value.toUpperCase()) // "HELLO"
}
```

**Use Cases**:
- Converting Option validators to type guards
- Creating reusable refinement functions
- Type narrowing in conditional logic

---

## Filtering and Testing Functions

### filter (Line 1638)

**Type Signature**:
```typescript
export const filter: {
  <A, B extends A>(refinement: Refinement<NoInfer<A>, B>): (self: Option<A>) => Option<B>
  <A>(predicate: Predicate<NoInfer<A>>): (self: Option<A>) => Option<A>
  <A, B extends A>(self: Option<A>, refinement: Refinement<A, B>): Option<B>
  <A>(self: Option<A>, predicate: Predicate<A>): Option<A>
}
```

**Description**: Filters an `Option` using a predicate. Returns `None` if the predicate fails or the input is `None`, otherwise returns the original `Some`.

**Example**:
```typescript
import * as O from "effect/Option"
import * as F from "effect/Function"

const removeEmptyString = (input: O.Option<string>) =>
  F.pipe(input, O.filter((value) => value !== ""))

console.log(removeEmptyString(O.none()))
// Output: { _id: 'Option', _tag: 'None' }

console.log(removeEmptyString(O.some("")))
// Output: { _id: 'Option', _tag: 'None' }

console.log(removeEmptyString(O.some("a")))
// Output: { _id: 'Option', _tag: 'Some', value: 'a' }
```

**With Refinement**:
```typescript
import * as O from "effect/Option"
import * as P from "effect/Predicate"
import * as F from "effect/Function"

const value: O.Option<string | number> = O.some("hello")

const stringOnly = F.pipe(value, O.filter(P.isString))
// Type: Option<string>
```

**Use Cases**:
- Conditional validation of Option values
- Type narrowing with refinements
- Chaining validation rules
- Replacing nested if checks

---

### exists (Line 1929)

**Type Signature**:
```typescript
export const exists: {
  <A, B extends A>(refinement: Refinement<NoInfer<A>, B>): (self: Option<A>) => self is Option<B>
  <A>(predicate: Predicate<NoInfer<A>>): (self: Option<A>) => boolean
  <A, B extends A>(self: Option<A>, refinement: Refinement<A, B>): self is Option<B>
  <A>(self: Option<A>, predicate: Predicate<A>): boolean
}
```

**Description**: Checks if a value inside an `Option` satisfies a given predicate or refinement. Returns `false` for `None`, otherwise applies the predicate to the contained value.

**Example**:
```typescript
import * as O from "effect/Option"
import * as F from "effect/Function"

const isEven = (n: number) => n % 2 === 0

console.log(F.pipe(O.some(2), O.exists(isEven)))
// Output: true

console.log(F.pipe(O.some(1), O.exists(isEven)))
// Output: false

console.log(F.pipe(O.none(), O.exists(isEven)))
// Output: false
```

**As Type Guard**:
```typescript
import * as O from "effect/Option"
import * as P from "effect/Predicate"
import * as F from "effect/Function"

const opt: O.Option<string | number> = O.some("hello")

if (F.pipe(opt, O.exists(P.isString))) {
  // TypeScript knows opt is Option<string>
  console.log(F.pipe(opt, O.map((s) => s.toUpperCase())))
}
```

**Use Cases**:
- Testing if an Option contains a value matching a condition
- Type narrowing with refinements
- Validation without extracting the value
- Boolean checks on optional values

---

### contains (Line 1892)

**Type Signature**:
```typescript
export const contains: {
  <A>(a: A): (self: Option<A>) => boolean
  <A>(self: Option<A>, a: A): boolean
}
```

**Description**: Checks if an `Option` contains a specific value using default `Equivalence`. Returns `true` if the Option is `Some` and contains the equivalent value.

**Example**:
```typescript
import * as O from "effect/Option"
import * as F from "effect/Function"

console.log(F.pipe(O.some(2), O.contains(2)))
// Output: true

console.log(F.pipe(O.some(1), O.contains(2)))
// Output: false

console.log(F.pipe(O.none(), O.contains(2)))
// Output: false
```

**Use Cases**:
- Checking for specific values in Options
- Equality testing with optional values
- Replacing `opt?.value === target` checks

---

### containsWith (Line 1854)

**Type Signature**:
```typescript
export const containsWith = <A>(isEquivalent: (self: A, that: A) => boolean): {
  (a: A): (self: Option<A>) => boolean
  (self: Option<A>, a: A): boolean
}
```

**Description**: Returns a function that checks if an `Option` contains a specified value, using a custom equivalence function.

**Example**:
```typescript
import * as O from "effect/Option"
import * as Num from "effect/Number"
import * as F from "effect/Function"

const contains = O.containsWith(Num.Equivalence)

console.log(F.pipe(O.some(2), contains(2)))
// Output: true

console.log(F.pipe(O.some(1), contains(2)))
// Output: false

console.log(F.pipe(O.none(), contains(2)))
// Output: false
```

**Custom Equivalence**:
```typescript
import * as O from "effect/Option"
import * as F from "effect/Function"

interface User {
  id: number
  name: string
}

const userEquiv = (a: User, b: User) => a.id === b.id

const containsUser = O.containsWith(userEquiv)

const user1 = { id: 1, name: "Alice" }
const user2 = { id: 1, name: "Alice Updated" }

console.log(F.pipe(O.some(user1), containsUser(user2)))
// Output: true (same ID)
```

**Use Cases**:
- Custom equality checks on complex types
- Structural equality testing
- Domain-specific equivalence

---

## Transformation Functions Using Predicates

### filterMap (Line 1608)

**Type Signature**:
```typescript
export const filterMap: {
  <A, B>(f: (a: A) => Option<B>): (self: Option<A>) => Option<B>
  <A, B>(self: Option<A>, f: (a: A) => Option<B>): Option<B>
}
```

**Description**: Alias of `flatMap`. Transforms and filters an Option in one operation. If the input is `None` or the function returns `None`, the result is `None`.

**Example**:
```typescript
import * as O from "effect/Option"
import * as F from "effect/Function"

const transformEven = (n: O.Option<number>): O.Option<string> =>
  F.pipe(
    n,
    O.filterMap((n) => (n % 2 === 0 ? O.some(`Even: ${n}`) : O.none()))
  )

console.log(transformEven(O.none()))
// Output: { _id: 'Option', _tag: 'None' }

console.log(transformEven(O.some(1)))
// Output: { _id: 'Option', _tag: 'None' }

console.log(transformEven(O.some(2)))
// Output: { _id: 'Option', _tag: 'Some', value: 'Even: 2' }
```

**Use Cases**:
- Combining transformation and validation
- Parsing with validation
- Conditional transformations

---

### partitionMap (Line 1569)

**Type Signature**:
```typescript
export const partitionMap: {
  <A, B, C>(f: (a: A) => Either<C, B>): (self: Option<A>) => [left: Option<B>, right: Option<C>]
  <A, B, C>(self: Option<A>, f: (a: A) => Either<C, B>): [left: Option<B>, right: Option<C>]
}
```

**Description**: Maps an `Option` with a function that returns an `Either`, partitioning the result into two `Option`s. Returns `[None, None]` if input is `None`.

**Example**:
```typescript
import * as O from "effect/Option"
import * as E from "effect/Either"
import * as F from "effect/Function"

const partition = (n: number) =>
  n % 2 === 0 ? E.right(n) : E.left(n)

console.log(F.pipe(O.some(2), O.partitionMap(partition)))
// Output: [None, Some(2)]

console.log(F.pipe(O.some(1), O.partitionMap(partition)))
// Output: [Some(1), None]

console.log(F.pipe(O.none(), O.partitionMap(partition)))
// Output: [None, None]
```

**Use Cases**:
- Categorizing Option values
- Bifurcating computations
- Splitting validation results

---

## Pattern Matching

### match (Line 299)

**Type Signature**:
```typescript
export const match: {
  <B, A, C = B>(options: {
    readonly onNone: LazyArg<B>
    readonly onSome: (a: A) => C
  }): (self: Option<A>) => B | C
  <A, B, C = B>(self: Option<A>, options: {
    readonly onNone: LazyArg<B>
    readonly onSome: (a: A) => C
  }): B | C
}
```

**Description**: Pattern matches on an `Option` to handle both `Some` and `None` cases. Provides a functional alternative to `if`/`else` chains.

**Example**:
```typescript
import * as O from "effect/Option"

const foo = O.some(1)

const message = O.match(foo, {
  onNone: () => "Option is empty",
  onSome: (value) => `Option has a value: ${value}`
})

console.log(message)
// Output: "Option has a value: 1"
```

**With Pipe**:
```typescript
import * as O from "effect/Option"
import * as F from "effect/Function"

const result = F.pipe(
  O.some(42),
  O.match({
    onNone: () => "No value",
    onSome: (n) => `Value: ${n}`
  })
)
// Output: "Value: 42"
```

**Use Cases**:
- Exhaustive case handling
- Replacing if/else for Options
- Converting Options to other types
- Functional error handling

---

## Practical Patterns: Replacing Imperative Code

### Pattern 1: Replace Null Checks

**Before (Imperative)**:
```typescript
function findUser(id: string): User | null {
  // ... implementation
}

const user = findUser("123")
if (user !== null) {
  console.log(user.name)
} else {
  console.log("User not found")
}
```

**After (Effect Option)**:
```typescript
import * as O from "effect/Option"
import * as F from "effect/Function"

function findUser(id: string): O.Option<User> {
  // ... implementation
}

F.pipe(
  findUser("123"),
  O.match({
    onNone: () => console.log("User not found"),
    onSome: (user) => console.log(user.name)
  })
)
```

---

### Pattern 2: Replace Validation If Chains

**Before (Imperative)**:
```typescript
function validateAge(age: unknown): number | null {
  if (typeof age !== "number") return null
  if (age < 0) return null
  if (age > 120) return null
  return age
}
```

**After (Effect Option)**:
```typescript
import * as O from "effect/Option"
import * as P from "effect/Predicate"
import * as F from "effect/Function"

const isValidAge = (n: number) => n >= 0 && n <= 120

const validateAge = (age: unknown): O.Option<number> =>
  F.pipe(
    age,
    O.liftPredicate(P.isNumber),
    O.filter(isValidAge)
  )
```

---

### Pattern 3: Replace Try/Catch

**Before (Imperative)**:
```typescript
function parseJSON(json: string): object | null {
  try {
    return JSON.parse(json)
  } catch {
    return null
  }
}
```

**After (Effect Option)**:
```typescript
import * as O from "effect/Option"

const parseJSON = O.liftThrowable(JSON.parse)

// Usage
console.log(parseJSON('{"key": "value"}'))
// Output: Some({ key: "value" })

console.log(parseJSON("invalid json"))
// Output: None
```

---

### Pattern 4: Replace Array.find

**Before (Imperative)**:
```typescript
const numbers = [1, 2, 3, 4, 5]
const firstEven = numbers.find(n => n % 2 === 0)

if (firstEven !== undefined) {
  console.log(firstEven * 2)
}
```

**After (Effect Option)**:
```typescript
import * as A from "effect/Array"
import * as O from "effect/Option"
import * as F from "effect/Function"

const numbers = [1, 2, 3, 4, 5]

F.pipe(
  numbers,
  A.findFirst(n => n % 2 === 0),
  O.map(n => n * 2),
  O.match({
    onNone: () => console.log("No even number found"),
    onSome: (result) => console.log(result)
  })
)
```

---

### Pattern 5: Replace Optional Chaining

**Before (Imperative)**:
```typescript
interface Config {
  server?: {
    port?: number
  }
}

const config: Config = {}
const port = config.server?.port ?? 8080
```

**After (Effect Option)**:
```typescript
import * as O from "effect/Option"
import * as F from "effect/Function"

interface Config {
  server?: {
    port?: number
  }
}

const config: Config = {}

const port = F.pipe(
  O.fromNullable(config.server),
  O.flatMap(server => O.fromNullable(server.port)),
  O.getOrElse(() => 8080)
)
```

---

### Pattern 6: Replace Guard Clauses

**Before (Imperative)**:
```typescript
function processUser(user: User | null): string {
  if (!user) {
    return "No user"
  }

  if (!user.email) {
    return "No email"
  }

  if (user.age < 18) {
    return "Too young"
  }

  return `Welcome ${user.email}`
}
```

**After (Effect Option)**:
```typescript
import * as O from "effect/Option"
import * as F from "effect/Function"

function processUser(user: User | null): string {
  return F.pipe(
    O.fromNullable(user),
    O.flatMap(u => O.fromNullable(u.email)),
    O.filter((_email, idx, u) => u.age >= 18),
    O.match({
      onNone: () => "Invalid user",
      onSome: (email) => `Welcome ${email}`
    })
  )
}
```

---

## Composability Patterns

### Chaining Validations

```typescript
import * as O from "effect/Option"
import * as P from "effect/Predicate"
import * as F from "effect/Function"

const isPositive = (n: number) => n > 0
const isEven = (n: number) => n % 2 === 0
const lessThan100 = (n: number) => n < 100

const validateNumber = (input: unknown) =>
  F.pipe(
    input,
    O.liftPredicate(P.isNumber),
    O.filter(isPositive),
    O.filter(isEven),
    O.filter(lessThan100)
  )

console.log(validateNumber(42))
// Output: Some(42)

console.log(validateNumber(-2))
// Output: None

console.log(validateNumber(150))
// Output: None
```

---

### Combining Multiple Options

```typescript
import * as O from "effect/Option"
import * as F from "effect/Function"

const firstName = O.some("John")
const lastName = O.some("Doe")

const fullName = F.pipe(
  firstName,
  O.flatMap(first =>
    F.pipe(
      lastName,
      O.map(last => `${first} ${last}`)
    )
  )
)

console.log(fullName)
// Output: Some("John Doe")

// Or with zipWith
const fullName2 = O.zipWith(
  firstName,
  lastName,
  (first, last) => `${first} ${last}`
)
```

---

### Option Do Notation

```typescript
import * as O from "effect/Option"
import * as F from "effect/Function"

const result = F.pipe(
  O.Do,
  O.bind("x", () => O.some(2)),
  O.bind("y", () => O.some(3)),
  O.let("sum", ({ x, y }) => x + y),
  O.filter(({ x, y }) => x * y > 5)
)

console.log(result)
// Output: Some({ x: 2, y: 3, sum: 5 })
```

---

## Complete Function Reference

### Type Guards
| Function | Line | Description |
|----------|------|-------------|
| `isOption` | 216 | Check if value is an Option |
| `isSome` | 258 | Check if Option contains a value |
| `isNone` | 237 | Check if Option is empty |

### Constructors from Predicates
| Function | Line | Description |
|----------|------|-------------|
| `liftPredicate` | 1805 | Lift predicate/refinement to Option |
| `fromNullable` | 684 | Convert nullable to Option |
| `liftNullable` | 721 | Lift nullable-returning function |
| `liftThrowable` | 812 | Lift throwing function to Option |
| `fromIterable` | 390 | Get first element of iterable as Option |
| `toRefinement` | 356 | Convert Option function to type guard |

### Filtering and Testing
| Function | Line | Description |
|----------|------|-------------|
| `filter` | 1638 | Filter Option with predicate |
| `exists` | 1929 | Test if Option value satisfies predicate |
| `contains` | 1892 | Check if Option contains specific value |
| `containsWith` | 1854 | Check containment with custom equivalence |

### Transformations
| Function | Line | Description |
|----------|------|-------------|
| `filterMap` | 1608 | Transform and filter (alias of flatMap) |
| `partitionMap` | 1569 | Partition with Either-returning function |

### Pattern Matching
| Function | Line | Description |
|----------|------|-------------|
| `match` | 299 | Exhaustive pattern matching on Option |

---

## Key Takeaways

1. **No Null Checks**: Use `fromNullable`, `liftNullable` to convert nullable code to Options
2. **No Try/Catch**: Use `liftThrowable` for safe exception handling
3. **No If Chains**: Use `filter`, `exists`, `match` for conditional logic
4. **Type Safety**: Refinements provide compile-time guarantees
5. **Composability**: Chain operations with `pipe` for readable transformations
6. **Explicit Absence**: `Option` makes the possibility of absence explicit in types

---

## Integration with Other Effect Modules

### With Predicate Module
```typescript
import * as O from "effect/Option"
import * as P from "effect/Predicate"
import * as F from "effect/Function"

const validateString = (input: unknown) =>
  F.pipe(input, O.liftPredicate(P.isString))

const validateNumber = (input: unknown) =>
  F.pipe(input, O.liftPredicate(P.isNumber))
```

### With Array Module
```typescript
import * as O from "effect/Option"
import * as A from "effect/Array"
import * as F from "effect/Function"

const numbers = [1, 2, 3, 4, 5]

const firstEven = F.pipe(
  numbers,
  A.findFirst(n => n % 2 === 0)
)
// Returns Option<number>
```

### With Effect Type
```typescript
import * as Effect from "effect/Effect"
import * as O from "effect/Option"

const validateAge = (age: number) =>
  F.pipe(
    age,
    O.liftPredicate(n => n >= 0 && n <= 120),
    O.match({
      onNone: () => Effect.fail(new InvalidAgeError()),
      onSome: (validAge) => Effect.succeed(validAge)
    })
  )
```

---

## Summary

The `effect/Option` module provides a comprehensive toolkit for replacing imperative null checks, try/catch blocks, and conditional logic with composable, type-safe functional patterns. By leveraging predicates and refinements throughout its API, Option enables:

- **Type-safe** handling of optional values
- **Composable** validation chains
- **Explicit** representation of absence
- **Functional** alternatives to imperative patterns

Every Option function that works with predicates maintains full type safety, supports both predicates and refinements, and composes cleanly with other Effect modules.
