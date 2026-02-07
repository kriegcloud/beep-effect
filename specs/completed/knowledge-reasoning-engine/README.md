# Knowledge Reasoning Engine

> RDFS reasoning and SHACL validation services for semantic knowledge graph inference.

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

## Quick Navigation

| Document | Purpose | Target Audience |
|----------|---------|-----------------|
| **[README.md](README.md)** (this file) | Spec overview | All contributors |
| **[REFLECTION_LOG.md](REFLECTION_LOG.md)** | Lessons learned | Future iterations |
| **[handoffs/HANDOFF_P1.md](handoffs/HANDOFF_P1.md)** | Phase 1 context | Phase 1 orchestrator |
| **[handoffs/P1_ORCHESTRATOR_PROMPT.md](handoffs/P1_ORCHESTRATOR_PROMPT.md)** | Phase 1 launch prompt | Copy-paste ready |

---

## Overview

This specification guides the implementation of RDFS reasoning and SHACL validation services for the knowledge graph system. The reasoning engine enables semantic inference over ontology-based knowledge graphs, deriving implicit facts from explicit data and validating graph structure against shape constraints.

### Purpose

Enable semantic reasoning capabilities:
- RDFS forward-chaining inference (subclass/subproperty entailment)
- SHACL constraint validation without full materialization
- Inference result caching for performance optimization
- N3 rules engine (optional, future extension)

### Location

```
packages/knowledge/domain/src/value-objects/reasoning/
  index.ts, InferenceResult.ts, ReasoningProfile.ts

packages/knowledge/server/src/Reasoning/
  index.ts, ReasonerService.ts, RdfsRules.ts, OwlRlRules.ts, InferenceCache.ts

packages/knowledge/server/src/Validation/
  index.ts, ShaclService.ts, ShaclParser.ts, ValidationReport.ts
```

### Current State

The RDF foundation (Phase 0) is **PLANNED**. This spec builds on:
- `RdfStore` service from `@beep/knowledge-server` (stores triples)
- N3.js for RDF parsing and graph operations
- Ontology service for schema retrieval

This spec implements:
- RDFS reasoner for semantic inference
- SHACL validator for constraint checking
- Caching layer for inference results

---

## Complexity Assessment

```
Phase Count:       3 phases    x 2 =  6
Agent Diversity:   4 agents    x 3 = 12
Cross-Package:     1 (knowledge) x 4 = 4
External Deps:     1 (N3.js)   x 3 =  3
Uncertainty:       3 (medium)  x 5 = 15
Research Required: 3 (moderate) x 2 = 6
----------------------------------------
Total Score:                      46 -> High Complexity
```

**Recommendation:** Use orchestration structure with per-phase handoffs and REFLECTION_LOG entries.

---

## Related Specs

| Spec | Status | Relationship |
|------|--------|--------------|
| `specs/knowledge-rdf-foundation/` | PLANNED | **Predecessor** - RdfStore required |
| `specs/knowledge-architecture-foundation/` | PLANNED | Package allocation patterns |
| `specs/knowledge-sparql-integration/` | PLANNED | Parallel track - query layer |
| `specs/knowledge-graphrag-plus/` | PLANNED | **Successor** - Uses inference traces |

---

## Goals and Non-Goals

### Goals

1. **RDFS Reasoning**: Derive implicit facts from explicit triples using RDFS semantics
2. **SHACL Validation**: Validate graph structure against shape constraints without full materialization
3. **Performance Optimization**: Cache inference results to avoid redundant computation
4. **Reasoning Profiles**: Configurable rule sets (RDFS-only, OWL-RL subset, custom)

### Non-Goals

- Full OWL 2 DL reasoning (computationally expensive, not needed for MVP)
- N3 rules engine (deferred to P3 as optional extension)
- Real-time inference updates (batch processing sufficient for MVP)
- Custom rule language (SHACL and RDFS cover most use cases)

---

## Deliverables

