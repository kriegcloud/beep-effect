# Rubrics

## P0 Package Quality Rubric

| Dimension | Pass Condition | Evidence |
|---|---|---|
| Canonical completeness | All required top-level files and handoff/output files exist | `rg --files` listing under spec root |
| Default lock integrity | Five mandated defaults are present and identical across docs | README + HANDOFF_P0 + MASTER_ORCHESTRATION consistency check |
| Interface lock integrity | Command/ID/edge/envelope/hook contracts are explicitly documented | README locked interface table |
| Source coverage | All 16 required sources are listed and used in landscape inventory | `outputs/p0-research/landscape-comparison.md` source ledger |
| Reuse precision | Every reuse decision names exact repo files | `outputs/p0-research/reuse-vs-build-matrix.md` |
| Build justification | Every build decision explains insufficiency of existing code | matrix + constraints doc |
| Phase operability | Every phase includes owners, outputs, entry and exit gates | `MASTER_ORCHESTRATION.md` |

## P1 Exit Rubric (Go/No-Go for P2)

| Dimension | Target |
|---|---|
| Architectural ambiguity | `TBD = 0` across all P1 design outputs |
| Deterministic IDs | Stable ID contract + fixture examples approved |
| Persistence contract | `AstKgEpisodeV1` + idempotent replay policy approved |
| Hook contract | XML packet, ranking, timeout/fallback policy approved |
| Delta strategy | changed-file + widening heuristic + invalidation policy approved |
| Rollout safety | staged rollout + fallback controls approved |

## P2-P4 Quantitative Readiness Rubric

| Category | Metric | Target |
|---|---|---|
| Coverage/correctness | Exported symbol coverage | `>=98%` |
| Coverage/correctness | Import edge precision | `>=95%` |
| Coverage/correctness | Call edge precision | `>=90%` |
| Coverage/correctness | Determinism | `100%` |
| Semantic quality | Required-tag parse success | `>=99%` |
| Semantic quality | Domain semantic edge precision | `>=90%` |
| Semantic quality | Semantic edge recall | `>=85%` |
| Query usefulness | Top-5 hit rate | `>=80%` |
| Query usefulness | Hook relevance | `>=4.0/5` |
| Query usefulness | Hook p95 | `<=1.5s` |
| Query usefulness | Hook p99 | `<=2.5s` |
| Agentic outcome | Success-rate delta | `+10pp min` |
| Agentic outcome | Hallucination incident delta | `-30% min` |
| Agentic outcome | First-pass check+lint delta | `+20% min` |
| Agentic outcome | Median token cost delta | `-10% min` |

## Failure Conditions
1. Any required source omitted.
2. Any locked default/interface changed without ADR.
3. Reuse/build rows lack exact file proof.
4. Phase definition missing owners/outputs/gates.
5. P1 exits with unresolved architectural `TBD`.
