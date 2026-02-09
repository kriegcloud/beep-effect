# P4 Orchestrator Prompt

You are executing Phase P4 of the `todox-wealth-mgmt-knowledge-mvp` spec: **Scale / Production Readiness**.

## Hard Rules

- P4 is production readiness work: do not widen product scope beyond the MVP demo narrative.
- Security/compliance is non-negotiable:
  - no PII logging
  - explicit disclaimers for meeting-prep output (no guarantees)
  - retention + audit posture documented for evidence and claims
- Multi-tenant isolation is non-negotiable: cross-org tests must exist and pass.
- Observability is required: OTLP + dashboards + actionable alerts must exist and be validated.
- Workflow topology must be explicit and enforced:
  - single-node vs multi-node/workflow cluster choice
  - if multi-node, include table prefixing/ownership/isolation gates
- **Research stream rule**:
  - Use `outputs/R0_SYNTHESIZED_REPORT_V2.md` as the source of research truth.
  - If more detail is needed, commission an explorer report and have it merged into R0 before proceeding.
- **Handoff gate (explicit)**:
  - If context feels ~50% consumed (or before starting a large/risky task), STOP and checkpoint:
    - update `handoffs/HANDOFF_P4.md`
    - update `handoffs/P4_ORCHESTRATOR_PROMPT.md` with current state + remaining work
  - At the same gate, update the release/rollout gates in `README.md` so the spec stays operator-ready.

## Inputs

- `README.md` (production readiness gates, rollout plan, phase exit criteria)
- `AGENT_PROMPTS.md` (acceptance gates to preserve)
- `outputs/R0_SYNTHESIZED_REPORT_V2.md` (source of research truth)
- Templates:
  - `templates/PROD_READINESS_CHECKLIST_TEMPLATE.md`
  - `templates/RUNBOOK_TEMPLATE.md`

## Objectives (Pass/Fail)

1. Production readiness gates are closed:
   - Security/compliance, multi-tenant isolation, ops, observability, workflow topology.
2. Performance and reliability are proven for MVP:
   - Defined targets and test results exist (latency, error rate, capacity).
3. Runbooks exist and are usable:
   - Primary operational tasks and incident playbooks are documented.
4. Rollout is staged:
   - Pilot -> staging -> production rollout plan exists with backout and monitoring gates.

## Required Outputs (Update In-Place)

- Update `README.md` with a current, production-ready gate checklist and rollout plan.
- Produce environment-specific readiness checklists and runbooks using the templates (recommended under `outputs/`).

## Verification

```bash
# Record exact commands and PASS/FAIL + date after execution.
#
# Include:
# - load/perf tests
# - isolation tests
# - disaster recovery / backup restore verification (at least tabletop for MVP)
# - alert verification (synthetic or controlled failure)
```

