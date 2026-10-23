# Upstream Effect module organization reference

## Scope and authority

This file is retained as an upstream Effect library reference. It was copied
and later adapted from library-internal guidance; it does not define Beep's
package topology or override repository laws. For work in this repository,
follow [the architecture standard](../standards/ARCHITECTURE.md),
[Effect-first development](../standards/effect-first-development.md), and the
applicable package's `AGENTS.md`.

Every TypeScript example below is compiled by
`bun run beep laws markdown-fences --check` against the public `effect/*`
modules. The six fences marked `skip-type-checking` are verbatim-style excerpts
of upstream source files: their relative imports (`./Effect.ts`,
`./internal/core.ts`) resolve only inside the Effect source tree. A displayed
directory tree must still be checked against the current Effect reference
before reuse. The local reference is provisioned with
`bun run beep refs provision`; its own `AGENTS.md` governs work inside that
checkout. Upstream commands and relative paths apply there.

Disposition recorded 2026-10-20 for #1856: keep as a labeled upstream reference.
The local Effect checkout was inspected at
`1b740862e3d25ec5d4b6f86b9fe792b6dabbf84c` for its source/test layout and
validation instructions. This is provenance for that inspection, not a claim
that every example below was revalidated at that revision.

Disposition reconfirmed 2026-10-23 for #1856 wave 3: kept as a labeled
upstream reference, because it describes the Effect library's own source tree
and this repository's module layout is owned by the architecture standard.
Its portable patterns (dual APIs, string TypeIds, type guards, variance,
pipeable prototypes) now compile against the public modules.

## OVERVIEW

Established patterns for organizing modules in the Effect library, based on analysis of the core codebase structure and conventions.

Paths in this file that start at the `effect` package (its `src/` and `test/` trees) describe the upstream Effect repository layout, which is available locally in the Effect reference checkout (`bun run beep refs provision`). They are not paths in this repo.

## DIRECTORY STRUCTURE PATTERNS

### Core Module Organization

```text
packages/effect/src/
├── encoding/             # Encoding utilities (Base64, Hex, etc.)
│   ├── Base64.ts
│   ├── Base64Url.ts
│   ├── EncodingError.ts
│   ├── Hex.ts
│   └── index.ts
├── internal/             # Private implementation details (~27 files)
│   ├── array.ts
│   ├── concurrency.ts
│   ├── core.ts
│   ├── effect.ts
│   ├── layer.ts
│   ├── schema/
│   └── ...
├── testing/              # Test utilities
│   ├── FastCheck.ts
│   ├── TestClock.ts
│   ├── TestConsole.ts
│   ├── TestSchema.ts
│   └── index.ts
├── ai/                   # `@stability unstable` modules live at top level too
├── cli/                  # (ai, cli, cluster, http, http-api, persistence, rpc,
├── cluster/              # schema, sql, workers, workflow, ...); see
├── http/                 # effect-module-paths.md
├── http-api/
├── persistence/
├── rpc/
├── schema/
├── sql/
├── workers/
├── workflow/
├── index.ts              # Main export file
└── [module].ts           # 122+ top-level modules (flat structure)
```

### Flat Module Structure

The Effect library uses a **flat module structure** where core modules are top-level `.ts` files:

```text
packages/effect/src/
├── Array.ts
├── BigDecimal.ts
├── Boolean.ts
├── Brand.ts
├── Cache.ts
├── Cause.ts
├── Channel.ts
├── Chunk.ts
├── Clock.ts
├── Config.ts
├── Console.ts
├── Data.ts
├── DateTime.ts
├── Deferred.ts
├── Duration.ts
├── Effect.ts
├── Equal.ts
├── Exit.ts
├── Fiber.ts
├── FiberSet.ts
├── FiberMap.ts
├── FileSystem.ts
├── Function.ts
├── Graph.ts
├── Hash.ts
├── HashMap.ts
├── HashSet.ts
├── HKT.ts
├── Layer.ts
├── Logger.ts
├── Option.ts
├── Pool.ts
├── Queue.ts
├── Ref.ts
├── Request.ts
├── Result.ts
├── Schedule.ts
├── Schema.ts
├── Scope.ts
├── Stream.ts
├── ...
```

### Export Pattern Structure

**Main index file pattern (packages/effect/src/index.ts):**

```typescript skip-type-checking
/**
 * @since 2.0.0
 */

export {
  /**
   * @since 2.0.0
   */
  absurd,
  /**
   * @since 2.0.0
   */
  flow,
  /**
   * @since 2.0.0
   */
  identity,
  /**
   * @since 2.0.0
   */
  pipe
} from "./Function.ts"

// @barrel: Auto-generated exports. Do not edit manually.

/**
 * This module provides utility functions for working with arrays in TypeScript.
 *
 * @since 2.0.0
 */
export * as Array from "./Array.ts"

/**
 * @since 2.0.0
 */
export * as BigDecimal from "./BigDecimal.ts"

/**
 * @since 2.0.0
 */
export * as Effect from "./Effect.ts"

// ... flat namespace exports for all modules
```

