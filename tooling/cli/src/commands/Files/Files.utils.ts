/**
 * Reusable utilities for dataset file curation commands.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { ImageFileExtension, VideoFileExtension } from "@beep/schema";
import { Effect, HashSet, Order, type Path, pipe, Stream } from "effect";
import * as A from "effect/Array";
import { dual } from "effect/Function";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import {
  type ArchivePoorCandidatesEntry,
  type ArchivePoorCandidatesSkippedEntry,
  type BorderDetectionKind,
  type BorderDetectionMaxScanPercentage,
  type BorderDetectionPercentage,
  type BorderDetectionTolerance,
  type BorderSide,
  CandidateAssessmentMetrics,
  type CandidateAssessmentReason,
  type CreateCaptionFilesPlanEntry,
  type CreateCaptionFilesSkippedEntry,
  CropBordersPlanEntry,
  DetectBorderSideMeasurement,
  type DetectBordersEntry,
  type DetectBordersSkippedEntry,
  decodeRotationNumber,
  type FfprobeStream,
  MediaDimensions,
  type MediaKind,
  type NormalizeImageFormat,
  type NormalizePlanEntry,
  type NormalizeSkippedEntry,
  type RenamePlanEntry,
  RgbColor,
  type SafeFilePrefix,
  type SortableFile,
  type StripMetadataPlanEntry,
  SupportedMetadataImageExtension,
} from "./Files.schemas.js";

interface TargetNameForEntryOptions {
  readonly dimensions: O.Option<MediaDimensions>;
  readonly file: SortableFile;
  readonly index: number;
  readonly width: number;
}

interface StripMetadataTempEntry {
  readonly entry: StripMetadataPlanEntry;
  readonly tempPath: string;
}

interface RawImagePixelData {
  readonly channels: number;
  readonly data: Uint8Array;
  readonly height: number;
  readonly width: number;
}

interface BorderDetectionThresholds {
  readonly maxScanPct: BorderDetectionMaxScanPercentage;
  readonly minSolidPct: BorderDetectionPercentage;
  readonly minWidthPct: BorderDetectionPercentage;
  readonly tolerance: BorderDetectionTolerance;
}

interface BorderLineStats {
  readonly averageDistance: number;
  readonly solidPct: number;
}

interface CandidateAssessmentThresholds {
  readonly maxAspect: number;
  readonly maxUpscale: number;
  readonly minShortEdge: number;
  readonly targetResolution: number;
}

interface CandidateAssessmentResult {
  readonly decision: "archive" | "keep";
  readonly metrics: CandidateAssessmentMetrics;
  readonly reasons: ReadonlyArray<CandidateAssessmentReason>;
}

const borderSides: ReadonlyArray<BorderSide> = ["top", "right", "bottom", "left"];

const byteAt = (data: Uint8Array, index: number): number => data[index] ?? 0;

const roundMetric = (value: number): number => Math.round(value * 10_000) / 10_000;

const channelToHex = (channel: number): string => pipe(channel.toString(16), Str.padStart(2, "0"));

const pixelOffset = (image: RawImagePixelData, x: number, y: number): number => (y * image.width + x) * image.channels;

const medianChannel = (values: ReadonlyArray<number>): number =>
  pipe(
    values,
    A.sort(Order.Number),
    A.get(Math.floor(A.length(values) / 2)),
    O.getOrElse(() => 0),
    Math.round
  );

const sampleAxisLength = (image: RawImagePixelData, side: BorderSide): number =>
  side === "left" || side === "right" ? image.width : image.height;

const scanLineLength = (image: RawImagePixelData, side: BorderSide): number =>
  side === "left" || side === "right" ? image.height : image.width;

const sampleBorderColor = (image: RawImagePixelData, side: BorderSide, sampleWidth: number): RgbColor => {
  const red: number[] = [];
  const green: number[] = [];
  const blue: number[] = [];
  const axisLimit = Math.min(sampleWidth, sampleAxisLength(image, side));
  const lineLimit = scanLineLength(image, side);

  for (let axis = 0; axis < axisLimit; axis += 1) {
    for (let line = 0; line < lineLimit; line += 1) {
      const x = side === "left" ? axis : side === "right" ? image.width - 1 - axis : line;
      const y = side === "top" ? axis : side === "bottom" ? image.height - 1 - axis : line;
      const offset = pixelOffset(image, x, y);

      red.push(byteAt(image.data, offset));
      green.push(byteAt(image.data, offset + 1));
      blue.push(byteAt(image.data, offset + 2));
    }
  }

  return new RgbColor({
    b: medianChannel(blue),
    g: medianChannel(green),
    r: medianChannel(red),
  });
};

const borderLineStats = (
  image: RawImagePixelData,
  side: BorderSide,
  offsetFromEdge: number,
  edgeColor: RgbColor,
  tolerance: BorderDetectionTolerance
): BorderLineStats => {
  const length = scanLineLength(image, side);
  let matched = 0;
  let distanceSum = 0;

  for (let line = 0; line < length; line += 1) {
    const x = side === "left" ? offsetFromEdge : side === "right" ? image.width - 1 - offsetFromEdge : line;
    const y = side === "top" ? offsetFromEdge : side === "bottom" ? image.height - 1 - offsetFromEdge : line;
    const pixel = pixelOffset(image, x, y);
    const distance = Math.max(
      Math.abs(byteAt(image.data, pixel) - edgeColor.r),
      Math.abs(byteAt(image.data, pixel + 1) - edgeColor.g),
      Math.abs(byteAt(image.data, pixel + 2) - edgeColor.b)
    );

    if (distance <= tolerance) {
      matched += 1;
    }
    distanceSum += distance;
  }

  return {
    averageDistance: distanceSum / length,
    solidPct: (matched / length) * 100,
  };
};

const scanBorderSide = (
  image: RawImagePixelData,
  side: BorderSide,
  thresholds: BorderDetectionThresholds
): DetectBorderSideMeasurement => {
  const axisLength = sampleAxisLength(image, side);
  const minWidthPx = Math.max(1, Math.ceil((axisLength * thresholds.minWidthPct) / 100));
  const maxScanPx = Math.max(1, Math.floor((axisLength * thresholds.maxScanPct) / 100));
  const edgeColor = sampleBorderColor(image, side, 5);
  let acceptedWidth = 0;
  let score = 1;

  for (let offset = 0; offset < maxScanPx; offset += 1) {
    const stats = borderLineStats(image, side, offset, edgeColor, thresholds.tolerance);
    const withinAverageDistance =
      thresholds.tolerance === 0 ? stats.averageDistance === 0 : stats.averageDistance <= thresholds.tolerance / 2;

    if (stats.solidPct < thresholds.minSolidPct || !withinAverageDistance) {
      break;
    }

    acceptedWidth = offset + 1;
    score = Math.min(score, stats.solidPct / 100);
  }

  const matched = acceptedWidth >= minWidthPx;
  const widthPx = matched ? acceptedWidth : 0;

  return new DetectBorderSideMeasurement({
    color: edgeColor,
    colorHex: rgbToHex(edgeColor),
    matched,
    score: matched ? roundMetric(score) : 0,
    side,
    widthPct: matched ? roundMetric((widthPx / axisLength) * 100) : 0,
    widthPx,
  });
};

/**
 * Schema-derived string equivalence.
 *
 * @category utilities
 * @since 0.0.0
 */
