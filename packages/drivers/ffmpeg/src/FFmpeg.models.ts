/**
 * Schema-first public models for the native FFmpeg driver.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $FfmpegId } from "@beep/identity/packages";
import { Effect } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const $I = $FfmpegId.create("FFmpeg.models");

/**
 * Positive frame extraction rate in frames per second.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { PositiveFrameRate } from "@beep/ffmpeg"
 *
 * const fps = S.decodeUnknownSync(PositiveFrameRate)(1)
 * console.log(fps)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const PositiveFrameRate = S.Finite.check(
  S.makeFilterGroup(
    [
      S.isFinite({
        identifier: $I`PositiveFrameRateFiniteCheck`,
        title: "Positive Frame Rate Finite",
        description: "Frame extraction rates must be finite numbers.",
        message: "Expected a finite frame rate",
      }),
      S.isGreaterThan(0, {
        identifier: $I`PositiveFrameRateGreaterThanZeroCheck`,
        title: "Positive Frame Rate Greater Than Zero",
        description: "Frame extraction rates must be greater than zero.",
        message: "Expected a frame rate greater than zero",
      }),
    ],
    {
      identifier: $I`PositiveFrameRateChecks`,
      title: "Positive Frame Rate",
      description: "Checks for positive finite frame extraction rates.",
    }
  )
).pipe(
  $I.annoteSchema("PositiveFrameRate", {
    description: "Positive finite frame extraction rate in frames per second.",
  })
);

/**
 * Positive frame extraction rate in frames per second.
 *
 * @example
 * ```ts
 * import type { PositiveFrameRate } from "@beep/ffmpeg"
 *
 * const fps = 1 as PositiveFrameRate
 * console.log(fps)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type PositiveFrameRate = typeof PositiveFrameRate.Type;

/**
 * Positive timeout value in milliseconds.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { PositiveMilliseconds } from "@beep/ffmpeg"
 *
 * const timeout = S.decodeUnknownSync(PositiveMilliseconds)(2000)
 * console.log(timeout)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const PositiveMilliseconds = S.Finite.check(
  S.makeFilterGroup(
    [
      S.isFinite({
        identifier: $I`PositiveMillisecondsFiniteCheck`,
        title: "Positive Milliseconds Finite",
        description: "Timeout milliseconds must be finite numbers.",
        message: "Expected finite milliseconds",
      }),
      S.isGreaterThan(0, {
        identifier: $I`PositiveMillisecondsGreaterThanZeroCheck`,
        title: "Positive Milliseconds Greater Than Zero",
        description: "Timeout milliseconds must be greater than zero.",
        message: "Expected milliseconds greater than zero",
      }),
    ],
    {
      identifier: $I`PositiveMillisecondsChecks`,
      title: "Positive Milliseconds",
      description: "Checks for positive finite timeout milliseconds.",
    }
  )
).pipe(
  $I.annoteSchema("PositiveMilliseconds", {
    description: "Positive finite timeout value in milliseconds.",
  })
);

/**
 * Positive timeout value in milliseconds.
 *
 * @example
 * ```ts
 * import type { PositiveMilliseconds } from "@beep/ffmpeg"
 *
 * const timeout = 2000 as PositiveMilliseconds
 * console.log(timeout)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type PositiveMilliseconds = typeof PositiveMilliseconds.Type;

/**
 * File-name prefix accepted for generated frame outputs.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { SafeFramePrefix } from "@beep/ffmpeg"
 *
 * const prefix = S.decodeUnknownSync(SafeFramePrefix)("clip_frame")
 * console.log(prefix)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const SafeFramePrefix = S.String.check(
  S.makeFilterGroup(
    [
      S.isMinLength(1, {
        identifier: $I`SafeFramePrefixNonEmptyCheck`,
        title: "Safe Frame Prefix Non Empty",
        description: "Frame filename prefixes must not be empty.",
        message: "Expected a non-empty frame prefix",
      }),
      S.isPattern(/^[^/\\\0]+$/, {
        identifier: $I`SafeFramePrefixNoPathSeparatorsCheck`,
        title: "Safe Frame Prefix Without Path Separators",
        description: "Frame filename prefixes must not contain path separators or NUL bytes.",
        message: "Expected a frame prefix without path separators or NUL bytes",
      }),
    ],
    {
      identifier: $I`SafeFramePrefixChecks`,
      title: "Safe Frame Prefix",
      description: "Checks for frame prefixes that stay within the selected output directory.",
    }
  )
).pipe(
  $I.annoteSchema("SafeFramePrefix", {
    description: "Frame filename prefix that cannot escape the output directory.",
  })
);

/**
 * Safe frame filename prefix.
 *
 * @example
 * ```ts
 * import type { SafeFramePrefix } from "@beep/ffmpeg"
 *
 * const prefix = "clip_frame" as SafeFramePrefix
 * console.log(prefix)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type SafeFramePrefix = typeof SafeFramePrefix.Type;

/**
 * Runtime path overrides for the native FFmpeg binaries.
 *
 * @example
 * ```ts
 * import { FFmpegConfigInput } from "@beep/ffmpeg"
 *
 * const config = FFmpegConfigInput.make({ ffmpegPath: "ffmpeg", ffprobePath: "ffprobe" })
 * console.log(config)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FFmpegConfigInput extends S.Class<FFmpegConfigInput>($I`FFmpegConfigInput`)(
  {
    ffmpegPath: S.optionalKey(S.String),
    ffprobePath: S.optionalKey(S.String),
    forceKillAfterMillis: S.optionalKey(PositiveMilliseconds),
  },
  $I.annote("FFmpegConfigInput", {
    description: "Optional runtime path overrides for native FFmpeg binaries.",
  })
) {}

/**
 * Resolved runtime configuration for the native FFmpeg driver.
 *
 * @example
 * ```ts
 * import { FFmpegConfig } from "@beep/ffmpeg"
 *
 * const config = FFmpegConfig.make({
 *   ffmpegPath: "ffmpeg",
 *   ffprobePath: "ffprobe",
 *   forceKillAfterMillis: 2000
 * })
 * console.log(config)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FFmpegConfig extends S.Class<FFmpegConfig>($I`FFmpegConfig`)(
  {
    ffmpegPath: S.String,
    ffprobePath: S.String,
    forceKillAfterMillis: PositiveMilliseconds,
  },
  $I.annote("FFmpegConfig", {
    description: "Resolved runtime configuration for native FFmpeg command execution.",
  })
) {}

/**
 * Request to probe a video's first video stream.
 *
 * @example
 * ```ts
 * import { ProbeVideoRequest } from "@beep/ffmpeg"
 *
 * const request = ProbeVideoRequest.make({ videoPath: "./clip.mp4" })
 * console.log(request)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ProbeVideoRequest extends S.Class<ProbeVideoRequest>($I`ProbeVideoRequest`)(
  {
    videoPath: S.String,
  },
  $I.annote("ProbeVideoRequest", {
    description: "Request to probe a video's first video stream.",
  })
) {}

/**
 * Video metadata extracted from ffprobe.
 *
 * @example
 * ```ts
 * import { VideoProbe } from "@beep/ffmpeg"
 *
 * const probe = VideoProbe.make({ videoPath: "./clip.mp4", durationSeconds: 3 })
 * console.log(probe)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class VideoProbe extends S.Class<VideoProbe>($I`VideoProbe`)(
  {
    videoPath: S.String,
    durationSeconds: S.optionalKey(S.Finite),
    fps: S.optionalKey(S.Finite),
    frameCount: S.optionalKey(S.Finite),
    height: S.optionalKey(S.Finite),
    width: S.optionalKey(S.Finite),
  },
  $I.annote("VideoProbe", {
    description: "Video metadata extracted from the first ffprobe video stream.",
  })
) {}

/**
 * Request to extract PNG frames from a video.
 *
 * @example
 * ```ts
 * import { ExtractFramesRequest } from "@beep/ffmpeg"
 * import * as O from "effect/Option"
 *
 * const request = ExtractFramesRequest.make({
 *   fps: 1,
 *   manifestPath: O.none(),
 *   outDir: "./frames",
 *   overwrite: false,
 *   prefix: O.none(),
 *   videoPath: "./clip.mp4"
 * })
 * console.log(request)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ExtractFramesRequest extends S.Class<ExtractFramesRequest>($I`ExtractFramesRequest`)(
  {
    fps: PositiveFrameRate,
    manifestPath: S.Option(S.String).pipe(
      S.withConstructorDefault(Effect.succeed(O.none<string>())),
      S.withDecodingDefault(Effect.succeed(O.none<string>()))
    ),
    outDir: S.String,
    overwrite: S.Boolean.pipe(
      S.withConstructorDefault(Effect.succeed(false)),
      S.withDecodingDefault(Effect.succeed(false))
    ),
    prefix: S.Option(SafeFramePrefix).pipe(
      S.withConstructorDefault(Effect.succeed(O.none<SafeFramePrefix>())),
      S.withDecodingDefault(Effect.succeed(O.none<SafeFramePrefix>()))
    ),
    videoPath: S.String,
  },
  $I.annote("ExtractFramesRequest", {
    description: "Request to extract PNG frames from a video at a fixed frame rate.",
  })
) {}

/**
 * A frame written by an extract-frames run.
 *
 * @example
 * ```ts
 * import { ExtractedFrame } from "@beep/ffmpeg"
 *
 * const frame = ExtractedFrame.make({
 *   fileName: "clip_frame_00000.png",
 *   index: 0,
 *   path: "./frames/clip_frame_00000.png",
 *   relativePath: "clip_frame_00000.png"
 * })
 * console.log(frame)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ExtractedFrame extends S.Class<ExtractedFrame>($I`ExtractedFrame`)(
  {
    fileName: S.String,
    index: S.Finite,
    path: S.String,
    relativePath: S.String,
  },
  $I.annote("ExtractedFrame", {
    description: "A PNG frame written by an extract-frames run.",
  })
) {}

/**
 * Options recorded in an extract-frames manifest.
 *
 * @example
 * ```ts
 * import { ExtractFramesManifestOptions } from "@beep/ffmpeg"
 *
 * const options = ExtractFramesManifestOptions.make({ fps: 1, overwrite: false, prefix: "clip_frame" })
 * console.log(options)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ExtractFramesManifestOptions extends S.Class<ExtractFramesManifestOptions>(
  $I`ExtractFramesManifestOptions`
)(
  {
    fps: PositiveFrameRate,
    overwrite: S.Boolean,
    prefix: SafeFramePrefix,
  },
  $I.annote("ExtractFramesManifestOptions", {
    description: "Options recorded in an extract-frames manifest.",
  })
) {}

/**
 * Summary recorded in an extract-frames manifest.
 *
 * @example
 * ```ts
 * import { ExtractFramesManifestSummary } from "@beep/ffmpeg"
 *
 * const summary = ExtractFramesManifestSummary.make({ frameCount: 3 })
 * console.log(summary)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ExtractFramesManifestSummary extends S.Class<ExtractFramesManifestSummary>(
  $I`ExtractFramesManifestSummary`
)(
  {
    frameCount: S.Finite,
  },
  $I.annote("ExtractFramesManifestSummary", {
    description: "Summary recorded in an extract-frames manifest.",
  })
) {}

/**
 * JSON manifest written by an extract-frames run.
 *
 * @example
 * ```ts
 * import { ExtractFramesManifest, ExtractFramesManifestOptions, ExtractFramesManifestSummary } from "@beep/ffmpeg"
 *
 * const manifest = ExtractFramesManifest.make({
 *   frames: [],
 *   manifestPath: "./frames/extract-frames-manifest.json",
 *   options: ExtractFramesManifestOptions.make({ fps: 1, overwrite: false, prefix: "clip_frame" }),
 *   outputDirectory: "./frames",
 *   probe: { videoPath: "./clip.mp4" },
 *   schemaVersion: "beep.ffmpeg.extract-frames.v1",
 *   sourceVideo: "./clip.mp4",
 *   summary: ExtractFramesManifestSummary.make({ frameCount: 0 })
 * })
 * console.log(manifest)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ExtractFramesManifest extends S.Class<ExtractFramesManifest>($I`ExtractFramesManifest`)(
  {
    frames: S.Array(ExtractedFrame),
    manifestPath: S.String,
    options: ExtractFramesManifestOptions,
    outputDirectory: S.String,
    probe: VideoProbe,
    schemaVersion: S.Literal("beep.ffmpeg.extract-frames.v1"),
    sourceVideo: S.String,
    summary: ExtractFramesManifestSummary,
  },
  $I.annote("ExtractFramesManifest", {
    description: "JSON manifest written by a successful extract-frames run.",
  })
) {}

/**
 * Result returned after frames have been committed.
 *
 * @example
 * ```ts
 * import { ExtractFramesResult } from "@beep/ffmpeg"
 *
 * const result = ExtractFramesResult.make({
 *   frameCount: 0,
 *   frames: [],
 *   manifestPath: "./frames/extract-frames-manifest.json",
 *   outDir: "./frames",
 *   videoPath: "./clip.mp4"
 * })
 * console.log(result)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ExtractFramesResult extends S.Class<ExtractFramesResult>($I`ExtractFramesResult`)(
  {
    frameCount: S.Finite,
    frames: S.Array(ExtractedFrame),
    manifestPath: S.String,
    outDir: S.String,
    videoPath: S.String,
  },
  $I.annote("ExtractFramesResult", {
    description: "Result returned after frames and manifest have been committed.",
  })
) {}

/**
 * Event emitted when extract-frames starts.
 *
 * @example
 * ```ts
 * import { FFmpegStartedEvent } from "@beep/ffmpeg"
 *
 * const event = FFmpegStartedEvent.make({
 *   args: [],
 *   command: "ffmpeg",
 *   kind: "started",
 *   outDir: "./frames",
 *   videoPath: "./clip.mp4"
 * })
 * console.log(event)
 * ```
 *
 * @category events
 * @since 0.0.0
 */
