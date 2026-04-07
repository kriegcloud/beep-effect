# Repo Cleanup: Bloat, Staleness, and Duplication — Quick Start

> A phased repo-cleanup spec package for scoped Codex sessions, approval-driven deletion, and durable planning artifacts.

## What This Delivers

- one narrow Codex session per cleanup phase instead of one overloaded session
- explicit document-preservation policy before destructive cleanup starts
- managed artifact regeneration as part of cleanup completeness
- a ranked stale-code inventory with one-candidate-at-a-time approval
- durable checklist, grill log, and per-phase outputs

## Current Status

The authoritative status source is [outputs/manifest.json](./outputs/manifest.json). The table below is a quick human summary.

| Phase | Focus | Status |
|---|---|---|
| P0 | Planning, grilling, and document classification | BOOTSTRAPPED |
| P1 | Targeted workspace removal and managed artifact regeneration | NOT_STARTED |
| P2 | Docgen verification and stale docgen cleanup | NOT_STARTED |
| P3 | Dependency, security, and platform pruning | NOT_STARTED |
| P4 | Ranked candidate inventory and approval loop | NOT_STARTED |
| P5 | Final validation and knowledge closeout | NOT_STARTED |

## Start Here

1. Read `AGENTS.md`.
2. Read [README.md](./README.md) for the normative contract.
3. Check [outputs/manifest.json](./outputs/manifest.json) for the active phase.
4. Open the matching handoff in `handoffs/`.
5. Run the matching orchestrator prompt.
6. Update the named phase output plus the shared checklist, grill log, and manifest when applicable.

## Session Model

1. Use one Codex session per phase.
2. For P4, use one inventory-orchestrator session to build and rank candidates, then one executor session per approved candidate.
3. Stop at the phase exit gate and wait for explicit instruction before moving to the next phase.
4. Follow the default commit cadence unless P0 overrides it:
   - one commit at the end of P1, P2, and P3 if changes were made
   - one commit per approved candidate in P4
   - no push without explicit confirmation

## Phase Entry Files

| Phase | Handoff | Orchestrator | Output |
|---|---|---|---|
| P0 | [HANDOFF_P0.md](./handoffs/HANDOFF_P0.md) | [P0_ORCHESTRATOR_PROMPT.md](./handoffs/P0_ORCHESTRATOR_PROMPT.md) | [p0-planning-and-document-classification.md](./outputs/p0-planning-and-document-classification.md) |
| P1 | [HANDOFF_P1.md](./handoffs/HANDOFF_P1.md) | [P1_ORCHESTRATOR_PROMPT.md](./handoffs/P1_ORCHESTRATOR_PROMPT.md) | [p1-workspace-removal-and-regeneration.md](./outputs/p1-workspace-removal-and-regeneration.md) |
| P2 | [HANDOFF_P2.md](./handoffs/HANDOFF_P2.md) | [P2_ORCHESTRATOR_PROMPT.md](./handoffs/P2_ORCHESTRATOR_PROMPT.md) | [p2-docgen-verification-and-cleanup.md](./outputs/p2-docgen-verification-and-cleanup.md) |
| P3 | [HANDOFF_P3.md](./handoffs/HANDOFF_P3.md) | [P3_ORCHESTRATOR_PROMPT.md](./handoffs/P3_ORCHESTRATOR_PROMPT.md) | [p3-dependency-security-and-platform-pruning.md](./outputs/p3-dependency-security-and-platform-pruning.md) |
| P4 | [HANDOFF_P4.md](./handoffs/HANDOFF_P4.md) | [P4_ORCHESTRATOR_PROMPT.md](./handoffs/P4_ORCHESTRATOR_PROMPT.md) | [p4-ranked-candidate-inventory.md](./outputs/p4-ranked-candidate-inventory.md) |
| P5 | [HANDOFF_P5.md](./handoffs/HANDOFF_P5.md) | [P5_ORCHESTRATOR_PROMPT.md](./handoffs/P5_ORCHESTRATOR_PROMPT.md) | [p5-final-closeout.md](./outputs/p5-final-closeout.md) |

## Shared Trackers

- [outputs/cleanup-checklist.md](./outputs/cleanup-checklist.md)
- [outputs/grill-log.md](./outputs/grill-log.md)
- [outputs/codex-plan-mode-prompt.md](./outputs/codex-plan-mode-prompt.md)

## P4 Session Split

- Inventory session: [handoffs/P4_ORCHESTRATOR_PROMPT.md](./handoffs/P4_ORCHESTRATOR_PROMPT.md)
- Approved candidate executor: [prompts/CANDIDATE_EXECUTOR_PROMPT.md](./prompts/CANDIDATE_EXECUTOR_PROMPT.md)
