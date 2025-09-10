# Spec: Effect-based File Upload Validation and Metadata Pipeline

Goal: Implement a robust, typed, and observable file upload pipeline using Effect that validates files, extracts basic metadata, and (for images) extracts and validates EXIF metadata. The pipeline must integrate with your existing schemas/utilities and UI, follow your vertical slice architecture, and use your error/logging helpers.

## Context and existing assets

- Schemas and utilities (file): `packages/common/schema/src/custom/file/`
  - Detection and helpers: `detection.ts`, `utils.ts`, `typeChecker.ts`, `FileTypes.ts`
  - File base and attributes: `File.schema.ts`, `FileInfo.schema.ts`, `FileSignature.schema.ts`, `FileSize.schema.ts`, `formatSize.ts`
  - EXIF schema and cleaning utilities: `Exif.schema.ts` (contains `ExifTags`, `ExpandedTags`, `cleanExifData`, `omitKnownLargeFields`)
  - Re-export: `index.ts` (so `@beep/schema` should expose these under the `BS` namespace)
  - Tests with examples: `packages/common/schema/test/custom/file/*`
- Error/logging utilities: `packages/common/errors/src/utils.ts` (pretty logger, withRootSpan, withLogContext, withEnvLogging, withSpanAndMetrics, accumulateEffects)
- UI form and inputs:
  - Upload inputs: `packages/ui/src/inputs/UploadField.tsx`, `UploadAvatarField.tsx`, `UploadBoxField.tsx`, plus `packages/ui/src/inputs/upload/*`
  - Form helpers: `packages/ui/src/form/makeFormOptions.ts`, `useAppForm.ts`
  - Example usage with @tanstack/react-form: `apps/web/src/features/upload/{form.tsx, view.tsx}`
- Effect service example pattern: `packages/storage/src/StorageService.ts`

## Scaffolding created

The following scaffolding has been added under `apps/web/src/features/upload/` to streamline implementation:

- `UploadFileService.ts` — Effect.Service with `processFile`, `processFiles` and re-exports of pipeline steps
- `pipeline.ts` — `Effect.fn` stubs: `validateFile`, `extractBasicMetadata`, `extractExifMetadata`
- `UploadModels.ts` — shared types: `PipelineConfig`, `UploadResult`, `UploadError`, `ProcessFilesResult`, `DEFAULT_CHUNK_SIZE`
- `index.ts` — re-exports for convenient imports via `@/features/upload`
- `errors.ts` — domain error classes using `Data.TaggedError` (ValidationError, DetectionError, ExifParseError)
- `observability.ts` — metrics, span helpers, and logging wrappers for the upload pipeline

## Requirements (what to build)

- Validate uploaded files
  - Validate by magic signatures using the detection helpers (not just MIME string)
  - Enforce size and allowed types; provide helpful errors (human-readable sizes via `formatSize`)
- Extract basic metadata for all files (size, type, name, lastModified, ext, etc.)
- If file is an image, extract EXIF metadata and validate it with your schemas
- Use Effect for all workflow steps (`Effect.fn`, `Effect.gen`), structured as a service built with `Effect.Service`
- implement extensive logging and use error/logging utilities from `packages/common/errors/src/utils.ts` for spans, annotations, metrics, and pretty error output
- Integrate cleanly with the React form layer (`@tanstack/react-form`) and your Upload fields
- Respect vertical slice architecture and layering rules
-

## Non-functional constraints

- TypeScript strict, 2-space indentation, single quotes; follow Biome rules
- Effect-first: prefer `Effect.fn` and `Effect.gen`; avoid ad-hoc promises
- Layering: domain free of IO; application defines ports/use-cases; infra adapters implement ports
- Keep the pipeline in a dedicated `packages/file/` slice for business logic; shared types/utilities only from `packages/shared/*` and `@beep/common/*`

## Proposed module layout
- `apps/web/src/features/upload/UploadFileService.ts` — service orchestration and public API [CREATED]
- `apps/web/src/features/upload/pipeline.ts` — pure pipeline steps (`validateFile`, `extractBasicMetadata`, `extractExifMetadata`) [CREATED]
- `apps/web/src/features/upload/UploadModels.ts` — value objects/types and domain errors (if needed) [CREATED]
- `apps/web/src/features/upload/index.ts` — barrel export for feature [CREATED]
- Optional infra adapters (future): storage, antivirus, image processing

