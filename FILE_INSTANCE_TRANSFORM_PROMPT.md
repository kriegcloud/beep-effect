# FILE_INSTANCE_TRANSFORM_PROMPT.md

> Instructions for Claude to refactor the file instance transformation system in beep-effect.

---

## Objective

Refactor the file instance transformation pipeline to:

1. **Extract image/video dimensions** from native `File` objects using `ExifMetadata`
2. **Extract audio/video duration** using browser media APIs and `DurationFromSeconds`
3. **Populate computed getters** for `aspectRatio` (currently always returns `None`)
4. **Maintain synchronous transformation** with separate async enhancement step
5. **Ensure full compatibility** with downstream consumers (`File.Model.create`, `UploadPath`)

---

## File Locations

### Primary Files (MODIFY)

| File                                                            | Purpose                                            |
|-----------------------------------------------------------------|----------------------------------------------------|
| `packages/common/schema/src/integrations/files/FileInstance.ts` | Primary target - add enhancement function, getters |

### Reference Files (READ ONLY)

| File                                                                          | Purpose                                                              |
|-------------------------------------------------------------------------------|----------------------------------------------------------------------|
| `packages/common/schema/src/integrations/files/exif-metadata/ExifMetadata.ts` | EXIF extraction API - use `ExifMetadata.extractMetadata`             |
| `packages/common/schema/src/primitives/duration.ts`                           | `DurationFromSeconds` schema for media duration                      |
| `packages/common/schema/src/integrations/files/AspectRatio.ts`                | Aspect ratio calculation - input `{ width: number; height: number }` |
| `packages/common/schema/src/integrations/files/mime-types/index.ts`           | MimeType predicates (verify API names)                               |
| `packages/shared/domain/src/entities/File/File.model.ts`                      | Consumer - verify backward compatibility                             |

---

## Current State Analysis

### FileInstance Schema (lines 129-166)

```typescript
export class FileInstance extends S.Class<FileInstance>("@beep/schema/integrations/files/FileInstance")({
  size: S.NonNegativeInt,
  type: MimeType,
  lastModified: DateTimeUtcFromAllAcceptable,
  name: S.NonEmptyTrimmedString,
  webkitRelativePath: S.NonEmptyTrimmedString,
  width: S.optionalWith(S.NonNegativeInt, { as: "Option", nullable: true }),   // NEVER POPULATED
  height: S.optionalWith(S.NonNegativeInt, { as: "Option", nullable: true }),  // NEVER POPULATED
}) {
  get aspectRatio(): O.Option<`${number} / ${number}`> {
    // ALWAYS RETURNS None because width/height are never set!
    return pipe(
      this.type,
      O.liftPredicate(P.or(MimeType.isImageType, MimeType.isVideoMimeType)),
      O.flatMap(() =>
        pipe(
          O.all({ width: this.width, height: this.height }),
          O.map(({ width, height }) => S.decodeSync(AspectRatio)({ width, height }))
        )
      )
    );
  }
}
```

### FileInstanceFromNative Transform (lines 173-188)

```typescript
export class FileInstanceFromNative extends S.transformOrFail(NativeFileInstance, FileInstance, {
  strict: false,
  decode: (nativeFile, _, ast) =>
    ParseResult.try({
      try: () =>
        S.decodeUnknownSync(FileInstance)({
          size: nativeFile.size,
          type: nativeFile.type,
          lastModified: nativeFile.lastModified,
          name: nativeFile.name,
          webkitRelativePath: nativeFile.webkitRelativePath,
          // WIDTH AND HEIGHT ARE NOT EXTRACTED!
        }),
      catch: () => new ParseResult.Type(ast, nativeFile, "failed to transform native File to FileInstance"),
    }),
  encode: (_, __, ast) => ParseResult.fail(new ParseResult.Forbidden(ast, _, "encode only schema")),
}) {}
```

### The Gap

1. `width` and `height` fields exist but are **never populated**
2. `aspectRatio` getter relies on these fields but **always returns `None`**
3. Audio/video files have no **duration** extraction
4. EXIF metadata system exists but is **not integrated**

