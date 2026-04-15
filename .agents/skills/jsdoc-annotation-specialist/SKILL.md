---
name: jsdoc-annotation-specialist
description: >
  JSDoc documentation and schema annotation compliance for this repo. Trigger on:
  missing JSDoc on exports, missing @example/@category/@since, missing $I.annote or
  $I.annoteSchema on schemas, wrong import aliases in examples, docgen failures,
  documentation post-pass on newly written code, or annotation review.
version: 0.1.0
status: active
---

# JSDoc Annotation Specialist

Use this skill as a post-pass on code written by other agents, or when adding,
fixing, or reviewing JSDoc documentation and schema annotations. The primary
source of truth is `.patterns/jsdoc-documentation.md`. This skill enforces and
extends those conventions.

## Workflow

1. Identify all exported symbols in the target file(s).
2. For each export, verify JSDoc block, `@example`, `@category`, `@since`.
3. For each schema value, verify `$I.annote` or `$I.annoteSchema`.
4. Add or fix any missing documentation.
5. Run `bun run docgen` to verify every example compiles.
6. Fix compilation failures in examples until docgen passes.

## JSDoc Block Structure

Every exported symbol MUST have this structure:

```
/**
 * Brief one-line description.
 *
 * Detailed explanation when the brief line is not self-evident.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as S from "effect/Schema"
 *
 * // Working example that compiles via docgen
 * const result = MyModule.myFunction(args)
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
```

Order within the JSDoc block: description, `@example` (one or more),
`@template`, `@param`, `@returns`, `@throws`, `@category`, `@since`.

## Import Aliases in Examples

These aliases are mandatory inside every `@example` code fence:

| Module | Alias | Correct | Forbidden |
|--------|-------|---------|-----------|
| `effect/Schema` | `S` | `import * as S from "effect/Schema"` | `import { Schema }` |
| `effect/Array` | `A` | `import * as A from "effect/Array"` | `import { Array }` |
| `effect/Option` | `O` | `import * as O from "effect/Option"` | `import { Option }` |
| `effect/Predicate` | `P` | `import * as P from "effect/Predicate"` | `import { Predicate }` |
| `effect/Record` | `R` | `import * as R from "effect/Record"` | `import { Record }` |

Core combinators use named imports: `import { Effect, Console, Layer } from "effect"`.

Never import from the deprecated `@effect/schema` package.

## Schema Annotation Requirements

Every schema definition must carry identity annotations via the file-local `$I`
composer created from the package identity.

### Class schemas (S.Class, Model.Class, TaggedErrorClass)

The third argument to the class factory receives `$I.annote`:

```ts
class MyEntity extends S.Class<MyEntity>($I`MyEntity`)(
  { /* fields */ },
  $I.annote("MyEntity", {
    description: "A meaningful description reflected in JSDoc for the schema."
  })
) {}
```

### TaggedErrorClass

Same pattern, but imported from `@beep/schema`:

```ts
class MyError extends TaggedErrorClass<MyError>($I`MyError`)(
  "MyError",
  { message: S.String, cause: S.Unknown },
  $I.annote("MyError", {
    description: "Describes when and why this error occurs."
  })
) {}
```

### Non-class schemas

Use `$I.annoteSchema` via `.pipe(...)`:

```ts
const MySchema = S.String.pipe(
  S.pattern(/^[a-z]+$/),
  $I.annoteSchema("MySchema", {
    description: "A meaningful description."
  })
)
```

### LiteralKit schemas

Use `.annotate($I.annote(...))`:

```ts
const Status = LiteralKit(["active", "inactive"]).annotate(
  $I.annote("Status", {
    description: "Entity lifecycle status."
  })
)
```

### Union, TemplateLiteral, and composed schemas

Use `$I.annoteSchema(...)` inside `.pipe(...)` for non-class schemas. This is
the canonical pattern for unions, template literals, and other composed schemas:

```ts
const MyUnion = S.Union([SchemaA, SchemaB]).pipe(
  $I.annoteSchema("MyUnion", {
    description: "Discriminated union of A and B."
  })
)
```

