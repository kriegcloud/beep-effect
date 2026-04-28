/**
 * Native FFmpeg process driver service.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $FfmpegId } from "@beep/identity/packages";
import { Context, Effect, FileSystem, Layer, Number as N, Order, Path, pipe, Ref, Stream } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import type * as PlatformError from "effect/PlatformError";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { ChildProcess, ChildProcessSpawner } from "effect/unstable/process";
import { FFmpegError } from "./FFmpeg.errors.ts";
import {
  decodeExtractFramesRequest,
  decodeProbeVideoRequest,
  ExtractedFrame,
  ExtractFramesManifest,
  ExtractFramesManifestOptions,
  ExtractFramesManifestSummary,
  ExtractFramesRequest,
  ExtractFramesResult,
  encodeExtractFramesManifest,
  FFmpegCompletedEvent,
  FFmpegConfig,
  type FFmpegConfigInput,
  type FFmpegEvent,
  FFmpegProgressEvent,
  FFmpegStartedEvent,
  ProbeVideoRequest,
  VideoProbe,
} from "./FFmpeg.models.ts";

const $I = $FfmpegId.create("FFmpeg.service");
const encodeJson = S.encodeUnknownSync(S.UnknownFromJsonString);
const Numberish = S.Union([S.Number, S.String]);

class FfprobeStream extends S.Class<FfprobeStream>($I`FfprobeStream`)(
  {
    avg_frame_rate: S.optionalKey(Numberish),
    duration: S.optionalKey(Numberish),
    height: S.optionalKey(S.Number),
    nb_frames: S.optionalKey(Numberish),
    r_frame_rate: S.optionalKey(Numberish),
    width: S.optionalKey(S.Number),
  },
  $I.annote("FfprobeStream", {
    description: "Internal ffprobe stream payload.",
  })
) {}

class FfprobeFormat extends S.Class<FfprobeFormat>($I`FfprobeFormat`)(
  {
    duration: S.optionalKey(Numberish),
  },
  $I.annote("FfprobeFormat", {
    description: "Internal ffprobe format payload.",
  })
) {}

class FfprobeOutput extends S.Class<FfprobeOutput>($I`FfprobeOutput`)(
  {
    format: S.optionalKey(FfprobeFormat),
    streams: S.Array(FfprobeStream),
  },
  $I.annote("FfprobeOutput", {
    description: "Internal ffprobe JSON payload.",
  })
) {}

const decodeFfprobeOutput = S.decodeUnknownEffect(S.fromJsonString(FfprobeOutput));

/**
 * Effectful sink for structured FFmpeg events.
 *
 * @example
 * ```ts
 * import type { FFmpegEventSink } from "@beep/ffmpeg"
 * import { Effect } from "effect"
 *
 * const sink: FFmpegEventSink = () => Effect.void
 * void sink
 * ```
 *
 * @category events
 * @since 0.0.0
 */
export type FFmpegEventSink = (event: FFmpegEvent) => Effect.Effect<void, never>;