export const stringEquivalence = S.toEquivalence(S.String);

/**
 * Schema-derived image extension guard.
 *
 * @category utilities
 * @since 0.0.0
 */
export const isImageFileExtension = S.is(ImageFileExtension);

/**
 * Schema-derived video extension guard.
 *
 * @category utilities
 * @since 0.0.0
 */
export const isVideoFileExtension = S.is(VideoFileExtension);

/**
 * Schema-derived metadata-strip image extension guard.
 *
 * @category utilities
 * @since 0.0.0
 */
export const isSupportedMetadataImageExtension = S.is(SupportedMetadataImageExtension);

/**
 * Order regular files by size descending, then name ascending.
 *
 * @category utilities
 * @since 0.0.0
 */
export const bySizeDescendingThenNameAscending: Order.Order<SortableFile> = Order.combine(
  Order.flip(Order.mapInput(Order.BigInt, (file: SortableFile) => file.size)),
  Order.mapInput(Order.String, (file: SortableFile) => file.name)
);

/**
 * Order regular files by name ascending.
 *
 * @category utilities
 * @since 0.0.0
 */
export const byNameAscending: Order.Order<SortableFile> = Order.mapInput(
  Order.String,
  (file: SortableFile) => file.name
);

/**
 * Normalize a file extension to a lowercase bare extension.
 *
 * @param extension - File extension with or without a leading dot.
 * @returns Lowercase extension without a leading dot.
 * @category utilities
 * @since 0.0.0
 */