---

## Architecture Decision: Synchronous Transform + Async Enhancement

**DO NOT** make `FileInstanceFromNative` async. This would break schema composition patterns.

**DO** add a separate enhancement function that populates metadata asynchronously:

```
FileInstanceFromNative (sync) → FileInstance (minimal fields)
                                     ↓
                          enhanceFileInstance (async Effect)
                                     ↓
                          FileInstance (with width, height, duration)
```

---

## Implementation Requirements

### 1. Add New Fields to FileInstance Schema

Add `duration` field for audio/video files:

```typescript
export class FileInstance extends S.Class<FileInstance>("@beep/schema/integrations/files/FileInstance")({
  size: S.NonNegativeInt,
  type: MimeType,
  lastModified: DateTimeUtcFromAllAcceptable,
  name: S.NonEmptyTrimmedString,
  webkitRelativePath: S.NonEmptyTrimmedString,
  width: S.optionalWith(S.NonNegativeInt, { as: "Option", nullable: true }),
  height: S.optionalWith(S.NonNegativeInt, { as: "Option", nullable: true }),
  // NEW: Duration for audio/video files
  duration: S.optionalWith(S.DurationFromSelf, { as: "Option", nullable: true }),
}) {
  // ... existing getters ...
}
```

### 2. Create Error Types

```typescript
import * as Data from "effect/Data";

export class DimensionExtractionError extends Data.TaggedError("DimensionExtractionError")<{
  readonly message: string;
  readonly cause?: unknown;
  readonly fileName?: string;
  readonly fileType?: string;
  readonly fileSize?: number;
  readonly source?: "exif" | "bitmap" | "unknown";
}> {}

export class DurationExtractionError extends Data.TaggedError("DurationExtractionError")<{
  readonly message: string;
  readonly cause?: unknown;
  readonly fileName?: string;
  readonly fileType?: string;
  readonly source?: "media-element" | "unknown";
}> {}
```

### 3. Create Dimension Extraction from ExifMetadata

**IMPORTANT**: Use the unified `ExifMetadata` schema, NOT individual tag extraction.

```typescript
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import { ExifMetadata } from "./exif-metadata";

/**
 * Extract dimensions from ExifMetadata with fallback through multiple sources.
 * Priority: FileTags → EXIF PixelDimensions → PNG → RIFF → GIF
 */
const getDimensionsFromExif = (
  metadata: ExifMetadata.Type
): O.Option<{ width: number; height: number }> =>
  F.pipe(
    // Priority 1: FileTags (most reliable container-level dimensions)
    O.all({
      width: F.pipe(
        O.fromNullable(metadata.file),
        O.flatMap((f) => O.fromNullable(f.width?.value))
      ),
      height: F.pipe(
        O.fromNullable(metadata.file),
        O.flatMap((f) => O.fromNullable(f.height?.value))
      ),
    }),
    // Priority 2: EXIF PixelDimensions
    O.orElse(() =>
      O.all({
        width: F.pipe(
          O.fromNullable(metadata.exif),
          O.flatMap((e) => O.fromNullable(e.pixelXDimension?.value))
        ),
        height: F.pipe(
          O.fromNullable(metadata.exif),
          O.flatMap((e) => O.fromNullable(e.pixelYDimension?.value))
        ),
      })
    ),
    // Priority 3: PNG headers
    O.orElse(() =>
      O.all({
        width: F.pipe(
          O.fromNullable(metadata.pngFile),
          O.flatMap((p) => O.fromNullable(p.imageWidth?.value))
        ),
        height: F.pipe(
          O.fromNullable(metadata.pngFile),
          O.flatMap((p) => O.fromNullable(p.imageHeight?.value))
        ),
      })
    ),
    // Priority 4: RIFF (WebP)
    O.orElse(() =>
      O.all({
        width: F.pipe(
          O.fromNullable(metadata.riff),
          O.flatMap((r) => O.fromNullable(r.imageWidth?.value))
        ),
        height: F.pipe(
          O.fromNullable(metadata.riff),
          O.flatMap((r) => O.fromNullable(r.imageHeight?.value))
        ),
      })
    ),
    // Priority 5: GIF
    O.orElse(() =>
      O.all({
        width: F.pipe(
          O.fromNullable(metadata.gif),
          O.flatMap((g) => O.fromNullable(g.imageWidth?.value))
        ),
        height: F.pipe(
          O.fromNullable(metadata.gif),
          O.flatMap((g) => O.fromNullable(g.imageHeight?.value))
        ),
      })
    )
  );
```

