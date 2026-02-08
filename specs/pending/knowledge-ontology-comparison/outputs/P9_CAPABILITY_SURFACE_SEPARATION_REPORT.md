# Phase 9: Capability Surface Separation Report

**Spec**: `knowledge-ontology-comparison`  
**Date**: 2026-02-08  
**Status**: Draft (planned)

## Problem Statement

We need “capability parity” with `.repos/effect-ontology` while preserving a clean separation between:

- reusable ontology tooling capabilities (library-like)
- TodoX wealth management use-case specifics (product/ontology/integration choices)

Phase 7 introduced `packages/knowledge/server/src/Service/WikidataClient.ts` and exported it via `packages/knowledge/server/src/Service/index.ts`, which risks making a specific external catalog appear to be part of the core capability surface.

## Observations (Current State)

- Phase 7’s targeted capabilities (`P6-06`, `P6-07`, `P6-08`, `P6-09`, `P6-11`) have test evidence and pass the verification suite.
- `P6-10` remains `PARTIAL` and is an open P2 gap (bundle parity uplift).
- TodoX requirements live in `documentation/todox/PRD.md` and should not dictate the core service exports in `packages/knowledge/server/src/Service/*`.

## Intended Outcome

1. Reconciliation capability remains present (candidates + review queue semantics), but the external catalog is pluggable.
2. Default wiring uses a safe “null catalog” so core services don’t force network dependencies.
3. Wikidata support, if desired, exists as an optional integration layer behind a capability interface.
4. Bundle composition is more ergonomic and closer to `.repos/effect-ontology` workflow layers.
5. TodoX PRD language explicitly references the capability layer and treats integrations as optional.

## Proposed Work Items

### P9-01 External Catalog Capability

- New capability interface: `ExternalEntityCatalog` (name TBD).
- Replace direct `WikidataClient` dependency in `ReconciliationService` with the capability interface.
- Move Wikidata implementation under an integration boundary (not `Service/` exports).

### P9-02 Bundle Parity Uplift (`P6-10`)

- Expand `Runtime/ServiceBundles.ts` coverage.
- Add tests to keep bundle composition deterministic and conflict-free.

### P9-03 TodoX Documentation Alignment

- Update `documentation/todox/PRD.md` to avoid implying Wikidata is a required system component.
- Add an explicit “capability layer vs integration layer vs domain ontology” separation section.

## Acceptance Criteria

- `packages/knowledge/server/src/Service/index.ts` does not export Wikidata integration code.
- `ReconciliationService` remains functional with tests, using either:
  - the null catalog, or
  - an optional Wikidata integration provided through Layer composition.
- `P6-10` status is updated with concrete evidence and tests.

