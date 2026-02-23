# Quick Start — Unified AI Tooling (.beep)

## What This Spec Does

Defines a deterministic compiler (`beep-sync`) that transforms canonical `.beep/` config into native configuration files for Claude Code, Codex, Cursor, Windsurf, and JetBrains.

## Current Phase

P0 is complete.

P1-P4 are complete at spec level.

Next phase is **P5: Runtime Implementation + Skill Sync**.

## First Files to Read

1. `specs/pending/unified-ai-tooling/README.md`
2. `specs/pending/unified-ai-tooling/outputs/preliminary-research.md`
3. `specs/pending/unified-ai-tooling/outputs/tooling-compatibility-matrix.md`
4. `specs/pending/unified-ai-tooling/outputs/comprehensive-review.md`
5. `specs/pending/unified-ai-tooling/outputs/subtree-synthesis.md`
6. `specs/pending/unified-ai-tooling/outputs/quality-gates-and-test-strategy.md`
7. `specs/pending/unified-ai-tooling/outputs/residual-risk-closure.md`
8. `specs/pending/unified-ai-tooling/outputs/poc-execution-pack.md`
9. `specs/pending/unified-ai-tooling/outputs/poc-command-templates.md`
10. `specs/pending/unified-ai-tooling/outputs/poc-01-canonical-compiler-results.md`
11. `specs/pending/unified-ai-tooling/outputs/poc-02-mcp-capability-results.md`
12. `specs/pending/unified-ai-tooling/outputs/poc-03-jetbrains-prompt-library-results.md`
13. `specs/pending/unified-ai-tooling/outputs/poc-04-managed-ownership-revert-results.md`
14. `specs/pending/unified-ai-tooling/outputs/poc-05-secret-resolution-results.md`
15. `specs/pending/unified-ai-tooling/outputs/poc-06-end-to-end-dry-run-results.md`
16. `specs/pending/unified-ai-tooling/outputs/onepassword-setup-runbook.md`
17. `specs/pending/unified-ai-tooling/outputs/onepassword-env-template.env`
18. `specs/pending/unified-ai-tooling/outputs/onepassword-op-setup-commands.sh`
19. `specs/pending/unified-ai-tooling/outputs/p1-schema-and-contract.md`
20. `specs/pending/unified-ai-tooling/outputs/p2-adapter-design.md`
21. `specs/pending/unified-ai-tooling/outputs/p3-runtime-integration.md`
22. `specs/pending/unified-ai-tooling/outputs/p4-cutover-playbook.md`
23. `specs/pending/unified-ai-tooling/handoffs/HANDOFF_P5.md`
24. `specs/pending/unified-ai-tooling/handoffs/P5_ORCHESTRATOR_PROMPT.md`

## POC Gate Snapshot (2026-02-23)

1. POC-01..POC-06: all passed.
2. One open follow-up remains: capture real authenticated success-path evidence for 1Password desktop and service-account secret resolution.
3. Treat POC findings as locked baseline inputs for P1-P4.

## Phase Handoff Files

| Phase | Handoff | Orchestrator Prompt |
|-------|---------|---------------------|
| P1 | `handoffs/HANDOFF_P1.md` | `handoffs/P1_ORCHESTRATOR_PROMPT.md` |
| P2 | `handoffs/HANDOFF_P2.md` | `handoffs/P2_ORCHESTRATOR_PROMPT.md` |
| P3 | `handoffs/HANDOFF_P3.md` | `handoffs/P3_ORCHESTRATOR_PROMPT.md` |
| P4 | `handoffs/HANDOFF_P4.md` | `handoffs/P4_ORCHESTRATOR_PROMPT.md` |
| P5 | `handoffs/HANDOFF_P5.md` | `handoffs/P5_ORCHESTRATOR_PROMPT.md` |
| P6 | `handoffs/HANDOFF_P6.md` | `handoffs/P6_ORCHESTRATOR_PROMPT.md` |

## Locked Decisions

1. Canonical config lives in `.beep/`; runtime lives in `tooling/beep-sync`.
2. Generated files are committed (including `.codex/` and `.mcp.json`).
3. No symlink strategy.
4. One instruction source generates both `AGENTS.md` and `CLAUDE.md`.
5. Linux-only support.
6. Skills are in scope for v1.
7. Required secrets fail hard if unresolved.
8. CI and hook wiring are deferred in this branch, but command contracts are still required.
9. `AGENTS.md` is managed for every workspace package.
10. 1Password auth policy is hybrid: desktop auth locally, service-account auth for automation.
11. JetBrains prompt-library artifacts are in scope for v1.
12. Adapter architecture is registry/capability-map based.
13. Managed outputs are hash-aware with orphan cleanup and sidecar/state metadata.
14. Diagnostics include strict mode for lossy/unsupported mappings.
15. Backup/revert is part of the operational safety contract.
16. TDD and hard validation checkpoints are mandatory for phase completion.
17. `revert` is mandatory in v1 and scoped to managed targets.

## First Task to Run Now (P5)

1. Open `handoffs/HANDOFF_P5.md`.
2. Replace scaffold command paths in `tooling/beep-sync` with real runtime behavior.
3. Implement managed skill distribution from `.beep/skills/` to explicit target paths.
4. Preserve deterministic no-churn invariants from POC-06 in validation checkpoints.
5. Add `Quality Gate Evidence` to `outputs/p5-runtime-implementation.md`.
6. Update `outputs/manifest.json` with P5 status and evidence links.
