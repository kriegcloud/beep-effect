# View Layer & Styling Analysis

## ILayoutProps Interface

### Required Props

| Prop | Type | Description |
|------|------|-------------|
| model | Model | The data model representing the layout structure |
| factory | `(node: TabNode) => React.ReactNode` | Factory function to create tab content |

### Optional Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| onAction | `(action: Action) => Action \| undefined` | - | Intercepts layout actions |
| onRenderTab | `(node, renderValues) => void` | - | Customizes tab rendering |
| onRenderTabSet | `(node, renderValues) => void` | - | Customizes tabset header |
| onModelChange | `(model, action) => void` | - | Change notification |
| onExternalDrag | `(event) => {json, onDrop?} \| undefined` | - | External drag handling |
| classNameMapper | `(className) => string` | - | CSS module support |
| i18nMapper | `(id, param?) => string` | - | i18n integration |
| onRenderDragRect | DragRectRenderCallback | - | Custom drag preview |
| onContextMenu | NodeMouseEvent | - | Right-click handler |
| onAuxMouseClick | NodeMouseEvent | - | Middle-click handler |
| onShowOverflowMenu | ShowOverflowMenuCallback | - | Custom overflow menu |
| onTabSetPlaceHolder | TabSetPlaceHolderCallback | - | Empty tabset content |
| popoutClassName | string | - | CSS class for popouts |
| popoutURL | string | "popout.html" | Popout window URL |
| popoutWindowName | string | - | Name for popout windows |
| supportsPopout | boolean | true | Enable/disable popouts |
| realtimeResize | boolean | false | Resize during splitter drag |
| icons | IIcons | - | Custom icons |

## Callback Props Detail

### onRenderTab
```typescript
(node: TabNode, renderValues: ITabRenderValues) => void

interface ITabRenderValues {
  leading?: React.ReactNode;      // Left icon/element
  content?: React.ReactNode;       // Tab name/label content
  buttons?: React.ReactNode[];     // Trailing buttons
  name?: string;                   // Used in overflow menu
}
```

**When Called:** Every render cycle for each visible tab button

**Example from Demo:**
```typescript
const onRenderTab = (node: TabNode, renderValues: ITabRenderValues) => {
  if (node.getId() === "onRenderTab1") {
    renderValues.leading = <img src="images/settings.svg" />;
    renderValues.content = "onRenderTab1";
    renderValues.buttons.push(<img src="images/folder.svg" />);
  }
};
```

### onRenderTabSet
```typescript
(tabSetNode: TabSetNode | BorderNode, renderValues: ITabSetRenderValues) => void

interface ITabSetRenderValues {
  leading?: React.ReactNode;       // Left side of header
  stickyButtons?: React.ReactNode[]; // Buttons that stay visible
  buttons?: React.ReactNode[];     // Main toolbar buttons
  overflowPosition?: number;       // Position for overflow button
}
```

**When Called:** When rendering tabset header

### onExternalDrag
```typescript
(event: React.DragEvent) => undefined | {
  json: any;           // Tab configuration to create
  onDrop?: (node?: Node, event?: DragEvent) => void;
}
```

**Returns:**
- `undefined` to reject drag
- Object with `json` (tab config) to accept and create tab

### onShowOverflowMenu
```typescript
(tabSetNode: TabSetNode, event: MouseEvent, items: {index, node}[], onSelect: (item) => void) => void
```

**Called When:** Tabs overflow and overflow button is clicked

## Theme System

### Implementation: CSS Variables

The theme system uses CSS custom properties set on `.flexlayout__layout`:

**Light Theme:**
```css
--color-background: white;
--color-text: black;
--color-splitter: rgb(247.35, 247.35, 247.35);
--color-drag1: /* drag indicator color */;
--color-drag2: /* drag indicator secondary */;
```

**Dark Theme:**
```css
--color-background: black;
--color-text: #eeeeee;
--color-splitter: rgb(25.5, 25.5, 25.5);
```

### Theme Files

| Theme | File | Key Characteristics |
|-------|------|---------------------|
| Light | light.css | Clean, bright appearance |
| Dark | dark.css | Inverted colors for dark mode |
| Underline | underline.css | Tab underline indicator |
| Gray | gray.css | Higher contrast |
| Rounded | rounded.css | Softer borders |

