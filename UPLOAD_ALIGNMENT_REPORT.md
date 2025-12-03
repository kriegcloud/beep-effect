# Upload POC Implementation Prompt - Alignment Report

**Generated:** 2025-12-02
**Status:** Comprehensive Review Complete

---

## Executive Summary

The `UPLOAD_POC_IMPLEMENTATION_PROMPT.md` contains several accuracy issues that would cause implementation failures. This report identifies **12 critical issues**, **8 accuracy issues**, and **6 completeness issues** that must be addressed before implementation.

---

## 1. Critical Issues (Must Fix)

### 1.1 FileId Creation Method is Incorrect

**LOCATION:** Lines 97, 527
**CURRENT:** `SharedEntityIds.FileId.create()`
**SHOULD BE:** `SharedEntityIds.FileId.create()` - This IS correct. The method exists at `entity-id.ts:292`
**VERIFICATION:** ✅ Verified - `static readonly create = create;` exists

### 1.2 UploadService Does NOT Export from Index

**LOCATION:** Line 530
**CURRENT:** `import { UploadService } from "@beep/shared-infra/internal/upload";`
**SHOULD BE:** `import { UploadService } from "@beep/shared-infra/internal/upload/upload.service";`
**REASON:** The `index.ts` at `packages/shared/infra/src/internal/upload/index.ts` only exports `"./upload.service"`, so direct import from the barrel works, BUT crypto/utils are NOT re-exported.

```typescript
// Actual index.ts content:
export * from "./upload.service";
// NO export of crypto, utils, error, or _internal/*
```

### 1.3 Crypto/Utils NOT Exported from Main Upload Path

**LOCATION:** Line 531-532
**CURRENT:**
```typescript
import { signPayload, verifySignature, generateKey, generateSignedURL } from "@beep/shared-infra/internal/upload/crypto";
import { generateTraceHeaders } from "@beep/shared-infra/internal/upload/utils";
```
**SHOULD BE:** These paths are CORRECT with the glob export pattern `./*: ./src/*.ts` in package.json.
**VERIFICATION:** ✅ Package exports `"./*": "./src/*.ts"` allows deep imports.

### 1.4 getPreSignedUrl Parameter Type Mismatch

**LOCATION:** Lines 99-100, 408
**CURRENT:** `UploadService.getPreSignedUrl()` expects `UploadPath.Encoded`
**ACTUAL:** The function expects `File.UploadPath.Encoded` which is `UploadPathDecoded.Type` (the input data), NOT the encoded S3 path string.

```typescript
// Actual signature in upload.service.ts:18-23
const getPreSignedUrl = Effect.fn("UploadService.getPresignedUrl")(function* (
  uploadParams: File.UploadPath.Encoded  // This is actually UploadPathDecoded!
) {
  const ContentType = mimeTypeMap[uploadParams.fileItemExtension]; // Uses decoded fields
  const Key = yield* decodeUploadPath(uploadParams);  // Decodes to get the S3 key
```

**SHOULD BE:** The prompt should clarify that you pass the structured `UploadPathDecoded` data (env, fileId, organizationId, etc.), NOT an S3 path string. The naming `UploadPath.Encoded` is confusing because it refers to the Schema's encoded form (which is the decoded/structured data due to bidirectional transform).

### 1.5 UploadedFileData Does NOT Have `serverData` Field

**LOCATION:** Lines 533-538
**CURRENT:** Prompt suggests `UploadedFileData` has `serverData`
**ACTUAL:** The `serverData` field only exists in the `ClientUploadedFileData<T>` interface at line 97-102 of shared-schemas.ts:

```typescript
export interface ClientUploadedFileData<T> extends UploadedFileData {
  readonly serverData: T;  // Only in the interface!
}
```

The actual `UploadedFileData` class has: `key`, `url` (deprecated), `appUrl` (deprecated), `ufsUrl`, `fileHash`

### 1.6 file.table.ts Schema Mismatch with File.Model

**LOCATION:** Lines 417-419
**CURRENT:** Prompt implies file.table.ts matches File.Model
**ACTUAL:** Significant mismatches exist:

