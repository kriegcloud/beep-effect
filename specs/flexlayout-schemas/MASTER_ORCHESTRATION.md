# FlexLayout Schema Creation: Master Orchestration

> Complete workflow for creating Effect Schema classes alongside existing FlexLayout model classes.

---

## Critical Orchestration Rules

1. **DO NOT MODIFY original classes** - This is additive work, originals stay unchanged
2. **NEVER skip dependency order** - Schema classes must be created in dependency order
3. **ALWAYS run type check** after each file: `turbo run check --filter=@beep/ui`
4. **LOG reflections** - Update REFLECTION_LOG.md after each schema class is created
5. **ONE file at a time** - Complete schema class and verify before moving to next

---

## Dependency Graph

```
                    ┌─────────────┐
                    │   Actions   │  (no deps, start here)
                    └─────────────┘
                           │
                    ┌──────▼──────┐
                    │    Node     │  (abstract base)
                    └─────────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
   ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐
   │LayoutWindow │  │  BorderSet  │  │  BorderNode │
   └─────────────┘  └─────────────┘  └─────────────┘
          │                │                │
          │         ┌──────▼──────┐         │
          │         │   RowNode   │◄────────┘
          │         └─────────────┘
          │                │
          │    ┌───────────┼───────────┐
          │    │                       │
          │ ┌──▼─────────┐   ┌─────────▼──┐
          │ │ TabSetNode │   │   TabNode  │
          │ └────────────┘   └────────────┘
          │        │                │
          └────────┼────────────────┘
                   │
            ┌──────▼──────┐
            │    Model    │  (orchestrator, do last)
            └─────────────┘
```

---

## Phase Overview

| Phase | Files | Sessions | Focus |
|-------|-------|----------|-------|
| **P1** | Actions.ts | 1 | Create IActions - static factory class |
| **P2** | Node.ts | 1-2 | Create INode - abstract base class challenge |
| **P3** | LayoutWindow.ts, BorderSet.ts | 1 | Create ILayoutWindow, IBorderSet |
| **P4** | BorderNode.ts, RowNode.ts | 1-2 | Create IBorderNode, IRowNode |
| **P5** | TabSetNode.ts, TabNode.ts | 1-2 | Create ITabSetNode, ITabNode |
| **P6** | Model.ts | 2-3 | Create IModel - orchestrator class |

---

## Phase 1: Actions (Foundation)

### Context
- Simplest file: only static constants and factory methods
- No instance state, no inheritance
- Currently extends `Data.Class`
- Original `Actions` class stays unchanged

### Execution Steps

1. **Read** `model/Actions.ts` and `model/Action.ts`
2. **Check** if Action.ts needs a schema version first (it uses `Action.new`)
3. **Create** `IActions` schema class following Pattern 1 (simple data class)
4. **Add** all static constants (ADD_NODE, MOVE_NODE, etc.) to IActions
5. **Add** all static factory methods to IActions
6. **DO NOT modify** the original `Actions` class
7. **Verify**: `turbo run check --filter=@beep/ui`

### Success Criteria
- [ ] IActions schema class created alongside original Actions
- [ ] Original Actions class unchanged
- [ ] All 16 action type constants in IActions
- [ ] All 14 factory methods return correct Action type
- [ ] Type check passes

### Checkpoint
Update REFLECTION_LOG.md:
- What patterns worked?
- Any surprises with static-only class?

---

## Phase 2: Node (Abstract Base)

### Context
- Abstract class with abstract methods: `toJson()`, `updateAttrs()`, `getAttributeDefinitions()`
- Base for BorderNode, RowNode, TabSetNode, TabNode
- Effect Schema classes cannot be abstract
- Original `Node` class stays unchanged

### Architecture Decision

**Option A: Runtime Abstract Pattern**
```typescript
export class INode extends S.Class<INode>($I`INode`)({
  data: INodeData
}) {
  // "Abstract" methods throw at runtime
  readonly toJson = (): never => {
    throw new Error("INode.toJson must be overridden");
  }
}
```

**Option B: Union Type Pattern**
```typescript
export type INodeUnion = IBorderNode | IRowNode | ITabSetNode | ITabNode;
// No INode base class, just shared data structure
```

**Option C: Composition Pattern**
```typescript
// Each node type has its own data, shares utility functions
export const NodeUtils = {
  getId: (node: { data: { attributes: Record<string, unknown> } }) => ...
}
```

**Recommended**: Option A (Runtime Abstract) - preserves class hierarchy, simplest approach

### Execution Steps

1. **Decide** on abstract handling approach (recommend Option A)
2. **Create** INodeData schema struct with all common fields
3. **Create** INode schema class with runtime-throwing "abstract" methods
4. **Add** all concrete methods (getId, getModel, getChildren, etc.) to INode
5. **DO NOT modify** the original `Node` class
6. **Verify**: `turbo run check --filter=@beep/ui`

### Success Criteria
- [ ] INodeData schema created alongside original
- [ ] INode schema class created alongside original Node
- [ ] Original Node class unchanged
- [ ] All 30+ methods in INode
- [ ] "Abstract" methods documented as requiring override
- [ ] Type check passes

