---
title: index.ts
nav_order: 1
parent: "@beep/venice-ai"
---

## index.ts overview

Public Venice AI driver exports.

**Example**

```ts
import { VeniceAI } from "@beep/venice-ai"

const service = VeniceAI
console.log(service)
```

Since v0.0.0

---
## Exports Grouped by Category
- [utilities](#utilities)
  - ["./VeniceAI.service.ts" (namespace export)](#veniceaiservicets-namespace-export)
  - [VERSION](#version)
  - [VeniceAiLanguageModel (namespace export)](#veniceailanguagemodel-namespace-export)
---

# utilities

## "./VeniceAI.service.ts" (namespace export)

Re-exports all named exports from the "./VeniceAI.service.ts" module.

**Example**

```ts
import { VeniceAI } from "@beep/venice-ai"

const service = VeniceAI
console.log(service)
```

**Signature**

```ts
export * from "./VeniceAI.service.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/venice-ai/src/index.ts#L22)

Since v0.0.0

## VERSION

Current version of the `@beep/venice-ai` package.

**Example**

```ts
import { VERSION } from "@beep/venice-ai"

console.log(VERSION)
```

**Signature**

```ts
declare const VERSION: "0.0.0"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/venice-ai/src/index.ts#L52)

Since v0.0.0

## VeniceAiLanguageModel (namespace export)

Re-exports all named exports from the "./VeniceAiLanguageModel.service.ts" module as `VeniceAiLanguageModel`.

**Example**

```ts
import { VeniceAiLanguageModel } from "@beep/venice-ai"

const aiModel = VeniceAiLanguageModel.model("llama-3.3-70b")
console.log(aiModel)
```

**Signature**

```ts
export * as VeniceAiLanguageModel from "./VeniceAiLanguageModel.service.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/venice-ai/src/index.ts#L37)

Since v0.0.0