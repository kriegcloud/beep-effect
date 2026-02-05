# Rubrics: Knowledge vs Effect-Ontology Audit

> Scoring criteria for consistent assessment across the audit.

---

## Gap Type Scoring

### Definition Matrix

| Gap Type | Score | Criteria | Example |
|----------|-------|----------|---------|
| **None** | 5/5 | Feature parity achieved. Same functionality, same patterns. | EntityExtractor exists in both with same API |
| **Partial** | 3/5 | Functionality exists but incomplete. Missing fields, methods, or edge cases. | Entity model exists but missing version field |
| **Missing** | 1/5 | No equivalent implementation. Must be built from scratch. | CircuitBreaker doesn't exist in beep-effect |
| **Different** | 2/5 | Different approach taken. May need evaluation for alignment. | Different error handling strategy |

### Gap Type Decision Tree

```
Does equivalent exist in beep-effect?
├── No → Missing (1/5)
└── Yes → Compare implementations
    ├── Same API, same behavior → None (5/5)
    ├── Same purpose, different API → Different (2/5)
    └── Same API, missing features → Partial (3/5)
```

---

## Priority Scoring

### Priority Levels

| Priority | Impact | Criteria | Timeline |
|----------|--------|----------|----------|
| **P0** | Critical | Blocks core functionality. Production cannot ship without it. | Immediate |
| **P1** | High | Required for production quality. Significant user impact. | Next sprint |
| **P2** | Medium | Improves experience. Nice to have for launch. | Quarter |
| **P3** | Low | Future consideration. Not blocking. | Backlog |

### Priority Decision Matrix

| Question | Yes → Higher Priority | No → Lower Priority |
|----------|----------------------|---------------------|
| Does it block extraction pipeline? | P0 | - |
| Is it required for compliance (FINRA/SEC)? | P0-P1 | - |
| Does it affect data durability? | P0-P1 | - |
| Does it improve advisor experience? | P1-P2 | P2-P3 |
| Is it an optimization? | P2-P3 | P3 |

---

## Effort Estimation

### Size Categories

| Size | Developer Days | Criteria |
|------|----------------|----------|
| **S** | 1-2 days | Single file change, clear pattern to follow |
| **M** | 3-5 days | Multiple files, some research needed |
| **L** | 1-2 weeks | New service/module, significant testing |
| **XL** | 2-4 weeks | Major feature, cross-cutting changes |

### Effort Estimation Factors

```
Effort = Base + Complexity + Integration + Testing

Base:
- Copy pattern from effect-ontology: S
- Adapt pattern for domain: M
- Build new capability: L-XL

Complexity:
- Single service: +0
- Multiple services: +1 size
- Cross-package: +1 size

Integration:
- No dependencies: +0
- Internal dependencies: +0
- External dependencies: +1 size

Testing:
- Unit tests only: +0
- Integration tests: +1 size
- E2E tests: +2 sizes (capped at XL)
```

---

## Category Completeness

### Inventory Completeness Score

| Score | Criteria |
|-------|----------|
| 5/5 | All files documented, all fields populated |
| 4/5 | All files documented, minor gaps in fields |
| 3/5 | 90%+ files documented |
| 2/5 | 75-89% files documented |
| 1/5 | <75% files documented |

### Categorization Quality Score

| Score | Criteria |
|-------|----------|
| 5/5 | All files categorized, integration points complete, no overlaps |
| 4/5 | All files categorized, minor integration gaps |
| 3/5 | All files categorized, integration points incomplete |
| 2/5 | Some files uncategorized |
| 1/5 | Major categorization gaps |

---

## Pattern Quality

### Pattern Documentation Score

| Score | Criteria |
|-------|----------|
| 5/5 | Code example, file reference, applicability assessment, variations noted |
| 4/5 | Code example, file reference, applicability assessment |
| 3/5 | Code example, file reference |
| 2/5 | Code example only |
| 1/5 | Description only, no code |

### Pattern Applicability Assessment

| Assessment | Criteria |
|------------|----------|
| **Direct Adoption** | Can copy pattern with minimal changes |
| **Adaptation Required** | Pattern applies but needs domain-specific modifications |
| **Partial Adoption** | Some aspects apply, others don't |
| **Not Applicable** | Pattern doesn't fit beep-effect architecture |

---

## Spec Quality

### Spec Definition Score