For class schemas, `$I.annote("Name", {...})` is passed as the last argument to
the class constructor (see the Class schemas section above).

## Category Conventions

Always lowercase. Choose the most specific match:

| Category | When to use |
|----------|-------------|
| `constructors` | Creation: `make`, `of`, `from*`, `new`, EntityIds |
| `combinators` | Transformation: `map`, `flatMap`, `filter`, `pipe` chains |
| `models` | Type definitions, interfaces, schema type aliases |
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

## Type Alias Convention

Every non-class schema that is exported must also export a same-name runtime
type alias immediately after it:

```ts
export const MySchema = S.String.pipe(
  $I.annoteSchema("MySchema", { description: "..." })
)

/**
 * Type for {@link MySchema}. {@inheritDoc MySchema}
 *
 * @category models
 * @since 0.0.0
 */
export type MySchema = typeof MySchema.Type
```

The type alias JSDoc uses `{@link}` and `{@inheritDoc}` to avoid duplicating
the description.

## Forbidden Patterns in Examples

1. `any` types -- never.
2. Type assertions (`as`, `as unknown as`) -- never.
3. `declare` statements -- never.
4. Non-compiling code -- every example must pass `bun run docgen`.
5. `import { Schema } from "effect/Schema"` -- use the `S` alias.
6. `from "@effect/schema"` -- the package is deprecated.
7. Removing examples to fix compilation -- always fix the example instead.
8. `import { Array }` / `import { Option }` etc. -- use namespace aliases.

## Post-Pass Checklist

Run this checklist against every file before finishing:

1. Every `export const`, `export function`, `export class`, `export interface`,
   `export type` has a JSDoc block.
2. Every JSDoc block contains at least one `@example` with a code fence.
3. Every JSDoc block contains `@category` (lowercase value).
4. Every JSDoc block contains `@since 0.0.0`.
5. Every `S.Class` / `Model.Class` call has `$I.annote(...)` as the third arg.
6. Every `TaggedErrorClass` call has `$I.annote(...)` as the third arg.
7. Every non-class schema value has `$I.annoteSchema(...)` in its pipe.
8. Every `LiteralKit` value has `.annotate($I.annote(...))`.
9. Every non-class schema export has a same-name `export type` alias.
10. All `@example` code fences use correct import aliases.
11. No forbidden patterns appear in any example.
12. `bun run docgen` passes with zero errors.

## Grep Verification Commands

Use these to audit a file or directory for compliance gaps:

```bash
# Exports missing JSDoc (heuristic -- check lines above each match)
rg "^export (const|function|class|interface|type)" --type ts

# Files with @example but missing @since
rg "@example" --type ts -l | xargs rg -L "@since"

# Files with @example but missing @category
rg "@example" --type ts -l | xargs rg -L "@category"

# Wrong Schema import alias
rg 'import \{ Schema \}' --type ts
rg 'from "@effect/schema"' --type ts

# S.Class without $I.annote
rg "extends S\.Class" --type ts -l | xargs rg -L "annote"

# TaggedErrorClass without $I.annote
rg "extends TaggedErrorClass" --type ts -l | xargs rg -L "annote"

# Uses any type in examples or signatures
rg ': any' --type ts
```

## Escalation

- Use `schema-first-development` when the task is schema modeling beyond
  annotation work.
- Use `effect-first-development` when the task is broader than documentation.
- Use `effect-error-handling` when defining new TaggedErrorClass hierarchies.

## Source References

- `.patterns/jsdoc-documentation.md` -- primary JSDoc standard
- `packages/common/schema/src/SemanticVersion.ts` -- TemplateLiteral + annoteSchema
- `packages/shared/server/src/factories/effect-drizzle/Errors.ts` -- TaggedErrorClass + annote
- `packages/common/schema/src/Duration.ts` -- S.Class + annote + LiteralKit + annotate
- `packages/v2t-sidecar/src/domain.ts` -- LiteralKit + annotate
