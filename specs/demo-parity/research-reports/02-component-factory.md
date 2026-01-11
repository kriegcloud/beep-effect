# Component Factory Analysis

## Factory Function Overview

**Location:** `tmp/FlexLayout/demo/App.tsx` (lines 270-353)

**Pattern:** Sequential `if-else if` chain with component type matching

The factory function is a React component renderer that receives a `TabNode` and returns a React component based on the node's `component` property. It's passed to the `Layout` component as the `factory` prop.

```typescript
const factory = (node: TabNode) => {
    const component = node.getComponent();

    if (component === "json") {
        return (<JsonView model={latestModel.current!} />);
    }
    else if (component === "simpleform") {
        return <SimpleForm />
    }
    // ... more conditions
}
```

## Component Type Inventory

### Type: "json"
- **Implementation:** External component module
- **Source:** `JsonView.tsx`
- **Dependencies:** `Model` (from FlexLayout), Prism.js for syntax highlighting
- **Tab Props Used:** None directly; receives parent model via closure
- **Lifecycle:** Uses `addChangeListener` on mount, debounced updates
- **Notes:** Displays the layout configuration as highlighted JSON

### Type: "simpleform"
- **Implementation:** External component module
- **Source:** `SimpleForm.tsx`
- **Dependencies:** React hooks only
- **Tab Props Used:** None
- **Lifecycle:** Manages local form state, interval timer for counter
- **Notes:** Demonstrates state persistence when tab is popped out/in

### Type: "mui"
- **Implementation:** External component module
- **Source:** `MUIComponent.tsx`
- **Dependencies:** Material-UI (Slider, FormControlLabel, Switch)
- **Notes:** Demonstrates MUI styled components with theme variants

### Type: "muigrid"
- **Implementation:** External component module
- **Source:** `MUIDataGrid.tsx`
- **Dependencies:** `@mui/x-data-grid`
- **Notes:** MUI Data Grid with editable cells

### Type: "aggrid"
- **Implementation:** External component module
- **Source:** `aggrid.tsx`
- **Dependencies:** `ag-grid-react`, `ag-grid-community`
- **Notes:** Uses ClientSideRowModelModule

### Type: "chart"
- **Implementation:** External component module
- **Source:** `chart.tsx`
- **Dependencies:** `react-chartjs-2`, `chart.js`
- **Lifecycle:** Uses ref to measure container dimensions
- **Notes:** Bar chart with responsive sizing

### Type: "map"
- **Implementation:** External component module
- **Source:** `openlayter.tsx`
- **Dependencies:** OpenLayers (`ol` library)
- **Lifecycle:** Creates Map instance in useEffect, updateSize on render
- **Notes:** OpenLayers tile map

### Type: "grid"
- **Implementation:** Inline (SimpleTable sub-component)
- **Source:** `App.tsx` lines 608-627
- **Tab Props Used:** `node.getExtraData().data`, `node.getId()`
- **Lifecycle:** Lazy initializes data on first access
- **Notes:** HTML table with draggable rows

### Type: "sub"
- **Implementation:** Recursive/Nested Layout
- **Source:** `App.tsx` lines 307-321
- **Tab Props Used:** `node.getExtraData().model`, `node.getConfig().model`
- **Lifecycle:** Lazy initializes nested Model from config
- **Notes:** Allows nested layouts; recursive factory pattern

### Type: "text"
- **Implementation:** Inline
- **Source:** `App.tsx` lines 322-328
- **Tab Props Used:** `node.getConfig().text`
- **Rendering:** Uses `dangerouslySetInnerHTML`

### Type: "newfeatures"
- **Implementation:** External component module
- **Source:** `NewFeatures.tsx`
- **Notes:** Informational component listing FlexLayout features

### Type: "multitype"
- **Implementation:** Inline - polymorphic renderer
- **Source:** `App.tsx` lines 332-347
- **Config Types:** `"url"` (iframe), `"html"` (dangerouslySetInnerHTML), `"text"` (textarea)
- **Data Source:** Via drag-and-drop (onExternalDrag callback)

### Type: "testing"
- **Implementation:** Inline - trivial
- **Source:** `App.tsx` line 349
- **Notes:** Used for Playwright testing scenarios

## Layout JSON Schema

### Root Structure
```json
{
  "global": { /* Global settings */ },
  "borders": [ /* Border tab sets */ ],
  "layout": { /* Main layout tree */ },
  "popouts": { /* Popout window states */ }
}
```

### TabNode Schema
```json
{
  "type": "tab",
  "id": "string (UUID format)",
  "name": "string",
  "component": "string (e.g., 'grid', 'json', 'chart')",
  "icon": "string? (path to SVG/image)",
  "enableClose": "boolean?",
  "enablePopout": "boolean?",
  "config": "object? (component-specific configuration)"
}
```

### TabSetNode Schema
```json
{
  "type": "tabset",
  "id": "string (UUID format)",
  "weight": "number (percentage distribution)",
  "selected": "number? (index of active tab)",
  "active": "boolean?",
  "children": [ /* Array of TabNodes */ ]
}
```

### RowNode Schema
```json
{
  "type": "row",
  "id": "string (UUID format)",
  "weight": "number?",
  "children": [ /* Array of RowNode, TabSetNode, or ColumnNode */ ]
}
```

### BorderNode Schema
```json
{
  "type": "border",
  "location": "string ('top'|'bottom'|'left'|'right')",
  "children": [ /* Array of TabNodes */ ]
}
```

### Global Settings Schema
```json
{
  "splitterSize": "number? (pixel width/height)",
  "splitterExtra": "number? (extended hit test area)",
  "tabEnablePopout": "boolean?",
  "tabSetEnableClose": "boolean?",
  "tabSetMinWidth": "number?",
  "tabSetMinHeight": "number?",
  "borderMinSize": "number?"
}
```

## Data Flow Diagram

```
User Action (browser)
    ↓
Model.doAction(Actions.updateNodeAttributes(...))
    ↓
Model updates internal state
    ↓
Layout re-renders (receives updated model)
    ↓
Layout.factory(node) called for each TabNode
    ↓
Factory determines node.getComponent()
    ↓
Factory accesses node.getConfig() and node.getExtraData()
    ↓
Component renders with data/config
```

## External Library Integrations

| Library | Component Type | Integration Approach |
|---------|----------------|----------------------|
| chart.js / react-chartjs-2 | "chart" | Direct component rendering |
| ag-grid-react | "aggrid" | Module registration required |
| @mui/x-data-grid | "muigrid" | Column/row configuration |
| @mui/material | "mui" | Styled components |
| OpenLayers (ol) | "map" | Imperative initialization |
| prismjs | "json" | Syntax highlighting |

## Key Observations

### Event Listener Pattern
Components can register listeners on TabNode:
```typescript
node.setEventListener("save", (p: any) => { /* handle save */ });
node.setEventListener("close", (p: any) => { /* handle close */ });
node.setEventListener("visibility", (p: any) => { /* handle visibility */ });
node.setEventListener("resize", (p: any) => { /* handle resize */ });
```

### Extra Data Storage
Persistent component state stored via:
```typescript
node.getExtraData().data  // For grid data
node.getExtraData().model // For nested model
```

### Config Pattern
Component-specific configuration passed via:
```typescript
node.getConfig()  // Returns entire config object
node.getConfig().type    // For multitype component
node.getConfig().text    // For text component
node.getConfig().model   // For sub component
```

---

*Generated: 2026-01-10*
