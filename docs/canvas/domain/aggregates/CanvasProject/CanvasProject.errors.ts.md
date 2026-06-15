---
title: CanvasProject.errors.ts
nav_order: 1
parent: "@beep/canvas-domain"
---

## CanvasProject.errors.ts overview

CanvasProject domain errors.

Since v0.0.0

---
## Exports Grouped by Category
- [errors](#errors)
  - [CanvasNodeAlreadyExists (class)](#canvasnodealreadyexists-class)
  - [CanvasNodeNotFound (class)](#canvasnodenotfound-class)
  - [CanvasProjectAlreadyArchived (class)](#canvasprojectalreadyarchived-class)
  - [CanvasProjectDomainError](#canvasprojectdomainerror)
  - [CanvasProjectDomainError (type alias)](#canvasprojectdomainerror-type-alias)
  - [CanvasProjectInvalidTransition (class)](#canvasprojectinvalidtransition-class)
    - [fromStatus (static method)](#fromstatus-static-method)
---

# errors

## CanvasNodeAlreadyExists (class)

Failure raised when a CanvasNode id is already present in a CanvasProject.

**Example**

```ts
import { CanvasNodeAlreadyExists } from "@beep/canvas-domain/aggregates/CanvasProject"

console.log(CanvasNodeAlreadyExists)
```

**Signature**

```ts
declare class CanvasNodeAlreadyExists
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/domain/src/aggregates/CanvasProject/CanvasProject.errors.ts#L101)

Since v0.0.0

## CanvasNodeNotFound (class)

Failure raised when a CanvasNode id is absent from a CanvasProject.

**Example**

```ts
import { CanvasNodeNotFound } from "@beep/canvas-domain/aggregates/CanvasProject"

console.log(CanvasNodeNotFound)
```

**Signature**

```ts
declare class CanvasNodeNotFound
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/domain/src/aggregates/CanvasProject/CanvasProject.errors.ts#L126)

Since v0.0.0

## CanvasProjectAlreadyArchived (class)

Failure raised when a command attempts to mutate an archived CanvasProject.

**Example**

```ts
import { CanvasProjectAlreadyArchived } from "@beep/canvas-domain/aggregates/CanvasProject"

console.log(CanvasProjectAlreadyArchived)
```

**Signature**

```ts
declare class CanvasProjectAlreadyArchived
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/domain/src/aggregates/CanvasProject/CanvasProject.errors.ts#L29)

Since v0.0.0

## CanvasProjectDomainError

CanvasProject aggregate domain failure schema.

**Example**

```ts
import { CanvasProjectDomainError } from "@beep/canvas-domain/aggregates/CanvasProject"

console.log(CanvasProjectDomainError)
```

**Signature**

```ts
declare const CanvasProjectDomainError: AnnotatedSchema<S.Union<readonly [typeof CanvasProjectAlreadyArchived, typeof CanvasProjectInvalidTransition, typeof CanvasNodeAlreadyExists, typeof CanvasNodeNotFound]> & TaggedUnionUtils<"_tag", readonly [typeof CanvasProjectAlreadyArchived, typeof CanvasProjectInvalidTransition, typeof CanvasNodeAlreadyExists, typeof CanvasNodeNotFound], [typeof CanvasProjectAlreadyArchived, typeof CanvasProjectInvalidTransition, typeof CanvasNodeAlreadyExists, typeof CanvasNodeNotFound]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/domain/src/aggregates/CanvasProject/CanvasProject.errors.ts#L171)

Since v0.0.0

## CanvasProjectDomainError (type alias)

CanvasProject aggregate domain failure.

**Example**

```ts
import type { CanvasProjectDomainError } from "@beep/canvas-domain/aggregates/CanvasProject"

const value = {} as CanvasProjectDomainError
console.log(value)
```

**Signature**

```ts
type CanvasProjectDomainError = | CanvasProjectAlreadyArchived
  | CanvasProjectInvalidTransition
  | CanvasNodeAlreadyExists
  | CanvasNodeNotFound
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/domain/src/aggregates/CanvasProject/CanvasProject.errors.ts#L152)

Since v0.0.0

## CanvasProjectInvalidTransition (class)

Failure raised when a command attempts an unsupported lifecycle transition.

**Example**

```ts
import { CanvasProjectInvalidTransition } from "@beep/canvas-domain/aggregates/CanvasProject"

console.log(CanvasProjectInvalidTransition)
```

**Signature**

```ts
declare class CanvasProjectInvalidTransition
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/domain/src/aggregates/CanvasProject/CanvasProject.errors.ts#L55)

Since v0.0.0

### fromStatus (static method)

Create a typed CanvasProject transition failure from lifecycle values.

**Signature**

```ts
declare const fromStatus: (input: { readonly canvasProjectId: CanvasProjectId; readonly from: CanvasProjectStatus; readonly to: CanvasProjectStatus; }) => CanvasProjectInvalidTransition
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/domain/src/aggregates/CanvasProject/CanvasProject.errors.ts#L75)

Since v0.0.0