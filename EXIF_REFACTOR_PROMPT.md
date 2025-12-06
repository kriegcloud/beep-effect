# EXIF Metadata Refactor: ExifReader to @uswriting/exiftool

This prompt guides the implementation of replacing `exifreader` with `@uswriting/exiftool` (ExifTool WASM) for EXIF metadata extraction in the beep-effect monorepo.

---

## Phase 1: Research & Discovery

### 1.1 Use the effect-researcher Agent

Before implementation, use the effect-researcher agent to verify current Effect patterns:
- Effect Schema `S.declare` patterns for custom runtime validation
- Effect `Effect.Service` patterns for services with async initialization
- `Schema.TaggedError` for typed errors (NOT `Data.TaggedError`)
- `Effect.fn` for named effectful functions with tracing

### 1.2 Examine the Reference WASM Pattern

Read and understand the WASM lazy loading pattern in this file:
```
tooling/repo-scripts/src/utils/convert-to-nextgen.ts
```

Key patterns to observe:
- `resolveModuleAssetPath` for finding WASM modules in monorepo
- `loadWasmModule` using `Effect.tryPromise` with proper error mapping
- `initializeDecoders` for lazy WASM initialization
- `Effect.forEach` with `concurrency: "unbounded"` for parallel operations

### 1.3 Understand @uswriting/exiftool API

The library provides two main functions:

```typescript
// Extract metadata from files
async function parseMetadata<TReturn = string>(
  file: Binaryfile | File,
  options?: ExifToolOptions<TReturn>
): Promise<ExifToolOutput<TReturn>>

// Write metadata to files
async function writeMetadata(
  file: Binaryfile | File,
  tags: ExifTags,
  options?: ExifToolOptions
): Promise<ExifToolOutput<ArrayBuffer>>

// Types
type Binaryfile = { name: string; data: Uint8Array | Blob }
type ExifToolOptions<T> = {
  args?: string[];
  fetch?: FetchLike;
  transform?: (data: string) => T;
  config?: Binaryfile | File;
}
type ExifToolOutput<T> =
  | { success: true; data: T; error: string; exitCode: 0 }
  | { success: false; data: undefined; error: string; exitCode: number | undefined }
```

Key features:
- WASM module loads from CDN: `https://perl.objex.ai/zeroperl-1.0.1.wasm`
- Supports JSON output via args: `['-json']`
- No installation of native binaries required
- Works in both browser and Node.js

---

## Phase 2: Update Dependencies

### 2.1 Add @uswriting/exiftool to Bun Catalog

Edit the root `package.json` to add the catalog entry:

```bash
# File: /home/elpresidank/YeeBois/projects/beep-effect/package.json
# In the "catalog" section, add:
"@uswriting/exiftool": "^1.x.x"
```

### 2.2 Update Package Dependencies

**Remove exifreader from these files:**
- `/home/elpresidank/YeeBois/projects/beep-effect/package.json` (catalog entry)
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/common/schema/package.json` (peerDependencies & devDependencies)
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/documents/domain/package.json` (peerDependencies & devDependencies)
- `/home/elpresidank/YeeBois/projects/beep-effect/apps/web/package.json` (dependencies)
- `/home/elpresidank/YeeBois/projects/beep-effect/apps/notes/package.json` (dependencies if present)
- `/home/elpresidank/YeeBois/projects/beep-effect/scratchpad/package.json` (dependencies)

**Add @uswriting/exiftool to:**
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/documents/infra/package.json` (dependencies)

### 2.3 Install Dependencies

```bash
bun install
```

### 2.4 Verification

```bash
# Verify no exifreader catalog references remain
grep -r "exifreader" --include="package.json" . && echo "FAIL: exifreader still referenced" || echo "PASS"
```

---

## Phase 3: Create EXIF Error Types

### 3.1 Update errors.ts

Edit `/home/elpresidank/YeeBois/projects/beep-effect/packages/common/schema/src/integrations/files/exif-metadata/errors.ts`:

```typescript
import * as S from "effect/Schema";

/**
 * Error thrown when EXIF parsing fails at any stage.
 * Uses Schema.TaggedError for validation and serialization support.
 */