export const normalizeBareExtension = (extension: string): string =>
  pipe(extension, Str.replace(/^\./, ""), Str.toLowerCase);

/**
 * Resolve a media kind from a file extension.
 *
 * @param extension - File extension with or without a leading dot.
 * @returns Optional media kind for recognized image or video extensions.
 * @category utilities
 * @since 0.0.0
 */
export const mediaKindFromExtension = (extension: string): O.Option<MediaKind> => {
  const bareExtension = normalizeBareExtension(extension);

  if (isImageFileExtension(bareExtension)) {
    return O.some("image");
  }

  if (isVideoFileExtension(bareExtension)) {
    return O.some("video");
  }

  return O.none();
};

/**
 * Format a zero-padded numeric index.
 *
 * @param index - Numeric index to format.
 * @param width - Minimum output width.
 * @returns Zero-padded index text.
 * @category utilities
 * @since 0.0.0
 */
export const formatIndex: {
  (width: number): (index: number) => string;
  (index: number, width: number): string;
} = dual(2, (index: number, width: number): string => pipe(`${index}`, Str.padStart(width, "0")));

/**
 * Collect a byte stream into trimmed text.
 *
 * @param stream - Byte stream to decode.
 * @returns Decoded trimmed text effect.
 * @category utilities
 * @since 0.0.0
 */
export const collectText = <E>(stream: Stream.Stream<Uint8Array, E>) =>
  stream.pipe(
    Stream.decodeText(),
    Stream.runFold(
      () => "",
      (acc, chunk) => `${acc}${chunk}`
    ),
    Effect.map(Str.trim)
  );

/**
 * Check whether an EXIF orientation value implies a quarter-turn image.
 *
 * @param orientation - EXIF orientation value.
 * @returns Whether dimensions should be swapped.
 * @category utilities
 * @since 0.0.0
 */
export const isExifOrientationRotated = (orientation: number): boolean => A.contains([5, 6, 7, 8], orientation);

/**
 * Check whether a video rotation value implies a quarter-turn image.
 *
 * @param rotation - Rotation degrees.
 * @returns Whether dimensions should be swapped.
 * @category utilities
 * @since 0.0.0
 */
export const isQuarterTurnRotation = (rotation: number): boolean => {
  const normalized = ((rotation % 360) + 360) % 360;
  return normalized === 90 || normalized === 270;
};

/**
 * Swap dimensions when a media orientation requires it.
 *
 * @param dimensions - Original media dimensions.
 * @param swap - Whether to swap width and height.
 * @returns Original or swapped dimensions.
 * @category utilities
 * @since 0.0.0
 */
export const maybeSwapDimensions: {
  (swap: boolean): (dimensions: MediaDimensions) => MediaDimensions;
  (dimensions: MediaDimensions, swap: boolean): MediaDimensions;
} = dual(
  2,
  (dimensions: MediaDimensions, swap: boolean): MediaDimensions =>
    swap
      ? new MediaDimensions({
          height: dimensions.width,
          width: dimensions.height,
        })
      : dimensions
);

/**
 * Resolve rotation metadata from an ffprobe stream.
 *
 * @param stream - ffprobe stream metadata.
 * @returns Optional rotation value.
 * @category utilities
 * @since 0.0.0
 */
export const rotationFromStream = (stream: FfprobeStream): O.Option<number> => {
  const sideDataRotation = pipe(
    O.fromUndefinedOr(stream.side_data_list),
    O.flatMap(A.findFirst((sideData) => O.isSome(O.fromUndefinedOr(sideData.rotation)))),
    O.flatMap((sideData) => O.fromUndefinedOr(sideData.rotation)),
    O.flatMap(decodeRotationNumber)
  );
  const tagRotation = pipe(O.fromUndefinedOr(stream.tags), O.flatMap(R.get("rotate")), O.flatMap(decodeRotationNumber));

  return O.orElse(sideDataRotation, () => tagRotation);
};

