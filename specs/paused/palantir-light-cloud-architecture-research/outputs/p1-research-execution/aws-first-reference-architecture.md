# AWS-First Reference Architecture

## Objective

Define the target control plane and data plane for a Palantir-light platform that preserves AWS-first constraints while remaining extensible to selective specialized services when required [CIT-004][CIT-005].

## Architecture Overview

- Control plane: IAM + SCP guardrails, policy decision services, workflow orchestration, and centralized telemetry/audit services [CIT-010][CIT-011][CIT-012][CIT-020].
- Data plane: API workloads, workflow state, collaboration state, and provenance artifacts with regionally scoped replication and encryption controls [CIT-017][CIT-019].
- Security and policy plane: explicit-deny-first access model with org-level guardrails and key-management controls [CIT-010][CIT-011][CIT-019].

## Service Mapping

| Capability | Proposed Service Pattern | Evidence |
|---|---|---|
| RPC/HTTP/MCP runtime | API Gateway (HTTP + WebSocket) fronting application services deployed through SST function components; workflow callbacks handled via Step Functions integrations | CIT-014, CIT-028, CIT-012, CIT-013 |
| Durable workflows | Step Functions state machines with service integrations and event routing for asynchronous coordination | CIT-012, CIT-013 |
| Provenance/audit | CloudTrail integrity-validated audit stream + CloudWatch telemetry stream + KMS-managed encryption boundaries | CIT-018, CIT-020, CIT-019 |
| Realtime collaboration | AppSync subscriptions for live updates, conflict-aware sync semantics, and DynamoDB Global Tables for multi-region replication patterns | CIT-015, CIT-016, CIT-017 |
| Observability stack | CloudWatch baseline + OTel instrumentation via ADOT + managed Prometheus/Grafana visualization path | CIT-020, CIT-021, CIT-022, CIT-026, CIT-034 |
| Cost governance | Budgets and anomaly detection alarms wired to throttling/kill-switch runbooks in workflow/runtime control paths | CIT-024, CIT-025 |

## Reference Topology

1. Ingress enters API Gateway (HTTP/WebSocket), which routes authenticated calls to runtime handlers.
2. Policy evaluation executes before privileged actions, combining org/account guardrails with application policy rules.
3. Long-running work is delegated to Step Functions and emits provenance/audit checkpoints per step.
4. Telemetry and audit artifacts flow to CloudWatch and CloudTrail integrity channels.
5. Collaboration updates propagate via AppSync subscription paths and conflict-aware synchronization.

## Regional and Residency Posture

- Sensitive data remains US-resident during initial target state, with region selection constrained to approved US AWS regions [CIT-004].
- Multi-region active-active is enabled only where collaboration/recovery requirements justify Global Tables complexity [CIT-017][CIT-023].

## Residual Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Over-centralizing everything in AWS services may reduce future portability | medium | Preserve module isolation in IaC and keep policy/provenance contracts implementation-agnostic [CIT-030][CIT-033]. |
| WebSocket + workflow resume semantics can drift across runtime boundaries | high | Standardize resume token/idempotency contracts and validate in VC-004/VC-005 scenarios [CIT-002][CIT-012][CIT-014]. |
| Observability cardinality can increase cost unexpectedly | medium | Enforce SLO-driven telemetry budgets and anomaly alerts [CIT-021][CIT-024][CIT-025]. |

## Inference Notes

1. Inference: a single baseline AWS pattern is favored for first production architecture because it minimizes control-surface fragmentation during SOC2-path hardening.
2. Inference: specialized providers remain conditional extension points, not default dependencies, unless they close a material validated gap.
