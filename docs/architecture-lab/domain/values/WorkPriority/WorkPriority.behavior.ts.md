---
title: WorkPriority.behavior.ts
nav_order: 14
parent: "@beep/architecture-lab-domain"
---

## WorkPriority.behavior.ts overview

WorkPriority pure behavior.

Since v0.0.0

---
## Exports Grouped by Category
- [value-objects](#value-objects)
  - [compare](#compare)
  - [defaultWorkPriority](#defaultworkpriority)
  - [rank](#rank)
---

# value-objects

## compare

Compare two priorities.

**Example**

```ts
import { compare } from "@beep/architecture-lab-domain/values/WorkPriority"

console.log(compare)
```

**Signature**

```ts
declare const compare: { (left: WorkPriority, right: WorkPriority): number; (right: WorkPriority): (left: WorkPriority) => number; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/domain/src/values/WorkPriority/WorkPriority.behavior.ts#L62)

Since v0.0.0

## defaultWorkPriority

Default priority for newly created WorkItems.

**Example**

```ts
import { defaultWorkPriority } from "@beep/architecture-lab-domain/values/WorkPriority"

console.log(defaultWorkPriority)
```

**Signature**

```ts
declare const defaultWorkPriority: "low" | "normal" | "high"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/domain/src/values/WorkPriority/WorkPriority.behavior.ts#L27)

Since v0.0.0

## rank

Rank a priority from lowest to highest.

**Example**

```ts
import { rank } from "@beep/architecture-lab-domain/values/WorkPriority"

console.log(rank)
```

**Signature**

```ts
declare const rank: (priority: WorkPriority) => number
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/domain/src/values/WorkPriority/WorkPriority.behavior.ts#L42)

Since v0.0.0