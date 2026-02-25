# Provider Evaluation Rubric

## Scoring Model

Score each provider option 1-5 per criterion, multiply by weight, sum to weighted score.

| Criterion Key | Criterion | Weight | Description |
|---|---|---:|---|
| securityCompliance | Security and compliance fit | 30 | Alignment with SOC2 Type II trajectory and control maturity |
| reliability | Reliability and recoverability | 20 | Failure handling, durability, restore/recovery capabilities |
| provenanceAudit | Provenance and audit completeness | 15 | Native or practical support for lineage and audit requirements |
| effectRuntimeFit | Effect v4 runtime fit | 15 | Suitability for RPC/HTTP/MCP, streaming, and durable workflows |
| costPredictability | Cost predictability | 10 | Cost transparency and guardrail support |
| vendorRiskPortability | Vendor risk and portability | 10 | Lock-in profile and migration risk |

## Deterministic Scoring Algorithm

1. Use integer criterion scores in `[1, 5]`.
2. Compute normalized contribution per criterion as `normalizedContribution = (criterionScore / 5) * weight`.
3. Compute `weightedPercent = sum(normalizedContribution)`; valid range is `[20, 100]`.
4. Compute `weightedScore = sum(criterionScore * weight) / 100`; valid range is `[1.0, 5.0]`.
5. Weight-sum invariant: `sum(weights) = 100` is required; otherwise scorecard is invalid.

## Decision Bands

- `accept`: `weightedScore >= 4.0` and all rejection gates pass.
- `conditional`: `3.2 <= weightedScore < 4.0` and all rejection gates pass.
- `reject`: `weightedScore < 3.2` or any rejection gate fails.

## Rejection Gates (Machine-Checkable)

| Gate ID | Condition | Outcome on Failure |
|---|---|---|
| RG-001 | `criterionScores.securityCompliance >= 4` | reject |
| RG-002 | `criterionScores.provenanceAudit >= 3` | reject |
| RG-003 | `criterionScores.effectRuntimeFit >= 3` | reject |
| RG-004 | `count(primary evidence refs) >= 3` and all criterion scores map to citation IDs in a criterion-to-evidence table | reject |

## Tie-Break Rules

When two candidates differ by `<= 0.15` `weightedScore`:

1. Higher `securityCompliance` wins.
2. If tied, higher `provenanceAudit` wins.
3. If tied, higher `vendorRiskPortability` wins.
4. If still tied, prefer the candidate that preserves AWS-first baseline with fewer architecture exceptions.

## Minimum Evidence Rules

1. Every numeric criterion score must map to at least one citation ID.
2. Inferred scores must be marked `inferred` with rationale and confidence label.
3. Final recommendation must include at least one accepted option and one fallback option with evidence refs.

## Criterion-to-P2 Scenario Trace

| Criterion Key | Validation Scenarios |
|---|---|
| securityCompliance | VC-001, VC-008 |
| reliability | VC-004, VC-005 |
| provenanceAudit | VC-002, VC-003, VC-008 |
| effectRuntimeFit | VC-004, VC-005 |
| costPredictability | VC-007 |
| vendorRiskPortability | VC-007 |

## Scorecard Structure (`ProviderScorecard`)

```ts
{
  provider: "aws",
  criterionScores: {
    securityCompliance: 5,
    reliability: 4,
    provenanceAudit: 4,
    effectRuntimeFit: 4,
    costPredictability: 4,
    vendorRiskPortability: 3
  },
  weightedScore: 4.25,
  evidenceRefs: ["SRC-001", "SRC-014"],
  decision: "accept"
}
```
