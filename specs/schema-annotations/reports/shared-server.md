# Schema Annotations Audit: @beep/shared-server

## Summary
- Total Schemas Found: 12
- Annotated: 8
- Missing Annotations: 4

## Annotationless Schemas Checklist

### S.TaggedError (Missing Annotations)

- [ ] `src/internal/email/adapters/resend/errors.ts:40` - `ResendError` - S.TaggedError
  - Uses `$I` template literal for tag but no `.annotations()` call with description

- [ ] `src/internal/email/adapters/resend/errors.ts:61` - `EmailTemplateRenderError` - S.TaggedError
  - Uses `$I` template literal for tag but no `.annotations()` call with description

- [ ] `src/db/repos/UploadSession.repo.ts:61` - `UploadSessionRepoError` - S.TaggedError
  - Uses `$I` template literal for tag but no `.annotations()` call with description

### BS.StringLiteralKit (Missing Annotations)

- [ ] `src/internal/email/adapters/resend/errors.ts:9` - `ResendErrorCode` - BS.StringLiteralKit
  - No `.annotations()` call

- [ ] `src/factories/db-client/pg/formatter.ts:23` - `SqlKeyword` - BS.StringLiteralKit
  - No `.annotations()` call

- [ ] `src/factories/db-client/pg/formatter.ts:97` - `SqlFunction` - BS.StringLiteralKit
  - No `.annotations()` call

- [ ] `src/factories/db-client/pg/formatter.ts:128` - `QueryType` - BS.StringLiteralKit
  - No `.annotations()` call

## Properly Annotated Schemas

The following schemas have proper annotations:

| File | Schema | Type | Notes |
|------|--------|------|-------|
| `src/factories/db-client/pg/errors.ts:15` | `RawPgError` | S.declare | Has `.annotations($I.annotations(...))` |
| `src/factories/db-client/pg/errors.ts:25` | `DatabaseError` | S.TaggedError | Has `$I.annotations(...)` as third arg |
| `src/factories/db-client/pg/errors.ts:308` | `DatabaseConnectionLostError` | S.TaggedError | Has `$I.annotations(...)` as third arg |
| `src/factories/db-client/pg/pg-error-enum.ts:559` | `PgErrorCodeFromKey` | BS.MappedLiteralKit | Has `.annotations($I.annotations(...))` |
| `src/factories/db-client/pg/formatter.ts:274` | `SqlString` | S.String.pipe(S.brand) | Has `S.annotations({...})` with pretty printer |

## Excluded Items

The following were intentionally excluded from this audit:

1. **S.Struct in query schemas** - Inline schemas used in `makeQueryWithSchema` are internal implementation details, not exported domain schemas:
   - `src/db/repos/File.repo.ts:65` - `inputSchema: S.Struct({...})`
   - `src/db/repos/File.repo.ts:70` - `outputSchema: S.Struct({...})`
   - `src/db/repos/File.repo.ts:128` - `inputSchema: S.Struct({...})`
   - `src/db/repos/File.repo.ts:183` - `inputSchema: S.Struct({...})`
   - `src/db/repos/File.repo.ts:216` - `inputSchema: S.Struct({...})`
   - `src/db/repos/Folder.repo.ts:51` - `inputSchema: S.Struct({...})`

2. **Effect.Service classes** - These are service definitions, not schemas:
   - `FileRepo`, `FolderRepo`, `UploadSessionRepo` - Effect services
   - `ConnectionConfig`, `ConnectionPool`, `QueryLogger` - Effect services
   - `ResendService`, `Upload.Service`, `EventStreamHub` - Effect services

3. **Context.Tag declarations** - Not schemas:
   - `Db`, `PgClient`, `TransactionContext` - Context tags

## Recommendations

1. **Add annotations to ResendError and EmailTemplateRenderError** in `src/internal/email/adapters/resend/errors.ts`:
   ```typescript
   export class ResendError extends S.TaggedError<ResendError>($I`ResendError`)(
     "ResendError",
     { ... },
     $I.annotations("ResendError", {
       description: "Error from Resend email service API"
     })
   ) {}
   ```

2. **Add annotations to UploadSessionRepoError** in `src/db/repos/UploadSession.repo.ts`:
   ```typescript
   export class UploadSessionRepoError extends S.TaggedError<UploadSessionRepoError>()(
     $I`UploadSessionRepoError`,
     { ... },
     $I.annotations("UploadSessionRepoError", {
       description: "Database error from upload session repository operations"
     })
   ) {}
   ```

3. **Add annotations to BS.StringLiteralKit schemas**:
   ```typescript
   export class ResendErrorCode extends BS.StringLiteralKit(...).annotations(
     $I.annotations("ResendErrorCode", {
       description: "Resend API error codes"
     })
   ) {}
   ```

4. **Consider if SqlKeyword, SqlFunction, QueryType need annotations** - These are internal formatter utilities. If they are not part of the public API, annotations may be optional.