### Checkpoint
Update REFLECTION_LOG.md:
- Which abstract pattern was chosen and why?
- Challenges with self-referential types (parent, children)?

---

## Phase 3: Support Classes

### Context
- LayoutWindow: manages window state, has DOM Window reference
- BorderSet: collection of BorderNode, has Map<DockLocation, BorderNode>
- Original classes stay unchanged

### Execution Steps (LayoutWindow)

1. **Read** `model/LayoutWindow.ts`
2. **Identify** serializable vs runtime-only fields:
   - Serializable: windowId, rect
   - Runtime: _layout, _window (DOM), _root, _maximizedTabSet, _activeTabSet, _toScreenRectFunction
3. **Create** ILayoutWindowData with serializable fields only
4. **Create** ILayoutWindow with private runtime fields
5. **Add** methods to ILayoutWindow
6. **DO NOT modify** original `LayoutWindow` class
7. **Verify**: `turbo run check --filter=@beep/ui`

### Execution Steps (BorderSet)

1. **Read** `model/BorderSet.ts`
2. **Create** IBorderSetData:
   - borders: mutable array (needs IBorderNode - may need forward ref)
   - layoutHorizontal: boolean
3. **Handle** borderMap as private runtime field (complex key type)
4. **Add** methods to IBorderSet
5. **DO NOT modify** original `BorderSet` class
6. **Verify**: `turbo run check --filter=@beep/ui`

### Success Criteria
- [ ] ILayoutWindow created alongside original
- [ ] IBorderSet created alongside original
- [ ] Original LayoutWindow and BorderSet unchanged
- [ ] Static fromJson methods in schema classes
- [ ] Type check passes

---

## Phase 4: Node Subclasses (Part 1)

### Context
- BorderNode: extends Node, has location, size, selected
- RowNode: extends Node, has weight, manages layout splitting
- Original classes stay unchanged

### Execution Steps (BorderNode)

1. **Read** `model/BorderNode.ts`
2. **Create** IBorderNodeData extending INodeData pattern
3. **Create** IBorderNode alongside original BorderNode
4. **Add** static getAttributeDefinitions to IBorderNode
5. **Add** all instance methods to IBorderNode
6. **DO NOT modify** original `BorderNode` class
7. **Verify**: `turbo run check --filter=@beep/ui`

### Execution Steps (RowNode)

1. **Read** `model/RowNode.ts`
2. **Create** IRowNodeData
3. **Create** IRowNode alongside original RowNode
4. **Add** complex methods: tidy(), layout(), drop() to IRowNode
5. **DO NOT modify** original `RowNode` class
6. **Verify**: `turbo run check --filter=@beep/ui`

### Success Criteria
- [ ] IBorderNode created alongside original
- [ ] IRowNode created alongside original
- [ ] Original BorderNode and RowNode unchanged
- [ ] Both implement "abstract" methods from INode
- [ ] Type check passes

---

## Phase 5: Node Subclasses (Part 2)

### Context
- TabSetNode: manages tabs, has selected/maximized state
- TabNode: leaf node, represents actual tab content
- Original classes stay unchanged

### Execution Steps (TabSetNode)

1. **Read** `model/TabSetNode.ts`
2. **Create** ITabSetNodeData with selected, weight, etc.
3. **Create** ITabSetNode alongside original TabSetNode
4. **Add** canDrop, drop, canMaximize methods to ITabSetNode
5. **DO NOT modify** original `TabSetNode` class
6. **Verify**: `turbo run check --filter=@beep/ui`

### Execution Steps (TabNode)

1. **Read** `model/TabNode.ts`
2. **Create** ITabNodeData with name, component, config
3. **Create** ITabNode alongside original TabNode
4. **Add** delete, setName methods to ITabNode
5. **DO NOT modify** original `TabNode` class
6. **Verify**: `turbo run check --filter=@beep/ui`

### Success Criteria
- [ ] ITabSetNode created alongside original
- [ ] ITabNode created alongside original
- [ ] Original TabSetNode and TabNode unchanged
- [ ] All drop/drag methods work correctly
- [ ] Type check passes

---

## Phase 6: Model (Orchestrator)

### Context
- Central orchestrator, ~720 lines
- Has circular dependencies with all Node types
- Large doAction switch statement
- Multiple callbacks and runtime state
- Original Model class stays unchanged

### Execution Steps

1. **Read** `model/Model.ts` carefully (largest file)
2. **Identify** what can be in schema:
   - attributes: Record<string, unknown>
3. **Identify** runtime-only fields:
   - idMap: Map<string, Node>
   - changeListeners: callback array
   - borders: BorderSet
   - windows: Map<string, LayoutWindow>
   - rootWindow: LayoutWindow
   - onAllowDrop, onCreateTabSet: callbacks
