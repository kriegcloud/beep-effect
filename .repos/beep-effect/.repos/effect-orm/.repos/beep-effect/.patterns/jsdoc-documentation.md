# JSDoc Documentation Patterns - beep-effect codebase

## Overview

This document defines JSDoc documentation standards for the beep-effect monorepo. All patterns align with:
- The docgen system (`documentation/docgen/`)
- AGENTS.md Effect-first patterns
- Actual codebase conventions

**This is the single source of truth for JSDoc patterns.**

---

## Critical Requirements

### Non-Negotiable Rules

1. **MANDATORY**: All JSDoc examples must compile via `bun run docgen:generate --validate-examples`
2. **MANDATORY**: Every public export requires three tags: `@category`, `@example`, `@since`
3. **MANDATORY**: Use Effect namespace imports in all examples
4. **FORBIDDEN**: Removing examples to fix compilation — always fix type issues properly
5. **FORBIDDEN**: `any` types, type assertions, or unsafe patterns in examples
6. **FORBIDDEN**: Native array/string methods, async/await, switch statements in examples

### Documentation Coverage Target

- All public exports must be documented
- High priority: Missing all three required tags
- Medium priority: Missing 1-2 required tags
- Low priority: Fully documented (maintenance only)

---

## Docgen Integration

### Required Tags

Every public export MUST have these three tags:

```ts
/**
 * Description here.
 *
 * @example
 * ```ts
 * // Compilable TypeScript example
 * ```
 *
 * @since 0.1.0
 * @category Constructors
 */
```

The `docgen analyze` command checks for: `@category`, `@example`, `@since`.

### Package Configuration

Packages use `docgen.json` with `examplesCompilerOptions.paths` for import resolution:

```json
{
  "examplesCompilerOptions": {
    "paths": {
      "@beep/contract": ["./src/index.ts"],
      "@beep/*": ["../../../packages/*/src/index.ts"]
    }
  }
}
```

Examples MUST use `@beep/*` import paths that resolve during validation.

### Validation Command

Verify examples compile before committing:

```bash
bun run docgen:generate -- -p packages/common/contract --validate-examples
```

### Workflow Commands

```bash
# Initialize docgen for a package
bun run docgen:init -- -p packages/common/contract

# Analyze documentation coverage
bun run docgen:analyze -- -p packages/common/contract

# Generate documentation with validation
bun run docgen:generate -- -p packages/common/contract --validate-examples

# AI-assisted documentation (dry run first)
bun run docgen:agents -- --dry-run -p packages/common/contract
```

See `documentation/docgen/` for full reference.

---

## Import Patterns

### Effect Namespace Imports (Required)

Always use namespace imports with standard aliases:

```ts
// Namespace imports for Effect modules
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Context from "effect/Context"
import * as Struct from "effect/Struct"
import * as Cause from "effect/Cause"

// Single-letter aliases for frequently used modules
import * as A from "effect/Array"
import * as F from "effect/Function"
import * as O from "effect/Option"
import * as R from "effect/Record"
import * as S from "effect/Schema"
import * as Str from "effect/String"
import * as P from "effect/Predicate"
import * as B from "effect/Brand"
import * as Bool from "effect/Boolean"
import * as Num from "effect/Number"
import * as BI from "effect/BigInt"

// Full-name imports for clarity
import * as DateTime from "effect/DateTime"
import * as Match from "effect/Match"
import * as HashMap from "effect/HashMap"
import * as HashSet from "effect/HashSet"
import * as AST from "effect/SchemaAST"
```

### Package Imports

Use `@beep/*` aliases for internal packages:

```ts
import { Contract } from "@beep/contract"
import { EntityId } from "@beep/schema"
import { nullOp, noOp, nullOpE } from "@beep/utils"
```

### Anti-Pattern: Destructured Imports

```ts
// FORBIDDEN - destructured imports from "effect"
import { Array, Effect, Console } from "effect"

// REQUIRED - namespace imports
import * as Effect from "effect/Effect"
import * as A from "effect/Array"
import * as Console from "effect/Console"
```

