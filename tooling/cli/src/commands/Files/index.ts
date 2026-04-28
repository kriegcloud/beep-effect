/**
 * File curation command suite.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import { ImageFileExtension, LiteralKit, TaggedErrorClass, VideoFileExtension } from "@beep/schema";
import { Console, Effect, FileSystem, HashSet, Order, Path, pipe, Stream } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { Command, Flag } from "effect/unstable/cli";
import { ChildProcess, type ChildProcessSpawner } from "effect/unstable/process";
import { imageSizeFromFile } from "image-size/fromFile";

const $I = $RepoCliId.create("commands/Files");
const stringEquivalence = S.toEquivalence(S.String);
const isImageFileExtension = S.is(ImageFileExtension);
const isVideoFileExtension = S.is(VideoFileExtension);

const PositiveMediaDimension = S.Int.check(
  S.makeFilterGroup(
    [
      S.isGreaterThan(0, {
        identifier: $I`PositiveMediaDimensionGreaterThanZeroCheck`,
        title: "Positive Media Dimension",
        description: "A media width or height must be greater than zero.",
        message: "Expected a positive media dimension",
      }),
    ],
    {
      identifier: $I`PositiveMediaDimensionChecks`,
      title: "Positive Media Dimension",
      description: "Checks for positive integer media dimensions.",
    }
  )
).pipe(
  $I.annoteSchema("PositiveMediaDimension", {
    description: "A positive integer width or height reported by a media probe.",
  })
);

const MediaKind = LiteralKit(["image", "video"] as const).pipe(
  $I.annoteSchema("MediaKind", {
    description: "The media probing strategy used for a selected file.",
  })
);

type MediaKind = typeof MediaKind.Type;

class ImageSizeMetadata extends S.Class<ImageSizeMetadata>($I`ImageSizeMetadata`)(
  {
    height: PositiveMediaDimension,
    orientation: S.optionalKey(S.Int),
    width: PositiveMediaDimension,
  },
  $I.annote("ImageSizeMetadata", {
    description: "Dimension metadata returned by the image-size package.",
  })
) {}

class FfprobeSideData extends S.Class<FfprobeSideData>($I`FfprobeSideData`)(
  {
    rotation: S.optionalKey(S.Union([S.Number, S.NumberFromString])),
  },
  $I.annote("FfprobeSideData", {
    description: "Side-data entry returned by ffprobe for a video stream.",
  })
) {}

class FfprobeStream extends S.Class<FfprobeStream>($I`FfprobeStream`)(
  {
    height: PositiveMediaDimension,
    side_data_list: S.Array(FfprobeSideData).pipe(S.optionalKey),
    tags: S.optionalKey(S.Record(S.String, S.Unknown)),
    width: PositiveMediaDimension,
  },
  $I.annote("FfprobeStream", {
    description: "Video stream metadata returned by ffprobe.",
  })
) {}

class FfprobeOutput extends S.Class<FfprobeOutput>($I`FfprobeOutput`)(
  {
    streams: S.Array(FfprobeStream),
  },
  $I.annote("FfprobeOutput", {
    description: "JSON document emitted by ffprobe stream probing.",
  })
) {}

const decodeImageSizeMetadata = S.decodeUnknownEffect(ImageSizeMetadata);
const decodeFfprobeOutputJson = S.decodeUnknownEffect(S.fromJsonString(FfprobeOutput));
const decodeRotationNumber = S.decodeUnknownOption(S.Union([S.Number, S.NumberFromString]));

const SafeFilePrefix = S.NonEmptyString.check(
  S.makeFilterGroup(
    [
      S.makeFilter(P.not(Str.includes(".")), {
        identifier: $I`SafeFilePrefixNoDotCheck`,
        title: "Safe File Prefix Without Dot",
        description: "A file prefix that does not contain a dot.",
        message: "File prefix must not contain .",
      }),
      S.makeFilter(P.not(Str.includes("/")), {
        identifier: $I`SafeFilePrefixNoPosixSeparatorCheck`,
        title: "Safe File Prefix Without Posix Separator",
        description: "A file prefix that does not contain the POSIX path separator.",
        message: "File prefix must not contain /",
      }),
      S.makeFilter(P.not(Str.includes("\\")), {
        identifier: $I`SafeFilePrefixNoWindowsSeparatorCheck`,
        title: "Safe File Prefix Without Windows Separator",
        description: "A file prefix that does not contain the Windows path separator.",
        message: "File prefix must not contain \\",
      }),
      S.makeFilter(P.not(Str.includes("\0")), {
        identifier: $I`SafeFilePrefixNoNullByteCheck`,
        title: "Safe File Prefix Without Null Byte",
        description: "A file prefix that does not contain an embedded NUL byte.",
        message: "File prefix must not contain embedded NUL bytes",
      }),
    ],
    {
      identifier: $I`SafeFilePrefixChecks`,
      title: "Safe File Prefix",
      description: "Checks for a safe file-name stem used as a generated dataset prefix.",
    }
  )
).pipe(
  $I.annoteSchema("SafeFilePrefix", {
    description: "A non-empty generated file prefix without dots, separators, or embedded NUL bytes.",
  })
);

/**
 * Safe prefix accepted by `files sort-and-rename`.
 *
 * @category models
 * @since 0.0.0
 */
