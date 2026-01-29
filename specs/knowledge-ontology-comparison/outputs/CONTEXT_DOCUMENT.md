# Implementation Context Document

> This document will be populated by the comparison agent.
> See AGENT_PROMPT.md for instructions.

## Status: PENDING

---

## Expected Contents

This document will provide comprehensive context for implementing the missing knowledge graph capabilities:

1. **Architecture Overview**
   - effect-ontology architecture
   - knowledge-slice architecture
   - Comparison diagrams

2. **Key Design Decisions**
   - Technology choices needed
   - Pattern selections
   - Trade-off analyses

3. **Technical Deep Dives**
   - Complex capability analyses
   - Implementation strategies
   - Code examples

4. **Migration Strategy**
   - How to evolve from current to target
   - Breaking changes to manage
   - Backward compatibility considerations

5. **Testing Strategy**
   - How to validate implementation
   - Test patterns to follow
   - Coverage targets

6. **Open Questions**
   - Unresolved decisions
   - Areas needing more research
   - Stakeholder input needed

---

## Template

When populated, this document will follow this structure:

```markdown
## Purpose

This document provides comprehensive context for a future implementation specification that will close the gaps identified between effect-ontology and the knowledge slice.

Target audience: Implementation spec authors and implementing agents.

---

## Architecture Overview

### effect-ontology Architecture

```
[ASCII diagram of effect-ontology structure]
```

Key characteristics:
- 60+ granular services
- @effect/workflow for durability
- Oxigraph WASM for SPARQL
- N3.js for RDF parsing

### knowledge-slice Architecture

```
[ASCII diagram of knowledge-slice structure]
```

Key characteristics:
- 5-package vertical slice
- Custom extraction pipeline
- pgvector for embeddings
- N3.js for Turtle parsing

### Architecture Comparison

| Aspect | effect-ontology | knowledge-slice | Gap |
|--------|-----------------|-----------------|-----|
| Service granularity | Fine (60+) | Coarse (~10) | Refactor |
| Workflow durability | @effect/workflow | None | Add |
| Query language | SPARQL | SQL only | Add |
| ... | ... | ... | ... |

---

## Key Design Decisions

### Decision 1: [Topic]

**Question**: What approach should we take for X?

**Options**:
1. Option A
   - Pros: ...
   - Cons: ...
2. Option B
   - Pros: ...
   - Cons: ...

**Recommendation**: Option [A/B] because...

**Open for discussion**: Yes/No

---

## Technical Deep Dives

### [Complex Capability]

**What it does**: Detailed explanation

**effect-ontology Implementation**:
```typescript
// Key code patterns from effect-ontology
```

**Recommended Approach for knowledge-slice**:
```typescript
// How to implement in @beep patterns
```

**Key Challenges**:
1. Challenge 1
2. Challenge 2

**Dependencies**:
- Needs X first
- Works with Y

---

## Migration Strategy

### Phase 1: Non-Breaking Changes

[Changes that can be made without breaking existing functionality]

### Phase 2: Breaking Changes

[Changes that require migration]

### Phase 3: Cleanup

[Removal of deprecated code]

---

## Testing Strategy

### Unit Testing

- Use @beep/testkit
- Mock LanguageModel for LLM tests
- Test each service in isolation

### Integration Testing

- Test service composition
- Test database operations
- Test RPC contracts

### End-to-End Testing

- Test full extraction pipeline
- Test GraphRAG queries
- Test UI components

### Coverage Targets

| Package | Target |
|---------|--------|
| @beep/knowledge-domain | 90% |
| @beep/knowledge-server | 80% |
| @beep/knowledge-client | 70% |

---

## Open Questions

### Technical Questions

1. **Question**: [Question text]
   - Context: Why this matters
   - Options: What we're considering
   - Decision needed by: [Phase]

### Business Questions

1. **Question**: [Question text]
   - Context: Why this matters
   - Stakeholder: Who needs to answer

### Research Questions

1. **Question**: [Question text]
   - What we need to learn
   - How to research it
```

---

## Completion Criteria

This document is complete when:
- [ ] Both architectures documented with diagrams
- [ ] All key design decisions identified
- [ ] Technical deep dives for L/XL items
- [ ] Migration strategy covers all breaking changes
- [ ] Testing strategy is comprehensive
- [ ] Open questions documented with owners