---

## Required Tags

### @category

Single-word lowercase category for the export. **NEVER use hierarchical patterns with `/`.**

```ts
/**
 * @category constructors
 * @category models
 * @category schemas
 * @category combinators
 * @category errors
 * @category services
 * @category layers
 */
```

### @example

Complete, compilable TypeScript examples using Effect patterns:

```ts
/**
 * @example
 * ```ts
 * import { MyFunction } from "@beep/package-name"
 * import * as Effect from "effect/Effect"
 * import * as F from "effect/Function"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* MyFunction({ input: "value" })
 *   console.log(result)
 *   return result
 * })
 * ```
 */
```

### @since

Version when the export was added:

```ts
/**
 * @since 0.1.0
 */
```

---

## Category Taxonomy

### Standard Categories

**IMPORTANT:** Categories must be single lowercase words. Never use `/` or hierarchical patterns.

```ts
// Creation & Construction
@category constructors    // Factory functions, `make`, `of`, `from*` functions
@category schemas         // Effect Schema definitions and validators

// Transformation & Composition
@category combinators     // Functions that combine/transform instances
@category mapping         // Data transformation functions (map, mapError, etc.)
@category encoding        // Encode/decode transformations

// Selection & Access
@category getters         // Property access functions
@category filtering       // Data selection and filtering functions
@category folding         // Data aggregation/reduction functions

// Type System
@category models          // Type definitions, interfaces, and data structures
@category symbols         // Type identifiers, branded types, Context.Tag
@category guards          // Type guard functions (is*, has*)
@category refinements     // Type refinement functions
@category predicates      // Boolean-returning functions

// Control Flow
@category sequencing      // Sequential operations (flatMap, andThen, tap)
@category concurrency     // Parallel/concurrent operations
@category errors          // Error management and error types

// Infrastructure
@category layers          // Effect Layer constructors and providers
@category services        // Service interfaces and implementations
@category resources       // Resource lifecycle management

// Utilities
@category utilities       // General helper functions
@category interop         // Interoperability with external systems/promises
@category testing         // Test utilities and mocks
@category logging         // Logging and tracing utilities

// Module Organization
@category exports         // Re-exports from barrel files
@category instances       // Typeclass instances (Eq, Ord, Hash, etc.)
```

### Choosing the Right Category

| What the export does | Category |
|---------------------|----------|
| Creates new instances (`make`, `of`, `from`) | `constructors` |
| Defines a Schema for validation | `schemas` |
| Transforms data (`map`, `pipe` chains) | `combinators` or `mapping` |
| Returns boolean (`is*`, `has*`, `can*`) | `predicates` or `guards` |
| Accesses properties (`get*`) | `getters` |
| Filters collections | `filtering` |
| Reduces/aggregates data | `folding` |
| Defines types/interfaces | `models` |
| Creates Context.Tag or branded types | `symbols` |
| Handles errors | `errors` |
| Provides dependencies via Layer | `layers` |
| Defines service interface | `services` |
| Re-exports from index.ts | `exports` |

---

## Example Content Patterns

### Constructor Examples

```ts
/**
 * Creates a new Contract instance with type-safe validation.
 *
 * @example
 * ```ts
 * import { Contract } from "@beep/contract"
 * import * as S from "effect/Schema"
 * import * as F from "effect/Function"
 *
 * const UserContract = Contract.make({
 *   input: S.Struct({ name: S.String }),
 *   output: S.Struct({ id: S.String }),
 * })
 *
 * // Use with pipe
 * F.pipe(
 *   UserContract,
 *   Contract.validate({ name: "Alice" })
 * )
 * ```
 *
 * @since 0.1.0
 * @category constructors
 */
```

### Effect Pattern Examples

