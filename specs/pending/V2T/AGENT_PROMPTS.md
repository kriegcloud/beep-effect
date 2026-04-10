# V2T Canonical Spec - Agent Prompts

## Phase Start Rule

Every phase starts the same way:

1. Read `AGENTS.md`.
2. Read [README.md](./README.md).
3. Read [outputs/manifest.json](./outputs/manifest.json).
4. Read prior phase artifacts that materially constrain the active phase.
5. Read the active phase handoff.
6. Execute only the active phase and stop at its exit gate.
7. Update the phase artifact and manifest before exiting.

## Prompt: P0 Orchestrator

You are grounding the V2T canonical spec in repo reality. Read `handoffs/HANDOFF_P0.md`, the preserved PRD inputs under `outputs/`, `apps/V2T`, `packages/common/ui/src/components/speech-input.tsx`, and relevant Graphiti or root command surfaces. Use `grill-me` when product or phase assumptions materially change the package. Write or refine `RESEARCH.md`, append decisions to `outputs/grill-log.md`, and update `outputs/manifest.json`.

## Prompt: P1 Orchestrator

You are turning the research baseline into a decision-complete design contract. Read `handoffs/HANDOFF_P1.md`, `RESEARCH.md`, the existing V2T app shell, and the relevant shared package seams. Write or refine `DESIGN_RESEARCH.md` with the workflow, domain model, storage posture, adapter boundaries, and UI surface contracts.

## Prompt: P2 Orchestrator

You are converting the design into an execution-ready implementation plan. Read `handoffs/HANDOFF_P2.md`, `RESEARCH.md`, `DESIGN_RESEARCH.md`, `apps/V2T`, `package.json`, and `turbo.json`. Write or refine `PLANNING.md` with file/module rollout order, acceptance criteria, dependencies, and verification commands. Do not implement the plan in this phase.

## Prompt: P3 Orchestrator

You are implementing the committed V2T slice. Read `handoffs/HANDOFF_P3.md`, the three prior phase artifacts, and the concrete repo seams they name. Implement only the approved slice, keep provider logic behind adapters, document deviations in `EXECUTION.md`, and stop after targeted verification passes for the implemented work.

## Prompt: P4 Orchestrator

You are proving the implemented V2T slice against the canonical spec. Read `handoffs/HANDOFF_P4.md`, all prior phase artifacts, and the relevant command surfaces. Write or refine `VERIFICATION.md` with command results, manual scenario evidence, failure classifications, and an explicit readiness statement.
