---
title: CanvasProject.layer.ts
nav_order: 2
parent: "@beep/canvas-server"
---

## CanvasProject.layer.ts overview

CanvasProject server layer.

Since v0.0.0

---
## Exports Grouped by Category
- [layers](#layers)
  - [CanvasProjectServer (class)](#canvasprojectserver-class)
  - [CanvasProjectServerLayer](#canvasprojectserverlayer)
  - [makeCanvasProjectServer](#makecanvasprojectserver)
---

# layers

## CanvasProjectServer (class)

CanvasProject server facade service.

**Example**

```ts
import { CanvasProjectServer } from "@beep/canvas-server/aggregates/CanvasProject"

console.log(CanvasProjectServer)
```

**Signature**

```ts
declare class CanvasProjectServer
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/server/src/aggregates/CanvasProject/CanvasProject.layer.ts#L48)

Since v0.0.0

## CanvasProjectServerLayer

Config-dependent CanvasProject server layer.

**Example**

```ts
import { CanvasProjectServerLayer } from "@beep/canvas-server/aggregates/CanvasProject"

console.log(CanvasProjectServerLayer)
```

**Signature**

```ts
declare const CanvasProjectServerLayer: Layer.Layer<CanvasProjectServer, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/server/src/aggregates/CanvasProject/CanvasProject.layer.ts#L66)

Since v0.0.0

## makeCanvasProjectServer

Build the CanvasProject server facade.

**Example**

```ts
import { makeCanvasProjectServer } from "@beep/canvas-server/aggregates/CanvasProject"

console.log(makeCanvasProjectServer)
```

**Signature**

```ts
declare const makeCanvasProjectServer: () => Effect.Effect<CanvasProjectUseCaseServer.CanvasProject.CanvasProjectUseCasesShape, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/server/src/aggregates/CanvasProject/CanvasProject.layer.ts#L30)

Since v0.0.0