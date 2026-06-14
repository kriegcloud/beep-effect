---
title: CanvasProject.model.ts
nav_order: 2
parent: "@beep/canvas-domain"
---

## CanvasProject.model.ts overview

CanvasProject aggregate model.

Since v0.0.0

---
## Exports Grouped by Category
- [aggregates](#aggregates)
  - [ArchivedCanvasProject (class)](#archivedcanvasproject-class)
  - [CanvasNode (class)](#canvasnode-class)
  - [CanvasProject](#canvasproject)
  - [CanvasProject (type alias)](#canvasproject-type-alias)
  - [CreateCanvasProjectInput (class)](#createcanvasprojectinput-class)
  - [OpenCanvasProject (class)](#opencanvasproject-class)
  - [addNode](#addnode)
  - [archive](#archive)
  - [create](#create)
  - [removeNode](#removenode)
  - [reopen](#reopen)
---

# aggregates

## ArchivedCanvasProject (class)

Archived scene container aggregate for the bootstrap canvas slice.

**Example**

```ts
import { ArchivedCanvasProject } from "@beep/canvas-domain/aggregates/CanvasProject"

console.log(ArchivedCanvasProject)
```

**Signature**

```ts
declare class ArchivedCanvasProject
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/domain/src/aggregates/CanvasProject/CanvasProject.model.ts#L95)

Since v0.0.0

## CanvasNode (class)

Lightweight node metadata stored inside a bootstrap canvas scene.

**Example**

```ts
import { CanvasNode } from "@beep/canvas-domain/aggregates/CanvasProject"

console.log(CanvasNode)
```

**Signature**

```ts
declare class CanvasNode
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/domain/src/aggregates/CanvasProject/CanvasProject.model.ts#L44)

Since v0.0.0

## CanvasProject

CanvasProject aggregate.

**Example**

```ts
import { CanvasProject } from "@beep/canvas-domain/aggregates/CanvasProject"

console.log(CanvasProject)
```

**Signature**

```ts
declare const CanvasProject: AnnotatedSchema<S.Union<readonly [typeof OpenCanvasProject, typeof ArchivedCanvasProject]> & TaggedUnionUtils<"status", readonly [typeof OpenCanvasProject, typeof ArchivedCanvasProject], [typeof OpenCanvasProject, typeof ArchivedCanvasProject]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/domain/src/aggregates/CanvasProject/CanvasProject.model.ts#L121)

Since v0.0.0

## CanvasProject (type alias)

CanvasProject aggregate type.

**Signature**

```ts
type CanvasProject = typeof CanvasProject.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/domain/src/aggregates/CanvasProject/CanvasProject.model.ts#L137)

Since v0.0.0

## CreateCanvasProjectInput (class)

CanvasProject creation input.

**Example**

```ts
import { CreateCanvasProjectInput } from "@beep/canvas-domain/aggregates/CanvasProject"

console.log(CreateCanvasProjectInput)
```

**Signature**

```ts
declare class CreateCanvasProjectInput
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/domain/src/aggregates/CanvasProject/CanvasProject.model.ts#L155)

Since v0.0.0

## OpenCanvasProject (class)

Open scene container aggregate for the bootstrap canvas slice.

**Example**

```ts
import { OpenCanvasProject } from "@beep/canvas-domain/aggregates/CanvasProject"

console.log(OpenCanvasProject)
```

**Signature**

```ts
declare class OpenCanvasProject
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/domain/src/aggregates/CanvasProject/CanvasProject.model.ts#L69)

Since v0.0.0

## addNode

Add lightweight node metadata to an open CanvasProject.

**Example**

```ts
import { addNode } from "@beep/canvas-domain/aggregates/CanvasProject"

console.log(addNode)
```

**Signature**

```ts
declare const addNode: (canvasProject: OpenCanvasProject | ArchivedCanvasProject, canvasNode: CanvasNode) => Effect.Effect<OpenCanvasProject, CanvasProjectAlreadyArchived | CanvasNodeAlreadyExists, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/domain/src/aggregates/CanvasProject/CanvasProject.model.ts#L216)

Since v0.0.0

## archive

Archive any non-archived CanvasProject.

**Example**

```ts
import { archive } from "@beep/canvas-domain/aggregates/CanvasProject"

console.log(archive)
```

**Signature**

```ts
declare const archive: (canvasProject: OpenCanvasProject | ArchivedCanvasProject) => Effect.Effect<ArchivedCanvasProject, CanvasProjectAlreadyArchived, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/domain/src/aggregates/CanvasProject/CanvasProject.model.ts#L278)

Since v0.0.0

## create

Create a new open CanvasProject aggregate.

**Example**

```ts
import { create } from "@beep/canvas-domain/aggregates/CanvasProject"

console.log(create)
```

**Signature**

```ts
declare const create: (input: CreateCanvasProjectInput) => CanvasProject
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/domain/src/aggregates/CanvasProject/CanvasProject.model.ts#L184)

Since v0.0.0

## removeNode

Remove lightweight node metadata from an open CanvasProject.

**Example**

```ts
import { removeNode } from "@beep/canvas-domain/aggregates/CanvasProject"

console.log(removeNode)
```

**Signature**

```ts
declare const removeNode: (canvasProject: OpenCanvasProject | ArchivedCanvasProject, canvasNodeId: string & Brand<"CanvasNodeId">) => Effect.Effect<OpenCanvasProject, CanvasProjectAlreadyArchived | CanvasNodeNotFound, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/domain/src/aggregates/CanvasProject/CanvasProject.model.ts#L247)

Since v0.0.0

## reopen

Reopen an archived CanvasProject.

**Example**

```ts
import { reopen } from "@beep/canvas-domain/aggregates/CanvasProject"

console.log(reopen)
```

**Signature**

```ts
declare const reopen: (canvasProject: OpenCanvasProject | ArchivedCanvasProject) => Effect.Effect<OpenCanvasProject | ArchivedCanvasProject, CanvasProjectInvalidTransition, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/domain/src/aggregates/CanvasProject/CanvasProject.model.ts#L299)

Since v0.0.0