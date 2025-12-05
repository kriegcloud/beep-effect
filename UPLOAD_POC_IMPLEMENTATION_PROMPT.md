# Upload Pipeline POC Implementation Prompt

## Mission

Implement a complete end-to-end file upload pipeline POC for the beep-effect monorepo. This includes:

1. **Server API Route**: `apps/web/src/app/api/v1/files/route.ts`
2. **Extended Client Features**: Enhance `apps/web/src/features/upload/`

The implementation must follow Effect-first patterns, use existing schemas/services, and integrate with the established architecture.

---

## Architecture Overview

```
Client (Browser)                    Server (API Route)                    S3
    │                                     │                               │
    │  1. User selects file(s)            │                               │
    │  ┌─────────────────────────┐        │                               │
    │  │ validateFile()          │        │                               │
    │  │ extractBasicMetadata()  │        │                               │
    │  │ extractExifMetadata()   │        │                               │
    │  └─────────────────────────┘        │                               │
    │                                     │                               │
    │  2. POST /api/v1/files              │                               │
    │  (FileUploadData[])                 │                               │
    │──────────────────────────────────>  │                               │
    │                                     │  3. Auth + validate           │
    │                                     │  4. File.Model.create()       │
    │                                     │  5. UploadService.getPreSignedUrl()
    │                                     │──────────────────────────────>│
    │                                     │                               │
    │  6. Return presigned URL + fileId   │                               │
    │<──────────────────────────────────  │                               │
    │                                     │                               │
    │  7. XHR PUT to S3 presigned URL     │                               │
    │─────────────────────────────────────────────────────────────────────>
    │                                     │                               │
    │  8. Upload complete callback        │                               │
    │──────────────────────────────────>  │                               │
    │                                     │  9. FileRepo.insert() to DB   │
    │                                     │                               │
    │  10. Return final file data         │                               │
    │<──────────────────────────────────  │                               │
```

---

## Critical Information

### Environment Variables (from `@beep/core-env/server`)

```typescript
// AWS S3 Configuration - accessed via ServerConfig
cloud.aws.region           // AWS region (default: "us-east-1")
cloud.aws.accessKeyId      // AWS access key (Redacted)
cloud.aws.secretAccessKey  // AWS secret key (Redacted)
cloud.aws.s3.bucketName    // S3 bucket name

// Additional required for upload signing
// Add to .env: UPLOAD_SIGNING_SECRET=<your-secret>
```

### Runtime Pattern

**IMPORTANT**: Never use raw `await` in server code. Use `serverRuntime` from `@beep/runtime-server`:

```typescript
import { runServerPromise, serverRuntime } from "@beep/runtime-server";

// In Next.js API route:
export async function POST(request: Request) {
  const effect = Effect.gen(function* () {
    // Your Effect code here
    return { success: true };
  });

  const result = await runServerPromise(effect, "UploadRoute.POST");
  return Response.json(result);
}
```

### Authentication Pattern (from `@beep/iam-infra`)

```typescript
import { auth } from "@/lib/auth"; // Uses better-auth

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user?.id) {
    return Response.json(
      { error: { _tag: "Unauthorized", message: "Authentication required" } },
      { status: 401 }
    );
  }

  const userId = session.user.id;
  // organizationId comes from session.session.activeOrganizationId
  const organizationId = session.session.activeOrganizationId;

  // ... proceed with upload logic
}
```

### Error Responses (Schema.TaggedError pattern)

All errors MUST use `Data.TaggedError`:

```typescript
import * as Data from "effect/Data";

export class UploadError extends Data.TaggedError("UploadError")<{
  readonly code: string;
  readonly message: string;
  readonly cause?: unknown;
}> {}

export class SignatureError extends Data.TaggedError("SignatureError")<{
  readonly message: string;
}> {}

export class ValidationError extends Data.TaggedError("ValidationError")<{
  readonly message: string;
  readonly fileName?: string;
  readonly fileType?: string;
}> {}

// Return errors in API responses with proper shape:
return Response.json({
  error: {
    _tag: "UploadError",
    code: "INVALID_FILE",
    message: "File type not supported"
  }
}, { status: 400 });
```

