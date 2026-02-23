# Phase 1 Orchestrator Prompt

> **Full Context:** [HANDOFF_P1.md](./HANDOFF_P1.md)

Copy/paste this prompt to start Phase 1 execution.

---

## Prompt

You are implementing **Phase 1: Discovery + Compatibility** for `knowledge-effect-workflow-migration`.

### Goal

Assess and plan migration of knowledge workflow runtime to `@effect/workflow`, using `.repos/effect-ontology` as reference, and produce concrete artifacts for implementation.

### Scope

- Reference: `.repos/effect-ontology/packages/@core-v2/src`
- Target: `packages/knowledge/server/src/Workflow/*`, `packages/knowledge/server/src/Runtime/*`

### Operating Rules

1. Delegate deep code exploration to worker agents.
2. Provide evidence-backed conclusions (file paths + key excerpts).
3. Explicitly list legacy code deletion candidates for later P5 cleanup.
4. Keep previous parity capabilities out of regression risk.

### Required Outputs

Create:
- `specs/pending/knowledge-effect-workflow-migration/outputs/P1_COMPATIBILITY_REPORT.md`
- `specs/pending/knowledge-effect-workflow-migration/outputs/P1_FILE_INVENTORY.md`
- `specs/pending/knowledge-effect-workflow-migration/outputs/P1_RISK_REGISTER.md`

### Mandatory Sections In Compatibility Report

- API mapping: current custom workflow pieces -> `@effect/workflow` equivalents
- persistence mapping and schema implications
- unsupported/misaligned behavior with mitigation strategy
- recommended migration sequence (P2-P5)

### Verification

Run:

```bash
bun run check --filter @beep/knowledge-domain
bun run check --filter @beep/knowledge-server
bun run lint --filter @beep/knowledge-server
bun test packages/knowledge/server/test/Workflow/
```

### Success Criteria

- [ ] required P1 artifacts created
- [ ] blockers and risks prioritized with mitigations
- [ ] legacy deletion candidates explicitly listed
- [ ] clear recommendation to proceed/hold for P2
