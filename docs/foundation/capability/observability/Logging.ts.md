---
title: Logging.ts
nav_order: 8
parent: "@beep/observability"
---

## Logging.ts overview

Configurable console logging layer for Effect applications.

Supports multiple output formats (`pretty`, `structured`, `json`, `logfmt`,
`string`) and themeable pretty-printing with ANSI colors.

**Example**

```ts
```typescript
import { Effect, Layer } from "effect"
import { LoggingConfig, layerConsoleLogger } from "@beep/observability"

const config = LoggingConfig.make({ format: "pretty", minLogLevel: "Info" })
const loggerLayer = layerConsoleLogger(config)

const program = Effect.log("hello from pretty logger").pipe(

)

console.log(Effect.runPromise(program))
```
```

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [BannerMode](#bannermode)
  - [BannerMode (type alias)](#bannermode-type-alias)
  - [LogFormat](#logformat)
  - [LogFormat (type alias)](#logformat-type-alias)
  - [LoggingConfig (class)](#loggingconfig-class)
  - [PrettyLogTheme](#prettylogtheme)
  - [PrettyLogTheme (type alias)](#prettylogtheme-type-alias)
  - [PrettyLoggerConfig (class)](#prettyloggerconfig-class)
- [observability](#observability)
  - [renderLogBanner](#renderlogbanner)
---

# layers

## layerConsoleLogger

Build a console logger layer from a shared logging config.

Returns a `Layer<never>` that replaces the default Effect logger with the
configured format and sets the minimum log level.

**Example**

```ts
```typescript
import { Effect } from "effect"
import { LoggingConfig, layerConsoleLogger } from "@beep/observability"

const config = LoggingConfig.make({ format: "json", minLogLevel: "Info" })
const layer = layerConsoleLogger(config)

const program = Effect.log("structured output").pipe(

)

console.log(Effect.runPromise(program))
```
```

**Signature**

```ts
declare const layerConsoleLogger: { (config: LoggingConfig, pretty?: PrettyLoggerConfig): Layer.Layer<never>; (pretty: PrettyLoggerConfig): (config: LoggingConfig) => Layer.Layer<never>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/Logging.ts#L401)

Since v0.0.0

# models

## BannerMode

Banner render modes for startup and phase summaries: `"off"`, `"startup"`, `"phase"`, or `"all"`.

**Example**

```ts
```typescript
import { PrettyLoggerConfig } from "@beep/observability"

const config = PrettyLoggerConfig.make({ theme: "ocean", bannerMode: "startup" })
console.log(config.bannerMode)// "startup"
```
```

**Signature**

```ts
declare const BannerMode: AnnotatedSchema<LiteralKit<readonly ["off", "startup", "phase", "all"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/Logging.ts#L122)

Since v0.0.0

## BannerMode (type alias)

Runtime type for `BannerMode`.

**Example**

```ts
```typescript
import type { BannerMode } from "@beep/observability"

const mode: BannerMode = "startup"
console.log(mode)
```
```

**Signature**

```ts
type BannerMode = typeof BannerMode.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/Logging.ts#L142)

Since v0.0.0

## LogFormat

Supported console logger formats for shared observability wiring.

**Example**

```ts
```typescript
import { LoggingConfig, layerConsoleLogger } from "@beep/observability"

const config = LoggingConfig.make({ format: "json", minLogLevel: "Debug" })
console.log(layerConsoleLogger(config))
```
```

**Signature**

```ts
declare const LogFormat: AnnotatedSchema<LiteralKit<readonly ["pretty", "structured", "json", "logfmt", "string"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/Logging.ts#L50)

Since v0.0.0

## LogFormat (type alias)

Runtime type for `LogFormat`.

**Example**

```ts
```typescript
import type { LogFormat } from "@beep/observability"

const format: LogFormat = "json"
console.log(format)
```
```

**Signature**

```ts
type LogFormat = typeof LogFormat.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/Logging.ts#L70)

Since v0.0.0

## LoggingConfig (class)

Shared logger configuration for browser-safe and server-safe console logging.

**Example**

```ts
```typescript
import { LoggingConfig } from "@beep/observability"

const config = LoggingConfig.make({
  format: "structured",
  minLogLevel: "Info",
})

console.log(config.format)// "structured"
```
```

**Signature**

```ts
declare class LoggingConfig
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/Logging.ts#L190)

Since v0.0.0

## PrettyLogTheme

Theme palette for the custom pretty logger: `"ocean"`, `"forest"`, `"sunrise"`, or `"mono"`.

**Example**

```ts
```typescript
import { PrettyLoggerConfig } from "@beep/observability"

const config = PrettyLoggerConfig.make({ theme: "forest", bannerMode: "off" })
console.log(config.theme)// "forest"
```
```

**Signature**

```ts
declare const PrettyLogTheme: AnnotatedSchema<LiteralKit<readonly ["ocean", "forest", "sunrise", "mono"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/Logging.ts#L86)

Since v0.0.0

## PrettyLogTheme (type alias)

Runtime type for `PrettyLogTheme`.

**Example**

```ts
```typescript
import type { PrettyLogTheme } from "@beep/observability"

const theme: PrettyLogTheme = "forest"
console.log(theme)
```
```

**Signature**

```ts
type PrettyLogTheme = typeof PrettyLogTheme.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/Logging.ts#L106)

Since v0.0.0

## PrettyLoggerConfig (class)

Extra configuration for the custom pretty logger including theme and banner mode.

**Example**

```ts
```typescript
import { PrettyLoggerConfig } from "@beep/observability"

const config = PrettyLoggerConfig.make({
  theme: "forest",
  bannerMode: "off",
})

console.log(config.theme)// "forest"
```
```

**Signature**

```ts
declare class PrettyLoggerConfig
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/Logging.ts#L162)

Since v0.0.0

# observability

## renderLogBanner

Render an opt-in banner for startup and phase summaries.

Returns a plain title when the banner mode is `"off"` or does not match
the requested kind. Otherwise renders a themed ASCII banner with glyphs.

**Example**

```ts
```typescript
import { renderLogBanner, PrettyLoggerConfig } from "@beep/observability"

const pretty = PrettyLoggerConfig.make({ theme: "ocean", bannerMode: "all" })
const banner = renderLogBanner("Server Ready", { kind: "startup", pretty })
console.log(banner)
```
```

**Signature**

```ts
declare const renderLogBanner: { (title: string, options?: { readonly kind?: "phase" | "startup" | undefined; readonly pretty?: PrettyLoggerConfig | undefined; }): string; (options: { readonly kind?: "phase" | "startup" | undefined; readonly pretty?: PrettyLoggerConfig | undefined; }): (title: string) => string; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/Logging.ts#L296)

Since v0.0.0