# P2 Schema Agent Prompt — Deterministic KG Contract

## Mission
Freeze deterministic node/edge schema and extraction contract details for AST/type/JSDoc graph generation.

## Inputs
1. `README.md` lock tables
2. `outputs/p1-research/landscape-comparison.md`
3. `outputs/p1-research/reuse-vs-build-matrix.md`
4. `outputs/p1-research/constraints-and-gaps.md`

## Required Outputs
1. `outputs/p2-design/kg-schema-v1.md`
2. `outputs/p2-design/extraction-contract.md`
3. `outputs/p2-design/incremental-update-design.md`

## Required Checks
1. Node ID shape remains `<workspace>::<file>::<symbol>::<kind>::<signature-hash>`.
2. Edge provenance remains `ast | type | jsdoc`.
3. Semantic tag-edge mappings remain exactly:
- `@category -> IN_CATEGORY`
- `@module -> IN_MODULE`
- `@domain -> IN_DOMAIN`
- `@provides -> PROVIDES`
- `@depends -> DEPENDS_ON`
- `@errors -> THROWS_DOMAIN_ERROR`
4. Delta design starts changed-file-first and defines widening/invalidation policy.
5. SCIP path is documented as optional overlay only.

## Exit Gate
1. Deterministic hash canon includes fixtures/examples.
2. Scope include/exclude policy is explicit and lock-consistent.
3. No schema/extraction TBD remains.
