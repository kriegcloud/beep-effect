---
title: WorkPriority.model.ts
nav_order: 15
parent: "@beep/architecture-lab-domain"
---

## WorkPriority.model.ts overview

WorkPriority value-object model.

Since v0.0.0

---
## Exports Grouped by Category
- [value-objects](#value-objects)
  - [WorkPriority](#workpriority)
  - [WorkPriority (type alias)](#workpriority-type-alias)
---

# value-objects

## WorkPriority

Reusable WorkItem priority vocabulary.

**Example**

```ts
import { WorkPriority } from "@beep/architecture-lab-domain/values/WorkPriority"

console.log(WorkPriority)
```

**Signature**

```ts
declare const WorkPriority: AnnotatedSchema<LiteralKit<readonly ["low", "normal", "high"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/domain/src/values/WorkPriority/WorkPriority.model.ts#L27)

Since v0.0.0

## WorkPriority (type alias)

Runtime type for `WorkPriority`.

**Signature**

```ts
type WorkPriority = typeof WorkPriority.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/domain/src/values/WorkPriority/WorkPriority.model.ts#L40)

Since v0.0.0