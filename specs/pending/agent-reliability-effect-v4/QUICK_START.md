# Quick Start

## What This Spec Does

Reliability-first implementation plan for agent execution in this monorepo, grounded on local Effect v4 truth and benchmark-gated policy promotion.

## Current Status

| Phase | Status | Summary |
|---|---|---|
| P0 | In Progress | Canonical scaffold + source contract + protocol freeze |
| P1 | Pending | Refactor existing harness to Effect FS/Path + matrix execution |
| P2 | Pending | Real-run execution for Codex + Claude + worktree isolation |
| P3 | Pending | Adaptive overlays + deterministic max-3 skill selection |
| P4 | Pending | Detector/corrections truth-backed from local migration corpus |
| P5 | Pending | Graphiti closed loop for failures and corrective reuse |
| P6 | Pending | Console, playbook, promotion lock, day-90 scorecard |

## How To Continue

1. Read the current handoff: `handoffs/HANDOFF_P1.md`.
2. Use the paired prompt: `handoffs/P1_ORCHESTRATOR_PROMPT.md`.
3. Execute only the current phase scope; do not skip verification gates.

## Canonical Constraints

1. Effect API truth is local-only (`.repos/effect-smol` + Graphiti `effect-v4`).
2. Repo memory truth uses Graphiti `beep-dev`.
3. All benchmark/policy promotion decisions require A/B evidence.
4. Harness file/path operations use `effect/FileSystem` and `effect/Path`.
