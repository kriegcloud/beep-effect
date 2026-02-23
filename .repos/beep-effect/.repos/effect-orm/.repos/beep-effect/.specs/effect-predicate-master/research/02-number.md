# Effect Number Module - Predicate Functions Research

## Executive Summary

The `effect/Number` module provides a comprehensive set of predicate and comparison functions for working with numbers in a functional, composable way. All predicates return `boolean` and support both data-first and data-last (pipeable) styles, making them ideal replacements for native comparison operators and conditional logic.

## Source Files

- **Primary Source**: `/tmp/effect/packages/effect/src/Number.ts`
- **Type Definitions**: `/node_modules/effect/dist/dts/Number.d.ts`
- **Available Since**: Effect v2.0.0

## Predicate Categories

### 1. Type Guards

#### `isNumber` (Line 160)

**Type Signature**:
```typescript
(input: unknown) => input is number
```

**Description**: Type guard that tests if a value is a member of the set of JavaScript numbers (including `Infinity` and `NaN`).

**Source Implementation**:
```typescript
export const isNumber: (input: unknown) => input is number = predicate.isNumber
```

**Use Cases**:
- Replace `typeof x === "number"` checks
- Filter mixed arrays for numeric values
- Type narrowing in conditional branches
- Input validation before numeric operations

**Example Usage**:
```typescript
import * as Num from "effect/Number"
import * as Match from "effect/Match"

// ❌ FORBIDDEN - typeof check
if (typeof value === "number") {
  return value.toFixed(2)
}

// ✅ REQUIRED - Effect predicate
if (Num.isNumber(value)) {
  return value.toFixed(2)  // TypeScript knows value is number
}

// ✅ With Match
const result = Match.value(value).pipe(
  Match.when(Num.isNumber, (n) => `Number: ${n}`),
  Match.orElse(() => "Not a number")
)

// ✅ Filtering arrays
const mixed = [1, "two", 3, false, 5]
const numbers = F.pipe(mixed, A.filter(Num.isNumber))  // [1, 3, 5]
```

**Edge Cases**:
- Returns `true` for `Infinity`, `-Infinity`, and `NaN`
- Returns `false` for numeric strings like `"42"`
- Returns `false` for `null`, `undefined`, `true`, `false`

---

### 2. Comparison Predicates

#### `lessThan` (Line 761-764)

**Type Signature**:
```typescript
{
  (that: number): (self: number) => boolean
  (self: number, that: number): boolean
}
```

**Description**: Returns `true` if the first argument is strictly less than the second.

**Source Implementation**:
```typescript
export const lessThan: {
  (that: number): (self: number) => boolean
  (self: number, that: number): boolean
} = order.lessThan(Order)
```

**Use Cases**:
- Replace `x < y` comparisons
- Validation predicates for ranges
- Filtering arrays by threshold
- Sorting and ordering operations

**Example Usage**:
```typescript
import * as Num from "effect/Number"
import * as F from "effect/Function"
import * as A from "effect/Array"
import * as Match from "effect/Match"

// ❌ FORBIDDEN - native comparison
if (age < 18) {
  return "Minor"
}

// ✅ REQUIRED - Effect predicate (data-first)
if (Num.lessThan(age, 18)) {
  return "Minor"
}

// ✅ Data-last style (pipeable)
const isMinor = Num.lessThan(18)
if (isMinor(age)) {
  return "Minor"
}

// ✅ With Match
const ageCategory = Match.value(age).pipe(
  Match.when(Num.lessThan(18), () => "Minor"),
  Match.orElse(() => "Adult")
)

// ✅ Filtering arrays
const prices = [10, 25, 5, 30, 15]
const affordable = F.pipe(prices, A.filter(Num.lessThan(20)))  // [10, 5, 15]

// ✅ Composing predicates
const isBelowThreshold = Num.lessThan(100)
F.pipe(
  [50, 120, 80, 150],
  A.filter(isBelowThreshold)
)  // [50, 80]
```

**Mathematical Properties**:
- Anti-reflexive: `lessThan(x, x)` is always `false`
- Transitive: if `lessThan(a, b)` and `lessThan(b, c)`, then `lessThan(a, c)`
- Asymmetric: if `lessThan(a, b)` then `!lessThan(b, a)`

---

#### `lessThanOrEqualTo` (Line 784-787)

