---
title: Number.ts
nav_order: 14
parent: "@beep/utils"
---

## Number.ts overview

Numeric predicates and `effect/Number` re-exports.

Since v0.0.0

---
## Exports Grouped by Category
- [predicates](#predicates)
  - [isInteger](#isinteger)
- [utilities](#utilities)
  - ["effect/Number" (namespace export)](#effectnumber-namespace-export)
- [validation](#validation)
  - [isPositive](#ispositive)
---

# predicates

## isInteger

Type guard that checks whether a value is a `number` and an integer.

**Example**

```ts
import { N } from "@beep/utils"

const whole = N.isInteger(42)
// true

const fractional = N.isInteger(3.14)
// false

const notNum = N.isInteger("42")
// false

console.log(whole)
console.log(fractional)
console.log(notNum)
```

**Signature**

```ts
declare const isInteger: (u: unknown) => u is number
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Number.ts#L83)

Since v0.0.0

# utilities

## "effect/Number" (namespace export)

Re-exports all named exports from the "effect/Number" module.

**Example**

```ts
import * as Num from "@beep/utils/Number"

console.log(Num)
```

**Signature**

```ts
export * from "effect/Number"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Number.ts#L57)

Since v0.0.0

# validation

## isPositive

Determines if the given input is a number and is positive (greater than or equal to 0).

This utility function serves as a type guard ensuring the input is a `number`
and meets the condition of being at least 0. Useful when validating or filtering
data in both functional and effect contexts.

**Example**

```ts
```typescript
import { isPositive } from "@beep/utils/Number";
import * as A from "effect/Array";

const values = [3, -1, 0, 42, -7];

// Basic usage: Filter out negative numbers
const positives = A.filter(values, isPositive);
console.log(positives); // Output: [3, 0, 42]

// Type guard usage to refine unknown input types
const value: unknown = 5;
if (isPositive(value)) {
  const doubled = value * 2;
  console.log(doubled);
}
```
```

**See**

- N.isGreaterThanOrEqualTo for comparison implementation details.

**Signature**

```ts
declare const isPositive: (u: unknown) => u is number
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Number.ts#L41)

Since v0.0.0