---

## Key Files Reference

### MUST READ (Core Implementation Files)

| File | Purpose |
|------|---------|
| `packages/shared/domain/src/entities/File/File.model.ts` | File entity with `Model.create()` factory |
| `packages/shared/domain/src/entities/File/schemas/UploadPath.ts` | S3 path schema with bidirectional transforms |
| `packages/shared/infra/src/internal/upload/upload.service.ts` | `UploadService` with `getPreSignedUrl`, `deleteObject` |
| `packages/shared/infra/src/internal/upload/crypto.ts` | `signPayload`, `verifySignature`, `generateKey`, `generateSignedURL` |
| `packages/documents/infra/src/adapters/repos/File.repo.ts` | `FileRepo` with CRUD operations (insert, update, findById, delete) |
| `apps/web/src/features/upload/UploadFileService.ts` | Client-side `processFile`, `processFiles` |
| `apps/web/src/features/upload/pipeline.ts` | `validateFile`, `extractBasicMetadata`, `extractExifMetadata` |

### Reference Files (Patterns & Types)

| File | Purpose |
|------|---------|
| `packages/shared/infra/src/internal/upload/_internal/shared-schemas.ts` | `FileUploadData`, `UploadedFileData`, `NewPresignedUrl` schemas |
| `packages/shared/infra/src/internal/upload/utils.ts` | `generateTraceHeaders`, `TraceHeaders` type |
| `packages/shared/tables/src/tables/file.table.ts` | Drizzle table schema (now aligned with File.Model) |
| `packages/runtime/server/src/Runtime.ts` | `serverRuntime`, `runServerPromise` |
| `packages/runtime/client/src/services/runtime/make-atom-runtime.ts` | Client runtime pattern |
| `packages/iam/sdk/src/clients/session/session.atoms.ts` | `AtomHttpApi` pattern for client API calls |
| `packages/core/env/src/server.ts` | Server environment configuration |

---

## Implementation Tasks

### 1. Server API Route (`apps/web/src/app/api/v1/files/route.ts`)

Create a Next.js App Router API route handling:

#### POST `/api/v1/files` - Request Presigned URLs

**Request Body** (use existing schema):
```typescript
import { UploadActionPayload } from "@beep/shared-infra/internal/upload/_internal/shared-schemas";

// Schema structure:
// files: Array<{ name: string, size: number, type: string, lastModified?: number }>
// input: Json (custom metadata from client)
```

**Handler Steps**:
1. Parse request body with `S.decode(UploadActionPayload)`
2. Authenticate user (get `userId`, `organizationId` from session)
3. For each file in `files`:
   - Generate `FileId` via `SharedEntityIds.FileId.create()`
   - Build `UploadPath.Encoded` payload (the structured data, NOT the S3 path string)
   - Call `UploadService.getPreSignedUrl(uploadPathData)`
   - Generate SQID key via `generateKey()` from crypto.ts
4. Return array with extended presigned URL info

**IMPORTANT - getPreSignedUrl Parameter**:

The parameter type is `File.UploadPath.Encoded` which is the **structured input data**, NOT an S3 path string. The naming is counterintuitive due to bidirectional transforms:

```typescript
import { File } from "@beep/shared-domain/entities";
import { SharedEntityIds } from "@beep/shared-domain";

// Build the structured upload path data
const uploadPathData: File.UploadPath.Encoded = {
  env: "dev",                           // EnvValue: "dev" | "staging" | "prod"
  fileId: fileId,                       // SharedEntityIds.FileId.Type
  organizationType: "individual",        // "individual" | "team" | "enterprise"
  organizationId: organizationId,        // SharedEntityIds.OrganizationId.Type
  entityKind: "user",                   // EntityKind
  entityIdentifier: userId,              // AnyEntityId.Type
  entityAttribute: "avatar",             // string (purpose: avatar, logo, document, etc.)
  fileItemExtension: extension,          // BS.FileExtension.Type
};

// This returns the presigned URL string
const presignedUrl = yield* UploadService.getPreSignedUrl(uploadPathData);
```