**Type Signature**:
```typescript
{
  (that: number): (self: number) => boolean
  (self: number, that: number): boolean
}
```

**Description**: Returns `true` if the first argument is less than or equal to the second.

**Source Implementation**:
```typescript
export const lessThanOrEqualTo: {
  (that: number): (self: number) => boolean
  (self: number, that: number): boolean
} = order.lessThanOrEqualTo(Order)
```

**Use Cases**:
- Replace `x <= y` comparisons
- Inclusive range validation
- Age/quota/limit checks
- Max capacity validation

**Example Usage**:
```typescript
import * as Num from "effect/Number"
import * as F from "effect/Function"
import * as A from "effect/Array"
import * as P from "effect/Predicate"

// ❌ FORBIDDEN - native comparison
if (count <= maxItems) {
  return "Within limit"
}

// ✅ REQUIRED - Effect predicate
if (Num.lessThanOrEqualTo(count, maxItems)) {
  return "Within limit"
}

// ✅ Curried style
const isWithinLimit = Num.lessThanOrEqualTo(100)
if (isWithinLimit(count)) {
  return "Within limit"
}

// ✅ Validating array lengths
const lists = [[1, 2], [1, 2, 3, 4, 5], [1]]
const shortLists = F.pipe(
  lists,
  A.filter((list) => Num.lessThanOrEqualTo(A.length(list), 3))
)  // [[1, 2], [1]]

// ✅ Combined with other predicates
const isValidAge = P.and(
  Num.greaterThanOrEqualTo(0),
  Num.lessThanOrEqualTo(120)
)
```

---

#### `greaterThan` (Line 807-810)

**Type Signature**:
```typescript
{
  (that: number): (self: number) => boolean
  (self: number, that: number): boolean
}
```

**Description**: Returns `true` if the first argument is strictly greater than the second.

**Source Implementation**:
```typescript
export const greaterThan: {
  (that: number): (self: number) => boolean
  (self: number, that: number): boolean
} = order.greaterThan(Order)
```

**Use Cases**:
- Replace `x > y` comparisons
- Minimum threshold validation
- Positive number checks
- Filtering above a baseline

**Example Usage**:
```typescript
import * as Num from "effect/Number"
import * as F from "effect/Function"
import * as A from "effect/Array"
import * as Match from "effect/Match"

// ❌ FORBIDDEN - native comparison
if (score > passingGrade) {
  return "Pass"
}

// ✅ REQUIRED - Effect predicate
if (Num.greaterThan(score, passingGrade)) {
  return "Pass"
}

// ✅ Curried for reuse
const isPassing = Num.greaterThan(60)
if (isPassing(score)) {
  return "Pass"
}

// ✅ With Match for grade calculation
const getGrade = (score: number) =>
  Match.value(score).pipe(
    Match.when(Num.greaterThan(90), () => "A"),
    Match.when(Num.greaterThan(80), () => "B"),
    Match.when(Num.greaterThan(70), () => "C"),
    Match.when(Num.greaterThan(60), () => "D"),
    Match.orElse(() => "F")
  )

// ✅ Filtering positive values
const numbers = [-5, 10, -2, 8, 0, 3]
const positives = F.pipe(numbers, A.filter(Num.greaterThan(0)))  // [10, 8, 3]
```

---

#### `greaterThanOrEqualTo` (Line 830-833)

**Type Signature**:
```typescript
{
  (that: number): (self: number) => boolean
  (self: number, that: number): boolean
}
```

**Description**: Returns `true` if the first argument is greater than or equal to the second.

**Source Implementation**:
```typescript
export const greaterThanOrEqualTo: {
  (that: number): (self: number) => boolean
  (self: number, that: number): boolean
} = order.greaterThanOrEqualTo(Order)
```

**Use Cases**:
- Replace `x >= y` comparisons
- Minimum value validation
- Non-negative number checks
- Quota/threshold validation

