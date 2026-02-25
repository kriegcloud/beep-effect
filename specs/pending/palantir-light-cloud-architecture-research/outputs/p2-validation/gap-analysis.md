# Gap Analysis

## Objective

Capture unresolved architecture gaps identified during P2 validation and map them to ownership and closure actions.

## Gap Table

| Gap ID | Gap | Severity | Impacted Area | Validation Link | Evidence Ref | Proposed Resolution | Owner |
|---|---|---|---|---|---|---|---|
| GAP-C6-01 | Separation-of-duties workflow for policy rule changes is not formalized end-to-end. | high | Policy governance / access control | VC-001, VC-008 | `outputs/p1-research-execution/compliance-control-mapping.md` | Implement dual-authorization workflow for policy changes, including approval audit records and rollback control. | security-architecture |
| GAP-A1-01 | Recovery objectives are documented but not validated against full incident playbooks for interrupt/resume and reconnect paths. | high | Runtime durability / availability | VC-004, VC-005 | `outputs/p1-research-execution/compliance-control-mapping.md`; `outputs/p1-research-execution/runtime-workflow-architecture.md` | Execute scenario-based recovery drills with measurable RTO/RPO outcomes and replay-failure thresholds. | runtime-architecture |
| GAP-PI1-01 | Provenance envelope schema exists but exemplar evidence traces are missing for all high-risk workflow classes. | medium | Provenance / processing integrity | VC-002, VC-008 | `outputs/p1-research-execution/compliance-control-mapping.md`; `outputs/p1-research-execution/provenance-audit-architecture.md` | Produce trace exemplars for each high-risk workflow class with source, transform, tool, and policy linkage. | data-architecture |
| GAP-RT-01 | Replay-safe idempotency controls are specified but not yet evidenced under high-burst reconnect conditions. | critical | Workflow side-effect integrity | VC-004, VC-005 | `outputs/p1-research-execution/runtime-workflow-architecture.md`; `outputs/p1-research-execution/aws-first-reference-architecture.md`; `outputs/p2-validation/validation-plan.md` (`RRC-001`); `outputs/p2-validation/validation-results.md`; `README.md` | `RRC-001` draft is complete. Next: implement `RRC-001.v1` in `platform-runtime-v1`, then execute RR-001..RR-006 stress scenarios and complete evidence packets; close only if duplicate rate <=1/10,000 and duplicate side-effect critical incidents are zero. | runtime-architecture |

## Escalation Rules

- Any unresolved `critical` gap blocks a go decision.
- Any `high` gap requires named owner and dated mitigation milestone.
- Any `partial` validation result must map to one or more gaps above.