**Response Schema** (create new):
```typescript
import * as S from "effect/Schema";

// NewPresignedUrl lacks fileId, so create extension:
export class PresignedUrlItem extends S.Class<PresignedUrlItem>("PresignedUrlItem")({
  url: S.String,
  key: S.String,
  fileId: S.String,           // Added - not in NewPresignedUrl
  name: S.String,
  customId: S.NullOr(S.String),
}) {}

export class PresignedUrlResponse extends S.Class<PresignedUrlResponse>("PresignedUrlResponse")({
  urls: S.Array(PresignedUrlItem),
  traceHeaders: S.Struct({
    b3: S.String,
    traceparent: S.String,
  }),
  signature: S.String,  // For callback verification
}) {}
```

#### POST `/api/v1/files/callback` - Upload Complete Callback

**Request Body**:
```typescript
export class UploadCallbackPayload extends S.Class<UploadCallbackPayload>("UploadCallbackPayload")({
  fileId: S.String,
  key: S.String,
  fileHash: S.String,   // MD5 hex of uploaded content
}) {}
```

**Handler Steps**:
1. Verify signature via `verifySignature()` from crypto.ts (from `x-beep-signature` header)
2. Look up pending file by `fileId`
3. Update file status: `PENDING` -> `PROCESSING` -> `READY`
4. Insert file record using `FileRepo.insert()`
5. Return `UploadedFileData`

#### Database Insertion with FileRepo

The `FileRepo` (from `@beep/documents-infra`) already has CRUD operations via `Repo.make`:

```typescript
import { FileRepo } from "@beep/documents-infra/adapters/repos/File.repo";

// In your effect:
const fileRepo = yield* FileRepo;

// Insert returns the inserted entity
const inserted = yield* fileRepo.insert(fileModelData);

// Or void version
yield* fileRepo.insertVoid(fileModelData);

// Update
yield* fileRepo.update({ id: fileId, status: FileStatus.Enum.READY });

// Find
const file = yield* fileRepo.findById(fileId);
```

#### Complete Server Route Example

```typescript
import { auth } from "@/lib/auth";
import { runServerPromise } from "@beep/runtime-server";
import { File } from "@beep/shared-domain/entities";
import { SharedEntityIds } from "@beep/shared-domain";
import { UploadService } from "@beep/shared-infra/internal/upload";
import { signPayload, verifySignature, generateKey } from "@beep/shared-infra/internal/upload/crypto";
import { generateTraceHeaders } from "@beep/shared-infra/internal/upload/utils";
import { UploadActionPayload } from "@beep/shared-infra/internal/upload/_internal/shared-schemas";
import { FileRepo } from "@beep/documents-infra/adapters/repos/File.repo";
import { Effect } from "effect";
import * as S from "effect/Schema";
import * as Config from "effect/Config";
import * as Redacted from "effect/Redacted";

export async function POST(request: Request) {
  // 1. Authenticate
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user?.id) {
    return Response.json(
      { error: { _tag: "Unauthorized", message: "Authentication required" } },
      { status: 401 }
    );
  }

  const effect = Effect.gen(function* () {
    // 2. Parse request
    const body = yield* Effect.tryPromise({
      try: () => request.json(),
      catch: () => new UploadError({ code: "PARSE_ERROR", message: "Invalid JSON" }),
    });
    const payload = yield* S.decodeUnknown(UploadActionPayload)(body);

    // 3. Get config and services
    const signingSecret = yield* Config.redacted("UPLOAD_SIGNING_SECRET");
    const uploadService = yield* UploadService;

    // 4. Generate presigned URLs for each file
    const traceHeaders = generateTraceHeaders();
    const urls = yield* Effect.forEach(payload.files, (fileData, index) =>
      Effect.gen(function* () {
        const fileId = SharedEntityIds.FileId.create();
        const extension = yield* S.decodeUnknown(BS.FileExtension)(
          fileData.name.split(".").pop() ?? ""
        );

        const uploadPathData: File.UploadPath.Encoded = {
          env: "dev", // from config
          fileId,
          organizationType: "individual",
          organizationId: SharedEntityIds.OrganizationId.make(session.session.activeOrganizationId!),
          entityKind: "user",
          entityIdentifier: SharedEntityIds.UserId.make(session.user.id),
          entityAttribute: "upload",
          fileItemExtension: extension,
        };

        const presignedUrl = yield* uploadService.getPreSignedUrl(uploadPathData);
        const key = yield* generateKey(
          { name: fileData.name, size: fileData.size, type: fileData.type },
          "beep-app"
        );

        return {
          url: presignedUrl,
          key,
          fileId,
          name: fileData.name,
          customId: null,
        };
      })
    );

    // 5. Sign the response for callback verification
    const signature = yield* signPayload(JSON.stringify(urls), signingSecret);

    return {
      urls,
      traceHeaders,
      signature,
    };
  });

  try {
    const result = await runServerPromise(effect, "UploadRoute.POST");
    return Response.json(result);
  } catch (error) {
    return Response.json(
      { error: { _tag: "UploadError", code: "SERVER_ERROR", message: String(error) } },
      { status: 500 }
    );
  }
}
```

