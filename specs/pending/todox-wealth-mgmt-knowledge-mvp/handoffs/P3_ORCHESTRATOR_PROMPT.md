# P3 Orchestrator Prompt

You are executing Phase P3 of the `todox-wealth-mgmt-knowledge-mvp` spec: **IaC / Staging**.

## Hard Rules

- P3 may implement infrastructure and deployment automation, but keep the application scope unchanged (MVP demo only).
- Enforce environment-schema truth:
  - `@beep/shared-env` schemas are authoritative; IaC and deployment variables must match them exactly.
  - Do not introduce ad-hoc env var names that bypass schema validation.
- Observability is required: OTLP traces/logs/metrics must be wired and verified in staging.
- Migrations rule: run database migrations as a job (serialized, pre-deploy), not at app startup.
- **Research stream rule**:
  - Use `outputs/R0_SYNTHESIZED_REPORT_V2.md` as the source of research truth.
  - If more IaC detail is needed, commission an explorer report and have it merged into R0 before proceeding.
- **Handoff gate (explicit)**:
  - If context feels ~50% consumed (or before starting a large/risky task), STOP and checkpoint:
    - update `handoffs/HANDOFF_P3.md`
    - update `handoffs/P3_ORCHESTRATOR_PROMPT.md` with current state + remaining work
  - At the same gate, create/update next-phase artifacts even if P3 is not complete:
    - `handoffs/HANDOFF_P4.md`
    - `handoffs/P4_ORCHESTRATOR_PROMPT.md`

## Inputs

- `README.md` (phase plan, production readiness gates, rollout)
- `AGENT_PROMPTS.md` (non-negotiable acceptance gates)
- `outputs/R0_SYNTHESIZED_REPORT_V2.md` (source of research truth)
- `outputs/R5_IAC_OPS_PRODUCTION_PLAN.md` (only after its key points have been merged into R0; otherwise commission a synthesis update)
- Templates:
  - `templates/IAC_GATES_TEMPLATE.md`
  - `templates/PROD_READINESS_CHECKLIST_TEMPLATE.md`
  - `templates/RUNBOOK_TEMPLATE.md`

## Objectives (Pass/Fail)

1. Staging is reproducible:
   - A staging environment can be provisioned and deployed without manual edits.
2. Secrets + config are production-shaped:
   - Secrets live in a secret manager, injected at runtime, never logged.
   - Env vars align with schema and are validated before deploy.
3. Database migrations are safe:
   - A migrations job exists and is run as a pre-deploy step.
4. Observability is working:
   - OTLP traces/logs/metrics are visible in dashboards; alerts exist for basic availability and error rates.
5. Demo smoke path passes in staging:
   - Login + `/knowledge` render + evidence inspect works against staging data.

## Required Outputs (Update In-Place)

- Update `README.md` with staging/prod runbook links and gating status as they become concrete.
- Produce environment-specific checklists using the templates (recommended location under `outputs/`).

## Verification

```bash
# Record exact commands and PASS/FAIL + date after execution.
#
# Include:
# - terraform plan/apply (or equivalent)
# - migrations job run
# - health checks
# - telemetry verification
# - demo smoke path
```

## Phase Completion Requirement (Handoffs)

At the end of P3, create/update:

- `handoffs/HANDOFF_P4.md`
- `handoffs/P4_ORCHESTRATOR_PROMPT.md`