## Public API (service)

Implement an Effect service with accessors for the following high-level operations:

- `processFile(file: File, config?: PipelineConfig): Effect<UploadResult, UploadError>`
- `processFiles(files: ReadonlyArray<File>, config?: PipelineConfig): Effect<ProcessFilesResult, never>`
  - Uses `accumulateEffects` to avoid fail-fast and returns `{ successes, errors }`
  - Each failure is typed and should be pretty-logged

Suggested config shape:

```ts
export interface PipelineConfig {
  readonly maxSizeBytes?: number;              // e.g., 3_145_728
  readonly allowedMime?: ReadonlyArray<string>; // e.g., ['image/jpeg', 'image/png']
  readonly chunkSize?: number;                 // used by detection.ts (default 64)
  readonly excludeSimilarTypes?: boolean;      // if using validators that support it
}
```

## Scaffolding details

- `UploadModels.ts`
  - Exposes `PipelineConfig`, `UploadResult`, `UploadError`, and `ProcessFilesResult`
  - Use `DEFAULT_CHUNK_SIZE` when no `chunkSize` provided
- `pipeline.ts`
  - `validateFile` — size check implemented; TODO: signature detection via `BS.getFileChunk` + `BS.detectFile`
  - `extractBasicMetadata` — builds and decodes `BS.FileAttributes` via `S.decode(BS.FileAttributes)`
  - `extractExifMetadata` — MIME guard in place; TODO: wire `exifreader` + `BS.cleanExifData` + `S.decode(BS.ExpandedTags)`
- `UploadFileService.ts`
  - Composes the pipeline; wraps with `withRootSpan('upload')` and `withLogContext({ service: 'upload' })`
  - Batch processing via `accumulateEffects`

Implementation should replace TODOs with real detection and EXIF parsing using the utilities under
`packages/common/schema/src/custom/file/*`.

Suggested result shape:

```ts
export interface UploadResult {
  readonly file: File;
  readonly attributes: BS.FileAttributes.Type; // size, type, lastModified, name, webkitRelativePath
  readonly detected?: BS.DetectedFileInfo.Type; // extension/mime from magic signature
  readonly exif?: BS.ExpandedTags.Type;         // cleaned/validated EXIF (images only)
}
```

Suggested error modeling:

```ts
// Union of domain failures
export type UploadError =
  | { _tag: 'ValidationError'; message: string }
  | { _tag: 'DetectionError'; message: string }
  | { _tag: 'ExifParseError'; message: string };
```

## Pipeline steps (Effect functions)

Implement these as composable `Effect.fn` generators in `pipeline.ts` and re-export through the service:

1) `validateFile`
- Inputs: `{ file: File; config: PipelineConfig }`
- Steps:
  - Size validation using `file.size` vs `config.maxSizeBytes` (use `formatSize` for messages)
  - Signature detection:
    - Read only the first N bytes (`config.chunkSize ?? 64`) to `Uint8Array | Array<number>`
    - Use `getFileChunk(fileArrayBuffer, chunkSize)` from `utils.ts`
    - Call `detectFile(chunk, { chunkSize })` from `detection.ts`
    - If not detected, fail with `_tag: 'DetectionError'`
  - If `allowedMime` is provided, prefer `detected.mimeType` with fallback to `file.type`
  - For known ambiguous signatures, rely on detection’s additional checks; pass `excludeSimilarTypes` if supported by the helpers

2) `extractBasicMetadata`
- Inputs: `{ file: File }`
- Build a `BS.FileAttributes` using:
  - `size`, `type` (MimeType), `lastModified` (DateTimeUtcFromNumber), `name`, `webkitRelativePath`
- Return `{ attributes, detected }` where `detected` is the result of `detectFile` (if not already computed)

3) `extractExifMetadata` (only when image, non-fatal)
- Inputs: `{ file: File; detected?: BS.DetectedFileInfo.Type }`
- Detect image via `file.type.startsWith('image/')` OR membership in `ImageTypes` via `detected.extension`
- Use a browser-capable EXIF library (recommended: `exifreader`) to parse EXIF from the file’s ArrayBuffer
  - Example: `const raw = await ExifReader.load(arrayBuffer, { expanded: true })`
  - Clean large binary fields using `cleanExifData` or `omitKnownLargeFields` from `Exif.schema.ts`
  - Validate with `S.decodeUnknown(ExpandedTags)` to ensure schema-conformant output from plain JS objects
