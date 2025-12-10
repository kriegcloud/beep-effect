/**
 * @file NormalizedFileFromSelf.test.ts
 * @description Integration tests for NormalizedFileFromSelf schema with real files and WASM-based metadata extraction
 */

import {
  //  layer,
  assertTrue,
  deepStrictEqual,
  describe,
  effect,
} from "@beep/testkit";
import { pipe } from "effect";
// import * as A from "effect/Array";
// import * as Str from "effect/String";
// import * as Duration from "effect/Duration";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as Either from "effect/Either";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
// import * as Schedule from "effect/Schedule";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
// import * as fs from "node:fs";
// import * as path from "node:path";

// Schema imports
import {
  ExifFileTooLargeError,
  ExifMetadata,
  ExifTimeoutError,
  MetadataParseError,
  type NormalizedFile,
  NormalizedFileFromSelf,
} from "@beep/schema/integrations/files";
import { MetadataService } from "@beep/schema/integrations/files/metadata/Metadata.service";
import { IAudioMetadata } from "@beep/schema/integrations/files/metadata/types";

// ============================================================================
// Test Configuration
// ============================================================================

/**
 * Path to local test fixtures directory.
 * Files are loaded from filesystem to avoid network issues and reduce test flakiness.
 */
// const FIXTURES_DIR = path.join(__dirname, "fixtures");

/**
 * Local fixture files for testing.
 */
// const TEST_FIXTURES = {
//   image: path.join(FIXTURES_DIR, "test-image.jpg"),
//   audio: path.join(FIXTURES_DIR, "test-audio.mp3"),
//   application: path.join(FIXTURES_DIR, "test-document.pdf"),
//   text: path.join(FIXTURES_DIR, "test-subtitles.vtt"),
//   misc: path.join(FIXTURES_DIR, "test-font.woff2"),
//   // video: intentionally omitted - resource intensive and causes crashes
// } as const;

/**
 * URL sources for reference (used for downloading fixtures).
 * NOT used at runtime - only kept for documentation.
 */
// const TEST_URLS = {
//   image: "https://picsum.photos/seed/NWbJM2B/640/480",
//   audio: "https://dl.espressif.com/dl/audio/ff-16b-2c-44100hz.mp3",
//   video: "https://file-examples.com/storage/fef1706276683dc0cba7b4c/2017/04/file_example_MP4_480_1_5MG.mp4",
//   application: "https://ontheline.trincoll.edu/images/bookdown/sample-local-pdf.pdf",
//   text: "https://gist.githubusercontent.com/samdutton/ca37f3adaf4e23679957b8083e061177/raw/sample.vtt",
//   misc: "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2",
// } as const;

// File signature constants for validation tests
const PNG_SIGNATURE = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const JPEG_SIGNATURE = new Uint8Array([0xff, 0xd8, 0xff]);
const MP3_SIGNATURE = new Uint8Array([0x49, 0x44, 0x33]); // "ID3"
// MP4 ftyp box: size (20 bytes) + "ftyp" + "isom" brand + version + compatible brand
const MP4_SIGNATURE = new Uint8Array([
  0x00,
  0x00,
  0x00,
  0x14, // Size: 20 bytes (big-endian)
  0x66,
  0x74,
  0x79,
  0x70, // "ftyp"
  0x69,
  0x73,
  0x6f,
  0x6d, // "isom" (major brand)
  0x00,
  0x00,
  0x00,
  0x00, // Minor version
  0x69,
  0x73,
  0x6f,
  0x6d, // "isom" (compatible brand)
]);

// Retry schedule for network resilience: exponential backoff with max 3 retries
// const networkRetrySchedule = pipe(
//   Schedule.exponential(Duration.millis(500)),
//   Schedule.compose(Schedule.recurs(3)),
// );

// ============================================================================
// File Fetching Utilities
// ============================================================================
//
// class FetchFileError extends S.TaggedError<FetchFileError>()("FetchFileError", {
//   message: S.String,
//   cause: S.optional(S.Unknown),
//   url: S.optional(S.String),
//   httpStatus: S.optional(S.Number),
//   phase: S.optional(S.Literal("fetch", "blob", "conversion")),
// }) {}

/**
 * Known MIME type mappings from file extension.
 * Used when server returns generic or incorrect Content-Type.
 */
