PROMPT_NAME: apply-identity-pattern

I need to apply the `$I` identity pattern from `@beep/identity/packages` across the beep-effect monorepo. This pattern provides consistent, traceable identifiers for Effect schemas, services, Context tags, and SQL models.

## Pattern Examples

### Effect Services
```typescript
import { $SharedServerId } from "@beep/identity/packages";
const $I = $SharedServerId.create("server/services/Upload");

export class Service extends Effect.Service<Service>()($I`Service`, {
  effect: serviceEffect,
  accessors: true,
}) {}
```

### Context Tags
```typescript
import { $SharedServerId } from "@beep/identity/packages";
const $I = $SharedServerId.create("db/Db");

export class SharedDb extends Context.Tag($I`SharedDb`)<SharedDb, Shape>() {}
```

### @effect/sql/Model
```typescript
import { $SharedDomainId } from "@beep/identity/packages";
const $I = $SharedDomainId.create("entities/Organization/Organization.model");

export class Model extends M.Class<Model>($I`OrganizationModel`)(
  fields,
  $I.annotations("OrganizationModel", { description: "..." })
) {}
```

### effect/Schema Classes
```typescript
import { $YjsId } from "@beep/identity/packages";
const $I = $YjsId.create("protocol/Op");

export class OpCode extends S.Class<OpCode>($I`OpCode`)(
  fields,
  $I.annotations("OpCode", { description: "..." })
) {}
```

### TaggedError
```typescript
import { $ErrorsId } from "@beep/identity/packages";
const $I = $ErrorsId.create("errors");

export class NotFoundError extends S.TaggedError<NotFoundError>()($I`NotFoundError`, {
  message: S.String,
}) {}
```

## Files Needing Updates

### Category 1: @effect/sql/Model Classes (24 files)

| File | Package ID | Module Path |
|------|------------|-------------|
| packages/iam/domain/src/entities/TeamMember/TeamMember.model.ts | $IamDomainId | entities/TeamMember/TeamMember.model |
| packages/iam/domain/src/entities/Subscription/Subscription.model.ts | $IamDomainId | entities/Subscription/Subscription.model |
| packages/iam/domain/src/entities/Verification/Verification.model.ts | $IamDomainId | entities/Verification/Verification.model |
| packages/iam/domain/src/entities/ApiKey/ApiKey.model.ts | $IamDomainId | entities/ApiKey/ApiKey.model |
| packages/iam/domain/src/entities/DeviceCode/DeviceCode.model.ts | $IamDomainId | entities/DeviceCode/DeviceCode.model |
| packages/iam/domain/src/entities/Invitation/Invitation.model.ts | $IamDomainId | entities/Invitation/Invitation.model |
| packages/iam/domain/src/entities/Member/Member.model.ts | $IamDomainId | entities/Member/Member.model |
| packages/iam/domain/src/entities/OAuthAccessToken/OAuthAccessToken.model.ts | $IamDomainId | entities/OAuthAccessToken/OAuthAccessToken.model |
| packages/iam/domain/src/entities/ScimProvider/ScimProvider.model.ts | $IamDomainId | entities/ScimProvider/ScimProvider.model |
| packages/iam/domain/src/entities/Account/Account.model.ts | $IamDomainId | entities/Account/Account.model |
| packages/iam/domain/src/entities/WalletAddress/WalletAddress.model.ts | $IamDomainId | entities/WalletAddress/WalletAddress.model |
| packages/iam/domain/src/entities/TwoFactor/TwoFactor.model.ts | $IamDomainId | entities/TwoFactor/TwoFactor.model |
| packages/iam/domain/src/entities/SsoProvider/SsoProvider.model.ts | $IamDomainId | entities/SsoProvider/SsoProvider.model |
| packages/iam/domain/src/entities/RateLimit/RateLimit.model.ts | $IamDomainId | entities/RateLimit/RateLimit.model |
| packages/iam/domain/src/entities/Passkey/Passkey.model.ts | $IamDomainId | entities/Passkey/Passkey.model |
| packages/iam/domain/src/entities/OrganizationRole/OrganizationRole.model.ts | $IamDomainId | entities/OrganizationRole/OrganizationRole.model |
| packages/iam/domain/src/entities/OAuthConsent/OAuthConsent.model.ts | $IamDomainId | entities/OAuthConsent/OAuthConsent.model |
| packages/iam/domain/src/entities/OAuthApplication/OAuthApplication.model.ts | $IamDomainId | entities/OAuthApplication/OAuthApplication.model |
| packages/iam/domain/src/entities/Jwks/Jwks.model.ts | $IamDomainId | entities/Jwks/Jwks.model |
| packages/shared/domain/src/entities/Team/Team.model.ts | $SharedDomainId | entities/Team/Team.model |
| packages/shared/domain/src/entities/Session/Session.model.ts | $SharedDomainId | entities/Session/Session.model |
| packages/shared/domain/src/entities/AuditLog/AuditLog.model.ts | $SharedDomainId | entities/AuditLog/AuditLog.model |
| packages/shared/domain/src/entities/Folder/Folder.model.ts | $SharedDomainId | entities/Folder/Folder.model |
| packages/documents/domain/src/entities/Document/Document.model.ts | $DocumentsDomainId | entities/Document/Document.model |
| packages/documents/domain/src/entities/DocumentFile/DocumentFile.model.ts | $DocumentsDomainId | entities/DocumentFile/DocumentFile.model |
| packages/documents/domain/src/entities/Discussion/Discussion.model.ts | $DocumentsDomainId | entities/Discussion/Discussion.model |
| packages/documents/domain/src/entities/DocumentVersion/DocumentVersion.model.ts | $DocumentsDomainId | entities/DocumentVersion/DocumentVersion.model |
| packages/documents/domain/src/entities/Comment/Comment.model.ts | $DocumentsDomainId | entities/Comment/Comment.model |

