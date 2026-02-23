# Effect Match Module - Comprehensive Research

**Source Files:**
- `/tmp/effect/packages/effect/src/Match.ts`
- `/node_modules/effect/dist/dts/Match.d.ts`

**Purpose:** Type-safe pattern matching system for TypeScript that replaces verbose if/else and switch statements with structured, exhaustive-checked matching.

---

## Overview

The `effect/Match` module provides a functional pattern matching system inspired by languages like Scala, Haskell, and Rust. It enforces exhaustiveness checking at compile time, ensuring all cases are handled.

### Pattern Matching Workflow

1. **Create a matcher** - Use `Match.type<T>()` or `Match.value(v)`
2. **Define patterns** - Use `Match.when`, `Match.tag`, `Match.not`, etc.
3. **Complete the match** - Use `Match.exhaustive`, `Match.orElse`, or `Match.option`

---

## Core Type System

### Matcher Types (Lines 87-127)

```typescript
// Two flavors of matchers
type Matcher<Input, Filters, RemainingApplied, Result, Provided, Return = any> =
  | TypeMatcher<Input, Filters, RemainingApplied, Result, Return>
  | ValueMatcher<Input, Filters, RemainingApplied, Result, Provided, Return>

// For matching against types
interface TypeMatcher<in Input, out Filters, out Remaining, out Result, out Return = any> {
  readonly _tag: "TypeMatcher"
  readonly cases: ReadonlyArray<Case>
}

// For matching against values
interface ValueMatcher<in Input, out Filters, out Remaining, out Result, out Provided, out Return = any> {
  readonly _tag: "ValueMatcher"
  readonly provided: Provided
  readonly value: Either.Either<Provided, Remaining>
}
```

**Type Parameters:**
- `Input` - The original type being matched
- `Filters` - Accumulated type filters (narrows remaining type)
- `Remaining` - Types not yet matched
- `Result` - Union of all match results
- `Provided` - The concrete value (for ValueMatcher)
- `Return` - Expected return type constraint

### Case Types (Lines 133-153)

```typescript
type Case = When | Not

interface When {
  readonly _tag: "When"
  guard(u: unknown): boolean
  evaluate(input: unknown): any
}

interface Not {
  readonly _tag: "Not"
  guard(u: unknown): boolean
  evaluate(input: unknown): any
}
```

---

## Creating Matchers

### 1. Match.type (Lines 195)

**Signature:** `<I>() => Matcher<I, Types.Without<never>, I, never, never>`

**Purpose:** Creates a matcher for a specific type (compile-time type matching).

**Example:**
```typescript
import * as Match from "effect/Match"

const match = Match.type<string | number>().pipe(
  Match.when(Match.number, (n) => `number: ${n}`),
  Match.when(Match.string, (s) => `string: ${s}`),
  Match.exhaustive
)

match(42)    // "number: 42"
match("hi")  // "string: hi"
```

**Use case:** When you don't have a concrete value yet and want to create a reusable matching function.

---

### 2. Match.value (Lines 237-239)

**Signature:** `<const I>(i: I) => Matcher<I, Types.Without<never>, I, never, I>`

**Purpose:** Creates a matcher from a specific runtime value.

**Example:**
```typescript
import * as Match from "effect/Match"

const input = { name: "John", age: 30 }

const result = Match.value(input).pipe(
  Match.when({ name: "John" }, (user) => `${user.name} is ${user.age} years old`),
  Match.orElse(() => "Not John")
)
// "John is 30 years old"
```

**Use case:** When you have a value and want to match on it immediately (one-off matching).

---

### 3. Match.valueTags (Lines 245-258)

**Signature:** Dual API for discriminated union matching with values.

**Example:**
```typescript
type Event =
  | { readonly _tag: "fetch" }
  | { readonly _tag: "success"; readonly data: string }
  | { readonly _tag: "error"; readonly error: Error }

// Inline value matching
const result = Match.valueTags(event, {
  fetch: () => "Loading...",
  success: (e) => `Got: ${e.data}`,
  error: (e) => `Error: ${e.error.message}`
})
```

**Use case:** Shorthand for value-based discriminated union matching.

---

### 4. Match.typeTags (Lines 264-283)

**Signature:** Dual API for discriminated union matching with types.

**Example:**
```typescript
type Event =
  | { readonly _tag: "fetch" }
  | { readonly _tag: "success"; readonly data: string }

const match = Match.typeTags<Event>()({
  fetch: () => "Loading...",
  success: (e) => `Got: ${e.data}`
})
```

**Use case:** Type-based discriminated union matching with exhaustive checking.

---

### 5. Match.withReturnType (Lines 316-319)

**Signature:** `<Ret>() => <I, F, R, A, Pr, _>(self: Matcher<...>) => Matcher<...>`

**Purpose:** Enforces a consistent return type across all branches (must be first in pipeline).

**Example:**
```typescript
const match = Match.type<{ a: number } | { b: string }>().pipe(
  Match.withReturnType<string>(),  // MUST be first!
  // @ts-expect-error - number is not assignable to string
  Match.when({ a: Match.number }, (_) => _.a),
  Match.when({ b: Match.string }, (_) => _.b),
  Match.exhaustive
)
```

**Critical:** This MUST be the first combinator in the pipe, or type checking won't work correctly.

---

## Pattern Matching Functions

### 1. Match.when (Lines 368-385)

**Signature:** `<R, P, Ret, Fn>(pattern: P, f: Fn) => (self: Matcher<...>) => Matcher<...>`

**Purpose:** Defines a condition for matching values. Supports direct values, predicates, and object patterns.

**Examples:**

