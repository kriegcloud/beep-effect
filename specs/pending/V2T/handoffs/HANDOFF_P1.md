# HANDOFF P1 - Design Research

## Read First

- `../README.md`
- `../outputs/manifest.json`
- `../RESEARCH.md`
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
- `../../../../packages/common/ui/src/components/speech-input.tsx`

## Objective

Turn the research baseline into a decision-complete workflow, domain, storage, and adapter design.

## Orchestrator Role

The session working P1 is the design orchestrator. It may delegate bounded schema, service, or boundary analysis, but it owns the final design contract and the phase exit.

## Local Plan Before Delegation

1. Re-read `RESEARCH.md` and identify which design questions are still genuinely open.
2. Inspect the live app, sidecar, and shared-package seams that constrain those questions.
3. Form a local design plan before delegating any schema, service, or boundary analysis.
4. Integrate worker recommendations yourself; only orchestrator-approved conclusions belong in `DESIGN_RESEARCH.md`.
5. Run a read-only review wave before closing the phase.

## Required Outcomes

- finalize the canonical user flow
- define the durable domain objects and service boundaries
- map the workflow onto app, sidecar, and shared-package seams
- resolve how the current `@beep/v2t-sidecar` control plane carries the first slice
- keep the authoritative typed desktop bridge, native-shell versus sidecar capture ownership split, and first-slice window topology explicit enough that P2 does not need to infer them
- capture the effect-first, schema-first, and docgen/JSDoc constraints that P2 and P3 must satisfy
- write or refine `../DESIGN_RESEARCH.md`

## Stop Conditions

- Stop if the design would reopen P0 product scope or invent repo migrations without evidence.
- Stop if a design choice depends on implementation detail that should remain deferred to P2 or P3.
- Stop if delegation would leave a worker as the effective author of the system contract.
- Stop if the latest review wave still reports unresolved substantive design issues.
- Stop once P2 can plan at file and surface level without hidden product or architecture decisions.

## Exit Gate

P1 is complete when P2 can write a file-level plan without reopening the product model.
