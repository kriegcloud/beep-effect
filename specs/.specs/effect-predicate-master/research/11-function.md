# Effect Function Module - Predicate Composition Research

**Research Date**: 2025-12-28
**Source Files**:
- `/tmp/effect/packages/effect/src/Function.ts`
- `/node_modules/effect/dist/dts/Function.d.ts`

**Purpose**: Comprehensive documentation of all `effect/Function` utilities relevant to predicate composition, pipelines, and functional programming patterns.

---

## Overview

The `effect/Function` module provides fundamental functional programming utilities that enable composing, transforming, and combining functions. For predicate composition, this module offers the essential building blocks for creating readable, type-safe predicate pipelines.

**Key Capabilities**:
- **Composition**: `pipe`, `flow`, `compose` for building predicate chains
- **Data-Last/Data-First**: `dual` for creating pipeable predicates
- **Identity/Constants**: Pure functions for predicate defaults
- **Type Guards**: `isFunction` for runtime checks
- **Argument Manipulation**: `flip`, `tupled`, `untupled` for predicate transformations

---

## Core Composition Functions

### 1. `pipe` - Data Pipeline Composition

**Location**: Lines 526-1012
**Category**: Composition
**Type Signature**:
```typescript
export function pipe<A>(a: A): A
export function pipe<A, B>(a: A, ab: (a: A) => B): B
export function pipe<A, B, C>(a: A, ab: (a: A) => B, bc: (b: B) => C): C
// ... up to 20 overloads
```

**Description**: Pipes a value through a sequence of unary functions left-to-right. The fundamental composition primitive for building predicate pipelines.

**Predicate Usage**:
```typescript
import * as F from "effect/Function"
import * as P from "effect/Predicate"
import * as Str from "effect/String"
import * as Num from "effect/Number"

// Compose predicate pipeline
const isValidEmail = (email: string): boolean =>
  F.pipe(
    email,
    Str.trim,
    Str.toLowerCase,
    (s) => Str.includes(s, "@"),
    (hasAt) => hasAt && Str.length(email) > 5
  )

// Predicate composition with type narrowing
const processValue = (value: unknown) =>
  F.pipe(
    value,
    P.isString,
    (isStr) => isStr ? F.pipe(value as string, Str.trim, Str.isNonEmpty) : false
  )

// Multi-step validation pipeline
const validateAge = (age: unknown): age is number =>
  F.pipe(
    age,
    P.isNumber,
    (isNum) => isNum && F.pipe(age as number, Num.greaterThanOrEqualTo(0), (x) => x && Num.lessThan(150)(age as number))
  )
```

**Key Insight**: `pipe` is the primary tool for sequential predicate application. Each function receives the output of the previous function.

---

### 2. `flow` - Function Pipeline Composition

**Location**: Lines 1034-1197
**Category**: Composition
**Type Signature**:
```typescript
export function flow<A extends ReadonlyArray<unknown>, B>(
  ab: (...a: A) => B
): (...a: A) => B
export function flow<A extends ReadonlyArray<unknown>, B, C>(
  ab: (...a: A) => B,
  bc: (b: B) => C
): (...a: A) => C
// ... up to 9 overloads
```

**Description**: Creates a new function by composing multiple functions left-to-right. The first function can have any arity, remaining functions must be unary.

**Predicate Usage**:
```typescript
import * as F from "effect/Function"
import * as Str from "effect/String"

// Create reusable predicate
const isValidUsername = F.flow(
  Str.trim,
  Str.toLowerCase,
  (s: string) => Str.length(s) >= 3 && Str.length(s) <= 20,
  (validLength) => validLength && /^[a-z0-9_]+$/.test(s)
)

// Compose predicates into a new function
const isAdultName = F.flow(
  (name: string) => name.trim(),
  (trimmed) => trimmed.length > 0,
  (nonEmpty) => nonEmpty && !/\d/.test(name)
)

// Multi-stage validation
const validateEmail = F.flow(
  (email: string) => email.toLowerCase(),
  (lower) => lower.includes("@") && lower.includes("."),
  (hasSymbols) => hasSymbols && lower.split("@").length === 2
)
```

**Difference from `pipe`**: `flow` creates a **new function**, while `pipe` immediately applies transformations to a value.