export class ExifParseError extends S.TaggedError<ExifParseError>()("ExifParseError", {
  message: S.String,
  cause: S.optional(S.Unknown),
  fileName: S.optional(S.String),
  fileType: S.optional(S.String),
  fileSize: S.optional(S.Number),
  phase: S.optional(S.Literal("load", "read", "parse", "decode")),
}) {}

/**
 * Error thrown when EXIF extraction times out.
 */
export class ExifTimeoutError extends S.TaggedError<ExifTimeoutError>()("ExifTimeoutError", {
  message: S.String,
  fileName: S.optional(S.String),
  timeoutMs: S.Number,
}) {}

/**
 * Error thrown when a file is too large for EXIF extraction.
 */
export class ExifFileTooLargeError extends S.TaggedError<ExifFileTooLargeError>()(
  "ExifFileTooLargeError",
  {
    message: S.String,
    fileName: S.optional(S.String),
    fileSize: S.Number,
    maxSize: S.Number,
  }
) {}
```

---

## Phase 4: Create EXIF Schemas

### 4.1 Update ExifMetadata.ts

Edit `/home/elpresidank/YeeBois/projects/beep-effect/packages/common/schema/src/integrations/files/exif-metadata/ExifMetadata.ts`:

```typescript
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";

/**
 * Raw EXIF metadata value type - matches ExifTool JSON output.
 * Uses index signature for arbitrary EXIF fields.
 */
export interface ExifMetadataValue {
  readonly SourceFile?: string;
  readonly FileName?: string;
  readonly Directory?: string;
  readonly FileSize?: string;
  readonly FileModifyDate?: string;
  readonly FileAccessDate?: string;
  readonly FileInodeChangeDate?: string;
  readonly FilePermissions?: string;
  readonly FileType?: string;
  readonly FileTypeExtension?: string;
  readonly MIMEType?: string;
  readonly ImageWidth?: number;
  readonly ImageHeight?: number;
  readonly ImageSize?: string;
  readonly Megapixels?: number;
  // GPS fields
  readonly GPSLatitude?: number | string;
  readonly GPSLongitude?: number | string;
  readonly GPSAltitude?: number | string;
  readonly GPSLatitudeRef?: string;
  readonly GPSLongitudeRef?: string;
  // Camera fields
  readonly Make?: string;
  readonly Model?: string;
  readonly Software?: string;
  readonly DateTimeOriginal?: string;
  readonly CreateDate?: string;
  readonly ModifyDate?: string;
  readonly ExposureTime?: string | number;
  readonly FNumber?: number;
  readonly ISO?: number;
  readonly FocalLength?: string | number;
  readonly LensModel?: string;
  readonly Orientation?: number | string;
  // Allow arbitrary additional fields from ExifTool
  readonly [key: string]: unknown;
}

/**
 * Schema for raw EXIF metadata from ExifTool.
 * Uses S.declare for pass-through validation since ExifTool handles parsing.
 */
export const ExifMetadataRaw = S.declare(
  (input: unknown): input is ExifMetadataValue => P.isRecord(input),
  {
    identifier: "ExifMetadataRaw",
    title: "Raw EXIF Metadata",
    description: "Raw EXIF metadata extracted from an image file using ExifTool WASM",
  }
);

export type ExifMetadataRaw = S.Schema.Type<typeof ExifMetadataRaw>;

/**
 * Cleaned and validated EXIF metadata with common fields extracted.
 * Extends S.Class for encoding/decoding and class semantics.
 */