```typescript
// Primitive matching
Match.type<string | number>().pipe(
  Match.when(Match.string, (s) => `string: ${s}`),
  Match.when(Match.number, (n) => `number: ${n}`),
  Match.exhaustive
)

// Object pattern matching
Match.type<{ age: number }>().pipe(
  Match.when({ age: (age) => age > 18 }, (user) => `Age: ${user.age}`),
  Match.when({ age: 18 }, () => "You can vote"),
  Match.orElse((user) => `${user.age} is too young`)
)

// Predicate matching
Match.value(input).pipe(
  Match.when(P.isString, (s) => `string: ${s}`),
  Match.when((x): x is number => typeof x === "number", (n) => `number: ${n}`),
  Match.exhaustive
)
```

**Patterns supported:**
- Primitive values: `"hello"`, `42`, `true`
- Predicates: `Match.string`, `P.isNumber`, custom refinements
- Object patterns: `{ name: "John" }`, `{ age: (n) => n > 18 }`
- Nested patterns: `{ user: { role: "admin" } }`

---

### 2. Match.whenOr (Lines 429-445)

**Signature:** `<R, P, Ret, Fn>(...args: [...patterns: P, f: Fn]) => (self: Matcher<...>) => Matcher<...>`

**Purpose:** Matches one of multiple patterns in a single condition (OR logic).

**Example:**
```typescript
type ErrorType =
  | { readonly _tag: "NetworkError"; readonly message: string }
  | { readonly _tag: "TimeoutError"; readonly duration: number }
  | { readonly _tag: "ValidationError"; readonly field: string }

const handleError = Match.type<ErrorType>().pipe(
  Match.whenOr(
    { _tag: "NetworkError" },
    { _tag: "TimeoutError" },
    () => "Retry the request"
  ),
  Match.when({ _tag: "ValidationError" }, (_) => `Invalid field: ${_.field}`),
  Match.exhaustive
)
```

**Use case:** Multiple patterns share the same handler.

---

### 3. Match.whenAnd (Lines 486-501)

**Signature:** `<R, P, Ret, Fn>(...args: [...patterns: P, f: Fn]) => (self: Matcher<...>) => Matcher<...>`

**Purpose:** Matches a value that satisfies ALL provided patterns (AND logic).

**Example:**
```typescript
type User = { readonly age: number; readonly role: "admin" | "user" }

const checkUser = Match.type<User>().pipe(
  Match.whenAnd(
    { age: (n) => n >= 18 },
    { role: "admin" },
    () => "Admin access granted"
  ),
  Match.orElse(() => "Access denied")
)

checkUser({ age: 20, role: "admin" })  // "Admin access granted"
checkUser({ age: 20, role: "user" })   // "Access denied"
```

**Use case:** Value must satisfy multiple criteria simultaneously.

---

### 4. Match.not (Lines 926-943)

**Signature:** `<R, P, Ret, Fn>(pattern: P, f: Fn) => (self: Matcher<...>) => Matcher<...>`

**Purpose:** Excludes a specific value from matching while allowing all others.

**Example:**
```typescript
const match = Match.type<string | number>().pipe(
  Match.not("hi", () => "ok"),
  Match.orElse(() => "fallback")
)

match("hello")  // "ok"
match("hi")     // "fallback"
```

**Use case:** Handle all cases except specific exclusions.

---

## Discriminated Union Matching

### 1. Match.tag (Lines 736-752)

**Signature:** `<R, P, Ret, Fn>(...pattern: [first: P, ...values: Array<P>, f: Fn]) => ...`

**Purpose:** Matches discriminated unions by `_tag` field (Effect ecosystem convention).

**Example:**
```typescript
type Event =
  | { readonly _tag: "fetch" }
  | { readonly _tag: "success"; readonly data: string }
  | { readonly _tag: "error"; readonly error: Error }
  | { readonly _tag: "cancel" }

const match = Match.type<Event>().pipe(
  Match.tag("fetch", "success", () => `Ok!`),
  Match.tag("error", (event) => `Error: ${event.error.message}`),
  Match.tag("cancel", () => "Cancelled"),
  Match.exhaustive
)
```

**Critical:** Relies on `_tag` field naming convention (Effect standard).

---

### 2. Match.tagStartsWith (Lines 783-800)

**Signature:** `<R, P, Ret, Fn>(pattern: P, f: Fn) => ...`

**Purpose:** Matches tags by prefix (hierarchical/namespaced tags).

**Example:**
```typescript
const match = Match.type<
  | { _tag: "A" }
  | { _tag: "B" }
  | { _tag: "A.A" }
  | {}
>().pipe(
  Match.tagStartsWith("A", (_) => 1 as const),
  Match.tagStartsWith("B", (_) => 2 as const),
  Match.orElse((_) => 3 as const)
)

match({ _tag: "A" })    // 1
match({ _tag: "A.A" })  // 1
match({ _tag: "B" })    // 2
```

**Use case:** Hierarchical tag systems like `"Error.Network"`, `"Error.Validation"`.

---

### 3. Match.tags (Lines 831-848)

**Signature:** `<R, Ret, P>(fields: P) => ...`

**Purpose:** Maps `_tag` values to handlers using an object (partial exhaustiveness).

**Example:**
```typescript
const match = Match.type<
  | { _tag: "A"; a: string }
  | { _tag: "B"; b: number }
  | { _tag: "C"; c: boolean }
>().pipe(
  Match.tags({
    A: (a) => a.a,
    B: (b) => b.b,
    C: (c) => c.c
  }),
  Match.exhaustive
)
```

**Note:** Requires `Match.exhaustive` to ensure all tags are handled.

---

### 4. Match.tagsExhaustive (Lines 879-890)

