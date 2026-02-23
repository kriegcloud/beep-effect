# Knowledge Schema Standardization (Opaque Models + Canonical IDs)

## Status

- Status: `pending`
- Slice: `packages/knowledge/**`
- Primary goal: prefer runtime-validated schemas (Effect `Schema`) over TypeScript-only shapes for data models.

## Problem Statement

The knowledge slice currently mixes:

- TypeScript-only shapes (`interface`) for data models.
- Anonymous schemas (`S.Struct`, `S.TaggedStruct`, `S.Literal`) where a named, reusable schema class would be safer and easier to annotate.
- Inconsistent schema identifiers/annotations where not all schemas use `@beep/identity/packages` TaggedComposer conventions.

This weakens boundary safety: static types can drift from runtime behavior, and schema metadata (IDs, titles, descriptions) becomes inconsistent.

## Goals

1. Prefer opaque schema classes:
   - `S.Class` instead of `S.Struct` when a schema can reasonably be modeled as a named class.
   - `S.TaggedClass` instead of `S.TaggedStruct` for tagged/ADT data where feasible.
   - `S.TaggedError` for typed error schemas.
2. Enforce canonical schema identifiers + annotations via TaggedComposer:
   - Always define `$I` at the top of the module.
   - Always create module composer using `$PackageId.create("relative-path-to-module")`.
   - Always use `$I\`Identifier\`` for schema identifiers where supported.
   - Always use `$I.annotations("Identifier", { description: "..." })` for meaningful schema metadata.
3. Prefer `BS.StringLiteralKit` over `S.Literal` for string-literal enums/tags.

## Non-Goals / Constraints

- Do not refactor outside `packages/knowledge/**` (unless adding a small shared doc is strictly necessary).
- Avoid behavioral changes to runtime data formats (JSON shapes, wire formats, RPC payload formats).
- Do not introduce `any`, `@ts-ignore`, or unchecked casts.
- Respect boundaries: cross-slice imports only via `packages/shared/*` or `packages/common/*`, and use `@beep/*` aliases.
- Do not start long-running dev servers automatically.

## Allowed Exceptions (Must Be Explicit)

Exceptions are allowed only with an in-code comment:

```ts
// exception(schema-model): <reason, and what would break/change if refactored>
```

Common valid exceptions:

- External AST/SDK types that cannot be realistically schema-validated (e.g. `sparqljs` AST nodes).
- Function/method contracts (service shapes) used by `Context.Tag(...)` are not data models.
- Truly one-off anonymous schemas used locally (not exported) where introducing a named class adds churn without reuse.
- `S.Literal(...)` only when `BS.StringLiteralKit` would change semantics or composition.

## Phase 1: Inventory (Discovery)

Produce `specs/pending/knowledge-schema-standardization/outputs/inventory.md` containing:

1. All `interface` occurrences in `packages/knowledge/**` that are feasible to convert to `S.Class` (data-only, serializable, not function contracts, not external AST nodes).
2. All `S.Struct` / `S.TaggedStruct` occurrences that are feasible to convert to `S.Class` / `S.TaggedClass`.
3. All `S.Literal` occurrences that should become `BS.StringLiteralKit`.
4. All schemas lacking canonical TaggedComposer usage:
   - missing `$I` module composer
   - missing `$I\`...\`` identifiers
   - missing/weak annotations (especially `description`)

Each inventory item MUST include:

- File path + line range
- Current construct (`interface`, `S.Struct`, `S.TaggedStruct`, `S.Literal`, missing `$I`, missing annotations, etc.)
- Proposed target (`S.Class`, `S.TaggedClass`, `BS.StringLiteralKit`, `$I` conventions)
- Risk notes: public API, wire format, external integration, recursion, performance
- Why feasible (short justification)

## Phase 2: Refactor Execution (Agent-Orchestrated)

Orchestrate small, PR-sized diffs. For each inventory item:

- Convert to schema classes (`S.Class` / `S.TaggedClass` / `S.TaggedError`) when feasible.
- Apply TaggedComposer conventions:
  - `const $I = $PackageId.create("relative/path/to/module")`
  - `$I\`Identifier\`` and `$I.annotations("Identifier", { description: "..." })`
- Replace `S.Literal(...)` with `BS.StringLiteralKit(...)` (or reuse an existing literal-kit schema from the domain).
- Improve annotations with thoughtful descriptions (avoid boilerplate).

Guardrails:

- Keep runtime payload shapes stable (watch `_tag` values, field names, nullish handling).
- Prefer converting call-sites to use `.make(...)` when moving from structs to classes.
- Avoid massive single-file rewrites; isolate changes by module or feature.

## Phase 3: Quality Gates (Verification)

All checks must pass from repo root:

1. `bun run lint:fix`
2. `bun run lint`
3. `bun run build`
4. `bun run check`
5. `bun run test`

## Acceptance Criteria

- In `packages/knowledge/**`, all feasible `interface`/`S.Struct`/`S.TaggedStruct` are migrated to `S.Class`/`S.TaggedClass`.
- In `packages/knowledge/**`, schemas follow TaggedComposer identifier + annotation conventions with meaningful descriptions.
- `BS.StringLiteralKit` is preferred over `S.Literal`, and deviations are explicitly justified.
- Quality gates pass.

