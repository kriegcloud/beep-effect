---
title: FFmpeg.errors.ts
nav_order: 1
parent: "@beep/ffmpeg"
---

## FFmpeg.errors.ts overview

Typed errors raised by the native FFmpeg driver.

Since v0.0.0

---
## Exports Grouped by Category
- [errors](#errors)
  - [FFmpegError (class)](#ffmpegerror-class)
  - [FFmpegErrorContext (class)](#ffmpegerrorcontext-class)
  - [FFmpegErrorFromUnknownOptions (class)](#ffmpegerrorfromunknownoptions-class)
---

# errors

## FFmpegError (class)

Technical failure raised by the `@beep/ffmpeg` driver boundary.

**Example**

```ts
import { FFmpegError } from "@beep/ffmpeg"

const error = FFmpegError.make({ message: "ffmpeg failed", operation: "extractFrames" })
console.log(error.message)
```

**Signature**

```ts
declare class FFmpegError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/ffmpeg/src/FFmpeg.errors.ts#L96)

Since v0.0.0

## FFmpegErrorContext (class)

Additional process context captured for an FFmpeg failure.

**Example**

```ts
import { FFmpegErrorContext } from "@beep/ffmpeg"

const context = FFmpegErrorContext.make({ command: "ffmpeg", exitCode: 1 })
console.log(context)
```

**Signature**

```ts
declare class FFmpegErrorContext
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/ffmpeg/src/FFmpeg.errors.ts#L31)

Since v0.0.0

## FFmpegErrorFromUnknownOptions (class)

Options used when normalizing unknown FFmpeg boundary failures.

**Example**

```ts
import { FFmpegErrorFromUnknownOptions } from "@beep/ffmpeg"

const options = FFmpegErrorFromUnknownOptions.make({
  command: "ffmpeg",
  exitCode: 1,
  stderr: "invalid input"
})
console.log(options)
```

**Signature**

```ts
declare class FFmpegErrorFromUnknownOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/ffmpeg/src/FFmpeg.errors.ts#L67)

Since v0.0.0