### Category 2: Effect.Service Classes (40 files)

| File | Package ID | Module Path | Services |
|------|------------|-------------|----------|
| packages/iam/server/src/adapters/repos/User.repo.ts | $IamServerId | adapters/repos/User | UserRepo |
| packages/iam/server/src/adapters/repos/Account.repo.ts | $IamServerId | adapters/repos/Account | AccountRepo |
| packages/iam/server/src/adapters/repos/ApiKey.repo.ts | $IamServerId | adapters/repos/ApiKey | ApiKeyRepo |
| packages/iam/server/src/adapters/repos/DeviceCode.repo.ts | $IamServerId | adapters/repos/DeviceCode | DeviceCodeRepo |
| packages/iam/server/src/adapters/repos/Invitation.repo.ts | $IamServerId | adapters/repos/Invitation | InvitationRepo |
| packages/iam/server/src/adapters/repos/Jwks.repo.ts | $IamServerId | adapters/repos/Jwks | JwksRepo |
| packages/iam/server/src/adapters/repos/Member.repo.ts | $IamServerId | adapters/repos/Member | MemberRepo |
| packages/iam/server/src/adapters/repos/Passkey.repo.ts | $IamServerId | adapters/repos/Passkey | PasskeyRepo |
| packages/iam/server/src/adapters/repos/RateLimit.repo.ts | $IamServerId | adapters/repos/RateLimit | RateLimitRepo |
| packages/iam/server/src/adapters/repos/Session.repo.ts | $IamServerId | adapters/repos/Session | SessionRepo |
| packages/iam/server/src/adapters/repos/Team.repo.ts | $IamServerId | adapters/repos/Team | TeamRepo |
| packages/iam/server/src/adapters/repos/TeamMember.repo.ts | $IamServerId | adapters/repos/TeamMember | TeamMemberRepo |
| packages/iam/server/src/adapters/repos/TwoFactor.repo.ts | $IamServerId | adapters/repos/TwoFactor | TwoFactorRepo |
| packages/iam/server/src/adapters/better-auth/Emails.ts | $IamServerId | adapters/better-auth/Emails | AuthEmailService |
| packages/iam/client/src/clients/sign-in/sign-in.service.ts | $IamClientId | clients/sign-in/sign-in | SignInService |
| packages/iam/client/src/clients/user/user.service.ts | $IamClientId | clients/user/user | UserService |
| packages/iam/client/src/clients/verify/verify.service.ts | $IamClientId | clients/verify/verify | VerifyService |
| packages/documents/server/src/adapters/repos/Comment.repo.ts | $DocumentsServerId | adapters/repos/Comment | CommentRepo |
| packages/documents/server/src/adapters/repos/Document.repo.ts | $DocumentsServerId | adapters/repos/Document | DocumentRepo |
| packages/documents/server/src/files/ExifToolService.ts | $DocumentsServerId | files/ExifToolService | ExifToolService |
| packages/documents/server/src/files/PdfMetadataService.ts | $DocumentsServerId | files/PdfMetadataService | PdfMetadataService |
| packages/documents/server/src/SignedUrlService.ts | $DocumentsServerId | SignedUrlService | StorageService |
| packages/shared/server/src/internal/email/adapters/resend/service.ts | $SharedServerId | internal/email/adapters/resend/service | ResendService |
| packages/shared/server/src/rpc/v1/event-stream-hub.ts | $SharedServerId | rpc/v1/event-stream-hub | EventStreamHub |
| packages/shared/client/src/atom/files/services/FilePicker.service.ts | $SharedClientId | atom/files/services/FilePicker | FilePickerService |
| packages/shared/client/src/atom/files/services/FileSync.service.ts | $SharedClientId | atom/files/services/FileSync | FileSyncService |
| packages/runtime/client/src/services/network-monitor.ts | $RuntimeClientId | services/network-monitor | NetworkMonitor |
| packages/runtime/client/src/workers/worker-client.ts | $RuntimeClientId | workers/worker-client | WorkerClient |
| packages/ui/ui/src/services/toaster.service.ts | $UiId | services/toaster | ToasterService |
| packages/ui/ui/src/services/zip.service.ts | $UiId | services/zip | ZipService |
| packages/_internal/db-admin/test/container.ts | $DbAdminId | test/container | PgContainer |
| apps/web/src/features/upload/UploadFileService.ts | $WebId | features/upload/UploadFileService | UploadFileService |

