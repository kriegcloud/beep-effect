# Evaluation Rubrics: Knowledge Graph POC Demo

> Quality criteria for phase completion and agent output evaluation across 5 phases.

---

## Scoring System

### Score Scale

| Score | Meaning | Description |
|-------|---------|-------------|
| **5/5** | Exceptional | Production-ready, exceeds requirements |
| **4/5** | Good | Meets all requirements, minor polish needed |
| **3/5** | Acceptable | Core functionality works, some gaps |
| **2/5** | Needs Work | Partial implementation, significant issues |
| **1/5** | Incomplete | Major gaps, requires rework |

### Phase Pass Threshold

**Minimum Score**: 3.5/5.0 weighted average to proceed to next phase

**Blocking Criteria**: Any criterion scoring 1/5 blocks phase completion until remediated.

---

## Quality Dimensions

All phases are evaluated against these cross-cutting dimensions:

| Dimension | Weight | Description |
|-----------|--------|-------------|
| **Extraction Accuracy** | 20% | Entity/relation extraction precision and recall |
| **Type Safety** | 20% | Branded EntityIds, no `any`, proper Schema usage |
| **Effect Patterns** | 20% | Effect.gen, namespace imports, Schema.TaggedStruct |
| **Test Coverage** | 15% | @beep/testkit usage, meaningful assertions |
| **UI/UX Quality** | 15% | Responsive design, accessibility, loading states |
| **Documentation** | 10% | Inline examples, clear API, REFLECTION_LOG updates |

---

## Phase 1: Basic Extraction UI

### P1.1 Route Setup (Weight: 25%)

| Criterion | 5/5 | 3/5 | 1/5 |
|-----------|-----|-----|-----|
| **Route Configuration** | App Router route at `/knowledge-poc` with proper layout | Route exists but missing layout integration | Route not created or broken |
| **Navigation** | Accessible from main navigation, proper breadcrumbs | Accessible but missing breadcrumbs | No navigation entry |
| **Page Structure** | Clean component hierarchy, proper Suspense boundaries | Components work but messy structure | Missing structure, crashes on load |

### P1.2 EmailInputPanel (Weight: 35%)

| Criterion | 5/5 | 3/5 | 1/5 |
|-----------|-----|-----|-----|
| **Text Input** | Textarea with proper validation, paste support, clear feedback | Basic textarea, minimal validation | No input or broken input |
| **Submit Action** | Effect-based submission, loading state, error handling | Submission works, missing states | Submit broken or missing |
| **Sample Data** | Load sample emails from `sample-data/`, clear labeling | Sample data loads, poor UX | No sample data support |
| **Schema Validation** | Input validated against Email schema before processing | Basic validation present | No validation |

### P1.3 EntityInspector (Weight: 40%)

| Criterion | 5/5 | 3/5 | 1/5 |
|-----------|-----|-----|-----|
| **Entity Display** | All entity fields shown: type, name, attributes, confidence | Core fields shown, some missing | Entities not displayed |
| **Type Badges** | Color-coded badges per entity type (Person, Organization, etc.) | Badges present, no differentiation | No type indication |
| **Evidence Links** | Click to highlight source text, offset-accurate | Evidence shown, no interaction | No evidence display |
| **Empty State** | Clear messaging when no entities extracted | Generic empty state | No empty state handling |
| **Branded EntityIds** | Uses `KnowledgeEntityIds.EntityId` throughout | Partial branded ID usage | Plain strings for IDs |

### P1 Scoring Formula

```
P1_Score = (Route × 0.25) + (EmailInput × 0.35) + (EntityInspector × 0.40)
```

**Pass Threshold**: P1_Score >= 3.5

### P1 Quality Gates

- [ ] Route accessible at `/knowledge-poc`
- [ ] Sample email loads and displays
- [ ] Entity extraction produces results
- [ ] EntityInspector renders extracted entities
- [ ] `bun run check --filter @beep/knowledge-*` passes
- [ ] No `any` types in new code
- [ ] REFLECTION_LOG.md updated

---

## Phase 2: Relations & Evidence UI

### P2.1 RelationBrowser (Weight: 45%)

| Criterion | 5/5 | 3/5 | 1/5 |
|-----------|-----|-----|-----|
| **Relation Display** | Subject-predicate-object triplets, clickable entities | Triplets shown, no interaction | Relations not displayed |
| **Predicate Labels** | Human-readable predicate names, ontology-derived | Raw predicate URIs shown | No predicate display |
| **Filtering** | Filter by entity type, predicate type, confidence | One filter dimension | No filtering |
| **Sorting** | Sort by confidence, recency, subject/object | Basic sorting | No sorting |
| **Schema Compliance** | Uses `Relation` schema from domain, proper types | Partial schema usage | Untyped relation objects |