export type SafeFilePrefix = typeof SafeFilePrefix.Type;

const decodeSafeFilePrefix = S.decodeUnknownEffect(SafeFilePrefix);

/**
 * Error raised by file curation commands.
 *
 * @example
 * ```ts
 * import { FilesCommandError } from "@beep/repo-cli/commands/Files/index"
 *
 * const error = new FilesCommandError({ message: "Invalid directory" })
 * void error.message
 * ```
 * @category error handling
 * @since 0.0.0
 */
export class FilesCommandError extends TaggedErrorClass<FilesCommandError>($I`FilesCommandError`)(
  "FilesCommandError",
  {
    message: S.String,
    cause: S.optionalKey(S.DefectWithStack),
  },
  $I.annote("FilesCommandError", {
    description: "A failure raised while preparing or applying a file curation operation.",
  })
) {}

/**
 * File discovered for deterministic rename planning.
 *
 * @example
 * ```ts
 * import { SortableFile } from "@beep/repo-cli/commands/Files/index"
 *
 * const file = new SortableFile({
 *   canonicalPath: "/tmp/images/a.png",
 *   extension: ".png",
 *   name: "a.png",
 *   size: 10n,
 *   sourcePath: "/tmp/images/a.png"
 * })
 * void file.name
 * ```
 * @category models
 * @since 0.0.0
 */
export class SortableFile extends S.Class<SortableFile>($I`SortableFile`)(
  {
    canonicalPath: S.String,
    extension: S.String,
    mediaKind: S.Option(MediaKind).pipe(S.withConstructorDefault(Effect.succeed(O.none<MediaKind>()))),
    name: S.String,
    size: S.BigInt,
    sourcePath: S.String,
  },
  $I.annote("SortableFile", {
    description: "A direct regular file selected for size-based rename planning.",
  })
) {}

/**
 * Planned rename from an existing file path to a generated target path.
 *
 * @category models
 * @since 0.0.0
 */
export class RenamePlanEntry extends S.Class<RenamePlanEntry>($I`RenamePlanEntry`)(
  {
    canonicalSourcePath: S.String,
    dimensions: S.Option(S.suspend(() => MediaDimensions)).pipe(
      S.withConstructorDefault(Effect.succeed(O.none<MediaDimensions>()))
    ),
    extension: S.String,
    index: S.Number,
    size: S.BigInt,
    sourceName: S.String,
    sourcePath: S.String,
    targetName: S.String,
    targetPath: S.String,
  },
  $I.annote("RenamePlanEntry", {
    description: "A single source-to-target file rename planned by a files operation.",
  })
) {}

/**
 * Summary returned by `sortAndRenameFiles`.
 *
 * @category models
 * @since 0.0.0
 */
export class SortAndRenameSummary extends S.Class<SortAndRenameSummary>($I`SortAndRenameSummary`)(
  {
    directory: S.String,
    dryRun: S.Boolean,
    plannedCount: S.Number,
    renamedCount: S.Number,
    skippedCount: S.Number,
    withDimensions: S.Boolean,
  },
  $I.annote("SortAndRenameSummary", {
    description: "Summary counts for a sort-and-rename file curation run.",
  })
) {}

/**
 * Width and height discovered for an image or video file.
 *
 * @example
 * ```ts
 * import { MediaDimensions } from "@beep/repo-cli/commands/Files/index"
 *
 * const dimensions = new MediaDimensions({ height: 1024, width: 1536 })
 * void dimensions.width
 * ```
 * @category models
 * @since 0.0.0
 */