/**
 * Build a generated filename for a planned rename.
 *
 * @param prefix - Safe generated filename prefix.
 * @param options - Source file, index, width, and optional probed dimensions.
 * @returns Generated target name.
 * @category utilities
 * @since 0.0.0
 */
export const targetNameForEntry: {
  (options: TargetNameForEntryOptions): (prefix: SafeFilePrefix) => string;
  (prefix: SafeFilePrefix, options: TargetNameForEntryOptions): string;
} = dual(2, (prefix: SafeFilePrefix, options: TargetNameForEntryOptions): string => {
  const { dimensions, file, index, width } = options;
  const formattedIndex = formatIndex(index, width);
  return pipe(
    dimensions,
    O.match({
      onNone: () => `${prefix}_${formattedIndex}${file.extension}`,
      onSome: (mediaDimensions) =>
        `${prefix}_${formattedIndex}_${mediaDimensions.width}x${mediaDimensions.height}${file.extension}`,
    })
  );
});

/**
 * Check whether a plan skipped any files.
 *
 * @param skippedCount - Number of skipped files.
 * @returns Whether the skipped count is positive.
 * @category utilities
 * @since 0.0.0
 */
export const hasSkippedFiles = (skippedCount: number): boolean => skippedCount > 0;

/**
 * Build a hash set of selected canonical source paths.
 *
 * @param plan - Rename plan entries.
 * @returns Hash set of canonical source paths.
 * @category utilities
 * @since 0.0.0
 */
export const selectedCanonicalPathSet = (plan: ReadonlyArray<RenamePlanEntry>): HashSet.HashSet<string> => {
  let selected = HashSet.empty<string>();
  for (const entry of plan) {
    selected = HashSet.add(selected, entry.canonicalSourcePath);
  }
  return selected;
};

/**
 * Render a rename plan entry.
 *
 * @param entry - Rename plan entry.
 * @returns Human-readable plan line.
 * @category utilities
 * @since 0.0.0
 */
export const renderPlanEntry = (entry: RenamePlanEntry): string => `${entry.sourceName} -> ${entry.targetName}`;

/**
 * Render a metadata strip plan entry.
 *
 * @param entry - Planned source file whose metadata will be removed.
 * @returns Human-readable plan line.
 * @category utilities
 * @since 0.0.0
 */
export const renderStripMetadataPlanEntry = (entry: StripMetadataPlanEntry): string =>
  `${entry.sourceName} [${entry.mediaKind}]`;

/**
 * Render a caption sidecar creation plan entry.
 *
 * @param entry - Planned source image and caption sidecar pair.
 * @returns Human-readable plan line.
 * @category utilities
 * @since 0.0.0
 */
export const renderCreateCaptionFilesPlanEntry = (entry: CreateCaptionFilesPlanEntry): string =>
  `${entry.sourceName} -> ${entry.captionName}`;

/**
 * Render a skipped caption sidecar creation source entry.
 *
 * @param entry - Source file excluded from caption sidecar creation with its reason.
 * @returns Human-readable skipped line.
 * @category utilities
 * @since 0.0.0
 */
export const renderCreateCaptionFilesSkippedEntry = (entry: CreateCaptionFilesSkippedEntry): string =>
  `${entry.sourceName} [${entry.reason}] ${entry.message}`;

/**
 * Render a normalize plan entry.
 *
 * @param entry - Planned source/output pair with probed resize details.
 * @returns Human-readable plan line.
 * @category utilities
 * @since 0.0.0
 */
export const renderNormalizePlanEntry = (entry: NormalizePlanEntry): string =>
  `${entry.sourceName} -> ${entry.outputName} (${entry.inputDimensions.width}x${entry.inputDimensions.height} -> ${entry.outputDimensions.width}x${entry.outputDimensions.height})`;

/**
 * Render a normalize skipped entry.
 *
 * @param entry - Source file excluded from normalization with its reason.
 * @returns Human-readable skipped line.
 * @category utilities
 * @since 0.0.0
 */
export const renderNormalizeSkippedEntry = (entry: NormalizeSkippedEntry): string =>
  `${entry.sourceName} [${entry.reason}] ${entry.message}`;

