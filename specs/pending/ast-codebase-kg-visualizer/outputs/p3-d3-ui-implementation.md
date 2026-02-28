# P3: D3 UI Implementation Contract

## Goal

Define implementation-ready `/kg` D3 visualizer architecture with explicit interaction and accessibility behavior.

## Required Inputs

1. `specs/pending/ast-codebase-kg-visualizer/outputs/p2-web-api-and-loader.md`
2. `specs/pending/ast-codebase-kg-visualizer/outputs/kg-bundle/visualize-v2.html`
3. `apps/web/src/components/graph/ForceGraph.tsx`
4. `apps/web/src/app/(app)/layout.tsx`

## Output Path

`specs/pending/ast-codebase-kg-visualizer/outputs/p3-d3-ui-implementation.md`

## Frozen UI Surface

1. New route: `apps/web/src/app/(app)/kg/page.tsx`
2. New component root: `apps/web/src/components/kg/GraphExplorer.tsx`
3. D3 rendering module: `apps/web/src/components/kg/GraphCanvas.tsx`
4. Controls and panels:
   - `FilterPanel.tsx`
   - `DepthSlider.tsx`
   - `SearchBar.tsx`
   - `NodeInspector.tsx`
   - `StatsBar.tsx`
   - `UploadOverlay.tsx`

## Frozen Interaction Contract

1. depth slider presets (1..5)
2. node and edge visibility filters
3. hover neighborhood highlight
4. click inspector open/close
5. `/` hotkey focus search, `Esc` clear
6. zoom/pan and initial auto-fit

## Accessibility Contract

1. focus-visible styles for interactive controls
2. keyboard-operable filter toggles and slider
3. semantic labels for search, depth, and inspector controls
4. color-only distinctions backed by textual labels/counts

## Command and Evidence Matrix

| Command ID | Command | Evidence Artifact |
|---|---|---|
| P3-C01 | component structure audit | `outputs/evidence/p3/component-structure-audit.log` |
| P3-C02 | interaction contract audit | `outputs/evidence/p3/interaction-contract-audit.log` |
| P3-C03 | accessibility checklist audit | `outputs/evidence/p3/accessibility-contract-audit.log` |

## Completion Checklist

- [ ] Route and component boundaries are frozen.
- [ ] Interaction behavior is frozen.
- [ ] Accessibility contract is frozen.
- [ ] Evidence paths are complete.

## Explicit Handoff

Next phase: [HANDOFF_P4.md](../handoffs/HANDOFF_P4.md)
