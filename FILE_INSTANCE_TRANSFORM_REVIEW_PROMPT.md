# FILE_INSTANCE_TRANSFORM_PROMPT.md - Review, Fix & Optimize

You are reviewing and fixing a prompt document (`FILE_INSTANCE_TRANSFORM_PROMPT.md`) that will guide an AI agent to refactor Effect Schema transformations.

## Your Responsibilities

1. **REVIEW** - Identify all issues, inaccuracies, and gaps
2. **FIX** - Correct the prompt document directly
3. **OPTIMIZE** - Apply prompt & context engineering best practices

---

## Critical Corrections to Apply

The original prompt has several architectural issues that MUST be fixed:

### Issue 1: Overcomplicated EXIF Tag Access

**Problem**: The prompt manually extracts dimensions from individual tag sources (FileTags, EXIF, PNG, RIFF, GIF) with complex `O.orElse` chains.

**Fix**: Use the unified `ExifMetadata` schema directly. The `ExifMetadata.extractMetadata` function (line 186 of `ExifMetadata.ts`) already:
- Reads the file as ArrayBuffer
- Parses with ExifReader
- Cleans large data fields
- Decodes to the `ExifMetadata` schema

**Correction**: FileInstance should have a getter that returns `O.Option<ExifMetadata.Type>`, not extract individual dimension fields.

### Issue 2: Missing Media Duration for Audio/Video

**Problem**: The prompt only addresses image dimensions, ignoring audio/video duration.

**Fix**: For `audio/*` and `video/*` mime types, extract track duration using browser APIs and transform to `Duration` using the existing `DurationFromSeconds` schema from `@beep/schema/primitives/duration`.

**Implementation approach**:
```typescript
// For video: use HTMLVideoElement.duration (seconds)
// For audio: use HTMLAudioElement.duration (seconds)
// Transform via DurationFromSeconds schema
```

### Issue 3: Schema Design Should Use Getters, Not Fields

**Problem**: The prompt adds `width` and `height` as schema fields populated during transformation.

**Fix**: Keep FileInstance fields minimal. Add computed getters that derive values from metadata:

```typescript
export class FileInstance extends S.Class<FileInstance>(...) {
  // Existing fields stay the same

  // NEW: Getter for full EXIF metadata (lazy, cached)
  get exifMetadata(): O.Option<ExifMetadata.Type> {
    // Return cached metadata if available
  }

  // Derived getters using exifMetadata
  get dimensions(): O.Option<{ width: number; height: number }> {
    return F.pipe(
      this.exifMetadata,
      O.flatMap(meta => /* extract from meta.file, meta.exif, etc. */)
    );
  }

  get aspectRatio(): O.Option<`${number} / ${number}`> {
    return F.pipe(
      this.dimensions,
      O.filter(() => MimeType.isImageType(this.type) || MimeType.isVideoMimeType(this.type)),
      O.map(({ width, height }) => S.decodeSync(AspectRatio)({ width, height }))
    );
  }

  // NEW: Duration for audio/video
  get duration(): O.Option<Duration.Duration> {
    // Only for audio/video mime types
  }
}
```

### Issue 4: Async Transformation Complexity

**Problem**: The prompt recommends making `FileInstanceFromNative` async, which breaks schema composition.

**Fix**: Keep the transformation synchronous. EXIF and duration extraction should happen in a separate enhancement step:

```typescript
// Keep FileInstanceFromNative synchronous (as-is)

// Add enhancement function that returns Effect
export const enhanceFileInstance = Effect.fn("enhanceFileInstance")(
  function* (instance: FileInstance, file: File) {
    const exif = yield* ExifMetadata.extractMetadata(file).pipe(Effect.option);
    const duration = yield* extractMediaDuration(file).pipe(Effect.option);

    return instance.withMetadata({ exif, duration });
  }
);
```

---

## Files to Read

Before making corrections, read these files to verify context:

### Primary Files
| File | Purpose |
|------|---------|
| `packages/common/schema/src/integrations/files/FileInstance.ts` | Current implementation to modify |
| `packages/common/schema/src/integrations/files/exif-metadata/ExifMetadata.ts` | EXIF extraction - USE THIS |
| `packages/common/schema/src/primitives/duration.ts` | `DurationFromSeconds` schema |

### Supporting Context
| File | Purpose |
|------|---------|
| `packages/common/schema/src/integrations/files/exif-metadata/ExifTags.ts` | Tag structure reference |
| `packages/common/schema/src/integrations/files/AspectRatio.ts` | Aspect ratio calculation |
| `packages/shared/domain/src/entities/File/File.model.ts` | Consumer compatibility check |

### Standards
| File | Purpose |
|------|---------|
| `AGENTS.md` (root) | Coding conventions - CRITICAL |

---

## Review Checklist

### Architectural Review

- [ ] Verify prompt uses `ExifMetadata` schema, NOT individual tag extraction
- [ ] Verify prompt includes `duration` field for audio/video using `DurationFromSeconds`
- [ ] Verify FileInstance uses getters (not populated fields) for derived metadata
- [ ] Verify transformation remains synchronous with separate enhancement step
- [ ] Verify backward compatibility with `File.Model.create` and `UploadPath`

### Code Accuracy Review

