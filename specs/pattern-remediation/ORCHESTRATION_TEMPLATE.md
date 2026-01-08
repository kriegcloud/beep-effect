# Pattern Remediation Orchestration Prompt

> Use this prompt to execute the remediation plan in PLAN.md

## Context

You are remediating pattern violations in the beep-effect monorepo. The complete inventory is in `/specs/pattern-remediation/PLAN.md`.

## Package Processing Order

**Process packages in REVERSE topological order** (consumers first, providers last).

### Get the Order

```bash
bun run beep topo-sort
```

This outputs packages with **fewest dependencies first**. **REVERSE this list** for processing:

```
@beep/types          ← Process LAST
@beep/invariant
@beep/identity
@beep/utils
@beep/schema
@beep/contract
@beep/shared-domain
@beep/iam-domain
...
@beep/runtime-server
@beep/web            ← Process FIRST
```

### Why REVERSE Order

For **pattern remediation**, order is flexible since internal code changes don't break consumers. However, we use reverse order for:

1. **Validation flow** - consumer packages can be validated immediately
2. **Reference patterns** - by the time you reach provider packages, you've established consistent patterns
3. **Predictability** - consistent ordering across the monorepo

**Process from BOTTOM to TOP of topo-sort output.**

## Execution Strategy

### Approach: Package-by-Package

Process one package at a time to:
1. Minimize risk of cross-cutting breaks
2. Allow incremental validation
3. Enable partial commits

### For Each Package (Detailed)

1. **Read** the package section from PLAN.md
2. **Check required imports** - ensure these are present at top of each file:
   ```typescript
   import * as A from "effect/Array"
   import * as F from "effect/Function"
   import * as Str from "effect/String"
   import * as Match from "effect/Match"
   import * as P from "effect/Predicate"
   import * as DateTime from "effect/DateTime"
   import { nullOp, noOp, nullOpE } from "@beep/utils"
   ```
3. **Fix violations** in order (top of file to bottom)
4. **Validate the package** - ALL four commands must pass:
   ```bash
   bun run check --filter @beep/[package]
   bun run build --filter @beep/[package]
   bun run test --filter @beep/[package]
   bun run lint:fix --filter @beep/[package]
   ```
5. **Mark items complete** in PLAN.md as you go
6. **Commit** after each package:
   ```bash
   git add packages/[path]
   git commit -m "fix(@beep/[package]): remediate pattern violations

   - Convert X native array methods to Effect Array
   - Convert Y native string methods to Effect String
   - Replace Z switch statements with Match
   - [other changes]

   Part of pattern-remediation spec"
   ```
7. **Only then** proceed to next package

### Mandatory Validation Gate

**CRITICAL: ALL FOUR validation commands must pass before proceeding:**

```bash
bun run check --filter @beep/[package]   # TypeScript type checking
bun run build --filter @beep/[package]   # Build compilation
bun run test --filter @beep/[package]    # Unit tests
bun run lint:fix --filter @beep/[package] # Linting + auto-fix
```

**If ANY command fails:**
1. Stop immediately
2. Fix the issue
3. Re-run all four commands
4. Only proceed when all pass

**Do NOT batch failures or proceed with broken packages.** Each package must be green before moving on.

---

## Transformation Reference

### Array Methods

| Native | Effect Replacement |
|--------|-------------------|
| `arr.map(fn)` | `F.pipe(arr, A.map(fn))` |
| `arr.filter(fn)` | `F.pipe(arr, A.filter(fn))` |
| `arr.find(fn)` | `F.pipe(arr, A.findFirst(fn))` |
| `arr.forEach(fn)` | `F.pipe(arr, A.forEach(fn))` |
| `arr.reduce(fn, init)` | `F.pipe(arr, A.reduce(init, fn))` |
| `arr.some(fn)` | `F.pipe(arr, A.some(fn))` |
| `arr.every(fn)` | `F.pipe(arr, A.every(fn))` |
| `Array.from(iter)` | `F.pipe(iter, A.fromIterable)` |
| `arr.flatMap(fn)` | `F.pipe(arr, A.flatMap(fn))` |
| `arr.concat(other)` | `F.pipe(arr, A.appendAll(other))` |
| `arr.slice(start, end)` | `F.pipe(arr, A.slice(start, end))` |
| `arr.join(sep)` | `F.pipe(arr, A.join(sep))` |
| `arr.reverse()` | `F.pipe(arr, A.reverse)` |
| `arr.sort(fn)` | `F.pipe(arr, A.sort(Order))` |
| `arr.includes(x)` | `F.pipe(arr, A.contains(x))` |
| `arr.indexOf(x)` | `F.pipe(arr, A.findFirstIndex((v) => v === x))` |
| `arr[0]` | `F.pipe(arr, A.head)` |
| `arr[arr.length - 1]` | `F.pipe(arr, A.last)` |
| `arr.length === 0` | `A.isEmptyArray(arr)` |
| `arr.length > 0` | `A.isNonEmptyArray(arr)` |

