# Rubrics

## PRE Phase Readiness Rubric

| Metric | Threshold | Source |
|---|---:|---|
| `kg.ts` modularization plan completeness | 100% command-surface mapping (`index|publish|verify|parity|replay`) | PRE output |
| Effect-first policy completeness | 100% required rules documented | PRE output |
| Direct vendor Claude SDK calls in benchmark execution path | 0 (for migrated path) | code diff / PRE output |
| `@beep/ai-sdk` validation suite | check + lint + test pass | command evidence |
| KG CLI parity guardrails | pre/post command behavior parity plan present | PRE output |

PRE must pass before P0 starts.

## P0-P5 Promotion Rubric

All gates must be evaluated using live, reproducible evidence.

| Metric | Threshold | Source |
|---|---:|---|
| Retrieval top-5 hit rate on labeled tasks | >= 80% | P3/P4 outputs |
| Human relevance score for injected KG context | >= 4.0 / 5 | P3 review packet |
| Task success delta vs baseline | >= +10 percentage points | P4 ablation |
| Wrong-API/resource hallucination delta | <= -30% | P4 ablation |
| First-pass `check` + `lint` pass delta | >= +20 percentage points | P4 ablation |
| Median token/cost delta | <= -10% | P4 ablation |
| Retrieval timeout rate (`search_memory_facts` path) | <= 1% | P2 reliability drills |
| Retrieval p95 latency (warm) | <= 1.5s | P2 reliability drills |
| Retrieval p99 latency | <= 2.5s | P2 reliability drills |
| Required tag parse success | >= 99% | P3 semantic quality |
| Semantic edge precision (`@domain/@provides/@depends/@errors`) | >= 90% | P3 semantic quality |
| Semantic edge recall (`@domain/@provides/@depends/@errors`) | >= 85% | P3 semantic quality |

## Promotion Rule

- **GO:** All high-impact gates pass.
- **LIMITED GO:** Reliability passes and at least one of task success or hallucination gates passes with no regression elsewhere.
- **NO GO:** Reliability fails, or task quality gates regress, or key metrics remain unmeasured.

## Evidence Quality Rule

A metric is valid only if:

1. The command or measurement method is documented.
2. The dataset or task set is identified.
3. Timestamp and environment context are included.
4. Failure cases are preserved, not filtered.

## Blocking Conditions

Any of the following blocks promotion:

- PRE phase incomplete.
- Missing labeled retrieval task set.
- Missing live ablation evidence.
- Timeout/fallback behavior not verified under induced failure.
- Semantic quality metrics missing for scoped modules.
