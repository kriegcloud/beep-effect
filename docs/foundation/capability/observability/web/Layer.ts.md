---
title: Layer.ts
nav_order: 23
parent: "@beep/observability"
---

## Layer.ts overview

Browser observability layer construction for the Effect web SDK.

Since v0.0.0

---
## Exports Grouped by Category
- [layers](#layers)
  - [layerWebSdk](#layerwebsdk)
---

# layers

## layerWebSdk

Thin browser-safe wrapper around `@effect/opentelemetry/WebSdk.layer`.

**Example**

```ts
```typescript
import { WebObservabilityConfig } from "@beep/observability/web"
import { layerWebSdk } from "@beep/observability/web"

const config = WebObservabilityConfig.make({
  serviceName: "todox-web",
  serviceVersion: "0.0.0",
  environment: "development",
  minLogLevel: "Info",
  resourceAttributes: {},
})

const layer = layerWebSdk(config)
console.log(layer)
```
```

**Signature**

```ts
declare const layerWebSdk: (config: WebObservabilityConfig) => Layer.Layer<import("@effect/opentelemetry/Resource").Resource>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/web/Layer.ts#L35)

Since v0.0.0