```ts
/**
 * Performs an effectful operation with dependency injection.
 *
 * @example
 * ```ts
 * import { UserService } from "@beep/iam-domain"
 * import * as Effect from "effect/Effect"
 * import * as A from "effect/Array"
 * import * as F from "effect/Function"
 *
 * const program = Effect.gen(function* () {
 *   const userService = yield* UserService
 *   const users = yield* userService.findAll()
 *
 *   const names = F.pipe(
 *     users,
 *     A.map((user) => user.name)
 *   )
 *
 *   return names
 * })
 * ```
 *
 * @since 0.1.0
 * @category services
 */
```

### Schema Examples

```ts
/**
 * Defines a validated user schema with branded types.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import * as F from "effect/Function"
 *
 * const UserSchema = S.Struct({
 *   id: S.String,
 *   name: S.String,
 *   email: S.String,
 *   age: S.Number,
 * })
 *
 * const decoded = F.pipe(
 *   { id: "1", name: "Alice", email: "alice@example.com", age: 30 },
 *   S.decodeUnknownSync(UserSchema)
 * )
 * ```
 *
 * @since 0.1.0
 * @category schemas
 */
```

### Type-Level Examples

```ts
/**
 * Type-level utility for extracting struct field keys.
 *
 * @example
 * ```ts
 * import type * as StructTypes from "@beep/types/struct.types"
 * import * as S from "effect/Schema"
 *
 * type Fields = StructTypes.StructFieldsWithStringKeys & { id: S.Struct.Field }
 * let example!: Fields
 * void example
 * ```
 *
 * @since 0.1.0
 * @category models
 */
```

---

## Anti-Patterns

### NEVER Use in JSDoc Examples

#### Native Array Methods

```ts
// FORBIDDEN
items.map((item) => item.name)
items.filter((item) => item.active)
Array.from(iterable)
items.reduce((acc, item) => acc + item, 0)
items.forEach((item) => console.log(item))

// REQUIRED - Effect Array utilities with pipe
import * as A from "effect/Array"
import * as F from "effect/Function"

F.pipe(items, A.map((item) => item.name))
F.pipe(items, A.filter((item) => item.active))
F.pipe(iterable, A.fromIterable)
F.pipe(items, A.reduce(0, (acc, item) => acc + item))
F.pipe(items, A.forEach((item) => console.log(item)))
```

#### Native String Methods

```ts
// FORBIDDEN
str.charAt(0).toUpperCase()
str.split(" ")
str.trim()
str.includes("test")

// REQUIRED - Effect String utilities
import * as Str from "effect/String"
import * as F from "effect/Function"

F.pipe(str, Str.charAt(0), Str.toUpperCase)
F.pipe(str, Str.split(" "))
F.pipe(str, Str.trim)
F.pipe(str, Str.includes("test"))
```

#### Native Object Methods

```ts
// FORBIDDEN
Object.keys(obj)
Object.values(obj)
Object.entries(obj)

// REQUIRED - Effect Struct/Record utilities
import * as Struct from "effect/Struct"
import * as R from "effect/Record"
import * as F from "effect/Function"

F.pipe(obj, Struct.keys)
F.pipe(obj, R.values)
F.pipe(obj, R.toEntries)
```

#### Native Date

```ts
// FORBIDDEN
new Date()
new Date("2025-01-15")
date.setDate(date.getDate() + 1)
date.getMonth() + 1
date.toISOString()

// REQUIRED - Effect DateTime
import * as DateTime from "effect/DateTime"

DateTime.unsafeNow()
DateTime.unsafeMake("2025-01-15")
DateTime.add(date, { days: 1 })
DateTime.formatIso(date)
```

#### async/await

```ts
// FORBIDDEN
async function fetchUser(id: string) {
  const response = await fetch(`/users/${id}`)
  return await response.json()
}

// REQUIRED - Effect.gen
import * as Effect from "effect/Effect"

const fetchUser = (id: string) =>
  Effect.gen(function* () {
    const response = yield* Effect.tryPromise(() => fetch(`/users/${id}`))
    const data = yield* Effect.tryPromise(() => response.json())
    return data
  })
```

#### Switch Statements

```ts
// FORBIDDEN
switch (response._tag) {
  case "success":
    return response.data
  case "error":
    return response.error
  default:
    return "Unknown"
}

