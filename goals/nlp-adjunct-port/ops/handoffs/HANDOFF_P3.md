# P3 Handoff — Handoff Contract (generic graph IR)

## Objective

Finalize and property-test the product-neutral generic graph IR that `@beep/nlp` emits,
aligned with the downstream KG's consumption shape.

## Inputs

- Landed `@beep/nlp` (P2)
- `goals/ip-law-knowledge-graph/{SPEC.md, research/ip-law-nlp.md}` (consumption shape:
  15 node / 11 edge types, PROV-O provenance, chunk schema)
- `standards/architecture/{04-rich-domain-model,09-errors-across-boundaries}.md`

## Required Work

1. Finalize the IR schemas: `TextChunk`, `Mention`, `Entity`, `Relation`,
   `AnnotatedTextGraph`, with character spans, PROV-O provenance (activity/agent/source
   chunk IDs), and confidence. Keep them **product-neutral** (no IP-law vocabulary);
   `Entity`/`Relation` carry a `type` discriminant the downstream mapping keys on.
2. Annotate every schema (`identifier`/`title`/`description`, examples) per repo doctrine.
3. Property-test the contract: chunk ↔ reassemble round-trip; provenance completeness
   (every extracted node/edge cites ≥1 source chunk + offsets); confidence bounds.
4. Write a `generic → KG node/edge` mapping example (e.g. `Entity{type:"…"} → Patent`,
   `Relation → CITES`) — documentation only; the mapping itself is owned downstream.

## Exit Criteria

- [ ] IR exported as a documented, versioned surface; fully schema-annotated
- [ ] Round-trip + provenance-completeness property tests pass
- [ ] Mapping example doc shows generic `Entity`/`Relation` → KG node/edge types
- [ ] No IP-law vocabulary in `@beep/nlp`
- [ ] `history/outputs/p3-contract.md` records the contract + mapping example
