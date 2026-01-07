# Schema Annotations Audit: @beep/shared-client

## Summary
- Total Schemas Found: 17
- Annotated: 16
- Missing Annotations: 1

## Annotationless Schemas Checklist

- [ ] `src/atom/files/types.ts:78` - `StartUploadFolder` - S.TaggedClass

## Analysis Details

### Properly Annotated Schemas

All schemas below have proper annotations via the `$I.annotations()` pattern:

1. `src/atom/files/errors.ts:6` - `ImageTooLargeAfterCompression` - S.TaggedError (annotated)
2. `src/atom/files/types.ts:70` - `StartUploadRoot` - S.TaggedClass (annotated)
3. `src/atom/files/types.ts:83` - `StartUploadInput` - S.Union (annotated)
4. `src/atom/services/Upload/Upload.errors.ts:23` - `UploadErrorCode` - BS.StringLiteralKit (annotated)
5. `src/atom/services/Upload/Upload.errors.ts:49` - `S3NetworkError` - S.TaggedError (annotated)
6. `src/atom/services/Upload/Upload.errors.ts:57` - `S3TimeoutError` - S.TaggedError (annotated)
7. `src/atom/services/Upload/Upload.errors.ts:65` - `S3AbortedError` - S.TaggedError (annotated)
8. `src/atom/services/Upload/Upload.errors.ts:73` - `S3UploadFailedError` - S.TaggedError (annotated)
9. `src/atom/services/Upload/Upload.errors.ts:81` - `S3ValidationError` - S.TaggedError (annotated)
10. `src/atom/services/Upload/Upload.errors.ts:89` - `S3Error` - S.Union (annotated)

### Data.TaggedEnum (Not Schema-based - Excluded from count)

The following use `Data.taggedEnum` from Effect, not `effect/Schema`, so annotations are not applicable:

- `src/atom/files/types.ts:17` - `UploadPhase` - Data.taggedEnum
- `src/atom/files/types.ts:36` - `UploadState` - Data.taggedEnum
- `src/atom/files/types.ts:61` - `FileCacheUpdate` - Data.taggedEnum
- `src/atom/services/Upload/Upload.service.ts:64` - `UploadStatus` - Data.taggedEnum
- `src/atom/services/Upload/Upload.service.ts:143` - `UploadAction` - Data.taggedEnum

### Effect.Service Classes (Not Schema-based - Excluded)

Service classes using `Effect.Service<T>()` are not schemas:

- `src/atom/services/FilesApi.service.ts:10` - `Service` - Effect.Service
- `src/atom/services/FilesRpcClient.service.ts:12` - `Service` - Effect.Service
- `src/atom/services/ImageCompressionClient.service.ts:26` - `Service` - Effect.Service
- `src/atom/services/FilesEventStream.service.ts:11` - `Service` - Effect.Service
- `src/atom/services/Upload/Upload.service.ts:254` - `UploadRegistry` - Effect.Service
- `src/atom/files/services/FileSync.service.ts:20` - `Service` - Effect.Service
- `src/atom/files/services/FilePicker.service.ts:8` - `Service` - Effect.Service

### Notes

The package has a well-structured annotation pattern using the `$SharedClientId.create()` identity builder. The single missing annotation is on `StartUploadFolder` which should follow the same pattern as `StartUploadRoot`.

The missing annotation at line 78 in `types.ts`:
```typescript
export class StartUploadFolder extends S.TaggedClass<StartUploadFolder>($I`StartUploadFolder`)("Folder", {
  ...startUploadFieldsShared,
  id: SharedEntityIds.FolderId,
}) {}
```

Should be updated to:
```typescript
export class StartUploadFolder extends S.TaggedClass<StartUploadFolder>($I`StartUploadFolder`)(
  "Folder",
  {
    ...startUploadFieldsShared,
    id: SharedEntityIds.FolderId,
  },
  $I.annotations("StartUploadFolder", {
    description: "Start upload for a folder entity",
  })
) {}
```