- If EXIF parse fails, do not crash the pipeline; log a warning and return `undefined`

4) Composition
- `processFile` composes the above:
  - Wrap in `withRootSpan('upload')` and `withLogContext({ service: 'upload' })`
  - Optionally `withSpanAndMetrics('upload.processFile', { ...metrics })`
  - Failures are properly typed and logged using pretty cause formatting
- `processFiles` processes in parallel with `accumulateEffects` to collect per-file successes and errors (no fail-fast)

## Effect Service skeleton

Follow the service pattern shown in `packages/storage/src/StorageService.ts`:

```ts
import * as Effect from 'effect/Effect';
import * as S from 'effect/Schema';
import { BS } from '@beep/schema';
import { withRootSpan, withLogContext, accumulateEffects } from '@beep/errors/utils';

export class UploadFileService extends Effect.Service<UploadFileService>()('UploadFileService', {
  dependencies: [],
  accessors: true,
  effect: Effect.gen(function* () {
    const validateFile = Effect.fn('validateFile')(function* ({ file, config }) {
      // implement size + signature detection + allowedMime
    });

    const extractBasicMetadata = Effect.fn('extractBasicMetadata')(function* ({ file }) {
      // build BS.FileAttributes, run detection if needed
    });

    const extractExifMetadata = Effect.fn('extractExifMetadata')(function* ({ file, detected }) {
      // guard image-only, parse via ExifReader, clean & validate with BS.ExpandedTags
    });

    const processFile = Effect.fn('processFile')(function* ({ file, config }) {
      return yield* Effect.gen(function* () {
        const _ = yield* validateFile({ file, config });
        const basic = yield* extractBasicMetadata({ file });
        const exif = yield* extractExifMetadata({ file, detected: basic.detected });
        return { file, attributes: basic.attributes, detected: basic.detected, exif } satisfies UploadResult;
      }).pipe(withLogContext({ service: 'upload' }), withRootSpan('upload'));
    });

    const processFiles = Effect.fn('processFiles')(function* ({ files, config }) {
      const effects = files.map((file) => processFile({ file, config }));
      // Prefer accumulate to avoid fail-fast
      const result = yield* accumulateEffects(effects, { concurrency: 'unbounded' });
      return result; // caller decides how to handle mixed outcomes
    });

    return { processFile, processFiles, validateFile, extractBasicMetadata, extractExifMetadata };
  }),
}) {}
```

Notes:
- Use the single-letter Effect import style consistent with your repo for `Schema` (`import * as S from 'effect/Schema'`); use `Effect` for runtime
- Put imports at the top of files (follow repo conventions)
- Return typed failures with structured `_tag` discriminants; log causes using pretty helpers when catching

## React form integration example

Given an existing form like `apps/web/src/features/upload/form.tsx`, wire submission to the service:

```tsx
import { useAppForm, Form } from '@beep/ui/form';
import { Upload } from '@beep/ui/inputs/upload';
import * as S from 'effect/Schema';
import * as Effect from 'effect/Effect';
import { UploadFileService } from '@/features/upload';

const UploadSchema = S.Struct({
  singleUpload: S.NullOr(BS.FileBase),
  multiUpload: S.Array(BS.FileBase),
});

// On submit, call the service
onSubmit: async ({ value }) => {
  const files = value.multiUpload ?? [];
  const eff = Effect.gen(function* () {
    const upload = yield* UploadFileService;
    const { successes, errors } = yield* upload.processFiles({ files, config: { maxSizeBytes: 3_145_728 } });
    // handle successes and errors as needed
    return { successes, errors };
  });
  // Provide logging layer if desired
  // await Effect.runPromise(eff.pipe(withEnvLogging()));
};
```

## Validation specifics and helpers

- Use `getFileChunk` from `utils.ts` to reliably slice the file header and `detectFile` to inspect signatures
- Utilities in `utils.ts` help distinguish ambiguous formats (e.g., `isftypStringIncluded`, `isFlvStringIncluded`, `isAvifStringIncluded`, `isHeicSignatureIncluded`, `findMatroskaDocTypeElements`)
- `typeChecker.ts` aggregates detection and `FileTypes` helpers — use it to centralize validation logic where possible
- Use `formatSize` to produce helpful size error messages consistent with your `FileSize.schema.ts` units
- Prefer `S.decodeUnknown(...)` for runtime validation when decoding from plain JS values (e.g., `FileAttributes`, `ExpandedTags`)
- Use the `DEFAULT_CHUNK_SIZE` constant when `config.chunkSize` is not provided

