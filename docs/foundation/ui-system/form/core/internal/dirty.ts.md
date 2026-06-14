---
title: dirty.ts
nav_order: 7
parent: "@beep/form"
---

## dirty.ts overview

Dirty-field recalculation helpers for nested form values.

Since v0.0.0

---
## Exports Grouped by Category
- [utilities](#utilities)
  - [recalculateDirtyFieldsForArray](#recalculatedirtyfieldsforarray)
  - [recalculateDirtySubtree](#recalculatedirtysubtree)
---

# utilities

## recalculateDirtyFieldsForArray

Recalculates dirty paths for an array field after item changes.

**Example**

```ts
import { recalculateDirtyFieldsForArray } from "@beep/form/core/internal/dirty"
import * as HashSet from "effect/HashSet"

const dirty = recalculateDirtyFieldsForArray({
  dirtyFields: HashSet.empty(),
  initialValues: { items: [] },
  arrayPath: "items",
  newItems: ["A"]
})
console.log(HashSet.has(dirty, "items")) // true
```

**Signature**

```ts
declare const recalculateDirtyFieldsForArray: ({ dirtyFields, initialValues, arrayPath, newItems, }: { dirtyFields: HashSet.HashSet<string>; initialValues: unknown; arrayPath: string; newItems: ReadonlyArray<unknown>; }) => HashSet.HashSet<string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/form/src/core/internal/dirty.ts#L38)

Since v0.0.0

## recalculateDirtySubtree

Recalculates dirty paths below a root path.

**Example**

```ts
import { recalculateDirtySubtree } from "@beep/form/core/internal/dirty"
import * as HashSet from "effect/HashSet"

const dirty = recalculateDirtySubtree({
  currentDirty: HashSet.empty(),
  allInitial: { name: "A" },
  allValues: { name: "B" },
  rootPath: "name"
})
console.log(HashSet.has(dirty, "name")) // true
```

**Signature**

```ts
declare const recalculateDirtySubtree: ({ currentDirty, allInitial, allValues, rootPath, }: { currentDirty: HashSet.HashSet<string>; allInitial: unknown; allValues: unknown; rootPath?: string; }) => HashSet.HashSet<string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/form/src/core/internal/dirty.ts#L102)

Since v0.0.0