**Example Usage**:
```typescript
import * as Num from "effect/Number"
import * as F from "effect/Function"
import * as A from "effect/Array"
import * as P from "effect/Predicate"

// ❌ FORBIDDEN - native comparison
if (quantity >= minOrder) {
  return "Eligible for discount"
}

// ✅ REQUIRED - Effect predicate
if (Num.greaterThanOrEqualTo(quantity, minOrder)) {
  return "Eligible for discount"
}

// ✅ Curried validation
const meetsMinimum = Num.greaterThanOrEqualTo(10)
if (meetsMinimum(quantity)) {
  return "Eligible for discount"
}

// ✅ Non-negative validation
const isNonNegative = Num.greaterThanOrEqualTo(0)
const sanitizedScores = F.pipe(
  scores,
  A.filter(isNonNegative)
)

// ✅ Composed range validation
const isValidPercentage = P.and(
  Num.greaterThanOrEqualTo(0),
  Num.lessThanOrEqualTo(100)
)
```

---

### 3. Range Predicates

#### `between` (Line 854-863)

**Type Signature**:
```typescript
{
  (options: { minimum: number; maximum: number }): (self: number) => boolean
  (self: number, options: { minimum: number; maximum: number }): boolean
}
```

**Description**: Checks if a number is between a `minimum` and `maximum` value (inclusive on both ends).

**Source Implementation**:
```typescript
export const between: {
  (options: { minimum: number; maximum: number }): (self: number) => boolean
  (
    self: number,
    options: {
      minimum: number
      maximum: number
    }
  ): boolean
} = order.between(Order)
```

**Use Cases**:
- Replace `x >= min && x <= max` checks
- Range validation (ages, scores, percentages)
- Boundary checking for inputs
- Filtering values within bounds

**Example Usage**:
```typescript
import * as Num from "effect/Number"
import * as F from "effect/Function"
import * as A from "effect/Array"
import * as Match from "effect/Match"

// ❌ FORBIDDEN - compound comparison
if (age >= 18 && age <= 65) {
  return "Working age"
}

// ✅ REQUIRED - Effect between predicate
if (Num.between(age, { minimum: 18, maximum: 65 })) {
  return "Working age"
}

// ✅ Curried for reuse
const isWorkingAge = Num.between({ minimum: 18, maximum: 65 })
if (isWorkingAge(age)) {
  return "Working age"
}

// ✅ With Match for age categories
const getAgeCategory = (age: number) =>
  Match.value(age).pipe(
    Match.when(Num.between({ minimum: 0, maximum: 12 }), () => "Child"),
    Match.when(Num.between({ minimum: 13, maximum: 19 }), () => "Teenager"),
    Match.when(Num.between({ minimum: 20, maximum: 64 }), () => "Adult"),
    Match.orElse(() => "Senior")
  )

// ✅ Filtering array by range
const scores = [45, 72, 88, 55, 90, 35]
const passing = F.pipe(
  scores,
  A.filter(Num.between({ minimum: 60, maximum: 100 }))
)  // [72, 88, 90]

// ✅ Validating percentages
const isValidPercentage = Num.between({ minimum: 0, maximum: 100 })

// ✅ Temperature range check
const isComfortable = Num.between({ minimum: 68, maximum: 78 })
```

**Edge Cases**:
- Inclusive on both ends: `between(5, { minimum: 5, maximum: 10 })` returns `true`
- `between(10, { minimum: 5, maximum: 10 })` also returns `true`
- If `minimum > maximum`, behavior is undefined (invalid input)

---

## Comparison Functions (Return Numbers, Not Booleans)

While not predicates themselves, these functions are often used in combination with predicates:

### `min` (Line 915-918)

**Type Signature**:
```typescript
{
  (that: number): (self: number) => number
  (self: number, that: number): number
}
```

**Description**: Returns the minimum between two numbers.

**Example Usage**:
```typescript
import * as Num from "effect/Number"
import * as F from "effect/Function"
import * as A from "effect/Array"

// ❌ FORBIDDEN - Math.min
const lower = Math.min(a, b)

// ✅ REQUIRED - Effect min
const lower = Num.min(a, b)

// ✅ Pipeable style
const capped = F.pipe(value, Num.min(100))  // Cap at 100

// ✅ Finding minimum in array with reduce
const minimum = F.pipe(
  numbers,
  A.reduce(Infinity, Num.min)
)
```

---

### `max` (Line 934-937)

**Type Signature**:
```typescript
{
  (that: number): (self: number) => number
  (self: number, that: number): number
}
```

**Description**: Returns the maximum between two numbers.

