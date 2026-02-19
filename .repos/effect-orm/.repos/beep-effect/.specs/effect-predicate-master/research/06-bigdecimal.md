# BigDecimal Predicates Research

## Overview

The `effect/BigDecimal` module provides utilities for working with arbitrary-precision decimal numbers. It includes several predicate functions for comparison and value checking operations. All predicates return `boolean` and follow Effect's dual signature pattern for both piped and direct usage.

## Module Purpose

`BigDecimal` allows storing any real number to arbitrary precision, avoiding common floating point errors (such as 0.1 + 0.2 ≠ 0.3). Internally, it uses a `BigInt` paired with a 64-bit integer representing the decimal point position.

**Source File**: `tmp/effect/packages/effect/src/BigDecimal.ts`

---

## Predicate Functions

### 1. Type Guard

#### `isBigDecimal`

**Line**: 95
**Category**: guards
**Signature**:
```typescript
export const isBigDecimal = (u: unknown): u is BigDecimal => hasProperty(u, TypeId)
```

**Description**: Checks if a given value is a `BigDecimal`.

**Example**:
```typescript
import * as BD from "effect/BigDecimal"

const value: unknown = BD.unsafeFromString("123.45")
if (BD.isBigDecimal(value)) {
  // value is now typed as BigDecimal
  console.log(value.value) // bigint
}
```

---

### 2. Comparison Predicates

#### `lessThan`

**Line**: 483-486
**Category**: predicates
**Signature**:
```typescript
export const lessThan: {
  (that: BigDecimal): (self: BigDecimal) => boolean
  (self: BigDecimal, that: BigDecimal): boolean
} = order.lessThan(Order)
```

**Description**: Returns `true` if the first argument is less than the second, otherwise `false`.

**Example**:
```typescript
import * as BD from "effect/BigDecimal"
import * as F from "effect/Function"

// Direct usage
BD.lessThan(BD.unsafeFromString("2"), BD.unsafeFromString("3")) // true
BD.lessThan(BD.unsafeFromString("3"), BD.unsafeFromString("3")) // false
BD.lessThan(BD.unsafeFromString("4"), BD.unsafeFromString("3")) // false

// Piped usage
F.pipe(
  BD.unsafeFromString("2"),
  BD.lessThan(BD.unsafeFromString("3"))
) // true
```

#### `lessThanOrEqualTo`

**Line**: 504-507
**Category**: predicates
**Signature**:
```typescript
export const lessThanOrEqualTo: {
  (that: BigDecimal): (self: BigDecimal) => boolean
  (self: BigDecimal, that: BigDecimal): boolean
} = order.lessThanOrEqualTo(Order)
```

**Description**: Checks if a given `BigDecimal` is less than or equal to the provided one.

**Example**:
```typescript
import * as BD from "effect/BigDecimal"
import * as F from "effect/Function"

BD.lessThanOrEqualTo(BD.unsafeFromString("2"), BD.unsafeFromString("3")) // true
BD.lessThanOrEqualTo(BD.unsafeFromString("3"), BD.unsafeFromString("3")) // true
BD.lessThanOrEqualTo(BD.unsafeFromString("4"), BD.unsafeFromString("3")) // false

// Piped usage
F.pipe(
  BD.unsafeFromString("3"),
  BD.lessThanOrEqualTo(BD.unsafeFromString("3"))
) // true
```

#### `greaterThan`

**Line**: 525-528
**Category**: predicates
**Signature**:
```typescript
export const greaterThan: {
  (that: BigDecimal): (self: BigDecimal) => boolean
  (self: BigDecimal, that: BigDecimal): boolean
} = order.greaterThan(Order)
```

**Description**: Returns `true` if the first argument is greater than the second, otherwise `false`.

**Example**:
```typescript
import * as BD from "effect/BigDecimal"
import * as F from "effect/Function"

BD.greaterThan(BD.unsafeFromString("2"), BD.unsafeFromString("3")) // false
BD.greaterThan(BD.unsafeFromString("3"), BD.unsafeFromString("3")) // false
BD.greaterThan(BD.unsafeFromString("4"), BD.unsafeFromString("3")) // true

// Piped usage
F.pipe(
  BD.unsafeFromString("4"),
  BD.greaterThan(BD.unsafeFromString("3"))
) // true
```

