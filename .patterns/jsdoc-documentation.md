# JSDoc Documentation Patterns - Effect Library

## 🎯 OVERVIEW

Comprehensive JSDoc/TSDoc documentation patterns used throughout the
[beep-effect](https://github.com/kriegcloud/beep-effect) repository, ensuring
consistent, practical, and compilable examples for all APIs.

This document is the source of truth for JSDoc conventions in the workspace.
The `jsdoc-annotation-specialist` skill enforces these conventions and adds
schema-annotation requirements on top.

Conventions are designed for two reader audiences:

1. **Humans browsing rendered documentation** — TypeDoc output, IDE hover,
   generated reference sites.
2. **Coding agents loading symbol documentation as context** — when an agent
   generates a call site for a symbol, the structured tags below become prompt
   material.

The decision rule for every tag: it earns its place only when it encodes
information an agent or human reader cannot recover from the TypeScript
signature alone. Tags that *restate* the signature are noise and are avoided.

## 🚨 CRITICAL REQUIREMENTS

### Compilation Standards

- **MANDATORY**: All JSDoc examples must compile via `bun run docgen`.
- **ZERO TOLERANCE**: Pre-existing docgen errors must be fixed when encountered.
- **FORBIDDEN**: Removing examples to fix compilation — always fix the example.
- **MANDATORY**: Use proper Effect patterns in all examples.
- **FORBIDDEN**: `any` types, type assertions, `declare` statements, or unsafe
  patterns in any example.

### TSDoc Grammar Hard Rules

The following break `eslint-plugin-tsdoc`, API Extractor, or TypeDoc rendering.
Every example in this document follows these rules:

1. **No type braces in tags.** The TypeScript signature is authoritative.
   `@param input {Type} - desc` is invalid TSDoc; write `@param input - desc`.
   Same applies to `@returns` and `@throws`.
2. **Use `@typeParam`, not `@template`.** `@template` is JSDoc-era and
   produces TSDoc warnings.
3. **`@param name - description`** uses a hyphen separator.
   **`@returns description`** does not — the hyphen is `@param`-only.
   **`@throws description`** does not either.
4. **Use `@packageDocumentation`, not `@module`.** `@module` is JSDoc-era;
   TSDoc and API Extractor recognize `@packageDocumentation` for package
   entry-point comments.

## 📝 STANDARD JSDOC STRUCTURE

### Tag Ordering

Tags appear in this order within a JSDoc block:

1. Description (one-line summary; optional detail paragraph)
2. `@remarks` — semantics, invariants, complexity, ordering guarantees
3. `@example` — one or more compilable examples
4. `@typeParam` — only when constraint or semantic role is non-trivial
5. `@param` — only when prose adds beyond name + type
6. `@returns` — only when prose adds beyond the return type
7. `@throws` — only for synchronous throws or defects
8. `@effects` — side effects not visible in the type signature
9. `@precondition` / `@postcondition` / `@invariant` — call-site contracts
10. `@see` — cross-references
11. `@deprecated` — with `{@link}` migration target
12. `@public` / `@beta` / `@alpha` / `@internal` / `@experimental` — release stage
13. `@category` — required, lowercase
14. `@since` — required, version

### Required Tags (Always Present on Exports)

Every exported symbol carries:

- `@example` — at least one compilable example
- `@category` — lowercase, from the category list below
- `@since` — currently `@since 0.0.0` workspace-wide (intentional placeholder
  until v1.0; do not infer real versions from git history)

### Conditional Tags (Present Only When They Add Information)

These tags appear when — and only when — they encode something the signature
alone does not communicate. The default is to omit them.

| Tag | Add when |
|---|---|
| `@param` | Parameter has units, constraints, ordering requirements, or interactions not obvious from `name: Type` |
| `@returns` | Return value has ordering, filtering, ownership, or semantic interpretation beyond its type. Skip for `Effect<A, E, R>` returns where channels speak for themselves. |
| `@typeParam` | Type parameter has a constraint or semantic role not obvious from its name. Skip for trivial generics like `<A>`. |
| `@throws` | Function throws synchronously or produces a defect not in the typed error channel |
| `@remarks` | Function has non-obvious semantics, ordering guarantees, idempotency claims, or complexity worth documenting |

### Minimal Template — Required Tags Only

This is the **common case** — most symbols need nothing beyond the three
required tags:

````ts
/**
 * Brief one-line description.
 *
 * @example
 * ```ts
 * import * as A from "effect/Array"
 *
 * const result = A.map([1, 2, 3], (n) => n * 2)
 * console.log(result) // [2, 4, 6]
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export const myFunction = /* ... */
````

### Extended Template — With Conditional Tags

When the function has non-obvious semantics or constrained parameters:

````ts
/**
 * Smooths a time series by averaging over a sliding window.
 *
 * @remarks
 * Edge artifacts at the start and end of the series are zero-padded rather
 * than reflected. Use {@link smoothSeriesReflect} when reflective edge
 * handling is required.
 *
 * @example
 * ```ts
 * import * as A from "effect/Array"
 *
 * const noisy = A.range(1, 10).map((n) => n + Math.random())
 * const smoothed = smoothSeries(noisy, 3, 1.5)
 * ```
 *
 * @param values - Input series, ordered chronologically (older to newer).
 * @param window - Window size in samples; must be odd and at least 3.
 * @param tolerance - Acceptable drift in standard deviations. Values below
 * 1.0 may produce false negatives on noisy inputs.
 *
 * @category combinators
 * @since 0.0.0
 */
````

## 📚 HIGH-VALUE TAG REFERENCE

The tags below carry information not present in the TypeScript signature.
They are the highest-leverage additions for both rendered documentation and
agent context.

### `@remarks` — Semantics, Invariants, Gotchas

Use for ordering guarantees, idempotency, complexity, and edge cases. The
single highest-leverage tag for non-obvious behavior.

````ts
/**
 * Runs both effects concurrently and returns the first to succeed.
 *
 * @remarks
 * If both effects fail, the second's failure is reported and the first is
 * attached as a suppressed cause. The loser's interruption is not awaited
 * before the winner's result is returned — side effects in the loser may
 * continue briefly after this function returns. Use {@link raceAwait} when
 * deterministic interrupt-completion ordering matters.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 *
 * const winner = race(
 *   Effect.delay(Effect.succeed("fast"), "10 millis"),
 *   Effect.delay(Effect.succeed("slow"), "100 millis")
 * )
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
````

### `@see` and `{@link}` — Curated Cross-References

`{@link Symbol}` for inline references inside prose; `@see` for trailing
related-symbol lists. Both produce hyperlinks in TypeDoc and editor hover.

````ts
/**
 * Constructs a `Household` from partial input, applying default values for
 * `createdAt` and generating a fresh {@link HouseholdId}.
 *
 * @example
 * ```ts
 * const h = makeHousehold({ name: "Acme", primaryAdvisorId: advisorId })
 * ```
 *
 * @see {@link Household} for the full schema.
 * @see {@link HouseholdRepo.save} to persist the result.
 *
 * @category constructors
 * @since 0.0.0
 */
````

### `@deprecated` — With Required Migration Target

Every `@deprecated` must include a `{@link}` to the replacement and a one-line
migration recipe. The linter rejects `@deprecated` without `{@link}`.

````ts
/**
 * @deprecated Since 2.0.0. Use {@link findHousehold} instead — it returns an
 * `Effect` with a typed failure channel rather than throwing synchronously.
 *
 * Migration:
 * - Sync context: `Effect.runSync(findHousehold(id))`
 * - Effect context: `findHousehold(id)` directly
 *
 * @category constructors
 * @since 0.0.0
 */
````

### `@throws` — Defects and Synchronous Panics

Effect's typed error channel handles recoverable failure. `@throws` documents
the *defect* channel (untyped panics) and synchronous throws from constructors
or refinements outside the Effect.

````ts
/**
 * Constructs a `HouseholdId` from a raw string, validating UUID v4 format.
 *
 * @example
 * ```ts
 * const id = HouseholdId("550e8400-e29b-41d4-a716-446655440000")
 * ```
 *
 * @throws `Brand.BrandErrors` synchronously when `raw` is not a valid UUID v4.
 * For non-throwing validation, use {@link HouseholdId.either}.
 *
 * @category constructors
 * @since 0.0.0
 */
````

## 🤖 CUSTOM TAGS FOR AGENT CONTEXT

These tags are registered in `tsdoc.json` (see "Custom Tag Registration"
below) and encode information specifically valuable to agents reasoning about
how to call or extend a symbol.

### `@effects` — Side Effects Invisible in the Type

The single highest-value custom tag for an Effect codebase. The requirement
channel `Effect<A, E, R>` shows `R` is `HouseholdRepo | EventBus | Cache` but
says nothing about *what* gets written, *which* topics get published to, or
*what* cache keys are touched. `@effects` closes that gap.

````ts
/**
 * Persists a household and emits domain events.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 *
 * const program = saveHousehold(household)
 * ```
 *
 * @effects
 * - Writes to the `households` table (insert on missing `id`, update otherwise).
 * - Writes to the `audit_log` table with `household.created` or `household.updated`.
 * - Publishes `household.updated` to the `domain-events` Kafka topic.
 * - Invalidates `household:{id}` and `advisor:{primaryAdvisorId}:households`
 *   Redis cache keys.
 *
 * @category combinators
 * @since 0.0.0
 */
````

### `@precondition` — Call-Site Contract

What the caller must guarantee before invocation. High-signal for agents
generating call sites — they can verify or assert these conditions.

````ts
/**
 * Advances a meeting through its lifecycle.
 *
 * @precondition The current status must be a valid predecessor of `next`:
 * `Scheduled → InProgress`, `InProgress → Completed`, or
 * `Scheduled → Cancelled`. Any other transition fails with
 * {@link InvalidTransition}.
 * @precondition `meeting.id` must reference a meeting that exists in the
 * underlying store; missing rows produce a defect.
 *
 * @category combinators
 * @since 0.0.0
 */
````

### `@postcondition` — What Holds After Success

The state guarantee on the success path.

````ts
/**
 * Persists a household, generating a fresh ID if absent.
 *
 * @postcondition The returned household has a non-null `id` of type
 * {@link HouseholdId}, and a `households` row exists with that ID.
 * @postcondition The `audit_log` table contains a `household.created` or
 * `household.updated` record corresponding to this operation.
 *
 * @category combinators
 * @since 0.0.0
 */
````

### `@invariant` — What Cannot Change

State the operation never alters. Often used on classes (invariants the class
maintains) or methods (state the method preserves).

````ts
/**
 * Returns a copy of this household with the supplied advisor as primary.
 *
 * @invariant `id`, `householdId`, and `createdAt` are never mutated; only
 * `primaryAdvisorId` and a derived `updatedAt` change.
 *
 * @category combinators
 * @since 0.0.0
 */
````

## 🚦 RELEASE STAGE TAGS

Used by API Extractor to gate the public surface and by agents to choose
between stable and unstable APIs.

````ts
/**
 * Stable lookup. Safe for production use.
 *
 * @public
 * @category constructors
 * @since 0.0.0
 */
export const findHousehold = /* ... */

/**
 * Batched lookup. API may change before v3.0.
 *
 * @beta
 * @category constructors
 * @since 0.0.0
 */
export const findHouseholdsBatch = /* ... */

/**
 * Eager prefetch driven by an affinity model under active iteration.
 *
 * @experimental Affinity scoring is being tuned; results may vary
 * significantly between minor versions.
 *
 * @category combinators
 * @since 0.0.0
 */
export const prefetchRelated = /* ... */

/**
 * Internal cache primitive used by `findHousehold`. Not part of the public
 * surface — do not import from outside this package.
 *
 * @internal
 */
export const _householdCache = /* ... */
````

Pair `@internal` with `"stripInternal": true` in `tsconfig.json` so internal
symbols don't leak into emitted `.d.ts` files.

## 🔧 IMPORT PATTERN STANDARDS

### Mandatory Namespace Aliases

These aliases are required inside every `@example` code fence:

| Module | Alias | Correct | Forbidden |
|--------|-------|---------|-----------|
| `effect/Schema` | `S` | `import * as S from "effect/Schema"` | `import { Schema }` |
| `effect/Array` | `A` | `import * as A from "effect/Array"` | `import { Array }` |
| `effect/Option` | `O` | `import * as O from "effect/Option"` | `import { Option }` |
| `effect/Predicate` | `P` | `import * as P from "effect/Predicate"` | `import { Predicate }` |
| `effect/Record` | `R` | `import * as R from "effect/Record"` | `import { Record }` |

Core combinators use named imports: `import { Effect, Console, Layer } from "effect"`.

Never import from the deprecated `@effect/schema` package.

### Schema Module Imports

````ts
/**
 * @example
 * ```ts
 * // ✅ CORRECT
 * import { Effect } from "effect"
 * import * as S from "effect/Schema"
 *
 * class User extends S.Class<User>("User")({
 *   id: S.UUID,
 *   name: S.NonEmptyTrimmedString
 * }) {}
 *
 * const program = Effect.gen(function* () {
 *   const decoded = yield* S.decode(User)({ id: "abc", name: "Ada" })
 *   return decoded
 * })
 * ```
 */
````

## 🏗️ EFFECT-TS V4 CANONICAL CONSTRUCT PATTERNS

Effect v4 has specific construct patterns whose JSDoc differs from generic
function/class documentation. The patterns below are the canonical forms.

### `Effect.Service` — Service Class

Document the class itself; the auto-generated `.Default` layer inherits the
class comment in editor hover. Document each method on the returned record.

````ts
/**
 * Repository for `Household` aggregate access.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 *
 * const program = Effect.gen(function* () {
 *   const repo = yield* HouseholdRepo
 *   return yield* repo.find(id)
 * })
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export class HouseholdRepo extends Effect.Service<HouseholdRepo>()(
  "@beep/HouseholdRepo",
  {
    effect: Effect.gen(function* () {
      const db = yield* Database
      return {
        /**
         * Look up a household by ID. Fails with `HouseholdNotFound` when absent.
         *
         * @since 0.0.0
         */
        find: (id: HouseholdId) => db.query(/* ... */),

        /**
         * Persist a new or updated household. Idempotent on the primary key.
         *
         * @since 0.0.0
         */
        save: (h: Household) => db.upsert(/* ... */)
      }
    }),
    dependencies: [Database.Default]
  }
) {}
````

