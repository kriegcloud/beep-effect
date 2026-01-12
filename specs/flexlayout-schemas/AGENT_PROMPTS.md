# FlexLayout Schema Migration: Agent Prompts

> Ready-to-use prompts for each migration task.

---

## Phase 1: Foundation

### Task 1.1: Migrate Actions.ts

```
Migrate packages/ui/ui/src/flexlayout-react/model/Actions.ts to use Effect Schema.

Context:
- Read the existing Actions class (extends Data.Class)
- Read reference patterns in Attribute.ts (IAttribute) and DockLocation.ts (IDockLocation)
- This class has only static action type constants and static factory methods

Requirements:
1. Add schema imports ($UiId, S from effect/Schema)
2. Create $I identifier: $UiId.create("flexlayout-react/Actions")
3. Create ActionsData schema struct for any data (may be empty if all static)
4. Create IActions schema class
5. Migrate all static constants (ADD_NODE, MOVE_NODE, etc.)
6. Migrate all static factory methods (addNode, moveNode, etc.)
7. Keep legacy Actions class for backward compatibility

Pattern to follow:
- Static methods return Action.new() - check if Action needs migration first
- If Action class needs migration, do that as a prerequisite

Verify: turbo run check --filter=@beep/ui
```

### Task 1.2: Migrate Node.ts (Abstract Base)

```
Migrate packages/ui/ui/src/flexlayout-react/model/Node.ts to use Effect Schema.

Context:
- Read the existing Node class (abstract, extends Data.Class)
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

2. Create INode schema class with:
   - data: INodeData
   - Private runtime fields for model, parent, children, listeners
   - All concrete methods migrated
   - Abstract methods as method stubs that throw: `readonly toJson = (): never => { throw new Error("Abstract method"); }`

3. Alternatively, use a type union approach where INode is a union of all concrete node types

Decision needed: Choose approach (abstract stubs vs union type) and proceed.

Verify: turbo run check --filter=@beep/ui
```

---

## Phase 2: Support Classes

### Task 2.1: Migrate LayoutWindow.ts

```
Migrate packages/ui/ui/src/flexlayout-react/model/LayoutWindow.ts to use Effect Schema.

Context:
- Read existing LayoutWindow class (extends Data.Class)
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

3. Create ILayoutWindow schema class
4. Migrate all methods using this.data.fieldName pattern
5. Migrate static fromJson factory

Verify: turbo run check --filter=@beep/ui
```

### Task 2.2: Migrate BorderSet.ts

```
Migrate packages/ui/ui/src/flexlayout-react/model/BorderSet.ts to use Effect Schema.

Context:
- Read existing BorderSet class (extends Data.Class)
- Contains array of BorderNode
- Contains Map<DockLocation, BorderNode>

Requirements:
1. Create IBorderSetData schema struct:
   - borders: S.mutable(S.Array(...)) - need BorderNode schema first
   - layoutHorizontal: S.Boolean

2. Keep as private runtime fields:
   - borderMap: Map<DockLocation, BorderNode> (complex key type)

3. Create IBorderSet schema class
4. Migrate all methods
5. Migrate static fromJson factory

Dependency: May need to migrate BorderNode first or use forward reference.

Verify: turbo run check --filter=@beep/ui
```

---

## Phase 3: Node Subclasses

### Task 3.1: Migrate BorderNode.ts

```
Migrate packages/ui/ui/src/flexlayout-react/model/BorderNode.ts to use Effect Schema.

Context:
- Read existing BorderNode class
- Extends Node (needs INode pattern established)
- Has location (DockLocation), size, selected fields

Requirements:
1. Create IBorderNodeData extending/composing INodeData pattern
2. Create IBorderNode schema class
3. Implement abstract methods from Node
4. Migrate static fromJson, getAttributeDefinitions
5. Migrate all instance methods

Pattern consideration:
- If using union approach for INode, IBorderNode is one variant
- If using abstract stubs, IBorderNode extends behavior

Verify: turbo run check --filter=@beep/ui
```

### Task 3.2: Migrate RowNode.ts

```
Migrate packages/ui/ui/src/flexlayout-react/model/RowNode.ts to use Effect Schema.

Context:
- Read existing RowNode class
- Extends Node
- Has weight, width, height fields
- Contains TabSetNode and other RowNode children

Requirements:
1. Create IRowNodeData extending/composing INodeData pattern
2. Create IRowNode schema class
3. Implement abstract methods from Node
4. Migrate static fromJson, getAttributeDefinitions
5. Migrate all instance methods including tidy(), layout(), etc.

Verify: turbo run check --filter=@beep/ui
```

### Task 3.3: Migrate TabSetNode.ts

```
Migrate packages/ui/ui/src/flexlayout-react/model/TabSetNode.ts to use Effect Schema.

Context:
- Read existing TabSetNode class
- Extends Node
- Has selected, maximized, active state
- Contains TabNode children

Requirements:
1. Create ITabSetNodeData extending/composing INodeData pattern
2. Create ITabSetNode schema class
3. Implement abstract methods from Node
4. Migrate static fromJson, getAttributeDefinitions
5. Migrate all instance methods including drop(), canDrop(), etc.

Verify: turbo run check --filter=@beep/ui
```

### Task 3.4: Migrate TabNode.ts

```
Migrate packages/ui/ui/src/flexlayout-react/model/TabNode.ts to use Effect Schema.

Context:
- Read existing TabNode class
- Extends Node
- Has name, component, config fields
- Leaf node (no children)

Requirements:
1. Create ITabNodeData extending/composing INodeData pattern
2. Create ITabNode schema class
3. Implement abstract methods from Node
4. Migrate static fromJson, getAttributeDefinitions
5. Migrate all instance methods including delete(), setName(), etc.

Verify: turbo run check --filter=@beep/ui
```

---

## Phase 4: Orchestrator

### Task 4.1: Migrate Model.ts

```
Migrate packages/ui/ui/src/flexlayout-react/model/Model.ts to use Effect Schema.

Context:
- Read existing Model class
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

3. Create IModel schema class
4. Migrate static MAIN_WINDOW_ID constant
5. Migrate static attributeDefinitions (use IAttributeDefinitions)
6. Migrate static fromJson factory
7. Migrate all instance methods:
   - doAction (large switch statement)
   - getters (getActiveTabset, getMaximizedTabset, getRoot, etc.)
   - setters (setOnAllowDrop, setOnCreateTabSet, etc.)
   - visitors (visitNodes, visitWindowNodes)
   - serialization (toJson, toString, toJSON)
   - internal methods (updateIdMap, addNode, tidy, etc.)

This is the largest migration. Take it method by method.

Verify: turbo run check --filter=@beep/ui
```

---

## Verification Prompt

```
After completing a migration, verify the changes:

1. Run type check:
   turbo run check --filter=@beep/ui

2. If errors, fix them following Effect patterns:
   - Use A.map not array.map
   - Use Str.split not string.split
   - Use Order for sorting
   - Use O.Option for optional returns

3. Ensure legacy class is preserved with @internal JSDoc

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

1. Read these already-migrated files:
   - packages/ui/ui/src/flexlayout-react/Attribute.ts
   - packages/ui/ui/src/flexlayout-react/AttributeDefinitions.ts
   - packages/ui/ui/src/flexlayout-react/DockLocation.ts
   - packages/ui/ui/src/flexlayout-react/Orientation.ts
   - packages/ui/ui/src/flexlayout-react/Rect.ts

2. Extract patterns for:
   - Schema struct definition
   - Schema class definition
   - Static factory methods
   - Instance method migration
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

Document findings for reference during migration.
```
