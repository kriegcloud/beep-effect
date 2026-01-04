---
name: normalized-file-integration-tests
version: 3
created: 2025-12-10T14:30:00Z
iterations: 2
---

# NormalizedFileFromSelf Integration Tests - Refined Prompt

## Context

The `NormalizedFileFromSelf` schema in `packages/common/schema/src/integrations/files/File.ts` is a `Schema.transformOrFail` that:

1. **Input**: `FileFromSelf` (native browser File API object)
2. **Output**: `NormalizedFile` (discriminated union: `NormalizedImageFile`, `NormalizedAudioFile`, `NormalizedVideoFile`, `NormalizedApplicationFile`, `NormalizedTextFile`, `NormalizedMiscFile`)
3. **Dependencies**: Requires `MetadataService` from Effect context during decode
4. **Validation**: Uses `fileTypeChecker.validateFileType()` to verify file signature matches extension

**Current Test State** (`packages/common/schema/test/integrations/files/NormalizedFileFromSelf.test.ts`):
- 732 lines with `@ts-nocheck` at top (type inference workaround)
- 17 tests across 4 describe blocks: "successful decoding" (6), "error scenarios" (7), "encoding" (1), "metadata population" (3)
- Uses mock files with byte signatures only (no real file content)
- Uses `createMockMetadataServiceLayer()` instead of real WASM-based metadata extraction

**MetadataService Architecture** (`packages/common/schema/src/integrations/files/metadata/Metadata.service.ts`):
```typescript
class MetadataService extends Effect.Service<MetadataService>()($I`MetadataService`, {
  effect: Effect.all([exifToolServiceEffect, parseAudioMetadata], { concurrency: 2 })
    .pipe(Effect.map(([exif, audio]) => ({ exif, audio })))
}) {}
```

The service dynamically loads:
- `@uswriting/exiftool` WASM module for EXIF extraction (50MB limit, 30s timeout)
- `music-metadata` for audio metadata parsing

**Service Interface Shape:**
```typescript
{
  exif: {
    extractMetadata(file: File): Effect<ExifMetadata, MetadataParseError | ExifFileTooLargeError | ExifTimeoutError>;
    extractRaw(file: File): Effect<ExifMetadataValue, ...>;
    writeMetadata(file: File, tags: Record<string, unknown>): Effect<ArrayBuffer, MetadataParseError>;
  };
  audio: {
    parseBlob(input: File | Blob): Effect<IAudioMetadata.Type, MetadataParseError>;
    parseBuffer(uint8Array: Uint8Array): Effect<IAudioMetadata.Type, MetadataParseError>;
    parseWebStream(stream: ReadableStream<Uint8Array>): Effect<IAudioMetadata.Type, MetadataParseError>;
  };
}
```

## Objective

Refactor the test file to create **integration tests** that:

1. **Fetch real files from URLs** instead of creating mock files with byte signatures
2. **Use `MetadataService.Default`** for actual WASM-based metadata extraction
3. **Remove `@ts-nocheck`** and fix type safety with explicit annotations
4. **Maintain test coverage** for all 6 file categories and error scenarios
5. **Handle network operations** gracefully with proper Effect patterns

**Success Criteria:**
- All tests pass with `bun test packages/common/schema/test/integrations/files/NormalizedFileFromSelf.test.ts`
- No `@ts-nocheck` or `@ts-ignore` directives
- Real metadata extracted from real files (EXIF dimensions, audio duration, etc.)
- Network errors handled gracefully (tests should not fail due to transient network issues)
- Test execution completes within reasonable time (use `layer()` with timeout)

## Role

You are an Effect-first TypeScript developer with expertise in:
- Effect Schema testing with `transformOrFail` and service dependencies
- `@beep/testkit` patterns (`effect`, `layer`, `scoped`, `flakyTest`)
- Integration testing with real external dependencies
- File type validation and metadata extraction

## Constraints

### Required Patterns (from AGENTS.md)

```typescript
// Namespace imports - REQUIRED
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as S from "effect/Schema";
import * as O from "effect/Option";
import * as Either from "effect/Either";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as Duration from "effect/Duration";
import * as DateTime from "effect/DateTime";
import * as Schedule from "effect/Schedule";

// Named import for pipe - acceptable exception per AGENTS.md
import { pipe } from "effect";

// Test imports - REQUIRED
import { describe, effect, layer, scoped, flakyTest, assertTrue, deepStrictEqual, strictEqual } from "@beep/testkit";

// Discriminated union type imports for Match patterns
import type { NormalizedImageFile, NormalizedAudioFile, NormalizedVideoFile } from "@beep/schema/integrations/files";
```

