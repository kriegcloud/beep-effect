# Orchestrator Operating Model

## Core Rules

- the active session is the orchestrator
- workers are bounded assistants, not alternate orchestrators
- the orchestrator owns planning, integration, and phase closure
- phase boundaries are real and must be respected

## Retirement-Spec Rules

- keep the Effect lane separate from the JSDoc and TSDoc lane
- start from the earlier `full replacement` verdict instead of reopening it
- treat the remaining legacy surface as an explicit inventory, not a vague cleanup theme
- do not assume repo-wide ESLint removal is required for `full retirement`
- permit `full retirement`, `minimal shim retained`, or `no-go yet`

## Phase Discipline

- P0, P1, and P2 are read-only outside this spec package
- P1 must lock the inventory and the remove-or-retain matrix
- P2 must choose one primary retirement posture
- P3 implements that posture only
- P4 verifies retirement, docs-lane safety, and dependency or performance or operational evidence

## Manifest Discipline

- treat `outputs/manifest.json` as the routing source of truth
- mark the active phase `IN_PROGRESS` when substantive work begins
- update `updated`, phase status, and `active_phase_assets` whenever routing or phase state changes
- do not silently advance to the next phase without satisfying the current phase exit gate
- if the phase stops early, record the stop reason in the active phase artifact and the manifest note

## Delegation Discipline

- delegate only after forming a local plan
- give workers one concrete inventory or validation question
- keep write scopes disjoint
- require workers to report commands not run
- require workers to stop on contradiction instead of improvising new scope