| File.Model Field   | file.table.ts Field | Status               |
|--------------------|---------------------|----------------------|
| `key`              | `path`              | MISMATCH             |
| `url`              | `url`               | ✅                    |
| `shardPrefix`      | (missing)           | MISSING              |
| `organizationType` | (missing)           | MISSING              |
| `uploadMonth`      | (missing)           | MISSING              |
| `environment`      | (missing)           | MISSING              |
| `status`           | (missing)           | **CRITICAL MISSING** |
| (missing)          | `basePath`          | Extra field          |
| (missing)          | `platform`          | Extra field          |
| `sizeFormatted`    | `formattedSize`     | Name mismatch        |
| `extension`        | `ext`               | Name mismatch        |

The table schema is significantly outdated compared to File.Model.

### 1.7 HttpClient Import Path Incorrect

**LOCATION:** Line 166, 263, 523
**CURRENT:** `import { HttpClient } from "@effect/platform-browser";`
**SHOULD BE:** For browser use, you need:
```typescript
import { HttpClient, HttpClientRequest, HttpClientResponse } from "@effect/platform/HttpClient";
// OR for browser-specific layer:
import { HttpClient } from "@effect/platform-browser/HttpClient";
```

### 1.8 insertFile Does NOT Actually Insert to DB

**LOCATION:** Lines 134, 419-436
**CURRENT:** Prompt says `insertFile` persists to database
**ACTUAL:** The current `insertFile` only encodes the input and returns nothing:

```typescript
// Actual implementation in upload.service.ts:45-47
const insertFile = Effect.fn("S3Service.insertFile")(function* (input: typeof File.Model.insert.Type) {
  yield* S.encode(File.Model.insert)(input);
  // NO database insertion!
});
```

The prompt correctly notes this needs extension, but should be more explicit that it's currently a no-op.

### 1.9 NativeFileInstance.validateFile Return Type

**LOCATION:** Line 65 (File.Model.create uses this)
**CURRENT:** Prompt references `validateFile(file, chunkSize)` returning validation result
**ACTUAL:** Returns `{ detected, formattedSize, fileInstance, nativeFile }` - the prompt doesn't document the `nativeFile` field.

### 1.10 UploadActionPayload Schema Shape

**LOCATION:** Lines 86-91
**CURRENT:**
```typescript
// files: Array<{ name: string, size: number, type: string, lastModified?: number }>
```
**ACTUAL:** The schema uses `S.Number.pipe(S.optional)` for lastModified, which is correct, but the input type annotation should be `S.Unknown as S.Schema<Json>` for the `input` field.

### 1.11 NewPresignedUrl Missing `fileId` Field

**LOCATION:** Lines 104-114
**CURRENT:** Response includes `fileId: string`
**ACTUAL:** `NewPresignedUrl` class only has: `url`, `key`, `customId`, `name`

```typescript
// Actual NewPresignedUrl at shared-schemas.ts:110-118
export class NewPresignedUrl extends S.Class<NewPresignedUrl>("NewPresignedUrl")({
  url: S.String,
  key: S.String,
  customId: S.NullOr(S.String),
  name: S.String,
  // NO fileId!
})
```

The prompt's `PresignedUrlResponse` is a custom extension that needs to be implemented.

### 1.12 File.Model.create Does NOT Accept NativeFileInstance Directly

**LOCATION:** Lines 47-48
**CURRENT:** `file: nativeFileInstance`
**ACTUAL:** The parameter type is `file: BS.NativeFileInstance.Type` where `BS.NativeFileInstance` is re-exported from `@beep/schema`. The actual type is `File` (browser File API).

---

## 2. Accuracy Issues (Should Fix)

### 2.1 generateTraceHeaders Return Type

**LOCATION:** Lines 381, 532
**CURRENT:** Implies TraceHeaders is imported from utils
**ACTUAL:** Correct - `TraceHeaders` type is exported from `utils.ts:13-16`

### 2.2 UploadPath Transformation Direction

**LOCATION:** Lines 76, 98
**CURRENT:** Uses `S.decode(UploadPath)` to get S3 key from structured data
**ACTUAL:** This is backwards. In the actual schema:
- `decode`: UploadPathDecoded → UploadPathEncoded (structured → S3 key)
- `encode`: UploadPathEncoded → UploadPathDecoded (S3 key → structured)