**Signature:** `<R, Ret, P>(fields: P) => ...`

**Purpose:** Maps ALL `_tag` values to handlers (enforces exhaustiveness without `Match.exhaustive`).

**Example:**
```typescript
const match = Match.type<
  | { _tag: "A"; a: string }
  | { _tag: "B"; b: number }
  | { _tag: "C"; c: boolean }
>().pipe(
  Match.tagsExhaustive({
    A: (a) => a.a,
    B: (b) => b.b,
    C: (c) => c.c
    // TypeScript error if any tag is missing!
  })
  // No Match.exhaustive needed!
)
```

**Critical difference:** Enforces exhaustiveness by design, no finalizer needed.

---

### 5. Match.discriminator (Lines 529-542)

**Signature:** `<D extends string>(field: D) => <R, P, Ret, Fn>(...pattern: [first: P, ...values: Array<P>, f: Fn]) => ...`

**Purpose:** Generic discriminated union matching on any field name.

**Example:**
```typescript
const match = Match.type<
  | { type: "A"; a: string }
  | { type: "B"; b: number }
  | { type: "C"; c: boolean }
>().pipe(
  Match.discriminator("type")("A", "B", (_) => `A or B: ${_.type}`),
  Match.discriminator("type")("C", (_) => `C(${_.c})`),
  Match.exhaustive
)
```

**Use case:** When discriminant field is not `_tag` (e.g., `type`, `kind`, `status`).

---

### 6. Match.discriminatorStartsWith (Lines 578-592)

**Signature:** `<D extends string>(field: D) => <R, P, Ret, Fn>(pattern: P, f: Fn) => ...`

**Purpose:** Matches discriminator field by prefix.

**Example:**
```typescript
const match = Match.type<
  | { type: "A" }
  | { type: "B" }
  | { type: "A.A" }
  | {}
>().pipe(
  Match.discriminatorStartsWith("type")("A", (_) => 1 as const),
  Match.discriminatorStartsWith("type")("B", (_) => 2 as const),
  Match.orElse((_) => 3 as const)
)
```

---

### 7. Match.discriminators (Lines 625-644)

**Signature:** `<D extends string>(field: D) => <R, Ret, P>(fields: P) => ...`

**Purpose:** Maps discriminator values to handlers (partial).

**Example:**
```typescript
const match = Match.type<
  | { type: "A"; a: string }
  | { type: "B"; b: number }
  | { type: "C"; c: boolean }
>().pipe(
  Match.discriminators("type")({
    A: (a) => a.a,
    B: (b) => b.b,
    C: (c) => c.c
  }),
  Match.exhaustive
)
```

---

### 8. Match.discriminatorsExhaustive (Lines 678-691)

**Signature:** `<D extends string>(field: D) => <R, Ret, P>(fields: P) => ...`

**Purpose:** Maps ALL discriminator values to handlers (enforces exhaustiveness).

**Example:**
```typescript
const match = Match.type<
  | { type: "A"; a: string }
  | { type: "B"; b: number }
  | { type: "C"; c: boolean }
>().pipe(
  Match.discriminatorsExhaustive("type")({
    A: (a) => a.a,
    B: (b) => b.b,
    C: (c) => c.c
    // TypeScript error if any case missing!
  })
  // No Match.exhaustive needed!
)
```

---

## Built-in Predicates

All predicates are from `effect/Predicate` module but re-exported for convenience:

### Primitive Type Predicates

| Predicate | Line | Type Signature | Description |
|-----------|------|----------------|-------------|
| `Match.string` | 969 | `Refinement<unknown, string>` | Matches string values |
| `Match.number` | 977 | `Refinement<unknown, number>` | Matches number values |
| `Match.boolean` | 1001 | `Refinement<unknown, boolean>` | Matches boolean values |
| `Match.bigint` | 1031 | `Refinement<unknown, bigint>` | Matches bigint values |
| `Match.symbol` | 1039 | `Refinement<unknown, symbol>` | Matches symbol values |
| `Match.undefined` | 1003-1011 | `Refinement<unknown, undefined>` | Matches undefined |
| `Match.null` | 1014-1022 | `Refinement<unknown, null>` | Matches null |

### Special Predicates

| Predicate | Line | Type Signature | Description |
|-----------|------|----------------|-------------|
| `Match.any` | 985 | `SafeRefinement<unknown, any>` | Matches any value (no restrictions) |
| `Match.defined` | 993 | `<A>(u: A) => u is A & {}` | Matches non-null and non-undefined |
| `Match.nonEmptyString` | 951 | `SafeRefinement<string, never>` | Matches non-empty strings |
| `Match.date` | 1047 | `Refinement<unknown, Date>` | Matches Date instances |
| `Match.record` | 1055 | `Refinement<unknown, {[x: string \| symbol]: unknown}>` | Matches plain objects |

### Advanced Predicates

| Function | Line | Type Signature | Description |
|----------|------|----------------|-------------|
| `Match.is` | 959-961 | `<Literals extends ReadonlyArray<...>>(...literals: Literals) => SafeRefinement<Literals[number]>` | Matches specific literal values |
| `Match.instanceOf` | 1063-1065 | `<A extends abstract new(...args: any) => any>(constructor: A) => SafeRefinement<InstanceType<A>, never>` | Matches class instances |
| `Match.instanceOfUnsafe` | 1071-1073 | `<A extends abstract new(...args: any) => any>(constructor: A) => SafeRefinement<InstanceType<A>, InstanceType<A>>` | Matches class instances (unsafe variant) |

### Predicate Examples

