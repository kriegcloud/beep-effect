# Knowledge GraphRAG Plus

**Status:** PLANNED
**Phase:** 4
**Complexity:** H (High - 44 points)
**Priority:** P2 (Nice to have for production quality)

---

## Phase Completion Requirements

> **CRITICAL**: A phase is NOT considered complete until ALL of the following are satisfied:

1. **Deliverables**: All phase deliverables pass type checking (`bun run check`) and tests (`bun run test`)
2. **Reflection**: `REFLECTION_LOG.md` is updated with phase learnings (what worked, what didn't, patterns discovered)
3. **Handoff**: Next phase handoff documents are created:
   - `handoffs/HANDOFF_P{N+1}.md` - Detailed handoff with 4-tier memory structure
   - `handoffs/P{N+1}_ORCHESTRATOR_PROMPT.md` - Copy-paste prompt for starting next phase

**Rationale**: Creating handoff documents ensures knowledge transfer between sessions and maintains implementation continuity. Without handoffs, context is lost and subsequent phases may repeat mistakes or miss critical decisions.

---

## Complexity Classification

Using the formula from `specs/_guide/README.md`:

| Factor | Value | Weight | Score |
|--------|-------|--------|-------|
| Phase Count | 3 | 2 | 6 |
| Agent Diversity | 3 | 3 | 9 |
| Cross-Package | 3 | 4 | 12 |
| External Dependencies | 1 | 3 | 3 |
| Uncertainty | 2 | 5 | 10 |
| Research Required | 2 | 2 | 4 |
| **Total** | | | **44** |

**Classification: High** (41-60 points)

**Rationale**:
- 3 phases (Schema, Generation, Validation)
- 3 agent types (test-writer, effect-code-writer, codebase-researcher)
- 3 cross-package dependencies (knowledge-domain, knowledge-server, shared-openai)
- 1 external dependency (OpenAI API)
- Medium uncertainty (citation parsing patterns untested)
- Medium research (GraphRAG patterns, SPARQL integration)

---

## Purpose

Enhance knowledge graph retrieval with grounded answer generation, reasoning traces, and citation validation. Ensures LLM responses are verifiable against the graph structure and provides transparent reasoning paths for inferred relationships.

## Scope

### In Scope

- Grounded answer generation with entity/relation citations
- Reasoning trace formatting for inference paths
- Citation validation service verifying claims against graph
- Confidence propagation from graph structure to answers
- Schema definitions for grounded answer outputs

### Out of Scope

- LLM model selection/training (uses existing OpenAI integration)
- Graph population/ingestion (handled by Phase 1)
- Query optimization (covered by Phase 1 SPARQL integration)
- Caching strategies (deferred to Phase 5 resilience)

## Related Specs

| Spec | Status | Relationship |
|------|--------|--------------|
| `specs/knowledge-sparql-integration/` | PLANNED | **Predecessor** - Citation validation needs SPARQL |
| `specs/knowledge-reasoning-engine/` | PLANNED | **Predecessor** - Inference traces need Reasoner |
| `specs/knowledge-rdf-foundation/` | PLANNED | Indirect predecessor via Phase 1 |
| `specs/knowledge-architecture-foundation/` | COMPLETE | Package allocation patterns |
| `specs/knowledge-ontology-comparison/` | COMPLETE | Source of roadmap |

**CRITICAL**: This spec is SEQUENTIAL, not parallel. Must wait for Phase 1.1 (SPARQL) AND Phase 1.2 (Reasoner) completion.

## Goals

1. **Verifiable Citations**: Every entity/relation claim links to actual graph nodes
2. **Transparent Reasoning**: Inference paths visible when answers use inferred relationships
3. **Confidence Scoring**: Ungrounded claims flagged with low confidence scores
4. **Production Quality**: Answer validation prevents hallucination propagation

## Non-Goals

- Real-time query optimization (Phase 1 responsibility)
- Graph schema evolution (Phase 1 foundation)
- Multi-modal citations (text-only for Phase 4)
- Citation UI components (deferred to Phase 6 POC)

## Deliverables

| Item | Priority | Complexity | Estimate | Dependencies |
|------|----------|------------|----------|--------------|
| Grounded answer schema | P2 | S | 1 day | None |
| Answer generation prompt templates | P2 | M | 2 days | Schema |
| Reasoning trace formatter | P2 | M | 2 days | Phase 1.2 Reasoner |
| Citation validation service | P2 | M | 3 days | Phase 1.1 SPARQL |
| Confidence propagation | P3 | M | 2 days | Validation |

**Total Estimate**: 10 days (2 weeks with buffer)

## Phase Overview

### Phase 1: Schema Foundation (1 day)

**Deliverable**: Grounded answer schemas

**Key Files**:
```
packages/knowledge/server/src/GraphRAG/AnswerSchemas.ts
```

**Schema Structure**:
```typescript
// Grounded answer with citations
class GroundedAnswer {
  text: string;
  citations: Citation[];
  confidence: number;
  reasoning?: ReasoningTrace;
}

class Citation {
  claimText: string;
  entityIds: EntityId[];
  relationId?: RelationId;
  confidence: number;
}

class ReasoningTrace {
  inferenceSteps: InferenceStep[];
  depth: number;
}
```

**Success Criteria**:
- [ ] Schema validates grounded answer structure
- [ ] Citations reference EntityId/RelationId types
- [ ] Confidence scores 0.0-1.0 range enforced

### Phase 2: Answer Generation (2 days)

**Deliverable**: Answer generation prompt templates + service

**Key Files**:
```
packages/knowledge/server/src/GraphRAG/GroundedAnswerGenerator.ts
packages/knowledge/server/src/GraphRAG/PromptTemplates.ts
```

**Prompt Template Pattern**:
```
Context: [Graph entities + relations from retrieval]
Question: [User query]

Requirements:
1. Answer using ONLY provided context
2. Cite entities with format: {{entity:entity_id}}
3. Cite relations with format: {{relation:relation_id}}
4. If answer requires inference, explain reasoning

Answer:
```

**Success Criteria**:
- [ ] Prompts generate structured citations
- [ ] Answer text includes citation markers
- [ ] Service integrates with OpenAI client
- [ ] Handles missing context gracefully

### Phase 3: Citation Validation (5 days)

**Deliverable**: Citation validator + reasoning trace formatter + confidence propagation

**Key Files**:
```
packages/knowledge/server/src/GraphRAG/CitationValidator.ts
packages/knowledge/server/src/GraphRAG/ReasoningTraceFormatter.ts
packages/knowledge/server/src/GraphRAG/ConfidenceScorer.ts
```

**Citation Validation Flow**:
```
LLM Response
  |
  v
Parse Citations
  |
  +-- Extract entity mentions
  |     |
  |     +-- SPARQL: Find matching entities
  |     +-- Score: Exact match (1.0), Fuzzy match (0.5-0.9), Not found (0.0)
  |
  +-- Extract relation claims
  |     |
  |     +-- SPARQL: Verify relation exists between entities
  |     +-- Score: Direct relation (1.0), Inferred (0.6-0.9), Not found (0.0)
  |
  +-- For inferred relations
  |     |
  |     +-- Reasoner: Get inference path
  |     +-- Format reasoning trace
  |     +-- Adjust confidence by inference depth
  |
  v
Grounded Answer with Confidence Scores
```

**Reasoning Trace Format**:
```typescript
// Example: Alice knows Bob (inferred)
{
  inferenceSteps: [
    { rule: "sameAs transitivity", premises: ["Alice", "Alice_LinkedIn"] },
    { rule: "knows direct", premises: ["Alice_LinkedIn", "Bob_LinkedIn"] },
    { rule: "sameAs transitivity", premises: ["Bob_LinkedIn", "Bob"] }
  ],
  depth: 3
}
```

**Confidence Scoring**:
```
Base Confidence:
  - Direct entity/relation: 1.0
  - Fuzzy entity match: 0.5-0.9 (by string similarity)
  - Inferred relation: 0.6-0.9 (by inference depth)
  - Not found: 0.0

Propagation:
  Citation confidence = min(entity_confidence, relation_confidence)
  Answer confidence = weighted_avg(citation_confidences)
```

**Success Criteria**:
- [ ] Citations validated against graph via SPARQL queries
- [ ] Ungrounded claims flagged with confidence < 0.5
- [ ] Reasoning traces show inference paths
- [ ] Test: Answer about inferred relationship includes reasoning trace
- [ ] Test: Answer with unverifiable claim has low confidence

## Success Criteria

### Functional Requirements

- [ ] Generated answers include entity/relation citations
- [ ] Citations link to actual graph nodes (EntityId/RelationId)
- [ ] Ungrounded claims flagged with confidence < 0.5
- [ ] Inference traces show reasoning path when applicable
- [ ] Citation validation queries complete within 500ms per citation

### Test Coverage

**Unit Tests**:
- [ ] AnswerSchemas validate structure
- [ ] CitationValidator handles missing entities
- [ ] ReasoningTraceFormatter renders inference paths
- [ ] ConfidenceScorer computes correct scores

**Integration Tests**:
- [ ] GroundedAnswerGenerator produces valid citations
- [ ] Citation validation queries SPARQL endpoint
- [ ] Inferred relationships trigger reasoning trace generation
- [ ] End-to-end: Query → Answer → Validated citations

### Edge Cases

- [ ] Answer with no citations (low confidence, explicit flag)
- [ ] Citations referencing non-existent entities (confidence 0.0)
- [ ] Multiple inference paths to same conclusion (use highest confidence)
- [ ] Circular reasoning prevention (max inference depth limit)

## Validation Flow

```
User Query
  |
  v
Graph Retrieval (Phase 1)
  |
  v
Context Assembly
  |
  v
LLM Prompt with Citation Requirements
  |
  v
LLM Response (raw with citation markers)
  |
  v
Parse Citations
  |
  +-- Entity Validation (SPARQL)
  |     |
  |     +-- Exact match → confidence 1.0
  |     +-- Fuzzy match → confidence 0.5-0.9
  |     +-- Not found → confidence 0.0
  |
  +-- Relation Validation (SPARQL)
  |     |
  |     +-- Direct relation → confidence 1.0
  |     +-- Inferred relation → Reasoner lookup
  |           |
  |           +-- Generate reasoning trace
  |           +-- Confidence = 1.0 - (0.1 * depth)
  |
  v
Confidence Propagation
  |
  +-- Citation confidence = min(entity, relation)
  +-- Answer confidence = weighted_avg(citations)
  |
  v
Grounded Answer with Traces
```

## Dependencies

### External Packages

- `@beep/knowledge-domain` (EntityId, RelationId types)
- `@beep/knowledge-server` (SPARQL client, Reasoner)
- `@beep/shared-openai` (OpenAI client)
- `effect` (Effect, Layer, Schema)

### Phase 1 Prerequisites

**MUST COMPLETE FIRST**:
- Phase 1.1 SPARQL Integration → Required for citation validation queries
- Phase 1.2 Reasoning Engine → Required for inference trace generation

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Citation parsing ambiguity | M | Strict citation format in prompts |
| SPARQL query latency | M | Batch validation queries, add timeouts |
| Inference depth explosion | L | Max depth limit (default: 5 hops) |
| Confidence calibration | M | A/B test scoring weights with real queries |

## Open Questions

1. **Citation format**: Should citations be inline markers or footnotes?
   - **Recommendation**: Inline markers (easier parsing, better context)

2. **Confidence thresholds**: What confidence score warrants flagging?
   - **Recommendation**: < 0.5 = flag, < 0.3 = exclude from answer

3. **Reasoning trace verbosity**: Full inference steps or summary?
   - **Recommendation**: Summary by default, full trace in debug mode

4. **Multi-hop citation chains**: How to present A→B→C citation chains?
   - **Recommendation**: Flatten to A→C with reasoning trace showing intermediate steps
