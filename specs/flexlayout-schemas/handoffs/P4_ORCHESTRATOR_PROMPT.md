# FlexLayout Schema Creation — P4 Orchestrator

> Execute Phase 4: Create Node Subclass Schemas (TabNode, TabSetNode, BorderNode, RowNode)

---

## Critical Rule

**DO NOT MODIFY ORIGINAL CLASSES.** This is additive work - create NEW schema classes alongside existing classes. Originals stay unchanged.

---

## Critical Orchestration Rules

1. **NEVER write code without reading the file first**
2. **ALWAYS verify with type check after changes**
3. **DO NOT modify original classes** - Create new schema classes alongside them
4. **LOG learnings** in REFLECTION_LOG.md

---

## Context from P3 Completion

| Metric | Value |
|--------|-------|
| P3 Status | Complete |
| ILayoutWindow created | Lines 153-318 in LayoutWindow.ts |
| IBorderSet created | Lines 102-203 in BorderSet.ts |
| Pattern learned | IRect composition in schema fields |
| DOM reference handling | `O.Option<Window>` pattern |
| Verification | Type check + lint passed |

---

## P4 Challenge Summary

Four Node subclasses need schema versions:

1. **TabNode** - Leaf node representing individual tabs (simplest, do first)
2. **TabSetNode** - Container for tabs
3. **BorderNode** - Border panel nodes
4. **RowNode** - Row container nodes (may have recursive references)

All must:
- Extend INode (from P2)
- Override abstract methods: toJson(), updateAttrs(), getAttributeDefinitions()
- Add subclass-specific fields and methods

---

## Execution Order (Dependency-Aware)

```
┌─────────────────────────────────────────────────────┐
│              P4 EXECUTION ORDER                      │
├─────────────────────────────────────────────────────┤
│  1. ITabNode (leaf node, no dependencies)            │
│  2. ITabSetNode (references ITabNode)                │
│  3. IBorderNode (references TabNode)                 │
│  4. IRowNode (references TabSetNode, RowNode)        │
└─────────────────────────────────────────────────────┘
```

---

## P4 Tasks to Execute

### Task 1: Analyze TabNode.ts

**Sub-agent prompt**:
```
Read packages/ui/ui/src/flexlayout-react/model/TabNode.ts

Document:
1. All instance fields (names, types, initialization)
2. Constructor logic
3. All methods - especially abstract method implementations
4. Dependencies (imports used)

Categorize fields:
- SERIALIZABLE: id, type, name, component, config, etc.
- RUNTIME-ONLY: References to parent/model, callbacks

Report structure - do not modify files yet.
```

### Task 2: Create ITabNode

**Sub-agent prompt**:
```
Create ITabNode schema class in packages/ui/ui/src/flexlayout-react/model/TabNode.ts

IMPORTANT: DO NOT modify the existing TabNode class. Add new code BELOW it.

Steps:
1. Add imports at top of file (if not already present):
   import { $UiId } from "@beep/identity/packages";
   import * as S from "effect/Schema";
   import * as O from "effect/Option";

2. Create identifier:
   const $I = $UiId.create("flexlayout-react/model/TabNode");

3. Create data struct for serializable fields:
   export class ITabNodeData extends S.Class<ITabNodeData>($I`ITabNodeData`)({
     nodeData: INodeData,
     // TabNode-specific serializable fields
   }) {}

4. Create ITabNode class extending INode:
   export class ITabNode extends INode {
     // TabNode-specific private runtime fields

     // Override abstract methods
     override toJson(): JsonTabNode { ... }
     override updateAttrs(json: UnsafeAny): void { ... }
     override getAttributeDefinitions(): AttributeDefinitions { ... }

     // TabNode-specific methods
   }

5. Copy all methods from TabNode, adapting to private field access

6. DO NOT modify, delete, or mark the original TabNode class
```

### Task 3: Verify TabNode

**Sub-agent prompt**:
```
After creating ITabNode:

1. Run type check:
   turbo run check --filter=@beep/ui

2. If errors, fix them

3. Verify both classes exist:
   grep -n "class TabNode\|class ITabNode" packages/ui/ui/src/flexlayout-react/model/TabNode.ts
```

### Task 4-6: Repeat for TabSetNode

Same pattern as Tasks 1-3 but for TabSetNode.ts

### Task 7-9: Repeat for BorderNode

Same pattern as Tasks 1-3 but for BorderNode.ts

### Task 10-12: Repeat for RowNode

Same pattern as Tasks 1-3 but for RowNode.ts

### Task 13: Final Verification

**Sub-agent prompt**:
```
Final verification:

1. Run type check:
   turbo run check --filter=@beep/ui

2. Run lint:
   turbo run lint --filter=@beep/ui

3. If lint errors, run lint:fix:
   turbo run lint:fix --filter=@beep/ui

4. Verify all classes exist:
   grep -n "class TabNode\|class ITabNode" packages/ui/ui/src/flexlayout-react/model/TabNode.ts
   grep -n "class TabSetNode\|class ITabSetNode" packages/ui/ui/src/flexlayout-react/model/TabSetNode.ts
   grep -n "class BorderNode\|class IBorderNode" packages/ui/ui/src/flexlayout-react/model/BorderNode.ts
   grep -n "class RowNode\|class IRowNode" packages/ui/ui/src/flexlayout-react/model/RowNode.ts

5. Report results
```

