# Upload POC Implementation Prompt - Alignment Review

## Mission

Perform an exhaustive alignment check and comprehensive review of `UPLOAD_POC_IMPLEMENTATION_PROMPT.md` against the actual codebase. Your goal is to identify:

1. **Incorrect assumptions** - API signatures, schema shapes, or patterns that don't match reality
2. **Missing dependencies** - Required services, layers, or utilities not mentioned
3. **Outdated references** - Files that have moved, been renamed, or deleted
4. **Schema mismatches** - Field names, types, or structures that differ from actual definitions
5. **Import path errors** - Incorrect package aliases or export paths
6. **Architectural conflicts** - Patterns that contradict established conventions
7. **Missing steps** - Critical implementation details omitted from the prompt
8. **Redundant instructions** - Duplicate or unnecessary guidance

---

## Review Methodology

### Phase 1: File Existence Verification

Verify every file referenced in the prompt exists and read each one:

```
packages/shared/domain/src/entities/File/File.model.ts
packages/shared/domain/src/entities/File/schemas/UploadPath.ts
packages/shared/infra/src/internal/upload/upload.service.ts
packages/shared/infra/src/internal/upload/crypto.ts
packages/shared/infra/src/internal/upload/utils.ts
packages/shared/infra/src/internal/upload/error.ts
packages/shared/infra/src/internal/upload/_internal/shared-schemas.ts
packages/shared/infra/src/internal/upload/_internal/types.ts
packages/shared/infra/src/internal/upload/_internal/parser.ts
packages/shared/tables/src/tables/file.table.ts
apps/web/src/features/upload/UploadFileService.ts
apps/web/src/features/upload/pipeline.ts
apps/web/src/features/upload/errors.ts
apps/web/src/features/upload/observability.ts
apps/web/src/features/upload/UploadModels.ts
packages/common/schema/src/integrations/files/index.ts
packages/common/schema/src/integrations/files/FileInstance.ts
```

### Phase 2: Schema & Type Verification

For each schema/type mentioned in the prompt, verify:

1. **Exact field names** - Do they match the actual schema?
2. **Field types** - Are the types correct (e.g., `S.String` vs `S.NonEmptyTrimmedString`)?
3. **Optional vs required** - Are optionality annotations correct?
4. **Namespace exports** - Do `Type` and `Encoded` declarations exist?

Key schemas to verify:
- `FileUploadData` and its fields
- `UploadActionPayload` structure
- `NewPresignedUrl` fields
- `UploadedFileData` fields
- `UploadPath.Encoded` / `UploadPath.Type`
- `File.Model.insert.Type`
- `TraceHeaders` interface
- `PipelineConfig` interface
- `UploadResult` interface

### Phase 3: Function Signature Verification

For each function/method mentioned, verify:

1. **Existence** - Does the function exist?
2. **Parameters** - Are parameter names and types correct?
3. **Return type** - Is the return type accurate?
4. **Effect requirements** - Are the `R` (requirements) types correct?

Key functions to verify:
- `signPayload(payload, secret)` - params and return
- `verifySignature(payload, signature, secret)` - params and return
- `generateKey(file, appId, getHashParts?)` - params and return
- `generateSignedURL(url, secretKey, opts)` - params and return
- `generateTraceHeaders()` - return type
- `UploadService.getPreSignedUrl(uploadParams)` - params and return
- `UploadService.deleteObject(uploadParams)` - params and return
- `UploadService.insertFile(input)` - params and return
- `File.Model.create(params)` - full parameter structure
- `NativeFileInstance.validateFile(file, chunkSize?)` - params and return
- `validateFile({ file, config })` - params and return
- `extractBasicMetadata({ file, detected })` - params and return
- `extractExifMetadata({ file, detected })` - params and return
- `SharedEntityIds.FileId.create()` - existence and return type

### Phase 4: Import Path Verification

Verify each import path is valid:

```typescript
// Check these exact paths work
import { SharedEntityIds } from "@beep/shared-domain";
import { File } from "@beep/shared-domain/entities";
import { UploadService } from "@beep/shared-infra/internal/upload";
import { signPayload, verifySignature, generateKey, generateSignedURL } from "@beep/shared-infra/internal/upload/crypto";
import { generateTraceHeaders } from "@beep/shared-infra/internal/upload/utils";
import { FileUploadData, UploadActionPayload, NewPresignedUrl, UploadedFileData } from "@beep/shared-infra/internal/upload/_internal/shared-schemas";
import { BS } from "@beep/schema";
import { fileTypeChecker, getFileChunk, formatSize } from "@beep/schema/integrations/files";
import { HttpClient, HttpClientRequest, HttpClientResponse } from "@effect/platform-browser";
```

Check:
1. Do the package.json exports support these paths?
2. Are the named exports correct?
3. Are there barrel files (index.ts) that re-export?

### Phase 5: Pattern Verification

Verify the patterns shown match codebase conventions:

1. **Effect.Service pattern** - Is the `UploadService` definition correct?
2. **Effect.fn pattern** - Is the function wrapping syntax accurate?
3. **Schema.Class pattern** - Are class definitions following the right syntax?
4. **Error handling** - Do tagged errors follow `Data.TaggedError` correctly?
5. **Config access** - Is `Config.redacted()` the right pattern for secrets?
6. **Metric usage** - Is `Metric.increment()` / `Metric.counter()` correct?

### Phase 6: Architecture Alignment

