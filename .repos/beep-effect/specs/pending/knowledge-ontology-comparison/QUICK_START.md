# Knowledge Ontology Comparison - Quick Start

> **Time to Read:** 5 minutes
> **Complexity:** Simple (Single-phase research)

## TL;DR

Compare `tmp/effect-ontology` (reference) with `packages/knowledge/*` (implementation) to identify gaps and create an implementation roadmap for a production-grade knowledge graph system.

---

## What This Spec Does

| Action | Description |
|--------|-------------|
| **Compares** | 60+ services in effect-ontology vs ~15 in knowledge-slice |
| **Identifies** | Missing capabilities: SPARQL, SHACL, reasoning, workflows |
| **Prioritizes** | Gaps by P0-P3 criticality for wealth management domain |
| **Plans** | Phased implementation roadmap with complexity estimates |

---

## Key Files

| File | Purpose | When to Read |
|------|---------|--------------|
| `README.md` | Full scope, goals, success criteria | First |
| `COMPARISON_INSTRUCTIONS.md` | Detailed methodology | Before starting work |
| `AGENT_PROMPTS.md` | Copy-paste agent prompt | When launching comparison |
| `handoffs/HANDOFF_P1.md` | Phase 1 context | Session start |
| `handoffs/P1_ORCHESTRATOR_PROMPT.md` | Copy-paste orchestrator prompt | Session start |

---

## Deliverables

All outputs go to `outputs/`:

1. **COMPARISON_MATRIX.md** - Feature-by-feature table (≥50 rows)
2. **GAP_ANALYSIS.md** - Prioritized gaps with estimates
3. **IMPLEMENTATION_ROADMAP.md** - Phased plan
4. **CONTEXT_DOCUMENT.md** - Full context for implementation spec

---

## How to Start

### Option A: Launch Comparison Agent

```
Read specs/knowledge-ontology-comparison/AGENT_PROMPTS.md and execute the comparison
```

### Option B: Use Orchestrator Prompt

Copy-paste from `handoffs/P1_ORCHESTRATOR_PROMPT.md`

---

## What's Being Compared

### effect-ontology Has
- SPARQL via Oxigraph WASM
- RDFS forward-chaining reasoning
- SHACL shape validation
- Two-tier entity resolution (Mention → Canonical)
- @effect/workflow durable execution
- 60+ Effect services

### knowledge-slice Has
- 6-stage extraction pipeline
- Entity clustering via embeddings
- GraphRAG with RRF scoring
- pgvector integration
- Domain models aligned with beep-effect

### Known Gaps
- No SPARQL support
- No reasoning engine
- No SHACL validation
- No durable workflows
- Client SDK: stub only
- UI: stub only

---

## Success Criteria

- [ ] All capabilities in effect-ontology accounted for
- [ ] Gaps prioritized P0-P3
- [ ] Roadmap has S/M/L/XL estimates
- [ ] Context sufficient for implementation spec

---

## Related Specs

- `specs/knowledge-graph-integration/` - Original architecture (P0-P4 complete)
- `specs/knowledge-completion/` - @effect/ai migration pending

---

## Questions?

Review `README.md` for full context or `COMPARISON_INSTRUCTIONS.md` for methodology.
