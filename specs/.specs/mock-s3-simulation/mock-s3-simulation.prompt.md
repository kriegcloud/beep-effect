---
name: mock-s3-simulation
version: 1
created: 2025-12-07T12:00:00Z
iterations: 3
---

# Mock S3 Upload Simulation Pipeline - Refined Prompt

## Context

You are working in the `beep-effect` monorepo, an Effect-first full-stack application. The codebase follows strict functional programming patterns with Effect as the core framework. An existing mock S3 simulation exists in `scratchpad/index.ts` using `mock-xmlhttprequest` and `@effect/platform-browser`.

This task requires building a **complete end-to-end file upload simulation pipeline** that:
1. Loads a file from disk (`scratchpad/logo.png`)
2. Transforms it through the schema pipeline
3. Uploads via RPC with streaming progress
4. Persists to the database

The pipeline must integrate with existing infrastructure: `FileRepo`, `EncryptionService`, `ExifToolService`, and the existing mock S3 layer pattern.

## Objective

Create a production-quality file upload simulation that demonstrates:

1. **File Loading & Transformation**: Load `scratchpad/logo.png`, decode via `FileInstanceFromNative`, extract EXIF metadata
2. **UploadKey Generation**: Create valid S3 paths using the `UploadKey` schema from decoded `FileInstance` properties
3. **FileRpc Implementation**: Create an `@effect/rpc` RpcGroup with streaming upload progress support
4. **Pre-signed URL Flow**: Generate and verify mock pre-signed URLs with `EncryptionService.generateSignedURL`
5. **Layer Composition**: Proper production and test layer separation
6. **Database Persistence**: Insert the completed upload via `FileRepo`

### Success Criteria

- [ ] File loads from `scratchpad/logo.png` using Bun's file API
- [ ] `FileInstanceFromNative` transformation succeeds with all properties populated
- [ ] EXIF metadata extracted for image files via `ExifToolService`
- [ ] `UploadKey` schema produces valid S3 key format
- [ ] `FileRpc` group exposes `initiateUpload`, `completeUpload`, `getUploadStatus` procedures
- [ ] Pre-signed URL generated with HMAC signature via `EncryptionService`
- [ ] Pre-signed URL signature verified via `EncryptionService.verifySignature`
- [ ] Mock S3 layer intercepts PUT requests matching `https://*.s3.amazonaws.com/*`
- [ ] Client-side upload tracks progress via XHR `onprogress` events (not server-streamed)
- [ ] Mock S3 returns ETag header on successful upload completion
- [ ] `FileRepo.insert` persists the `File.Model` record
- [ ] All code passes `bun run check` and `bun run lint`

## Role

You are an expert Effect-TS developer with deep knowledge of:
- Effect service patterns (`Effect.Service`, `Context.Tag`, `Layer`)
- `@effect/rpc` for type-safe RPC with streaming
- `@effect/platform` for HTTP and file system operations
- `@effect/sql` Model patterns for database entities
- Schema transformations with `S.transformOrFail`

You prioritize idiomatic Effect patterns over convenience shortcuts.

## Constraints

### Forbidden Patterns

```typescript
// NEVER use these patterns
async function foo() { ... }           // Use Effect.gen
await somePromise                       // Use Effect.tryPromise
try { } catch { }                       // Use Effect.catchTag/catchAll
items.map(x => x.name)                  // Use F.pipe(items, A.map(...))
items.filter(x => x.active)             // Use F.pipe(items, A.filter(...))
str.split(" ")                          // Use F.pipe(str, Str.split(" "))
str.toUpperCase()                       // Use F.pipe(str, Str.toUpperCase)
new Date()                              // Use DateTime.unsafeNow()
switch (value) { case "a": ... }        // Use Match.value(value).pipe(...)
throw new Error("...")                  // Use Effect.fail(new TaggedError(...))
Object.keys(obj)                        // Use F.pipe(obj, Struct.keys)
```

### Required Patterns

