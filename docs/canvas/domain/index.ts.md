---
title: index.ts
nav_order: 8
parent: "@beep/canvas-domain"
---

## index.ts overview

Package version for the canvas domain role.

**Example**

```ts
import { VERSION } from "@beep/canvas-domain"

console.log(VERSION)
```

Since v0.0.0

---
## Exports Grouped by Category
- [aggregates](#aggregates)
  - [Aggregates (namespace export)](#aggregates-namespace-export)
  - [CanvasProject (namespace export)](#canvasproject-namespace-export)
  - [VERSION](#version)
- [entity-ids](#entity-ids)
  - [Identity (namespace export)](#identity-namespace-export)
---

# aggregates

## Aggregates (namespace export)

Re-exports all named exports from the "./aggregates/index.js" module as `Aggregates`.

**Signature**

```ts
export * as Aggregates from "./aggregates/index.js"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/domain/src/index.ts#L37)

Since v0.0.0

## CanvasProject (namespace export)

Re-exports all named exports from the "./aggregates/CanvasProject/index.js" module as `CanvasProject`.

**Signature**

```ts
export * as CanvasProject from "./aggregates/CanvasProject/index.js"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/domain/src/index.ts#L30)

Since v0.0.0

## VERSION

Package version for the canvas domain role.

**Example**

```ts
import { VERSION } from "@beep/canvas-domain"

console.log(VERSION)
```

**Signature**

```ts
declare const VERSION: "0.0.0"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/domain/src/index.ts#L22)

Since v0.0.0

# entity-ids

## Identity (namespace export)

Re-exports all named exports from the "./identity/index.js" module as `Identity`.

**Signature**

```ts
export * as Identity from "./identity/index.js"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/domain/src/index.ts#L44)

Since v0.0.0