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
- `infra/package.json`
- root `package.json`, root `turbo.json`, `apps/V2T/package.json`,
  `apps/V2T/turbo.json`, `packages/VT2/package.json`, and
  `packages/VT2/turbo.json` for live workspace package names, task
  availability, and command-truth checks

## Evidence Recording Rules

- Every readiness claim must point to recorded automated results, manual evidence, or explicit blocker notes in this document.
- Distinguish `passed`, `failed`, `blocked`, `not run`, and `not applicable`; missing evidence is not equivalent to pass.
- If a required command was not run, say why and treat readiness accordingly.
- Worker audits can challenge or confirm evidence, but the orchestrator must make the final interpretation.
- If verification reveals implementation gaps, send that work back to P3 explicitly instead of relabeling the gap as deferred ambition.
- Record Graphiti recall attempted, exact query, exact error text when recall
  fails, whether `get_episodes` fallback was attempted and what it returned,
  fallback used, and any durable writeback or queued session-end summary using
  `prompts/GRAPHITI_MEMORY_PROTOCOL.md`.

## Automated Verification Floor

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

### Resilience Evidence Minimum

- whenever the implemented slice includes capture or desktop lifecycle behavior, record at least one automated recovery, interruption, backpressure, or typed native bridge path
- command success alone is not enough for readiness when the slice depends on direct capture, recovery, or Tauri-only lifecycle behavior

### Readiness Gate

- `bun run check`
- `bun run lint`
- `bun run test`
- `bun run docgen` when exported APIs or JSDoc examples changed

Important note:

- `@beep/VT2` has no package-local `lint` or `docgen` task, so VT2 conformance must be evidenced through the repo-law commands above
- `@beep/infra` is a live package with package-local `check`, `test`, and `lint` scripts, so installer-surface work must record its targeted evidence instead of treating infra as future scope
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
- the typed native desktop bridge is available for the first-slice Tauri-only actions the workflow depends on
- the desktop topology stays within one main workspace window, native file dialogs, and at most one focused capture or recovery surface; settings and review stay in the main workspace for the first slice

### Capture And Session Creation

- user can create a project and session
- record and import both produce durable session metadata inside the same session model
- direct capture persists chunk or segment intermediates strongly enough that interrupted sessions can be discovered for recover or discard
- recover or discard flows leave the workspace in an explicit typed state instead of silent failure
- transcript state is visible in the review surface

### Desktop Preferences And Recovery

- capture, composition, and recovery defaults persist across relaunches without being mixed into project-specific records
- the app rehydrates last-used workflow defaults without corrupting project or run state
- sidecar lifecycle and recovery status are surfaced through the typed desktop bridge rather than inferred from ad-hoc UI state

### Review And Composition

- review screen shows transcript plus enrichment or memory packet status
- composition profile changes persist and can be reopened
- composition run creation produces a tracked packet or job record
- the app-to-sidecar interaction is carried by the current `@beep/VT2` control plane or an explicitly documented migration

### Export Tracking

- export artifacts or queued export records are visible after a run
- failed provider or export work is represented by typed status and user-visible state

### Workstation Installer And Deployment

- when `infra` changed, the workstation config and stack entrypoint evidence match the live `V2TWorkstation` surface
- when `infra` changed, installer or deployment-specific commands and validations are recorded explicitly instead of being implied by prose

## Evidence To Capture

- command outputs or summaries
- explicit `not run`, `planned`, or `failed` labels for any listed gates that
  do not pass
- manual scenario notes
- screenshots only if they materially prove UI behavior
- the exact automated recovery, interruption, backpressure, or typed native bridge path recorded for the slice when capture or desktop lifecycle behavior is in scope
- recovery or failure-path evidence for interrupted capture, backpressure, or sidecar lifecycle when those behaviors are part of the implemented slice
- delegation audit notes when read-only reviewers were used
- known gaps and the exact reason they remain deferred
- whether the implementation extended `packages/VT2` or intentionally migrated away from it
- which conformance sources were applied and whether any repo-law waivers or exceptions were needed
- the exact Graphiti recall query, exact error text when recall failed,
  whether `get_episodes` fallback was attempted and what it returned, fallback
  used, and writeback or session-end summary status

## Readiness Statement

P4 can only claim readiness when:

- the automated verification floor passes
- the manual scenario matrix is exercised for the implemented slice
- deferred provider behavior is named explicitly
- no unresolved blocker contradicts the canonical workflow
- the conformance gates are supported by recorded evidence rather than implication
- non-happy-path desktop behavior required by the slice has explicit evidence rather than being assumed from happy-path output
- the latest read-only review wave reports no unresolved substantive issues

## Stop Conditions

- Stop if verification would require unrecorded implementation facts that P3 never captured.
- Stop if a blocker requires code changes, design changes, or planning changes rather than more verification.
- Stop if delegated auditors would become the effective owners of readiness.
- Stop if evidence is insufficient to support a readiness claim; record `not ready` or `blocked` instead of improvising confidence.
- Stop once the readiness statement is fully supported by the evidence that exists.

## Exit Gate

P4 is complete only when `VERIFICATION.md` records the automated results, manual scenario outcomes, deferred behavior, residual risks, and a final readiness statement that matches the evidence set without hidden assumptions.
