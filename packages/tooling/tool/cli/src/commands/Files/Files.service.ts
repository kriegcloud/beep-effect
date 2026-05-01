/**
 * Service implementation for dataset file curation commands.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import { profilePhase } from "@beep/observability";
import { Console, Context, Effect, FileSystem, flow, HashMap, HashSet, Layer, Order, Path, pipe, Result } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as Str from "effect/String";
import { ChildProcess, type ChildProcessSpawner } from "effect/unstable/process";
import { imageSizeFromFile } from "image-size/fromFile";
import sharp from "sharp";
import { renderBiomeJson } from "../Shared/BiomeJson.js";
import { FilesCommandError, failOnExtensionlessFile, formatPlatformError } from "./Files.errors.js";
import {
  ArchivedSidecarEntry,
  ArchivePoorCandidatesEntry,
  ArchivePoorCandidatesManifest,
  ArchivePoorCandidatesManifestOptions,
  ArchivePoorCandidatesManifestSummary,
  type ArchivePoorCandidatesOptions,
  ArchivePoorCandidatesPlan,
  ArchivePoorCandidatesSkippedEntry,
  type ArchivePoorCandidatesSkippedReason,
  ArchivePoorCandidatesSummary,
  type CreateCaptionFilesOptions,
  CreateCaptionFilesPlan,
  CreateCaptionFilesPlanEntry,
  CreateCaptionFilesSkippedEntry,
  type CreateCaptionFilesSkippedReason,
  CreateCaptionFilesSummary,
  type CropBordersOptions,
  CropBordersPlan,
  type CropBordersPlanEntry,
  CropBordersSummary,
  DetectBordersEntry,
  DetectBordersOptions,
  DetectBordersReport,
  DetectBordersSkippedEntry,
  type DetectBordersSkippedReason,
  DetectBordersSummary,
  decodeArchivePoorCandidatesOptions,
  decodeCreateCaptionFilesOptions,
  decodeCropBordersOptions,
  decodeDetectBordersOptions,
  decodeFfprobeOutputJson,
  decodeImageSizeMetadata,
  decodeNormalizeMaxLongEdge,
  decodeSafeFilePrefix,
  encodeArchivePoorCandidatesManifest,
  encodeDetectBordersReport,
  encodeNormalizeManifest,
  type FileSha256Hash,
  MediaDimensions,
  type MediaKind,
  NormalizeFilesOptions,
  type NormalizeImageFormat,
  NormalizeManifest,
  NormalizeManifestOptions,
  NormalizeManifestSummary,
  NormalizePlan,
  NormalizePlanEntry,
  NormalizeSkippedEntry,
  type NormalizeSkippedReason,
  NormalizeSummary,
  type PositiveMediaDimension,
  RenamePlan,
  RenamePlanEntry,
  type SafeFilePrefix,
  SortAndRenameSummary,
  SortableFile,
  SortableFileCollection,
  StripMetadataPlan,
  StripMetadataPlanEntry,
  StripMetadataSummary,
} from "./Files.schemas.js";
import {
  analyzeSolidBorders,
  assessImageCandidate,
  byNameAscending,
  bySizeDescendingThenNameAscending,
  classifyBorderSides,
  collectText,
  cropBordersPlanEntryFromDetection,
  formatIndex,
  hasSkippedFiles,
  isExifOrientationRotated,
  isImageFileExtension,
  isQuarterTurnRotation,
  isSupportedMetadataImageFile,
  makeStripMetadataTempEntries,
  maybeSwapDimensions,
  mediaDimensionsChanged,
  mediaKindFromExtension,
  normalizeBareExtension,
  normalizeOutputDimensions,
  normalizeOutputExtension,
  renderArchivePoorCandidatesEntry,
  renderArchivePoorCandidatesSkippedEntry,
  renderCreateCaptionFilesPlanEntry,
  renderCreateCaptionFilesSkippedEntry,
  renderCropBordersPlanEntry,
  renderDetectBordersEntry,
  renderNormalizePlanEntry,
  renderNormalizeSkippedEntry,
  renderPlanEntry,
  renderStripMetadataPlanEntry,
  rotationFromStream,
  selectedCanonicalPathSet,
  sharpFormatForNormalize,
  stringEquivalence,
  targetNameForEntry,
} from "./Files.utils.js";

const $I = $RepoCliId.create("commands/Files/Files.service");

type FilesCommandServiceRequirements = FileSystem.FileSystem | Path.Path | ChildProcessSpawner.ChildProcessSpawner;

interface NormalizeSeenOutput {
  readonly entry: NormalizePlanEntry;
  readonly outputHash: FileSha256Hash;
  readonly tempPath: string;
}

interface NormalizeDuplicateMove {
  readonly sourcePath: string;
  readonly targetPath: string;
}

interface NormalizeApplyResult {
  readonly completedEntries: ReadonlyArray<NormalizePlanEntry>;
  readonly duplicateMoves: ReadonlyArray<NormalizeDuplicateMove>;
  readonly duplicateSkippedEntries: ReadonlyArray<NormalizeSkippedEntry>;
}

/**
 * Service contract for dataset file curation operations.
 *
 * @category services
 * @since 0.0.0
 */
export interface FilesCommandServiceShape {
  /**
   * Archive obvious poor image candidates out of a dataset directory.
   *
   * @since 0.0.0
   */
  readonly archivePoorCandidates: (
    options: ArchivePoorCandidatesOptions
  ) => Effect.Effect<ArchivePoorCandidatesSummary, FilesCommandError>;

  /**
   * Create same-stem caption sidecar files for direct image files.
   *
   * @since 0.0.0
   */
  readonly createCaptionFiles: (
    options: CreateCaptionFilesOptions
  ) => Effect.Effect<CreateCaptionFilesSummary, FilesCommandError>;

  /**
   * Crop solid or near-solid borders from direct image files.
   *
   * @since 0.0.0
   */
  readonly cropBordersFiles: (options: CropBordersOptions) => Effect.Effect<CropBordersSummary, FilesCommandError>;

  /**
   * Detect solid or near-solid borders in direct image files.
   *
   * @since 0.0.0
   */
  readonly detectBordersFiles: (options: DetectBordersOptions) => Effect.Effect<DetectBordersReport, FilesCommandError>;

  /**
   * Normalize direct image files into a reversible output directory.
   *
   * @since 0.0.0
   */
  readonly normalizeFiles: (options: NormalizeFilesOptions) => Effect.Effect<NormalizeSummary, FilesCommandError>;

  /**
   * Sort direct regular files in a directory by size and rename them.
   *
   * @since 0.0.0
   */
  readonly sortAndRenameFiles: (
    dir: string,
    prefix: string,
    dryRun: boolean,
    withDimensions?: boolean
  ) => Effect.Effect<SortAndRenameSummary, FilesCommandError>;

  /**
   * Strip user-authored metadata from direct image and video files in a directory.
   *
   * @since 0.0.0
   */
  readonly stripMetadataFiles: (dir: string, dryRun: boolean) => Effect.Effect<StripMetadataSummary, FilesCommandError>;
}

/**
 * Service tag for dataset file curation operations.
 *
 * @category services
 * @since 0.0.0
 */
export class FilesCommandService extends Context.Service<FilesCommandService, FilesCommandServiceShape>()(
  $I`FilesCommandService`
) {}

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
    .pipe(Effect.mapError((cause) => formatPlatformError("Failed to stat directory", directory, { cause })));

  if (stat.type !== "Directory") {
    return yield* new FilesCommandError({
      message: `Expected --dir to be a directory: "${directory}"`,
    });
  }

  const canonicalDir = yield* fs
    .realPath(directory)
    .pipe(Effect.mapError((cause) => formatPlatformError("Failed to resolve directory", directory, { cause })));

  return { canonicalDir, directory };
});

const validateNormalizeMaxLongEdge: (
  maxLongEdge: O.Option<number>
) => Effect.Effect<O.Option<PositiveMediaDimension>, FilesCommandError> = flow(
  O.match({
    onNone: () => Effect.succeed(O.none<PositiveMediaDimension>()),
    onSome: (value) =>
      decodeNormalizeMaxLongEdge(value).pipe(
        Effect.map(O.some),
        Effect.mapError(
          () =>
            new FilesCommandError({
              message: `Expected --max-long-edge to be a positive integer: ${value}`,
            })
        )
      ),
  })
);

const validateCreateCaptionFilesOptions = (
  options: CreateCaptionFilesOptions
): Effect.Effect<CreateCaptionFilesOptions, FilesCommandError> =>
  decodeCreateCaptionFilesOptions(options).pipe(
    Effect.mapError(
      (cause) =>
        new FilesCommandError({
          message: "Invalid create-captions options. Expected a directory, caption text, and boolean flags.",
          cause,
        })
    )
  );

const validateDetectBordersOptions = (
  options: DetectBordersOptions
): Effect.Effect<DetectBordersOptions, FilesCommandError> =>
  decodeDetectBordersOptions(options).pipe(
    Effect.mapError(
      (cause) =>
        new FilesCommandError({
          message:
            "Invalid detect-borders options. Expected --tolerance between 0 and 255, --min-solid-pct and --min-width-pct between greater than 0 and 100, and --max-scan-pct between greater than 0 and 50.",
          cause,
        })
    ),
    Effect.flatMap((decoded) => {
      if (decoded.minWidthPct > decoded.maxScanPct) {
        return Effect.fail(
          new FilesCommandError({
            message: `Expected --min-width-pct (${decoded.minWidthPct}) to be less than or equal to --max-scan-pct (${decoded.maxScanPct}).`,
          })
        );
      }

      return Effect.succeed(decoded);
    })
  );

const validateCropBordersOptions = (
  options: CropBordersOptions
): Effect.Effect<CropBordersOptions, FilesCommandError> =>
  decodeCropBordersOptions(options).pipe(
    Effect.mapError(
      (cause) =>
        new FilesCommandError({
          message:
            "Invalid crop-borders options. Expected --tolerance between 0 and 255, --min-solid-pct and --min-width-pct between greater than 0 and 100, and --max-scan-pct between greater than 0 and 50.",
          cause,
        })
    ),
    Effect.flatMap((decoded) => {
      if (decoded.minWidthPct > decoded.maxScanPct) {
        return Effect.fail(
          new FilesCommandError({
            message: `Expected --min-width-pct (${decoded.minWidthPct}) to be less than or equal to --max-scan-pct (${decoded.maxScanPct}).`,
          })
        );
      }

      return Effect.succeed(decoded);
    })
  );

const cropBordersDetectionOptions = (options: CropBordersOptions): DetectBordersOptions =>
  new DetectBordersOptions({
    dir: options.dir,
    json: false,
    maxScanPct: options.maxScanPct,
    minSolidPct: options.minSolidPct,
    minWidthPct: options.minWidthPct,
    tolerance: options.tolerance,
  });

const makeNormalizeManifestOptions = (
  dedupe: boolean,
  format: NormalizeImageFormat,
  maxLongEdge: O.Option<PositiveMediaDimension>,
  moveDuplicatesTo: O.Option<string>,
  overwrite: boolean
): NormalizeManifestOptions =>
  new NormalizeManifestOptions({
    dedupe,
    format,
    ...(O.isSome(maxLongEdge) ? { maxLongEdge: maxLongEdge.value } : {}),
    ...(O.isSome(moveDuplicatesTo) ? { moveDuplicatesTo: moveDuplicatesTo.value } : {}),
    overwrite,
  });

const makeNormalizeSkippedEntry = (
  sourceName: string,
  sourcePath: string,
  extension: O.Option<string>,
  reason: NormalizeSkippedReason,
  message: string
): NormalizeSkippedEntry =>
  O.isSome(extension)
    ? new NormalizeSkippedEntry({ extension: extension.value, message, reason, sourceName, sourcePath })
    : new NormalizeSkippedEntry({ message, reason, sourceName, sourcePath });

const makeNormalizeDuplicateSkippedEntry = (
  entry: NormalizePlanEntry,
  outputHash: FileSha256Hash,
  duplicateOf: NormalizePlanEntry,
  moveTarget: O.Option<{ readonly path: string; readonly relativePath: string }>
): NormalizeSkippedEntry =>
  new NormalizeSkippedEntry({
    duplicateOfOutputRelativePath: duplicateOf.outputRelativePath,
    duplicateOfSourceRelativePath: duplicateOf.sourceRelativePath,
    ...(O.isSome(moveTarget)
      ? { duplicateMovedPath: moveTarget.value.path, duplicateMovedRelativePath: moveTarget.value.relativePath }
      : {}),
    extension: entry.sourceExtension,
    message: `Normalized output exactly duplicates "${duplicateOf.outputRelativePath}".`,
    outputHash,
    reason: "duplicate",
    sourceName: entry.sourceName,
    sourcePath: entry.sourcePath,
  });

const makeCreateCaptionFilesSkippedEntry = (
  sourceName: string,
  sourcePath: string,
  extension: O.Option<string>,
  captionName: O.Option<string>,
  reason: CreateCaptionFilesSkippedReason,
  message: string
): CreateCaptionFilesSkippedEntry =>
  new CreateCaptionFilesSkippedEntry({
    ...(O.isSome(captionName) ? { captionName: captionName.value } : {}),
    ...(O.isSome(extension) ? { extension: extension.value } : {}),
    message,
    reason,
    sourceName,
    sourcePath,
  });

const makeDetectBordersSkippedEntry = (
  sourceName: string,
  sourcePath: string,
  extension: O.Option<string>,
  reason: DetectBordersSkippedReason,
  message: string
): DetectBordersSkippedEntry =>
  O.isSome(extension)
    ? new DetectBordersSkippedEntry({ extension: extension.value, message, reason, sourceName, sourcePath })
    : new DetectBordersSkippedEntry({ message, reason, sourceName, sourcePath });

const makeArchivePoorCandidatesSkippedEntry = (
  sourceName: string,
  sourcePath: string,
  extension: O.Option<string>,
  reason: ArchivePoorCandidatesSkippedReason,
  message: string
): ArchivePoorCandidatesSkippedEntry =>
  O.isSome(extension)
    ? new ArchivePoorCandidatesSkippedEntry({ extension: extension.value, message, reason, sourceName, sourcePath })
    : new ArchivePoorCandidatesSkippedEntry({ message, reason, sourceName, sourcePath });