---

### 2. Extended Client Features (`apps/web/src/features/upload/`)

#### Client Runtime Pattern (from `@beep/runtime-client`)

```typescript
import { makeAtomRuntime } from "@beep/runtime-client/services/runtime/make-atom-runtime";
import { Atom } from "@effect-atom/atom-react";

// Create runtime with your service layer
export const uploadRuntime = makeAtomRuntime(UploadClientService.Live);

// Create atoms for reactive queries
export const uploadProgressAtom = uploadRuntime.atom(
  UploadClientService.GetProgress()
).pipe(Atom.withReactivity(["upload-progress"]));
```

#### 2.1 Create `useUpload.ts` Hook

React hook for complete upload flow:

```typescript
import * as HttpClient from "@effect/platform/HttpClient";
import * as HttpClientRequest from "@effect/platform/HttpClientRequest";
import * as HttpClientResponse from "@effect/platform/HttpClientResponse";

interface UseUploadOptions {
  readonly onProgress?: (progress: UploadProgress) => void;
  readonly onSuccess?: (result: UploadedFileData) => void;
  readonly onError?: (error: UploadError) => void;
  readonly config?: PipelineConfig;
}

interface UploadProgress {
  readonly fileId: string;
  readonly loaded: number;
  readonly total: number;
  readonly percent: number;
}

export const useUpload = (options: UseUploadOptions) => {
  // Returns:
  // - upload: (files: FileList | File[]) => Effect<UploadedFileData[], UploadError, never>
  // - uploadSingle: (file: File) => Effect<UploadedFileData, UploadError, never>
  // - isUploading: boolean
  // - progress: Map<string, UploadProgress>
  // - reset: () => void
};
```

#### 2.2 Create `uploadToS3.ts` - XHR Upload with Progress

Use XHR (not fetch) for upload progress events:

