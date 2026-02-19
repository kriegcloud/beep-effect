# Effect Predicate Module - Comprehensive Research

**Research Date**: 2025-12-28
**Source Files**:
- `tmp/effect/packages/effect/src/Predicate.ts`
- `node_modules/effect/dist/dts/Predicate.d.ts`

**Module Purpose**: Provides a comprehensive collection of type-safe predicates and refinements for replacing imperative conditionals, type guards, and null checks with functional, composable patterns that enable TypeScript type narrowing.

---

## Core Concepts

### Predicate vs Refinement

```typescript
// Predicate<A> - returns boolean, no type narrowing
interface Predicate<in A> {
  (a: A): boolean
}

// Refinement<A, B> - returns type guard, enables type narrowing
interface Refinement<in A, out B extends A> {
  (a: A): a is B
}
```

**Key Difference**:
- `Predicate` tests conditions but doesn't narrow types
- `Refinement` is a type guard that narrows `A` to more specific `B`

---

## Function Catalog

### 1. Type Guards (Refinements)

These replace `typeof`, `instanceof`, and manual type checks with type-safe refinements.

#### Primitive Type Guards

| Function | Line | Type Signature | Replaces |
|----------|------|----------------|----------|
| `isString` | 334 | `(input: unknown): input is string` | `typeof x === "string"` |
| `isNumber` | 355 | `(input: unknown): input is number` | `typeof x === "number"` |
| `isBoolean` | 375 | `(input: unknown): input is boolean` | `typeof x === "boolean"` |
| `isBigInt` | 394 | `(input: unknown): input is bigint` | `typeof x === "bigint"` |
| `isSymbol` | 412 | `(input: unknown): input is symbol` | `typeof x === "symbol"` |
| `isFunction` | 438 | `(input: unknown): input is Function` | `typeof x === "function"` |

**Before (Imperative)**:
```typescript
const value: unknown = "hello"

if (typeof value === "string") {
  console.log(value.toUpperCase()) // TypeScript narrows to string
}
```

**After (Effect Predicate)**:
```typescript
import * as P from "effect/Predicate"

const value: unknown = "hello"

if (P.isString(value)) {
  console.log(value.toUpperCase()) // TypeScript narrows to string
}
```

**Why Better**:
- Consistent API across all type checks
- Composable with predicate combinators
- Works with `Match.when()` for pattern matching
- No magic strings like `"string"`, `"number"`

#### Object Type Guards

| Function | Line | Type Signature | Replaces |
|----------|------|----------------|----------|
| `isObject` | 580 | `(input: unknown): input is object` | Manual object check |
| `isRecord` | 796 | `(input: unknown): input is { [x: string \| symbol]: unknown }` | Plain object check |
| `isReadonlyRecord` | 820 | Same as `isRecord` | Plain object check |
| `isSet` | 295 | `(input: unknown): input is Set<unknown>` | `x instanceof Set` |
| `isMap` | 314 | `(input: unknown): input is Map<unknown, unknown>` | `x instanceof Map` |
| `isError` | 711 | `(input: unknown): input is Error` | `x instanceof Error` |
| `isDate` | 749 | `(input: unknown): input is Date` | `x instanceof Date` |
| `isRegExp` | 889 | `(input: unknown): input is RegExp` | `x instanceof RegExp` |
| `isUint8Array` | 730 | `(input: unknown): input is Uint8Array` | `x instanceof Uint8Array` |
| `isIterable` | 771 | `(input: unknown): input is Iterable<unknown>` | Manual iterable check |
| `isPromise` | 844 | `(input: unknown): input is Promise<unknown>` | Duck-type Promise check |
| `isPromiseLike` | 868 | `(input: unknown): input is PromiseLike<unknown>` | Duck-type PromiseLike check |

**Before (Imperative)**:
```typescript
const value: unknown = new Map()

if (value instanceof Map) {
  console.log(value.size)
}

// Record check - messy!
if (typeof obj === "object" && obj !== null && !Array.isArray(obj)) {
  // It's a plain object
}
```

**After (Effect Predicate)**:
```typescript
import * as P from "effect/Predicate"

const value: unknown = new Map()

if (P.isMap(value)) {
  console.log(value.size) // Narrowed to Map<unknown, unknown>
}

// Record check - clean!
if (P.isRecord(obj)) {
  // obj is { [x: string | symbol]: unknown }
}
```

**Key Distinction - `isObject` vs `isRecord`**:
```typescript
P.isObject([])           // true  (arrays are objects)
P.isObject(() => {})     // true  (functions are objects)
P.isObject({})           // true

P.isRecord([])           // false (excludes arrays)
P.isRecord(() => {})     // false (excludes functions)
P.isRecord({})           // true  (plain objects only)
```

#### Null/Undefined Guards

