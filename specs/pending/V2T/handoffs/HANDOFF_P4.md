# HANDOFF P4 - Verification

## Read First

- `../README.md`
- `../outputs/manifest.json`
- `../RESEARCH.md`
- `../DESIGN_RESEARCH.md`
- `../PLANNING.md`
- `../EXECUTION.md`
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
- `../../../../packages/v2t-sidecar/package.json`
- `../../../../packages/v2t-sidecar/turbo.json`
- `../../../../infra/Pulumi.yaml`
- `../../../../infra/src/internal/entry.ts`
- `../../../../infra/src/V2T.ts`
- `../../../../infra/scripts/v2t-workstation.sh`
- `../../../../apps/V2T`
- `../../../../packages/v2t-sidecar`

## Objective

Verify the implemented V2T slice with both automated and manual evidence.

## Orchestrator Role

The session working P4 is the verification orchestrator. It may delegate read-only evidence or boundary audits, but it owns the readiness judgment and the phase exit.

## Local Plan Before Delegation

1. Re-read the prior phase artifacts, especially `../EXECUTION.md`, and identify the actual implemented slice.
2. Form a verification plan that matches that slice before delegating.
3. Gather automated evidence and manual scenario evidence locally for the blocking questions.
4. Use workers only for bounded read-only audits of evidence quality or boundary behavior.
5. Integrate the audit feedback yourself and keep the final readiness judgment in the orchestrator session.
6. Run a final read-only review wave before declaring readiness.

## Required Outcomes

- run the targeted verification floor
- exercise the manual scenario matrix for the implemented slice
- record any failures or deferred behavior explicitly
- prove whether the first slice extended the current `@beep/v2t-sidecar` seam or intentionally migrated away from it
- prove the relevant conformance gates with explicit evidence rather than implication
- write or refine `../VERIFICATION.md`

## Stop Conditions

- Stop if readiness would rely on missing execution evidence or unrun required commands.
- Stop if a blocker requires code changes, design changes, or planning changes rather than more verification.
- Stop if delegation would let auditors become the effective owners of readiness.
- Stop if the final review wave still reports unresolved substantive verification issues.
- Stop once `VERIFICATION.md` can make an evidence-backed readiness statement without hiding blockers.

## Exit Gate

P4 is complete when the readiness statement in `VERIFICATION.md` is supported by evidence rather than assumptions.