#### `greaterThanOrEqualTo`

**Line**: 546-549
**Category**: predicates
**Signature**:
```typescript
export const greaterThanOrEqualTo: {
  (that: BigDecimal): (self: BigDecimal) => boolean
  (self: BigDecimal, that: BigDecimal): boolean
} = order.greaterThanOrEqualTo(Order)
```

**Description**: Checks if a given `BigDecimal` is greater than or equal to the provided one.

**Example**:
```typescript
import * as BD from "effect/BigDecimal"
import * as F from "effect/Function"

BD.greaterThanOrEqualTo(BD.unsafeFromString("2"), BD.unsafeFromString("3")) // false
BD.greaterThanOrEqualTo(BD.unsafeFromString("3"), BD.unsafeFromString("3")) // true
BD.greaterThanOrEqualTo(BD.unsafeFromString("4"), BD.unsafeFromString("3")) // true

// Piped usage
F.pipe(
  BD.unsafeFromString("3"),
  BD.greaterThanOrEqualTo(BD.unsafeFromString("3"))
) // true
```

#### `between`

**Line**: 572-581
**Category**: predicates
**Signature**:
```typescript
export const between: {
  (options: {
    minimum: BigDecimal
    maximum: BigDecimal
  }): (self: BigDecimal) => boolean
  (self: BigDecimal, options: {
    minimum: BigDecimal
    maximum: BigDecimal
  }): boolean
} = order.between(Order)
```

**Description**: Checks if a `BigDecimal` is between a `minimum` and `maximum` value (inclusive).

**Example**:
```typescript
import * as BD from "effect/BigDecimal"
import * as F from "effect/Function"

const between1to5 = BD.between({
  minimum: BD.unsafeFromString("1"),
  maximum: BD.unsafeFromString("5")
})

between1to5(BD.unsafeFromString("3")) // true
between1to5(BD.unsafeFromString("0")) // false
between1to5(BD.unsafeFromString("6")) // false

// Direct usage
BD.between(BD.unsafeFromString("3"), {
  minimum: BD.unsafeFromString("1"),
  maximum: BD.unsafeFromString("5")
}) // true

// Piped usage
F.pipe(
  BD.unsafeFromString("3"),
  BD.between({
    minimum: BD.unsafeFromString("1"),
    maximum: BD.unsafeFromString("5")
  })
) // true
```

#### `equals`

**Line**: 792-795
**Category**: predicates
**Signature**:
```typescript
export const equals: {
  (that: BigDecimal): (self: BigDecimal) => boolean
  (self: BigDecimal, that: BigDecimal): boolean
} = dual(2, (self: BigDecimal, that: BigDecimal): boolean => Equivalence(self, that))
```

**Description**: Checks if two `BigDecimal`s are equal. Uses the `Equivalence` instance which properly handles scale differences (e.g., `1.0` equals `1.00`).

**Example**:
```typescript
import * as BD from "effect/BigDecimal"
import * as F from "effect/Function"

// Direct usage
BD.equals(BD.unsafeFromString("1.0"), BD.unsafeFromString("1.00")) // true
BD.equals(BD.unsafeFromString("1"), BD.unsafeFromString("2")) // false

// Piped usage
F.pipe(
  BD.unsafeFromString("1.0"),
  BD.equals(BD.unsafeFromString("1.00"))
) // true
```

---

### 3. Value Check Predicates

#### `isInteger`

**Line**: 1075
**Category**: predicates
**Signature**:
```typescript
export const isInteger = (n: BigDecimal): boolean => normalize(n).scale <= 0
```

**Description**: Checks if a given `BigDecimal` is an integer (has no fractional part).

**Example**:
```typescript
import * as BD from "effect/BigDecimal"

BD.isInteger(BD.unsafeFromString("0")) // true
BD.isInteger(BD.unsafeFromString("1")) // true
BD.isInteger(BD.unsafeFromString("1.1")) // false
BD.isInteger(BD.unsafeFromString("1.0")) // true (normalized)
```