| Function | Line | Type Signature | Use Case |
|----------|------|----------------|----------|
| `isNull` | 495 | `(input: unknown): input is null` | Check for `null` |
| `isNotNull` | 514 | `<A>(input: A): input is Exclude<A, null>` | Filter out `null` |
| `isUndefined` | 457 | `(input: unknown): input is undefined` | Check for `undefined` |
| `isNotUndefined` | 476 | `<A>(input: A): input is Exclude<A, undefined>` | Filter out `undefined` |
| `isNullable` | 669 | `<A>(input: A): input is Extract<A, null \| undefined>` | Check for `null` OR `undefined` |
| `isNotNullable` | 691 | `<A>(input: A): input is NonNullable<A>` | Filter out both `null` and `undefined` |

**Before (Imperative)**:
```typescript
const value: string | null | undefined = getValue()

if (value !== null && value !== undefined) {
  console.log(value.toUpperCase()) // Narrowed to string
}

// Or with nullish coalescing
if (value != null) {
  console.log(value.toUpperCase())
}
```

**After (Effect Predicate)**:
```typescript
import * as P from "effect/Predicate"

const value: string | null | undefined = getValue()

if (P.isNotNullable(value)) {
  console.log(value.toUpperCase()) // Narrowed to string
}
```

**With Array Filtering**:
```typescript
import * as A from "effect/Array"
import * as F from "effect/Function"
import * as P from "effect/Predicate"

const items: (string | null | undefined)[] = ["a", null, "b", undefined, "c"]

// ❌ FORBIDDEN (native array methods)
const filtered = items.filter(x => x != null)

// ✅ REQUIRED (Effect Array + Predicate)
const filtered = F.pipe(items, A.filter(P.isNotNullable))
// Type: string[] (null and undefined removed!)
```

#### Special Guards

| Function | Line | Type Signature | Use Case |
|----------|------|----------------|----------|
| `isTruthy` | 275 | `(input: unknown) => boolean` | Check for JavaScript truthiness |
| `isNever` | 532 | `(input: unknown): input is never` | Always returns `false`, narrows to `never` |
| `isUnknown` | 550 | `(input: unknown): input is unknown` | Always returns `true`, identity refinement |

**`isTruthy` - JavaScript Truthiness**:
```typescript
import * as P from "effect/Predicate"

P.isTruthy(1)         // true
P.isTruthy("hello")   // true
P.isTruthy({})        // true
P.isTruthy([])        // true

P.isTruthy(0)         // false
P.isTruthy("")        // false
P.isTruthy(null)      // false
P.isTruthy(undefined) // false
P.isTruthy(false)     // false
P.isTruthy(NaN)       // false
```

**Note**: `isTruthy` is NOT a refinement - it doesn't narrow types. Use `isNotNullable` for type narrowing.

#### Property & Tag Guards

| Function | Line | Type Signature | Use Case |
|----------|------|----------------|----------|
| `hasProperty` | 604 | `<P extends PropertyKey>(self: unknown, property: P): self is { [K in P]: unknown }` | Replace `"prop" in obj` checks |
| `isTagged` | 642 | `<K extends string>(self: unknown, tag: K): self is { _tag: K }` | Discriminated union type guards |

**`hasProperty` - Safe Property Access**:

**Before (Imperative)**:
```typescript
const value: unknown = { name: "Alice", age: 30 }

if (value && typeof value === "object" && "name" in value) {
  // TypeScript doesn't narrow properly here!
  console.log((value as any).name)
}
```

**After (Effect Predicate)**:
```typescript
import * as P from "effect/Predicate"

const value: unknown = { name: "Alice", age: 30 }

if (P.hasProperty(value, "name")) {
  // value is narrowed to { name: unknown }
  console.log(value.name) // Type-safe access!
}
```

**`isTagged` - Discriminated Unions**:

**Before (Imperative with switch)**:
```typescript
type Shape =
  | { _tag: "circle"; radius: number }
  | { _tag: "square"; side: number }
  | { _tag: "rectangle"; width: number; height: number }

function area(shape: Shape): number {
  switch (shape._tag) {
    case "circle":
      return Math.PI * shape.radius ** 2
    case "square":
      return shape.side ** 2
    case "rectangle":
      return shape.width * shape.height
    default:
      return 0 // Not type-safe!
  }
}
```

**After (Effect Predicate + Match)**:
```typescript
import * as Match from "effect/Match"
import * as P from "effect/Predicate"

type Shape =
  | { _tag: "circle"; radius: number }
  | { _tag: "square"; side: number }
  | { _tag: "rectangle"; width: number; height: number }

const area = (shape: Shape): number =>
  Match.value(shape).pipe(
    Match.when(P.isTagged("circle"), (s) => Math.PI * s.radius ** 2),
    Match.when(P.isTagged("square"), (s) => s.side ** 2),
    Match.when(P.isTagged("rectangle"), (s) => s.width * s.height),
    Match.exhaustive // Compile error if cases missing!
  )

// Or use Match.tag for cleaner syntax
const areaClean = (shape: Shape): number =>
  Match.value(shape).pipe(
    Match.tag("circle", (s) => Math.PI * s.radius ** 2),
    Match.tag("square", (s) => s.side ** 2),
    Match.tag("rectangle", (s) => s.width * s.height),
    Match.exhaustive
  )
```