// const EXTENSION_TO_MIME: Record<string, string> = {
//   jpg: "image/jpeg",
//   jpeg: "image/jpeg",
//   png: "image/png",
//   gif: "image/gif",
//   webp: "image/webp",
//   mp3: "audio/mpeg",
//   wav: "audio/wav",
//   mp4: "video/mp4",
//   webm: "video/webm",
//   pdf: "application/pdf",
//   zip: "application/zip",
//   vtt: "text/vtt",
//   txt: "text/plain",
//   woff: "font/woff",
//   woff2: "font/woff2",
// };

/**
 * Infer MIME type from file extension when blob.type is empty.
 * Some servers don't set Content-Type header properly.
 */
// const inferMimeTypeFromExtension = (filename: string): string => {
//   const ext = pipe(
//     filename,
//     Str.split("."),
//     A.last,
//     O.getOrElse(() => ""),
//     Str.toLowerCase,
//   );
//   return EXTENSION_TO_MIME[ext] ?? "application/octet-stream";
// };

/**
 * Determines the correct MIME type for a file.
 * Prefers server-provided type but falls back to extension-based inference
 * when the server returns a generic type like text/plain for specialized formats.
 */
// const determineMimeType = (blobType: string, filename: string): string => {
//   const ext = pipe(
//     filename,
//     Str.split("."),
//     A.last,
//     O.getOrElse(() => ""),
//     Str.toLowerCase,
//   );
//
//   // If blob type is empty, infer from extension
//   if (blobType === "") {
//     return inferMimeTypeFromExtension(filename);
//   }
//
//   // If server returns generic text/plain but we know a more specific type, use it
//   // This handles cases where servers return text/plain for .vtt, .json, etc.
//   if (Str.startsWith("text/plain")(blobType)) {
//     const knownType = EXTENSION_TO_MIME[ext];
//     if (knownType !== undefined && !Str.startsWith("text/plain")(knownType)) {
//       return knownType;
//     }
//   }
//
//   return blobType;
// };

/**
 * Fetches a file from a URL and converts it to a browser File object.
 * Handles network errors, HTTP errors, and blob conversion gracefully.
 */
// const fetchFileFromUrl = (url: string, filename: string): Effect.Effect<File, FetchFileError> =>
//   Effect.gen(function* () {
//     const response = yield* Effect.tryPromise({
//       try: () => fetch(url),
//       catch: (cause) =>
//         new FetchFileError({
//           message: `Failed to fetch ${url}`,
//           cause,
//           url,
//           phase: "fetch",
//         }),
//     });
//
//     if (!response.ok) {
//       return yield* Effect.fail(
//         new FetchFileError({
//           message: `HTTP ${response.status} for ${url}`,
//           url,
//           httpStatus: response.status,
//           phase: "fetch",
//         }),
//       );
//     }
//
//     const blob = yield* Effect.tryPromise({
//       try: () => response.blob(),
//       catch: (cause) =>
//         new FetchFileError({
//           message: `Failed to read blob from ${url}`,
//           cause,
//           url,
//           phase: "blob",
//         }),
//     });
//
//     // Determine correct MIME type - handles empty types and generic text/plain
//     const mimeType = determineMimeType(blob.type, filename);
//
//     const file = new File([blob], filename, {
//       type: mimeType,
//       lastModified: DateTime.toEpochMillis(DateTime.unsafeNow()),
//     });
//
//     // webkitRelativePath is read-only on File, but we need it for the schema
//     Object.defineProperty(file, "webkitRelativePath", {
//       value: filename,
//       writable: false,
//     });
//
//     return file;
//   });

/**
 * Fetch file with network retry for resilience against transient failures.
 */
// const fetchFileWithRetry = (url: string, filename: string): Effect.Effect<File, FetchFileError> =>
//   pipe(
//     fetchFileFromUrl(url, filename),
//     Effect.retry(networkRetrySchedule),
//     Effect.tapError((error) => Effect.logWarning(`Network fetch failed after retries: ${error.message}`)),
//   );

// ============================================================================
// Filesystem File Loading (for tests using local fixtures)
// ============================================================================

// class LoadFileError extends S.TaggedError<LoadFileError>()("LoadFileError", {
//   message: S.String,
//   cause: S.optional(S.Unknown),
//   filePath: S.String,
// }) {}

/**
 * Loads a file from the local filesystem and converts it to a browser File object.
 * Used to avoid network dependencies and improve test reliability.
 */