/**
 * Resolve the file extension emitted for a canonical normalize format.
 *
 * @param format - Canonical normalize output format.
 * @returns Dotted file extension.
 * @category utilities
 * @since 0.0.0
 */
export const normalizeOutputExtension = (format: NormalizeImageFormat): string => `.${format}`;

/**
 * Resolve the sharp encoder name for a canonical normalize format.
 *
 * @param format - Canonical normalize output format.
 * @returns Format name accepted by sharp.
 * @category utilities
 * @since 0.0.0
 */
export const sharpFormatForNormalize = (format: NormalizeImageFormat): "jpeg" | "png" | "webp" =>
  format === "jpg" ? "jpeg" : format;

/**
 * Calculate downscaled dimensions for a max long edge without upscaling.
 *
 * @param dimensions - Input dimensions after orientation is applied.
 * @param maxLongEdge - Maximum output long edge.
 * @returns Output dimensions after optional downscaling.
 * @category utilities
 * @since 0.0.0
 */
export const normalizeOutputDimensions: {
  (maxLongEdge: O.Option<number>): (dimensions: MediaDimensions) => MediaDimensions;
  (dimensions: MediaDimensions, maxLongEdge: O.Option<number>): MediaDimensions;
} = dual(2, (dimensions: MediaDimensions, maxLongEdge: O.Option<number>): MediaDimensions => {
  if (O.isNone(maxLongEdge)) {
    return dimensions;
  }

  const longEdge = Math.max(dimensions.width, dimensions.height);
  if (longEdge <= maxLongEdge.value) {
    return dimensions;
  }

  const scale = maxLongEdge.value / longEdge;
  return new MediaDimensions({
    height: Math.max(1, Math.round(dimensions.height * scale)),
    width: Math.max(1, Math.round(dimensions.width * scale)),
  });
});

/**
 * Check whether two media dimensions differ.
 *
 * @param left - First dimensions.
 * @param right - Second dimensions.
 * @returns Whether width or height changed.
 * @category utilities
 * @since 0.0.0
 */
export const mediaDimensionsChanged: {
  (right: MediaDimensions): (left: MediaDimensions) => boolean;
  (left: MediaDimensions, right: MediaDimensions): boolean;
} = dual(
  2,
  (left: MediaDimensions, right: MediaDimensions): boolean => left.width !== right.width || left.height !== right.height
);

/**
 * Round a candidate assessment metric for stable manifest output.
 *
 * @param value - Numeric metric to round.
 * @returns Metric rounded to four decimal places.
 * @category utilities
 * @since 0.0.0
 */
export const roundCandidateMetric = (value: number): number => Math.round(value * 10_000) / 10_000;

/**
 * Assess image dimensions against hard candidate-quality thresholds.
 *
 * @param dimensions - Probed image dimensions after orientation handling.
 * @param thresholds - Hard candidate-quality thresholds.
 * @returns Candidate decision, reasons, and derived metrics.
 * @category utilities
 * @since 0.0.0
 */
export const assessImageCandidate: {
  (thresholds: CandidateAssessmentThresholds): (dimensions: MediaDimensions) => CandidateAssessmentResult;
  (dimensions: MediaDimensions, thresholds: CandidateAssessmentThresholds): CandidateAssessmentResult;
} = dual(2, (dimensions: MediaDimensions, thresholds: CandidateAssessmentThresholds): CandidateAssessmentResult => {
  const shortEdge = Math.min(dimensions.width, dimensions.height);
  const longEdge = Math.max(dimensions.width, dimensions.height);
  const pixelArea = dimensions.width * dimensions.height;
  const aspectRatio = longEdge / shortEdge;
  const targetArea = thresholds.targetResolution * thresholds.targetResolution;
  const upscaleToTarget = pixelArea >= targetArea ? 1 : Math.sqrt(targetArea / pixelArea);
  let reasons = A.empty<CandidateAssessmentReason>();

  if (shortEdge < thresholds.minShortEdge) {
    reasons = A.append(reasons, "short-edge-too-small");
  }

  if (aspectRatio > thresholds.maxAspect) {
    reasons = A.append(reasons, "extreme-aspect-ratio");
  }

  if (upscaleToTarget > thresholds.maxUpscale) {
    reasons = A.append(reasons, "upscale-too-large");
  }

  return {
    decision: A.isReadonlyArrayNonEmpty(reasons) ? "archive" : "keep",
    metrics: new CandidateAssessmentMetrics({
      aspectRatio: roundCandidateMetric(aspectRatio),
      pixelArea,
      shortEdge,
      upscaleToTarget: roundCandidateMetric(upscaleToTarget),
    }),
    reasons,
  };
});

