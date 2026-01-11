# Code Quality: Native Collection Violations

**Generated**: 2026-01-10T14:30:00Z
**Files Analyzed**: 45
**Violations Found**: 24

## Summary
- **Critical Violations**: 8 (native `new Map()` instantiations)
- **High Priority Violations**: 12 (native `.set()`, `.get()`, `.has()` on Map instances)
- **Medium Priority Violations**: 4 (native `new Set()` and Set operations)

## Methodology

Searched the FlexLayout port (`packages/ui/ui/src/flex-layout/`) for:
1. Native `Map` usage: `new Map`, `Map<`, `.set(`, `.get(`, `.has(`
2. Native `Set` usage: `new Set`, `Set<`, `.add(`

Excluded from violations:
- Effect `HashMap.set()`, `HashMap.get()` - these are correct Effect patterns
- Effect `R.get()` - Record module operations
- Effect `A.get()` - Array module operations
- Struct.get() - Effect Struct operations

## Violation Checklist

### Critical Violations

#### File: `view/layout.tsx`

- [ ] **Line 684**: `private moveableElementMap: Map<string, HTMLElement>;`
  - **Violation**: Class property typed with native Map
  - **Fix**: Use `HashMap.HashMap<string, HTMLElement>` from `effect/HashMap`

- [ ] **Line 709**: `this.moveableElementMap = new Map();`
  - **Violation**: Instantiating native Map
  - **Fix**: Use `HashMap.empty<string, HTMLElement>()`

- [ ] **Line 977**: `const borderSetComponents = new Map<DockLocation, React.ReactNode>();`
  - **Violation**: Local variable using native Map
  - **Fix**: Use `HashMap.empty<DockLocation, React.ReactNode>()`

- [ ] **Line 978**: `const borderSetContentComponents = new Map<DockLocation, React.ReactNode>();`
  - **Violation**: Local variable using native Map
  - **Fix**: Use `HashMap.empty<DockLocation, React.ReactNode>()`

- [ ] **Line 1175**: `const tabMoveables = new Map<string, React.ReactNode>();`
  - **Violation**: Local variable using native Map
  - **Fix**: Use `HashMap.empty<string, React.ReactNode>()`

- [ ] **Line 1233**: `const tabs = new Map<string, React.ReactNode>();`
  - **Violation**: Local variable using native Map
  - **Fix**: Use `HashMap.empty<string, React.ReactNode>()`

- [ ] **Line 1303**: `const tabs = new Map<string, TabNode>();`
  - **Violation**: Local variable using native Map
  - **Fix**: Use `HashMap.empty<string, TabNode>()`

#### File: `view/popout-window.tsx`

- [ ] **Line 80, 117, 140**: `styleMap: Map<HTMLElement, HTMLElement>`
  - **Violation**: Function parameter typed with native Map
  - **Fix**: Use `HashMap.HashMap<HTMLElement, HTMLElement>`

- [ ] **Line 210**: `const styleMapRef = React.useRef(new Map<HTMLElement, HTMLElement>());`
  - **Violation**: React ref containing native Map
  - **Fix**: Use `React.useRef(HashMap.empty<HTMLElement, HTMLElement>())`

#### File: `dock-location.ts`

- [ ] **Line 17**: `static readonly values = new Map<string, DockLocation>();`
  - **Violation**: Static property using native Map
  - **Fix**: Use `HashMap.empty<string, DockLocation>()`

#### File: `model/model.ts`

- [ ] **Line 75**: `type NodeIdMap = Map<string, LayoutNode>;`
  - **Violation**: Type alias using native Map
  - **Fix**: Use `HashMap.HashMap<string, LayoutNode>`

- [ ] **Line 80**: `type ParentMap = Map<string, string>;`
  - **Violation**: Type alias using native Map
  - **Fix**: Use `HashMap.HashMap<string, string>`

- [ ] **Line 521**: `const nodeIdMap: NodeIdMap = new Map();`
  - **Violation**: Instantiating native Map
  - **Fix**: Use `HashMap.empty<string, LayoutNode>()`

- [ ] **Line 522**: `const parentMap: ParentMap = new Map();`
  - **Violation**: Instantiating native Map
  - **Fix**: Use `HashMap.empty<string, string>()`

### High Priority Violations (Native Map Operations)

#### File: `view/layout.tsx`

- [ ] **Line 727, 823**: `.get()` on native Map (windowsMap)
  - **Context**: `windowsMap.get(this.windowId)`
  - **Fix**: Use `HashMap.get(windowsMap, this.windowId)`

- [ ] **Line 981**: `.get()` on native Map (borders)
  - **Context**: `borders.get(location)`
  - **Fix**: Use `HashMap.get(borders, location)`

- [ ] **Lines 990, 998**: `.set()` on native Map
  - **Context**: `borderSetComponents.set(location, ...)`
  - **Fix**: Use `HashMap.set(map, key, value)` with immutable update

- [ ] **Lines 1011-1053**: Multiple `.get()` calls on borderSetComponents/borderSetContentComponents
  - **Fix**: Use `HashMap.get()` with proper Option handling

