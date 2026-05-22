/**
 * Service implementation for image and video curation commands.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { ExtractFramesRequest, type ExtractFramesResult, FFmpeg, type FFmpegError } from "@beep/ffmpeg";
import { $RepoCliId } from "@beep/identity/packages";
import { VideoFileExtension } from "@beep/schema";
import { A, Str } from "@beep/utils";
import { Cause, Context, Effect, Exit, FileSystem, Layer, Order, Path, pipe, Terminal } from "effect";
import { dual, flow } from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import type { ChildProcessSpawner } from "effect/unstable/process";
import { ImageCommandError } from "./Image.errors.js";
import { makeExtractFramesEvents } from "./Image.progress.js";
import {
  decodeExtractFramesDirOptions,
  decodeExtractFramesOptions,
  ExtractFramesDirFailure,
  type ExtractFramesDirOptions,
  ExtractFramesDirResult,
  ExtractFramesDirSuccess,
  ExtractFramesDirVideo,
  ExtractFramesOptions,
} from "./Image.schemas.js";

const $I = $RepoCliId.create("commands/Image/Image.service");

type ImageCommandServiceContext = FFmpeg | FileSystem.FileSystem | Path.Path | Terminal.Terminal;

type ImageCommandServiceRequirements =
  | ChildProcessSpawner.ChildProcessSpawner
  | FileSystem.FileSystem
  | Path.Path
  | Terminal.Terminal;

/**
 * Service contract for image and video curation commands.
 *
 * @category services
 * @since 0.0.0
 */
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

/**
 * Service tag for image and video curation operations.
 *
 * @category services
 * @since 0.0.0
 */
export class ImageCommandService extends Context.Service<ImageCommandService, ImageCommandServiceShape>()(
  $I`ImageCommandService`
) {}

const normalizeBareExtension = flow(Str.replace(/^\./, ""), Str.toLowerCase);
const videoExtensionGuard = S.is(VideoFileExtension);

const isVideoFileName: {
  (path: Path.Path, name: string): boolean;
  (name: string): (path: Path.Path) => boolean;
} = dual(2, (path: Path.Path, name: string): boolean =>
  pipe(name, path.extname, normalizeBareExtension, videoExtensionGuard)
);

const makeExtractFramesRequest = (options: ExtractFramesOptions): ExtractFramesRequest =>
  ExtractFramesRequest.make({
    fps: options.fps,
    manifestPath: options.manifest,
    outDir: options.outDir,
    overwrite: options.overwrite,
    prefix: options.prefix,
    videoPath: options.video,
  });

const validateExtractFramesOptions = (
  options: ExtractFramesOptions
): Effect.Effect<ExtractFramesOptions, ImageCommandError> =>
  decodeExtractFramesOptions(options).pipe(
    Effect.mapError((cause) =>
      ImageCommandError.make({
        message: "Invalid image extract-frames options. Expected a video, output directory, and positive FPS.",
        cause,
      })
    )
  );

const validateExtractFramesDirOptions = (
  options: ExtractFramesDirOptions
): Effect.Effect<ExtractFramesDirOptions, ImageCommandError> =>
  decodeExtractFramesDirOptions(options).pipe(
    Effect.mapError((cause) =>
      ImageCommandError.make({
        message: "Invalid image extract-frames-dir options. Expected a directory and positive FPS.",
        cause,
      })
    )
  );

const extractCauseMessage = (cause: Cause.Cause<unknown>): string => {
  const error = Cause.squash(cause);
  if (P.hasProperty(error, "message") && P.isString(error.message)) {
    return error.message;
  }

  return Cause.pretty(cause);
};

const runExtractFramesImpl = Effect.fn("ImageCommandService.extractFrames")(function* (
  label: string,
  options: ExtractFramesOptions
): Effect.fn.Return<ExtractFramesResult, FFmpegError | ImageCommandError, ImageCommandServiceContext> {
  const decoded = yield* validateExtractFramesOptions(options);
  const ffmpeg = yield* FFmpeg;
  const terminal = yield* Terminal.Terminal;
  return yield* ffmpeg.extractFrames(makeExtractFramesRequest(decoded), makeExtractFramesEvents(terminal, label));
});

