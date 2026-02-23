# Evaluation Rubrics: Knowledge Reasoning Engine

> Quality criteria for phase completion and deliverable evaluation across 3 phases of RDFS reasoning and SHACL validation implementation.

---

## Scoring System

### Score Scale

| Score | Meaning | Description |
|-------|---------|-------------|
| **5/5** | Exceptional | Production-ready, exceeds requirements, exemplary patterns |
| **4/5** | Good | Meets all requirements, minor polish needed |
| **3/5** | Acceptable | Core functionality works, some gaps remain |
| **2/5** | Needs Work | Partial implementation, significant issues |
| **1/5** | Incomplete | Major gaps, requires substantial rework |

### Phase Pass Threshold

**Minimum Score**: 3.5/5.0 weighted average to proceed to next phase

**Blocking Criteria**: Any criterion scoring 1/5 blocks phase completion until remediated.

---

## Quality Dimensions

All phases are evaluated against these cross-cutting dimensions:

| Dimension | Weight | Description |
|-----------|--------|-------------|
| **Correctness** | 25% | Inference accuracy, validation correctness |
| **Type Safety** | 20% | Branded EntityIds, no `any`, proper Schema usage |
| **Effect Patterns** | 20% | Effect.gen, namespace imports, Layer composition |
| **Performance** | 15% | Inference time, memory usage, depth limits |
| **Test Coverage** | 15% | @beep/testkit usage, meaningful assertions |
| **Documentation** | 5% | Code clarity, REFLECTION_LOG updates |

---

## Phase 1: RDFS Forward-Chaining Reasoner

### P1.1 Domain Models (Weight: 20%)

| Criterion | 5/5 | 3/5 | 1/5 |
|-----------|-----|-----|-----|
| **ReasoningConfig Schema** | Schema.Class with defaults, positive int constraints | Basic schema with defaults | Missing defaults or constraints |
| **InferenceResult Schema** | Complete provenance tracking, stats, typed arrays | Basic result structure | Missing provenance or stats |
| **ReasoningProfile Schema** | Literal union, extensible design | Basic literal | Hard-coded strings |
| **Package Placement** | Correct path (value-objects/reasoning/), barrel exports | Correct path, missing exports | Wrong location |

### P1.2 RDFS Rules (Weight: 30%)

| Criterion | 5/5 | 3/5 | 1/5 |
|-----------|-----|-----|-----|
| **Rule Completeness** | All 6 rules (rdfs2, rdfs3, rdfs5, rdfs7, rdfs9, rdfs11) | 4-5 rules implemented | <4 rules |
| **Correctness** | All rules produce correct inferences per W3C spec | Minor inference errors | Major correctness issues |
| **Provenance Tracking** | Each inference records rule ID and source triple IDs | Partial provenance | No provenance |
| **Effect Patterns** | F.pipe, A.filter, Effect.gen throughout | Mix of styles | Native methods used |
| **Pattern Matching** | Efficient triple filtering with predicate checks | Basic filtering, inefficient | No optimization |

### P1.3 Forward-Chaining Engine (Weight: 30%)

| Criterion | 5/5 | 3/5 | 1/5 |
|-----------|-----|-----|-----|
| **Fixed-Point Detection** | Correctly detects convergence, exits early | Detects convergence, always max iterations | No fixed-point detection |
| **Depth Limit** | Enforced with MaxDepthExceededError | Hard limit, no error | No depth limit (infinite loop risk) |
| **Inference Limit** | Enforced with MaxInferencesExceededError | Hard limit, no error | No inference limit (memory risk) |
| **MutableHashSet Usage** | Uses MutableHashSet for deduplication | Uses native Set | Uses Array (slow duplicates) |
| **Timing Metrics** | Uses DateTime.now for stats | Basic timing | No timing |

### P1.4 ReasonerService (Weight: 15%)

| Criterion | 5/5 | 3/5 | 1/5 |
|-----------|-----|-----|-----|
| **Context.Tag Pattern** | Proper Context.Tag extension, typed methods | Basic Context.Tag | Manual dependency passing |
| **Layer Composition** | Layer.effect with yield* dependencies | Partial Layer usage | No Layer pattern |
| **Error Handling** | TaggedErrors with context | Generic errors | Untyped errors |
| **RdfStore Integration** | Proper service dependency injection | Direct coupling | Hard-coded dependencies |

### P1.5 Unit Tests (Weight: 5%)

| Criterion | 5/5 | 3/5 | 1/5 |
|-----------|-----|-----|-----|
| **@beep/testkit Usage** | effect(), layer() helpers throughout | Partial testkit | Raw bun:test |
| **Coverage** | ≥80% line coverage | 60-80% | <60% |
| **Assertions** | strictEqual, meaningful checks | Basic assertions | No assertions |
| **Test Organization** | test/ mirrors src/, clear naming | Some organization | Chaotic structure |

