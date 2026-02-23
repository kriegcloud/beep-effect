# Quick Start — Unified AI Tooling (.beep)

## What This Spec Does

Defines a deterministic compiler (`beep-sync`) that transforms canonical `.beep/` config into native configuration files for Claude Code, Codex, Cursor, Windsurf, and JetBrains.

## Current Phase

P0 is complete.

Next phase is **P1: Schema + Compiler Contract**.

## First Files to Read

1. `specs/completed/unified-ai-tooling/README.md`
2. `specs/completed/unified-ai-tooling/outputs/preliminary-research.md`
3. `specs/completed/unified-ai-tooling/outputs/tooling-compatibility-matrix.md`
4. `specs/completed/unified-ai-tooling/outputs/comprehensive-review.md`
5. `specs/completed/unified-ai-tooling/outputs/subtree-synthesis.md`
6. `specs/completed/unified-ai-tooling/outputs/quality-gates-and-test-strategy.md`
7. `specs/completed/unified-ai-tooling/outputs/residual-risk-closure.md`
8. `specs/completed/unified-ai-tooling/outputs/poc-execution-pack.md`
9. `specs/completed/unified-ai-tooling/outputs/poc-command-templates.md`
10. `specs/completed/unified-ai-tooling/outputs/poc-01-canonical-compiler-results.md`
11. `specs/completed/unified-ai-tooling/outputs/poc-02-mcp-capability-results.md`
12. `specs/completed/unified-ai-tooling/outputs/poc-03-jetbrains-prompt-library-results.md`
13. `specs/completed/unified-ai-tooling/outputs/poc-04-managed-ownership-revert-results.md`
14. `specs/completed/unified-ai-tooling/outputs/poc-05-secret-resolution-results.md`
15. `specs/completed/unified-ai-tooling/outputs/poc-06-end-to-end-dry-run-results.md`
16. `specs/completed/unified-ai-tooling/outputs/onepassword-setup-runbook.md`
17. `specs/completed/unified-ai-tooling/outputs/onepassword-env-template.env`
18. `specs/completed/unified-ai-tooling/outputs/onepassword-op-setup-commands.sh`
19. `specs/completed/unified-ai-tooling/handoffs/HANDOFF_P1.md`
20. `specs/completed/unified-ai-tooling/handoffs/P1_ORCHESTRATOR_PROMPT.md`

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

## First Task to Run Now (P1)

1. Open `handoffs/HANDOFF_P1.md`.
2. Finalize `.beep/config.yaml` schema + normalization + sidecar metadata contract.
3. Document AGENTS generation/freshness model for root + every workspace package.
4. Define state/manifest contracts (hashes, orphan cleanup, managed ownership).
5. Add `Quality Gate Evidence` requirements to P1 output (tests + review checkpoints).
6. Use POC-01..POC-06 findings as locked baseline constraints while defining the schema contract.
7. Produce `outputs/p1-schema-and-contract.md`.
8. Update `outputs/manifest.json` P1 status.
