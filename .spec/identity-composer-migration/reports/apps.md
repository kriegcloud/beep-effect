# Identity Composer Migration Report: Apps

## Composer Status
- **web**: `$WebId` exists: **YES**
- **server**: Composer exists: **NO** (no violations found - not Effect-based)
- **interfere**: Not found in repository
- **notes**: Composer exists: **NO** (no violations found - Prisma/tRPC stack)

## Files Requiring Migration

### apps/web/src/features/upload/UploadFileService.ts
- **Line 14**: `Effect.Service` - Current: `"UploadFileService"` → Should be: `$I`UploadFileService``

### apps/web/src/features/upload/UploadModels.ts
- **Line 118**: `S.Class` - Current: `"PresignedUrlItem"` → Should be: `$I`PresignedUrlItem``
- **Line 132**: `S.Class` - Current: `"TraceHeadersSchema"` → Should be: `$I`TraceHeadersSchema``
- **Line 140**: `S.Class` - Current: `"PresignedUrlResponse"` → Should be: `$I`PresignedUrlResponse``
- **Line 149**: `S.Class` - Current: `"UploadCallbackPayload"` → Should be: `$I`UploadCallbackPayload``
- **Line 158**: `S.Class` - Current: `"UploadCallbackResponse"` → Should be: `$I`UploadCallbackResponse``
- **Line 168**: `S.Class` - Current: `"ApiErrorResponse"` → Should be: `$I`ApiErrorResponse``

### apps/web/src/features/upload/errors.ts
- **Line 3**: `Data.TaggedError` - Current: `"ValidationError"` → Should be: `$I`ValidationError``
- **Line 13**: `Data.TaggedError` - Current: `"DetectionError"` → Should be: `$I`DetectionError``
- **Line 22**: `Data.TaggedError` - Current: `"MetadataParseError"` → Should be: `$I`MetadataParseError``

### apps/web/src/features/upload/requestPresignedUrls.ts
- **Line 9**: `Data.TaggedError` - Current: `"PresignedUrlError"` → Should be: `$I`PresignedUrlError``

### apps/web/src/features/upload/uploadToS3.ts
- **Line 23**: `Data.TaggedError` - Current: `"S3UploadError"` → Should be: `$I`S3UploadError``

### apps/web/src/features/upload/completeUpload.ts
- **Line 9**: `Data.TaggedError` - Current: `"CompleteUploadError"` → Should be: `$I`CompleteUploadError``

### apps/web/src/features/upload/UploadPipeline.ts
- **Line 22**: `Data.TaggedError` - Current: `"PipelineError"` → Should be: `$I`PipelineError``

### apps/web/src/features/account/account-notifications.tsx
- **Line 23**: `S.Class` - Current: `"NotificationSelectionPayload"` → Should be: `$I`NotificationSelectionPayload``

### apps/web/src/features/account/account-socials.tsx
- **Line 16**: `S.Class` - Current: `"AccountSocialsPayload"` → Should be: `$I`AccountSocialsPayload``

## Summary
- **Total Files**: 10
- **Effect.Service violations**: 1
- **S.Class violations**: 8
- **Data.TaggedError violations**: 7
- All violations are in `apps/web`
- No new composers need to be added to packages.ts
