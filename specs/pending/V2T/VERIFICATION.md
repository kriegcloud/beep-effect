# V2T - P4 Verification

## Status

NOT_STARTED

## Goal

Prove the implemented V2T slice matches the canonical spec and clearly separate shipped behavior from deferred provider ambition.

## Automated Verification Floor

- `bunx turbo run check --filter=./apps/V2T`
- `bunx turbo run test --filter=./apps/V2T`
- `bunx turbo run lint --filter=./apps/V2T`
- `bunx turbo run build --filter=./apps/V2T`

Run broader commands only when the implementation changes shared or managed surfaces.

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

### Export Tracking

- export artifacts or queued export records are visible after a run
- failed provider or export work is represented by typed status and user-visible state

## Evidence To Capture

- command outputs or summaries
- manual scenario notes
- screenshots only if they materially prove UI behavior
- known gaps and the exact reason they remain deferred

## Readiness Statement

P4 can only claim readiness when:

- the automated verification floor passes
- the manual scenario matrix is exercised for the implemented slice
- deferred provider behavior is named explicitly
- no unresolved blocker contradicts the canonical workflow