### Forbidden Patterns

```typescript
// NEVER use native array methods
items.map(fn)        // Use: F.pipe(items, A.map(fn))
items.filter(fn)     // Use: F.pipe(items, A.filter(fn))

// NEVER use async/await
async function test() { await promise }  // Use: Effect.gen + yield*

// NEVER use switch statements
switch(x) { case: ... }  // Use: Match.value(x).pipe(...)

// NEVER use native Date
new Date()  // Use: DateTime.unsafeNow()
```

### Test Architecture

**Decision Tree for Test Organization:**

1. **Use `layer()` with `MetadataService.Default` when:**
   - Testing real metadata extraction from actual files
   - Verifying EXIF/audio metadata is correctly populated
   - Need actual WASM modules to execute
   - Example: Decoding real JPEG/MP3/MP4 files with metadata validation

2. **Use `effect()` with `Effect.provide(MockLayer)` when:**
   - Testing error handling that cannot be reproduced with real files
   - Simulating edge cases (50MB+ files, timeouts, parse failures)
   - Need deterministic error injection for specific error types
   - Example: ExifFileTooLargeError, ExifTimeoutError, MetadataParseError

**Pattern Examples:**

```typescript
// Pattern 1: Integration tests with real services - use layer()
layer(MetadataService.Default, { timeout: Duration.seconds(120) })(
  "integration tests with real metadata extraction",
  (it) => {
    it.effect("test name", () =>
      Effect.gen(function* () {
        // Real file fetching + real WASM metadata extraction
        const file = yield* fetchFileFromUrl(TEST_URLS.image, "test.jpg");
        const result = yield* S.decodeUnknown(NormalizedFileFromSelf)(file);
        // Assert real metadata populated
      })
    );
  }
);

// Pattern 2: Mock error scenarios - use effect() + Effect.provide()
effect("test specific error", () =>
  Effect.gen(function* () {
    const mockFile = createMockFile({ /* ... */ });
    const result = yield* pipe(
      S.decodeUnknown(NormalizedFileFromSelf)(mockFile),
      Effect.provide(MockErrorLayer),
      Effect.either
    );
    assertTrue(Either.isLeft(result));
  })
);
```

### File Fetching Pattern

**FetchFileError Schema (following @beep/schema conventions):**

```typescript
class FetchFileError extends S.TaggedError<FetchFileError>()("FetchFileError", {
  message: S.String,
  cause: S.optional(S.Unknown),
  url: S.optional(S.String),
  httpStatus: S.optional(S.Number),
  phase: S.optional(S.Literal("fetch", "blob", "conversion")),
}) {}
```

**File Fetching Implementation:**

```typescript
const fetchFileFromUrl = (url: string, filename: string): Effect.Effect<File, FetchFileError> =>
  Effect.gen(function* () {
    const response = yield* Effect.tryPromise({
      try: () => fetch(url),
      catch: (cause) => new FetchFileError({
        message: `Failed to fetch ${url}`,
        cause,
        url,
        phase: "fetch",
      }),
    });

    if (!response.ok) {
      return yield* Effect.fail(
        new FetchFileError({
          message: `HTTP ${response.status} for ${url}`,
          url,
          httpStatus: response.status,
          phase: "fetch",
        })
      );
    }

    const blob = yield* Effect.tryPromise({
      try: () => response.blob(),
      catch: (cause) => new FetchFileError({
        message: `Failed to read blob from ${url}`,
        cause,
        url,
        phase: "blob",
      }),
    });

    // Validate blob.type and fallback if empty (some servers don't set Content-Type)
    const mimeType = blob.type === ""
      ? inferMimeTypeFromExtension(filename)
      : blob.type;

    return new File([blob], filename, { type: mimeType });
  });

// Helper to infer MIME type from file extension when blob.type is empty
const inferMimeTypeFromExtension = (filename: string): string => {
  const ext = pipe(filename, Str.split("."), A.last, O.getOrElse(() => ""));
  const mimeMap: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    mp3: "audio/mpeg",
    mp4: "video/mp4",
    pdf: "application/pdf",
    vtt: "text/vtt",
    woff2: "font/woff2",
  };
  return pipe(ext, Str.toLowerCase, (e) => mimeMap[e] ?? "application/octet-stream");
};
```

### Hybrid Approach for Error Scenarios

Some error scenarios cannot be tested with real files:
- `ExifFileTooLargeError` - requires 50MB+ file (impractical to fetch)
- `ExifTimeoutError` - requires artificially slow extraction
- Specific `MetadataParseError` conditions