### P1 Scoring Formula

```
P1_Score = (DomainModels × 0.20) + (RdfsRules × 0.30) + (ForwardChaining × 0.30) + (ReasonerService × 0.15) + (Tests × 0.05)
```

**Pass Threshold**: P1_Score >= 3.5

### P1 Quality Gates

- [ ] All 6 RDFS rules implemented and tested
- [ ] Forward-chaining converges to fixed-point
- [ ] Depth limit prevents infinite loops (MaxDepthExceededError)
- [ ] Max inferences limit enforced (MaxInferencesExceededError)
- [ ] Provenance tracked for all inferences
- [ ] Performance: <1s for 10K triples
- [ ] Test coverage ≥80%
- [ ] `bun run check --filter @beep/knowledge-*` passes
- [ ] `bun run test --filter @beep/knowledge-server` passes
- [ ] No `any` types in new code
- [ ] REFLECTION_LOG.md updated

---

## Phase 2: SHACL Validation Service

### P2.1 ValidationReport Model (Weight: 15%)

| Criterion | 5/5 | 3/5 | 1/5 |
|-----------|-----|-----|-----|
| **Schema Completeness** | All fields (conforms, violations, shapesGraph, dataGraph, timestamp) | Core fields present | Missing fields |
| **ValidationViolation Schema** | Detailed violation info (focusNode, resultPath, value, message, severity) | Basic violation | Minimal info |
| **Severity Levels** | Literal("Violation", "Warning", "Info") | Basic severity | No severity |
| **Type Safety** | All fields properly typed with Schema | Partial typing | Untyped |

### P2.2 SHACL Parser (Weight: 25%)

| Criterion | 5/5 | 3/5 | 1/5 |
|-----------|-----|-----|-----|
| **Shape Support** | NodeShape, PropertyShape, all core constraints | NodeShape, PropertyShape only | Minimal support |
| **Constraint Types** | sh:minCount, sh:maxCount, sh:datatype, sh:class | 2-3 constraint types | 1 constraint type |
| **Turtle Parsing** | Robust N3.js integration, error handling | Basic parsing | Parse errors crash |
| **Effect Patterns** | ParseResult usage, Schema.transformOrFail | Partial Effect patterns | No Effect patterns |

### P2.3 Re-SHACL Validator (Weight: 40%)

| Criterion | 5/5 | 3/5 | 1/5 |
|-----------|-----|-----|-----|
| **Selective Materialization** | Only infers predicates needed for validation | Over-materializes, still better than full | Full materialization |
| **Validation Correctness** | All constraint types validated correctly | Minor validation errors | Major correctness issues |
| **Error Accumulation** | Collects all violations, doesn't short-circuit | Partial collection | Fails on first violation |
| **Performance** | <500ms for 10K triples + 10 shapes | <1s | >1s |
| **Integration with Reasoner** | Clean ReasonerService dependency | Tight coupling | Direct calls |

### P2.4 ShaclService (Weight: 15%)

| Criterion | 5/5 | 3/5 | 1/5 |
|-----------|-----|-----|-----|
| **Context.Tag Pattern** | Proper Context.Tag, clean interface | Basic Context.Tag | Manual wiring |
| **Layer Composition** | Layer.effect with ReasonerService dependency | Partial Layer usage | No Layer |
| **Error Handling** | ShapeParseError, ValidationError with context | Generic errors | Untyped errors |

### P2.5 Validation Tests (Weight: 5%)

| Criterion | 5/5 | 3/5 | 1/5 |
|-----------|-----|-----|-----|
| **@beep/testkit Usage** | effect(), layer() throughout | Partial testkit | Raw bun:test |
| **Coverage** | ≥80% line coverage | 60-80% | <60% |
| **Test Scenarios** | Conforming graphs, all violation types | Basic scenarios | Minimal scenarios |
| **Integration Tests** | With ReasonerService Layer | Partial integration | No integration |

### P2 Scoring Formula

```
P2_Score = (ValidationReport × 0.15) + (ShaclParser × 0.25) + (ReShaclValidator × 0.40) + (ShaclService × 0.15) + (Tests × 0.05)
```

**Pass Threshold**: P2_Score >= 3.5

### P2 Quality Gates

- [ ] SHACL parser handles NodeShape, PropertyShape, constraints
- [ ] Validation detects cardinality, datatype, class violations
- [ ] ValidationReport provides actionable messages
- [ ] Re-SHACL avoids full materialization overhead
- [ ] Performance: <500ms for 10K triples + 10 shapes
- [ ] Test coverage ≥80%
- [ ] `bun run check --filter @beep/knowledge-*` passes
- [ ] `bun run test --filter @beep/knowledge-server` passes
- [ ] REFLECTION_LOG.md updated

