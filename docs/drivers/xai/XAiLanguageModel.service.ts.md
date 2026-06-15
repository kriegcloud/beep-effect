---
title: XAiLanguageModel.service.ts
nav_order: 7
parent: "@beep/xai"
---

## XAiLanguageModel.service.ts overview

Effect AI language-model adapter for xAI chat completions.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [make](#make)
  - [model](#model)
- [layers](#layers)
  - [layer](#layer)
- [models](#models)
  - [XAiLanguageModelOptions (class)](#xailanguagemodeloptions-class)
---

# constructors

## make

Builds an xAI Effect AI language-model service.

**Example**

```ts
import { XAiLanguageModel } from "@beep/xai"

const languageModel = XAiLanguageModel.make({ model: "grok-3" })

console.log(languageModel)
```

**Signature**

```ts
declare const make: (options: XAiLanguageModelOptions) => Effect.Effect<LanguageModel.Service, never, XAi>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/xai/src/XAiLanguageModel.service.ts#L176)

Since v0.0.0

## model

Builds an Effect AI model value for xAI.

**Example**

```ts
import { XAiLanguageModel } from "@beep/xai"

const aiModel = XAiLanguageModel.model("grok-3")

console.log(aiModel)
```

**Signature**

```ts
declare const model: (modelName: string, config?: OpenAiCompatLanguageModelConfig | undefined) => AiModel.Model<"xai", LanguageModel.LanguageModel, XAi>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/xai/src/XAiLanguageModel.service.ts#L226)

Since v0.0.0

# layers

## layer

Builds an xAI Effect AI language-model layer.

**Example**

```ts
import { XAiLanguageModel } from "@beep/xai"

const languageModelLayer = XAiLanguageModel.layer({ model: "grok-3" })

console.log(languageModelLayer)
```

**Signature**

```ts
declare const layer: (options: XAiLanguageModelOptions) => Layer.Layer<LanguageModel.LanguageModel, never, XAi>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/xai/src/XAiLanguageModel.service.ts#L208)

Since v0.0.0

# models

## XAiLanguageModelOptions (class)

Options accepted by the xAI Effect AI language-model adapter.

**Example**

```ts
import type { XAiLanguageModel } from "@beep/xai"

const options: XAiLanguageModel.XAiLanguageModelOptions = {
  model: "grok-3"
}

console.log(options)
```

**Signature**

```ts
declare class XAiLanguageModelOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/xai/src/XAiLanguageModel.service.ts#L51)

Since v0.0.0