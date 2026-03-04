# Provider Shortlist Analysis

## Scope

Evaluate three provider strategies against the weighted rubric and rejection gates defined in P0, then lock a recommended option and fallback option for P1 architecture work [CIT-001][CIT-004].

## Candidate Set

1. `aws-dominant`: AWS-managed services for core runtime, workflow, observability, and policy/audit controls.
2. `aws-plus-specialized`: AWS baseline with selective specialized managed platforms (for example Temporal Cloud for workflow depth and Grafana Cloud for observability operations).
3. `multi-cloud-parity`: AWS + second hyperscaler parity from day one.

## Criterion-to-Evidence Map

| Criterion Key | Evidence Refs | Rationale |
|---|---|---|
| securityCompliance | CIT-010, CIT-011, CIT-018, CIT-019, CIT-036, CIT-037 | IAM/SCP guardrails, audit integrity, key management, and SOC2/TSC alignment inputs. |
| reliability | CIT-012, CIT-013, CIT-023 | Durable workflow orchestration, service integrations, and reliability guidance. |
| provenanceAudit | CIT-006, CIT-007, CIT-018 | Internal provenance/audit blueprint plus CloudTrail integrity controls. |
| effectRuntimeFit | CIT-012, CIT-013, CIT-014, CIT-015, CIT-026, CIT-028 | Streaming APIs, stateful workflows, and OTel-compatible runtime instrumentation. |
| costPredictability | CIT-024, CIT-025, CIT-029, CIT-031 | Budget controls, anomaly controls, and IaC plan/state review discipline. |
| vendorRiskPortability | CIT-027, CIT-030, CIT-032, CIT-033 | Multi-provider abstractions and modular IaC portability levers. |

## Provider Scorecards (`ProviderScorecard`)

Scoring formula follows P0 rubric: `weightedScore = sum(criterionScore * weight) / 100`, with gate checks `RG-001..RG-004` [CIT-001].

| provider | criterionScores | weightedScore | weightedPercent | evidenceRefs | decision |
|---|---|---:|---:|---|---|
| aws-dominant | `{securityCompliance: 5, reliability: 4, provenanceAudit: 4, effectRuntimeFit: 4, costPredictability: 4, vendorRiskPortability: 3}` | 4.20 | 84.0 | `CIT-010,CIT-011,CIT-012,CIT-013,CIT-014,CIT-018,CIT-019,CIT-020,CIT-023,CIT-024,CIT-025,CIT-026,CIT-029` | accept |
| aws-plus-specialized | `{securityCompliance: 4, reliability: 5, provenanceAudit: 4, effectRuntimeFit: 5, costPredictability: 3, vendorRiskPortability: 4}` | 4.25 | 85.0 | `CIT-010,CIT-011,CIT-012,CIT-013,CIT-014,CIT-015,CIT-020,CIT-021,CIT-022,CIT-024,CIT-025,CIT-038,CIT-039` | accept |
| multi-cloud-parity | `{securityCompliance: 3, reliability: 4, provenanceAudit: 3, effectRuntimeFit: 3, costPredictability: 2, vendorRiskPortability: 5}` | 3.30 | 66.0 | `CIT-010,CIT-011,CIT-012,CIT-023,CIT-027,CIT-029,CIT-030,CIT-031,CIT-032,CIT-033` | reject |

## Gate Results

| Provider | RG-001 securityCompliance >= 4 | RG-002 provenanceAudit >= 3 | RG-003 effectRuntimeFit >= 3 | RG-004 evidence coverage >= 3 primary + criterion mapping | Result |
|---|---|---|---|---|---|
| aws-dominant | pass | pass | pass | pass | pass |
| aws-plus-specialized | pass | pass | pass | pass | pass |
| multi-cloud-parity | fail | pass | pass | pass | fail |

## Findings

1. `aws-plus-specialized` is highest raw score, driven by workflow and observability depth assumptions for Temporal Cloud + Grafana Cloud [CIT-038][CIT-039].
2. `aws-dominant` remains strongest for baseline security/compliance alignment and governance simplicity under AWS-first constraints [CIT-004][CIT-010][CIT-011].
3. `multi-cloud-parity` fails security rejection threshold and introduces immediate operational/cost overhead before first production baseline hardening [CIT-001][CIT-024][CIT-025].

## Decision Call

- Recommended option: `aws-dominant`.
- Fallback option: `aws-plus-specialized`.

Tie-break application: score delta between top two options is `0.05` (<= `0.15`), so tie-break rule applies and higher `securityCompliance` wins (`5` vs `4`) [CIT-001].

## Inference Notes

1. Inference: specialized vendors can improve specific subsystems, but introducing them during baseline control-plane build increases cross-provider control mapping and audit complexity.
2. Inference: portability score for `aws-dominant` is intentionally non-maximal to reflect future migration cost if AWS-specific primitives become deeply embedded.
