# V2T - P3 Execution

## Status

NOT_STARTED

## Execution Objective

Implement the first committed V2T slice in `apps/V2T`, `packages/VT2`, `@beep/infra`, and their supporting seams without widening scope beyond the contracts locked in `RESEARCH.md`, `DESIGN_RESEARCH.md`, and `PLANNING.md`.

## Phase Agent Role

The session working P3 is the execution orchestrator.

The orchestrator owns:

- the local implementation plan for the approved slice
- the decision to keep urgent work local or partition bounded worker scopes
- integration of every worker patch before it becomes accepted phase output
- the execution record, gate evidence, and deviation log
- the P3 exit call

Workers may implement bounded parts of the approved slice, but they do not own scope changes, final integration, gate closure, or the right to silently advance into verification.

## Orchestration-First Workflow

1. Re-read the prior phase artifacts and restate the approved implementation slice.
2. Decide which immediate blocking work the orchestrator should keep local.
3. Partition only the remaining parallelizable implementation work into disjoint write scopes.
4. Require every worker to return results with explicit commands, findings, and residual risks.
5. Review and integrate each worker result before treating it as accepted.
6. Run the required targeted and repo-law gates, or record why a required gate is blocked.
7. Update `EXECUTION.md` with concrete evidence and stop at the P3 exit gate.

## Mandatory Conformance Inputs

P3 execution must actively apply:

- `AGENTS.md`
- the `effect-first-development` and `schema-first-development` skills when available in-session
- `.patterns/jsdoc-documentation.md`
- `standards/effect-first-development.md`
- `standards/schema-first.inventory.jsonc`
- `tooling/configs/src/eslint/SchemaFirstRule.ts`
- `infra/package.json`
- root `package.json`, root `turbo.json`, `apps/V2T/package.json`,
  `apps/V2T/turbo.json`, `packages/VT2/package.json`, and
  `packages/VT2/turbo.json` for live workspace package names, task
  availability, and command-truth checks

## Evidence Recording Rules

- Do not claim a gate passed unless the exact command result is recorded in this document.
- Distinguish `passed`, `failed`, `blocked`, `not run`, and `not applicable`; do not collapse them into generic prose.
- Worker-reported command results are provisional until the orchestrator reviews and accepts them.
- Record deviations from `PLANNING.md` as soon as they occur, not only at the end of the phase.
- If a broader repo-law command is skipped, explain why it was not applicable or why the phase remains blocked.
- Record Graphiti recall attempted, exact query, exact error text when recall
  fails, whether `get_episodes` fallback was attempted and what it returned,
  fallback used, and any durable writeback or queued session-end summary using
  `prompts/GRAPHITI_MEMORY_PROTOCOL.md`.

## Required Outcomes

- replace the placeholder app shell with the agreed workflow
- persist projects, sessions, transcripts, composition packets, and export artifact records
- extend the existing `@beep/VT2` control plane unless a deliberate migration is explicitly documented
- keep `@beep/infra` as the canonical workstation/deployment seam when the approved slice touches installer or deployment behavior
- keep all external providers behind explicit adapters
- reuse shared repo primitives where they already fit
- document every meaningful deviation from `PLANNING.md`

## Execution Rules

- use effect-first and schema-first patterns
- model pure data schema-first and keep failure/absence typed
- keep exported APIs and examples docgen-clean
- prefer typed errors and explicit service boundaries
- do not let React components own provider-specific logic
- do not invent an app-local server path if the current `packages/VT2` sidecar seam can carry the slice
- do not invent a second installer or deployment path if the current `@beep/infra` seam can carry the slice
- stop at the first-slice boundary instead of slipping into speculative polish
- capture command results and touched surfaces in this document as work progresses
- do not claim a gate passed unless the concrete command result is recorded here

## Required Conformance Gates During P3

### Targeted Implementation Floor

- `bunx turbo run check --filter=@beep/infra --filter=@beep/v2t --filter=@beep/VT2`
- `bunx turbo run test --filter=@beep/infra --filter=@beep/v2t --filter=@beep/VT2`
- `bunx turbo run build --filter=@beep/v2t --filter=@beep/VT2`
- `bun run --cwd apps/V2T lint`
- `bun run --cwd infra lint`

### Repo Law Gate

- `bun run lint:effect-laws`
- `bun run lint:jsdoc`
- `bun run check:effect-laws-allowlist`
- `bun run lint:schema-first`

### Exported API Gate

- `bun run docgen` when exported APIs or JSDoc examples changed

Important note:

- `@beep/VT2` has no package-local `lint` or `docgen` task, so VT2 conformance must be evidenced through the repo-law commands above
- `@beep/infra` is a live package with package-local `check`, `test`, and `lint` scripts, so installer-surface work must keep those commands truthful in both code and docs
- `@beep/v2t` is the live app package name even though the folder is
  `apps/V2T`, so re-check filter casing from the manifest before editing the
  command matrix

## Required Review Loop During P3

- after each meaningful merge wave, run a read-only review pass
- if the reviewer finds substantive issues, fix them and rerun review
- do not close P3 while the latest review wave still contains unresolved
  substantive findings

## Execution Record Template

### Implemented Surfaces

- pending

### Commands Run

- pending

### Delegation Register

- pending

### Graphiti And Repo-Truth Notes

- pending

### Conformance Evidence

- pending

### Deviations From Plan

- none yet

### Residual Risks

- pending

## Stop Conditions

- Stop if implementation would widen scope beyond the approved first slice.
- Stop if worker write scopes begin to overlap or integration reveals conflicting assumptions.
- Stop if a required gate fails and the failure is not resolved inside P3.
- Stop if execution uncovers a product or architecture contradiction that belongs back in P1 or P2.
- Stop once the approved slice is implemented and evidenced; do not silently start P4.

## Exit Gate

P3 is complete only when the committed slice exists in code, the required targeted and repo-law evidence is recorded here with concrete results, deviations are explicit, and this document clearly separates shipped behavior from deferred work without making a readiness claim on P4's behalf.