### `Schema.Class` — Schema-Backed Class

````ts
/**
 * A household — the top-level entity grouping clients, accounts, and meetings.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 *
 * const h = new Household({
 *   id: HouseholdId("550e8400-e29b-41d4-a716-446655440000"),
 *   name: "Acme",
 *   primaryAdvisorId: advisorId,
 *   createdAt: new Date()
 * })
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export class Household extends S.Class<Household>($I`Household`)(
  {
    id: HouseholdId,
    name: S.NonEmptyTrimmedString,
    primaryAdvisorId: AdvisorId,
    createdAt: S.DateFromSelf
  },
  $I.annote("Household", {
    description: "The top-level entity grouping clients, accounts, and meetings."
  })
) {}
````

### `TaggedErrorClass` — Tagged Error

Errors typically don't carry `@example`; the example lives on the function
that raises them.

````ts
/**
 * Raised when a household lookup is performed for an ID that does not exist.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 *
 * const handled = findHousehold(id).pipe(
 *   Effect.catchTag("HouseholdNotFound", (e) => Effect.log(`missing: ${e.id}`))
 * )
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class HouseholdNotFound extends TaggedErrorClass<HouseholdNotFound>(
  $I`HouseholdNotFound`
)(
  "HouseholdNotFound",
  { id: HouseholdId },
  $I.annote("HouseholdNotFound", {
    description: "Raised when a household lookup targets a non-existent ID."
  })
) {}
````

### `dual` — Data-First / Data-Last Function

Document the operation once on the outer const. Inner per-signature comments
are noise for symmetric `dual` ops; reserve them for cases where the two
forms have meaningfully different semantics.

````ts
/**
 * Returns the number of days in the given month of the given year.
 *
 * @example
 * ```ts
 * import { pipe } from "effect"
 *
 * daysInMonth(2024, 2)            // 29 — data-first
 * pipe(2024, daysInMonth(2))      // 29 — data-last
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const daysInMonth: {
  (month: number): (year: number) => number
  (year: number, month: number): number
} = dual(2, (year: number, month: number): number => getDaysInMonth(year, month))
````

### `Layer` Definition

````ts
/**
 * Live `HouseholdRepo` layer backed by the production database.
 *
 * @example
 * ```ts
 * import { Effect, Layer } from "effect"
 *
 * const AppLive = HouseholdRepoLive.pipe(Layer.provide(DatabaseLive))
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const HouseholdRepoLive: Layer.Layer<HouseholdRepo, never, Database> =
  HouseholdRepo.Default
````

### Branded Primitive

Pair the type and the brand constructor with matching comments.

````ts
/**
 * Strongly-typed identifier for a `Household` aggregate.
 *
 * @category models
 * @since 0.0.0
 */