**Key observations:**

- Uses `.ts` extensions in imports (not `.js`)
- Flat namespace exports (`export * as ModuleName from "./Module.ts"`)
- No nested index files for collections/concurrency/etc.
- Barrel exports are auto-generated

## MODULE STRUCTURE PATTERNS

### Standard Module File Structure

```typescript skip-type-checking
/**
 * Module description with @since version
 *
 * @since 2.0.0
 */

// Imports (organized by category) - use .ts extensions
import * as Cause from "./Cause.ts"
import * as Deferred from "./Deferred.ts"
import * as Effect from "./Effect.ts"
import { dual } from "./Function.ts"
import type * as Inspectable from "./Inspectable.ts"
import { PipeInspectableProto } from "./internal/core.ts"
import { type Pipeable } from "./Pipeable.ts"
import * as Predicate from "./Predicate.ts"
import type * as Scope from "./Scope.ts"

// TypeId - string literal pattern (NOT Symbol.for)
const TypeId = "~effect/ModuleName"

/**
 * @since 2.0.0
 * @category DomainModel
 */
export interface ModuleName<out A = unknown, out E = unknown> extends Pipeable, Inspectable.Inspectable {
  readonly [TypeId]: typeof TypeId
  // Interface members
}

// Type guard using Predicate.hasProperty
/**
 * @since 2.0.0
 * @category Validation
 */
export const isModuleName = (u: unknown): u is ModuleName<unknown, unknown> => Predicate.hasProperty(u, TypeId)

// Prototype pattern for implementation
const Proto = {
  [TypeId]: TypeId
  // ... implementation
}
```

### Internal Module Pattern

**Internal organization (packages/effect/src/internal/array.ts):**

```typescript skip-type-checking
/** @internal */

import { identity } from "../Function.ts"
import { pipeArguments } from "../Pipeable.ts"

// Private implementation details
const ArrayProto = {
  pipe() {
    return pipeArguments(this, arguments)
  }
}

// Internal implementation functions
/** @internal */
export const make = <A>(...elements: ReadonlyArray<A>): Array<A> => {
  const arr = [...elements]
  Object.setPrototypeOf(arr, ArrayProto)
  return arr
}

/** @internal */
export const map = <A, B>(
  self: ReadonlyArray<A>,
  f: (a: A, i: number) => B
): Array<B> => {
  const result = new globalThis.Array(self.length)
  for (let i = 0; i < self.length; i++) {
    result[i] = f(self[i]!, i)
  }
  Object.setPrototypeOf(result, ArrayProto)
  return result
}
```

## NAMING CONVENTIONS

### Function Naming Patterns

```ts
import type * as Chunk from "effect/Chunk"
import type * as Effect from "effect/Effect"
import type * as O from "effect/Option"
import type * as Order from "effect/Order"

// Constructors - create new instances
export declare const make: <A>(value: A) => Effect.Effect<A>
export declare const of: <A>(value: A) => Effect.Effect<A>
export declare const empty: () => Effect.Effect<never>
export declare const fromIterable: <A>(iterable: Iterable<A>) => Effect.Effect<A>

// Combinators - transform existing instances (dual: data-first and data-last)
export declare const map: {
  <A, B>(f: (a: A) => B): (self: Effect.Effect<A>) => Effect.Effect<B>
  <A, B>(self: Effect.Effect<A>, f: (a: A) => B): Effect.Effect<B>
}

// Predicates - boolean-returning functions
export declare const isSome: <A>(option: O.Option<A>) => boolean
export declare const isNone: <A>(option: O.Option<A>) => boolean
export declare const isEffect: (value: unknown) => value is Effect.Effect<unknown>

// Destructors - extract or convert values
export declare const getOrElse: {
  <B>(onNone: () => B): <A>(self: O.Option<A>) => A | B
  <A, B>(self: O.Option<A>, onNone: () => B): A | B
}
export declare const toArray: <A>(chunk: Chunk.Chunk<A>) => ReadonlyArray<A>

// Utilities - helper functions
export declare const reverse: <A>(array: ReadonlyArray<A>) => Array<A>
export declare const sort: {
  <B>(order: Order.Order<B>): <A extends B>(self: ReadonlyArray<A>) => Array<A>
  <A extends B, B>(self: ReadonlyArray<A>, order: Order.Order<B>): Array<A>
}
```

### Type Naming Patterns

