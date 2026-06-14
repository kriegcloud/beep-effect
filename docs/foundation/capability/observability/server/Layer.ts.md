---
title: Layer.ts
nav_order: 17
parent: "@beep/observability"
---

## Layer.ts overview

Server-side observability layer composition for OTLP and devtools.

Since v0.0.0

---
## Exports Grouped by Category
- [layers](#layers)
  - [layerLocalLgtmServer](#layerlocallgtmserver)
---

# layers

## layerLocalLgtmServer

Server-only local LGTM wiring for Effect OTLP + optional devtools.

**Example**

```ts
```typescript
import { Layer } from "effect"
import { ServerObservabilityConfig, layerLocalLgtmServer } from "@beep/observability/server"

declare const config: ServerObservabilityConfig
const ObservabilityLive = layerLocalLgtmServer(config)
console.log(ObservabilityLive)
```
```

**Signature**

```ts
declare const layerLocalLgtmServer: { (config: ServerObservabilityConfig, options?: { readonly shouldPublishDevToolsSpan?: DevToolsSpanFilter | undefined; }): Layer.Layer<never, never, HttpClient.HttpClient>; (options: { readonly shouldPublishDevToolsSpan?: DevToolsSpanFilter | undefined; }): (config: ServerObservabilityConfig) => Layer.Layer<never, never, HttpClient.HttpClient>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/server/Layer.ts#L32)

Since v0.0.0