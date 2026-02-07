# Knowledge Ontology Comparison Agent

> Copy-paste this prompt to launch the comparison agent.

---

## Prompt

You are tasked with creating a comprehensive comparison between the reference implementation (`tmp/effect-ontology`) and the current implementation (`packages/knowledge/*`).

### Your Mission

Create four deliverables in `specs/knowledge-ontology-comparison/outputs/`:

1. **COMPARISON_MATRIX.md** - Feature-by-feature comparison table
2. **GAP_ANALYSIS.md** - Prioritized gaps with complexity estimates
3. **IMPLEMENTATION_ROADMAP.md** - Phased implementation plan
4. **CONTEXT_DOCUMENT.md** - Full context for future implementation spec

### Context

**Reference Implementation** (`tmp/effect-ontology`):
- 60+ Effect services for knowledge graph operations
- SPARQL support via Oxigraph WASM backend
- RDFS forward-chaining reasoning engine
- SHACL shape-based validation
- Two-tier entity resolution (MentionRecord -> ResolvedEntity)
- @effect/workflow-based durable execution
- Multi-hop GraphRAG retrieval with citations
- Full PROV-O provenance vocabulary support

**Current Implementation** (`packages/knowledge/*`):
- Domain models (Entity, Relation, Ontology, ClassDefinition, PropertyDefinition)
- Database tables with pgvector support
- 6-stage extraction pipeline (Chunk->Mention->Entity->Relation->Ground->Persist)
- Entity clustering via embedding similarity
- GraphRAG with RRF scoring
- N3.js Turtle/RDF-XML parsing
- SKOS vocabulary support

**Known Gaps**:
- @beep/knowledge-client: Only placeholder comments
- @beep/knowledge-ui: Only placeholder comments
- No SPARQL support
- No SHACL validation
- No formal reasoning engine
- No durable workflow orchestration
- Uses custom AiService instead of @effect/ai

---

### Key Comparison Areas

#### 1. Query & Reasoning
Compare these capabilities:
- **SPARQL**: effect-ontology has Oxigraph WASM (`Service/Sparql.ts`)
- **RDFS Reasoning**: Forward-chaining, N3 rules support (`Service/Reasoner.ts`)
- **SHACL Validation**: Shape constraints (`Service/Shacl.ts`)

Questions to answer:
- Does knowledge slice have ANY query capability beyond direct SQL?
- Is there any inference/reasoning support?
- How are constraints validated (if at all)?

#### 2. Entity Resolution
Compare these capabilities:
- **Two-tier Architecture**: MentionRecord nodes -> ResolvedEntity nodes
- **EntityLinker Service**: `getCanonicalId`, `getMentionsForEntity`
- **Cross-batch Resolution**: Linking entities across extraction batches
- **Same-as Links**: Managing entity equivalence

Questions to answer:
- How does knowledge slice handle entity deduplication?
- Is there a canonical entity concept?
- How are cross-document entity links managed?

#### 3. GraphRAG
Compare these capabilities:
- **Multi-hop Retrieval**: N-hop graph traversal
- **Semantic Scoring**: Embedding similarity + graph distance
- **Citation Generation**: Linking answers to source evidence
- **Reasoning Traces**: Explainability for retrieved context

Questions to answer:
- What is the current GraphRAG implementation approach?
- How many hops does traversal support?
- Is there citation/provenance tracking?

#### 4. Workflow Orchestration
Compare these capabilities:
- **Durable Execution**: @effect/workflow-based workflows
- **5-Stage Pipeline**: Pending->Preprocessing->Extracting->Resolving->Validating->Ingesting
- **State Persistence**: PostgreSQL-backed workflow state
- **Checkpointing**: Activity-based crash recovery

Questions to answer:
- How does knowledge slice manage long-running extraction?
- Is there any crash recovery?
- How is batch status tracked?

#### 5. RDF Infrastructure
Compare these capabilities:
- **N3.js + Oxigraph**: Full RDF stack
- **Named Graphs**: Graph-scoped triples
- **PROV-O**: Provenance vocabulary
- **Turtle Serialization**: RDF format support

Questions to answer:
- What RDF formats are supported?
- Is there named graph support?
- How is provenance tracked?

#### 6. Service Architecture
Compare these patterns:
- **Service Decomposition**: Granular vs monolithic services
- **Layer Composition**: How services are wired together
- **Error Handling**: TaggedError usage patterns
- **Testing Patterns**: How services are tested

Questions to answer:
- How granular are knowledge slice services?
- Are Effect patterns consistently applied?
- What's the test coverage like?

---

### Approach

#### Step 1: Catalog effect-ontology (30% of effort)

Read thoroughly, focusing on:
```
tmp/effect-ontology/packages/@core-v2/src/
  Service/*.ts      # All service definitions
  Domain/Model/*.ts # Data models and schemas
  Workflow/*.ts     # Batch processing
  Repository/*.ts   # Data access
```

For each service, document:
- Service name and Context.Tag
- Public API methods with signatures
- Dependencies (internal and external)
- Effect patterns used

#### Step 2: Audit knowledge slice (30% of effort)

Read thoroughly, all packages:
```
packages/knowledge/
  domain/src/       # Models and schemas
  tables/src/       # Database definitions
  server/src/       # Service implementations
  client/src/       # RPC contracts (likely placeholder)
  ui/src/           # Components (likely placeholder)
```

For each component, document:
- Implementation status
- Corresponding effect-ontology capability
- Implementation approach differences