export type HouseholdId = string & Brand.Brand<"HouseholdId">

/**
 * Constructor and refinement for {@link HouseholdId}.
 *
 * @example
 * ```ts
 * const id = HouseholdId("550e8400-e29b-41d4-a716-446655440000")
 * ```
 *
 * @throws `Brand.BrandErrors` when input is not a valid UUID v4.
 *
 * @category constructors
 * @since 0.0.0
 */
export const HouseholdId = Brand.refined<HouseholdId>(
  (s) => UUID_V4.test(s),
  (s) => Brand.error(`Invalid HouseholdId: ${s}`)
)
````

### Type-Id Symbol

````ts
/**
 * Unique identifier for the `Household` nominal type.
 *
 * @category symbols
 * @since 0.0.0
 */
export const HouseholdTypeId: unique symbol = Symbol.for("@beep/Household")

/**
 * @category symbols
 * @since 0.0.0
 */
export type HouseholdTypeId = typeof HouseholdTypeId
````

### Effect-Returning Function

Don't reproduce `Effect<A, E, R>` channels in tags; describe them in prose
when the failure modes warrant it.

````ts
/**
 * Resolves a household by its ID.
 *
 * @remarks
 * Fails with `HouseholdNotFound` when the ID does not exist, and with
 * `DatabaseError` for any underlying connectivity issue.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 *
 * const program = findHousehold(id).pipe(
 *   Effect.catchTag("HouseholdNotFound", () => Effect.succeed(null))
 * )
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const findHousehold = (
  id: HouseholdId
): Effect.Effect<Household, HouseholdNotFound | DatabaseError, HouseholdRepo> =>
  HouseholdRepo.pipe(Effect.flatMap((repo) => repo.find(id)))
````

### `Stream`-Returning Function

````ts
/**
 * Streams meeting events for a household, ordered by occurrence.
 *
 * @example
 * ```ts
 * import { Stream } from "effect"
 *
 * const recent = meetingEvents(id).pipe(Stream.take(10))
 * ```
 *
 * @category streams
 * @since 0.0.0
 */
