---
title: XAiEndpoints.models.ts
nav_order: 6
parent: "@beep/xai"
---

## XAiEndpoints.models.ts overview

Checked-in xAI endpoint manifest used to keep the driver complete.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [XAI_ENDPOINTS](#xai_endpoints)
  - [XAI_ENDPOINT_COUNT](#xai_endpoint_count)
  - [XAI_ENDPOINT_METHOD_NAMES](#xai_endpoint_method_names)
  - [XAiAuthKind (type alias)](#xaiauthkind-type-alias)
  - [XAiEndpointBase (type alias)](#xaiendpointbase-type-alias)
  - [XAiEndpointDescriptor (type alias)](#xaiendpointdescriptor-type-alias)
  - [XAiEndpointId (type alias)](#xaiendpointid-type-alias)
  - [XAiEndpointMethodName (type alias)](#xaiendpointmethodname-type-alias)
  - [XAiEndpointStatus (type alias)](#xaiendpointstatus-type-alias)
  - [XAiHttpMethod (type alias)](#xaihttpmethod-type-alias)
  - [XAiRequestBodyKind (type alias)](#xairequestbodykind-type-alias)
  - [XAiResponseBodyKind (type alias)](#xairesponsebodykind-type-alias)
- [schemas](#schemas)
  - [XAiAuthKind](#xaiauthkind)
  - [XAiEndpoint (class)](#xaiendpoint-class)
  - [XAiEndpointBase](#xaiendpointbase)
  - [XAiEndpointId](#xaiendpointid)
  - [XAiEndpointMethodName](#xaiendpointmethodname)
  - [XAiEndpointStatus](#xaiendpointstatus)
  - [XAiHttpMethod](#xaihttpmethod)
  - [XAiRequestBodyKind](#xairequestbodykind)
  - [XAiResponseBodyKind](#xairesponsebodykind)
---

# models

## XAI_ENDPOINTS

Manifest of every xAI endpoint represented by the `XAi` service.

**Example**

```ts
import { XAI_ENDPOINTS } from "@beep/xai"

console.log(XAI_ENDPOINTS.length)
```

**Signature**

```ts
declare const XAI_ENDPOINTS: ReadonlyArray<XAiEndpoint>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/xai/src/XAiEndpoints.models.ts#L595)

Since v0.0.0

## XAI_ENDPOINT_COUNT

Number of xAI endpoints represented in the manifest.

**Example**

```ts
import { XAI_ENDPOINT_COUNT } from "@beep/xai"

console.log(XAI_ENDPOINT_COUNT)
```

**Signature**

```ts
declare const XAI_ENDPOINT_COUNT: 86
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/xai/src/XAiEndpoints.models.ts#L27)

Since v0.0.0

## XAI_ENDPOINT_METHOD_NAMES

Runtime list of public `XAi` endpoint method names.

**Example**

```ts
import { XAI_ENDPOINT_METHOD_NAMES } from "@beep/xai"

console.log(XAI_ENDPOINT_METHOD_NAMES.length)
```

**Signature**

```ts
declare const XAI_ENDPOINT_METHOD_NAMES: ReadonlyArray<"addBatchRequests" | "addCollectionDocument" | "batchGetCollectionDocuments" | "cancelBatch" | "connectRealtimeVoice" | "connectStreamingStt" | "connectStreamingTts" | "createAnthropicCompletion" | "createAnthropicMessage" | "createApiKey" | "createBatch" | "createChatCompletion" | "createCollection" | "createCustomVoice" | "createLegacyCompletion" | "createRealtimeClientSecret" | "createResponse" | "deleteApiKey" | "deleteCollection" | "deleteCollectionDocument" | "deleteCustomVoice" | "deleteFile" | "deleteResponse" | "downloadCustomVoiceAudio" | "downloadFileContent" | "editImage" | "editVideo" | "extendVideo" | "generateImage" | "generateVideo" | "getApiKey" | "getApiKeyPropagation" | "getBatch" | "getBillingInfo" | "getCollection" | "getCollectionDocument" | "getCustomVoice" | "getDeferredChatCompletion" | "getFile" | "getImageGenerationModel" | "getLanguageModel" | "getModel" | "getPostpaidSpendingLimits" | "getPrepaidBalance" | "getResponse" | "getTtsVoice" | "getVideo" | "getVideoGenerationModel" | "initializeFileUpload" | "listApiKeys" | "listAuditEvents" | "listBatchRequests" | "listBatchResults" | "listBatches" | "listCollectionDocuments" | "listCollections" | "listCustomVoices" | "listEndpointAcls" | "listFiles" | "listImageGenerationModels" | "listInvoices" | "listLanguageModels" | "listModels" | "listPaymentMethods" | "listTeamModels" | "listTtsVoices" | "listVideoGenerationModels" | "previewPostpaidInvoice" | "queryUsage" | "regenerateCollectionDocument" | "rotateApiKey" | "searchDocuments" | "setBillingInfo" | "setDefaultPaymentMethod" | "setPostpaidSpendingLimits" | "synthesizeSpeech" | "tokenizeText" | "topUpPrepaidBalance" | "transcribeSpeech" | "updateApiKey" | "updateCollection" | "updateCustomVoice" | "updateFile" | "uploadFile" | "uploadFileChunks" | "validateManagementKey">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/xai/src/XAiEndpoints.models.ts#L395)

Since v0.0.0

## XAiAuthKind (type alias)

Type for `XAiAuthKind`.

**Example**

```ts
import type { XAiAuthKind } from "@beep/xai"

const auth: XAiAuthKind = "api-key"
console.log(auth)
```

**Signature**

```ts
type XAiAuthKind = typeof XAiAuthKind.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/xai/src/XAiEndpoints.models.ts#L103)

Since v0.0.0

## XAiEndpointBase (type alias)

Type for `XAiEndpointBase`.

**Example**

```ts
import type { XAiEndpointBase } from "@beep/xai"

const base: XAiEndpointBase = "api"
console.log(base)
```

**Signature**

```ts
type XAiEndpointBase = typeof XAiEndpointBase.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/xai/src/XAiEndpoints.models.ts#L141)

Since v0.0.0

## XAiEndpointDescriptor (type alias)

Metadata for one documented xAI endpoint.

**Example**

```ts
import type { XAiEndpointDescriptor } from "@beep/xai"

const descriptor: XAiEndpointDescriptor = {
  auth: "api-key",
  base: "api",
  body: "json",
  id: "inference.chat.createCompletion",
  method: "POST",
  methodName: "createChatCompletion",
  path: "/v1/chat/completions",
  response: "json",
  status: "active"
}
console.log(descriptor)
```

**Signature**

```ts
type XAiEndpointDescriptor = XAiEndpoint
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/xai/src/XAiEndpoints.models.ts#L578)

Since v0.0.0

## XAiEndpointId (type alias)

Type for `XAiEndpointId`.

**Example**

```ts
import type { XAiEndpointId } from "@beep/xai"

const endpointId: XAiEndpointId = "inference.models.listModels"
console.log(endpointId)
```

**Signature**

```ts
type XAiEndpointId = typeof XAiEndpointId.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/xai/src/XAiEndpoints.models.ts#L520)

Since v0.0.0

## XAiEndpointMethodName (type alias)

Type for `XAiEndpointMethodName`.

**Example**

```ts
import type { XAiEndpointMethodName } from "@beep/xai"

const methodName: XAiEndpointMethodName = "listModels"
console.log(methodName)
```

**Signature**

```ts
type XAiEndpointMethodName = typeof XAiEndpointMethodName.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/xai/src/XAiEndpoints.models.ts#L380)

Since v0.0.0

## XAiEndpointStatus (type alias)

Type for `XAiEndpointStatus`.

**Example**

```ts
import type { XAiEndpointStatus } from "@beep/xai"

const status: XAiEndpointStatus = "active"
console.log(status)
```

**Signature**

```ts
type XAiEndpointStatus = typeof XAiEndpointStatus.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/xai/src/XAiEndpoints.models.ts#L255)

Since v0.0.0

## XAiHttpMethod (type alias)

Type for `XAiHttpMethod`.

**Example**

```ts
import type { XAiHttpMethod } from "@beep/xai"

const method: XAiHttpMethod = "GET"
console.log(method)
```

**Signature**

```ts
type XAiHttpMethod = typeof XAiHttpMethod.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/xai/src/XAiEndpoints.models.ts#L65)

Since v0.0.0

## XAiRequestBodyKind (type alias)

Type for `XAiRequestBodyKind`.

**Example**

```ts
import type { XAiRequestBodyKind } from "@beep/xai"

const bodyKind: XAiRequestBodyKind = "json"
console.log(bodyKind)
```

**Signature**

```ts
type XAiRequestBodyKind = typeof XAiRequestBodyKind.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/xai/src/XAiEndpoints.models.ts#L179)

Since v0.0.0

## XAiResponseBodyKind (type alias)

Type for `XAiResponseBodyKind`.

**Example**

```ts
import type { XAiResponseBodyKind } from "@beep/xai"

const responseKind: XAiResponseBodyKind = "json"
console.log(responseKind)
```

**Signature**

```ts
type XAiResponseBodyKind = typeof XAiResponseBodyKind.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/xai/src/XAiEndpoints.models.ts#L217)

Since v0.0.0

# schemas

## XAiAuthKind

Authentication channel required by an xAI endpoint.

**Example**

```ts
import type { XAiAuthKind } from "@beep/xai"

const auth: XAiAuthKind = "api-key"
console.log(auth)
```

**Signature**

```ts
declare const XAiAuthKind: AnnotatedSchema<LiteralKit<readonly ["api-key", "management-key"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/xai/src/XAiEndpoints.models.ts#L83)

Since v0.0.0

## XAiEndpoint (class)

Schema for endpoint descriptors stored in `XAI_ENDPOINTS`.

**Example**

```ts
import { XAiEndpoint } from "@beep/xai"
import * as S from "effect/Schema"

const isEndpoint = S.is(XAiEndpoint)
console.log(isEndpoint)
```

**Signature**

```ts
declare class XAiEndpoint
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/xai/src/XAiEndpoints.models.ts#L537)

Since v0.0.0

## XAiEndpointBase

xAI base URL family used by an endpoint.

**Example**

```ts
import type { XAiEndpointBase } from "@beep/xai"

const base: XAiEndpointBase = "management"
console.log(base)
```

**Signature**

```ts
declare const XAiEndpointBase: AnnotatedSchema<LiteralKit<readonly ["api", "management", "websocket"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/xai/src/XAiEndpoints.models.ts#L121)

Since v0.0.0

## XAiEndpointId

Stable endpoint identifiers in the checked-in xAI manifest.

**Example**

```ts
import type { XAiEndpointId } from "@beep/xai"

const endpoint: XAiEndpointId = "inference.chat.createCompletion"
console.log(endpoint)
```

**Signature**

```ts
declare const XAiEndpointId: AnnotatedSchema<LiteralKit<readonly ["inference.chat.createCompletion", "inference.chat.createResponse", "inference.chat.getResponse", "inference.chat.deleteResponse", "inference.chat.getDeferredCompletion", "inference.models.listModels", "inference.models.getModel", "inference.models.listLanguageModels", "inference.models.getLanguageModel", "inference.models.listImageGenerationModels", "inference.models.getImageGenerationModel", "inference.models.listVideoGenerationModels", "inference.models.getVideoGenerationModel", "inference.images.generate", "inference.images.edit", "inference.videos.generate", "inference.videos.edit", "inference.videos.extend", "inference.videos.get", "inference.batches.create", "inference.batches.list", "inference.batches.get", "inference.batches.listRequests", "inference.batches.addRequests", "inference.batches.listResults", "inference.batches.cancel", "inference.audio.transcribe", "inference.audio.connectStreamingStt", "inference.voice.createRealtimeClientSecret", "inference.voice.connectRealtime", "inference.voice.synthesizeSpeech", "inference.voice.connectStreamingTts", "inference.voice.listTtsVoices", "inference.voice.getTtsVoice", "inference.voice.createCustomVoice", "inference.voice.listCustomVoices", "inference.voice.getCustomVoice", "inference.voice.updateCustomVoice", "inference.voice.deleteCustomVoice", "inference.voice.downloadCustomVoiceAudio", "inference.other.getApiKey", "inference.other.tokenizeText", "inference.legacy.createCompletion", "inference.legacy.createAnthropicMessage", "inference.legacy.createAnthropicCompletion", "files.upload", "files.initializeUpload", "files.uploadChunks", "files.list", "files.get", "files.update", "files.delete", "files.downloadContent", "collections.searchDocuments", "collections.create", "collections.list", "collections.get", "collections.delete", "collections.update", "collections.addDocument", "collections.listDocuments", "collections.getDocument", "collections.regenerateDocument", "collections.deleteDocument", "collections.batchGetDocuments", "management.auth.createApiKey", "management.auth.listApiKeys", "management.auth.updateApiKey", "management.auth.rotateApiKey", "management.auth.deleteApiKey", "management.auth.getApiKeyPropagation", "management.auth.listTeamModels", "management.auth.listEndpointAcls", "management.auth.validateManagementKey", "management.billing.getBillingInfo", "management.billing.setBillingInfo", "management.billing.listInvoices", "management.billing.listPaymentMethods", "management.billing.setDefaultPaymentMethod", "management.billing.previewPostpaidInvoice", "management.billing.getPostpaidSpendingLimits", "management.billing.setPostpaidSpendingLimits", "management.billing.getPrepaidBalance", "management.billing.topUpPrepaidBalance", "management.billing.queryUsage", "management.audit.listEvents"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/xai/src/XAiEndpoints.models.ts#L500)

Since v0.0.0

## XAiEndpointMethodName

Public `XAi` service method names that correspond to documented endpoints.

**Example**

```ts
import type { XAiEndpointMethodName } from "@beep/xai"

const method: XAiEndpointMethodName = "createChatCompletion"
console.log(method)
```

**Signature**

```ts
declare const XAiEndpointMethodName: AnnotatedSchema<LiteralKit<readonly ["addBatchRequests", "addCollectionDocument", "batchGetCollectionDocuments", "cancelBatch", "connectRealtimeVoice", "connectStreamingStt", "connectStreamingTts", "createAnthropicCompletion", "createAnthropicMessage", "createApiKey", "createBatch", "createChatCompletion", "createCollection", "createCustomVoice", "createLegacyCompletion", "createRealtimeClientSecret", "createResponse", "deleteApiKey", "deleteCollection", "deleteCollectionDocument", "deleteCustomVoice", "deleteFile", "deleteResponse", "downloadCustomVoiceAudio", "downloadFileContent", "editImage", "editVideo", "extendVideo", "generateImage", "generateVideo", "getApiKey", "getApiKeyPropagation", "getBatch", "getBillingInfo", "getCollection", "getCollectionDocument", "getCustomVoice", "getDeferredChatCompletion", "getFile", "getImageGenerationModel", "getLanguageModel", "getModel", "getPostpaidSpendingLimits", "getPrepaidBalance", "getResponse", "getTtsVoice", "getVideo", "getVideoGenerationModel", "initializeFileUpload", "listApiKeys", "listAuditEvents", "listBatchRequests", "listBatchResults", "listBatches", "listCollectionDocuments", "listCollections", "listCustomVoices", "listEndpointAcls", "listFiles", "listImageGenerationModels", "listInvoices", "listLanguageModels", "listModels", "listPaymentMethods", "listTeamModels", "listTtsVoices", "listVideoGenerationModels", "previewPostpaidInvoice", "queryUsage", "regenerateCollectionDocument", "rotateApiKey", "searchDocuments", "setBillingInfo", "setDefaultPaymentMethod", "setPostpaidSpendingLimits", "synthesizeSpeech", "tokenizeText", "topUpPrepaidBalance", "transcribeSpeech", "updateApiKey", "updateCollection", "updateCustomVoice", "updateFile", "uploadFile", "uploadFileChunks", "validateManagementKey"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/xai/src/XAiEndpoints.models.ts#L360)

Since v0.0.0

## XAiEndpointStatus

Documentation status for an xAI endpoint.

**Example**

```ts
import type { XAiEndpointStatus } from "@beep/xai"

const status: XAiEndpointStatus = "active"
console.log(status)
```

**Signature**

```ts
declare const XAiEndpointStatus: AnnotatedSchema<LiteralKit<readonly ["active", "deprecated", "documented-unknown"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/xai/src/XAiEndpoints.models.ts#L235)

Since v0.0.0

## XAiHttpMethod

HTTP method literals used by xAI REST endpoints.

**Example**

```ts
import type { XAiHttpMethod } from "@beep/xai"

const method: XAiHttpMethod = "POST"
console.log(method)
```

**Signature**

```ts
declare const XAiHttpMethod: AnnotatedSchema<LiteralKit<readonly ["DELETE", "GET", "PATCH", "POST", "PUT"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/xai/src/XAiEndpoints.models.ts#L45)

Since v0.0.0

## XAiRequestBodyKind

Request body encoding used by an xAI endpoint.

**Example**

```ts
import type { XAiRequestBodyKind } from "@beep/xai"

const bodyKind: XAiRequestBodyKind = "json"
console.log(bodyKind)
```

**Signature**

```ts
declare const XAiRequestBodyKind: AnnotatedSchema<LiteralKit<readonly ["binary", "json", "multipart", "none", "websocket"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/xai/src/XAiEndpoints.models.ts#L159)

Since v0.0.0

## XAiResponseBodyKind

Response body encoding returned by an xAI endpoint.

**Example**

```ts
import type { XAiResponseBodyKind } from "@beep/xai"

const responseKind: XAiResponseBodyKind = "json"
console.log(responseKind)
```

**Signature**

```ts
declare const XAiResponseBodyKind: AnnotatedSchema<LiteralKit<readonly ["binary", "json", "none", "sse", "websocket"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/xai/src/XAiEndpoints.models.ts#L197)

Since v0.0.0