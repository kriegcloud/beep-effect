# FlexLayout Schema Creation: Agent Prompts

> Ready-to-use prompts for creating schema classes alongside existing FlexLayout classes.

---

## Critical Rule

**DO NOT MODIFY ORIGINAL CLASSES.** You are creating NEW schema classes (`IClassName`) alongside the existing classes. The originals stay exactly as they are.

---

## Phase 1: Foundation

### Task 1.1: Create IActions Schema Class

```
Create an IActions schema class alongside the existing Actions class in packages/ui/ui/src/flexlayout-react/model/Actions.ts

Context:
- Read the existing Actions class (extends Data.Class) - DO NOT MODIFY IT
- Read reference patterns in Attribute.ts (IAttribute) and DockLocation.ts (IDockLocation)
- This class has only static action type constants and static factory methods

Requirements:
1. Add schema imports ($UiId, BS from @beep/schema, S from effect/Schema) at top of file
2. Create $I identifier: $UiId.create("flexlayout-react/Actions")
3. Create ActionsData schema struct for any data (may be empty if all static)
4. Create IActions schema class BELOW the existing Actions class
5. Add all static constants (ADD_NODE, MOVE_NODE, etc.) to IActions
6. Add all static factory methods (addNode, moveNode, etc.) to IActions
7. DO NOT modify the original Actions class in any way

Pattern to follow:
- Static methods return Action.new() - check if Action needs a schema version first
- If Action class needs a schema version, do that as a prerequisite

Verify: turbo run check --filter=@beep/ui
```

### Task 1.2: Create INode Schema Class (Abstract Base)

```
Create an INode schema class alongside the existing Node class in packages/ui/ui/src/flexlayout-react/model/Node.ts

Context:
- Read the existing Node class (abstract, extends Data.Class) - DO NOT MODIFY IT
- Read reference patterns in Attribute.ts (IAttribute) for the data property pattern
- This is an ABSTRACT class with abstract methods

Challenge: Effect Schema classes cannot be abstract.

Approach:
1. Create INodeData schema struct with all instance fields:
   - model: keep as runtime field (not in schema)
   - attributes: S.mutable(S.Record({ key: S.String, value: S.Unknown }))
   - parent: keep as runtime field (circular ref)
   - children: keep as runtime field (Node[])
   - rect: Rect (check if Rect has schema version)
   - path: S.String
   - listeners: keep as runtime field (functions)

2. Create INode schema class BELOW the existing Node class with:
   - data: INodeData
   - Private runtime fields for model, parent, children, listeners
   - All concrete methods added
   - Abstract methods as method stubs that throw: `readonly toJson = (): never => { throw new Error("Abstract method"); }`

3. Alternatively, use a type union approach where INode is a union of all concrete node types

4. DO NOT modify the original Node class in any way

Decision needed: Choose approach (abstract stubs vs union type) and proceed.

Verify: turbo run check --filter=@beep/ui
```

---

## Phase 2: Support Classes

### Task 2.1: Create ILayoutWindow Schema Class

```
Create an ILayoutWindow schema class alongside the existing LayoutWindow class in packages/ui/ui/src/flexlayout-react/model/LayoutWindow.ts

Context:
- Read existing LayoutWindow class (extends Data.Class) - DO NOT MODIFY IT
- Uses Rect, RowNode, TabSetNode references
- Has Window DOM reference (cannot be in schema)

Requirements:
1. Create ILayoutWindowData schema struct:
   - windowId: S.String
   - rect: Use Rect or create schema version

2. Keep as private runtime fields:
   - _layout: LayoutInternal
   - _window: Window
   - _root: RowNode
   - _maximizedTabSet: TabSetNode
   - _activeTabSet: TabSetNode
   - _toScreenRectFunction: callback

3. Create ILayoutWindow schema class BELOW the existing LayoutWindow class
4. Add all methods using this.data.fieldName pattern
5. Add static fromJson factory
6. DO NOT modify the original LayoutWindow class

Verify: turbo run check --filter=@beep/ui
```

### Task 2.2: Create IBorderSet Schema Class

```
Create an IBorderSet schema class alongside the existing BorderSet class in packages/ui/ui/src/flexlayout-react/model/BorderSet.ts

Context:
- Read existing BorderSet class (extends Data.Class) - DO NOT MODIFY IT
- Contains array of BorderNode
- Contains Map<DockLocation, BorderNode>

Requirements:
1. Create IBorderSetData schema struct:
   - borders: S.mutable(S.Array(...)) - need BorderNode schema first
   - layoutHorizontal: S.Boolean

2. Keep as private runtime fields:
   - borderMap: Map<DockLocation, BorderNode> (complex key type)

3. Create IBorderSet schema class BELOW the existing BorderSet class
4. Add all methods
5. Add static fromJson factory
6. DO NOT modify the original BorderSet class

Dependency: May need to create IBorderNode first or use forward reference.

Verify: turbo run check --filter=@beep/ui
```

---

## Phase 3: Node Subclasses

### Task 3.1: Create IBorderNode Schema Class

```
Create an IBorderNode schema class alongside the existing BorderNode class in packages/ui/ui/src/flexlayout-react/model/BorderNode.ts

Context:
- Read existing BorderNode class - DO NOT MODIFY IT
- Extends Node (needs INode pattern established)
- Has location (DockLocation), size, selected fields

Requirements:
1. Create IBorderNodeData extending/composing INodeData pattern
2. Create IBorderNode schema class BELOW the existing BorderNode class
3. Implement abstract methods from Node
4. Add static fromJson, getAttributeDefinitions
5. Add all instance methods
6. DO NOT modify the original BorderNode class

Pattern consideration:
- If using union approach for INode, IBorderNode is one variant
- If using abstract stubs, IBorderNode extends behavior

Verify: turbo run check --filter=@beep/ui
```

