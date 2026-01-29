# Knowledge Ontology Comparison Spec

> Systematic comparison of `tmp/effect-ontology` reference implementation with `packages/knowledge/*` to identify capability gaps and create an implementation roadmap.

---

## Purpose

This specification provides a comprehensive analysis comparing the reference implementation (`tmp/effect-ontology`) against the current knowledge slice (`packages/knowledge/*`). The goal is to:

1. **Identify** all capabilities in effect-ontology that are missing from the knowledge slice
2. **Categorize** gaps by priority (P0-P3) and implementation complexity (S/M/L/XL)
3. **Create** an actionable implementation roadmap with phased delivery
4. **Build** comprehensive context for a full implementation specification

---

## Background

### Reference Implementation: tmp/effect-ontology

A mature knowledge graph system with:
- 60+ Effect services
- SPARQL support via Oxigraph WASM
- RDFS forward-chaining reasoning engine
- SHACL shape-based validation
- Two-tier entity resolution (Mention -> Canonical)
- Durable workflow orchestration (@effect/workflow)
- Multi-hop GraphRAG retrieval
- Full PROV-O provenance support

### Target Implementation: packages/knowledge/*

A bootstrapped vertical slice with:
- Domain models (Entity, Relation, Ontology)
- Database tables with pgvector support
- 6-stage extraction pipeline
- Entity clustering via embedding similarity
- GraphRAG with RRF scoring
- Ontology parsing (N3.js Turtle/RDF-XML)
- SKOS vocabulary support

### Missing/Incomplete Components

Based on preliminary research:
- **@beep/knowledge-client**: Only placeholder comments
- **@beep/knowledge-ui**: Only placeholder comments
- No SPARQL support
- No SHACL validation
- No formal reasoning engine
- No durable workflow orchestration
- Uses custom AiService instead of @effect/ai

### Related Specs

| Spec | Status | Relevance |
|------|--------|-----------|
| `specs/knowledge-graph-integration/` | P0-P4 complete | Original architecture |
| `specs/knowledge-completion/` | In progress | @effect/ai migration |
| `specs/knowledge-effect-ai-migration/` | Planning | LLM service refactoring |

---

## Goals

1. **Comprehensive Feature Inventory**
   - Document every service/module in effect-ontology
   - Map public APIs and Effect patterns
   - Catalog dependencies and integration points

2. **Gap Classification**
   - Missing: Not implemented at all
   - Partial: Some functionality present
   - Different: Alternative approach taken
   - Equivalent: Same capability exists

3. **Priority Assessment**
   - P0: Critical for core functionality
   - P1: Important for production use
   - P2: Nice to have
   - P3: Future consideration

4. **Implementation Roadmap**
   - Phase A: Foundation (prerequisites)
   - Phase B: Core Capabilities (must-have)
   - Phase C: Advanced Features (production-ready)
   - Phase D: Optimization (scale/performance)

---

## Non-Goals

- **NOT** implementing any code changes
- **NOT** modifying existing knowledge slice
- **NOT** redesigning architecture
- **NOT** making technology decisions (only recommendations)

This is a **research and analysis** specification only.

---

## Deliverables

| Document | Purpose | Location |
|----------|---------|----------|
| COMPARISON_MATRIX.md | Feature-by-feature comparison table | outputs/ |
| GAP_ANALYSIS.md | Prioritized gaps with complexity estimates | outputs/ |
| IMPLEMENTATION_ROADMAP.md | Phased plan to close gaps | outputs/ |
| CONTEXT_DOCUMENT.md | Full context for implementation spec | outputs/ |

---

## Phase Overview

| Phase | Description | Agent | Output |
|-------|-------------|-------|--------|
| **P1** | Capability Inventory (effect-ontology) | codebase-researcher | Service catalog |
| **P2** | Knowledge Slice Audit | codebase-researcher | Current state map |
| **P3** | Gap Analysis | reflector | Prioritized gaps |
| **P4** | Roadmap Creation | doc-writer | Implementation plan |

---

## Key Comparison Areas

### 1. Query & Reasoning
- SPARQL support (Oxigraph WASM)
- RDFS reasoning (forward-chaining, N3 rules)
- SHACL validation (shape constraints)

### 2. Entity Resolution
- Two-tier architecture (Mention -> Canonical)
- EntityLinker service
- Cross-batch resolution
- Same-as link management

### 3. GraphRAG
- Multi-hop traversal
- Semantic scoring
- Citation generation
- Reasoning traces

### 4. Workflow Orchestration
- Durable execution (@effect/workflow)
- State persistence
- Checkpointing/recovery
- Batch status tracking

### 5. RDF Infrastructure
- Named graphs
- Provenance (PROV-O)
- Serialization formats
- Vocabulary support (SKOS, OWL, RDFS)

### 6. Service Architecture
- Service decomposition patterns
- Layer composition
- Error handling (TaggedError)
- Testing patterns

---

## Success Criteria

- [ ] All 60+ services in effect-ontology cataloged
- [ ] All services in knowledge slice mapped
- [ ] Every gap has priority (P0-P3) and complexity (S/M/L/XL)
- [ ] Implementation roadmap has 4 phases with estimates
- [ ] Context document provides sufficient detail for implementation spec
- [ ] No ambiguity in gap classifications

---

## Reference Files

### effect-ontology Key Directories
```
tmp/effect-ontology/packages/@core-v2/src/
  Service/          # 60+ Effect services
  Domain/Model/     # Data models
  Workflow/         # Batch processing
  Repository/       # Data access
```

### knowledge slice Packages
```
packages/knowledge/
  domain/           # Entity, Relation, Ontology models
  tables/           # PostgreSQL tables with pgvector
  server/           # Extraction, EntityResolution, GraphRAG
  client/           # (placeholder)
  ui/               # (placeholder)
```

---

## Usage

### For Orchestrators

1. Read this README for context
2. Read `COMPARISON_INSTRUCTIONS.md` for methodology
3. Execute phases using `AGENT_PROMPT.md`
4. Verify outputs against success criteria

### For Implementers (Future)

1. Read `outputs/CONTEXT_DOCUMENT.md` for full context
2. Follow `outputs/IMPLEMENTATION_ROADMAP.md` phase order
3. Use `outputs/GAP_ANALYSIS.md` for task prioritization

---

## Related Documentation

- [COMPARISON_INSTRUCTIONS.md](./COMPARISON_INSTRUCTIONS.md) - Detailed methodology
- [AGENT_PROMPT.md](./AGENT_PROMPT.md) - Comparison agent prompt
- [REFLECTION_LOG.md](./REFLECTION_LOG.md) - Session learnings
- [Effect Patterns](../../.claude/rules/effect-patterns.md) - Mandatory patterns
- [knowledge-graph-integration](../knowledge-graph-integration/) - Original spec
