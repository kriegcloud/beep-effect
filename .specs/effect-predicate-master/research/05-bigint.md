# BigInt Predicates - Effect Pattern Research

## Executive Summary

The `effect/BigInt` module provides a comprehensive suite of predicate functions for bigint comparisons and validation. Unlike the Number module, BigInt lacks sign-specific predicates (isPositive, isNegative, isZero) but includes all comparison operators and range checking utilities. All comparison predicates are built on top of the `Order` type class, ensuring consistency with Effect's ordering semantics.

## Problem Statement

BigInt predicates enable type-safe, functional comparisons of arbitrary-precision integers without relying on native comparison operators directly. This is critical for:
- Safe arithmetic on values exceeding `Number.MAX_SAFE_INTEGER`
- Financial calculations requiring exact precision
- Cryptographic operations with large numbers
- Composable range validation in pipelines

## Research Sources

- **Effect Documentation**: `effect/BigInt` module reference
- **Source Code Analysis**:
  - `/tmp/effect/packages/effect/src/BigInt.ts` (lines 194-508)
  - `/node_modules/effect/dist/dts/BigInt.d.ts`
- **Dependencies**: Uses `effect/Order` for all comparison predicates

---

## Complete Predicate Inventory

### Type Guard Predicate

#### `isBigInt`
**Location**: Line 38 (source)
**Type Signature**: `(u: unknown) => u is bigint`
**Category**: guards
**Description**: Type guard that checks if a value is a `bigint`.

**Implementation**:
```typescript
export const isBigInt: (u: unknown) => u is bigint = predicate.isBigInt
```

**Usage**:
```typescript
import * as BI from "effect/BigInt"

BI.isBigInt(1n)           // true
BI.isBigInt(1)            // false
BI.isBigInt("123")        // false
BI.isBigInt(BigInt(42))   // true
```

---

### Comparison Predicates

All comparison predicates support dual syntax (data-first and data-last) via the `dual` combinator.

#### `lessThan`
**Location**: Lines 210-213 (source)
**Type Signature**:
```typescript
{
  (that: bigint): (self: bigint) => boolean
  (self: bigint, that: bigint): boolean
}
```
**Category**: predicates
**Description**: Returns `true` if the first argument is less than the second, otherwise `false`.

**Implementation**:
```typescript
export const lessThan: {
  (that: bigint): (self: bigint) => boolean
  (self: bigint, that: bigint): boolean
} = order.lessThan(Order)
```

**Usage**:
```typescript
import * as BI from "effect/BigInt"
import * as F from "effect/Function"

// Data-first
BI.lessThan(2n, 3n)  // true
BI.lessThan(3n, 3n)  // false
BI.lessThan(4n, 3n)  // false

// Data-last (pipe-friendly)
F.pipe(2n, BI.lessThan(3n))  // true

// Predicate function
const isLessThan100 = BI.lessThan(100n)
isLessThan100(50n)   // true
isLessThan100(150n)  // false
```

---

#### `lessThanOrEqualTo`
**Location**: Lines 231-234 (source)
**Type Signature**:
```typescript
{
  (that: bigint): (self: bigint) => boolean
  (self: bigint, that: bigint): boolean
}
```
**Category**: predicates
**Description**: Checks if a given `bigint` is less than or equal to the provided one.

**Implementation**:
```typescript
export const lessThanOrEqualTo: {
  (that: bigint): (self: bigint) => boolean
  (self: bigint, that: bigint): boolean
} = order.lessThanOrEqualTo(Order)
```

**Usage**:
```typescript
import * as BI from "effect/BigInt"

BI.lessThanOrEqualTo(2n, 3n)  // true
BI.lessThanOrEqualTo(3n, 3n)  // true
BI.lessThanOrEqualTo(4n, 3n)  // false

// Validate max limit (inclusive)
const isWithinLimit = BI.lessThanOrEqualTo(1000000n)
isWithinLimit(999999n)  // true
isWithinLimit(1000000n) // true
isWithinLimit(1000001n) // false
```

---

#### `greaterThan`
**Location**: Lines 252-255 (source)
**Type Signature**:
```typescript
{
  (that: bigint): (self: bigint) => boolean
  (self: bigint, that: bigint): boolean
}
```
**Category**: predicates
**Description**: Returns `true` if the first argument is greater than the second, otherwise `false`.

**Implementation**:
```typescript
export const greaterThan: {
  (that: bigint): (self: bigint) => boolean
  (self: bigint, that: bigint): boolean
} = order.greaterThan(Order)
```

