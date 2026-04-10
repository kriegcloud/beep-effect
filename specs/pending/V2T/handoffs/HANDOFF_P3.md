# HANDOFF P3 - Execution

## Read First

- `../README.md`
- `../outputs/manifest.json`
- `../RESEARCH.md`
- `../DESIGN_RESEARCH.md`
- `../PLANNING.md`
- `../../../../AGENTS.md`
- `../../../../.patterns/jsdoc-documentation.md`
- `../../../../standards/effect-first-development.md`
- `../../../../standards/schema-first.inventory.jsonc`
- `../../../../tooling/configs/src/eslint/SchemaFirstRule.ts`
- `../../../../package.json`
- `../../../../turbo.json`
- `../../../../infra/package.json`
- `../../../../apps/V2T/package.json`
- `../../../../apps/V2T/turbo.json`
- `../../../../packages/VT2/package.json`
- `../../../../packages/VT2/turbo.json`
- `../../../../infra/Pulumi.yaml`
- `../../../../infra/src/entry.ts`
- `../../../../infra/src/V2T.ts`
- `../../../../infra/scripts/v2t-workstation.sh`
- `../../../../apps/V2T`
- `../../../../packages/VT2`

## Objective

Implement the committed first V2T slice in code and record exactly what changed.

## Orchestrator Role

The session working P3 is the execution orchestrator. It may delegate bounded implementation work to specialist workers with disjoint write scopes, but it owns integration, command gates, and phase exit.

## Local Plan Before Delegation

1. Re-state the approved slice from the prior phase artifacts before changing code.
2. Decide which blocking work the orchestrator keeps local.
3. Partition only the remaining implementation work into disjoint write scopes.
4. Require worker results to come back with exact files, commands, findings, and residual risks.
5. Integrate and verify every worker result yourself before updating `../EXECUTION.md`.
6. Run a read-only review wave after each meaningful merge wave and before closing the phase.

## Required Outcomes

- implement only the approved scope
- extend the current `@beep/VT2` control plane unless an explicit migration is part of the approved scope
- keep provider logic behind adapters
- satisfy the effect-first, schema-first, and JSDoc/docgen constraints named in the phase docs
- record commands run, touched surfaces, and deviations in `../EXECUTION.md`
- stop after targeted verification for the implemented work

## Stop Conditions

- Stop if implementation would widen scope beyond the approved slice.
- Stop if worker write scopes overlap or if integration reveals conflicting assumptions.
- Stop if required gates fail and the failures are not resolved during P3.
- Stop if newly discovered design or planning gaps belong back in P1 or P2.
- Stop if the latest review wave still reports unresolved substantive execution issues.
- Stop once the approved slice is implemented and evidenced; do not silently advance into P4.

## Exit Gate

P3 is complete when the committed slice exists in the repo and `EXECUTION.md` is a trustworthy implementation record.
