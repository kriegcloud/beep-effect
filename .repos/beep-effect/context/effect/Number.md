# Number — Agent Context

> Quick reference for AI agents working with `effect/Number`

## Quick Reference

| Function | Purpose | Example |
|----------|---------|---------|
| `Num.sum(a, b)` | Add two numbers | `Num.sum(5, 3)  // 8` |
| `Num.sumAll(nums)` | Sum all numbers in iterable | `Num.sumAll([1, 2, 3])  // 6` |
| `Num.multiply(a, b)` | Multiply two numbers | `Num.multiply(4, 5)  // 20` |
| `Num.multiplyAll(nums)` | Multiply all numbers | `Num.multiplyAll([2, 3, 4])  // 24` |
| `Num.subtract(a, b)` | Subtract b from a | `Num.subtract(10, 3)  // 7` |
| `Num.divide(a, b)` | Safe division (returns Option) | `Num.divide(10, 2)  // Some(5)` |
| `Num.unsafeDivide(a, b)` | Unsafe division (throws) | `Num.unsafeDivide(10, 0)  // throws` |
| `Num.remainder(a, b)` | Remainder of division | `Num.remainder(10, 3)  // 1` |
| `Num.increment(n)` | Add 1 | `Num.increment(5)  // 6` |
| `Num.decrement(n)` | Subtract 1 | `Num.decrement(5)  // 4` |
| `Num.negate(n)` | Additive inverse | `Num.negate(5)  // -5` |
| `Num.clamp(n, { minimum, maximum })` | Restrict to range | `Num.clamp(15, { minimum: 0, maximum: 10 })  // 10` |
| `Num.min(a, b)` | Minimum of two numbers | `Num.min(5, 3)  // 3` |
| `Num.max(a, b)` | Maximum of two numbers | `Num.max(5, 3)  // 5` |
| `Num.lessThan(a, b)` | a < b | `Num.lessThan(3, 5)  // true` |
| `Num.greaterThan(a, b)` | a > b | `Num.greaterThan(5, 3)  // true` |
| `Num.between(n, { minimum, maximum })` | Check if n in range | `Num.between(5, { minimum: 0, maximum: 10 })  // true` |
| `Num.parse(str)` | Safe parse (returns Option) | `Num.parse("42")  // Some(42)` |
| `Num.sign(n)` | Sign of number (-1, 0, 1) | `Num.sign(-5)  // -1` |
| `Num.round(n, precision)` | Round to precision | `Num.round(3.14159, 2)  // 3.14` |
| `Num.Order` | Order instance for sorting | `A.sort(nums, Num.Order)` |

## Codebase Patterns

### Pattern 1: RRF Scoring with Safe Division

**Use Case**: Calculate reciprocal rank fusion scores for search result ranking.

**Location**: `packages/knowledge/server/src/GraphRAG/RrfScorer.ts`

```typescript
import * as A from "effect/Array";
import * as Num from "effect/Number";

export const RRF_K = 60;

/**
 * Calculate single RRF score component
 * RRF(rank) = 1 / (k + rank)
 */
export const rrfComponent = (rank: number, k = RRF_K): number => {
  return 1 / (k + rank);  // Safe - k + rank always > 0
};

/**
 * Calculate combined RRF score from multiple rank positions
 */
export const rrfScore = (ranks: ReadonlyArray<number>, k = RRF_K): number => {
  return A.reduce(ranks, 0, (acc, rank) => acc + rrfComponent(rank, k));
};
```

**Note**: This uses native division operator because `k + rank` is guaranteed positive. For user input or potentially zero denominators, use `Num.divide` which returns `Option<number>`.

### Pattern 2: Sorting with Negated Scores (Descending Order)

**Use Case**: Sort items by score in descending order.

**Location**: `packages/knowledge/server/src/GraphRAG/RrfScorer.ts`

```typescript
import * as A from "effect/Array";
import * as Num from "effect/Number";
import * as Order from "effect/Order";

export const fuseRankings = <T extends string>(
  rankedLists: ReadonlyArray<ReadonlyArray<T>>,
  k = RRF_K
): ReadonlyArray<RankedItem<T>> => {
  // ... build items with scores

  return A.sort(
    items,
    Order.mapInput(Num.Order, (item: RankedItem<T>) => -item.score)
  );
};
```

**Pattern**: Use `Order.mapInput(Num.Order, x => -x.field)` to sort by descending numeric field.

### Pattern 3: Safe Parse with Option Handling

**Use Case**: Parse file size strings safely.

**Location**: `packages/common/schema/src/integrations/files/utils/formatSize.ts`

```typescript
import * as Num from "effect/Number";
import * as O from "effect/Option";
import * as F from "effect/Function";

export const parseSize = (sizeStr: string): number => {
  return F.pipe(
    Num.parse(sizeStr),
    O.getOrElse(() => 0)
  );
};
```

**Why**: `Num.parse` returns `Option<number>` for safe parsing. Use `O.getOrElse` to provide default for invalid inputs.

### Pattern 4: Clamping Values to Valid Ranges

**Use Case**: Constrain color picker values to valid RGB range.

**Location**: `packages/ui/editor/src/ui/color-picker.tsx`

```typescript
import * as Num from "effect/Number";

const normalizeRgbValue = (value: number): number => {
  return Num.clamp(value, { minimum: 0, maximum: 255 });
};

const parseRgbInput = (input: string): number => {
  const parsed = F.pipe(
    Num.parse(input),
    O.getOrElse(() => 0)
  );
  return normalizeRgbValue(parsed);
};
```

**Pattern**: Use `Num.clamp` to enforce valid ranges after computation or user input.

