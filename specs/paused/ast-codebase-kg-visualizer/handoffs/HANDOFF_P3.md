# Handoff P3

## Objective

Freeze `/kg` D3 component architecture and interaction/accessibility contract.

## Inputs

- `specs/pending/ast-codebase-kg-visualizer/outputs/p2-web-api-and-loader.md`
- `specs/pending/ast-codebase-kg-visualizer/outputs/kg-bundle/visualize-v2.html`
- `apps/web/src/components/graph/ForceGraph.tsx`
- `apps/web/src/components/graph/GraphPanel.tsx`
- `apps/web/src/app/(app)/layout.tsx`

## Output

- `specs/pending/ast-codebase-kg-visualizer/outputs/p3-d3-ui-implementation.md`

## Command and Evidence Contract

| Command ID | Command | Evidence Artifact |
|---|---|---|
| P3-C01 | `rg -n "ForceGraph|GraphPanel|NodeDetail" apps/web/src/components/graph` | `specs/pending/ast-codebase-kg-visualizer/outputs/evidence/p3/web-graph-component-audit.log` |
| P3-C02 | `rg -n "@import|--font" apps/web/src/app/globals.css apps/web/src/app/layout.tsx` | `specs/pending/ast-codebase-kg-visualizer/outputs/evidence/p3/theme-font-audit.log` |
| P3-C03 | `rg -n "depth|search|hover|zoom|inspector|filter" specs/pending/ast-codebase-kg-visualizer/outputs/kg-bundle/visualize-v2.html` | `specs/pending/ast-codebase-kg-visualizer/outputs/evidence/p3/reference-ui-behavior-audit.log` |

## Completion Checklist

- [ ] Component layout and ownership is explicit.
- [ ] Interaction contract is explicit.
- [ ] Accessibility and keyboard contract is explicit.
- [ ] `outputs/manifest.json` updated (`phases.p3.status`, `updated`).
