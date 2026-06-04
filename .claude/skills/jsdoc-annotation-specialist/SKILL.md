---
name: jsdoc-annotation-specialist
description: >
  JSDoc/TSDoc documentation and schema annotation compliance for this repo.
  Trigger on: missing JSDoc on exports, missing @example/@category/@since,
  missing $I.annote or $I.annoteSchema on schemas, wrong import aliases in
  examples, docgen failures, documentation post-pass on newly written code,
  TSDoc grammar violations (type-bracketed tags, @template usage, @module
  usage), missing @remarks/@effects/@deprecated migration targets, or
  annotation review.
version: 0.2.0
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
3. For each export, evaluate whether conditional tags (`@param`, `@returns`,
   `@typeParam`, `@throws`, `@remarks`, `@effects`, `@precondition`,
   `@postcondition`, `@invariant`, `@deprecated`, `@public`/`@beta`/etc.) are
   warranted by the symbol kind and content. Add them only when they encode
   information not present in the signature.
4. Evaluate whole-block usefulness: the description, tags, and examples should
   help a human or coding agent use the symbol without inventing intent.
5. For each schema value, verify `$I.annote` or `$I.annoteSchema`.
6. Add or fix any missing documentation.
7. Verify TSDoc grammar — no `{type}` blobs in tags, no `@template`, no
   `@module`, no hyphen on `@returns`.
8. Run `bun run docgen` to verify every example compiles.
9. Run `bun run beep docgen quality -p <package>` when touching a package and
   use the report as advisory remediation input.
10. Fix compilation failures in examples until docgen passes.

## JSDoc Block Structure

Every exported symbol MUST have this minimum structure:

````
/**
 * Brief one-line description.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as S from "effect/Schema"
 *
 * const result = MyModule.myFunction(args)
 * console.log(result)
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
````

Tag order within the block:

1. Description
2. `@remarks` (when semantics are non-obvious)
3. `@example` (one or more)
4. `@typeParam` (when constrained or non-obvious)
5. `@param` (when prose adds beyond name + type)
6. `@returns` (when prose adds beyond type)
7. `@throws` (synchronous throws / defects only)
8. `@effects` (custom — side effects)
9. `@precondition` / `@postcondition` / `@invariant` (custom — contracts)
10. `@see`
11. `@deprecated` (with `{@link}` migration target)
12. `@public` / `@beta` / `@alpha` / `@internal` / `@experimental`
13. `@category` (required, canonical kebab-case slug)
14. `@since` (required, `0.0.0`)

## Quality Rubric

The report-only `beep docgen quality` command scores the whole JSDoc block, not
just whether tags exist. Treat `@example` as universal for exported symbols; for
error classes, type-only helpers, constants, and schemas, choose a handling,
narrowing, construction, or import example that fits the symbol.

Re-export declarations are graph edges, not symbol-quality subjects. Document
the exported symbol at its owning declaration instead of inventing a fake barrel
example.

A useful example is fenced TypeScript and shows an observable result:
assertion, returned value, decoded value, Effect execution, visible output, or
type-level evidence. For type-only exports, useful evidence includes named
aliases, assignability or `satisfies` checks, `Equal`/`Expect`-style assertions,
or comments that show inferred types. `const result = ...; void result` is a
compile trick, not documentation.

## TSDoc Grammar Hard Rules

The following are violations the post-pass MUST catch and fix:

1. **`{type}` blobs in `@param`, `@returns`, `@throws`** — drop the braces.
   The TS signature is authoritative. `@param x {string} - desc` becomes
   `@param x - desc`.
2. **`@template`** — replace with `@typeParam`.
3. **Hyphen after `@returns`** — drop it. The hyphen separator is
   `@param`-only. `@returns - The count` becomes `@returns The count`.
4. **`@module`** — replace with `@packageDocumentation` for package
   entry-point files.
5. **`@deprecated` without `{@link}` migration target** — every deprecation
   must point at its replacement.

## Conditional Tag Rules

These tags appear only when they encode information not present in the TS
signature:

| Tag | Add when | Skip when |
|---|---|---|
| `@param` | Parameter has units, constraints, ordering, or interactions beyond name + type | Parameter is self-explanatory from `name: Type` |
| `@returns` | Return value has ordering, filtering, ownership, or semantic interpretation | Return type is `Effect<A, E, R>` and channels speak for themselves |
| `@typeParam` | Constraint or semantic role isn't obvious from the parameter name | Trivial generic like `<A>` |
| `@throws` | Synchronous throw or defect not in typed error channel | All errors are in the `E` channel of an Effect |
| `@remarks` | Non-obvious semantics, ordering guarantees, idempotency, or complexity | Behavior is fully obvious from name + signature |
| `@effects` | Function performs writes, publishes, cache mutations, or other side effects | Function is pure |

The default for conditional tags is **omit**. Add prose-padding `@param`/`@returns`
that just restates the signature is a bug, not thoroughness.

## Import Aliases in Examples

Mandatory aliases inside every `@example` code fence:

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
  { message: S.String, cause: S.Defect({ includeStack: true }) },
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

Use `$I.annoteSchema(...)` inside `.pipe(...)`:

```ts
const MyUnion = S.Union([SchemaA, SchemaB]).pipe(
  $I.annoteSchema("MyUnion", {
    description: "Discriminated union of A and B."
  })
)
```

## Category Conventions

Use canonical kebab-case slugs. Choose the exported symbol's semantic role, not
its package location. The code source of truth is
`packages/tooling/tool/cli/src/commands/Shared/JSDocCategories.ts`.

Canonical groups:

- Core API roles: `models`, `schemas`, `type-level`, `constructors`,
  `factories`, `destructors`, `combinators`, `predicates`, `guards`,
  `refinements`, `assertions`, `getters`, `setters`, `mapping`, `filtering`,
  `folding`, `sequencing`, `concurrency`, `resource-management`,
  `error-handling`, `utilities`, `layers`
- Domain roles: `aggregates`, `entities`, `value-objects`, `domain-events`,
  `policies`, `specifications`, `identifiers`, `entity-ids`, `type-ids`,
  `symbols`, `errors`
- Application and ports: `use-cases`, `commands`, `queries`, `events`,
  `workflows`, `processes`, `schedulers`, `protocols`, `ports`, `services`,
  `handlers`, `endpoints`, `clients`, `adapters`, `repositories`,
  `projections`, `read-models`, `tables`
- Data boundaries: `validation`, `parsing`, `encoding`, `decoding`,
  `serialization`, `codecs`, `formatting`, `normalization`, `dtos`, `mappers`
- UI and client state: `components`, `hooks`, `providers`, `themes`, `tokens`,
  `forms`, `atoms`
- Tooling and cross-cutting: `tools`, `tool-schemas`, `cli-commands`,
  `configuration`, `constants`, `observability`, `diagnostics`, `fixtures`,
  `testing`, `streams`, `resources`, `interop`

Legacy values such as `DomainModel`, `Utility`, `UseCase`, `PortContract`, and
`ToolSchemas` are migration aliases only. New or touched JSDoc should use the
canonical slug.

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

1. `any` types — never.
2. Type assertions (`as`, `as unknown as`) — never.
3. `declare` statements — never.
4. Non-compiling code — every example must pass `bun run docgen`.
5. `import { Schema } from "effect/Schema"` — use the `S` alias.
6. `from "@effect/schema"` — the package is deprecated.
7. Removing examples to fix compilation — always fix the example instead.
8. `import { Array }` / `import { Option }` etc. — use namespace aliases.
9. **Empty `Effect.gen` bodies** — examples must be complete and demonstrate
   real usage. `Effect.gen(function* () {})` with no body is forbidden.
10. **`@template` instead of `@typeParam`** — replace.
11. **`{type}` blobs in tags** — drop the braces.
12. **`@module` instead of `@packageDocumentation`** — replace.

## Agent Context Lifting Rules

When a downstream agent loads a symbol's documentation as context for code
generation, surface tags selectively based on what the agent is doing:

### When generating a call site for a symbol

Lift these into the prompt:

- **Always**: `@deprecated` (with migration target) — block use of deprecated APIs
- **Always**: The TS signature
- **`@effects`** — so the agent reasons about side effects in surrounding code
- **`@precondition`** — so the agent verifies preconditions at the call site
- **`@invariant`** — so the agent knows what state is preserved
- **`@throws`** — so the agent handles defects
- **`@remarks`** — for non-obvious semantics

Skip:

- `@param` / `@returns` when they restate the signature (the agent can read
  the signature)
- `@example` (the agent generates its own usage)
- `@since` / `@category` (irrelevant to call-site generation)

### When generating an implementation for a symbol

Lift:

- The TS signature
- `@postcondition` — what the implementation must guarantee
- `@invariant` — what the implementation must preserve
- `@remarks` — describing intent and complexity
- `@throws` — defects the implementation may produce
- `@effects` — side effects the implementation must perform

### When choosing between candidate symbols

Lift:

- `@public` / `@beta` / `@alpha` / `@experimental` — prefer stable APIs
- `@deprecated` — never pick deprecated symbols when alternatives exist
- `@remarks` — to disambiguate similar APIs

This is the most direct lever for using documentation to improve agent output
quality. Generated tags that don't end up in agent context are write-only
information.

## Post-Pass Checklist

Run this checklist against every file before finishing:

### Required tag presence

1. Every `export const`, `export function`, `export class`, `export interface`,
   `export type` has a JSDoc block.
2. Every JSDoc block contains at least one `@example` with a code fence.
3. Every JSDoc block contains `@category` (canonical kebab-case slug from the standard list).
4. Every JSDoc block contains `@since 0.0.0`.

### Whole-block quality

5. Description explains purpose rather than restating the symbol name.
6. `@example` shows meaningful input and an observable result, or type-level
   evidence for type-only exports.
7. Error, type-only, schema, and constant symbols still have examples suited to
   their shape; re-export declarations point at owning symbol docs.

### Conditional tag correctness

8. `@param` / `@returns` / `@typeParam` / `@throws` are present only when they
   add information beyond the signature; absent when they would just restate it.
9. `@remarks` is present on combinators with non-obvious semantics, ordering
   guarantees, or idempotency claims.
10. `@effects` is present on functions that write, publish, or mutate state
   beyond what the type signature reveals.
11. `@deprecated` includes a `{@link}` migration target.

### TSDoc grammar correctness

12. No `{type}` blobs appear in any `@param`, `@returns`, or `@throws` tag.
13. No `@template` tags appear; all type parameters use `@typeParam`.
14. No `@returns` has a hyphen separator.
15. No `@module` tag appears; package entry points use `@packageDocumentation`.

### Schema annotation requirements

16. Every `S.Class` / `Model.Class` call has `$I.annote(...)` as the third arg.
17. Every `TaggedErrorClass` call has `$I.annote(...)` as the third arg.
18. Every non-class schema value has `$I.annoteSchema(...)` in its pipe.
19. Every `LiteralKit` value has `.annotate($I.annote(...))`.
20. Every non-class schema export has a same-name `export type` alias.

### Import and pattern correctness

21. All `@example` code fences use correct import aliases.
22. No empty `Effect.gen(function* () {})` bodies in examples.
23. No forbidden patterns (`any`, type assertions, `declare`, deprecated
    package imports).

### Custom tag registration

24. If `@effects`, `@precondition`, `@postcondition`, or `@invariant` appear in
    any file, `tsdoc.json` registers them as block tags (verify once per
    workspace, not per file).

### Final compilation

25. `bun run docgen` passes with zero errors.
26. `bun run beep docgen quality -p <package>` produces a reviewable report.

## Grep Verification Commands

Use these to audit a file or directory for compliance gaps:

### Required-tag presence

```bash
# Exports missing JSDoc (heuristic — check lines above each match)
rg "^export (const|function|class|interface|type)" --type ts

# Files with @example but missing @since
rg "@example" --type ts -l | xargs rg -L "@since"

# Files with @example but missing @category
rg "@example" --type ts -l | xargs rg -L "@category"
```

### TSDoc grammar violations

```bash
# Type braces in @param / @returns / @throws (TSDoc violation)
rg '@(param|returns|throws)\s+\{' --type ts

# @template instead of @typeParam
rg '@template\b' --type ts

# @returns with hyphen separator
rg '@returns\s+-\s' --type ts

# @module instead of @packageDocumentation
rg '@module\b' --type ts | rg -v '@packageDocumentation'
```

### Conditional tag quality

```bash
# @deprecated without {@link} migration target
rg -B0 -A2 '@deprecated' --type ts | rg -v '\{@link'

# Empty Effect.gen bodies in examples (heuristic)
rg -A1 'Effect\.gen\(function\*\s*\(\)\s*\{' --type ts | rg -B1 '^\s*\}\)'
```

### Import alias compliance

```bash
# Wrong Schema import alias
rg 'import \{ Schema \}' --type ts
rg 'from "@effect/schema"' --type ts

# Wrong Array / Option / Predicate / Record imports
rg 'import \{ (Array|Option|Predicate|Record) \}' --type ts
```

### Schema annotation gaps

```bash
# S.Class without $I.annote
rg "extends S\.Class" --type ts -l | xargs rg -L "annote"

# TaggedErrorClass without $I.annote
rg "extends TaggedErrorClass" --type ts -l | xargs rg -L "annote"
```

### Forbidden patterns

```bash
# Uses any type in examples or signatures
rg ': any' --type ts

# Type assertions
rg ' as unknown as ' --type ts
rg ' as [A-Z]\w+' --type ts
```

### Internal symbol leakage

```bash
# @internal symbols re-exported from package index (potential leak)
rg -l '@internal' --type ts | while read f; do
  base=$(basename "$f" .ts)
  if grep -q "$base" "$(dirname "$f")/../index.ts" 2>/dev/null; then
    echo "Potential @internal leak: $f"
  fi
done
```

## Escalation

- Use `schema-first-development` when the task is schema modeling beyond
  annotation work.
- Use `effect-first-development` when the task is broader than documentation.
- Use `effect-error-handling` when defining new TaggedErrorClass hierarchies.

## Source References

- `.patterns/jsdoc-documentation.md` — primary JSDoc/TSDoc standard
- `tsdoc.json` (workspace root) — custom tag registrations for `@effects`,
  `@precondition`, `@postcondition`, `@invariant`
- `packages/common/schema/src/SemanticVersion.ts` — TemplateLiteral + annoteSchema
- `packages/tooling/tool/cli/src/commands/Quality/Tasks.ts` — TaggedErrorClass + annote
- `packages/common/schema/src/Duration.ts` — S.Class + annote + LiteralKit + annotate
