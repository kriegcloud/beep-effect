# Duration Module - Predicate Functions Research

## Executive Summary

The `effect/Duration` module provides a comprehensive suite of predicate and comparison functions for working with time durations. This research documents all boolean-returning functions, type guards, and comparison operations available in the Duration API.

**Key findings:**
- 3 type guard predicates (`isDuration`, `isFinite`, `isZero`)
- 5 comparison predicates (`lessThan`, `lessThanOrEqualTo`, `greaterThan`, `greaterThanOrEqualTo`, `equals`)
- 1 range predicate (`between`)
- All predicates support both curried and data-first forms via `dual`
- Internal comparison logic uses `matchWith` pattern matching for correct bigint/number handling

---

## Research Sources

- **Source File**: `/tmp/effect/packages/effect/src/Duration.ts`
- **Type Definitions**: `/node_modules/effect/dist/dts/Duration.d.ts`
- **Module Documentation**: Effect 3.x official API

---

## Type Guards

### `isDuration` (Line 208)

**Category**: guards
**Since**: 2.0.0

**Type Signature**:
```typescript
export const isDuration = (u: unknown): u is Duration
```

**Description**: Type guard that checks if a value is a `Duration` instance.

**Implementation**:
```typescript
export const isDuration = (u: unknown): u is Duration => hasProperty(u, TypeId)
```

**Usage**:
```typescript
import * as Duration from "effect/Duration"

const value: unknown = Duration.seconds(5)

if (Duration.isDuration(value)) {
  // value is narrowed to Duration
  const millis = Duration.toMillis(value)
}
```

**Pattern**: Uses Effect's `hasProperty` predicate to check for the `TypeId` symbol.

---

### `isFinite` (Line 214)

**Category**: guards
**Since**: 2.0.0

**Type Signature**:
```typescript
export const isFinite = (self: Duration): boolean
```

**Description**: Checks if a duration is finite (not infinite).

**Implementation**:
```typescript
export const isFinite = (self: Duration): boolean => self.value._tag !== "Infinity"
```

**Usage**:
```typescript
import * as Duration from "effect/Duration"

const finite = Duration.seconds(10)
const infinite = Duration.infinity

Duration.isFinite(finite)   // true
Duration.isFinite(infinite) // false
```

**Pattern**: Direct discriminated union tag check against `"Infinity"`.

---

### `isZero` (Line 220)

**Category**: guards
**Since**: 3.5.0

**Type Signature**:
```typescript
export const isZero = (self: Duration): boolean
```

**Description**: Checks if a duration represents zero time.

**Implementation**:
```typescript
export const isZero = (self: Duration): boolean => {
  switch (self.value._tag) {
    case "Millis": {
      return self.value.millis === 0
    }
    case "Nanos": {
      return self.value.nanos === bigint0
    }
    case "Infinity": {
      return false
    }
  }
}
```

**Usage**:
```typescript
import * as Duration from "effect/Duration"

Duration.isZero(Duration.zero)         // true
Duration.isZero(Duration.seconds(0))   // true
Duration.isZero(Duration.millis(1))    // false
Duration.isZero(Duration.infinity)     // false
```

**Pattern**: Exhaustive pattern matching on `DurationValue._tag` with appropriate zero checks for each representation.

---

## Comparison Predicates

All comparison predicates use the `dual` combinator to support both curried and data-first forms, and leverage `matchWith` internally to handle `Millis` vs `Nanos` representations correctly.

### `lessThan` (Line 694)

**Category**: predicates
**Since**: 2.0.0

**Type Signature**:
```typescript
export const lessThan: {
  (that: DurationInput): (self: DurationInput) => boolean
  (self: DurationInput, that: DurationInput): boolean
}
```

**Description**: Checks if `self` is strictly less than `that`.

**Implementation**:
```typescript
export const lessThan = dual(
  2,
  (self: DurationInput, that: DurationInput): boolean =>
    matchWith(self, that, {
      onMillis: (self, that) => self < that,
      onNanos: (self, that) => self < that
    })
)
```

