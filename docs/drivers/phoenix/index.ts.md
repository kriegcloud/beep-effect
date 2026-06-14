---
title: index.ts
nav_order: 1
parent: "@beep/phoenix"
---

## index.ts overview

Package version for `@beep/phoenix`.

**Example**

```ts
import { VERSION } from "@beep/phoenix"

console.log(VERSION)
```

Since v0.0.0

---
## Exports Grouped by Category
- [utilities](#utilities)
  - ["./Phoenix.config.ts" (namespace export)](#phoenixconfigts-namespace-export)
  - ["./Phoenix.errors.ts" (namespace export)](#phoenixerrorsts-namespace-export)
  - ["./Phoenix.models.ts" (namespace export)](#phoenixmodelsts-namespace-export)
  - ["./Phoenix.service.ts" (namespace export)](#phoenixservicets-namespace-export)
  - [VERSION](#version)
---

# utilities

## "./Phoenix.config.ts" (namespace export)

Re-exports all named exports from the "./Phoenix.config.ts" module.

**Example**

```ts
import { PhoenixConfigInput } from "@beep/phoenix"

const config = PhoenixConfigInput.make({})
console.log(config)
```

**Signature**

```ts
export * from "./Phoenix.config.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/phoenix/src/index.ts#L37)

Since v0.0.0

## "./Phoenix.errors.ts" (namespace export)

Re-exports all named exports from the "./Phoenix.errors.ts" module.

**Example**

```ts
import { PhoenixError } from "@beep/phoenix"

const error = PhoenixError.operation("doctor", "transport")
console.log(error.reason)
```

**Signature**

```ts
export * from "./Phoenix.errors.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/phoenix/src/index.ts#L52)

Since v0.0.0

## "./Phoenix.models.ts" (namespace export)

Re-exports all named exports from the "./Phoenix.models.ts" module.

**Example**

```ts
import { PhoenixDatasetSelector } from "@beep/phoenix"

const selector = PhoenixDatasetSelector.make({ kind: "dataset-name", value: "agent-loop-health-v1" })
console.log(selector.value)
```

**Signature**

```ts
export * from "./Phoenix.models.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/phoenix/src/index.ts#L67)

Since v0.0.0

## "./Phoenix.service.ts" (namespace export)

Re-exports all named exports from the "./Phoenix.service.ts" module.

**Example**

```ts
import { Phoenix } from "@beep/phoenix"

const layer = Phoenix.layer
console.log(layer)
```

**Signature**

```ts
export * from "./Phoenix.service.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/phoenix/src/index.ts#L82)

Since v0.0.0

## VERSION

Package version for `@beep/phoenix`.

**Example**

```ts
import { VERSION } from "@beep/phoenix"

console.log(VERSION)
```

**Signature**

```ts
declare const VERSION: "0.0.0"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/phoenix/src/index.ts#L21)

Since v0.0.0