import { withLogContext, withRootSpan, withSpanAndMetrics } from "@beep/errors/client";
import * as Effect from "effect/Effect";
import * as Metric from "effect/Metric";
import * as MetricBoundaries from "effect/MetricBoundaries";

/**
 * Upload observability
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

export const makeFileAnnotations = (file: File, extra?: UploadAnnotation | undefined): UploadAnnotation => ({
  service: "upload",
  fileName: file.name,
  fileType: file.type,
  fileSize: file.size,
  ...extra,
});

export const instrumentProcessFile =
  (annotations?: UploadAnnotation | undefined) =>
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
export const logInfo = (message: string, annotations?: UploadAnnotation | undefined) =>
  Effect.logInfo(message).pipe(Effect.annotateLogs(annotations ?? {}));
export const logWarning = (message: string, annotations?: UploadAnnotation | undefined) =>
  Effect.logWarning(message).pipe(Effect.annotateLogs(annotations ?? {}));