For these, continue using `createMockMetadataServiceLayer()` with configured error results.

## Resources

### Real File URLs for Testing

| Category | URL | Filename | Expected Type | Est. Size |
|----------|-----|----------|---------------|-----------|
| **Image (JPEG)** | `https://picsum.photos/seed/NWbJM2B/640/480` | `test-image.jpg` | `image/jpeg` | ~50KB |
| **Audio (MP3)** | `https://dl.espressif.com/dl/audio/ff-16b-2c-44100hz.mp3` | `test-audio.mp3` | `audio/mpeg` | ~300KB |
| **Video (MP4)** | `https://file-examples.com/storage/fef1706276683dc0cba7b4c/2017/04/file_example_MP4_480_1_5MG.mp4` | `test-video.mp4` | `video/mp4` | ~1.5MB |
| **Application (PDF)** | `https://ontheline.trincoll.edu/images/bookdown/sample-local-pdf.pdf` | `test-document.pdf` | `application/pdf` | ~25KB |
| **Text (VTT)** | `https://gist.githubusercontent.com/samdutton/ca37f3adaf4e23679957b8083e061177/raw/sample.vtt` | `test-subtitles.vtt` | `text/vtt` | ~1KB |
| **Misc (WOFF2)** | `https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2` | `test-font.woff2` | `font/woff2` | ~15KB |

### Files to Read

1. **Schema Under Test**: `packages/common/schema/src/integrations/files/File.ts` (lines 478-571 for `NormalizedFileFromSelf`)
2. **MetadataService**: `packages/common/schema/src/integrations/files/metadata/Metadata.service.ts`
3. **Error Types**: `packages/common/schema/src/integrations/files/exif-metadata/errors.ts`
4. **Current Tests**: `packages/common/schema/test/integrations/files/NormalizedFileFromSelf.test.ts`
5. **Testkit API**: `tooling/testkit/src/index.ts`, `tooling/testkit/AGENTS.md`

### Import Paths

```typescript
// Schema and types
import { NormalizedFileFromSelf, NormalizedFile, ExifMetadata } from "@beep/schema/integrations/files";

// MetadataService
import { MetadataService } from "@beep/schema/integrations/files/metadata/Metadata.service";

// Error types
import { MetadataParseError, ExifFileTooLargeError, ExifTimeoutError } from "@beep/schema/integrations/files/exif-metadata";

// Audio metadata types
import { IAudioMetadata } from "@beep/schema/integrations/files/metadata/types";
```

## Output Specification

### File Structure