/**
 * Render a poor-candidate archive plan entry.
 *
 * @param entry - Assessed image candidate.
 * @returns Human-readable archive plan line.
 * @category utilities
 * @since 0.0.0
 */
export const renderArchivePoorCandidatesEntry = (entry: ArchivePoorCandidatesEntry): string => {
  const target = pipe(
    O.fromUndefinedOr(entry.archiveName),
    O.getOrElse(() => "kept")
  );
  const reasons = A.isReadonlyArrayNonEmpty(entry.reasons) ? A.join(", ")(entry.reasons) : "none";
  return `${entry.sourceName} [${entry.decision}] ${entry.dimensions.width}x${entry.dimensions.height} -> ${target} (${reasons})`;
};

/**
 * Render a skipped poor-candidate archive source entry.
 *
 * @param entry - Source file excluded from candidate archival with its reason.
 * @returns Human-readable skipped line.
 * @category utilities
 * @since 0.0.0
 */
export const renderArchivePoorCandidatesSkippedEntry = (entry: ArchivePoorCandidatesSkippedEntry): string =>
  `${entry.sourceName} [${entry.reason}] ${entry.message}`;

/**
 * Render an RGB color as a lowercase hexadecimal color.
 *
 * @param color - RGB color to render.
 * @returns Hex color string in `#rrggbb` format.
 * @category utilities
 * @since 0.0.0
 */
export const rgbToHex = (color: RgbColor): string =>
  `#${channelToHex(color.r)}${channelToHex(color.g)}${channelToHex(color.b)}`;

/**
 * Classify an analyzed image from its matched border sides.
 *
 * @param sides - Per-side border measurements.
 * @returns Border layout classification.
 * @category utilities
 * @since 0.0.0
 */
export const classifyBorderSides = (sides: ReadonlyArray<DetectBorderSideMeasurement>): BorderDetectionKind => {
  const matched = A.filter(sides, (side) => side.matched);
  const count = A.length(matched);
  const hasSide = (side: BorderSide): boolean =>
    pipe(
      sides,
      A.findFirst((entry) => entry.side === side),
      O.exists((entry) => entry.matched)
    );
  const top = hasSide("top");
  const right = hasSide("right");
  const bottom = hasSide("bottom");
  const left = hasSide("left");

  if (count === 0) {
    return "none";
  }

  if (top && right && bottom && left) {
    return "frame";
  }

  if (left && right && !top && !bottom) {
    return "pillarbox";
  }

  if (top && bottom && !left && !right) {
    return "letterbox";
  }

  if (count === 1) {
    return "canvas-edge";
  }

  return "mixed";
};

/**
 * Analyze raw RGB image pixels for near-solid borders on all four sides.
 *
 * @param image - Raw image pixel data in RGB channel order.
 * @param thresholds - Detection thresholds.
 * @returns Per-side border measurements in top/right/bottom/left order.
 * @category utilities
 * @since 0.0.0
 */
export const analyzeSolidBorders: {
  (thresholds: BorderDetectionThresholds): (image: RawImagePixelData) => ReadonlyArray<DetectBorderSideMeasurement>;
  (image: RawImagePixelData, thresholds: BorderDetectionThresholds): ReadonlyArray<DetectBorderSideMeasurement>;
} = dual(
  2,
  (image: RawImagePixelData, thresholds: BorderDetectionThresholds): ReadonlyArray<DetectBorderSideMeasurement> =>
    A.map(borderSides, (side) => scanBorderSide(image, side, thresholds))
);

/**
 * Render a detected-border report entry.
 *
 * @param entry - Analyzed image entry.
 * @returns Human-readable report line.
 * @category utilities
 * @since 0.0.0
 */