export class MediaDimensions extends S.Class<MediaDimensions>($I`MediaDimensions`)(
  {
    height: PositiveMediaDimension,
    width: PositiveMediaDimension,
  },
  $I.annote("MediaDimensions", {
    description: "Pixel dimensions discovered from an image or video file.",
  })
) {}

class SortableFileCollection extends S.Class<SortableFileCollection>($I`SortableFileCollection`)(
  {
    files: S.Array(SortableFile),
    skippedCount: S.Number,
  },
  $I.annote("SortableFileCollection", {
    description: "Files selected for rename planning plus direct regular files skipped by media filtering.",
  })
) {}

class RenamePlan extends S.Class<RenamePlan>($I`RenamePlan`)(
  {
    entries: S.Array(RenamePlanEntry),
    skippedCount: S.Number,
  },
  $I.annote("RenamePlan", {
    description: "Planned rename entries plus direct regular files skipped before planning.",
  })
) {}

const bySizeDescendingThenNameAscending: Order.Order<SortableFile> = Order.combine(
  Order.flip(Order.mapInput(Order.BigInt, (file: SortableFile) => file.size)),
  Order.mapInput(Order.String, (file: SortableFile) => file.name)
);

const formatPlatformError = (operation: string, filePath: string, cause: unknown): FilesCommandError =>
  new FilesCommandError({
    message: `${operation}: "${filePath}"`,
    cause,
  });

const validatePrefix = (prefix: string): Effect.Effect<SafeFilePrefix, FilesCommandError> =>
  decodeSafeFilePrefix(prefix).pipe(
    Effect.mapError(
      () =>
        new FilesCommandError({
          message: `Invalid prefix "${prefix}". Use a non-empty stem without dots, path separators, or embedded NUL bytes.`,
        })
    )
  );

const validateDirectory = Effect.fn("Files.validateDirectory")(function* (
  dir: string
): Effect.fn.Return<
  { readonly canonicalDir: string; readonly directory: string },
  FilesCommandError,
  FileSystem.FileSystem | Path.Path
> {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const directory = path.resolve(dir);
  const stat = yield* fs
    .stat(directory)
    .pipe(Effect.mapError((cause) => formatPlatformError("Failed to stat directory", directory, cause)));

  if (stat.type !== "Directory") {
    return yield* new FilesCommandError({
      message: `Expected --dir to be a directory: "${directory}"`,
    });
  }

  const canonicalDir = yield* fs
    .realPath(directory)
    .pipe(Effect.mapError((cause) => formatPlatformError("Failed to resolve directory", directory, cause)));

  return { canonicalDir, directory };
});

const failOnExtensionlessFile = (filePath: string): Effect.Effect<never, FilesCommandError> =>
  Effect.fail(
    new FilesCommandError({
      message: `Cannot rename extensionless file: "${filePath}"`,
    })
  );

const normalizeBareExtension = (extension: string): string => pipe(extension, Str.replace(/^\./, ""), Str.toLowerCase);

const mediaKindFromExtension = (extension: string): O.Option<MediaKind> => {
  const bareExtension = normalizeBareExtension(extension);

  if (isImageFileExtension(bareExtension)) {
    return O.some("image");
  }

  if (isVideoFileExtension(bareExtension)) {
    return O.some("video");
  }

  return O.none();
};

