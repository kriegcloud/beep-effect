/**
 * Image and video curation command suite.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { ExtractFramesRequest, FFmpeg, type FFmpegEvent } from "@beep/ffmpeg";
import { $RepoCliId } from "@beep/identity/packages";
import { TaggedErrorClass, VideoFileExtension } from "@beep/schema";
import { A, Str } from "@beep/utils";
import { Cause, Console, Effect, Exit, FileSystem, Match, Order, Path, pipe, Terminal } from "effect";
import { dual, flow } from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import { Command, Flag } from "effect/unstable/cli";

const $I = $RepoCliId.create("commands/Image");
const BAR_WIDTH = 24;

const repeatBarWidth = Str.repeat(BAR_WIDTH);
const videoExtensionGuard = S.is(VideoFileExtension);

const videoFlag = Flag.file("video", { mustExist: true }).pipe(Flag.withDescription("Input video file to sample"));
const dirFlag = Flag.directory("dir", { mustExist: true }).pipe(
  Flag.withDescription("Directory containing direct video files to sample")
);
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

/**
 * Error raised by image curation commands.
 *
 * @example
 * ```ts
 * import { ImageCommandError } from "@beep/repo-cli/commands/Image/index"
 *
 * const error = new ImageCommandError({ message: "No videos found" })
 * void error.message
 * ```
 * @category error-handling
 * @since 0.0.0
 */
export class ImageCommandError extends TaggedErrorClass<ImageCommandError>($I`ImageCommandError`)(
  "ImageCommandError",
  {
    message: S.String,
  },
  $I.annote("ImageCommandError", {
    description: "A failure raised while preparing or applying an image curation operation.",
  })
) {}

/**
 * Direct video selected by `image extract-frames-dir`.
 *
 * @category models
 * @since 0.0.0
 */
export class ExtractFramesDirVideo extends S.Class<ExtractFramesDirVideo>($I`ExtractFramesDirVideo`)(
  {
    outDir: S.String,
    sourceName: S.String,
    sourcePath: S.String,
    stem: S.String,
  },
  $I.annote("ExtractFramesDirVideo", {
    description: "A direct video file selected for folder-based frame extraction.",
  })
) {}

/**
 * Failed video from a folder-based frame extraction run.
 *
 * @category models
 * @since 0.0.0
 */
export class ExtractFramesDirFailure extends S.Class<ExtractFramesDirFailure>($I`ExtractFramesDirFailure`)(
  {
    message: S.String,
    sourceName: S.String,
    sourcePath: S.String,
  },
  $I.annote("ExtractFramesDirFailure", {
    description: "Failure summary for one video in a folder-based frame extraction run.",
  })
) {}

const normalizeBareExtension = flow(Str.replace(/^\./, ""), Str.toLowerCase);

const isVideoFileName: {
  (path: Path.Path, name: string): boolean;
  (name: string): (path: Path.Path) => boolean;
} = dual(2, (path: Path.Path, name: string): boolean =>
  pipe(path.extname(name), normalizeBareExtension, videoExtensionGuard)
);
type RenderProgressBarEvent = typeof FFmpegEvent.cases.progress.Type;
const renderProgressBar: {
  (label: string, event: RenderProgressBarEvent): string;
  (event: RenderProgressBarEvent): (label: string) => string;
} = dual(2, (label: string, event: RenderProgressBarEvent): string => {
  const filled = Math.max(0, Math.min(BAR_WIDTH, Math.round((event.percent / 100) * BAR_WIDTH)));
  const empty = BAR_WIDTH - filled;
  const bar = `${pipe("#", Str.repeat(filled))}${pipe("-", Str.repeat(empty))}`;
  return `\r${label} [${bar}] ${event.frameCount} frame(s) ${event.percent.toFixed(1)}%`;
});

const renderExtractFramesEvent: {
  (terminal: Terminal.Terminal, label: string, event: FFmpegEvent): Effect.Effect<void, never>;
  (label: string, event: FFmpegEvent): (terminal: Terminal.Terminal) => Effect.Effect<void, never>;
} = dual(
  3,
  Effect.fnUntraced(function* (
    terminal: Terminal.Terminal,
    label: string,
    event: FFmpegEvent
  ): Effect.fn.Return<void, never> {
    return yield* Match.value(event).pipe(
      Match.discriminators("kind")({
        progress: (event) => terminal.display(renderProgressBar(label, event)).pipe(Effect.ignore),
        completed: (event) =>
          terminal
            .display(`\r${label} [${pipe("#", repeatBarWidth)}] ${event.frameCount} frame(s) 100.0%\n`)
            .pipe(Effect.ignore),
      }),
      Match.orElse(() =>
        terminal.display(`\r${label} [${pipe("-", repeatBarWidth)}] 0 frame(s) 0.0%`).pipe(Effect.ignore)
      )
    );
  })
);

const printImageIndex = () => Console.log("image commands: extract-frames, extract-frames-dir");

const makeExtractFramesRequest = (options: {
  readonly fps: number;
  readonly manifest: O.Option<string>;
  readonly outDir: string;
  readonly overwrite: boolean;
  readonly prefix: O.Option<string>;
  readonly video: string;
}): ExtractFramesRequest =>
  new ExtractFramesRequest({
    fps: options.fps,
    manifestPath: options.manifest,
    outDir: options.outDir,
    overwrite: options.overwrite,
    prefix: options.prefix,
    videoPath: options.video,
  });

const extractFramesSummary = (frameCount: number, outDir: string, manifestPath: string): string =>
  `wrote ${frameCount} frame(s) to ${outDir}. manifest: ${manifestPath}`;

