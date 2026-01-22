# Rubrics: Knowledge Completion Spec

> Evaluation criteria for each phase of the knowledge completion spec.

---

## Scoring Scale

| Score | Label | Description |
|-------|-------|-------------|
| 5 | Excellent | Exceeds requirements, no issues |
| 4 | Good | Meets all requirements, minor polish needed |
| 3 | Acceptable | Meets core requirements, gaps exist |
| 2 | Needs Work | Missing key deliverables |
| 1 | Incomplete | Major blockers, restart needed |

---

## Phase 1: Discovery & Research

### Deliverables Checklist

- [ ] `outputs/current-impl-analysis.md` created
- [ ] `outputs/effect-ai-research.md` created
- [ ] `outputs/reference-patterns.md` created
- [ ] `outputs/gap-analysis.md` created
- [ ] `REFLECTION_LOG.md` updated with learnings
- [ ] `handoffs/HANDOFF_P2.md` created

### Scoring Criteria

| Criterion | Weight | 5 (Excellent) | 3 (Acceptable) | 1 (Incomplete) |
|-----------|--------|---------------|----------------|----------------|
| **Completeness** | 30% | All 4 output files created with comprehensive content | 3 of 4 files created | Fewer than 3 files |
| **Accuracy** | 30% | All AiService methods documented (3), all usages found | Most methods documented | Missing critical methods |
| **@effect/ai Research** | 20% | System prompt solution found, mock pattern verified | Basic API documented | Missing critical answers |
| **Gap Analysis Quality** | 20% | Clear migration path, complexity assessment | Partial migration plan | No actionable plan |

### Quality Gate

**Must score ≥3.5 average to proceed to Phase 2**

Critical blockers:
- Missing answer: Does @effect/ai support system prompts?
- Missing answer: How to create mock LanguageModel Layer?
- Missing usage count for `generateObjectWithSystem`

---

## Phase 2: Architecture Review

### Deliverables Checklist

- [ ] `outputs/architecture-review.md` created
- [ ] `outputs/slice-structure-review.md` created
- [ ] Effect patterns compliance documented
- [ ] Remediation plan with priorities
- [ ] `handoffs/HANDOFF_P3.md` created

### Scoring Criteria

| Criterion | Weight | 5 (Excellent) | 3 (Acceptable) | 1 (Incomplete) |
|-----------|--------|---------------|----------------|----------------|
| **Pattern Compliance** | 40% | All files checked, no violations | Most files checked | Spot-check only |
| **Structure Validation** | 30% | All 5 slice packages validated | Core packages checked | Incomplete scan |
| **Remediation Plan** | 30% | Prioritized (P0/P1/P2), actionable | List without priorities | No plan |

### Quality Gate

**Must score ≥3.5 average to proceed to Phase 3**

Critical blockers:
- Unresolved P0 architecture violations
- Missing import pattern analysis

---

## Phase 3: @effect/ai Design

### Deliverables Checklist

- [ ] `outputs/design-llm-layers.md` created
- [ ] `outputs/design-migration.md` created
- [ ] `templates/llm-service.template.ts` created
- [ ] System prompt migration strategy documented
- [ ] `handoffs/HANDOFF_P4.md` created

### Scoring Criteria

| Criterion | Weight | 5 (Excellent) | 3 (Acceptable) | 1 (Incomplete) |
|-----------|--------|---------------|----------------|----------------|
| **Design Completeness** | 30% | All 3 deliverables complete | 2 of 3 complete | 1 or fewer |
| **Migration Strategy** | 30% | Step-by-step with verification | High-level steps | No clear order |
| **Template Quality** | 20% | Copy-paste ready, tested | Mostly complete | Skeleton only |
| **System Prompt Solution** | 20% | Clear pattern for `generateObjectWithSystem` | Workaround documented | No solution |

### Quality Gate

**Must score ≥4.0 average to proceed to Phase 4**

Critical blockers:
- No solution for `generateObjectWithSystem` migration
- Template doesn't compile

---

## Phase 4: LLM Refactoring

