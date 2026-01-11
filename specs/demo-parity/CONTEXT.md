# Demo Parity Technical Context

> Compressed technical context for sub-agents

## Repository Structure

```
beep-effect/
├── apps/
│   └── todox/
│       └── src/app/demo/page.tsx  <- NEW DEMO PAGE
├── packages/
│   └── ui/
│       └── ui/
│           └── src/flex-layout/   <- EFFECT PORT
└── tmp/
    └── FlexLayout/                <- LEGACY REFERENCE
        ├── demo/                  <- LEGACY DEMO
        └── src/                   <- LEGACY SOURCE
```

## Key File Locations

### Legacy (Reference Implementation)

| Purpose | Path | Key Lines |
|---------|------|-----------|
| Demo App | `tmp/FlexLayout/demo/App.tsx` | 1-500 (entire) |
| Factory Function | `tmp/FlexLayout/demo/App.tsx` | 270-353 |
| Layout Files | `tmp/FlexLayout/demo/public/layouts/*.layout` | All |
| Model | `tmp/FlexLayout/src/model/Model.ts` | 1-600 |
| Actions | `tmp/FlexLayout/src/model/Actions.ts` | 1-150 |
| JSON Schema | `tmp/FlexLayout/src/model/IJsonModel.ts` | All |
| Layout View | `tmp/FlexLayout/src/view/Layout.tsx` | 1-400 |
| TabSet View | `tmp/FlexLayout/src/view/TabSet.tsx` | All |
| Tab View | `tmp/FlexLayout/src/view/Tab.tsx` | All |
| Themes | `tmp/FlexLayout/style/*.scss` | All |

### Effect Port (Implementation Target)

| Purpose | Path |
|---------|------|
| Main Export | `packages/ui/ui/src/flex-layout/index.ts` |
| Model | `packages/ui/ui/src/flex-layout/model/model.ts` |
| Actions | `packages/ui/ui/src/flex-layout/model/actions.model.ts` |
| TabSetNode | `packages/ui/ui/src/flex-layout/model/tab-set-node.ts` |
| TabNode | `packages/ui/ui/src/flex-layout/model/tab-node.ts` |
| RowNode | `packages/ui/ui/src/flex-layout/model/row-node.ts` |
| BorderNode | `packages/ui/ui/src/flex-layout/model/border-node.ts` |
| Layout View | `packages/ui/ui/src/flex-layout/view/layout.tsx` |
| TabSet View | `packages/ui/ui/src/flex-layout/view/tab-set.tsx` |
| Tab View | `packages/ui/ui/src/flex-layout/view/tab.tsx` |
| Demo Page | `apps/todox/src/app/demo/page.tsx` |

## Effect Schema Class Pattern

The port uses Effect Schema for immutable models:

```typescript
// Schema class definition
export class TabNode extends S.Class<TabNode>("TabNode")({
  id: S.optionalWith(S.String, { as: "Option" }),
  name: S.optionalWith(S.String, { as: "Option" }),
  component: S.optionalWith(S.String, { as: "Option" }),
  // ... more fields
}) {
  // Runtime methods
  getId(): string {
    return O.getOrElse(this.id, () => "");
  }

  canDrop(dragNode: IDraggable, x: number, y: number): DropInfo | undefined {
    // Implementation
  }
}
```

## Key Patterns Used

### Namespace Imports (Required)

```typescript
import * as S from "effect/Schema";
import * as O from "effect/Option";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as Match from "effect/Match";
```

### Option Handling

```typescript
// Get with fallback
const id = O.getOrElse(node.id, () => "");

// Map over Option
const result = O.map(node.rect, rect => rect.width);

// Match Option
const value = O.match(node.selected, {
  onNone: () => -1,
  onSome: (v) => v
});
```

### Array Operations

```typescript
// Instead of arr.map(...)
A.map(arr, (item) => item.value);

// Instead of arr.filter(...)
A.filter(arr, (item) => item.enabled);

// Instead of arr.find(...)
A.findFirst(arr, (item) => item.id === targetId);

// Instead of arr.length
A.length(arr);

// Instead of arr.push(item)
A.append(arr, item);
```

### Type Guards

```typescript
// Defined in model/model.ts
export const isTabNode = (node: unknown): node is TabNode =>
  node instanceof TabNode;

export const isTabSetNode = (node: unknown): node is TabSetNode =>
  node instanceof TabSetNode;

export const isRowNode = (node: unknown): node is RowNode =>
  node instanceof RowNode;
```

## Model Architecture

```
Model
├── _root: RowNode           # Root layout container
├── _borders: BorderSet      # Edge border tabs
├── _nodeIdMap: Map          # O(1) node lookup
├── _parentMap: Map          # O(1) parent lookup
└── _activeTabSet: Option    # Currently focused tabset

RowNode
├── children: (RowNode | TabSetNode)[]
├── weight: number
└── orientation: Orientation

TabSetNode
├── children: TabNode[]
├── selected: Option<number>
├── maximized: boolean
└── active: boolean

TabNode
├── id: string
├── name: string
├── component: string
└── config: Record
```

## Actions System

```typescript
// Action creation (legacy)
Actions.addNode({ toNode: parentId, location, json });
Actions.moveNode({ fromNode, toNode, location });
Actions.deleteTab(tabId);
Actions.selectTab(tabId);
Actions.maximizeToggle(tabsetId);

// Action dispatch
model.doAction(action);
```