### String Methods

| Native | Effect Replacement |
|--------|-------------------|
| `str.trim()` | `F.pipe(str, Str.trim)` |
| `str.trimStart()` | `F.pipe(str, Str.trimStart)` |
| `str.trimEnd()` | `F.pipe(str, Str.trimEnd)` |
| `str.split(sep)` | `F.pipe(str, Str.split(sep))` |
| `str.toLowerCase()` | `F.pipe(str, Str.toLowerCase)` |
| `str.toUpperCase()` | `F.pipe(str, Str.toUpperCase)` |
| `str.startsWith(x)` | `F.pipe(str, Str.startsWith(x))` |
| `str.endsWith(x)` | `F.pipe(str, Str.endsWith(x))` |
| `str.includes(x)` | `F.pipe(str, Str.includes(x))` |
| `str.replace(a, b)` | `F.pipe(str, Str.replace(a, b))` |
| `str.replaceAll(a, b)` | `F.pipe(str, Str.replaceAll(a, b))` |
| `str.slice(start, end)` | `F.pipe(str, Str.slice(start, end))` |
| `str.charAt(i)` | `F.pipe(str, Str.charAt(i))` |
| `str.length === 0` | `Str.isEmpty(str)` |
| `str.length > 0` | `Str.isNonEmpty(str)` |
| `str.padStart(n, c)` | `F.pipe(str, Str.padStart(n, c))` |
| `str.padEnd(n, c)` | `F.pipe(str, Str.padEnd(n, c))` |

### Date/DateTime

| Native | Effect Replacement |
|--------|-------------------|
| `new Date()` | `DateTime.unsafeNow()` |
| `new Date(str)` | `DateTime.unsafeMake(str)` |
| `new Date(ms)` | `DateTime.unsafeMake(ms)` |
| `Date.now()` | `DateTime.unsafeNow()` |
| `date.toISOString()` | `DateTime.formatIso(date)` |
| `date.getTime()` | `DateTime.toEpochMillis(date)` |
| `date.setDate(...)` | `DateTime.add(date, { days: n })` |
| `date.getMonth()` | `DateTime.getPartUtc(date, "month")` |
| `date.getFullYear()` | `DateTime.getPartUtc(date, "year")` |

**Note**: When code MUST return a native Date (e.g., for external API compatibility), use:
```typescript
DateTime.toDate(DateTime.unsafeNow())
```

### Switch Statements

**For discriminated unions (with _tag):**

```typescript
// BEFORE
switch (value._tag) {
  case "A": return handleA(value)
  case "B": return handleB(value)
  default: return handleDefault()
}

// AFTER
Match.value(value).pipe(
  Match.tag("A", handleA),
  Match.tag("B", handleB),
  Match.orElse(handleDefault)
)

// Or for exhaustive matching (preferred):
Match.value(value).pipe(
  Match.tag("A", handleA),
  Match.tag("B", handleB),
  Match.exhaustive
)
```

**For primitive values:**

```typescript
// BEFORE
switch (status) {
  case "pending": return "Waiting..."
  case "active": return "Running!"
  case "done": return "Complete"
  default: return "Unknown"
}

// AFTER
Match.value(status).pipe(
  Match.when("pending", () => "Waiting..."),
  Match.when("active", () => "Running!"),
  Match.when("done", () => "Complete"),
  Match.orElse(() => "Unknown")
)
```

**For type narrowing:**

```typescript
// BEFORE
switch (typeof value) {
  case "string": return `String: ${value}`
  case "number": return `Number: ${value}`
  default: return "Other"
}

// AFTER
Match.value(value).pipe(
  Match.when(P.isString, (s) => `String: ${s}`),
  Match.when(P.isNumber, (n) => `Number: ${n}`),
  Match.orElse(() => "Other")
)
```

### Type Guards

| Native | Effect Replacement |
|--------|-------------------|
| `typeof x === "string"` | `P.isString(x)` |
| `typeof x === "number"` | `P.isNumber(x)` |
| `typeof x === "boolean"` | `P.isBoolean(x)` |
| `typeof x === "object"` | `P.isObject(x)` |
| `typeof x === "function"` | `P.isFunction(x)` |
| `typeof x === "undefined"` | `P.isUndefined(x)` |
| `typeof x === "bigint"` | `P.isBigInt(x)` |
| `typeof x === "symbol"` | `P.isSymbol(x)` |
| `Array.isArray(x)` | `P.isArray(x)` |
| `x instanceof Date` | `P.isDate(x)` |
| `x instanceof Error` | `P.isError(x)` |
| `x instanceof RegExp` | `P.isRegExp(x)` |
| `x === null` | `P.isNull(x)` |
| `x == null` | `P.isNullable(x)` |
| `x !== null` | `P.isNotNull(x)` |
| `x != null` | `P.isNotNullable(x)` |
| `"prop" in obj` | `P.hasProperty(obj, "prop")` |
| `obj._tag === "X"` | `P.isTagged(obj, "X")` |