export const meetingEvents = (
  id: HouseholdId
): Stream.Stream<MeetingEvent, DatabaseError, EventStore> =>
  EventStore.pipe(Stream.flatMap((store) => store.eventsFor(id)))
````

### Package Entry Point

Goes at the top of `src/index.ts` for a published package.

````ts
/**
 * Household domain package — aggregates, services, and schemas for managing
 * households, their advisors, and lifecycle events.
 *
 * @remarks
 * The public surface is exported from this entry point. Internal helpers
 * marked `@internal` are excluded from the rollup and should not be imported
 * via subpath imports.
 *
 * @packageDocumentation
 */

export * from "./Household.js"
export * from "./HouseholdRepo.js"
export * from "./HouseholdId.js"
export * from "./errors.js"
````

## 🏷️ CATEGORY ANNOTATION

### Naming Convention

Always lowercase. Choose the most specific match.

### Standard Categories

| Category | When to use |
|----------|-------------|
| `constructors` | Creation: `make`, `of`, `from*`, `new`, EntityIds |
| `combinators` | Transformation: `map`, `flatMap`, `filter`, `pipe` chains |
| `models` | Type definitions, interfaces, schema type aliases |
| `schemas` | Schema definitions (`S.Class`, `S.Struct`, etc.) |
| `services` | `Effect.Service` declarations |
| `layers` | `Layer.Layer` definitions |
| `errors` | Tagged error classes |
| `streams` | `Stream`-returning functions and stream constructors |
| `utilities` | General-purpose helpers |
| `predicates` | Boolean-returning: `is*`, `has*` |
| `getters` | Property access |
| `guards` | Type guards |
| `refinements` | Type narrowing |
| `error handling` | Error management, recovery |
| `resource management` | Resource lifecycle, acquire/release |
| `symbols` | TypeId, branded types |
| `sequencing` | Sequential operations |
| `concurrency` | Parallel operations |
| `filtering` | Data selection |
| `folding` | Aggregation, reduction |
| `mapping` | Data transformation |
| `elements` | Element-level operations on collections |
| `interop` | Interoperability with non-Effect code |
| `testing` | Test utilities |

