---
title: CanvasProject.repository.ts
nav_order: 3
parent: "@beep/canvas-use-cases"
---

## CanvasProject.repository.ts overview

CanvasProject repository port.

Since v0.0.0

---
## Exports Grouped by Category
- [repositories](#repositories)
  - [CanvasProjectRepository (class)](#canvasprojectrepository-class)
  - [CanvasProjectRepositoryConflict (class)](#canvasprojectrepositoryconflict-class)
  - [CanvasProjectRepositoryError](#canvasprojectrepositoryerror)
  - [CanvasProjectRepositoryError (type alias)](#canvasprojectrepositoryerror-type-alias)
  - [CanvasProjectRepositoryNotFound (class)](#canvasprojectrepositorynotfound-class)
  - [CanvasProjectRepositoryShape (interface)](#canvasprojectrepositoryshape-interface)
  - [CanvasProjectRepositoryUnavailable (class)](#canvasprojectrepositoryunavailable-class)
---

# repositories

## CanvasProjectRepository (class)

CanvasProject repository service.

**Example**

```ts
import { CanvasProjectRepository } from "@beep/canvas-use-cases/aggregates/CanvasProject/server"

console.log(CanvasProjectRepository)
```

**Signature**

```ts
declare class CanvasProjectRepository
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/use-cases/src/aggregates/CanvasProject/CanvasProject.repository.ts#L179)

Since v0.0.0

## CanvasProjectRepositoryConflict (class)

Persistence failure raised when a CanvasProject write conflicts.

**Example**

```ts
import { CanvasProjectRepositoryConflict } from "@beep/canvas-use-cases/aggregates/CanvasProject/server"

console.log(CanvasProjectRepositoryConflict)
```

**Signature**

```ts
declare class CanvasProjectRepositoryConflict
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/use-cases/src/aggregates/CanvasProject/CanvasProject.repository.ts#L57)

Since v0.0.0

## CanvasProjectRepositoryError

CanvasProject repository failure.

**Example**

```ts
import type { CanvasProjectRepositoryError } from "@beep/canvas-use-cases/aggregates/CanvasProject/server"

const value = {} as CanvasProjectRepositoryError
console.log(value)
```

**Signature**

```ts
declare const CanvasProjectRepositoryError: AnnotatedSchema<S.Union<readonly [typeof CanvasProjectRepositoryNotFound, typeof CanvasProjectRepositoryConflict, typeof CanvasProjectRepositoryUnavailable]> & TaggedUnionUtils<"_tag", readonly [typeof CanvasProjectRepositoryNotFound, typeof CanvasProjectRepositoryConflict, typeof CanvasProjectRepositoryUnavailable], [typeof CanvasProjectRepositoryNotFound, typeof CanvasProjectRepositoryConflict, typeof CanvasProjectRepositoryUnavailable]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/use-cases/src/aggregates/CanvasProject/CanvasProject.repository.ts#L111)

Since v0.0.0

## CanvasProjectRepositoryError (type alias)

CanvasProject repository failure type.

**Signature**

```ts
type CanvasProjectRepositoryError = typeof CanvasProjectRepositoryError.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/use-cases/src/aggregates/CanvasProject/CanvasProject.repository.ts#L128)

Since v0.0.0

## CanvasProjectRepositoryNotFound (class)

Persistence failure raised when a CanvasProject row is absent.

**Example**

```ts
import { CanvasProjectRepositoryNotFound } from "@beep/canvas-use-cases/aggregates/CanvasProject/server"

console.log(CanvasProjectRepositoryNotFound)
```

**Signature**

```ts
declare class CanvasProjectRepositoryNotFound
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/use-cases/src/aggregates/CanvasProject/CanvasProject.repository.ts#L31)

Since v0.0.0

## CanvasProjectRepositoryShape (interface)

CanvasProject repository contract.

**Example**

```ts
import type { CanvasProjectRepositoryShape } from "@beep/canvas-use-cases/aggregates/CanvasProject/server"

const value = {} as CanvasProjectRepositoryShape
console.log(value)
```

**Signature**

```ts
export interface CanvasProjectRepositoryShape {
  readonly create: (
    canvasProject: DomainCanvasProject.CanvasProject
  ) => Effect.Effect<
    DomainCanvasProject.CanvasProject,
    CanvasProjectRepositoryConflict | CanvasProjectRepositoryUnavailable
  >;
  readonly get: (
    id: DomainCanvasProject.CanvasProjectId
  ) => Effect.Effect<
    DomainCanvasProject.CanvasProject,
    CanvasProjectRepositoryNotFound | CanvasProjectRepositoryUnavailable
  >;
  readonly list: Effect.Effect<ReadonlyArray<DomainCanvasProject.CanvasProject>, CanvasProjectRepositoryUnavailable>;
  readonly save: (
    canvasProject: DomainCanvasProject.CanvasProject
  ) => Effect.Effect<
    DomainCanvasProject.CanvasProject,
    CanvasProjectRepositoryNotFound | CanvasProjectRepositoryUnavailable
  >;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/use-cases/src/aggregates/CanvasProject/CanvasProject.repository.ts#L144)

Since v0.0.0

## CanvasProjectRepositoryUnavailable (class)

Persistence failure raised when the CanvasProject repository is unavailable.

**Example**

```ts
import { CanvasProjectRepositoryUnavailable } from "@beep/canvas-use-cases/aggregates/CanvasProject/server"

console.log(CanvasProjectRepositoryUnavailable)
```

**Signature**

```ts
declare class CanvasProjectRepositoryUnavailable
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/use-cases/src/aggregates/CanvasProject/CanvasProject.repository.ts#L84)

Since v0.0.0