```typescript
/**
 * @file NormalizedFileFromSelf.test.ts
 * @description Integration tests for NormalizedFileFromSelf schema with real files
 */

import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as S from "effect/Schema";
import * as O from "effect/Option";
import * as Either from "effect/Either";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as Str from "effect/String";
import * as Duration from "effect/Duration";
import * as DateTime from "effect/DateTime";
import * as Schedule from "effect/Schedule";
import { pipe } from "effect";
import { describe, effect, layer, flakyTest, assertTrue, assertFalse, deepStrictEqual, strictEqual } from "@beep/testkit";

// Schema imports
import { NormalizedFileFromSelf, NormalizedFile, ExifMetadata } from "@beep/schema/integrations/files";
import { MetadataService } from "@beep/schema/integrations/files/metadata/Metadata.service";
import { MetadataParseError, ExifFileTooLargeError, ExifTimeoutError } from "@beep/schema/integrations/files/exif-metadata";
import { IAudioMetadata } from "@beep/schema/integrations/files/metadata/types";

// Discriminated union type imports for assertions
import type { NormalizedImageFile, NormalizedAudioFile, NormalizedVideoFile } from "@beep/schema/integrations/files";

// ============================================================================
// Test Configuration
// ============================================================================

const TEST_URLS = {
  image: "https://picsum.photos/seed/NWbJM2B/640/480",
  audio: "https://dl.espressif.com/dl/audio/ff-16b-2c-44100hz.mp3",
  video: "https://file-examples.com/storage/fef1706276683dc0cba7b4c/2017/04/file_example_MP4_480_1_5MG.mp4",
  application: "https://ontheline.trincoll.edu/images/bookdown/sample-local-pdf.pdf",
  text: "https://gist.githubusercontent.com/samdutton/ca37f3adaf4e23679957b8083e061177/raw/sample.vtt",
  misc: "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2",
} as const;

// File signature constants for validation tests
const PNG_SIGNATURE = new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
const JPEG_SIGNATURE = new Uint8Array([0xFF, 0xD8, 0xFF]);

/**
 * Mock file factory for error scenario tests.
 * Creates a browser File object with controlled content for testing edge cases.
 *
 * @param config - File configuration
 * @param config.name - File name with extension
 * @param config.type - MIME type
 * @param config.content - File content as Uint8Array (e.g., file signature bytes)
 * @param config.size - Optional size override (defaults to content.length)
 * @returns File object suitable for testing
 */
const createMockFile = (config: {
  name: string;
  type: string;
  content: Uint8Array;
  size?: number;
}): File => {
  const blob = new Blob([config.content], { type: config.type });
  const file = new File([blob], config.name, {
    type: config.type,
    lastModified: DateTime.toEpochMillis(DateTime.unsafeNow()),
  });
  return file;
};

// ============================================================================
// File Fetching Utilities
// ============================================================================

class FetchFileError extends S.TaggedError<FetchFileError>()("FetchFileError", {
  message: S.String,
  cause: S.optional(S.Unknown),
}) {}

const fetchFileFromUrl = (url: string, filename: string): Effect.Effect<File, FetchFileError> =>
  Effect.gen(function* () {
    // Implementation as shown in Constraints section
  });

// ============================================================================
// Mock Layer Factory (for error scenarios only)
// ============================================================================

/**
 * Creates a mock MetadataService layer with configurable results.
 * Use this ONLY for error scenarios that cannot be tested with real files.
 *
 * @param config - Optional configuration for exif and audio results
 * @returns Layer that provides a mocked MetadataService
 */
const createMockMetadataServiceLayer = (config?: {
  exifResult?: Effect.Effect<ExifMetadata, MetadataParseError | ExifFileTooLargeError | ExifTimeoutError>;
  audioResult?: Effect.Effect<IAudioMetadata.Type, MetadataParseError>;
}): Layer.Layer<MetadataService> => {
  // Default success results with minimal valid metadata
  const defaultExif = Effect.succeed(
    new ExifMetadata({
      raw: {},
      imageWidth: O.none(),
      imageHeight: O.none(),
      fileName: O.none(),
    })
  );

  const defaultAudio = Effect.succeed(
    S.decodeUnknownSync(IAudioMetadata)({
      format: {
        trackInfo: [],
        tagTypes: [],
        duration: null,
        sampleRate: null,
      },
      native: {},
      quality: { warnings: [] },
      common: {
        track: { no: null, of: null },
        disk: { no: null, of: null },
        movementIndex: { no: null, of: null },
      },
    })
  );

  // Use Layer.succeed with proper MetadataService structure
  // @ts-expect-error - MetadataService requires _tag from Effect.Service, but mock doesn't need it at runtime
  return Layer.succeed(MetadataService, {
    exif: {
      extractMetadata: (_file: File) => config?.exifResult ?? defaultExif,
      extractRaw: (_file: File) => Effect.succeed({} as ExifMetadataValue),
      writeMetadata: (_file: File, _tags: Record<string, unknown>) =>
        Effect.succeed(new ArrayBuffer(0)),
    },
    audio: {
      parseBlob: (_input: File | Blob) => config?.audioResult ?? defaultAudio,
      parseBuffer: (_uint8Array: Uint8Array) => config?.audioResult ?? defaultAudio,
      parseWebStream: (_stream: ReadableStream<Uint8Array>) => config?.audioResult ?? defaultAudio,
    },
  });
};

// Pre-configured error layers for common scenarios
const MockMetadataServiceFileTooLargeLayer = createMockMetadataServiceLayer({
  exifResult: Effect.fail(
    new ExifFileTooLargeError({
      message: "File exceeds 50MB limit",
      fileSize: 60 * 1024 * 1024,
      maxSize: 50 * 1024 * 1024,
    })
  ),
});

const MockMetadataServiceTimeoutLayer = createMockMetadataServiceLayer({
  exifResult: Effect.fail(
    new ExifTimeoutError({
      message: "EXIF extraction timed out",
      timeoutMs: 30000,
    })
  ),
});

const MockMetadataServiceParseErrorLayer = createMockMetadataServiceLayer({
  exifResult: Effect.fail(
    new MetadataParseError({
      message: "Failed to parse EXIF metadata",
      phase: "parse",
    })
  ),
});

// ============================================================================
// Tests
// ============================================================================

describe("NormalizedFileFromSelf Integration Tests", () => {
  // Use layer() for integration tests with real MetadataService
  layer(MetadataService.Default, { timeout: Duration.seconds(120) })(
    "successful decoding with real files",
    (it) => {
      it.effect("decodes real JPEG image", () => /* ... */);
      it.effect("decodes real MP3 audio", () => /* ... */);
      it.effect("decodes real MP4 video", () => /* ... */);
      it.effect("decodes real PDF application", () => /* ... */);
      it.effect("decodes real VTT text", () => /* ... */);
      it.effect("decodes real WOFF2 font (misc)", () => /* ... */);
    }
  );

  describe("error scenarios", () => {
    // PATTERN GUIDE:
    // - Real file errors (signature mismatch, zero-byte): Use effect() with createMockFile(), no layer needed
    // - Service errors (ExifFileTooLarge, Timeout, ParseError): Use effect() + Effect.provide(MockErrorLayer)

    // Real file error - no service layer needed
    effect("fails on mismatched signature", () =>
      Effect.gen(function* () {
        const mockFile = createMockFile({ name: "fake.jpg", type: "image/jpeg", content: new Uint8Array([0x00, 0x00]) });
        const result = yield* pipe(S.decodeUnknown(NormalizedFileFromSelf)(mockFile), Effect.either);
        assertTrue(Either.isLeft(result));
      })
    );

    // Real file error - no service layer needed
    effect("fails on zero-byte file", () =>
      Effect.gen(function* () {
        const mockFile = createMockFile({ name: "empty.jpg", type: "image/jpeg", content: new Uint8Array([]) });
        const result = yield* pipe(S.decodeUnknown(NormalizedFileFromSelf)(mockFile), Effect.either);
        assertTrue(Either.isLeft(result));
      })
    );

    // Service error - requires mock layer
    effect("fails with ExifFileTooLargeError", () =>
      Effect.gen(function* () {
        const mockFile = createMockFile({ name: "large.png", type: "image/png", content: PNG_SIGNATURE });
        const result = yield* pipe(
          S.decodeUnknown(NormalizedFileFromSelf)(mockFile),
          Effect.provide(MockMetadataServiceFileTooLargeLayer),
          Effect.either
        );
        assertTrue(Either.isLeft(result));
      })
    );

    // Service error - requires mock layer
    effect("fails with ExifTimeoutError", () =>
      Effect.gen(function* () {
        const mockFile = createMockFile({ name: "slow.jpg", type: "image/jpeg", content: JPEG_SIGNATURE });
        const result = yield* pipe(
          S.decodeUnknown(NormalizedFileFromSelf)(mockFile),
          Effect.provide(MockMetadataServiceTimeoutLayer),
          Effect.either
        );
        assertTrue(Either.isLeft(result));
      })
    );

    // Service error - requires mock layer
    effect("fails with MetadataParseError", () =>
      Effect.gen(function* () {
        const mockFile = createMockFile({ name: "corrupt.jpg", type: "image/jpeg", content: JPEG_SIGNATURE });
        const result = yield* pipe(
          S.decodeUnknown(NormalizedFileFromSelf)(mockFile),
          Effect.provide(MockMetadataServiceParseErrorLayer),
          Effect.either
        );
        assertTrue(Either.isLeft(result));
      })
    );
  });

  layer(MetadataService.Default, { timeout: Duration.seconds(120) })(
    "encoding",
    (it) => {
      it.effect("encodes back to original File (reference equality)", () => /* ... */);
    }
  );

  layer(MetadataService.Default, { timeout: Duration.seconds(120) })(
    "metadata population with real extraction",
    (it) => {
      it.effect("extracts real EXIF dimensions from JPEG", () => /* ... */);
      it.effect("extracts real audio duration from MP3", () => /* ... */);
      it.effect("extracts real dimensions and duration from MP4", () => /* ... */);
    }
  );
});
```

