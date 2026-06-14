---
title: ConfigPrimitives.schema.ts
nav_order: 13
parent: "@beep/repo-configs"
---

## ConfigPrimitives.schema.ts overview

Shared schemas for named Next.js configuration declarations.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [ExportPathMap (type alias)](#exportpathmap-type-alias)
  - [LightningCssFeature (type alias)](#lightningcssfeature-type-alias)
  - [NextParsedUrlQuery (type alias)](#nextparsedurlquery-type-alias)
- [schemas](#schemas)
  - [DomainLocale (class)](#domainlocale-class)
  - [ExportPathMap](#exportpathmap)
  - [I18NConfig (class)](#i18nconfig-class)
  - [LightningCssFeature](#lightningcssfeature)
  - [LightningCssFeatures (class)](#lightningcssfeatures-class)
  - [LoggingConfig (class)](#loggingconfig-class)
  - [NextParsedUrlQuery](#nextparsedurlquery)
  - [TypeScriptConfig (class)](#typescriptconfig-class)
---

# models

## ExportPathMap (type alias)

Public export path map returned by `next.config.js` `exportPathMap`.

**Example**

```ts
import type { ExportPathMap } from "@beep/repo-configs/next/models/ConfigPrimitives.schema"
const paths: ExportPathMap = { "/": { page: "/" } }
console.log(paths)
```

**Signature**

```ts
type ExportPathMap = typeof ExportPathMap.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/models/ConfigPrimitives.schema.ts#L190)

Since v0.0.0

## LightningCssFeature (type alias)

Lightning CSS feature name accepted by Next.js.

**Example**

```ts
import type { LightningCssFeature } from "@beep/repo-configs/next/models/ConfigPrimitives.schema"
const feature = "nesting" satisfies LightningCssFeature
console.log(feature)
```

**Signature**

```ts
type LightningCssFeature = typeof LightningCssFeature.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/models/ConfigPrimitives.schema.ts#L308)

Since v0.0.0

## NextParsedUrlQuery (type alias)

Route export path map entry query parameters.

**Example**

```ts
import type { NextParsedUrlQuery } from "@beep/repo-configs/next/models/ConfigPrimitives.schema"
const query: NextParsedUrlQuery = { slug: "hello" }
console.log(query)
```

**Signature**

```ts
type NextParsedUrlQuery = typeof NextParsedUrlQuery.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/models/ConfigPrimitives.schema.ts#L146)

Since v0.0.0

# schemas

## DomainLocale (class)

Locale-specific domain routing entry for Next.js internationalization.

**Example**

```ts
import { DomainLocale } from "@beep/repo-configs/next/models/ConfigPrimitives.schema"
const locale = DomainLocale.make({
  defaultLocale: "en",
  domain: "example.com"
})
console.log(locale)
```

**Signature**

```ts
declare class DomainLocale
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/models/ConfigPrimitives.schema.ts#L33)

Since v0.0.0

## ExportPathMap

Public export path map returned by `next.config.js` `exportPathMap`.

**Example**

```ts
import { ExportPathMap } from "@beep/repo-configs/next/models/ConfigPrimitives.schema"
const paths = ExportPathMap.make({
  "/": { page: "/" }
})
console.log(paths)
```

**Signature**

```ts
declare const ExportPathMap: AnnotatedSchema<S.$Record<S.String, typeof ExportPathMapEntry>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/models/ConfigPrimitives.schema.ts#L172)

Since v0.0.0

## I18NConfig (class)

Internationalization configuration for a Next.js app.

**Example**

```ts
import { I18NConfig } from "@beep/repo-configs/next/models/ConfigPrimitives.schema"
const i18n = I18NConfig.make({
  defaultLocale: "en",
  locales: ["en", "es"]
})
console.log(i18n)
```

**Signature**

```ts
declare class I18NConfig
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/models/ConfigPrimitives.schema.ts#L64)

Since v0.0.0

## LightningCssFeature

Lightning CSS feature name accepted by Next.js.

**Example**

```ts
import { LightningCssFeature } from "@beep/repo-configs/next/models/ConfigPrimitives.schema"
const feature = LightningCssFeature.Enum.nesting
console.log(feature)
```

**Signature**

```ts
declare const LightningCssFeature: AnnotatedSchema<LiteralKit<readonly ["nesting", "not-selector-list", "dir-selector", "lang-selector-list", "is-selector", "text-decoration-thickness-percent", "media-interval-syntax", "media-range-syntax", "custom-media-queries", "clamp-function", "color-function", "oklab-colors", "lab-colors", "p3-colors", "hex-alpha-colors", "space-separated-color-notation", "font-family-system-ui", "double-position-gradients", "vendor-prefixes", "logical-properties", "light-dark", "selectors", "media-queries", "colors"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/models/ConfigPrimitives.schema.ts#L265)

Since v0.0.0

## LightningCssFeatures (class)

Lightning CSS include/exclude feature configuration.

**Example**

```ts
import { LightningCssFeatures } from "@beep/repo-configs/next/models/ConfigPrimitives.schema"
const features = LightningCssFeatures.make({ include: ["nesting"] })
console.log(features)
```

**Signature**

```ts
declare class LightningCssFeatures
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/models/ConfigPrimitives.schema.ts#L322)

Since v0.0.0

## LoggingConfig (class)

Fetch logging configuration used by Next.js.

**Example**

```ts
import { LoggingConfig } from "@beep/repo-configs/next/models/ConfigPrimitives.schema"
const logging = LoggingConfig.make({ fetches: { fullUrl: true } })
console.log(logging)
```

**Signature**

```ts
declare class LoggingConfig
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/models/ConfigPrimitives.schema.ts#L231)

Since v0.0.0

## NextParsedUrlQuery

Route export path map entry query parameters.

**Example**

```ts
import { NextParsedUrlQuery } from "@beep/repo-configs/next/models/ConfigPrimitives.schema"
const query = NextParsedUrlQuery.make({ slug: "hello" })
console.log(query)
```

**Signature**

```ts
declare const NextParsedUrlQuery: AnnotatedSchema<S.$Record<S.String, S.Union<readonly [S.String, S.mutable<S.$Array<S.String>>]>>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/models/ConfigPrimitives.schema.ts#L128)

Since v0.0.0

## TypeScriptConfig (class)

Next.js TypeScript configuration block.

**Example**

```ts
import { TypeScriptConfig } from "@beep/repo-configs/next/models/ConfigPrimitives.schema"
const config = TypeScriptConfig.make({ tsconfigPath: "tsconfig.next.json" })
console.log(config)
```

**Signature**

```ts
declare class TypeScriptConfig
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/models/ConfigPrimitives.schema.ts#L99)

Since v0.0.0