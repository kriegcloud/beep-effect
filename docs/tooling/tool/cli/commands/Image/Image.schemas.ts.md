---
title: Image.schemas.ts
nav_order: 42
parent: "@beep/repo-cli"
---

## Image.schemas.ts overview

Schema models for image and video curation commands.

Since v0.0.0

---
## Exports Grouped by Category
- [decoding](#decoding)
  - [decodeExtractFramesDirOptions](#decodeextractframesdiroptions)
  - [decodeExtractFramesOptions](#decodeextractframesoptions)
- [models](#models)
  - [ExtractFramesDirFailure (class)](#extractframesdirfailure-class)
  - [ExtractFramesDirOptions (class)](#extractframesdiroptions-class)
  - [ExtractFramesDirOutcome](#extractframesdiroutcome)
  - [ExtractFramesDirOutcome (type alias)](#extractframesdiroutcome-type-alias)
  - [ExtractFramesDirResult (class)](#extractframesdirresult-class)
  - [ExtractFramesDirSuccess (class)](#extractframesdirsuccess-class)
  - [ExtractFramesDirVideo (class)](#extractframesdirvideo-class)
  - [ExtractFramesOptions (class)](#extractframesoptions-class)
---

# decoding

## decodeExtractFramesDirOptions

Decode unknown directory frame extraction options.

**Example**

```ts
import { decodeExtractFramesDirOptions } from "@beep/repo-cli/commands/Image"
console.log(decodeExtractFramesDirOptions)
```

**Signature**

```ts
declare const decodeExtractFramesDirOptions: (input: unknown, options?: ParseOptions) => Effect.Effect<ExtractFramesDirOptions, S.SchemaError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Image/Image.schemas.ts#L273)

Since v0.0.0

## decodeExtractFramesOptions

Decode unknown single-video frame extraction options.

**Example**

```ts
import { decodeExtractFramesOptions } from "@beep/repo-cli/commands/Image"
console.log(decodeExtractFramesOptions)
```

**Signature**

```ts
declare const decodeExtractFramesOptions: (input: unknown, options?: ParseOptions) => Effect.Effect<ExtractFramesOptions, S.SchemaError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Image/Image.schemas.ts#L260)

Since v0.0.0

# models

## ExtractFramesDirFailure (class)

Failed video from a folder-based frame extraction run.

**Example**

```ts
import { ExtractFramesDirFailure } from "@beep/repo-cli/commands/Image/index"

const failure = ExtractFramesDirFailure.make({
  message: "ffmpeg failed",
  sourceName: "clip.mp4",
  sourcePath: "./videos/clip.mp4",
  status: "failure"
})
console.log(failure)
```

**Signature**

```ts
declare class ExtractFramesDirFailure
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Image/Image.schemas.ts#L182)

Since v0.0.0

## ExtractFramesDirOptions (class)

Options accepted by `image extract-frames-dir`.

**Example**

```ts
import { ExtractFramesDirOptions } from "@beep/repo-cli/commands/Image/index"
import * as O from "effect/Option"

const options = ExtractFramesDirOptions.make({
  dir: "./videos",
  fps: 1,
  overwrite: false,
  prefix: O.none()
})
console.log(options)
```

**Signature**

```ts
declare class ExtractFramesDirOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Image/Image.schemas.ts#L79)

Since v0.0.0

## ExtractFramesDirOutcome

Ordered outcome for one `image extract-frames-dir` input video.

**Example**

```ts
import { ExtractFramesDirOutcome } from "@beep/repo-cli/commands/Image"
console.log(ExtractFramesDirOutcome)
```

**Signature**

```ts
declare const ExtractFramesDirOutcome: AnnotatedSchema<S.Union<readonly [typeof ExtractFramesDirSuccess, typeof ExtractFramesDirFailure]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Image/Image.schemas.ts#L205)

Since v0.0.0

## ExtractFramesDirOutcome (type alias)

Ordered outcome for one `image extract-frames-dir` input video.

**Signature**

```ts
type ExtractFramesDirOutcome = typeof ExtractFramesDirOutcome.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Image/Image.schemas.ts#L217)

Since v0.0.0

## ExtractFramesDirResult (class)

Result returned by `image extract-frames-dir`.

**Example**

```ts
import { ExtractFramesDirResult } from "@beep/repo-cli/commands/Image/index"

const result = ExtractFramesDirResult.make({
  completedCount: 0,
  failedCount: 0,
  outcomes: [],
  totalCount: 0
})
console.log(result)
```

**Signature**

```ts
declare class ExtractFramesDirResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Image/Image.schemas.ts#L237)

Since v0.0.0

## ExtractFramesDirSuccess (class)

Successful video from a folder-based frame extraction run.

**Example**

```ts
import { ExtractFramesDirSuccess } from "@beep/repo-cli/commands/Image/index"
import { ExtractFramesResult } from "@beep/ffmpeg"

const success = ExtractFramesDirSuccess.make({
  result: ExtractFramesResult.make({
    frameCount: 0,
    frames: [],
    manifestPath: "./videos/clip/extract-frames-manifest.json",
    outDir: "./videos/clip",
    videoPath: "./videos/clip.mp4"
  }),
  sourceName: "clip.mp4",
  sourcePath: "./videos/clip.mp4",
  status: "success"
})
console.log(success)
```

**Signature**

```ts
declare class ExtractFramesDirSuccess
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Image/Image.schemas.ts#L152)

Since v0.0.0

## ExtractFramesDirVideo (class)

Direct video selected by `image extract-frames-dir`.

**Example**

```ts
import { ExtractFramesDirVideo } from "@beep/repo-cli/commands/Image/index"

const video = ExtractFramesDirVideo.make({
  outDir: "./videos/clip",
  sourceName: "clip.mp4",
  sourcePath: "./videos/clip.mp4",
  stem: "clip"
})
console.log(video)
```

**Signature**

```ts
declare class ExtractFramesDirVideo
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Image/Image.schemas.ts#L115)

Since v0.0.0

## ExtractFramesOptions (class)

Options accepted by `image extract-frames`.

**Example**

```ts
import { ExtractFramesOptions } from "@beep/repo-cli/commands/Image/index"
import * as O from "effect/Option"

const options = ExtractFramesOptions.make({
  fps: 1,
  manifest: O.none(),
  outDir: "./frames",
  overwrite: false,
  prefix: O.none(),
  video: "./clip.mp4"
})
console.log(options)
```

**Signature**

```ts
declare class ExtractFramesOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Image/Image.schemas.ts#L37)

Since v0.0.0