---

## Phase 3: Caching and Optimization

### P3.1 Cache Key Strategy (Weight: 20%)

| Criterion | 5/5 | 3/5 | 1/5 |
|-----------|-----|-----|-----|
| **Key Components** | Ontology hash + data hash + profile | Data hash only | No hashing |
| **Hash Algorithm** | Effect Hash for content hashing | Custom hash, collisions possible | Weak hash |
| **Cache Hit Detection** | Accurate key matching | Occasional misses | Frequent misses |

### P3.2 InferenceCache Service (Weight: 35%)

| Criterion | 5/5 | 3/5 | 1/5 |
|-----------|-----|-----|-----|
| **TTL Expiration** | Configurable TTL, automatic eviction | Fixed TTL | No expiration (memory leak) |
| **Eviction Policy** | LRU or similar | FIFO | No eviction |
| **Thread Safety** | Effect Ref or Cache service | Manual locking | No concurrency control |
| **Metrics** | Hit/miss rates, latency tracking | Basic metrics | No metrics |
| **Effect Patterns** | Proper service pattern with Layer | Partial Effect usage | Imperative style |

### P3.3 Cache Invalidation (Weight: 25%)

| Criterion | 5/5 | 3/5 | 1/5 |
|-----------|-----|-----|-----|
| **RdfStore Integration** | Invalidates on add/remove | Partial invalidation | No invalidation |
| **Ontology Updates** | Invalidates on ontology changes | Missed updates | No ontology tracking |
| **Correctness** | Always returns fresh results after changes | Occasional stale data | Frequent stale data |

### P3.4 Performance Benchmarks (Weight: 15%)

| Criterion | 5/5 | 3/5 | 1/5 |
|-----------|-----|-----|-----|
| **Cache Hit Rate** | ≥70% on repeated queries | 50-70% | <50% |
| **Latency Improvement** | ≥50% reduction with warm cache | 30-50% | <30% |
| **Memory Usage** | Within acceptable bounds (<100MB for 50K triples) | Moderate overhead | Excessive memory |

### P3.5 N3 Rules Engine (Optional, Weight: 5%)

| Criterion | 5/5 | 3/5 | 1/5 |
|-----------|-----|-----|-----|
| **N3 Parsing** | Robust N3 syntax parser | Basic parser | No parser |
| **Rule Application** | Custom rules work correctly | Partial functionality | Broken |
| **Integration** | Seamless with forward-chainer | Manual integration | Not integrated |

### P3 Scoring Formula

```
P3_Score = (CacheKey × 0.20) + (InferenceCache × 0.35) + (Invalidation × 0.25) + (Benchmarks × 0.15) + (N3Engine × 0.05)
```

**Pass Threshold**: P3_Score >= 3.5

### P3 Quality Gates

- [ ] Cache key strategy implemented
- [ ] InferenceCache with TTL and eviction
- [ ] Cache invalidation on data/ontology updates
- [ ] Cache hit rate ≥70% on repeated queries
- [ ] Inference latency reduced ≥50% with warm cache
- [ ] Memory usage within bounds
- [ ] Benchmarks document performance
- [ ] `bun run check --filter @beep/knowledge-*` passes
- [ ] `bun run test --filter @beep/knowledge-server` passes
- [ ] REFLECTION_LOG.md updated with final learnings

---

## Overall Project Scoring

### Final Grade Calculation

```
Final_Score = (P1 × 0.35) + (P2 × 0.35) + (P3 × 0.30)
```

**Weights Rationale**:
- Phase 1 (35%): Foundation - RDFS reasoning is core functionality
- Phase 2 (35%): Critical feature - SHACL validation is primary use case
- Phase 3 (30%): Optimization - Caching improves but not essential for MVP

### Grade Thresholds

| Grade | Score Range | Description |
|-------|-------------|-------------|
| **A** | 4.5 - 5.0 | Production-ready, exceptional quality |
| **B** | 4.0 - 4.4 | Solid implementation, ready for use |
| **C** | 3.5 - 3.9 | Functional, minor polish needed |
| **D** | 3.0 - 3.4 | Partial implementation, significant gaps |
| **F** | < 3.0 | Incomplete, requires major rework |

---

## Cross-Phase Quality Criteria

These criteria are evaluated across all phases and contribute to overall scoring:

### Effect Patterns Compliance

