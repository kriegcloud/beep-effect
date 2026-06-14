---
title: Configuration.ts
nav_order: 4
parent: "@beep/repo-docgen"
---

## Configuration.ts overview

Configuration loading and service wiring for docgen.

Since v0.0.0

---
## Exports Grouped by Category
- [services](#services)
  - [CompilerOptionsInput (type alias)](#compileroptionsinput-type-alias)
  - [Configuration (class)](#configuration-class)
    - [layer (static method)](#layer-static-method)
  - [ConfigurationDocument (type alias)](#configurationdocument-type-alias)
  - [ConfigurationSchema (class)](#configurationschema-class)
  - [ConfigurationShape (class)](#configurationshape-class)
  - [DEFAULT_THEME](#default_theme)
---

# services

## CompilerOptionsInput (type alias)

Accepted CLI or config-file input for compiler options.

**Example**

```ts
import type { CompilerOptionsInput } from "@beep/repo-docgen/Configuration"
type ExampleCompilerOptionsInput = CompilerOptionsInput
```

**Signature**

```ts
type CompilerOptionsInput = string | S.Schema.Type<typeof CompilerOptionsShape>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/docgen/src/Configuration.ts#L148)

Since v0.0.0

## Configuration (class)

Runtime configuration service for docgen command execution.

**Example**

```ts
import { Configuration } from "@beep/repo-docgen/Configuration"
console.log(Configuration)
```

**Signature**

```ts
declare class Configuration
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/docgen/src/Configuration.ts#L125)

Since v0.0.0

### layer (static method)

Creates a layer that provides the current docgen configuration.

**Signature**

```ts
declare const layer: (config: ConfigurationShape) => Layer.Layer<Configuration, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/docgen/src/Configuration.ts#L132)

## ConfigurationDocument (type alias)

Runtime type for decoded `docgen.json` configuration documents.

**Example**

```ts
import type { ConfigurationDocument } from "@beep/repo-docgen/Configuration"
type ExampleConfigurationDocument = ConfigurationDocument
```

**Signature**

```ts
type ConfigurationDocument = ConfigurationSchema
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/docgen/src/Configuration.ts#L83)

Since v0.0.0

## ConfigurationSchema (class)

Schema describing the optional `docgen.json` configuration document.

**Example**

```ts
import { ConfigurationSchema } from "@beep/repo-docgen/Configuration"
console.log(ConfigurationSchema)
```

**Signature**

```ts
declare class ConfigurationSchema
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/docgen/src/Configuration.ts#L54)

Since v0.0.0

## ConfigurationShape (class)

Fully resolved configuration values used while docgen executes.

**Example**

```ts
import { ConfigurationShape } from "@beep/repo-docgen/Configuration"
console.log(ConfigurationShape)
```

**Signature**

```ts
declare class ConfigurationShape
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/docgen/src/Configuration.ts#L96)

Since v0.0.0

## DEFAULT_THEME

Default Jekyll theme used when docgen does not receive an explicit theme override.

**Example**

```ts
import { DEFAULT_THEME } from "@beep/repo-docgen/Configuration"
console.log(DEFAULT_THEME)
```

**Signature**

```ts
declare const DEFAULT_THEME: "mikearnaldi/just-the-docs"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/docgen/src/Configuration.ts#L32)

Since v0.0.0