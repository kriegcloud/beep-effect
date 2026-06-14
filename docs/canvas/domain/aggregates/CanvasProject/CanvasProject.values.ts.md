---
title: CanvasProject.values.ts
nav_order: 3
parent: "@beep/canvas-domain"
---

## CanvasProject.values.ts overview

CanvasProject value objects.

Since v0.0.0

---
## Exports Grouped by Category
- [value-objects](#value-objects)
  - [CanvasNodeId](#canvasnodeid)
  - [CanvasNodeId (type alias)](#canvasnodeid-type-alias)
  - [CanvasNodeKind](#canvasnodekind)
  - [CanvasNodeKind (type alias)](#canvasnodekind-type-alias)
  - [CanvasNodeLabel](#canvasnodelabel)
  - [CanvasNodeLabel (type alias)](#canvasnodelabel-type-alias)
  - [CanvasProjectId](#canvasprojectid)
  - [CanvasProjectId (type alias)](#canvasprojectid-type-alias)
  - [CanvasProjectStatus](#canvasprojectstatus)
  - [CanvasProjectStatus (type alias)](#canvasprojectstatus-type-alias)
  - [CanvasProjectTitle](#canvasprojecttitle)
  - [CanvasProjectTitle (type alias)](#canvasprojecttitle-type-alias)
---

# value-objects

## CanvasNodeId

CanvasNode identity.

**Example**

```ts
import { CanvasNodeId } from "@beep/canvas-domain/aggregates/CanvasProject"

console.log(CanvasNodeId)
```

**Signature**

```ts
declare const CanvasNodeId: AnnotatedSchema<S.brand<S.String, "CanvasNodeId">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/domain/src/aggregates/CanvasProject/CanvasProject.values.ts#L115)

Since v0.0.0

## CanvasNodeId (type alias)

CanvasNode identity type.

**Signature**

```ts
type CanvasNodeId = typeof CanvasNodeId.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/domain/src/aggregates/CanvasProject/CanvasProject.values.ts#L130)

Since v0.0.0

## CanvasNodeKind

Bootstrap CanvasNode kinds.

**Example**

```ts
import { CanvasNodeKind } from "@beep/canvas-domain/aggregates/CanvasProject"

console.log(CanvasNodeKind)
```

**Signature**

```ts
declare const CanvasNodeKind: AnnotatedSchema<LiteralKit<readonly ["note", "shape", "asset"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/domain/src/aggregates/CanvasProject/CanvasProject.values.ts#L145)

Since v0.0.0

## CanvasNodeKind (type alias)

Bootstrap CanvasNode kind.

**Signature**

```ts
type CanvasNodeKind = typeof CanvasNodeKind.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/domain/src/aggregates/CanvasProject/CanvasProject.values.ts#L158)

Since v0.0.0

## CanvasNodeLabel

CanvasNode label.

**Example**

```ts
import { CanvasNodeLabel } from "@beep/canvas-domain/aggregates/CanvasProject"

console.log(CanvasNodeLabel)
```

**Signature**

```ts
declare const CanvasNodeLabel: AnnotatedSchema<S.NonEmptyString>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/domain/src/aggregates/CanvasProject/CanvasProject.values.ts#L173)

Since v0.0.0

## CanvasNodeLabel (type alias)

CanvasNode label type.

**Signature**

```ts
type CanvasNodeLabel = typeof CanvasNodeLabel.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/domain/src/aggregates/CanvasProject/CanvasProject.values.ts#L187)

Since v0.0.0

## CanvasProjectId

CanvasProject identity.

**Example**

```ts
import { CanvasProjectId } from "@beep/canvas-domain/aggregates/CanvasProject"

console.log(CanvasProjectId)
```

**Signature**

```ts
declare const CanvasProjectId: AnnotatedSchema<S.brand<S.String, "CanvasProjectId">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/domain/src/aggregates/CanvasProject/CanvasProject.values.ts#L28)

Since v0.0.0

## CanvasProjectId (type alias)

CanvasProject identity type.

**Signature**

```ts
type CanvasProjectId = typeof CanvasProjectId.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/domain/src/aggregates/CanvasProject/CanvasProject.values.ts#L43)

Since v0.0.0

## CanvasProjectStatus

CanvasProject lifecycle values.

**Example**

```ts
import { CanvasProjectStatus } from "@beep/canvas-domain/aggregates/CanvasProject"

console.log(CanvasProjectStatus)
```

**Signature**

```ts
declare const CanvasProjectStatus: AnnotatedSchema<LiteralKit<readonly ["open", "archived"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/domain/src/aggregates/CanvasProject/CanvasProject.values.ts#L87)

Since v0.0.0

## CanvasProjectStatus (type alias)

CanvasProject lifecycle value.

**Signature**

```ts
type CanvasProjectStatus = typeof CanvasProjectStatus.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/domain/src/aggregates/CanvasProject/CanvasProject.values.ts#L100)

Since v0.0.0

## CanvasProjectTitle

CanvasProject title.

**Example**

```ts
import { CanvasProjectTitle } from "@beep/canvas-domain/aggregates/CanvasProject"

console.log(CanvasProjectTitle)
```

**Signature**

```ts
declare const CanvasProjectTitle: AnnotatedSchema<S.NonEmptyString>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/domain/src/aggregates/CanvasProject/CanvasProject.values.ts#L58)

Since v0.0.0

## CanvasProjectTitle (type alias)

CanvasProject title type.

**Signature**

```ts
type CanvasProjectTitle = typeof CanvasProjectTitle.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/domain/src/aggregates/CanvasProject/CanvasProject.values.ts#L72)

Since v0.0.0