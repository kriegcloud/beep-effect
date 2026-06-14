---
title: ArchitectureLab.ts
nav_order: 9
parent: "@beep/architecture-lab-domain"
---

## ArchitectureLab.ts overview

Architecture lab slice-local entity identifiers.

Since v0.0.0

---
## Exports Grouped by Category
- [entity-ids](#entity-ids)
  - [WorkerId](#workerid)
  - [WorkerId (type alias)](#workerid-type-alias)
---

# entity-ids

## WorkerId

Architecture lab Worker entity identifier.

**Example**

```ts
import { WorkerId } from "@beep/architecture-lab-domain/identity/ArchitectureLab"

console.log(WorkerId)
```

**Signature**

```ts
declare const WorkerId: EntityId.EntityId<"architecture_lab", "worker", "architecture_lab_worker", "architecture_lab.worker", "ArchitectureLabWorker", "ArchitectureLabWorkerId">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/domain/src/identity/ArchitectureLab.ts#L28)

Since v0.0.0

## WorkerId (type alias)

Runtime type for `WorkerId`.

**Signature**

```ts
type WorkerId = typeof WorkerId.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/domain/src/identity/ArchitectureLab.ts#L38)

Since v0.0.0