**Dynamic Tag Checking**:
```typescript
const shape: unknown = { _tag: "circle", radius: 10 }

if (P.isTagged(shape, "circle")) {
  // shape is narrowed to { _tag: "circle" }
  // But you still need to validate other properties!
}
```

#### Tuple Guards

| Function | Line | Type Signature | Use Case |
|----------|------|----------------|----------|
| `isTupleOf` | 217 | `<N extends number>(self: ReadonlyArray<T>, n: N): self is TupleOf<N, T>` | Check exact tuple length |
| `isTupleOfAtLeast` | 248 | `<N extends number>(self: ReadonlyArray<T>, n: N): self is TupleOfAtLeast<N, T>` | Check minimum tuple length |

**`isTupleOf` - Exact Length**:
```typescript
import * as P from "effect/Predicate"

const arr: number[] = [1, 2, 3]

if (P.isTupleOf(arr, 3)) {
  // arr is narrowed to [number, number, number]
  const [a, b, c] = arr // All three guaranteed to exist
  console.log(a, b, c)
}

P.isTupleOf([1, 2, 3], 3)    // true
P.isTupleOf([1, 2], 3)       // false
P.isTupleOf([1, 2, 3, 4], 3) // false
```

**`isTupleOfAtLeast` - Minimum Length**:
```typescript
import * as P from "effect/Predicate"

const arr: number[] = [1, 2, 3, 4]

if (P.isTupleOfAtLeast(arr, 3)) {
  // arr is narrowed to [number, number, number, ...number[]]
  const [a, b, c, ...rest] = arr // First three guaranteed, rest may be empty
  console.log(a, b, c, rest)
}

P.isTupleOfAtLeast([1, 2, 3], 3)    // true
P.isTupleOfAtLeast([1, 2, 3, 4], 3) // true
P.isTupleOfAtLeast([1, 2], 3)       // false
```

---

### 2. Predicate Combinators

These allow composing predicates with boolean logic.

#### Binary Combinators

| Function | Line | Type Signature | Logic | Replaces |
|----------|------|----------------|-------|----------|
| `and` | 1177 | `<A>(self: Predicate<A>, that: Predicate<A>): Predicate<A>` | `self && that` | `if (a && b)` |
| `or` | 1136 | `<A>(self: Predicate<A>, that: Predicate<A>): Predicate<A>` | `self \|\| that` | `if (a \|\| b)` |
| `not` | 1103 | `<A>(self: Predicate<A>): Predicate<A>` | `!self` | `if (!a)` |
| `xor` | 1207 | `<A>(self: Predicate<A>, that: Predicate<A>): Predicate<A>` | `self !== that` | Exclusive OR |
| `eqv` | 1235 | `<A>(self: Predicate<A>, that: Predicate<A>): Predicate<A>` | `self === that` | Equivalence |
| `nand` | 1331 | `<A>(self: Predicate<A>, that: Predicate<A>): Predicate<A>` | `!(self && that)` | NOT AND |
| `nor` | 1315 | `<A>(self: Predicate<A>, that: Predicate<A>): Predicate<A>` | `!(self \|\| that)` | NOT OR |
| `implies` | 1299 | `<A>(antecedent: Predicate<A>, consequent: Predicate<A>): Predicate<A>` | `!ante \|\| cons` | If-then logic |

**`and` - Logical AND**:

**Before (Imperative)**:
```typescript
const isValid = (n: number): boolean => {
  return n > 0 && n < 100 && n % 2 === 0
}
```

**After (Effect Predicate)**:
```typescript
import * as P from "effect/Predicate"
import * as Num from "effect/Number"
import * as F from "effect/Function"

const isPositive = Num.greaterThan(0)
const lessThan100 = Num.lessThan(100)
const isEven = (n: number) => n % 2 === 0

const isValid = F.pipe(
  isPositive,
  P.and(lessThan100),
  P.and(isEven)
)

// Or in data-last style
const isValid2 = P.and(P.and(isPositive, lessThan100), isEven)
```

**Type Narrowing with Refinements**:
```typescript
import * as P from "effect/Predicate"

type Person = { name: string }
type Employee = { id: number }

const hasName = (u: unknown): u is Person =>
  P.hasProperty(u, "name") && P.isString((u as any).name)

const hasId = (u: unknown): u is Employee =>
  P.hasProperty(u, "id") && P.isNumber((u as any).id)

const isPersonAndEmployee = P.and(hasName, hasId)

const val: unknown = { name: "Alice", id: 123 }
if (isPersonAndEmployee(val)) {
  // val is narrowed to Person & Employee
  console.log(val.name, val.id)
}
```

