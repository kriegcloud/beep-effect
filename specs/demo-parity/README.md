# Demo Parity Specification

> Achieve 100% feature parity with the legacy FlexLayout demo at `tmp/FlexLayout/demo`

## Quick Reference

| Item | Location |
|------|----------|
| **Legacy Demo** | `tmp/FlexLayout/demo/` |
| **Legacy Dev Server** | `http://localhost:5173/` (run `npm run dev` in tmp/FlexLayout) |
| **Effect Port** | `packages/ui/ui/src/flex-layout/` |
| **New Demo Page** | `apps/todox/src/app/demo/page.tsx` |
| **Entry Point** | [`ORCHESTRATION_PROMPT.md`](./ORCHESTRATION_PROMPT.md) |
| **Research Reports** | [`research-reports/`](./research-reports/) |
| **Master Research** | [`outputs/master-research-report.md`](./outputs/master-research-report.md) |
| **Implementation Plan** | [`outputs/plan.md`](./outputs/plan.md) |
| **Progress Tracker** | [`outputs/progress.md`](./outputs/progress.md) |
| **Reflection Log** | [`REFLECTION_LOG.md`](./REFLECTION_LOG.md) |

## Objective

Create a demo page for the Effect-ported FlexLayout that achieves **100% feature parity** with the legacy React demo. This includes all interactive features, visual feedback, component integrations, and configuration options demonstrated in the original.

## Current State

### Already Implemented (from docking-system spec)

| Feature | Status | Location |
|---------|--------|----------|
| Drop target detection | COMPLETE | `model/*.canDrop()`, `Model.findDropTargetNode()` |
| Tab drag between tabsets | COMPLETE | Actions.MOVE_NODE |
| Edge docking (splits) | COMPLETE | RowNode.canDrop edge detection |
| Border docking | COMPLETE | BorderNode.canDrop |
| Visual drop indicator | COMPLETE | `apps/todox/demo/page.tsx` inline |
| External file drag | COMPLETE | Demo page file drag handlers |
| Cross-window drag state | COMPLETE | Static dragState pattern |

### Not Yet Implemented

| Feature | Priority | Complexity |
|---------|----------|------------|
| Theme switching (6+ themes) | P1 | Medium |
| Tab close buttons | P1 | Low |
| Tab rename (double-click) | P1 | Medium |
| Maximize/restore toggle | P1 | Low |
| Tab overflow menu/scroll | P2 | High |
| Context menus | P2 | Medium |
| Custom tab rendering | P2 | Medium |
| Toolbar buttons on tabsets | P2 | Medium |
| Popout windows | P3 | High |
| Nested layouts (submodels) | P3 | High |
| Component factory (grid, chart, etc.) | P1 | Medium |
| Layout persistence | P1 | Low |
| Font size adjustment | P3 | Low |
| Layout configuration selector | P2 | Medium |

## Phases

### Phase 0: Research

Multiple researcher agents explore:
1. Legacy demo via Playwright at `http://localhost:5173/`
2. Legacy source code at `tmp/FlexLayout/`
3. Current Effect port at `packages/ui/ui/src/flex-layout/`
4. Web resources for additional context

Each researcher produces a focused report in `research-reports/`. A synthesis agent combines all reports into `outputs/master-research-report.md`.

### Phase 1: Planning

Based on research findings, create a comprehensive `outputs/plan.md` with:
- Complete checklist of all features needed
- Priority ordering (P0 critical, P1 high, P2 medium, P3 deferred)
- Estimated complexity per feature
- File-to-file mapping (legacy -> Effect port)
- Test criteria for each feature

### Phase 2+: Implementation

Execute the plan systematically:
- One feature at a time
- Verify after each feature
- Update progress tracker
- Capture learnings in reflection log

## Context Preservation Strategy

This spec uses aggressive context management:

1. **Sub-agent delegation**: All file reading, code exploration, and implementation delegated via Task tool
2. **Compressed reports**: Each researcher produces a focused summary (< 500 lines)
3. **Master synthesis**: Single document combining all research findings
4. **Phase handoffs**: `handoffs/HANDOFF_P[N].md` captures state between sessions
5. **50% threshold**: If orchestrator reaches 50% context, create handoff immediately

## Success Criteria

- [ ] All interactive features from legacy demo work in Effect port demo
- [ ] All 6+ themes available and switchable
- [ ] Tab operations: drag, close, rename, maximize
- [ ] Splitter resizing works correctly
- [ ] Layout can be saved to and loaded from JSON
- [ ] At least 5 component types render in tabs (grid, text, form, etc.)
- [ ] Context menus function on tab/tabset right-click
- [ ] Overflow handling works for many tabs
- [ ] Demo is visually comparable to legacy demo

## Entry Point

Start with [`ORCHESTRATION_PROMPT.md`](./ORCHESTRATION_PROMPT.md) to begin execution.

---

*Created: 2026-01-10*