const parseSidecarExtensions = (value: string): Effect.Effect<ReadonlyArray<string>, FilesCommandError> => {
  const normalized = pipe(value, Str.trim, Str.toLowerCase);

  if (stringEquivalence(normalized, "none")) {
    return Effect.succeed(A.empty<string>());
  }

  const extensions = pipe(
    normalized,
    Str.split(","),
    A.map((entry) => normalizeBareExtension(Str.trim(entry))),
    A.filter(Str.isNonEmpty)
  );
  const invalid = pipe(
    extensions,
    A.findFirst(
      (extension) => Str.includes("/")(extension) || Str.includes("\\")(extension) || Str.includes("\0")(extension)
    )
  );

  if (O.isSome(invalid) || !A.isReadonlyArrayNonEmpty(extensions)) {
    return Effect.fail(
      new FilesCommandError({
        message: `Invalid --sidecars value "${value}". Use none or a comma-separated list of bare extensions such as txt,json.`,
      })
    );
  }

  return Effect.succeed(extensions);
};

const validateArchivePoorCandidatesOptions = (
  options: ArchivePoorCandidatesOptions
): Effect.Effect<ArchivePoorCandidatesOptions, FilesCommandError> =>
  decodeArchivePoorCandidatesOptions(options).pipe(
    Effect.mapError(
      (cause) =>
        new FilesCommandError({
          message:
            "Invalid archive-poor-candidates options. Expected positive integer --target-resolution and --min-short-edge values plus --max-aspect and --max-upscale ratios greater than or equal to 1.",
          cause,
        })
    )
  );

const validateNormalizeDuplicateDirectory = Effect.fn("Files.validateNormalizeDuplicateDirectory")(function* (
  moveDuplicatesTo: O.Option<string>,
  directory: string,
  canonicalDirectory: string,
  outputDirectory: string,
  canonicalOutputDirectory: O.Option<string>
): Effect.fn.Return<O.Option<string>, FilesCommandError, FileSystem.FileSystem | Path.Path> {
  if (O.isNone(moveDuplicatesTo)) {
    return O.none<string>();
  }

  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const duplicateDirectory = path.resolve(moveDuplicatesTo.value);

  if (stringEquivalence(directory, duplicateDirectory)) {
    return yield* new FilesCommandError({
      message: `Refusing to move duplicates into the source directory: "${duplicateDirectory}"`,
    });
  }

  if (stringEquivalence(outputDirectory, duplicateDirectory)) {
    return yield* new FilesCommandError({
      message: `Refusing to move duplicates into the normalize output directory: "${duplicateDirectory}"`,
    });
  }

  const duplicateExists = yield* fs
    .exists(duplicateDirectory)
    .pipe(
      Effect.mapError((cause) =>
        formatPlatformError("Failed to inspect duplicate move directory", duplicateDirectory, { cause })
      )
    );

  if (!duplicateExists) {
    return O.some(duplicateDirectory);
  }

  const duplicateStat = yield* fs
    .stat(duplicateDirectory)
    .pipe(
      Effect.mapError((cause) =>
        formatPlatformError("Failed to stat duplicate move directory", duplicateDirectory, { cause })
      )
    );

  if (duplicateStat.type !== "Directory") {
    return yield* new FilesCommandError({
      message: `Expected --move-duplicates-to to be a directory or missing path: "${duplicateDirectory}"`,
    });
  }

  const canonicalDuplicate = yield* fs
    .realPath(duplicateDirectory)
    .pipe(
      Effect.mapError((cause) =>
        formatPlatformError("Failed to resolve duplicate move directory", duplicateDirectory, { cause })
      )
    );

  if (stringEquivalence(canonicalDirectory, canonicalDuplicate)) {
    return yield* new FilesCommandError({
      message: `Refusing to move duplicates into the source directory: "${duplicateDirectory}"`,
    });
  }

  if (O.isSome(canonicalOutputDirectory) && stringEquivalence(canonicalOutputDirectory.value, canonicalDuplicate)) {
    return yield* new FilesCommandError({
      message: `Refusing to move duplicates into the normalize output directory: "${duplicateDirectory}"`,
    });
  }

  return O.some(duplicateDirectory);
});

const validateNormalizeDirectories = Effect.fn("Files.validateNormalizeDirectories")(function* (
  dir: string,
  outDir: string,
  moveDuplicatesTo: O.Option<string>
): Effect.fn.Return<
  {
    readonly canonicalDirectory: string;
    readonly directory: string;
    readonly duplicateDirectory: O.Option<string>;
    readonly outputDirectory: string;
  },
  FilesCommandError,
  FileSystem.FileSystem | Path.Path
> {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const { canonicalDir, directory } = yield* validateDirectory(dir);
  const outputDirectory = path.resolve(outDir);
  let canonicalOutputDirectory = O.none<string>();
  const outputExists = yield* fs
    .exists(outputDirectory)
    .pipe(
      Effect.mapError((cause) => formatPlatformError("Failed to inspect output directory", outputDirectory, { cause }))
    );

  if (outputExists) {
    const outputStat = yield* fs
      .stat(outputDirectory)
      .pipe(
        Effect.mapError((cause) => formatPlatformError("Failed to stat output directory", outputDirectory, { cause }))
      );

    if (outputStat.type !== "Directory") {
      return yield* new FilesCommandError({
        message: `Expected --out-dir to be a directory or missing path: "${outputDirectory}"`,
      });
    }

    const canonicalOutput = yield* fs
      .realPath(outputDirectory)
      .pipe(
        Effect.mapError((cause) =>
          formatPlatformError("Failed to resolve output directory", outputDirectory, { cause })
        )
      );
    canonicalOutputDirectory = O.some(canonicalOutput);

    if (stringEquivalence(canonicalDir, canonicalOutput)) {
      return yield* new FilesCommandError({
        message: `Refusing to normalize into the source directory: "${outputDirectory}"`,
      });
    }
  }

  if (stringEquivalence(directory, outputDirectory)) {
    return yield* new FilesCommandError({
      message: `Refusing to normalize into the source directory: "${outputDirectory}"`,
    });
  }

  const duplicateDirectory = yield* validateNormalizeDuplicateDirectory(
    moveDuplicatesTo,
    directory,
    canonicalDir,
    outputDirectory,
    canonicalOutputDirectory
  );

  return {
    canonicalDirectory: canonicalDir,
    directory,
    duplicateDirectory,
    outputDirectory,
  };
});

const validateArchiveDirectories = Effect.fn("Files.validateArchiveDirectories")(function* (
  dir: string,
  archiveDir: string
): Effect.fn.Return<
  {
    readonly archiveDirectory: string;
    readonly canonicalDirectory: string;
    readonly directory: string;
  },
  FilesCommandError,
  FileSystem.FileSystem | Path.Path
> {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const { canonicalDir, directory } = yield* validateDirectory(dir);
  const archiveDirectory = path.resolve(archiveDir);
  const archiveExists = yield* fs
    .exists(archiveDirectory)
    .pipe(
      Effect.mapError((cause) =>
        formatPlatformError("Failed to inspect archive directory", archiveDirectory, { cause })
      )
    );

  if (archiveExists) {
    const archiveStat = yield* fs
      .stat(archiveDirectory)
      .pipe(
        Effect.mapError((cause) => formatPlatformError("Failed to stat archive directory", archiveDirectory, { cause }))
      );

    if (archiveStat.type !== "Directory") {
      return yield* new FilesCommandError({
        message: `Expected --archive-dir to be a directory or missing path: "${archiveDirectory}"`,
      });
    }

    const canonicalArchive = yield* fs
      .realPath(archiveDirectory)
      .pipe(
        Effect.mapError((cause) =>
          formatPlatformError("Failed to resolve archive directory", archiveDirectory, { cause })
        )
      );

    if (stringEquivalence(canonicalDir, canonicalArchive)) {
      return yield* new FilesCommandError({
        message: `Refusing to archive into the source directory: "${archiveDirectory}"`,
      });
    }
  }

  if (stringEquivalence(directory, archiveDirectory)) {
    return yield* new FilesCommandError({
      message: `Refusing to archive into the source directory: "${archiveDirectory}"`,
    });
  }

  return {
    archiveDirectory,
    canonicalDirectory: canonicalDir,
    directory,
  };
});