const collectSortableFiles = Effect.fn("Files.collectSortableFiles")(function* (
  dir: string,
  mediaOnly: boolean
): Effect.fn.Return<SortableFileCollection, FilesCommandError, FileSystem.FileSystem | Path.Path> {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const { canonicalDir, directory } = yield* validateDirectory(dir);
  const entries = yield* fs
    .readDirectory(directory)
    .pipe(Effect.mapError((cause) => formatPlatformError("Failed to read directory", directory, cause)));

  let files = A.empty<SortableFile>();
  let skippedCount = 0;

  for (const entry of entries) {
    const sourcePath = path.join(directory, entry);
    const canonicalPath = yield* fs.realPath(sourcePath).pipe(Effect.option);

    if (O.isNone(canonicalPath)) {
      continue;
    }

    if (!stringEquivalence(canonicalPath.value, path.join(canonicalDir, entry))) {
      continue;
    }

    const stat = yield* fs
      .stat(sourcePath)
      .pipe(Effect.mapError((cause) => formatPlatformError("Failed to stat file", sourcePath, cause)));

    if (stat.type !== "File") {
      continue;
    }

    const extension = path.extname(entry);
    if (stringEquivalence(extension, "") || stringEquivalence(extension, ".")) {
      if (mediaOnly) {
        skippedCount += 1;
        continue;
      }

      return yield* failOnExtensionlessFile(sourcePath);
    }

    const mediaKind = mediaKindFromExtension(extension);
    if (mediaOnly && O.isNone(mediaKind)) {
      skippedCount += 1;
      continue;
    }

    files = A.append(
      files,
      new SortableFile({
        canonicalPath: canonicalPath.value,
        extension,
        mediaKind,
        name: entry,
        size: stat.size,
        sourcePath,
      })
    );
  }

  return new SortableFileCollection({
    files: A.sort(files, bySizeDescendingThenNameAscending),
    skippedCount,
  });
});

const formatIndex = (index: number, width: number): string => pipe(`${index}`, Str.padStart(width, "0"));

const collectText = <E>(stream: Stream.Stream<Uint8Array, E>): Effect.Effect<string, E> =>
  stream.pipe(
    Stream.decodeText(),
    Stream.runFold(
      () => "",
      (acc, chunk) => `${acc}${chunk}`
    ),
    Effect.map(Str.trim)
  );

const isExifOrientationRotated = (orientation: number): boolean => A.contains([5, 6, 7, 8], orientation);

const isQuarterTurnRotation = (rotation: number): boolean => {
  const normalized = ((rotation % 360) + 360) % 360;
  return normalized === 90 || normalized === 270;
};

const maybeSwapDimensions = (dimensions: MediaDimensions, swap: boolean): MediaDimensions =>
  swap
    ? new MediaDimensions({
        height: dimensions.width,
        width: dimensions.height,
      })
    : dimensions;

const probeImageDimensions = Effect.fn("Files.probeImageDimensions")(function* (
  file: SortableFile
): Effect.fn.Return<MediaDimensions, FilesCommandError> {
  const rawMetadata = yield* Effect.tryPromise({
    try: () => imageSizeFromFile(file.sourcePath),
    catch: (cause) =>
      new FilesCommandError({
        message: `Failed to probe image dimensions for "${file.sourcePath}"`,
        cause,
      }),
  });
  const metadata = yield* decodeImageSizeMetadata(rawMetadata).pipe(
    Effect.mapError(
      () =>
        new FilesCommandError({
          message: `Image probe did not return usable dimensions for "${file.sourcePath}"`,
        })
    )
  );
  const dimensions = new MediaDimensions({
    height: metadata.height,
    width: metadata.width,
  });
  const shouldSwap = pipe(O.fromUndefinedOr(metadata.orientation), O.exists(isExifOrientationRotated));

  return maybeSwapDimensions(dimensions, shouldSwap);
});

const runFfprobe = Effect.fn("Files.runFfprobe")(function* (
  file: SortableFile
): Effect.fn.Return<string, FilesCommandError, Path.Path | ChildProcessSpawner.ChildProcessSpawner> {
  const path = yield* Path.Path;
  const command = ChildProcess.make(
    "ffprobe",
    ["-v", "error", "-select_streams", "v:0", "-show_streams", "-of", "json", file.sourcePath],
    {
      cwd: path.dirname(file.sourcePath),
      stderr: "pipe",
      stdout: "pipe",
    }
  );
  const result = yield* Effect.scoped(
    Effect.gen(function* () {
      const handle = yield* command;
      const [stdout, stderr, exitCode] = yield* Effect.all(
        [collectText(handle.stdout), collectText(handle.stderr), handle.exitCode],
        { concurrency: "unbounded" }
      );
      return { exitCode, stderr, stdout };
    })
  ).pipe(
    Effect.mapError(
      (cause) =>
        new FilesCommandError({
          message: `Failed to run ffprobe for "${file.sourcePath}". Install ffprobe or run without --with-dimensions.`,
          cause,
        })
    )
  );

  if (result.exitCode !== 0) {
    return yield* new FilesCommandError({
      message: `ffprobe could not read video dimensions for "${file.sourcePath}": ${result.stderr}`,
    });
  }

  return result.stdout;
});

