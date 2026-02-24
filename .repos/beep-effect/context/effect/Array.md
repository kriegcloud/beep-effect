# Array — Agent Context

> Best practices for using `effect/Array` in this codebase.

## Quick Reference

| Function | Purpose | Example |
|----------|---------|---------|
| `A.map(array, fn)` | Transform elements | `A.map(users, u => u.name)` |
| `A.filter(array, pred)` | Filter elements | `A.filter(items, i => i.active)` |
| `A.reduce(array, init, fn)` | Reduce to single value | `A.reduce(nums, 0, (acc, n) => acc + n)` |
| `A.head(array)` | Get first element (Option) | `A.head(items)` → `Option<T>` |
| `A.tail(array)` | Get all but first | `A.tail(items)` |
| `A.isEmptyReadonlyArray(array)` | Check if empty | `A.isEmptyReadonlyArray(items)` |
| `A.append(array, item)` | Add to end | `A.append(items, newItem)` |
| `A.prepend(array, item)` | Add to start | `A.prepend(items, newItem)` |
| `A.join(array, sep)` | Join strings | `A.join(strings, ", ")` |
| `A.contains(array, item)` | Check membership | `A.contains(items, target)` |
| `A.get(array, index)` | Get element (Option) | `A.get(items, 0)` → `Option<T>` |
| `A.sort(array, order)` | Sort elements | `A.sort(nums, Order.number)` |
| `A.length(array)` | Get length | `A.length(items)` |

## Codebase Patterns

### ALWAYS Use Namespace Import

```typescript
// REQUIRED - Import as namespace
import * as A from "effect/Array";

// FORBIDDEN - Named imports
import { map, filter } from "effect/Array";  // WRONG!
```

### ALWAYS Use Effect Array Functions

This codebase has **banned native JavaScript array methods**. Route ALL array operations through `effect/Array`:

```typescript
// FORBIDDEN - Native methods
const names = users.map(u => u.name);
const active = users.filter(u => u.active);
const isEmpty = users.length === 0;
const first = users[0];
const total = users.reduce((acc, u) => acc + u.count, 0);

// REQUIRED - Effect Array functions
import * as A from "effect/Array";

const names = A.map(users, u => u.name);
const active = A.filter(users, u => u.active);
const isEmpty = A.isEmptyReadonlyArray(users);
const first = A.head(users);  // Returns Option<User>
const total = A.reduce(users, 0, (acc, u) => acc + u.count);
```

### Use with F.pipe for Composition

```typescript
import * as A from "effect/Array";
import * as F from "effect/Function";

const result = F.pipe(
  users,
  A.filter(u => u.active),
  A.map(u => u.name),
  A.sort(Order.string),
  A.join(", ")
);
```

### Head/Tail Return Option

`A.head` and `A.get` return `Option<T>` for safe access:

```typescript
import * as A from "effect/Array";
import * as O from "effect/Option";

const maybeFirst = A.head(users);

// Pattern match on the Option
O.match(maybeFirst, {
  onNone: () => "No users",
  onSome: (user) => user.name
});

// Or use getOrElse
const firstOrDefault = O.pipe(
  maybeFirst,
  O.getOrElse(() => defaultUser)
);
```

### NonEmptyReadonlyArray Type

Use when an array must have at least one element:

```typescript
import * as A from "effect/Array";

type LiteralsType = A.NonEmptyReadonlyArray<string>;

// Used in string literal kits
const statusValues: LiteralsType = ["pending", "active", "complete"];
```

### Working with Indices

```typescript
import * as A from "effect/Array";
import * as O from "effect/Option";

// Safe index access returns Option
const maybeThird = A.get(items, 2);

// Use reduce with index
const indexed = A.reduce(
  items,
  [] as Array<[number, Item]>,
  (acc, item, index) => A.append(acc, [index, item])
);
```

### Sorting with Order

```typescript
import * as A from "effect/Array";
import * as Order from "effect/Order";
import * as Num from "effect/Number";

// Sort numbers
const sorted = A.sort(numbers, Order.number);

// Sort with custom comparator
const byAge = Order.mapInput(Order.number, (user: User) => user.age);
const sortedUsers = A.sort(users, byAge);
```

## Anti-Patterns

### NEVER Use Native Array Methods

```typescript
// FORBIDDEN - Will cause remediation work
array.map(fn)
array.filter(pred)
array.reduce(fn, init)
array.sort()
array.forEach(fn)
array.find(pred)
array.findIndex(pred)
array.includes(item)
array.join(sep)
array.slice(start, end)
array.concat(other)
array[0]
array.length === 0
for (const item of array) { }
for (let i = 0; i < array.length; i++) { }
```

### NEVER Use Non-Null Assertions

```typescript
// FORBIDDEN
const first = array[0]!;

// REQUIRED - Use Option
import * as A from "effect/Array";
const first = A.head(array);  // Returns Option<T>
```

### NEVER Mutate Arrays

```typescript
// FORBIDDEN - Mutation
array.push(item);
array.pop();
array.shift();
array.unshift(item);
array[0] = newValue;

// REQUIRED - Immutable operations
import * as A from "effect/Array";
const withItem = A.append(array, item);
const withoutLast = A.init(array);
const withoutFirst = A.tail(array);
const withItemAtStart = A.prepend(array, item);
const withReplaced = A.modify(array, 0, () => newValue);
```

### NEVER Use Imperative Loops

```typescript
// FORBIDDEN
for (const item of items) {
  console.log(item);
}

for (let i = 0; i < items.length; i++) {
  doSomething(items[i]);
}

// REQUIRED - Functional operations
import * as A from "effect/Array";

A.forEach(items, item => console.log(item));
A.map(items, item => doSomething(item));
```

## Related Modules

- **[Option.md](./Option.md)** - `A.head` and `A.get` return Option
- **[Match.md](./Match.md)** - Pattern matching on array results
- **[Stream.md](./Stream.md)** - Use Stream for large/async datasets
- **effect/Order** - Sorting comparators for `A.sort`

## Source Reference

[`.repos/effect/packages/effect/src/Array.ts`](../../.repos/effect/packages/effect/src/Array.ts)

## Key Takeaways

1. **ALWAYS** use `import * as A from "effect/Array"`
2. **NEVER** use native array methods (`.map()`, `.filter()`, `.reduce()`, etc.)
3. **Use `A.head()` and `A.get()`** instead of bracket notation for safe access
4. **Use `A.isEmptyReadonlyArray()`** instead of `.length === 0`
5. **Compose with `F.pipe`** for readable transformations
6. **Return Option** when element might not exist
7. **Use Order** module for custom sorting