const collectSortableFiles = Effect.fn("Files.collectSortableFiles")(function* (
  dir: string,
  mediaOnly: boolean
): Effect.fn.Return<SortableFileCollection, FilesCommandError, FileSystem.FileSystem | Path.Path> {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const { canonicalDir, directory } = yield* validateDirectory(dir);
  const entries = yield* fs
    .readDirectory(directory)
    .pipe(Effect.mapError((cause) => formatPlatformError("Failed to read directory", directory, { cause })));

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
      .pipe(Effect.mapError((cause) => formatPlatformError("Failed to stat file", sourcePath, { cause })));

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

const collectNormalizeFiles = Effect.fn("Files.collectNormalizeFiles")(function* (
  directory: string,
  canonicalDirectory: string
): Effect.fn.Return<
  { readonly files: ReadonlyArray<SortableFile>; readonly skipped: ReadonlyArray<NormalizeSkippedEntry> },
  FilesCommandError,
  FileSystem.FileSystem | Path.Path
> {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const entries = yield* fs
    .readDirectory(directory)
    .pipe(Effect.mapError((cause) => formatPlatformError("Failed to read directory", directory, { cause })));

  let files = A.empty<SortableFile>();
  let skipped = A.empty<NormalizeSkippedEntry>();

  for (const entry of entries) {
    const sourcePath = path.join(directory, entry);
    const canonicalPath = yield* fs.realPath(sourcePath).pipe(Effect.option);

    if (O.isNone(canonicalPath)) {
      skipped = A.append(
        skipped,
        makeNormalizeSkippedEntry(entry, sourcePath, O.none<string>(), "symlink", "Could not resolve source entry.")
      );
      continue;
    }

    if (!stringEquivalence(canonicalPath.value, path.join(canonicalDirectory, entry))) {
      skipped = A.append(
        skipped,
        makeNormalizeSkippedEntry(entry, sourcePath, O.none<string>(), "symlink", "Symlink entries are not normalized.")
      );
      continue;
    }

    const stat = yield* fs
      .stat(sourcePath)
      .pipe(Effect.mapError((cause) => formatPlatformError("Failed to stat source entry", sourcePath, { cause })));

    if (stat.type === "Directory") {
      skipped = A.append(
        skipped,
        makeNormalizeSkippedEntry(entry, sourcePath, O.none<string>(), "directory", "Directories are not normalized.")
      );
      continue;
    }

    if (stat.type !== "File") {
      skipped = A.append(
        skipped,
        makeNormalizeSkippedEntry(
          entry,
          sourcePath,
          O.none<string>(),
          "non-media",
          "Only regular image files are normalized."
        )
      );
      continue;
    }

    const extension = path.extname(entry);
    if (stringEquivalence(extension, "") || stringEquivalence(extension, ".")) {
      skipped = A.append(
        skipped,
        makeNormalizeSkippedEntry(
          entry,
          sourcePath,
          O.none<string>(),
          "extensionless",
          "Extensionless files are not normalized."
        )
      );
      continue;
    }

    const bareExtension = normalizeBareExtension(extension);
    const mediaKind = mediaKindFromExtension(extension);

    if (O.isNone(mediaKind)) {
      skipped = A.append(
        skipped,
        makeNormalizeSkippedEntry(
          entry,
          sourcePath,
          O.some(extension),
          "non-media",
          "Only recognized image files are normalized."
        )
      );
      continue;
    }

    if (mediaKind.value === "video") {
      skipped = A.append(
        skipped,
        makeNormalizeSkippedEntry(
          entry,
          sourcePath,
          O.some(extension),
          "video",
          "Video normalization is out of scope for this operation."
        )
      );
      continue;
    }

    const file = new SortableFile({
      canonicalPath: canonicalPath.value,
      extension,
      mediaKind,
      name: entry,
      size: stat.size,
      sourcePath,
    });

    if (!isImageFileExtension(bareExtension) || !isSupportedMetadataImageFile(file)) {
      skipped = A.append(
        skipped,
        makeNormalizeSkippedEntry(
          entry,
          sourcePath,
          O.some(extension),
          "unsupported-image",
          "Image extension is not supported by sharp normalization."
        )
      );
      continue;
    }

    files = A.append(files, file);
  }

  return {
    files: A.sort(files, byNameAscending),
    skipped: A.sort(
      skipped,
      Order.mapInput(Order.String, (entry: NormalizeSkippedEntry) => entry.sourceName)
    ),
  };
});

const buildCreateCaptionFilesPlan = Effect.fn("Files.buildCreateCaptionFilesPlan")(function* (
  options: CreateCaptionFilesOptions
): Effect.fn.Return<CreateCaptionFilesPlan, FilesCommandError, FileSystem.FileSystem | Path.Path> {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const { canonicalDir, directory } = yield* validateDirectory(options.dir);
  const sourceNames = yield* fs.readDirectory(directory).pipe(
    Effect.map(A.sort(Order.String)),
    Effect.mapError((cause) => formatPlatformError("Failed to read directory", directory, { cause }))
  );

  let entries = A.empty<CreateCaptionFilesPlanEntry>();
  let plannedCaptionNames = HashSet.empty<string>();
  let skipped = A.empty<CreateCaptionFilesSkippedEntry>();

  for (const sourceName of sourceNames) {
    const sourcePath = path.join(directory, sourceName);
    const canonicalPath = yield* fs.realPath(sourcePath).pipe(Effect.option);

    if (O.isNone(canonicalPath)) {
      skipped = A.append(
        skipped,
        makeCreateCaptionFilesSkippedEntry(
          sourceName,
          sourcePath,
          O.none<string>(),
          O.none<string>(),
          "symlink",
          "Could not resolve source entry."
        )
      );
      continue;
    }

    if (!stringEquivalence(canonicalPath.value, path.join(canonicalDir, sourceName))) {
      skipped = A.append(
        skipped,
        makeCreateCaptionFilesSkippedEntry(
          sourceName,
          sourcePath,
          O.none<string>(),
          O.none<string>(),
          "symlink",
          "Symlink entries are not captioned."
        )
      );
      continue;
    }

    const stat = yield* fs
      .stat(sourcePath)
      .pipe(Effect.mapError((cause) => formatPlatformError("Failed to stat source entry", sourcePath, { cause })));

    if (stat.type === "Directory") {
      skipped = A.append(
        skipped,
        makeCreateCaptionFilesSkippedEntry(
          sourceName,
          sourcePath,
          O.none<string>(),
          O.none<string>(),
          "directory",
          "Directories are not captioned."
        )
      );
      continue;
    }

    if (stat.type !== "File") {
      skipped = A.append(
        skipped,
        makeCreateCaptionFilesSkippedEntry(
          sourceName,
          sourcePath,
          O.none<string>(),
          O.none<string>(),
          "non-media",
          "Only regular image files receive caption sidecars."
        )
      );
      continue;
    }

    const extension = path.extname(sourceName);
    if (stringEquivalence(extension, "") || stringEquivalence(extension, ".")) {
      skipped = A.append(
        skipped,
        makeCreateCaptionFilesSkippedEntry(
          sourceName,
          sourcePath,
          O.none<string>(),
          O.none<string>(),
          "extensionless",
          "Extensionless files are not captioned."
        )
      );
      continue;
    }

    const mediaKind = mediaKindFromExtension(extension);
    if (O.isNone(mediaKind)) {
      skipped = A.append(
        skipped,
        makeCreateCaptionFilesSkippedEntry(
          sourceName,
          sourcePath,
          O.some(extension),
          O.none<string>(),
          "non-media",
          "Only recognized image files receive caption sidecars."
        )
      );
      continue;
    }

    if (mediaKind.value === "video") {
      skipped = A.append(
        skipped,
        makeCreateCaptionFilesSkippedEntry(
          sourceName,
          sourcePath,
          O.some(extension),
          O.none<string>(),
          "video",
          "Video caption sidecars are out of scope for this operation."
        )
      );
      continue;
    }

    const captionName = `${path.basename(sourceName, extension)}.txt`;
    const captionPath = path.join(directory, captionName);

    if (HashSet.has(plannedCaptionNames, captionName)) {
      skipped = A.append(
        skipped,
        makeCreateCaptionFilesSkippedEntry(
          sourceName,
          sourcePath,
          O.some(extension),
          O.some(captionName),
          "caption-target-collision",
          `Another image in this run already targets "${captionName}".`
        )
      );
      continue;
    }

    const captionExists = yield* fs
      .exists(captionPath)
      .pipe(
        Effect.mapError((cause) => formatPlatformError("Failed to inspect caption target", captionPath, { cause }))
      );
    let overwritesExisting = false;

    if (captionExists) {
      const captionStat = yield* fs
        .stat(captionPath)
        .pipe(Effect.mapError((cause) => formatPlatformError("Failed to stat caption target", captionPath, { cause })));

      if (captionStat.type !== "File") {
        skipped = A.append(
          skipped,
          makeCreateCaptionFilesSkippedEntry(
            sourceName,
            sourcePath,
            O.some(extension),
            O.some(captionName),
            "caption-target-not-file",
            `Caption target "${captionName}" already exists and is not a file.`
          )
        );
        continue;
      }

      if (!options.overwrite) {
        skipped = A.append(
          skipped,
          makeCreateCaptionFilesSkippedEntry(
            sourceName,
            sourcePath,
            O.some(extension),
            O.some(captionName),
            "caption-exists",
            `Caption target "${captionName}" already exists.`
          )
        );
        continue;
      }

      overwritesExisting = true;
    }

    plannedCaptionNames = HashSet.add(plannedCaptionNames, captionName);
    entries = A.append(
      entries,
      new CreateCaptionFilesPlanEntry({
        captionName,
        captionPath,
        captionRelativePath: path.relative(directory, captionPath),
        extension,
        overwritesExisting,
        sourceName,
        sourcePath,
        sourceRelativePath: path.relative(directory, sourcePath),
      })
    );
  }

  return new CreateCaptionFilesPlan({
    caption: options.caption,
    directory,
    entries: A.sort(
      entries,
      Order.mapInput(Order.String, (entry: CreateCaptionFilesPlanEntry) => entry.sourceName)
    ),
    overwrite: options.overwrite,
    skipped: A.sort(
      skipped,
      Order.mapInput(Order.String, (entry: CreateCaptionFilesSkippedEntry) => entry.sourceName)
    ),
  });
});

const applyCreateCaptionFilesPlan = Effect.fn("Files.applyCreateCaptionFilesPlan")(function* (
  plan: CreateCaptionFilesPlan
): Effect.fn.Return<void, FilesCommandError, FileSystem.FileSystem> {
  const fs = yield* FileSystem.FileSystem;

  for (const entry of plan.entries) {
    yield* fs
      .writeFileString(entry.captionPath, plan.caption)
      .pipe(
        Effect.mapError((cause) => formatPlatformError("Failed to write caption sidecar", entry.captionPath, { cause }))
      );
  }
});

const collectDetectBordersFiles = Effect.fn("Files.collectDetectBordersFiles")(function* (
  dir: string
): Effect.fn.Return<
  {
    readonly directory: string;
    readonly files: ReadonlyArray<SortableFile>;
    readonly skipped: ReadonlyArray<DetectBordersSkippedEntry>;
  },
  FilesCommandError,
  FileSystem.FileSystem | Path.Path
> {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const { canonicalDir, directory } = yield* validateDirectory(dir);
  const entries = yield* fs
    .readDirectory(directory)
    .pipe(Effect.mapError((cause) => formatPlatformError("Failed to read directory", directory, { cause })));

  let files = A.empty<SortableFile>();
  let skipped = A.empty<DetectBordersSkippedEntry>();

  for (const entry of entries) {
    const sourcePath = path.join(directory, entry);
    const canonicalPath = yield* fs.realPath(sourcePath).pipe(Effect.option);

    if (O.isNone(canonicalPath)) {
      skipped = A.append(
        skipped,
        makeDetectBordersSkippedEntry(entry, sourcePath, O.none<string>(), "symlink", "Could not resolve source entry.")
      );
      continue;
    }

    if (!stringEquivalence(canonicalPath.value, path.join(canonicalDir, entry))) {
      skipped = A.append(
        skipped,
        makeDetectBordersSkippedEntry(
          entry,
          sourcePath,
          O.none<string>(),
          "symlink",
          "Symlink entries are not analyzed."
        )
      );
      continue;
    }

    const stat = yield* fs
      .stat(sourcePath)
      .pipe(Effect.mapError((cause) => formatPlatformError("Failed to stat source entry", sourcePath, { cause })));

    if (stat.type === "Directory") {
      skipped = A.append(
        skipped,
        makeDetectBordersSkippedEntry(entry, sourcePath, O.none<string>(), "directory", "Directories are not analyzed.")
      );
      continue;
    }

    if (stat.type !== "File") {
      skipped = A.append(
        skipped,
        makeDetectBordersSkippedEntry(
          entry,
          sourcePath,
          O.none<string>(),
          "non-media",
          "Only regular image files are analyzed."
        )
      );
      continue;
    }

    const extension = path.extname(entry);
    if (stringEquivalence(extension, "") || stringEquivalence(extension, ".")) {
      skipped = A.append(
        skipped,
        makeDetectBordersSkippedEntry(
          entry,
          sourcePath,
          O.none<string>(),
          "extensionless",
          "Extensionless files are not analyzed."
        )
      );
      continue;
    }

    const mediaKind = mediaKindFromExtension(extension);
    if (O.isNone(mediaKind)) {
      skipped = A.append(
        skipped,
        makeDetectBordersSkippedEntry(
          entry,
          sourcePath,
          O.some(extension),
          "non-media",
          "Only recognized image files are analyzed."
        )
      );
      continue;
    }

    if (mediaKind.value === "video") {
      skipped = A.append(
        skipped,
        makeDetectBordersSkippedEntry(
          entry,
          sourcePath,
          O.some(extension),
          "video",
          "Video border detection is out of scope for this operation."
        )
      );
      continue;
    }

    const file = new SortableFile({
      canonicalPath: canonicalPath.value,
      extension,
      mediaKind,
      name: entry,
      size: stat.size,
      sourcePath,
    });

    if (!isSupportedMetadataImageFile(file)) {
      skipped = A.append(
        skipped,
        makeDetectBordersSkippedEntry(
          entry,
          sourcePath,
          O.some(extension),
          "unsupported-image",
          "Image extension is not supported by sharp border detection."
        )
      );
      continue;
    }

    files = A.append(files, file);
  }

  return {
    directory,
    files: A.sort(files, byNameAscending),
    skipped: A.sort(
      skipped,
      Order.mapInput(Order.String, (entry: DetectBordersSkippedEntry) => entry.sourceName)
    ),
  };
});

const collectArchiveCandidateFiles = Effect.fn("Files.collectArchiveCandidateFiles")(function* (
  directory: string,
  canonicalDirectory: string
): Effect.fn.Return<
  {
    readonly files: ReadonlyArray<SortableFile>;
    readonly skipped: ReadonlyArray<ArchivePoorCandidatesSkippedEntry>;
  },
  FilesCommandError,
  FileSystem.FileSystem | Path.Path
> {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const entries = yield* fs
    .readDirectory(directory)
    .pipe(Effect.mapError((cause) => formatPlatformError("Failed to read directory", directory, { cause })));

  let files = A.empty<SortableFile>();
  let skipped = A.empty<ArchivePoorCandidatesSkippedEntry>();

  for (const entry of entries) {
    const sourcePath = path.join(directory, entry);
    const canonicalPath = yield* fs.realPath(sourcePath).pipe(Effect.option);

    if (O.isNone(canonicalPath)) {
      skipped = A.append(
        skipped,
        makeArchivePoorCandidatesSkippedEntry(
          entry,
          sourcePath,
          O.none<string>(),
          "symlink",
          "Could not resolve source entry."
        )
      );
      continue;
    }

    if (!stringEquivalence(canonicalPath.value, path.join(canonicalDirectory, entry))) {
      skipped = A.append(
        skipped,
        makeArchivePoorCandidatesSkippedEntry(
          entry,
          sourcePath,
          O.none<string>(),
          "symlink",
          "Symlink entries are not assessed."
        )
      );
      continue;
    }

    const stat = yield* fs
      .stat(sourcePath)
      .pipe(Effect.mapError((cause) => formatPlatformError("Failed to stat source entry", sourcePath, { cause })));

    if (stat.type === "Directory") {
      skipped = A.append(
        skipped,
        makeArchivePoorCandidatesSkippedEntry(
          entry,
          sourcePath,
          O.none<string>(),
          "directory",
          "Directories are not assessed."
        )
      );
      continue;
    }

    if (stat.type !== "File") {
      skipped = A.append(
        skipped,
        makeArchivePoorCandidatesSkippedEntry(
          entry,
          sourcePath,
          O.none<string>(),
          "non-media",
          "Only regular image files are assessed."
        )
      );
      continue;
    }

    const extension = path.extname(entry);
    if (stringEquivalence(extension, "") || stringEquivalence(extension, ".")) {
      skipped = A.append(
        skipped,
        makeArchivePoorCandidatesSkippedEntry(
          entry,
          sourcePath,
          O.none<string>(),
          "extensionless",
          "Extensionless files are not assessed."
        )
      );
      continue;
    }

    const mediaKind = mediaKindFromExtension(extension);
    if (O.isNone(mediaKind)) {
      skipped = A.append(
        skipped,
        makeArchivePoorCandidatesSkippedEntry(
          entry,
          sourcePath,
          O.some(extension),
          "non-media",
          "Only recognized image files are assessed."
        )
      );
      continue;
    }

    if (mediaKind.value === "video") {
      skipped = A.append(
        skipped,
        makeArchivePoorCandidatesSkippedEntry(
          entry,
          sourcePath,
          O.some(extension),
          "video",
          "Video quality archival is out of scope for this operation."
        )
      );
      continue;
    }

    const file = new SortableFile({
      canonicalPath: canonicalPath.value,
      extension,
      mediaKind,
      name: entry,
      size: stat.size,
      sourcePath,
    });

    if (!isSupportedMetadataImageFile(file)) {
      skipped = A.append(
        skipped,
        makeArchivePoorCandidatesSkippedEntry(
          entry,
          sourcePath,
          O.some(extension),
          "unsupported-image",
          "Image extension is not supported by sharp candidate assessment."
        )
      );
      continue;
    }

    files = A.append(files, file);
  }

  return {
    files: A.sort(files, byNameAscending),
    skipped: A.sort(
      skipped,
      Order.mapInput(Order.String, (entry: ArchivePoorCandidatesSkippedEntry) => entry.sourceName)
    ),
  };
});

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

const readImagePixelsForBorderDetection = Effect.fn("Files.readImagePixelsForBorderDetection")(function* (
  file: SortableFile
): Effect.fn.Return<
  {
    readonly channels: number;
    readonly data: Uint8Array;
    readonly height: number;
    readonly width: number;
  },
  FilesCommandError
> {
  const result = yield* Effect.tryPromise({
    try: () =>
      sharp(file.sourcePath)
        .rotate()
        .flatten({ background: { b: 255, g: 255, r: 255 } })
        .toColorspace("srgb")
        .raw()
        .toBuffer({ resolveWithObject: true }),
    catch: (cause) =>
      new FilesCommandError({
        message: `Failed to decode image pixels for "${file.sourcePath}"`,
        cause,
      }),
  });

  if (result.info.width < 1 || result.info.height < 1 || result.info.channels < 3) {
    return yield* new FilesCommandError({
      message: `Image decode did not return usable RGB pixels for "${file.sourcePath}"`,
    });
  }

  return {
    channels: result.info.channels,
    data: result.data,
    height: result.info.height,
    width: result.info.width,
  };
});

const analyzeDetectBordersFile = Effect.fn("Files.analyzeDetectBordersFile")(function* (
  file: SortableFile,
  options: DetectBordersOptions
): Effect.fn.Return<DetectBordersEntry, FilesCommandError> {
  const pixels = yield* readImagePixelsForBorderDetection(file);
  const sides = analyzeSolidBorders(pixels, options);
  const classification = classifyBorderSides(sides);
  const borderCount = A.length(A.filter(sides, (side) => side.matched));

  return new DetectBordersEntry({
    borderCount,
    classification,
    extension: file.extension,
    hasBorder: borderCount > 0,
    height: pixels.height,
    sides,
    sourceName: file.name,
    sourcePath: file.sourcePath,
    width: pixels.width,
  });
});

const buildCropBordersPlan = Effect.fn("Files.buildCropBordersPlan")(function* (
  options: CropBordersOptions
): Effect.fn.Return<CropBordersPlan, FilesCommandError, FileSystem.FileSystem | Path.Path> {
  const validatedOptions = yield* validateCropBordersOptions(options);
  const detectionOptions = cropBordersDetectionOptions(validatedOptions);
  const collection = yield* collectDetectBordersFiles(validatedOptions.dir);
  let analyzedCount = 0;
  let borderedCount = 0;
  let skippedCount = A.length(collection.skipped);
  let entries = A.empty<CropBordersPlanEntry>();

  for (const file of collection.files) {
    const result = yield* analyzeDetectBordersFile(file, detectionOptions).pipe(Effect.result);

    if (Result.isFailure(result)) {
      skippedCount += 1;
      continue;
    }

    analyzedCount += 1;

    if (!result.success.hasBorder) {
      continue;
    }

    borderedCount += 1;
    const cropEntry = cropBordersPlanEntryFromDetection(result.success);

    if (O.isNone(cropEntry)) {
      skippedCount += 1;
      continue;
    }

    entries = A.append(entries, cropEntry.value);
  }

  return new CropBordersPlan({
    analyzedCount,
    borderedCount,
    directory: collection.directory,
    entries,
    skippedCount,
  });
});

const uniqueNormalizeTargetName = (
  stem: string,
  format: NormalizeImageFormat,
  usedTargetNames: HashSet.HashSet<string>
): { readonly targetName: string; readonly usedTargetNames: HashSet.HashSet<string> } => {
  const extension = normalizeOutputExtension(format);
  let suffix = 0;
  let targetName = `${stem}${extension}`;

  while (HashSet.has(usedTargetNames, targetName)) {
    suffix += 1;
    targetName = `${stem}_${formatIndex(suffix, 2)}${extension}`;
  }

  return {
    targetName,
    usedTargetNames: HashSet.add(usedTargetNames, targetName),
  };
};

const uniqueArchiveTargetName = (
  stem: string,
  extension: string,
  usedTargetNames: HashSet.HashSet<string>
): { readonly targetName: string; readonly usedTargetNames: HashSet.HashSet<string> } => {
  let suffix = 0;
  let targetName = `${stem}${extension}`;

  while (HashSet.has(usedTargetNames, targetName)) {
    suffix += 1;
    targetName = `${stem}_${formatIndex(suffix, 2)}${extension}`;
  }

  return {
    targetName,
    usedTargetNames: HashSet.add(usedTargetNames, targetName),
  };
};

const buildNormalizePlan = Effect.fn("Files.buildNormalizePlan")(function* (
  options: NormalizeFilesOptions
): Effect.fn.Return<NormalizePlan, FilesCommandError, FileSystem.FileSystem | Path.Path> {
  const path = yield* Path.Path;
  const { canonicalDirectory, directory, duplicateDirectory, outputDirectory } = yield* validateNormalizeDirectories(
    options.dir,
    options.outDir,
    options.moveDuplicatesTo
  );
  const manifestPath = path.resolve(
    O.getOrElse(options.manifest, () => path.join(outputDirectory, "normalize-manifest.json"))
  );
  const collection = yield* collectNormalizeFiles(directory, canonicalDirectory);
  const manifestOptions = makeNormalizeManifestOptions(
    options.dedupe,
    options.format,
    options.maxLongEdge,
    duplicateDirectory,
    options.overwrite
  );
  let entries = A.empty<NormalizePlanEntry>();
  let usedTargetNames = HashSet.empty<string>();

  for (const file of collection.files) {
    const sourceStem = path.basename(file.name, file.extension);
    const uniqueTarget = uniqueNormalizeTargetName(sourceStem, options.format, usedTargetNames);
    usedTargetNames = uniqueTarget.usedTargetNames;

    const inputDimensions = yield* probeImageDimensions(file);
    const outputDimensions = normalizeOutputDimensions(inputDimensions, options.maxLongEdge);
    const outputPath = path.join(outputDirectory, uniqueTarget.targetName);

    entries = A.append(
      entries,
      new NormalizePlanEntry({
        format: options.format,
        inputDimensions,
        outputDimensions,
        outputName: uniqueTarget.targetName,
        outputPath,
        outputRelativePath: path.relative(outputDirectory, outputPath),
        resized: mediaDimensionsChanged(inputDimensions, outputDimensions),
        sourceExtension: file.extension,
        sourceName: file.name,
        sourcePath: file.sourcePath,
        sourceRelativePath: path.relative(directory, file.sourcePath),
        sourceSizeBytes: `${file.size}`,
      })
    );
  }

  return new NormalizePlan({
    duplicateDirectory,
    entries,
    manifestPath,
    options: manifestOptions,
    outputDirectory,
    skipped: collection.skipped,
    sourceDirectory: directory,
  });
});

const collectArchiveSidecars = Effect.fn("Files.collectArchiveSidecars")(function* (
  sourceStem: string,
  targetStem: string,
  directory: string,
  archiveDirectory: string,
  sidecarExtensions: ReadonlyArray<string>,
  plannedSidecarSources: HashSet.HashSet<string>
): Effect.fn.Return<
  {
    readonly plannedSidecarSources: HashSet.HashSet<string>;
    readonly sidecars: ReadonlyArray<ArchivedSidecarEntry>;
  },
  FilesCommandError,
  FileSystem.FileSystem | Path.Path
> {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  let sidecars = A.empty<ArchivedSidecarEntry>();
  let usedSources = plannedSidecarSources;

  for (const extension of sidecarExtensions) {
    const sourcePath = path.join(directory, `${sourceStem}.${extension}`);

    if (HashSet.has(usedSources, sourcePath)) {
      continue;
    }

    const exists = yield* fs
      .exists(sourcePath)
      .pipe(Effect.mapError((cause) => formatPlatformError("Failed to inspect sidecar file", sourcePath, { cause })));

    if (!exists) {
      continue;
    }

    const stat = yield* fs
      .stat(sourcePath)
      .pipe(Effect.mapError((cause) => formatPlatformError("Failed to stat sidecar file", sourcePath, { cause })));

    if (stat.type !== "File") {
      continue;
    }

    const archivePath = path.join(archiveDirectory, `${targetStem}.${extension}`);
    usedSources = HashSet.add(usedSources, sourcePath);
    sidecars = A.append(
      sidecars,
      new ArchivedSidecarEntry({
        archivePath,
        archiveRelativePath: path.relative(archiveDirectory, archivePath),
        extension: `.${extension}`,
        sourcePath,
        sourceRelativePath: path.relative(directory, sourcePath),
      })
    );
  }

  return {
    plannedSidecarSources: usedSources,
    sidecars,
  };
});

const buildArchivePoorCandidatesPlan = Effect.fn("Files.buildArchivePoorCandidatesPlan")(function* (
  options: ArchivePoorCandidatesOptions,
  sidecarExtensions: ReadonlyArray<string>
): Effect.fn.Return<ArchivePoorCandidatesPlan, FilesCommandError, FileSystem.FileSystem | Path.Path> {
  const path = yield* Path.Path;
  const { archiveDirectory, canonicalDirectory, directory } = yield* validateArchiveDirectories(
    options.dir,
    options.archiveDir
  );
  const manifestPath = path.resolve(
    O.getOrElse(options.manifest, () => path.join(archiveDirectory, "archive-poor-candidates-manifest.json"))
  );
  const collection = yield* collectArchiveCandidateFiles(directory, canonicalDirectory);
  const manifestOptions = new ArchivePoorCandidatesManifestOptions({
    maxAspect: options.maxAspect,
    maxUpscale: options.maxUpscale,
    minShortEdge: options.minShortEdge,
    overwrite: options.overwrite,
    profile: options.profile,
    sidecars: sidecarExtensions,
    targetResolution: options.targetResolution,
  });
  let entries = A.empty<ArchivePoorCandidatesEntry>();
  let skipped = collection.skipped;
  let usedTargetNames = HashSet.empty<string>();
  let plannedSidecarSources = HashSet.empty<string>();

  for (const file of collection.files) {
    const dimensionsResult = yield* probeImageDimensions(file).pipe(Effect.result);

    if (Result.isFailure(dimensionsResult)) {
      skipped = A.append(
        skipped,
        makeArchivePoorCandidatesSkippedEntry(
          file.name,
          file.sourcePath,
          O.some(file.extension),
          "unreadable-image",
          dimensionsResult.failure.message
        )
      );
      continue;
    }

    const sourceStem = path.basename(file.name, file.extension);
    const assessment = assessImageCandidate(dimensionsResult.success, {
      maxAspect: options.maxAspect,
      maxUpscale: options.maxUpscale,
      minShortEdge: options.minShortEdge,
      targetResolution: options.targetResolution,
    });

    if (assessment.decision === "keep") {
      entries = A.append(
        entries,
        new ArchivePoorCandidatesEntry({
          decision: "keep",
          dimensions: dimensionsResult.success,
          extension: file.extension,
          metrics: assessment.metrics,
          reasons: assessment.reasons,
          sidecars: A.empty<ArchivedSidecarEntry>(),
          sourceName: file.name,
          sourcePath: file.sourcePath,
          sourceRelativePath: path.relative(directory, file.sourcePath),
          sourceSizeBytes: `${file.size}`,
        })
      );
      continue;
    }

    const uniqueTarget = uniqueArchiveTargetName(sourceStem, file.extension, usedTargetNames);
    usedTargetNames = uniqueTarget.usedTargetNames;
    const archivePath = path.join(archiveDirectory, uniqueTarget.targetName);
    const targetStem = path.basename(uniqueTarget.targetName, file.extension);
    const sidecarPlan = yield* collectArchiveSidecars(
      sourceStem,
      targetStem,
      directory,
      archiveDirectory,
      sidecarExtensions,
      plannedSidecarSources
    );
    plannedSidecarSources = sidecarPlan.plannedSidecarSources;

    entries = A.append(
      entries,
      new ArchivePoorCandidatesEntry({
        archiveName: uniqueTarget.targetName,
        archivePath,
        archiveRelativePath: path.relative(archiveDirectory, archivePath),
        decision: "archive",
        dimensions: dimensionsResult.success,
        extension: file.extension,
        metrics: assessment.metrics,
        reasons: assessment.reasons,
        sidecars: sidecarPlan.sidecars,
        sourceName: file.name,
        sourcePath: file.sourcePath,
        sourceRelativePath: path.relative(directory, file.sourcePath),
        sourceSizeBytes: `${file.size}`,
      })
    );
  }

  const skippedWithoutMovedSidecars = A.filter(
    skipped,
    (entry) => !HashSet.has(plannedSidecarSources, entry.sourcePath)
  );

  return new ArchivePoorCandidatesPlan({
    archiveDirectory,
    entries,
    manifestPath,
    options: manifestOptions,
    skipped: A.sort(
      skippedWithoutMovedSidecars,
      Order.mapInput(Order.String, (entry: ArchivePoorCandidatesSkippedEntry) => entry.sourceName)
    ),
    sourceDirectory: directory,
  });
});

const preflightOverwritableFile = Effect.fn("Files.preflightOverwritableFile")(function* (
  filePath: string,
  overwrite: boolean,
  description: string
): Effect.fn.Return<void, FilesCommandError, FileSystem.FileSystem> {
  const fs = yield* FileSystem.FileSystem;
  const exists = yield* fs
    .exists(filePath)
    .pipe(Effect.mapError((cause) => formatPlatformError(`Failed to inspect ${description}`, filePath, { cause })));

  if (!exists) {
    return;
  }

  if (!overwrite) {
    return yield* new FilesCommandError({
      message: `Refusing to overwrite existing ${description}: "${filePath}"`,
    });
  }

  const stat = yield* fs
    .stat(filePath)
    .pipe(Effect.mapError((cause) => formatPlatformError(`Failed to stat ${description}`, filePath, { cause })));

  if (stat.type !== "File") {
    return yield* new FilesCommandError({
      message: `Refusing to overwrite non-file ${description}: "${filePath}"`,
    });
  }
});

const preflightNormalizeOutputs = Effect.fn("Files.preflightNormalizeOutputs")(function* (
  plan: NormalizePlan,
  overwrite: boolean
): Effect.fn.Return<void, FilesCommandError, FileSystem.FileSystem> {
  let targetPaths = HashSet.empty<string>();

  for (const entry of plan.entries) {
    if (HashSet.has(targetPaths, entry.outputPath)) {
      return yield* new FilesCommandError({
        message: `Refusing duplicate normalize output target: "${entry.outputPath}"`,
      });
    }
    targetPaths = HashSet.add(targetPaths, entry.outputPath);
    yield* preflightOverwritableFile(entry.outputPath, overwrite, "normalize output file");
  }

  if (HashSet.has(targetPaths, plan.manifestPath)) {
    return yield* new FilesCommandError({
      message: `Refusing to write normalize manifest over an output image: "${plan.manifestPath}"`,
    });
  }

  yield* preflightOverwritableFile(plan.manifestPath, overwrite, "normalize manifest");
});

const preflightArchivePoorCandidatesOutputs = Effect.fn("Files.preflightArchivePoorCandidatesOutputs")(function* (
  plan: ArchivePoorCandidatesPlan,
  overwrite: boolean
): Effect.fn.Return<void, FilesCommandError, FileSystem.FileSystem> {
  let targetPaths = HashSet.empty<string>();

  for (const entry of plan.entries) {
    const archivePath = O.fromUndefinedOr(entry.archivePath);

    if (O.isSome(archivePath)) {
      if (HashSet.has(targetPaths, archivePath.value)) {
        return yield* new FilesCommandError({
          message: `Refusing duplicate archive target: "${archivePath.value}"`,
        });
      }
      targetPaths = HashSet.add(targetPaths, archivePath.value);
      yield* preflightOverwritableFile(archivePath.value, overwrite, "archive output file");
    }

    for (const sidecar of entry.sidecars) {
      if (HashSet.has(targetPaths, sidecar.archivePath)) {
        return yield* new FilesCommandError({
          message: `Refusing duplicate archive sidecar target: "${sidecar.archivePath}"`,
        });
      }
      targetPaths = HashSet.add(targetPaths, sidecar.archivePath);
      yield* preflightOverwritableFile(sidecar.archivePath, overwrite, "archive sidecar file");
    }
  }

  if (HashSet.has(targetPaths, plan.manifestPath)) {
    return yield* new FilesCommandError({
      message: `Refusing to write archive manifest over an archived file: "${plan.manifestPath}"`,
    });
  }

  yield* preflightOverwritableFile(plan.manifestPath, overwrite, "archive manifest");
});

const normalizeImageToTemp = Effect.fn("Files.normalizeImageToTemp")(function* (
  entry: NormalizePlanEntry,
  tempPath: string,
  maxLongEdge: O.Option<PositiveMediaDimension>
): Effect.fn.Return<void, FilesCommandError> {
  yield* Effect.tryPromise({
    try: () => {
      const source = sharp(entry.sourcePath).rotate();
      const resized = O.isSome(maxLongEdge)
        ? source.resize({
            fit: "inside",
            height: maxLongEdge.value,
            width: maxLongEdge.value,
            withoutEnlargement: true,
          })
        : source;
      return resized.toFormat(sharpFormatForNormalize(entry.format)).toFile(tempPath);
    },
    catch: (cause) =>
      new FilesCommandError({
        message: `Failed to normalize image "${entry.sourcePath}"`,
        cause,
      }),
  }).pipe(Effect.asVoid);
});

const bytesEqual = (left: Uint8Array, right: Uint8Array): boolean => {
  if (left.length !== right.length) {
    return false;
  }

  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) {
      return false;
    }
  }

  return true;
};