## 🛠️ CUSTOM TAG REGISTRATION

The custom tags `@effects`, `@precondition`, `@postcondition`, `@invariant`
must be registered in `tsdoc.json` at the workspace root. Without
registration, `eslint-plugin-tsdoc` rejects them as unknown tags.

```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/tsdoc/v0/tsdoc.schema.json",
  "extends": ["@microsoft/api-extractor/extends/tsdoc-base.json"],
  "tagDefinitions": [
    {
      "tagName": "@invariant",
      "syntaxKind": "block",
      "allowMultiple": true
    },
    {
      "tagName": "@precondition",
      "syntaxKind": "block",
      "allowMultiple": true
    },
    {
      "tagName": "@postcondition",
      "syntaxKind": "block",
      "allowMultiple": true
    },
    {
      "tagName": "@effects",
      "syntaxKind": "block",
      "allowMultiple": false
    }
  ],
  "supportForTags": {
    "@invariant": true,
    "@precondition": true,
    "@postcondition": true,
    "@effects": true
  }
}
```

For TypeDoc rendering, mirror the registration in `typedoc.json`:

```json
{
  "blockTags": ["@invariant", "@precondition", "@postcondition", "@effects"]
}
```

## 🔍 FORBIDDEN PATTERNS IN EXAMPLES