**Usage**:
```typescript
import * as BI from "effect/BigInt"

BI.greaterThan(2n, 3n)  // false
BI.greaterThan(3n, 3n)  // false
BI.greaterThan(4n, 3n)  // true

// Filter large numbers
const numbers = [1n, 50n, 100n, 200n]
F.pipe(
  numbers,
  A.filter(BI.greaterThan(75n))
)  // [100n, 200n]
```

---

#### `greaterThanOrEqualTo`
**Location**: Lines 273-276 (source)
**Type Signature**:
```typescript
{
  (that: bigint): (self: bigint) => boolean
  (self: bigint, that: bigint): boolean
}
```
**Category**: predicates
**Description**: Checks if a given `bigint` is greater than or equal to the provided one.

**Implementation**:
```typescript
export const greaterThanOrEqualTo: {
  (that: bigint): (self: bigint) => boolean
  (self: bigint, that: bigint): boolean
} = order.greaterThanOrEqualTo(Order)
```

**Usage**:
```typescript
import * as BI from "effect/BigInt"

BI.greaterThanOrEqualTo(2n, 3n)  // false
BI.greaterThanOrEqualTo(3n, 3n)  // true
BI.greaterThanOrEqualTo(4n, 3n)  // true

// Validate minimum requirement
const meetsMinimum = BI.greaterThanOrEqualTo(1000n)
meetsMinimum(999n)   // false
meetsMinimum(1000n)  // true
```

---

#### `between`
**Location**: Lines 296-305 (source)
**Type Signature**:
```typescript
{
  (options: { minimum: bigint; maximum: bigint }): (self: bigint) => boolean
  (self: bigint, options: { minimum: bigint; maximum: bigint }): boolean
}
```
**Category**: predicates
**Description**: Checks if a `bigint` is between a `minimum` and `maximum` value (inclusive).

**Implementation**:
```typescript
export const between: {
  (options: {
    minimum: bigint
    maximum: bigint
  }): (self: bigint) => boolean
  (self: bigint, options: {
    minimum: bigint
    maximum: bigint
  }): boolean
} = order.between(Order)
```

**Usage**:
```typescript
import * as BI from "effect/BigInt"

const inRange = BI.between({ minimum: 0n, maximum: 5n })

inRange(3n)   // true
inRange(-1n)  // false
inRange(6n)   // false
inRange(0n)   // true (inclusive lower bound)
inRange(5n)   // true (inclusive upper bound)

// Validate age range in days (arbitrary precision)
const validAge = BI.between({
  minimum: 0n,
  maximum: BigInt(365 * 120)  // 120 years
})

// Data-first usage
BI.between(42n, { minimum: 0n, maximum: 100n })  // true
```

---

### Sign-Related Functions

While BigInt does not provide dedicated `isPositive`, `isNegative`, or `isZero` predicates, the `sign` function can be used in combination with Match for sign checking.

#### `sign`
**Location**: Line 391 (source)
**Type Signature**: `(n: bigint) => Ordering`
**Category**: math
**Description**: Determines the sign of a given `bigint`. Returns `-1` for negative, `0` for zero, `1` for positive.

**Implementation**:
```typescript
export const sign = (n: bigint): Ordering => Order(n, bigint0)
```

**Usage**:
```typescript
import * as BI from "effect/BigInt"
import * as Match from "effect/Match"

BI.sign(-5n)  // -1
BI.sign(0n)   // 0
BI.sign(5n)   // 1

// Pattern match on sign
const describeSign = (n: bigint) =>
  Match.value(BI.sign(n)).pipe(
    Match.when(-1, () => "negative"),
    Match.when(0, () => "zero"),
    Match.when(1, () => "positive"),
    Match.exhaustive
  )

// Compose with predicates
const isNegative = (n: bigint) => BI.sign(n) === -1
const isPositive = (n: bigint) => BI.sign(n) === 1
const isZero = (n: bigint) => BI.sign(n) === 0
```

---

### Helper Function Used in Predicates

#### `sqrt` (uses predicate internally)
**Location**: Lines 507-508 (source)
**Type Signature**: `(n: bigint) => Option.Option<bigint>`
**Category**: math
**Description**: Safe square root that returns `Option.none()` for negative inputs.

**Implementation**:
```typescript
export const sqrt = (n: bigint): Option.Option<bigint> =>
  greaterThanOrEqualTo(n, bigint0) ? Option.some(unsafeSqrt(n)) : Option.none<bigint>()
```