// REQUIRED - Match.exhaustive
import * as Match from "effect/Match"

const result = Match.value(response).pipe(
  Match.tag("success", (r) => r.data),
  Match.tag("error", (r) => r.error),
  Match.exhaustive
)
```

#### Type Assertions and any

```ts
// FORBIDDEN
const value = something as SomeType
const x: any = getData()
// @ts-ignore
// @ts-expect-error

// REQUIRED - Proper typing with Schema validation
import * as S from "effect/Schema"
import * as F from "effect/Function"

const value = F.pipe(
  something,
  S.decodeUnknownSync(SomeTypeSchema)
)
```

#### Native Collections

```ts
// FORBIDDEN
const map = new Map<string, number>()
const set = new Set<string>()

// REQUIRED - Effect collections
import * as HashMap from "effect/HashMap"
import * as HashSet from "effect/HashSet"
import * as F from "effect/Function"

const map = HashMap.empty<string, number>()
const set = HashSet.empty<string>()
```

#### Inline No-op Functions

```ts
// FORBIDDEN
const callback = () => {}
const nullCallback = () => null
const effectCallback = () => Effect.succeed(null)

// REQUIRED - @beep/utils no-ops
import { noOp, nullOp, nullOpE } from "@beep/utils"

const callback = noOp
const nullCallback = nullOp
const effectCallback = nullOpE
```

---

## Effect Patterns in Examples

### Pipe with Transformations

Always use `F.pipe()` for data transformations:

```ts
import * as A from "effect/Array"
import * as F from "effect/Function"
import * as Str from "effect/String"

// Transform array
const names = F.pipe(
  users,
  A.filter((user) => user.active),
  A.map((user) => user.name),
  A.sort(Str.Order)
)

// Transform string
const formatted = F.pipe(
  rawInput,
  Str.trim,
  Str.toLowerCase,
  Str.replace(/\s+/g, "-")
)
```

### Effect.gen for Effectful Code

```ts
import * as Effect from "effect/Effect"

const program = Effect.gen(function* () {
  const config = yield* ConfigService
  const db = yield* DatabaseService

  const users = yield* db.query("SELECT * FROM users")

  return users
})
```

### Pattern Matching with Match

```ts
import * as Match from "effect/Match"
import * as P from "effect/Predicate"

// Match on discriminated union
const handleResponse = Match.type<ApiResponse>().pipe(
  Match.tag("success", (r) => r.data),
  Match.tag("error", (r) => Effect.fail(r.error)),
  Match.tag("loading", () => Effect.succeed(null)),
  Match.exhaustive
)

// Match with predicates
const describe = Match.value(value).pipe(
  Match.when(P.isString, (s) => `String: ${s}`),
  Match.when(P.isNumber, (n) => `Number: ${n}`),
  Match.when(P.isArray, (a) => `Array of ${a.length}`),
  Match.orElse(() => "Unknown")
)
```

### DateTime Operations

```ts
import * as DateTime from "effect/DateTime"
import * as Effect from "effect/Effect"

// Current time
const now = DateTime.unsafeNow()

// In Effect context
const program = Effect.gen(function* () {
  const currentTime = yield* DateTime.now
  return currentTime
})

// Arithmetic (immutable)
const tomorrow = DateTime.add(now, { days: 1 })
const lastWeek = DateTime.subtract(now, { weeks: 1 })

// Formatting
const isoString = DateTime.formatIso(now)
const formatted = DateTime.format(now, { dateStyle: "medium" })

// Timezones
const zonedTime = DateTime.makeZoned(now, { timeZone: "America/New_York" })
const utcTime = DateTime.toUtc(zonedTime)
```

### HashMap and HashSet

```ts
import * as HashMap from "effect/HashMap"
import * as HashSet from "effect/HashSet"
import * as F from "effect/Function"
import * as O from "effect/Option"

// HashMap operations
const userMap = F.pipe(
  HashMap.empty<string, User>(),
  HashMap.set("user-1", { id: "user-1", name: "Alice" }),
  HashMap.set("user-2", { id: "user-2", name: "Bob" })
)