**Usage**:
```typescript
import * as Duration from "effect/Duration"
import * as F from "effect/Function"

// Data-first form
Duration.lessThan(Duration.seconds(5), Duration.seconds(10)) // true

// Curried form (for pipe)
F.pipe(
  Duration.seconds(5),
  Duration.lessThan(Duration.seconds(10))
) // true

// With DurationInput flexibility
Duration.lessThan(1000, 2000)        // true (numbers as millis)
Duration.lessThan("5 seconds", "10 seconds") // true
```

**Pattern**: Uses `matchWith` to ensure both durations are converted to the same representation (millis or nanos) before comparison.

---

### `lessThanOrEqualTo` (Line 710)

**Category**: predicates
**Since**: 2.0.0

**Type Signature**:
```typescript
export const lessThanOrEqualTo: {
  (that: DurationInput): (self: DurationInput) => boolean
  (self: DurationInput, that: DurationInput): boolean
}
```

**Description**: Checks if `self` is less than or equal to `that`.

**Implementation**:
```typescript
export const lessThanOrEqualTo = dual(
  2,
  (self: DurationInput, that: DurationInput): boolean =>
    matchWith(self, that, {
      onMillis: (self, that) => self <= that,
      onNanos: (self, that) => self <= that
    })
)
```

**Usage**:
```typescript
import * as Duration from "effect/Duration"

Duration.lessThanOrEqualTo(Duration.seconds(5), Duration.seconds(5))  // true
Duration.lessThanOrEqualTo(Duration.seconds(5), Duration.seconds(10)) // true
Duration.lessThanOrEqualTo(Duration.seconds(10), Duration.seconds(5)) // false
```

---

### `greaterThan` (Line 726)

**Category**: predicates
**Since**: 2.0.0

**Type Signature**:
```typescript
export const greaterThan: {
  (that: DurationInput): (self: DurationInput) => boolean
  (self: DurationInput, that: DurationInput): boolean
}
```

**Description**: Checks if `self` is strictly greater than `that`.

**Implementation**:
```typescript
export const greaterThan = dual(
  2,
  (self: DurationInput, that: DurationInput): boolean =>
    matchWith(self, that, {
      onMillis: (self, that) => self > that,
      onNanos: (self, that) => self > that
    })
)
```

**Usage**:
```typescript
import * as Duration from "effect/Duration"

Duration.greaterThan(Duration.seconds(10), Duration.seconds(5)) // true
Duration.greaterThan(Duration.seconds(5), Duration.seconds(10)) // false
Duration.greaterThan(Duration.infinity, Duration.days(999))    // true
```

---

### `greaterThanOrEqualTo` (Line 742)

**Category**: predicates
**Since**: 2.0.0

**Type Signature**:
```typescript
export const greaterThanOrEqualTo: {
  (that: DurationInput): (self: DurationInput) => boolean
  (self: DurationInput, that: DurationInput): boolean
}
```

**Description**: Checks if `self` is greater than or equal to `that`.

**Implementation**:
```typescript
export const greaterThanOrEqualTo = dual(
  2,
  (self: DurationInput, that: DurationInput): boolean =>
    matchWith(self, that, {
      onMillis: (self, that) => self >= that,
      onNanos: (self, that) => self >= that
    })
)
```

**Usage**:
```typescript
import * as Duration from "effect/Duration"

Duration.greaterThanOrEqualTo(Duration.seconds(10), Duration.seconds(10)) // true
Duration.greaterThanOrEqualTo(Duration.seconds(10), Duration.seconds(5))  // true
Duration.greaterThanOrEqualTo(Duration.seconds(5), Duration.seconds(10))  // false
```

---

### `equals` (Line 758)

**Category**: predicates
**Since**: 2.0.0

**Type Signature**:
```typescript
export const equals: {
  (that: DurationInput): (self: DurationInput) => boolean
  (self: DurationInput, that: DurationInput): boolean
}
```

**Description**: Checks if two durations are equal in value.