Verify architectural claims:

1. **Does `UploadService` actually depend on `S3Service.defaultLayer`?**
2. **Does `File.Model.create()` actually call `NativeFileInstance.validateFile()`?**
3. **Is the `file.table.ts` schema compatible with `File.Model`?**
4. **Are there existing API route patterns to follow?** (Check `apps/web/src/app/api/`)
5. **Is `@effect/platform-browser` the right package for client HTTP?**

### Phase 7: Missing Pieces Identification

Identify what's NOT mentioned but required:

1. **Authentication** - How does the API route get the current user/org?
2. **Database access** - How does `insertFile` actually write to DB?
3. **S3 client configuration** - What environment variables are needed?
4. **CORS/Headers** - Any special headers required for the API?
5. **File size computation** - How is `fileHash` computed on client?
6. **Error responses** - What HTTP status codes should be returned?

---

## Output Format

Produce a detailed report with the following sections:

### 1. Critical Issues (Must Fix)
Items that would cause the implementation to fail:
- Incorrect function signatures
- Missing required dependencies
- Wrong schema shapes
- Invalid import paths

### 2. Accuracy Issues (Should Fix)
Items that are misleading but wouldn't break compilation:
- Incorrect field names (but close)
- Slightly wrong types
- Missing optional parameters

### 3. Completeness Issues (Consider Adding)
Missing information that would help implementation:
- Undocumented dependencies
- Missing error cases
- Configuration requirements
- Edge cases not covered

### 4. Style/Convention Issues (Nice to Have)
Deviations from codebase patterns:
- Naming conventions
- File organization
- Comment styles

### 5. Verified Correct
Explicitly confirm what IS correct to give the implementation agent confidence:
- Correct file paths
- Accurate schemas
- Valid patterns

### 6. Recommended Prompt Amendments
Provide specific text changes to fix identified issues. Format as:

```
LOCATION: [section/line reference]
CURRENT: [what the prompt says]
SHOULD BE: [what it should say]
REASON: [why this change is needed]
```

---

## Files to Read

Read these files in the following order to build context:

### Core Specification
1. `FILE_AND_UPLOAD_MANAGEMENT_SPECIFICATION.md` - Full architecture doc
2. `UPLOAD_POC_IMPLEMENTATION_PROMPT.md` - The prompt being reviewed

### Domain Layer
3. `packages/shared/domain/src/entities/File/File.model.ts`
4. `packages/shared/domain/src/entities/File/schemas/UploadPath.ts`
5. `packages/shared/domain/src/entities/File/schemas/index.ts`
6. `packages/shared/domain/src/entities/File/schemas/FileStatus.ts`

### Infrastructure Layer
7. `packages/shared/infra/src/internal/upload/upload.service.ts`
8. `packages/shared/infra/src/internal/upload/crypto.ts`
9. `packages/shared/infra/src/internal/upload/utils.ts`
10. `packages/shared/infra/src/internal/upload/error.ts`
11. `packages/shared/infra/src/internal/upload/_internal/shared-schemas.ts`
12. `packages/shared/infra/src/internal/upload/_internal/types.ts`
13. `packages/shared/infra/src/internal/upload/index.ts`

### Table Layer
14. `packages/shared/tables/src/tables/file.table.ts`

### Client Features
15. `apps/web/src/features/upload/UploadFileService.ts`
16. `apps/web/src/features/upload/pipeline.ts`
17. `apps/web/src/features/upload/UploadModels.ts`
18. `apps/web/src/features/upload/errors.ts`
19. `apps/web/src/features/upload/observability.ts`

### Schema Layer
20. `packages/common/schema/src/integrations/files/index.ts`
21. `packages/common/schema/src/integrations/files/FileInstance.ts`

### Existing API Routes (for patterns)
22. `apps/web/src/app/api/v1/iam/[...iam]/route.ts`
23. `apps/web/src/app/api/auth/[...all]/route.ts`

### Package Exports
24. `packages/shared/domain/package.json`
25. `packages/shared/infra/package.json`
26. `packages/common/schema/package.json`

---

## Specific Verification Queries

Answer these specific questions:

1. **Does `SharedEntityIds.FileId.create()` exist?** Or is it `SharedEntityIds.FileId.make()`?

2. **What is the exact signature of `File.Model.create()`?** List all required and optional parameters.

3. **Does `UploadService` export from `@beep/shared-infra/internal/upload`?** Check the index.ts barrel.

4. **Is `generateTraceHeaders` exported from utils.ts?** Check the exact export.

5. **Does `UploadedFileData` have a `serverData` field?** Check the actual schema.

6. **What does `getPreSignedUrl` actually return?** Is it a string URL or an object?

7. **Is `HttpClient` from `@effect/platform-browser` or `@effect/platform`?**

8. **Does the `file.table.ts` have a `status` column?** Compare with `File.Model`.

9. **Is there a `FileDb` service for database operations?** Or how should DB access work?

10. **What auth system is used?** How do API routes get the current user?

---

## Deliverable

After completing the review, produce:

1. **Alignment Report** - Detailed findings per section above
2. **Corrected Prompt** - A revised version of `UPLOAD_POC_IMPLEMENTATION_PROMPT.md` with all issues fixed
3. **Implementation Notes** - Any additional context the implementation agent should know

The goal is to ensure the implementation agent can execute the prompt without hitting unexpected errors or architectural conflicts.
