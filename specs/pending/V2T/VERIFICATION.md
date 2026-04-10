# V2T - P4 Verification

## Status

NOT_STARTED

## Goal

Prove the implemented V2T slice matches the canonical spec and clearly separate shipped behavior from deferred provider ambition.

## Phase Agent Role

The session working P4 is the verification orchestrator.

The orchestrator owns:

- the verification plan and evidence collection order
- the decision to delegate bounded read-only audits
- the integration of audit findings into one readiness record
- the final readiness judgment
- the P4 exit call

Workers may audit evidence or boundary behavior, but they do not own readiness, final gate interpretation, or the right to backfill missing execution evidence with summary prose.

## Orchestration-First Workflow

1. Re-read all prior phase artifacts, especially the execution record and declared deviations.
2. Form a local verification plan that matches the actual implemented slice.
3. Gather automated evidence first, then manual scenario evidence, then residual-risk analysis.
4. Delegate only bounded read-only audits that can challenge the evidence set without replacing the orchestrator.
5. Integrate audit feedback into a single orchestrator-owned readiness record.
6. If evidence is missing, contradictory, or blocked, record that state explicitly instead of smoothing it over.
7. Stop at the P4 exit gate instead of reopening execution work inside the verification document.

## Mandatory Conformance Inputs

P4 verification must explicitly reference:

- `AGENTS.md`
- the `effect-first-development` and `schema-first-development` skills when available in-session
- `.patterns/jsdoc-documentation.md`
- `standards/effect-first-development.md`
- `standards/schema-first.inventory.jsonc`
- `tooling/configs/src/eslint/SchemaFirstRule.ts`
- `apps/V2T/package.json` and `packages/VT2/package.json` for live workspace
  package names and task availability

## Evidence Recording Rules

- Every readiness claim must point to recorded automated results, manual evidence, or explicit blocker notes in this document.
- Distinguish `passed`, `failed`, `blocked`, `not run`, and `not applicable`; missing evidence is not equivalent to pass.
- If a required command was not run, say why and treat readiness accordingly.
- Worker audits can challenge or confirm evidence, but the orchestrator must make the final interpretation.
- If verification reveals implementation gaps, send that work back to P3 explicitly instead of relabeling the gap as deferred ambition.
- Record Graphiti recall attempted, exact query, exact error text when recall
  fails, fallback used, and any durable writeback or queued session-end
  summary using `prompts/GRAPHITI_MEMORY_PROTOCOL.md`.

## Automated Verification Floor

### Targeted Implementation Floor

- `bunx turbo run check --filter=@beep/v2t --filter=@beep/VT2`
- `bunx turbo run test --filter=@beep/v2t --filter=@beep/VT2`
- `bunx turbo run build --filter=@beep/v2t --filter=@beep/VT2`
- `bun run --cwd apps/V2T lint`

### Repo Law Gate

- `bun run lint:effect-laws`
- `bun run lint:jsdoc`
- `bun run check:effect-laws-allowlist`
- `bun run lint:schema-first`

### Exported API Gate

- `bun run docgen` when exported APIs or JSDoc examples changed

### Readiness Gate

- `bun run check`
- `bun run lint`
- `bun run test`
- `bun run docgen` when exported APIs or JSDoc examples changed

Important note:

- `@beep/VT2` has no package-local `lint` or `docgen` task, so VT2 conformance must be evidenced through the repo-law commands above
- run broader commands whenever the implementation changes shared or managed surfaces, and do not mark readiness until the appropriate broader gate is recorded
- `@beep/v2t` is the live app package name even though the folder is
  `apps/V2T`, so verify filter casing from the manifest before editing the
  verification matrix

### Required Review Loop

- run at least one read-only audit wave before final readiness judgment
- if the reviewer finds substantive issues, route them back for integration or
  record them as blocking readiness
- do not declare readiness while the latest review wave still contains
  unresolved substantive findings

## Manual Scenario Matrix

### Workspace Boot

- app loads the V2T workspace instead of the placeholder screen
- routes render without provider credentials when adapters are stubbed or unavailable

### Capture And Session Creation

- user can create a project and session
- record or import flow produces durable session metadata
- transcript state is visible in the review surface

### Review And Composition

- review screen shows transcript plus enrichment or memory packet status
- composition profile changes persist and can be reopened
- composition run creation produces a tracked packet or job record
- the app-to-sidecar interaction is carried by the current `@beep/VT2` control plane or an explicitly documented migration

### Export Tracking

- export artifacts or queued export records are visible after a run
- failed provider or export work is represented by typed status and user-visible state

## Evidence To Capture

- command outputs or summaries
- explicit `not run`, `planned`, or `failed` labels for any listed gates that
  do not pass
- manual scenario notes
- screenshots only if they materially prove UI behavior
- delegation audit notes when read-only reviewers were used
- known gaps and the exact reason they remain deferred
- whether the implementation extended `packages/VT2` or intentionally migrated away from it
- which conformance sources were applied and whether any repo-law waivers or exceptions were needed
- the exact Graphiti recall query, exact error text when recall failed,
  fallback used, and writeback or session-end summary status

## Readiness Statement

P4 can only claim readiness when:

- the automated verification floor passes
- the manual scenario matrix is exercised for the implemented slice
- deferred provider behavior is named explicitly
- no unresolved blocker contradicts the canonical workflow
- the conformance gates are supported by recorded evidence rather than implication
- the latest read-only review wave reports no unresolved substantive issues

## Stop Conditions

- Stop if verification would require unrecorded implementation facts that P3 never captured.
- Stop if a blocker requires code changes, design changes, or planning changes rather than more verification.
- Stop if delegated auditors would become the effective owners of readiness.
- Stop if evidence is insufficient to support a readiness claim; record `not ready` or `blocked` instead of improvising confidence.
- Stop once the readiness statement is fully supported by the evidence that exists.

## Exit Gate

P4 is complete only when `VERIFICATION.md` records the automated results, manual scenario outcomes, deferred behavior, residual risks, and a final readiness statement that matches the evidence set without hidden assumptions.