### Category 3: Context Tags (9 files)

| File | Package ID | Module Path | Tags |
|------|------------|-------------|------|
| packages/_internal/db-admin/src/Db/AdminDb.ts | $DbAdminId | Db/AdminDb | AdminDb |
| packages/common/utils/src/md5/parallel-hasher.ts | $UtilsId | md5/parallel-hasher | ParallelHasher |
| packages/documents/server/src/config.ts | $DocumentsServerId | config | FilesConfig |
| packages/documents/server/src/db/Db/Db.ts | $DocumentsServerId | db/Db/Db | DocumentsDb |
| packages/iam/server/src/db/Db/Db.ts | $IamServerId | db/Db/Db | IamDb |
| packages/shared/domain/src/Policy.ts | $SharedDomainId | Policy | AuthContext, CurrentUser |
| packages/shared/domain/src/services/EncryptionService/EncryptionService.ts | $SharedDomainId | services/EncryptionService/EncryptionService | EncryptionService |
| packages/shared/server/src/internal/db/pg/PgClient.ts | $SharedServerId | internal/db/pg/PgClient | TransactionContext |

### Category 4: TaggedError Classes (15 files, 59 errors)

| File | Package ID | Module Path | Errors |
|------|------------|-------------|--------|
| packages/common/errors/src/errors.ts | $ErrorsId | errors | UnrecoverableError, NotFoundError, UniqueViolationError, DatabaseError, TransactionError, ConnectionError, ParseError, Unauthorized, Forbidden, UnknownError |
| packages/common/identity/src/schema.ts | $IdentityId | schema | InvalidSegmentError, InvalidModuleSegmentError, InvalidBaseError |
| packages/common/schema/src/integrations/files/SignedFile.ts | $SchemaId | integrations/files/SignedFile | FileIntegrityError |
| packages/common/schema/src/integrations/files/pdf-metadata/errors.ts | $SchemaId | integrations/files/pdf-metadata/errors | PdfParseError, PdfTimeoutError, PdfFileTooLargeError, PdfEncryptedError, PdfInvalidError |
| packages/common/schema/src/integrations/files/exif-metadata/errors.ts | $SchemaId | integrations/files/exif-metadata/errors | MetadataParseError, ExifTimeoutError, ExifFileTooLargeError |
| packages/common/utils/src/md5/errors.ts | $UtilsId | md5/errors | Md5ComputationError, UnicodeEncodingError, FileReadError, BlobSliceError, WorkerHashError |
| packages/common/contract/src/internal/contract-error/contract-error.ts | $ContractId | internal/contract-error/contract-error | HttpRequestError, HttpResponseError, MalformedInput, MalformedOutput, UnknownError |
| packages/common/lexical-schemas/src/errors.ts | $LexicalSchemasId | errors | LexicalSchemaValidationError, UnknownNodeTypeError |
| packages/iam/client/src/errors.ts | $IamClientId | errors | IamError |
| packages/iam/domain/src/api/common/errors.ts | $IamDomainId | api/common/errors | IamAuthError |
| packages/documents/domain/src/entities/Document/Document.errors.ts | $DocumentsDomainId | entities/Document/Document.errors | DocumentNotFoundError, DocumentPermissionDeniedError, DocumentArchivedError, DocumentLockedError, DocumentAlreadyPublishedError, DocumentNotPublishedError |
| packages/documents/domain/src/entities/Discussion/Discussion.errors.ts | $DocumentsDomainId | entities/Discussion/Discussion.errors | DiscussionNotFoundError, DiscussionPermissionDeniedError, DiscussionAlreadyResolvedError, DiscussionNotResolvedError |
| packages/documents/domain/src/entities/Comment/Comment.errors.ts | $DocumentsDomainId | entities/Comment/Comment.errors | CommentNotFoundError, CommentPermissionDeniedError, CommentTooLongError |
| packages/runtime/client/src/workers/worker-rpc.ts | $RuntimeClientId | workers/worker-rpc | FilterError |
| packages/shared/client/src/atom/files/errors.ts | $SharedClientId | atom/files/errors | (check file for specific errors) |
| packages/shared/client/src/atom/services/Upload/Upload.errors.ts | $SharedClientId | atom/services/Upload/Upload.errors | (check file for specific errors) |
| packages/shared/server/src/internal/email/adapters/resend/errors.ts | $SharedServerId | internal/email/adapters/resend/errors | (check file for specific errors) |
| packages/shared/server/src/internal/db/pg/errors.ts | $SharedServerId | internal/db/pg/errors | (check file for specific errors) |