### Deliverables Checklist

- [ ] Dependencies added (@effect/ai, providers)
- [ ] `Runtime/LlmLayers.ts` created
- [ ] `Service/LlmWithRetry.ts` created
- [ ] EntityExtractor.ts migrated
- [ ] MentionExtractor.ts migrated
- [ ] RelationExtractor.ts migrated
- [ ] ExtractionPipeline.ts updated
- [ ] PromptTemplates.ts migrated
- [ ] AiService.ts deleted
- [ ] `bun run check --filter @beep/knowledge-server` passes
- [ ] `handoffs/HANDOFF_P5.md` created

### Scoring Criteria

| Criterion | Weight | 5 (Excellent) | 3 (Acceptable) | 1 (Incomplete) |
|-----------|--------|---------------|----------------|----------------|
| **Migration Completeness** | 40% | All extractors migrated, AiService deleted | Most migrated, AiService remains | Partial migration |
| **Type Safety** | 30% | Zero type errors, check passes | <5 type errors | Many type errors |
| **Pattern Adherence** | 20% | Matches reference implementation | Minor deviations | Major deviations |
| **Rollback Ready** | 10% | Can revert via git if needed | Messy but reversible | Unclear state |

### Quality Gate

**Must pass `bun run check --filter @beep/knowledge-server` to proceed to Phase 5**

Critical blockers:
- Type errors in migrated files
- AiService not deleted
- Missing retry wrapper

### Rollback Trigger

If type errors persist after 3 fix attempts:
1. `git stash` current changes
2. Document blockers in REFLECTION_LOG
3. Create issue for manual resolution
4. Proceed to Phase 5 with partial implementation (document scope)

---

## Phase 5: Test Coverage

### Deliverables Checklist

- [ ] `test/_shared/TestLayers.ts` created (mock LanguageModel)
- [ ] EntityExtractor.test.ts created
- [ ] MentionExtractor.test.ts created
- [ ] RelationExtractor.test.ts created
- [ ] ExtractionPipeline.test.ts created
- [ ] OntologyService.test.ts created
- [ ] EmbeddingService.test.ts created
- [ ] EntityResolutionService.test.ts created
- [ ] GroundingService.test.ts created
- [ ] All tests pass
- [ ] `handoffs/HANDOFF_P6.md` created

### Scoring Criteria

| Criterion | Weight | 5 (Excellent) | 3 (Acceptable) | 1 (Incomplete) |
|-----------|--------|---------------|----------------|----------------|
| **Coverage** | 40% | All 8 test files, ≥80% line coverage | 6+ test files, ≥60% coverage | <6 files or <60% |
| **Test Quality** | 30% | Tests edge cases, error paths | Happy path covered | Minimal assertions |
| **Layer Composition** | 20% | Clean mock layers, reusable | Working but duplicated | Hardcoded mocks |
| **Pass Rate** | 10% | 100% tests pass | >90% pass | <90% pass |

### Quantitative Thresholds

| Metric | Minimum | Target |
|--------|---------|--------|
| Test file count | 6 | 8 |
| Line coverage | 60% | 80% |
| Pass rate | 90% | 100% |

### Quality Gate

**Must have ≥6 test files passing to proceed to Phase 6**

Critical blockers:
- Mock LanguageModel Layer doesn't work
- Core extraction tests failing

---

## Phase 6: GraphRAG Implementation

### Deliverables Checklist

- [ ] `GraphRAG/GraphRAGService.ts` created
- [ ] k-NN search implemented (pgvector)
- [ ] N-hop traversal implemented
- [ ] RRF scoring implemented
- [ ] Context formatting for LLM
- [ ] Tests for GraphRAG
- [ ] `handoffs/HANDOFF_P7.md` created

### Scoring Criteria

