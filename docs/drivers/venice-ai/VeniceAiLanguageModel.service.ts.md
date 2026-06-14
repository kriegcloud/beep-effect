---
title: VeniceAiLanguageModel.service.ts
nav_order: 3
parent: "@beep/venice-ai"
---

## VeniceAiLanguageModel.service.ts overview

Effect AI language-model adapter for Venice chat completions.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [make](#make)
  - [model](#model)
- [layers](#layers)
  - [layer](#layer)
- [models](#models)
  - [VeniceAiLanguageModelOptions (class)](#veniceailanguagemodeloptions-class)
---

# constructors

## make

Builds a Venice Effect AI language-model service.

**Example**

```ts
import { VeniceAiLanguageModel } from "@beep/venice-ai"

const languageModel = VeniceAiLanguageModel.make({ model: "llama-3.3-70b" })

console.log(languageModel)
```

**Signature**

```ts
declare const make: (options: VeniceAiLanguageModelOptions) => Effect.Effect<LanguageModel.Service, never, VeniceAI>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/venice-ai/src/VeniceAiLanguageModel.service.ts#L170)

Since v0.0.0

## model

Builds an Effect AI model value for Venice.

**Example**

```ts
import { VeniceAiLanguageModel } from "@beep/venice-ai"

const aiModel = VeniceAiLanguageModel.model("llama-3.3-70b")

console.log(aiModel)
```

**Signature**

```ts
declare const model: (modelName: string, config?: OpenAiCompatLanguageModelConfig | undefined) => AiModel.Model<"venice", LanguageModel.LanguageModel, VeniceAI>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/venice-ai/src/VeniceAiLanguageModel.service.ts#L219)

Since v0.0.0

# layers

## layer

Builds a Venice Effect AI language-model layer.

**Example**

```ts
import { VeniceAiLanguageModel } from "@beep/venice-ai"

const languageModelLayer = VeniceAiLanguageModel.layer({ model: "llama-3.3-70b" })

console.log(languageModelLayer)
```

**Signature**

```ts
declare const layer: (options: VeniceAiLanguageModelOptions) => Layer.Layer<LanguageModel.LanguageModel, never, VeniceAI>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/venice-ai/src/VeniceAiLanguageModel.service.ts#L199)

Since v0.0.0

# models

## VeniceAiLanguageModelOptions (class)

Options accepted by the Venice Effect AI language-model adapter.

**Example**

```ts
import type { VeniceAiLanguageModel } from "@beep/venice-ai"

const options: VeniceAiLanguageModel.VeniceAiLanguageModelOptions = {
  model: "llama-3.3-70b"
}

console.log(options)
```

**Signature**

```ts
declare class VeniceAiLanguageModelOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/venice-ai/src/VeniceAiLanguageModel.service.ts#L48)

Since v0.0.0