```ts
import type { TypeLambda } from "effect/HKT"

// Core types use PascalCase
export interface Effect<A, E = never, R = never> {
  readonly _A: A
  readonly _E: E
  readonly _R: R
}
export interface Option<A> {
  readonly _A: A
}
export interface Result<A, E = never> {
  readonly _A: A
  readonly _E: E
}

// Type lambdas have TypeLambda suffix
export interface EffectTypeLambda extends TypeLambda {
  readonly type: Effect<this["Target"], this["Out1"], this["Out2"]>
}
export interface OptionTypeLambda extends TypeLambda {
  readonly type: Option<this["Target"]>
}

// Non-empty variants use NonEmpty prefix
export type NonEmptyArray<A> = readonly [A, ...Array<A>]
export type NonEmptyString = string & { readonly NonEmptyString: unique symbol }

// Readonly variants
export type ReadonlyArray<A> = readonly A[]
export type ReadonlyRecord<K extends string | symbol, V> = { readonly [P in K]: V }
```

## DUAL FUNCTION PATTERN

### Standard Dual Implementation

````ts
import * as A from "effect/Array"
import { dual } from "effect/Function"

/**
 * Maps over a structure using the provided function.
 *
 * **Example** (Map data-first and data-last)
 *
 * ```ts
 * import * as A from "effect/Array"
 * import { pipe } from "effect/Function"
 *
 * // Data-first usage
 * const result1 = A.map([1, 2, 3], (x) => x * 2)
 *
 * // Data-last usage (pipeable)
 * const result2 = pipe([1, 2, 3], A.map((x) => x * 2))
 * ```
 *
 * @since 2.0.0
 * @category Utility
 */
export const map = dual<
  <A, B>(f: (a: A, index: number) => B) => (self: ReadonlyArray<A>) => Array<B>,
  <A, B>(self: ReadonlyArray<A>, f: (a: A, index: number) => B) => Array<B>
>(2, <A, B>(self: ReadonlyArray<A>, f: (a: A, index: number) => B): Array<B> => A.map(self, f))
````

### Arity-Based Dual Pattern

```ts
import * as A from "effect/Array"
import { dual } from "effect/Function"

// When the number of parameters is fixed
export const filter = dual<
  <A, B extends A>(predicate: (a: A) => a is B) => (self: ReadonlyArray<A>) => Array<B>,
  <A, B extends A>(self: ReadonlyArray<A>, predicate: (a: A) => a is B) => Array<B>
>(2, <A, B extends A>(self: ReadonlyArray<A>, predicate: (a: A) => a is B): Array<B> => A.filter(self, predicate))

// When using predicate-based dual
export const update = dual<
  <A>(index: number, f: (a: A) => A) => (self: ReadonlyArray<A>) => Array<A>,
  <A>(self: ReadonlyArray<A>, index: number, f: (a: A) => A) => Array<A>
>(
  (args) => A.isArray(args[0]),
  <A>(self: ReadonlyArray<A>, index: number, f: (a: A) => A): Array<A> =>
    A.map(self, (a, i) => (i === index ? f(a) : a))
)
```

## TYPE IDENTIFICATION PATTERN

### TypeId Pattern (String Literals)

The Effect library uses **string literal TypeIds** (NOT `Symbol.for`):

```ts
/**
 * The type identifier for this data type.
 * Uses string literal format: "~effect/ModuleName"
 */
const TypeId = "~effect/ModuleName"

/**
 * @category DomainModel
 * @since 2.0.0
 */
export type TypeId = typeof TypeId

/**
 * @category DomainModel
 * @since 2.0.0
 */
export interface ModuleName<A> {
  readonly [TypeId]: typeof TypeId
  // other properties
}
```

### TypeId Naming Conventions

```typescript skip-type-checking
// Standard module TypeId
const TypeId = "~effect/Queue"
const TypeId = "~effect/FiberSet"
const TypeId = "~effect/Pool"
const TypeId = "~effect/Ref"
const TypeId = "~effect/Deferred"

// Nested/namespaced TypeIds for related types
const TypeId = "~effect/Queue/Dequeue"
const FileTypeId = "~effect/platform/FileSystem/File"

// Domain-prefixed TypeIds
const TypeId = "~effect/collections/Chunk"
const TypeId = "~effect/data/Redacted"
const TypeId = "~effect/platform/FileSystem"
const TypeId = "~effect/platform/PlatformError"
const TypeId = "~effect/transactions/TxChunk"
const TypeId = "~effect/transactions/TxSemaphore"
const TypeId = "~effect/cluster/HashRing"

// Versioned TypeIds (for Effect core types)
export const EffectTypeId = `~effect/Effect/${version}` as const
export const ExitTypeId = `~effect/Exit/${version}` as const

// Interface symbols (for Equal, Hash, etc.)
export const symbol = "~effect/interfaces/Equal"
```

### Type Guard Pattern