**Example Usage**:
```typescript
import * as Num from "effect/Number"
import * as F from "effect/Function"
import * as A from "effect/Array"

// ❌ FORBIDDEN - Math.max
const higher = Math.max(a, b)

// ✅ REQUIRED - Effect max
const higher = Num.max(a, b)

// ✅ Pipeable style
const atLeast = F.pipe(value, Num.max(0))  // Floor at 0

// ✅ Finding maximum in array
const maximum = F.pipe(
  numbers,
  A.reduce(-Infinity, Num.max)
)
```

---

### `clamp` (Line 890-899)

**Type Signature**:
```typescript
{
  (options: { minimum: number; maximum: number }): (self: number) => number
  (self: number, options: { minimum: number; maximum: number }): number
}
```

**Description**: Restricts a number to be within the range specified by `minimum` and `maximum`. Returns the input if within range, otherwise returns the boundary value.

**Example Usage**:
```typescript
import * as Num from "effect/Number"
import * as F from "effect/Function"

// ❌ FORBIDDEN - manual clamping
const clamped = x < min ? min : x > max ? max : x

// ✅ REQUIRED - Effect clamp
const clamped = Num.clamp(x, { minimum: 0, maximum: 100 })

// ✅ Curried for reuse
const clampPercentage = Num.clamp({ minimum: 0, maximum: 100 })
const validPercent = clampPercentage(userInput)  // 3 -> 3, -5 -> 0, 150 -> 100

// ✅ Clamping RGB values
const clampRGB = Num.clamp({ minimum: 0, maximum: 255 })
const sanitizedColor = {
  r: clampRGB(r),
  g: clampRGB(g),
  b: clampRGB(b)
}
```

---

### `sign` (Line 956)

**Type Signature**:
```typescript
(n: number) => Ordering
```

**Description**: Determines the sign of a number. Returns an `Ordering` type (`-1`, `0`, or `1`).

**Example Usage**:
```typescript
import * as Num from "effect/Number"
import * as Match from "effect/Match"

// ❌ FORBIDDEN - Math.sign or manual check
const signValue = Math.sign(n)

// ✅ REQUIRED - Effect sign
const ordering = Num.sign(n)  // -1, 0, or 1

// ✅ With Match for categorization
const signDescription = Match.value(Num.sign(n)).pipe(
  Match.when(-1, () => "Negative"),
  Match.when(0, () => "Zero"),
  Match.when(1, () => "Positive"),
  Match.exhaustive
)
```

---

## Predicate Composition Patterns

### Combining Multiple Number Predicates

```typescript
import * as Num from "effect/Number"
import * as P from "effect/Predicate"
import * as F from "effect/Function"
import * as A from "effect/Array"

// ✅ Composing with P.and
const isValidAge = P.and(
  Num.greaterThanOrEqualTo(0),
  Num.lessThanOrEqualTo(120)
)

// ✅ Composing with P.or
const isExtreme = P.or(
  Num.lessThan(-100),
  Num.greaterThan(100)
)

// ✅ Negating predicates
const isNotZero = P.not(
  (n: number) => n === 0
)

// ✅ Complex validation
const isValidScore = P.and(
  Num.isNumber,
  Num.between({ minimum: 0, maximum: 100 })
)

// ✅ Multi-criteria filtering
const qualifyingScores = F.pipe(
  scores,
  A.filter(
    P.and(
      Num.greaterThanOrEqualTo(60),
      Num.lessThan(100)
    )
  )
)
```

---

### Using Number Predicates with Match

```typescript
import * as Num from "effect/Number"
import * as Match from "effect/Match"

// ✅ Grade calculation with predicates
const calculateGrade = (score: number) =>
  Match.value(score).pipe(
    Match.when(Num.greaterThanOrEqualTo(90), () => "A"),
    Match.when(Num.greaterThanOrEqualTo(80), () => "B"),
    Match.when(Num.greaterThanOrEqualTo(70), () => "C"),
    Match.when(Num.greaterThanOrEqualTo(60), () => "D"),
    Match.orElse(() => "F")
  )

// ✅ Temperature categorization
const describeTemp = (temp: number) =>
  Match.value(temp).pipe(
    Match.when(Num.lessThan(32), () => "Freezing"),
    Match.when(Num.between({ minimum: 32, maximum: 50 }), () => "Cold"),
    Match.when(Num.between({ minimum: 51, maximum: 70 }), () => "Cool"),
    Match.when(Num.between({ minimum: 71, maximum: 85 }), () => "Warm"),
    Match.orElse(() => "Hot")
  )

// ✅ Priority assignment
const getPriority = (urgency: number) =>
  Match.value(urgency).pipe(
    Match.when(Num.greaterThan(7), () => "Critical"),
    Match.when(Num.between({ minimum: 4, maximum: 7 }), () => "High"),
    Match.when(Num.between({ minimum: 1, maximum: 3 }), () => "Medium"),
    Match.orElse(() => "Low")
  )
```

