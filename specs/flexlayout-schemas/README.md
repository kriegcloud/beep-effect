# FlexLayout Schema Migration Spec

> Systematic migration of FlexLayout model classes to Effect Schema-based classes following the mutable data property pattern.

---

## Purpose

Migrate the following FlexLayout model classes from their current implementations (using `Data.Class` or plain classes) to Effect Schema-based classes (`S.Class`) with:
- Mutable data property pattern (`data: SomeData`)
- Effect `HashMap` instead of native `Map`
- Effect `Option` for nullable/optional fields
- Preserved behavior and method signatures

## Target Files

| Priority | File | Complexity | Dependencies |
|----------|------|------------|--------------|
| 1 | `model/Actions.ts` | Low | None (static factory methods) |
| 2 | `model/Node.ts` | High | Abstract base class, many abstract methods |
| 3 | `model/LayoutWindow.ts` | Medium | Node, Rect, TabSetNode |
| 4 | `model/BorderSet.ts` | Medium | BorderNode, DockLocation |
| 5 | `model/BorderNode.ts` | High | Extends Node |
| 6 | `model/RowNode.ts` | High | Extends Node |
| 7 | `model/TabSetNode.ts` | High | Extends Node |
| 8 | `model/TabNode.ts` | High | Extends Node |
| 9 | `model/Model.ts` | Very High | Orchestrates all other classes |

---

## Reference Implementations

The following files have already been migrated and serve as pattern references:

### Pattern 1: Simple Data Class (`Attribute.ts`)
```typescript
// Schema for mutable data
export class AttributeData extends S.Struct({
  name: S.String,
  alias: S.OptionFromUndefinedOr(S.String),  // Optional field pattern
  modelName: S.OptionFromUndefinedOr(S.String),
  defaultValue: S.Unknown,                    // Unknown for any type
  type: S.String,
  required: S.Boolean,
  fixed: S.Boolean,
}).pipe(S.mutable).annotations(
  $I.annotations("AttributeData", { description: "Mutable data for Attribute" })
) {}

// Schema class with data property
export class IAttribute extends S.Class<IAttribute>($I`IAttribute`)({
  data: AttributeData
}) {
  // Self-referential field stored outside schema
  private _pairedAttr: O.Option<IAttribute> = O.none();

  // Static factory
  static readonly new = (name: string, ...) => new IAttribute({ data: {...} });

  // Fluent setter returning this
  readonly setType = (value: string): this => {
    this.data.type = value;
    return this;
  }

  // Accessor methods
  readonly getName = (): string => this.data.name;
  readonly getAlias = (): O.Option<string> => this.data.alias;
}
```

### Pattern 2: Collection with HashMap (`AttributeDefinitions.ts`)
```typescript
export class AttributeDefinitionsData extends S.Struct({
  attributes: S.mutable(S.Array(IAttribute)),
  nameToAttribute: S.mutable(S.Map({key: S.String, value: IAttribute})),
}).pipe(S.mutable).annotations(...) {}

export class IAttributeDefinitions extends S.Class<IAttributeDefinitions>($I`IAttributeDefinitions`)({
  data: AttributeDefinitionsData
}) {
  static readonly new = () => new IAttributeDefinitions({
    data: { attributes: [], nameToAttribute: new Map() }
  });
}
```

### Pattern 3: Tagged Variant Union (`DockLocation.ts`)

DockLocation.ts demonstrates TWO complementary patterns:

**3a. Tagged Variant Pattern** - Type-safe discriminated unions:
```typescript
import { BS } from "@beep/schema";

// String literal kit for the discriminant
export class DockLocationType extends BS.StringLiteralKit(
  "top", "bottom", "left", "right", "center"
).annotations($I.annotations("DockLocationType", {...})) {}

// Compose tagged variants with shared fields
export const dockLocationVariant = DockLocationType.toTagged("type").composer({
  name: S.String,
  indexPlus: S.Number,
});

// Individual variant classes
export class TopDockLocation extends S.Class<TopDockLocation>($I`TopDockLocation`)(
  dockLocationVariant.top({}),
  $I.annotations("TopDockLocation", {...})
) {}

export class BottomDockLocation extends S.Class<BottomDockLocation>($I`BottomDockLocation`)(
  dockLocationVariant.bottom({}),
  $I.annotations("BottomDockLocation", {...})
) {}
// ... other variants

// Union of all variants
export class AnyDockLocation extends S.Union(
  TopDockLocation, BottomDockLocation, LeftDockLocation, RightDockLocation, CenterDockLocation
).annotations($I.annotations("AnyDockLocation", {...})) {}
```

