# Wealth Management Domain Expert - Output Rubrics

Scoring criteria for evaluating agent output quality across all phases.

---

## Phase 0: Ontology Design (40% of total)

### Ontology Completeness (15%)

| Score | Criteria |
|-------|----------|
| 5/5 | All Priority 0 + Priority 1 classes defined (12+ classes), all properties have domain/range, cardinality constraints documented |
| 4/5 | All Priority 0 classes (8+), most Priority 1 classes, 15+ properties with domain/range |
| 3/5 | Core classes defined (Client, Account, Investment, Document), 10+ properties |
| 2/5 | Basic classes present but incomplete property definitions |
| 1/5 | Fewer than 4 classes or major gaps in property coverage |

### OWL/RDFS Correctness (10%)

| Score | Criteria |
|-------|----------|
| 5/5 | Valid Turtle syntax, proper IRI structure, correct OWL vocabulary usage, parseable by N3.js |
| 4/5 | Valid syntax, minor vocabulary issues (e.g., missing rdfs:comment on some classes) |
| 3/5 | Parseable but with deprecated patterns or non-standard constructs |
| 2/5 | Syntax errors that require manual fixes |
| 1/5 | Not valid Turtle/OWL format |

### Domain Accuracy (15%)

| Score | Criteria |
|-------|----------|
| 5/5 | All business rules captured, UHNWI-specific requirements addressed, regulatory compliance considered |
| 4/5 | Core business rules present, most UHNWI patterns included |
| 3/5 | Generic wealth management model, missing some domain specifics |
| 2/5 | Too generic, could apply to any domain |
| 1/5 | Incorrect domain modeling, wrong relationships |

---

## Phase 1: Domain Models (25% of total)

### Effect Schema Quality (10%)

| Score | Criteria |
|-------|----------|
| 5/5 | All types use Effect Schema, BS helpers applied correctly, no `any` types, proper namespace imports |
| 4/5 | Mostly Effect Schema, minor BS helper inconsistencies |
| 3/5 | Mix of Effect Schema and manual types, some BS helpers |
| 2/5 | Primarily manual TypeScript interfaces |
| 1/5 | Raw TypeScript interfaces, no validation |

### Pattern Compliance (10%)

| Score | Criteria |
|-------|----------|
| 5/5 | Follows all Effect patterns from `.claude/rules/effect-patterns.md`, namespace imports, branded IDs |
| 4/5 | Mostly compliant, minor pattern deviations |
| 3/5 | Some patterns followed, notable gaps |
| 2/5 | Multiple pattern violations |
| 1/5 | Ignores codebase patterns entirely |

### Multi-Tenant Support (5%)

| Score | Criteria |
|-------|----------|
| 5/5 | All models include organizationId, RLS considerations documented |
| 3/5 | organizationId present but RLS not considered |
| 1/5 | Missing multi-tenant support |

---

## Phase 2: Extraction Pipeline (15% of total)

### Evidence Linking (10%)

| Score | Criteria |
|-------|----------|
| 5/5 | All compliance-critical facts have EvidenceSpan requirements, character-level offsets preserved |
| 4/5 | Most facts have evidence, some gaps in character-level tracking |
| 3/5 | Document-level provenance only, no character offsets |
| 2/5 | Minimal evidence linking |
| 1/5 | No evidence tracking |

### Grounding Implementation (5%)

| Score | Criteria |
|-------|----------|
| 5/5 | Grounding threshold (0.8) applied, hallucination filtering implemented |
| 3/5 | Grounding mentioned but not enforced |
| 1/5 | No grounding or hallucination prevention |

---

## Phase 3: Entity Resolution (10% of total)

### Matching Key Design (5%)

| Score | Criteria |
|-------|----------|
| 5/5 | Primary and fuzzy keys defined for all Priority 0 entities, source priority established |
| 3/5 | Keys defined for some entities, missing source priority |
| 1/5 | No entity resolution design |

### Conflict Resolution (5%)

