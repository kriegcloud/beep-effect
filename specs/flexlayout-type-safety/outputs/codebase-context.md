# FlexLayout File Checklist

> Generated: 2026-01-11 | Total Files: 44

---

## Model Files (15 files)

| File | Status | Issues | Agent | Notes |
|------|--------|--------|-------|-------|
| IJsonModel.ts | completed | — | effect-schema-expert | Schema classes defined |
| BorderNode.ts | completed | — | effect-schema-expert | decodeUnknownSync |
| TabNode.ts | completed | — | effect-schema-expert | decodeUnknownSync |
| Model.ts | analyzed | 47 crit, 23 high, 12 med | effect-schema-expert | Main model, needs full session |
| TabSetNode.ts | **fixed** | ~25 issues | effect-schema-expert | toJson() + A.map/A.forEach |
| RowNode.ts | **fixed** | ~15 issues | effect-schema-expert | toJson() + A.map/A.reduce/A.forEach |
| BorderSet.ts | **fixed** | ~8 issues | effect-predicate-master | A.map/A.forEach/A.findFirst |
| Node.ts | **fixed** | ~20 issues | effect-predicate-master | A.forEach/A.insertAt/A.remove |
| Action.ts | pending | | | |
| Actions.ts | pending | | | |
| IDraggable.ts | pending | | | |
| IDropTarget.ts | pending | | | |
| ICloseType.ts | pending | | | |
| LayoutWindow.ts | pending | | | |
| Utils.ts | pending | | | |

## View Files (19 files)

| File | Status | Issues | Agent | Notes |
|------|--------|--------|-------|-------|
| Layout.tsx | pending | | | Main layout component |
| TabSet.tsx | pending | | | |
| Tab.tsx | pending | | | |
| TabButton.tsx | pending | | | |
| TabButtonStamp.tsx | pending | | | |
| Row.tsx | pending | | | |
| Splitter.tsx | pending | | | |
| BorderTabSet.tsx | pending | | | |
| BorderTab.tsx | pending | | | |
| BorderButton.tsx | pending | | | |
| DragContainer.tsx | pending | | | |
| PopoutWindow.tsx | pending | | | |
| PopupMenu.tsx | pending | | | |
| Overlay.tsx | pending | | | |
| ErrorBoundary.tsx | pending | | | |
| Icons.tsx | pending | | | |
| SizeTracker.tsx | pending | | | |
| TabOverflowHook.tsx | pending | | | |
| Utils.tsx | pending | | | |

## Utility Files (10 files)

| File | Status | Issues | Agent | Notes |
|------|--------|--------|-------|-------|
| Attribute.ts | pending | | | |
| AttributeDefinitions.ts | pending | | | |
| DockLocation.ts | pending | | | |
| DropInfo.ts | pending | | | |
| I18nLabel.ts | pending | | | |
| index.ts | pending | | | Re-exports |
| Orientation.ts | pending | | | |
| Rect.ts | pending | | | |
| Types.ts | pending | | | |
| values.ts | pending | | | |

---

## Summary

| Category | Total | Completed | Pending |
|----------|-------|-----------|---------|
| Model | 15 | 7 | 8 |
| View | 19 | 0 | 19 |
| Utility | 10 | 0 | 10 |
| **Total** | **44** | **7** | **37** |

---

## Priority Queue (Model files with toJson)

Based on orchestrator prompt priority order:

1. **Model.ts** — Main model, most complex
2. **TabSetNode.ts** — Tab set serialization
3. **RowNode.ts** — Row serialization
4. **BorderSet.ts** — Border collection
5. **Node.ts** — Base node class

---

## Session Progress Log

### Session 1 (Current)
- Started: 2026-01-11
- Files analyzed: 5 (Model.ts, TabSetNode.ts, RowNode.ts, BorderSet.ts, Node.ts)
- Files fixed: 4 (TabSetNode.ts, RowNode.ts, BorderSet.ts, Node.ts)
- Build status: PASS (81/81 checks, 48/48 builds)