export class FFmpegStartedEvent extends S.Class<FFmpegStartedEvent>($I`FFmpegStartedEvent`)(
  {
    args: S.Array(S.String),
    command: S.String,
    kind: S.tag("started"),
    outDir: S.String,
    videoPath: S.String,
  },
  $I.annote("FFmpegStartedEvent", {
    description: "Event emitted before the ffmpeg extraction process starts.",
  })
) {}

/**
 * Event emitted when ffmpeg reports extraction progress.
 *
 * @example
 * ```ts
 * import { FFmpegProgressEvent } from "@beep/ffmpeg"
 *
 * const event = FFmpegProgressEvent.make({ frameCount: 1, kind: "progress", percent: 50, progress: "continue" })
 * console.log(event)
 * ```
 *
 * @category events
 * @since 0.0.0
 */
export class FFmpegProgressEvent extends S.Class<FFmpegProgressEvent>($I`FFmpegProgressEvent`)(
  {
    frameCount: S.Finite,
    kind: S.tag("progress"),
    outTimeSeconds: S.optionalKey(S.Finite),
    percent: S.Finite,
    progress: S.String,
    speed: S.optionalKey(S.String),
  },
  $I.annote("FFmpegProgressEvent", {
    description: "Event emitted when ffmpeg reports extraction progress.",
  })
) {}