| Score | Criteria |
|-------|----------|
| 5/5 | Clear conflict resolution rules per attribute type, evidence accumulation strategy |
| 3/5 | Basic conflict resolution, some gaps |
| 1/5 | No conflict resolution strategy |

---

## Phase 4-5: GraphRAG & Agent (10% of total)

### Context Assembly (5%)

| Score | Criteria |
|-------|----------|
| 5/5 | k-NN search + N-hop traversal + RRF scoring implemented |
| 3/5 | Basic search without traversal optimization |
| 1/5 | No context assembly design |

### Evidence Citations (5%)

| Score | Criteria |
|-------|----------|
| 5/5 | Agent responses include source citations with character offsets |
| 3/5 | Document-level citations only |
| 1/5 | No citations in responses |

---

## Cross-Cutting Quality Dimensions

### Documentation Quality

| Score | Criteria |
|-------|----------|
| 5/5 | JSDoc on all exports, README updated, AGENTS.md created, examples provided |
| 4/5 | Most exports documented, minor gaps |
| 3/5 | Basic documentation present |
| 2/5 | Minimal documentation |
| 1/5 | No documentation |

### Test Coverage

| Score | Criteria |
|-------|----------|
| 5/5 | Unit tests for all models, integration tests for extraction, property tests for monoid laws |
| 4/5 | Unit tests present, some integration tests |
| 3/5 | Basic unit tests only |
| 2/5 | Minimal tests |
| 1/5 | No tests |

### Verification Commands

```bash
# Ontology syntax check
bun run scripts/validate-ontology.ts outputs/wealth-management.ttl

# Type check domain models
bun run check --filter @beep/knowledge-domain

# Pattern compliance check
grep -r "import \* as" packages/knowledge/domain/src/*.ts | head -20

# Forbidden pattern check
grep -r "any\|@ts-ignore" packages/knowledge/domain/src/*.ts

# Class count verification
grep -c "owl:Class" specs/agents/wealth-management-domain-expert/outputs/wealth-management.ttl

# Property count verification
grep -c "owl:ObjectProperty\|owl:DatatypeProperty" specs/agents/wealth-management-domain-expert/outputs/wealth-management.ttl
```

---

## Overall Scoring

| Grade | Score Range | Interpretation |
|-------|-------------|----------------|
| A | 90-100% | Production ready, exceeds requirements |
| B | 80-89% | Meets requirements with minor improvements needed |
| C | 70-79% | Functional but needs significant polish |
| D | 60-69% | Partially complete, major gaps |
| F | <60% | Does not meet minimum requirements |

### Minimum Acceptance Criteria

To pass review, output must achieve:
- **Phase 0**: ≥80% (Ontology is foundation for all phases)
- **Phases 1-5**: ≥70% each
- **Cross-cutting**: ≥70%
- **No category below**: 50%

---

## Reviewer Checklist

### Phase 0 Acceptance

- [ ] Ontology parses without syntax errors (`bun run scripts/validate-ontology.ts`)
- [ ] At least 8 classes defined (4 Priority 0 + 4 Priority 1)
- [ ] At least 15 properties defined (9 object + 6 datatype)
- [ ] Cardinality constraints for: ownsAccount, heldByCustodian, establishedBy
- [ ] Evidence requirements documented for 6 compliance-critical facts
- [ ] Entity resolution keys defined for: Client, Account, Trust, Investment
- [ ] Class hierarchy visualization generated

### Phase 1 Acceptance

- [ ] All models use Effect Schema (`S.Class` pattern)
- [ ] Branded IDs via `EntityId.builder` pattern
- [ ] organizationId on all models
- [ ] BS helpers used appropriately
- [ ] No `any` or `@ts-ignore`

### Phase 2-5 Acceptance

- [ ] EvidenceSpan tracked through pipeline
- [ ] Grounding threshold enforced
- [ ] Entity resolution keys implemented
- [ ] GraphRAG context assembly designed
- [ ] Agent citations include evidence spans