4. **Create** IModelData (minimal, mostly attributes)
5. **Create** IModel alongside original Model with extensive private fields
6. **Add** static methods (fromJson, toTypescriptInterfaces) to IModel
7. **Add** doAction method (preserve switch structure) to IModel
8. **Add** all getters/setters to IModel
9. **Add** visitor methods to IModel
10. **DO NOT modify** original `Model` class
11. **Update** verify all new `I<class-name>` schemas including those from preivious phases do not reference legacy classes only other schemas. 
12. **Verify**: `turbo run check --filter=@beep/ui`

### Success Criteria
- [x] IModel created alongside original Model
- [x] Original Model class unchanged
- [x] All 50+ methods in IModel
- [x] doAction handles all 16 action types
- [x] Serialization (toJson/fromJson) works
- [x] Type check passes

---

## Phase 7: Decouple I* Schema Classes

### Context
- All I* schema classes created in P1-P6
- Currently use `as unknown as OriginalClass` type assertions
- Need to form self-contained parallel hierarchy
- Original classes stay unchanged

### Key Benefit: Type-Safe Runtime Validation

Effect Schema classes enable type-safe narrowing via decode functions instead of unsafe casts:

```typescript
// ❌ UNSAFE - Current pattern
const parentRow = new INode(this.getParent()) as unknown as Node;

// ✅ SAFE - Effect Schema decode
const parentRow = S.decodeUnknownSync(INode)(this.getParent());

// ✅ SAFER - With error handling
const result = S.decodeUnknownEither(INode)(this.getParent());
```

### Execution Steps

1. **Update** INode: `_model` type from `Model` to `IModel`
2. **Update** ITabNode: accept `IModel` instead of `Model`
3. **Update** ITabSetNode: use `IModel`, `ITabNode`, `ILayoutWindow`
4. **Update** IBorderNode: use `IModel`, `ITabNode`
5. **Update** IRowNode: use `IModel`, `ITabSetNode`, `ILayoutWindow`
6. **Update** ILayoutWindow: use `IModel`, `IRowNode`
7. **Update** IBorderSet: use `IModel`, `IBorderNode`
8. **Update** IModel: use all I* classes (IBorderSet, ILayoutWindow, IRowNode, ITabNode, etc.)
9. **Remove** all `as unknown as` type assertions (any form, not just Model/Node)
10. **Replace** type narrowing with `S.decodeUnknownSync()` or `S.decodeUnknownEither()` where needed
11. **Verify**: `turbo run check --filter=@beep/ui`
12. **DO NOT modify** any original classes

### Common Gotchas

- **Property paths**: `this.x` for runtime fields, `this.data.x` for schema data
- **Option wrappers**: Use `O.getOrThrow()` to unwrap `O.Option<T>` fields
- **Static factories**: Use `IXxx.new()` not `new IXxx()`
- **Override keyword**: Required for inherited methods like `toString()`
- **Collection types**: Update `Map<string, Node>` → `Map<string, INode>`

See `handoffs/P7_ORCHESTRATOR_PROMPT.md` for full troubleshooting guide.

### Success Criteria
- [ ] All I* classes only reference other I* classes
- [ ] **Zero `as unknown as` type assertions remain in I* classes** (any form)
- [ ] Type narrowing uses Effect Schema decode functions where genuinely needed
- [ ] No original class constructors used in I* classes
- [ ] Type check passes
- [ ] Lint passes
- [ ] Original classes unchanged

---

## Verification Protocol

After EACH file migration:

```bash
# 1. Type check
turbo run check --filter=@beep/ui

# 2. If errors, diagnose
# Look for:
# - Missing Effect imports (A, O, Order)
# - Native method usage (array.map -> A.map)
# - Option unwrapping issues

# 3. Lint check
turbo run lint --filter=@beep/ui
```

---

## Handoff Protocol

After each phase:

1. **Update** REFLECTION_LOG.md with:
   - What worked
   - What didn't work
   - Pattern refinements

2. **Create** handoffs/HANDOFF_P[N+1].md with:
   - Completed work summary
   - Remaining work
   - Improved prompts based on learnings

3. **Create** handoffs/P[N+1]_ORCHESTRATOR_PROMPT.md with:
   - Context from previous phase
   - Tasks for next phase
   - Verification commands

---

## Recovery Procedures

### If Type Check Fails

1. Read the error carefully
2. Check for common issues:
   - `this.field` should be `this.data.field`
   - Native array methods should use Effect `A.*`
   - Optional fields need Option handling
3. Fix and re-verify

### If Circular Dependency Detected

1. Use lazy initialization pattern
2. Consider interface segregation
3. Move shared types to separate file

### If Tests Fail

1. Check if original class still works (it should be unchanged)
2. Verify schema class has same public API as original
3. Add missing methods to schema class

---

## Final Checklist

- [x] All 9 files have schema classes added alongside originals
- [x] All schema classes prefixed with `I` (IModel, INode, etc.)
- [x] All original classes completely unchanged
- [x] Type check passes: `turbo run check --filter=@beep/ui`
- [x] Lint passes: `turbo run lint --filter=@beep/ui`
- [x] REFLECTION_LOG.md has entries for each phase
- [x] All handoff documents created
- [ ] (P7) All I* classes decoupled from original classes
- [ ] (P7) Zero type assertions to original classes remain
