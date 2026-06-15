---
title: Canvas.ts
nav_order: 6
parent: "@beep/canvas-domain"
---

## Canvas.ts overview

Canvas slice-local entity identifiers.

Since v0.0.0

---
## Exports Grouped by Category
- [entity-ids](#entity-ids)
  - [CanvasOperatorId](#canvasoperatorid)
  - [CanvasOperatorId (type alias)](#canvasoperatorid-type-alias)
---

# entity-ids

## CanvasOperatorId

Canvas operator entity identifier.

**Example**

```ts
import { CanvasOperatorId } from "@beep/canvas-domain/identity/Canvas"

console.log(CanvasOperatorId)
```

**Signature**

```ts
declare const CanvasOperatorId: EntityId.EntityId<"canvas", "operator", "canvas_operator", "canvas.operator", "CanvasOperator", "CanvasOperatorId">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/domain/src/identity/Canvas.ts#L28)

Since v0.0.0

## CanvasOperatorId (type alias)

Runtime type for `CanvasOperatorId`.

**Signature**

```ts
type CanvasOperatorId = typeof CanvasOperatorId.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/domain/src/identity/Canvas.ts#L38)

Since v0.0.0