```typescript
import * as Effect from "effect/Effect";
import { UploadError } from "@beep/shared-infra/internal/upload/error";
import type { TraceHeaders } from "@beep/shared-infra/internal/upload/utils";

interface UploadToS3Options {
  readonly file: File;
  readonly presignedUrl: string;
  readonly rangeStart?: number;  // For resumable uploads
  readonly onProgress?: (progress: { loaded: number; delta: number }) => void;
  readonly traceHeaders?: TraceHeaders;
}

export const uploadToS3 = (options: UploadToS3Options): Effect.Effect<void, UploadError> =>
  Effect.async<void, UploadError>((resume) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", options.presignedUrl, true);

    // Set trace headers for distributed tracing
    if (options.traceHeaders) {
      xhr.setRequestHeader("traceparent", options.traceHeaders.traceparent);
      xhr.setRequestHeader("B3", options.traceHeaders.b3);
    }

    // Range header for resumable uploads
    if (options.rangeStart && options.rangeStart > 0) {
      xhr.setRequestHeader("Range", `bytes=${options.rangeStart}-`);
    }

    let previousLoaded = 0;
    xhr.upload.addEventListener("progress", (e) => {
      const delta = e.loaded - previousLoaded;
      previousLoaded = e.loaded;
      options.onProgress?.({
        loaded: (options.rangeStart ?? 0) + e.loaded,
        delta
      });
    });

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resume(Effect.succeed(undefined));
      } else {
        resume(Effect.fail(new UploadError({
          code: "UPLOAD_FAILED",
          message: `S3 upload failed: ${xhr.status}`
        })));
      }
    };

    xhr.onerror = () => {
      resume(Effect.fail(new UploadError({
        code: "UPLOAD_FAILED",
        message: "Network error during upload"
      })));
    };

    // Send file (or slice for resume)
    const blob = options.rangeStart ? options.file.slice(options.rangeStart) : options.file;
    xhr.send(blob);

    // Return finalizer to abort on interruption
    return Effect.sync(() => xhr.abort());
  });
```

#### 2.3 Create `requestPresignedUrls.ts` - API Client

```typescript
import * as HttpClient from "@effect/platform/HttpClient";
import * as HttpClientRequest from "@effect/platform/HttpClientRequest";
import * as HttpClientResponse from "@effect/platform/HttpClientResponse";
import * as Effect from "effect/Effect";
import { FileUploadData } from "@beep/shared-infra/internal/upload/_internal/shared-schemas";
import { PresignedUrlResponse } from "./UploadModels";

export const requestPresignedUrls = Effect.fn("requestPresignedUrls")(function* (
  files: ReadonlyArray<FileUploadData>,
  input?: unknown
) {
  const client = yield* HttpClient.HttpClient;

  const response = yield* client.execute(
    HttpClientRequest.post("/api/v1/files").pipe(
      HttpClientRequest.jsonBody({ files, input })
    )
  ).pipe(
    Effect.flatMap(HttpClientResponse.schemaBodyJson(PresignedUrlResponse))
  );

  return response;
});
```

#### 2.4 Create `completeUpload.ts` - Callback API Client

```typescript
import * as HttpClient from "@effect/platform/HttpClient";
import * as HttpClientRequest from "@effect/platform/HttpClientRequest";
import * as HttpClientResponse from "@effect/platform/HttpClientResponse";
import * as Effect from "effect/Effect";
import { UploadedFileData } from "@beep/shared-infra/internal/upload/_internal/shared-schemas";

export const completeUpload = Effect.fn("completeUpload")(function* (
  fileId: string,
  key: string,
  fileHash: string,
  signature: string
) {
  const client = yield* HttpClient.HttpClient;

  const response = yield* client.execute(
    HttpClientRequest.post("/api/v1/files/callback").pipe(
      HttpClientRequest.jsonBody({ fileId, key, fileHash }),
      HttpClientRequest.setHeader("x-beep-signature", signature)
    )
  ).pipe(
    Effect.flatMap(HttpClientResponse.schemaBodyJson(UploadedFileData))
  );

  return response;
});
```

#### 2.5 Create `UploadPipeline.ts` - Complete Flow Orchestrator