```typescript
// Literal matching
Match.value(input).pipe(
  Match.when(Match.is("a", "b", "c"), (x) => `One of: ${x}`),
  Match.orElse(() => "Other")
)

// Instance matching
Match.value(err).pipe(
  Match.when(Match.instanceOf(Error), (e) => `Error: ${e.message}`),
  Match.when(Match.instanceOf(CustomError), (e) => `Custom: ${e.code}`),
  Match.orElse(() => "Unknown")
)

// Non-empty string matching
Match.value(str).pipe(
  Match.when(Match.nonEmptyString, (s) => `Non-empty: ${s}`),
  Match.orElse(() => "Empty or not a string")
)
```

---

## Completion Functions

### 1. Match.exhaustive (Lines 1244-1246)

**Signature:** `<I, F, A, Pr, Ret>(self: Matcher<I, F, never, A, Pr, Ret>) => ...`

**Purpose:** Ensures all possible cases are handled (compile-time exhaustiveness check).

**Example:**
```typescript
const match = Match.type<string | number>().pipe(
  Match.when(Match.number, (n) => `number: ${n}`),
  // @ts-expect-error - Type 'string' is not assignable to type 'never'
  Match.exhaustive  // TypeScript error if string case missing!
)

// Fix: add the missing case
const matchFixed = Match.type<string | number>().pipe(
  Match.when(Match.number, (n) => `number: ${n}`),
  Match.when(Match.string, (s) => `string: ${s}`),
  Match.exhaustive  // ✅ All cases covered
)
```

**Critical:** The `Remaining` type parameter must be `never` for exhaustive to compile.

---

### 2. Match.orElse (Lines 1108-1112)

**Signature:** `<RA, Ret, F extends (_: RA) => Ret>(f: F) => ...`

**Purpose:** Provides a fallback when no patterns match (default case).

**Example:**
```typescript
const match = Match.type<string | number>().pipe(
  Match.when("a", () => "ok"),
  Match.orElse(() => "fallback")
)

match("a")  // "ok"
match("b")  // "fallback"
match(42)   // "fallback"
```

**Use case:** When you don't need exhaustiveness and want a catch-all.

---

### 3. Match.orElseAbsurd (Lines 1131-1133)

**Signature:** `<I, R, RA, A, Pr, Ret>(self: Matcher<...>) => ...`

**Purpose:** Throws an error if no pattern matches (runtime failure for unmatched cases).

**Example:**
```typescript
const match = Match.type<string | number>().pipe(
  Match.when(Match.number, (n) => `number: ${n}`),
  Match.orElseAbsurd  // Throws if value is string
)

match(42)    // "number: 42"
match("hi")  // ❌ Throws error!
```

**Use case:** When all cases should be covered, but you want runtime verification.

---

### 4. Match.either (Lines 1174-1176)

**Signature:** `<I, F, R, A, Pr, Ret>(self: Matcher<...>) => Either.Either<Unify<A>, R>`

**Purpose:** Wraps result in `Either` - `Right(value)` if matched, `Left(unmatched)` otherwise.

**Example:**
```typescript
type User = { readonly role: "admin" | "editor" | "viewer" }

const getRole = Match.type<User>().pipe(
  Match.when({ role: "admin" }, () => "Has full access"),
  Match.when({ role: "editor" }, () => "Can edit content"),
  Match.either
)

getRole({ role: "admin" })
// { _id: 'Either', _tag: 'Right', right: 'Has full access' }

getRole({ role: "viewer" })
// { _id: 'Either', _tag: 'Left', left: { role: 'viewer' } }
```

**Use case:** When you want to explicitly handle both matched and unmatched cases.

---

### 5. Match.option (Lines 1215-1217)

**Signature:** `<I, F, R, A, Pr, Ret>(self: Matcher<...>) => Option.Option<Unify<A>>`

**Purpose:** Wraps result in `Option` - `Some(value)` if matched, `None` otherwise.

**Example:**
```typescript
type User = { readonly role: "admin" | "editor" | "viewer" }

const getRole = Match.type<User>().pipe(
  Match.when({ role: "admin" }, () => "Has full access"),
  Match.when({ role: "editor" }, () => "Can edit content"),
  Match.option
)

getRole({ role: "admin" })
// { _id: 'Option', _tag: 'Some', value: 'Has full access' }

getRole({ role: "viewer" })
// { _id: 'Option', _tag: 'None' }
```

**Use case:** When unmatched cases are expected and should return `None`.

---

## Integration with Predicate Module

The Match module uses `effect/Predicate` for all type guards:

```typescript
import * as Match from "effect/Match"
import * as P from "effect/Predicate"

// Predicate-based matching
const match = Match.type<unknown>().pipe(
  Match.when(P.isString, (s) => `string: ${s}`),
  Match.when(P.isNumber, (n) => `number: ${n}`),
  Match.when(P.isBoolean, (b) => `boolean: ${b}`),
  Match.when(P.isNull, () => "null"),
  Match.when(P.isUndefined, () => "undefined"),
  Match.orElse(() => "unknown")
)

// Composed predicates
const isPositive = (n: number) => n > 0
const isEven = (n: number) => n % 2 === 0

const match2 = Match.type<number>().pipe(
  Match.when(P.and(isPositive, isEven), (n) => `positive even: ${n}`),
  Match.when(isPositive, (n) => `positive odd: ${n}`),
  Match.orElse((n) => `non-positive: ${n}`)
)
```

**Available from Predicate:**
- `P.isString`, `P.isNumber`, `P.isBoolean`, `P.isBigInt`, `P.isSymbol`
- `P.isNull`, `P.isUndefined`, `P.isNullable`, `P.isNotNull`, `P.isNotUndefined`
- `P.isArray`, `P.isRecord`, `P.isDate`, `P.isObject`
- `P.hasProperty`, `P.isTagged`
- `P.and`, `P.or`, `P.not` - Predicate composition