**Implementation**:
```typescript
export const equals = dual(
  2,
  (self: DurationInput, that: DurationInput): boolean =>
    Equivalence(decode(self), decode(that))
)
```

Where `Equivalence` is defined (Line 535):
```typescript
export const Equivalence: equivalence.Equivalence<Duration> = (self, that) =>
  matchWith(self, that, {
    onMillis: (self, that) => self === that,
    onNanos: (self, that) => self === that
  })
```

**Usage**:
```typescript
import * as Duration from "effect/Duration"

Duration.equals(Duration.seconds(5), Duration.millis(5000))  // true
Duration.equals(Duration.seconds(5), Duration.seconds(10))   // false

// Works with DurationInput (auto-decode)
Duration.equals(5000, Duration.seconds(5))  // true
Duration.equals("5 seconds", "5000 millis") // true
```

**Pattern**: Uses the `Equivalence` instance which internally uses `matchWith` to ensure correct comparison across different internal representations.

---

## Range Predicates

### `between` (Line 520)

**Category**: predicates
**Since**: 2.0.0

**Type Signature**:
```typescript
export const between: {
  (options: {
    minimum: DurationInput
    maximum: DurationInput
  }): (self: DurationInput) => boolean
  (self: DurationInput, options: {
    minimum: DurationInput
    maximum: DurationInput
  }): boolean
}
```

**Description**: Checks if a duration falls within a specified range (inclusive).

**Implementation**:
```typescript
export const between = order.between(order.mapInput(Order, decode))
```

This delegates to the `order.between` combinator using the `Order` instance.

**Usage**:
```typescript
import * as Duration from "effect/Duration"
import * as F from "effect/Function"

// Data-first form
Duration.between(
  Duration.seconds(5),
  { minimum: Duration.seconds(1), maximum: Duration.seconds(10) }
) // true

// Curried form
const isValidTimeout = Duration.between({
  minimum: Duration.millis(100),
  maximum: Duration.seconds(30)
})

isValidTimeout(Duration.seconds(5))  // true
isValidTimeout(Duration.millis(50))  // false
isValidTimeout(Duration.minutes(1))  // false

// With pipe
F.pipe(
  Duration.seconds(5),
  Duration.between({ minimum: Duration.seconds(1), maximum: Duration.seconds(10) })
) // true
```

**Pattern**: Uses Effect's Order module utilities to implement inclusive range checking. The `order.mapInput(Order, decode)` ensures that `DurationInput` values are normalized before comparison.

---

## Supporting Comparison Infrastructure

### `Order` Instance (Line 507)

**Category**: instances
**Since**: 2.0.0

**Type Signature**:
```typescript
export const Order: order.Order<Duration>
```

**Implementation**:
```typescript
export const Order: order.Order<Duration> = order.make((self, that) =>
  matchWith(self, that, {
    onMillis: (self, that) => (self < that ? -1 : self > that ? 1 : 0),
    onNanos: (self, that) => (self < that ? -1 : self > that ? 1 : 0)
  })
)
```

**Description**: The canonical `Order` instance for `Duration`, used by ordering utilities like `min`, `max`, `clamp`, and `between`.

**Usage**:
```typescript
import * as Duration from "effect/Duration"
import * as O from "effect/Order"

const durations = [
  Duration.seconds(10),
  Duration.seconds(5),
  Duration.seconds(15)
]

// Sort using Order instance
const sorted = durations.sort(Duration.Order.compare)
// [Duration.seconds(5), Duration.seconds(10), Duration.seconds(15)]
```

---

## Derived Order Functions (Not Predicates)

While these don't return `boolean`, they leverage the predicate infrastructure:

### `min` (Line 546)
Returns the smaller of two durations.

### `max` (Line 557)
Returns the larger of two durations.

### `clamp` (Line 568)
Constrains a duration to a range.

---

## Pattern Matching Utilities

While not predicates themselves, these functions support the predicate implementations:

### `matchWith` (Line 456)