const hashFileSha256 = Effect.fn("Files.hashFileSha256")(function* (
  filePath: string
): Effect.fn.Return<FileSha256Hash, FilesCommandError, FileSystem.FileSystem> {
  const fs = yield* FileSystem.FileSystem;
  const data = yield* fs
    .readFile(filePath)
    .pipe(Effect.mapError((cause) => formatPlatformError("Failed to read file for hashing", filePath, { cause })));

  return yield* Effect.tryPromise({
    try: async () => {
      const digest = await crypto.subtle.digest("SHA-256", new Uint8Array(data));
      const hex = pipe(
        A.fromIterable(new Uint8Array(digest)),
        A.map((value) => Str.padStart(2, "0")(value.toString(16))),
        A.join("")
      );

      return `sha256:${hex}`;
    },
    catch: (cause) =>
      new FilesCommandError({
        message: `Failed to hash normalized file "${filePath}"`,
        cause,
      }),
  });
});

const fileBytesEqual = Effect.fn("Files.fileBytesEqual")(function* (
  leftPath: string,
  rightPath: string
): Effect.fn.Return<boolean, FilesCommandError, FileSystem.FileSystem> {
  const fs = yield* FileSystem.FileSystem;
  const left = yield* fs
    .readFile(leftPath)
    .pipe(
      Effect.mapError((cause) =>
        formatPlatformError("Failed to read file for duplicate comparison", leftPath, { cause })
      )
    );
  const right = yield* fs
    .readFile(rightPath)
    .pipe(
      Effect.mapError((cause) =>
        formatPlatformError("Failed to read file for duplicate comparison", rightPath, { cause })
      )
    );

  return bytesEqual(left, right);
});

