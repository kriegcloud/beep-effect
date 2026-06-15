---
title: index.ts
nav_order: 1
parent: "@beep/openai-compat"
---

## index.ts overview

OpenAI-compatible driver package version.

**Example**

```ts
import { VERSION } from "@beep/openai-compat"

const version: "0.0.0" = VERSION

console.log(version)
```

Since v0.0.0

---
## Exports Grouped by Category
- [configuration](#configuration)
  - [VERSION](#version)
- [utilities](#utilities)
  - ["./OpenAiCompat.models.ts" (namespace export)](#openaicompatmodelsts-namespace-export)
  - ["./OpenAiCompatClient.service.ts" (namespace export)](#openaicompatclientservicets-namespace-export)
  - ["./OpenAiCompatLanguageModel.service.ts" (namespace export)](#openaicompatlanguagemodelservicets-namespace-export)
---

# configuration

## VERSION

OpenAI-compatible driver package version.

**Example**

```ts
import { VERSION } from "@beep/openai-compat"

const version: "0.0.0" = VERSION

console.log(version)
```

**Signature**

```ts
declare const VERSION: "0.0.0"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/openai-compat/src/index.ts#L23)

Since v0.0.0

# utilities

## "./OpenAiCompat.models.ts" (namespace export)

Re-exports all named exports from the "./OpenAiCompat.models.ts" module.

**Example**

```ts
import { OpenAiCompatChatCompletionRequest } from "@beep/openai-compat"

const request = OpenAiCompatChatCompletionRequest.make({
  messages: [{ content: "Hello", role: "user" }],
  model: "compat-model"
})
console.log(request)
```

**Signature**

```ts
export * from "./OpenAiCompat.models.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/openai-compat/src/index.ts#L42)

Since v0.0.0

## "./OpenAiCompatClient.service.ts" (namespace export)

Re-exports all named exports from the "./OpenAiCompatClient.service.ts" module.

**Example**

```ts
import { OpenAiCompatClient } from "@beep/openai-compat"

const service = OpenAiCompatClient
console.log(service)
```

**Signature**

```ts
export * from "./OpenAiCompatClient.service.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/openai-compat/src/index.ts#L57)

Since v0.0.0

## "./OpenAiCompatLanguageModel.service.ts" (namespace export)

Re-exports all named exports from the "./OpenAiCompatLanguageModel.service.ts" module.

**Example**

```ts
import { model } from "@beep/openai-compat"

const aiModel = model("compat-model")
console.log(aiModel)
```

**Signature**

```ts
export * from "./OpenAiCompatLanguageModel.service.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/openai-compat/src/index.ts#L72)

Since v0.0.0