### Category 5: Schema Classes with Hardcoded Annotations (13 files)

| File | Package ID | Module Path | Schemas |
|------|------------|-------------|---------|
| packages/ui/core/src/adapters/schema.ts | $UiCoreId | adapters/schema | DateInputToDateTime |
| packages/shared/domain/src/entity-ids/any-entity-id.ts | $SharedDomainId | entity-ids/any-entity-id | AnyEntityId |
| packages/shared/domain/src/entity-ids/SharedTableNames/SharedTableNames.ts | $SharedDomainId | entity-ids/SharedTableNames/SharedTableNames | SharedTableName |
| packages/shared/domain/src/entity-ids/DocumentsTableNames.ts | $SharedDomainId | entity-ids/DocumentsTableNames | DocumentsTableName |
| packages/shared/domain/src/entity-ids/entity-kind.ts | $SharedDomainId | entity-ids/entity-kind | EntityKind |
| packages/shared/domain/src/Policy.ts | $SharedDomainId | Policy | PolicyRecord, Permission, Action, PolicyRule, PolicySet, AuthorizationDecision, etc. |
| packages/iam/client/src/clients/verify/verify.contracts.ts | $IamClientId | clients/verify/verify.contracts | VerifyPhonePayload, SendEmailVerificationPayload, etc. |
| packages/iam/client/src/clients/recover/recover.contracts.ts | $IamClientId | clients/recover/recover.contracts | ResetPasswordPayload, RequestResetPasswordPayload |
| packages/iam/client/src/clients/session/session.contracts.ts | $IamClientId | clients/session/session.contracts | GetSessionSuccess, ListSessionsSuccess |
| packages/iam/client/src/clients/sign-in/sign-in.contracts.ts | $IamClientId | clients/sign-in/sign-in.contracts | SignInEmailPayload, SignInSocialPayload, etc. |
| packages/shared/domain/src/entities/Organization/schemas/OrganizationType.schema.ts | $SharedDomainId | entities/Organization/schemas/OrganizationType.schema | OrganizationType |
| packages/common/constants/src/AuthProviders.ts | $ConstantsId | AuthProviders | AuthProviderNameValue |
| packages/common/schema/src/integrations/files/AspectRatio.ts | $SchemaId | integrations/files/AspectRatio | AspectRatioDimensions, AspectRatioStringSchema |
| packages/common/schema/src/integrations/files/FileAttributes.ts | $SchemaId | integrations/files/FileAttributes | FileAttributes |
| packages/common/schema/src/integrations/files/file-types/FileSignature.ts | $SchemaId | integrations/files/file-types/FileSignature | FileSignature |
| packages/shared/domain/src/services/EncryptionService/schemas.ts | $SharedDomainId | services/EncryptionService/schemas | HmacSignature |
| apps/web/src/features/upload/UploadModels.ts | $WebId | features/upload/UploadModels | PresignedUrlItem, TraceHeadersSchema, etc. |