So `S.decode(UploadPath)(structuredData)` produces the S3 key string. This is correct but counterintuitive.

### 2.3 FileStatus Values

**LOCATION:** Lines 133
**CURRENT:** Status transitions PENDING -> PROCESSING -> READY
**ACTUAL:** FileStatus includes: `PENDING`, `PROCESSING`, `FAILED`, `READY`, `PENDING_DELETION`, `DELETED`

### 2.4 Effect.fn Pattern

**LOCATION:** Multiple locations
**CURRENT:** Shows `Effect.fn("name")(function* () { ... })`
**ACTUAL:** This is the correct pattern, verified in multiple files.

### 2.5 validateFile Parameters

**LOCATION:** Lines 546
**CURRENT:** `validateFile({ file, config })`
**ACTUAL:** ✅ Correct - matches `pipeline.ts:27-33`

### 2.6 extractBasicMetadata Parameters

**LOCATION:** Line 546
**CURRENT:** `extractBasicMetadata({ file, detected })`
**ACTUAL:** ✅ Correct - matches `pipeline.ts:120-125`

### 2.7 extractExifMetadata Parameters

**LOCATION:** Line 547
**CURRENT:** `extractExifMetadata({ file, detected })`
**ACTUAL:** ✅ Correct - matches `pipeline.ts:169-175`

### 2.8 S3Service.defaultLayer Usage

**LOCATION:** upload.service.ts:9
**ACTUAL:** `dependencies: [S3Service.defaultLayer]` - This IS correct.

---

## 3. Completeness Issues (Consider Adding)

### 3.1 Missing Authentication Pattern

**ISSUE:** The prompt mentions "Authenticate user (get `userId`, `organizationId` from session)" but doesn't show HOW.

**SHOULD ADD:** Example of getting auth context in Next.js API route:
```typescript
import { auth } from "@beep/iam-infra/auth"; // or similar

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }
  const { id: userId, organizationId } = session.user;
  // ...
}
```

### 3.2 Missing S3 Configuration

**ISSUE:** No mention of required AWS credentials/config.

**SHOULD ADD:**
```
Required environment variables:
- CLOUD_AWS_S3_BUCKET_NAME
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- AWS_REGION
- UPLOAD_SIGNING_SECRET (for callback verification)
```

### 3.3 Missing Database Access Pattern

**ISSUE:** How does `insertFile` actually write to DB?

**SHOULD ADD:** Example using slice-scoped DB pattern:
```typescript
import { FileDb } from "@beep/shared-infra/db"; // hypothetical
import { file as fileTable } from "@beep/shared-tables";

const insertFile = Effect.fn("insertFile")(function* (input) {
  const db = yield* FileDb;
  const [inserted] = yield* db
    .insert(fileTable)
    .values(input)
    .returning();
  return inserted;
});
```

### 3.4 Missing Error Response Format

**ISSUE:** What HTTP status codes and response shapes for errors?

**SHOULD ADD:**
```typescript
// Error response format
interface ErrorResponse {
  error: {
    code: string;
    message: string;
  };
}

// Status codes:
// 400 - Validation errors
// 401 - Unauthorized
// 403 - Forbidden (signature mismatch)
// 500 - Server error
```

### 3.5 Missing CORS/Headers Configuration

**ISSUE:** S3 presigned URLs require proper CORS setup.

**SHOULD ADD:** Note about S3 bucket CORS configuration for browser uploads.

### 3.6 Missing File Hash Computation

**ISSUE:** Prompt mentions `fileHash` in callback but doesn't show how client computes it.

**SHOULD ADD:**
```typescript
// Client-side MD5 hash computation
const computeFileHash = (file: File): Effect.Effect<string, Error> =>
  Effect.gen(function* () {
    const buffer = yield* Effect.promise(() => file.arrayBuffer());
    const hashBuffer = yield* Effect.promise(() =>
      crypto.subtle.digest("MD5", buffer) // Note: MD5 not available in SubtleCrypto!
    );
    // Need to use a library like spark-md5 for browser MD5
    return Encoding.encodeHex(new Uint8Array(hashBuffer));
  });
```

