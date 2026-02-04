# Phase 1 Orchestrator Prompt

> **Quick Start:** [QUICK_START.md](../QUICK_START.md) | **Full Context:** [HANDOFF_P1.md](./HANDOFF_P1.md)

Copy-paste this prompt to start Phase 1 comparison work.

---

## Prompt

You are executing Phase 1 of the `knowledge-ontology-comparison` spec.

### Context

This spec compares `tmp/effect-ontology` (reference implementation) with `packages/knowledge/*` (current implementation) to identify gaps and create an implementation roadmap.

This is a **single-phase research spec** - no code changes, only analysis and documentation.

### Your Mission

Create 4 comprehensive comparison deliverables in `specs/knowledge-ontology-comparison/outputs/`:

1. **COMPARISON_MATRIX.md** - Feature-by-feature comparison table (minimum 50 rows)
2. **GAP_ANALYSIS.md** - Prioritized gaps with complexity estimates
3. **IMPLEMENTATION_ROADMAP.md** - Phased plan to close gaps with dependencies
4. **CONTEXT_DOCUMENT.md** - Full context for future implementation specs

### Phase Tasks

| Task | Agent Type | Priority |
|------|------------|----------|
| Inventory effect-ontology capabilities | Explore | P0 |
| Audit knowledge-slice implementation | Explore | P0 |
| Create comparison matrix | general-purpose | P0 |
| Analyze and prioritize gaps | general-purpose | P0 |
| Create implementation roadmap | general-purpose | P1 |
| Write context document | general-purpose | P1 |

---

## Key Areas to Compare

### 1. Query & Reasoning

- **SPARQL support** (effect-ontology: Oxigraph WASM)
- **RDFS reasoning** (forward-chaining, N3 rules)
- **SHACL validation** (shape constraints)

### 2. Entity Resolution

- Two-tier architecture (Mention -> Canonical)
- EntityLinker service APIs
- Cross-batch resolution

### 3. GraphRAG

- Multi-hop traversal implementation
- Semantic scoring algorithms
- Citation/provenance generation

### 4. Workflow Orchestration

- Durable execution (@effect/workflow)
- State persistence patterns
- Batch status tracking

### 5. RDF Infrastructure

- Named graphs support
- PROV-O vocabulary
- Serialization formats

### 6. Service Architecture

- Service decomposition patterns
- Layer composition
- Error handling approaches

---

## Critical File References

**effect-ontology (Reference):**

```
/tmp/effect-ontology/packages/@core-v2/src/Service/Sparql.ts
/tmp/effect-ontology/packages/@core-v2/src/Service/Reasoner.ts
/tmp/effect-ontology/packages/@core-v2/src/Service/Shacl.ts
/tmp/effect-ontology/packages/@core-v2/src/Domain/Model/Entity.ts
/tmp/effect-ontology/packages/@core-v2/src/Domain/Model/EntityResolution.ts
/tmp/effect-ontology/packages/@core-v2/src/Workflow/*.ts
```

**knowledge-slice (Target):**

```
/packages/knowledge/server/src/Extraction/ExtractionPipeline.ts
/packages/knowledge/server/src/EntityResolution/EntityResolutionService.ts
/packages/knowledge/server/src/GraphRAG/GraphRAGService.ts
/packages/knowledge/domain/src/*.ts
/packages/knowledge/tables/src/*.ts
```

---

## Output Format

Write deliverables to `specs/knowledge-ontology-comparison/outputs/`:

**COMPARISON_MATRIX.md structure:**
```markdown
# Comparison Matrix

## Summary
[Brief overview of findings]

## Matrix

| Category | Capability | effect-ontology | knowledge-slice | Gap Status | Notes |
|----------|------------|-----------------|-----------------|------------|-------|
| Query | SPARQL 1.1 | Oxigraph WASM | None | GAP | Full query language |
| ... | ... | ... | ... | ... | ... |
```

**GAP_ANALYSIS.md structure:**
```markdown
# Gap Analysis

## Priority Scale
- P0: Critical - blocks core functionality
- P1: High - significant feature gap
- P2: Medium - enhancement opportunity
- P3: Low - nice to have

## Complexity Scale
- S: Small (1-2 days)
- M: Medium (3-5 days)
- L: Large (1-2 weeks)
- XL: Extra Large (2+ weeks)

## Gaps by Priority

### P0 - Critical
| Gap | Description | Complexity | Dependencies |
|-----|-------------|------------|--------------|
| ... | ... | ... | ... |
```

**IMPLEMENTATION_ROADMAP.md structure:**
```markdown
# Implementation Roadmap

## Overview
[Strategy for closing gaps]

## Phases

### Phase 1: Foundation
**Timeline**: X weeks
**Deliverables**: [list]
**Dependencies**: None

### Phase 2: Query Layer
**Timeline**: X weeks
**Deliverables**: [list]
**Dependencies**: Phase 1
```

**CONTEXT_DOCUMENT.md structure:**
```markdown
# Implementation Context

## Purpose
[What this document provides]

## Architectural Decisions
[Key decisions from effect-ontology to preserve]

## Implementation Patterns
[Patterns to follow when implementing gaps]

## Reference Material
[Links to relevant docs, files, specs]
```

---

## Verification

After completing deliverables:

```bash
# Verify files exist
ls -la specs/knowledge-ontology-comparison/outputs/

# Check line counts (matrix should be substantial)
wc -l specs/knowledge-ontology-comparison/outputs/*.md
```

---

## Success Criteria

- [ ] `COMPARISON_MATRIX.md` has minimum 50 comparison rows
- [ ] All 6 comparison areas covered in matrix
- [ ] `GAP_ANALYSIS.md` categorizes all gaps (P0-P3)
- [ ] Each gap has complexity estimate (S/M/L/XL)
- [ ] `IMPLEMENTATION_ROADMAP.md` has phased plan
- [ ] Dependencies between phases documented
- [ ] `CONTEXT_DOCUMENT.md` provides implementer context
- [ ] Specific file paths cited for every claim
- [ ] `REFLECTION_LOG.md` updated with learnings

---

## Handoff Document

Read full context in: `specs/knowledge-ontology-comparison/handoffs/HANDOFF_P1.md`

---

## After Completion

This is a single-phase research spec. After completing Phase 1:

1. Update `REFLECTION_LOG.md` with learnings
2. Review deliverables for completeness
3. Consider creating follow-on implementation specs based on findings:
   - `specs/knowledge-sparql-integration/`
   - `specs/knowledge-workflow-integration/`
   - `specs/knowledge-reasoning-engine/`
