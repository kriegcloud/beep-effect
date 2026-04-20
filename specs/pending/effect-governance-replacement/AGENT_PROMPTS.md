# Effect Governance Replacement - Agent Prompts

## Phase Start Rule

Begin every phase by grounding against the live repo and the locked decisions in [outputs/grill-log.md](./outputs/grill-log.md).

## Prompt: P0 Orchestrator (Research)

You are the P0 orchestrator for the Effect governance replacement spec. Read `README.md`, `outputs/manifest.json`, `outputs/grill-log.md`, `AGENTS.md`, the live Effect-governance files under `tooling/configs/src/eslint/`, the fixtures in `tooling/configs/test/eslint-rules.test.ts`, the hook surfaces under `.claude/hooks/`, the Codex surfaces under `.codex/`, the repo-memory surfaces under `packages/repo-memory/`, the root command and CI surfaces, and the external reference repo `dev/biome-effect-linting-rules`. Explore broadly, use parallel sub-agents where helpful, and write or refine `RESEARCH.md`.

You must verify:

- the current Effect-specific governance surface is explicit
- candidate steering surfaces are separated by deployment surface
- the JSDoc and TSDoc lane is kept separate from the primary target
- the parity matrix is initialized
- raw ideas are separated from credible options

## Prompt: P1 Orchestrator (Validated Options)

You are the P1 orchestrator for the Effect governance replacement spec. Read `RESEARCH.md`, the parity matrix, the steering eval corpus draft, and the live repo surfaces needed to validate claims. Narrow the field to a validated shortlist, lock the fixed steering evaluation corpus, and write or refine `VALIDATED_OPTIONS.md`.

You must verify:

- the fixed evaluation corpus is explicit
- the parity matrix covers the current Effect-specific rules one by one
- weak options are rejected rather than carried forward
- the validated shortlist is small enough for real planning
- remaining unknowns are explicit

## Prompt: P2 Orchestrator (Planning)

You are the P2 orchestrator for the Effect governance replacement spec. Read `RESEARCH.md`, `VALIDATED_OPTIONS.md`, the parity matrix, the fixed steering corpus, and the live command and CI surfaces. Produce the ranked implementation plan in `PLANNING.md`.

You must verify:

- candidates are ranked by effectiveness score rather than described loosely
- the chosen path is explicit
- migration strategy and rollback posture are explicit
- the plan separates Effect-lane replacement from JSDoc-lane follow-up
- P3 can execute without reopening strategy questions

## Prompt: P3 Orchestrator (Execution)

You are the P3 orchestrator for the Effect governance replacement spec. Read `PLANNING.md`, the active handoff, the fixed evaluation corpus, and the parity matrix. Implement only the chosen primary path plus strictly necessary glue, then record the work in `EXECUTION.md`.

You must verify:

- implementation matches the chosen path from P2
- no secondary primary path is being built opportunistically
- command and CI changes are intentional and recorded
- any dropped coverage is explicit
- residual risks are explicit

## Prompt: P4 Orchestrator (Verification)

You are the P4 orchestrator for the Effect governance replacement spec. Read `PLANNING.md`, `EXECUTION.md`, the fixed steering evaluation corpus, and the parity matrix. Verify the chosen path and write or refine `VERIFICATION.md`.

You must verify:

- parity evidence exists for the current Effect-specific governance surface
- performance evidence exists relative to the previous lane
- steering evidence exists on the locked corpus
- the final recommendation is one of `full replacement`, `staged cutover`, or `no-go yet`
- open issues are routed back to P3 rather than hidden inside the verdict
