---
title: XAi.config.ts
nav_order: 2
parent: "@beep/xai"
---

## XAi.config.ts overview

Runtime configuration models for the xAI driver.

Since v0.0.0

---
## Exports Grouped by Category
- [utilities](#utilities)
  - [XAI_API_URL](#xai_api_url)
  - [XAI_MANAGEMENT_API_URL](#xai_management_api_url)
  - [XAI_WEBSOCKET_URL](#xai_websocket_url)
  - [XAiConfigInput (class)](#xaiconfiginput-class)
---

# utilities

## XAI_API_URL

Default xAI inference API base URL.

**Example**

```ts
import { XAI_API_URL } from "@beep/xai"

console.log(XAI_API_URL)
```

**Signature**

```ts
declare const XAI_API_URL: "https://api.x.ai"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/xai/src/XAi.config.ts#L26)

Since v0.0.0

## XAI_MANAGEMENT_API_URL

Default xAI management API base URL.

**Example**

```ts
import { XAI_MANAGEMENT_API_URL } from "@beep/xai"

console.log(XAI_MANAGEMENT_API_URL)
```

**Signature**

```ts
declare const XAI_MANAGEMENT_API_URL: "https://management-api.x.ai"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/xai/src/XAi.config.ts#L41)

Since v0.0.0

## XAI_WEBSOCKET_URL

Default xAI WebSocket API base URL.

**Example**

```ts
import { XAI_WEBSOCKET_URL } from "@beep/xai"

console.log(XAI_WEBSOCKET_URL)
```

**Signature**

```ts
declare const XAI_WEBSOCKET_URL: "wss://api.x.ai"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/xai/src/XAi.config.ts#L56)

Since v0.0.0

## XAiConfigInput (class)

Runtime configuration accepted by `XAi.makeLayer`.

**Example**

```ts
import { Redacted } from "effect"
import { XAiConfigInput } from "@beep/xai"

const config = XAiConfigInput.make({
  apiKey: Redacted.make("test-key"),
  managementApiKey: Redacted.make("management-test-key")
})

console.log(config)
```

**Signature**

```ts
declare class XAiConfigInput
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/xai/src/XAi.config.ts#L77)

Since v0.0.0