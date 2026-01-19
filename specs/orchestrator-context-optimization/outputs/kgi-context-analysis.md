# Knowledge-Graph-Integration Context Analysis

> Analysis of context exhaustion patterns in the knowledge-graph-integration spec.

**Generated**: 2026-01-18
**Source**: `specs/knowledge-graph-integration/`

---

## Spec Overview

| Attribute | Value |
|-----------|-------|
| Spec name | knowledge-graph-integration |
| Complexity | Complex (4+ sessions) |
| Phases planned | 4+ |
| Current status | Active development |

---

## Phase Size Analysis

### MASTER_ORCHESTRATION.md Review

| Phase | Work Items | Assessment |
|-------|------------|------------|
| P0: Foundation | 6 items | ACCEPTABLE (within limit) |
| P1: Schema & Domain | 8 items | OVERSIZED (should split) |
| P2: Extraction Pipeline | 10 items | OVERSIZED (must split) |
| P3: Integration | 7 items | AT LIMIT (acceptable) |

**Finding**: Phases P1 and P2 exceed the recommended 7-item limit, indicating context exhaustion risk.

---

### Detailed Phase Breakdown

#### Phase 0: Foundation

```
Work items:
1. Research existing patterns
2. Define ontology schema
3. Create entity models
4. Create relation models
5. Set up tables
6. Create repositories
```

- **Count**: 6 items
- **Classification**: 4 Medium, 2 Large
- **Context risk**: Moderate
- **Assessment**: ACCEPTABLE but tight

---

#### Phase 1: Schema & Domain

```
Work items:
1. Entity schema
2. Relation schema
3. Mention schema
4. Extraction schema
5. Domain model validation
6. Repository implementation
7. Unit tests
8. Integration tests
```

- **Count**: 8 items
- **Classification**: 3 Small, 3 Medium, 2 Large
- **Context risk**: HIGH
- **Assessment**: OVERSIZED - should split into P1a (schemas) and P1b (implementation)

**Recommended Split**:
- P1a: Schemas (items 1-4, verify)
- P1b: Implementation (items 5-8)

---

#### Phase 2: Extraction Pipeline

```
Work items:
1. NLP chunking service
2. Mention extraction service
3. Entity extraction service
4. Relation extraction service
5. Grounder service
6. Pipeline orchestration
7. Error handling
8. Unit tests
9. Integration tests
10. Performance optimization
```

- **Count**: 10 items
- **Classification**: 2 Small, 4 Medium, 4 Large
- **Context risk**: CRITICAL
- **Assessment**: MUST SPLIT - 10 items is 43% over limit

**Recommended Split**:
- P2a: Core extraction (NLP, mention, entity) + tests
- P2b: Advanced extraction (relation, grounder) + tests
- P2c: Pipeline & optimization

---

## Delegation Pattern Analysis

### P0 Orchestrator Prompt Analysis

**Delegation instructions found**:
- "Use codebase-researcher for pattern exploration" ✓
- "Delegate schema design to effect-schema-expert" ✓

**Direct work instructions found**:
- "Review existing domain models" (should delegate)
- "Analyze table structures" (should delegate)
- "Document findings" (should delegate to doc-writer)

**Assessment**: PARTIAL delegation - some tasks still done directly.

---

### Anti-Patterns Identified

#### Anti-Pattern 1: Inline Research

**Evidence** (from orchestrator prompts):
```
"Review existing table patterns in packages/shared/tables/"
"Analyze the entity relationship structure"
```

**Problem**: These instructions lead to orchestrator doing sequential file reads.

**Impact**: Estimated 2000+ tokens consumed on research that could be delegated.

---

#### Anti-Pattern 2: Unbounded Phase Scope

**Evidence**:
- Phase 2 has 10 work items
- No split triggers defined
- No checkpoint guidance mid-phase

**Problem**: Phases sized by feature scope, not context budget.

**Impact**: High probability of context exhaustion in Phase 2.

---

#### Anti-Pattern 3: Reactive Checkpointing

**Evidence**:
- Checkpoint instructions only at phase end
- No Yellow Zone triggers
- No mid-phase checkpoint template

**Problem**: Checkpoints come too late to preserve context quality.

**Impact**: Rushed, incomplete handoffs when context pressure hits.

---

## Context Exhaustion Incidents

### Estimated Incidents

Based on phase sizing and delegation patterns:

| Phase | Estimated Tool Calls | Risk Level |
|-------|---------------------|------------|
| P0 | 15-25 | Moderate |
| P1 | 30-40 | High |
| P2 | 50-70 | Critical |
| P3 | 20-30 | Moderate |

**Prediction**: Phase 2 has ~80% probability of context exhaustion without intervention.

---

## Root Cause Analysis

### Primary Causes

1. **No phase size limits** - Phases defined by feature scope
2. **Optional delegation** - Agents suggested but not required
3. **Missing context budget** - No tracking mechanism
4. **End-only checkpoints** - No mid-phase triggers

### Contributing Factors

1. Large spec scope (knowledge graph is complex domain)
2. Multiple interconnected components
3. Research-heavy discovery phase
4. Test requirements add items

---

## Recommendations

### Immediate Actions for KGI Spec

1. **Split Phase 1**: P1a (schemas), P1b (implementation)
2. **Split Phase 2**: P2a (core), P2b (advanced), P2c (pipeline)
3. **Add checkpoint triggers**: Every 15 tool calls
4. **Mandate delegation**: No inline research

### Systemic Improvements

1. **Update SPEC_CREATION_GUIDE** with phase size limits
2. **Add context budget protocol** to HANDOFF_STANDARDS
3. **Create orchestrator template** with delegation matrix
4. **Add spec-reviewer check** for phase sizing

---

## Lessons for This Spec

1. **Phase sizing is critical**: KGI phases are too large; this spec must enforce limits
2. **Delegation must be mandatory**: Optional delegation leads to inconsistent usage
3. **Checkpoint triggers save context**: Proactive checkpointing prevents rushed handoffs
4. **Complex domains need more splits**: The more complex the domain, the smaller the phases

---

## Baseline Metrics

From KGI spec analysis:

| Metric | Baseline | Target |
|--------|----------|--------|
| Delegation compliance | ~40% | > 90% |
| Phases within limit | 50% | 100% |
| Checkpoint triggers defined | 0% | 100% |
| Context exhaustion rate | ~40% | < 5% |

These baselines inform the success criteria for the orchestrator context optimization spec.
