# knowledge-effect-workflow-migration: Master Orchestration

## Phase Plan

### P1: Discovery + Compatibility
- Compare current workflow implementation vs `.repos/effect-ontology` workflow stack.
- Produce compatibility, risk, and file inventory docs.
- Identify exact legacy files/functions to delete in P5.

Outputs:
- `outputs/P1_COMPATIBILITY_REPORT.md`
- `outputs/P1_FILE_INVENTORY.md`
- `outputs/P1_RISK_REGISTER.md`
- `handoffs/HANDOFF_P2.md`
- `handoffs/P2_ORCHESTRATOR_PROMPT.md`

### P2: Migration Blueprint
- Define target architecture with `@effect/workflow` integration points.
- Specify table/persistence mapping and rollback strategy.
- Produce phased implementation checklist.

Outputs:
- `outputs/P2_MIGRATION_BLUEPRINT.md`
- `handoffs/HANDOFF_P3.md`
- `handoffs/P3_ORCHESTRATOR_PROMPT.md`

### P3: Runtime + Persistence Implementation
- Implement `@effect/workflow` runtime path.
- Integrate persistence semantics and idempotency behavior.
- Add/adjust tests.

Outputs:
- code changes in `packages/knowledge/server/src/*`
- workflow test updates
- `handoffs/HANDOFF_P4.md`
- `handoffs/P4_ORCHESTRATOR_PROMPT.md`

### P4: Cutover + Parity Validation
- Switch default path to new runtime.
- Verify behavior parity and document any explicit divergence.

Outputs:
- `outputs/P4_PARITY_VALIDATION.md`
- parity matrix updates under `knowledge-ontology-comparison`
- `handoffs/HANDOFF_P5.md`
- `handoffs/P5_ORCHESTRATOR_PROMPT.md`

### P5: Legacy Removal
- Delete superseded custom workflow code and wiring.
- Remove dead tests and stale docs tied to old engine.
- Prove deletion with grep evidence.

Outputs:
- `outputs/P5_LEGACY_REMOVAL_REPORT.md`
- `handoffs/HANDOFF_P6.md`
- `handoffs/P6_ORCHESTRATOR_PROMPT.md`

### P6: Hardening + Handoff
- Stabilize tests and lint/check.
- Update reflection log and produce next-step handoff.

Outputs:
- final handoff docs refreshed with final verification context

## Global Constraints

1. Preserve previously delivered Phase 5 parity capabilities.
2. No long-running dual runtime after P5.
3. Every phase must include objective verification output.
4. A phase is not complete until it creates the handoff pair for the next phase:
   - `handoffs/HANDOFF_P{N+1}.md`
   - `handoffs/P{N+1}_ORCHESTRATOR_PROMPT.md`

## Baseline Verification Commands

```bash
bun run check --filter @beep/knowledge-domain
bun run check --filter @beep/knowledge-server
bun run lint --filter @beep/knowledge-server
bun test packages/knowledge/server/test/Workflow/
bun test packages/knowledge/server/test/Resilience/
```