```typescript
// pipe - immediate execution
const result1 = F.pipe("test", Str.toUpperCase, Str.length) // 4

// flow - creates reusable function
const getUpperLength = F.flow(Str.toUpperCase, Str.length)
const result2 = getUpperLength("test") // 4
```

---

### 3. `compose` - Right-to-Left Composition

**Location**: Lines 407-410
**Category**: Composition
**Type Signature**:
```typescript
export const compose: {
  <B, C>(bc: (b: B) => C): <A>(self: (a: A) => B) => (a: A) => C
  <A, B, C>(self: (a: A) => B, bc: (b: B) => C): (a: A) => C
}
```

**Description**: Composes two functions where the second function is applied to the result of the first. Supports both data-last (pipeable) and data-first styles.

**Predicate Usage**:
```typescript
import * as F from "effect/Function"

// Mathematical composition (g ∘ f)
const increment = (n: number) => n + 1
const square = (n: number) => n * n

// compose(f, g)(x) = g(f(x))
const incThenSquare = F.compose(increment, square)
console.log(incThenSquare(2)) // 9 (= (2+1)^2)

// Data-last style for piping
const squareThenInc = F.pipe(square, F.compose(increment))
console.log(squareThenInc(3)) // 10 (= 3^2 + 1)

// Predicate composition
const isPositive = (n: number) => n > 0
const isEven = (n: number) => n % 2 === 0
const isPositiveEven = F.compose(
  (n: number) => ({ n, isPos: isPositive(n) }),
  ({ n, isPos }) => isPos && isEven(n)
)
```

**Key Insight**: Rarely used for predicates in Effect. Prefer `pipe` and `flow` for clearer left-to-right reading.

---

## Dual-Style Functions

### 4. `dual` - Data-Last/Data-First Function Factory

**Location**: Lines 95-172
**Category**: Function Creation
**Type Signature**:
```typescript
export const dual: {
  <DataLast extends (...args: Array<any>) => any, DataFirst extends (...args: Array<any>) => any>(
    arity: Parameters<DataFirst>["length"],
    body: DataFirst
  ): DataLast & DataFirst
  <DataLast extends (...args: Array<any>) => any, DataFirst extends (...args: Array<any>) => any>(
    isDataFirst: (args: IArguments) => boolean,
    body: DataFirst
  ): DataLast & DataFirst
}
```

**Description**: Creates functions that work in both data-first and data-last (pipeable) styles. Most Effect library functions use `dual` internally.

**Predicate Usage**:
```typescript
import * as F from "effect/Function"

// Define a dual-style predicate combinator
const and = F.dual<
  <A>(that: (a: A) => boolean) => (self: (a: A) => boolean) => (a: A) => boolean,
  <A>(self: (a: A) => boolean, that: (a: A) => boolean) => (a: A) => boolean
>(2, (self, that) => (a) => self(a) && that(a))

// Data-first usage
const isPositive = (n: number) => n > 0
const isEven = (n: number) => n % 2 === 0
const isPositiveEven = and(isPositive, isEven)
console.log(isPositiveEven(4)) // true

// Data-last (pipeable) usage
const isPositiveEvenPipe = F.pipe(isPositive, and(isEven))
console.log(isPositiveEvenPipe(4)) // true

// Predicate with optional arguments (use predicate for detection)
const matches = F.dual<
  (pattern: RegExp, flags?: string) => (self: string) => boolean,
  (self: string, pattern: RegExp, flags?: string) => boolean
>(
  (args) => typeof args[0] === "string", // Detect data-first by checking first arg type
  (self, pattern, flags) => new RegExp(pattern, flags).test(self)
)
```

**Key Insight**: Use `dual` to create custom predicate combinators that work seamlessly in pipe chains.

---

## Identity and Constant Functions

### 5. `identity` - Identity Function

**Location**: Line 234
**Category**: Utility
**Type Signature**: `<A>(a: A) => A`

**Description**: Returns its input unchanged. Useful as a no-op or default case.

**Predicate Usage**:
```typescript
import * as F from "effect/Function"

// Default passthrough in conditional logic
const maybeTransform = (shouldTransform: boolean) =>
  shouldTransform ? Str.toUpperCase : F.identity

// Predicate identity (always true for type)
const alwaysTrue = <A>(_: A): _ is A => true
const alwaysFalse = <A>(_: A): _ is never => false

// Used in higher-order functions
const applyIfTrue = <A>(
  predicate: (a: A) => boolean,
  transform: (a: A) => A
) => (a: A) => predicate(a) ? transform(a) : F.identity(a)
```

