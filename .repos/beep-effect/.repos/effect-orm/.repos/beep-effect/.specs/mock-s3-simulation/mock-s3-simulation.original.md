# Original Prompt

**PROMPT_NAME**: mock-s3-simulation

I want to create a full simulation pipeline of uploading a file to S3 using the `createMockS3Layer` in `@scratchpad/index.ts` using `@effect/platform`.

## File References

- `@packages/shared/domain/src/entities/File/File.model.ts`
- `@packages/documents/server/src/adapters/repos/File.repo.ts`
- `@packages/shared/domain/src/entities/File/schemas/UploadKey.ts`
- `@packages/common/schema/src/integrations/files/FileInstance.ts`
- `@packages/common/schema/src/integrations/files/exif-metadata/ExifMetadata.ts`
- `@packages/documents/server/src/files/ExifToolService.ts`
- `@packages/shared/domain/src/common.ts`
- `@packages/shared/tables/src/common.ts`
- `@packages/shared/domain/src/services/EncryptionService/`
- `@apps/web/src/features/upload/UploadFileService.ts`

## Pipeline Steps

1. Load the file from `scratchpad/logo.png` using `scratchpad/test-file.ts`
2. Transform file into `FileInstance` using `FileInstanceFromNative` transformation schema
3. Create the `UploadKey` using the properties from the decoded `FileInstance`
4. Create `FileRpc` RpcGroup using `@effect/Rpc` with:
   - `initiateUpload`: Request pre-signed URL from server
   - `completeUpload`: Notify server after successful S3 upload, persist to DB
   - `getUploadStatus`: Query upload state (optional)
5. Create the `FileRpc` implementation and RpcServer
6. Use the `EncryptionService` to `generateFileKey`
7. Verify the pre-signed URL (mocked) signature
8. Create the layer
9. Create a test layer
10. Simulate the S3 upload via `scratchpad/index.ts` (client-side XHR with progress tracking)
11. Insert the file into the database using the `FileRepo`

## Notes

- EXIF data goes into the `metadata` property of `File.model.ts` (default column on all tables/models)
- Depending on `FileType`, extract EXIF metadata using `ExifToolService`
- Edits may need to be made to various schemas for idiomatic transformation
- Need to properly construct layers
- Mock pre-signed URL with signature verification
- **Upload progress is tracked client-side** via XHR `onprogress` events during the direct PUT to S3 - the server only provides pre-signed URLs and records completion
