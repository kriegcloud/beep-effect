---
title: index.ts
nav_order: 4
parent: "@beep/shared-ui"
---

## index.ts overview

Shared UI package version.

**Example**

```ts
import { VERSION } from "@beep/shared-ui"

console.log(VERSION)
```

Since v0.0.0

---
## Exports Grouped by Category
- [configuration](#configuration)
  - [VERSION](#version)
- [entities](#entities)
  - [Entities (namespace export)](#entities-namespace-export)
---

# configuration

## VERSION

Shared UI package version.

**Example**

```ts
import { VERSION } from "@beep/shared-ui"

console.log(VERSION)
```

**Signature**

```ts
declare const VERSION: "0.0.0"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/ui/src/index.ts#L21)

Since v0.0.0

# entities

## Entities (namespace export)

Re-exports all named exports from the "./entities/index.ts" module as `Entities`.

**Example**

```ts
import { Entities } from "@beep/shared-ui"

console.log(Entities.Organization.primaryLabel({ name: "Acme" }))
```

**Signature**

```ts
export * as Entities from "./entities/index.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/ui/src/index.ts#L36)

Since v0.0.0