/**
 * Runtime shape exposed by the {@link FFmpeg} service.
 *
 * @example
 * ```ts
 * import type { FFmpegShape } from "@beep/ffmpeg"
 * import { Effect } from "effect"
 *
 * const service: FFmpegShape = {
 *   extractFrames: () => Effect.die("not implemented"),
 *   probeVideo: () => Effect.die("not implemented")
 * }
 * void service
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export interface FFmpegShape {
  readonly extractFrames: (
    request: ExtractFramesRequest,
    onEvent?: FFmpegEventSink | undefined
  ) => Effect.Effect<ExtractFramesResult, FFmpegError>;
  readonly probeVideo: (request: ProbeVideoRequest) => Effect.Effect<VideoProbe, FFmpegError>;
}

type ProcessResult = {
  readonly exitCode: number;
  readonly stderr: string;
  readonly stdout: string;
};

type ExtractContext = {
  readonly expectedFrameCount: number;
  readonly fpsText: string;
  readonly manifestPath: string;
  readonly outDir: string;
  readonly padding: number;
  readonly prefix: string;
  readonly probe: VideoProbe;
  readonly request: ExtractFramesRequest;
  readonly videoPath: string;
};

type TempFrame = {
  readonly index: number;
  readonly path: string;
};

type PlannedFrameCommit = {
  readonly fileName: string;
  readonly index: number;
  readonly relativePath: string;
  readonly sourcePath: string;
  readonly targetPath: string;
};

type ProgressState = {
  readonly block: Readonly<Record<string, string>>;
  readonly buffer: string;
  readonly stdout: string;
};

const defaultConfig = (input?: FFmpegConfigInput | undefined): FFmpegConfig =>
  new FFmpegConfig({
    ffmpegPath: input?.ffmpegPath ?? "ffmpeg",
    ffprobePath: input?.ffprobePath ?? "ffprobe",
    forceKillAfterMillis: input?.forceKillAfterMillis ?? 2000,
  });

const collectText = <E>(stream: Stream.Stream<Uint8Array, E>): Effect.Effect<string, E> =>
  stream.pipe(
    Stream.decodeText(),
    Stream.runFold(
      () => "",
      (acc, chunk) => `${acc}${chunk}`
    )
  );

const parseNumber = (value: unknown): O.Option<number> => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? O.some(value) : O.none();
  }
  if (typeof value === "string") {
    return pipe(
      N.parse(value),
      O.filter((number) => Number.isFinite(number))
    );
  }
  return O.none();
};

const rationalToNumber = (value: unknown): O.Option<number> => {
  if (typeof value !== "string" || !Str.includes("/")(value)) {
    return parseNumber(value);
  }

  const parts = Str.split("/")(value);
  const numerator = pipe(A.get(parts, 0), O.flatMap(parseNumber));
  const denominator = pipe(A.get(parts, 1), O.flatMap(parseNumber));

  return O.flatMap(numerator, (left) =>
    O.flatMap(denominator, (right) => (right === 0 ? O.none() : O.some(left / right)))
  );
};

const optionToOptional = <A>(option: O.Option<A>): A | undefined => O.getOrUndefined(option);

const maybe = <K extends string, V>(key: K, value: V | undefined): Partial<Record<K, V>> =>
  value === undefined ? {} : ({ [key]: value } as Record<K, V>);

const probeFromOutput = (videoPath: string, output: FfprobeOutput): VideoProbe => {
  const stream = A.get(output.streams, 0);
  const formatDuration = pipe(O.fromUndefinedOr(output.format?.duration), O.flatMap(parseNumber));
  const width = pipe(
    stream,
    O.flatMap((value) => parseNumber(value.width)),
    optionToOptional
  );
  const height = pipe(
    stream,
    O.flatMap((value) => parseNumber(value.height)),
    optionToOptional
  );
  const streamDuration = pipe(
    stream,
    O.flatMap((value) => parseNumber(value.duration))
  );
  const durationSeconds = pipe(
    O.orElse(streamDuration, () => formatDuration),
    optionToOptional
  );
  const fps = pipe(
    stream,
    O.flatMap((value) => rationalToNumber(value.avg_frame_rate ?? value.r_frame_rate)),
    optionToOptional
  );
  const frameCount = pipe(
    stream,
    O.flatMap((value) => parseNumber(value.nb_frames)),
    optionToOptional
  );

  return new VideoProbe({
    videoPath,
    ...maybe("durationSeconds", durationSeconds),
    ...maybe("fps", fps),
    ...maybe("frameCount", frameCount),
    ...maybe("height", height),
    ...maybe("width", width),
  });
};

const expectedFrameCount = (probe: VideoProbe, fps: number): number =>
  Math.max(0, Math.ceil((probe.durationSeconds ?? 0) * fps));

const digitCount = (value: number): number => `${Math.max(0, Math.trunc(value))}`.length;

const paddingForCount = (count: number): number => Math.max(5, digitCount(Math.max(0, count - 1)));

const formatFps = (fps: number): string => `${fps}`;

/**
 * Format a generated PNG frame filename.
 *
 * @example
 * ```ts
 * import { formatFrameFileName } from "@beep/ffmpeg"
 *
 * const name = formatFrameFileName("clip_frame", 0, 5)
 * console.log(name)
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const formatFrameFileName = (prefix: string, index: number, padding: number): string =>
  `${prefix}_${pipe(`${index}`, Str.padStart(padding, "0"))}.png`;

/**
 * Build ffprobe arguments for the video-probe operation.
 *
 * @example
 * ```ts
 * import { buildFfprobeArgs, ProbeVideoRequest } from "@beep/ffmpeg"
 *
 * const args = buildFfprobeArgs(new ProbeVideoRequest({ videoPath: "./clip.mp4" }))
 * void args
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const buildFfprobeArgs = (request: ProbeVideoRequest): ReadonlyArray<string> => [
  "-v",
  "error",
  "-select_streams",
  "v:0",
  "-show_entries",
  "stream=width,height,avg_frame_rate,r_frame_rate,duration,nb_frames",
  "-show_entries",
  "format=duration",
  "-of",
  "json",
  request.videoPath,
];

/**
 * Build ffmpeg arguments for extracting PNG frames.
 *
 * @example
 * ```ts
 * import { buildExtractFramesArgs } from "@beep/ffmpeg"
 *
 * const args = buildExtractFramesArgs("./clip.mp4", "1", "./frames/frame_%05d.png")
 * void args
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const buildExtractFramesArgs = (
  videoPath: string,
  fps: string,
  outputPattern: string
): ReadonlyArray<string> => [
  "-hide_banner",
  "-nostdin",
  "-y",
  "-i",
  videoPath,
  "-vf",
  `fps=${fps}`,
  "-start_number",
  "0",
  "-progress",
  "pipe:1",
  "-nostats",
  "-f",
  "image2",
  outputPattern,
];

const runProcess = (
  spawner: ChildProcessSpawner.ChildProcessSpawner["Service"],
  command: ChildProcess.Command,
  operation: string,
  message: string
): Effect.Effect<ProcessResult, FFmpegError> =>
  Effect.scoped(
    Effect.gen(function* () {
      const handle = yield* spawner.spawn(command);
      const [stdout, stderr, exitCode] = yield* Effect.all(
        [collectText(handle.stdout), collectText(handle.stderr), handle.exitCode],
        { concurrency: "unbounded" }
      );
      return { exitCode, stderr, stdout };
    })
  ).pipe(Effect.mapError((cause) => FFmpegError.fromUnknown(operation, message, cause)));

const parseProgressEvent = (
  block: Readonly<Record<string, string>>,
  expected: number,
  progress: string
): O.Option<FFmpegProgressEvent> => {
  const frameCount = pipe(O.fromUndefinedOr(block.frame), O.flatMap(parseNumber));
  if (O.isNone(frameCount)) {
    return O.none();
  }

  const outTimeSeconds = pipe(
    O.fromUndefinedOr(block.out_time_ms ?? block.out_time_us),
    O.flatMap(parseNumber),
    O.map((value) => value / 1_000_000),
    optionToOptional
  );
  const percent = expected <= 0 ? 0 : Math.min(100, Math.max(0, (frameCount.value / expected) * 100));

  return O.some(
    new FFmpegProgressEvent({
      frameCount: frameCount.value,
      kind: "progress",
      percent,
      progress,
      ...maybe("outTimeSeconds", outTimeSeconds),
      ...maybe("speed", block.speed),
    })
  );
};

const consumeProgressLine = (
  state: ProgressState,
  line: string,
  expected: number
): readonly [ProgressState, O.Option<FFmpegProgressEvent>] => {
  const separatorIndex = line.indexOf("=");
  if (separatorIndex < 1) {
    return [state, O.none()];
  }

  const key = line.slice(0, separatorIndex);
  const value = line.slice(separatorIndex + 1);

  if (key === "progress") {
    return [
      {
        ...state,
        block: {},
      },
      parseProgressEvent(state.block, expected, value),
    ];
  }

  return [
    {
      ...state,
      block: {
        ...state.block,
        [key]: value,
      },
    },
    O.none(),
  ];
};

const emitEvent = (sink: FFmpegEventSink | undefined, event: FFmpegEvent): Effect.Effect<void, never> =>
  sink === undefined ? Effect.void : sink(event);

const collectProgressText = (
  stream: Stream.Stream<Uint8Array, PlatformError.PlatformError>,
  expected: number,
  sink: FFmpegEventSink | undefined
): Effect.Effect<string, PlatformError.PlatformError> =>
  Effect.gen(function* () {
    const state = yield* Ref.make<ProgressState>({
      block: {},
      buffer: "",
      stdout: "",
    });

    yield* stream.pipe(
      Stream.decodeText(),
      Stream.runForEach((chunk) =>
        Effect.gen(function* () {
          const current = yield* Ref.get(state);
          const combined = `${current.buffer}${chunk}`;
          const hasTrailingLineBreak = Str.endsWith("\n")(combined);
          const lines = Str.split(/\r?\n/)(combined);
          const completeLines = hasTrailingLineBreak ? lines : A.dropRight(lines, 1);
          const buffer = hasTrailingLineBreak
            ? ""
            : pipe(
                A.last(lines),
                O.getOrElse(() => "")
              );
          let nextState: ProgressState = {
            ...current,
            buffer,
            stdout: `${current.stdout}${chunk}`,
          };

          for (const line of completeLines) {
            const [updated, event] = consumeProgressLine(nextState, line, expected);
            nextState = updated;
            if (O.isSome(event)) {
              yield* emitEvent(sink, event.value);
            }
          }

          yield* Ref.set(state, nextState);
        })
      )
    );

    return (yield* Ref.get(state)).stdout;
  });

const runExtractProcess = (
  spawner: ChildProcessSpawner.ChildProcessSpawner["Service"],
  command: ChildProcess.Command,
  expected: number,
  sink: FFmpegEventSink | undefined
): Effect.Effect<ProcessResult, FFmpegError> =>
  Effect.scoped(
    Effect.gen(function* () {
      const handle = yield* spawner.spawn(command);
      const [stdout, stderr, exitCode] = yield* Effect.all(
        [collectProgressText(handle.stdout, expected, sink), collectText(handle.stderr), handle.exitCode],
        { concurrency: "unbounded" }
      );
      return { exitCode, stderr, stdout };
    })
  ).pipe(
    Effect.mapError((cause) =>
      FFmpegError.fromUnknown("extractFrames", "Failed to run ffmpeg. Install ffmpeg or configure ffmpegPath.", cause)
    )
  );

const ensureFile = (fs: FileSystem.FileSystem, filePath: string, label: string): Effect.Effect<void, FFmpegError> =>
  Effect.gen(function* () {
    const stat = yield* fs
      .stat(filePath)
      .pipe(
        Effect.mapError((cause) =>
          FFmpegError.fromUnknown("extractFrames", `Failed to stat ${label}: "${filePath}"`, cause)
        )
      );
    if (stat.type !== "File") {
      return yield* new FFmpegError({
        message: `Expected ${label} to be a file: "${filePath}"`,
        operation: "extractFrames",
      });
    }
  });

const ensureDirectory = (fs: FileSystem.FileSystem, dirPath: string, label: string): Effect.Effect<void, FFmpegError> =>
  Effect.gen(function* () {
    const exists = yield* fs
      .exists(dirPath)
      .pipe(
        Effect.mapError((cause) =>
          FFmpegError.fromUnknown("extractFrames", `Failed to inspect ${label}: "${dirPath}"`, cause)
        )
      );
    if (!exists) {
      yield* fs
        .makeDirectory(dirPath, { recursive: true })
        .pipe(
          Effect.mapError((cause) =>
            FFmpegError.fromUnknown("extractFrames", `Failed to create ${label}: "${dirPath}"`, cause)
          )
        );
      return;
    }

    const stat = yield* fs
      .stat(dirPath)
      .pipe(
        Effect.mapError((cause) =>
          FFmpegError.fromUnknown("extractFrames", `Failed to stat ${label}: "${dirPath}"`, cause)
        )
      );
    if (stat.type !== "Directory") {
      return yield* new FFmpegError({
        message: `Expected ${label} to be a directory: "${dirPath}"`,
        operation: "extractFrames",
      });
    }
  });

const preflightWritable = (
  fs: FileSystem.FileSystem,
  filePath: string,
  overwrite: boolean,
  label: string
): Effect.Effect<void, FFmpegError> =>
  Effect.gen(function* () {
    const exists = yield* fs
      .exists(filePath)
      .pipe(
        Effect.mapError((cause) =>
          FFmpegError.fromUnknown("extractFrames", `Failed to inspect ${label}: "${filePath}"`, cause)
        )
      );
    if (exists && !overwrite) {
      return yield* new FFmpegError({
        message: `Refusing to overwrite existing ${label}: "${filePath}"`,
        operation: "extractFrames",
      });
    }
  });

const makeExtractContext = Effect.fn("FFmpeg.makeExtractContext")(function* (
  path: Path.Path,
  request: ExtractFramesRequest,
  probe: VideoProbe
) {
  const videoPath = path.resolve(request.videoPath);
  const outDir = path.resolve(request.outDir);
  const sourceExtension = path.extname(videoPath);
  const sourceStem = path.basename(videoPath, sourceExtension) || "video";
  const prefix = pipe(
    request.prefix,
    O.getOrElse(() => `${sourceStem}_frame`)
  );
  const manifestPath = pipe(
    request.manifestPath,
    O.match({
      onNone: () => path.join(outDir, "extract-frames-manifest.json"),
      onSome: (value) => path.resolve(value),
    })
  );
  const count = expectedFrameCount(probe, request.fps);
  const padding = paddingForCount(count);
  const fpsText = formatFps(request.fps);

  return {
    expectedFrameCount: count,
    fpsText,
    manifestPath,
    outDir,
    padding,
    prefix,
    probe,
    request,
    videoPath,
  };
});

const readTempFrames = Effect.fn("FFmpeg.readTempFrames")(function* (
  fs: FileSystem.FileSystem,
  path: Path.Path,
  tempDir: string,
  prefix: string
) {
  const names = yield* fs
    .readDirectory(tempDir)
    .pipe(
      Effect.mapError((cause) =>
        FFmpegError.fromUnknown("extractFrames", `Failed to read temporary frame directory: "${tempDir}"`, cause)
      )
    );
  const tempPrefix = `${prefix}_`;
  let frames = A.empty<TempFrame>();

  for (const name of names) {
    if (!Str.endsWith(".png")(name) || !Str.startsWith(tempPrefix)(name)) {
      continue;
    }

    const digits = name.slice(tempPrefix.length, -4);
    const index = pipe(
      N.parse(digits),
      O.filter((value) => Number.isInteger(value) && value >= 0)
    );

    if (O.isSome(index)) {
      frames = A.append(frames, {
        index: index.value,
        path: path.join(tempDir, name),
      });
    }
  }

  frames = A.sort(
    frames,
    Order.mapInput(Order.Number, (frame: TempFrame) => frame.index)
  );

  if (A.length(frames) === 0) {
    return yield* new FFmpegError({
      message: "ffmpeg completed without producing any PNG frames.",
      operation: "extractFrames",
    });
  }

  return frames;
});

const makeManifest = (context: ExtractContext, frames: ReadonlyArray<ExtractedFrame>): ExtractFramesManifest =>
  new ExtractFramesManifest({
    frames,
    manifestPath: context.manifestPath,
    options: new ExtractFramesManifestOptions({
      fps: context.request.fps,
      overwrite: context.request.overwrite,
      prefix: context.prefix,
    }),
    outputDirectory: context.outDir,
    probe: context.probe,
    schemaVersion: "beep.ffmpeg.extract-frames.v1",
    sourceVideo: context.videoPath,
    summary: new ExtractFramesManifestSummary({
      frameCount: A.length(frames),
    }),
  });

const renderManifest = Effect.fn("FFmpeg.renderManifest")(function* (
  manifestPath: string,
  manifest: ExtractFramesManifest
) {
  const encoded = yield* encodeExtractFramesManifest(manifest).pipe(
    Effect.mapError((cause) =>
      FFmpegError.fromUnknown("extractFrames", `Failed to encode extract-frames manifest: "${manifestPath}"`, cause)
    )
  );

  return yield* Effect.try({
    try: () => `${encodeJson(encoded)}\n`,
    catch: (cause) =>
      FFmpegError.fromUnknown("extractFrames", `Failed to render extract-frames manifest: "${manifestPath}"`, cause),
  });
});

const commitFrames = Effect.fn("FFmpeg.commitFrames")(function* (
  fs: FileSystem.FileSystem,
  path: Path.Path,
  context: ExtractContext,
  tempDir: string,
  tempFrames: ReadonlyArray<TempFrame>
) {
  const finalPadding = paddingForCount(Math.max(context.expectedFrameCount, A.length(tempFrames)));
  let planned = A.empty<PlannedFrameCommit>();
  let committed = A.empty<ExtractedFrame>();

  for (const tempFrame of tempFrames) {
    const position = A.length(planned);
    const fileName = formatFrameFileName(context.prefix, position, finalPadding);
    const targetPath = path.join(context.outDir, fileName);
    planned = A.append(planned, {
      fileName,
      index: position,
      relativePath: path.relative(context.outDir, targetPath),
      sourcePath: tempFrame.path,
      targetPath,
    });
  }

  for (const frame of planned) {
    yield* preflightWritable(fs, frame.targetPath, context.request.overwrite, "frame output");
  }

  for (const frame of planned) {
    if (context.request.overwrite) {
      yield* fs.remove(frame.targetPath, { force: true }).pipe(Effect.ignore);
    }
    yield* fs
      .rename(frame.sourcePath, frame.targetPath)
      .pipe(
        Effect.mapError((cause) =>
          FFmpegError.fromUnknown("extractFrames", `Failed to commit frame output: "${frame.targetPath}"`, cause)
        )
      );
    committed = A.append(
      committed,
      new ExtractedFrame({
        fileName: frame.fileName,
        index: frame.index,
        path: frame.targetPath,
        relativePath: frame.relativePath,
      })
    );
  }

  const manifest = makeManifest(context, committed);
  const manifestContent = yield* renderManifest(context.manifestPath, manifest);
  const tempManifestPath = path.join(tempDir, "extract-frames-manifest.json");
  yield* fs
    .writeFileString(tempManifestPath, manifestContent)
    .pipe(
      Effect.mapError((cause) =>
        FFmpegError.fromUnknown("extractFrames", `Failed to write temporary manifest: "${tempManifestPath}"`, cause)
      )
    );
  if (context.request.overwrite) {
    yield* fs.remove(context.manifestPath, { force: true }).pipe(Effect.ignore);
  }
  yield* fs
    .rename(tempManifestPath, context.manifestPath)
    .pipe(
      Effect.mapError((cause) =>
        FFmpegError.fromUnknown("extractFrames", `Failed to commit manifest: "${context.manifestPath}"`, cause)
      )
    );

  return committed;
});

const makeService = Effect.fn("FFmpeg.make")(function* (configInput?: FFmpegConfigInput | undefined) {
  const config = defaultConfig(configInput);
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;

  const probeVideo = Effect.fn("FFmpeg.probeVideo")(function* (rawRequest: ProbeVideoRequest) {
    const request = yield* decodeProbeVideoRequest(rawRequest).pipe(
      Effect.mapError((cause) => FFmpegError.fromUnknown("probeVideo", "Invalid probe video request.", cause))
    );
    const videoPath = path.resolve(request.videoPath);
    yield* ensureFile(fs, videoPath, "video input");
    const args = buildFfprobeArgs(new ProbeVideoRequest({ videoPath }));
    const command = ChildProcess.make(config.ffprobePath, args, {
      forceKillAfter: `${config.forceKillAfterMillis} millis`,
      stdin: "ignore",
      stderr: "pipe",
      stdout: "pipe",
    });
    const result = yield* runProcess(
      spawner,
      command,
      "probeVideo",
      "Failed to run ffprobe. Install ffprobe or configure ffprobePath."
    );

    if (result.exitCode !== 0) {
      return yield* new FFmpegError({
        command: config.ffprobePath,
        exitCode: result.exitCode,
        message: `ffprobe could not read video metadata for "${videoPath}".`,
        operation: "probeVideo",
        stderr: Str.trim(result.stderr),
        stdout: Str.trim(result.stdout),
      });
    }

    const output = yield* decodeFfprobeOutput(result.stdout).pipe(
      Effect.mapError((cause) =>
        FFmpegError.fromUnknown("probeVideo", `Failed to decode ffprobe JSON for "${videoPath}".`, cause, {
          command: config.ffprobePath,
          stdout: result.stdout,
        })
      )
    );
    return probeFromOutput(videoPath, output);
  });

  const extractFrames = Effect.fn("FFmpeg.extractFrames")(function* (
    rawRequest: ExtractFramesRequest,
    onEvent?: FFmpegEventSink | undefined
  ) {
    const request = yield* decodeExtractFramesRequest(rawRequest).pipe(
      Effect.mapError((cause) => FFmpegError.fromUnknown("extractFrames", "Invalid extract-frames request.", cause))
    );
    const videoPath = path.resolve(request.videoPath);
    const outDir = path.resolve(request.outDir);
    yield* ensureFile(fs, videoPath, "video input");
    yield* ensureDirectory(fs, outDir, "frame output directory");
    const manifestPath = pipe(
      request.manifestPath,
      O.match({
        onNone: () => path.join(outDir, "extract-frames-manifest.json"),
        onSome: path.resolve,
      })
    );
    yield* ensureDirectory(fs, path.dirname(manifestPath), "manifest directory");
    yield* preflightWritable(fs, manifestPath, request.overwrite, "manifest");

    const probe = yield* probeVideo(new ProbeVideoRequest({ videoPath }));
    const context = yield* makeExtractContext(path, new ExtractFramesRequest({ ...request, outDir, videoPath }), probe);

    return yield* Effect.acquireUseRelease(
      fs
        .makeTempDirectory({ directory: context.outDir, prefix: ".beep-ffmpeg-extract-frames-" })
        .pipe(
          Effect.mapError((cause) =>
            FFmpegError.fromUnknown(
              "extractFrames",
              `Failed to create temporary frame directory in "${context.outDir}".`,
              cause
            )
          )
        ),
      (tempDir) =>
        Effect.gen(function* () {
          const tempPattern = path.join(tempDir, `${context.prefix}_%0${context.padding}d.png`);
          const args = buildExtractFramesArgs(context.videoPath, context.fpsText, tempPattern);
          const command = ChildProcess.make(config.ffmpegPath, args, {
            forceKillAfter: `${config.forceKillAfterMillis} millis`,
            stdin: "ignore",
            stderr: "pipe",
            stdout: "pipe",
          });

          yield* emitEvent(
            onEvent,
            new FFmpegStartedEvent({
              args,
              command: config.ffmpegPath,
              kind: "started",
              outDir: context.outDir,
              videoPath: context.videoPath,
            })
          );

          const result = yield* runExtractProcess(spawner, command, context.expectedFrameCount, onEvent);
          if (result.exitCode !== 0) {
            return yield* new FFmpegError({
              command: config.ffmpegPath,
              exitCode: result.exitCode,
              message: `ffmpeg could not extract frames for "${context.videoPath}".`,
              operation: "extractFrames",
              stderr: Str.trim(result.stderr),
              stdout: Str.trim(result.stdout),
            });
          }

          const tempFrames = yield* readTempFrames(fs, path, tempDir, context.prefix);
          const frames = yield* commitFrames(fs, path, context, tempDir, tempFrames).pipe(Effect.uninterruptible);
          const resultValue = new ExtractFramesResult({
            frameCount: A.length(frames),
            frames,
            manifestPath: context.manifestPath,
            outDir: context.outDir,
            videoPath: context.videoPath,
          });
          yield* emitEvent(
            onEvent,
            new FFmpegCompletedEvent({
              frameCount: resultValue.frameCount,
              kind: "completed",
              manifestPath: resultValue.manifestPath,
              outDir: resultValue.outDir,
            })
          );
          return resultValue;
        }),
      (tempDir) => fs.remove(tempDir, { recursive: true, force: true }).pipe(Effect.ignore)
    );
  });

  return {
    extractFrames,
    probeVideo,
  };
});

/**
 * Effect service for native FFmpeg and ffprobe execution.
 *
 * @example
 * ```ts
 * import { FFmpeg } from "@beep/ffmpeg"
 *
 * const service = FFmpeg
 * void service
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export class FFmpeg extends Context.Service<FFmpeg, FFmpegShape>()($I`FFmpeg`) {
  /**
   * Build the native FFmpeg service layer.
   *
   * @example
   * ```ts
   * import { FFmpeg } from "@beep/ffmpeg"
   *
   * const layer = FFmpeg.makeLayer()
   * void layer
   * ```
   *
   * @category layers
   * @since 0.0.0
   */
  static readonly makeLayer = (
    config?: FFmpegConfigInput | undefined
  ): Layer.Layer<FFmpeg, never, ChildProcessSpawner.ChildProcessSpawner | FileSystem.FileSystem | Path.Path> =>
    Layer.effect(FFmpeg, Effect.map(makeService(config), FFmpeg.of));
}