### 4. Create Dimension Extraction Effect

```typescript
/**
 * Extract dimensions from a File using EXIF metadata with bitmap fallback.
 * Returns O.none() for non-image/video files or on extraction failure.
 */
const extractDimensions = Effect.fn("extractDimensions")(function* (file: File) {
  // Only attempt for images and videos
  const isImageOrVideo = MimeType.isImageType(file.type) || MimeType.isVideoMimeType(file.type);
  if (!isImageOrVideo) {
    return O.none<{ width: number; height: number }>();
  }

  // Try EXIF extraction first
  const exifResult = yield* ExifMetadata.extractMetadata(file).pipe(
    Effect.tap(() => Effect.logDebug("EXIF metadata extracted", { fileName: file.name })),
    Effect.option
  );

  const exifDimensions = F.pipe(exifResult, O.flatMap(getDimensionsFromExif));
  if (O.isSome(exifDimensions)) {
    return exifDimensions;
  }

  // Fallback to createImageBitmap for images (browser only)
  if (MimeType.isImageType(file.type) && typeof createImageBitmap !== "undefined") {
    const bitmapResult = yield* Effect.tryPromise({
      try: async () => {
        const bitmap = await createImageBitmap(file);
        const dimensions = { width: bitmap.width, height: bitmap.height };
        bitmap.close();
        return dimensions;
      },
      catch: (e) =>
        new DimensionExtractionError({
          message: "Failed to create image bitmap",
          cause: e,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          source: "bitmap",
        }),
    }).pipe(
      Effect.tap((dims) => Effect.logDebug("Bitmap dimensions extracted", { ...dims, fileName: file.name })),
      Effect.option
    );

    return bitmapResult;
  }

  yield* Effect.logDebug("No dimensions could be extracted", { fileName: file.name, fileType: file.type });
  return O.none<{ width: number; height: number }>();
});
```

### 5. Create Duration Extraction Effect

**IMPORTANT**: Use `DurationFromSeconds` from `@beep/schema/primitives/duration`.

```typescript
import { Duration } from "effect";
import * as S from "effect/Schema";
import { DurationFromSeconds } from "../../primitives/duration";

/**
 * Extract duration from audio/video files using browser media APIs.
 * Returns O.none() for non-media files, server-side execution, or on failure.
 */
const extractMediaDuration = Effect.fn("extractMediaDuration")(function* (file: File) {
  // Only for audio/video
  const isMedia = MimeType.isAudioType(file.type) || MimeType.isVideoMimeType(file.type);
  if (!isMedia) {
    return O.none<Duration.Duration>();
  }

  // Check for browser environment (no DOM on server)
  if (typeof document === "undefined") {
    yield* Effect.logDebug("No DOM available for duration extraction (server-side)");
    return O.none<Duration.Duration>();
  }

  const element = MimeType.isVideoMimeType(file.type)
    ? document.createElement("video")
    : document.createElement("audio");

  const url = URL.createObjectURL(file);

  const durationSeconds = yield* Effect.tryPromise({
    try: () =>
      new Promise<number>((resolve, reject) => {
        element.preload = "metadata";
        element.onloadedmetadata = () => {
          URL.revokeObjectURL(url);
          resolve(element.duration);
        };
        element.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error("Failed to load media metadata"));
        };
        element.src = url;
      }),
    catch: (e) =>
      new DurationExtractionError({
        message: "Failed to extract media duration",
        cause: e,
        fileName: file.name,
        fileType: file.type,
        source: "media-element",
      }),
  }).pipe(Effect.option);

  return F.pipe(
    durationSeconds,
    O.filter((s) => Number.isFinite(s) && s > 0),
    O.map((seconds) => S.decodeUnknownSync(DurationFromSeconds)(seconds))
  );
});
```

