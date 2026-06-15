---
title: CanvasProject.commands.ts
nav_order: 1
parent: "@beep/canvas-use-cases"
---

## CanvasProject.commands.ts overview

CanvasProject commands and queries.

Since v0.0.0

---
## Exports Grouped by Category
- [commands](#commands)
  - [AddCanvasNodeCommand (class)](#addcanvasnodecommand-class)
  - [ArchiveCanvasProjectCommand (class)](#archivecanvasprojectcommand-class)
  - [CreateCanvasProjectCommand (class)](#createcanvasprojectcommand-class)
  - [GetCanvasProjectQuery (class)](#getcanvasprojectquery-class)
  - [ListCanvasProjectsQuery (class)](#listcanvasprojectsquery-class)
  - [RemoveCanvasNodeCommand (class)](#removecanvasnodecommand-class)
  - [RestoreCanvasProjectCommand (class)](#restorecanvasprojectcommand-class)
---

# commands

## AddCanvasNodeCommand (class)

Add CanvasNode command.

**Example**

```ts
import * as DomainCanvasProject from "@beep/canvas-domain/aggregates/CanvasProject"
import { CanvasProject } from "@beep/canvas-use-cases/public"
import { Effect } from "effect"
import * as S from "effect/Schema"

const commandEffect = Effect.gen(function* () {
  const id = yield* S.decodeUnknownEffect(DomainCanvasProject.CanvasProjectId)("scene-1")
  const nodeId = yield* S.decodeUnknownEffect(DomainCanvasProject.CanvasNodeId)("node-1")
  const label = yield* S.decodeUnknownEffect(DomainCanvasProject.CanvasNodeLabel)("Opening note")
  const node = DomainCanvasProject.CanvasNode.make({ id: nodeId, kind: "note", label })
  return CanvasProject.AddCanvasNodeCommand.make({ id, node })
})
```

**Signature**

```ts
declare class AddCanvasNodeCommand
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/use-cases/src/aggregates/CanvasProject/CanvasProject.commands.ts#L129)

Since v0.0.0

## ArchiveCanvasProjectCommand (class)

Archive CanvasProject command.

**Example**

```ts
import * as DomainCanvasProject from "@beep/canvas-domain/aggregates/CanvasProject"
import { CanvasProject } from "@beep/canvas-use-cases/public"
import { Effect } from "effect"
import * as S from "effect/Schema"

const commandEffect = S.decodeUnknownEffect(DomainCanvasProject.CanvasProjectId)("scene-1").pipe(
  Effect.map((id) => CanvasProject.ArchiveCanvasProjectCommand.make({ id }))
)
```

**Signature**

```ts
declare class ArchiveCanvasProjectCommand
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/use-cases/src/aggregates/CanvasProject/CanvasProject.commands.ts#L97)

Since v0.0.0

## CreateCanvasProjectCommand (class)

Create CanvasProject command.

**Example**

```ts
import * as DomainCanvasProject from "@beep/canvas-domain/aggregates/CanvasProject"
import { CanvasProject } from "@beep/canvas-use-cases/public"
import { Effect } from "effect"
import * as S from "effect/Schema"

const commandEffect = Effect.gen(function* () {
  const id = yield* S.decodeUnknownEffect(DomainCanvasProject.CanvasProjectId)("scene-1")
  const title = yield* S.decodeUnknownEffect(DomainCanvasProject.CanvasProjectTitle)("Scene 1")
  return CanvasProject.CreateCanvasProjectCommand.make({ id, title })
})
```

**Signature**

```ts
declare class CreateCanvasProjectCommand
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/use-cases/src/aggregates/CanvasProject/CanvasProject.commands.ts#L37)

Since v0.0.0

## GetCanvasProjectQuery (class)

Get CanvasProject query.

**Example**

```ts
import * as DomainCanvasProject from "@beep/canvas-domain/aggregates/CanvasProject"
import { CanvasProject } from "@beep/canvas-use-cases/public"
import { Effect } from "effect"
import * as S from "effect/Schema"

const queryEffect = S.decodeUnknownEffect(DomainCanvasProject.CanvasProjectId)("scene-1").pipe(
  Effect.map((id) => CanvasProject.GetCanvasProjectQuery.make({ id }))
)
```

**Signature**

```ts
declare class GetCanvasProjectQuery
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/use-cases/src/aggregates/CanvasProject/CanvasProject.commands.ts#L189)

Since v0.0.0

## ListCanvasProjectsQuery (class)

List CanvasProjects query.

**Example**

```ts
import { CanvasProject } from "@beep/canvas-use-cases/public"

const query = CanvasProject.ListCanvasProjectsQuery.make({})
```

**Signature**

```ts
declare class ListCanvasProjectsQuery
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/use-cases/src/aggregates/CanvasProject/CanvasProject.commands.ts#L212)

Since v0.0.0

## RemoveCanvasNodeCommand (class)

Remove CanvasNode command.

**Example**

```ts
import * as DomainCanvasProject from "@beep/canvas-domain/aggregates/CanvasProject"
import { CanvasProject } from "@beep/canvas-use-cases/public"
import { Effect } from "effect"
import * as S from "effect/Schema"

const commandEffect = Effect.gen(function* () {
  const id = yield* S.decodeUnknownEffect(DomainCanvasProject.CanvasProjectId)("scene-1")
  const nodeId = yield* S.decodeUnknownEffect(DomainCanvasProject.CanvasNodeId)("node-1")
  return CanvasProject.RemoveCanvasNodeCommand.make({ id, nodeId })
})
```

**Signature**

```ts
declare class RemoveCanvasNodeCommand
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/use-cases/src/aggregates/CanvasProject/CanvasProject.commands.ts#L160)

Since v0.0.0

## RestoreCanvasProjectCommand (class)

Restore CanvasProject command.

**Example**

```ts
import * as DomainCanvasProject from "@beep/canvas-domain/aggregates/CanvasProject"
import { CanvasProject } from "@beep/canvas-use-cases/public"
import { Effect } from "effect"
import * as S from "effect/Schema"

const commandEffect = Effect.gen(function* () {
  const id = yield* S.decodeUnknownEffect(DomainCanvasProject.CanvasProjectId)("scene-1")
  const title = yield* S.decodeUnknownEffect(DomainCanvasProject.CanvasProjectTitle)("Scene 1")
  const scene = DomainCanvasProject.create(DomainCanvasProject.CreateCanvasProjectInput.make({ id, title }))
  return CanvasProject.RestoreCanvasProjectCommand.make({ scene })
})
```

**Signature**

```ts
declare class RestoreCanvasProjectCommand
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/use-cases/src/aggregates/CanvasProject/CanvasProject.commands.ts#L69)

Since v0.0.0