---

## Type Narrowing

Match provides compile-time type narrowing through its type system:

```typescript
type Shape =
  | { readonly kind: "circle"; readonly radius: number }
  | { readonly kind: "square"; readonly size: number }
  | { readonly kind: "rectangle"; readonly width: number; readonly height: number }

const getArea = Match.type<Shape>().pipe(
  Match.when({ kind: "circle" }, (s) => {
    // s is narrowed to { kind: "circle"; radius: number }
    return Math.PI * s.radius * s.radius
  }),
  Match.when({ kind: "square" }, (s) => {
    // s is narrowed to { kind: "square"; size: number }
    return s.size * s.size
  }),
  Match.when({ kind: "rectangle" }, (s) => {
    // s is narrowed to { kind: "rectangle"; width: number; height: number }
    return s.width * s.height
  }),
  Match.exhaustive
)
```

**Narrowing mechanisms:**
1. **Discriminant narrowing** - Via `_tag`, `type`, `kind` fields
2. **Predicate narrowing** - Via refinement predicates
3. **Pattern narrowing** - Via object shape matching
4. **Negative narrowing** - Via `Match.not` exclusion

---

## Advanced Type System

### SafeRefinement (Lines 1264-1266)

```typescript
interface SafeRefinement<in A, out R = A> {
  readonly [SafeRefinementId]: (a: A) => R
}
```

**Purpose:** Marker interface for safe type refinements used in pattern matching.

### Type Utilities (Lines 1274-1477)

```typescript
namespace Types {
  // Extracts matched type from pattern
  type WhenMatch<R, P> = ...

  // Computes remaining types after exclusion
  type NotMatch<R, P> = Exclude<R, ExtractMatch<R, PForNotMatch<P>>>

  // Pattern types
  type PatternPrimitive<A> = PredicateA<A> | A | SafeRefinement<any>
  type PatternBase<A> = ...

  // Filter system
  interface Without<out X> { readonly _tag: "Without"; readonly _X: X }
  interface Only<out X> { readonly _tag: "Only"; readonly _X: X }

  type AddWithout<A, X> = ...
  type AddOnly<A, X> = ...
  type ApplyFilters<I, A> = ...

  // Discriminated union helpers
  type Tags<D extends string, P> = P extends Record<D, infer X> ? X : never

  // Complex narrowing
  type ExtractAndNarrow<Input, P> = ...
}
```

**Key type-level operations:**
- `ExtractMatch` - Extracts the matched type from input and pattern
- `WhenMatch` - Computes the narrowed type for a `when` clause
- `NotMatch` - Computes remaining types after negation
- `ApplyFilters` - Applies accumulated filters to narrow types

---

## Replacing Switch/If-Else

### Before: Switch Statement

```typescript
// ❌ FORBIDDEN - switch statements
function handleResponse(response: Response): string {
  switch (response._tag) {
    case "loading":
      return "Loading..."
    case "success":
      return `Found ${response.data.length} items`
    case "error":
      return `Error: ${response.error}`
    default:
      return "Unknown"  // Not type-safe!
  }
}
```

### After: Match.exhaustive

```typescript
// ✅ REQUIRED - Match with exhaustive checking
import * as Match from "effect/Match"

type Response =
  | { readonly _tag: "loading" }
  | { readonly _tag: "success"; readonly data: ReadonlyArray<Item> }
  | { readonly _tag: "error"; readonly error: string }

const handleResponse = Match.type<Response>().pipe(
  Match.tag("loading", () => "Loading..."),
  Match.tag("success", (r) => `Found ${r.data.length} items`),
  Match.tag("error", (r) => `Error: ${r.error}`),
  Match.exhaustive  // Compile error if any case missing!
)
```

### Before: If-Else Chain

```typescript
// ❌ FORBIDDEN - long if-else chains
function classify(value: unknown): string {
  if (typeof value === "string") {
    return `String: ${value}`
  } else if (typeof value === "number") {
    return `Number: ${value}`
  } else if (Array.isArray(value)) {
    return `Array: ${value.length}`
  } else {
    return "Unknown"
  }
}
```

### After: Match with Predicates

```typescript
// ✅ REQUIRED - Match with predicates
import * as Match from "effect/Match"
import * as P from "effect/Predicate"

const classify = Match.type<unknown>().pipe(
  Match.when(P.isString, (s) => `String: ${s}`),
  Match.when(P.isNumber, (n) => `Number: ${n}`),
  Match.when(P.isArray, (a) => `Array: ${a.length}`),
  Match.orElse(() => "Unknown")
)
```

### Before: Nested If-Else

```typescript
// ❌ FORBIDDEN - nested conditions
function checkAccess(user: User): string {
  if (user.age >= 18) {
    if (user.role === "admin") {
      return "Admin access granted"
    } else {
      return "User access granted"
    }
  } else {
    return "Access denied"
  }
}
```

### After: Match.whenAnd

```typescript
// ✅ REQUIRED - Match with combined patterns
import * as Match from "effect/Match"

type User = { readonly age: number; readonly role: "admin" | "user" }

const checkAccess = Match.type<User>().pipe(
  Match.whenAnd(
    { age: (n) => n >= 18 },
    { role: "admin" },
    () => "Admin access granted"
  ),
  Match.when({ age: (n) => n >= 18 }, () => "User access granted"),
  Match.orElse(() => "Access denied")
)
```

---

## Common Patterns

### Pattern 1: HTTP Response Handling

