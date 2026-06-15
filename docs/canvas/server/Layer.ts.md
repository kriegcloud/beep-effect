---
title: Layer.ts
nav_order: 8
parent: "@beep/canvas-server"
---

## Layer.ts overview

Canvas server layer.

Since v0.0.0

---
## Exports Grouped by Category
- [layers](#layers)
  - [CanvasProjectServer](#canvasprojectserver)
  - [CanvasServerLive](#canvasserverlive)
---

# layers

## CanvasProjectServer

Canvas project server service tag.

**Example**

```ts
import { CanvasProjectServer } from "@beep/canvas-server/layer"

console.log(CanvasProjectServer)
```

**Signature**

```ts
declare const CanvasProjectServer: typeof CanvasProjectServer
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/server/src/Layer.ts#L24)

Since v0.0.0

## CanvasServerLive

Live canvas server layer.

**Example**

```ts
import { CanvasServerLive } from "@beep/canvas-server/layer"

console.log(CanvasServerLive)
```

**Signature**

```ts
declare const CanvasServerLive: Layer<CanvasProjectServer, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/server/src/Layer.ts#L39)

Since v0.0.0