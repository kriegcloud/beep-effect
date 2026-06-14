---
title: OpenAiCompat.models.ts
nav_order: 2
parent: "@beep/openai-compat"
---

## OpenAiCompat.models.ts overview

Schema-first OpenAI-compatible chat completion request and response models.

Since v0.0.0

---
## Exports Grouped by Category
- [codecs](#codecs)
  - [decodeChatCompletionChunk](#decodechatcompletionchunk)
  - [decodeChatCompletionResponse](#decodechatcompletionresponse)
- [models](#models)
  - [OpenAiCompatAssistantChatMessage (class)](#openaicompatassistantchatmessage-class)
  - [OpenAiCompatAssistantDelta (class)](#openaicompatassistantdelta-class)
  - [OpenAiCompatAssistantMessage (class)](#openaicompatassistantmessage-class)
  - [OpenAiCompatChatCompletionChoice (class)](#openaicompatchatcompletionchoice-class)
  - [OpenAiCompatChatCompletionChunk (class)](#openaicompatchatcompletionchunk-class)
  - [OpenAiCompatChatCompletionChunkChoice (class)](#openaicompatchatcompletionchunkchoice-class)
  - [OpenAiCompatChatCompletionRequest (class)](#openaicompatchatcompletionrequest-class)
  - [OpenAiCompatChatCompletionResponse (class)](#openaicompatchatcompletionresponse-class)
  - [OpenAiCompatChatMessage (type alias)](#openaicompatchatmessage-type-alias)
  - [OpenAiCompatChatRole (type alias)](#openaicompatchatrole-type-alias)
  - [OpenAiCompatFinishReason (type alias)](#openaicompatfinishreason-type-alias)
  - [OpenAiCompatFunctionTool (class)](#openaicompatfunctiontool-class)
  - [OpenAiCompatFunctionToolDefinition (class)](#openaicompatfunctiontooldefinition-class)
  - [OpenAiCompatJsonObjectResponseFormat (class)](#openaicompatjsonobjectresponseformat-class)
  - [OpenAiCompatJsonSchemaDefinition (class)](#openaicompatjsonschemadefinition-class)
  - [OpenAiCompatJsonSchemaResponseFormat (class)](#openaicompatjsonschemaresponseformat-class)
  - [OpenAiCompatResponseFormat](#openaicompatresponseformat)
  - [OpenAiCompatResponseFormat (type alias)](#openaicompatresponseformat-type-alias)
  - [OpenAiCompatResponseFormatKind (type alias)](#openaicompatresponseformatkind-type-alias)
  - [OpenAiCompatSystemChatMessage (class)](#openaicompatsystemchatmessage-class)
  - [OpenAiCompatTextResponseFormat (class)](#openaicompattextresponseformat-class)
  - [OpenAiCompatToolCall (class)](#openaicompattoolcall-class)
  - [OpenAiCompatToolCallDelta (class)](#openaicompattoolcalldelta-class)
  - [OpenAiCompatToolCallFunction (class)](#openaicompattoolcallfunction-class)
  - [OpenAiCompatToolCallFunctionDelta (class)](#openaicompattoolcallfunctiondelta-class)
  - [OpenAiCompatToolChatMessage (class)](#openaicompattoolchatmessage-class)
  - [OpenAiCompatUsage (class)](#openaicompatusage-class)
  - [OpenAiCompatUserChatMessage (class)](#openaicompatuserchatmessage-class)
- [schemas](#schemas)
  - [OpenAiCompatChatMessage](#openaicompatchatmessage)
  - [OpenAiCompatChatRole](#openaicompatchatrole)
  - [OpenAiCompatFinishReason](#openaicompatfinishreason)
  - [OpenAiCompatResponseFormatKind](#openaicompatresponseformatkind)
---

# codecs

## decodeChatCompletionChunk

Decodes an unknown value into an OpenAI-compatible chat completion stream chunk.

**Example**

```ts
import { Effect } from "effect"
import { decodeChatCompletionChunk } from "@beep/openai-compat"

const decoded = Effect.runSync(decodeChatCompletionChunk({ choices: [] }))

console.log(decoded)
```

**Signature**

```ts
declare const decodeChatCompletionChunk: (input: unknown, options?: ParseOptions) => Effect.Effect<OpenAiCompatChatCompletionChunk, S.SchemaError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/openai-compat/src/OpenAiCompat.models.ts#L1003)

Since v0.0.0

## decodeChatCompletionResponse

Decodes an unknown value into an OpenAI-compatible chat completion response.

**Example**

```ts
import { Effect } from "effect"
import { decodeChatCompletionResponse } from "@beep/openai-compat"

const decoded = Effect.runSync(decodeChatCompletionResponse({ choices: [] }))

console.log(decoded)
```

**Signature**

```ts
declare const decodeChatCompletionResponse: (input: unknown, options?: ParseOptions) => Effect.Effect<OpenAiCompatChatCompletionResponse, S.SchemaError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/openai-compat/src/OpenAiCompat.models.ts#L985)

Since v0.0.0

# models

## OpenAiCompatAssistantChatMessage (class)

Assistant chat message accepted by OpenAI-compatible chat completion endpoints.

**Example**

```ts
import { OpenAiCompatAssistantChatMessage } from "@beep/openai-compat"

const message = OpenAiCompatAssistantChatMessage.make({
  content: "Hi there",
  role: "assistant"
})

console.log(message)
```

**Signature**

```ts
declare class OpenAiCompatAssistantChatMessage
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/openai-compat/src/OpenAiCompat.models.ts#L372)

Since v0.0.0

## OpenAiCompatAssistantDelta (class)

Delta message returned by OpenAI-compatible chat completion streams.

**Example**

```ts
import * as O from "effect/Option"
import { OpenAiCompatAssistantDelta } from "@beep/openai-compat"

const delta = OpenAiCompatAssistantDelta.make({
  content: O.some("Hi "),
  role: "assistant"
})

console.log(delta)
```

**Signature**

```ts
declare class OpenAiCompatAssistantDelta
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/openai-compat/src/OpenAiCompat.models.ts#L766)

Since v0.0.0

## OpenAiCompatAssistantMessage (class)

Assistant message returned by OpenAI-compatible chat completion endpoints.

**Example**

```ts
import * as O from "effect/Option"
import { OpenAiCompatAssistantMessage } from "@beep/openai-compat"

const message = OpenAiCompatAssistantMessage.make({
  content: O.some("Done"),
  role: "assistant"
})

console.log(message)
```

**Signature**

```ts
declare class OpenAiCompatAssistantMessage
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/openai-compat/src/OpenAiCompat.models.ts#L730)

Since v0.0.0

## OpenAiCompatChatCompletionChoice (class)

Chat completion choice returned by OpenAI-compatible endpoints.

**Example**

```ts
import * as O from "effect/Option"
import { OpenAiCompatAssistantMessage, OpenAiCompatChatCompletionChoice } from "@beep/openai-compat"

const choice = OpenAiCompatChatCompletionChoice.make({
  finish_reason: O.some("stop"),
  index: 0,
  message: O.some(OpenAiCompatAssistantMessage.make({ content: O.some("Hello"), role: "assistant" }))
})

console.log(choice)
```

**Signature**

```ts
declare class OpenAiCompatChatCompletionChoice
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/openai-compat/src/OpenAiCompat.models.ts#L833)

Since v0.0.0

## OpenAiCompatChatCompletionChunk (class)

Stream chunk returned by OpenAI-compatible chat completion endpoints.

**Example**

```ts
import * as O from "effect/Option"
import {
  OpenAiCompatAssistantDelta,
  OpenAiCompatChatCompletionChunk,
  OpenAiCompatChatCompletionChunkChoice
} from "@beep/openai-compat"

const chunk = OpenAiCompatChatCompletionChunk.make({
  choices: [
    OpenAiCompatChatCompletionChunkChoice.make({
      delta: O.some(OpenAiCompatAssistantDelta.make({ content: O.some("Hi ") })),
      index: 0
    })
  ]
})

console.log(chunk)
```

**Signature**

```ts
declare class OpenAiCompatChatCompletionChunk
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/openai-compat/src/OpenAiCompat.models.ts#L953)

Since v0.0.0

## OpenAiCompatChatCompletionChunkChoice (class)

Stream chunk choice returned by OpenAI-compatible endpoints.

**Example**

```ts
import * as O from "effect/Option"
import { OpenAiCompatAssistantDelta, OpenAiCompatChatCompletionChunkChoice } from "@beep/openai-compat"

const choice = OpenAiCompatChatCompletionChunkChoice.make({
  delta: O.some(OpenAiCompatAssistantDelta.make({ content: O.some("Hi ") })),
  index: 0
})

console.log(choice)
```

**Signature**

```ts
declare class OpenAiCompatChatCompletionChunkChoice
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/openai-compat/src/OpenAiCompat.models.ts#L911)

Since v0.0.0

## OpenAiCompatChatCompletionRequest (class)

Chat completion request sent to OpenAI-compatible providers.

**Example**

```ts
import { OpenAiCompatChatCompletionRequest } from "@beep/openai-compat"

const request = OpenAiCompatChatCompletionRequest.make({
  messages: [{ content: "Hello", role: "user" }],
  model: "gpt-compatible"
})

console.log(request)
```

**Signature**

```ts
declare class OpenAiCompatChatCompletionRequest
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/openai-compat/src/OpenAiCompat.models.ts#L685)

Since v0.0.0

## OpenAiCompatChatCompletionResponse (class)

Chat completion response returned by OpenAI-compatible endpoints.

**Example**

```ts
import * as O from "effect/Option"
import {
  OpenAiCompatAssistantMessage,
  OpenAiCompatChatCompletionChoice,
  OpenAiCompatChatCompletionResponse
} from "@beep/openai-compat"

const response = OpenAiCompatChatCompletionResponse.make({
  choices: [
    OpenAiCompatChatCompletionChoice.make({
      finish_reason: O.some("stop"),
      index: 0,
      message: O.some(OpenAiCompatAssistantMessage.make({ content: O.some("Hello") }))
    })
  ]
})

console.log(response)
```

**Signature**

```ts
declare class OpenAiCompatChatCompletionResponse
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/openai-compat/src/OpenAiCompat.models.ts#L876)

Since v0.0.0

## OpenAiCompatChatMessage (type alias)

Chat message accepted by OpenAI-compatible chat completion endpoints.

**Example**

```ts
import type { OpenAiCompatChatMessage } from "@beep/openai-compat"

const message: OpenAiCompatChatMessage = {
  content: "Hello",
  role: "user"
}

console.log(message)
```

**Signature**

```ts
type OpenAiCompatChatMessage = typeof OpenAiCompatChatMessage.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/openai-compat/src/OpenAiCompat.models.ts#L467)

Since v0.0.0

## OpenAiCompatChatRole (type alias)

Chat roles accepted by OpenAI-compatible chat completion endpoints.

**Example**

```ts
import type { OpenAiCompatChatRole } from "@beep/openai-compat"

const role: OpenAiCompatChatRole = "assistant"

console.log(role)
```

**Signature**

```ts
type OpenAiCompatChatRole = typeof OpenAiCompatChatRole.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/openai-compat/src/OpenAiCompat.models.ts#L62)

Since v0.0.0

## OpenAiCompatFinishReason (type alias)

Finish reasons emitted by OpenAI-compatible chat completion endpoints.

**Example**

```ts
import type { OpenAiCompatFinishReason } from "@beep/openai-compat"

const reason: OpenAiCompatFinishReason = "tool_calls"

console.log(reason)
```

**Signature**

```ts
type OpenAiCompatFinishReason = typeof OpenAiCompatFinishReason.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/openai-compat/src/OpenAiCompat.models.ts#L106)

Since v0.0.0

## OpenAiCompatFunctionTool (class)

Function declaration sent to OpenAI-compatible chat completion endpoints.

**Example**

```ts
import { OpenAiCompatFunctionTool } from "@beep/openai-compat"

const tool = OpenAiCompatFunctionTool.make({
  function: { name: "noop", parameters: { type: "object" } },
  type: "function"
})

console.log(tool)
```

**Signature**

```ts
declare class OpenAiCompatFunctionTool
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/openai-compat/src/OpenAiCompat.models.ts#L278)

Since v0.0.0

## OpenAiCompatFunctionToolDefinition (class)

Function details sent to OpenAI-compatible chat completion endpoints.

**Example**

```ts
import { OpenAiCompatFunctionToolDefinition } from "@beep/openai-compat"

const definition = OpenAiCompatFunctionToolDefinition.make({
  name: "noop",
  parameters: { type: "object" }
})

console.log(definition)
```

**Signature**

```ts
declare class OpenAiCompatFunctionToolDefinition
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/openai-compat/src/OpenAiCompat.models.ts#L246)

Since v0.0.0

## OpenAiCompatJsonObjectResponseFormat (class)

JSON object response format configuration.

**Example**

```ts
import { OpenAiCompatJsonObjectResponseFormat } from "@beep/openai-compat"

const format = OpenAiCompatJsonObjectResponseFormat.make({ type: "json_object" })

console.log(format)
```

**Signature**

```ts
declare class OpenAiCompatJsonObjectResponseFormat
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/openai-compat/src/OpenAiCompat.models.ts#L611)

Since v0.0.0

## OpenAiCompatJsonSchemaDefinition (class)

JSON schema response-format details for chat completion requests.

**Example**

```ts
import { OpenAiCompatJsonSchemaDefinition } from "@beep/openai-compat"

const definition = OpenAiCompatJsonSchemaDefinition.make({
  name: "Answer",
  schema: { type: "object" },
  strict: true
})

console.log(definition)
```

**Signature**

```ts
declare class OpenAiCompatJsonSchemaDefinition
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/openai-compat/src/OpenAiCompat.models.ts#L488)

Since v0.0.0

## OpenAiCompatJsonSchemaResponseFormat (class)

Structured response format configuration for chat completion requests.

**Example**

```ts
import { OpenAiCompatJsonSchemaResponseFormat } from "@beep/openai-compat"

const format = OpenAiCompatJsonSchemaResponseFormat.make({
  json_schema: { name: "Answer", schema: { type: "object" }, strict: true },
  type: "json_schema"
})

console.log(format)
```

**Signature**

```ts
declare class OpenAiCompatJsonSchemaResponseFormat
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/openai-compat/src/OpenAiCompat.models.ts#L520)

Since v0.0.0

## OpenAiCompatResponseFormat

Response format configuration accepted by OpenAI-compatible chat completion requests.

**Example**

```ts
import type { OpenAiCompatResponseFormat } from "@beep/openai-compat"

const format: OpenAiCompatResponseFormat = { type: "json_object" }

console.log(format)
```

**Signature**

```ts
declare const OpenAiCompatResponseFormat: S.toTaggedUnion<"type", readonly [typeof OpenAiCompatTextResponseFormat, typeof OpenAiCompatJsonObjectResponseFormat, typeof OpenAiCompatJsonSchemaResponseFormat]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/openai-compat/src/OpenAiCompat.models.ts#L637)

Since v0.0.0

## OpenAiCompatResponseFormat (type alias)

Response format configuration accepted by OpenAI-compatible chat completion requests.

**Example**

```ts
import type { OpenAiCompatResponseFormat } from "@beep/openai-compat"

const format: OpenAiCompatResponseFormat = { type: "text" }

console.log(format)
```

**Signature**

```ts
type OpenAiCompatResponseFormat = typeof OpenAiCompatResponseFormat.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/openai-compat/src/OpenAiCompat.models.ts#L665)

Since v0.0.0

## OpenAiCompatResponseFormatKind (type alias)

Type for `OpenAiCompatResponseFormatKind`.

**Example**

```ts
import type { OpenAiCompatResponseFormatKind } from "@beep/openai-compat"

const kind: OpenAiCompatResponseFormatKind = "json_object"

console.log(kind)
```

**Signature**

```ts
type OpenAiCompatResponseFormatKind = typeof OpenAiCompatResponseFormatKind.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/openai-compat/src/OpenAiCompat.models.ts#L568)

Since v0.0.0

## OpenAiCompatSystemChatMessage (class)

System chat message accepted by OpenAI-compatible chat completion endpoints.

**Example**

```ts
import { OpenAiCompatSystemChatMessage } from "@beep/openai-compat"

const message = OpenAiCompatSystemChatMessage.make({
  content: "You are concise.",
  role: "system"
})

console.log(message)
```

**Signature**

```ts
declare class OpenAiCompatSystemChatMessage
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/openai-compat/src/OpenAiCompat.models.ts#L312)

Since v0.0.0

## OpenAiCompatTextResponseFormat (class)

Text response format configuration.

**Example**

```ts
import { OpenAiCompatTextResponseFormat } from "@beep/openai-compat"

const format = OpenAiCompatTextResponseFormat.make({ type: "text" })

console.log(format)
```

**Signature**

```ts
declare class OpenAiCompatTextResponseFormat
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/openai-compat/src/OpenAiCompat.models.ts#L585)

Since v0.0.0

## OpenAiCompatToolCall (class)

Tool call payload emitted by OpenAI-compatible chat completion endpoints.

**Example**

```ts
import { OpenAiCompatToolCall } from "@beep/openai-compat"

const call = OpenAiCompatToolCall.make({
  function: { arguments: "{}", name: "noop" },
  id: "call_1",
  type: "function"
})

console.log(call)
```

**Signature**

```ts
declare class OpenAiCompatToolCall
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/openai-compat/src/OpenAiCompat.models.ts#L157)

Since v0.0.0

## OpenAiCompatToolCallDelta (class)

Incremental tool-call payload emitted by OpenAI-compatible chat completion streams.

**Example**

```ts
import { OpenAiCompatToolCallDelta } from "@beep/openai-compat"

const delta = OpenAiCompatToolCallDelta.make({
  function: { arguments: "{\"city\"" },
  index: 0
})

console.log(delta)
```

**Signature**

```ts
declare class OpenAiCompatToolCallDelta
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/openai-compat/src/OpenAiCompat.models.ts#L216)

Since v0.0.0

## OpenAiCompatToolCallFunction (class)

Function payload inside an OpenAI-compatible tool call.

**Example**

```ts
import { OpenAiCompatToolCallFunction } from "@beep/openai-compat"

const call = OpenAiCompatToolCallFunction.make({
  arguments: "{\"city\":\"Austin\"}",
  name: "weather"
})

console.log(call)
```

**Signature**

```ts
declare class OpenAiCompatToolCallFunction
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/openai-compat/src/OpenAiCompat.models.ts#L126)

Since v0.0.0

## OpenAiCompatToolCallFunctionDelta (class)

Incremental function payload inside an OpenAI-compatible streaming tool-call delta.

**Example**

```ts
import { OpenAiCompatToolCallFunctionDelta } from "@beep/openai-compat"

const delta = OpenAiCompatToolCallFunctionDelta.make({
  arguments: "{\"city\""
})

console.log(delta)
```

**Signature**

```ts
declare class OpenAiCompatToolCallFunctionDelta
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/openai-compat/src/OpenAiCompat.models.ts#L186)

Since v0.0.0

## OpenAiCompatToolChatMessage (class)

Tool chat message accepted by OpenAI-compatible chat completion endpoints.

**Example**

```ts
import { OpenAiCompatToolChatMessage } from "@beep/openai-compat"

const message = OpenAiCompatToolChatMessage.make({
  content: "{}",
  role: "tool",
  tool_call_id: "call_1"
})

console.log(message)
```

**Signature**

```ts
declare class OpenAiCompatToolChatMessage
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/openai-compat/src/OpenAiCompat.models.ts#L405)

Since v0.0.0

## OpenAiCompatUsage (class)

Token usage returned by OpenAI-compatible chat completion endpoints.

**Example**

```ts
import * as O from "effect/Option"
import { OpenAiCompatUsage } from "@beep/openai-compat"

const usage = OpenAiCompatUsage.make({
  completion_tokens: O.some(2),
  prompt_tokens: O.some(1),
  total_tokens: O.some(3)
})

console.log(usage)
```

**Signature**

```ts
declare class OpenAiCompatUsage
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/openai-compat/src/OpenAiCompat.models.ts#L801)

Since v0.0.0

## OpenAiCompatUserChatMessage (class)

User chat message accepted by OpenAI-compatible chat completion endpoints.

**Example**

```ts
import { OpenAiCompatUserChatMessage } from "@beep/openai-compat"

const message = OpenAiCompatUserChatMessage.make({
  content: "Hello",
  role: "user"
})

console.log(message)
```

**Signature**

```ts
declare class OpenAiCompatUserChatMessage
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/openai-compat/src/OpenAiCompat.models.ts#L343)

Since v0.0.0

# schemas

## OpenAiCompatChatMessage

Chat message accepted by OpenAI-compatible chat completion endpoints.

**Example**

```ts
import type { OpenAiCompatChatMessage } from "@beep/openai-compat"

const message: OpenAiCompatChatMessage = {
  content: "Hello",
  role: "user"
}

console.log(message)
```

**Signature**

```ts
declare const OpenAiCompatChatMessage: S.toTaggedUnion<"role", readonly [typeof OpenAiCompatSystemChatMessage, typeof OpenAiCompatUserChatMessage, typeof OpenAiCompatAssistantChatMessage, typeof OpenAiCompatToolChatMessage]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/openai-compat/src/OpenAiCompat.models.ts#L435)

Since v0.0.0

## OpenAiCompatChatRole

Chat roles accepted by OpenAI-compatible chat completion endpoints.

**Example**

```ts
import { OpenAiCompatChatRole } from "@beep/openai-compat"

const isUserRole = OpenAiCompatChatRole.is.user("user")

console.log(isUserRole)
```

**Signature**

```ts
declare const OpenAiCompatChatRole: AnnotatedSchema<LiteralKit<readonly ["system", "user", "assistant", "tool"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/openai-compat/src/OpenAiCompat.models.ts#L41)

Since v0.0.0

## OpenAiCompatFinishReason

Finish reasons emitted by OpenAI-compatible chat completion endpoints.

**Example**

```ts
import { OpenAiCompatFinishReason } from "@beep/openai-compat"

const stopped = OpenAiCompatFinishReason.is.stop("stop")

console.log(stopped)
```

**Signature**

```ts
declare const OpenAiCompatFinishReason: AnnotatedSchema<LiteralKit<readonly ["stop", "length", "tool_calls", "content_filter", "function_call"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/openai-compat/src/OpenAiCompat.models.ts#L79)

Since v0.0.0

## OpenAiCompatResponseFormatKind

Response format discriminator accepted by OpenAI-compatible chat completion requests.

**Example**

```ts
import { OpenAiCompatResponseFormatKind } from "@beep/openai-compat"

const isJsonSchema = OpenAiCompatResponseFormatKind.is.json_schema("json_schema")

console.log(isJsonSchema)
```

**Signature**

```ts
declare const OpenAiCompatResponseFormatKind: AnnotatedSchema<LiteralKit<readonly ["text", "json_object", "json_schema"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/openai-compat/src/OpenAiCompat.models.ts#L547)

Since v0.0.0