const makeExtractFramesEvents = (
  terminal: Terminal.Terminal,
  label: string
): ((event: FFmpegEvent) => Effect.Effect<void, never>) | undefined =>
  process.stdout.isTTY === true ? (event: FFmpegEvent) => renderExtractFramesEvent(terminal, label, event) : undefined;

const runExtractFrames = Effect.fn("Image.runExtractFrames")(function* (label: string, request: ExtractFramesRequest) {
  const ffmpeg = yield* FFmpeg;
  const terminal = yield* Terminal.Terminal;
  return yield* ffmpeg.extractFrames(request, makeExtractFramesEvents(terminal, label));
});

const extractCauseMessage = (cause: Cause.Cause<unknown>): string => {
  const error = Cause.squash(cause);
  if (P.hasProperty(error, "message") && P.isString(error.message)) {
    return error.message;
  }

  return Cause.pretty(cause);
};

const collectExtractFramesDirVideos = Effect.fn("Image.collectExtractFramesDirVideos")(function* (
  dir: string
): Effect.fn.Return<ReadonlyArray<ExtractFramesDirVideo>, ImageCommandError, FileSystem.FileSystem | Path.Path> {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const directory = path.resolve(dir);
  const entries = yield* fs.readDirectory(directory).pipe(
    Effect.mapError(
      () =>
        new ImageCommandError({
          message: `Failed to read video directory: "${directory}"`,
        })
    )
  );
  let videos = A.empty<ExtractFramesDirVideo>();

  for (const entry of entries) {
    const sourcePath = path.join(directory, entry);
    const stat = yield* fs.stat(sourcePath).pipe(Effect.option);
    if (O.isNone(stat) || stat.value.type !== "File" || !isVideoFileName(path, entry)) {
      continue;
    }

    const extension = path.extname(entry);
    const stem = path.basename(entry, extension);
    videos = A.append(
      videos,
      new ExtractFramesDirVideo({
        outDir: path.join(directory, stem),
        sourceName: entry,
        sourcePath,
        stem,
      })
    );
  }

  return A.sort(
    videos,
    Order.mapInput(Str.orderAsc, (video: ExtractFramesDirVideo) => video.sourceName)
  );
});

const preflightExtractFramesDirVideos = Effect.fn("Image.preflightExtractFramesDirVideos")(function* (
  videos: ReadonlyArray<ExtractFramesDirVideo>
): Effect.fn.Return<void, ImageCommandError> {
  if (A.length(videos) === 0) {
    return yield* new ImageCommandError({ message: "image extract-frames-dir: no direct video files found." });
  }

  let stems = A.empty<string>();
  for (const video of videos) {
    if (A.contains(stems, video.stem)) {
      return yield* new ImageCommandError({
        message: `image extract-frames-dir: multiple videos would write to "${video.outDir}".`,
      });
    }
    stems = A.append(stems, video.stem);
  }
});

const runExtractFramesDir = Effect.fn("Image.runExtractFramesDir")(function* (options: {
  readonly dir: string;
  readonly fps: number;
  readonly overwrite: boolean;
  readonly prefix: O.Option<string>;
}) {
  const videos = yield* collectExtractFramesDirVideos(options.dir);
  yield* preflightExtractFramesDirVideos(videos);
  let completedCount = 0;
  let failed = A.empty<ExtractFramesDirFailure>();

  for (const video of videos) {
    const request = makeExtractFramesRequest({
      fps: options.fps,
      manifest: O.none(),
      outDir: video.outDir,
      overwrite: options.overwrite,
      prefix: options.prefix,
      video: video.sourcePath,
    });
    const exit = yield* Effect.exit(runExtractFrames(`image extract-frames-dir ${video.sourceName}`, request));

    if (Exit.isSuccess(exit)) {
      completedCount += 1;
      yield* Console.log(
        `image extract-frames-dir: ${video.sourceName}: ${extractFramesSummary(
          exit.value.frameCount,
          exit.value.outDir,
          exit.value.manifestPath
        )}`
      );
    } else {
      const message = extractCauseMessage(exit.cause);
      failed = A.append(
        failed,
        new ExtractFramesDirFailure({
          message,
          sourceName: video.sourceName,
          sourcePath: video.sourcePath,
        })
      );
      yield* Console.error(`image extract-frames-dir: ${video.sourceName}: failed: ${message}`);
    }
  }

  yield* Console.log(
    `image extract-frames-dir: processed ${A.length(videos)} video(s); succeeded ${completedCount}; failed ${A.length(
      failed
    )}.`
  );

  if (A.length(failed) > 0) {
    return yield* new ImageCommandError({
      message: `image extract-frames-dir: ${A.length(failed)} video(s) failed.`,
    });
  }
});

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
  ({ fps, manifest, outDir, overwrite, prefix, video }) =>
    runExtractFrames(
      "image extract-frames",
      makeExtractFramesRequest({
        fps,
        manifest,
        outDir,
        overwrite,
        prefix,
        video,
      })
    ).pipe(
      Effect.tap((result) =>
        Console.log(
          `image extract-frames: ${extractFramesSummary(result.frameCount, result.outDir, result.manifestPath)}`
        )
      )
    )
).pipe(
  Command.withDescription("Extract PNG frames from a video with native ffmpeg"),
  Command.provide(FFmpeg.makeLayer())
);

const imageExtractFramesDirCommand = Command.make(
  "extract-frames-dir",
  {
    dir: dirFlag,
    fps: fpsFlag,
    overwrite: overwriteFlag,
    prefix: prefixFlag,
  },
  runExtractFramesDir
).pipe(
  Command.withDescription("Extract PNG frames from every direct video file in a directory"),
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
  Command.withSubcommands([imageExtractFramesCommand, imageExtractFramesDirCommand])
);