### Deliverables

1. **Refactored test file**: `packages/common/schema/test/integrations/files/NormalizedFileFromSelf.test.ts`
2. **All 17+ tests passing** with real file integration
3. **No type suppression directives** (`@ts-nocheck`, `@ts-ignore`)

## Examples

### Example: Decoding Real JPEG Image

```typescript
it.effect("decodes real JPEG image to NormalizedImageFile", () =>
  Effect.gen(function* () {
    const file = yield* fetchFileFromUrl(TEST_URLS.image, "test-image.jpg");

    const decode = S.decodeUnknown(NormalizedFileFromSelf);
    const result = yield* decode(file);

    deepStrictEqual(result._tag, "image");
    deepStrictEqual(result.mimeType, "image/jpeg");
    assertTrue(O.isSome(result.exif));

    // Real EXIF should have dimensions from picsum (640x480)
    if (O.isSome(result.exif)) {
      assertTrue(O.isSome(result.width));
      assertTrue(O.isSome(result.height));
    }
  })
);
```

### Example: Testing Error Scenario with Mock Layer

```typescript
effect("fails with ExifFileTooLargeError for oversized files", () =>
  Effect.gen(function* () {
    // Create a small mock file (we can't fetch 50MB+ files)
    const mockFile = createMockFile({
      name: "large.png",
      type: "image/png",
      content: PNG_SIGNATURE,
      size: PNG_SIGNATURE.length,
    });

    // Mock layer that simulates file too large error
    const errorLayer = createMockMetadataServiceLayer({
      exifResult: Effect.fail(
        new ExifFileTooLargeError({
          message: "File exceeds 50MB limit",
          fileSize: 60 * 1024 * 1024,
          maxSize: 50 * 1024 * 1024,
        })
      ),
    });

    const decode = S.decodeUnknown(NormalizedFileFromSelf);
    const result = yield* F.pipe(
      decode(mockFile),
      Effect.provide(errorLayer),
      Effect.either
    );

    assertTrue(Either.isLeft(result));
  })
);
```

