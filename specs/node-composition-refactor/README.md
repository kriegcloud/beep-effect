# Node Composition Refactor Specification

> Refactor flexlayout-react Node class hierarchy from inheritance to composition using Effect patterns.

---

## Purpose

Replace the inheritance-based `Node` class hierarchy with a composition-based approach using:
- `Data.TaggedClass` for immutable nodes with structural equality
- `Match.exhaustive` for type-safe polymorphic dispatch
- Pure function behavior modules instead of method overriding
- `Pipeable` for fluent composition

## Scope

| In Scope | Out of Scope |
|----------|--------------|
| `packages/ui/ui/src/flexlayout-react/model/` | View components (`view/`) |
| Node, RowNode, TabSetNode, TabNode, BorderNode | Model.ts (coordinator, not node type) |
| IDraggable, IDropTarget interfaces | Actions system (uses node IDs) |
| Serialization (toJson/fromJson) | React integration layer |

## Current State

```
Node (abstract class, extends Data.Class)
├── RowNode extends Node implements IDropTarget
├── TabSetNode extends Node implements IDraggable, IDropTarget
├── TabNode extends Node implements IDraggable
└── BorderNode extends Node implements IDropTarget
```

**Problems:**
1. Tight coupling via protected fields
2. Method overriding obscures behavior
3. Hard to test individual behaviors in isolation
4. No structural equality without Data.Class workaround
5. Adding new node types requires understanding entire hierarchy

## Target State

```
type Node = RowNode | TabSetNode | TabNode | BorderNode  // Tagged union

Behavior modules (pure functions):
├── NodeOps.getChildren(node)
├── DraggableOps.canDrag(node)
├── DropTargetOps.canDrop(node, dragNode, x, y)
├── SizingOps.calcMinMaxSize(node)
└── NodeUpdates.setRect(node, rect) -> Node  // Immutable updates
```

## Success Criteria

- [ ] All 4 node types converted to `Data.TaggedClass`
- [ ] All method overrides replaced with `Match.exhaustive` dispatch
- [ ] Behaviors extracted to pure function modules
- [ ] Structural equality works via `Equal.equals()`
- [ ] Serialization uses Effect Schema transforms
- [ ] All existing tests pass (or are migrated)
- [ ] No `instanceof` checks in application code
- [ ] View components updated to use new patterns

## Phases

| Phase | Description | Output |
|-------|-------------|--------|
| P0 | Research & proposal (COMPLETE) | `node-composition.proposal.ts` |
| P1 | Define tagged classes & Node union | New type definitions |
| P2 | Extract behavior modules | `*Ops.ts` function modules |
| P3 | Migrate serialization | Schema-based transforms |
| P4 | Update view components | React components using Match |
| P5 | Remove old hierarchy | Delete abstract Node class |

## Quick Links

| Document | Purpose |
|----------|---------|
| [MASTER_ORCHESTRATION.md](./MASTER_ORCHESTRATION.md) | Full workflow with prompts |
| [REFLECTION_LOG.md](./REFLECTION_LOG.md) | Accumulated learnings |
| [outputs/](./outputs/) | Phase outputs and artifacts |

## Research Artifacts

Initial research conducted via parallel agents:

1. **Codebase exploration**: Full hierarchy mapping of Node subclasses
2. **Effect patterns research**: `Data.TaggedClass`, `Match`, `Pipeable`
3. **Schema composition**: `S.TaggedClass`, `S.extend`, recursive schemas
4. **Existing patterns**: Found `Data.TaggedEnum` usage in `Upload.service.ts`, `policy-types.ts`

Proposal file: `packages/ui/ui/src/flex-layout/model/node-composition.proposal.ts`

## Key Patterns from Research

### Tagged Classes
```typescript
export class RowNode extends Data.TaggedClass("RowNode")<{
  readonly id: string;
  readonly weight: number;
  readonly children: ReadonlyArray<RowNode | TabSetNode>;
}> {}
```

### Exhaustive Dispatch
```typescript
const getChildren = (node: Node): ReadonlyArray<Node> =>
  Match.value(node).pipe(
    Match.tag("RowNode", n => n.children),
    Match.tag("TabSetNode", n => n.children),
    Match.tag("TabNode", () => []),
    Match.tag("BorderNode", n => n.children),
    Match.exhaustive
  );
```

### Immutable Updates
```typescript
const setRect = (node: Node, rect: Rect): Node =>
  Match.value(node).pipe(
    Match.tag("RowNode", n => new RowNode({ ...n, rect })),
    // ... other cases
    Match.exhaustive
  );
```

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Breaking changes to view layer | Phase 4 updates views incrementally |
| Performance regression from Match | Benchmark critical paths before/after |
| Lost functionality in migration | Comprehensive test coverage before P1 |
| Recursive type complexity | Use `S.suspend` for schema definitions |

## Related Specs

- [flex-layout-port](../flex-layout-port/) - Original FlexLayout porting effort
- [docking-system](../docking-system/) - Drag-drop docking (COMPLETE)

---

**Status**: P0 Complete, Ready for P1
**Complexity**: Medium (4 node types, ~2000 lines to refactor)
**Estimated Phases**: 5 phases across 2-3 sessions