| Component | Package | Priority | Complexity | Estimate |
|-----------|---------|----------|------------|----------|
| **Phase 1: RDFS Reasoner** |
| RDFS rule definitions | `@beep/knowledge-server` | P1 | L | 2 days |
| Forward-chaining engine | `@beep/knowledge-server` | P1 | L | 2 days |
| ReasonerService interface | `@beep/knowledge-server` | P1 | M | 1 day |
| **Phase 2: SHACL Validation** |
| SHACL parser (shapes from Turtle) | `@beep/knowledge-server` | P1 | L | 2 days |
| Re-SHACL validator | `@beep/knowledge-server` | P1 | L | 2 days |
| ValidationReport model | `@beep/knowledge-domain` | P1 | M | 1 day |
| **Phase 3: Optimization** |
| InferenceCache service | `@beep/knowledge-server` | P2 | M | 2 days |
| Reasoning depth limits | `@beep/knowledge-server` | P2 | S | 1 day |
| N3 rules engine (optional) | `@beep/knowledge-server` | P3 | XL | 5 days |

**Total Estimate:** 6 days (P1 components), 3 additional days for P2 caching, 5 days for P3 N3 engine.

---

## Phase Overview

### Phase 1: RDFS Forward-Chaining Reasoner

**Goal:** Implement RDFS reasoning to derive implicit facts from explicit triples.

**Tasks:**
1. Define RDFS rule set (rdfs:subClassOf, rdfs:subPropertyOf, rdfs:domain, rdfs:range)
2. Implement forward-chaining inference algorithm
3. Create `ReasonerService` interface and Layer
4. Add reasoning depth limits to prevent infinite loops
5. Test with sample ontology and data

**Verification:**
```bash
bun run check --filter @beep/knowledge-server
bun run test --filter @beep/knowledge-server
```

**Success Criteria:**
- [ ] RDFS subclass reasoning produces correct inferences
- [ ] RDFS subproperty reasoning works
- [ ] Domain/range constraints enforced
- [ ] Depth limits prevent infinite loops
- [ ] Test coverage ≥80% for reasoning module

### Phase 2: SHACL Validation Service

**Goal:** Validate RDF graphs against SHACL shape constraints without full materialization.

**Tasks:**
1. Parse SHACL shapes from Turtle syntax
2. Implement Re-SHACL validation (selective materialization)
3. Create `ValidationReport` model with violation details
4. Integrate with `ReasonerService` for constraint checking
5. Test with sample shapes and violation scenarios

**Verification:**
```bash
bun run check --filter @beep/knowledge-domain
bun run check --filter @beep/knowledge-server
bun run test --filter @beep/knowledge-server
```

**Success Criteria:**
- [ ] SHACL parser handles common shape types (NodeShape, PropertyShape)
- [ ] Validation detects constraint violations correctly
- [ ] ValidationReport provides actionable error messages
- [ ] Re-SHACL avoids full materialization overhead
- [ ] Test coverage ≥80% for validation module

### Phase 3: Caching and Optimization (Optional)

**Goal:** Optimize inference performance through result caching.

**Tasks:**
1. Design cache key strategy (ontology hash + data hash)
2. Implement `InferenceCache` service with TTL
3. Add cache invalidation on data updates
4. Benchmark performance improvements
5. Document cache configuration options

**Verification:**
```bash
bun run check --filter @beep/knowledge-server
bun run test --filter @beep/knowledge-server
```

**Success Criteria:**
- [ ] Cache hit rate ≥70% on repeated queries
- [ ] Inference latency reduced by ≥50% with warm cache
- [ ] Cache invalidation works correctly on updates
- [ ] Memory usage remains within acceptable bounds

---

## Architectural Decisions

### Re-SHACL Pattern

Traditional SHACL validation materializes all inferred triples before checking constraints. This is expensive for large graphs. Re-SHACL derives only the facts needed for validation, reducing memory overhead.