---

### Filtering and Partitioning with Number Predicates

```typescript
import * as Num from "effect/Number"
import * as F from "effect/Function"
import * as A from "effect/Array"

// ✅ Filter by threshold
const highScores = F.pipe(
  scores,
  A.filter(Num.greaterThanOrEqualTo(80))
)

// ✅ Partition by range
const [failing, passing] = F.pipe(
  scores,
  A.partition(Num.greaterThanOrEqualTo(60))
)

// ✅ Filter with composed predicate
const validAges = F.pipe(
  inputs,
  A.filter(
    P.and(
      Num.isNumber,
      Num.between({ minimum: 0, maximum: 120 })
    )
  )
)
```

---

## Before/After Comparison

### Simple Comparison
```typescript
// ❌ FORBIDDEN - Native comparison operators
if (age < 18) {
  return "Minor"
} else if (age >= 18 && age < 65) {
  return "Adult"
} else {
  return "Senior"
}

// ✅ REQUIRED - Effect predicates with Match
const category = Match.value(age).pipe(
  Match.when(Num.lessThan(18), () => "Minor"),
  Match.when(Num.between({ minimum: 18, maximum: 64 }), () => "Adult"),
  Match.orElse(() => "Senior")
)
```

---

### Range Validation
```typescript
// ❌ FORBIDDEN - Compound boolean expressions
if (score >= 0 && score <= 100) {
  return true
}

// ✅ REQUIRED - Effect between predicate
const isValid = Num.between(score, { minimum: 0, maximum: 100 })
```

---

### Array Filtering
```typescript
// ❌ FORBIDDEN - Native array methods with operators
const filtered = items.filter((x) => x > threshold && x < ceiling)

// ✅ REQUIRED - Effect Array with composed predicates
const filtered = F.pipe(
  items,
  A.filter(
    P.and(
      Num.greaterThan(threshold),
      Num.lessThan(ceiling)
    )
  )
)

// ✅ Alternative with between
const filtered = F.pipe(
  items,
  A.filter(Num.between({ minimum: threshold + 0.01, maximum: ceiling - 0.01 }))
)
```

---

### Complex Conditionals
```typescript
// ❌ FORBIDDEN - Switch statement with comparisons
switch (true) {
  case temp < 32:
    return "Freezing"
  case temp >= 32 && temp < 50:
    return "Cold"
  case temp >= 50 && temp < 70:
    return "Cool"
  default:
    return "Warm"
}

// ✅ REQUIRED - Match with predicates
const description = Match.value(temp).pipe(
  Match.when(Num.lessThan(32), () => "Freezing"),
  Match.when(Num.between({ minimum: 32, maximum: 49 }), () => "Cold"),
  Match.when(Num.between({ minimum: 50, maximum: 69 }), () => "Cool"),
  Match.orElse(() => "Warm")
)
```

---

## Additional Predicate-Like Functions

