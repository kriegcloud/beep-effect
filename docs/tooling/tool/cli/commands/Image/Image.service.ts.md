---
title: Image.service.ts
nav_order: 43
parent: "@beep/repo-cli"
---

## Image.service.ts overview

Service implementation for image and video curation commands.

Since v0.0.0

---
## Exports Grouped by Category
- [layers](#layers)
  - [ImageCommandServiceLive](#imagecommandservicelive)
- [services](#services)
  - [ImageCommandService (class)](#imagecommandservice-class)
  - [ImageCommandServiceShape (interface)](#imagecommandserviceshape-interface)
- [use-cases](#use-cases)
  - [extractFrames](#extractframes)
  - [extractFramesDir](#extractframesdir)
---

# layers

## ImageCommandServiceLive

Live service layer for image and video curation operations.

**Example**

```ts
import { ImageCommandServiceLive } from "@beep/repo-cli/commands/Image"
console.log(ImageCommandServiceLive)
```

**Signature**

```ts
declare const ImageCommandServiceLive: Layer.Layer<ImageCommandService, never, ImageCommandServiceRequirements>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Image/Image.service.ts#L301)

Since v0.0.0

# services

## ImageCommandService (class)

Service tag for image and video curation operations.

**Example**

```ts
import { ImageCommandService } from "@beep/repo-cli/commands/Image"
console.log(ImageCommandService)
```

**Signature**

```ts
declare class ImageCommandService
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Image/Image.service.ts#L85)

Since v0.0.0

## ImageCommandServiceShape (interface)

Service contract for image and video curation commands.

**Example**

```ts
import type { ImageCommandServiceShape } from "@beep/repo-cli/commands/Image"
const value = {} as ImageCommandServiceShape
console.log(value)
```

**Signature**

```ts
export interface ImageCommandServiceShape {
  /**
   * Extract PNG frames from a single video.
   *
   * @since 0.0.0
   */
  readonly extractFrames: (
    options: ExtractFramesOptions
  ) => Effect.Effect<ExtractFramesResult, FFmpegError | ImageCommandError>;

  /**
   * Extract PNG frames from every direct video in a directory.
   *
   * @since 0.0.0
   */
  readonly extractFramesDir: (
    options: ExtractFramesDirOptions
  ) => Effect.Effect<ExtractFramesDirResult, ImageCommandError>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Image/Image.service.ts#L54)

Since v0.0.0

# use-cases

## extractFrames

Extract PNG frames from a single video.

**Example**

```ts
import { extractFrames } from "@beep/repo-cli/commands/Image"
console.log(extractFrames)
```

**Signature**

```ts
declare const extractFrames: (options: ExtractFramesOptions) => Effect.Effect<ExtractFramesResult, FFmpegError | ImageCommandError, ImageCommandService>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Image/Image.service.ts#L317)

Since v0.0.0

## extractFramesDir

Extract PNG frames from every direct video in a directory.

**Example**

```ts
import { extractFramesDir } from "@beep/repo-cli/commands/Image"
console.log(extractFramesDir)
```

**Signature**

```ts
declare const extractFramesDir: (options: ExtractFramesDirOptions) => Effect.Effect<ExtractFramesDirResult, ImageCommandError, ImageCommandService>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Image/Image.service.ts#L337)

Since v0.0.0