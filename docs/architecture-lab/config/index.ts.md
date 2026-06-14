---
title: index.ts
nav_order: 4
parent: "@beep/architecture-lab-config"
---

## index.ts overview

Package version for the architecture lab config role.

**Example**

```ts
import { VERSION } from "@beep/architecture-lab-config"

console.log(VERSION)
```

Since v0.0.0

---
## Exports Grouped by Category
- [configuration](#configuration)
  - [VERSION](#version)
  - [WorkItemPublicConfig](#workitempublicconfig)
  - [defaultWorkItemPublicConfig](#defaultworkitempublicconfig)
---

# configuration

## VERSION

Package version for the architecture lab config role.

**Example**

```ts
import { VERSION } from "@beep/architecture-lab-config"

console.log(VERSION)
```

**Signature**

```ts
declare const VERSION: "0.0.0"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/config/src/index.ts#L22)

Since v0.0.0

## WorkItemPublicConfig

Browser-safe WorkItem public configuration exports.

**Example**

```ts
import {
  defaultWorkItemPublicConfig,
  WorkItemPublicConfig,
} from "@beep/architecture-lab-config"

const config = WorkItemPublicConfig.make({
  assignmentEnabled: defaultWorkItemPublicConfig.assignmentEnabled,
  reopenCompletedEnabled: true,
})

console.log(config.reopenCompletedEnabled)
```

**Signature**

```ts
declare const WorkItemPublicConfig: typeof WorkItemPublicConfig
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/config/src/index.ts#L45)

Since v0.0.0

## defaultWorkItemPublicConfig

Browser-safe WorkItem public configuration exports.

**Example**

```ts
import {
  defaultWorkItemPublicConfig,
  WorkItemPublicConfig,
} from "@beep/architecture-lab-config"

const config = WorkItemPublicConfig.make({
  assignmentEnabled: defaultWorkItemPublicConfig.assignmentEnabled,
  reopenCompletedEnabled: true,
})

console.log(config.reopenCompletedEnabled)
```

**Signature**

```ts
declare const defaultWorkItemPublicConfig: WorkItemPublicConfig
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/config/src/index.ts#L45)

Since v0.0.0