### Task 3.2: Create IRowNode Schema Class

```
Create an IRowNode schema class alongside the existing RowNode class in packages/ui/ui/src/flexlayout-react/model/RowNode.ts

Context:
- Read existing RowNode class - DO NOT MODIFY IT
- Extends Node
- Has weight, width, height fields
- Contains TabSetNode and other RowNode children

Requirements:
1. Create IRowNodeData extending/composing INodeData pattern
2. Create IRowNode schema class BELOW the existing RowNode class
3. Implement abstract methods from Node
4. Add static fromJson, getAttributeDefinitions
5. Add all instance methods including tidy(), layout(), etc.
6. DO NOT modify the original RowNode class

Verify: turbo run check --filter=@beep/ui
```

### Task 3.3: Create ITabSetNode Schema Class

```
Create an ITabSetNode schema class alongside the existing TabSetNode class in packages/ui/ui/src/flexlayout-react/model/TabSetNode.ts

Context:
- Read existing TabSetNode class - DO NOT MODIFY IT
- Extends Node
- Has selected, maximized, active state
- Contains TabNode children

Requirements:
1. Create ITabSetNodeData extending/composing INodeData pattern
2. Create ITabSetNode schema class BELOW the existing TabSetNode class
3. Implement abstract methods from Node
4. Add static fromJson, getAttributeDefinitions
5. Add all instance methods including drop(), canDrop(), etc.
6. DO NOT modify the original TabSetNode class

Verify: turbo run check --filter=@beep/ui
```

### Task 3.4: Create ITabNode Schema Class

```
Create an ITabNode schema class alongside the existing TabNode class in packages/ui/ui/src/flexlayout-react/model/TabNode.ts

Context:
- Read existing TabNode class - DO NOT MODIFY IT
- Extends Node
- Has name, component, config fields
- Leaf node (no children)

Requirements:
1. Create ITabNodeData extending/composing INodeData pattern
2. Create ITabNode schema class BELOW the existing TabNode class
3. Implement abstract methods from Node
4. Add static fromJson, getAttributeDefinitions
5. Add all instance methods including delete(), setName(), etc.
6. DO NOT modify the original TabNode class

Verify: turbo run check --filter=@beep/ui
```

---

## Phase 4: Orchestrator

### Task 4.1: Create IModel Schema Class

```
Create an IModel schema class alongside the existing Model class in packages/ui/ui/src/flexlayout-react/model/Model.ts

Context:
- Read existing Model class - DO NOT MODIFY IT
- Central orchestrator for all FlexLayout state
- Has windows map, borders, callbacks, idMap

Requirements:
1. Create IModelData schema struct for serializable state:
   - attributes: S.mutable(S.Record({ key: S.String, value: S.Unknown }))

2. Keep as private runtime fields:
   - idMap: Map<string, Node>
   - changeListeners: callback array
   - borders: BorderSet
   - onAllowDrop: callback
   - onCreateTabSet: callback
   - windows: Map<string, LayoutWindow>
   - rootWindow: LayoutWindow

3. Create IModel schema class BELOW the existing Model class
4. Add static MAIN_WINDOW_ID constant
5. Add static attributeDefinitions (use IAttributeDefinitions)
6. Add static fromJson factory
7. Add all instance methods:
   - doAction (large switch statement)
   - getters (getActiveTabset, getMaximizedTabset, getRoot, etc.)
   - setters (setOnAllowDrop, setOnCreateTabSet, etc.)
   - visitors (visitNodes, visitWindowNodes)
   - serialization (toJson, toString, toJSON)
   - internal methods (updateIdMap, addNode, tidy, etc.)

8. DO NOT modify the original Model class

This is the largest schema class. Take it method by method.

Verify: turbo run check --filter=@beep/ui
```

---

## Verification Prompt

```
After creating a schema class, verify the changes:

1. Run type check:
   turbo run check --filter=@beep/ui

2. If errors, fix them following Effect patterns:
   - Use A.map not array.map
   - Use Str.split not string.split
   - Use Order for sorting
   - Use O.Option for optional returns

3. Confirm original class is UNCHANGED (no modifications, no @internal markers)

4. Update REFLECTION_LOG.md with:
   - What worked
   - What didn't work
   - Pattern refinements discovered
```

---

## Research Prompts

### Understand Existing Patterns

```
Research the existing schema patterns in flexlayout-react:

1. Read these files that already have schema classes:
   - packages/ui/ui/src/flexlayout-react/Attribute.ts
   - packages/ui/ui/src/flexlayout-react/AttributeDefinitions.ts
   - packages/ui/ui/src/flexlayout-react/DockLocation.ts
   - packages/ui/ui/src/flexlayout-react/Orientation.ts
   - packages/ui/ui/src/flexlayout-react/Rect.ts

2. Extract patterns for:
   - Schema struct definition
   - Schema class definition
   - Static factory methods
   - Instance method patterns
   - Handling of Option types
   - Handling of Map/HashMap

3. Document findings in outputs/pattern-analysis.md
```

### Effect Schema Documentation

```
Use mcp-researcher to look up Effect Schema patterns:

1. Search for S.Class usage patterns
2. Search for S.mutable patterns
3. Search for S.Map vs HashMap usage
4. Search for handling circular references in schemas

Document findings for reference during schema creation.
```
