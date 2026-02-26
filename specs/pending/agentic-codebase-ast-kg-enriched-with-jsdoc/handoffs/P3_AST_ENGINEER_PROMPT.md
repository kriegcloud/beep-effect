# P3 AST Engineer Prompt — Deterministic Extractor + Delta Core

## Mission
Implement deterministic AST/type extraction, node/edge assembly, and incremental delta planner based on frozen P2 contracts.

## Inputs
1. `outputs/p2-design/kg-schema-v1.md`
2. `outputs/p2-design/extraction-contract.md`
3. `outputs/p2-design/incremental-update-design.md`
4. `handoffs/HANDOFF_P2.md`

## Required Output
1. `outputs/p3-execution/agents/ast-engineer.md`

## Required Checks
1. Node ID shape remains `<workspace>::<file>::<symbol>::<kind>::<signature-hash>`.
2. Edge provenance remains `ast | type | jsdoc`.
3. Full and delta mode behavior matches locked CLI contract.
4. Scope include/exclude filters are enforced exactly.

## Exit Gate
1. Deterministic hash fixtures from P2 pass in implementation.
2. Delta widening/invalidation behavior matches P2 contract.
3. No extractor-level TBD remains in agent output.