---

### 6. `constant` - Constant Value Factory

**Location**: Line 292
**Category**: Utility
**Type Signature**: `<A>(value: A) => LazyArg<A>`

**Description**: Creates a thunk that always returns the same value.

**Predicate Usage**:
```typescript
import * as F from "effect/Function"

// Constant predicates
const alwaysTrue = F.constant(true)
const alwaysFalse = F.constant(false)

// Used in default cases
const getValidator = (enableValidation: boolean) =>
  enableValidation ? actualValidator : F.constant(true)

// Memoized predicate result
const expensiveCheck = (value: string) => {
  // expensive computation
  return value.length > 100
}
const cachedResult = F.constant(expensiveCheck("test"))
```

---

### 7. `constTrue` / `constFalse` - Boolean Constants

**Location**: Lines 307, 322
**Category**: Utility
**Type Signature**: `LazyArg<boolean>`

**Description**: Thunks that always return `true` or `false`.

**Predicate Usage**:
```typescript
import * as F from "effect/Function"

// Placeholder predicates
const disabled: (a: any) => boolean = F.constFalse
const enabled: (a: any) => boolean = F.constTrue

// Conditional predicate selection
const getFilter = (allowAll: boolean) =>
  allowAll ? F.constTrue : actualFilter

// Short-circuit in complex logic
const complexPredicate = (value: any) =>
  earlyExit ? F.constFalse() : expensiveCheck(value)
```

---

### 8. `constNull` / `constUndefined` / `constVoid`

**Location**: Lines 337, 352, 367
**Category**: Utility
**Type Signature**: `LazyArg<null | undefined | void>`

**Description**: Thunks for null/undefined/void values. Less relevant for predicates but useful in Effect pipelines.

---

## Type Guards

### 9. `isFunction` - Function Type Guard

**Location**: Line 29
**Category**: Type Guard
**Type Signature**: `(input: unknown) => input is Function`

**Description**: Runtime check for function types. Part of `effect/Function` but more commonly used from `effect/Predicate`.

**Predicate Usage**:
```typescript
import { isFunction } from "effect/Function"

// Guard against non-function values
const executePredicate = (maybePredicate: unknown, value: any) =>
  isFunction(maybePredicate) ? maybePredicate(value) : false

// Type narrowing
const applyIf = (fn: unknown, value: any) => {
  if (isFunction(fn)) {
    return fn(value) // TypeScript knows fn is Function
  }
  return value
}
```

---

## Argument Manipulation

### 10. `flip` - Reverse Argument Order

**Location**: Lines 384-388
**Category**: Transformation
**Type Signature**:
```typescript
<A extends Array<unknown>, B extends Array<unknown>, C>(
  f: (...a: A) => (...b: B) => C
) => (...b: B) => (...a: A) => C
```

**Description**: Reverses the order of curried function arguments.

**Predicate Usage**:
```typescript
import * as F from "effect/Function"

// Original curried predicate
const startsWith = (prefix: string) => (text: string) => text.startsWith(prefix)

// Flipped version
const hasPrefix = F.flip(startsWith)

// Usage
const checkHello = startsWith("hello")
checkHello("hello world") // true

const checkWorld = hasPrefix("hello world")
checkWorld("hello") // true

// Useful for changing argument priority
const isInRange = (min: number) => (max: number) => (value: number) =>
  value >= min && value <= max

const rangeFrom = F.flip(isInRange) // (max) => (min) => (value) => ...
```

**Key Insight**: Rarely needed for predicates. Most Effect predicates follow data-last conventions already.

---

### 11. `tupled` - Convert to Tuple Argument

**Location**: Line 439
**Category**: Transformation
**Type Signature**: `<A extends ReadonlyArray<unknown>, B>(f: (...a: A) => B) => (a: A) => B`

**Description**: Converts a function taking multiple arguments into one taking a single tuple.

