# FlexLayout Schema Creation Handoff — P2 Phase

> Handoff for Phase 2: Create INode Schema Class (Abstract Class Challenge)

---

## Critical Rule

**DO NOT MODIFY ORIGINAL CLASSES.** This is additive work - create NEW schema classes alongside existing classes. Originals stay unchanged.

---

## Session Summary: P1 Complete

| Metric | Value |
|--------|-------|
| Date | 2026-01-11 |
| Phase completed | P1 (IActions) |
| Next phase | P2 (INode) |
| Status | Ready to execute P2 |

---

## What Was Accomplished (P1)

### IActions Schema Class Created

- **File**: `packages/ui/ui/src/flexlayout-react/model/Actions.ts`
- **Original class**: `Actions extends Data.Class` (lines 19-216) - UNCHANGED
- **Schema class**: `IActions extends S.Class<IActions>($I\`IActions\`)({})` (lines 230-428)

### Key Findings

1. **Action.ts already uses Effect Schema** - No prerequisite work needed. Action.ts already has `Action.new()` factory.

2. **Actions has no instance state** - Only static constants and factory methods. Used empty schema body `({})`.

3. **Pattern discovered** - Static-only classes use minimal schema with empty body:
   ```typescript
   export class IActions extends S.Class<IActions>($I`IActions`)({}) {
     static CONSTANT = "value";
     static method(): ReturnType { ... }
   }
   ```

### Verification Results

- Type check: PASSED (`turbo run check --filter=@beep/ui`)
- Lint: PASSED (`turbo run lint --filter=@beep/ui`)
- Both classes verified present in file

---

## P2 Challenge: Abstract Class

Node.ts presents unique challenges as it's an abstract class with abstract methods.

### Node.ts Structure Analysis

```typescript
// Abstract class
export abstract class Node extends Data.Class {
  // Protected instance fields
  protected model: Model;
  protected attributes: Record<string, UnsafeAny>;
  protected parent?: Node;
  protected children: Node[];
  protected rect: Rect;
  protected path: string;
  protected listeners: Map<string, (params: UnsafeAny) => void>;

  // Protected constructor
  protected constructor(_model: Model) { ... }

  // Abstract methods (must be implemented by subclasses)
  abstract toJson(): JsonRowNode | JsonBorderNode | JsonTabSetNode | JsonTabNode | undefined;
  abstract updateAttrs(json: UnsafeAny): void;
  abstract getAttributeDefinitions(): AttributeDefinitions;

  // Concrete methods (~30)
  getId(): string { ... }
  getModel(): Model { ... }
  getType(): string { ... }
  // ... many more
}
```

### Challenges

1. **Abstract class** - Effect Schema classes cannot be abstract
2. **Abstract methods** - Must be handled without `abstract` keyword
3. **Protected constructor** - Schema classes use `make` pattern
4. **Circular reference** - Node references Model, Model references Node subclasses
5. **Self-referential** - `parent?: Node`, `children: Node[]`
6. **DOM callbacks** - `listeners: Map<string, callback>` cannot be serialized

---

## Recommended Approach for P2

### Option 1: Concrete Base with Runtime Checks

Create a concrete INode class that throws for abstract method calls:

```typescript
export class INode extends S.Class<INode>($I`INode`)({
  id: S.OptionFromUndefinedOr(S.String),
  type: S.NonEmptyTrimmedString,
  // ... other serializable fields
}) {
  // Non-serializable fields as private instance
  private _model: O.Option<Model> = O.none();
  private _parent: O.Option<INode> = O.none();
  private _children: INode[] = [];
  private _listeners: Map<string, (p: unknown) => void> = new Map();

  // Abstract method implementations that throw
  toJson(): JsonRowNode | JsonBorderNode | JsonTabSetNode | JsonTabNode | undefined {
    throw new Error("Abstract method - must be implemented by subclass");
  }

  // Concrete methods work as normal
  getId(): string { ... }
  getModel(): Model { ... }
}
```

### Option 2: Union Type with Type Guards

Create a union schema and type guard functions:

```typescript
// Individual node type schemas
const IRowNodeSchema = S.Struct({ type: S.Literal("row"), ... });
const ITabSetNodeSchema = S.Struct({ type: S.Literal("tabset"), ... });
// etc.

// Union
const IAnyNode = S.Union(IRowNodeSchema, ITabSetNodeSchema, ...);

// Type guards
const isRowNode = (n: IAnyNode): n is IRowNode => n.type === "row";
```

### Recommended: Option 1 for P2

Option 1 maintains class structure and is more compatible with existing codebase patterns.

---

## P2 Tasks to Execute

### Task 1: Create INodeData Schema

Define the serializable data structure:

```typescript
const $I = $UiId.create("flexlayout-react/model/Node");

export class INodeData extends S.Struct({
  id: S.OptionFromUndefinedOr(S.String),
  type: S.NonEmptyTrimmedString,
  weight: S.OptionFromUndefinedOr(S.Number),
  selected: S.OptionFromUndefinedOr(S.Number),
}).pipe(S.mutable).annotations($I.annotations("INodeData", {})) {}
```

### Task 2: Create INode Schema Class

```typescript
export class INode extends S.Class<INode>($I`INode`)({
  data: INodeData
}) {
  // Private non-serializable fields
  private _model: O.Option<Model> = O.none();
  private _parent: O.Option<INode> = O.none();
  private _children: INode[] = [];
  private _rect: Rect = Rect.empty();
  private _path: string = "";
  private _listeners: Map<string, (p: unknown) => void> = new Map();

  // Abstract method stubs
  toJson(): ... { throw new Error("INode.toJson must be overridden"); }
  updateAttrs(json: unknown): void { throw new Error("INode.updateAttrs must be overridden"); }
  getAttributeDefinitions(): AttributeDefinitions { throw new Error("INode.getAttributeDefinitions must be overridden"); }

  // Copy all concrete methods from Node class
  getId(): string { ... }
  getModel(): Model { ... }
  // ... (~25 more methods)
}
```

### Task 3: Verify

```bash
turbo run check --filter=@beep/ui
turbo run lint --filter=@beep/ui
grep -n "class Node\|class INode" packages/ui/ui/src/flexlayout-react/model/Node.ts
```

### Task 4: Update Reflection Log

Document:
- What worked for abstract class handling
- What didn't work
- Pattern refinements for abstract methods
- Circular dependency handling approach

---

## Success Criteria for P2

- [ ] INodeData schema created with serializable fields
- [ ] INode schema class created BELOW original Node class
- [ ] All abstract methods have throwing implementations
- [ ] All concrete methods (~25) copied and working
- [ ] Private non-serializable fields handled correctly
- [ ] Original Node class UNCHANGED
- [ ] Type check passes
- [ ] Lint passes
- [ ] REFLECTION_LOG.md updated with P2 learnings

---

## Files to Reference

| File | Purpose |
|------|---------|
| `model/Node.ts` | Target file for INode |
| `model/Actions.ts` | P1 reference (IActions pattern) |
| `Attribute.ts` | Data class pattern |
| `AttributeDefinitions.ts` | Collection pattern |
| `DockLocation.ts` | Tagged variant + lazy singleton |

---

## Handoff Checklist

- [x] P1 completed and verified
- [x] REFLECTION_LOG.md updated with P1 learnings
- [x] P2 challenges documented
- [x] Recommended approach defined
- [x] P2 tasks clear
- [ ] P2 execution pending
