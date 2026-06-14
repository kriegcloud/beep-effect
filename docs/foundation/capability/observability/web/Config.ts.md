---
title: Config.ts
nav_order: 21
parent: "@beep/observability"
---

## Config.ts overview

Browser observability configuration and resource conversion helpers.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [WebObservabilityConfig (class)](#webobservabilityconfig-class)
- [observability](#observability)
  - [toWebResource](#towebresource)
---

# models

## WebObservabilityConfig (class)

Browser-only observability configuration.

**Example**

```ts
```typescript
import { WebObservabilityConfig } from "@beep/observability/web"

const config = WebObservabilityConfig.make({
  serviceName: "todox-web",
  serviceVersion: "0.0.0",
  environment: "development",
  minLogLevel: "Info",
  resourceAttributes: {},
})

console.log(config.serviceName) // "todox-web"
```
```

**Signature**

```ts
declare class WebObservabilityConfig
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/web/Config.ts#L34)

Since v0.0.0

# observability

## toWebResource

Convert browser config into an OpenTelemetry resource shape.

**Example**

```ts
```typescript
import { WebObservabilityConfig, toWebResource } from "@beep/observability/web"

const config = WebObservabilityConfig.make({
  serviceName: "todox-web",
  serviceVersion: "0.0.0",
  environment: "development",
  minLogLevel: "Info",
  resourceAttributes: {},
})

const resource = toWebResource(config)
console.log(resource.serviceName) // "todox-web"
```
```

**Signature**

```ts
declare const toWebResource: (config: WebObservabilityConfig) => { serviceName: string; serviceVersion: string; attributes: { deployment_environment: string; }; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/web/Config.ts#L69)

Since v0.0.0