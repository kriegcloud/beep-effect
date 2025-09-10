import { withLogContext, withRootSpan, withSpanAndMetrics } from "@beep/errors/client";
import * as Effect from "effect/Effect";
import * as Metric from "effect/Metric";
import * as MetricBoundaries from "effect/MetricBoundaries";

/**
 * Upload observability scaffolding
 * - Spans, annotations, and metrics for the upload pipeline
 */

// Metrics
export const UploadMetrics = {
  // Per-file lifecycle
  filesProcessedTotal: Metric.counter("upload.files_processed_total"),
  filesFailedTotal: Metric.counter("upload.files_failed_total"),

  // Detection & EXIF
  detectionFailedTotal: Metric.counter("upload.detection_failed_total"),
  exifParsedTotal: Metric.counter("upload.exif_parsed_total"),
  exifFailedTotal: Metric.counter("upload.exif_failed_total"),

  // Durations
  processFileDurationMs: Metric.histogram(
    "upload.process_file_duration_ms",
    MetricBoundaries.fromIterable([1, 5, 10, 25, 50, 100, 250, 500, 1000, 2000, 5000, 10_000])
  ),
} as const;

export type UploadAnnotation = Readonly<Record<string, unknown>>;

export const makeFileAnnotations = (file: File, extra?: UploadAnnotation): UploadAnnotation => ({
  service: "upload",
  fileName: file.name,
  fileType: file.type,
  fileSize: file.size,
  ...extra,
});

export const withUploadSpan =
  (label: string, annotations?: UploadAnnotation) =>
  <A, E, R>(self: Effect.Effect<A, E, R>) =>
    self.pipe(Effect.withLogSpan(label), Effect.annotateLogs({ service: "upload", ...annotations }));

export const instrumentProcessFile =
  (annotations?: UploadAnnotation) =>
  <A, E, R>(self: Effect.Effect<A, E, R>) =>
    self.pipe(
      withLogContext({ service: "upload", ...annotations }),
      withRootSpan("upload.processFile"),
      withSpanAndMetrics(
        "upload.processFile",
        {
          successCounter: UploadMetrics.filesProcessedTotal,
          errorCounter: UploadMetrics.filesFailedTotal,
          durationHistogram: UploadMetrics.processFileDurationMs,
          durationUnit: "millis",
        },
        { service: "upload", ...annotations }
      )
    );

// Lightweight logging helpers (level-specific)
export const logDebug = (message: string, annotations?: UploadAnnotation) =>
  Effect.logDebug(message).pipe(Effect.annotateLogs(annotations ?? {}));
export const logInfo = (message: string, annotations?: UploadAnnotation) =>
  Effect.logInfo(message).pipe(Effect.annotateLogs(annotations ?? {}));
export const logWarning = (message: string, annotations?: UploadAnnotation) =>
  Effect.logWarning(message).pipe(Effect.annotateLogs(annotations ?? {}));
export const logError = (message: string, annotations?: UploadAnnotation) =>
  Effect.logError(message).pipe(Effect.annotateLogs(annotations ?? {}));

// Common trace label constants
export const UploadTrace = {
  root: "upload",
  processFile: "upload.processFile",
  validateFile: "upload.validateFile",
  extractBasic: "upload.extractBasicMetadata",
  extractExif: "upload.extractExifMetadata",
} as const;

// Provide a simple root wrapper to annotate and span top-level effects
export const withUploadRoot =
  (annotations?: UploadAnnotation) =>
  <A, E, R>(self: Effect.Effect<A, E, R>) =>
    self.pipe(withLogContext({ service: "upload", ...annotations }), withRootSpan(UploadTrace.root));
