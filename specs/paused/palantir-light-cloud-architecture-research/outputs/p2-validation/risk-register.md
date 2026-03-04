# Risk Register

## `RiskEntry` Register

| id | risk | severity | likelihood | mitigation | owner | status |
|---|---|---|---|---|---|---|
| RISK-001 | Policy precedence implementation may drift without formal separation-of-duties approval workflow. | high | medium | Enforce dual-authorization approvals, policy-change workflow checks, and immutable approval audit records. | security-architecture | mitigating |
| RISK-002 | Provenance traceability may be insufficient for processing-integrity audit narratives across high-risk workflows. | high | medium | Produce workflow-class trace exemplars and require envelope completeness checks in release readiness review. | data-architecture | mitigating |
| RISK-003 | Interrupt/resume under reconnect bursts may duplicate side effects if idempotency guarantees are not empirically validated. | critical | medium | Adopt `RRC-001.v1` contract in `platform-runtime-v1` (resume token + checkpoint correlation + idempotency fence hooks), then execute RR-001..RR-006 reconnect/replay stress scenarios with evidence packets; require duplicate rate <=1/10,000 and zero critical duplicate-side-effect findings before release go decision. | runtime-architecture | open |
| RISK-004 | Recovery readiness may be overstated because RTO/RPO assumptions lack full playbook validation. | high | medium | Run incident playbook exercises for resume/recovery paths and capture measured RTO/RPO evidence. | runtime-architecture | open |
| RISK-005 | Cost spikes from retry storms and high-cardinality telemetry can degrade predictability during incidents. | medium | medium | Activate anomaly triggers, telemetry budget controls, and throttling/kill-switch procedures from cost control matrix. | finops-architecture | mitigating |

## Risk Posture Summary

- Open critical risks: 1 (`RISK-003`)
- Open high risks: 1 (`RISK-004`)
- Mitigating high risks: 2 (`RISK-001`, `RISK-002`)
- Mitigating medium risks: 1 (`RISK-005`)