export const renderDetectBordersEntry = (entry: DetectBordersEntry): string => {
  const matchedSides = pipe(
    entry.sides,
    A.filter((side) => side.matched),
    A.map((side) => `${side.side}=${side.widthPx}px/${side.widthPct}% ${side.colorHex}`),
    A.join(", ")
  );

  return `${entry.sourceName} [${entry.classification}] ${entry.width}x${entry.height} ${matchedSides}`;
};

/**
 * Render a skipped border-detection source entry.
 *
 * @param entry - Source file excluded from border detection with its reason.
 * @returns Human-readable skipped line.
 * @category utilities
 * @since 0.0.0
 */
export const renderDetectBordersSkippedEntry = (entry: DetectBordersSkippedEntry): string =>
  `${entry.sourceName} [${entry.reason}] ${entry.message}`;

const borderWidthForSide = (entry: DetectBordersEntry, side: BorderSide): number =>
  pipe(
    entry.sides,
    A.findFirst((measurement) => measurement.side === side),
    O.filter((measurement) => measurement.matched),
    O.map((measurement) => measurement.widthPx),
    O.getOrElse(() => 0)
  );

/**
 * Convert a detected-border entry into a valid crop plan entry.
 *
 * @param entry - Detection result with one or more matched border sides.
 * @returns Crop plan entry when the detected borders leave positive image dimensions.
 * @category utilities
 * @since 0.0.0
 */
export const cropBordersPlanEntryFromDetection = (entry: DetectBordersEntry): O.Option<CropBordersPlanEntry> => {
  const cropLeft = borderWidthForSide(entry, "left");
  const cropTop = borderWidthForSide(entry, "top");
  const cropRight = borderWidthForSide(entry, "right");
  const cropBottom = borderWidthForSide(entry, "bottom");
  const cropWidth = entry.width - cropLeft - cropRight;
  const cropHeight = entry.height - cropTop - cropBottom;

  if (cropWidth < 1 || cropHeight < 1) {
    return O.none();
  }

  return O.some(
    new CropBordersPlanEntry({
      borderCount: entry.borderCount,
      classification: entry.classification,
      cropHeight,
      cropLeft,
      cropTop,
      cropWidth,
      extension: entry.extension,
      originalHeight: entry.height,
      originalWidth: entry.width,
      sides: entry.sides,
      sourceName: entry.sourceName,
      sourcePath: entry.sourcePath,
    })
  );
};

/**
 * Render a border crop plan entry.
 *
 * @param entry - Planned in-place crop.
 * @returns Human-readable crop plan line.
 * @category utilities
 * @since 0.0.0
 */
export const renderCropBordersPlanEntry = (entry: CropBordersPlanEntry): string =>
  `${entry.sourceName} [${entry.classification}] ${entry.originalWidth}x${entry.originalHeight} -> ${entry.cropWidth}x${entry.cropHeight} @ ${entry.cropLeft},${entry.cropTop}`;

/**
 * Build temporary output paths for metadata stripping.
 *
 * @param tempDir - Temporary working directory.
 * @param plan - Files scheduled for metadata-safe staged rewrites.
 * @param path - Platform path service.
 * @returns Source entries paired with temporary output paths.
 * @category utilities
 * @since 0.0.0
 */
export const makeStripMetadataTempEntries: {
  (
    plan: ReadonlyArray<StripMetadataPlanEntry>,
    path: Path.Path
  ): (tempDir: string) => ReadonlyArray<StripMetadataTempEntry>;
  (
    tempDir: string,
    plan: ReadonlyArray<StripMetadataPlanEntry>,
    path: Path.Path
  ): ReadonlyArray<StripMetadataTempEntry>;
} = dual(3, (tempDir: string, plan: ReadonlyArray<StripMetadataPlanEntry>, path: Path.Path) =>
  A.map(plan, (entry, index) => ({
    entry,
    tempPath: path.join(tempDir, `${formatIndex(index, Str.length(`${A.length(plan)}`) + 1)}-${entry.sourceName}`),
  }))
);

/**
 * Check whether a selected image file can be normalized by metadata stripping.
 *
 * @param file - Selected file.
 * @returns Whether the file extension is supported for image metadata stripping.
 * @category utilities
 * @since 0.0.0
 */
export const isSupportedMetadataImageFile = (file: SortableFile): boolean =>
  isSupportedMetadataImageExtension(normalizeBareExtension(file.extension));