### P2.2 Evidence References (Weight: 35%)

| Criterion | 5/5 | 3/5 | 1/5 |
|-----------|-----|-----|-----|
| **Span Highlighting** | Click relation to highlight source text span | Highlights work, accuracy issues | No highlighting |
| **Offset Accuracy** | Character offsets match source exactly | Within 5 characters | Off by more than 5 characters |
| **Multi-Span Support** | Multiple evidence spans per relation supported | Single span only | No span support |
| **Confidence Display** | Confidence score shown with visual indicator | Score shown, no visual | No confidence display |

### P2.3 Type Safety (Weight: 20%)

| Criterion | 5/5 | 3/5 | 1/5 |
|-----------|-----|-----|-----|
| **Relation EntityIds** | `KnowledgeEntityIds.RelationId` for all relation IDs | Mix of branded and plain | All plain strings |
| **Subject/Object Refs** | Proper `EntityId.Type` for references | Partial typing | Untyped references |
| **TaggedErrors** | Custom errors for evidence/relation failures | Using generic errors | No error handling |

### P2 Scoring Formula

```
P2_Score = (RelationBrowser × 0.45) + (Evidence × 0.35) + (TypeSafety × 0.20)
```

**Pass Threshold**: P2_Score >= 3.5

### P2 Quality Gates

- [ ] Relations display correctly with subject-predicate-object
- [ ] Click relation highlights evidence in source
- [ ] Filter by entity type works
- [ ] All IDs use branded `KnowledgeEntityIds`
- [ ] `bun run check --filter @beep/knowledge-*` passes
- [ ] Effect.gen used for all async operations
- [ ] REFLECTION_LOG.md updated

---

## Phase 3: GraphRAG Query Interface

### P3.1 Semantic Search (Weight: 40%)

| Criterion | 5/5 | 3/5 | 1/5 |
|-----------|-----|-----|-----|
| **Query Input** | Natural language input, debounced search, suggestions | Basic text input, no suggestions | Input missing or broken |
| **Embedding Integration** | Uses embedding service, proper task type | Embeddings work, wrong task type | No embedding support |
| **k-NN Results** | Top-k entities with similarity scores | Results shown, no scores | No results display |
| **Type Constraints** | Optional class filter for entity types | No type filtering | N/A |
| **Effect Patterns** | `Effect.gen`, proper error handling, streaming | Partial Effect usage | Promise-based or broken |

### P3.2 Context Assembly (Weight: 35%)

| Criterion | 5/5 | 3/5 | 1/5 |
|-----------|-----|-----|-----|
| **Subgraph Expansion** | 1-hop and 2-hop expansion configurable | Fixed 1-hop only | No expansion |
| **Token Budgeting** | Respects model context limits, truncates gracefully | Hard limit, poor truncation | No budgeting |
| **RRF Scoring** | Hybrid relevance ranking implemented | Single scoring method | No ranking |
| **Provenance** | Source URIs included in context | Partial provenance | No provenance |

### P3.3 Query Result Display (Weight: 25%)

| Criterion | 5/5 | 3/5 | 1/5 |
|-----------|-----|-----|-----|
| **Result Cards** | Entity cards with type, name, relevance score | Basic list display | No result display |
| **Graph Preview** | Mini graph visualization of subgraph | Text-only subgraph | No subgraph view |
| **Copy Context** | One-click copy assembled context for LLM | Manual selection required | No copy feature |
| **Loading States** | Skeleton loaders, progress indicators | Basic spinner | No loading indication |

### P3 Scoring Formula

```
P3_Score = (SemanticSearch × 0.40) + (ContextAssembly × 0.35) + (ResultDisplay × 0.25)
```

**Pass Threshold**: P3_Score >= 3.5

### P3 Quality Gates

- [ ] Natural language query returns relevant entities
- [ ] Subgraph expansion includes related entities
- [ ] Context assembly produces coherent text
- [ ] Copy context button works
- [ ] `bun run check --filter @beep/knowledge-*` passes
- [ ] No `async/await` in Effect code
- [ ] Namespace imports for all Effect modules
- [ ] REFLECTION_LOG.md updated

---

## Phase 4: Entity Resolution UI

### P4.1 Cluster Visualization (Weight: 45%)

| Criterion | 5/5 | 3/5 | 1/5 |
|-----------|-----|-----|-----|
| **Cluster Display** | Visual grouping of duplicate candidates | List-based grouping | No clustering display |
| **Similarity Scores** | Pairwise similarity shown between members | Aggregate score only | No scores |
| **Type Consistency** | Only same-type entities in clusters | Mixed types allowed | No type enforcement |
| **Cluster Navigation** | Browse clusters, pagination, search | Basic navigation | No navigation |
| **Schema Compliance** | Uses proper cluster/candidate schemas | Ad-hoc structures | Untyped objects |