````ts
import * as Predicate from "effect/Predicate"

const TypeId = "~effect/ModuleName"

/**
 * @category DomainModel
 * @since 2.0.0
 */
export interface ModuleName<out A, out E> {
  readonly [TypeId]: typeof TypeId
  readonly _A: A
  readonly _E: E
}

/**
 * Type guard to check if a value is an instance of ModuleName.
 *
 * **Example** (Check a FiberSet)
 *
 * ```ts
 * import * as Effect from "effect/Effect"
 * import * as FiberSet from "effect/FiberSet"
 *
 * const program = Effect.scoped(
 *   Effect.gen(function* () {
 *     const set = yield* FiberSet.make()
 *     return FiberSet.isFiberSet(set) // true
 *   })
 * )
 * ```
 *
 * @category Validation
 * @since 2.0.0
 */
export const isModuleName = (u: unknown): u is ModuleName<unknown, unknown> => Predicate.hasProperty(u, TypeId)
````

## VARIANCE ANNOTATION PATTERN

### Interface Variance

```ts
import type { Pipeable } from "effect/Pipeable"
import type * as Types from "effect/Types"

const TypeId = "~effect/Layer"

/**
 * Represents the variance of the type parameters.
 * - `in ROut`: Contravariant (input position)
 * - `out E`: Covariant (output position)
 * - `out RIn`: Covariant (output position)
 */
export interface Variance<in ROut, out E, out RIn> {
  readonly [TypeId]: {
    readonly _ROut: Types.Contravariant<ROut>
    readonly _E: Types.Covariant<E>
    readonly _RIn: Types.Covariant<RIn>
  }
}

export interface Layer<in ROut, out E = never, out RIn = never> extends Variance<ROut, E, RIn>, Pipeable {
  // Layer-specific methods
}
```

## PIPEABLE INTEGRATION PATTERN

### Pipeable Implementation

```ts
// Upstream imports these from sibling source files ("./Pipeable.ts") and
// attaches `pipe` through a shared prototype object (its internal
// PipeInspectableProto, which also adds inspection methods). Outside the
// library, the public `Pipeable.Class` base gives the same `pipe` method
// with a checked return type and no assertion.
import * as Pipeable from "effect/Pipeable"

const TypeId = "~effect/ModuleName"

/**
 * @category DomainModel
 * @since 2.0.0
 */
export interface ModuleName<A> extends Pipeable.Pipeable {
  readonly [TypeId]: typeof TypeId
  readonly value: A
}

class ModuleNameImpl<A> extends Pipeable.Class implements ModuleName<A> {
  readonly [TypeId] = TypeId
  constructor(readonly value: A) {
    super()
  }
}

export const make = <A>(value: A): ModuleName<A> => new ModuleNameImpl(value)
```

## IMPORT CONVENTIONS

### File Extension Rules

**Always use `.ts` extensions in imports:**

```typescript skip-type-checking
// CORRECT - use .ts extensions
import * as Array from "./Array.ts"
import * as Effect from "./Effect.ts"
import { dual } from "./Function.ts"
import { PipeInspectableProto } from "./internal/core.ts"
import type * as Scope from "./Scope.ts"

// WRONG - do NOT use .js extensions
// import * as Effect from "./Effect.js"
```

### Import Organization

```typescript skip-type-checking
// 1. External imports (if any)

// 2. Effect module imports (alphabetical, .ts extension)
import * as Cause from "./Cause.ts"
import * as Deferred from "./Deferred.ts"
import * as Effect from "./Effect.ts"
import * as Exit from "./Exit.ts"
import * as Fiber from "./Fiber.ts"

// 3. Utility imports
import { constVoid, dual } from "./Function.ts"
import { type Pipeable } from "./Pipeable.ts"
import * as Predicate from "./Predicate.ts"

// 4. Internal imports
import { PipeInspectableProto } from "./internal/core.ts"

// 5. Type-only imports
import type * as Inspectable from "./Inspectable.ts"
import type * as Scope from "./Scope.ts"
```

## SUCCESS CRITERIA

### Well-Organized Module Checklist

- [ ] Module placed at correct level (top-level for core, subdirectory for domain-specific)
- [ ] Uses `.ts` file extension in all imports
- [ ] TypeId uses string literal format (`"~effect/ModuleName"`)
- [ ] Proper internal vs public API separation
- [ ] Standard function naming conventions
- [ ] Dual function support for data-first/data-last usage
- [ ] Type guard using `Predicate.hasProperty`
- [ ] Variance annotations for type parameters
- [ ] Pipeable interface integration via prototype
- [ ] Comprehensive JSDoc with examples
- [ ] Version annotations (@since) on all exports

This module organization ensures consistency, discoverability, and maintainability across the entire Effect library codebase.