### Action Types

| Action | Status | Purpose |
|--------|--------|---------|
| ADD_NODE | Ported | Add new tab to layout |
| MOVE_NODE | Ported | Move tab between locations |
| DELETE_TAB | Ported | Close a tab |
| DELETE_TABSET | Ported | Remove empty tabset |
| SELECT_TAB | Ported | Change selected tab |
| SET_ACTIVE_TABSET | Ported | Set focused tabset |
| MAXIMIZE_TOGGLE | Partial | Toggle maximize state |
| RENAME_TAB | Partial | Rename a tab |
| ADJUST_WEIGHTS | Stub | Adjust splitter weights |
| ADJUST_BORDER_SPLIT | Stub | Adjust border size |
| UPDATE_MODEL_ATTRIBUTES | Stub | Update global settings |
| UPDATE_NODE_ATTRIBUTES | Stub | Update node attributes |
| POPOUT_TAB | Stub | Popout to window |
| POPOUT_TABSET | Stub | Popout tabset to window |
| CLOSE_WINDOW | Stub | Close popout window |
| CREATE_WINDOW | Stub | Create popout window |

## View Architecture

```
Layout (main component)
├── onDragStart/Over/Drop/End handlers
├── Model rendering context
└── Children:
    ├── RowRenderer
    │   ├── Splitter
    │   └── TabSetRenderer / nested RowRenderer
    └── BorderRenderer
        └── BorderTabSet

TabSetRenderer
├── Tab bar (header)
│   ├── TabButtons
│   └── Overflow handling
└── Content area
    └── Selected Tab content
```

## ILayoutProps Interface (Legacy)

```typescript
interface ILayoutProps {
  // Required
  model: Model;
  factory: (node: TabNode) => React.ReactNode;

  // Optional callbacks
  onAction?: (action: Action) => Action | undefined;
  onRenderTab?: (node: TabNode, renderValues: ITabRenderValues) => void;
  onRenderTabSet?: (node: TabSetNode | BorderNode, renderValues: ITabSetRenderValues) => void;
  onRenderDragRect?: (content: ReactNode, node?: Node, json?: IJsonTabNode) => ReactNode;
  onContextMenu?: (node: Node, event: React.MouseEvent) => void;
  onAuxMouseClick?: (node: Node, event: React.MouseEvent) => void;
  onExternalDrag?: (event: React.DragEvent) => ExternalDragResult | undefined;
  onModelChange?: (model: Model, action: Action) => void;
  onTabSetPlaceHolder?: (node: TabSetNode) => ReactNode;

  // Optional configuration
  classNameMapper?: (className: string) => string;
  iconFactory?: (node: TabNode) => ReactNode | undefined;
  titleFactory?: (node: TabNode) => ITitleObject | ReactNode | undefined;
  closeIcon?: ReactNode;
  icons?: IIcons;
  supportsPopout?: boolean;
  popoutClassName?: string;
  font?: {family: string; size: string; style: string; weight: string};
  realtimeResize?: boolean;
}
```

## Theming

### Legacy Theme Files

| Theme | File |
|-------|------|
| Light | `style/light.css` |
| Dark | `style/dark.css` |
| Gray | `style/gray.css` |
| Underline | `style/underline.css` |
| Rounded | `style/rounded.css` |
| Combined | `style/combined.scss` (all themes) |

### CSS Class Constants

Key classes defined in `src/Types.ts`:
- `flexlayout__layout` - Root container
- `flexlayout__tabset` - Tab container
- `flexlayout__tab` - Tab content area
- `flexlayout__tab_button` - Tab header button
- `flexlayout__tab_button--selected` - Selected tab
- `flexlayout__splitter` - Resize splitter
- `flexlayout__border_*` - Border region classes
- `flexlayout__outline_rect` - Drop indicator
- `flexlayout__drag_rect` - Dragged tab ghost

## Demo Component Types

The legacy demo factory supports:

| Type | Component | Description |
|------|-----------|-------------|
| `grid` | Inline table | Fake data grid |
| `json` | `JsonView.tsx` | Layout structure viewer |
| `chart` | `chart.tsx` | Chart.js integration |
| `map` | `openlayer.tsx` | OpenLayers map |
| `aggrid` | `aggrid.tsx` | AG Grid |
| `muigrid` | `MUIDataGrid.tsx` | MUI Data Grid |
| `mui` | `MUIComponent.tsx` | MUI showcase |
| `multitype` | Inline | URL/HTML/text switcher |
| `simpleform` | `SimpleForm.tsx` | Basic form |
| `newfeatures` | `NewFeatures.tsx` | Feature demo |
| `sub` | Nested Layout | Recursive layouts |
| `text` | Inline HTML | Raw HTML content |
| `testing` | Inline div | Test placeholder |

## Verification Commands

```bash
# Type check
bun run check --filter @beep/ui

# Build
bun run build --filter @beep/ui

# Test
bun run test --filter @beep/ui

# Lint fix
bun run lint:fix --filter @beep/ui

# Demo specific check
bun run check --filter @beep/todox
```

## Previous Spec Work

Refer to these specs for context on completed work:
- `specs/docking-system/` - Drop target detection (P0-P3 complete)
- `specs/flex-layout-port/` - Port progress and code quality

---

*Last Updated: 2026-01-10*