const findDuplicateOutput = Effect.fn("Files.findDuplicateOutput")(function* (
  candidates: ReadonlyArray<NormalizeSeenOutput>,
  tempPath: string
): Effect.fn.Return<O.Option<NormalizeSeenOutput>, FilesCommandError, FileSystem.FileSystem> {
  for (const candidate of candidates) {
    const exactMatch = yield* fileBytesEqual(candidate.tempPath, tempPath);

    if (exactMatch) {
      return O.some(candidate);
    }
  }

  return O.none<NormalizeSeenOutput>();
});

const withOutputMetadata = (
  entry: NormalizePlanEntry,
  outputSizeBytes: string,
  outputHash: O.Option<FileSha256Hash>
): NormalizePlanEntry => {
  const base = {
    format: entry.format,
    inputDimensions: entry.inputDimensions,
    outputDimensions: entry.outputDimensions,
    outputName: entry.outputName,
    outputPath: entry.outputPath,
    outputRelativePath: entry.outputRelativePath,
    outputSizeBytes,
    resized: entry.resized,
    sourceExtension: entry.sourceExtension,
    sourceName: entry.sourceName,
    sourcePath: entry.sourcePath,
    sourceRelativePath: entry.sourceRelativePath,
    sourceSizeBytes: entry.sourceSizeBytes,
  };

  return O.isSome(outputHash)
    ? new NormalizePlanEntry({ ...base, outputHash: outputHash.value })
    : new NormalizePlanEntry(base);
};

const makeNormalizeManifest = (
  plan: NormalizePlan,
  completedEntries: ReadonlyArray<NormalizePlanEntry>,
  duplicateSkippedEntries: ReadonlyArray<NormalizeSkippedEntry>
) => {
  const skipped = A.appendAll(plan.skipped, duplicateSkippedEntries);
  const movedDuplicateCount = pipe(
    duplicateSkippedEntries,
    A.filter((entry) => O.isSome(O.fromUndefinedOr(entry.duplicateMovedPath))),
    A.length
  );

  return new NormalizeManifest({
    entries: completedEntries,
    manifestPath: plan.manifestPath,
    options: plan.options,
    outputDirectory: plan.outputDirectory,
    schemaVersion: "beep.files.normalize.v1",
    skipped,
    sourceDirectory: plan.sourceDirectory,
    summary: new NormalizeManifestSummary({
      duplicateCount: A.length(duplicateSkippedEntries),
      movedDuplicateCount,
      normalizedCount: A.length(completedEntries),
      plannedCount: A.length(plan.entries),
      resizedCount: A.length(A.filter(completedEntries, (entry) => entry.resized)),
      skippedCount: A.length(skipped),
    }),
  });
};

const renderNormalizeManifest = Effect.fn("Files.renderNormalizeManifest")(function* (
  manifestPath: string,
  manifest: NormalizeManifest
): Effect.fn.Return<string, FilesCommandError, Path.Path | ChildProcessSpawner.ChildProcessSpawner> {
  const encoded = yield* encodeNormalizeManifest(manifest).pipe(
    Effect.mapError(
      (cause) =>
        new FilesCommandError({
          message: `Failed to encode normalize manifest for "${manifestPath}"`,
          cause,
        })
    )
  );

  return yield* renderBiomeJson(manifestPath, encoded).pipe(
    Effect.mapError(
      (cause) =>
        new FilesCommandError({
          message: `Failed to render normalize manifest for "${manifestPath}"`,
          cause,
        })
    )
  );
});

const archivedEntries = (
  entries: ReadonlyArray<ArchivePoorCandidatesEntry>
): ReadonlyArray<ArchivePoorCandidatesEntry> => A.filter(entries, (entry) => entry.decision === "archive");

const countMovedSidecars = (entries: ReadonlyArray<ArchivePoorCandidatesEntry>): number =>
  A.reduce(entries, 0, (count, entry) => count + A.length(entry.sidecars));

const makeArchivePoorCandidatesManifest = (plan: ArchivePoorCandidatesPlan): ArchivePoorCandidatesManifest =>
  new ArchivePoorCandidatesManifest({
    archiveDirectory: plan.archiveDirectory,
    entries: plan.entries,
    manifestPath: plan.manifestPath,
    options: plan.options,
    schemaVersion: "beep.files.archive-poor-candidates.v1",
    skipped: plan.skipped,
    sourceDirectory: plan.sourceDirectory,
    summary: new ArchivePoorCandidatesManifestSummary({
      archivedCount: A.length(archivedEntries(plan.entries)),
      assessedCount: A.length(plan.entries),
      keptCount: A.length(A.filter(plan.entries, (entry) => entry.decision === "keep")),
      movedSidecarCount: countMovedSidecars(plan.entries),
      skippedCount: A.length(plan.skipped),
    }),
  });

const renderArchivePoorCandidatesManifest = Effect.fn("Files.renderArchivePoorCandidatesManifest")(function* (
  manifestPath: string,
  manifest: ArchivePoorCandidatesManifest
): Effect.fn.Return<string, FilesCommandError, Path.Path | ChildProcessSpawner.ChildProcessSpawner> {
  const encoded = yield* encodeArchivePoorCandidatesManifest(manifest).pipe(
    Effect.mapError(
      (cause) =>
        new FilesCommandError({
          message: `Failed to encode archive manifest for "${manifestPath}"`,
          cause,
        })
    )
  );

  return yield* renderBiomeJson(manifestPath, encoded).pipe(
    Effect.mapError(
      (cause) =>
        new FilesCommandError({
          message: `Failed to render archive manifest for "${manifestPath}"`,
          cause,
        })
    )
  );
});

const renderDetectBordersReportJson = Effect.fn("Files.renderDetectBordersReportJson")(function* (
  report: DetectBordersReport
): Effect.fn.Return<string, FilesCommandError, Path.Path | ChildProcessSpawner.ChildProcessSpawner> {
  const encoded = yield* encodeDetectBordersReport(report).pipe(
    Effect.mapError(
      (cause) =>
        new FilesCommandError({
          message: "Failed to encode detect-borders report",
          cause,
        })
    )
  );

  return yield* renderBiomeJson("detect-borders-report.json", encoded).pipe(
    Effect.mapError(
      (cause) =>
        new FilesCommandError({
          message: "Failed to render detect-borders report",
          cause,
        })
    )
  );
});

const applyNormalizePlan = Effect.fn("Files.applyNormalizePlan")(function* (
  plan: NormalizePlan,
  maxLongEdge: O.Option<PositiveMediaDimension>,
  dedupe: boolean,
  overwrite: boolean
): Effect.fn.Return<
  NormalizeApplyResult,
  FilesCommandError,
  FileSystem.FileSystem | Path.Path | ChildProcessSpawner.ChildProcessSpawner
> {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;

  yield* fs
    .makeDirectory(plan.outputDirectory, { recursive: true })
    .pipe(
      Effect.mapError((cause) =>
        formatPlatformError("Failed to create normalize output directory", plan.outputDirectory, { cause })
      )
    );
  yield* fs
    .makeDirectory(path.dirname(plan.manifestPath), { recursive: true })
    .pipe(
      Effect.mapError((cause) =>
        formatPlatformError("Failed to create normalize manifest directory", plan.manifestPath, { cause })
      )
    );
  if (O.isSome(plan.duplicateDirectory)) {
    const duplicateDirectory = plan.duplicateDirectory.value;

    yield* fs.makeDirectory(duplicateDirectory, { recursive: true }).pipe(
      Effect.mapError((cause) =>
        formatPlatformError("Failed to create normalize duplicate move directory", duplicateDirectory, {
          cause,
        })
      )
    );
  }

  return yield* Effect.acquireUseRelease(
    fs
      .makeTempDirectory({ directory: plan.outputDirectory, prefix: ".beep-files-normalize-" })
      .pipe(
        Effect.mapError((cause) =>
          formatPlatformError("Failed to create temporary normalize directory", plan.outputDirectory, { cause })
        )
      ),
    (tempDir) =>
      Effect.gen(function* () {
        const tempEntries = A.map(plan.entries, (entry, index) => ({
          entry,
          tempPath: path.join(
            tempDir,
            `${formatIndex(index, `${A.length(plan.entries)}`.length + 1)}-${entry.outputName}`
          ),
        }));
        let completedEntries = A.empty<NormalizePlanEntry>();
        let duplicateMoves = A.empty<NormalizeDuplicateMove>();
        let duplicateSkippedEntries = A.empty<NormalizeSkippedEntry>();
        let duplicateMoveTargets = HashSet.empty<string>();
        let readyTempEntries = A.empty<{ readonly entry: NormalizePlanEntry; readonly tempPath: string }>();
        let seenOutputs = HashMap.empty<FileSha256Hash, ReadonlyArray<NormalizeSeenOutput>>();

        for (const { entry, tempPath } of tempEntries) {
          yield* normalizeImageToTemp(entry, tempPath, maxLongEdge);
          const outputStat = yield* fs
            .stat(tempPath)
            .pipe(
              Effect.mapError((cause) => formatPlatformError("Failed to stat normalized image", tempPath, { cause }))
            );
          const outputHash = dedupe ? O.some(yield* hashFileSha256(tempPath)) : O.none<FileSha256Hash>();
          const candidates = O.isSome(outputHash)
            ? pipe(HashMap.get(seenOutputs, outputHash.value), O.getOrElse(A.empty<NormalizeSeenOutput>))
            : A.empty<NormalizeSeenOutput>();
          const duplicate = O.isSome(outputHash)
            ? yield* findDuplicateOutput(candidates, tempPath)
            : O.none<NormalizeSeenOutput>();

          if (O.isSome(duplicate) && O.isSome(outputHash)) {
            const moveTarget = O.map(plan.duplicateDirectory, (duplicateDirectory) => {
              const targetPath = path.join(duplicateDirectory, entry.sourceName);

              return {
                path: targetPath,
                relativePath: path.relative(duplicateDirectory, targetPath),
              };
            });
            const skippedEntry = makeNormalizeDuplicateSkippedEntry(
              entry,
              outputHash.value,
              duplicate.value.entry,
              moveTarget
            );

            if (O.isSome(moveTarget)) {
              if (HashSet.has(duplicateMoveTargets, moveTarget.value.path)) {
                return yield* new FilesCommandError({
                  message: `Refusing duplicate normalize duplicate move target: "${moveTarget.value.path}"`,
                });
              }

              duplicateMoveTargets = HashSet.add(duplicateMoveTargets, moveTarget.value.path);
              yield* preflightOverwritableFile(moveTarget.value.path, overwrite, "duplicate source file");
              duplicateMoves = A.append(duplicateMoves, {
                sourcePath: entry.sourcePath,
                targetPath: moveTarget.value.path,
              });
            }

            duplicateSkippedEntries = A.append(duplicateSkippedEntries, skippedEntry);
            continue;
          }

          const completedEntry = withOutputMetadata(entry, `${outputStat.size}`, outputHash);
          completedEntries = A.append(completedEntries, completedEntry);
          readyTempEntries = A.append(readyTempEntries, { entry: completedEntry, tempPath });

          if (O.isSome(outputHash)) {
            seenOutputs = HashMap.set(
              seenOutputs,
              outputHash.value,
              A.append(candidates, { entry: completedEntry, outputHash: outputHash.value, tempPath })
            );
          }
        }

        const manifest = makeNormalizeManifest(plan, completedEntries, duplicateSkippedEntries);
        const manifestContent = yield* renderNormalizeManifest(plan.manifestPath, manifest);
        const tempManifestPath = path.join(tempDir, "normalize-manifest.json");
        yield* fs
          .writeFileString(tempManifestPath, manifestContent)
          .pipe(
            Effect.mapError((cause) =>
              formatPlatformError("Failed to write temporary normalize manifest", tempManifestPath, { cause })
            )
          );

        for (const { entry, tempPath } of readyTempEntries) {
          if (overwrite) {
            yield* fs.remove(entry.outputPath, { force: true }).pipe(Effect.ignore);
          }
          yield* renameOrFail(tempPath, entry.outputPath, tempDir);
        }

        for (const duplicateMove of duplicateMoves) {
          if (overwrite) {
            yield* fs.remove(duplicateMove.targetPath, { force: true }).pipe(Effect.ignore);
          }
          yield* renameOrFail(duplicateMove.sourcePath, duplicateMove.targetPath, tempDir);
        }

        if (overwrite) {
          yield* fs.remove(plan.manifestPath, { force: true }).pipe(Effect.ignore);
        }
        yield* renameOrFail(tempManifestPath, plan.manifestPath, tempDir);

        return { completedEntries, duplicateMoves, duplicateSkippedEntries };
      }),
    (tempDir) => fs.remove(tempDir, { recursive: true, force: true }).pipe(Effect.ignore)
  );
});