#### Step 3: Create comparison matrix (20% of effort)

For every capability found in effect-ontology:

| Capability | effect-ontology | knowledge-slice | Gap Type | Priority | Complexity |
|------------|-----------------|-----------------|----------|----------|------------|
| SPARQL queries | Service/Sparql.ts | Missing | Missing | P1 | L |
| Entity extraction | Service/EntityExtraction.ts | server/Extraction/*.ts | Partial | P0 | M |

Gap Types:
- **Missing**: Not implemented at all
- **Partial**: Some functionality present
- **Different**: Alternative approach taken
- **Equivalent**: Same capability

Priority:
- **P0**: Critical for core functionality
- **P1**: Important for production use
- **P2**: Nice to have
- **P3**: Future consideration

Complexity:
- **S**: 1-2 days (single service, clear pattern)
- **M**: 3-5 days (multiple services, some research)
- **L**: 1-2 weeks (new subsystem)
- **XL**: 2+ weeks (major architectural change)

#### Step 4: Create roadmap (20% of effort)

Group gaps into phases:

**Phase A: Foundation**
- Prerequisites for other work
- Schema/infrastructure changes
- Core abstractions

**Phase B: Core Capabilities**
- Must-have for MVP
- User-facing functionality
- Blocking other features

**Phase C: Advanced Features**
- Production-ready polish
- Performance optimization
- Advanced queries

**Phase D: Optimization**
- Scale/performance
- Distributed execution
- Future enhancements

For each phase, estimate:
- Duration (weeks)
- Dependencies (what must come first)
- Risk factors (what could go wrong)
- Success criteria (how to verify completion)

---

### Output Format

Use markdown tables extensively. Include specific file paths for EVERY comparison point.

#### COMPARISON_MATRIX.md Structure

```markdown
# Comparison Matrix

## Summary Statistics

| Metric | Count |
|--------|-------|
| Total Capabilities | X |
| Equivalent | X |
| Partial | X |
| Different | X |
| Missing | X |

## Query & Reasoning

| Capability | effect-ontology | knowledge-slice | Gap | Priority | Complexity |
|------------|-----------------|-----------------|-----|----------|------------|
| ... | ... | ... | ... | ... | ... |

## Entity Resolution
...

## GraphRAG
...

## Workflow Orchestration
...

## RDF Infrastructure
...

## Service Architecture
...
```

#### GAP_ANALYSIS.md Structure

```markdown
# Gap Analysis

## Executive Summary

[2-3 paragraph overview of findings]

## P0 Gaps (Critical)

### [Gap Name]
- **Description**: What's missing
- **effect-ontology**: File references
- **Impact**: Why this matters
- **Complexity**: S/M/L/XL with rationale
- **Dependencies**: What must come first

## P1 Gaps (Important)
...

## P2 Gaps (Nice to Have)
...

## P3 Gaps (Future)
...
```

#### IMPLEMENTATION_ROADMAP.md Structure

```markdown
# Implementation Roadmap

## Timeline Overview

| Phase | Name | Duration | Dependencies |
|-------|------|----------|--------------|
| A | Foundation | X weeks | None |
| B | Core Capabilities | X weeks | Phase A |
| C | Advanced Features | X weeks | Phase B |
| D | Optimization | X weeks | Phase C |

## Phase A: Foundation

### Goals
...

### Work Items
| Item | Priority | Complexity | Estimate |
|------|----------|------------|----------|
| ... | ... | ... | ... |

### Risks
...

### Success Criteria
...

## Phase B: Core Capabilities
...
```

#### CONTEXT_DOCUMENT.md Structure

```markdown
# Implementation Context Document

## Purpose

This document provides comprehensive context for implementing the missing knowledge graph capabilities.

## Architecture Overview

[Diagrams and descriptions of both systems]

## Key Design Decisions

[What choices need to be made]

## Technical Deep Dives

[Detailed analysis of complex areas]

## Migration Strategy

[How to move from current to target state]

## Testing Strategy

[How to validate the implementation]

## Open Questions

[What still needs to be resolved]
```

---

### Critical Reminders

1. **Be Thorough**: This comparison prepares for FULL implementation. Miss nothing.

2. **Cite Evidence**: Every gap must reference specific files in both codebases.

3. **Be Realistic**: Complexity estimates should account for:
   - Effect pattern compliance
   - Test coverage requirements
   - Documentation needs
   - Integration with existing @beep packages

4. **Consider Domain Fit**: Some effect-ontology features may not apply to the wealth management domain. Flag these as P3.

5. **Check Existing Solutions**: Before marking something as "Missing", verify it's not already in:
   - `@beep/shared-*` packages
   - `@beep/common-*` packages
   - Other vertical slices

---

### Reference Documents

Read these before starting:
- `specs/knowledge-ontology-comparison/README.md`
- `specs/knowledge-ontology-comparison/COMPARISON_INSTRUCTIONS.md`
- `specs/knowledge-graph-integration/README.md` (original spec)
- `specs/knowledge-completion/README.md` (current state)
- `.claude/rules/effect-patterns.md` (mandatory patterns)

---

### Verification

Before completing, verify:
- [ ] All services in `Service/*.ts` cataloged
- [ ] All packages in `packages/knowledge/` audited
- [ ] Every gap has priority AND complexity
- [ ] Roadmap phases are logically ordered
- [ ] No capability left unclassified
- [ ] File paths are accurate (verify with Glob/Read)