### P4.2 Merge Controls (Weight: 35%)

| Criterion | 5/5 | 3/5 | 1/5 |
|-----------|-----|-----|-----|
| **Canonical Selection** | UI to pick canonical entity from cluster | Automatic selection only | No selection mechanism |
| **Attribute Preview** | Preview merged attributes before confirm | No preview | N/A |
| **Merge Action** | Effect-based merge with confirmation | Merge works, no confirmation | Merge broken |
| **owl:sameAs Links** | Creates sameAs links for provenance | No provenance | N/A |
| **Undo Support** | Can revert merge within session | No undo | N/A |

### P4.3 Resolution Quality (Weight: 20%)

| Criterion | 5/5 | 3/5 | 1/5 |
|-----------|-----|-----|-----|
| **Precision** | >90% of merged entities are true duplicates | 70-90% precision | <70% precision |
| **Recall** | >80% of true duplicates identified | 50-80% recall | <50% recall |
| **Scalability** | Handles 100+ entities without UI lag | Slow but functional at 100 | Crashes at 100 entities |

### P4 Scoring Formula

```
P4_Score = (ClusterViz × 0.45) + (MergeControls × 0.35) + (Quality × 0.20)
```

**Pass Threshold**: P4_Score >= 3.5

### P4 Quality Gates

- [ ] Duplicate candidates clustered correctly
- [ ] Similarity scores display for cluster members
- [ ] Canonical entity selection works
- [ ] Merge creates owl:sameAs links
- [ ] `bun run check --filter @beep/knowledge-*` passes
- [ ] All domain models use `Schema.TaggedStruct`
- [ ] REFLECTION_LOG.md updated

---

## Phase 5: Polish & Integration

### P5.1 Loading States (Weight: 30%)

| Criterion | 5/5 | 3/5 | 1/5 |
|-----------|-----|-----|-----|
| **Extraction Loading** | Progress bar with stage indicators | Generic spinner | No loading state |
| **Query Loading** | Skeleton loaders for results | Basic spinner | No loading state |
| **Merge Loading** | Optimistic UI with rollback | Blocking during merge | No feedback |
| **Suspense Boundaries** | Proper React Suspense usage | Partial Suspense | No Suspense |

### P5.2 Error Handling (Weight: 35%)

| Criterion | 5/5 | 3/5 | 1/5 |
|-----------|-----|-----|-----|
| **Extraction Errors** | Tagged errors with actionable messages | Generic error display | Errors crash UI |
| **Query Errors** | Network/timeout handling with retry | Basic error message | Silent failures |
| **Validation Errors** | Field-level validation feedback | Form-level errors | No validation feedback |
| **Error Boundaries** | React error boundaries per section | Single boundary | No error boundaries |
| **Schema.TaggedError** | All errors extend TaggedError | Mix of error types | Plain Error objects |

### P5.3 Accessibility (Weight: 20%)

| Criterion | 5/5 | 3/5 | 1/5 |
|-----------|-----|-----|-----|
| **Keyboard Navigation** | Full keyboard support, focus management | Partial keyboard support | No keyboard support |
| **ARIA Labels** | Proper labels on interactive elements | Some labels missing | No ARIA labels |
| **Color Contrast** | WCAG AA compliant | Minor contrast issues | Fails contrast |
| **Screen Reader** | Meaningful announcements | Basic structure | Not screen reader friendly |

### P5.4 Integration Testing (Weight: 15%)

| Criterion | 5/5 | 3/5 | 1/5 |
|-----------|-----|-----|-----|
| **E2E Flow** | Full extraction-to-query flow tested | Partial flow coverage | No E2E tests |
| **@beep/testkit** | Uses `effect`, `layer`, `scoped` helpers | Partial testkit usage | Raw bun:test |
| **Assertions** | Meaningful assertions, not just "runs" | Basic assertions | No assertions |

### P5 Scoring Formula

```
P5_Score = (Loading × 0.30) + (ErrorHandling × 0.35) + (Accessibility × 0.20) + (Testing × 0.15)
```

**Pass Threshold**: P5_Score >= 3.5

### P5 Quality Gates

- [ ] All loading states implemented
- [ ] All errors use Schema.TaggedError
- [ ] Error boundaries prevent full crashes
- [ ] Keyboard navigation works throughout
- [ ] Integration tests pass
- [ ] `bun run check --filter @beep/knowledge-*` passes
- [ ] `bun run test --filter @beep/knowledge-*` passes
- [ ] REFLECTION_LOG.md updated with final learnings

---

## Overall Project Scoring

### Final Grade Calculation

```
Final_Score = (P1 × 0.15) + (P2 × 0.20) + (P3 × 0.25) + (P4 × 0.20) + (P5 × 0.20)
```