### 6. Create Enhancement Function

**This is the key pattern**: Keep `FileInstanceFromNative` synchronous, add separate enhancement.

```typescript
/**
 * Enhance a FileInstance with extracted metadata (dimensions, duration).
 * Call this after basic FileInstance creation when async extraction is acceptable.
 */
export const enhanceFileInstance = Effect.fn("enhanceFileInstance")(
  function* (instance: FileInstance, file: File) {
    // Extract dimensions for images/videos
    const dimensions = yield* extractDimensions(file);

    // Extract duration for audio/videos
    const duration = yield* extractMediaDuration(file);

    // Return enhanced instance if any metadata was extracted
    const hasEnhancements = O.isSome(dimensions) || O.isSome(duration);

    if (!hasEnhancements) {
      return instance;
    }

    return new FileInstance({
      ...instance,
      width: F.pipe(dimensions, O.map((d) => d.width)),
      height: F.pipe(dimensions, O.map((d) => d.height)),
      duration,
    });
  }
);
```

### 7. Keep FileInstanceFromNative Synchronous

**DO NOT MODIFY** the decode logic. The transformation remains synchronous:

```typescript
// UNCHANGED - keep this synchronous
export class FileInstanceFromNative extends S.transformOrFail(NativeFileInstance, FileInstance, {
  strict: false,
  decode: (nativeFile, _, ast) =>
    ParseResult.try({
      try: () =>
        S.decodeUnknownSync(FileInstance)({
          size: nativeFile.size,
          type: nativeFile.type,
          lastModified: nativeFile.lastModified,
          name: nativeFile.name,
          webkitRelativePath: nativeFile.webkitRelativePath,
        }),
      catch: () => new ParseResult.Type(ast, nativeFile, "failed to transform native File to FileInstance"),
    }),
  encode: (_, __, ast) => ParseResult.fail(new ParseResult.Forbidden(ast, _, "encode only schema")),
}) {}
```

---

## Usage Pattern

After implementing, consumers should use this pattern:

```typescript
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { FileInstance, FileInstanceFromNative, enhanceFileInstance } from "@beep/schema/integrations/files/FileInstance";

// Step 1: Basic sync transformation
const basicInstance = S.decodeUnknownSync(FileInstanceFromNative)(nativeFile);

// Step 2: Async enhancement (optional, when metadata needed)
const enhancedInstance = yield* enhanceFileInstance(basicInstance, nativeFile);

// Now aspectRatio and duration are populated (if extractable)
const ratio = enhancedInstance.aspectRatio;   // O.Option<`${number} / ${number}`>
const dur = enhancedInstance.duration;         // O.Option<Duration.Duration>
```

---

## MimeType API Reference

**VERIFY THESE EXIST** before using (from `mime-types/index.ts`):