| Criterion | 5/5 | 3/5 | 1/5 |
|-----------|-----|-----|-----|
| **Namespace Imports** | `import * as Effect from "effect/Effect"` everywhere | Mix of styles | Default imports |
| **Effect.gen Usage** | All async logic in Effect.gen | Mix of Effect.gen and flatMap | Promise-based or async/await |
| **Layer Composition** | Proper Layer.provide, no manual wiring | Partial layer usage | No layers |
| **TaggedErrors** | All errors extend S.TaggedError | Mix of error types | Plain Error |
| **No async/await** | Zero async/await in Effect code | 1-2 isolated instances | Widespread async/await |
| **Native Method Ban** | Zero native array/string methods | 1-2 violations | Widespread violations |

### Type Safety Compliance

| Criterion | 5/5 | 3/5 | 1/5 |
|-----------|-----|-----|-----|
| **Branded EntityIds** | All IDs use KnowledgeEntityIds (if applicable) | Mix of branded/plain | All plain strings |
| **No `any`** | Zero `any` types | 1-2 isolated `any` | Widespread `any` |
| **Schema Validation** | All external data decoded with Schema | Partial validation | No validation |
| **Cross-Package Imports** | Only through @beep/* aliases | Mix of styles | Relative imports |

### Test Coverage

| Criterion | 5/5 | 3/5 | 1/5 |
|-----------|-----|-----|-----|
| **@beep/testkit** | All tests use testkit helpers | Mix of testkit and bun:test | Raw bun:test only |
| **Effect Runner** | effect(), layer(), scoped() used correctly | Manual Effect.runPromise | No Effect testing |
| **Coverage Targets** | ≥80% of new code covered | 60-80% | <60% |
| **Assertion Quality** | Meaningful assertions, edge cases | Basic assertions | Minimal assertions |

---

## Common Deductions

| Issue | Deduction | Fix |
|-------|-----------|-----|
| Using `any` type | -5 per instance | Define proper schema |
| async/await in Effect code | -3 per instance | Convert to Effect.gen |
| Native array methods | -2 per instance | Use A.map, A.filter from effect/Array |
| Plain Error objects | -3 per error | Use S.TaggedError |
| Missing depth limit | -10 (blocking) | Add maxDepth enforcement |
| No provenance tracking | -5 | Add source triple tracking |
| Missing loading state | N/A (no UI) | N/A |
| No REFLECTION_LOG update | -5 per phase | Update with learnings |
| Missing handoff | -10 | Create HANDOFF_P[N+1].md |
| Type check failures | -5 per error | Fix type mismatches |
| Lint errors | -2 per error | Run `bun run lint:fix` |

---

## Verification Commands

Run these commands to verify quality gate compliance:

```bash
# Type checking
bun run check --filter @beep/knowledge-domain
bun run check --filter @beep/knowledge-server

# Linting
bun run lint --filter @beep/knowledge-*

# Tests
bun run test --filter @beep/knowledge-server

# Coverage
bun run test --coverage --filter @beep/knowledge-server

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

| Section | Score | Max | Weight | Weighted Score | Notes |
|---------|-------|-----|--------|----------------|-------|
| P[N].1  | X.X   | 5.0 | 0.XX   | X.XX           | [Brief notes] |
| P[N].2  | X.X   | 5.0 | 0.XX   | X.XX           | [Brief notes] |
| P[N].3  | X.X   | 5.0 | 0.XX   | X.XX           | [Brief notes] |

### Weighted Phase Score

**Phase Score**: X.X / 5.0

### Quality Gate Status

- [ ] All verification commands pass
- [ ] No blocking criteria (1/5 scores)
- [ ] Test coverage ≥80%
- [ ] Performance targets met
- [ ] REFLECTION_LOG.md updated
- [ ] Handoff documents created

### Pass/Fail Decision

- Phase Score >= 3.5: [PASS/FAIL]
- No blocking criteria: [PASS/FAIL]
- **Overall**: [PASS/FAIL]

### Issues Found

1. [Issue description, severity, location]
2. [Issue description, severity, location]

### Remediation Required

- [ ] [Action item with priority]
- [ ] [Action item with priority]

### Deductions Applied

| Issue | Count | Deduction Each | Total |
|-------|-------|----------------|-------|
| [Issue type] | X | -Y | -Z |

**Total Deductions**: -XX points
```

---

## Related Documentation

- [README.md](README.md) - Spec overview and phases
- [QUICK_START.md](QUICK_START.md) - 5-minute triage guide
- [MASTER_ORCHESTRATION.md](MASTER_ORCHESTRATION.md) - Complete workflow
- [AGENT_PROMPTS.md](AGENT_PROMPTS.md) - Agent delegation prompts
- [REFLECTION_LOG.md](REFLECTION_LOG.md) - Phase learnings
- [Effect Patterns](../../.claude/rules/effect-patterns.md) - Code standards
- [Spec Guide](../_guide/README.md) - Spec creation workflow