### Example: Network Resilience with Effect.retry

**IMPORTANT:** Use `Effect.retry` + `Schedule` for network resilience. Reserve `flakyTest` ONLY for test infrastructure issues (not network flakiness).

```typescript
it.effect("decodes real audio file with network retry", () =>
  Effect.gen(function* () {
    // Define retry strategy: exponential backoff with max 3 retries over 30 seconds
    const retrySchedule = pipe(
      Schedule.exponential(Duration.millis(500)), // Start with 500ms delay
      Schedule.compose(Schedule.recurs(3)), // Max 3 retries
      Schedule.compose(Schedule.elapsed), // Track elapsed time
      Schedule.whileOutput((elapsed) => Duration.lessThan(elapsed, Duration.seconds(30)))
    );

    const file = yield* pipe(
      fetchFileFromUrl(TEST_URLS.audio, "test-audio.mp3"),
      Effect.retry(retrySchedule),
      Effect.tapError((error) =>
        Effect.logError(`Network fetch failed after retries: ${error.message}`)
      )
    );

    const decode = S.decodeUnknown(NormalizedFileFromSelf);
    const result = yield* decode(file);

    deepStrictEqual(result._tag, "audio");
    assertTrue(O.isSome(result.duration));
  })
);
```

**When to use `flakyTest`:**
- Test infrastructure timeouts (test harness issues)
- Race conditions in test setup/teardown
- Non-deterministic timing issues in test framework

**When to use `Effect.retry`:**
- Network request failures (fetch, HTTP errors)
- Transient external service errors
- Resource availability issues

### Example: Explicit Type Annotations (Fixing @ts-nocheck)

**When type annotations are required:**

1. **Effect.provide inference failures** - TypeScript infers `unknown` instead of `never` for context
2. **Complex pipe chains** - Multiple transformations obscure type inference
3. **Generic effect factories** - Functions that return Effect with variable requirements
4. **Schema decode with custom context** - When providing layers to schema transformations

```typescript
// Scenario 1: Helper function with layer provision (explicit return type)
const decodeWithLayer = <R>(
  file: File,
  testLayer: Layer.Layer<MetadataService, never, R>
): Effect.Effect<NormalizedFile.Type, S.ParseError, R> =>
  pipe(
    S.decodeUnknown(NormalizedFileFromSelf)(file),
    Effect.provide(testLayer)
  );

// Scenario 2: Complex assertion pattern (annotate result variable)
const result: Either.Either<NormalizedFile.Type, S.ParseError> = yield* pipe(
  S.decodeUnknown(NormalizedFileFromSelf)(mockFile),
  Effect.provide(MockErrorLayer),
  Effect.either
);

// Scenario 3: Generic test helper (explicit function signature)
const testFileDecoding = <E, R>(
  file: File,
  layer: Layer.Layer<MetadataService, E, R>
): Effect.Effect<void, E | S.ParseError, R> =>
  Effect.gen(function* () {
    const result = yield* pipe(
      S.decodeUnknown(NormalizedFileFromSelf)(file),
      Effect.provide(layer)
    );
    assertTrue(result._tag === "image" || result._tag === "audio");
  });

// Scenario 4: No annotation needed - inference works
it.effect("simple decode with no mocking", () =>
  Effect.gen(function* () {
    const file = yield* fetchFileFromUrl(TEST_URLS.image, "test.jpg");
    // Type inference works when using layer() test wrapper
    const result = yield* S.decodeUnknown(NormalizedFileFromSelf)(file);
    deepStrictEqual(result._tag, "image");
  })
);
```

