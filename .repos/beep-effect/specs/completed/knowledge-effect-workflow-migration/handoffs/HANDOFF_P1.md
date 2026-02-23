# Phase 1 Handoff: knowledge-effect-workflow-migration

**Date**: 2026-02-07
**From**: Spec scaffolding
**To**: P1 Discovery + Compatibility
**Status**: Ready

## Mission

Establish whether and how to migrate knowledge workflow runtime to `@effect/workflow` with minimal parity risk, then produce a concrete implementation blueprint for follow-on execution.

## Context Inputs

Required reading before work:
- `specs/pending/knowledge-effect-workflow-migration/README.md`
- `specs/pending/knowledge-ontology-comparison/handoffs/HANDOFF_P6.md`
- `specs/pending/knowledge-ontology-comparison/outputs/P6_PARITY_GAP_MATRIX.md`

Reference implementation:
- `.repos/effect-ontology/packages/@core-v2/src`

Target implementation:
- `packages/knowledge/server/src/Workflow/*`
- `packages/knowledge/server/src/Runtime/*`

## Core Constraints

1. Keep current shipped features intact (Phase 5 parity capabilities).
2. Prefer additive migration until cutover phase.
3. Do not defer cleanup indefinitely: legacy workflow code must be deleted in P5.
4. Any divergence from reference must be explicit, tested, and documented.

## P1 Deliverables

Create these files:
- `outputs/P1_COMPATIBILITY_REPORT.md`
- `outputs/P1_FILE_INVENTORY.md`
- `outputs/P1_RISK_REGISTER.md`

Each deliverable must contain file-level evidence and recommended actions.

## Required P1 Questions To Answer

1. Which `@effect/workflow` primitives map directly to current knowledge workflow needs?
2. Which current behaviors have no direct mapping and require adapters?
3. What persistence changes are needed for parity?
4. Which exact files/functions will be removed in P5?
5. What rollback strategy is viable during P3/P4?

## Verification During P1

At minimum, run baseline checks to capture current green state:

```bash
bun run check --filter @beep/knowledge-domain
bun run check --filter @beep/knowledge-server
bun run lint --filter @beep/knowledge-server
bun test packages/knowledge/server/test/Workflow/
```

## Exit Criteria For P1

- [ ] P1 artifacts exist and are substantive
- [ ] migration blockers are identified and prioritized
- [ ] delete candidates are explicitly enumerated
- [ ] P2 blueprint skeleton is outlined from findings