**Type Signature**:
```typescript
export const matchWith: {
  <A, B>(
    that: DurationInput,
    options: {
      readonly onMillis: (self: number, that: number) => A
      readonly onNanos: (self: bigint, that: bigint) => B
    }
  ): (self: DurationInput) => A | B
  <A, B>(
    self: DurationInput,
    that: DurationInput,
    options: {
      readonly onMillis: (self: number, that: number) => A
      readonly onNanos: (self: bigint, that: bigint) => B
    }
  ): A | B
}
```

**Description**: Pattern match on two durations simultaneously, ensuring both are in the same representation (millis or nanos).

**Critical Logic** (Line 482-495):
```typescript
const _self = decode(self)
const _that = decode(that)
if (_self.value._tag === "Infinity" || _that.value._tag === "Infinity") {
  return options.onMillis(
    toMillis(_self),
    toMillis(_that)
  )
} else if (_self.value._tag === "Nanos" || _that.value._tag === "Nanos") {
  const selfNanos = _self.value._tag === "Nanos" ?
    _self.value.nanos :
    BigInt(Math.round(_self.value.millis * 1_000_000))
  const thatNanos = _that.value._tag === "Nanos" ?
    _that.value.nanos :
    BigInt(Math.round(_that.value.millis * 1_000_000))
  return options.onNanos(selfNanos, thatNanos)
}

return options.onMillis(
  _self.value.millis,
  _that.value.millis
)
```

**Pattern**: This is the foundation for all comparison predicates. It ensures:
1. Infinity durations are compared as numbers (Infinity)
2. If either duration uses nanosecond precision, both are converted to nanos
3. Otherwise, both are compared as milliseconds

---

## Complete Predicate API Reference

| Function | Return Type | Category | Since | Line |
|----------|-------------|----------|-------|------|
| `isDuration` | `u is Duration` | Type Guard | 2.0.0 | 208 |
| `isFinite` | `boolean` | Type Guard | 2.0.0 | 214 |
| `isZero` | `boolean` | Type Guard | 3.5.0 | 220 |
| `lessThan` | `boolean` | Comparison | 2.0.0 | 694 |
| `lessThanOrEqualTo` | `boolean` | Comparison | 2.0.0 | 710 |
| `greaterThan` | `boolean` | Comparison | 2.0.0 | 726 |
| `greaterThanOrEqualTo` | `boolean` | Comparison | 2.0.0 | 742 |
| `equals` | `boolean` | Comparison | 2.0.0 | 758 |
| `between` | `boolean` | Range | 2.0.0 | 520 |

---

## Usage Patterns for beep-effect

### Pattern 1: Type-Safe Timeout Validation

```typescript
import * as Duration from "effect/Duration"
import * as F from "effect/Function"
import * as P from "effect/Predicate"

// Create a predicate for valid API timeouts
const isValidApiTimeout = F.pipe(
  Duration.between({
    minimum: Duration.millis(100),
    maximum: Duration.seconds(30)
  })
)

// Use in validation
const validateTimeout = (input: Duration.DurationInput) =>
  F.pipe(
    Duration.decode(input),
    (d) => isValidApiTimeout(d) ?
      Option.some(d) :
      Option.none()
  )
```

### Pattern 2: Combining with Match for Complex Logic

```typescript
import * as Duration from "effect/Duration"
import * as Match from "effect/Match"

const categorizeResponseTime = (duration: Duration.Duration) =>
  Match.value(duration).pipe(
    Match.when(
      Duration.lessThan(Duration.millis(100)),
      () => "fast"
    ),
    Match.when(
      Duration.between({
        minimum: Duration.millis(100),
        maximum: Duration.seconds(1)
      }),
      () => "normal"
    ),
    Match.when(
      Duration.greaterThan(Duration.seconds(1)),
      () => "slow"
    ),
    Match.exhaustive
  )
```

### Pattern 3: Duration-Based Rate Limiting

