---
title: CanvasProject.errors.ts
nav_order: 2
parent: "@beep/canvas-use-cases"
---

## CanvasProject.errors.ts overview

CanvasProject use-case errors.

Since v0.0.0

---
## Exports Grouped by Category
- [errors](#errors)
  - [CANVAS_PROJECT_ACTION_UNAVAILABLE_REASON](#canvas_project_action_unavailable_reason)
  - [CANVAS_PROJECT_CONFLICT_REASON](#canvas_project_conflict_reason)
  - [CanvasProjectActionError](#canvasprojectactionerror)
  - [CanvasProjectActionError (type alias)](#canvasprojectactionerror-type-alias)
  - [CanvasProjectActionFailed (class)](#canvasprojectactionfailed-class)
  - [CanvasProjectActionRejected (class)](#canvasprojectactionrejected-class)
  - [CanvasProjectConflict (class)](#canvasprojectconflict-class)
  - [CanvasProjectNotFound (class)](#canvasprojectnotfound-class)
---

# errors

## CANVAS_PROJECT_ACTION_UNAVAILABLE_REASON

Generic public reason used when internal CanvasProject repository details are redacted.

**Example**

```ts
import { CANVAS_PROJECT_ACTION_UNAVAILABLE_REASON } from "@beep/canvas-use-cases/aggregates/CanvasProject"

console.log(CANVAS_PROJECT_ACTION_UNAVAILABLE_REASON)
```

**Signature**

```ts
declare const CANVAS_PROJECT_ACTION_UNAVAILABLE_REASON: "CanvasProject service is unavailable."
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/use-cases/src/aggregates/CanvasProject/CanvasProject.errors.ts#L31)

Since v0.0.0

## CANVAS_PROJECT_CONFLICT_REASON

Generic public reason used when internal CanvasProject conflict details are redacted.

**Example**

```ts
import { CANVAS_PROJECT_CONFLICT_REASON } from "@beep/canvas-use-cases/aggregates/CanvasProject"

console.log(CANVAS_PROJECT_CONFLICT_REASON)
```

**Signature**

```ts
declare const CANVAS_PROJECT_CONFLICT_REASON: "CanvasProject already exists."
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/use-cases/src/aggregates/CanvasProject/CanvasProject.errors.ts#L46)

Since v0.0.0

## CanvasProjectActionError

Public CanvasProject use-case failure schema.

**Example**

```ts
import { CanvasProjectActionError } from "@beep/canvas-use-cases/aggregates/CanvasProject"

console.log(CanvasProjectActionError)
```

**Signature**

```ts
declare const CanvasProjectActionError: AnnotatedSchema<S.Union<readonly [typeof CanvasProjectNotFound, typeof CanvasProjectConflict, typeof CanvasProjectActionRejected, typeof CanvasProjectActionFailed]> & TaggedUnionUtils<"_tag", readonly [typeof CanvasProjectNotFound, typeof CanvasProjectConflict, typeof CanvasProjectActionRejected, typeof CanvasProjectActionFailed], [typeof CanvasProjectNotFound, typeof CanvasProjectConflict, typeof CanvasProjectActionRejected, typeof CanvasProjectActionFailed]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/use-cases/src/aggregates/CanvasProject/CanvasProject.errors.ts#L240)

Since v0.0.0

## CanvasProjectActionError (type alias)

Public CanvasProject use-case failure.

**Example**

```ts
import type { CanvasProjectActionError } from "@beep/canvas-use-cases/aggregates/CanvasProject"

const value = {} as CanvasProjectActionError
console.log(value)
```

**Signature**

```ts
type CanvasProjectActionError = | CanvasProjectNotFound
  | CanvasProjectConflict
  | CanvasProjectActionRejected
  | CanvasProjectActionFailed
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/use-cases/src/aggregates/CanvasProject/CanvasProject.errors.ts#L221)

Since v0.0.0

## CanvasProjectActionFailed (class)

Public failure raised when an action cannot be completed.

**Example**

```ts
import { CanvasProjectActionFailed } from "@beep/canvas-use-cases/aggregates/CanvasProject"

console.log(CanvasProjectActionFailed)
```

**Signature**

```ts
declare class CanvasProjectActionFailed
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/use-cases/src/aggregates/CanvasProject/CanvasProject.errors.ts#L194)

Since v0.0.0

## CanvasProjectActionRejected (class)

Public failure raised when the domain rejects a CanvasProject action.

**Example**

```ts
import { CanvasProjectActionRejected } from "@beep/canvas-use-cases/aggregates/CanvasProject"

console.log(CanvasProjectActionRejected)
```

**Signature**

```ts
declare class CanvasProjectActionRejected
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/use-cases/src/aggregates/CanvasProject/CanvasProject.errors.ts#L167)

Since v0.0.0

## CanvasProjectConflict (class)

Public failure raised when a command conflicts with persisted state.

**Example**

```ts
import { CanvasProjectConflict } from "@beep/canvas-use-cases/aggregates/CanvasProject"

console.log(CanvasProjectConflict)
```

**Signature**

```ts
declare class CanvasProjectConflict
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/use-cases/src/aggregates/CanvasProject/CanvasProject.errors.ts#L103)

Since v0.0.0

## CanvasProjectNotFound (class)

Public failure raised when a requested CanvasProject is absent.

**Example**

```ts
import { CanvasProjectNotFound } from "@beep/canvas-use-cases/aggregates/CanvasProject"

console.log(CanvasProjectNotFound)
```

**Signature**

```ts
declare class CanvasProjectNotFound
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/use-cases/src/aggregates/CanvasProject/CanvasProject.errors.ts#L61)

Since v0.0.0