### Expected Metadata Fields to Assert

**Image Files (JPEG from picsum.photos):**
```typescript
// Expected assertions for real JPEG
assertTrue(result._tag === "image");
assertTrue(O.isSome(result.exif));
assertTrue(O.isSome(result.width)); // Should be 640
assertTrue(O.isSome(result.height)); // Should be 480
deepStrictEqual(result.mimeType, "image/jpeg");

// Optional: Verify specific EXIF fields if present
if (O.isSome(result.exif)) {
  const exif = result.exif.value;
  // picsum may include: ImageWidth, ImageHeight, Make, Model, Orientation
  assertTrue(O.isSome(exif.imageWidth));
  assertTrue(O.isSome(exif.imageHeight));
}
```

**Audio Files (MP3):**
```typescript
// Expected assertions for real MP3
assertTrue(result._tag === "audio");
assertTrue(O.isSome(result.duration)); // Should be ~10-30 seconds
deepStrictEqual(result.mimeType, "audio/mpeg");

// Audio-specific metadata assertions
if (O.isSome(result.duration)) {
  const durationSeconds = result.duration.value;
  assertTrue(durationSeconds > 0 && durationSeconds < 120); // Reasonable range
}

// Optional: Check audio metadata fields
const audioMeta = result.audioMetadata;
if (O.isSome(audioMeta)) {
  const meta = audioMeta.value;
  // Expected fields: format.duration, format.sampleRate, format.bitrate
  assertTrue(O.isSome(meta.format.duration));
  assertTrue(O.isSome(meta.format.sampleRate)); // Typically 44100 Hz
}
```

**Video Files (MP4):**
```typescript
// Expected assertions for real MP4
assertTrue(result._tag === "video");
assertTrue(O.isSome(result.width)); // Should be 640
assertTrue(O.isSome(result.height)); // Should be 480
assertTrue(O.isSome(result.duration)); // Should be ~30 seconds
deepStrictEqual(result.mimeType, "video/mp4");

// Verify dimensions and duration are reasonable
if (O.isSome(result.width) && O.isSome(result.height)) {
  assertTrue(result.width.value === 640);
  assertTrue(result.height.value === 480);
}

if (O.isSome(result.duration)) {
  const durationSeconds = result.duration.value;
  assertTrue(durationSeconds > 0 && durationSeconds < 60);
}
```

**Application Files (PDF):**
```typescript
// Expected assertions for real PDF
assertTrue(result._tag === "application");
deepStrictEqual(result.mimeType, "application/pdf");
assertTrue(result.size > 0);

// PDFs typically don't have EXIF metadata
// But may have PDF-specific metadata in the future
```

**Text Files (VTT):**
```typescript
// Expected assertions for real VTT
assertTrue(result._tag === "text");
deepStrictEqual(result.mimeType, "text/vtt");
assertTrue(result.size > 0);
```

**Misc Files (WOFF2):**
```typescript
// Expected assertions for real WOFF2
assertTrue(result._tag === "misc");
deepStrictEqual(result.mimeType, "font/woff2");
assertTrue(result.size > 0);
```

## Verification Checklist

### Code Quality
- [ ] Test file has no `@ts-nocheck` or `@ts-ignore` directives
- [ ] All imports use namespace style (`import * as Effect from "effect/Effect"`)
- [ ] `pipe` import documented as acceptable exception
- [ ] No native Array/String methods used (use `A.map`, `Str.split`, etc.)
- [ ] No `async/await` - only `Effect.gen` with `yield*`
- [ ] No native `Date` - only `DateTime.unsafeNow()`
- [ ] Type annotations added where Effect.provide inference fails

### Network & Infrastructure
- [ ] `fetchFileFromUrl` implemented with complete FetchFileError schema
- [ ] Blob.type validation with fallback to extension-based inference
- [ ] `Effect.retry` + `Schedule` used for network resilience (NOT `flakyTest`)
- [ ] `flakyTest` reserved only for test infrastructure issues
- [ ] `layer()` timeout configured via `Duration.seconds(120)`
- [ ] Test completion time monitored (should complete within 3-5 minutes for all tests)

### Test Organization
- [ ] `layer()` used for integration tests with `MetadataService.Default`
- [ ] `effect()` + `Effect.provide()` used for mock error scenarios
- [ ] Error scenarios use `Effect.either` to capture failures
- [ ] Mock layers retained only for untestable error conditions (50MB+ files, timeouts)
- [ ] Pre-configured error layers defined (FileTooLarge, Timeout, ParseError)