## Anti-Patterns

### NEVER: Use Native Arithmetic Operators in Pipelines

```typescript
// FORBIDDEN - Breaks pipeline composition
F.pipe(
  values,
  A.map(x => x + 1),  // Native operator
  A.reduce((acc, x) => acc + x, 0)  // Native operator
);
```

```typescript
// REQUIRED - Effect Number utilities
import * as Num from "effect/Number";

F.pipe(
  values,
  A.map(Num.increment),
  Num.sumAll
);
```

**Why**: Effect Number utilities are data-last (curry-friendly) and compose cleanly in pipelines. Native operators require arrow functions.

### NEVER: Use Math.min/Math.max with Array.reduce

```typescript
// FORBIDDEN - Verbose and error-prone
const maxValue = array.reduce((max, x) => Math.max(max, x), -Infinity);
```

```typescript
// REQUIRED - Use Order.min/max with Num.Order
import * as A from "effect/Array";
import * as Num from "effect/Number";
import * as O from "effect/Option";
import * as Order from "effect/Order";

const maxValue = F.pipe(
  array,
  A.head,  // Get first element as seed
  O.map(first => A.reduce(array, first, Num.max))
);

// Or for non-empty arrays
const maxValue = A.reduce(nonEmptyArray, A.headNonEmpty(nonEmptyArray), Num.max);
```

**Why**: `Num.max` and `Num.min` are data-last functions suitable for pipelines. Avoid `Math` global.

### NEVER: Use parseInt/parseFloat Directly

```typescript
// FORBIDDEN - Throws on invalid input
const value = parseInt(userInput, 10);
const price = parseFloat(priceStr);
```

```typescript
// REQUIRED - Safe parsing with Option
import * as Num from "effect/Number";
import * as O from "effect/Option";

const value = F.pipe(
  Num.parse(userInput),
  O.getOrElse(() => 0)
);

const price = F.pipe(
  Num.parse(priceStr),
  O.filter(x => Num.greaterThanOrEqualTo(x, 0)),
  O.getOrElse(() => 0)
);
```

**Why**: `Num.parse` returns `Option<number>`, making error handling explicit. Native parse functions return `NaN` which propagates silently.

### NEVER: Use typeof n === "number" for Type Guards

```typescript
// FORBIDDEN - Native type guard
if (typeof value === "number") {
  // TypeScript narrows to number
}
```

```typescript
// REQUIRED - Effect Predicate
import * as P from "effect/Predicate";

if (P.isNumber(value)) {
  // TypeScript narrows to number
}
```

**Why**: Consistency with Effect ecosystem. `P.isNumber` is the canonical type guard in Effect codebases.

### NEVER: Use Division Operator Without Zero Check

```typescript
// DANGEROUS - Division by zero returns Infinity
const ratio = numerator / denominator;
```

```typescript
// SAFE - Use Num.divide for validated division
import * as Num from "effect/Number";
import * as O from "effect/Option";

const ratioOpt = Num.divide(numerator, denominator);
const ratio = O.getOrElse(ratioOpt, () => 0);

// Or handle error explicitly
const result = F.pipe(
  Num.divide(numerator, denominator),
  O.match({
    onNone: () => Effect.fail(new DivisionByZeroError()),
    onSome: (ratio) => Effect.succeed(ratio)
  })
);
```

**Why**: `Num.divide` returns `Option.none()` for division by zero, forcing explicit error handling.

## Composition Patterns

### Pipeline-Friendly Arithmetic

```typescript
import * as F from "effect/Function";
import * as Num from "effect/Number";

// Chainable transformations
const result = F.pipe(
  10,
  Num.increment,      // 11
  Num.multiply(2),    // 22
  Num.subtract(2),    // 20
  Num.divide(4),      // Some(5)
  O.getOrElse(() => 0)
);
```

### Range Validation

```typescript
import * as Num from "effect/Number";
import * as P from "effect/Predicate";

const isValidPercentage = (n: number): boolean =>
  Num.between(n, { minimum: 0, maximum: 100 });

const clampPercentage = (n: number): number =>
  Num.clamp(n, { minimum: 0, maximum: 100 });
```

### Sorting Numeric Fields

```typescript
import * as A from "effect/Array";
import * as Num from "effect/Number";
import * as Order from "effect/Order";

// Ascending by age
const byAge = Order.mapInput(
  Num.Order,
  (person: Person) => person.age
);

// Descending by score
const byScoreDesc = Order.mapInput(
  Num.Order,
  (item: ScoredItem) => -item.score
);

const sortedPeople = A.sort(people, byAge);
const topScorers = A.sort(items, byScoreDesc);
```

## Import Convention

ALWAYS use namespace import with alias:

```typescript
import * as Num from "effect/Number";
```

NEVER use:
```typescript
// FORBIDDEN
import { sum, multiply } from "effect/Number";  // No tree-shaking benefit
import * as Number from "effect/Number";  // Shadows global Number
```

**Why**: `Num` alias avoids shadowing built-in `Number` global and maintains consistency with codebase patterns (`A` for Array, `Str` for String, etc.).

## Related Modules

- [BigInt.md](./BigInt.md) - BigInt arithmetic utilities
- [BigDecimal.md](./BigDecimal.md) - Arbitrary-precision decimals
- [Order.md](./Order.md) - Ordering and comparison
- [Predicate.md](./Predicate.md) - Type guards and predicates
- [Array.md](./Array.md) - Array transformations (uses Num for reductions)

## Source Reference

[.repos/effect/packages/effect/src/Number.ts](../../.repos/effect/packages/effect/src/Number.ts)