**3b. Lazy Singleton Pattern** - Static enum-like instances:
```typescript
export class IDockLocation extends S.Class<IDockLocation>($I`IDockLocation`)({
  data: DockLocationData
}) {
  // Lazy singleton using Option
  private static _TOP: O.Option<IDockLocation> = O.none();

  static get TOP(): IDockLocation {
    return IDockLocation._TOP.pipe(O.getOrElse(() => {
      const instance = IDockLocation.new("top", new IOrientation({...}), 0);
      IDockLocation._TOP = O.some(instance);
      return instance;
    }));
  }
  // ... BOTTOM, LEFT, RIGHT, CENTER getters follow same pattern
}
```

### Pattern 4: HashMap Schema (`DockLocation.ts`)
```typescript
// Effect HashMap in schema (preferred over native Map)
export class DockLocationValues extends S.HashMap({
  key: S.String,
  value: AnyDockLocation
}).annotations($I.annotations("DockLocationValues", {...})) {}
```

---

## Critical Patterns

### 1. Identifier Convention
```typescript
const $I = $UiId.create("flexlayout-react/FileName");
```

### 2. Data Struct Pattern
- Use `S.Struct({...}).pipe(S.mutable)` for mutable data
- Use `S.OptionFromUndefinedOr(S.Type)` for optional fields
- Use `S.Unknown` for values that can be any type
- Use `S.mutable(S.Array(...))` for mutable arrays
- Use `S.Map({key: S.String, value: S.Type})` for Maps (consider Effect HashMap)

### 3. Schema Class Pattern
```typescript
export class IClassName extends S.Class<IClassName>($I`IClassName`)({
  data: ClassNameData
}) {
  // Static factory method
  static readonly new = (...) => new IClassName({data: {...}});

  // Instance methods
  readonly methodName = (): ReturnType => {...};
}
```

### 4. Handling Self-References
Store self-referential fields as private instance properties outside the schema:
```typescript
private _pairedAttr: O.Option<IAttribute> = O.none();
```

### 5. Handling Runtime Objects
For complex runtime objects (callbacks, DOM references, etc.), store as private instance fields:
```typescript
private _onAllowDrop?: (dragNode: Node, dropInfo: DropInfo) => boolean;
```

### 6. Effect Array/Sorting
Use Effect's `Order` module for sorting:
```typescript
import * as Order from "effect/Order";

const byName = Order.mapInput(Order.string, (attr: IAttribute) => attr.getName());
const sorted = A.sort(items, byName);
```

---

## Execution Strategy

### Phase 1: Foundation (Actions, Node base)
1. Migrate `Actions.ts` - simplest, no instance state
2. Create abstract `INode` base class schema pattern

### Phase 2: Support Classes (LayoutWindow, BorderSet)
3. Migrate `LayoutWindow.ts`
4. Migrate `BorderSet.ts`

### Phase 3: Node Subclasses
5. Migrate `BorderNode.ts`
6. Migrate `RowNode.ts`
7. Migrate `TabSetNode.ts`
8. Migrate `TabNode.ts`

### Phase 4: Orchestrator
9. Migrate `Model.ts` - depends on all others

---

## Success Criteria

- [ ] All 9 target files have schema versions (prefix with `I` e.g., `IModel`)
- [ ] Legacy classes remain intact for backward compatibility
- [ ] Schema classes have identical public API (methods, return types)
- [ ] All uses of native `Map` converted to Effect patterns
- [ ] Type checking passes: `bun run check`
- [ ] No runtime regressions in flexlayout behavior

---

## Verification Commands

```bash
# Type check after each file
turbo run check --filter=@beep/ui

# Verify no circular dependencies introduced
bun run lint --filter=@beep/ui
```

---

## Notes for Agent

1. **Preserve Legacy Classes**: Keep existing classes marked with `/** @internal */` for backward compatibility during migration
2. **Incremental Migration**: Complete one file fully before moving to next
3. **Test Early**: Run `bun run check` after each file migration
4. **Abstract Class Challenge**: `Node.ts` is abstract - consider how to represent abstract schema classes (may need runtime checks instead of abstract methods)
5. **Circular Dependencies**: `Model` ↔ `Node` have circular references - handle carefully

---

## Related Documentation

- [EFFECT_PATTERNS.md](../../documentation/EFFECT_PATTERNS.md) - Effect coding patterns
- [packages/ui/ui/CLAUDE.md](../../packages/ui/ui/CLAUDE.md) - UI package guidelines
- Reference implementations: `Attribute.ts`, `AttributeDefinitions.ts`, `DockLocation.ts`, `Orientation.ts`, `Rect.ts`