```typescript
import * as Match from "effect/Match"

type HttpResponse =
  | { readonly status: 200; readonly data: Data }
  | { readonly status: 404; readonly message: string }
  | { readonly status: 500; readonly error: Error }

const handleResponse = Match.type<HttpResponse>().pipe(
  Match.discriminator("status")(200, (r) => Effect.succeed(r.data)),
  Match.discriminator("status")(404, (r) => new NotFoundError({ message: r.message })),
  Match.discriminator("status")(500, (r) => new ServerError({ error: r.error })),
  Match.exhaustive
)
```

### Pattern 2: State Machine

```typescript
type State =
  | { readonly _tag: "idle" }
  | { readonly _tag: "loading" }
  | { readonly _tag: "success"; readonly data: Data }
  | { readonly _tag: "error"; readonly error: Error }

const renderState = Match.type<State>().pipe(
  Match.tag("idle", () => <div>Click to load</div>),
  Match.tag("loading", () => <div>Loading...</div>),
  Match.tag("success", (s) => <div>Data: {s.data}</div>),
  Match.tag("error", (s) => <div>Error: {s.error.message}</div>),
  Match.exhaustive
)
```

### Pattern 3: Validation Result

```typescript
import * as Match from "effect/Match"
import * as E from "effect/Either"

type ValidationResult =
  | E.Left<ValidationError>
  | E.Right<ValidData>

const handleValidation = Match.type<ValidationResult>().pipe(
  Match.when(E.isLeft, (e) => `Validation failed: ${e.left.message}`),
  Match.when(E.isRight, (r) => `Valid: ${JSON.stringify(r.right)}`),
  Match.exhaustive
)
```

### Pattern 4: Error Recovery

```typescript
type AppError =
  | { readonly _tag: "NetworkError"; readonly retry: () => Effect.Effect<void> }
  | { readonly _tag: "ValidationError"; readonly field: string }
  | { readonly _tag: "AuthError"; readonly redirectUrl: string }

const recoverFromError = Match.type<AppError>().pipe(
  Match.tag("NetworkError", (e) => e.retry()),
  Match.tag("ValidationError", (e) => Effect.fail(new InvalidFieldError({ field: e.field }))),
  Match.tag("AuthError", (e) => Effect.succeed({ redirect: e.redirectUrl })),
  Match.exhaustive
)
```

### Pattern 5: Nested Object Matching

```typescript
type Config =
  | { readonly env: "dev"; readonly debug: true; readonly hot: boolean }
  | { readonly env: "prod"; readonly debug: false; readonly cdn: string }

const configureApp = Match.type<Config>().pipe(
  Match.when(
    { env: "dev", debug: true },
    (c) => `Dev mode with hot reload: ${c.hot}`
  ),
  Match.when(
    { env: "prod", debug: false },
    (c) => `Production mode with CDN: ${c.cdn}`
  ),
  Match.exhaustive
)
```

---

## Best Practices

### 1. Always Use Exhaustive Checking for Discriminated Unions

```typescript
// ✅ GOOD - Exhaustive checking catches missing cases
const match = Match.type<Result>().pipe(
  Match.tag("success", (r) => r.data),
  Match.tag("error", (r) => r.error),
  Match.exhaustive  // TypeScript error if new tag added
)

// ❌ BAD - orElse silently handles new cases
const match = Match.type<Result>().pipe(
  Match.tag("success", (r) => r.data),
  Match.orElse(() => null)  // Hides potential bugs
)
```

### 2. Use `Match.type` for Reusable Matchers

```typescript
// ✅ GOOD - Reusable matcher function
const handleError = Match.type<AppError>().pipe(
  Match.tag("NetworkError", (e) => `Network: ${e.message}`),
  Match.tag("ValidationError", (e) => `Validation: ${e.field}`),
  Match.exhaustive
)

// Use it multiple times
const result1 = handleError(error1)
const result2 = handleError(error2)
```

### 3. Use `Match.value` for One-Off Matches

```typescript
// ✅ GOOD - One-time matching
const result = Match.value(response).pipe(
  Match.when({ status: 200 }, (r) => r.data),
  Match.orElse(() => null)
)
```

### 4. Combine Patterns with `whenAnd` for Complex Conditions

```typescript
// ✅ GOOD - Multiple conditions
Match.type<User>().pipe(
  Match.whenAnd(
    { age: (n) => n >= 18 },
    { role: "admin" },
    { active: true },
    () => "Active adult admin"
  ),
  Match.orElse(() => "Other")
)

// ❌ BAD - Nested when clauses
Match.type<User>().pipe(
  Match.when({ age: (n) => n >= 18 }, (u) =>
    u.role === "admin" && u.active ? "Active adult admin" : "Other"
  ),
  Match.orElse(() => "Other")
)
```

### 5. Use `tagsExhaustive` or `discriminatorsExhaustive` for Object-Style Matching

```typescript
// ✅ GOOD - Object-style exhaustive matching
const match = Match.type<Event>().pipe(
  Match.tagsExhaustive({
    fetch: () => "Loading",
    success: (e) => `Data: ${e.data}`,
    error: (e) => `Error: ${e.error}`
  })
)

// ❌ BAD - Manual tag matching (more verbose)
const match = Match.type<Event>().pipe(
  Match.tag("fetch", () => "Loading"),
  Match.tag("success", (e) => `Data: ${e.data}`),
  Match.tag("error", (e) => `Error: ${e.error}`),
  Match.exhaustive
)
```

### 6. Leverage Type Narrowing

