---
title: NodeSdk.ts
nav_order: 18
parent: "@beep/observability"
---

## NodeSdk.ts overview

Node SDK observability layer construction for server runtimes.

Since v0.0.0

---
## Exports Grouped by Category
- [layers](#layers)
  - [layerNodeSdkServer](#layernodesdkserver)
  - [layerNodeSdkServerTraces](#layernodesdkservertraces)
- [models](#models)
  - [NodeSdkServerOptions (class)](#nodesdkserveroptions-class)
- [observability](#observability)
  - [makeNodeSdkServerConfig](#makenodesdkserverconfig)
  - [makeNodeSdkServerTraceConfig](#makenodesdkservertraceconfig)
  - [toNodeSdkResource](#tonodesdkresource)
---

# layers

## layerNodeSdkServer

Build a shared Node SDK layer for server runtimes.

**Example**

```ts
```typescript
import { ServerObservabilityConfig, layerNodeSdkServer } from "@beep/observability/server"

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
const NodeSdkLive = layerNodeSdkServer(config)
console.log(NodeSdkLive)
```
```

**Signature**

```ts
declare const layerNodeSdkServer: { (config: ServerObservabilityConfig, options?: NodeSdkServerOptions | undefined): Layer.Layer<OtelResource.Resource>; (options: NodeSdkServerOptions | undefined): (config: ServerObservabilityConfig) => Layer.Layer<OtelResource.Resource>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/server/NodeSdk.ts#L289)

Since v0.0.0

## layerNodeSdkServerTraces

Build a shared trace-only Node SDK layer for server runtimes.

**Example**

```ts
```typescript
import { ServerObservabilityConfig, layerNodeSdkServerTraces } from "@beep/observability/server"

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
const NodeSdkLive = layerNodeSdkServerTraces(config)
console.log(NodeSdkLive)
```
```

**Signature**

```ts
declare const layerNodeSdkServerTraces: { (config: ServerObservabilityConfig, options?: NodeSdkServerOptions | undefined): Layer.Layer<OtelResource.Resource>; (options: NodeSdkServerOptions | undefined): (config: ServerObservabilityConfig) => Layer.Layer<OtelResource.Resource>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/server/NodeSdk.ts#L326)

Since v0.0.0

# models

## NodeSdkServerOptions (class)

Additional controls for the shared Node SDK layer.

**Example**

```ts
```typescript
import { NodeSdkServerOptions } from "@beep/observability/server"

const options = NodeSdkServerOptions.make({
  loggerMergeWithExisting: true
})
console.log(options.loggerMergeWithExisting)
```
```

**Signature**

```ts
declare class NodeSdkServerOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/server/NodeSdk.ts#L91)

Since v0.0.0

# observability

## makeNodeSdkServerConfig

Build a Node SDK configuration with OTLP HTTP defaults for local LGTM.

**Example**

```ts
```typescript
import { ServerObservabilityConfig, makeNodeSdkServerConfig } from "@beep/observability/server"

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
const sdkConfig = makeNodeSdkServerConfig(config)
console.log(sdkConfig.resource)
```
```

**Signature**

```ts
declare const makeNodeSdkServerConfig: { (config: ServerObservabilityConfig, options?: NodeSdkServerOptions | undefined): NodeSdk.Configuration; (options: NodeSdkServerOptions | undefined): (config: ServerObservabilityConfig) => NodeSdk.Configuration; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/server/NodeSdk.ts#L165)

Since v0.0.0

## makeNodeSdkServerTraceConfig

Build a Node SDK configuration that exports traces only.

**Example**

```ts
```typescript
import { ServerObservabilityConfig, makeNodeSdkServerTraceConfig } from "@beep/observability/server"

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
const sdkConfig = makeNodeSdkServerTraceConfig(config)
console.log(sdkConfig.resource)
```
```

**Signature**

```ts
declare const makeNodeSdkServerTraceConfig: { (config: ServerObservabilityConfig, options?: NodeSdkServerOptions | undefined): NodeSdk.Configuration; (options: NodeSdkServerOptions | undefined): (config: ServerObservabilityConfig) => NodeSdk.Configuration; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/server/NodeSdk.ts#L250)

Since v0.0.0

## toNodeSdkResource

Convert the shared server observability config into a Node SDK resource shape.

**Example**

```ts
```typescript
import { ServerObservabilityConfig, toNodeSdkResource } from "@beep/observability/server"

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
const resource = toNodeSdkResource(config)
console.log(resource.serviceName)
```
```

**Signature**

```ts
declare const toNodeSdkResource: (config: ServerObservabilityConfig) => NonNullable<NodeSdk.Configuration["resource"]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/server/NodeSdk.ts#L136)

Since v0.0.0