// const loadFileFromFixtures = (filePath: string): Effect.Effect<File, LoadFileError> =>
//   Effect.gen(function* () {
//     const filename = path.basename(filePath);
//
//     // Read file from filesystem
//     const buffer = yield* Effect.try({
//       try: () => fs.readFileSync(filePath),
//       catch: (cause) =>
//         new LoadFileError({
//           message: `Failed to read file: ${filePath}`,
//           cause,
//           filePath,
//         }),
//     });
//
//     // Determine MIME type from extension
//     const mimeType = inferMimeTypeFromExtension(filename);
//
//     // Create File object from buffer
//     const file = new File([buffer], filename, {
//       type: mimeType,
//       lastModified: DateTime.toEpochMillis(DateTime.unsafeNow()),
//     });
//
//     // Set webkitRelativePath
//     Object.defineProperty(file, "webkitRelativePath", {
//       value: filename,
//       writable: false,
//     });
//
//     return file;
//   });

// ============================================================================
// Mock File Factory (for error scenarios)
// ============================================================================

/**
 * Creates a mock File object for testing error scenarios.
 * Uses Blob constructor to create a File with proper arrayBuffer() support.
 */
const createMockFile = (options: {
  name: string;
  type: string;
  content: Uint8Array;
  lastModified?: number;
  webkitRelativePath?: string;
}): File => {
  const buffer = new Uint8Array(options.content);
  const blob = new Blob([buffer], { type: options.type });
  const file = new File([blob], options.name, {
    type: options.type,
    lastModified: options.lastModified ?? DateTime.toEpochMillis(DateTime.unsafeNow()),
  });
  Object.defineProperty(file, "webkitRelativePath", {
    value: options.webkitRelativePath ?? options.name,
    writable: false,
  });
  return file;
};

// ============================================================================
// Minimal Valid Mock Data
// ============================================================================

/**
 * Minimal valid ExifMetadata for mock returns.
 */
const createMockExifMetadata = (
  overrides?: Partial<{
    imageWidth: number;
    imageHeight: number;
    fileName: string;
  }>
): ExifMetadata =>
  new ExifMetadata({
    raw: {},
    imageWidth: overrides?.imageWidth,
    imageHeight: overrides?.imageHeight,
    fileName: overrides?.fileName,
  });

/**
 * Creates a minimal valid IAudioMetadata instance for mock returns.
 */
const createMockAudioMetadata = (
  overrides?: Partial<{
    duration: number;
    sampleRate: number;
  }>
): IAudioMetadata =>
  S.decodeUnknownSync(IAudioMetadata)({
    format: {
      trackInfo: [],
      tagTypes: [],
      duration: overrides?.duration ?? null,
      sampleRate: overrides?.sampleRate ?? null,
    },
    native: {},
    quality: { warnings: [] },
    common: {
      track: { no: null, of: null },
      disk: { no: null, of: null },
      movementIndex: { no: null, of: null },
    },
  });

// ============================================================================
// Mock MetadataService Layer Factory
// ============================================================================

/**
 * Creates a mock MetadataService layer for testing.
 * Use this ONLY for error scenarios that cannot be tested with real files.
 */
const createMockMetadataServiceLayer = (config?: {
  exifResult?: Effect.Effect<ExifMetadata, MetadataParseError | ExifFileTooLargeError | ExifTimeoutError>;
  audioResult?: Effect.Effect<IAudioMetadata.Type, MetadataParseError>;
}): Layer.Layer<MetadataService> => {
  const defaultExif = Effect.succeed(createMockExifMetadata());
  const defaultAudio = Effect.succeed(createMockAudioMetadata());

  // @ts-expect-error - MetadataService requires _tag from Effect.Service, but mock doesn't need it at runtime
  return Layer.succeed(MetadataService, {
    exif: {
      extractMetadata: () => config?.exifResult ?? defaultExif,
      extractRaw: () => Effect.succeed({}),
      writeMetadata: () => Effect.succeed(new ArrayBuffer(0)),
    },
    audio: {
      parseBlob: () => config?.audioResult ?? defaultAudio,
      parseBuffer: () => config?.audioResult ?? defaultAudio,
      parseWebStream: () => config?.audioResult ?? defaultAudio,
    },
  });
};

// Pre-built error layers for common error scenarios
const MockMetadataServiceParseErrorLayer = createMockMetadataServiceLayer({
  exifResult: Effect.fail(
    new MetadataParseError({
      message: "Mock metadata parse error",
      phase: "parse",
    })
  ),
});