const applyArchivePoorCandidatesPlan = Effect.fn("Files.applyArchivePoorCandidatesPlan")(function* (
  plan: ArchivePoorCandidatesPlan,
  overwrite: boolean
): Effect.fn.Return<
  void,
  FilesCommandError,
  FileSystem.FileSystem | Path.Path | ChildProcessSpawner.ChildProcessSpawner
> {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;

  yield* fs
    .makeDirectory(plan.archiveDirectory, { recursive: true })
    .pipe(
      Effect.mapError((cause) =>
        formatPlatformError("Failed to create archive directory", plan.archiveDirectory, { cause })
      )
    );
  yield* fs
    .makeDirectory(path.dirname(plan.manifestPath), { recursive: true })
    .pipe(
      Effect.mapError((cause) =>
        formatPlatformError("Failed to create archive manifest directory", plan.manifestPath, { cause })
      )
    );

  return yield* Effect.acquireUseRelease(
    fs
      .makeTempDirectory({ directory: plan.archiveDirectory, prefix: ".beep-files-archive-poor-candidates-" })
      .pipe(
        Effect.mapError((cause) =>
          formatPlatformError("Failed to create temporary archive directory", plan.archiveDirectory, { cause })
        )
      ),
    (tempDir) =>
      Effect.gen(function* () {
        const manifest = makeArchivePoorCandidatesManifest(plan);
        const manifestContent = yield* renderArchivePoorCandidatesManifest(plan.manifestPath, manifest);
        const tempManifestPath = path.join(tempDir, "archive-poor-candidates-manifest.json");

        yield* fs
          .writeFileString(tempManifestPath, manifestContent)
          .pipe(
            Effect.mapError((cause) =>
              formatPlatformError("Failed to write temporary archive manifest", tempManifestPath, { cause })
            )
          );

        for (const entry of archivedEntries(plan.entries)) {
          const archivePath = O.fromUndefinedOr(entry.archivePath);

          if (O.isNone(archivePath)) {
            return yield* new FilesCommandError({
              message: `Missing archive target for selected source: "${entry.sourcePath}"`,
            });
          }

          if (overwrite) {
            yield* fs.remove(archivePath.value, { force: true }).pipe(Effect.ignore);
          }
          yield* renameOrFail(entry.sourcePath, archivePath.value, tempDir);

          for (const sidecar of entry.sidecars) {
            if (overwrite) {
              yield* fs.remove(sidecar.archivePath, { force: true }).pipe(Effect.ignore);
            }
            yield* renameOrFail(sidecar.sourcePath, sidecar.archivePath, tempDir);
          }
        }

        if (overwrite) {
          yield* fs.remove(plan.manifestPath, { force: true }).pipe(Effect.ignore);
        }
        yield* renameOrFail(tempManifestPath, plan.manifestPath, tempDir);
      }),
    (tempDir) => fs.remove(tempDir, { recursive: true, force: true }).pipe(Effect.ignore)
  );
});

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
  const width = `${A.length(collection.files)}`.length + 1;
  let index = 0;
  let plan = A.empty<RenamePlanEntry>();

  for (const file of collection.files) {
    const dimensions = withDimensions ? O.some(yield* probeMediaDimensions(file)) : O.none<MediaDimensions>();
    const targetName = targetNameForEntry(prefix, { dimensions, file, index, width });
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

const preflightTargetCollisions = Effect.fn("Files.preflightTargetCollisions")(function* (
  plan: ReadonlyArray<RenamePlanEntry>
): Effect.fn.Return<void, FilesCommandError, FileSystem.FileSystem> {
  const fs = yield* FileSystem.FileSystem;
  const selected = selectedCanonicalPathSet(plan);

  for (const entry of plan) {
    const exists = yield* fs
      .exists(entry.targetPath)
      .pipe(
        Effect.mapError((cause) => formatPlatformError("Failed to inspect target path", entry.targetPath, { cause }))
      );

    if (!exists) {
      continue;
    }

    const canonicalTarget = yield* fs
      .realPath(entry.targetPath)
      .pipe(
        Effect.mapError((cause) => formatPlatformError("Failed to resolve target path", entry.targetPath, { cause }))
      );

    if (!HashSet.has(selected, canonicalTarget)) {
      return yield* new FilesCommandError({
        message: `Refusing to overwrite existing target outside the rename set: "${entry.targetPath}"`,
      });
    }
  }
});

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
      Effect.mapError((cause) =>
        formatPlatformError("Failed to create temporary rename directory", directory, { cause })
      )
    );

  const tempEntries = A.map(plan, (entry) => ({
    entry,
    tempPath: path.join(tempDir, `${formatIndex(entry.index, `${A.length(plan)}`.length + 1)}-${entry.sourceName}`),
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
      Effect.mapError((cause) => formatPlatformError("Failed to remove temporary rename directory", tempDir, { cause }))
    );
});

const buildStripMetadataPlan = Effect.fn("Files.buildStripMetadataPlan")(function* (
  dir: string
): Effect.fn.Return<StripMetadataPlan, FilesCommandError, FileSystem.FileSystem | Path.Path> {
  const collection = yield* collectSortableFiles(dir, true);
  let entries = A.empty<StripMetadataPlanEntry>();
  let imageCount = 0;
  let skippedCount = collection.skippedCount;
  let videoCount = 0;

  for (const file of collection.files) {
    if (O.isNone(file.mediaKind)) {
      skippedCount += 1;
      continue;
    }

    const mediaKind: MediaKind = file.mediaKind.value;
    if (mediaKind === "image" && !isSupportedMetadataImageFile(file)) {
      skippedCount += 1;
      continue;
    }

    entries = A.append(
      entries,
      new StripMetadataPlanEntry({
        extension: file.extension,
        mediaKind,
        size: file.size,
        sourceName: file.name,
        sourcePath: file.sourcePath,
      })
    );

    if (mediaKind === "image") {
      imageCount += 1;
    } else {
      videoCount += 1;
    }
  }

  return new StripMetadataPlan({
    entries,
    imageCount,
    skippedCount,
    videoCount,
  });
});

const stripImageMetadataToTemp = Effect.fn("Files.stripImageMetadataToTemp")(function* (
  entry: StripMetadataPlanEntry,
  tempPath: string
): Effect.fn.Return<void, FilesCommandError> {
  yield* Effect.tryPromise({
    try: () => sharp(entry.sourcePath).rotate().toFile(tempPath),
    catch: (cause) =>
      new FilesCommandError({
        message: `Failed to normalize image metadata for "${entry.sourcePath}"`,
        cause,
      }),
  }).pipe(Effect.asVoid);
});

const cropImageBordersToTemp = Effect.fn("Files.cropImageBordersToTemp")(function* (
  entry: CropBordersPlanEntry,
  tempPath: string
): Effect.fn.Return<void, FilesCommandError> {
  yield* Effect.tryPromise({
    try: () =>
      sharp(entry.sourcePath)
        .rotate()
        .extract({
          height: entry.cropHeight,
          left: entry.cropLeft,
          top: entry.cropTop,
          width: entry.cropWidth,
        })
        .toFile(tempPath),
    catch: (cause) =>
      new FilesCommandError({
        message: `Failed to crop detected borders for "${entry.sourcePath}"`,
        cause,
      }),
  }).pipe(Effect.asVoid);
});

const runFfmpegStripMetadata = Effect.fn("Files.runFfmpegStripMetadata")(function* (
  entry: StripMetadataPlanEntry,
  tempPath: string
): Effect.fn.Return<string, FilesCommandError, Path.Path | ChildProcessSpawner.ChildProcessSpawner> {
  const path = yield* Path.Path;
  const command = ChildProcess.make(
    "ffmpeg",
    [
      "-hide_banner",
      "-nostdin",
      "-y",
      "-i",
      entry.sourcePath,
      "-map",
      "0",
      "-c",
      "copy",
      "-map_metadata",
      "-1",
      "-map_metadata:s",
      "-1",
      "-map_metadata:c",
      "-1",
      "-map_chapters",
      "-1",
      tempPath,
    ],
    {
      cwd: path.dirname(entry.sourcePath),
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
          message: `Failed to run ffmpeg for "${entry.sourcePath}". Install ffmpeg or remove videos from the selection.`,
          cause,
        })
    )
  );

  if (result.exitCode !== 0) {
    const detail = stringEquivalence(result.stderr, "") ? result.stdout : result.stderr;
    return yield* new FilesCommandError({
      message: `ffmpeg could not strip video metadata for "${entry.sourcePath}": ${detail}`,
    });
  }

  return result.stdout;
});

const stripVideoMetadataToTemp = Effect.fn("Files.stripVideoMetadataToTemp")(function* (
  entry: StripMetadataPlanEntry,
  tempPath: string
): Effect.fn.Return<void, FilesCommandError, Path.Path | ChildProcessSpawner.ChildProcessSpawner> {
  yield* runFfmpegStripMetadata(entry, tempPath);
});

const stripMetadataToTemp = Effect.fn("Files.stripMetadataToTemp")(function* (
  entry: StripMetadataPlanEntry,
  tempPath: string
): Effect.fn.Return<void, FilesCommandError, Path.Path | ChildProcessSpawner.ChildProcessSpawner> {
  if (entry.mediaKind === "image") {
    yield* stripImageMetadataToTemp(entry, tempPath);
    return;
  }

  yield* stripVideoMetadataToTemp(entry, tempPath);
});

const applyStripMetadataPlan = Effect.fn("Files.applyStripMetadataPlan")(function* (
  directory: string,
  plan: ReadonlyArray<StripMetadataPlanEntry>
): Effect.fn.Return<
  void,
  FilesCommandError,
  FileSystem.FileSystem | Path.Path | ChildProcessSpawner.ChildProcessSpawner
> {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;

  yield* Effect.acquireUseRelease(
    fs
      .makeTempDirectory({ directory, prefix: ".beep-files-strip-metadata-" })
      .pipe(
        Effect.mapError((cause) =>
          formatPlatformError("Failed to create temporary strip directory", directory, { cause })
        )
      ),
    (tempDir) =>
      Effect.gen(function* () {
        const tempEntries = makeStripMetadataTempEntries(tempDir, plan, path);

        for (const { entry, tempPath } of tempEntries) {
          yield* stripMetadataToTemp(entry, tempPath);
        }

        for (const { entry, tempPath } of tempEntries) {
          yield* renameOrFail(tempPath, entry.sourcePath, tempDir);
        }
      }),
    (tempDir) => fs.remove(tempDir, { recursive: true, force: true }).pipe(Effect.ignore)
  );
});

const applyCropBordersPlan = Effect.fn("Files.applyCropBordersPlan")(function* (
  directory: string,
  plan: ReadonlyArray<CropBordersPlanEntry>
): Effect.fn.Return<void, FilesCommandError, FileSystem.FileSystem | Path.Path> {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;

  yield* Effect.acquireUseRelease(
    fs
      .makeTempDirectory({ directory, prefix: ".beep-files-crop-borders-" })
      .pipe(
        Effect.mapError((cause) =>
          formatPlatformError("Failed to create temporary crop-borders directory", directory, { cause })
        )
      ),
    (tempDir) =>
      Effect.gen(function* () {
        const tempEntries = A.map(plan, (entry, index) => ({
          entry,
          tempPath: path.join(tempDir, `${formatIndex(index, `${A.length(plan)}`.length + 1)}-${entry.sourceName}`),
        }));

        for (const { entry, tempPath } of tempEntries) {
          yield* cropImageBordersToTemp(entry, tempPath);
        }

        for (const { entry, tempPath } of tempEntries) {
          yield* renameOrFail(tempPath, entry.sourcePath, tempDir);
        }
      }),
    (tempDir) => fs.remove(tempDir, { recursive: true, force: true }).pipe(Effect.ignore)
  );
});

