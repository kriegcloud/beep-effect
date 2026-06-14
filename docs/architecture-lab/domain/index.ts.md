---
title: index.ts
nav_order: 11
parent: "@beep/architecture-lab-domain"
---

## index.ts overview

Package version for the architecture lab domain role.

**Example**

```ts
import { VERSION } from "@beep/architecture-lab-domain"

console.log(VERSION)
```

Since v0.0.0

---
## Exports Grouped by Category
- [aggregates](#aggregates)
  - [Aggregates (namespace export)](#aggregates-namespace-export)
  - [VERSION](#version)
  - [WorkItem (namespace export)](#workitem-namespace-export)
- [entities](#entities)
  - [Entities (namespace export)](#entities-namespace-export)
  - [Worker (namespace export)](#worker-namespace-export)
- [entity-ids](#entity-ids)
  - [Identity (namespace export)](#identity-namespace-export)
- [value-objects](#value-objects)
  - [Values (namespace export)](#values-namespace-export)
  - [WorkPriority (namespace export)](#workpriority-namespace-export)
---

# aggregates

## Aggregates (namespace export)

Re-exports all named exports from the "./aggregates/index.js" module as `Aggregates`.

**Signature**

```ts
export * as Aggregates from "./aggregates/index.js"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/domain/src/index.ts#L30)

Since v0.0.0

## VERSION

Package version for the architecture lab domain role.

**Example**

```ts
import { VERSION } from "@beep/architecture-lab-domain"

console.log(VERSION)
```

**Signature**

```ts
declare const VERSION: "0.0.0"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/domain/src/index.ts#L22)

Since v0.0.0

## WorkItem (namespace export)

Re-exports all named exports from the "./aggregates/WorkItem/index.js" module as `WorkItem`.

**Signature**

```ts
export * as WorkItem from "./aggregates/WorkItem/index.js"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/domain/src/index.ts#L37)

Since v0.0.0

# entities

## Entities (namespace export)

Re-exports all named exports from the "./entities/index.js" module as `Entities`.

**Signature**

```ts
export * as Entities from "./entities/index.js"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/domain/src/index.ts#L44)

Since v0.0.0

## Worker (namespace export)

Re-exports all named exports from the "./entities/Worker/index.js" module as `Worker`.

**Signature**

```ts
export * as Worker from "./entities/Worker/index.js"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/domain/src/index.ts#L51)

Since v0.0.0

# entity-ids

## Identity (namespace export)

Re-exports all named exports from the "./identity/index.js" module as `Identity`.

**Signature**

```ts
export * as Identity from "./identity/index.js"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/domain/src/index.ts#L58)

Since v0.0.0

# value-objects

## Values (namespace export)

Re-exports all named exports from the "./values/index.js" module as `Values`.

**Signature**

```ts
export * as Values from "./values/index.js"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/domain/src/index.ts#L65)

Since v0.0.0

## WorkPriority (namespace export)

Re-exports all named exports from the "./values/WorkPriority/index.js" module as `WorkPriority`.

**Signature**

```ts
export * as WorkPriority from "./values/WorkPriority/index.js"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/domain/src/index.ts#L72)

Since v0.0.0