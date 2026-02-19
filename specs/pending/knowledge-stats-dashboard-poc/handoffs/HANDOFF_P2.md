# Handoff P2: Schema & Contracts

## Context For Phase 2

### Working Context (<=2K tokens)

Current task: define the typed RPC contract and Effect schemas needed for the dashboard.

Success criteria:
- [ ] Contract supports:
  - 5-number summary row (counts)
  - schema inventory (classes/properties with counts)
  - React Flow graph nodes/edges derived from ontology schema
  - optional POC-stretch sections (extraction pipeline, entity resolution)
- [ ] Schemas validate RPC output (no unchecked casts)
- [ ] Handoff P3 updated with exact endpoint names and schema shapes

Immediate dependencies:
- `packages/knowledge/client/src/`
- `packages/knowledge/server/src/rpc/v1/` (to align naming)
- `specs/pending/open-ontology-reference-capture/outputs/SCOUT_Stats.md`

### Episodic Context (<=1K tokens)

- P1 should decide route location and identify existing RPC conventions.

### Semantic Context (<=500 tokens)

- The reference UI has a stats row, inventory accordion, and schema graph.

### Procedural Context (links only)

- Effect patterns: `.claude/rules/effect-patterns.md`
- Spec guide: `specs/_guide/README.md`

## Verification Checklist

- [ ] RPC endpoint name/versioning matches existing patterns
- [ ] Output schema is explicit and stable
- [ ] No `any` in contracts
- [ ] P3 handoff/prompt updated