**`or` - Logical OR**:

**Before (Imperative)**:
```typescript
if (typeof value === "string" || typeof value === "number") {
  console.log(value)
}
```

**After (Effect Predicate)**:
```typescript
import * as P from "effect/Predicate"

const isStringOrNumber = P.or(P.isString, P.isNumber)

if (isStringOrNumber(value)) {
  // value is narrowed to string | number
  console.log(value)
}
```

**`not` - Logical NOT**:

**Before (Imperative)**:
```typescript
const isNonPositive = (n: number): boolean => !(n > 0)
```

**After (Effect Predicate)**:
```typescript
import * as P from "effect/Predicate"
import * as Num from "effect/Number"

const isNonPositive = P.not(Num.greaterThan(0))
```

**Warning**: `not` returns a `Predicate`, not a `Refinement`, because TypeScript cannot infer the negative type.

**`xor` - Exclusive OR**:
```typescript
import * as P from "effect/Predicate"

const isPositive = (n: number) => n > 0
const isEven = (n: number) => n % 2 === 0

const isPositiveXorEven = P.xor(isPositive, isEven)

isPositiveXorEven(4)   // false (both true)
isPositiveXorEven(3)   // true  (only positive)
isPositiveXorEven(-2)  // true  (only even)
isPositiveXorEven(-1)  // false (both false)
```

**`implies` - If-Then Logic**:

Think of it as: "If `antecedent` is true, then `consequent` must also be true."

```typescript
import * as P from "effect/Predicate"

type User = {
  isStaff: boolean
  isAdmin: boolean
}

// Rule: Admins must be staff
const isValidPermission = P.implies(
  (user: User) => user.isAdmin,  // antecedent: "if admin..."
  (user: User) => user.isStaff   // consequent: "then staff"
)

isValidPermission({ isStaff: false, isAdmin: false }) // true  (rule doesn't apply)
isValidPermission({ isStaff: true, isAdmin: false })  // true  (rule doesn't apply)
isValidPermission({ isStaff: true, isAdmin: true })   // true  (rule followed)
isValidPermission({ isStaff: false, isAdmin: true })  // false (rule broken!)
```

**Truth Table**:
```
antecedent | consequent | implies(ante, cons)
-----------|------------|--------------------
false      | false      | true  (vacuous truth)
false      | true       | true  (vacuous truth)
true       | false      | false (broken promise!)
true       | true       | true  (promise kept)
```

#### Collection Combinators

| Function | Line | Type Signature | Use Case |
|----------|------|----------------|----------|
| `every` | 1364 | `<A>(collection: Iterable<Predicate<A>>): Predicate<A>` | All predicates must pass |
| `some` | 1398 | `<A>(collection: Iterable<Predicate<A>>): Predicate<A>` | At least one predicate must pass |
| `all` | 953 | `<A>(collection: Iterable<Predicate<A>>): Predicate<ReadonlyArray<A>>` | Test array of values |

**`every` - All Must Pass**:

**Before (Imperative)**:
```typescript
const checks = [
  (n: number) => n > 0,
  (n: number) => n < 100,
  (n: number) => n % 2 === 0
]

const isValid = (n: number): boolean => {
  for (const check of checks) {
    if (!check(n)) return false
  }
  return true
}
```

**After (Effect Predicate)**:
```typescript
import * as P from "effect/Predicate"

const checks = [
  (n: number) => n > 0,
  (n: number) => n < 100,
  (n: number) => n % 2 === 0
]

const isValid = P.every(checks)

isValid(50)  // true
isValid(3)   // false (not even)
isValid(-2)  // false (not positive)
```

**`some` - At Least One Must Pass**:
```typescript
import * as P from "effect/Predicate"

const checks = [
  (n: number) => n < 0,
  (n: number) => n % 2 !== 0
]

const isNegativeOrOdd = P.some(checks)

isNegativeOrOdd(-2)  // true (negative)
isNegativeOrOdd(3)   // true (odd)
isNegativeOrOdd(4)   // false (neither)
```

---

### 3. Structural Combinators

These build predicates for complex data structures.

| Function | Line | Type Signature | Use Case |
|----------|------|----------------|----------|
| `tuple` | 1018 | `<T extends ReadonlyArray<Predicate.Any>>(...elements: T)` | Test tuple of values |
| `struct` | 1061 | `<R extends Record<string, Predicate.Any>>(fields: R)` | Test object structure |
| `product` | 939 | `<A, B>(self: Predicate<A>, that: Predicate<B>): Predicate<readonly [A, B]>` | Test pair |
| `productMany` | 978 | `<A>(self: Predicate<A>, collection: Iterable<Predicate<A>>)` | Test head + tail |

