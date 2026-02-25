# Observability and SRE Architecture

## Objective

Define an OTel-aligned telemetry architecture with actionable SLOs, alerting, and incident forensics support for runtime, workflow, policy, and collaboration systems [CIT-002][CIT-020][CIT-034][CIT-035].

## Telemetry Model

| Signal | Collection Pattern | Evidence |
|---|---|---|
| Metrics | OTel metrics pipeline into managed Prometheus-compatible storage and CloudWatch alarm integration | CIT-021, CIT-026, CIT-034 |
| Logs | Structured application and audit logs to CloudWatch with correlation IDs | CIT-020, CIT-018 |
| Traces | OTel trace instrumentation across ingress, policy evaluation, workflow tasks, and tool execution | CIT-026, CIT-034, CIT-035 |
| Events | Domain events for policy decisions, provenance milestones, and workflow transitions | CIT-020, CIT-012, CIT-013 |

## SLO and Alerting Controls

| SLO Domain | Baseline Target | Alert Trigger |
|---|---|---|
| API availability | >=99.9% monthly | 5-minute burn-rate breach |
| Workflow resume success | >=99.5% of interrupted workflows resume without manual intervention | resume failure ratio >0.5% |
| Streaming continuity | <=1 duplicate event per 10,000 replayed events | dedupe threshold breach |
| Audit pipeline latency | p95 <= 60s from event to searchable index | p95 > 60s for 15 minutes |

## SRE Controls

- SLO set definition is bound to high-priority capabilities and validation scenarios [CIT-002][CIT-023].
- Alert routing strategy separates customer-impacting, security-impacting, and cost-impacting incidents.
- Incident reconstruction workflow requires correlation IDs across logs, traces, policy decisions, and provenance envelopes.

## Platform Composition

1. CloudWatch serves as baseline managed telemetry and alarm plane [CIT-020].
2. Managed Prometheus and Managed Grafana provide high-cardinality metrics and investigation dashboards [CIT-021][CIT-022].
3. ADOT standardizes OTel-compatible collection/export patterns from runtime services [CIT-026][CIT-034].

## Cost and Cardinality Guardrails

| Risk | Guardrail | Evidence |
|---|---|---|
| High-cardinality metrics explosion | Cardinality budgets per service; drop policy for non-critical labels | CIT-021, CIT-024 |
| Log volume spikes | Structured log sampling for non-critical classes | CIT-020, CIT-025 |
| Trace overcollection | Tail-based sampling for high-throughput paths | CIT-034, CIT-035 |

## Inference Notes

1. Inference: dual telemetry path (CloudWatch + Prometheus/Grafana) balances baseline operational simplicity and deep forensic analysis.
2. Inference: strict correlation-ID propagation is the minimum requirement for policy/provenance/audit forensic completeness.
