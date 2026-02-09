# Phase P3 Orchestrator Prompt

Copy-paste this prompt to start Phase P3 execution.

---

## Prompt

You are implementing Phase P3 of the `todox-wealth-mgmt-knowledge-mvp` spec: **IaC / Staging**.

### Context

This is infrastructure work only. Product scope remains the MVP demo narrative and `/knowledge` surface.

Critical infra invariants:
- `@beep/shared-env` schemas are authoritative: env vars must match exactly.
- Migrations run as a job (pre-deploy), not at app startup.
- OTLP traces/logs/metrics must be visible with actionable alerts.

### Your Mission

Provision and deploy staging reproducibly with Terraform, and record evidence of successful runs.

- Provision and deploy staging reproducibly (Terraform baseline).
- Wire secrets via Secret Manager (no plaintext secrets in repo/CI logs).
- Add a migrations job and ensure failures block deploy.
- Verify telemetry in staging and record links/commands in outputs.

### Critical Patterns

Include the invariants that must be preserved in infra work.

**Env schema is source of truth**:
```bash
bun run check
```

**Migrations as a job**:
```md
Deploy flow:
1. Run migrations job (serialized)
2. Deploy Cloud Run service
3. Smoke test demo path
```

### Reference Files

- `specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/P3_IAC_GATES_staging.md`
- `specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/P3_IAC_GATES_prod.md`
- `specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/R14_IAC_TOOLING_DECISION_SST_VS_TF.md`
- `specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/P4_RUNBOOK_beep-api_staging.md`

### Verification

Record exact commands, PASS/FAIL, and date:

```bash
terraform plan
terraform apply
migrations job run
smoke test: login -> connections -> /knowledge -> evidence inspect
```

### Success Criteria

- [ ] Staging is reproducible (no manual edits outside `terraform apply` + deploy pipeline).
- [ ] Secrets are managed and injected at runtime; none logged.
- [ ] Telemetry visible; alerts actionable.

### Handoff Document

Read full context in: `specs/pending/todox-wealth-mgmt-knowledge-mvp/handoffs/HANDOFF_P3.md`

### Next Phase

After completing Phase P3:
1. Update `REFLECTION_LOG.md` with learnings
2. Create/update `handoffs/HANDOFF_P4.md`
3. Create/update `handoffs/P4_ORCHESTRATOR_PROMPT.md`