/**
 * Event emitted after frames and manifest are committed.
 *
 * @example
 * ```ts
 * import { FFmpegCompletedEvent } from "@beep/ffmpeg"
 *
 * const event = FFmpegCompletedEvent.make({
 *   frameCount: 1,
 *   kind: "completed",
 *   manifestPath: "./frames/extract-frames-manifest.json",
 *   outDir: "./frames"
 * })
 * console.log(event)
 * ```
 *
 * @category events
 * @since 0.0.0
 */
export class FFmpegCompletedEvent extends S.Class<FFmpegCompletedEvent>($I`FFmpegCompletedEvent`)(
  {
    frameCount: S.Finite,
    kind: S.tag("completed"),
    manifestPath: S.String,
    outDir: S.String,
  },
  $I.annote("FFmpegCompletedEvent", {
    description: "Event emitted after frames and manifest are committed.",
  })
) {}

/**
 * Structured events emitted by extract-frames.
 *
 * @example
 * ```ts
 * import type { FFmpegEvent } from "@beep/ffmpeg"
 *
 * const log = (event: FFmpegEvent) => event.kind
 * console.log(log)
 * ```
 *
 * @category events
 * @since 0.0.0
 */
export const FFmpegEvent = S.Union([FFmpegStartedEvent, FFmpegProgressEvent, FFmpegCompletedEvent]).pipe(
  S.toTaggedUnion("kind"),
  $I.annoteSchema("FFmpegEvent", {
    description: "Structured events emitted by extract-frames.",
  })
);

