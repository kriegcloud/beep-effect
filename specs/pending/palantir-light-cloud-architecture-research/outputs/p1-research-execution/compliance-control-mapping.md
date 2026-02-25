# Compliance Control Mapping

## Objective

Map SOC2-oriented control requirements to concrete architecture components and evidence references, and identify residual gaps that must be closed before implementation readiness [CIT-004][CIT-036][CIT-037].

## `ControlMappingEntry` Table

| controlId | requirement | architectureComponent | evidenceRef | gap |
|---|---|---|---|---|
| SOC2-CC6 | Logical and access controls enforce least privilege and prevent unauthorized access. | Policy precedence engine + IAM policy model + SCP guardrails | CIT-010, CIT-011, CIT-006, CIT-036 | minor |
| SOC2-CC7 | Change management, monitoring, and anomaly response controls are defined and operationalized. | Split-stack IaC plan gates + CloudWatch/Prometheus/Grafana telemetry + alerting workflow | CIT-020, CIT-021, CIT-022, CIT-024, CIT-025, CIT-031, CIT-036 | none |
| SOC2-A1 | Availability controls support resilience, failover, and service continuity. | Step Functions durable orchestration + reliability posture + collaboration replication model | CIT-012, CIT-013, CIT-017, CIT-023, CIT-036 | minor |
| SOC2-C1 | Confidentiality controls protect sensitive data in storage and transit with key governance. | KMS key governance + mandatory control policy model + data boundary enforcement | CIT-019, CIT-006, CIT-010, CIT-036 | none |
| SOC2-PI1 | Processing integrity controls ensure complete, accurate, and authorized processing with traceability. | Provenance envelope model + policy decision records + audit-integrity validation | CIT-006, CIT-018, CIT-002, CIT-036, CIT-037 | minor |

## Gap Notes and Ownership

| Gap ID | Related Control | Gap Summary | Severity | Owner | Planned Closure |
|---|---|---|---|---|---|
| GAP-C6-01 | SOC2-CC6 | Separation-of-duties workflow for policy rule changes is not yet formalized in runtime governance process. | medium | security-architecture | Add change-approval workflow + dual authorization check in P2 validation evidence. |
| GAP-A1-01 | SOC2-A1 | Recovery objectives are specified directionally but not yet scenario-tested against full incident playbooks. | medium | runtime-architecture | Validate RTO/RPO assumptions in VC-004 and VC-005 execution outputs. |
| GAP-PI1-01 | SOC2-PI1 | Provenance envelope schema is defined but requires sample evidence traces across all high-risk workflow classes. | medium | data-architecture | Produce trace exemplars during P2 validation for VC-002 and VC-008. |

## Traceability to P1 Artifacts

| Control | Primary P1 Artifact(s) |
|---|---|
| SOC2-CC6 | `policy-plane-design.md`, `runtime-workflow-architecture.md` |
| SOC2-CC7 | `iac-operating-model.md`, `observability-and-sre-architecture.md`, `cost-and-capacity-model.md` |
| SOC2-A1 | `aws-first-reference-architecture.md`, `runtime-workflow-architecture.md`, `local-first-collaboration-architecture.md` |
| SOC2-C1 | `policy-plane-design.md`, `aws-first-reference-architecture.md` |
| SOC2-PI1 | `provenance-audit-architecture.md`, `source-citations.md` |

## Inference Notes

1. Inference: control requirement summaries are aligned to SOC2/TSC categories and project capability requirements; exact audit wording must be finalized with assessor-specific control narratives.
2. Inference: current gaps are classified as non-material for architecture direction but must be closed before go/no-go recommendation.
