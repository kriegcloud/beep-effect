# Effect Governance Legacy Retirement - Agent Prompts

## Phase Start Rule

Begin every phase by grounding against the live repo, the completed replacement package, and the locked decisions in [outputs/grill-log.md](./outputs/grill-log.md).

## Prompt: P0 Orchestrator (Research)

You are the P0 orchestrator for the Effect governance legacy retirement spec. Read `README.md`, `outputs/manifest.json`, `outputs/grill-log.md`, the completed replacement package, the live root command and CI surfaces, the `tooling/configs` ESLint package, the `tooling/cli` Effect-law command surfaces, and the trust or docs surfaces that still mention `lint:effect-laws`. Inventory what remains and write or refine `RESEARCH.md`.

You must verify:

- the remaining legacy Effect-lane surface is explicit
- the JSDoc and TSDoc lane is kept separate from the retirement target
- the inventory and dependency map reflect live repo reality
- raw ideas are separated from credible retirement options

## Prompt: P1 Orchestrator (Validated Options)

You are the P1 orchestrator for the Effect governance legacy retirement spec. Read `RESEARCH.md`, the inventory, the remove-or-retain matrix, the dependency cut map, and the live repo surfaces needed to validate claims. Narrow the field to a validated shortlist and write or refine `VALIDATED_OPTIONS.md`.

You must verify:

- the inventory is locked rather than treated as a draft
- each legacy surface has a credible remove, rewrite, split, retain, or reject call
- weak options are rejected rather than carried forward
- remaining unknowns are explicit enough for planning

## Prompt: P2 Orchestrator (Planning)

You are the P2 orchestrator for the Effect governance legacy retirement spec. Read `RESEARCH.md`, `VALIDATED_OPTIONS.md`, the inventory, the remove-or-retain matrix, and the live command, config, and dependency surfaces. Produce the ranked retirement plan in `PLANNING.md`.

You must verify:

- candidates are ranked by explicit retirement value and risk
- the chosen path is explicit
- rollback posture and retained shims are explicit
- the plan separates Effect-lane retirement from future JSDoc-lane redesign
- P3 can execute without reopening strategy questions

## Prompt: P3 Orchestrator (Execution)

You are the P3 orchestrator for the Effect governance legacy retirement spec. Read `PLANNING.md`, the active handoff, the inventory, and the remove-or-retain matrix. Implement only the chosen retirement path plus strictly necessary glue, then record the work in `EXECUTION.md`.

You must verify:

- implementation matches the chosen P2 path
- removed surfaces, splits, rewrites, and retained shims are explicit
- command, config, and dependency changes are intentional and recorded
- docs or trust-surface updates are explicit

## Prompt: P4 Orchestrator (Verification)

You are the P4 orchestrator for the Effect governance legacy retirement spec. Read `PLANNING.md`, `EXECUTION.md`, the locked inventory, and the remove-or-retain matrix. Verify the chosen path and write or refine `VERIFICATION.md`.

You must verify:

- retirement evidence exists for each locked target
- docs-lane safety evidence exists
- dependency or performance or operational evidence exists
- the final recommendation is one of `full retirement`, `minimal shim retained`, or `no-go yet`
- open issues are routed back to P3 rather than hidden inside the verdict