### Grade Thresholds

| Grade | Score Range | Description |
|-------|-------------|-------------|
| **A** | 4.5 - 5.0 | Production-ready, exceeds POC scope |
| **B** | 4.0 - 4.4 | Solid POC, ready for demo |
| **C** | 3.5 - 3.9 | Functional POC, needs polish |
| **D** | 3.0 - 3.4 | Partial POC, significant gaps |
| **F** | < 3.0 | Incomplete, requires major rework |

---

## Cross-Phase Quality Criteria

These criteria are evaluated across all phases and contribute to overall scoring:

### Effect Patterns Compliance

| Criterion | 5/5 | 3/5 | 1/5 |
|-----------|-----|-----|-----|
| **Namespace Imports** | `import * as Effect from "effect/Effect"` everywhere | Mix of styles | Default imports |
| **Effect.gen Usage** | All async logic in Effect.gen | Mix of Effect.gen and flatMap | Promise-based |
| **Layer Composition** | Proper Layer.provide, no manual wiring | Partial layer usage | No layers |
| **TaggedErrors** | All errors extend Schema.TaggedError | Mix of error types | Plain Error |
| **No async/await** | Zero async/await in Effect code | Isolated instances | Widespread async |

### Type Safety Compliance

| Criterion | 5/5 | 3/5 | 1/5 |
|-----------|-----|-----|-----|
| **Branded EntityIds** | All IDs use KnowledgeEntityIds | Mix of branded/plain | All plain strings |
| **No `any`** | Zero `any` types | 1-2 isolated `any` | Widespread `any` |
| **Schema Validation** | All external data decoded with Schema | Partial validation | No validation |
| **Cross-Slice Imports** | Only through @beep/* aliases | Mix of styles | Direct cross-slice |

### Test Coverage

| Criterion | 5/5 | 3/5 | 1/5 |
|-----------|-----|-----|-----|
| **@beep/testkit** | All tests use testkit helpers | Mix of testkit and bun:test | Raw bun:test only |
| **Effect Runner** | `effect()`, `layer()`, `scoped()` used | Manual Effect.runPromise | No Effect testing |
| **Coverage Targets** | >80% of new code covered | 50-80% coverage | <50% coverage |

---

## Common Deductions

| Issue | Deduction | Fix |
|-------|-----------|-----|
| Using `S.Any` | -5 per instance | Define proper schema |
| Plain string EntityId | -3 per field | Use branded KnowledgeEntityIds |
| async/await in Effect code | -3 per instance | Convert to Effect.gen |
| Missing loading state | -2 per component | Add Suspense/skeleton |
| Missing error boundary | -3 per section | Add React error boundary |
| No REFLECTION_LOG update | -5 per phase | Update with learnings |
| Missing handoff | -10 | Create HANDOFF_P[N+1].md |
| Type check failures | -5 per error | Fix type mismatches |
| Lint errors | -2 per error | Run `bun run lint:fix` |

---

## Verification Commands

Run these commands to verify quality gate compliance:

```bash
# Type checking
bun run check --filter @beep/knowledge-*

# Linting
bun run lint --filter @beep/knowledge-*

# Tests
bun run test --filter @beep/knowledge-*

# Full build
bun run build --filter @beep/knowledge-*
```

---

## Evaluation Template

Use this template when evaluating phase completion:

```markdown
## Phase [N] Evaluation

**Date**: YYYY-MM-DD
**Evaluator**: [Agent/Human]

### Section Scores

| Section | Score | Max | Notes |
|---------|-------|-----|-------|
| P[N].1 | X.X | 5.0 | [Brief notes] |
| P[N].2 | X.X | 5.0 | [Brief notes] |
| P[N].3 | X.X | 5.0 | [Brief notes] |

### Weighted Score

**Phase Score**: X.X / 5.0

### Quality Gate Status

- [ ] `bun run check` passes
- [ ] `bun run lint` passes
- [ ] No blocking criteria (1/5 scores)
- [ ] REFLECTION_LOG.md updated
- [ ] Handoff documents created

### Pass/Fail

- Phase Score >= 3.5: [PASS/FAIL]
- No blocking criteria: [PASS/FAIL]
- **Overall**: [PASS/FAIL]

### Issues Found

1. [Issue description and location]
2. [Issue description and location]

### Remediation Required

- [ ] [Action item 1]
- [ ] [Action item 2]
```

---

## Related Documentation

- [README.md](./README.md) - Spec overview and phases
- [REFLECTION_LOG.md](./REFLECTION_LOG.md) - Phase learnings
- [Effect Patterns](../../.claude/rules/effect-patterns.md) - Code standards
- [Spec Guide](../_guide/README.md) - Spec creation workflow
