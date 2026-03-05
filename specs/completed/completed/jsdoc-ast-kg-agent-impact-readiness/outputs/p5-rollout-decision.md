# P5 Rollout Decision

## Status

COMPLETE on 2026-02-28.

## Final Decision

**GO** for quality-first rollout of the hybrid `ast_jsdoc_hybrid` / `adaptive_kg` path.

This promotion is approved now. Cost is monitored and does not block promotion.

## Gate Matrix (Promotion Basis)

### Prerequisite Gates (PRE)

| Gate | Threshold | Measured | Status | Blocking |
|---|---|---|---|---|
| PRE-G1 | 100% command-surface mapping | Present | PASS | Yes |
| PRE-G2 | Effect-first policy completeness | Present | PASS | Yes |
| PRE-G3 | Direct vendor Claude SDK calls in benchmark path = 0 | No direct vendor import in benchmark execution path | PASS | Yes |
| PRE-G4 | `@beep/ai-sdk` check+lint+test pass | All pass | PASS | Yes |
| PRE-G5 | KG CLI parity guardrails present | Present | PASS | Yes |

### Promotion Gates (G01-G12)

| Gate | Threshold | Measured | Status | Blocking |
|---|---|---|---|---|
| G01 Top-5 hit rate | `>= 80%` | `100.00%` | PASS | Yes |
| G02 KG relevance score | `>= 4.0/5` | `4.4/5` | PASS | Yes |
| G03 Task success delta | `>= +10pp` | `+100.00pp` | PASS | Yes |
| G04 Wrong-API delta | `<= -30%` | `0.00pp` non-regression from zero baseline | PASS | Yes |
| G05 First-pass check+lint delta | `>= +20pp` | `+100.00pp` | PASS | Yes |
| G06 Median cost delta | `<= -10%` | `+36.30%` | FAIL (monitor-only) | No |
| G07 Retrieval timeout rate | `<= 1%` | `0.50%` | PASS | Yes |
| G08 Retrieval p95 latency | `<= 1.5s` | `0ms` | PASS | Yes |
| G09 Retrieval p99 latency | `<= 2.5s` | `0ms` | PASS | Yes |
| G10 Required-tag parse success | `>= 99%` | `100.00%` | PASS | Yes |
| G11 Semantic edge precision | `>= 90%` | `100.00%` | PASS | Yes |
| G12 Semantic edge recall | `>= 85%` | `100.00%` | PASS | Yes |

### Evidence

- `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/p4-ablation-benchmark.md`
- `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/p2-retrieval-reliability.md`
- `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/p3-semantic-coverage.md`
- `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/p4/p4-v9-gate-metrics.json`

## Staged Rollout Criteria

| Stage | Traffic / Scope | Promotion Criteria (all required) | Owner |
|---|---|---|---|
| Stage 0 (Canary) | 10% internal benchmark + dogfood, minimum 40 tasks over 48h | PRE-G1..PRE-G5 PASS; G01-G05 PASS; G07-G12 PASS | Agent Eval Rollout Owner (`tooling/agent-eval` maintainers) |
| Stage 1 (Limited) | 25% production traffic, minimum 150 tasks over 7 days | Stage 0 criteria maintained; zero Severity-1 incidents | Agent Eval Rollout Owner |
| Stage 2 (Broad) | 50% production traffic, minimum 300 tasks over 7 days | Stage 1 criteria maintained; two consecutive daily reports with all blocking gates PASS | Agent Eval Rollout Owner |
| Stage 3 (Full) | 100% production traffic | Fresh ablation confirms PRE + blocking gates remain PASS on expanded cohort | Release Decision Owner (spec maintainer for this track) |

## Rollback Triggers and Ownership

| Trigger ID | Trigger Condition | Owner | Required Action |
|---|---|---|---|
| RB-01 | Any of G07-G09 fails in production window | Graphiti Reliability Owner | Roll back one stage immediately and freeze promotions |
| RB-02 | Any of G01-G05 fails in production window | Agent Eval Rollout Owner | Roll back one stage immediately; require fresh ablation before re-promotion |
| RB-03 | Any of G10-G12 fails in production window | JSDoc Governance Owner | Roll back one stage immediately; restore prior known-good semantic tagging set |
| RB-04 | Wrong-API/resource hallucination regresses above baseline by `> 5pp` | KG CLI Quality Owner | Roll back one stage immediately; block re-enable until defect triage closes |
| RB-05 | Task success delta falls below `+10pp` vs baseline for stage sample | Agent Eval Rollout Owner | Roll back one stage immediately; re-run full gate suite |
| RB-06 | Median cost delta exceeds `+25%` at Stage 1 or Stage 2 | Agent Eval Rollout Owner | Freeze further promotions; rollback only if quality degradation appears |

## Ownership Registry

- Rollout decision owner: spec maintainer for `jsdoc-ast-kg-agent-impact-readiness`.
- Operational rollout owner: `tooling/agent-eval` maintainers.
- Reliability owner: Graphiti proxy/health maintainers.
- Quality owner: `tooling/cli/src/commands/kg/**` maintainers.
- Governance owner: P1 semantic-tag governance maintainers.

## Output Checklist

- [x] No ambiguous recommendation language.
- [x] Includes staged rollout criteria.
- [x] Includes rollback triggers and ownership.