### Task 14: Update Reflection Log

**Sub-agent prompt**:
```
Update specs/flexlayout-schemas/REFLECTION_LOG.md with P4 learnings:

Add new entry:
### 2026-01-XX - P4 Node Subclasses Schema Creation

#### What Worked
- [Inheritance from INode? Abstract method overrides?]

#### What Didn't Work
- [any issues encountered?]

#### Pattern Refinements
- Subclass extension pattern
- Abstract method override pattern
- Recursive type handling (RowNode)

#### Decisions Made
- [e.g., "Used composition for ITabNodeData instead of inheritance"]
```

---

## Schema Class Pattern for Node Subclasses

**CRITICAL: Effect Schema classes MUST use `.extend()` method - NOT regular extends/implements!**

```typescript
// CORRECT Pattern - Use .extend() for Effect Schema inheritance
export class IClassName extends INode.extend<IClassName>("IClassName")({
  // Additional serializable fields (if any) - empty {} if none
}) {
  static readonly TYPE = "classname";

  // Subclass-specific private runtime fields
  private _specificRef: O.Option<SomeType> = O.none();

  // Static factory method (required since constructors can't be overridden)
  static readonly new = (model: Model, json: UnsafeTypes.UnsafeAny): IClassName => {
    const instance = new IClassName({});
    instance._initialize(model, json);
    return instance;
  };

  private _initialize(model: Model, json: UnsafeTypes.UnsafeAny): void {
    this.initializeModel(model);
    IClassName.attributeDefinitions.fromJson(json, this.getAttributes());
    model.addNode(this as unknown as Node);
  }

  // REQUIRED: Override abstract methods from INode
  override toJson(): JsonClassName {
    // Implementation
  }

  override updateAttrs(json: UnsafeTypes.UnsafeAny): void {
    // Implementation
  }

  override getAttributeDefinitions(): AttributeDefinitions {
    // Implementation
  }

  // Interface methods (IDraggable, IDropTarget) - NO implements clause!
  // Just add the methods directly
  isEnableDrag(): boolean { return this.getAttr("enableDrag") as boolean; }
  getName(): string { return this.getAttr("name") as string; }
  drop(dragNode: Node, location: DockLocation, index: number): void { ... }
  isEnableDrop(): boolean { return this.getAttr("enableDrop") as boolean; }

  // Subclass-specific methods
  specificMethod(): ReturnType { ... }
}
```

### Invalid Patterns (DO NOT USE)

```typescript
// WRONG - Cannot use regular extends
export class IClassName extends INode { ... }

// WRONG - Cannot use implements with Effect Schema classes
export class IClassName extends INode.extend<IClassName>("IClassName")({}) implements IDraggable { ... }

// WRONG - Cannot override constructor
constructor(model: Model, json: UnsafeTypes.UnsafeAny) {
  super({});  // This breaks schema decoding
}
```

---

## Success Criteria

- [ ] TabNode.ts structure analyzed
- [ ] ITabNodeData and ITabNode created BELOW original
- [ ] TabSetNode.ts structure analyzed
- [ ] ITabSetNodeData and ITabSetNode created BELOW original
- [ ] BorderNode.ts structure analyzed
- [ ] IBorderNodeData and IBorderNode created BELOW original
- [ ] RowNode.ts structure analyzed
- [ ] IRowNodeData and IRowNode created BELOW original
- [ ] All abstract methods properly overridden
- [ ] All original classes UNCHANGED
- [ ] Type check passes: `turbo run check --filter=@beep/ui`
- [ ] Lint passes: `turbo run lint --filter=@beep/ui`
- [ ] REFLECTION_LOG.md updated

---

## Verification Commands

```bash
# Type check
turbo run check --filter=@beep/ui

# Lint
turbo run lint --filter=@beep/ui

# Verify classes exist
grep -n "class TabNode\|class ITabNode" packages/ui/ui/src/flexlayout-react/model/TabNode.ts
grep -n "class TabSetNode\|class ITabSetNode" packages/ui/ui/src/flexlayout-react/model/TabSetNode.ts
grep -n "class BorderNode\|class IBorderNode" packages/ui/ui/src/flexlayout-react/model/BorderNode.ts
grep -n "class RowNode\|class IRowNode" packages/ui/ui/src/flexlayout-react/model/RowNode.ts
```

---

## On Completion

If P4 succeeds:

1. Create `handoffs/HANDOFF_P5.md` with:
   - P4 completion summary
   - Learnings applied
   - P5 tasks (Model.ts - final boss)

2. Create `handoffs/P5_ORCHESTRATOR_PROMPT.md` with:
   - Context from P4
   - Tasks for Model schema creation (the complex orchestrator class)

---

## Troubleshooting

### Inheritance errors
INode must be exported and accessible. Verify import:
```typescript
import { INode, INodeData } from "./Node";
```

### Abstract method signature mismatch
Ensure override matches INode signatures exactly:
```typescript
override toJson(): JsonRowNode | JsonBorderNode | JsonTabSetNode | JsonTabNode | undefined
```

### Circular references (RowNode)
RowNode may reference itself. Use:
```typescript
private _children: IRowNode[] = [];  // Self-referential is OK in runtime fields
```

### Type narrowing at boundaries
When interacting with original classes:
```typescript
// Type assertion needed at boundary
const child = originalNode.getChildren()[0] as unknown as ITabNode;
```