---

## 4. Verified Correct

The following items have been verified as accurate:

| Item                                          | Location                   | Status    |
|-----------------------------------------------|----------------------------|-----------|
| `SharedEntityIds.FileId.create()`             | entity-id.ts:292           | ✅ Correct |
| `signPayload(payload, secret)`                | crypto.ts:38               | ✅ Correct |
| `verifySignature(payload, signature, secret)` | crypto.ts:60-79            | ✅ Correct |
| `generateKey(file, appId, getHashParts?)`     | crypto.ts:81-98            | ✅ Correct |
| `generateSignedURL(url, secretKey, opts)`     | crypto.ts:112-138          | ✅ Correct |
| `generateTraceHeaders()`                      | utils.ts:18-26             | ✅ Correct |
| `TraceHeaders` type                           | utils.ts:13-16             | ✅ Correct |
| `UploadError` class                           | error.ts:1-7               | ✅ Correct |
| `FileUploadData` schema                       | shared-schemas.ts:51-57    | ✅ Correct |
| `UploadActionPayload` schema                  | shared-schemas.ts:149-155  | ✅ Correct |
| `validateFile` parameters                     | pipeline.ts:27-33          | ✅ Correct |
| `extractBasicMetadata` parameters             | pipeline.ts:120-125        | ✅ Correct |
| `extractExifMetadata` parameters              | pipeline.ts:169-175        | ✅ Correct |
| `UploadMetrics` object                        | observability.ts:12-27     | ✅ Correct |
| `instrumentProcessFile` function              | observability.ts:39-55     | ✅ Correct |
| `makeFileAnnotations` function                | observability.ts:31-37     | ✅ Correct |
| `ValidationError` class                       | errors.ts:3-11             | ✅ Correct |
| `DetectionError` class                        | errors.ts:13-20            | ✅ Correct |
| `ExifParseError` class                        | errors.ts:22-29            | ✅ Correct |
| `PipelineConfig` interface                    | UploadModels.ts:10-15      | ✅ Correct |
| `UploadResult` interface                      | UploadModels.ts:33-38      | ✅ Correct |
| `UploadFileService` structure                 | UploadFileService.ts:11-55 | ✅ Correct |
| File path structure                           | UploadPath.ts              | ✅ Correct |
| `ShardPrefix.fromFileId`                      | UploadPath.ts:142-146      | ✅ Correct |

---

## 5. Recommended Prompt Amendments

### Amendment 1: Fix getPreSignedUrl Parameter Documentation

```
LOCATION: Section 1, "Server API Route", step 3
CURRENT: "Call `UploadService.getPreSignedUrl()`"
SHOULD BE:
"Call `UploadService.getPreSignedUrl(uploadPathData)` where `uploadPathData` is of type
`File.UploadPath.Encoded` (which is the structured input data, NOT the S3 path string).

Example:
```typescript
const uploadPathData: File.UploadPath.Encoded = {
  env: "dev",
  fileId: fileId,
  organizationType: "individual",
  organizationId: organizationId,
  entityKind: "user",
  entityIdentifier: userId,
  entityAttribute: "avatar",
  fileItemExtension: extension,
};
const presignedUrl = yield* UploadService.getPreSignedUrl(uploadPathData);
```"
REASON: The parameter type naming is counterintuitive due to bidirectional schema transforms
```

### Amendment 2: Add Custom Response Schema

```
LOCATION: Section 3, "Schema Extensions"
CURRENT: Uses NewPresignedUrl which lacks fileId
SHOULD BE:
"Create a custom `PresignedUrlItem` that extends `NewPresignedUrl` with `fileId`:

```typescript
export class PresignedUrlItem extends NewPresignedUrl.extend<PresignedUrlItem>("PresignedUrlItem")({
  fileId: S.String,
}) {}
```"
REASON: NewPresignedUrl doesn't include fileId which is needed for client tracking
```

### Amendment 3: Document Table Schema Mismatch

