---
title: Config.ts
nav_order: 12
parent: "@beep/observability"
---

## Config.ts overview

Server observability configuration and resource conversion helpers.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [ServerObservabilityConfig (class)](#serverobservabilityconfig-class)
- [observability](#observability)
  - [toOtlpResource](#tootlpresource)
---

# models

## ServerObservabilityConfig (class)

Server-only observability configuration.

**Example**

```ts
```typescript
import { ServerObservabilityConfig } from "@beep/observability/server"

const config = ServerObservabilityConfig.make({
  devtoolsEnabled: false,
  devtoolsUrl: "ws://localhost:34437",
  environment: "test",
  minLogLevel: "Info",
  otlpBaseUrl: "http://localhost:4318",
  otlpEnabled: false,
  otlpResourceAttributes: {},
  prometheusPrefix: "beep",
  serviceName: "beep",
  serviceVersion: "0.0.0"
})
console.log(config.serviceName)
```
```

**Signature**

```ts
declare class ServerObservabilityConfig
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/server/Config.ts#L38)

Since v0.0.0

# observability

## toOtlpResource

Convert server config into OTLP resource attributes.

**Example**

```ts
```typescript
import { ServerObservabilityConfig, toOtlpResource } from "@beep/observability/server"

declare const config: ServerObservabilityConfig
const resource = toOtlpResource(config)
console.log(resource.serviceName)
```
```

**Signature**

```ts
declare const toOtlpResource: (config: ServerObservabilityConfig) => { serviceName: string; serviceVersion: string; attributes: { deployment_environment: string; }; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/server/Config.ts#L71)

Since v0.0.0