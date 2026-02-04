# Order — Agent Context

> Quick reference for AI agents working with `effect/Order`

## Quick Reference

| Function | Purpose | Example |
|----------|---------|---------|
| `Order.string` | String ordering | `A.sort(names, Order.string)` |
| `Order.number` | Number ordering | `A.sort(nums, Order.number)` |
| `Order.bigint` | BigInt ordering | `A.sort(bigNums, Order.bigint)` |
| `Order.boolean` | Boolean ordering (false < true) | `A.sort(flags, Order.boolean)` |
| `Order.Date` | Date ordering | `A.sort(dates, Order.Date)` |
| `Order.reverse(order)` | Reverse ordering | `Order.reverse(Order.number)` |
| `Order.mapInput(order, fn)` | Map before comparing | `Order.mapInput(Order.number, u => u.age)` |
| `Order.combine(o1, o2)` | Combine orderings | `Order.combine(byName, byAge)` |
| `Order.make(cmp)` | Custom ordering | `Order.make((a, b) => ...)` |

## Codebase Patterns

### ALWAYS Use Namespace Import

```typescript
// REQUIRED
import * as Order from "effect/Order";

// FORBIDDEN
import { Order } from "effect";
import { string, number } from "effect/Order";
```

### Basic Sorting with A.sort

Order is used with `A.sort` for sorting arrays:

```typescript
import * as A from "effect/Array";
import * as Order from "effect/Order";

// Sort numbers
const numbers = [3, 1, 4, 1, 5];
const sorted = A.sort(numbers, Order.number);  // [1, 1, 3, 4, 5]

// Sort strings
const names = ["Charlie", "Alice", "Bob"];
const sortedNames = A.sort(names, Order.string);  // ["Alice", "Bob", "Charlie"]
```

### Real Usage: Descending Sort

From `packages/knowledge/server/src/EntityResolution/EntityClusterer.ts`:

```typescript
import * as A from "effect/Array";
import * as Order from "effect/Order";

type EntitySimilarity = { entityA: string; entityB: string; similarity: number };

// Sort by similarity descending (highest first)
const sortedSimilarities = A.sort(
  similarities,
  Order.reverse(Order.mapInput(Order.number, (s: EntitySimilarity) => s.similarity))
);
```

**Pattern**: Use `Order.reverse()` for descending order.

### Real Usage: Sort by Property

From `packages/common/schema/src/derived/kits/tagged-values-kit.ts`:

```typescript
import * as A from "effect/Array";
import * as Order from "effect/Order";
import * as F from "effect/Function";

// Sort arrays of mixed types as strings
const arraysEqual = (a: ReadonlyArray<AST.LiteralValue>, b: ReadonlyArray<AST.LiteralValue>): boolean => {
  if (a.length !== b.length) return false;
  const sortedA = F.pipe(a, A.map(String), A.sort(Order.string));
  const sortedB = F.pipe(b, A.map(String), A.sort(Order.string));
  return F.pipe(
    A.zip(sortedA, sortedB),
    A.every(([x, y]) => x === y)
  );
};
```

### Order.mapInput - Sort by Field

Use `Order.mapInput` to sort objects by a specific field:

```typescript
import * as A from "effect/Array";
import * as Order from "effect/Order";

type User = { name: string; age: number };

const users: User[] = [
  { name: "Alice", age: 30 },
  { name: "Bob", age: 25 },
  { name: "Charlie", age: 35 },
];

// Sort by age
const byAge = Order.mapInput(Order.number, (user: User) => user.age);
const sortedByAge = A.sort(users, byAge);
// [{ name: "Bob", age: 25 }, { name: "Alice", age: 30 }, { name: "Charlie", age: 35 }]

// Sort by name
const byName = Order.mapInput(Order.string, (user: User) => user.name);
const sortedByName = A.sort(users, byName);
// [{ name: "Alice", ... }, { name: "Bob", ... }, { name: "Charlie", ... }]
```

**Pattern**: `Order.mapInput(baseOrder, extractField)` extracts the field to compare.

### Order.combine - Multi-Field Sort

Real usage from `packages/shared/domain/src/policy/policy-types.ts`:

```typescript
import * as A from "effect/Array";
import * as Order from "effect/Order";
import * as F from "effect/Function";

// Sort by priority descending
const byPriorityDesc = Order.reverse(
  Order.mapInput(Order.number, (rule: PolicyRule) => rule.priority)
);

// Apply filter then sort
const filtered = F.pipe(
  this.rules,
  A.filter(P.and(principalPred, P.and(actionPred, resourcePred))),
  A.sort(byPriorityDesc)
);
```

For **multiple sort keys**, combine orderings:

```typescript
import * as Order from "effect/Order";

type User = { name: string; age: number };

// Sort by name, then by age
const byName = Order.mapInput(Order.string, (u: User) => u.name);
const byAge = Order.mapInput(Order.number, (u: User) => u.age);

const byNameThenAge = Order.combine(byName, byAge);

const sortedUsers = A.sort(users, byNameThenAge);
// Sorts by name first, then age for ties
```

### Order.reverse - Descending Order

```typescript
import * as A from "effect/Array";
import * as Order from "effect/Order";

const numbers = [1, 3, 2, 5, 4];

// Ascending (default)
const asc = A.sort(numbers, Order.number);  // [1, 2, 3, 4, 5]

// Descending
const desc = A.sort(numbers, Order.reverse(Order.number));  // [5, 4, 3, 2, 1]
```

### Real Usage: Topological Sort

From `tooling/utils/src/repo/Graph.ts`:

```typescript
import * as A from "effect/Array";
import * as Order from "effect/Order";
import * as F from "effect/Function";

const stringOrder = Order.string;

// Sort dependencies alphabetically for deterministic output
const sorted = F.pipe(
  newZeroDegree,
  A.sort(stringOrder)
);
```

### Real Usage: Sort Config Tags

From `packages/common/schema/test/kits/taggedConfigKit.test.ts`:

```typescript
import * as HashMap from "effect/HashMap";
import * as A from "effect/Array";
import * as Order from "effect/Order";
import * as F from "effect/Function";

const tags = F.pipe(
  Priority.ConfigMap,
  HashMap.keys,
  A.fromIterable,
  A.sort(Order.string)
);
// Sorts HashMap keys alphabetically
```

### DateTime Ordering

```typescript
import * as A from "effect/Array";
import * as Order from "effect/Order";
import * as DateTime from "effect/DateTime";

// Order has built-in DateTime support
const events: Array<{ timestamp: DateTime.Utc }> = [...];

const byTimestamp = Order.mapInput(
  Order.Date,
  (event) => event.timestamp
);

const chronological = A.sort(events, byTimestamp);
```

### Custom Ordering

```typescript
import * as Order from "effect/Order";

type Status = "pending" | "active" | "complete";

const statusOrder = Order.make<Status>((a, b) => {
  const priority = { pending: 0, active: 1, complete: 2 };
  const pa = priority[a];
  const pb = priority[b];
  return pa < pb ? -1 : pa > pb ? 1 : 0;
});

const sorted = A.sort(statuses, statusOrder);
```

## Anti-Patterns

### NEVER Use Native Array.sort

```typescript
// FORBIDDEN - Native sort
array.sort()
array.sort((a, b) => a - b)
array.sort((a, b) => a.name.localeCompare(b.name))

// REQUIRED - A.sort with Order
import * as A from "effect/Array";
import * as Order from "effect/Order";

A.sort(array, Order.number)
A.sort(array, Order.mapInput(Order.string, (x) => x.name))
```

### NEVER Use Comparator Objects

```typescript
// FORBIDDEN - Some libraries use objects
A.sort(items, { compare: (a, b) => b.score - a.score })  // WRONG!

// REQUIRED - Use Order.mapInput or Order.reverse
import * as Order from "effect/Order";

const byScore = Order.reverse(
  Order.mapInput(Order.number, (item) => item.score)
);
A.sort(items, byScore);
```

### NEVER Negate for Descending

```typescript
// FORBIDDEN - Manual negation
const byScoreDesc = Order.mapInput(Order.number, (item) => -item.score);

// REQUIRED - Use Order.reverse
const byScoreDesc = Order.reverse(
  Order.mapInput(Order.number, (item) => item.score)
);
```

### NEVER Mix Order and Native Comparison

```typescript
// FORBIDDEN - Mixing paradigms
const sorted = array.sort((a, b) => Order.number(a.value, b.value));

// REQUIRED - Use A.sort with Order
const sorted = A.sort(array, Order.mapInput(Order.number, (x) => x.value));
```

## Related Modules

- **[Array.md](./Array.md)** - `A.sort` requires Order
- **[String.md](./String.md)** - String ordering with `Order.string`
- **[Number.md](./Number.md)** - Number ordering with `Order.number`
- **effect/DateTime** - DateTime ordering with `Order.Date`

## Source Reference

[`.repos/effect/packages/effect/src/Order.ts`](../../.repos/effect/packages/effect/src/Order.ts)

## Key Takeaways

1. **ALWAYS** use `import * as Order from "effect/Order"`
2. **NEVER** use native `array.sort()` - use `A.sort(array, order)`
3. **Use `Order.string` and `Order.number`** for primitive types
4. **Use `Order.mapInput`** to sort by object fields
5. **Use `Order.reverse`** for descending order (NOT manual negation)
6. **Use `Order.combine`** for multi-field sorts
7. **Order is a function** - `(a, b) => -1 | 0 | 1`
8. **Built-in orders**: `string`, `number`, `bigint`, `boolean`, `Date`
