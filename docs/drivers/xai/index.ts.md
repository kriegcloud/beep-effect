---
title: index.ts
nav_order: 1
parent: "@beep/xai"
---

## index.ts overview

Package version for `@beep/xai`.

**Example**

```ts
import { VERSION } from "@beep/xai"

console.log(VERSION)
```

Since v0.0.0

---
## Exports Grouped by Category
- [utilities](#utilities)
  - ["./XAi.config.ts" (namespace export)](#xaiconfigts-namespace-export)
  - ["./XAi.errors.ts" (namespace export)](#xaierrorsts-namespace-export)
  - ["./XAi.models.ts" (namespace export)](#xaimodelsts-namespace-export)
  - ["./XAi.service.ts" (namespace export)](#xaiservicets-namespace-export)
  - ["./XAiEndpoints.models.ts" (namespace export)](#xaiendpointsmodelsts-namespace-export)
  - [VERSION](#version)
  - [XAiLanguageModel (namespace export)](#xailanguagemodel-namespace-export)
---

# utilities

## "./XAi.config.ts" (namespace export)

Re-exports all named exports from the "./XAi.config.ts" module.

**Example**

```ts
import { XAiConfigInput } from "@beep/xai"

const config = XAiConfigInput.make({})
console.log(config)
```

**Signature**

```ts
export * from "./XAi.config.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/xai/src/index.ts#L37)

Since v0.0.0

## "./XAi.errors.ts" (namespace export)

Re-exports all named exports from the "./XAi.errors.ts" module.

**Example**

```ts
import { XAiError } from "@beep/xai"

const error = XAiError.config()
console.log(error)
```

**Signature**

```ts
export * from "./XAi.errors.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/xai/src/index.ts#L52)

Since v0.0.0

## "./XAi.models.ts" (namespace export)

Re-exports all named exports from the "./XAi.models.ts" module.

**Example**

```ts
import { XAiRequestOptions } from "@beep/xai"

const request = XAiRequestOptions.make({})
console.log(request)
```

**Signature**

```ts
export * from "./XAi.models.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/xai/src/index.ts#L67)

Since v0.0.0

## "./XAi.service.ts" (namespace export)

Re-exports all named exports from the "./XAi.service.ts" module.

**Example**

```ts
import { XAi } from "@beep/xai"

const layer = XAi.layer
console.log(layer)
```

**Signature**

```ts
export * from "./XAi.service.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/xai/src/index.ts#L82)

Since v0.0.0

## "./XAiEndpoints.models.ts" (namespace export)

Re-exports all named exports from the "./XAiEndpoints.models.ts" module.

**Example**

```ts
import { XAI_ENDPOINTS } from "@beep/xai"

console.log(XAI_ENDPOINTS.length)
```

**Signature**

```ts
export * from "./XAiEndpoints.models.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/xai/src/index.ts#L96)

Since v0.0.0

## VERSION

Package version for `@beep/xai`.

**Example**

```ts
import { VERSION } from "@beep/xai"

console.log(VERSION)
```

**Signature**

```ts
declare const VERSION: "0.0.0"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/xai/src/index.ts#L21)

Since v0.0.0

## XAiLanguageModel (namespace export)

Re-exports all named exports from the "./XAiLanguageModel.service.ts" module as `XAiLanguageModel`.

**Example**

```ts
import { XAiLanguageModel } from "@beep/xai"

const aiModel = XAiLanguageModel.model("grok-3")
console.log(aiModel)
```

**Signature**

```ts
export * as XAiLanguageModel from "./XAiLanguageModel.service.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/xai/src/index.ts#L111)

Since v0.0.0