const rotationFromStream = (stream: FfprobeStream): O.Option<number> => {
  const sideDataRotation = pipe(
    O.fromUndefinedOr(stream.side_data_list),
    O.flatMap(A.findFirst((sideData) => O.isSome(O.fromUndefinedOr(sideData.rotation)))),
    O.flatMap((sideData) => O.fromUndefinedOr(sideData.rotation))
  );
  const tagRotation = pipe(O.fromUndefinedOr(stream.tags), O.flatMap(R.get("rotate")), O.flatMap(decodeRotationNumber));

  return O.orElse(sideDataRotation, () => tagRotation);
};

const probeVideoDimensions = Effect.fn("Files.probeVideoDimensions")(function* (
  file: SortableFile
): Effect.fn.Return<MediaDimensions, FilesCommandError, Path.Path | ChildProcessSpawner.ChildProcessSpawner> {
  const outputText = yield* runFfprobe(file);
  const output = yield* decodeFfprobeOutputJson(outputText).pipe(
    Effect.mapError(
      () =>
        new FilesCommandError({
          message: `ffprobe returned invalid JSON while probing "${file.sourcePath}"`,
        })
    )
  );
  const stream = yield* pipe(
    A.get(output.streams, 0),
    O.match({
      onNone: () =>
        Effect.fail(
          new FilesCommandError({
            message: `ffprobe did not return a video stream for "${file.sourcePath}"`,
          })
        ),
      onSome: Effect.succeed,
    })
  );
  const dimensions = new MediaDimensions({
    height: stream.height,
    width: stream.width,
  });
  const shouldSwap = pipe(rotationFromStream(stream), O.exists(isQuarterTurnRotation));

  return maybeSwapDimensions(dimensions, shouldSwap);
});

const probeMediaDimensions = Effect.fn("Files.probeMediaDimensions")(function* (
  file: SortableFile
): Effect.fn.Return<MediaDimensions, FilesCommandError, Path.Path | ChildProcessSpawner.ChildProcessSpawner> {
  const mediaKind = yield* pipe(
    file.mediaKind,
    O.match({
      onNone: () =>
        Effect.fail(
          new FilesCommandError({
            message: `Cannot probe dimensions for non-media file: "${file.sourcePath}"`,
          })
        ),
      onSome: Effect.succeed,
    })
  );

  if (mediaKind === "image") {
    return yield* probeImageDimensions(file);
  }

  return yield* probeVideoDimensions(file);
});

const targetNameForEntry = (
  prefix: SafeFilePrefix,
  index: number,
  width: number,
  file: SortableFile,
  dimensions: O.Option<MediaDimensions>
): string => {
  const formattedIndex = formatIndex(index, width);
  return pipe(
    dimensions,
    O.match({
      onNone: () => `${prefix}_${formattedIndex}${file.extension}`,
      onSome: (mediaDimensions) =>
        `${prefix}_${formattedIndex}_${mediaDimensions.width}x${mediaDimensions.height}${file.extension}`,
    })
  );
};

const hasSkippedFiles = (skippedCount: number): boolean => skippedCount > 0;

const buildRenamePlan = Effect.fn("Files.buildRenamePlan")(function* (
  dir: string,
  prefix: SafeFilePrefix,
  withDimensions: boolean
): Effect.fn.Return<
  RenamePlan,
  FilesCommandError,
  FileSystem.FileSystem | Path.Path | ChildProcessSpawner.ChildProcessSpawner
> {
  const path = yield* Path.Path;
  const collection = yield* collectSortableFiles(dir, withDimensions);
  const width = Str.length(`${A.length(collection.files)}`) + 1;
  let index = 0;
  let plan = A.empty<RenamePlanEntry>();

  for (const file of collection.files) {
    const dimensions = withDimensions ? O.some(yield* probeMediaDimensions(file)) : O.none<MediaDimensions>();
    const targetName = targetNameForEntry(prefix, index, width, file, dimensions);
    plan = A.append(
      plan,
      new RenamePlanEntry({
        canonicalSourcePath: file.canonicalPath,
        dimensions,
        extension: file.extension,
        index,
        size: file.size,
        sourceName: file.name,
        sourcePath: file.sourcePath,
        targetName,
        targetPath: path.join(path.dirname(file.sourcePath), targetName),
      })
    );
    index += 1;
  }

  return new RenamePlan({
    entries: plan,
    skippedCount: collection.skippedCount,
  });
});

