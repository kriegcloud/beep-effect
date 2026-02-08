# Phase 9 Orchestrator Prompt

You are implementing **Phase 9: Capability Surface Separation** for `knowledge-ontology-comparison`.

## Goal

Achieve *capability parity* with `.repos/effect-ontology` while maintaining a strict separation between:

- **effect-ontology parity surface**: reusable, domain-agnostic capability modules (query/reasoning, extraction, resilience, workflow, reconciliation primitives)
- **TodoX wealth management use-case**: domain ontologies, integrations, and product-specific requirements in `documentation/todox/*` and TodoX-specific code paths

This phase exists because Phase 7 introduced a concrete external integration (`WikidataClient`) as a first-class service export, which risks coupling “capability parity” to one specific external catalog.

## Required Inputs

- `specs/pending/knowledge-ontology-comparison/outputs/P6_PARITY_GAP_MATRIX.md`
- `specs/pending/knowledge-ontology-comparison/outputs/COMPARISON_MATRIX.md`
- `specs/pending/knowledge-ontology-comparison/outputs/GAP_ANALYSIS.md`
- `specs/pending/knowledge-ontology-comparison/outputs/IMPLEMENTATION_ROADMAP.md`
- `specs/pending/knowledge-ontology-comparison/outputs/P7_PARITY_CLOSURE_REPORT.md`
- `documentation/todox/PRD.md`

## Scope

- `packages/knowledge/server/src/Service/*`
- `packages/knowledge/server/src/Runtime/*`
- `packages/knowledge/server/test/{Service,Resilience,Workflow}/*`
- `documentation/todox/*`
- `specs/pending/knowledge-ontology-comparison/outputs/*`

## Operating Rules

1. “Capability parity” means *parity of abstract behaviors and invariants*, not necessarily parity of external vendors or data sources.
2. Integrations (Wikidata, vendor APIs, scrapers) must be isolated behind capability-level interfaces and optional layers.
3. Do not expand public exports from `packages/knowledge/server/src/Service/index.ts` with use-case-specific integrations.
4. All refactors must keep Phase 7 tests passing, and must add new tests for any new capability abstraction.
5. Avoid unsafe casts, promise-first code, and native Node APIs in core services (Effect + @effect/platform only).

## Mandatory Implementation Targets

### P9-00 Artifact Refresh

- Update `P6_PARITY_GAP_MATRIX.md`, `COMPARISON_MATRIX.md`, `GAP_ANALYSIS.md`, `IMPLEMENTATION_ROADMAP.md` to:
  - explicitly represent `P6-10` as **open** (it is currently `PARTIAL`)
  - explicitly represent reconciliation as a *pluggable external catalog capability*, not “Wikidata as a required dependency”

### P9-01 External Catalog Abstraction (Replace Wikidata Coupling)

- Introduce a capability-level interface (name suggestion: `ExternalEntityCatalog` or `ReconciliationCatalog`) used by `ReconciliationService`.
- Provide:
  - a “null” live layer that returns zero candidates (safe default)
  - an optional Wikidata layer living under an `Integrations/*` boundary (not exported from `Service/index.ts`)
- Update `ReconciliationService` wiring + tests accordingly.

### P9-02 Bundle Parity Uplift (`P6-10`)

- Expand `packages/knowledge/server/src/Runtime/ServiceBundles.ts` to cover the new capability modules in a composable way, closer to `.repos/effect-ontology/.../WorkflowLayers.ts`.
- Add/extend tests in `packages/knowledge/server/test/Resilience/TokenBudgetAndBundles.test.ts`.

### P9-03 TodoX Documentation Alignment

- Update `documentation/todox/PRD.md` to:
  - describe the “capability layer” as reusable ontology tooling
  - treat specific external catalogs (like Wikidata) as optional integrations, not requirements
  - keep wealth-management ontology specifics clearly separated from effect-ontology parity claims

## Required Outputs

Create/update:

- `specs/pending/knowledge-ontology-comparison/outputs/P9_CAPABILITY_SURFACE_SEPARATION_REPORT.md`
- `specs/pending/knowledge-ontology-comparison/outputs/P6_PARITY_GAP_MATRIX.md`
- `specs/pending/knowledge-ontology-comparison/outputs/COMPARISON_MATRIX.md`
- `specs/pending/knowledge-ontology-comparison/outputs/GAP_ANALYSIS.md`
- `specs/pending/knowledge-ontology-comparison/outputs/IMPLEMENTATION_ROADMAP.md`
- `specs/pending/knowledge-ontology-comparison/REFLECTION_LOG.md`

## Verification

Run:

```bash
bun run check --filter @beep/knowledge-domain
bun run check --filter @beep/knowledge-server
bun run lint --filter @beep/knowledge-server
bun test packages/knowledge/server/test/Workflow/
bun test packages/knowledge/server/test/Resilience/
bun test packages/knowledge/server/test/Service/
```

## Success Criteria

- [ ] `ReconciliationService` no longer depends on a hard-coded Wikidata service in its exported public API surface
- [ ] `P6-10` is either `FULL` or explicitly documented as intentionally narrower with tests and rationale
- [ ] TodoX PRD references “capability parity” as a reusable layer, with integrations treated as optional
- [ ] verification commands pass

