# FlexLayout Schema Migration: Master Orchestration

> Complete workflow for migrating FlexLayout model classes to Effect Schema.

---

## Critical Orchestration Rules

1. **NEVER skip dependency order** - Files must be migrated in dependency order
2. **ALWAYS run type check** after each file: `turbo run check --filter=@beep/ui`
3. **PRESERVE legacy classes** - Mark with `/** @internal */`, don't delete
4. **LOG reflections** - Update REFLECTION_LOG.md after each file migration
5. **ONE file at a time** - Complete and verify before moving to next

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
| **P1** | Actions.ts | 1 | Foundation - static factory class |
| **P2** | Node.ts | 1-2 | Abstract base class challenge |
| **P3** | LayoutWindow.ts, BorderSet.ts | 1 | Support classes |
| **P4** | BorderNode.ts, RowNode.ts | 1-2 | Node subclasses (part 1) |
| **P5** | TabSetNode.ts, TabNode.ts | 1-2 | Node subclasses (part 2) |
| **P6** | Model.ts | 2-3 | Orchestrator class |

---

## Phase 1: Actions (Foundation)

### Context
- Simplest file: only static constants and factory methods
- No instance state, no inheritance
- Currently extends `Data.Class`

### Execution Steps

1. **Read** `model/Actions.ts` and `model/Action.ts`
2. **Check** if Action.ts needs migration first (it uses `Action.new`)
3. **Create** schema version following Pattern 1 (simple data class)
4. **Migrate** all static constants (ADD_NODE, MOVE_NODE, etc.)
5. **Migrate** all static factory methods
6. **Verify**: `turbo run check --filter=@beep/ui`

### Success Criteria
- [ ] IActions schema class created
- [ ] All 16 action type constants preserved
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

**Recommended**: Option A (Runtime Abstract) - preserves class hierarchy, simplest migration path

### Execution Steps

1. **Decide** on abstract handling approach (recommend Option A)
2. **Create** INodeData schema struct with all common fields
3. **Create** INode schema class with runtime-throwing "abstract" methods
4. **Migrate** all concrete methods (getId, getModel, getChildren, etc.)
5. **Verify**: `turbo run check --filter=@beep/ui`

### Success Criteria
- [ ] INodeData schema created
- [ ] INode schema class created
- [ ] All 30+ methods migrated
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

### Execution Steps (LayoutWindow)

1. **Read** `model/LayoutWindow.ts`
2. **Identify** serializable vs runtime-only fields:
   - Serializable: windowId, rect
   - Runtime: _layout, _window (DOM), _root, _maximizedTabSet, _activeTabSet, _toScreenRectFunction
3. **Create** ILayoutWindowData with serializable fields only
4. **Create** ILayoutWindow with private runtime fields
5. **Migrate** methods
6. **Verify**: `turbo run check --filter=@beep/ui`

### Execution Steps (BorderSet)

1. **Read** `model/BorderSet.ts`
2. **Create** IBorderSetData:
   - borders: mutable array (needs IBorderNode - may need forward ref)
   - layoutHorizontal: boolean
3. **Handle** borderMap as private runtime field (complex key type)
4. **Migrate** methods
5. **Verify**: `turbo run check --filter=@beep/ui`

### Success Criteria
- [ ] ILayoutWindow created with DOM refs as private fields
- [ ] IBorderSet created
- [ ] Static fromJson methods migrated
- [ ] Type check passes

---

## Phase 4: Node Subclasses (Part 1)

### Context
- BorderNode: extends Node, has location, size, selected
- RowNode: extends Node, has weight, manages layout splitting

### Execution Steps (BorderNode)

1. **Read** `model/BorderNode.ts`
2. **Create** IBorderNodeData extending INodeData pattern
3. **Create** IBorderNode:
   - If using Option A: extend behavior from INode conceptually
   - Override "abstract" methods with real implementations
4. **Migrate** static getAttributeDefinitions
5. **Migrate** all instance methods
6. **Verify**: `turbo run check --filter=@beep/ui`

### Execution Steps (RowNode)

1. **Read** `model/RowNode.ts`
2. **Create** IRowNodeData
3. **Create** IRowNode
4. **Migrate** complex methods: tidy(), layout(), drop()
5. **Verify**: `turbo run check --filter=@beep/ui`

### Success Criteria
- [ ] IBorderNode created with location handling
- [ ] IRowNode created with layout logic
- [ ] Both implement "abstract" methods from INode
- [ ] Type check passes

---

## Phase 5: Node Subclasses (Part 2)

### Context
- TabSetNode: manages tabs, has selected/maximized state
- TabNode: leaf node, represents actual tab content

### Execution Steps (TabSetNode)

1. **Read** `model/TabSetNode.ts`
2. **Create** ITabSetNodeData with selected, weight, etc.
3. **Create** ITabSetNode
4. **Migrate** canDrop, drop, canMaximize methods
5. **Verify**: `turbo run check --filter=@beep/ui`

### Execution Steps (TabNode)

1. **Read** `model/TabNode.ts`
2. **Create** ITabNodeData with name, component, config
3. **Create** ITabNode
4. **Migrate** delete, setName methods
5. **Verify**: `turbo run check --filter=@beep/ui`

### Success Criteria
- [ ] ITabSetNode created with tab management
- [ ] ITabNode created as leaf node
- [ ] All drop/drag methods work correctly
- [ ] Type check passes

---

## Phase 6: Model (Orchestrator)

### Context
- Central orchestrator, ~720 lines
- Has circular dependencies with all Node types
- Large doAction switch statement
- Multiple callbacks and runtime state

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
5. **Create** IModel with extensive private fields
6. **Migrate** static methods (fromJson, toTypescriptInterfaces)
7. **Migrate** doAction method (preserve switch structure)
8. **Migrate** all getters/setters
9. **Migrate** visitor methods
10. **Verify**: `turbo run check --filter=@beep/ui`

### Success Criteria
- [ ] IModel created
- [ ] All 50+ methods migrated
- [ ] doAction handles all 16 action types
- [ ] Serialization (toJson/fromJson) works
- [ ] Type check passes

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

1. Check if legacy class still works
2. Verify schema class has same public API
3. Add missing methods

---

## Final Checklist

- [ ] All 9 files have schema versions
- [ ] All schema classes prefixed with `I` (IModel, INode, etc.)
- [ ] Legacy classes preserved with `/** @internal */`
- [ ] Type check passes: `turbo run check --filter=@beep/ui`
- [ ] Lint passes: `turbo run lint --filter=@beep/ui`
- [ ] REFLECTION_LOG.md has entries for each phase
- [ ] All handoff documents created