**Predicate Pattern**: Uses `greaterThanOrEqualTo` internally to validate non-negativity before computing the square root.

---

## Comparison with Number Module

| Feature                | BigInt Module | Number Module | Notes |
|------------------------|---------------|---------------|-------|
| `isBigInt` / `isNumber` | ✅ Line 38 | ✅ | Type guards |
| `lessThan` | ✅ Line 210 | ✅ | Identical API |
| `lessThanOrEqualTo` | ✅ Line 231 | ✅ | Identical API |
| `greaterThan` | ✅ Line 252 | ✅ | Identical API |
| `greaterThanOrEqualTo` | ✅ Line 273 | ✅ | Identical API |
| `between` | ✅ Line 296 | ✅ | Identical API |
| `isPositive` | ❌ | ✅ | Must use `sign(n) === 1` |
| `isNegative` | ❌ | ✅ | Must use `sign(n) === -1` |
| `isZero` | ❌ | ✅ | Must use `sign(n) === 0` |
| `isInteger` | N/A | ✅ | All bigints are integers |
| `isNonNaN` | N/A | ✅ | Bigints cannot be NaN |
| `isFinite` | N/A | ✅ | All bigints are finite |

**Key Insight**: BigInt lacks dedicated sign predicates because the `sign` function returns `Ordering` (-1, 0, 1), which is more composable with Match patterns.

---

## Predicate Composition Patterns

### Range Validation
```typescript
import * as BI from "effect/BigInt"
import * as P from "effect/Predicate"

// Combine predicates for custom validation
const isValidAmount = P.and(
  BI.greaterThanOrEqualTo(0n),
  BI.lessThanOrEqualTo(1000000n)
)

isValidAmount(500n)      // true
isValidAmount(-10n)      // false
isValidAmount(2000000n)  // false
```

### Sign-Based Filtering
```typescript
import * as BI from "effect/BigInt"
import * as A from "effect/Array"
import * as F from "effect/Function"

const numbers = [-5n, -2n, 0n, 3n, 7n]

// Filter positive numbers
const positives = F.pipe(
  numbers,
  A.filter((n) => BI.sign(n) === 1)
)  // [3n, 7n]

// Partition by sign
const [negatives, nonNegatives] = F.pipe(
  numbers,
  A.partition((n) => BI.sign(n) === -1)
)
// negatives: [-5n, -2n]
// nonNegatives: [0n, 3n, 7n]
```

### Match-Based Sign Dispatch
```typescript
import * as BI from "effect/BigInt"
import * as Match from "effect/Match"

const absoluteOrDouble = (n: bigint) =>
  Match.value(BI.sign(n)).pipe(
    Match.when(-1, () => BI.abs(n)),
    Match.when(0, () => 0n),
    Match.when(1, () => n * 2n),
    Match.exhaustive
  )

absoluteOrDouble(-5n)  // 5n
absoluteOrDouble(0n)   // 0n
absoluteOrDouble(3n)   // 6n
```

---

## Integration with beep-effect

### SQL Model Validation

```typescript
import * as S from "effect/Schema"
import * as BI from "effect/BigInt"
import * as F from "effect/Function"

// BigInt field with range constraint
class PositiveBigInt extends S.BigIntFromSelf.pipe(
  S.filter((n) => BI.greaterThan(n, 0n), {
    message: () => "Must be a positive bigint"
  })
) {}

// Age in days (arbitrary precision)
class AgeDays extends S.BigIntFromSelf.pipe(
  S.filter(
    BI.between({ minimum: 0n, maximum: BigInt(365 * 150) }),
    { message: () => "Age must be between 0 and 150 years" }
  )
) {}
```

### Financial Amount Validation

```typescript
import * as BI from "effect/BigInt"
import * as S from "effect/Schema"

// Amount in smallest currency unit (e.g., cents, satoshis)
class MoneyAmount extends S.BigIntFromSelf.pipe(
  S.filter(BI.greaterThanOrEqualTo(0n), {
    message: () => "Amount cannot be negative"
  }),
  S.filter(BI.lessThanOrEqualTo(BigInt("9999999999999999")), {
    message: () => "Amount exceeds maximum"
  })
) {}

// Validate transaction limits
const isValidTransfer = (amount: bigint) =>
  F.pipe(
    amount,
    BI.between({
      minimum: BigInt(100),      // Minimum 1 unit
      maximum: BigInt(100000000) // Maximum 1M units
    })
  )
```

