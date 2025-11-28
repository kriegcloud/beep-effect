# AGENTS.md — `@beep/documents-domain`

## Purpose & Fit
- Domain layer for the files vertical: value objects, schema kits, and detection utilities that stay platform-agnostic.
- Supplies strongly-typed building blocks for upload pipelines in `apps/web`, storage adapters in `packages/documents/infra`, and SDK consumers.
- Owns EXIF extraction heuristics, signature-based type detection, and size/format helpers while delegating persistence to infra/tables slices.
- Ships Effect-first APIs only; no direct DOM, Bun, or Node globals beyond the `File` type guards baked into value objects.

## Surface Map
- **Errors (`src/errors.ts`)** — Tagged data errors (`ExifParseError`, `FileReadError`) for consistent failure channels across pipelines.
- **Value Objects**
  - `FileAttributes` — runtime schema for metadata derived from the DOM `File` (`size`, `mime`, derived paths).
  - `FileInstance` — nominal schema ensuring consumers validate against the ambient `File` constructor.
  - `FileSize` — unit kits (SI/IEC byte+bit enums) plus typed aliases used by `formatSize`.
  - `value-objects/exif-metadata` — `ExifMetadata` schema (`ExpandedTags`), cleaning helpers (`cleanExifData`, `omitKnownLargeFields`), low-level heuristics (`isLargeDataField`, `omitLargeDataFromObject`) built atop `readFileArrayBuffer`.
  - `value-objects/file-types` — registries of signatures (`FileInfo`, `FileSignature`), the aggregator `FileTypes`, detection helpers (`detectBySignatures`, `detectTypeByAdditionalCheck`), and the merged façade `fileTypeChecker` that exposes `isXYZ` plus `validateFileType`.
- **Utilities (`src/utils`)**
  - `formatSize` — typed pretty-bytes implementation with BigInt support and locale-aware formatting.
  - `readFileArrayBuffer` — Effect-wrapped `File.arrayBuffer()` with rich error tagging.
  - `bytes-to-size`, `compress-file-name` — legacy helpers kept for backwards compatibility; do **not** extend their native array/string patterns.

## Usage Snapshots
- `apps/web/src/features/upload/pipeline.ts:33` — Uses `formatSize` for user-facing limits and later calls `fileTypeChecker.detectFile` + `getFileChunk` for signature validation.
- `apps/web/src/features/upload/pipeline.ts:141` — Decodes `FileAttributes` to shape typed metadata before persisting.
- `apps/web/src/features/upload/pipeline.ts:183` — Runs `ExifMetadata.cleanExifData` prior to schema decoding to strip heavy payloads.
- `apps/web/src/features/upload/form.tsx:14` — Reuses `FileInstance` inside React form schemas to validate file inputs client-side.
- `packages/documents/domain/test/value-objects/file-types/validation/video.test.ts:11` — Demonstrates `fileTypeChecker.isMP4` and `validateFileType` options (`excludeSimilarTypes`, chunk sizing).
- `packages/documents/domain/test/value-objects/ExifMetadata.test.ts:24` — Exercises `omitKnownLargeFields` to ensure large blobs are purged before schema decoding.

## Tooling & Docs Shortcuts
- Effect Schema patterns (struct/class annotations, decoding):  
  `context7__get-library-docs` → `{ "context7CompatibleLibraryID": "/llmstxt/effect_website_llms-small_txt", "topic": "Schema", "tokens": 1200 }`
- Effect collection piping (Array combinators):  
  `effect_docs__get_effect_doc` → `{ "documentId": 4856 }` (documentation for `effect/Array.map`)
- EXIF reader behaviour, supported loaders, memory notes:  
  `context7__get-library-docs` → `{ "context7CompatibleLibraryID": "/mattiasw/exifreader", "topic": "usage", "tokens": 800 }`

