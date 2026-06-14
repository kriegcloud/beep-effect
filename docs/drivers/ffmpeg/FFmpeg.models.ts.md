---
title: FFmpeg.models.ts
nav_order: 2
parent: "@beep/ffmpeg"
---

## FFmpeg.models.ts overview

Schema-first public models for the native FFmpeg driver.

Since v0.0.0

---
## Exports Grouped by Category
- [decoding](#decoding)
  - [decodeExtractFramesRequest](#decodeextractframesrequest)
  - [decodeProbeVideoRequest](#decodeprobevideorequest)
- [encoding](#encoding)
  - [encodeExtractFramesManifest](#encodeextractframesmanifest)
- [events](#events)
  - [FFmpegCompletedEvent (class)](#ffmpegcompletedevent-class)
  - [FFmpegEvent](#ffmpegevent)
  - [FFmpegEvent (type alias)](#ffmpegevent-type-alias)
  - [FFmpegProgressEvent (class)](#ffmpegprogressevent-class)
  - [FFmpegStartedEvent (class)](#ffmpegstartedevent-class)
- [models](#models)
  - [ExtractFramesManifest (class)](#extractframesmanifest-class)
  - [ExtractFramesManifestOptions (class)](#extractframesmanifestoptions-class)
  - [ExtractFramesManifestSummary (class)](#extractframesmanifestsummary-class)
  - [ExtractFramesRequest (class)](#extractframesrequest-class)
  - [ExtractFramesResult (class)](#extractframesresult-class)
  - [ExtractedFrame (class)](#extractedframe-class)
  - [FFmpegConfig (class)](#ffmpegconfig-class)
  - [FFmpegConfigInput (class)](#ffmpegconfiginput-class)
  - [PositiveFrameRate (type alias)](#positiveframerate-type-alias)
  - [PositiveMilliseconds (type alias)](#positivemilliseconds-type-alias)
  - [ProbeVideoRequest (class)](#probevideorequest-class)
  - [SafeFramePrefix (type alias)](#safeframeprefix-type-alias)
  - [VideoProbe (class)](#videoprobe-class)
- [schemas](#schemas)
  - [PositiveFrameRate](#positiveframerate)
  - [PositiveMilliseconds](#positivemilliseconds)
  - [SafeFramePrefix](#safeframeprefix)
---

# decoding

## decodeExtractFramesRequest

Decode an unknown value into an extract-frames request.

**Example**

```ts
import { decodeExtractFramesRequest } from "@beep/ffmpeg"

const effect = decodeExtractFramesRequest({ fps: 1, outDir: "./frames", videoPath: "./clip.mp4" })
console.log(effect)
```

**Signature**

```ts
declare const decodeExtractFramesRequest: (input: unknown, options?: ParseOptions) => Effect.Effect<ExtractFramesRequest, S.SchemaError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/ffmpeg/src/FFmpeg.models.ts#L640)

Since v0.0.0

## decodeProbeVideoRequest

Decode an unknown value into a probe request.

**Example**

```ts
import { decodeProbeVideoRequest } from "@beep/ffmpeg"

const effect = decodeProbeVideoRequest({ videoPath: "./clip.mp4" })
console.log(effect)
```

**Signature**

```ts
declare const decodeProbeVideoRequest: (input: unknown, options?: ParseOptions) => Effect.Effect<ProbeVideoRequest, S.SchemaError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/ffmpeg/src/FFmpeg.models.ts#L656)

Since v0.0.0

# encoding

## encodeExtractFramesManifest

Encode an extract-frames manifest into its JSON-safe shape.

**Example**

```ts
import { encodeExtractFramesManifest, ExtractFramesManifest, ExtractFramesManifestOptions, ExtractFramesManifestSummary } from "@beep/ffmpeg"

const encoded = encodeExtractFramesManifest(ExtractFramesManifest.make({
  frames: [],
  manifestPath: "./frames/extract-frames-manifest.json",
  options: ExtractFramesManifestOptions.make({ fps: 1, overwrite: false, prefix: "clip_frame" }),
  outputDirectory: "./frames",
  probe: { videoPath: "./clip.mp4" },
  schemaVersion: "beep.ffmpeg.extract-frames.v1",
  sourceVideo: "./clip.mp4",
  summary: ExtractFramesManifestSummary.make({ frameCount: 0 })
}))
console.log(encoded)
```

**Signature**

```ts
declare const encodeExtractFramesManifest: (input: unknown, options?: ParseOptions) => Effect.Effect<{ readonly frames: ReadonlyArray<{ readonly fileName: string; readonly index: number; readonly path: string; readonly relativePath: string; }>; readonly manifestPath: string; readonly options: { readonly fps: number; readonly overwrite: boolean; readonly prefix: string; }; readonly outputDirectory: string; readonly probe: { readonly videoPath: string; readonly durationSeconds?: number | undefined; readonly fps?: number | undefined; readonly frameCount?: number | undefined; readonly height?: number | undefined; readonly width?: number | undefined; }; readonly schemaVersion: "beep.ffmpeg.extract-frames.v1"; readonly sourceVideo: string; readonly summary: { readonly frameCount: number; }; }, S.SchemaError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/ffmpeg/src/FFmpeg.models.ts#L681)

Since v0.0.0

# events

## FFmpegCompletedEvent (class)

Event emitted after frames and manifest are committed.

**Example**

```ts
import { FFmpegCompletedEvent } from "@beep/ffmpeg"

const event = FFmpegCompletedEvent.make({
  frameCount: 1,
  kind: "completed",
  manifestPath: "./frames/extract-frames-manifest.json",
  outDir: "./frames"
})
console.log(event)
```

**Signature**

```ts
declare class FFmpegCompletedEvent
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/ffmpeg/src/FFmpeg.models.ts#L577)

Since v0.0.0

## FFmpegEvent

Structured events emitted by extract-frames.

**Example**

```ts
import type { FFmpegEvent } from "@beep/ffmpeg"

const log = (event: FFmpegEvent) => event.kind
console.log(log)
```

**Signature**

```ts
declare const FFmpegEvent: AnnotatedSchema<S.Union<readonly [typeof FFmpegStartedEvent, typeof FFmpegProgressEvent, typeof FFmpegCompletedEvent]> & TaggedUnionUtils<"kind", readonly [typeof FFmpegStartedEvent, typeof FFmpegProgressEvent, typeof FFmpegCompletedEvent], [typeof FFmpegStartedEvent, typeof FFmpegProgressEvent, typeof FFmpegCompletedEvent]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/ffmpeg/src/FFmpeg.models.ts#L603)

Since v0.0.0

## FFmpegEvent (type alias)

Structured events emitted by extract-frames.

**Example**

```ts
import type { FFmpegEvent } from "@beep/ffmpeg"

const eventKind = (event: FFmpegEvent) => event.kind
console.log(eventKind)
```

**Signature**

```ts
type FFmpegEvent = typeof FFmpegEvent.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/ffmpeg/src/FFmpeg.models.ts#L624)

Since v0.0.0

## FFmpegProgressEvent (class)

Event emitted when ffmpeg reports extraction progress.

**Example**

```ts
import { FFmpegProgressEvent } from "@beep/ffmpeg"

const event = FFmpegProgressEvent.make({ frameCount: 1, kind: "progress", percent: 50, progress: "continue" })
console.log(event)
```

**Signature**

```ts
declare class FFmpegProgressEvent
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/ffmpeg/src/FFmpeg.models.ts#L544)

Since v0.0.0

## FFmpegStartedEvent (class)

Event emitted when extract-frames starts.

**Example**

```ts
import { FFmpegStartedEvent } from "@beep/ffmpeg"

const event = FFmpegStartedEvent.make({
  args: [],
  command: "ffmpeg",
  kind: "started",
  outDir: "./frames",
  videoPath: "./clip.mp4"
})
console.log(event)
```

**Signature**

```ts
declare class FFmpegStartedEvent
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/ffmpeg/src/FFmpeg.models.ts#L517)

Since v0.0.0

# models

## ExtractFramesManifest (class)

JSON manifest written by an extract-frames run.

**Example**

```ts
import { ExtractFramesManifest, ExtractFramesManifestOptions, ExtractFramesManifestSummary } from "@beep/ffmpeg"

const manifest = ExtractFramesManifest.make({
  frames: [],
  manifestPath: "./frames/extract-frames-manifest.json",
  options: ExtractFramesManifestOptions.make({ fps: 1, overwrite: false, prefix: "clip_frame" }),
  outputDirectory: "./frames",
  probe: { videoPath: "./clip.mp4" },
  schemaVersion: "beep.ffmpeg.extract-frames.v1",
  sourceVideo: "./clip.mp4",
  summary: ExtractFramesManifestSummary.make({ frameCount: 0 })
})
console.log(manifest)
```

**Signature**

```ts
declare class ExtractFramesManifest
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/ffmpeg/src/FFmpeg.models.ts#L448)

Since v0.0.0

## ExtractFramesManifestOptions (class)

Options recorded in an extract-frames manifest.

**Example**

```ts
import { ExtractFramesManifestOptions } from "@beep/ffmpeg"

const options = ExtractFramesManifestOptions.make({ fps: 1, overwrite: false, prefix: "clip_frame" })
console.log(options)
```

**Signature**

```ts
declare class ExtractFramesManifestOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/ffmpeg/src/FFmpeg.models.ts#L387)

Since v0.0.0

## ExtractFramesManifestSummary (class)

Summary recorded in an extract-frames manifest.

**Example**

```ts
import { ExtractFramesManifestSummary } from "@beep/ffmpeg"

const summary = ExtractFramesManifestSummary.make({ frameCount: 3 })
console.log(summary)
```

**Signature**

```ts
declare class ExtractFramesManifestSummary
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/ffmpeg/src/FFmpeg.models.ts#L414)

Since v0.0.0

## ExtractFramesRequest (class)

Request to extract PNG frames from a video.

**Example**

```ts
import { ExtractFramesRequest } from "@beep/ffmpeg"
import * as O from "effect/Option"

const request = ExtractFramesRequest.make({
  fps: 1,
  manifestPath: O.none(),
  outDir: "./frames",
  overwrite: false,
  prefix: O.none(),
  videoPath: "./clip.mp4"
})
console.log(request)
```

**Signature**

```ts
declare class ExtractFramesRequest
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/ffmpeg/src/FFmpeg.models.ts#L319)

Since v0.0.0

## ExtractFramesResult (class)

Result returned after frames have been committed.

**Example**

```ts
import { ExtractFramesResult } from "@beep/ffmpeg"

const result = ExtractFramesResult.make({
  frameCount: 0,
  frames: [],
  manifestPath: "./frames/extract-frames-manifest.json",
  outDir: "./frames",
  videoPath: "./clip.mp4"
})
console.log(result)
```

**Signature**

```ts
declare class ExtractFramesResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/ffmpeg/src/FFmpeg.models.ts#L484)

Since v0.0.0

## ExtractedFrame (class)

A frame written by an extract-frames run.

**Example**

```ts
import { ExtractedFrame } from "@beep/ffmpeg"

const frame = ExtractedFrame.make({
  fileName: "clip_frame_00000.png",
  index: 0,
  path: "./frames/clip_frame_00000.png",
  relativePath: "clip_frame_00000.png"
})
console.log(frame)
```

**Signature**

```ts
declare class ExtractedFrame
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/ffmpeg/src/FFmpeg.models.ts#L361)

Since v0.0.0

## FFmpegConfig (class)

Resolved runtime configuration for the native FFmpeg driver.

**Example**

```ts
import { FFmpegConfig } from "@beep/ffmpeg"

const config = FFmpegConfig.make({
  ffmpegPath: "ffmpeg",
  ffprobePath: "ffprobe",
  forceKillAfterMillis: 2000
})
console.log(config)
```

**Signature**

```ts
declare class FFmpegConfig
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/ffmpeg/src/FFmpeg.models.ts#L235)

Since v0.0.0

## FFmpegConfigInput (class)

Runtime path overrides for the native FFmpeg binaries.

**Example**

```ts
import { FFmpegConfigInput } from "@beep/ffmpeg"

const config = FFmpegConfigInput.make({ ffmpegPath: "ffmpeg", ffprobePath: "ffprobe" })
console.log(config)
```

**Signature**

```ts
declare class FFmpegConfigInput
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/ffmpeg/src/FFmpeg.models.ts#L206)

Since v0.0.0

## PositiveFrameRate (type alias)

Positive frame extraction rate in frames per second.

**Example**

```ts
import type { PositiveFrameRate } from "@beep/ffmpeg"

const fps = 1 as PositiveFrameRate
console.log(fps)
```

**Signature**

```ts
type PositiveFrameRate = typeof PositiveFrameRate.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/ffmpeg/src/FFmpeg.models.ts#L72)

Since v0.0.0

## PositiveMilliseconds (type alias)

Positive timeout value in milliseconds.

**Example**

```ts
import type { PositiveMilliseconds } from "@beep/ffmpeg"

const timeout = 2000 as PositiveMilliseconds
console.log(timeout)
```

**Signature**

```ts
type PositiveMilliseconds = typeof PositiveMilliseconds.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/ffmpeg/src/FFmpeg.models.ts#L131)

Since v0.0.0

## ProbeVideoRequest (class)

Request to probe a video's first video stream.

**Example**

```ts
import { ProbeVideoRequest } from "@beep/ffmpeg"

const request = ProbeVideoRequest.make({ videoPath: "./clip.mp4" })
console.log(request)
```

**Signature**

```ts
declare class ProbeVideoRequest
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/ffmpeg/src/FFmpeg.models.ts#L260)

Since v0.0.0

## SafeFramePrefix (type alias)

Safe frame filename prefix.

**Example**

```ts
import type { SafeFramePrefix } from "@beep/ffmpeg"

const prefix = "clip_frame" as SafeFramePrefix
console.log(prefix)
```

**Signature**

```ts
type SafeFramePrefix = typeof SafeFramePrefix.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/ffmpeg/src/FFmpeg.models.ts#L190)

Since v0.0.0

## VideoProbe (class)

Video metadata extracted from ffprobe.

**Example**

```ts
import { VideoProbe } from "@beep/ffmpeg"

const probe = VideoProbe.make({ videoPath: "./clip.mp4", durationSeconds: 3 })
console.log(probe)
```

**Signature**

```ts
declare class VideoProbe
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/ffmpeg/src/FFmpeg.models.ts#L283)

Since v0.0.0

# schemas

## PositiveFrameRate

Positive frame extraction rate in frames per second.

**Example**

```ts
import * as S from "effect/Schema"
import { PositiveFrameRate } from "@beep/ffmpeg"

const fps = S.decodeUnknownSync(PositiveFrameRate)(1)
console.log(fps)
```

**Signature**

```ts
declare const PositiveFrameRate: AnnotatedSchema<S.Finite>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/ffmpeg/src/FFmpeg.models.ts#L30)

Since v0.0.0

## PositiveMilliseconds

Positive timeout value in milliseconds.

**Example**

```ts
import * as S from "effect/Schema"
import { PositiveMilliseconds } from "@beep/ffmpeg"

const timeout = S.decodeUnknownSync(PositiveMilliseconds)(2000)
console.log(timeout)
```

**Signature**

```ts
declare const PositiveMilliseconds: AnnotatedSchema<S.Finite>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/ffmpeg/src/FFmpeg.models.ts#L89)

Since v0.0.0

## SafeFramePrefix

File-name prefix accepted for generated frame outputs.

**Example**

```ts
import * as S from "effect/Schema"
import { SafeFramePrefix } from "@beep/ffmpeg"

const prefix = S.decodeUnknownSync(SafeFramePrefix)("clip_frame")
console.log(prefix)
```

**Signature**

```ts
declare const SafeFramePrefix: AnnotatedSchema<S.String>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/ffmpeg/src/FFmpeg.models.ts#L148)

Since v0.0.0