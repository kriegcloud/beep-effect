# P1 Array Code Writer Agent

## Your Mission

Apply Effect Array migrations to your assigned file. You will receive specific checklist items to address.

## Import Statement

Add this import if not already present:

```typescript
import * as A from "effect/Array";
```

If using sort operations, also add:

```typescript
import * as Order from "effect/Order";
```

## Migration Patterns

### Basic Transformations

```typescript
// BEFORE: array.map(x => x + 1)
// AFTER:
A.map(array, x => x + 1)

// BEFORE: array.filter(x => x > 0)
// AFTER:
A.filter(array, x => x > 0)

// BEFORE: array.flatMap(x => [x, x])
// AFTER:
A.flatMap(array, x => [x, x])
```

### Find Operations (Return Option)

```typescript
// BEFORE: const item = array.find(x => x.id === id)
// AFTER:
import * as O from "effect/Option";
const item = A.findFirst(array, x => x.id === id)
// Note: Returns Option<T>, callers need O.getOrNull() or O.match()

// BEFORE: const idx = array.findIndex(x => x.id === id)
// AFTER:
const idx = A.findFirstIndex(array, x => x.id === id)
// Note: Returns Option<number>
```

### Reduce Operations (Argument Order Change)

```typescript
// BEFORE: array.reduce((acc, x) => acc + x, 0)
// AFTER (note: init comes BEFORE fn):
A.reduce(array, 0, (acc, x) => acc + x)

// BEFORE: array.reduceRight((acc, x) => acc + x, 0)
// AFTER:
A.reduceRight(array, 0, (acc, x) => acc + x)
```

### Sorting

```typescript
// BEFORE: array.sort((a, b) => a - b)
// AFTER:
import * as Order from "effect/Order";
A.sort(array, Order.number)

// BEFORE: array.sort((a, b) => a.name.localeCompare(b.name))
// AFTER:
A.sort(array, Order.mapInput(Order.string, (x) => x.name))

// BEFORE: array.sort() // default string sort
// AFTER:
A.sort(array, Order.string)
```

### Emptiness Checks

```typescript
// BEFORE: if (array.length === 0)
// AFTER:
if (A.isEmptyReadonlyArray(array))

// BEFORE: if (array.length > 0)
// AFTER:
if (!A.isEmptyReadonlyArray(array))
// OR: if (A.isNonEmptyReadonlyArray(array))
```

### Static Methods

```typescript
// BEFORE: Array.isArray(value)
// AFTER:
A.isArray(value)

// BEFORE: Array.from(iterable)
// AFTER:
A.fromIterable(iterable)
```

### Spread Patterns

```typescript
// BEFORE: [...array1, ...array2]
// AFTER:
A.appendAll(array1, array2)

// BEFORE: [...array, newItem]
// AFTER:
A.append(array, newItem)

// BEFORE: [newItem, ...array]
// AFTER:
A.prepend(array, newItem)
```

### Slice Operations

```typescript
// BEFORE: array.slice(0, 5)
// AFTER:
A.take(array, 5)

// BEFORE: array.slice(3)
// AFTER:
A.drop(array, 3)

// BEFORE: array.slice(2, 5)
// AFTER:
A.slice(array, 2, 5)
// OR: A.drop(A.take(array, 5), 2)
```

### Join

```typescript
// BEFORE: array.join(", ")
// AFTER:
A.join(array, ", ")
```

### Includes/Contains

```typescript
// BEFORE: array.includes(value)
// AFTER:
A.contains(array, value)
```

### Concatenation

```typescript
// BEFORE: array.concat(other)
// AFTER:
A.appendAll(array, other)
```

## Handling Method Chains

For chained operations, nest or pipe:

```typescript
// BEFORE:
array
  .filter(x => x > 0)
  .map(x => x * 2)
  .reduce((a, b) => a + b, 0)

// AFTER (nested):
A.reduce(
  A.map(
    A.filter(array, x => x > 0),
    x => x * 2
  ),
  0,
  (a, b) => a + b
)

// AFTER (with pipe - preferred for long chains):
import { pipe } from "effect/Function";

pipe(
  array,
  A.filter(x => x > 0),
  A.map(x => x * 2),
  A.reduce(0, (a, b) => a + b)
)
```

## Critical Rules

1. **PRESERVE FUNCTIONALITY** - The code must work the same after migration
2. **ADD IMPORTS ONCE** - Check if import already exists before adding
3. **HANDLE Option RETURNS** - `findFirst`/`findFirstIndex` return Option, update callers
4. **WATCH ARGUMENT ORDER** - `reduce` has different arg order: `(array, init, fn)`
5. **DON'T CHANGE UNRELATED CODE** - Only modify the specific violations
6. **DOCUMENT UNCERTAINTIES** - If migration is unclear, add a `// TODO:` comment

## Verification

After making changes, verify the file compiles:

```bash
bun tsc --noEmit --isolatedModules apps/todox/src/app/lexical/path/to/file.ts
```

## Completion

Mark each checklist item as complete when done:

```markdown
- [x] `path/to/file.ts:42` - `.map()` - Replaced with `A.map(array, fn)`
```