#### `isZero`

**Line**: 1092
**Category**: predicates
**Signature**:
```typescript
export const isZero = (n: BigDecimal): boolean => n.value === bigint0
```

**Description**: Checks if a given `BigDecimal` is `0`.

**Example**:
```typescript
import * as BD from "effect/BigDecimal"

BD.isZero(BD.unsafeFromString("0")) // true
BD.isZero(BD.unsafeFromString("1")) // false
BD.isZero(BD.unsafeFromString("-1")) // false
BD.isZero(BD.unsafeFromString("0.0")) // true
```

#### `isNegative`

**Line**: 1110
**Category**: predicates
**Signature**:
```typescript
export const isNegative = (n: BigDecimal): boolean => n.value < bigint0
```

**Description**: Checks if a given `BigDecimal` is negative (less than zero).

**Example**:
```typescript
import * as BD from "effect/BigDecimal"

BD.isNegative(BD.unsafeFromString("-1")) // true
BD.isNegative(BD.unsafeFromString("0")) // false
BD.isNegative(BD.unsafeFromString("1")) // false
BD.isNegative(BD.unsafeFromString("-0.001")) // true
```

#### `isPositive`

**Line**: 1128
**Category**: predicates
**Signature**:
```typescript
export const isPositive = (n: BigDecimal): boolean => n.value > bigint0
```

**Description**: Checks if a given `BigDecimal` is positive (greater than zero).

**Example**:
```typescript
import * as BD from "effect/BigDecimal"

BD.isPositive(BD.unsafeFromString("-1")) // false
BD.isPositive(BD.unsafeFromString("0")) // false
BD.isPositive(BD.unsafeFromString("1")) // true
BD.isPositive(BD.unsafeFromString("0.001")) // true
```

---

## Supporting Order Instance

**Line**: 450-465
**Category**: instances

The module exports an `Order` instance that powers the comparison predicates:

```typescript
export const Order: order.Order<BigDecimal> = order.make((self, that) => {
  const scmp = order.number(sign(self), sign(that))
  if (scmp !== 0) {
    return scmp
  }

  if (self.scale > that.scale) {
    return order.bigint(self.value, scale(that, self.scale).value)
  }

  if (self.scale < that.scale) {
    return order.bigint(scale(self, that.scale).value, that.value)
  }

  return order.bigint(self.value, that.value)
})
```

This `Order` instance:
1. First compares signs for fast path
2. Scales values to the same scale before comparing
3. Uses `bigint` ordering for the final comparison

---

## Summary Table

| Function | Line | Returns | Description |
|----------|------|---------|-------------|
| `isBigDecimal` | 95 | `u is BigDecimal` | Type guard for BigDecimal |
| `lessThan` | 483 | `boolean` | Checks if self < that |
| `lessThanOrEqualTo` | 504 | `boolean` | Checks if self <= that |
| `greaterThan` | 525 | `boolean` | Checks if self > that |
| `greaterThanOrEqualTo` | 546 | `boolean` | Checks if self >= that |
| `between` | 572 | `boolean` | Checks if value is in [min, max] |
| `equals` | 792 | `boolean` | Checks if two values are equal |
| `isInteger` | 1075 | `boolean` | Checks if value has no fractional part |
| `isZero` | 1092 | `boolean` | Checks if value is zero |
| `isNegative` | 1110 | `boolean` | Checks if value < 0 |
| `isPositive` | 1128 | `boolean` | Checks if value > 0 |

---

## Usage Patterns

### Composition with Effect

BigDecimal predicates can be composed with Effect logic:

```typescript
import * as Effect from "effect/Effect"
import * as BD from "effect/BigDecimal"
import * as F from "effect/Function"

const validatePrice = (price: BD.BigDecimal) =>
  Effect.gen(function*() {
    if (BD.isNegative(price)) {
      return yield* Effect.fail("Price cannot be negative")
    }
    if (BD.isZero(price)) {
      return yield* Effect.fail("Price cannot be zero")
    }
    return price
  })

// Or with guards
const isValidPrice = (price: BD.BigDecimal): boolean =>
  F.pipe(
    price,
    BD.greaterThan(BD.unsafeFromString("0")),
  )
```

