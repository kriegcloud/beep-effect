/**
 * Image and video curation command suite.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { ExtractFramesRequest, FFmpeg, type FFmpegError, type FFmpegEvent } from "@beep/ffmpeg";
import { Console, Effect, pipe, Terminal } from "effect";
import * as Str from "effect/String";
import { Command, Flag } from "effect/unstable/cli";

const barWidth = 24;

const videoFlag = Flag.file("video", { mustExist: true }).pipe(Flag.withDescription("Input video file to sample"));
const outDirFlag = Flag.directory("out-dir").pipe(Flag.withDescription("Output directory for extracted PNG frames"));
const fpsFlag = Flag.float("fps").pipe(Flag.withDescription("Positive frame extraction rate in frames per second"));
const prefixFlag = Flag.string("prefix").pipe(
  Flag.withDescription("Generated frame prefix; defaults to <video-stem>_frame"),
  Flag.optional
);
const manifestFlag = Flag.path("manifest", { pathType: "file" }).pipe(
  Flag.withDescription("Manifest output path; defaults to --out-dir/extract-frames-manifest.json"),
  Flag.optional
);
const overwriteFlag = Flag.boolean("overwrite").pipe(
  Flag.withDescription("Overwrite existing frame outputs and manifest")
);

const renderProgressBar = (event: Extract<FFmpegEvent, { readonly kind: "progress" }>): string => {
  const filled = Math.max(0, Math.min(barWidth, Math.round((event.percent / 100) * barWidth)));
  const empty = barWidth - filled;
  const bar = `${pipe("#", Str.repeat(filled))}${pipe("-", Str.repeat(empty))}`;
  return `\rimage extract-frames [${bar}] ${event.frameCount} frame(s) ${event.percent.toFixed(1)}%`;
};

const renderExtractFramesEvent = (terminal: Terminal.Terminal, event: FFmpegEvent): Effect.Effect<void, never> => {
  if (event.kind === "progress") {
    return terminal.display(renderProgressBar(event)).pipe(Effect.ignore);
  }

  if (event.kind === "completed") {
    return terminal
      .display(`\rimage extract-frames [${pipe("#", Str.repeat(barWidth))}] ${event.frameCount} frame(s) 100.0%\n`)
      .pipe(Effect.ignore);
  }

  return terminal
    .display(`\rimage extract-frames [${pipe("-", Str.repeat(barWidth))}] 0 frame(s) 0.0%`)
    .pipe(Effect.ignore);
};

const printImageIndex = Effect.fn("Image.printImageIndex")(function* () {
  yield* Console.log("image commands: extract-frames");
});

const runImageProgram = <A, R>(effect: Effect.Effect<A, FFmpegError, R>): Effect.Effect<void, never, R> =>
  effect.pipe(
    Effect.catchTag(
      "FFmpegError",
      Effect.fn(function* (error) {
        process.exitCode = 1;
        yield* Console.error(`[image] ${error.message}`);
      })
    ),
    Effect.asVoid
  );

const imageExtractFramesCommand = Command.make(
  "extract-frames",
  {
    fps: fpsFlag,
    manifest: manifestFlag,
    outDir: outDirFlag,
    overwrite: overwriteFlag,
    prefix: prefixFlag,
    video: videoFlag,
  },
  Effect.fn(function* ({ fps, manifest, outDir, overwrite, prefix, video }) {
    const ffmpeg = yield* FFmpeg;
    const terminal = yield* Terminal.Terminal;
    const isTty = process.stdout.isTTY === true;
    const events = isTty ? (event: FFmpegEvent) => renderExtractFramesEvent(terminal, event) : undefined;
    const request = new ExtractFramesRequest({
      fps,
      manifestPath: manifest,
      outDir,
      overwrite,
      prefix,
      videoPath: video,
    });

    yield* runImageProgram(
      Effect.gen(function* () {
        const result = yield* ffmpeg.extractFrames(request, events);
        yield* Console.log(
          `image extract-frames: wrote ${result.frameCount} frame(s) to ${result.outDir}. manifest: ${result.manifestPath}`
        );
      })
    );
  })
).pipe(
  Command.withDescription("Extract PNG frames from a video with native ffmpeg"),
  Command.provide(FFmpeg.makeLayer())
);

/**
 * Image and video curation command group.
 *
 * @example
 * ```ts
 * import { imageCommand } from "@beep/repo-cli"
 * void imageCommand
 * ```
 * @category use-cases
 * @since 0.0.0
 */
export const imageCommand = Command.make("image", {}, printImageIndex).pipe(
  Command.withDescription("Image and video curation commands"),
  Command.withSubcommands([imageExtractFramesCommand])
);
