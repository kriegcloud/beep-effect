---
title: WorkItem.config.ts
nav_order: 2
parent: "@beep/architecture-lab-config"
---

## WorkItem.config.ts overview

WorkItem configuration models.

Since v0.0.0

---
## Exports Grouped by Category
- [configuration](#configuration)
  - [WorkItemPublicConfig (class)](#workitempublicconfig-class)
  - [WorkItemSecretConfig (class)](#workitemsecretconfig-class)
  - [WorkItemServerConfig (class)](#workitemserverconfig-class)
  - [defaultWorkItemPublicConfig](#defaultworkitempublicconfig)
  - [defaultWorkItemSecretConfig](#defaultworkitemsecretconfig)
  - [defaultWorkItemServerConfig](#defaultworkitemserverconfig)
---

# configuration

## WorkItemPublicConfig (class)

Client-safe WorkItem configuration.

**Example**

```ts
import { WorkItemPublicConfig } from "@beep/architecture-lab-config/aggregates/WorkItem"

console.log(WorkItemPublicConfig)
```

**Signature**

```ts
declare class WorkItemPublicConfig
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/config/src/aggregates/WorkItem/WorkItem.config.ts#L27)

Since v0.0.0

## WorkItemSecretConfig (class)

Secret WorkItem configuration.

**Example**

```ts
import { WorkItemSecretConfig } from "@beep/architecture-lab-config/aggregates/WorkItem"

console.log(WorkItemSecretConfig)
```

**Signature**

```ts
declare class WorkItemSecretConfig
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/config/src/aggregates/WorkItem/WorkItem.config.ts#L75)

Since v0.0.0

## WorkItemServerConfig (class)

Server-only WorkItem configuration.

**Example**

```ts
import { WorkItemServerConfig } from "@beep/architecture-lab-config/aggregates/WorkItem"

console.log(WorkItemServerConfig)
```

**Signature**

```ts
declare class WorkItemServerConfig
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/config/src/aggregates/WorkItem/WorkItem.config.ts#L51)

Since v0.0.0

## defaultWorkItemPublicConfig

Default client-safe WorkItem configuration.

**Example**

```ts
import { defaultWorkItemPublicConfig } from "@beep/architecture-lab-config/aggregates/WorkItem"

console.log(defaultWorkItemPublicConfig)
```

**Signature**

```ts
declare const defaultWorkItemPublicConfig: WorkItemPublicConfig
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/config/src/aggregates/WorkItem/WorkItem.config.ts#L98)

Since v0.0.0

## defaultWorkItemSecretConfig

Default secret WorkItem configuration.

**Example**

```ts
import { defaultWorkItemSecretConfig } from "@beep/architecture-lab-config/aggregates/WorkItem"

console.log(defaultWorkItemSecretConfig)
```

**Signature**

```ts
declare const defaultWorkItemSecretConfig: WorkItemSecretConfig
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/config/src/aggregates/WorkItem/WorkItem.config.ts#L134)

Since v0.0.0

## defaultWorkItemServerConfig

Default server WorkItem configuration.

**Example**

```ts
import { defaultWorkItemServerConfig } from "@beep/architecture-lab-config/aggregates/WorkItem"

console.log(defaultWorkItemServerConfig)
```

**Signature**

```ts
declare const defaultWorkItemServerConfig: WorkItemServerConfig
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/config/src/aggregates/WorkItem/WorkItem.config.ts#L116)

Since v0.0.0