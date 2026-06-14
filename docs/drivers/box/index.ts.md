---
title: index.ts
nav_order: 10
parent: "@beep/box"
---

## index.ts overview

Box driver configuration exports.

**Example**

```ts
import { BoxDeveloperTokenConfig } from "@beep/box"

console.log(BoxDeveloperTokenConfig)
```

Since v0.0.0

---
## Exports Grouped by Category
- [constants](#constants)
  - [VERSION](#version)
- [errors](#errors)
  - ["./Box.errors.ts" (namespace export)](#boxerrorsts-namespace-export)
- [models](#models)
  - ["./Box.config.ts" (namespace export)](#boxconfigts-namespace-export)
  - ["./Box.models.ts" (namespace export)](#boxmodelsts-namespace-export)
- [services](#services)
  - ["./Box.service.ts" (namespace export)](#boxservicets-namespace-export)
  - ["./Box.streaming.ts" (namespace export)](#boxstreamingts-namespace-export)
---

# constants

## VERSION

Package version for `@beep/box`.

**Example**

```ts
import { VERSION } from "@beep/box"

console.log(VERSION)
```

**Signature**

```ts
declare const VERSION: "0.0.0"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/box/src/index.ts#L92)

Since v0.0.0

# errors

## "./Box.errors.ts" (namespace export)

Re-exports all named exports from the "./Box.errors.ts" module.

**Example**

```ts
import { BoxError } from "@beep/box"

console.log(BoxError)
```

**Signature**

```ts
export * from "./Box.errors.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/box/src/index.ts#L35)

Since v0.0.0

# models

## "./Box.config.ts" (namespace export)

Re-exports all named exports from the "./Box.config.ts" module.

**Example**

```ts
import { BoxDeveloperTokenConfig } from "@beep/box"

console.log(BoxDeveloperTokenConfig)
```

**Signature**

```ts
export * from "./Box.config.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/box/src/index.ts#L21)

Since v0.0.0

## "./Box.models.ts" (namespace export)

Re-exports all named exports from the "./Box.models.ts" module.

**Example**

```ts
import { FilesGetFileByIdPayload } from "@beep/box"

console.log(FilesGetFileByIdPayload)
```

**Signature**

```ts
export * from "./Box.models.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/box/src/index.ts#L49)

Since v0.0.0

# services

## "./Box.service.ts" (namespace export)

Re-exports all named exports from the "./Box.service.ts" module.

**Example**

```ts
import { Box } from "@beep/box"

console.log(Box)
```

**Signature**

```ts
export * from "./Box.service.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/box/src/index.ts#L63)

Since v0.0.0

## "./Box.streaming.ts" (namespace export)

Re-exports all named exports from the "./Box.streaming.ts" module.

**Example**

```ts
import type { BoxByteStream } from "@beep/box"

type Bytes = BoxByteStream
```

**Signature**

```ts
export * from "./Box.streaming.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/box/src/index.ts#L77)

Since v0.0.0