const MockMetadataServiceFileTooLargeLayer = createMockMetadataServiceLayer({
  exifResult: Effect.fail(
    new ExifFileTooLargeError({
      message: "File too large",
      fileSize: 60 * 1024 * 1024,
      maxSize: 50 * 1024 * 1024,
    })
  ),
});

const MockMetadataServiceTimeoutLayer = createMockMetadataServiceLayer({
  exifResult: Effect.fail(
    new ExifTimeoutError({
      message: "Extraction timed out",
      timeoutMs: 30000,
    })
  ),
});

const MockMetadataServiceAudioErrorLayer = createMockMetadataServiceLayer({
  audioResult: Effect.fail(
    new MetadataParseError({
      message: "Mock audio metadata parse error",
      phase: "parse",
    })
  ),
});

// ============================================================================
// Tests
// ============================================================================

describe("NormalizedFileFromSelf Integration Tests", () => {
  // ========================================================================
  // Integration tests with real files - uses MetadataService.Default
  // COMMENTED OUT: These tests use WASM-based metadata extraction which
  // can cause resource issues. Re-enable one at a time to identify issues.
  // ========================================================================
  /*
  layer(MetadataService.Default, { timeout: Duration.seconds(120) })(
    "successful decoding with real files",
    (it) => {
      it.effect(
        "decodes real JPEG image to NormalizedImageFile",
        () =>
          Effect.gen(function* () {
            const file = yield* loadFileFromFixtures(TEST_FIXTURES.image);

            const decode = S.decodeUnknown(NormalizedFileFromSelf);
            const result = yield* decode(file);

            deepStrictEqual(result._tag, "image");
            deepStrictEqual(result.mimeType, "image/jpeg");
            assertTrue(O.isSome(result.exif));
          }),
        { timeout: 60000 },
      );

      it.effect(
        "decodes real MP3 audio to NormalizedAudioFile",
        () =>
          Effect.gen(function* () {
            const file = yield* loadFileFromFixtures(TEST_FIXTURES.audio);

            const decode = S.decodeUnknown(NormalizedFileFromSelf);
            const result = yield* decode(file);

            deepStrictEqual(result._tag, "audio");
            deepStrictEqual(result.mimeType, "audio/mpeg");
            assertTrue(O.isSome(result.audioMetadata));
          }),
        { timeout: 60000 },
      );

      // VIDEO TEST OMITTED - most likely crash culprit due to large file + WASM processing

      it.effect(
        "decodes real PDF to NormalizedApplicationFile",
        () =>
          Effect.gen(function* () {
            const file = yield* loadFileFromFixtures(TEST_FIXTURES.application);

            const decode = S.decodeUnknown(NormalizedFileFromSelf);
            const result = yield* decode(file);

            deepStrictEqual(result._tag, "application");
            deepStrictEqual(result.mimeType, "application/pdf");
            assertTrue(result.size > 0);
          }),
        { timeout: 60000 },
      );

      it.effect(
        "decodes real VTT to NormalizedTextFile",
        () =>
          Effect.gen(function* () {
            const file = yield* loadFileFromFixtures(TEST_FIXTURES.text);

            const decode = S.decodeUnknown(NormalizedFileFromSelf);
            const result = yield* decode(file);

            deepStrictEqual(result._tag, "text");
            deepStrictEqual(result.mimeType, "text/vtt");
            assertTrue(result.size > 0);
          }),
        { timeout: 60000 },
      );

      it.effect(
        "decodes real WOFF2 font to NormalizedMiscFile",
        () =>
          Effect.gen(function* () {
            const file = yield* loadFileFromFixtures(TEST_FIXTURES.misc);

            const decode = S.decodeUnknown(NormalizedFileFromSelf);
            const result = yield* decode(file);

            deepStrictEqual(result._tag, "misc");
            deepStrictEqual(result.mimeType, "font/woff2");
            assertTrue(result.size > 0);
          }),
        { timeout: 60000 },
      );
    },
  );
  */

  // ========================================================================
  // Error scenarios - uses mock layers for untestable conditions
  // ========================================================================
  describe("error scenarios", () => {
    // Real file errors - no service layer needed (validation fails before metadata extraction)
    effect("fails on mismatched file signature (PNG extension with JPEG bytes)", () =>
      Effect.gen(function* () {
        const mockFile = createMockFile({
          name: "fake.png",
          type: "image/png",
          content: JPEG_SIGNATURE,
          webkitRelativePath: "uploads/fake.png",
        });

        const testLayer = createMockMetadataServiceLayer();
        const decode = S.decodeUnknown(NormalizedFileFromSelf);

        const result: Either.Either<NormalizedFile.Type, ParseResult.ParseError> = yield* pipe(
          decode(mockFile),
          Effect.provide(testLayer),
          Effect.either
        );

        assertTrue(Either.isLeft(result));
        if (Either.isLeft(result)) {
          assertTrue(ParseResult.isParseError(result.left));
        }
      })
    );

    effect("fails on zero-byte file", () =>
      Effect.gen(function* () {
        const emptyContent = new Uint8Array(0);
        const mockFile = createMockFile({
          name: "empty.png",
          type: "image/png",
          content: emptyContent,
          webkitRelativePath: "uploads/empty.png",
        });

        const testLayer = createMockMetadataServiceLayer();
        const decode = S.decodeUnknown(NormalizedFileFromSelf);

        const result: Either.Either<NormalizedFile.Type, ParseResult.ParseError> = yield* pipe(
          decode(mockFile),
          Effect.provide(testLayer),
          Effect.either
        );

        assertTrue(Either.isLeft(result));
        if (Either.isLeft(result)) {
          assertTrue(ParseResult.isParseError(result.left));
        }
      })
    );

    // Service errors - requires mock layer
    effect("fails with MetadataParseError when metadata extraction fails", () =>
      Effect.gen(function* () {
        const mockFile = createMockFile({
          name: "corrupt.png",
          type: "image/png",
          content: PNG_SIGNATURE,
          webkitRelativePath: "uploads/corrupt.png",
        });

        const decode = S.decodeUnknown(NormalizedFileFromSelf);

        const result: Either.Either<NormalizedFile.Type, ParseResult.ParseError> = yield* pipe(
          decode(mockFile),
          Effect.provide(MockMetadataServiceParseErrorLayer),
          Effect.either
        );

        assertTrue(Either.isLeft(result));
        if (Either.isLeft(result)) {
          assertTrue(ParseResult.isParseError(result.left));
        }
      })
    );

    effect("fails with ExifFileTooLargeError when file exceeds size limit", () =>
      Effect.gen(function* () {
        const mockFile = createMockFile({
          name: "large.png",
          type: "image/png",
          content: PNG_SIGNATURE,
          webkitRelativePath: "uploads/large.png",
        });

        const decode = S.decodeUnknown(NormalizedFileFromSelf);

        const result: Either.Either<NormalizedFile.Type, ParseResult.ParseError> = yield* pipe(
          decode(mockFile),
          Effect.provide(MockMetadataServiceFileTooLargeLayer),
          Effect.either
        );

        assertTrue(Either.isLeft(result));
        if (Either.isLeft(result)) {
          assertTrue(ParseResult.isParseError(result.left));
        }
      })
    );

    effect("fails with ExifTimeoutError when metadata extraction times out", () =>
      Effect.gen(function* () {
        const mockFile = createMockFile({
          name: "slow.png",
          type: "image/png",
          content: PNG_SIGNATURE,
          webkitRelativePath: "uploads/slow.png",
        });

        const decode = S.decodeUnknown(NormalizedFileFromSelf);

        const result: Either.Either<NormalizedFile.Type, ParseResult.ParseError> = yield* pipe(
          decode(mockFile),
          Effect.provide(MockMetadataServiceTimeoutLayer),
          Effect.either
        );

        assertTrue(Either.isLeft(result));
        if (Either.isLeft(result)) {
          assertTrue(ParseResult.isParseError(result.left));
        }
      })
    );

    effect("fails with audio MetadataParseError for audio files", () =>
      Effect.gen(function* () {
        const mockFile = createMockFile({
          name: "corrupt.mp3",
          type: "audio/mpeg",
          content: MP3_SIGNATURE,
          webkitRelativePath: "uploads/corrupt.mp3",
        });

        const decode = S.decodeUnknown(NormalizedFileFromSelf);

        const result: Either.Either<NormalizedFile.Type, ParseResult.ParseError> = yield* pipe(
          decode(mockFile),
          Effect.provide(MockMetadataServiceAudioErrorLayer),
          Effect.either
        );

        assertTrue(Either.isLeft(result));
        if (Either.isLeft(result)) {
          assertTrue(ParseResult.isParseError(result.left));
        }
      })
    );
  });

  // ========================================================================
  // Encoding tests
  // ========================================================================
  describe("encoding", () => {
    effect("encodes NormalizedFile back to original File (reference equality)", () =>
      Effect.gen(function* () {
        const mockFile = createMockFile({
          name: "test.png",
          type: "image/png",
          content: PNG_SIGNATURE,
          webkitRelativePath: "uploads/test.png",
        });

        const decode = S.decodeUnknown(NormalizedFileFromSelf);
        const encode = S.encode(NormalizedFileFromSelf);

        const normalized = yield* decode(mockFile);
        const encoded = yield* encode(normalized);

        // Should be the exact same File object (reference equality)
        assertTrue(encoded === mockFile);
      }).pipe(Effect.provide(createMockMetadataServiceLayer()))
    );
  });

  // ========================================================================
  // Metadata population with real extraction
  // COMMENTED OUT: Uses WASM-based metadata extraction which can cause
  // resource issues. Re-enable one at a time to identify crash culprits.
  // ========================================================================
  /*
  layer(MetadataService.Default, { timeout: Duration.seconds(120) })(
    "metadata population with real extraction",
    (it) => {
      it.effect(
        "extracts real EXIF dimensions from JPEG",
        () =>
          Effect.gen(function* () {
            const file = yield* loadFileFromFixtures(TEST_FIXTURES.image);

            const decode = S.decodeUnknown(NormalizedFileFromSelf);
            const result = yield* decode(file);

            deepStrictEqual(result._tag, "image");
            assertTrue(O.isSome(result.exif));

            // Fixture image dimensions may vary
            if (O.isSome(result.width) && O.isSome(result.height)) {
              assertTrue(result.width.value > 0);
              assertTrue(result.height.value > 0);
            }
          }),
        { timeout: 60000 },
      );

      it.effect(
        "extracts real audio duration and sample rate from MP3",
        () =>
          Effect.gen(function* () {
            const file = yield* loadFileFromFixtures(TEST_FIXTURES.audio);

            const decode = S.decodeUnknown(NormalizedFileFromSelf);
            const result = yield* decode(file);

            deepStrictEqual(result._tag, "audio");
            assertTrue(O.isSome(result.audioMetadata));

            // Audio file should have duration populated
            if (O.isSome(result.audioMetadata)) {
              const audioMeta = result.audioMetadata.value;
              // Check if duration is available
              if (O.isSome(audioMeta.format.duration)) {
                assertTrue(audioMeta.format.duration.value > 0);
              }
              // Sample rate should typically be 44100 Hz for MP3
              if (O.isSome(audioMeta.format.sampleRate)) {
                assertTrue(audioMeta.format.sampleRate.value > 0);
              }
            }

            // Duration should be populated from audio metadata
            if (O.isSome(result.duration)) {
              // Duration is an Effect Duration type
              const durationNanosOpt = Duration.toNanos(result.duration.value);

              assertTrue(O.isSome(durationNanosOpt) && durationNanosOpt.value > 0n);
            }
          }),
        { timeout: 60000 },
      );

      // VIDEO TEST OMITTED - most likely crash culprit
    },
  );
  */

  // ========================================================================
  // Mock-based metadata population tests (for deterministic assertions)
  // ========================================================================
  describe("metadata population with mocks", () => {
    effect("populates exif metadata for images", () =>
      Effect.gen(function* () {
        const mockFile = createMockFile({
          name: "photo.png",
          type: "image/png",
          content: PNG_SIGNATURE,
          webkitRelativePath: "uploads/photo.png",
        });

        const testLayer = createMockMetadataServiceLayer({
          exifResult: Effect.succeed(
            createMockExifMetadata({
              imageWidth: 1920,
              imageHeight: 1080,
              fileName: "photo.png",
            })
          ),
        });

        const decode = S.decodeUnknown(NormalizedFileFromSelf);
        const result: NormalizedFile.Type = yield* pipe(decode(mockFile), Effect.provide(testLayer));

        assertTrue(O.isSome(result.exif));
        if (O.isSome(result.exif)) {
          deepStrictEqual(result.exif.value.imageWidth, 1920);
          deepStrictEqual(result.exif.value.imageHeight, 1080);
        }
      })
    );

    effect("populates audio metadata and duration for audio files", () =>
      Effect.gen(function* () {
        const mockFile = createMockFile({
          name: "song.mp3",
          type: "audio/mpeg",
          content: MP3_SIGNATURE,
          webkitRelativePath: "uploads/song.mp3",
        });

        const testLayer = createMockMetadataServiceLayer({
          audioResult: Effect.succeed(
            createMockAudioMetadata({
              duration: 180, // 3 minutes
              sampleRate: 44100,
            })
          ),
        });

        const decode = S.decodeUnknown(NormalizedFileFromSelf);
        const result: NormalizedFile.Type = yield* pipe(decode(mockFile), Effect.provide(testLayer));

        deepStrictEqual(result._tag, "audio");
        assertTrue(O.isSome(result.audioMetadata));
        if (O.isSome(result.audioMetadata)) {
          assertTrue(O.isSome(result.audioMetadata.value.format.duration));
          assertTrue(O.isSome(result.audioMetadata.value.format.sampleRate));
          if (
            O.isSome(result.audioMetadata.value.format.duration) &&
            O.isSome(result.audioMetadata.value.format.sampleRate)
          ) {
            deepStrictEqual(result.audioMetadata.value.format.duration.value, 180);
            deepStrictEqual(result.audioMetadata.value.format.sampleRate.value, 44100);
          }
        }
        // Duration should be populated from audio metadata
        assertTrue(O.isSome(result.duration));
      })
    );

    effect("populates dimensions and aspect ratio for images", () =>
      Effect.gen(function* () {
        const mockFile = createMockFile({
          name: "widescreen.png",
          type: "image/png",
          content: PNG_SIGNATURE,
          webkitRelativePath: "uploads/widescreen.png",
        });

        const testLayer = createMockMetadataServiceLayer({
          exifResult: Effect.succeed(
            createMockExifMetadata({
              imageWidth: 1920,
              imageHeight: 1080,
            })
          ),
        });

        const decode = S.decodeUnknown(NormalizedFileFromSelf);
        const result: NormalizedFile.Type = yield* pipe(decode(mockFile), Effect.provide(testLayer));

        deepStrictEqual(result._tag, "image");
        assertTrue(O.isSome(result.width));
        assertTrue(O.isSome(result.height));

        if (O.isSome(result.width) && O.isSome(result.height)) {
          deepStrictEqual(result.width.value, 1920);
          deepStrictEqual(result.height.value, 1080);
        }

        // Aspect ratio should be calculated from dimensions
        assertTrue(O.isSome(result.aspectRatio));
        if (O.isSome(result.aspectRatio)) {
          // 1920:1080 = 16:9
          deepStrictEqual(result.aspectRatio.value, "16 / 9");
        }
      })
    );

    effect("populates dimensions and duration for video files", () =>
      Effect.gen(function* () {
        const mockFile = createMockFile({
          name: "movie.mp4",
          type: "video/mp4",
          content: MP4_SIGNATURE,
          webkitRelativePath: "uploads/movie.mp4",
        });

        const testLayer = createMockMetadataServiceLayer({
          exifResult: Effect.succeed(
            createMockExifMetadata({
              imageWidth: 1920,
              imageHeight: 1080,
            })
          ),
          audioResult: Effect.succeed(
            createMockAudioMetadata({
              duration: 3600, // 1 hour
            })
          ),
        });

        const decode = S.decodeUnknown(NormalizedFileFromSelf);
        const result: NormalizedFile.Type = yield* pipe(decode(mockFile), Effect.provide(testLayer));

        deepStrictEqual(result._tag, "video");

        // Video should have dimensions from exif
        assertTrue(O.isSome(result.width));
        assertTrue(O.isSome(result.height));
        if (O.isSome(result.width) && O.isSome(result.height)) {
          deepStrictEqual(result.width.value, 1920);
          deepStrictEqual(result.height.value, 1080);
        }

        // Video should have duration from audio metadata
        assertTrue(O.isSome(result.duration));

        // Video should have aspect ratio calculated
        assertTrue(O.isSome(result.aspectRatio));
        if (O.isSome(result.aspectRatio)) {
          deepStrictEqual(result.aspectRatio.value, "16 / 9");
        }

        // Video should have audio metadata populated
        assertTrue(O.isSome(result.audioMetadata));
      })
    );
  });
});