const collectExtractFramesDirVideos = Effect.fn("ImageCommandService.collectExtractFramesDirVideos")(function* (
  dir: string
): Effect.fn.Return<ReadonlyArray<ExtractFramesDirVideo>, ImageCommandError, FileSystem.FileSystem | Path.Path> {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const directory = path.resolve(dir);
  const entries = yield* fs.readDirectory(directory).pipe(
    Effect.mapError((cause) =>
      ImageCommandError.make({
        message: `Failed to read video directory: "${directory}"`,
        cause,
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
      ExtractFramesDirVideo.make({
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

const preflightExtractFramesDirVideos = Effect.fn("ImageCommandService.preflightExtractFramesDirVideos")(function* (
  videos: ReadonlyArray<ExtractFramesDirVideo>
): Effect.fn.Return<void, ImageCommandError> {
  if (A.length(videos) === 0) {
    return yield* ImageCommandError.make({ message: "image extract-frames-dir: no direct video files found." });
  }

  let stems = A.empty<string>();
  for (const video of videos) {
    if (A.contains(stems, video.stem)) {
      return yield* ImageCommandError.make({
        message: `image extract-frames-dir: multiple videos would write to "${video.outDir}".`,
      });
    }
    stems = A.append(stems, video.stem);
  }
});

const runExtractFramesDirImpl = Effect.fn("ImageCommandService.extractFramesDir")(function* (
  options: ExtractFramesDirOptions
): Effect.fn.Return<ExtractFramesDirResult, ImageCommandError, ImageCommandServiceContext> {
  const decoded = yield* validateExtractFramesDirOptions(options);
  const videos = yield* collectExtractFramesDirVideos(decoded.dir);
  yield* preflightExtractFramesDirVideos(videos);
  let completedCount = 0;
  let failedCount = 0;
  let outcomes = A.empty<ExtractFramesDirSuccess | ExtractFramesDirFailure>();

  for (const video of videos) {
    const request = ExtractFramesOptions.make({
      fps: decoded.fps,
      manifest: O.none(),
      outDir: video.outDir,
      overwrite: decoded.overwrite,
      prefix: decoded.prefix,
      video: video.sourcePath,
    });
    const exit = yield* Effect.exit(runExtractFramesImpl(`image extract-frames-dir ${video.sourceName}`, request));

    if (Exit.isSuccess(exit)) {
      completedCount += 1;
      outcomes = A.append(
        outcomes,
        ExtractFramesDirSuccess.make({
          result: exit.value,
          sourceName: video.sourceName,
          sourcePath: video.sourcePath,
          status: "success",
        })
      );
    } else {
      failedCount += 1;
      outcomes = A.append(
        outcomes,
        ExtractFramesDirFailure.make({
          message: extractCauseMessage(exit.cause),
          sourceName: video.sourceName,
          sourcePath: video.sourcePath,
          status: "failure",
        })
      );
    }
  }

  return ExtractFramesDirResult.make({
    completedCount,
    failedCount,
    outcomes,
    totalCount: A.length(videos),
  });
});

const makeImageCommandService = Effect.fn("ImageCommandService.make")(function* () {
  const runtimeContext = yield* Effect.context<ImageCommandServiceContext>();

  return ImageCommandService.of({
    extractFrames: Effect.fn("ImageCommandService.extractFrames")((options) =>
      runExtractFramesImpl("image extract-frames", options).pipe(Effect.provide(runtimeContext))
    ),
    extractFramesDir: Effect.fn("ImageCommandService.extractFramesDir")((options) =>
      runExtractFramesDirImpl(options).pipe(Effect.provide(runtimeContext))
    ),
  });
});

/**
 * Live service layer for image and video curation operations.
 *
 * @category layers
 * @since 0.0.0
 */
export const ImageCommandServiceLive: Layer.Layer<ImageCommandService, never, ImageCommandServiceRequirements> =
  Layer.effect(ImageCommandService, makeImageCommandService()).pipe(Layer.provideMerge(FFmpeg.makeLayer()));

/**
 * Extract PNG frames from a single video.
 *
 * @param options - Single-video frame extraction options.
 * @returns Frame extraction result.
 * @category use-cases
 * @since 0.0.0
 */
export const extractFrames = Effect.fn("Image.extractFrames")(function* (
  options: ExtractFramesOptions
): Effect.fn.Return<ExtractFramesResult, FFmpegError | ImageCommandError, ImageCommandService> {
  const image = yield* ImageCommandService;
  return yield* image.extractFrames(options);
});

/**
 * Extract PNG frames from every direct video in a directory.
 *
 * @param options - Directory frame extraction options.
 * @returns Directory extraction result.
 * @category use-cases
 * @since 0.0.0
 */
export const extractFramesDir = Effect.fn("Image.extractFramesDir")(function* (
  options: ExtractFramesDirOptions
): Effect.fn.Return<ExtractFramesDirResult, ImageCommandError, ImageCommandService> {
  const image = yield* ImageCommandService;
  return yield* image.extractFramesDir(options);
});
