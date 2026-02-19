# Phase 9 Handoff: Capability Surface Separation

**Date**: 2026-02-08  
**From**: Phase 7 parity acceleration + Phase 8 repository-law remediation  
**To**: Phase 9 (`knowledge-ontology-comparison`)  
**Status**: Ready for implementation

## Why Phase 9 Exists

Phase 7 successfully closed several high-value gaps (classifier, enrichment, reconciliation semantics, fallback chains, cross-batch resolver) with tests. However:

1. `P6-10` (workflow/service bundle parity) is still `PARTIAL` and should be treated as an open P2 gap.
2. A concrete integration service (`packages/knowledge/server/src/Service/WikidataClient.ts`) was introduced and exported, which risks conflating:
   - “capability parity with effect-ontology”
   - “TodoX wealth-management ontology + integration choices”

Phase 9’s job is to keep the **capability layer** reusable while allowing TodoX to pick integrations without forcing them into the core service exports.

## Current State (Verified)

The Phase 7 verification suite passes end-to-end as of 2026-02-08:

- `bun run check --filter @beep/knowledge-domain`: PASS
- `bun run check --filter @beep/knowledge-server`: PASS
- `bun run lint --filter @beep/knowledge-server`: PASS
- `bun test packages/knowledge/server/test/Workflow/`: PASS
- `bun test packages/knowledge/server/test/Resilience/`: PASS
- `bun test packages/knowledge/server/test/Service/`: PASS
- `bun test packages/knowledge/server/test/Extraction/`: PASS
- `bun test packages/knowledge/server/test/EntityResolution/`: PASS
- `bun test packages/knowledge/server/test/GraphRAG/`: PASS

## Primary Objectives

1. Introduce a capability-level abstraction for external reconciliation catalogs (Wikidata becomes an optional integration, not a required service export).
2. Uplift `P6-10` bundles parity where it makes composition more ergonomic and closer to `.repos/effect-ontology`.
3. Align `documentation/todox/*` language so it references the capability layer without implying a particular external catalog is required.

## Guardrails

- Do not regress Phase 7 behavior or tests.
- Do not add Node fs/path usage or promise-first IO into core service modules.
- Keep external integration code behind clear boundaries (suggested: `packages/knowledge/server/src/Integrations/*`).
- Avoid expanding public exports in `packages/knowledge/server/src/Service/index.ts` with use-case integrations.

## Suggested Next Steps

1. Design `ExternalEntityCatalog` (or similar) interface:
   - `searchEntities(label, options) -> Effect<ReadonlyArray<Candidate>, Error>`
2. Refactor `ReconciliationService` to depend on that interface rather than `WikidataClient`.
3. Provide `NullExternalEntityCatalogLive` for default wiring and `WikidataExternalEntityCatalogLive` as optional.
4. Expand `ServiceBundles` and tests to address `P6-10`.
5. Update spec matrices and TodoX PRD language to reflect the separation.

