---
title: Box.config.ts
nav_order: 2
parent: "@beep/box"
---

## Box.config.ts overview

Box driver configuration models and Layers.

Since v0.0.0

---
## Exports Grouped by Category
- [layers](#layers)
  - [BoxConfigLayer](#boxconfiglayer)
  - [layer](#layer)
  - [layerConfig](#layerconfig)
- [models](#models)
  - [BoxCcgConfig (class)](#boxccgconfig-class)
  - [BoxDeveloperTokenConfig (class)](#boxdevelopertokenconfig-class)
- [services](#services)
  - [BoxConfig (class)](#boxconfig-class)
---

# layers

## BoxConfigLayer

Live developer-token configuration layer backed by `CLOUD_BOX_TOKEN`.

**Example**

```ts
import { BoxConfigLayer } from "@beep/box"

console.log(BoxConfigLayer)
```

**Signature**

```ts
declare const BoxConfigLayer: Layer.Layer<BoxConfig, BoxError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/box/src/Box.config.ts#L108)

Since v0.0.0

## layer

Backward-compatible alias for `BoxConfigLayer`.

**Example**

```ts
import { layer } from "@beep/box"

console.log(layer)
```

**Signature**

```ts
declare const layer: Layer.Layer<BoxConfig, BoxError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/box/src/Box.config.ts#L135)

Since v0.0.0

## layerConfig

Construct a developer-token configuration layer from an explicit token.

**Example**

```ts
import { layerConfig } from "@beep/box"
import { Redacted } from "effect"

const layer = layerConfig(Redacted.make("box-token"))
console.log(layer)
```

**Signature**

```ts
declare const layerConfig: (token: Redacted.Redacted<string>) => Layer.Layer<BoxConfig>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/box/src/Box.config.ts#L152)

Since v0.0.0

# models

## BoxCcgConfig (class)

Client Credentials Grant configuration for enterprise Box access.

**Example**

```ts
import { BoxCcgConfig } from "@beep/box"
import { Redacted } from "effect"

const config = BoxCcgConfig.make({
  clientId: "client-id",
  clientSecret: Redacted.make("client-secret"),
  enterpriseId: "enterprise-id"
})
console.log(config.enterpriseId)
```

**Signature**

```ts
declare class BoxCcgConfig
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/box/src/Box.config.ts#L73)

Since v0.0.0

## BoxDeveloperTokenConfig (class)

Developer-token configuration for local Box access.

**Example**

```ts
import { BoxDeveloperTokenConfig } from "@beep/box"
import { Redacted } from "effect"

const config = BoxDeveloperTokenConfig.make({ token: Redacted.make("box-token") })
console.log(config)
```

**Signature**

```ts
declare class BoxDeveloperTokenConfig
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/box/src/Box.config.ts#L45)

Since v0.0.0

# services

## BoxConfig (class)

Box developer-token configuration service.

**Example**

```ts
import { BoxConfig } from "@beep/box"

console.log(BoxConfig)
```

**Signature**

```ts
declare class BoxConfig
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/box/src/Box.config.ts#L93)

Since v0.0.0