**`tuple` - Tuple Validation with Type Narrowing**:

**Before (Imperative)**:
```typescript
const value: [unknown, unknown] = ["hello", 123]

if (typeof value[0] === "string" && typeof value[1] === "number") {
  const [s, n] = value
  // TypeScript doesn't narrow the tuple properly
  console.log((s as string).toUpperCase(), (n as number).toFixed(2))
}
```

**After (Effect Predicate)**:
```typescript
import * as P from "effect/Predicate"

const isStringNumberTuple = P.tuple(P.isString, P.isNumber)

const value: [unknown, unknown] = ["hello", 123]
if (isStringNumberTuple(value)) {
  // value is narrowed to [string, number]
  const [s, n] = value
  console.log(s.toUpperCase(), n.toFixed(2)) // Type-safe!
}
```

**Complex Tuple Example**:
```typescript
import * as P from "effect/Predicate"

const isValidEntry = P.tuple(
  P.isString,                    // name
  P.isNumber,                    // age
  P.or(P.isString, P.isNull)     // email (string | null)
)

const entry: [unknown, unknown, unknown] = ["Alice", 30, "alice@example.com"]

if (isValidEntry(entry)) {
  // entry is narrowed to [string, number, string | null]
  const [name, age, email] = entry
  console.log(name.toUpperCase(), age.toFixed(0), email?.toLowerCase())
}
```

**`struct` - Object Structure Validation**:

**Before (Imperative)**:
```typescript
const value: { name: unknown; age: unknown } = { name: "Alice", age: 30 }

if (
  typeof value.name === "string" &&
  typeof value.age === "number"
) {
  console.log(value.name.toUpperCase(), value.age.toFixed(0))
}
```

**After (Effect Predicate)**:
```typescript
import * as P from "effect/Predicate"

const personPredicate = P.struct({
  name: P.isString,
  age: P.isNumber
})

const value: { name: unknown; age: unknown } = { name: "Alice", age: 30 }

if (personPredicate(value)) {
  // value is narrowed to { name: string; age: number }
  console.log(value.name.toUpperCase(), value.age.toFixed(0))
}
```

**Nested Structures**:
```typescript
import * as P from "effect/Predicate"

const isAddress = P.struct({
  street: P.isString,
  city: P.isString,
  zip: P.isNumber
})

const isPerson = P.struct({
  name: P.isString,
  age: P.isNumber,
  address: isAddress  // Nested predicate!
})

const data: unknown = {
  name: "Alice",
  age: 30,
  address: {
    street: "123 Main St",
    city: "Springfield",
    zip: 12345
  }
}

if (isPerson(data)) {
  // data is narrowed to full person type
  console.log(data.address.street, data.address.zip)
}
```

**Optional Fields**:
```typescript
import * as P from "effect/Predicate"

const isPersonWithOptionalEmail = P.struct({
  name: P.isString,
  age: P.isNumber,
  email: P.or(P.isString, P.isUndefined)  // Optional
})
```

---

### 4. Composition Utilities

| Function | Line | Type Signature | Use Case |
|----------|------|----------------|----------|
| `compose` | 921 | `<A, B extends A, C extends B, D extends C>(ab: Refinement<A, B>, bc: Refinement<C, D>): Refinement<A, D>` | Chain refinements |
| `mapInput` | 187 | `<A, B>(self: Predicate<A>, f: (b: B) => A): Predicate<B>` | Transform input before testing |

**`compose` - Chain Refinements**:

**Before (Imperative)**:
```typescript
const value: unknown = "hello"

if (typeof value === "string" && value.length >= 3) {
  console.log(value.toUpperCase())
}
```

**After (Effect Predicate)**:
```typescript
import * as P from "effect/Predicate"

const minLength = (n: number) => (s: string): boolean => s.length >= n

const isLongString = P.compose(P.isString, minLength(3))

const value: unknown = "hello"
if (isLongString(value)) {
  // value is narrowed to string
  console.log(value.toUpperCase())
}
```

**Chaining Multiple Refinements**:
```typescript
import * as P from "effect/Predicate"

const isNonEmptyString = (s: string): s is string => s.length > 0
const isUpperCase = (s: string): s is string => s === s.toUpperCase()

const isNonEmptyUpperCase = P.compose(
  P.compose(P.isString, isNonEmptyString),
  isUpperCase
)
```

**`mapInput` - Pre-process Input (Contramap)**:

**Before (Imperative)**:
```typescript
const hasPositiveLength = (s: string): boolean => s.length > 0

const value = "hello"
if (value.length > 0) {
  console.log("Has positive length")
}
```