While not strictly predicates (don't return boolean), these are useful in predicate contexts:

### Related Guard: `isNumber`
Already covered above - the primary type guard.

### Mathematical Predicates (Implicit)
Effect Number doesn't provide functions like `isPositive`, `isNegative`, `isEven`, `isOdd`, `isFinite`, `isInteger`, etc. These must be constructed:

```typescript
import * as Num from "effect/Number"

// ✅ Custom predicates built from Number module
const isPositive = Num.greaterThan(0)
const isNegative = Num.lessThan(0)
const isZero = (n: number) => n === 0
const isNonNegative = Num.greaterThanOrEqualTo(0)
const isNonPositive = Num.lessThanOrEqualTo(0)

// For integer/even/odd, combine with native guards
const isEven = (n: number) => n % 2 === 0
const isOdd = (n: number) => n % 2 !== 0
const isInteger = (n: number) => Number.isInteger(n)
const isFinite = (n: number) => Number.isFinite(n)
```

---

## Summary Table

| Function                  | Category   | Line | Signature                                                       | Replaces              |
| ------------------------- | ---------- | ---- | --------------------------------------------------------------- | --------------------- |
| `isNumber`                | Type Guard | 160  | `(input: unknown) => input is number`                           | `typeof x === "number"` |
| `lessThan`                | Comparison | 761  | `(that: number) => (self: number) => boolean`                   | `x < y`               |
| `lessThanOrEqualTo`       | Comparison | 784  | `(that: number) => (self: number) => boolean`                   | `x <= y`              |
| `greaterThan`             | Comparison | 807  | `(that: number) => (self: number) => boolean`                   | `x > y`               |
| `greaterThanOrEqualTo`    | Comparison | 830  | `(that: number) => (self: number) => boolean`                   | `x >= y`              |
| `between`                 | Range      | 854  | `(options: {min, max}) => (self: number) => boolean`            | `x >= min && x <= max` |
| `min`                     | Utility    | 915  | `(that: number) => (self: number) => number`                    | `Math.min(x, y)`      |
| `max`                     | Utility    | 934  | `(that: number) => (self: number) => number`                    | `Math.max(x, y)`      |
| `clamp`                   | Utility    | 890  | `(options: {min, max}) => (self: number) => number`             | Manual clamping logic |
| `sign`                    | Utility    | 956  | `(n: number) => Ordering`                                       | `Math.sign(n)`        |

---

## Integration with Effect Predicate Module

All comparison predicates (`lessThan`, `greaterThan`, etc.) are built on top of `effect/Order`, which provides a total ordering for numbers. They integrate seamlessly with `effect/Predicate` combinators:

```typescript
import * as Num from "effect/Number"
import * as P from "effect/Predicate"

// ✅ Predicate composition
const isValidAge = P.and(
  Num.greaterThanOrEqualTo(0),
  Num.lessThanOrEqualTo(120)
)

const isExtremeTemperature = P.or(
  Num.lessThan(-50),
  Num.greaterThan(50)
)

const isNotZero = P.not((n: number) => n === 0)

// ✅ Using with P.struct for object validation
const isValidUser = P.struct({
  age: Num.between({ minimum: 18, maximum: 100 }),
  score: Num.greaterThanOrEqualTo(0)
})
```

---

## Key Takeaways

1. **Always use Effect Number predicates** instead of native comparison operators (`<`, `>`, `<=`, `>=`)
2. **Use `between`** instead of compound boolean expressions for range checks
3. **All predicates are curryable** - leverage data-last style for reusability
4. **Compose with `effect/Predicate`** combinators (`P.and`, `P.or`, `P.not`)
5. **Use with `Match.when`** to replace switch statements and if-else chains
6. **Type guard `isNumber`** provides type narrowing for TypeScript
7. **`min`, `max`, `clamp`, `sign`** are utility functions that complement predicates

---

## Related Modules

- **`effect/Predicate`**: Core predicate combinators (`and`, `or`, `not`, `struct`)
- **`effect/Match`**: Pattern matching with predicates
- **`effect/Order`**: Total ordering instance for numbers (underlying implementation)
- **`effect/Array`**: Uses predicates in `filter`, `partition`, `findFirst`, etc.

---

## Missing Predicates (Not Provided by Effect)

The following predicates are NOT provided and must be implemented manually:

- `isPositive` → Use `Num.greaterThan(0)`
- `isNegative` → Use `Num.lessThan(0)`
- `isZero` → Use `(n: number) => n === 0`
- `isEven` → Use `(n: number) => n % 2 === 0`
- `isOdd` → Use `(n: number) => n % 2 !== 0`
- `isInteger` → Use `(n: number) => Number.isInteger(n)`
- `isFinite` → Use `(n: number) => Number.isFinite(n)`
- `isNaN` → Use `(n: number) => Number.isNaN(n)`
- `isSafeInteger` → Use `(n: number) => Number.isSafeInteger(n)`

---

## Conclusion

The `effect/Number` module provides a robust set of predicate functions for numeric comparisons and validations. By consistently using these predicates instead of native operators, code becomes more composable, testable, and aligns with Effect's functional programming philosophy. All predicates support both data-first and data-last styles, making them ideal for use in pipelines, `Match` expressions, and array operations.
