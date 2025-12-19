import {
  constEmptyExifMetadata,
  ExifFileTooLargeError,
  ExifMetadata,
  type ExifMetadataValue,
  ExifTimeoutError,
  MetadataParseError,
} from "@beep/schema/integrations/files/exif-metadata";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Match from "effect/Match";
import * as Num from "effect/Number";
import * as O from "effect/Option";
import * as P from "effect/Predicate";

/**
 * Represents a binary file for metadata extraction.
 * Local type definition matching @uswriting/exiftool's internal type.
 */
interface Binaryfile {
  /** Filename with extension (e.g., "image.jpg") */
  readonly name: string;
  /** The binary content of the file */
  readonly data: Uint8Array | Blob;
}

/**
 * Result of an ExifTool metadata extraction operation.
 * Local type definition matching @uswriting/exiftool's internal type.
 */
type ExifToolOutput<TOutput> =
  | {
      readonly success: true;
      readonly data: TOutput;
      readonly exitCode: 0;
    }
  | {
      readonly success: false;
      readonly data: undefined;
      readonly error: string;
      readonly exitCode: number | undefined;
    };

/**
 * Get the size of a file or binary file data.
 * Handles both File (has size), Uint8Array (has length), and Blob (has size).
 */
const getFileSize = (file: File | Binaryfile): number => {
  if ("size" in file && Num.isNumber(file.size)) {
    return file.size; // File object
  }
  // Binaryfile with data
  const data = (file as Binaryfile).data;
  if (data instanceof Blob) {
    return data.size;
  }
  return data.length; // Uint8Array
};

// Maximum file size for EXIF extraction (50MB)
const MAX_EXIF_FILE_SIZE = 50 * 1024 * 1024;

// Default timeout for EXIF extraction (30 seconds)
const DEFAULT_TIMEOUT_MS = 30_000;

/**
 * Service interface for ExifTool operations.
 */
interface ExifToolServiceShape {
  readonly extractMetadata: (
    file: File | Binaryfile
  ) => Effect.Effect<ExifMetadata, MetadataParseError | ExifFileTooLargeError | ExifTimeoutError>;

  readonly extractRaw: (
    file: File | Binaryfile
  ) => Effect.Effect<ExifMetadataValue, MetadataParseError | ExifFileTooLargeError | ExifTimeoutError>;

  readonly writeMetadata: (
    file: File | Binaryfile,
    tags: Record<string, unknown>
  ) => Effect.Effect<ArrayBuffer, MetadataParseError>;
}

/**
 * ExifTool service for EXIF metadata extraction using WASM.
 *
 * Uses Effect.Service pattern with lazy WASM module loading.
 * The WASM module is loaded once on first use and cached.
 */
export class ExifToolService extends Effect.Service<ExifToolService>()("ExifToolService", {
  accessors: true,
  dependencies: [],
  effect: Effect.gen(function* () {
    // Lazy import the module - loaded once and cached
    const exiftool = yield* Effect.tryPromise({
      try: () => import("@uswriting/exiftool"),
      catch: (e) =>
        new MetadataParseError({
          message: "Failed to load @uswriting/exiftool WASM module",
          cause: e,
          phase: "load",
        }),
    });

    const { parseMetadata, writeMetadata } = exiftool;

    /**
     * Parse raw EXIF data from ExifTool output.
     * Handles the array format that ExifTool returns.
     */
    const parseExifOutput = (
      result: ExifToolOutput<unknown>,
      file: File | Binaryfile
    ): Effect.Effect<ExifMetadataValue, MetadataParseError> =>
      Effect.gen(function* () {
        if (!result.success) {
          return yield* Effect.fail(
            new MetadataParseError({
              message: result.error || "ExifTool extraction failed",
              cause: result,
              fileName: file.name,
              phase: "parse",
            })
          );
        }

        // ExifTool returns array when using -json, extract first element
        const data = result.data;

        return F.pipe(
          Match.value(data),
          Match.when(A.isArray, (arr) =>
            F.pipe(arr, A.head, O.filter(P.isRecord), O.getOrElse(constEmptyExifMetadata))
          ),
          Match.when(P.isRecord, (obj) => obj as ExifMetadataValue),
          Match.orElse(constEmptyExifMetadata)
        );
      });

    /**
     * Check file size before extraction.
     */
    const checkFileSize = (file: File | Binaryfile): Effect.Effect<void, ExifFileTooLargeError> =>
      Effect.gen(function* () {
        const size = getFileSize(file);
        if (size > MAX_EXIF_FILE_SIZE) {
          return yield* Effect.fail(
            new ExifFileTooLargeError({
              message: `File too large for EXIF extraction: ${size} bytes (max ${MAX_EXIF_FILE_SIZE} bytes)`,
              fileName: file.name,
              fileSize: size,
              maxSize: MAX_EXIF_FILE_SIZE,
            })
          );
        }
      });

    const extractRaw: ExifToolServiceShape["extractRaw"] = (file) =>
      Effect.gen(function* () {
        yield* checkFileSize(file);

        yield* Effect.annotateCurrentSpan("exif.fileName", file.name);
        yield* Effect.annotateCurrentSpan("exif.fileSize", getFileSize(file));

        const result = yield* Effect.tryPromise({
          try: () =>
            parseMetadata(file, {
              args: ["-json", "-a", "-G"], // JSON output, all tags, group names
              transform: (data) => JSON.parse(data),
            }),
          catch: (e) =>
            new MetadataParseError({
              message: "ExifTool extraction failed",
              cause: e,
              fileName: file.name,
              phase: "parse",
            }),
        }).pipe(
          Effect.timeout(DEFAULT_TIMEOUT_MS),
          Effect.catchTag("TimeoutException", () =>
            Effect.fail(
              new ExifTimeoutError({
                message: `EXIF extraction timed out after ${DEFAULT_TIMEOUT_MS}ms`,
                fileName: file.name,
                timeoutMs: DEFAULT_TIMEOUT_MS,
              })
            )
          )
        );

        return yield* parseExifOutput(result, file);
      });

    const extractMetadata: ExifToolServiceShape["extractMetadata"] = (file) =>
      Effect.gen(function* () {
        const raw = yield* extractRaw(file);
        return ExifMetadata.fromRaw(raw);
      });

    const writeMetadataFn: ExifToolServiceShape["writeMetadata"] = (file, tags) =>
      Effect.gen(function* () {
        const result = yield* Effect.tryPromise({
          try: () =>
            writeMetadata(file, tags as Record<string, string | number | boolean | (string | number | boolean)[]>),
          catch: (e) =>
            new MetadataParseError({
              message: "ExifTool write failed",
              cause: e,
              fileName: file.name,
              phase: "parse",
            }),
        });

        if (!result.success) {
          return yield* Effect.fail(
            new MetadataParseError({
              message: result.error || "ExifTool write failed",
              cause: result,
              fileName: file.name,
              phase: "decode",
            })
          );
        }

        return result.data;
      });

    return {
      extractRaw,
      extractMetadata,
      writeMetadata: writeMetadataFn,
    } satisfies ExifToolServiceShape;
  }),
}) {}