**After (Effect Predicate)**:
```typescript
import * as P from "effect/Predicate"
import * as Num from "effect/Number"

const isPositive = Num.greaterThan(0)
const stringLength = (s: string): number => s.length

const hasPositiveLength = P.mapInput(isPositive, stringLength)

hasPositiveLength("hello")  // true
hasPositiveLength("")       // false
```

**Real-World Example - Validate User Age**:
```typescript
import * as P from "effect/Predicate"
import * as Num from "effect/Number"

type User = { name: string; birthYear: number }

const isAdult = Num.greaterThanOrEqualTo(18)

const userIsAdult = P.mapInput(
  isAdult,
  (user: User) => new Date().getFullYear() - user.birthYear
)

const user: User = { name: "Alice", birthYear: 2000 }
if (userIsAdult(user)) {
  console.log("Adult user")
}
```

---

## Integration with Match

Effect predicates shine when combined with `effect/Match` for pattern matching.

### Before (Switch Statement)

```typescript
type ApiResponse =
  | { _tag: "loading" }
  | { _tag: "success"; data: string[] }
  | { _tag: "error"; error: string }

function getMessage(response: ApiResponse): string {
  switch (response._tag) {
    case "loading":
      return "Loading..."
    case "success":
      return `Found ${response.data.length} items`
    case "error":
      return `Error: ${response.error}`
    default:
      return "Unknown" // Not type-safe!
  }
}
```

### After (Match + Predicate)

```typescript
import * as Match from "effect/Match"
import * as P from "effect/Predicate"

type ApiResponse =
  | { _tag: "loading" }
  | { _tag: "success"; data: string[] }
  | { _tag: "error"; error: string }

const getMessage = (response: ApiResponse): string =>
  Match.value(response).pipe(
    Match.tag("loading", () => "Loading..."),
    Match.tag("success", (r) => `Found ${r.data.length} items`),
    Match.tag("error", (r) => `Error: ${r.error}`),
    Match.exhaustive // Compile error if cases missing!
  )
```

### Complex Predicate Matching

```typescript
import * as Match from "effect/Match"
import * as P from "effect/Predicate"

const classify = (value: unknown): string =>
  Match.value(value).pipe(
    Match.when(P.isString, (s) => `String: ${s}`),
    Match.when(P.isNumber, (n) => `Number: ${n}`),
    Match.when(P.isBoolean, (b) => `Boolean: ${b}`),
    Match.when(P.isNull, () => "Null"),
    Match.when(P.isUndefined, () => "Undefined"),
    Match.when(P.isArray, (arr) => `Array of ${arr.length} items`),
    Match.when(P.isRecord, () => "Plain object"),
    Match.orElse(() => "Unknown type")
  )
```

---

## Migration Patterns

### Pattern 1: typeof Checks

**Before**:
```typescript
if (typeof x === "string") { ... }
if (typeof x === "number") { ... }
if (typeof x === "boolean") { ... }
```

**After**:
```typescript
import * as P from "effect/Predicate"

if (P.isString(x)) { ... }
if (P.isNumber(x)) { ... }
if (P.isBoolean(x)) { ... }
```

### Pattern 2: instanceof Checks

**Before**:
```typescript
if (x instanceof Date) { ... }
if (x instanceof Error) { ... }
if (x instanceof Map) { ... }
```

**After**:
```typescript
import * as P from "effect/Predicate"

if (P.isDate(x)) { ... }
if (P.isError(x)) { ... }
if (P.isMap(x)) { ... }
```

### Pattern 3: Null/Undefined Checks

**Before**:
```typescript
if (x === null) { ... }
if (x !== null) { ... }
if (x === undefined) { ... }
if (x !== undefined) { ... }
if (x != null) { ... }  // Checks both null and undefined
```

**After**:
```typescript
import * as P from "effect/Predicate"

if (P.isNull(x)) { ... }
if (P.isNotNull(x)) { ... }
if (P.isUndefined(x)) { ... }
if (P.isNotUndefined(x)) { ... }
if (P.isNotNullable(x)) { ... }  // Checks both
```

### Pattern 4: Property Access Guards

**Before**:
```typescript
if (obj && typeof obj === "object" && "prop" in obj) {
  console.log((obj as any).prop)
}
```

**After**:
```typescript
import * as P from "effect/Predicate"

if (P.hasProperty(obj, "prop")) {
  console.log(obj.prop) // Type-safe!
}
```

### Pattern 5: Discriminated Union Guards

**Before**:
```typescript
if (shape._tag === "circle") {
  console.log(shape.radius)
}
```

**After**:
```typescript
import * as P from "effect/Predicate"

if (P.isTagged(shape, "circle")) {
  console.log(shape.radius)
}

// Or with Match for exhaustive checking
import * as Match from "effect/Match"

const result = Match.value(shape).pipe(
  Match.tag("circle", (s) => s.radius),
  Match.tag("square", (s) => s.side),
  Match.exhaustive
)
```

