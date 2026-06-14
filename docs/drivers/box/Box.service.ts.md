---
title: Box.service.ts
nav_order: 5
parent: "@beep/box"
---

## Box.service.ts overview

Effect service boundary for the Box Node SDK.

Since v0.0.0

---
## Exports Grouped by Category
- [services](#services)
  - [Box (class)](#box-class)
  - [BoxShape (type alias)](#boxshape-type-alias)
---

# services

## Box (class)

Effect service for the Box Node SDK.

**Example**

```ts
import { Box, BoxDeveloperTokenConfig } from "@beep/box"
import { Redacted } from "effect"

const layer = Box.makeLayer(BoxDeveloperTokenConfig.make({ token: Redacted.make("box-token") }))
console.log(layer)
```

**Signature**

```ts
declare class Box
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/box/src/Box.service.ts#L125)

Since v0.0.0

## BoxShape (type alias)

Public Box service shape.

**Example**

```ts
import type { BoxShape } from "@beep/box"

type Managers = keyof BoxShape
```

**Signature**

```ts
type BoxShape = BoxGeneratedOperations & BoxStreamingOperations
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/box/src/Box.service.ts#L38)

Since v0.0.0