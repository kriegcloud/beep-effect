# Research Backlog

## `ResearchQuestion` Backlog

### Batch 1: Critical Path (High Importance + High Decision Impact)

| id | question | importance | owner | status | decisionImpact |
|---|---|---|---|---|---|
| RQ-001 | Which provider mix best satisfies security/compliance while maintaining delivery speed? | high | platform-architecture | planned | high |
| RQ-002 | What is the best split of responsibilities between SST and Terraform/OpenTofu? | high | iac-architecture | planned | high |
| RQ-003 | How should policy precedence work between mandatory controls, purpose controls, and roles? | high | security-architecture | planned | high |
| RQ-004 | Which provenance model guarantees end-to-end traceability for AI-assisted outputs? | high | data-architecture | planned | high |
| RQ-005 | What runtime pattern best supports interruptible durable workflows and streaming continuity? | high | runtime-architecture | planned | high |
| RQ-008 | How should compliance controls map to architecture components and evidence artifacts? | high | compliance-architecture | planned | high |
| RQ-009 | Which cost controls prevent runaway workloads in agent/pipeline execution paths? | high | finops-architecture | planned | high |

### Batch 2: Secondary Path (Medium Importance and/or Medium Decision Impact)

| id | question | importance | owner | status | decisionImpact |
|---|---|---|---|---|---|
| RQ-006 | What local-first collaboration model aligns with policy and access propagation constraints? | medium | collaboration-architecture | planned | medium |
| RQ-007 | What OTEL/Grafana topology best supports forensic-grade observability? | medium | sre-architecture | planned | medium |
| RQ-010 | Which graph-derived facts are reliable enough to influence architecture decisions? | medium | knowledge-architecture | planned | medium |

## Definition of `answered`

A question can move to `status = answered` only when all criteria below are true:

1. Evidence set includes at least two primary sources, or one primary source plus a documented limitation note.
2. Conclusion statement is explicit and includes decision impact summary.
3. Relevant P1 artifact section references are included.
4. Source IDs and citation IDs are recorded in `source-citations.md`.
5. Open uncertainty is stated with owner and follow-up (if any).

## P2 Blocking Dependencies

| Dependency ID | Blocking Relationship | Reason |
|---|---|---|
| DEP-001 | P2 validation cannot start until `RQ-001` through `RQ-005` and `RQ-008` are `answered` | These items define provider, IaC, policy, provenance, runtime, and compliance baselines |
| DEP-002 | Final go/no-go recommendation cannot be marked without `RQ-009` `answered` | Cost guardrails are a release-critical decision axis |
| DEP-003 | Graph-derived findings cannot drive provider/runtime conclusions unless `RQ-010` is `answered` | Prevents unsupported supplemental facts from changing primary decisions |

## Prioritization Rules

1. Execute Batch 1 before Batch 2 unless an explicit dependency exception is logged.
2. Deferred items require explicit reason, risk note, and next review date.
3. Any change to owner or priority must be logged in `REFLECTION_LOG.md`.