### Object Methods

| Native | Effect Replacement |
|--------|-------------------|
| `Object.keys(obj)` | `F.pipe(obj, Struct.keys)` |
| `Object.values(obj)` | `F.pipe(obj, R.values)` |
| `Object.entries(obj)` | `F.pipe(obj, R.toEntries)` |
| `Object.fromEntries(arr)` | `F.pipe(arr, R.fromEntries)` |

**Note**: Import `Struct` and `R` (Record):
```typescript
import * as Struct from "effect/Struct"
import * as R from "effect/Record"
```

### No-ops

| Native | Effect Replacement |
|--------|-------------------|
| `() => null` | `nullOp` |
| `() => {}` | `noOp` |
| `() => undefined` | `noOp` |
| `async () => null` | `nullOpE` |
| `() => Effect.succeed(null)` | `nullOpE` |
| `() => Effect.void` | `noOp` |

---

## Validation Commands

After each package:

```bash
# Type check
bun run check --filter @beep/[package]

# Lint fix
bun run lint:fix --filter @beep/[package]

# Run tests
bun run test --filter @beep/[package]

# Build
bun run build --filter @beep/[package]
```

---

## Progress Tracking

Update PLAN.md checkboxes as you complete each item:
- `- [ ]` → `- [x]`

Add completion notes at the bottom of PLAN.md:

```markdown
## Completion Log

| Package | Date | Violations Fixed | Commit |
|---------|------|------------------|--------|
| @beep/shared-server | 2024-XX-XX | 45 | abc123 |
| @beep/documents-server | 2024-XX-XX | 23 | def456 |
```

---

## Edge Cases

### Chained Array Operations

```typescript
// BEFORE
items.filter(x => x.active).map(x => x.id)

// AFTER
F.pipe(
  items,
  A.filter(x => x.active),
  A.map(x => x.id)
)
```

### Nested Transformations

```typescript
// BEFORE
items.map(item => ({
  ...item,
  children: item.children.map(c => c.name)
}))

// AFTER
F.pipe(
  items,
  A.map(item => ({
    ...item,
    children: F.pipe(item.children, A.map(c => c.name))
  }))
)
```

### Array Spread with Map

```typescript
// BEFORE
[...items.map(x => x.id)]

// AFTER
F.pipe(items, A.map(x => x.id))
```

### Ternary with Array Methods

```typescript
// BEFORE
condition ? items.map(fn) : []

// AFTER
condition ? F.pipe(items, A.map(fn)) : []
```

### Optional Chaining with Array Methods

```typescript
// BEFORE
items?.map(fn) ?? []

// AFTER
F.pipe(items ?? [], A.map(fn))

// Or with Option:
F.pipe(
  O.fromNullable(items),
  O.map(A.map(fn)),
  O.getOrElse(() => [])
)
```

### String Template Interpolation

```typescript
// BEFORE - This is acceptable for logging/display
console.log(`User: ${name.toLowerCase()}`)

// AFTER - Convert for consistency
console.log(`User: ${F.pipe(name, Str.toLowerCase)}`)
```

### Date in External API Boundaries

```typescript
// BEFORE
await externalApi.create({ createdAt: new Date() })

// AFTER - When API requires native Date
await externalApi.create({
  createdAt: DateTime.toDate(DateTime.unsafeNow())
})
```

---

## Authorization Gates

**STOP and request user approval before:**

1. Starting a new package
2. Committing changes
3. Pushing to remote
4. Making changes to shared utilities that affect multiple packages

**Never auto-proceed through packages without explicit "continue" from user.**

---

## Troubleshooting

### Type Errors After Transformation

If you get type errors after converting to Effect utilities:

1. **Check the return type** - `A.findFirst` returns `Option<A>`, not `A | undefined`
2. **Check import aliases** - Ensure `A`, `F`, `Str` etc. are imported correctly
3. **Check pipe direction** - Data flows left-to-right in `F.pipe`

### Build Failures

1. Run `bun run lint:fix` first - often fixes import ordering
2. Check for circular dependencies introduced by new imports
3. Verify the package's `tsconfig.json` extends the base config

### Test Failures

1. Effect Array methods may have slightly different semantics
2. `A.findFirst` returns `Option`, wrap with `O.getOrElse` if needed
3. DateTime operations are immutable - ensure tests account for this