**Predicate Usage**:
```typescript
import * as F from "effect/Function"

// Original multi-arg predicate
const inRange = (value: number, min: number, max: number) =>
  value >= min && value <= max

// Tupled version
const inRangeTupled = F.tupled(inRange)

// Usage
inRangeTupled([10, 0, 100]) // true

// Useful for mapping over tuple arrays
const ranges: Array<[number, number, number]> = [
  [5, 0, 10],
  [15, 0, 10],
  [7, 0, 10]
]
F.pipe(ranges, A.map(inRangeTupled)) // [true, false, true]
```

---

### 12. `untupled` - Convert from Tuple Argument

**Location**: Line 456
**Category**: Transformation
**Type Signature**: `<A extends ReadonlyArray<unknown>, B>(f: (a: A) => B) => (...a: A) => B`

**Description**: Inverse of `tupled`. Converts a tuple-accepting function into a multi-arg function.

**Predicate Usage**:
```typescript
import * as F from "effect/Function"

// Tuple-based predicate
const validatePair = ([a, b]: [number, number]) => a > 0 && b > 0

// Untupled version
const validateTwo = F.untupled(validatePair)

// Usage
validateTwo(5, 10) // true
validatePair([5, 10]) // true
```

---

### 13. `apply` - Apply Function to Arguments

**Location**: Line 187
**Category**: Application
**Type Signature**: `<A extends ReadonlyArray<unknown>>(...a: A) => <B>(self: (...a: A) => B) => B`

**Description**: Applies a function to provided arguments. Useful for currying application.

**Predicate Usage**:
```typescript
import * as F from "effect/Function"
import * as Str from "effect/String"

// Apply arguments to a function
const checkLength = F.pipe(
  Str.length,
  F.apply("hello")
) // 5

// Predicate application
const isLongEnough = (minLength: number) => (text: string) =>
  text.length >= minLength

const checkMinLength = F.pipe(
  isLongEnough(5),
  F.apply("hello world")
) // true
```

---

## Advanced Utilities

### 14. `satisfies` - Type Constraint Helper

**Location**: Line 256
**Category**: Type Safety
**Type Signature**: `<A>() => <B extends A>(b: B) => B`

**Description**: Ensures an expression matches a type without widening the type. Useful for type-safe predicate definitions.

**Predicate Usage**:
```typescript
import * as F from "effect/Function"

// Ensure predicate conforms to expected type
const isPositive = F.satisfies<(n: number) => boolean>()(
  (n) => n > 0
  //^? (n: number) => boolean (not widened to Function)
)

// Type-safe predicate arrays
const validators = [
  F.satisfies<(s: string) => boolean>()((s) => s.length > 0),
  F.satisfies<(s: string) => boolean>()((s) => /^[a-z]+$/.test(s))
]
```

---

### 15. `unsafeCoerce` - Type Casting

**Location**: Line 271
**Category**: Unsafe
**Type Signature**: `<A, B>(a: A) => B`

**Description**: Unsafe type cast. Avoid in predicate code.

---

### 16. `absurd` - Never Type Handler

**Location**: Line 420
**Category**: Utility
**Type Signature**: `<A>(_: never) => A`

**Description**: Handles exhaustive case checking with `never` types.

**Predicate Usage**:
```typescript
import * as F from "effect/Function"

// Exhaustive matching
type Status = "active" | "inactive"

const checkStatus = (status: Status): boolean => {
  switch (status) {
    case "active":
      return true
    case "inactive":
      return false
    default:
      return F.absurd(status) // Compile error if new status added
  }
}
```

---

### 17. `hole` - Type Hole Simulation

**Location**: Line 1204
**Category**: Development
**Type Signature**: `<T>() => T`

**Description**: Placeholder for incomplete code during development.

---

### 18. `SK` - SK Combinator

**Location**: Line 1222
**Category**: Lambda Calculus
**Type Signature**: `<A, B>(_: A, b: B) => B`

**Description**: Returns the second argument, discarding the first. Rarely used in practical predicate code.

---

## Predicate Composition Patterns

### Pattern 1: Sequential Validation Pipeline

```typescript
import * as F from "effect/Function"
import * as P from "effect/Predicate"
import * as Str from "effect/String"
import * as Num from "effect/Number"

const validateUser = (user: unknown) =>
  F.pipe(
    user,
    P.isRecord, // Step 1: Type guard
    (isRec) => isRec && "name" in (user as Record<string, unknown>),
    (hasName) => hasName && P.isString((user as any).name),
    (validName) => validName && Str.isNonEmpty((user as any).name),
    (nonEmpty) => nonEmpty && "age" in (user as Record<string, unknown>),
    (hasAge) => hasAge && P.isNumber((user as any).age),
    (validAge) => validAge && Num.greaterThanOrEqualTo(0)((user as any).age)
  )
```

