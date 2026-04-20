# Orchestrator Operating Model

## Core Rules

- the active session is the orchestrator
- workers are bounded assistants, not alternate orchestrators
- the orchestrator owns planning, integration, and phase closure
- phase boundaries are real and must be respected

## Replacement-Spec Rules

- keep the Effect-specific governance lane separate from the JSDoc and TSDoc lane
- treat the current `beep-laws` rule surface as an explicit baseline, not an implicit one
- prefer default-path steering over opt-in-only assistance when ranking candidates
- permit `full replacement`, `staged cutover`, or `no-go yet`

## Phase Discipline

- P0, P1, and P2 are read-only outside this spec package
- P1 must lock the fixed steering evaluation corpus
- P2 must choose one primary path
- P3 implements that path only
- P4 verifies parity, performance, and steering evidence on the locked corpus

## Manifest Discipline

- treat `outputs/manifest.json` as the routing source of truth
- mark the active phase `IN_PROGRESS` when substantive work begins
- update `updated`, phase status, and `active_phase_assets` whenever routing or phase state changes
- do not silently advance to the next phase without satisfying the current phase exit gate
- if the phase stops early, record the stop reason in the active phase artifact and the manifest note

## Phase Closure Discipline

- before ending a phase, update the primary phase artifact and any required trackers for that phase
- before ending a phase, ensure the manifest reflects the real state rather than planned next steps
- if a follow-on phase is now unlocked, record that explicitly instead of implying it through prose
- if uncertainty remains, keep the phase open or mark it blocked rather than handing off fuzzy closure

## Delegation Discipline

- delegate only after forming a local plan
- give workers one concrete question
- keep write scopes disjoint
- require workers to report commands not run
- require workers to stop on contradiction instead of improvising new scope