```typescript
import * as Effect from "effect/Effect";
import { UploadFileService } from "./UploadFileService";
import { requestPresignedUrls } from "./requestPresignedUrls";
import { uploadToS3 } from "./uploadToS3";
import { completeUpload } from "./completeUpload";
import type { UploadConfig } from "./UploadModels";

export const uploadFiles = Effect.fn("uploadFiles")(function* (
  files: ReadonlyArray<File>,
  config: UploadConfig
) {
  // 1. Client-side validation (existing UploadFileService)
  const uploadService = yield* UploadFileService;
  const validated = yield* uploadService.processFiles({ files, config });

  if (validated.failures.length > 0) {
    yield* Effect.logWarning("Some files failed validation", {
      failures: validated.failures
    });
  }

  // 2. Request presigned URLs for valid files
  const fileData = validated.successes.map((r) => ({
    name: r.file.name,
    size: r.file.size,
    type: r.validated.detected?.mimeType ?? r.file.type,
    lastModified: r.file.lastModified,
  }));

  const presigned = yield* requestPresignedUrls(fileData, config.input);

  // 3. Upload each file to S3 with progress tracking
  const uploadResults = yield* Effect.forEach(
    presigned.urls,
    (urlInfo, index) => uploadToS3({
      file: validated.successes[index].file,
      presignedUrl: urlInfo.url,
      traceHeaders: presigned.traceHeaders,
      onProgress: (p) => config.onProgress?.({
        fileId: urlInfo.fileId,
        ...p,
        total: validated.successes[index].file.size,
        percent: (p.loaded / validated.successes[index].file.size) * 100,
      }),
    }).pipe(
      Effect.map(() => urlInfo)
    ),
    { concurrency: config.concurrency ?? 3 }
  );

  // 4. Complete uploads (callback to server)
  const completed = yield* Effect.forEach(
    uploadResults,
    (result) => completeUpload(
      result.fileId,
      result.key,
      "placeholder-hash",  // TODO: Compute MD5 on client (use spark-md5 library)
      presigned.signature
    ),
    { concurrency: "unbounded" }
  );

  return {
    successes: completed,
    failures: validated.failures,
  };
});
```

---

### 3. Schema Extensions

#### Add to `apps/web/src/features/upload/UploadModels.ts`:

```typescript
import * as S from "effect/Schema";
import type { TraceHeaders } from "@beep/shared-infra/internal/upload/utils";
import type { PipelineConfig } from "./UploadModels";

export interface UploadConfig extends PipelineConfig {
  readonly input?: unknown;  // Custom metadata
  readonly concurrency?: number;  // Parallel upload count
  readonly onProgress?: (progress: FileUploadProgress) => void;
}

export interface FileUploadProgress {
  readonly fileId: string;
  readonly loaded: number;
  readonly total: number;
  readonly percent: number;
}

// Extended presigned URL item with fileId
export class PresignedUrlItem extends S.Class<PresignedUrlItem>("PresignedUrlItem")({
  url: S.String,
  key: S.String,
  fileId: S.String,
  name: S.String,
  customId: S.NullOr(S.String),
}) {}

// Response from presigned URL request
export class PresignedUrlResponse extends S.Class<PresignedUrlResponse>("PresignedUrlResponse")({
  urls: S.Array(PresignedUrlItem),
  traceHeaders: S.Struct({
    b3: S.String,
    traceparent: S.String,
  }),
  signature: S.String,  // For callback verification
}) {}

// Callback request payload
export class UploadCallbackPayload extends S.Class<UploadCallbackPayload>("UploadCallbackPayload")({
  fileId: S.String,
  key: S.String,
  fileHash: S.String,
}) {}
```

---

### 4. File Table Integration

The `file.table.ts` has been updated to align with `File.Model`. Key columns:

| Column | Type | Description |
|--------|------|-------------|
| `key` | text | S3 object key (full path) |
| `url` | text | Public URL to the file |
| `size` | bigint | File size in bytes |
| `sizeFormatted` | text | Human-readable size |
| `filename` | text | Generated filename |
| `originalFilename` | text | Original upload name |
| `environment` | enum | dev/staging/prod |
| `shardPrefix` | text | 2-char hex for S3 distribution |
| `organizationType` | enum | individual/team/enterprise |
| `extension` | enum | File extension |
| `mimeType` | enum | MIME type |
| `uploadMonth` | smallint | Month 1-12 |
| `fileType` | enum | image/video/audio/pdf/text/blob |
| `status` | enum | PENDING/PROCESSING/FAILED/READY/PENDING_DELETION/DELETED |
| `entityKind` | enum | organization/user/team |
| `entityIdentifier` | text | Entity ID |
| `entityAttribute` | text | Purpose (avatar, logo, etc.) |