- [ ] All Effect imports use correct conventions (`* as S`, `* as O`, `* as A`, `* as F`, etc.)
- [ ] No native Array methods (use `A.map`, `A.filter`, `A.fromIterable`, etc.)
- [ ] No native String methods (use `Str.split`, `Str.trim`, etc.)
- [ ] Pattern matching uses `Match.value` not switch statements
- [ ] Optional fields use `S.optionalWith(Schema, { as: "Option", nullable: true })`
- [ ] Error types use `Data.TaggedError`
- [ ] Functions use `Effect.fn("name")` pattern

### API Accuracy Review

- [ ] `ExifMetadata.extractMetadata(file: File)` - verify signature and return type
- [ ] `DurationFromSeconds` - verify it transforms `number` (seconds) to `Duration`
- [ ] `MimeType.isImageType` / `MimeType.isVideoMimeType` / `MimeType.isAudioMimeType` - verify these exist
- [ ] `AspectRatio` decode signature - verify input shape `{ width: number; height: number }`

### Browser API Review

- [ ] `HTMLVideoElement.duration` - returns seconds as number
- [ ] `HTMLAudioElement.duration` - returns seconds as number
- [ ] `URL.createObjectURL` / `URL.revokeObjectURL` - for media element src
- [ ] Consider: What if media can't be loaded? Handle with `Effect.tryPromise`

### Missing Context Check

- [ ] Does the prompt explain when to use enhancement vs. basic transformation?
- [ ] Does the prompt address server-side execution (no DOM APIs)?
- [ ] Does the prompt include test patterns for the new getters?
- [ ] Does the prompt reference existing Duration patterns in codebase?

---

## Optimization Requirements

Apply these prompt engineering best practices:

### 1. Structure
- Clear hierarchy with numbered sections
- Tables for file locations and field mappings
- Code blocks with language annotations
- Explicit "DO" and "DON'T" examples

### 2. Context Efficiency
- Remove redundant explanations
- Reference files by path, not inline copies of code
- Use schema type names as anchors

### 3. Decision Trees
Provide clear decision criteria for edge cases:
- "If image/video → extract dimensions from EXIF"
- "If audio/video → extract duration"
- "If neither → skip enhancement"

### 4. Verification Steps
Include commands to verify implementation:
```bash
bun run check    # Type check
bun run lint:fix # Lint
bun run test     # Tests
```

### 5. Scope Boundaries
- Explicitly state what NOT to change
- List files that should remain untouched
- Define the "done" criteria

---

## Key Architectural Decisions (Reference)

These decisions have been made - the prompt MUST reflect them:

| Decision | Choice | Rationale |
|----------|--------|-----------|
| EXIF access | Use `ExifMetadata` schema | Unified, validated, already handles all tag types |
| Dimensions | Getter deriving from ExifMetadata | Keep schema fields minimal |
| Duration | `DurationFromSeconds` transform | Existing pattern, type-safe |
| Async handling | Separate enhancement function | Preserve schema composition |
| Browser APIs | `HTMLVideoElement`/`HTMLAudioElement` | Standard, widely supported |
| Server fallback | Return `O.none()` gracefully | No DOM APIs available |

---

## Media Duration Extraction Pattern

Include this pattern in the corrected prompt:

```typescript
import { Duration } from "effect";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { DurationFromSeconds } from "@beep/schema/primitives/duration";
import { MimeType } from "./mime-types";

export class DurationExtractionError extends Data.TaggedError("DurationExtractionError")<{
  readonly message: string;
  readonly cause?: unknown;
  readonly fileName?: string;
  readonly fileType?: string;
  readonly source?: "media-element" | "unknown";
}> {}

const extractMediaDuration = Effect.fn("extractMediaDuration")(function* (file: File) {
  // Only for audio/video
  const isMedia = MimeType.isAudioMimeType(file.type) || MimeType.isVideoMimeType(file.type);
  if (!isMedia) {
    return O.none<Duration.Duration>();
  }

  // Check for browser environment
  if (typeof document === "undefined") {
    yield* Effect.logDebug("No DOM available for duration extraction");
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

---

## Dimension Extraction from ExifMetadata Pattern

Include this helper in the corrected prompt:

```typescript
import * as F from "effect/Function";
import * as O from "effect/Option";
import type { ExifMetadata } from "./exif-metadata";

/**
 * Extract dimensions from ExifMetadata with fallback through multiple sources
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

---

## Output Requirements

After reviewing, produce:

### 1. Issue Report

List all issues found with severity:
- **Critical** - Will cause implementation failure
- **High** - Incorrect behavior or breaking changes
- **Medium** - Non-compliance with patterns
- **Low** - Style or optimization opportunities

### 2. Corrected Prompt

The full corrected `FILE_INSTANCE_TRANSFORM_PROMPT.md` with:
- All architectural issues fixed
- Duration extraction added
- ExifMetadata getter approach
- Synchronous transformation preserved
- All code examples validated

### 3. Change Summary

Bullet list of what was changed and why.

---

## Verification Commands

After fixing the prompt, verify the executing agent should run:

```bash
# Type check
bun run check

# Lint
bun run lint:fix

# Test (if tests exist for FileInstance)
bun run test
```

**Expected**: All checks pass, no type errors related to FileInstance changes.

---

## Final Checklist Before Submitting

- [ ] All 4 critical issues addressed in the corrected prompt
- [ ] `ExifMetadata` schema used instead of individual tags
- [ ] `DurationFromSeconds` used for audio/video duration
- [ ] Getters pattern used for derived metadata
- [ ] `FileInstanceFromNative` remains synchronous
- [ ] Separate `enhanceFileInstance` function for async extraction
- [ ] All code examples follow AGENTS.md conventions
- [ ] Backward compatibility verified with consumers
