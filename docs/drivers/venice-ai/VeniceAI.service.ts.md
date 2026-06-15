---
title: VeniceAI.service.ts
nav_order: 2
parent: "@beep/venice-ai"
---

## VeniceAI.service.ts overview

Product-neutral Venice AI API driver.

Since v0.0.0

---
## Exports Grouped by Category
- [errors](#errors)
  - [VeniceAIError (class)](#veniceaierror-class)
  - [VeniceAIErrorReason](#veniceaierrorreason)
  - [VeniceAIErrorReason (type alias)](#veniceaierrorreason-type-alias)
  - [VeniceAiChatError](#veniceaichaterror)
  - [VeniceAiChatError (type alias)](#veniceaichaterror-type-alias)
- [models](#models)
  - [VENICE_AI_OPERATION_DESCRIPTORS](#venice_ai_operation_descriptors)
  - [VeniceAIBinaryResponse (class)](#veniceaibinaryresponse-class)
  - [VeniceAIConfigInput (class)](#veniceaiconfiginput-class)
  - [VeniceAIHttpMethod](#veniceaihttpmethod)
  - [VeniceAIHttpMethod (type alias)](#veniceaihttpmethod-type-alias)
  - [VeniceAIJsonResponse (class)](#veniceaijsonresponse-class)
  - [VeniceAIOperationDescriptor (class)](#veniceaioperationdescriptor-class)
  - [VeniceAIOperationId](#veniceaioperationid)
  - [VeniceAIOperationId (type alias)](#veniceaioperationid-type-alias)
  - [VeniceAIQueryValue](#veniceaiqueryvalue)
  - [VeniceAIQueryValue (type alias)](#veniceaiqueryvalue-type-alias)
  - [VeniceAIRequestOptions (class)](#veniceairequestoptions-class)
  - [VeniceAIResponse](#veniceairesponse)
  - [VeniceAIResponse (type alias)](#veniceairesponse-type-alias)
  - [VeniceAIServerSentEvent (class)](#veniceaiserversentevent-class)
  - [VeniceAITextResponse (class)](#veniceaitextresponse-class)
- [services](#services)
  - [VeniceAI (class)](#veniceai-class)
  - [VeniceAIMethod (type alias)](#veniceaimethod-type-alias)
  - [VeniceAIShape (type alias)](#veniceaishape-type-alias)
  - [VeniceAIStreamMethod (type alias)](#veniceaistreammethod-type-alias)
  - [VeniceAiChat (class)](#veniceaichat-class)
- [utilities](#utilities)
  - [VENICE_API_URL](#venice_api_url)
  - [VENICE_CHAT_MODEL](#venice_chat_model)
---

# errors

## VeniceAIError (class)

Technical failure raised by the Venice AI driver boundary.

**Example**

```ts
import { VeniceAIError } from "@beep/venice-ai"

const error = VeniceAIError.make({
  method: "GET",
  operation: "listModels",
  path: "/models",
  reason: "response status",
  status: 500
})

console.log(error)
```

**Signature**

```ts
declare class VeniceAIError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/venice-ai/src/VeniceAI.service.ts#L544)

Since v0.0.0

## VeniceAIErrorReason

Technical error reasons emitted by the Venice AI driver.

**Example**

```ts
import type { VeniceAIErrorReason } from "@beep/venice-ai"

const reason: VeniceAIErrorReason = "response status"
console.log(reason)
```

**Signature**

```ts
declare const VeniceAIErrorReason: AnnotatedSchema<LiteralKit<readonly ["config", "multipart encoding", "request encoding", "response decoding", "response status", "sse decoding", "transport"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/venice-ai/src/VeniceAI.service.ts#L192)

Since v0.0.0

## VeniceAIErrorReason (type alias)

Type for `VeniceAIErrorReason`.

**Example**

```ts
import type { VeniceAIErrorReason } from "@beep/venice-ai"

const reason: VeniceAIErrorReason = "transport"
console.log(reason)
```

**Signature**

```ts
type VeniceAIErrorReason = typeof VeniceAIErrorReason.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/venice-ai/src/VeniceAI.service.ts#L220)

Since v0.0.0

## VeniceAiChatError

Compatibility alias for older chat-wrapper consumers.

**Example**

```ts
import { VeniceAiChatError } from "@beep/venice-ai"

const error = VeniceAiChatError.config()
console.log(error)
```

**Signature**

```ts
declare const VeniceAiChatError: typeof VeniceAIError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/venice-ai/src/VeniceAI.service.ts#L640)

Since v0.0.0

## VeniceAiChatError (type alias)

Type alias for the centralized Venice AI driver error.

**Example**

```ts
import type { VeniceAiChatError } from "@beep/venice-ai"

const reason = (error: VeniceAiChatError) => error.reason
console.log(reason)
```

**Signature**

```ts
type VeniceAiChatError = VeniceAIError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/venice-ai/src/VeniceAI.service.ts#L656)

Since v0.0.0

# models

## VENICE_AI_OPERATION_DESCRIPTORS

Operation registry derived from `swagger.yaml`.

**Example**

```ts
import { VENICE_AI_OPERATION_DESCRIPTORS } from "@beep/venice-ai"
import { A } from "@beep/utils"
import { pipe } from "effect"

const operationIds = pipe(
  VENICE_AI_OPERATION_DESCRIPTORS,
  A.map((operation) => operation.operationId)
)
console.log(operationIds)
```

**Signature**

```ts
declare const VENICE_AI_OPERATION_DESCRIPTORS: ReadonlyArray<VeniceAIOperationDescriptor>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/venice-ai/src/VeniceAI.service.ts#L1192)

Since v0.0.0

## VeniceAIBinaryResponse (class)

Binary response returned by the Venice AI driver.

**Example**

```ts
import { VeniceAIBinaryResponse } from "@beep/venice-ai"

const response = VeniceAIBinaryResponse.make({
  bytes: new Uint8Array([1, 2, 3]),
  contentType: "image/png",
  headers: {},
  status: 200
})

console.log(response)
```

**Signature**

```ts
declare class VeniceAIBinaryResponse
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/venice-ai/src/VeniceAI.service.ts#L441)

Since v0.0.0

## VeniceAIConfigInput (class)

Runtime configuration accepted by `VeniceAI.makeLayer`.

**Example**

```ts
import { Redacted } from "effect"
import { VeniceAIConfigInput } from "@beep/venice-ai"

const config = VeniceAIConfigInput.make({
  apiKey: Redacted.make("test-key"),
  baseUrl: "https://api.venice.ai/api/v1"
})

console.log(config)
```

**Signature**

```ts
declare class VeniceAIConfigInput
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/venice-ai/src/VeniceAI.service.ts#L317)

Since v0.0.0

## VeniceAIHttpMethod

Supported HTTP methods in the checked-in Venice OpenAPI document.

**Example**

```ts
import type { VeniceAIHttpMethod } from "@beep/venice-ai"

const method: VeniceAIHttpMethod = "GET"
console.log(method)
```

**Signature**

```ts
declare const VeniceAIHttpMethod: AnnotatedSchema<LiteralKit<readonly ["DELETE", "GET", "PATCH", "POST"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/venice-ai/src/VeniceAI.service.ts#L71)

Since v0.0.0

## VeniceAIHttpMethod (type alias)

Type for `VeniceAIHttpMethod`.

**Example**

```ts
import type { VeniceAIHttpMethod } from "@beep/venice-ai"

const method: VeniceAIHttpMethod = "POST"
console.log(method)
```

**Signature**

```ts
type VeniceAIHttpMethod = typeof VeniceAIHttpMethod.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/venice-ai/src/VeniceAI.service.ts#L91)

Since v0.0.0

## VeniceAIJsonResponse (class)

JSON response returned by the Venice AI driver.

**Example**

```ts
import { VeniceAIJsonResponse } from "@beep/venice-ai"

const response = VeniceAIJsonResponse.make({
  body: { ok: true },
  headers: {},
  status: 200
})

console.log(response)
```

**Signature**

```ts
declare class VeniceAIJsonResponse
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/venice-ai/src/VeniceAI.service.ts#L375)

Since v0.0.0

## VeniceAIOperationDescriptor (class)

OpenAPI operation descriptor used by the service and coverage tests.

**Example**

```ts
import { VENICE_AI_OPERATION_DESCRIPTORS } from "@beep/venice-ai"

console.log(VENICE_AI_OPERATION_DESCRIPTORS.length)
```

**Signature**

```ts
declare class VeniceAIOperationDescriptor
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/venice-ai/src/VeniceAI.service.ts#L341)

Since v0.0.0

## VeniceAIOperationId

Public operation identifiers from `packages/drivers/venice-ai/swagger.yaml`.

**Example**

```ts
import type { VeniceAIOperationId } from "@beep/venice-ai"

const operation: VeniceAIOperationId = "listModels"
console.log(operation)
```

**Signature**

```ts
declare const VeniceAIOperationId: AnnotatedSchema<LiteralKit<readonly ["backgroundRemoveImage", "completeAudio", "completeVideo", "createApiKey", "createChatCompletion", "createClonedVoice", "createEmbedding", "createResponse", "createSpeech", "createTextParser", "createTranscription", "createVideoTranscription", "cryptoRpcProxy", "deleteApiKey", "editImage", "generateImage", "getApiKeyById", "getApiKeyGenerateWeb3Key", "getApiKeyRateLimitLogs", "getApiKeyRateLimits", "getApiKeys", "getBillingBalance", "getBillingUsage", "getBillingUsageAnalytics", "getCharacterBySlug", "getCharacterReviews", "getX402Balance", "getX402Transactions", "listCharacters", "listCryptoRpcNetworks", "listImageStyles", "listModelCompatibilityMapping", "listModelTraits", "listModels", "multiEditImage", "postApiKeyGenerateWeb3Key", "queueAudio", "queueVideo", "quoteAudio", "quoteVideo", "retrieveAudio", "retrieveVideo", "simpleGenerateImage", "topUpX402Balance", "upscaleImage", "updateApiKey", "webScrape", "webSearch"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/venice-ai/src/VeniceAI.service.ts#L107)

Since v0.0.0

## VeniceAIOperationId (type alias)

Type for `VeniceAIOperationId`.

**Example**

```ts
import type { VeniceAIOperationId } from "@beep/venice-ai"

const operation: VeniceAIOperationId = "createChatCompletion"
console.log(operation)
```

**Signature**

```ts
type VeniceAIOperationId = typeof VeniceAIOperationId.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/venice-ai/src/VeniceAI.service.ts#L176)

Since v0.0.0

## VeniceAIQueryValue

Query parameter value accepted by Venice request options.

**Example**

```ts
import type { VeniceAIQueryValue } from "@beep/venice-ai"

const value: VeniceAIQueryValue = ["image", "text"]
console.log(value)
```

**Signature**

```ts
declare const VeniceAIQueryValue: AnnotatedSchema<S.Union<readonly [S.$Array<S.Union<readonly [S.Boolean, S.Finite, S.String]>>, S.Boolean, S.Finite, S.String]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/venice-ai/src/VeniceAI.service.ts#L236)

Since v0.0.0

## VeniceAIQueryValue (type alias)

Type for `VeniceAIQueryValue`.

**Example**

```ts
import type { VeniceAIQueryValue } from "@beep/venice-ai"

const query: VeniceAIQueryValue = 10
console.log(query)
```

**Signature**

```ts
type VeniceAIQueryValue = typeof VeniceAIQueryValue.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/venice-ai/src/VeniceAI.service.ts#L261)

Since v0.0.0

## VeniceAIRequestOptions (class)

Request options accepted by each Venice API operation method.

`path` fills OpenAPI path parameters, `query` fills URL parameters, `body`
sends JSON, and `formData` sends multipart/form-data.

**Example**

```ts
import { VeniceAIRequestOptions } from "@beep/venice-ai"

const request = VeniceAIRequestOptions.make({
  body: { model: "venice-uncensored-1-2" },
  query: { limit: 10 }
})

console.log(request)
```

**Signature**

```ts
declare class VeniceAIRequestOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/venice-ai/src/VeniceAI.service.ts#L284)

Since v0.0.0

## VeniceAIResponse

Response union returned by non-streaming Venice API operation methods.

**Example**

```ts
import type { VeniceAIResponse } from "@beep/venice-ai"

const tag = (response: VeniceAIResponse) => response._tag
console.log(tag)
```

**Signature**

```ts
declare const VeniceAIResponse: AnnotatedSchema<S.Union<readonly [typeof VeniceAIBinaryResponse, typeof VeniceAIJsonResponse, typeof VeniceAITextResponse]> & TaggedUnionUtils<"_tag", readonly [typeof VeniceAIBinaryResponse, typeof VeniceAIJsonResponse, typeof VeniceAITextResponse], [typeof VeniceAIBinaryResponse, typeof VeniceAIJsonResponse, typeof VeniceAITextResponse]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/venice-ai/src/VeniceAI.service.ts#L468)

Since v0.0.0

## VeniceAIResponse (type alias)

Type for `VeniceAIResponse`.

**Example**

```ts
import type { VeniceAIResponse } from "@beep/venice-ai"

const getStatus = (response: VeniceAIResponse) => response.status
console.log(getStatus)
```

**Signature**

```ts
type VeniceAIResponse = typeof VeniceAIResponse.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/venice-ai/src/VeniceAI.service.ts#L489)

Since v0.0.0

## VeniceAIServerSentEvent (class)

Parsed server-sent event emitted by Venice streaming endpoints.

**Example**

```ts
import { VeniceAIServerSentEvent } from "@beep/venice-ai"

const event = VeniceAIServerSentEvent.make({
  data: { delta: "hello" },
  done: false,
  index: 0
})

console.log(event)
```

**Signature**

```ts
declare class VeniceAIServerSentEvent
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/venice-ai/src/VeniceAI.service.ts#L510)

Since v0.0.0

## VeniceAITextResponse (class)

Text response returned by the Venice AI driver.

**Example**

```ts
import { VeniceAITextResponse } from "@beep/venice-ai"

const response = VeniceAITextResponse.make({
  contentType: "text/plain",
  headers: {},
  status: 200,
  text: "ok"
})

console.log(response)
```

**Signature**

```ts
declare class VeniceAITextResponse
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/venice-ai/src/VeniceAI.service.ts#L408)

Since v0.0.0

# services

## VeniceAI (class)

Effect service for Venice AI API operations.

**Example**

```ts
import { Effect } from "effect"
import { VeniceAI } from "@beep/venice-ai"

const program = Effect.gen(function* () {
  const venice = yield* VeniceAI
  return yield* venice.listModels()
})
console.log(program)
```

**Signature**

```ts
declare class VeniceAI
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/venice-ai/src/VeniceAI.service.ts#L1833)

Since v0.0.0

## VeniceAIMethod (type alias)

Non-streaming Venice API operation method.

**Example**

```ts
import type { VeniceAIMethod } from "@beep/venice-ai"

const operation = (method: VeniceAIMethod) => method
console.log(operation)
```

**Signature**

```ts
type VeniceAIMethod = (request?: VeniceAIRequestOptions) => Effect.Effect<VeniceAIResponse, VeniceAIError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/venice-ai/src/VeniceAI.service.ts#L1257)

Since v0.0.0

## VeniceAIShape (type alias)

Runtime shape exposed by the `VeniceAI` service.

**Example**

```ts
import type { VeniceAIShape } from "@beep/venice-ai"

const operation = (venice: VeniceAIShape) => venice.listModels()
console.log(operation)
```

**Signature**

```ts
type VeniceAIShape = VeniceAINonStreamingShape & {
  readonly streamChatCompletion: VeniceAIStreamMethod;
  readonly streamResponse: VeniceAIStreamMethod;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/venice-ai/src/VeniceAI.service.ts#L1295)

Since v0.0.0

## VeniceAIStreamMethod (type alias)

Streaming Venice API operation method.

**Example**

```ts
import type { VeniceAIStreamMethod } from "@beep/venice-ai"

const operation = (stream: VeniceAIStreamMethod) => stream
console.log(operation)
```

**Signature**

```ts
type VeniceAIStreamMethod = (
  request?: VeniceAIRequestOptions
) => Stream.Stream<VeniceAIServerSentEvent, VeniceAIError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/venice-ai/src/VeniceAI.service.ts#L1273)

Since v0.0.0

## VeniceAiChat (class)

Compatibility chat convenience backed by `VeniceAI.createChatCompletion`.

**Example**

```ts
import { Effect } from "effect"
import { VeniceAiChat } from "@beep/venice-ai"

const program = Effect.gen(function* () {
  const venice = yield* VeniceAiChat
  return yield* venice.chat("What is your favorite joke?")
})
console.log(program)
```

**Signature**

```ts
declare class VeniceAiChat
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/venice-ai/src/VeniceAI.service.ts#L1902)

Since v0.0.0

# utilities

## VENICE_API_URL

Venice API base URL used by the live layer.

**Example**

```ts
import { VENICE_API_URL } from "@beep/venice-ai"

console.log(VENICE_API_URL)
```

**Signature**

```ts
declare const VENICE_API_URL: "https://api.venice.ai/api/v1"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/venice-ai/src/VeniceAI.service.ts#L40)

Since v0.0.0

## VENICE_CHAT_MODEL

Default Venice text model used by the compatibility chat service.

**Example**

```ts
import { VENICE_CHAT_MODEL } from "@beep/venice-ai"

console.log(VENICE_CHAT_MODEL)
```

**Signature**

```ts
declare const VENICE_CHAT_MODEL: "venice-uncensored-1-2"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/venice-ai/src/VeniceAI.service.ts#L55)

Since v0.0.0