---

## Anti-Patterns to Avoid

### ❌ Using Native Comparison Operators
```typescript
// FORBIDDEN
if (amount > 0n) { ... }
if (balance >= requiredAmount) { ... }

// REQUIRED
import * as BI from "effect/BigInt"

if (BI.greaterThan(amount, 0n)) { ... }
if (BI.greaterThanOrEqualTo(balance, requiredAmount)) { ... }
```

### ❌ Manual Sign Checking
```typescript
// FORBIDDEN
if (n < 0n) { return "negative" }
if (n === 0n) { return "zero" }
if (n > 0n) { return "positive" }

// REQUIRED
import * as BI from "effect/BigInt"
import * as Match from "effect/Match"

Match.value(BI.sign(n)).pipe(
  Match.when(-1, () => "negative"),
  Match.when(0, () => "zero"),
  Match.when(1, () => "positive"),
  Match.exhaustive
)
```

### ❌ Unsafe Type Assertions
```typescript
// FORBIDDEN
const value = input as bigint

// REQUIRED
import * as BI from "effect/BigInt"

if (BI.isBigInt(input)) {
  // input is now narrowed to bigint
  const result = BI.multiply(input, 2n)
}
```

---

## Missing Predicates (Compared to Number)

The following predicates exist in `effect/Number` but are absent from `effect/BigInt`:

1. **`isPositive`**: Use `sign(n) === 1` or `greaterThan(n, 0n)`
2. **`isNegative`**: Use `sign(n) === -1` or `lessThan(n, 0n)`
3. **`isZero`**: Use `sign(n) === 0`
4. **`isInteger`**: Not applicable (all bigints are integers)
5. **`isNonNaN`**: Not applicable (bigints cannot be NaN)
6. **`isFinite`**: Not applicable (all bigints are finite)

### Recommended Helper Functions

```typescript
// Add to @beep/utils if needed frequently
import * as BI from "effect/BigInt"

export const isPositiveBigInt = (n: bigint): boolean =>
  BI.sign(n) === 1

export const isNegativeBigInt = (n: bigint): boolean =>
  BI.sign(n) === -1

export const isZeroBigInt = (n: bigint): boolean =>
  BI.sign(n) === 0

export const isNonZeroBigInt = (n: bigint): boolean =>
  BI.sign(n) !== 0
```

---

## Complete API Reference

### Type Guards
| Function | Return Type | Category | Line |
|----------|-------------|----------|------|
| `isBigInt` | `u is bigint` | guards | 38 |

### Comparison Predicates (All dual-syntax)
| Function | Return Type | Category | Line |
|----------|-------------|----------|------|
| `lessThan` | `boolean` | predicates | 210 |
| `lessThanOrEqualTo` | `boolean` | predicates | 231 |
| `greaterThan` | `boolean` | predicates | 252 |
| `greaterThanOrEqualTo` | `boolean` | predicates | 273 |
| `between` | `boolean` | predicates | 296 |

### Sign-Related
| Function | Return Type | Category | Line |
|----------|-------------|----------|------|
| `sign` | `Ordering` (-1, 0, 1) | math | 391 |

---

## Effect-Predicate-Master Integration

### Recommended Additions to Master Agent

1. **Document dual-syntax pattern**: All BigInt predicates support both data-first and data-last forms
2. **Sign predicate equivalents**: Provide mapping from Number predicates to BigInt patterns
3. **Financial validation patterns**: BigInt is primary choice for money/precision
4. **Range validation helpers**: `between` is frequently used for min/max constraints

### Code Generation Templates

```typescript
// Template: Range validation predicate
const is{Name}Range = BI.between({
  minimum: {MIN}n,
  maximum: {MAX}n
})

// Template: Sign-based filter
const {filterName} = A.filter((n: bigint) => BI.sign(n) === {-1|0|1})

// Template: Comparison predicate composition
const is{Name} = P.and(
  BI.greaterThanOrEqualTo({MIN}n),
  BI.lessThanOrEqualTo({MAX}n)
)
```

---

## References

- **Effect Source**: `/tmp/effect/packages/effect/src/BigInt.ts`
- **Type Definitions**: `/node_modules/effect/dist/dts/BigInt.d.ts`
- **Related Modules**: `effect/Number`, `effect/Order`, `effect/Predicate`
- **beep-effect AGENTS.md**: Critical Rules section on Effect utilities