### Switching Mechanism

Runtime class switching on document root:
```typescript
const onThemeChange = (theme: string) => {
  const themeClass = "flexlayout__theme_" + theme;
  document.documentElement.className = themeClass;
};
```

### CSS Class Constants (from Types.ts)

```typescript
FLEXLAYOUT__LAYOUT              // Root container
FLEXLAYOUT__TABSET              // Tabset container
FLEXLAYOUT__TABSET_HEADER       // Header with buttons
FLEXLAYOUT__TAB_BUTTON          // Individual tab button
FLEXLAYOUT__TAB_BUTTON__SELECTED  // Selected state
FLEXLAYOUT__SPLITTER            // Splitter divider
FLEXLAYOUT__POPUP_MENU          // Overflow menu container
FLEXLAYOUT__POPUP_MENU_ITEM     // Menu item
```

## Tab Overflow Mechanism

### Detection Process

In `TabOverflowHook.tsx`:

1. **Measure Phase:** Calculate visible space vs content size
2. **Detect Overflow:** If tabs exceed available width, mark as hidden
3. **Throttle Updates:** Debounced to 100ms

### UI Mechanisms

**Scroll Buttons/Mini Scrollbar:**
- Horizontal scrollbar at bottom of tab strip
- Drag thumb to scroll through tabs

**Overflow Menu:**
- Overflow button appears when tabs hidden
- Shows all hidden tabs in popup menu
- Customizable via `onShowOverflowMenu`

**Auto-scroll to Selected Tab:**
- Selected tab automatically scrolls into view
- Respects user-controlled scroll position

### Hidden Tab Access
```typescript
const onOverflowClick = (event) => {
  const items = hiddenTabs.map(h => ({
    index: h,
    node: node.getChildren()[h]
  }));
  // Show popup with items
};

const onOverflowItemSelect = (item) => {
  layout.doAction(Actions.selectTab(item.node.getId()));
};
```

## Port Comparison

### Props Parity - Legacy vs Port

| Prop | Legacy | Port | Status |
|------|--------|------|--------|
| model | Yes | Yes | Parity |
| factory | Yes | Yes | Parity |
| onAction | Yes | Yes | Parity |
| onRenderTab | Yes | Yes | Parity |
| onRenderTabSet | Yes | Yes | Parity |
| onModelChange | Yes | Yes | Parity |
| onExternalDrag | Yes | Yes | Parity |
| classNameMapper | Yes | Yes | Parity |
| i18nMapper | Yes | Yes | Parity |
| onRenderDragRect | Yes | Yes | Parity |
| onContextMenu | Yes | Yes | Parity |
| onAuxMouseClick | Yes | Yes | Parity |
| onShowOverflowMenu | Yes | Yes | Parity |
| onTabSetPlaceHolder | Yes | Yes | Parity |
| supportsPopout | Yes | Yes | Partial (deferred) |
| realtimeResize | Yes | Yes | Parity |
| icons | Yes | Yes | Parity |

### View Component Parity

| Component | Legacy | Port | Notes |
|-----------|--------|------|-------|
| Layout | Class | Wrapper type | Wraps LayoutInternal |
| TabSet | Functional | Functional | Equivalent |
| Tab | Functional | Functional | Uses runtime type guards |
| TabButton | Functional | Functional | Equivalent |
| Splitter | Functional | Functional | Equivalent |
| PopupMenu | Functional | Functional | Equivalent |
| BorderTab | Present | Present | Not fully analyzed |
| BorderTabSet | Present | Present | Not fully analyzed |

### Key Gaps in Port

1. **LayoutInternal Interface:** Needs consolidation
2. **Theme System:** Needs CSS variable mapping strategy
3. **CSS Classes:** CLASSES enum ported but needs styling integration
4. **Icons:** IIcons type not fully verified

### Notable Port Improvements

1. **Type Safety:** Uses runtime type guards instead of instanceof
2. **Effect Integration:** Uses `Str.concat` from effect/String
3. **Documentation:** Comprehensive JSDoc with examples
4. **Error Boundaries:** Type safety for parent node interactions
5. **Suspense/Portals:** Modern React patterns

---

*Generated: 2026-01-10*
