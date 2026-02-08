# Phase 9: Capability Surface Separation Report

**Spec**: `knowledge-ontology-comparison`  
**Date**: 2026-02-08  
**Status**: Implemented

## Summary

Phase 7 introduced a concrete external catalog integration (`WikidataClient`) as a first-class exported service, which risked coupling “capability parity” to a specific vendor.

Phase 9 refactors reconciliation to depend on a capability-level interface and makes Wikidata an optional integration behind that interface.

## What Changed

### P9-01 External Catalog Abstraction (Replace Wikidata Coupling)

- Introduced `ExternalEntityCatalog` as the capability-level interface used by reconciliation:
  - `packages/knowledge/server/src/Service/ExternalEntityCatalog.ts`
- Refactored `ReconciliationService` to depend on `ExternalEntityCatalog` instead of a Wikidata-specific client:
  - `packages/knowledge/server/src/Service/ReconciliationService.ts`
- Added a safe default live layer that returns no candidates:
  - `ExternalEntityCatalogNoneLive` in `packages/knowledge/server/src/Service/ExternalEntityCatalog.ts`
- Added an optional Wikidata integration layer under an integrations boundary:
  - `packages/knowledge/server/src/Service/Integrations/WikidataCatalog.ts`
- Removed Wikidata integration from the core public service surface:
  - `packages/knowledge/server/src/Service/index.ts` no longer exports the integration.

### P9-02 Bundle Parity Uplift (`P6-10`)

- Expanded `packages/knowledge/server/src/Runtime/ServiceBundles.ts` with a reconciliation bundle that is safe by default:
  - `ReconciliationBundleLive` uses `ExternalEntityCatalogNoneLive` + `StorageMemoryLive` + `ReconciliationServiceLive`.
- Extended bundle tests to assert the safe-default behavior:
  - `packages/knowledge/server/test/Resilience/TokenBudgetAndBundles.test.ts`

Note: `P6-10` remains tracked as `OPEN` because knowledge bundles are still a subset of `.repos/effect-ontology`’s `WorkflowLayers.ts` surface. This phase establishes composable capability bundles and removes vendor coupling without claiming full workflow-layer parity.

### P9-03 TodoX Documentation Alignment

- Updated `documentation/todox/PRD.md` to explicitly separate:
  - reusable capability layer (effect-ontology parity surface), and
  - optional integrations (external catalogs), and
  - TodoX wealth-management ontology specifics.

## Test/Verification Evidence

Verification commands (per Phase 9):

```bash
bun run check --filter @beep/knowledge-domain
bun run check --filter @beep/knowledge-server
bun run lint --filter @beep/knowledge-server
bun test packages/knowledge/server/test/Workflow/
bun test packages/knowledge/server/test/Resilience/
bun test packages/knowledge/server/test/Service/
```

## Success Criteria Mapping

- `ReconciliationService` no longer depends on a hard-coded Wikidata service in its exported public API surface:
  - Achieved by `ExternalEntityCatalog` dependency + integration moved under `Service/Integrations/*`.
- `P6-10` is either `FULL` or explicitly documented as intentionally narrower:
  - Documented as `OPEN` and narrower than reference workflow layers, with targeted uplift applied and tests added.
- TodoX PRD references “capability parity” as a reusable layer, with integrations treated as optional:
  - Updated in `documentation/todox/PRD.md`.

