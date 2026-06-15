---
title: OpenAiCompatClient.service.ts
nav_order: 3
parent: "@beep/openai-compat"
---

## OpenAiCompatClient.service.ts overview

OpenAI-compatible HTTP client service and layer helpers.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [OpenAiCompatClientOptions (class)](#openaicompatclientoptions-class)
- [services](#services)
  - [OpenAiCompatClient (class)](#openaicompatclient-class)
  - [OpenAiCompatClientShape (interface)](#openaicompatclientshape-interface)
---

# models

## OpenAiCompatClientOptions (class)

Runtime configuration accepted by `OpenAiCompatClient.makeLayer`.

**Example**

```ts
import { Redacted } from "effect"
import { OpenAiCompatClientOptions } from "@beep/openai-compat"

const options = OpenAiCompatClientOptions.make({
  apiKey: Redacted.make("test-key"),
  apiUrl: "https://provider.example/v1"
})

console.log(options)
```

**Signature**

```ts
declare class OpenAiCompatClientOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/openai-compat/src/OpenAiCompatClient.service.ts#L53)

Since v0.0.0

# services

## OpenAiCompatClient (class)

OpenAI-compatible HTTP client service.

**Example**

```ts
import { Effect } from "effect"
import { OpenAiCompatClient } from "@beep/openai-compat"

const program = Effect.gen(function* () {
  const client = yield* OpenAiCompatClient
  return client
})

console.log(program)
```

**Signature**

```ts
declare class OpenAiCompatClient
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/openai-compat/src/OpenAiCompatClient.service.ts#L341)

Since v0.0.0

## OpenAiCompatClientShape (interface)

OpenAI-compatible HTTP client service shape.

**Example**

```ts
import { Effect, Stream } from "effect"
import {
  OpenAiCompatChatCompletionResponse,
  type OpenAiCompatClientShape
} from "@beep/openai-compat"

const client: OpenAiCompatClientShape = {
  createChatCompletion: () =>
    Effect.succeed(OpenAiCompatChatCompletionResponse.make({ choices: [] })),
  streamChatCompletion: () => Stream.empty
}

console.log(client.createChatCompletion)
```

**Signature**

```ts
export interface OpenAiCompatClientShape {
  readonly createChatCompletion: (
    request: OpenAiCompatChatCompletionRequest
  ) => Effect.Effect<OpenAiCompatChatCompletionResponse, AiError.AiError>;
  readonly streamChatCompletion: (
    request: OpenAiCompatChatCompletionRequest
  ) => Stream.Stream<OpenAiCompatChatCompletionChunk, AiError.AiError>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/openai-compat/src/OpenAiCompatClient.service.ts#L87)

Since v0.0.0