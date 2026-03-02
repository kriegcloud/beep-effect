# Agent Prompts

## Prompt: P0 Orchestrator (Scaffold + Contracts)

Create canonical spec files under `specs/pending/agent-reliability-effect-v4`, lock benchmark protocol (18 tasks, 2 trials, 2 agents, 4 conditions), and produce outputs:
`p0-source-of-truth-contract.md`, `p0-current-state-audit.md`, `p0-benchmark-protocol.md`.
Use `.repos/effect-v4` + Graphiti groups as truth. Include context-budget sections in `HANDOFF_P1.md`.

## Prompt: P1 Orchestrator (Harness Hardening)

Refactor `tooling/agent-eval` in place. Replace all `node:fs` and `node:path` under `src/**` with `effect/FileSystem` and `effect/Path`. Provide `NodeFileSystem.layer` + `NodePath.layer` at CLI boundary only. Replace nested benchmark loops with deterministic run matrix + `Effect.forEach`. Keep schema compatibility and remove `dist/tsconfig.tsbuildinfo`.

## Prompt: P2 Orchestrator (Runner Contract)

Implement real execution mode for Codex + Claude with pinned models, dry-run fallback, and disposable worktree execution. Persist run transcripts and baseline reports under `outputs/agent-reliability`.

## Prompt: P3 Orchestrator (Adaptive Policies)

Enforce deterministic category-aware overlay loading and max-3 focused skill selection. Run A/B comparisons and block rollout unless metrics improve or incidents decrease without safety regressions.

## Prompt: P4 Orchestrator (Effect v4 Reliability)

Generate and curate correction index from local migration docs + KG verification facts only. Expand detector categories and preflight correction packets. Hard-fail critical API incidents.

## Prompt: P5 Orchestrator (KG Closed Loop)

Write structured failed-run episodes to Graphiti (`beep-dev`) and retrieve top-ranked corrective facts pre-run. Keep packets bounded by facts/characters and dedupe strictly.

## Prompt: P6 Orchestrator (Console + Playbook)

Ship minimal reliability console in web app, publish stable playbook, and enforce promotion lock policy requiring benchmark evidence or explicit documented exception.