const selectedCanonicalPathSet = (plan: ReadonlyArray<RenamePlanEntry>): HashSet.HashSet<string> => {
  let selected = HashSet.empty<string>();
  for (const entry of plan) {
    selected = HashSet.add(selected, entry.canonicalSourcePath);
  }
  return selected;
};

const preflightTargetCollisions = Effect.fn("Files.preflightTargetCollisions")(function* (
  plan: ReadonlyArray<RenamePlanEntry>
): Effect.fn.Return<void, FilesCommandError, FileSystem.FileSystem> {
  const fs = yield* FileSystem.FileSystem;
  const selected = selectedCanonicalPathSet(plan);

  for (const entry of plan) {
    const exists = yield* fs
      .exists(entry.targetPath)
      .pipe(Effect.mapError((cause) => formatPlatformError("Failed to inspect target path", entry.targetPath, cause)));

    if (!exists) {
      continue;
    }

    const canonicalTarget = yield* fs
      .realPath(entry.targetPath)
      .pipe(Effect.mapError((cause) => formatPlatformError("Failed to resolve target path", entry.targetPath, cause)));

    if (!HashSet.has(selected, canonicalTarget)) {
      return yield* new FilesCommandError({
        message: `Refusing to overwrite existing target outside the rename set: "${entry.targetPath}"`,
      });
    }
  }
});

const renderPlanEntry = (entry: RenamePlanEntry): string => `${entry.sourceName} -> ${entry.targetName}`;

const logRenamePlan = Effect.fn("Files.logRenamePlan")(function* (plan: ReadonlyArray<RenamePlanEntry>) {
  yield* Effect.forEach(plan, (entry) => Console.log(renderPlanEntry(entry)), {
    discard: true,
  });
});

const renameOrFail = (
  sourcePath: string,
  targetPath: string,
  tempDir: string
): Effect.Effect<void, FilesCommandError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    yield* fs.rename(sourcePath, targetPath).pipe(
      Effect.mapError(
        (cause) =>
          new FilesCommandError({
            message: `Failed to rename "${sourcePath}" to "${targetPath}". Recovery temp directory: "${tempDir}"`,
            cause,
          })
      )
    );
  });

const applyRenamePlan = Effect.fn("Files.applyRenamePlan")(function* (
  directory: string,
  plan: ReadonlyArray<RenamePlanEntry>
): Effect.fn.Return<void, FilesCommandError, FileSystem.FileSystem | Path.Path> {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const tempDir = yield* fs
    .makeTempDirectory({ directory, prefix: ".beep-files-sort-and-rename-" })
    .pipe(
      Effect.mapError((cause) => formatPlatformError("Failed to create temporary rename directory", directory, cause))
    );

  const tempEntries = A.map(plan, (entry) => ({
    entry,
    tempPath: path.join(
      tempDir,
      `${formatIndex(entry.index, Str.length(`${A.length(plan)}`) + 1)}-${entry.sourceName}`
    ),
  }));

  for (const { entry, tempPath } of tempEntries) {
    yield* renameOrFail(entry.sourcePath, tempPath, tempDir);
  }

  for (const { entry, tempPath } of tempEntries) {
    yield* renameOrFail(tempPath, entry.targetPath, tempDir);
  }

  yield* fs
    .remove(tempDir, { recursive: true, force: true })
    .pipe(
      Effect.mapError((cause) => formatPlatformError("Failed to remove temporary rename directory", tempDir, cause))
    );
});

const printFilesIndex = Effect.fn("Files.printFilesIndex")(function* () {
  yield* Console.log("Files commands:");
  yield* Console.log("- bun run files sort-and-rename --prefix image --dir ./tmp");
  yield* Console.log("- bun run files sort-and-rename --prefix image --dir ./tmp --with-dimensions");
});

/**
 * Sort direct regular files in a directory by size and rename them with a generated prefix.
 *
 * @param dir - Directory whose direct regular files should be sorted and renamed.
 * @param prefix - Safe generated filename prefix.
 * @param dryRun - Whether to print the plan without applying it.
 * @param withDimensions - Whether to include probed media dimensions in generated names.
 * @returns Summary counts for the operation.
 * @category UseCase
 * @since 0.0.0
 */