---

## Key Patterns to Follow

### 1. Effect-First with serverRuntime

```typescript
// GOOD: Use serverRuntime
import { runServerPromise } from "@beep/runtime-server";

export async function POST(request: Request) {
  const effect = Effect.gen(function* () {
    // Effect code
    return result;
  });

  const result = await runServerPromise(effect, "MyRoute.POST");
  return Response.json(result);
}

// BAD: Raw async/await
const result = await someAsyncOperation();
```

### 2. Schema Validation

```typescript
// Always validate at boundaries
const payload = yield* S.decodeUnknown(UploadActionPayload)(await request.json());

// Use encode/decode for transformations
const s3Key = yield* S.decode(UploadPath)(pathData);
```

### 3. Error Handling with Tagged Errors

```typescript
import * as Data from "effect/Data";

// Define tagged errors
export class PresignError extends Data.TaggedError("PresignError")<{
  readonly message: string;
  readonly cause?: unknown;
}> {}

// Use in Effects
return yield* new PresignError({ message: "Failed to generate presigned URL" });

// Return in API response
return Response.json({
  error: { _tag: "PresignError", message: "Failed" }
}, { status: 400 });
```

### 4. Metrics & Tracing

```typescript
import { UploadMetrics, instrumentProcessFile, makeFileAnnotations } from "@/features/upload/observability";
import * as Metric from "effect/Metric";

// Wrap operations with metrics
yield* someOperation.pipe(
  instrumentProcessFile(makeFileAnnotations(file))
);

// Increment counters
yield* Metric.increment(UploadMetrics.filesProcessedTotal);
```

### 5. Service Pattern

```typescript
// Use Effect.Service for dependency injection
export class UploadFileService extends Effect.Service<UploadFileService>()("UploadFileService", {
  dependencies: [],
  accessors: true,
  effect: Effect.gen(function* () {
    // Implementation
    return { processFile, processFiles };
  }),
}) {}
```

---

## Imports Quick Reference

```typescript
// Effect core
import { Effect, pipe } from "effect";
import * as S from "effect/Schema";
import * as Data from "effect/Data";
import * as Metric from "effect/Metric";
import * as Config from "effect/Config";
import * as Redacted from "effect/Redacted";
import * as O from "effect/Option";

// Platform (use @effect/platform, not platform-browser for server)
import * as HttpClient from "@effect/platform/HttpClient";
import * as HttpClientRequest from "@effect/platform/HttpClientRequest";
import * as HttpClientResponse from "@effect/platform/HttpClientResponse";

// Runtime
import { runServerPromise, serverRuntime } from "@beep/runtime-server";
import { makeAtomRuntime } from "@beep/runtime-client/services/runtime/make-atom-runtime";

// Shared domain
import { SharedEntityIds, EntityKind } from "@beep/shared-domain";
import { File } from "@beep/shared-domain/entities";

// Shared infra - these paths work with package.json exports
import { UploadService } from "@beep/shared-infra/internal/upload";
import { signPayload, verifySignature, generateKey, generateSignedURL } from "@beep/shared-infra/internal/upload/crypto";
import { generateTraceHeaders, type TraceHeaders } from "@beep/shared-infra/internal/upload/utils";
import { UploadError } from "@beep/shared-infra/internal/upload/error";
import {
  FileUploadData,
  UploadActionPayload,
  NewPresignedUrl,
  UploadedFileData
} from "@beep/shared-infra/internal/upload/_internal/shared-schemas";

// Repository
import { FileRepo } from "@beep/documents-infra/adapters/repos/File.repo";

// Schema utilities
import { BS } from "@beep/schema";
import { fileTypeChecker, getFileChunk, formatSize, FileType } from "@beep/schema/integrations/files";

// Client features (existing)
import { UploadFileService } from "@/features/upload/UploadFileService";
import { validateFile, extractBasicMetadata, extractExifMetadata } from "@/features/upload/pipeline";
import { UploadMetrics, instrumentProcessFile, makeFileAnnotations } from "@/features/upload/observability";
import * as Errors from "@/features/upload/errors";
```