**Implementation Strategy:**
1. Parse SHACL shapes to identify required predicates
2. Run targeted inference (only rules needed for those predicates)
3. Validate against derived facts
4. Report violations without storing full materialization

**Trade-offs:**
- **Pro:** Lower memory footprint, faster validation
- **Con:** More complex implementation than naive materialization
- **Decision:** Re-SHACL pattern justified by performance gains and scalability

### Reasoning Depth Limits

RDFS inference can create infinite loops with cyclic class hierarchies. Enforce maximum reasoning depth to prevent runaway computation.

**Configuration:**
```typescript
export interface ReasoningConfig {
  readonly maxDepth: number;           // Default: 10
  readonly maxInferences: number;      // Default: 10000
  readonly profile: ReasoningProfile;  // RDFS | OWL_RL | CUSTOM
}
```

### Forward-Chaining vs. Backward-Chaining

**Decision:** Use forward-chaining for RDFS reasoning.

**Rationale:**
- Forward-chaining pre-computes all inferences, enabling fast query response
- Backward-chaining requires inference at query time, adding latency
- Knowledge graphs change infrequently, making forward-chaining efficient

**Trade-off:** Higher memory usage, but acceptable for typical graph sizes.

---

## Success Metrics

### Must-Have Targets

| Metric | Target | Verification | Pass/Fail |
|--------|--------|--------------|-----------|
| **RDFS Correctness** | 100% of test cases pass | Unit tests with known inferences | All pass = PASS |
| **SHACL Coverage** | Supports NodeShape, PropertyShape, cardinality, datatype | Integration tests | All shapes validated = PASS |
| **Performance** | Inference <1s for 10K triples | Benchmark test | <1s = PASS |
| **Depth Limit** | Prevents infinite loops | Test with cyclic hierarchy | Terminates = PASS |
| **TypeScript** | 0 type errors | `bun run check --filter @beep/knowledge-*` | Exit code 0 = PASS |
| **Lint** | 0 lint errors | `bun run lint --filter @beep/knowledge-*` | Exit code 0 = PASS |
| **Test Coverage** | ≥80% line coverage | `bun run test --coverage` | ≥80% = PASS |

### Nice-to-Have Targets

| Metric | Target | Verification | Notes |
|--------|--------|--------------|-------|
| **Cache Hit Rate** | ≥70% on repeated queries | Performance monitoring | Requires Phase 3 |
| **Memory Efficiency** | <100MB for 50K triples | Profiling | Re-SHACL pattern |
| **N3 Rules Support** | Custom rules via N3 syntax | Optional P3 feature | Not required for MVP |

---

## Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **RDF Operations** | N3.js | Triple parsing, graph traversal |
| **Reasoning** | Custom forward-chaining | RDFS rule application |
| **Validation** | Re-SHACL algorithm | Selective materialization |
| **Caching** | Effect Cache | Inference result memoization |
| **Testing** | `@beep/testkit` | Effect-based tests |

---

## Agent Delegation Matrix

| Task Type | Agent | Capability |
|-----------|-------|------------|
| Codebase exploration | `codebase-researcher` | read-only |
| Effect documentation | `mcp-researcher` | read-only |
| Source code writing | `effect-code-writer` | write-files |
| Test writing | `test-writer` | write-files |
| Architecture review | `architecture-pattern-enforcer` | write-reports |

---

## Getting Started

**Start Phase 1 by reading:**

```
specs/knowledge-reasoning-engine/handoffs/HANDOFF_P1.md
```

**Launch Phase 1 execution:**

```
specs/knowledge-reasoning-engine/handoffs/P1_ORCHESTRATOR_PROMPT.md
```

---

## Reference Documentation

- [RDFS Semantics (W3C)](https://www.w3.org/TR/rdf-schema/)
- [SHACL Specification (W3C)](https://www.w3.org/TR/shacl/)
- [N3.js Documentation](https://github.com/rdfjs/N3.js)
- [Effect Patterns](../../.claude/rules/effect-patterns.md)
- [Spec Creation Guide](../_guide/README.md)