```typescript
// Import conventions
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Context from "effect/Context";
import * as Stream from "effect/Stream";
import * as S from "effect/Schema";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as Str from "effect/String";
import * as O from "effect/Option";
import * as DateTime from "effect/DateTime";
import * as Duration from "effect/Duration";
import * as Match from "effect/Match";
import * as Schedule from "effect/Schedule";
import * as Mailbox from "effect/Mailbox";
import * as Rpc from "@effect/rpc/Rpc";
import * as RpcGroup from "@effect/rpc/RpcGroup";

// Service definition pattern
class MyService extends Effect.Service<MyService>()("MyService", {
  dependencies: [Dep1.Default, Dep2.Default],
  accessors: true,
  effect: Effect.gen(function* () {
    const dep1 = yield* Dep1;
    return {
      myMethod: (input) => Effect.gen(function* () { ... })
    };
  })
}) {}

// RPC Group definition
// NOTE: Upload progress is tracked CLIENT-SIDE via XHR onprogress during direct S3 PUT
// The server only provides pre-signed URLs and records completion
const FileRpcs = RpcGroup.make(
  Rpc.make("initiateUpload", {
    payload: { fileId: S.String, fileName: S.String, contentType: S.String, size: S.Number },
    success: PresignedUrlResponse,
    error: UploadError
  }),
  Rpc.make("completeUpload", {
    payload: { fileId: S.String, etag: S.String, metadata: S.optional(S.Unknown) },
    success: FileRecord,
    error: UploadError
  }),
  Rpc.make("getUploadStatus", {
    payload: { fileId: S.String },
    success: UploadStatus,
    error: UploadError
  })
);

// Tagged error pattern
class UploadError extends S.TaggedError<UploadError>()("UploadError", {
  message: S.String,
  fileId: S.optional(S.String),
  cause: S.optional(S.Unknown)
}) {}

// Layer composition
const TestLayer = Layer.mergeAll(
  MockS3Layer,
  EncryptionService.layer,
  ExifToolService.Default
).pipe(
  Layer.provideMerge(FileRepo.layer)
);
```

### Repository Standards

- All file operations through `@effect/platform` FileSystem service
- Secrets wrapped in `Redacted<string>`
- Database operations via `Repo.make` pattern from `@beep/shared-server`
- Entity IDs via `SharedEntityIds.FileId.create()`
- Audit columns automatically via `makeFields` from `@beep/shared-domain/common`

## Resources

### Files to Read (Primary)

| Path | Purpose |
|------|---------|
| `scratchpad/index.ts` | Existing mock S3 layer implementation (`createMockS3Layer`) |
| `packages/shared/domain/src/entities/File/File.model.ts` | File entity model with `Model.create` factory |
| `packages/shared/domain/src/entities/File/schemas/UploadKey.ts` | S3 path schema with shard prefix generation |
| `packages/common/schema/src/integrations/files/FileInstance.ts` | `FileInstanceFromNative` transformation |
| `packages/documents/server/src/adapters/repos/File.repo.ts` | FileRepo service definition |
| `packages/documents/server/src/files/ExifToolService.ts` | EXIF metadata extraction |
| `packages/shared/domain/src/services/EncryptionService/EncryptionService.ts` | `generateFileKey`, `generateSignedURL` |

### Files to Read (Reference)

| Path | Purpose |
|------|---------|
| `packages/documents/domain/src/entities/Document/Document.rpc.ts` | RpcGroup definition example with streaming |
| `packages/documents/server/src/handlers/Document.handlers.ts` | RPC handler implementation pattern |
| `apps/web/src/features/upload/uploadToS3.ts` | XHR upload with progress tracking |
| `apps/web/src/features/upload/UploadFileService.ts` | Effect.Service pattern with ExifTool |
| `packages/shared/server/src/internal/upload/upload.service.ts` | Server-side presigned URL generation |

### Files to Create

| Path | Purpose |
|------|---------|
| `scratchpad/test-file.ts` | File loading utility using Bun FileSystem |
| `scratchpad/FileRpc.ts` | RpcGroup definition for file upload |
| `scratchpad/FileRpcHandlers.ts` | Handler implementations |
| `scratchpad/FileUploadSimulation.ts` | Main orchestration program |
| `scratchpad/layers.ts` | Production and test layer composition |

## Output Specification

### 1. `scratchpad/test-file.ts`

```typescript
// Load file from disk, return as FileFromSelf-compatible object
// Use Bun.file() API wrapped in Effect
//
// Export signature:
// loadTestFile(path: string) => Effect<
//   { file: BunFile; blob: Blob; buffer: Uint8Array },
//   FileLoadError
// >
//
// Returns Bun.file() handle + materialized blob + buffer for schema transform
// The blob/buffer are required because FileInstanceFromNative needs arrayBuffer()
```

### 2. `scratchpad/FileRpc.ts`

```typescript
// Define RpcGroup with:
// - initiateUpload: Request presigned URL from server
// - completeUpload: Called AFTER successful S3 upload to persist to DB
// - getUploadStatus: Query upload state (optional)
//
// NOTE: Upload progress is NOT streamed via RPC.
// Progress is tracked client-side via XHR onprogress during direct PUT to S3.
// The server only provides pre-signed URLs and records completion.

// Export: FileRpcs, all request/response schemas, error types
```

### 3. `scratchpad/FileRpcHandlers.ts`