---

## Testing Checklist

After implementation, verify:

1. **Client Validation**
   - [ ] Size limits enforced
   - [ ] File signature detection works
   - [ ] MIME type validation passes
   - [ ] EXIF extraction for images

2. **Presigned URL Generation**
   - [ ] API returns valid S3 presigned URLs
   - [ ] FileIds are properly generated
   - [ ] SQID keys are deterministic
   - [ ] Trace headers included

3. **S3 Upload**
   - [ ] Files upload successfully
   - [ ] Progress events fire correctly
   - [ ] Range headers work for resume

4. **Callback & Persistence**
   - [ ] Signature verification works
   - [ ] File records inserted via FileRepo
   - [ ] Status transitions correct (PENDING -> PROCESSING -> READY)

5. **Error Handling**
   - [ ] Validation errors surface correctly with _tag
   - [ ] Network errors caught
   - [ ] Signature failures rejected

---

## Expected Directory Structure After Implementation

```
apps/web/src/
├── app/api/v1/files/
│   └── route.ts              # NEW: API route handler
├── features/upload/
│   ├── UploadFileService.ts  # EXISTING: Client validation service
│   ├── UploadModels.ts       # EXTEND: Add new types
│   ├── UploadPipeline.ts     # NEW: Complete flow orchestrator
│   ├── pipeline.ts           # EXISTING: Validation functions
│   ├── errors.ts             # EXISTING: Error types
│   ├── observability.ts      # EXISTING: Metrics
│   ├── useUpload.ts          # NEW: React hook
│   ├── uploadToS3.ts         # NEW: XHR upload utility
│   ├── requestPresignedUrls.ts  # NEW: API client
│   └── completeUpload.ts     # NEW: Callback API client
```

---

## Important Constraints

1. **No raw `await` in server Effects** - Use `serverRuntime.runPromise()` or `runServerPromise()`
2. **No raw `fetch()` for uploads** - Use XHR for progress events
3. **Always verify signatures** - Never trust unsigned callbacks
4. **Use Effect for all side effects** - No sneaky `Promise` or `async/await` in Effect code
5. **Validate at boundaries** - Every input goes through Schema
6. **Trace everything** - Include `traceparent` and `b3` headers
7. **Instrument with metrics** - Use existing `UploadMetrics`
8. **Tagged errors only** - All errors must extend `Data.TaggedError`
9. **Use FileRepo for DB** - Don't write raw SQL, use the repository pattern

---

## MD5 Hash Computation Note

The browser's `crypto.subtle` doesn't support MD5. For client-side file hashing, use a library:

```bash
bun add spark-md5
```

```typescript
import SparkMD5 from "spark-md5";

const computeFileHash = (file: File): Effect.Effect<string, Error> =>
  Effect.async((resume) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const spark = new SparkMD5.ArrayBuffer();
      spark.append(e.target?.result as ArrayBuffer);
      resume(Effect.succeed(spark.end()));
    };
    reader.onerror = () => {
      resume(Effect.fail(new Error("Failed to read file for hashing")));
    };
    reader.readAsArrayBuffer(file);
  });
```

---

## Reference: FILE_AND_UPLOAD_MANAGEMENT_SPECIFICATION.md

For complete architectural context, read the specification document at the repo root. It contains:
- Complete pipeline flow diagrams
- All schema definitions
- Security considerations
- Observability patterns
- Future enhancement roadmap
