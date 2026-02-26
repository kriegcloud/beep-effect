# P1 Schema Contract

## Decision status

- Frozen on 2026-02-26.
- Scope: runtime schema strategy for `@beep/ontology` parity delivery from P2 through P6.

## Source anchors

1. Upstream stable surface: `/home/elpresidank/YeeBois/dev/references/osdk-ts/packages/api/src/index.ts`
2. Upstream unstable surface: `/home/elpresidank/YeeBois/dev/references/osdk-ts/packages/api/src/public/unstable.ts`
3. Local ontology source root: `/home/elpresidank/YeeBois/projects/beep-effect/packages/common/ontology/src`
4. P0 parity and dependency baselines:
   - `outputs/p0-baseline/parity-matrix.md`
   - `outputs/p0-baseline/module-dependency-order.md`
   - `outputs/p0-baseline/conventions-checklist.md`

## Runtime schema boundary

1. Data-bearing contracts must ship runtime schemas using `effect/Schema` values (`S.Struct`, `S.Class`, `S.TaggedStruct`, `S.TaggedClass`, `S.Union`, `S.Array`, `S.Record`, `S.NullOr`, `S.OptionFromOptionalKey`, `S.optionalKey` as applicable).
2. Compile-time-only contracts remain type-level (`type` and `interface`) and must not introduce fake runtime wrappers.
3. If a module exports both runtime and type-level symbols upstream, local implementation must keep that split explicit.
4. All runtime exports must be decode-ready and encode-ready at module boundary.

## Schema construction locks

1. Tagged unions must use explicit discriminator keys and finish with `S.toTaggedUnion(...)`.
2. Preserve discriminator names used by each modeled contract (`type`, `_tag`, or upstream-equivalent key).
3. Recursive shapes must use lazy schema construction (`S.suspend(() => ...)`) and avoid eager cycle initialization.
4. Mutually recursive ontology core modules (`SimplePropertyDef`, `InterfaceDefinition`, `ObjectOrInterface`, `ObjectTypeDefinition`) are treated as one coordinated schema unit in P3.
5. Optional key semantics:
   - Optional payload keys: `S.optionalKey(...)`
   - Optional key that decodes to `Option`: `S.OptionFromOptionalKey(...)`
   - Nullable payload values: `S.NullOr(...)`
6. Multiplicity semantics:
   - Multi-value property: `S.Array(...)`
   - Single-value property: non-array schema

## Annotation and documentation locks

1. Every exported runtime schema/class must carry `$OntologyId` annotations.
2. Annotation IDs must be stable and module-scoped (`<module>/<symbol>`).
3. Exported runtime surfaces require JSDoc (`@since`, `@category`, and concise description).
4. Tagged union members must have named exported symbols for docgen and type references.

## Error and decode boundary locks

1. Runtime decoding/encoding errors must flow through typed Effect failure channels at boundaries.
2. Domain modules must not hide parse failures behind silent fallback behavior.
3. Validation helpers should return typed values or Effect-based failures; avoid ad hoc exception paths.
4. Tooling-side adapters used by this phase family must use typed schema-based errors.

## Phase gating locks

1. P2-P5 implement stable modules only.
2. Unstable runtime surface is deferred to P6 and must be isolated in `src/public/unstable.ts`.
3. Alias bridges are finalized in P6 and must re-export canonical parity implementations, not duplicate logic.

## Acceptance criteria

- Runtime-bearing modules in the active phase expose concrete schemas.
- Tagged unions and recursion strategy follow the locks above.
- No schema drift against upstream data-shape intent is introduced without explicit contract amendment.
- Contracts are implementation-ready with no open architectural decisions.
