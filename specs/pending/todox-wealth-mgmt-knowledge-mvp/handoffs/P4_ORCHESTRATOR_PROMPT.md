# Phase P4 Orchestrator Prompt

Copy-paste this prompt to start Phase P4 execution.

---

## Prompt

You are implementing Phase P4 of the `todox-wealth-mgmt-knowledge-mvp` spec: **Scale / Production Readiness**.

### Context

This phase does not change product scope. It makes the MVP safe to operate:

- No PII logging.
- Meeting-prep output includes compliance-safe disclaimer and avoids guarantees (D-17).
- Evidence/claims are auditable and persisted with deterministic citations.
- Cross-org isolation tests exist and pass.
- Runbooks and rollback are real, not placeholders.

### Your Mission

Close production readiness with executable artifacts and verified ops checks.

- Close the production readiness checklist and runbooks:
  - `outputs/P4_PROD_READINESS_CHECKLIST_prod.md`
  - `outputs/P4_RUNBOOK_beep-api_prod.md`
- Define/validate retention + audit posture for:
  - documents
  - mentions / relation_evidence
  - meeting-prep bullets + citations
- Run and record at least one controlled verification of alerts/rollback in staging.

### Critical Patterns

Include the compliance and operational patterns that must not be skipped.

**Disclosure policy (D-17)**:
```md
Default: disclose sensitive details only when evidence-cited and necessary.
Otherwise: redact/minimize.
Always: include a compliance-safe disclaimer; avoid guarantees.
```

**Operator artifacts must be executable**:
```md
Runbooks/checklists must include:
- exact commands
- PASS/FAIL criteria
- rollback/backout steps tested in staging
```

### Reference Files

- `specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/P4_PROD_READINESS_CHECKLIST_prod.md`
- `specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/P4_RUNBOOK_beep-api_prod.md`
- `specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/R15_PII_AI_ARCHITECTURE_RESEARCH_SUMMARY.md`
- `specs/pending/todox-wealth-mgmt-knowledge-mvp/inputs/PII_AI_RESEARCH_RAW.md`

### Verification

Record exact commands, PASS/FAIL, and date:

```bash
load/perf tests (if defined)
isolation test suite
backup/restore verification (at least tabletop; preferably staging restore)
rollback/backout test in staging
alert verification (controlled failure)
```

### Success Criteria

- [ ] Production checklist closed with explicit PASS/FAIL evidence.
- [ ] Runbooks are executable and include rollback/backout.
- [ ] Isolation tests pass and cover demo critical path.
- [ ] Retention + audit posture documented for evidence and meeting-prep claims.

### Handoff Document

Read full context in: `specs/pending/todox-wealth-mgmt-knowledge-mvp/handoffs/HANDOFF_P4.md`

### Next Phase

After completing Phase P4:
1. Update `REFLECTION_LOG.md` with final learnings
2. Move spec to `specs/completed/` (`bun run spec:move -- todox-wealth-mgmt-knowledge-mvp completed`)