## Available TaggedComposers

From `packages/common/identity/src/packages.ts`:

```
$SharedUiId, $SharedClientId, $RepoScriptsId, $IamServerId, $DocumentsTablesId,
$UiId, $YjsId, $InvariantId, $WebId, $SchemaId, $DocumentsDomainId,
$ContractId, $RuntimeServerId, $IamClientId, $IamUiId, $SharedServerId,
$IdentityId, $UtilsId, $IamDomainId, $RuntimeClientId, $ScratchpadId,
$SharedTablesId, $MockId, $UiCoreId, $ErrorsId, $TypesId,
$BuildUtilsId, $DocumentsClientId, $DocumentsUiId, $ConstantsId,
$TestkitId, $ToolingUtilsId, $RepoCliId, $NotesId, $DocumentsServerId,
$ScraperId, $SharedDomainId, $DbAdminId, $ServerId, $IamTablesId, $LexicalSchemasId
```

## Task Requirements

1. Deploy parallel sub-agents organized by category
2. Each sub-agent should:
   - Read the file to understand current implementation
   - Add import for appropriate TaggedComposer
   - Add `const $I = $PackageId.create("module/path");`
   - Update all class declarations to use `$I` pattern
   - Update annotations to use `$I.annotations(...)`
3. Run type check after each batch completes
4. Exclude all files in `./tooling` directory

## Constraints

- Do NOT modify files in `./tooling` directory (circular dependency risk)
- Use exactly the TaggedComposer specified for each package
- Module path should be relative to package's `src/` directory without `.ts` extension
- Maintain existing functionality - only change identifiers