export class ExifMetadata extends S.Class<ExifMetadata>("ExifMetadata")({
  // File identification
  fileName: S.optional(S.String),
  fileType: S.optional(S.String),
  mimeType: S.optional(S.String),
  fileSize: S.optional(S.String),

  // Dimensions
  imageWidth: S.optional(S.Number),
  imageHeight: S.optional(S.Number),

  // Camera info
  make: S.optional(S.String),
  model: S.optional(S.String),
  software: S.optional(S.String),

  // Dates
  dateTimeOriginal: S.optional(S.String),
  createDate: S.optional(S.String),
  modifyDate: S.optional(S.String),

  // GPS (decimal degrees)
  gpsLatitude: S.optional(S.Number),
  gpsLongitude: S.optional(S.Number),
  gpsAltitude: S.optional(S.Number),

  // Orientation
  orientation: S.optional(S.Union(S.Number, S.String)),

  // Raw data for access to all fields
  raw: S.Record({ key: S.String, value: S.Unknown }),
}, {
  identifier: "ExifMetadata",
  title: "EXIF Metadata",
  description: "Cleaned and validated EXIF metadata with common fields extracted.",
}) {
  /**
   * Create ExifMetadata from raw ExifTool output.
   */
  static fromRaw(raw: ExifMetadataValue): ExifMetadata {
    return new ExifMetadata({
      fileName: P.isString(raw.FileName) ? raw.FileName : undefined,
      fileType: P.isString(raw.FileType) ? raw.FileType : undefined,
      mimeType: P.isString(raw.MIMEType) ? raw.MIMEType : undefined,
      fileSize: P.isString(raw.FileSize) ? raw.FileSize : undefined,
      imageWidth: P.isNumber(raw.ImageWidth) ? raw.ImageWidth : undefined,
      imageHeight: P.isNumber(raw.ImageHeight) ? raw.ImageHeight : undefined,
      make: P.isString(raw.Make) ? raw.Make : undefined,
      model: P.isString(raw.Model) ? raw.Model : undefined,
      software: P.isString(raw.Software) ? raw.Software : undefined,
      dateTimeOriginal: P.isString(raw.DateTimeOriginal) ? raw.DateTimeOriginal : undefined,
      createDate: P.isString(raw.CreateDate) ? raw.CreateDate : undefined,
      modifyDate: P.isString(raw.ModifyDate) ? raw.ModifyDate : undefined,
      gpsLatitude: P.isNumber(raw.GPSLatitude) ? raw.GPSLatitude : undefined,
      gpsLongitude: P.isNumber(raw.GPSLongitude) ? raw.GPSLongitude : undefined,
      gpsAltitude: P.isNumber(raw.GPSAltitude) ? raw.GPSAltitude : undefined,
      orientation: raw.Orientation,
      raw: raw as Record<string, unknown>,
    });
  }
}
```

### 4.2 Delete ExifTags.ts

Delete the file entirely:
```
/home/elpresidank/YeeBois/projects/beep-effect/packages/common/schema/src/integrations/files/exif-metadata/ExifTags.ts
```

This file (~800 lines) is no longer needed since ExifTool handles all EXIF field parsing.

### 4.3 Update index.ts

Edit `/home/elpresidank/YeeBois/projects/beep-effect/packages/common/schema/src/integrations/files/exif-metadata/index.ts`:

```typescript
export * from "./ExifMetadata";
export * from "./errors";
```

### 4.4 Verification

```bash
bunx turbo run check --filter=@beep/schema
```

---

## Phase 5: Create ExifTool Service

The service goes in `packages/documents/infra` following vertical slice architecture (services with side effects belong in infra layer).

### 5.1 Create Service File

Create `/home/elpresidank/YeeBois/projects/beep-effect/packages/documents/infra/src/files/ExifToolService.ts`:

```typescript
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Layer from "effect/Layer";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import {
  ExifFileTooLargeError,
  ExifMetadata,
  type ExifMetadataValue,
  ExifParseError,
  ExifTimeoutError,
} from "@beep/schema/integrations/files";
import type { Binaryfile, ExifToolOutput } from "@uswriting/exiftool";

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
  ) => Effect.Effect<ExifMetadata, ExifParseError | ExifFileTooLargeError | ExifTimeoutError>;

  readonly extractRaw: (
    file: File | Binaryfile
  ) => Effect.Effect<ExifMetadataValue, ExifParseError | ExifFileTooLargeError | ExifTimeoutError>;

  readonly writeMetadata: (
    file: File | Binaryfile,
    tags: Record<string, unknown>
  ) => Effect.Effect<ArrayBuffer, ExifParseError>;
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
        new ExifParseError({
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
    ): Effect.Effect<ExifMetadataValue, ExifParseError> =>
      Effect.gen(function* () {
        if (!result.success) {
          return yield* Effect.fail(
            new ExifParseError({
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
          Match.when(P.isArray, (arr) =>
            F.pipe(
              arr,
              A.head,
              O.filter(P.isRecord),
              O.getOrElse(() => ({} as ExifMetadataValue))
            )
          ),
          Match.when(P.isRecord, (obj) => obj as ExifMetadataValue),
          Match.orElse(() => ({} as ExifMetadataValue))
        );
      });

    /**
     * Check file size before extraction.
     */
    const checkFileSize = (file: File | Binaryfile): Effect.Effect<void, ExifFileTooLargeError> =>
      Effect.gen(function* () {
        const size = "size" in file ? file.size : file.data.length;
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

    return {
      extractRaw: (file) =>
        Effect.gen(function* () {
          yield* checkFileSize(file);

          yield* Effect.annotateCurrentSpan("exif.fileName", file.name);
          yield* Effect.annotateCurrentSpan(
            "exif.fileSize",
            "size" in file ? file.size : file.data.length
          );

          const result = yield* Effect.tryPromise({
            try: () =>
              parseMetadata(file, {
                args: ["-json", "-a", "-G"], // JSON output, all tags, group names
                transform: (data) => JSON.parse(data),
              }),
            catch: (e) =>
              new ExifParseError({
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
        }),

      extractMetadata: (file) =>
        Effect.gen(function* () {
          const raw = yield* ExifToolService.extractRaw(file);
          return ExifMetadata.fromRaw(raw);
        }),

      writeMetadata: (file, tags) =>
        Effect.gen(function* () {
          const result = yield* Effect.tryPromise({
            try: () =>
              writeMetadata(
                file,
                tags as Record<string, string | number | boolean | (string | number | boolean)[]>
              ),
            catch: (e) =>
              new ExifParseError({
                message: "ExifTool write failed",
                cause: e,
                fileName: file.name,
                phase: "parse",
              }),
          });

          if (!result.success) {
            return yield* Effect.fail(
              new ExifParseError({
                message: result.error || "ExifTool write failed",
                cause: result,
                fileName: file.name,
                phase: "decode",
              })
            );
          }

          return result.data;
        }),
    } satisfies ExifToolServiceShape;
  }),
}) {}
```

### 5.2 Export from Package Index

Edit `/home/elpresidank/YeeBois/projects/beep-effect/packages/documents/infra/src/index.ts` to add:

```typescript
export { ExifToolService } from "./files/ExifToolService";
```

### 5.3 Verification

```bash
bunx turbo run check --filter=@beep/documents-infra
bunx turbo run build --filter=@beep/documents-infra
```

---

## Phase 6: Update Consumers

### 6.1 Update apps/web/src/features/upload/pipeline.ts

This file currently imports `ExifReader` directly. Update it to use the service:

```typescript
// Remove these imports:
// import ExifReader from "exifreader";

// Update extractExifMetadata function:
import { ExifToolService } from "@beep/documents-infra";
import { ExifMetadata } from "@beep/schema/integrations/files";
import * as Effect from "effect/Effect";
import * as Metric from "effect/Metric";
import { logInfo, logWarning, makeFileAnnotations, UploadMetrics } from "./observability";

/**
 * Extract EXIF metadata for images (when present).
 * Returns undefined on non-images or parse failure.
 */
export const extractExifMetadata = Effect.fn("upload.extractExifMetadata")(function* ({
  file,
  detected,
}: {
  readonly file: File;
  readonly detected?: DetectedFileInfo.Type | undefined;
}) {
  // Simple guard: skip if not an image by MIME
  const candidateMime = detected?.mimeType ?? file.type;
  if (!candidateMime || !candidateMime.startsWith("image/")) {
    return undefined;
  }

  // Try EXIF parse via service, but do not fail the pipeline
  return yield* Effect.gen(function* () {
    const exif = yield* ExifToolService.extractMetadata(file);

    // Success: increment metric and log
    yield* Metric.increment(UploadMetrics.exifParsedTotal);
    yield* logInfo("upload.extractExifMetadata: parsed EXIF", makeFileAnnotations(file));

    return exif;
  }).pipe(
    Effect.catchAll((error) =>
      Effect.gen(function* () {
        yield* Metric.increment(UploadMetrics.exifFailedTotal);
        yield* logWarning("upload.extractExifMetadata: non-fatal EXIF parse failure", {
          ...makeFileAnnotations(file),
          error,
        });
        return undefined;
      })
    )
  );
});
```

### 6.2 Update apps/web/src/features/upload/UploadFileService.ts

Ensure the ExifToolService layer is provided. Update the runtime layer composition in the app to include `ExifToolService.Default`.

### 6.3 Update apps/web Runtime Layer

In the web app's runtime layer (typically in `apps/web/src/runtime` or similar), add:

```typescript
import { ExifToolService } from "@beep/documents-infra";

// In your layer composition:
Layer.mergeAll(
  // ... other layers
  ExifToolService.Default
)
```

### 6.4 Verification

```bash
bunx turbo run check --filter=@beep/web
bunx turbo run build --filter=@beep/web
```

---

## Phase 7: Update Tests

### 7.1 Update Test File

Edit `/home/elpresidank/YeeBois/projects/beep-effect/packages/common/schema/test/integrations/files/ExifMetadata.test.ts`:

```typescript
import { describe, expect, it } from "bun:test";
import { ExifMetadata, type ExifMetadataValue } from "@beep/schema/integrations/files";
import * as S from "effect/Schema";

describe("@beep/schema EXIF schemas", () => {
  it("creates ExifMetadata from raw ExifTool output", () => {
    const raw: ExifMetadataValue = {
      FileName: "test.jpg",
      FileType: "JPEG",
      MIMEType: "image/jpeg",
      ImageWidth: 1024,
      ImageHeight: 768,
      Make: "Canon",
      Model: "EOS 5D",
    };

    const metadata = ExifMetadata.fromRaw(raw);

    expect(metadata.fileName).toBe("test.jpg");
    expect(metadata.fileType).toBe("JPEG");
    expect(metadata.imageWidth).toBe(1024);
    expect(metadata.imageHeight).toBe(768);
    expect(metadata.make).toBe("Canon");
    expect(metadata.model).toBe("EOS 5D");
    expect(metadata.raw).toBeDefined();
  });

  it("decodes ExifMetadata schema", () => {
    const input = {
      fileName: "test.jpg",
      fileType: "JPEG",
      imageWidth: 1024,
      imageHeight: 768,
      raw: { FileName: "test.jpg" },
    };

    const decoded = S.decodeSync(ExifMetadata)(input);

    expect(decoded.fileName).toBe("test.jpg");
    expect(decoded.imageWidth).toBe(1024);
  });

  it("handles missing optional fields", () => {
    const raw: ExifMetadataValue = {
      FileName: "test.jpg",
    };

    const metadata = ExifMetadata.fromRaw(raw);

    expect(metadata.fileName).toBe("test.jpg");
    expect(metadata.imageWidth).toBeUndefined();
    expect(metadata.gpsLatitude).toBeUndefined();
  });
});
```

### 7.2 Run Tests

```bash
bun test packages/common/schema
```

---

## Phase 8: Final Validation

### 8.1 Type Check All Packages

```bash
bun run check
```

### 8.2 Build All Packages

```bash
bun run build
```

### 8.3 Lint Fix

```bash
bun run lint:fix
```

### 8.4 Run All Tests

```bash
bun run test
```

### 8.5 Verify No exifreader References

```bash
# Should return no matches
grep -r "exifreader" --include="*.ts" packages/ apps/ && echo "FAIL: exifreader still referenced" || echo "PASS"

# Should return no matches in imports
grep -r "from ['\"]exifreader['\"]" --include="*.ts" packages/ apps/ && echo "FAIL: exifreader import found" || echo "PASS"
```

---

## Critical Implementation Rules

### Effect Patterns (from AGENTS.md)

1. **No async/await or bare Promises** - Use `Effect.tryPromise` with tagged errors:
   ```typescript
   yield* Effect.tryPromise({
     try: () => someAsyncOperation(),
     catch: (e) => new SomeTaggedError({ message: "...", cause: e }),
   })
   ```

2. **Import Conventions** - Always use namespace imports:
   ```typescript
   import * as Effect from "effect/Effect";
   import * as Layer from "effect/Layer";
   import * as S from "effect/Schema";
   import * as A from "effect/Array";
   import * as O from "effect/Option";
   import * as P from "effect/Predicate";
   import * as F from "effect/Function";
   import * as Match from "effect/Match";
   ```

3. **NEVER use native Array methods** - Use Effect Array utilities:
   ```typescript
   // BAD
   arr.map(fn)
   Array.isArray(x)
   arr[0]

   // GOOD
   F.pipe(arr, A.map(fn))
   P.isArray(x)
   F.pipe(arr, A.head)
   ```

4. **Use Schema.TaggedError** - NOT Data.TaggedError:
   ```typescript
   // BAD
   class MyError extends Data.TaggedError("MyError")<{...}> {}

   // GOOD
   class MyError extends S.TaggedError<MyError>()("MyError", {...}) {}
   ```

5. **Use Effect.Service** - NOT Context.GenericTag:
   ```typescript
   // BAD
   const MyService = Context.GenericTag<MyService>("MyService");

   // GOOD
   class MyService extends Effect.Service<MyService>()("MyService", {
     accessors: true,
     effect: Effect.gen(function* () { ... })
   }) {}
   ```

6. **Use Effect.fn for named functions** - With tracing spans:
   ```typescript
   export const myFunction = Effect.fn("myFunction")(function* (arg: T) {
     yield* Effect.annotateCurrentSpan("arg.field", arg.field);
     // ...
   });
   ```

7. **Use Effect predicates** - NOT typeof/instanceof:
   ```typescript
   // BAD
   typeof x === "object" && x !== null
   Array.isArray(x)

   // GOOD
   P.isRecord(x)
   P.isArray(x)
   ```

8. **Use Match for pattern matching** - NOT switch/if-else chains:
   ```typescript
   F.pipe(
     Match.value(result),
     Match.when(P.isArray, (arr) => A.head(arr)),
     Match.when(P.isRecord, (obj) => obj),
     Match.orElse(() => defaultValue)
   )
   ```

### Code Quality

- No `any` types
- No `@ts-ignore`
- Validate external data with schemas
- Use `Effect.log*` for logging
- Add telemetry spans for operations

---

## Deliverables Checklist

- [ ] Remove `exifreader` from all package.json files
- [ ] Add `@uswriting/exiftool` to Bun catalog and documents-infra package
- [ ] Delete `ExifTags.ts` entirely
- [ ] Create new `ExifMetadata.ts` with `S.Class` pattern
- [ ] Update `errors.ts` with `Schema.TaggedError` pattern
- [ ] Create `ExifToolService` in documents-infra with `Effect.Service` pattern
- [ ] Update `apps/web/src/features/upload/pipeline.ts` to use service
- [ ] Update web app runtime layer to provide `ExifToolService.Default`
- [ ] Update tests for new API
- [ ] Verify `bun run check` passes
- [ ] Verify `bun run build` passes
- [ ] Verify `bun run lint:fix` passes
- [ ] Verify `bun run test` passes
- [ ] Verify no `exifreader` references remain

---

## Additional Context

### Files to Reference

- `tooling/repo-scripts/src/utils/convert-to-nextgen.ts` - WASM lazy loading pattern
- `apps/web/src/features/upload/UploadFileService.ts` - Effect.Service pattern example
- `packages/common/utils/src/uint8-array-to-array-buffer.ts` - File reading utilities
- `AGENTS.md` - All coding conventions and Effect patterns
- `docs/research/exif-refactor-effect-patterns.md` - Effect pattern research

### NPM Package Info

- Package: `@uswriting/exiftool`
- GitHub: https://github.com/6over3/exiftool
- CDN for WASM: `https://perl.objex.ai/zeroperl-1.0.1.wasm`

### Key Architectural Decisions

1. **Simplify schemas**: Don't recreate all EXIF field types - ExifTool handles validation
2. **Service pattern**: Use `Effect.Service` with `accessors: true` for convenience
3. **Vertical slice**: Service in `documents/infra`, schemas in `common/schema`
4. **Lazy loading**: Import the WASM module dynamically in service initialization
5. **JSON output**: Use `-json` flag for structured output from ExifTool
6. **Graceful degradation**: EXIF failures don't fail the upload pipeline