```typescript
// Implement handlers using FileRpcs.toLayer pattern
// - Use EncryptionService for presigned URL generation and signing
// - Use FileRepo for persistence
//
// Handler responsibilities:
// - initiateUpload: Generate pre-signed URL, return to client
// - completeUpload: Verify ETag, persist File.Model to DB
// - getUploadStatus: Query file record status
//
// Upload Flow (client-side progress, not server-streamed):
// ┌────────┐    initiateUpload    ┌────────┐
// │ Client │───────────────────▶ │ Server │ → Generate presigned URL
// └────────┘                      └────────┘
//     │
//     │ PUT to S3 (direct, with XHR onprogress)
//     ▼
// ┌────────┐    completeUpload    ┌────────┐
// │ Client │───────────────────▶ │ Server │ → Verify ETag, persist to DB
// └────────┘                      └────────┘
//
// Transaction boundaries:
// - completeUpload must verify S3 upload succeeded (check ETag from client)
// - Insert via FileRepo.insert (upsert pattern using fileId as idempotency key)
// - On DB failure: log warning (S3 cleanup handled by lifecycle policy)

// Export: FileRpcHandlers layer
```

### 4. `scratchpad/layers.ts`

```typescript
// Define:
// - ProductionLayer: Real services (HttpClient, real DB)
// - TestLayer: Mock S3, test database
// - SimulationLayer: For scratchpad testing (alias for TestLayer with console logging)
//
// Dependency graph:
// SimulationLayer = Layer.mergeAll(
//   createMockS3Layer,              // Provides: HttpClient (mocked)
//   EncryptionService.Default,       // Provides: EncryptionService
//   ExifToolService.Default,         // Provides: ExifToolService
//   FileRepo.Test                    // Provides: FileRepo, requires: Db
// ).pipe(Layer.provide(Db.Test))
//
// ProductionLayer replaces:
// - createMockS3Layer → HttpClient.layer (real)
// - Db.Test → Db.Default

// Export: all layers
```

### 5. `scratchpad/FileUploadSimulation.ts`

```typescript
// Main program that:
// 1. Loads scratchpad/logo.png
// 2. Transforms via FileInstanceFromNative
// 3. Extracts EXIF if image type (MIME starts with "image/")
// 4. Creates UploadKey
// 5. Initiates upload via RPC (gets presigned URL)
// 6. Simulates single PUT with progress events (not S3 multipart API)
//    Progress simulated via mock XHR onprogress events
// 7. Completes upload and persists

// Run with: bun run scratchpad/FileUploadSimulation.ts
```

## Examples

### File Transformation Pipeline

```typescript
const processFile = Effect.gen(function* () {
  // 1. Load native file
  const nativeFile = yield* loadTestFile("scratchpad/logo.png");

  // 2. Transform to FileInstance
  const fileInstance = yield* S.decode(FileInstanceFromNative)(nativeFile);

  // 3. Extract EXIF for images (mediaType is MIME like "image/png")
  const exif = yield* F.pipe(
    fileInstance.mediaType,
    Match.value,
    Match.when(
      (mime) => F.pipe(mime, Str.startsWith("image/")),
      () => ExifToolService.extractMetadata(nativeFile)
    ),
    Match.orElse(() => Effect.succeed(null))
  );

  // 4. Create File.Model
  const fileModel = yield* File.Model.create({
    file: nativeFile,
    config: {
      env: "dev",
      bucketName: "test-bucket.s3.amazonaws.com",
      organizationId: SharedEntityIds.OrganizationId.create(),
      entityKind: "user",
      entityIdentifier: SharedEntityIds.UserId.create(),
      entityAttribute: "avatar",
      organizationType: "individual",
      createdBy: "simulation",
    }
  });

  return { fileInstance, exif, fileModel };
});
```

### Client-Side Upload with Progress

```typescript
// Client uploads directly to S3 using pre-signed URL
// Progress is tracked via XHR onprogress, NOT server-streamed RPC
const uploadToS3 = (file: Blob, presignedUrl: string) =>
  Effect.async<string, UploadError>((resume) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        console.log(`Upload progress: ${percent}%`);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const etag = xhr.getResponseHeader("ETag") ?? "";
        resume(Effect.succeed(etag));
      } else {
        resume(Effect.fail(new UploadError({
          message: `Upload failed with status ${xhr.status}`
        })));
      }
    };

    xhr.onerror = () => resume(Effect.fail(new UploadError({
      message: "Network error during upload"
    })));

    xhr.open("PUT", presignedUrl);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.send(file);
  });
```

### Pre-signed URL Generation

```typescript
const generatePresignedUrl = Effect.gen(function* () {
  const encryption = yield* EncryptionService;
  const config = yield* SimulationConfig; // Get from layer
  const secret = config.signingSecret;    // Already Redacted<string>

  const url = yield* encryption.generateSignedURL(
    `https://bucket.s3.amazonaws.com/${uploadPath}`,
    secret,
    { ttlInSeconds: Duration.minutes(15) }
  );

  return url;
});
```

### Error Handling Patterns

```typescript
// Define specific error types for each failure mode
class FileNotFoundError extends S.TaggedError<FileNotFoundError>()("FileNotFoundError", {
  path: S.String,
  message: S.String
}) {}