const logStripMetadataPlan = Effect.fn("Files.logStripMetadataPlan")(function* (
  plan: ReadonlyArray<StripMetadataPlanEntry>
) {
  yield* Effect.forEach(plan, (entry) => Console.log(renderStripMetadataPlanEntry(entry)), {
    discard: true,
  });
});

const logNormalizePlan = Effect.fn("Files.logNormalizePlan")(function* (plan: NormalizePlan) {
  yield* Effect.forEach(plan.entries, (entry) => Console.log(renderNormalizePlanEntry(entry)), {
    discard: true,
  });
  yield* Effect.forEach(plan.skipped, (entry) => Console.log(renderNormalizeSkippedEntry(entry)), {
    discard: true,
  });
});

const logCreateCaptionFilesPlan = Effect.fn("Files.logCreateCaptionFilesPlan")(function* (
  plan: CreateCaptionFilesPlan
) {
  yield* Effect.forEach(plan.entries, (entry) => Console.log(renderCreateCaptionFilesPlanEntry(entry)), {
    discard: true,
  });
  yield* Effect.forEach(plan.skipped, (entry) => Console.log(renderCreateCaptionFilesSkippedEntry(entry)), {
    discard: true,
  });
});

const logArchivePoorCandidatesPlan = Effect.fn("Files.logArchivePoorCandidatesPlan")(function* (
  plan: ArchivePoorCandidatesPlan
) {
  yield* Effect.forEach(plan.entries, (entry) => Console.log(renderArchivePoorCandidatesEntry(entry)), {
    discard: true,
  });
  yield* Effect.forEach(plan.skipped, (entry) => Console.log(renderArchivePoorCandidatesSkippedEntry(entry)), {
    discard: true,
  });
});

const logDetectBordersEntries = Effect.fn("Files.logDetectBordersEntries")(function* (
  entries: ReadonlyArray<DetectBordersEntry>
) {
  const borderedEntries = A.filter(entries, (entry) => entry.hasBorder);
  yield* Effect.forEach(borderedEntries, (entry) => Console.log(renderDetectBordersEntry(entry)), {
    discard: true,
  });
});

const logCropBordersPlan = Effect.fn("Files.logCropBordersPlan")(function* (plan: ReadonlyArray<CropBordersPlanEntry>) {
  yield* Effect.forEach(plan, (entry) => Console.log(renderCropBordersPlanEntry(entry)), {
    discard: true,
  });
});

/**
 * Print the files command index.
 *
 * @category UseCase
 * @since 0.0.0
 */
export const printFilesIndex = Effect.fn("Files.printFilesIndex")(function* () {
  yield* Console.log("Files commands:");
  yield* Console.log("- bun run files sort-and-rename --prefix image --dir ./tmp");
  yield* Console.log("- bun run files sort-and-rename --prefix image --dir ./tmp --with-dimensions");
  yield* Console.log("- bun run files strip-metadata --dir ./tmp");
  yield* Console.log("- bun run files normalize --dir ./raw --out-dir ./dataset/images --format png");
  yield* Console.log("- bun run files normalize --dir ./raw --out-dir ./dataset/images --format png --dedupe");
  yield* Console.log("- bun run files create-captions --dir ./dataset/images");
  yield* Console.log("- bun run files archive-poor-candidates --dir ./dataset/images --archive-dir ./dataset/rejected");
  yield* Console.log("- bun run files detect-borders --dir ./tmp");
  yield* Console.log("- bun run files crop-borders --dir ./tmp --dry-run");
});

const createCaptionFilesImpl = Effect.fn("FilesCommandService.createCaptionFiles")(function* (
  options: CreateCaptionFilesOptions
): Effect.fn.Return<CreateCaptionFilesSummary, FilesCommandError, FilesCommandServiceRequirements> {
  const program = Effect.gen(function* () {
    const validatedOptions = yield* validateCreateCaptionFilesOptions(options);
    const plan = yield* buildCreateCaptionFilesPlan(validatedOptions);
    const plannedCount = A.length(plan.entries);
    const skippedCount = A.length(plan.skipped);
    const plannedOverwriteCount = A.length(A.filter(plan.entries, (entry) => entry.overwritesExisting));
    const plannedCreateCount = plannedCount - plannedOverwriteCount;

    yield* Console.log(
      `files create-captions: ${plannedCount} caption sidecar file(s) planned in "${plan.directory}".`
    );
    if (hasSkippedFiles(skippedCount)) {
      yield* Console.log(`files create-captions: skipped ${skippedCount} source entry(s).`);
    }
    yield* logCreateCaptionFilesPlan(plan);
    yield* Effect.logInfo({
      message: "files create-captions planned",
      plannedCount,
      plannedCreateCount,
      plannedOverwriteCount,
      skippedCount,
      directory: plan.directory,
    });

    if (validatedOptions.dryRun) {
      yield* Console.log("files create-captions: dry run; no caption files written.");
      return new CreateCaptionFilesSummary({
        createdCount: 0,
        directory: plan.directory,
        dryRun: true,
        overwrittenCount: 0,
        plannedCount,
        skippedCount,
      });
    }

    yield* applyCreateCaptionFilesPlan(plan);
    yield* Console.log(
      `files create-captions: created ${plannedCreateCount} caption sidecar file(s); overwritten ${plannedOverwriteCount} existing caption file(s).`
    );
    yield* Effect.logInfo({
      message: "files create-captions completed",
      createdCount: plannedCreateCount,
      overwrittenCount: plannedOverwriteCount,
      skippedCount,
      directory: plan.directory,
    });

    return new CreateCaptionFilesSummary({
      createdCount: plannedCreateCount,
      directory: plan.directory,
      dryRun: false,
      overwrittenCount: plannedOverwriteCount,
      plannedCount,
      skippedCount,
    });
  });

  return yield* profilePhase(program, {
    phase: "files.create-captions",
    attributes: {
      dryRun: `${options.dryRun}`,
      overwrite: `${options.overwrite}`,
    },
  });
});

const archivePoorCandidatesImpl = Effect.fn("FilesCommandService.archivePoorCandidates")(function* (
  options: ArchivePoorCandidatesOptions
): Effect.fn.Return<ArchivePoorCandidatesSummary, FilesCommandError, FilesCommandServiceRequirements> {
  const program = Effect.gen(function* () {
    const validatedOptions = yield* validateArchivePoorCandidatesOptions(options);
    const sidecarExtensions = yield* parseSidecarExtensions(validatedOptions.sidecars);
    const plan = yield* buildArchivePoorCandidatesPlan(validatedOptions, sidecarExtensions);
    const archiveEntries = archivedEntries(plan.entries);
    const archivedCount = A.length(archiveEntries);
    const assessedCount = A.length(plan.entries);
    const keptCount = A.length(A.filter(plan.entries, (entry) => entry.decision === "keep"));
    const movedSidecarCount = countMovedSidecars(plan.entries);
    const skippedCount = A.length(plan.skipped);

    yield* Console.log(
      `files archive-poor-candidates: ${assessedCount} image candidate(s) assessed in "${plan.sourceDirectory}"; ${archivedCount} poor candidate(s) planned for "${plan.archiveDirectory}".`
    );
    if (hasSkippedFiles(skippedCount)) {
      yield* Console.log(
        `files archive-poor-candidates: skipped ${skippedCount} unsupported or non-image source entry(s).`
      );
    }
    yield* logArchivePoorCandidatesPlan(plan);
    yield* Effect.logInfo({
      message: "files archive-poor-candidates planned",
      archivedCount,
      assessedCount,
      keptCount,
      movedSidecarCount,
      skippedCount,
      archiveDirectory: plan.archiveDirectory,
      manifestPath: plan.manifestPath,
    });

    if (validatedOptions.dryRun) {
      yield* Console.log("files archive-poor-candidates: dry run; no files moved.");
      return new ArchivePoorCandidatesSummary({
        archivedCount,
        archiveDirectory: plan.archiveDirectory,
        assessedCount,
        directory: plan.sourceDirectory,
        dryRun: true,
        keptCount,
        manifestPath: plan.manifestPath,
        manifestWritten: false,
        movedSidecarCount,
        skippedCount,
      });
    }

    yield* preflightArchivePoorCandidatesOutputs(plan, validatedOptions.overwrite);
    yield* applyArchivePoorCandidatesPlan(plan, validatedOptions.overwrite);
    yield* Console.log(
      `files archive-poor-candidates: archived ${archivedCount} image candidate(s) with ${movedSidecarCount} sidecar file(s); manifest written to "${plan.manifestPath}".`
    );
    yield* Effect.logInfo({
      message: "files archive-poor-candidates completed",
      archivedCount,
      assessedCount,
      keptCount,
      movedSidecarCount,
      skippedCount,
      archiveDirectory: plan.archiveDirectory,
      manifestPath: plan.manifestPath,
    });

    return new ArchivePoorCandidatesSummary({
      archivedCount,
      archiveDirectory: plan.archiveDirectory,
      assessedCount,
      directory: plan.sourceDirectory,
      dryRun: false,
      keptCount,
      manifestPath: plan.manifestPath,
      manifestWritten: true,
      movedSidecarCount,
      skippedCount,
    });
  });

  return yield* profilePhase(program, {
    phase: "files.archive-poor-candidates",
    attributes: {
      dryRun: `${options.dryRun}`,
      maxAspect: `${options.maxAspect}`,
      maxUpscale: `${options.maxUpscale}`,
      minShortEdge: `${options.minShortEdge}`,
      profile: options.profile,
      targetResolution: `${options.targetResolution}`,
    },
  });
});

const cropBordersFilesImpl = Effect.fn("FilesCommandService.cropBordersFiles")(function* (
  options: CropBordersOptions
): Effect.fn.Return<CropBordersSummary, FilesCommandError, FilesCommandServiceRequirements> {
  const program = Effect.gen(function* () {
    const plan = yield* buildCropBordersPlan(options);
    const plannedCount = A.length(plan.entries);

    if (!A.isReadonlyArrayNonEmpty(plan.entries)) {
      yield* Console.log(
        `files crop-borders: 0 bordered image(s) planned in "${plan.directory}" (${plan.analyzedCount} analyzed, ${plan.skippedCount} skipped).`
      );
      return new CropBordersSummary({
        analyzedCount: plan.analyzedCount,
        borderedCount: plan.borderedCount,
        croppedCount: 0,
        directory: plan.directory,
        dryRun: options.dryRun,
        plannedCount: 0,
        skippedCount: plan.skippedCount,
      });
    }

    yield* Console.log(
      `files crop-borders: ${plannedCount} bordered image(s) planned in "${plan.directory}" (${plan.analyzedCount} analyzed, ${plan.skippedCount} skipped).`
    );
    yield* logCropBordersPlan(plan.entries);
    yield* Effect.logInfo({
      message: "files crop-borders planned",
      plannedCount,
      analyzedCount: plan.analyzedCount,
      borderedCount: plan.borderedCount,
      skippedCount: plan.skippedCount,
      directory: plan.directory,
    });

    if (options.dryRun) {
      yield* Console.log("files crop-borders: dry run; no files rewritten.");
      return new CropBordersSummary({
        analyzedCount: plan.analyzedCount,
        borderedCount: plan.borderedCount,
        croppedCount: 0,
        directory: plan.directory,
        dryRun: true,
        plannedCount,
        skippedCount: plan.skippedCount,
      });
    }

    yield* applyCropBordersPlan(plan.directory, plan.entries);
    yield* Console.log(`files crop-borders: cropped ${plannedCount} image file(s).`);
    yield* Effect.logInfo({
      message: "files crop-borders completed",
      croppedCount: plannedCount,
      skippedCount: plan.skippedCount,
      directory: plan.directory,
    });

    return new CropBordersSummary({
      analyzedCount: plan.analyzedCount,
      borderedCount: plan.borderedCount,
      croppedCount: plannedCount,
      directory: plan.directory,
      dryRun: false,
      plannedCount,
      skippedCount: plan.skippedCount,
    });
  });

  return yield* profilePhase(program, {
    phase: "files.crop-borders",
    attributes: {
      dryRun: `${options.dryRun}`,
      tolerance: `${options.tolerance}`,
      minSolidPct: `${options.minSolidPct}`,
      minWidthPct: `${options.minWidthPct}`,
      maxScanPct: `${options.maxScanPct}`,
    },
  });
});

