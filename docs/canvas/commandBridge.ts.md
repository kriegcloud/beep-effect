---
title: commandBridge.ts
nav_order: 1
parent: "@beep/canvas"
---

## commandBridge.ts overview

App-local canvas command bridge.

Since v0.0.0

---
## Exports Grouped by Category
- [commands](#commands)
  - [CanvasCommandBridgeEffect (type alias)](#canvascommandbridgeeffect-type-alias)
  - [CanvasCommandName](#canvascommandname)
  - [CanvasCommandRuntime (type alias)](#canvascommandruntime-type-alias)
  - [commandSurface](#commandsurface)
  - [decodeCanvasNodeId](#decodecanvasnodeid)
  - [decodeCanvasNodeKind](#decodecanvasnodekind)
  - [decodeCanvasProjectId](#decodecanvasprojectid)
  - [makeCanvasCommandBridge](#makecanvascommandbridge)
  - [makeCanvasCommandRuntime](#makecanvascommandruntime)
  - [makeNativeCanvasCommandBridge](#makenativecanvascommandbridge)
  - [makePreviewCanvasCommandBridge](#makepreviewcanvascommandbridge)
  - [previewHealth](#previewhealth)
- [errors](#errors)
  - [CanvasCommandError (class)](#canvascommanderror-class)
- [models](#models)
  - [CanvasCommandName (type alias)](#canvascommandname-type-alias)
  - [CanvasHealth (class)](#canvashealth-class)
  - [CanvasScene](#canvasscene)
  - [CanvasScene (type alias)](#canvasscene-type-alias)
  - [CanvasSceneNode](#canvasscenenode)
  - [CanvasSceneNode (type alias)](#canvasscenenode-type-alias)
  - [SceneLoadRequest (class)](#sceneloadrequest-class)
  - [SceneSaveRequest (class)](#scenesaverequest-class)
---

# commands

## CanvasCommandBridgeEffect (type alias)

Effect that builds or runs against the app-local canvas command bridge.

**Example**

```ts
import { makePreviewCanvasCommandBridge } from "@beep/canvas"
import type { CanvasCommandBridgeEffect } from "@beep/canvas"

const bridgeEffect: CanvasCommandBridgeEffect = makePreviewCanvasCommandBridge
```

**Signature**

```ts
type CanvasCommandBridgeEffect<A> = Effect.Effect<
  A,
  CanvasCommandError,
  CanvasProjectServer
>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/canvas/src/commandBridge.ts#L500)

Since v0.0.0

## CanvasCommandName

Native command name schema for the canvas app shell.

**Example**

```ts
import { CanvasCommandName } from "@beep/canvas"
import * as S from "effect/Schema"

const decodeCommandName = S.decodeUnknownEffect(CanvasCommandName)
```

**Signature**

```ts
declare const CanvasCommandName: AnnotatedSchema<LiteralKit<readonly ["canvas_health", "scene_create", "scene_list", "scene_get", "scene_archive", "scene_node_add", "scene_node_remove", "scene_save", "scene_load"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/canvas/src/commandBridge.ts#L92)

Since v0.0.0

## CanvasCommandRuntime (type alias)

Runtime returned by `makeCanvasCommandRuntime`.

**Example**

```ts
import { makeCanvasCommandRuntime } from "@beep/canvas"
import type { CanvasCommandRuntime } from "@beep/canvas"

const runtime: CanvasCommandRuntime = makeCanvasCommandRuntime()
console.log(runtime.dispose())
```

**Signature**

```ts
type CanvasCommandRuntime = ReturnType<typeof makeCanvasCommandRuntime>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/canvas/src/commandBridge.ts#L51)

Since v0.0.0

## commandSurface

Native command names exposed by the canvas app shell.

**Example**

```ts
import { commandSurface } from "@beep/canvas"

const exposesSave = commandSurface.includes("scene_save")
```

**Signature**

```ts
declare const commandSurface: readonly ["canvas_health", "scene_create", "scene_list", "scene_get", "scene_archive", "scene_node_add", "scene_node_remove", "scene_save", "scene_load"]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/canvas/src/commandBridge.ts#L66)

Since v0.0.0

## decodeCanvasNodeId

Decode a user-provided string into a canvas node identifier.

**Example**

```ts
import { decodeCanvasNodeId } from "@beep/canvas"

const idEffect = decodeCanvasNodeId("node-1")
```

**Signature**

```ts
declare const decodeCanvasNodeId: (id: string) => Effect.Effect<DomainCanvasProject.CanvasNodeId, CanvasCommandError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/canvas/src/commandBridge.ts#L539)

Since v0.0.0

## decodeCanvasNodeKind

Decode a user-provided value into a canvas node kind.

**Example**

```ts
import { decodeCanvasNodeKind } from "@beep/canvas"

const kindEffect = decodeCanvasNodeKind("note")
```

**Signature**

```ts
declare const decodeCanvasNodeKind: (kind: unknown) => Effect.Effect<DomainCanvasProject.CanvasNodeKind, CanvasCommandError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/canvas/src/commandBridge.ts#L557)

Since v0.0.0

## decodeCanvasProjectId

Decode a user-provided string into a canvas project identifier.

**Example**

```ts
import { decodeCanvasProjectId } from "@beep/canvas"

const idEffect = decodeCanvasProjectId("scene-1")
```

**Signature**

```ts
declare const decodeCanvasProjectId: (id: string) => Effect.Effect<DomainCanvasProject.CanvasProjectId, CanvasCommandError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/canvas/src/commandBridge.ts#L519)

Since v0.0.0

## makeCanvasCommandBridge

Build the default app command bridge.

**Example**

```ts
import { makeCanvasCommandBridge } from "@beep/canvas"

const bridgeEffect = makeCanvasCommandBridge
```

**Signature**

```ts
declare const makeCanvasCommandBridge: CanvasCommandBridgeEffect<CanvasCommandBridge>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/canvas/src/commandBridge.ts#L695)

Since v0.0.0

## makeCanvasCommandRuntime

Managed runtime for app-local canvas command effects.

**Example**

```ts
import { makeCanvasCommandRuntime } from "@beep/canvas"

const runtime = makeCanvasCommandRuntime()
console.log(runtime.dispose())
```

**Signature**

```ts
declare const makeCanvasCommandRuntime: () => ManagedRuntime.ManagedRuntime<CanvasProjectServer, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/canvas/src/commandBridge.ts#L34)

Since v0.0.0

## makeNativeCanvasCommandBridge

Build the desktop bridge: Tauri owns only app-local OS/file IO while scene
mutations stay in the public CanvasProject use-case contract.

**Example**

```ts
import { makeNativeCanvasCommandBridge } from "@beep/canvas"

const bridgeEffect = makeNativeCanvasCommandBridge()
```

**Signature**

```ts
declare const makeNativeCanvasCommandBridge: (invoke?: NativeInvoke) => CanvasCommandBridgeEffect
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/canvas/src/commandBridge.ts#L671)

Since v0.0.0

## makePreviewCanvasCommandBridge

Build a browser-safe preview bridge backed by the public CanvasProject use-case contract.

**Example**

```ts
import { makePreviewCanvasCommandBridge } from "@beep/canvas"

const bridgeEffect = makePreviewCanvasCommandBridge
```

**Signature**

```ts
declare const makePreviewCanvasCommandBridge: CanvasCommandBridgeEffect<CanvasCommandBridge>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/canvas/src/commandBridge.ts#L577)

Since v0.0.0

## previewHealth

Browser preview health payload.

**Example**

```ts
import { previewHealth } from "@beep/canvas"

console.log(previewHealth.status)
```

**Signature**

```ts
declare const previewHealth: CanvasHealth
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/canvas/src/commandBridge.ts#L335)

Since v0.0.0

# errors

## CanvasCommandError (class)

App command bridge failure.

**Example**

```ts
import { CanvasCommandError } from "@beep/canvas"

const error = CanvasCommandError.make({ message: "Canvas bridge is offline." })
```

**Signature**

```ts
declare class CanvasCommandError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/canvas/src/commandBridge.ts#L355)

Since v0.0.0

# models

## CanvasCommandName (type alias)

Type for `CanvasCommandName`.

**Example**

```ts
import type { CanvasCommandName } from "@beep/canvas"

const commandName: CanvasCommandName = "canvas_health"
```

**Signature**

```ts
type CanvasCommandName = typeof CanvasCommandName.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/canvas/src/commandBridge.ts#L111)

Since v0.0.0

## CanvasHealth (class)

Canvas shell health payload.

**Example**

```ts
import { CanvasHealth } from "@beep/canvas"

const health = new CanvasHealth({
  app: "@beep/canvas",
  commandSurface: ["canvas_health"],
  persistence: "app-local-json",
  status: "preview",
})
```

**Signature**

```ts
declare class CanvasHealth
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/canvas/src/commandBridge.ts#L137)

Since v0.0.0

## CanvasScene

Serializable scene shape crossing the app command bridge.

**Example**

```ts
import { CanvasScene } from "@beep/canvas"
import * as S from "effect/Schema"

const decodeScene = S.decodeUnknownEffect(CanvasScene)
```

**Signature**

```ts
declare const CanvasScene: AnnotatedSchema<S.Union<readonly [typeof OpenCanvasProject, typeof ArchivedCanvasProject]> & TaggedUnionUtils<"status", readonly [typeof OpenCanvasProject, typeof ArchivedCanvasProject], [typeof OpenCanvasProject, typeof ArchivedCanvasProject]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/canvas/src/commandBridge.ts#L165)

Since v0.0.0

## CanvasScene (type alias)

Type for `CanvasScene`.

**Example**

```ts
import { decodeCanvasProjectId } from "@beep/canvas"
import type { CanvasScene } from "@beep/canvas"
import { Effect } from "effect"

const sceneEffect = Effect.gen(function* () {
  const id = yield* decodeCanvasProjectId("scene-1")
  return {
    id,
    title: "Scene 1",
    status: "open",
    nodes: [],
  } satisfies CanvasScene
})
```

**Signature**

```ts
type CanvasScene = typeof CanvasScene.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/canvas/src/commandBridge.ts#L190)

Since v0.0.0

## CanvasSceneNode

Serializable node shape crossing the app command bridge.

**Example**

```ts
import { CanvasSceneNode } from "@beep/canvas"
import * as S from "effect/Schema"

const decodeNode = S.decodeUnknownEffect(CanvasSceneNode)
```

**Signature**

```ts
declare const CanvasSceneNode: typeof DomainCanvasProject.CanvasNode
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/canvas/src/commandBridge.ts#L206)

Since v0.0.0

## CanvasSceneNode (type alias)

Type for `CanvasSceneNode`.

**Example**

```ts
import { decodeCanvasNodeId } from "@beep/canvas"
import type { CanvasSceneNode } from "@beep/canvas"
import { Effect } from "effect"

const nodeEffect = Effect.gen(function* () {
  const id = yield* decodeCanvasNodeId("node-1")
  return {
    id,
    kind: "note",
    label: "Opening note",
  } satisfies CanvasSceneNode
})
```

**Signature**

```ts
type CanvasSceneNode = typeof CanvasSceneNode.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/canvas/src/commandBridge.ts#L230)

Since v0.0.0

## SceneLoadRequest (class)

Scene load request.

**Example**

```ts
import { SceneLoadRequest } from "@beep/canvas"

const request = new SceneLoadRequest({ path: "scene-1.json" })
```

**Signature**

```ts
declare class SceneLoadRequest
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/canvas/src/commandBridge.ts#L280)

Since v0.0.0

## SceneSaveRequest (class)

Scene save request.

**Example**

```ts
import { decodeCanvasProjectId, SceneSaveRequest } from "@beep/canvas"
import type { CanvasScene } from "@beep/canvas"
import { Effect } from "effect"

const requestEffect = Effect.gen(function* () {
  const id = yield* decodeCanvasProjectId("scene-1")
  const scene = {
    id,
    title: "Scene 1",
    status: "open",
    nodes: [],
  } satisfies CanvasScene
  return new SceneSaveRequest({ path: "scene-1.json", scene })
})
```

**Signature**

```ts
declare class SceneSaveRequest
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/canvas/src/commandBridge.ts#L256)

Since v0.0.0