export const sortAndRenameFiles = Effect.fn("Files.sortAndRenameFiles")(function* (
  dir: string,
  prefix: string,
  dryRun: boolean,
  withDimensions = false
): Effect.fn.Return<
  SortAndRenameSummary,
  FilesCommandError,
  FileSystem.FileSystem | Path.Path | ChildProcessSpawner.ChildProcessSpawner
> {
  const safePrefix = yield* validatePrefix(prefix);
  const { directory } = yield* validateDirectory(dir);
  const plan = yield* buildRenamePlan(directory, safePrefix, withDimensions);
  const entries = plan.entries;

  if (!A.isReadonlyArrayNonEmpty(entries)) {
    yield* Console.log(`files sort-and-rename: 0 file(s) in "${directory}"; nothing to rename.`);
    if (withDimensions === true && hasSkippedFiles(plan.skippedCount)) {
      yield* Console.log(`files sort-and-rename: skipped ${plan.skippedCount} non-media file(s).`);
    }
    return new SortAndRenameSummary({
      directory,
      dryRun,
      plannedCount: 0,
      renamedCount: 0,
      skippedCount: plan.skippedCount,
      withDimensions,
    });
  }

  yield* preflightTargetCollisions(entries);
  yield* Console.log(`files sort-and-rename: ${A.length(entries)} file(s) planned in "${directory}".`);
  if (withDimensions === true && hasSkippedFiles(plan.skippedCount)) {
    yield* Console.log(`files sort-and-rename: skipped ${plan.skippedCount} non-media file(s).`);
  }
  yield* logRenamePlan(entries);

  if (dryRun) {
    yield* Console.log("files sort-and-rename: dry run; no files renamed.");
    return new SortAndRenameSummary({
      directory,
      dryRun,
      plannedCount: A.length(entries),
      renamedCount: 0,
      skippedCount: plan.skippedCount,
      withDimensions,
    });
  }

  yield* applyRenamePlan(directory, entries);
  yield* Console.log(`files sort-and-rename: renamed ${A.length(entries)} file(s).`);

  return new SortAndRenameSummary({
    directory,
    dryRun,
    plannedCount: A.length(entries),
    renamedCount: A.length(entries),
    skippedCount: plan.skippedCount,
    withDimensions,
  });
});

const runFilesProgram = <A>(
  effect: Effect.Effect<
    A,
    FilesCommandError,
    FileSystem.FileSystem | Path.Path | ChildProcessSpawner.ChildProcessSpawner
  >
): Effect.Effect<void, never, FileSystem.FileSystem | Path.Path | ChildProcessSpawner.ChildProcessSpawner> =>
  effect.pipe(
    Effect.catchTag(
      "FilesCommandError",
      Effect.fn(function* (error) {
        process.exitCode = 1;
        yield* Console.error(`[files] ${error.message}`);
      })
    ),
    Effect.asVoid
  );

const dirFlag = Flag.directory("dir", { mustExist: true }).pipe(
  Flag.withDescription("Directory whose direct regular files should be sorted and renamed")
);
const prefixFlag = Flag.string("prefix").pipe(
  Flag.withDescription("Generated filename prefix without dots, path separators, or embedded NUL bytes")
);
const dryRunFlag = Flag.boolean("dry-run").pipe(
  Flag.withDescription("Print the planned renames without touching files")
);
const withDimensionsFlag = Flag.boolean("with-dimensions").pipe(
  Flag.withDescription("Include probed image or video dimensions in generated media filenames")
);

const filesSortAndRenameCommand = Command.make(
  "sort-and-rename",
  {
    dir: dirFlag,
    dryRun: dryRunFlag,
    prefix: prefixFlag,
    withDimensions: withDimensionsFlag,
  },
  Effect.fn(function* ({ dir, dryRun, prefix, withDimensions }) {
    yield* runFilesProgram(sortAndRenameFiles(dir, prefix, dryRun, withDimensions));
  })
).pipe(Command.withDescription("Sort direct files by size and rename them with a generated prefix"));

/**
 * File curation command group.
 *
 * @category UseCase
 * @since 0.0.0
 */
export const filesCommand = Command.make("files", {}, printFilesIndex).pipe(
  Command.withDescription("Dataset file curation commands"),
  Command.withSubcommands([filesSortAndRenameCommand])
);