### Pattern 6: Array Filtering

**Before (FORBIDDEN)**:
```typescript
const items = [1, null, 2, undefined, 3]
const filtered = items.filter(x => x != null)
```

**After (REQUIRED)**:
```typescript
import * as A from "effect/Array"
import * as F from "effect/Function"
import * as P from "effect/Predicate"

const items = [1, null, 2, undefined, 3]
const filtered = F.pipe(items, A.filter(P.isNotNullable))
```

### Pattern 7: Complex Boolean Logic

**Before**:
```typescript
const isValid = (n: number): boolean => {
  return n > 0 && n < 100 && n % 2 === 0
}
```

**After**:
```typescript
import * as P from "effect/Predicate"
import * as Num from "effect/Number"
import * as F from "effect/Function"

const isValid = F.pipe(
  Num.greaterThan(0),
  P.and(Num.lessThan(100)),
  P.and((n: number) => n % 2 === 0)
)
```

### Pattern 8: Switch Statements

**Before (FORBIDDEN)**:
```typescript
switch (status) {
  case "pending":
    return "Waiting..."
  case "success":
    return "Done!"
  case "error":
    return "Failed!"
  default:
    return "Unknown"
}
```

**After (REQUIRED)**:
```typescript
import * as Match from "effect/Match"

const message = Match.value(status).pipe(
  Match.when("pending", () => "Waiting..."),
  Match.when("success", () => "Done!"),
  Match.when("error", () => "Failed!"),
  Match.orElse(() => "Unknown")
)

// For exhaustive checking (compile error if missing cases)
const messageExhaustive = Match.value(status).pipe(
  Match.when("pending", () => "Waiting..."),
  Match.when("success", () => "Done!"),
  Match.when("error", () => "Failed!"),
  Match.exhaustive // TypeScript enforces all cases!
)
```

### Pattern 9: Long If-Else Chains

**Before (FORBIDDEN)**:
```typescript
if (typeof value === "string") {
  return `String: ${value}`
} else if (typeof value === "number") {
  return `Number: ${value}`
} else if (Array.isArray(value)) {
  return `Array: ${value.length}`
} else {
  return "Unknown"
}
```

**After (REQUIRED)**:
```typescript
import * as Match from "effect/Match"
import * as P from "effect/Predicate"

const result = Match.value(value).pipe(
  Match.when(P.isString, (s) => `String: ${s}`),
  Match.when(P.isNumber, (n) => `Number: ${n}`),
  Match.when(P.isArray, (a) => `Array: ${a.length}`),
  Match.orElse(() => "Unknown")
)
```

---

## Complete Function Reference

### Type Guards (Refinements)

| Function | Returns | Use Case |
|----------|---------|----------|
| `isString` | `input is string` | Check for string |
| `isNumber` | `input is number` | Check for number (includes NaN) |
| `isBoolean` | `input is boolean` | Check for boolean |
| `isBigInt` | `input is bigint` | Check for bigint |
| `isSymbol` | `input is symbol` | Check for symbol |
| `isFunction` | `input is Function` | Check for function |
| `isObject` | `input is object` | Check for object (includes arrays, functions) |
| `isRecord` | `input is { [x: string \| symbol]: unknown }` | Check for plain object |
| `isReadonlyRecord` | Same as `isRecord` | Alias for `isRecord` |
| `isSet` | `input is Set<unknown>` | Check for Set |
| `isMap` | `input is Map<unknown, unknown>` | Check for Map |
| `isError` | `input is Error` | Check for Error instance |
| `isDate` | `input is Date` | Check for Date instance |
| `isRegExp` | `input is RegExp` | Check for RegExp instance |
| `isUint8Array` | `input is Uint8Array` | Check for Uint8Array |
| `isIterable` | `input is Iterable<unknown>` | Check for iterable |
| `isPromise` | `input is Promise<unknown>` | Check for Promise |
| `isPromiseLike` | `input is PromiseLike<unknown>` | Check for PromiseLike |
| `isNull` | `input is null` | Check for null |
| `isNotNull` | `input is Exclude<A, null>` | Filter out null |
| `isUndefined` | `input is undefined` | Check for undefined |
| `isNotUndefined` | `input is Exclude<A, undefined>` | Filter out undefined |
| `isNullable` | `input is Extract<A, null \| undefined>` | Check for null OR undefined |
| `isNotNullable` | `input is NonNullable<A>` | Filter out both null and undefined |
| `isNever` | `input is never` | Always false, narrows to never |
| `isUnknown` | `input is unknown` | Always true, identity refinement |
| `hasProperty` | `input is { [K in P]: unknown }` | Check for property |
| `isTagged` | `input is { _tag: K }` | Check for discriminated union tag |
| `isTupleOf` | `input is TupleOf<N, T>` | Check for exact tuple length |
| `isTupleOfAtLeast` | `input is TupleOfAtLeast<N, T>` | Check for minimum tuple length |