const alice: O.Option<User> = F.pipe(userMap, HashMap.get("user-1"))

// HashSet operations
const tags = F.pipe(
  HashSet.empty<string>(),
  HashSet.add("typescript"),
  HashSet.add("effect")
)

const hasTypeScript: boolean = F.pipe(tags, HashSet.has("typescript"))
```

### Predicate Guards

```ts
import * as P from "effect/Predicate"
import * as Num from "effect/Number"

// Type guards
if (P.isString(value)) {
  // value is string
}

if (P.isTagged("success")(response)) {
  // response has _tag: "success"
}

// Composed predicates
const isValidAge = P.and(
  Num.greaterThanOrEqualTo(0),
  Num.lessThanOrEqualTo(120)
)

const isValidUser = P.struct({
  name: P.isString,
  age: isValidAge,
})
```

---

## Code Fence Format

Use ` ```ts ` (not ` ```typescript `) for all code examples:

```ts
/**
 * @example
 * ```ts
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.succeed("hello")
 * ```
 */
```

---

## Complete Template

### Function Documentation

```ts
/**
 * Brief description of what the function does in one line.
 *
 * More detailed explanation if needed, including:
 * - Important behavior notes
 * - Performance characteristics
 * - Common use cases
 *
 * @example
 * ```ts
 * import { functionName } from "@beep/package-name"
 * import * as Effect from "effect/Effect"
 * import * as F from "effect/Function"
 *
 * // Basic usage
 * const result = functionName({ input: "value" })
 *
 * // With Effect
 * const program = Effect.gen(function* () {
 *   const output = yield* functionName({ input: "value" })
 *   return output
 * })
 * ```
 *
 * @since 0.1.0
 * @category constructors
 */
export const functionName = <A>(param: A): Result<A> => {
  // implementation
}
```

### Type Documentation

```ts
/**
 * Brief description of the type's purpose.
 *
 * @example
 * ```ts
 * import type { TypeName } from "@beep/package-name"
 * import * as S from "effect/Schema"
 *
 * type Example = TypeName<{ id: S.Struct.Field }>
 * let instance!: Example
 * void instance
 * ```
 *
 * @since 0.1.0
 * @category models
 */
export type TypeName<T> = ...
```

### Module Documentation

```ts
/**
 * Brief module description.
 *
 * Extended description of what this module provides and when to use it.
 *
 * @example
 * ```ts
 * import * as ModuleName from "@beep/package-name/ModuleName"
 * import * as F from "effect/Function"
 *
 * const result = F.pipe(
 *   input,
 *   ModuleName.transform,
 *   ModuleName.validate
 * )
 * ```
 *
 * @category exports
 */
```

---

## Quality Checklist

Before committing documentation:

- [ ] All examples use namespace imports (`import * as X from "effect/..."`)
- [ ] All examples use `F.pipe()` with Effect utilities
- [ ] No native array/string methods in examples
- [ ] No async/await in examples
- [ ] No switch statements in examples
- [ ] No native Date usage in examples
- [ ] All examples use ` ```ts ` code fence (not ` ```typescript `)
- [ ] @category, @example, @since present on all exports
- [ ] @category uses single lowercase word (no `/` hierarchies)
- [ ] Examples compile with `bun run docgen:generate --validate-examples`
- [ ] Path mappings configured in package's `docgen.json`
- [ ] No-op helpers from @beep/utils used instead of inline functions
- [ ] DateTime/Match/Predicate patterns followed where applicable
- [ ] HashMap/HashSet used instead of native Map/Set

---

## References

- `documentation/docgen/DOCGEN.md` — Main docgen command reference
- `documentation/docgen/DOCGEN_AGENTS.md` — AI agent documentation system
- `documentation/docgen/DOCGEN_CONFIGURATION.md` — Configuration options
- `documentation/docgen/DOCGEN_QUICK_START.md` — Getting started guide
- `AGENTS.md` — Effect-first patterns and critical rules