class ExifExtractionError extends S.TaggedError<ExifExtractionError>()("ExifExtractionError", {
  fileId: S.String,
  cause: S.Unknown
}) {}

class UploadTimeoutError extends S.TaggedError<UploadTimeoutError>()("UploadTimeoutError", {
  fileId: S.String,
  elapsedMs: S.Number
}) {}

// Error construction example
const handleFileNotFound = (path: string) =>
  Effect.fail(new FileNotFoundError({
    path,
    message: `File not found at path: ${path}`
  }));

// Graceful degradation for EXIF extraction
const extractExifSafely = (file: NativeFile, fileId: string) =>
  F.pipe(
    ExifToolService.extractMetadata(file),
    Effect.catchTag("ExifExtractionError", (e) =>
      Effect.gen(function* () {
        yield* Effect.logWarning("EXIF extraction failed, continuing without metadata", { fileId, cause: e });
        return null; // Graceful degradation
      })
    ),
    Effect.catchAll((e) =>
      Effect.fail(new UploadError({
        message: "Critical EXIF failure",
        fileId: O.some(fileId),
        cause: O.some(e)
      }))
    )
  );

// Retry logic for transient failures
const uploadWithRetry = (file: NativeFile, url: string) =>
  F.pipe(
    performUpload(file, url),
    Effect.retry({
      times: 3,
      schedule: Schedule.exponential(Duration.millis(100))
    }),
    Effect.catchTag("UploadTimeoutError", (e) =>
      Effect.fail(new UploadError({
        message: `Upload timed out after ${e.elapsedMs}ms`,
        fileId: O.some(e.fileId),
        cause: O.some(e)
      }))
    )
  );
```

## Verification Checklist

- [ ] All imports use namespace pattern (`import * as X from "..."`)
- [ ] No native array/string methods used
- [ ] No async/await or bare Promises
- [ ] All errors are `Schema.TaggedError` subclasses
- [ ] Services use `Effect.Service` pattern with `dependencies` array
- [ ] RPC endpoints: `initiateUpload`, `completeUpload`, `getUploadStatus`
- [ ] Pre-signed URLs use `EncryptionService.generateSignedURL`
- [ ] File entity uses `File.Model.create` factory
- [ ] Upload path uses `UploadKey` schema transformation
- [ ] Test layer uses `Layer.mergeAll` composition
- [ ] Client-side upload uses XHR with `onprogress` for progress tracking
- [ ] `bun run check` passes with no type errors
- [ ] `bun run lint` passes with no lint errors
- [ ] Simulation runs end-to-end with visible progress output

---

## Metadata

### Research Sources

**Files Explored:**
- `scratchpad/index.ts` - Mock S3 layer with `createMockS3Layer`, progress simulation
- `packages/shared/domain/src/entities/File/` - File.Model, UploadKey, schemas
- `packages/common/schema/src/integrations/files/` - FileInstance, EXIF, validation
- `packages/documents/server/src/` - FileRepo, ExifToolService, StorageService
- `packages/shared/domain/src/services/EncryptionService/` - Key generation, signing
- `packages/documents/domain/src/entities/Document/Document.rpc.ts` - RPC patterns
- `apps/web/src/features/upload/` - Full upload pipeline reference

**Documentation Referenced:**
- `@effect/rpc` source: RpcGroup.make, Rpc.make with stream option
- `@effect/platform` source: BrowserHttpClient, FileSystem
- Repository AGENTS.md files for coding standards

**Package Guidelines:**
- `@beep/shared-domain/AGENTS.md` - Entity model patterns, makeFields
- `@beep/shared-server/AGENTS.md` - Repo.make, Layer composition, Config
- `@beep/documents-server/AGENTS.md` - StorageService, ExifToolService
- `@beep/schema/AGENTS.md` - EntityId factories, transformation schemas
- `@beep/testkit/AGENTS.md` - Test layer patterns, it.effect

### Refinement History

| Iteration | Issues Found | Fixes Applied |
|-----------|--------------|---------------|
| 0         | Initial draft | N/A          |
| 1         | 2 HIGH (error handling, stream arch), 5 MEDIUM (mock S3 integration, file API, layer deps, EXIF predicate, presigned URL) | Added Error Handling Patterns section, streaming architecture diagram, layer dependency graph, fixed EXIF MIME predicate, clarified file loading signature, added verification steps |
| 2         | 3 LOW (missing Schedule, Duration, Mailbox imports) | Added missing imports to Required Patterns section |
| 3         | 1 HIGH (architectural: server-streamed progress impossible with pre-signed URL flow) | Removed `uploadProgress` streaming RPC, clarified client-side XHR progress tracking, updated flow diagrams and examples |