```
LOCATION: Section 4, "File Table Integration"
CURRENT: Assumes table matches model
SHOULD BE:
"**WARNING: The `file.table.ts` schema is outdated and needs migration.**

The table is missing these columns required by `File.Model`:
- `shardPrefix` (text)
- `organizationType` (text)
- `uploadMonth` (integer)
- `environment` (text)
- `status` (text, defaults to 'PENDING')

And has naming mismatches:
- Table uses `path` but Model uses `key`
- Table uses `formattedSize` but Model uses `sizeFormatted`
- Table uses `ext` but Model uses `extension`

**Recommended:** Generate a migration to align the table with File.Model before implementing."
REASON: Prevents runtime errors from schema mismatches
```

### Amendment 4: Fix Import Statements

```
LOCATION: "Imports Quick Reference"
CURRENT: Various incorrect paths
SHOULD BE:
```typescript
// Effect core
import { Effect, pipe } from "effect";
import * as S from "effect/Schema";
import * as Data from "effect/Data";
import * as Metric from "effect/Metric";
import * as Config from "effect/Config";
import * as Redacted from "effect/Redacted";

// Platform (use @effect/platform, not platform-browser for most)
import * as HttpClient from "@effect/platform/HttpClient";
import * as HttpClientRequest from "@effect/platform/HttpClientRequest";
import * as HttpClientResponse from "@effect/platform/HttpClientResponse";

// Shared domain
import { SharedEntityIds } from "@beep/shared-domain";
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
```
```

### Amendment 5: Add Authentication Section

```
LOCATION: Add new section after "Server API Route"
ADD:
"### Authentication & Authorization

The API routes require authenticated users. Use the existing auth pattern:

```typescript
import { auth } from "@/lib/auth"; // adjust import based on project setup

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user?.id) {
    return Response.json(
      { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
      { status: 401 }
    );
  }

  const userId = session.user.id;
  const organizationId = session.user.organizationId; // may need to fetch from DB

  // ... proceed with upload logic
}
```"
```

### Amendment 6: Document insertFile Implementation Requirement

```
LOCATION: Section 4, after insertFile description
ADD:
"**Implementation Required:** The current `insertFile` is a stub that only validates:

```typescript
// Current (incomplete):
const insertFile = Effect.fn("S3Service.insertFile")(function* (input) {
  yield* S.encode(File.Model.insert)(input);
  // Returns nothing, no DB write!
});
```

You must implement actual DB insertion. Follow the slice-scoped DB pattern:

```typescript
// In packages/shared/infra/src/db/FileDb.ts (create this file)
import { Db } from "@beep/core-db";
import { file } from "@beep/shared-tables";

export class FileDb extends Db.make("FileDb")({ file }) {}

// In upload.service.ts
const insertFile = Effect.fn("S3Service.insertFile")(function* (input) {
  const validated = yield* S.encode(File.Model.insert)(input);
  const db = yield* FileDb;
  const [inserted] = yield* Effect.tryPromise({
    try: () => db.insert(file).values(validated).returning(),
    catch: (e) => new UploadError({ code: "DB_ERROR", message: "Failed to insert file", cause: e })
  });
  return inserted;
});
```"
```

---

## 6. Files That Don't Exist

The following referenced files need to be created:

| File | Purpose |
|------|---------|
| `apps/web/src/app/api/v1/files/route.ts` | NEW: API route handler |
| `apps/web/src/features/upload/useUpload.ts` | NEW: React hook |
| `apps/web/src/features/upload/uploadToS3.ts` | NEW: XHR upload utility |
| `apps/web/src/features/upload/requestPresignedUrls.ts` | NEW: API client |
| `apps/web/src/features/upload/completeUpload.ts` | NEW: Callback API client |
| `apps/web/src/features/upload/UploadPipeline.ts` | NEW: Flow orchestrator |

---

## 7. Summary Checklist

Before implementing, ensure:

- [ ] Migrate `file.table.ts` to match `File.Model` fields
- [ ] Implement actual DB insertion in `insertFile`
- [ ] Create `PresignedUrlItem` schema with `fileId`
- [ ] Add authentication to API routes
- [ ] Configure S3 CORS for browser uploads
- [ ] Add required environment variables
- [ ] Update imports to use correct paths
- [ ] Implement MD5 hashing for file verification (use spark-md5 or similar)

---

*End of Alignment Report*