- [ ] **Lines 1193, 1246, 1309**: `.set()` on native Map (tabs/tabMoveables)
  - **Fix**: Use `HashMap.set()` with immutable update

- [ ] **Line 1462, 1467**: `.get()` and `.set()` on moveableElementMap
  - **Fix**: Use `HashMap.get()` and `HashMap.set()`

- [ ] **Line 1279, 1299**: `.get()` on components Map
  - **Fix**: Use `HashMap.get()` with Option handling

#### File: `view/popout-window.tsx`

- [ ] **Lines 86, 99**: `styleMap.set(element, ...)`
  - **Fix**: Use `HashMap.set(styleMap, element, ...)`

- [ ] **Line 155**: `styleMap.get(removal)`
  - **Fix**: Use `HashMap.get(styleMap, removal)`

- [ ] **Line 158**: `styleMap.delete(removal)`
  - **Fix**: Use `HashMap.remove(styleMap, removal)`

- [ ] **Line 308**: `windowsMap.has(layoutWindow.windowId)`
  - **Fix**: Use `HashMap.has(windowsMap, layoutWindow.windowId)`

#### File: `model/model.ts`

- [ ] **Lines 535, 561, 563, 574, 576, 584, 586**: Multiple `.set()` calls on nodeIdMap/parentMap
  - **Fix**: Use `HashMap.set()` with immutable updates

- [ ] **Lines 625, 638, 642**: `.get()` on nodeIdMap/parentMap
  - **Fix**: Use `HashMap.get()` with proper Option handling

### Medium Priority Violations (Native Set)

#### File: `view/layout.tsx`

- [ ] **Line 1275**: `const nextIdsSet = new Set<string>();`
  - **Violation**: Instantiating native Set
  - **Fix**: Use `HashSet.empty<string>()` from `effect/HashSet`

- [ ] **Line 1281**: `nextIdsSet.add(id);`
  - **Violation**: Using native Set.add()
  - **Fix**: Use `HashSet.add(set, id)` with immutable update

- [ ] **Line 1293**: `nextIdsSet.has(id)`
  - **Violation**: Using native Set.has()
  - **Fix**: Use `HashSet.has(set, id)`

- [ ] **Line 1314**: `tabs.has(nodeId)`
  - **Violation**: Using native Map.has()
  - **Fix**: Use `HashMap.has(tabs, nodeId)`

## Statistics by File

| File | Critical | High | Medium | Total |
|------|----------|------|--------|-------|
| `view/layout.tsx` | 5 | 7 | 3 | 15 |
| `view/popout-window.tsx` | 1 | 4 | 0 | 5 |
| `dock-location.ts` | 1 | 0 | 0 | 1 |
| `model/model.ts` | 2 | 2 | 0 | 4 |
| **Total** | **9** | **13** | **3** | **25** |

## Correctly Using Effect Collections

The following files correctly use Effect HashMap (no violations):

- `attribute-definitions.ts` - Uses `HashMap.set()`, `HashMap.get()` from `effect/HashMap`

Example of correct usage from `attribute-definitions.ts`:
```typescript
import * as HashMap from "effect/HashMap";

// Correct: Using Effect HashMap
nameToAttribute: HashMap.set(this.nameToAttribute, name, attr),
HashMap.get(this.nameToAttribute, name),
```

## Recommendations

### Priority 1: Type Definitions
Update the type aliases in `model/model.ts` to use Effect HashMap:
```typescript
import * as HashMap from "effect/HashMap";

type NodeIdMap = HashMap.HashMap<string, LayoutNode>;
type ParentMap = HashMap.HashMap<string, string>;
```

### Priority 2: View Layer Maps
The Maps in `view/layout.tsx` are used for React component rendering. Consider:
1. Using Effect HashMap with conversion to Array for rendering
2. Alternatively, document exception for React-specific code if HashMap performance is problematic

### Priority 3: DockLocation Registry
The static `values` Map in `dock-location.ts` is a registry pattern. Convert to Effect HashMap:
```typescript
static readonly values = HashMap.empty<string, DockLocation>();
```

### Priority 4: Style Management in Popout
The `styleMap` in `popout-window.tsx` tracks DOM elements. Consider:
1. Using Effect HashMap with WeakRef keys if possible
2. Or document as DOM-interop exception

## Migration Notes

When migrating to Effect HashMap:
1. HashMap is immutable - `.set()` returns a new HashMap
2. Use `HashMap.get()` which returns `Option<V>` instead of `V | undefined`
3. Use `HashMap.has()` which returns `boolean`
4. For iteration, use `HashMap.forEach()` or convert with `HashMap.toEntries()`

### Example Migration Pattern

Before (native Map):
```typescript
const map = new Map<string, Node>();
map.set(id, node);
const result = map.get(id);
if (map.has(id)) { ... }
```

After (Effect HashMap):
```typescript
import * as HashMap from "effect/HashMap";
import * as O from "effect/Option";

let map = HashMap.empty<string, Node>();
map = HashMap.set(map, id, node);
const result = HashMap.get(map, id); // Returns Option<Node>
if (HashMap.has(map, id)) { ... }

// When you need the value:
O.match(result, {
  onNone: () => { /* handle missing */ },
  onSome: (node) => { /* use node */ }
});
```
