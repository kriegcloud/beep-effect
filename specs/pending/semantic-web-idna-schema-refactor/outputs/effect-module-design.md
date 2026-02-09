# Effect module design conventions to mirror

## Public surface vs internal helpers

- Public modules expose stable APIs; low-level machinery lives under `internal/` and is imported as `* as internal` (see `Encoding.ts` importing `./internal/encoding/*`, and `ParseResult.ts` importing `./internal/schema/util.js`).
- The `internal/*` modules are not re-exported. They are used to keep the public API small and stable while allowing implementation churn.

## Naming conventions and export shape

- Named exports only (no default exports). Public API is a flat list of constants, classes, types, and namespaces.
- Errors follow a consistent pattern:
  - `XTypeId` symbol + `type XTypeId` alias.
  - `class X extends TaggedError("X")` with a `readonly [XTypeId]` marker.
  - `isX` refinement function using `Predicate.hasProperty` or exported guard.
- Constructors are verbs, refinements are `isX`, and data models are `interface` or `class` with `@category model`.
- Functions are grouped by `@category` in JSDoc (e.g., `constructors`, `encoding`, `decoding`, `formatting`). This is consistent across modules.

## Documentation conventions and stability

- Every export is annotated with `@since` and a `@category` where appropriate.
- Error messages used in formatter output are stable strings; treat them as part of the API surface (see `ParseResult` formatting paths).
- Use direct, single-sentence module headers to describe the module’s purpose.

## Modules to mirror

1. `Encoding.ts`
   - Thin public wrappers around `internal/encoding/*` modules.
   - Clear split between encode and decode helpers, plus checked exceptions (`DecodeException`, `EncodeException`).
   - Symbol + type-id + `isX` pattern for errors.

2. `ParseResult.ts`
   - Central error model (`ParseIssue`) with formatting and helpers.
   - Dedicated formatter APIs (`TreeFormatter`, `ArrayFormatter`) and consistent categories.
   - `ParseError` as a tagged error wrapper for `ParseIssue` with stable string output.

3. `Brand.ts`
   - Public namespace pattern (`Brand`) containing related types.
   - Constructor functions (`refined`, `nominal`, `all`) with predictable return shape.
   - Consistent use of `@category` for models, constructors, and combinators.

