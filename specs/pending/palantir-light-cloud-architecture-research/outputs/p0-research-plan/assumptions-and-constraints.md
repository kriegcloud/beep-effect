# Assumptions and Constraints

```yaml
Version: 1.1.0
Status: active
Last Updated: 2026-02-25
Owner: platform-architecture
```

## Baseline Assumptions (Frozen for P0 Exit)

1. The existing `apps/web` and current infra setup are throwaway scaffolding.
2. The completed Palantir ontology research spec is a primary architecture blueprint input.
3. The target platform requires strong policy, provenance, and audit controls early.
4. Evidence quality matters more than speed for architecture decisions.

## Locked Constraints

| Constraint ID | Constraint | Type |
|---|---|---|
| C-001 | AWS-first hybrid cloud posture | Strategic |
| C-002 | SOC2 Type II path baseline | Compliance |
| C-003 | Split-stack IaC (SST + Terraform/OpenTofu) | Delivery |
| C-004 | US-only sensitive data residency initially | Regulatory |
| C-005 | All research artifacts tracked in `outputs/` | Process |
| C-006 | Validation must cover policy/provenance/runtime/compliance scenarios | Quality |

## Open Assumptions to Validate in P1

| Assumption ID | Assumption | Validation Artifact Targets | Decision Trigger Condition |
|---|---|---|---|
| A-001 | AWS-managed services can satisfy most required capabilities | `provider-shortlist-analysis.md`, `aws-first-reference-architecture.md`, `compliance-control-mapping.md` | Trigger architecture exception review if AWS-dominant option fails any rejection gate or is not top accepted scorecard |
| A-002 | Non-AWS services may still be needed for selected specialized capabilities | `provider-shortlist-analysis.md`, `runtime-workflow-architecture.md`, `cost-and-capacity-model.md` | Trigger specialized-service exception candidate if any `High` capability remains unmet by AWS-managed patterns without material cost/complexity penalty |
| A-003 | Graph-derived runtime facts are useful supplements to doc-based research | `graphiti-fact-extracts.md`, `source-citations.md` | Trigger downgrade to supplemental-only usage when graph-derived claims are not corroborated by primary sources |

## Versioned Change Log

| Version | Date | Change | Author |
|---|---|---|---|
| 1.0.0 | 2026-02-25 | Initial P0 assumptions and constraints baseline | codex |
| 1.1.0 | 2026-02-25 | Added metadata, explicit validation triggers, and versioned change control hardening | codex |

## Change Control

1. If a locked constraint changes during P1/P2, record the change in `REFLECTION_LOG.md` and increment this document version.
2. Version increments:
   - Major: baseline strategic/compliance constraint changes (`C-001` to `C-004`)
   - Minor: process/rubric constraint updates or new assumption rows
   - Patch: wording-only clarifications with no semantic impact
3. Every version change must include date, reason, and downstream artifact impact note.