## Authoring Guardrails
- Namespace every Effect import (`import * as Effect from "effect/Effect"`, `import * as A from "effect/Array"`, `import * as F from "effect/Function"`, etc.) and route **all** collection/string/object transforms through those modules. Do not add new native `.map`, `.split`, `for...of`, or `Object.entries` usage—existing legacy helpers are quarantined and should shrink over time.
- When expanding `FileTypes`, keep signatures immutable (use hex literals), document compatible extensions, and extend relevant test matrices under `test/value-objects/file-types`.
- For ambiguous signatures (MP4/M4V/HEIC/FLV, MKV/WEBM), adjust the additional check helpers (`isHeicSignatureIncluded`, `findMatroskaDocTypeElements`) and update `FILE_TYPES_REQUIRED_ADDITIONAL_CHECK`.
- `FileInstance` depends on the global `File` constructor; when introducing new consumers ensure they operate in environments where `File` exists (browser/Bun with polyfill). Provide fallbacks or guards in server contexts.
- `ExifMetadata` cleaning heuristics drop large payloads; extend `LARGE_DATA_FIELDS` cautiously and always cover with regression tests to avoid trimming required tags.
- Prefer `formatSize` over legacy `bytes-to-size` and rely on the unit kits exported by `FileSize` when surfacing typed options to callers.

## Quick Recipes
```ts
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Str from "effect/String";
import * as S from "effect/Schema";
import { fileTypeChecker, getFileChunk, FileAttributes, ExifMetadata } from "@beep/documents-domain/value-objects";
import { formatSize, readFileArrayBuffer } from "@beep/documents-domain/utils";

// End-to-end file analysis: signature detection, attribute decoding, optional EXIF extraction
export const analyzeUpload = (file: File) =>
  Effect.gen(function* () {
    const formattedSize = formatSize(file.size);
    const buffer = yield* readFileArrayBuffer(file);
    const chunk = getFileChunk(buffer, 128);
    const detected = fileTypeChecker.detectFile(chunk, { chunkSize: 128 });

    const attributes = yield* S.decodeUnknown(FileAttributes)({
      size: file.size,
      type: detected?.mimeType ?? file.type,
      lastModifiedDate: file.lastModified,
      lastModified: file.lastModified,
      name: file.name,
    });

    const exif = yield* (
      detected && F.pipe(detected.mimeType, Str.startsWith("image/"))
        ? ExifMetadata.extractMetadata(file).pipe(Effect.orElseSucceed(() => undefined))
        : Effect.succeed<ExifMetadata.Type | undefined>(undefined)
    );

    return { formattedSize, detected, attributes, exif };
  });

// Reuse the detection registry to assert allowed bundles (Array<number>, ArrayBuffer, or Uint8Array)
export const ensureCompressed = (buffer: ArrayBuffer) =>
  F.pipe(
    getFileChunk(buffer, 64),
    (chunk) => fileTypeChecker.validateFileType(chunk, ["zip", "rar"], { excludeSimilarTypes: true })
  );
```

## Verifications
- `bun run test --filter=@beep/documents-domain` — Vitest suites for detection heuristics and utilities.
- `bun run check --filter=@beep/documents-domain` — TypeScript project refs across `src` + `test`.
- `bun run lint --filter=@beep/documents-domain` / `bun run lint:fix --filter=@beep/documents-domain` — Biome + circular dependency checks.
- `bunx effect generate --cwd packages/documents/domain` — Refresh autogenerated `index.ts` / barrel exports after adding modules.

## Contributor Checklist
- [ ] All new code uses Effect namespace utilities (Array/String/Record) and avoids introducing fresh native helpers.
- [ ] File signature changes include corresponding test fixtures under `test/value-objects/file-types`.
- [ ] EXIF schema updates document new tag semantics and cover `omitKnownLargeFields` regressions.
- [ ] Re-ran lint/check/test targets above and regenerated Effect indices when touching exports.
- [ ] Updated downstream references (e.g., upload pipelines or infra adapters) when expanding value object surfaces.