## EXIF specifics

- Parsing library: prefer `exifreader` (browser-safe). After loading the file’s `ArrayBuffer`, call `ExifReader.load(buffer, { expanded: true })`
- Clean raw EXIF with `cleanExifData` (or `omitKnownLargeFields`) to strip binary-heavy fields like thumbnails/base64
- Validate parsed EXIF against `ExpandedTags` or `ExifTags` using `S.decodeUnknown`
- For JPEG files you can also guard with `isFileContaineJfiforExifHeader` to quickly skip non-EXIF JPEGs
- Make EXIF parsing non-fatal; prefer logging warnings and returning `undefined`

## Architecture and layering

- For the scaffolding phase, keep business logic in `apps/web/src/features/upload/` (service + pipeline)
- Plan to move the business logic into a dedicated `packages/files/` slice (application + adapters) once stabilized
- Reuse shared types/schemas via `@beep/shared-*` and `@beep/common/*`; do not import `db` or `ui` in application

## Observability and error handling

- Wrap public service methods with `withRootSpan('upload')` and `withLogContext({ service: 'upload' })`
- For batch processing, use `accumulateEffects` and `accumulateEffectsAndReport` to avoid fail-fast and still produce a rich error report
- When logging failures, use pretty cause formatting so developers get readable stack/code frames
- Consider enabling environment-driven logging for local dev with `withEnvLogging()` to install the pretty console logger

### Observability scaffolding (implemented)

- Module: `apps/web/src/features/upload/observability.ts`
  - Metrics
    - `upload.files_processed_total` (counter)
    - `upload.files_failed_total` (counter)
    - `upload.detection_failed_total` (counter)
    - `upload.exif_parsed_total` (counter)
    - `upload.exif_failed_total` (counter)
    - `upload.process_file_duration_ms` (histogram with custom boundaries)
  - Span/annotation helpers
    - `withUploadRoot()` to wrap effects in a root upload span + annotations
    - `withUploadSpan(label, annotations?)` for sub-steps
    - `instrumentProcessFile(annotations?)` to add spans + metrics around `processFile`
    - `makeFileAnnotations(file, extra?)` to annotate logs with file metadata
  - Logging wrappers: `logDebug`, `logInfo`, `logWarning`, `logError`

- Usage
  - `UploadFileService.processFile` wraps the composed effect in `instrumentProcessFile(makeFileAnnotations(file))`
  - `processFiles` uses `accumulateEffectsAndReport` to pretty-log batch results
  - `pipeline.validateFile` increments `upload.detection_failed_total` and logs warnings on detection or MIME failure
  - `pipeline.extractExifMetadata` increments `upload.exif_parsed_total` on success and `upload.exif_failed_total` on failure; EXIF errors are non-fatal and logged as warnings

## Acceptance criteria

- Validates file size and type (by signature) with friendly messages
- Returns `UploadResult` with attributes for all files and EXIF for images (when present)
- Handles multiple files concurrently; no fail-fast; logs each failure clearly
- All functions implemented with `Effect.fn` and composed with `Effect.gen`
- Public API is an `Effect.Service` with `accessors: true`, no global state
- Integration example compiles against `apps/web` Upload form
- Follows repo’s style, layering rules, and uses error/logging utilities

## Out of scope (for now)

- Upload transport (e.g., pre-signed S3 PUT). If needed, integrate with `StorageService` afterwards
- Image transformations (resize, strip metadata) — can be added as downstream steps

## Deliverables

- Source files under `apps/web/src/features/upload/` with service and pipeline
- Types and domain errors (if any) under `apps/web/src/features/upload/`
- Minimal tests that exercise signature detection and EXIF parsing using fixtures similar to `packages/common/schema/test/custom/file`
- Example demonstrating integration with `Upload` inputs and @tanstack/react-form

## Error modeling (current)

- Error classes are defined in `apps/web/src/features/upload/errors.ts` as `Data.TaggedError`:
  - `ValidationError { message, cause? }`
  - `DetectionError { message, cause? }`
  - `ExifParseError { message, cause }`
- `UploadModels.ts` defines `UploadError` as a union of these classes and `ProcessFilesResult` as the return type of `processFiles`.