````ts
// ❌ WRONG — type braces in tags
/**
 * @param input {string} - The input          ← invalid TSDoc
 * @returns {number} - The count               ← invalid TSDoc
 * @throws {ValidationError} - When invalid    ← invalid TSDoc
 */

// ❌ WRONG — JSDoc-era tag names
/**
 * @template A   ← use @typeParam
 * @module       ← use @packageDocumentation
 */

// ❌ WRONG — hyphen on @returns
/**
 * @returns - The count   ← drop the hyphen
 */

// ❌ WRONG — deprecated package
import { Schema } from "@effect/schema"

// ❌ WRONG — wrong import alias
import { Schema } from "effect/Schema"        // use S
import { Array } from "effect/Array"          // use A
import { Option } from "effect/Option"        // use O

// ❌ WRONG — unsafe patterns in examples
const data: any = someValue
const value = something as unknown as SomeType
declare const Service: any

// ❌ WRONG — empty example bodies
const program = Effect.gen(function* () {
  // (empty)
})
````

````ts
// ✅ CORRECT — TSDoc-compliant grammar
/**
 * @param input - The input string.
 * @returns The count of matching elements.
 * @throws `ValidationError` when input is malformed.
 * @typeParam A - Element type, must be comparable.
 */

// ✅ CORRECT — TSDoc-era package-level tag
/**
 * @packageDocumentation
 */

// ✅ CORRECT — namespace aliases
import { Effect } from "effect"
import * as S from "effect/Schema"
import * as A from "effect/Array"
import * as O from "effect/Option"

// ✅ CORRECT — complete, compilable example
const program = Effect.gen(function* () {
  const user = yield* findUser(id)
  yield* Console.log(user.name)
  return user
})
````

## 🎯 SUCCESS CRITERIA

### Quality JSDoc Checklist

- [ ] Brief, clear one-line description
- [ ] At least one practical, compilable example
- [ ] Examples compile with `bun run docgen`
- [ ] All imports use correct namespace aliases
- [ ] No `any` types, type assertions, `declare`, or empty example bodies
- [ ] `@category` (lowercase, from standard list)
- [ ] `@since 0.0.0`
- [ ] Conditional tags present only when they add information
- [ ] `@remarks` present when semantics are non-obvious
- [ ] `@effects` present when the function has side effects beyond its type
- [ ] `@deprecated` includes `{@link}` migration target
- [ ] No TSDoc grammar violations (no `{type}` blobs, no `@template`,
      no hyphen on `@returns`, no `@module`)

This comprehensive approach ensures documentation provides practical, reliable
examples that compile, render correctly, and supply structured context for
both human readers and coding agents.
