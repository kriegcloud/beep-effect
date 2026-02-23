# Quick Start — Unified AI Tooling (.beep)

## What This Spec Does

Defines a deterministic compiler (`beep-sync`) that transforms canonical `.beep/` config into native configuration files for Claude Code, Codex, Cursor, Windsurf, and JetBrains.

## Current Phase

P0 is complete.

Next phase is **P1: Schema + Compiler Contract**.

## First Files to Read

1. `specs/pending/unified-ai-tooling/README.md`
2. `specs/pending/unified-ai-tooling/outputs/preliminary-research.md`
3. `specs/pending/unified-ai-tooling/outputs/tooling-compatibility-matrix.md`
4. `specs/pending/unified-ai-tooling/outputs/comprehensive-review.md`
5. `specs/pending/unified-ai-tooling/handoffs/HANDOFF_P1.md`
6. `specs/pending/unified-ai-tooling/handoffs/P1_ORCHESTRATOR_PROMPT.md`

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

## First Task to Run Now (P1)

1. Open `handoffs/HANDOFF_P1.md`.
2. Finalize `.beep/config.yaml` schema + normalization + sidecar metadata contract.
3. Document AGENTS generation/freshness model for root + every workspace package.
4. Produce `outputs/p1-schema-and-contract.md`.
5. Update `outputs/manifest.json` P1 status.