### Pattern 2: Reusable Predicate Factory

```typescript
import * as F from "effect/Function"

const createRangeValidator = (min: number, max: number) =>
  F.flow(
    (n: number) => n >= min,
    (minOk) => minOk && n <= max
  )

const isPercentage = createRangeValidator(0, 100)
const isAge = createRangeValidator(0, 150)
```

### Pattern 3: Predicate Composition with `dual`

```typescript
import * as F from "effect/Function"

// Custom predicate combinator
const or = F.dual<
  <A>(that: (a: A) => boolean) => (self: (a: A) => boolean) => (a: A) => boolean,
  <A>(self: (a: A) => boolean, that: (a: A) => boolean) => (a: A) => boolean
>(2, (self, that) => (a) => self(a) || that(a))

// Usage
const isEmptyOrWhitespace = F.pipe(
  Str.isEmpty,
  or((s: string) => s.trim().length === 0)
)
```

### Pattern 4: Predicate Pipeline with Early Exit

```typescript
import * as F from "effect/Function"
import * as O from "effect/Option"

const validateWithExit = (value: string): boolean =>
  F.pipe(
    value,
    O.liftPredicate((s) => s.length > 0), // Returns Option.none if false
    O.map(Str.trim),
    O.filter((s) => /^[a-z]+$/.test(s)),
    O.isSome
  )
```

---

## Best Practices

### DO:
1. **Use `pipe` for sequential predicate application** - Most readable for data transformations
2. **Use `flow` for reusable predicate functions** - Creates composable validators
3. **Use `dual` for custom predicate combinators** - Enables both data-first and data-last styles
4. **Use `identity` for no-op cases** - Clear intent for passthrough
5. **Use `constant` for fixed predicate results** - Memoization and feature flags

### DON'T:
1. **Don't use `compose` for predicates** - Prefer `pipe`/`flow` for left-to-right reading
2. **Don't use `flip` unless necessary** - Effect predicates already follow conventions
3. **Don't use `unsafeCoerce`** - Use proper type guards instead
4. **Don't use `tupled`/`untupled` unnecessarily** - Keep predicates simple

---

## Integration with Effect Predicate Module

The `effect/Function` module works seamlessly with `effect/Predicate`:

```typescript
import * as F from "effect/Function"
import * as P from "effect/Predicate"
import * as A from "effect/Array"

// Combine Function and Predicate utilities
const filterValidNumbers = F.flow(
  A.filter(P.isNumber),
  A.filter((n) => n > 0),
  A.filter((n) => n < 100)
)

const numbers: Array<unknown> = [1, "test", 50, -5, 200, 42]
const result = filterValidNumbers(numbers) // [1, 50, 42]
```

---

## Summary

The `effect/Function` module provides **18 functions** critical for predicate composition:

| Function | Primary Use | Predicate Relevance |
|----------|-------------|---------------------|
| `pipe` | Sequential composition | ⭐⭐⭐⭐⭐ Essential |
| `flow` | Create new functions | ⭐⭐⭐⭐⭐ Essential |
| `dual` | Data-last/first functions | ⭐⭐⭐⭐ Important |
| `compose` | Right-to-left composition | ⭐⭐ Rarely used |
| `identity` | No-op function | ⭐⭐⭐ Useful |
| `constant` | Constant values | ⭐⭐⭐ Useful |
| `constTrue`/`constFalse` | Boolean constants | ⭐⭐⭐ Useful |
| `isFunction` | Type guard | ⭐⭐ Occasionally useful |
| `flip` | Reverse arguments | ⭐ Rarely needed |
| `tupled`/`untupled` | Tuple conversion | ⭐⭐ Occasionally useful |
| `apply` | Apply arguments | ⭐⭐ Occasionally useful |
| `satisfies` | Type constraints | ⭐⭐⭐ Useful |
| `absurd` | Never handling | ⭐⭐ Occasionally useful |

**Most Important**: `pipe`, `flow`, and `dual` are the foundation of Effect-style predicate composition.