/**
 * Structured events emitted by extract-frames.
 *
 * @example
 * ```ts
 * import type { FFmpegEvent } from "@beep/ffmpeg"
 *
 * const eventKind = (event: FFmpegEvent) => event.kind
 * console.log(eventKind)
 * ```
 *
 * @category events
 * @since 0.0.0
 */
export type FFmpegEvent = typeof FFmpegEvent.Type;

/**
 * Decode an unknown value into an extract-frames request.
 *
 * @example
 * ```ts
 * import { decodeExtractFramesRequest } from "@beep/ffmpeg"
 *
 * const effect = decodeExtractFramesRequest({ fps: 1, outDir: "./frames", videoPath: "./clip.mp4" })
 * console.log(effect)
 * ```
 *
 * @category decoding
 * @since 0.0.0
 */
export const decodeExtractFramesRequest = S.decodeUnknownEffect(ExtractFramesRequest);

/**
 * Decode an unknown value into a probe request.
 *
 * @example
 * ```ts
 * import { decodeProbeVideoRequest } from "@beep/ffmpeg"
 *
 * const effect = decodeProbeVideoRequest({ videoPath: "./clip.mp4" })
 * console.log(effect)
 * ```
 *
 * @category decoding
 * @since 0.0.0
 */
export const decodeProbeVideoRequest = S.decodeUnknownEffect(ProbeVideoRequest);

/**
 * Encode an extract-frames manifest into its JSON-safe shape.
 *
 * @example
 * ```ts
 * import { encodeExtractFramesManifest, ExtractFramesManifest, ExtractFramesManifestOptions, ExtractFramesManifestSummary } from "@beep/ffmpeg"
 *
 * const encoded = encodeExtractFramesManifest(ExtractFramesManifest.make({
 *   frames: [],
 *   manifestPath: "./frames/extract-frames-manifest.json",
 *   options: ExtractFramesManifestOptions.make({ fps: 1, overwrite: false, prefix: "clip_frame" }),
 *   outputDirectory: "./frames",
 *   probe: { videoPath: "./clip.mp4" },
 *   schemaVersion: "beep.ffmpeg.extract-frames.v1",
 *   sourceVideo: "./clip.mp4",
 *   summary: ExtractFramesManifestSummary.make({ frameCount: 0 })
 * }))
 * console.log(encoded)
 * ```
 *
 * @category encoding
 * @since 0.0.0
 */
export const encodeExtractFramesManifest = S.encodeUnknownEffect(ExtractFramesManifest);