| Score | Criteria |
|-------|----------|
| 5/5 | Clear purpose, defined scope, file list, success criteria, references |
| 4/5 | Missing one element |
| 3/5 | Missing two elements |
| 2/5 | Missing three elements |
| 1/5 | Only purpose defined |

### Spec Dependency Accuracy

| Score | Criteria |
|-------|----------|
| 5/5 | All dependencies identified, correct ordering, no cycles |
| 4/5 | All dependencies identified, minor ordering issues |
| 3/5 | Most dependencies identified |
| 2/5 | Significant dependencies missing |
| 1/5 | No dependency analysis |

---

## Domain Adaptation

### Wealth Management Alignment Score

| Score | Criteria |
|-------|----------|
| 5/5 | Entity mappings complete, compliance addressed, integration patterns documented |
| 4/5 | Missing one domain element |
| 3/5 | Missing two domain elements |
| 2/5 | Missing three domain elements |
| 1/5 | No domain adaptation |

### Compliance Coverage Score

| Score | Criteria |
|-------|----------|
| 5/5 | FINRA/SEC, fiduciary duty, audit trails all addressed |
| 4/5 | Two of three compliance areas addressed |
| 3/5 | One compliance area addressed |
| 2/5 | Compliance mentioned but not detailed |
| 1/5 | No compliance consideration |

---

## Overall Audit Quality

### Deliverable Checklist

| Deliverable | Required Score | Weight |
|-------------|----------------|--------|
| EFFECT_ONTOLOGY_INVENTORY.md | ≥4/5 | 20% |
| CAPABILITY_CATEGORIES.md | ≥4/5 | 15% |
| GAP_ANALYSIS.md | ≥4/5 | 25% |
| TECHNOLOGY_ALIGNMENT.md | ≥3/5 | 10% |
| PATTERN_CATALOG.md | ≥4/5 | 15% |
| SPEC_ROADMAP.md | ≥4/5 | 10% |
| SPEC_DEFINITIONS.md | ≥4/5 | 5% |

### Audit Completion Gate

```
Audit Complete :=
  ∀ deliverable ∈ Deliverables: score(deliverable) ≥ required
  ∧ no "Unknown" in GAP_ANALYSIS.md
  ∧ no placeholders in any deliverable
  ∧ REFLECTION_LOG.md has entries for all phases
```

---

## Scoring Examples

### Example 1: CircuitBreaker Gap

```
Capability: CircuitBreaker
effect-ontology: ✓ Full (Service/Resilience/CircuitBreaker.ts)
beep-effect: ✗ None

Gap Type: Missing (1/5)
Priority: P1 (Required for production resilience)
Effort: M (Pattern exists, need to implement)
```

### Example 2: Entity Model Gap

```
Capability: Entity Model
effect-ontology: ✓ Full (Domain/Model/Entity.ts)
beep-effect: ✓ Partial (domain/src/entities/entity.model.ts)

Gap Type: Partial (3/5)
Priority: P1 (Core functionality)
Effort: S (Add missing fields)
Notes: Missing version field, need to add optional metadata
```

### Example 3: EventBridge Gap

```
Capability: EventBridge
effect-ontology: ✓ Full (Service/Event/EventBridge.ts)
beep-effect: ✗ None

Gap Type: Missing (1/5)
Priority: P2 (Not blocking, improves observability)
Effort: L (New service with multiple integration points)
```

---

## Anti-Pattern Detection

### Inventory Anti-Patterns

| Anti-Pattern | Detection | Remediation |
|--------------|-----------|-------------|
| Placeholder purpose | "TODO" or "..." in purpose field | Read file and document actual purpose |
| Missing imports | Empty Effect Packages column | Re-read file for import statements |
| Guessed exports | Exports don't match file content | Verify against actual file |

### Gap Analysis Anti-Patterns

| Anti-Pattern | Detection | Remediation |
|--------------|-----------|-------------|
| Unknown gap type | "Unknown" in Gap Type column | Research both implementations |
| Missing priority | Empty Priority column | Apply priority decision matrix |
| Name-only matching | Same name assumed equivalent | Compare actual implementations |

### Spec Definition Anti-Patterns

| Anti-Pattern | Detection | Remediation |
|--------------|-----------|-------------|
| Vague scope | "Implement X" without details | Add file list and success criteria |
| Circular dependencies | Spec A depends on B, B depends on A | Identify shared foundation spec |
| Unbounded effort | XL estimate without breakdown | Split into smaller specs |