```typescript
// ✅ GOOD - TypeScript knows exact type in each branch
Match.type<Shape>().pipe(
  Match.when({ kind: "circle" }, (s) => {
    // s: { kind: "circle"; radius: number }
    return Math.PI * s.radius * s.radius
  }),
  Match.exhaustive
)

// ❌ BAD - Manual type assertion
Match.type<Shape>().pipe(
  Match.when({ kind: "circle" }, (s) => {
    const circle = s as Circle  // Unnecessary!
    return Math.PI * circle.radius * circle.radius
  }),
  Match.exhaustive
)
```

### 7. Use `withReturnType` for Consistent Return Types

```typescript
// ✅ GOOD - Enforces return type consistency
const match = Match.type<Input>().pipe(
  Match.withReturnType<string>(),  // Must be first!
  Match.when(cond1, (x) => `Result: ${x}`),
  // @ts-expect-error - number is not string
  Match.when(cond2, (x) => 42),
  Match.exhaustive
)
```

---

## Anti-Patterns

### 1. Don't Use `any` Return Type

```typescript
// ❌ BAD - Loses type information
const match = Match.type<Input>().pipe(
  Match.when(cond1, (x) => x.foo as any),
  Match.exhaustive
)

// ✅ GOOD - Preserve types
const match = Match.type<Input>().pipe(
  Match.when(cond1, (x): string => x.foo),
  Match.exhaustive
)
```

### 2. Don't Overuse `orElse` for Discriminated Unions

```typescript
// ❌ BAD - orElse hides missing cases
type Result =
  | { _tag: "success"; data: Data }
  | { _tag: "error"; error: Error }
  | { _tag: "loading" }  // Added later, silently caught by orElse

const match = Match.type<Result>().pipe(
  Match.tag("success", (r) => r.data),
  Match.orElse(() => null)  // Hides "error" and "loading"!
)

// ✅ GOOD - Exhaustive catches new cases
const match = Match.type<Result>().pipe(
  Match.tag("success", (r) => r.data),
  Match.tag("error", (r) => r.error),
  Match.tag("loading", () => null),
  Match.exhaustive  // TypeScript error if new tag added
)
```

### 3. Don't Mix Match with Switch

```typescript
// ❌ BAD - Mixing paradigms
const match = Match.value(x).pipe(
  Match.when(cond1, (v) => {
    switch (v.type) {  // Don't do this!
      case "A": return "a"
      case "B": return "b"
    }
  }),
  Match.exhaustive
)

// ✅ GOOD - Consistent Match usage
const match = Match.value(x).pipe(
  Match.when(cond1, (v) =>
    Match.value(v).pipe(
      Match.discriminator("type")("A", () => "a"),
      Match.discriminator("type")("B", () => "b"),
      Match.exhaustive
    )
  ),
  Match.exhaustive
)
```

### 4. Don't Ignore Type Narrowing

```typescript
// ❌ BAD - Manual type guards
Match.type<Shape>().pipe(
  Match.when({ kind: "circle" }, (s) => {
    if ("radius" in s) {  // Unnecessary!
      return s.radius
    }
  }),
  Match.exhaustive
)

// ✅ GOOD - Trust type narrowing
Match.type<Shape>().pipe(
  Match.when({ kind: "circle" }, (s) => s.radius),
  Match.exhaustive
)
```

---

## Comparison with Other Languages

### Rust

```rust
// Rust
match response {
    Response::Success(data) => println!("Data: {}", data),
    Response::Error(err) => eprintln!("Error: {}", err),
    Response::Loading => println!("Loading..."),
}
```

```typescript
// Effect equivalent
Match.type<Response>().pipe(
  Match.tag("Success", (r) => console.log(`Data: ${r.data}`)),
  Match.tag("Error", (r) => console.error(`Error: ${r.error}`)),
  Match.tag("Loading", () => console.log("Loading...")),
  Match.exhaustive
)
```

### Scala

```scala
// Scala
response match {
  case Success(data) => s"Data: $data"
  case Error(err) => s"Error: $err"
  case Loading => "Loading..."
}
```

```typescript
// Effect equivalent
Match.type<Response>().pipe(
  Match.tag("Success", (r) => `Data: ${r.data}`),
  Match.tag("Error", (r) => `Error: ${r.error}`),
  Match.tag("Loading", () => "Loading..."),
  Match.exhaustive
)
```

### Haskell

```haskell
-- Haskell
case response of
  Success data -> "Data: " ++ show data
  Error err -> "Error: " ++ show err
  Loading -> "Loading..."
```

```typescript
// Effect equivalent
Match.type<Response>().pipe(
  Match.tag("Success", (r) => `Data: ${r.data}`),
  Match.tag("Error", (r) => `Error: ${r.error}`),
  Match.tag("Loading", () => "Loading..."),
  Match.exhaustive
)
```

---

## Performance Considerations

### Runtime Cost

Match uses predicate guards which have **O(n)** complexity where n is the number of cases. For most applications this is negligible.

```typescript
// Each case evaluates until match found
Match.type<T>().pipe(
  Match.when(pred1, fn1),  // Evaluated first
  Match.when(pred2, fn2),  // Evaluated if pred1 fails
  Match.when(pred3, fn3),  // Evaluated if pred1, pred2 fail
  Match.exhaustive
)
```

### Optimization Tips

1. **Order cases by likelihood** - Most common cases first
2. **Use discriminator matching** - More efficient than predicate matching
3. **Avoid complex predicates** - Keep guards simple

```typescript
// ✅ GOOD - Discriminator matching (fast)
Match.type<Event>().pipe(
  Match.tag("success", fn),  // O(1) property access
  Match.tag("error", fn),
  Match.exhaustive
)

// ⚠️ SLOWER - Complex predicate matching
Match.type<Event>().pipe(
  Match.when((e) => complexCheck(e), fn),  // O(?) custom logic
  Match.orElse(fallback)
)
```

---

## Integration with beep-effect

