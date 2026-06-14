---
title: ImageConfig.schema.ts
nav_order: 15
parent: "@beep/repo-configs"
---

## ImageConfig.schema.ts overview

Schemas for Next.js image configuration.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [ImageConfig (type alias)](#imageconfig-type-alias)
  - [ImageConfigComplete (class)](#imageconfigcomplete-class)
  - [ImageFormat (type alias)](#imageformat-type-alias)
  - [ImageLoaderProps (class)](#imageloaderprops-class)
  - [LocalPattern (class)](#localpattern-class)
  - [RemotePattern (class)](#remotepattern-class)
- [schemas](#schemas)
  - [ImageConfig](#imageconfig)
  - [ImageFormat](#imageformat)
  - [LoaderValue](#loadervalue)
---

# models

## ImageConfig (type alias)

Partial Next.js image configuration.

**Example**

```ts
import type { ImageConfig } from "@beep/repo-configs/next/models/ImageConfig.schema"
const config = {} satisfies ImageConfig
console.log(config)
```

**Signature**

```ts
type ImageConfig = typeof ImageConfig.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/models/ImageConfig.schema.ts#L417)

Since v0.0.0

## ImageConfigComplete (class)

Image configurations

**Example**

```ts
import { ImageConfigComplete } from "@beep/repo-configs/next/models/ImageConfig.schema"
const schema = ImageConfigComplete
console.log(schema)
```

**See**

- [Image configuration options](https://nextjs.org/docs/api-reference/next/image#configuration-options)

**Signature**

```ts
declare class ImageConfigComplete
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/models/ImageConfig.schema.ts#L202)

Since v0.0.0

## ImageFormat (type alias)

Supported image output format for Next.js image optimization.

**Example**

```ts
import type { ImageFormat } from "@beep/repo-configs/next/models/ImageConfig.schema"
const format = "image/webp" satisfies ImageFormat
console.log(format)
```

**Signature**

```ts
type ImageFormat = typeof ImageFormat.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/models/ImageConfig.schema.ts#L187)

Since v0.0.0

## ImageLoaderProps (class)

Configuration properties passed to a Next.js image loader function.

**Example**

```ts
import { ImageLoaderProps } from "@beep/repo-configs/next/models/ImageConfig.schema"
const schema = ImageLoaderProps
console.log(schema)
```

**Signature**

```ts
declare class ImageLoaderProps
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/models/ImageConfig.schema.ts#L47)

Since v0.0.0

## LocalPattern (class)

Next.js local image matching pattern.

**Example**

```ts
import { LocalPattern } from "@beep/repo-configs/next/models/ImageConfig.schema"
const pattern = LocalPattern.make({ pathname: "/assets/**" })
console.log(pattern)
```

**Signature**

```ts
declare class LocalPattern
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/models/ImageConfig.schema.ts#L70)

Since v0.0.0

## RemotePattern (class)

Next.js remote image matching pattern.

**Example**

```ts
import { RemotePattern } from "@beep/repo-configs/next/models/ImageConfig.schema"
const pattern = RemotePattern.make({ hostname: "images.example.com" })
console.log(pattern)
```

**Signature**

```ts
declare class RemotePattern
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/models/ImageConfig.schema.ts#L107)

Since v0.0.0

# schemas

## ImageConfig

Partial Next.js image configuration with repo-default statics.

**Example**

```ts
import { ImageConfig } from "@beep/repo-configs/next/models/ImageConfig.schema"
const config = ImageConfig
console.log(config)
```

**Signature**

```ts
declare const ImageConfig: AnnotatedSchema<S.Struct<{ readonly deviceSizes: S.optionalKey<S.mutable<S.$Array<S.Finite>>>; readonly imageSizes: S.optionalKey<S.mutable<S.$Array<S.Finite>>>; readonly loader: S.optionalKey<LiteralKit<readonly ["default", "imgix", "cloudinary", "akamai", "custom"], undefined>>; readonly path: S.optionalKey<S.String>; readonly loaderFile: S.optionalKey<S.String>; readonly domains: S.optionalKey<S.mutable<S.$Array<S.String>>>; readonly disableStaticImages: S.optionalKey<S.Boolean>; readonly minimumCacheTTL: S.optionalKey<S.Finite>; readonly formats: S.optionalKey<S.mutable<S.$Array<AnnotatedSchema<LiteralKit<readonly ["image/avif", "image/webp"], undefined>>>>>; readonly maximumDiskCacheSize: S.optionalKey<S.UndefinedOr<S.Finite>>; readonly maximumRedirects: S.optionalKey<S.Finite>; readonly maximumResponseBody: S.optionalKey<S.Finite>; readonly dangerouslyAllowLocalIP: S.optionalKey<S.Boolean>; readonly dangerouslyAllowSVG: S.optionalKey<S.Boolean>; readonly contentSecurityPolicy: S.optionalKey<S.String>; readonly contentDispositionType: S.optionalKey<LiteralKit<readonly ["inline", "attachment"], undefined>>; readonly remotePatterns: S.optionalKey<S.mutable<S.$Array<S.Union<readonly [S.URL, typeof RemotePattern]>>>>; readonly localPatterns: S.optionalKey<S.UndefinedOr<S.mutable<S.$Array<typeof LocalPattern>>>>; readonly qualities: S.optionalKey<S.UndefinedOr<S.mutable<S.$Array<S.Finite>>>>; readonly unoptimized: S.optionalKey<S.Boolean>; readonly customCacheHandler: S.optionalKey<S.Boolean>; }> & { default: { readonly deviceSizes?: Array<number> | undefined; readonly imageSizes?: Array<number> | undefined; readonly loader?: "default" | "imgix" | "cloudinary" | "akamai" | "custom" | undefined; readonly path?: string | undefined; readonly loaderFile?: string | undefined; readonly domains?: Array<string> | undefined; readonly disableStaticImages?: boolean | undefined; readonly minimumCacheTTL?: number | undefined; readonly formats?: Array<"image/avif" | "image/webp"> | undefined; readonly maximumDiskCacheSize?: number | undefined; readonly maximumRedirects?: number | undefined; readonly maximumResponseBody?: number | undefined; readonly dangerouslyAllowLocalIP?: boolean | undefined; readonly dangerouslyAllowSVG?: boolean | undefined; readonly contentSecurityPolicy?: string | undefined; readonly contentDispositionType?: "inline" | "attachment" | undefined; readonly remotePatterns?: Array<URL | RemotePattern> | undefined; readonly localPatterns?: Array<LocalPattern> | undefined; readonly qualities?: Array<number> | undefined; readonly unoptimized?: boolean | undefined; readonly customCacheHandler?: boolean | undefined; }; }>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/models/ImageConfig.schema.ts#L370)

Since v0.0.0

## ImageFormat

Supported image output formats for Next.js image optimization.

**Example**

```ts
import { ImageFormat } from "@beep/repo-configs/next/models/ImageConfig.schema"
const format = ImageFormat
console.log(format)
```

**Signature**

```ts
declare const ImageFormat: AnnotatedSchema<LiteralKit<readonly ["image/avif", "image/webp"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/models/ImageConfig.schema.ts#L169)

Since v0.0.0

## LoaderValue

Valid values for the Next.js image loader configuration.

**Example**

```ts
import { LoaderValue } from "@beep/repo-configs/next/models/ImageConfig.schema"
const loader = LoaderValue
console.log(loader)
```

**Signature**

```ts
declare const LoaderValue: AnnotatedSchema<LiteralKit<readonly ["default", "imgix", "cloudinary", "akamai", "custom"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/models/ImageConfig.schema.ts#L29)

Since v0.0.0