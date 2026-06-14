---
title: FFmpeg.service.ts
nav_order: 3
parent: "@beep/ffmpeg"
---

## FFmpeg.service.ts overview

Native FFmpeg process driver service.

Since v0.0.0

---
## Exports Grouped by Category
- [events](#events)
  - [FFmpegEventSink (type alias)](#ffmpegeventsink-type-alias)
- [models](#models)
  - [PlannedFrameCommit (class)](#plannedframecommit-class)
  - [ProgressState (class)](#progressstate-class)
- [services](#services)
  - [FFmpeg (class)](#ffmpeg-class)
  - [FFmpegShape (interface)](#ffmpegshape-interface)
- [utilities](#utilities)
  - [buildExtractFramesArgs](#buildextractframesargs)
  - [buildFfprobeArgs](#buildffprobeargs)
  - [formatFrameFileName](#formatframefilename)
---

# events

## FFmpegEventSink (type alias)

Effectful sink for structured FFmpeg events.

**Example**

```ts
import type { FFmpegEventSink } from "@beep/ffmpeg"
import { Effect } from "effect"

const sink: FFmpegEventSink = () => Effect.void
console.log(sink)
```

**Signature**

```ts
type FFmpegEventSink = (event: FFmpegEvent) => Effect.Effect<void>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/ffmpeg/src/FFmpeg.service.ts#L91)

Since v0.0.0

# models

## PlannedFrameCommit (class)

Planned file-system move for a staged extracted frame.

**Example**

```ts
import { PlannedFrameCommit } from "@beep/ffmpeg"

const commit = PlannedFrameCommit.make({
  fileName: "frame-000001.png",
  index: 1,
  relativePath: "frame-000001.png",
  sourcePath: "/tmp/ffmpeg/frame-000001.png",
  targetPath: "./frames/frame-000001.png"
})
console.log(commit)
```

**Signature**

```ts
declare class PlannedFrameCommit
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/ffmpeg/src/FFmpeg.service.ts#L177)

Since v0.0.0

## ProgressState (class)

Buffered ffmpeg progress output accumulated while parsing progress blocks.

**Example**

```ts
import { ProgressState } from "@beep/ffmpeg"

const state = ProgressState.make({
  block: { frame: "1", progress: "continue" },
  buffer: "",
  stdout: "frame=1\nprogress=continue\n"
})
console.log(state)
```

**Signature**

```ts
declare class ProgressState
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/ffmpeg/src/FFmpeg.service.ts#L208)

Since v0.0.0

# services

## FFmpeg (class)

Effect service for native FFmpeg and ffprobe execution.

**Example**

```ts
import { FFmpeg } from "@beep/ffmpeg"

const service = FFmpeg
console.log(service)
```

**Signature**

```ts
declare class FFmpeg
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/ffmpeg/src/FFmpeg.service.ts#L999)

Since v0.0.0

## FFmpegShape (interface)

Runtime shape exposed by the `FFmpeg` service.

**Example**

```ts
import type { FFmpegShape } from "@beep/ffmpeg"
import { Effect } from "effect"

const service: FFmpegShape = {
  extractFrames: () => Effect.die("not implemented"),
  probeVideo: () => Effect.die("not implemented")
}
console.log(service)
```

**Signature**

```ts
export interface FFmpegShape {
  readonly extractFrames: (
    request: ExtractFramesRequest,
    onEvent?: FFmpegEventSink | undefined
  ) => Effect.Effect<ExtractFramesResult, FFmpegError>;
  readonly probeVideo: (request: ProbeVideoRequest) => Effect.Effect<VideoProbe, FFmpegError>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/ffmpeg/src/FFmpeg.service.ts#L111)

Since v0.0.0

# utilities

## buildExtractFramesArgs

Build ffmpeg arguments for extracting PNG frames.

**Example**

```ts
import { buildExtractFramesArgs } from "@beep/ffmpeg"

const args = buildExtractFramesArgs({
  fps: "1",
  outputPattern: "./frames/frame_%05d.png",
  videoPath: "./clip.mp4",
})
console.log(args)
```

**Signature**

```ts
declare const buildExtractFramesArgs: (options: { readonly fps: string; readonly outputPattern: string; readonly videoPath: string; }) => ReadonlyArray<string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/ffmpeg/src/FFmpeg.service.ts#L381)

Since v0.0.0

## buildFfprobeArgs

Build ffprobe arguments for the video-probe operation.

**Example**

```ts
import { buildFfprobeArgs, ProbeVideoRequest } from "@beep/ffmpeg"

const args = buildFfprobeArgs(ProbeVideoRequest.make({ videoPath: "./clip.mp4" }))
console.log(args)
```

**Signature**

```ts
declare const buildFfprobeArgs: (request: ProbeVideoRequest) => ReadonlyArray<string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/ffmpeg/src/FFmpeg.service.ts#L349)

Since v0.0.0

## formatFrameFileName

Format a generated PNG frame filename.

**Example**

```ts
import { formatFrameFileName } from "@beep/ffmpeg"

const name = formatFrameFileName({ index: 0, padding: 5, prefix: "clip_frame" })
console.log(name)
```

**Signature**

```ts
declare const formatFrameFileName: (options: { readonly index: number; readonly padding: number; readonly prefix: string; }) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/ffmpeg/src/FFmpeg.service.ts#L329)

Since v0.0.0