### Usage in beep-effect Codebase

```typescript
import * as Match from "effect/Match"
import * as P from "effect/Predicate"

// ✅ REQUIRED - Replace switch statements
type ApiResponse =
  | { readonly _tag: "Success"; readonly data: Data }
  | { readonly _tag: "Error"; readonly error: AppError }

const handleResponse = Match.type<ApiResponse>().pipe(
  Match.tag("Success", (r) => Effect.succeed(r.data)),
  Match.tag("Error", (r) => Effect.fail(r.error)),
  Match.exhaustive
)

// ✅ REQUIRED - Replace if-else chains
const classify = Match.type<unknown>().pipe(
  Match.when(P.isString, (s) => F.pipe(s, Str.toUpperCase)),
  Match.when(P.isNumber, (n) => Num.toString(n)),
  Match.orElse(() => "unknown")
)

// ✅ REQUIRED - Discriminated union handling
type UserAction =
  | { readonly _tag: "Create"; readonly data: CreateData }
  | { readonly _tag: "Update"; readonly id: string; readonly data: UpdateData }
  | { readonly _tag: "Delete"; readonly id: string }

const handleAction = Match.type<UserAction>().pipe(
  Match.tag("Create", (a) => createUser(a.data)),
  Match.tag("Update", (a) => updateUser(a.id, a.data)),
  Match.tag("Delete", (a) => deleteUser(a.id)),
  Match.exhaustive
)
```

### Replacing AGENTS.md Anti-Patterns

Update the anti-patterns section to forbid switch/if-else:

```markdown
### NEVER Use Switch Statements

// ❌ FORBIDDEN - switch statements
switch (response._tag) {
  case "success": return r.data
  case "error": return r.error
}

// ✅ REQUIRED - Match.exhaustive
Match.type<Response>().pipe(
  Match.tag("success", (r) => r.data),
  Match.tag("error", (r) => r.error),
  Match.exhaustive
)

### NEVER Use Long If-Else Chains

// ❌ FORBIDDEN - if-else chains
if (typeof x === "string") { ... }
else if (typeof x === "number") { ... }
else { ... }

// ✅ REQUIRED - Match with predicates
Match.type<unknown>().pipe(
  Match.when(P.isString, (s) => ...),
  Match.when(P.isNumber, (n) => ...),
  Match.orElse(() => ...)
)
```

---

## Summary

### Key Functions by Category

**Creating Matchers:**
- `Match.type<T>()` - Type-based matcher (reusable)
- `Match.value(v)` - Value-based matcher (one-off)
- `Match.valueTags` - Value-based discriminated union shorthand
- `Match.typeTags` - Type-based discriminated union shorthand
- `Match.withReturnType<Ret>()` - Enforce return type consistency

**Pattern Matching:**
- `Match.when(pattern, fn)` - Basic pattern matching
- `Match.whenOr(...patterns, fn)` - OR logic (multiple patterns)
- `Match.whenAnd(...patterns, fn)` - AND logic (all patterns must match)
- `Match.not(pattern, fn)` - Negation (exclude specific values)

**Discriminated Unions:**
- `Match.tag(...tags, fn)` - Match by `_tag` field
- `Match.tags(obj)` - Map tags to handlers (partial)
- `Match.tagsExhaustive(obj)` - Map all tags (exhaustive)
- `Match.tagStartsWith(prefix, fn)` - Match tags by prefix
- `Match.discriminator(field)` - Generic discriminator
- `Match.discriminators(field)(obj)` - Map discriminators (partial)
- `Match.discriminatorsExhaustive(field)(obj)` - Map all discriminators (exhaustive)
- `Match.discriminatorStartsWith(field)` - Discriminator prefix matching

**Predicates:**
- Primitives: `string`, `number`, `boolean`, `bigint`, `symbol`, `null`, `undefined`
- Special: `any`, `defined`, `nonEmptyString`, `date`, `record`
- Advanced: `is(...literals)`, `instanceOf(Class)`, `instanceOfUnsafe(Class)`

**Completion:**
- `Match.exhaustive` - Ensure all cases handled (compile-time)
- `Match.orElse(fn)` - Fallback (default case)
- `Match.orElseAbsurd` - Throw error if unmatched
- `Match.either` - Return `Either<A, R>`
- `Match.option` - Return `Option<A>`

### When to Use Each Function

| Scenario | Use |
|----------|-----|
| Reusable discriminated union matcher | `Match.type<T>().pipe(Match.tag(...), Match.exhaustive)` |
| One-off discriminated union match | `Match.value(v).pipe(Match.tag(...), Match.exhaustive)` |
| Object-style discriminated union | `Match.tagsExhaustive({ ... })` |
| Type-based pattern matching | `Match.type<T>().pipe(Match.when(...), Match.exhaustive)` |
| Value-based pattern matching | `Match.value(v).pipe(Match.when(...), Match.orElse(...))` |
| Multiple patterns sharing handler | `Match.whenOr(p1, p2, fn)` |
| Multiple conditions required | `Match.whenAnd(p1, p2, fn)` |
| Exclude specific values | `Match.not(pattern, fn)` |
| Optional match result | `Match.option` |
| Either success or remaining | `Match.either` |
| Custom discriminator field | `Match.discriminator("field")` |
| Hierarchical tags | `Match.tagStartsWith("prefix", fn)` |

---

## References

- **Effect Documentation:** https://effect.website/docs/pattern-matching
- **Source Code:** `/tmp/effect/packages/effect/src/Match.ts`
- **TypeScript Handbook:** https://www.typescriptlang.org/docs/handbook/2/narrowing.html
- **Discriminated Unions:** https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes-func.html#discriminated-unions
