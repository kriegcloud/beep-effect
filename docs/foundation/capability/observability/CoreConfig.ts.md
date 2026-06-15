---
title: CoreConfig.ts
nav_order: 2
parent: "@beep/observability"
---

## CoreConfig.ts overview

Browser-safe shared observability configuration schema.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [ObservabilityCoreConfig](#observabilitycoreconfig)
  - [ObservabilityCoreConfig (type alias)](#observabilitycoreconfig-type-alias)
---

# models

## ObservabilityCoreConfig

Browser-safe shared observability configuration.

Carries service identity, environment, and minimum log level for both
client and server observability wiring.

**Example**

```ts
```typescript
import { ObservabilityCoreConfig } from "@beep/observability"

const config: ObservabilityCoreConfig = {
  serviceName: "todox-web",
  serviceVersion: "0.0.0",
  environment: "test",
  minLogLevel: "Info"
}

console.log(config.serviceName) // "todox-web"
```
```

**Signature**

```ts
declare const ObservabilityCoreConfig: AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly minLogLevel: S.tag<"All">; serviceName: S.String; serviceVersion: S.String; environment: S.String; }> & { readonly Type: { readonly minLogLevel: "All"; }; }, S.Struct<{ readonly minLogLevel: S.tag<"Fatal">; serviceName: S.String; serviceVersion: S.String; environment: S.String; }> & { readonly Type: { readonly minLogLevel: "Fatal"; }; }, S.Struct<{ readonly minLogLevel: S.tag<"Error">; serviceName: S.String; serviceVersion: S.String; environment: S.String; }> & { readonly Type: { readonly minLogLevel: "Error"; }; }, S.Struct<{ readonly minLogLevel: S.tag<"Warn">; serviceName: S.String; serviceVersion: S.String; environment: S.String; }> & { readonly Type: { readonly minLogLevel: "Warn"; }; }, S.Struct<{ readonly minLogLevel: S.tag<"Info">; serviceName: S.String; serviceVersion: S.String; environment: S.String; }> & { readonly Type: { readonly minLogLevel: "Info"; }; }, S.Struct<{ readonly minLogLevel: S.tag<"Debug">; serviceName: S.String; serviceVersion: S.String; environment: S.String; }> & { readonly Type: { readonly minLogLevel: "Debug"; }; }, S.Struct<{ readonly minLogLevel: S.tag<"Trace">; serviceName: S.String; serviceVersion: S.String; environment: S.String; }> & { readonly Type: { readonly minLogLevel: "Trace"; }; }, S.Struct<{ readonly minLogLevel: S.tag<"None">; serviceName: S.String; serviceVersion: S.String; environment: S.String; }> & { readonly Type: { readonly minLogLevel: "None"; }; }]> & TaggedUnionUtils<"minLogLevel", readonly [S.Struct<{ readonly minLogLevel: S.tag<"All">; serviceName: S.String; serviceVersion: S.String; environment: S.String; }> & { readonly Type: { readonly minLogLevel: "All"; }; }, S.Struct<{ readonly minLogLevel: S.tag<"Fatal">; serviceName: S.String; serviceVersion: S.String; environment: S.String; }> & { readonly Type: { readonly minLogLevel: "Fatal"; }; }, S.Struct<{ readonly minLogLevel: S.tag<"Error">; serviceName: S.String; serviceVersion: S.String; environment: S.String; }> & { readonly Type: { readonly minLogLevel: "Error"; }; }, S.Struct<{ readonly minLogLevel: S.tag<"Warn">; serviceName: S.String; serviceVersion: S.String; environment: S.String; }> & { readonly Type: { readonly minLogLevel: "Warn"; }; }, S.Struct<{ readonly minLogLevel: S.tag<"Info">; serviceName: S.String; serviceVersion: S.String; environment: S.String; }> & { readonly Type: { readonly minLogLevel: "Info"; }; }, S.Struct<{ readonly minLogLevel: S.tag<"Debug">; serviceName: S.String; serviceVersion: S.String; environment: S.String; }> & { readonly Type: { readonly minLogLevel: "Debug"; }; }, S.Struct<{ readonly minLogLevel: S.tag<"Trace">; serviceName: S.String; serviceVersion: S.String; environment: S.String; }> & { readonly Type: { readonly minLogLevel: "Trace"; }; }, S.Struct<{ readonly minLogLevel: S.tag<"None">; serviceName: S.String; serviceVersion: S.String; environment: S.String; }> & { readonly Type: { readonly minLogLevel: "None"; }; }], [S.Struct<{ readonly minLogLevel: S.tag<"All">; serviceName: S.String; serviceVersion: S.String; environment: S.String; }> & { readonly Type: { readonly minLogLevel: "All"; }; }, S.Struct<{ readonly minLogLevel: S.tag<"Fatal">; serviceName: S.String; serviceVersion: S.String; environment: S.String; }> & { readonly Type: { readonly minLogLevel: "Fatal"; }; }, S.Struct<{ readonly minLogLevel: S.tag<"Error">; serviceName: S.String; serviceVersion: S.String; environment: S.String; }> & { readonly Type: { readonly minLogLevel: "Error"; }; }, S.Struct<{ readonly minLogLevel: S.tag<"Warn">; serviceName: S.String; serviceVersion: S.String; environment: S.String; }> & { readonly Type: { readonly minLogLevel: "Warn"; }; }, S.Struct<{ readonly minLogLevel: S.tag<"Info">; serviceName: S.String; serviceVersion: S.String; environment: S.String; }> & { readonly Type: { readonly minLogLevel: "Info"; }; }, S.Struct<{ readonly minLogLevel: S.tag<"Debug">; serviceName: S.String; serviceVersion: S.String; environment: S.String; }> & { readonly Type: { readonly minLogLevel: "Debug"; }; }, S.Struct<{ readonly minLogLevel: S.tag<"Trace">; serviceName: S.String; serviceVersion: S.String; environment: S.String; }> & { readonly Type: { readonly minLogLevel: "Trace"; }; }, S.Struct<{ readonly minLogLevel: S.tag<"None">; serviceName: S.String; serviceVersion: S.String; environment: S.String; }> & { readonly Type: { readonly minLogLevel: "None"; }; }]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/CoreConfig.ts#L42)

Since v0.0.0

## ObservabilityCoreConfig (type alias)

Type of `ObservabilityCoreConfig`

**Example**

```ts
```typescript
import type { ObservabilityCoreConfig } from "@beep/observability"

const serviceName = (config: ObservabilityCoreConfig) => config.serviceName
console.log(serviceName)
```
```

**Signature**

```ts
type ObservabilityCoreConfig = typeof ObservabilityCoreConfig.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/CoreConfig.ts#L71)

Since v0.0.0