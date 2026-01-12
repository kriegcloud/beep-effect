# FlexLayout Schema Creation: Quick Start

> 5-minute guide to creating an Effect Schema class alongside an existing FlexLayout class.

---

## Important: This is Additive Work

**DO NOT modify original classes.** You are creating NEW schema classes (`IClassName`) alongside the existing classes. The originals stay exactly as they are.

---

## Pre-requisites

1. Read the reference implementations:
   - `packages/ui/ui/src/flexlayout-react/Attribute.ts` (IAttribute class)
   - `packages/ui/ui/src/flexlayout-react/AttributeDefinitions.ts` (IAttributeDefinitions class)
   - `packages/ui/ui/src/flexlayout-react/DockLocation.ts` (IDockLocation class)

2. Understand the target class structure by reading its source file

---

## Creation Steps (Per File)

### Step 1: Add Imports

```typescript
import { $UiId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as O from "effect/Option";
import * as S from "effect/Schema";
// Add other Effect imports as needed (A, Order, etc.)

const $I = $UiId.create("flexlayout-react/FileName");
```

### Step 2: Create Data Schema

Identify all instance fields and create a mutable struct:

```typescript
export class ClassNameData extends S.Struct({
  // String fields
  name: S.String,

  // Optional string fields
  alias: S.OptionFromUndefinedOr(S.String),

  // Boolean fields
  enabled: S.Boolean,

  // Number fields
  size: S.Number,

  // Arrays (mutable)
  items: S.mutable(S.Array(SomeSchema)),

  // Maps (mutable) - use BS.MutableHashMap from @beep/schema
  itemMap: BS.MutableHashMap({key: S.String, value: SomeSchema}),

  // Unknown/any type
  attributes: S.Unknown,
}).pipe(S.mutable).annotations(
  $I.annotations("ClassNameData", {
    description: "Mutable data for ClassName"
  })
) {}
```

### Step 3: Create Schema Class (Below Original Class)

Add this BELOW the existing class in the same file - do not modify the original:

```typescript
// Original class stays above - DO NOT MODIFY IT

export class IClassName extends S.Class<IClassName>($I`IClassName`)({
  data: ClassNameData
}) {
  // Private fields for runtime-only data (callbacks, DOM refs, self-refs)
  private _callback?: () => void;
  private _selfRef: O.Option<IClassName> = O.none();

  // Static factory
  static readonly new = (param1: string, param2: number) =>
    new IClassName({
      data: {
        name: param1,
        size: param2,
        alias: O.none(),
        enabled: true,
        items: [],
        itemMap: MutableHashMap.empty(),  // from effect/MutableHashMap
        attributes: {},
      }
    });

  // Add each method, using `this.data.fieldName` for access
  readonly getName = (): string => this.data.name;

  readonly setName = (value: string): this => {
    this.data.name = value;
    return this;
  }

  readonly getAlias = (): O.Option<string> => this.data.alias;
}
```

### Step 4: Verify

```bash
turbo run check --filter=@beep/ui
```

---

## Common Conversions

| Original | Schema Version |
|----------|----------------|
| `field: string \| undefined` | `field: S.OptionFromUndefinedOr(S.String)` |
| `field: any` | `field: S.Unknown` |
| `field: Map<K, V>` | `field: BS.MutableHashMap({key: K, value: V})` |
| `field: T[]` | `field: S.mutable(S.Array(T))` |
| `this.field` | `this.data.field` |
| `return this.field` (optional) | `return this.data.field` (returns Option) |

---

## Gotchas

1. **DO NOT modify original classes** - This is the most important rule
2. **Don't include callbacks/functions in schema** - Store as private instance fields
3. **Don't include DOM/Window refs in schema** - Store as private instance fields
4. **Self-referential types** - Store as `O.Option<IClassName>` private field
5. **Abstract methods** - Can't have abstract schema classes, use runtime checks
6. **Effect Array operations** - Use `A.map`, `A.filter`, `A.sort` not native methods
7. **Sorting** - Use `Order.mapInput(Order.string, fn)` not comparator functions

---

## File Order (Recommended)

1. `Actions.ts` - No dependencies, easiest
2. `Node.ts` - Base class, needed by others
3. `LayoutWindow.ts` - Simple, few deps
4. `BorderSet.ts` - Uses BorderNode
5. `BorderNode.ts` - Extends Node
6. `RowNode.ts` - Extends Node
7. `TabSetNode.ts` - Extends Node
8. `TabNode.ts` - Extends Node
9. `Model.ts` - Orchestrates all, do last
