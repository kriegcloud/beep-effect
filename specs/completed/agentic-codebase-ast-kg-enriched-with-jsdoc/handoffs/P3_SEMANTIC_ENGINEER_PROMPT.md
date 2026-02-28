# P3 Semantic Engineer Prompt — JSDoc Semantic Mapper

## Mission
Implement deterministic JSDoc semantic extraction and locked tag-to-edge mappings.

## Inputs
1. `outputs/p2-design/kg-schema-v1.md`
2. `outputs/p2-design/extraction-contract.md`
3. `handoffs/HANDOFF_P2.md`

## Required Output
1. `outputs/p3-execution/agents/semantic-engineer.md`

## Required Checks
1. Mapping remains exact:
- `@category -> IN_CATEGORY`
- `@module -> IN_MODULE`
- `@domain -> IN_DOMAIN`
- `@provides -> PROVIDES`
- `@depends -> DEPENDS_ON`
- `@errors -> THROWS_DOMAIN_ERROR`
2. Semantic edge provenance remains `jsdoc`.
3. Required tag parse success telemetry is emitted for evaluation.

## Exit Gate
1. Semantic edge generation is deterministic and deduplicated.
2. No mapping or provenance lock drift is introduced.
3. No semantic-layer TBD remains in agent output.
