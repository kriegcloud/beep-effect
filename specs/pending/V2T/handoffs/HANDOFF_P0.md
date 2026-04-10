# HANDOFF P0 - Research

## Read First

- `../README.md`
- `../outputs/manifest.json`
- `../outputs/grill-log.md`
- `../../../../AGENTS.md`
- `../../../../.patterns/jsdoc-documentation.md`
- `../../../../standards/effect-first-development.md`
- `../../../../standards/schema-first.inventory.jsonc`
- `../../../../tooling/configs/src/eslint/SchemaFirstRule.ts`
- `../outputs/v2t_app_notes.html`
- `../outputs/V2_animination_V2T.md`
- `../../../../apps/V2T`
- `../../../../packages/VT2`
- `../../../../apps/V2T/scripts/build-sidecar.ts`
- `../../../../packages/common/ui/src/components/speech-input.tsx`

## Objective

Ground the V2T product notes in current repo reality and close the highest-impact product or architecture ambiguities before design work begins.

## Orchestrator Role

The session working P0 is the research orchestrator. It may delegate bounded read-only scouting or audit work, but it owns the synthesis, the decision log, and the phase exit.

## Local Plan Before Delegation

1. Read the required inputs and identify the open product, repo, and command-truth questions.
2. Inspect the blocking repo seams locally before asking workers to help.
3. Delegate only bounded read-only scouting or auditing that can run in parallel without changing the P0 objective.
4. Integrate worker findings yourself and translate them into research conclusions or explicit open questions.

## Required Outcomes

- classify which PRD claims already map to repo seams
- confirm the first execution slice
- name provider seams and deferred assumptions explicitly
- confirm the conformance inputs and live command/task assumptions that later phases must use
- append any new locked decisions to `../outputs/grill-log.md`
- write or refine `../RESEARCH.md`

## Stop Conditions

- Stop if resolving a question would require design or implementation work rather than research.
- Stop if a locked assumption conflicts with repo reality and needs explicit product judgment.
- Stop if command or task claims cannot be verified from the live workspace.
- Stop if delegation would create overlapping scope or de facto worker ownership of the phase.
- Stop once `RESEARCH.md` is concrete enough for P1 to design without rediscovering the repo.

## Exit Gate

P0 is complete when `RESEARCH.md` is concrete enough that P1 can design the system without reopening product scope or rediscovering repo-law constraints.