### Coverage
- [ ] All 6 file categories tested with real files (image, audio, video, application, text, misc)
- [ ] Real metadata assertions included for applicable types:
  - EXIF dimensions (width/height) for images
  - Audio duration and sample rate for MP3
  - Video dimensions and duration for MP4
- [ ] Error scenarios cover all error types (FetchFileError, ExifFileTooLargeError, ExifTimeoutError, MetadataParseError)
- [ ] Encoding test verifies reference equality
- [ ] All 17+ original tests mapped to refactored equivalents

### Execution
- [ ] All tests pass with `bun test packages/common/schema/test/integrations/files/NormalizedFileFromSelf.test.ts`
- [ ] No type errors with `bun run check`
- [ ] No lint errors with `bun run lint`

---

## Metadata

### Research Sources

**Files Explored:**
- `packages/common/schema/test/integrations/files/NormalizedFileFromSelf.test.ts` - Current test implementation
- `packages/common/schema/src/integrations/files/File.ts` - Schema under test
- `packages/common/schema/src/integrations/files/metadata/Metadata.service.ts` - MetadataService with WASM
- `packages/common/schema/src/integrations/files/exif-metadata/errors.ts` - Error types
- `packages/_internal/db-admin/test/AccountRepo.test.ts` - Integration test patterns
- `packages/shared/server/test/EventStreamHub.test.ts` - Scoped test patterns
- `packages/common/utils/test/md5/parallel-hasher.test.ts` - File/Blob handling patterns
- `tooling/testkit/AGENTS.md` - Test harness documentation

**Real File URLs Verified:**
- picsum.photos (JPEG images)
- dl.espressif.com (MP3 audio)
- file-examples.com (MP4 video)
- ontheline.trincoll.edu (PDF)
- gist.githubusercontent.com (VTT subtitles)
- fonts.gstatic.com (WOFF2 fonts)

**AGENTS.md Files Consulted:**
- Root `AGENTS.md`
- `tooling/testkit/AGENTS.md`
- `packages/common/schema/AGENTS.md`

### Refinement History

| Iteration | Issues Found                          | Fixes Applied                                    |
|-----------|---------------------------------------|--------------------------------------------------|
| 0         | Initial                               | N/A                                              |
| 1         | 8 issues (test org, FetchFileError, mock layer, network, pipe, types, blob, checklist) | Decision tree, schemas, Effect.retry, type scenarios |
| 2         | 3 issues (test org ambiguity, createMockFile, MIME pipe) | Concrete patterns, mock file helper, ternary fix |

---

## Appendix: Test Mapping

### Original Tests → Refactored Tests

**Successful Decoding (6 tests):**
1. "decodes JPEG image" → `it.effect("decodes real JPEG image to NormalizedImageFile")`
2. "decodes PNG image" → Merged into JPEG test (both test image category)
3. "decodes MP3 audio" → `it.effect("decodes real MP3 audio to NormalizedAudioFile")`
4. "decodes MP4 video" → `it.effect("decodes real MP4 video to NormalizedVideoFile")`
5. "decodes PDF document" → `it.effect("decodes real PDF to NormalizedApplicationFile")`
6. "decodes VTT text file" → `it.effect("decodes real VTT to NormalizedTextFile")`
7. "decodes WOFF2 font" → `it.effect("decodes real WOFF2 to NormalizedMiscFile")`

**Error Scenarios (7 tests):**
1. "fails on mismatched signature" → `effect("fails on mismatched file signature")` with real file + wrong extension
2. "fails on zero-byte file" → `effect("fails on empty file")` with mock empty file
3. "fails on corrupted file" → Merged into signature mismatch test
4. "fails with ExifFileTooLargeError" → `effect("fails with ExifFileTooLargeError for oversized files")` with mock layer
5. "fails with ExifTimeoutError" → `effect("fails with ExifTimeoutError on slow extraction")` with mock layer
6. "fails with MetadataParseError" → `effect("fails with MetadataParseError on invalid metadata")` with mock layer
7. "handles network failure gracefully" → `it.effect("handles network errors with FetchFileError")` with Effect.retry

**Encoding (1 test):**
1. "encodes back to original File" → `it.effect("encodes back to original File (reference equality)")`

**Metadata Population (3 tests):**
1. "extracts EXIF dimensions from JPEG" → `it.effect("extracts real EXIF dimensions from JPEG")`
2. "extracts audio duration from MP3" → `it.effect("extracts real audio duration and sample rate from MP3")`
3. "extracts video metadata from MP4" → `it.effect("extracts real dimensions and duration from MP4")`

**Total: 17+ tests** (some merged, some expanded with new network error tests)
