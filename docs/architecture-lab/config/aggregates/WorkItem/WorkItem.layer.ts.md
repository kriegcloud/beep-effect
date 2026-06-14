---
title: WorkItem.layer.ts
nav_order: 3
parent: "@beep/architecture-lab-config"
---

## WorkItem.layer.ts overview

WorkItem configuration layers.

Since v0.0.0

---
## Exports Grouped by Category
- [layers](#layers)
  - [ArchitectureLabConfigLive](#architecturelabconfiglive)
  - [ArchitectureLabConfigTest](#architecturelabconfigtest)
  - [WorkItemConfig (class)](#workitemconfig-class)
  - [WorkItemConfigShape (type alias)](#workitemconfigshape-type-alias)
  - [WorkItemConfigValue (class)](#workitemconfigvalue-class)
  - [testWorkItemConfig](#testworkitemconfig)
---

# layers

## ArchitectureLabConfigLive

Live WorkItem configuration layer.

**Example**

```ts
import { ArchitectureLabConfigLive } from "@beep/architecture-lab-config/aggregates/WorkItem"

console.log(ArchitectureLabConfigLive)
```

**Signature**

```ts
declare const ArchitectureLabConfigLive: Layer.Layer<WorkItemConfig, Config.ConfigError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/config/src/aggregates/WorkItem/WorkItem.layer.ts#L135)

Since v0.0.0

## ArchitectureLabConfigTest

Test WorkItem configuration layer.

**Example**

```ts
import { ArchitectureLabConfigTest } from "@beep/architecture-lab-config/aggregates/WorkItem"

console.log(ArchitectureLabConfigTest)
```

**Signature**

```ts
declare const ArchitectureLabConfigTest: Layer.Layer<WorkItemConfig, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/config/src/aggregates/WorkItem/WorkItem.layer.ts#L150)

Since v0.0.0

## WorkItemConfig (class)

WorkItem configuration service.

**Example**

```ts
import { WorkItemConfig } from "@beep/architecture-lab-config/aggregates/WorkItem"

console.log(WorkItemConfig)
```

**Signature**

```ts
declare class WorkItemConfig
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/config/src/aggregates/WorkItem/WorkItem.layer.ts#L77)

Since v0.0.0

## WorkItemConfigShape (type alias)

WorkItem configuration service contract.

**Example**

```ts
import type { WorkItemConfigShape } from "@beep/architecture-lab-config/aggregates/WorkItem"

const value = {} as WorkItemConfigShape
console.log(value)
```

**Signature**

```ts
type WorkItemConfigShape = WorkItemConfigValue
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/config/src/aggregates/WorkItem/WorkItem.layer.ts#L62)

Since v0.0.0

## WorkItemConfigValue (class)

WorkItem configuration value.

**Example**

```ts
import { WorkItemConfigValue } from "@beep/architecture-lab-config/aggregates/WorkItem"

console.log(WorkItemConfigValue)
```

**Signature**

```ts
declare class WorkItemConfigValue
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/config/src/aggregates/WorkItem/WorkItem.layer.ts#L36)

Since v0.0.0

## testWorkItemConfig

Test WorkItem configuration value.

**Example**

```ts
import { testWorkItemConfig } from "@beep/architecture-lab-config/aggregates/WorkItem"

console.log(testWorkItemConfig)
```

**Signature**

```ts
declare const testWorkItemConfig: WorkItemConfigValue
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/config/src/aggregates/WorkItem/WorkItem.layer.ts#L116)

Since v0.0.0