### Predicate Composition

```typescript
import * as BD from "effect/BigDecimal"
import * as P from "effect/Predicate"
import * as F from "effect/Function"

const isPositiveInteger = (n: BD.BigDecimal): boolean =>
  BD.isInteger(n) && BD.isPositive(n)

const isInRange = (min: BD.BigDecimal, max: BD.BigDecimal) =>
  (n: BD.BigDecimal): boolean =>
    BD.between(n, { minimum: min, maximum: max })

// Combining predicates
const isValidPercentage = (n: BD.BigDecimal): boolean =>
  P.and(
    BD.between({ minimum: BD.unsafeFromString("0"), maximum: BD.unsafeFromString("100") }),
    (x: BD.BigDecimal) => !BD.isNegative(x)
  )(n)
```

---

## Implementation Notes

1. **Scale Awareness**: Comparison predicates properly handle different scales (e.g., `1.0` vs `1.00`)
2. **Normalization**: `isInteger` uses normalization to handle trailing zeros
3. **Direct Value Checks**: `isZero`, `isNegative`, and `isPositive` check the underlying `bigint` value directly for performance
4. **Order Instance**: All comparison predicates are derived from the `Order` instance, ensuring consistency
5. **Dual Signatures**: All predicates (except value checks) support both direct and piped usage via Effect's `dual` pattern

---

## Related Functions

While not predicates themselves, these functions are commonly used with predicates:

- `sign(n: BigDecimal): Ordering` - Returns -1, 0, or 1 based on sign (line 673)
- `normalize(self: BigDecimal): BigDecimal` - Removes trailing zeros (line 146)
- `clamp(options: { minimum, maximum }): (self) => BigDecimal` - Restricts value to range (line 608)
- `min(self, that): BigDecimal` - Returns minimum (line 633)
- `max(self, that): BigDecimal` - Returns maximum (line 652)

---

## Agent Integration Recommendations

For the `effect-predicate-master` agent:

1. **Export all BigDecimal predicates** under a `BigDecimal` namespace
2. **Provide refined types** for predicates (e.g., `Predicate<BigDecimal>`)
3. **Add combinator support** for creating compound BigDecimal predicates
4. **Include range validators** using `between`, `lessThan`, etc.
5. **Add utility predicates**:
   - `isNonZero` = `P.not(BD.isZero)`
   - `isNonNegative` = `P.or(BD.isPositive, BD.isZero)`
   - `isNonPositive` = `P.or(BD.isNegative, BD.isZero)`
   - `isWholeNumber` = `BD.isInteger`
   - `isFractional` = `P.not(BD.isInteger)`

---

## Code Examples for Agent

```typescript
// Master predicate module should export:
import * as BD from "effect/BigDecimal"
import * as P from "effect/Predicate"
import * as F from "effect/Function"

export namespace BigDecimalP {
  // Re-export core predicates
  export const {
    isBigDecimal,
    lessThan,
    lessThanOrEqualTo,
    greaterThan,
    greaterThanOrEqualTo,
    between,
    equals,
    isInteger,
    isZero,
    isNegative,
    isPositive
  } = BD

  // Derived predicates
  export const isNonZero = P.not(BD.isZero)
  export const isNonNegative = (n: BD.BigDecimal): boolean =>
    BD.isPositive(n) || BD.isZero(n)
  export const isNonPositive = (n: BD.BigDecimal): boolean =>
    BD.isNegative(n) || BD.isZero(n)
  export const isFractional = P.not(BD.isInteger)

  // Range constructors
  export const inRange = (min: BD.BigDecimal, max: BD.BigDecimal) =>
    BD.between({ minimum: min, maximum: max })

  // Validation helpers
  export const isValidCurrency = (n: BD.BigDecimal): boolean =>
    F.pipe(
      n,
      BD.greaterThanOrEqualTo(BD.unsafeFromString("0"))
    )
}
```