| Method                       | Purpose                        |
|------------------------------|--------------------------------|
| `MimeType.isImageType`       | Check if mime is image/*       |
| `MimeType.isVideoMimeType`   | Check if mime is video/*       |
| `MimeType.isAudioType`       | Check if mime is audio/*       |
| `MimeType.isTextMimeType`    | Check if mime is text/*        |
| `MimeType.isApplicationType` | Check if mime is application/* |

**Note**: It's `isAudioType` NOT `isAudioMimeType`.

---

## Coding Standards (CRITICAL)

### Import Conventions

```typescript
// ✅ REQUIRED - Namespace imports
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as A from "effect/Array";
import * as S from "effect/Schema";
import * as F from "effect/Function";
import * as P from "effect/Predicate";
import * as Str from "effect/String";
import * as Match from "effect/Match";
import * as Data from "effect/Data";
import * as ParseResult from "effect/ParseResult";
import { Duration } from "effect";

// ❌ FORBIDDEN - Destructured imports
import { pipe } from "effect";  // Use F.pipe instead
```

### NEVER Use Native Array/String Methods

```typescript
// ❌ FORBIDDEN
items.map(fn);
str.split(".");
Array.from(x);

// ✅ REQUIRED
F.pipe(items, A.map(fn));
F.pipe(str, Str.split("."));
F.pipe(x, A.fromIterable);
```

### Use Pattern Matching

```typescript
// ❌ FORBIDDEN
switch (x._tag) { ... }

// ✅ REQUIRED
Match.value(x).pipe(
  Match.tag("SomeTag", handler),
  Match.exhaustive
);
```

### Optional Fields

```typescript
// For nullable optional fields that become Option<T>:
S.optionalWith(S.NonNegativeInt, { as: "Option", nullable: true })
```

### Effect Functions

```typescript
// Use Effect.fn for named effect functions
const extractDimensions = Effect.fn("extractDimensions")(function* (file: File) {
  // ...
});
```

---

## Decision Tree: When to Enhance

```
Is file an image?
├─ Yes → Extract dimensions from EXIF → fallback to createImageBitmap
└─ No
    └─ Is file a video?
        ├─ Yes → Extract dimensions from EXIF → Extract duration from video element
        └─ No
            └─ Is file audio?
                ├─ Yes → Extract duration from audio element
                └─ No → Skip enhancement (return original instance)
```

---

## Implementation Checklist

### Phase 1: Add Types and Helpers

- [ ] Add `duration` field to `FileInstance` schema
- [ ] Create `DimensionExtractionError` tagged error
- [ ] Create `DurationExtractionError` tagged error
- [ ] Create `getDimensionsFromExif` helper function
- [ ] Create `extractDimensions` Effect function
- [ ] Create `extractMediaDuration` Effect function
- [ ] Create `enhanceFileInstance` Effect function

### Phase 2: Exports and Integration

- [ ] Export `enhanceFileInstance` from `FileInstance` namespace
- [ ] Export error types
- [ ] Ensure existing `aspectRatio` getter works with populated dimensions
- [ ] Verify `FileInstanceFromNative` remains synchronous and unchanged

### Phase 3: Verification

- [ ] Run `bun run check` — no type errors
- [ ] Run `bun run lint:fix` — formatting clean
- [ ] Run `bun run test` — all tests pass
- [ ] Verify `File.Model.create` still works (consumer compatibility)

---

## Scope Boundaries

### Files to MODIFY

- `packages/common/schema/src/integrations/files/FileInstance.ts`

### Files to READ (reference only, DO NOT modify)

- `packages/common/schema/src/integrations/files/exif-metadata/ExifMetadata.ts`
- `packages/common/schema/src/integrations/files/exif-metadata/ExifTags.ts`
- `packages/common/schema/src/primitives/duration.ts`
- `packages/common/schema/src/integrations/files/AspectRatio.ts`
- `packages/common/schema/src/integrations/files/mime-types/index.ts`
- `packages/shared/domain/src/entities/File/File.model.ts`

### Files to NEVER touch

- Any files outside `packages/common/schema/src/integrations/files/`
- Test files (unless explicitly asked)
- Documentation files

---

## Success Criteria

1. **Images**: `width`, `height`, and `aspectRatio` populated when EXIF or bitmap available
2. **Videos**: `width`, `height`, `aspectRatio`, and `duration` populated
3. **Audio**: `duration` populated
4. **Non-media**: All fields remain `O.none()` (no errors)
5. **Server-side**: Graceful fallback to `O.none()` (no DOM errors)
6. **Backward compatible**: `File.Model.create` works without changes
7. **Type-safe**: `bun run check` passes
8. **Clean**: `bun run lint:fix` produces no warnings

---

## Verification Commands

After implementation, run:

```bash
# Type check
bun run check

# Lint and fix
bun run lint:fix

# Run tests
bun run test
```

All commands must pass before the implementation is complete.
