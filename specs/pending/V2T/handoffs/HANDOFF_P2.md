# HANDOFF P2 - Planning

## Read First

- `../README.md`
- `../outputs/manifest.json`
- `../RESEARCH.md`
- `../DESIGN_RESEARCH.md`
- `../../../../AGENTS.md`
- `../../../../.patterns/jsdoc-documentation.md`
- `../../../../standards/effect-first-development.md`
- `../../../../standards/schema-first.inventory.jsonc`
- `../../../../tooling/configs/src/eslint/SchemaFirstRule.ts`
- `../../../../apps/V2T`
- `../../../../packages/VT2`
- `../../../../infra/Pulumi.yaml`
- `../../../../infra/src/internal/entry.ts`
- `../../../../infra/src/V2T.ts`
- `../../../../infra/scripts/v2t-workstation.sh`
- `../../../../apps/V2T/scripts/build-sidecar.ts`
- `../../../../package.json`
- `../../../../turbo.json`
- `../../../../infra/package.json`
- `../../../../apps/V2T/package.json`
- `../../../../apps/V2T/turbo.json`
- `../../../../packages/VT2/package.json`
- `../../../../packages/VT2/turbo.json`

## Objective

Produce a dependency-aware implementation sequence for the first V2T slice.

## Orchestrator Role

The session working P2 is the planning orchestrator. It may delegate read-only command-truth or gate audits, but it owns the plan, command matrix, and phase exit.

## Local Plan Before Delegation

1. Reconcile `RESEARCH.md` and `DESIGN_RESEARCH.md` into the open planning decisions.
2. Inspect the live package manifests, task graph, and concrete seams before locking commands or rollout order.
3. Form a local implementation sequence before delegating any audits.
4. Use workers only to challenge command truth, dependency order, or gate completeness.
5. Integrate the audits yourself and keep `PLANNING.md` explicit about what is planned versus already proven.
6. Run a read-only review wave before closing the phase.

## Required Outcomes

- name the implementation tracks and their ordering
- identify the primary file or surface groups to change
- lock the acceptance criteria
- lock the default verification commands
- lock the real conformance gates, including the repo-law commands and the VT2 task limitations
- keep the plan tied to the existing `@beep/VT2` seam unless a migration is explicit
- write or refine `../PLANNING.md`

## Stop Conditions

- Stop if a command, path, or dependency assumption cannot be verified from the live workspace.
- Stop if planning starts slipping into code implementation or speculative design.
- Stop if the plan would make hidden architecture decisions that belong back in P1.
- Stop if the latest review wave still reports unresolved substantive planning issues.
- Stop once another agent could implement the approved slice without inferring missing command or acceptance criteria details.

## Exit Gate

P2 is complete when another agent can implement the slice from the plan without making hidden architecture decisions.