### Predicates (Non-Narrowing)

| Function | Returns | Use Case |
|----------|---------|----------|
| `isTruthy` | `boolean` | Check JavaScript truthiness |

### Combinators

| Function | Type | Use Case |
|----------|------|----------|
| `and` | Binary combinator | Logical AND |
| `or` | Binary combinator | Logical OR |
| `not` | Unary combinator | Logical NOT |
| `xor` | Binary combinator | Exclusive OR |
| `eqv` | Binary combinator | Logical equivalence |
| `nand` | Binary combinator | NOT AND |
| `nor` | Binary combinator | NOT OR |
| `implies` | Binary combinator | If-then logic |
| `every` | Collection combinator | All predicates must pass |
| `some` | Collection combinator | At least one must pass |
| `all` | Collection combinator | Test array of values |
| `tuple` | Structural combinator | Test tuple structure |
| `struct` | Structural combinator | Test object structure |
| `product` | Structural combinator | Test pair |
| `productMany` | Structural combinator | Test head + tail |
| `compose` | Composition utility | Chain refinements |
| `mapInput` | Composition utility | Transform input (contramap) |

---

## Type-Level Utilities

### Predicate Namespace

```typescript
import { type Predicate } from "effect"

// Extract input type from Predicate<A>
type T = Predicate.In<Predicate.Predicate<string>> // T is string

// Represents any Predicate
type AnyPred = Predicate.Any // Predicate<never>
```

### Refinement Namespace

```typescript
import { type Predicate } from "effect"

type IsString = Predicate.Refinement<unknown, string>

// Extract input type
type In = Predicate.Refinement.In<IsString> // unknown

// Extract output (refined) type
type Out = Predicate.Refinement.Out<IsString> // string

// Represents any Refinement
type AnyRef = Predicate.Refinement.Any // Refinement<any, any>
```

---

## Best Practices

### 1. Always Use Predicates for Type Narrowing

```typescript
// ❌ FORBIDDEN
if (typeof x === "string") { ... }

// ✅ REQUIRED
import * as P from "effect/Predicate"
if (P.isString(x)) { ... }
```

### 2. Prefer Match Over Switch

```typescript
// ❌ FORBIDDEN
switch (response._tag) {
  case "success": return "OK"
  case "error": return "Fail"
  default: return "Unknown"
}

// ✅ REQUIRED
import * as Match from "effect/Match"
Match.value(response).pipe(
  Match.tag("success", () => "OK"),
  Match.tag("error", () => "Fail"),
  Match.exhaustive
)
```

### 3. Use Struct for Object Validation

```typescript
// ❌ FORBIDDEN
if (
  typeof obj.name === "string" &&
  typeof obj.age === "number"
) { ... }

// ✅ REQUIRED
import * as P from "effect/Predicate"
const isPerson = P.struct({
  name: P.isString,
  age: P.isNumber
})
if (isPerson(obj)) { ... }
```

### 4. Compose Predicates for Complex Logic

```typescript
// ❌ FORBIDDEN
const isValid = (n: number) => n > 0 && n < 100 && n % 2 === 0

// ✅ REQUIRED
import * as P from "effect/Predicate"
import * as Num from "effect/Number"
import * as F from "effect/Function"

const isValid = F.pipe(
  Num.greaterThan(0),
  P.and(Num.lessThan(100)),
  P.and((n: number) => n % 2 === 0)
)
```

### 5. Use hasProperty for Safe Property Access

```typescript
// ❌ FORBIDDEN
if ("prop" in obj && obj.prop) { ... }

// ✅ REQUIRED
import * as P from "effect/Predicate"
if (P.hasProperty(obj, "prop")) {
  // obj.prop is type-safe
}
```

### 6. Filter Arrays with Effect Predicates

```typescript
// ❌ FORBIDDEN
const filtered = items.filter(x => x != null)

// ✅ REQUIRED
import * as A from "effect/Array"
import * as F from "effect/Function"
import * as P from "effect/Predicate"

const filtered = F.pipe(items, A.filter(P.isNotNullable))
```

---

## Summary

The Effect Predicate module provides a comprehensive, type-safe alternative to imperative conditionals and type guards. Key benefits:

1. **Type Safety**: Refinements enable precise TypeScript type narrowing
2. **Composability**: Build complex predicates from simple ones
3. **Consistency**: Uniform API replaces magic strings and operators
4. **Exhaustiveness**: Works with Match for compile-time exhaustiveness checking
5. **Readability**: Functional composition is clearer than nested if-else
6. **Integration**: Works seamlessly with Effect Array, Match, and other modules

**Every predicate listed here is a replacement for imperative control flow.** Use them systematically to eliminate all `typeof`, `instanceof`, `switch`, and if-else chains from your codebase.