```typescript
import * as Duration from "effect/Duration"
import * as Effect from "effect/Effect"

const canRetry = (
  elapsedTime: Duration.Duration,
  maxRetryWindow: Duration.Duration
): boolean =>
  Duration.lessThanOrEqualTo(elapsedTime, maxRetryWindow)

const retryWithBackoff = (
  attempt: number,
  elapsed: Duration.Duration
) =>
  Effect.gen(function*() {
    const maxWindow = Duration.minutes(5)

    if (Duration.greaterThan(elapsed, maxWindow)) {
      return yield* Effect.fail(new Error("Retry window exceeded"))
    }

    const backoff = Duration.times(
      Duration.seconds(Math.pow(2, attempt)),
      1
    )

    yield* Effect.sleep(backoff)
  })
```

### Pattern 4: Effect Array Filtering with Duration Predicates

```typescript
import * as Duration from "effect/Duration"
import * as A from "effect/Array"
import * as F from "effect/Function"

interface CacheEntry {
  key: string
  age: Duration.Duration
}

const pruneExpiredEntries = (
  entries: CacheEntry[],
  maxAge: Duration.Duration
) =>
  F.pipe(
    entries,
    A.filter((entry) =>
      Duration.lessThanOrEqualTo(entry.age, maxAge)
    )
  )
```

---

## Anti-Patterns to Avoid

### ❌ Don't Use Native Comparison on Milliseconds

```typescript
// ❌ WRONG - loses precision, doesn't handle infinity
const isFaster = (a: Duration.Duration, b: Duration.Duration) =>
  Duration.toMillis(a) < Duration.toMillis(b)

// ✅ CORRECT - uses proper comparison
const isFaster = Duration.lessThan
```

### ❌ Don't Forget to Decode DurationInput

```typescript
// ❌ WRONG - assumes input is already Duration
const isLong = (d: Duration.DurationInput) =>
  d.value._tag === "Infinity" // Type error! DurationInput is not Duration

// ✅ CORRECT - decode first
const isLong = (d: Duration.DurationInput) => {
  const decoded = Duration.decode(d)
  return !Duration.isFinite(decoded) ||
    Duration.greaterThan(decoded, Duration.hours(1))
}
```

### ❌ Don't Manually Pattern Match for Comparisons

```typescript
// ❌ WRONG - reimplements what Duration.equals already does
const areEqual = (a: Duration.Duration, b: Duration.Duration) => {
  if (a.value._tag === "Millis" && b.value._tag === "Millis") {
    return a.value.millis === b.value.millis
  }
  // ... more manual logic
}

// ✅ CORRECT - use the provided predicate
const areEqual = Duration.equals
```

---

## Key Insights for Effect-Predicate-Master Agent

1. **Dual Forms**: All comparison predicates support both data-first and curried forms via `dual(2, ...)`, making them composable with `pipe` and usable in both imperative and functional styles.

2. **DurationInput Flexibility**: Comparison predicates accept `DurationInput`, not just `Duration`, allowing comparisons with numbers, bigints, tuples, and strings without explicit conversion.

3. **Precision Handling**: The `matchWith` pattern ensures correct comparison regardless of whether durations use millisecond or nanosecond precision internally.

4. **Order Integration**: Duration predicates integrate with Effect's `Order` module, enabling higher-order operations like sorting, min/max, clamping, and range checking.

5. **Type Guard Pattern**: `isDuration` uses the canonical Effect pattern `hasProperty(u, TypeId)` for branded type checking.

6. **Zero Detection**: `isZero` handles all three internal representations (`Millis`, `Nanos`, `Infinity`) with appropriate zero checks.

7. **Infinity Handling**: All predicates correctly handle `Duration.infinity` by converting to numeric Infinity in comparisons.

---

## References

- **Source Code**: `tmp/effect/packages/effect/src/Duration.ts`
- **Type Definitions**: `node_modules/effect/dist/dts/Duration.d.ts`
- **Effect Order Module**: `effect/Order` (used for `between`, `min`, `max`, `clamp`)
- **Effect Predicate Module**: `effect/Predicate` (used for `hasProperty` in `isDuration`)
- **Related Modules**: `effect/DateTime` (similar temporal predicate patterns)