| Criterion | Weight | 5 (Excellent) | 3 (Acceptable) | 1 (Incomplete) |
|-----------|--------|---------------|----------------|----------------|
| **Feature Completeness** | 40% | All 4 features (k-NN, N-hop, RRF, formatting) | 3 of 4 features | <3 features |
| **Query Performance** | 20% | <100ms for typical queries | <500ms | >500ms |
| **Test Coverage** | 20% | GraphRAG tests passing | Some tests | No tests |
| **API Design** | 20% | Clean interface, Effect patterns | Working but awkward | Inconsistent |

### Quality Gate

**Must have working k-NN search and N-hop traversal to proceed to Phase 7**

---

## Phase 7: Todox Integration

### Deliverables Checklist

- [ ] Email extraction trigger implemented
- [ ] Client knowledge graph assembly
- [ ] Real-time extraction events
- [ ] Integration tests
- [ ] `handoffs/HANDOFF_P8.md` created

### Scoring Criteria

| Criterion | Weight | 5 (Excellent) | 3 (Acceptable) | 1 (Incomplete) |
|-----------|--------|---------------|----------------|----------------|
| **Integration** | 40% | Seamless email → extraction → graph | Working with workarounds | Broken pipeline |
| **Event System** | 30% | Real-time events emitting | Events work, not real-time | No events |
| **Client Assembly** | 20% | Per-client graphs working | Basic assembly | No assembly |
| **Testing** | 10% | Integration tests passing | Manual verification | Untested |

### Quality Gate

**Must have email extraction triggering to proceed to Phase 8**

---

## Phase 8: Finalization

### Deliverables Checklist

- [ ] `packages/knowledge/server/README.md` updated
- [ ] `packages/knowledge/domain/README.md` updated
- [ ] `packages/knowledge/server/AGENTS.md` created
- [ ] `packages/knowledge/domain/AGENTS.md` created
- [ ] Final architecture review passed
- [ ] REFLECTION_LOG finalized
- [ ] Spec marked complete

### Scoring Criteria

| Criterion | Weight | 5 (Excellent) | 3 (Acceptable) | 1 (Incomplete) |
|-----------|--------|---------------|----------------|----------------|
| **Documentation** | 40% | All README/AGENTS files complete | Most complete | Stub only |
| **Architecture Alignment** | 30% | Passes pattern enforcer | Minor violations | Major violations |
| **Reflection Quality** | 20% | Rich learnings, actionable patterns | Basic notes | Minimal |
| **Cleanup** | 10% | No dead code, imports clean | Minor cleanup needed | Messy |

### Quality Gate

**Spec complete when:**
- [ ] All documentation updated
- [ ] `bun run check --filter @beep/knowledge-*` passes
- [ ] `bun run test --filter @beep/knowledge-server` passes
- [ ] No P0/P1 violations from architecture review

---

## Anti-Patterns to Detect

### Phase 1

- [ ] Researching only `generateObject`, missing `generateObjectWithSystem`
- [ ] Not verifying mock Layer pattern in @effect/ai docs
- [ ] Skipping reference implementation analysis

### Phase 4

- [ ] Migrating all extractors at once (should be incremental)
- [ ] Not running `bun run check` after each file
- [ ] Leaving AiService.ts without deleting

### Phase 5

- [ ] Copying mock patterns from web without verification
- [ ] Tests that don't actually use mock Layer
- [ ] Skipping error path tests

### General

- [ ] Proceeding without quality gate pass
- [ ] Not updating REFLECTION_LOG after phase
- [ ] Missing handoff documents

---

## Aggregate Scoring

| Phase | Weight | Max Score |
|-------|--------|-----------|
| P1: Discovery | 10% | 5 |
| P2: Architecture | 10% | 5 |
| P3: Design | 15% | 5 |
| P4: Refactoring | 25% | 5 |
| P5: Testing | 15% | 5 |
| P6: GraphRAG | 10% | 5 |
| P7: Integration | 10% | 5 |
| P8: Finalization | 5% | 5 |

**Spec Success Threshold: 4.0 weighted average**

---

## Notes

- Quality gates are hard stops; do not proceed without meeting criteria
- Anti-pattern detection should be reviewed at each phase transition
- REFLECTION_LOG entries are mandatory after each phase
- Handoff documents must include context budget estimate for next phase