const detectBordersFilesImpl = Effect.fn("FilesCommandService.detectBordersFiles")(function* (
  options: DetectBordersOptions
): Effect.fn.Return<DetectBordersReport, FilesCommandError, FilesCommandServiceRequirements> {
  const program = Effect.gen(function* () {
    const validatedOptions = yield* validateDetectBordersOptions(options);
    const collection = yield* collectDetectBordersFiles(validatedOptions.dir);
    let entries = A.empty<DetectBordersEntry>();
    let skipped = collection.skipped;

    for (const file of collection.files) {
      const result = yield* analyzeDetectBordersFile(file, validatedOptions).pipe(Effect.result);

      if (Result.isFailure(result)) {
        skipped = A.append(
          skipped,
          makeDetectBordersSkippedEntry(
            file.name,
            file.sourcePath,
            O.some(file.extension),
            "unreadable-image",
            result.failure.message
          )
        );
        continue;
      }

      entries = A.append(entries, result.success);
    }

    const borderedCount = A.length(A.filter(entries, (entry) => entry.hasBorder));
    const skippedCount = A.length(skipped);
    const summary = new DetectBordersSummary({
      analyzedCount: A.length(entries),
      borderedCount,
      directory: collection.directory,
      skippedCount,
      totalCount: A.length(entries) + skippedCount,
    });
    const report = new DetectBordersReport({
      directory: collection.directory,
      entries,
      options: validatedOptions,
      schemaVersion: "beep.files.detect-borders.v1",
      skipped: A.sort(
        skipped,
        Order.mapInput(Order.String, (entry: DetectBordersSkippedEntry) => entry.sourceName)
      ),
      summary,
    });

    if (validatedOptions.json) {
      const rendered = yield* renderDetectBordersReportJson(report);
      yield* Console.log(Str.trimEnd(rendered));
      return report;
    }

    yield* Effect.logInfo({
      message: "files detect-borders completed",
      analyzedCount: summary.analyzedCount,
      borderedCount: summary.borderedCount,
      skippedCount: summary.skippedCount,
      directory: collection.directory,
    });

    yield* Console.log(
      `files detect-borders: ${summary.borderedCount} bordered image(s) found in "${collection.directory}" (${summary.analyzedCount} analyzed, ${summary.skippedCount} skipped).`
    );
    yield* logDetectBordersEntries(entries);

    return report;
  });

  if (options.json) {
    return yield* program;
  }

  return yield* profilePhase(program, {
    phase: "files.detect-borders",
    attributes: {
      json: `${options.json}`,
      tolerance: `${options.tolerance}`,
      minSolidPct: `${options.minSolidPct}`,
      minWidthPct: `${options.minWidthPct}`,
      maxScanPct: `${options.maxScanPct}`,
    },
  });
});

const normalizeFilesImpl = Effect.fn("FilesCommandService.normalizeFiles")(function* (
  options: NormalizeFilesOptions
): Effect.fn.Return<NormalizeSummary, FilesCommandError, FilesCommandServiceRequirements> {
  const program = Effect.gen(function* () {
    const maxLongEdge = yield* validateNormalizeMaxLongEdge(options.maxLongEdge);
    const dedupe = options.dedupe || O.isSome(options.moveDuplicatesTo);
    const validatedOptions = new NormalizeFilesOptions({
      dedupe,
      dir: options.dir,
      dryRun: options.dryRun,
      format: options.format,
      manifest: options.manifest,
      maxLongEdge,
      moveDuplicatesTo: options.moveDuplicatesTo,
      outDir: options.outDir,
      overwrite: options.overwrite,
    });
    const plan = yield* buildNormalizePlan(validatedOptions);
    const plannedCount = A.length(plan.entries);
    const skippedCount = A.length(plan.skipped);
    const resizedCount = A.length(A.filter(plan.entries, (entry) => entry.resized));

    yield* Console.log(
      `files normalize: ${plannedCount} image file(s) planned from "${plan.sourceDirectory}" to "${plan.outputDirectory}".`
    );
    if (hasSkippedFiles(skippedCount)) {
      yield* Console.log(`files normalize: skipped ${skippedCount} unsupported or non-image source entry(s).`);
    }
    yield* logNormalizePlan(plan);
    yield* Effect.logInfo({
      message: "files normalize planned",
      plannedCount,
      skippedCount,
      resizedCount,
      duplicateDirectory: pipe(
        plan.duplicateDirectory,
        O.getOrElse(() => "none")
      ),
      outputDirectory: plan.outputDirectory,
      manifestPath: plan.manifestPath,
    });

    if (options.dryRun) {
      yield* Console.log("files normalize: dry run; no files written.");
      return new NormalizeSummary({
        directory: plan.sourceDirectory,
        duplicateCount: 0,
        dryRun: true,
        format: options.format,
        manifestPath: plan.manifestPath,
        manifestWritten: false,
        maxLongEdge,
        movedDuplicateCount: 0,
        normalizedCount: 0,
        outputDirectory: plan.outputDirectory,
        plannedCount,
        resizedCount,
        skippedCount,
      });
    }

    yield* preflightNormalizeOutputs(plan, options.overwrite);
    const applyResult = yield* applyNormalizePlan(plan, maxLongEdge, validatedOptions.dedupe, options.overwrite);
    const completedEntries = applyResult.completedEntries;
    const duplicateCount = A.length(applyResult.duplicateSkippedEntries);
    const movedDuplicateCount = A.length(applyResult.duplicateMoves);
    const completedResizedCount = A.length(A.filter(completedEntries, (entry) => entry.resized));
    yield* Console.log(
      `files normalize: normalized ${A.length(completedEntries)} image file(s); skipped ${duplicateCount} duplicate image(s); moved ${movedDuplicateCount} duplicate source file(s); manifest written to "${plan.manifestPath}".`
    );
    yield* Effect.logInfo({
      message: "files normalize completed",
      duplicateCount,
      movedDuplicateCount,
      normalizedCount: A.length(completedEntries),
      skippedCount: skippedCount + duplicateCount,
      resizedCount: completedResizedCount,
      outputDirectory: plan.outputDirectory,
      manifestPath: plan.manifestPath,
    });

    return new NormalizeSummary({
      directory: plan.sourceDirectory,
      duplicateCount,
      dryRun: false,
      format: options.format,
      manifestPath: plan.manifestPath,
      manifestWritten: true,
      maxLongEdge,
      movedDuplicateCount,
      normalizedCount: A.length(completedEntries),
      outputDirectory: plan.outputDirectory,
      plannedCount,
      resizedCount: completedResizedCount,
      skippedCount: skippedCount + duplicateCount,
    });
  });

  return yield* profilePhase(program, {
    phase: "files.normalize",
    attributes: {
      format: options.format,
      dryRun: `${options.dryRun}`,
      dedupe: `${options.dedupe || O.isSome(options.moveDuplicatesTo)}`,
      moveDuplicatesTo: pipe(
        options.moveDuplicatesTo,
        O.getOrElse(() => "none")
      ),
      overwrite: `${options.overwrite}`,
    },
  });
});

const sortAndRenameFilesImpl = Effect.fn("FilesCommandService.sortAndRenameFiles")(function* (
  dir: string,
  prefix: string,
  dryRun: boolean,
  withDimensions = false
): Effect.fn.Return<SortAndRenameSummary, FilesCommandError, FilesCommandServiceRequirements> {
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

const stripMetadataFilesImpl = Effect.fn("FilesCommandService.stripMetadataFiles")(function* (
  dir: string,
  dryRun: boolean
): Effect.fn.Return<StripMetadataSummary, FilesCommandError, FilesCommandServiceRequirements> {
  const { directory } = yield* validateDirectory(dir);
  const plan = yield* buildStripMetadataPlan(directory);
  const entries = plan.entries;

  if (!A.isReadonlyArrayNonEmpty(entries)) {
    yield* Console.log(`files strip-metadata: 0 media file(s) in "${directory}"; nothing to strip.`);
    if (hasSkippedFiles(plan.skippedCount)) {
      yield* Console.log(`files strip-metadata: skipped ${plan.skippedCount} unsupported or non-media file(s).`);
    }
    return new StripMetadataSummary({
      directory,
      dryRun,
      imageCount: plan.imageCount,
      plannedCount: 0,
      skippedCount: plan.skippedCount,
      strippedCount: 0,
      videoCount: plan.videoCount,
    });
  }

  yield* Console.log(`files strip-metadata: ${A.length(entries)} media file(s) planned in "${directory}".`);
  if (hasSkippedFiles(plan.skippedCount)) {
    yield* Console.log(`files strip-metadata: skipped ${plan.skippedCount} unsupported or non-media file(s).`);
  }
  yield* logStripMetadataPlan(entries);

  if (dryRun) {
    yield* Console.log("files strip-metadata: dry run; no files rewritten.");
    return new StripMetadataSummary({
      directory,
      dryRun,
      imageCount: plan.imageCount,
      plannedCount: A.length(entries),
      skippedCount: plan.skippedCount,
      strippedCount: 0,
      videoCount: plan.videoCount,
    });
  }

  yield* applyStripMetadataPlan(directory, entries);
  yield* Console.log(
    `files strip-metadata: stripped ${A.length(entries)} media file(s) (${plan.imageCount} image, ${plan.videoCount} video).`
  );

  return new StripMetadataSummary({
    directory,
    dryRun,
    imageCount: plan.imageCount,
    plannedCount: A.length(entries),
    skippedCount: plan.skippedCount,
    strippedCount: A.length(entries),
    videoCount: plan.videoCount,
  });
});

const makeFilesCommandService = Effect.fn("FilesCommandService.make")(function* () {
  const runtimeContext = yield* Effect.context<FilesCommandServiceRequirements>();

  return FilesCommandService.of({
    archivePoorCandidates: Effect.fn("FilesCommandService.archivePoorCandidates")((options) =>
      archivePoorCandidatesImpl(options).pipe(Effect.provide(runtimeContext))
    ),
    createCaptionFiles: Effect.fn("FilesCommandService.createCaptionFiles")((options) =>
      createCaptionFilesImpl(options).pipe(Effect.provide(runtimeContext))
    ),
    cropBordersFiles: Effect.fn("FilesCommandService.cropBordersFiles")((options) =>
      cropBordersFilesImpl(options).pipe(Effect.provide(runtimeContext))
    ),
    detectBordersFiles: Effect.fn("FilesCommandService.detectBordersFiles")((options) =>
      detectBordersFilesImpl(options).pipe(Effect.provide(runtimeContext))
    ),
    normalizeFiles: Effect.fn("FilesCommandService.normalizeFiles")((options) =>
      normalizeFilesImpl(options).pipe(Effect.provide(runtimeContext))
    ),
    sortAndRenameFiles: Effect.fn("FilesCommandService.sortAndRenameFiles")(
      (dir, prefix, dryRun, withDimensions = false) =>
        sortAndRenameFilesImpl(dir, prefix, dryRun, withDimensions).pipe(Effect.provide(runtimeContext))
    ),
    stripMetadataFiles: Effect.fn("FilesCommandService.stripMetadataFiles")((dir, dryRun) =>
      stripMetadataFilesImpl(dir, dryRun).pipe(Effect.provide(runtimeContext))
    ),
  });
});

/**
 * Live service layer for dataset file curation operations.
 *
 * @category layers
 * @since 0.0.0
 */
export const FilesCommandServiceLive: Layer.Layer<FilesCommandService, never, FilesCommandServiceRequirements> =
  Layer.effect(FilesCommandService, makeFilesCommandService());

/**
 * Archive obvious poor image candidates out of a dataset directory.
 *
 * @param options - Candidate archival options.
 * @returns Summary counts for the operation.
 * @category UseCase
 * @since 0.0.0
 */
export const archivePoorCandidates = Effect.fn("Files.archivePoorCandidates")(function* (
  options: ArchivePoorCandidatesOptions
): Effect.fn.Return<ArchivePoorCandidatesSummary, FilesCommandError, FilesCommandService> {
  const files = yield* FilesCommandService;
  return yield* files.archivePoorCandidates(options);
});

/**
 * Create same-stem caption sidecar files for direct image files.
 *
 * @param options - Caption sidecar creation options.
 * @returns Summary counts for the operation.
 * @category UseCase
 * @since 0.0.0
 */
export const createCaptionFiles = Effect.fn("Files.createCaptionFiles")(function* (
  options: CreateCaptionFilesOptions
): Effect.fn.Return<CreateCaptionFilesSummary, FilesCommandError, FilesCommandService> {
  const files = yield* FilesCommandService;
  return yield* files.createCaptionFiles(options);
});

/**
 * Crop solid or near-solid borders from direct image files.
 *
 * @param options - Border crop options.
 * @returns Summary counts for the operation.
 * @category UseCase
 * @since 0.0.0
 */
export const cropBordersFiles = Effect.fn("Files.cropBordersFiles")(function* (
  options: CropBordersOptions
): Effect.fn.Return<CropBordersSummary, FilesCommandError, FilesCommandService> {
  const files = yield* FilesCommandService;
  return yield* files.cropBordersFiles(options);
});

/**
 * Detect solid or near-solid borders in direct image files.
 *
 * @param options - Border detection options.
 * @returns JSON-safe detection report.
 * @category UseCase
 * @since 0.0.0
 */
export const detectBordersFiles = Effect.fn("Files.detectBordersFiles")(function* (
  options: DetectBordersOptions
): Effect.fn.Return<DetectBordersReport, FilesCommandError, FilesCommandService> {
  const files = yield* FilesCommandService;
  return yield* files.detectBordersFiles(options);
});

/**
 * Normalize direct image files into an output directory and write a transform manifest.
 *
 * @param options - Normalization options.
 * @returns Summary counts for the operation.
 * @category UseCase
 * @since 0.0.0
 */
export const normalizeFiles = Effect.fn("Files.normalizeFiles")(function* (
  options: NormalizeFilesOptions
): Effect.fn.Return<NormalizeSummary, FilesCommandError, FilesCommandService> {
  const files = yield* FilesCommandService;
  return yield* files.normalizeFiles(options);
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
): Effect.fn.Return<SortAndRenameSummary, FilesCommandError, FilesCommandService> {
  const files = yield* FilesCommandService;
  return yield* files.sortAndRenameFiles(dir, prefix, dryRun, withDimensions);
});

/**
 * Strip user-authored metadata from direct image and video files in a directory.
 * Unless `dryRun` is true, selected files are rewritten in place.
 *
 * @param dir - Directory whose direct media files should be stripped.
 * @param dryRun - Whether to print the plan without applying it.
 * @returns Summary counts for the operation.
 * @example
 * ```ts
 * import { stripMetadataFiles } from "@beep/repo-cli/commands/Files/index"
 *
 * const program = stripMetadataFiles("./tmp", true)
 * void program
 * ```
 * @category UseCase
 * @since 0.0.0
 */
export const stripMetadataFiles = Effect.fn("Files.stripMetadataFiles")(function* (
  dir: string,
  dryRun: boolean
): Effect.fn.Return<StripMetadataSummary, FilesCommandError, FilesCommandService> {
  const files = yield* FilesCommandService;
  return yield* files.stripMetadataFiles(dir, dryRun);
});
