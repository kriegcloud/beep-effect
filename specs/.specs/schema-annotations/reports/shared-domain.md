# Schema Annotations Audit: @beep/shared-domain

## Summary
- Total Schemas Found: 72
- Annotated: 62
- Missing Annotations: 10

## Annotationless Schemas Checklist

### RPC Schemas (S.Class)
- [ ] `src/rpc/v1/health.ts:8` - `Success` - S.Class (missing annotations in second argument)
- [ ] `src/rpc/v1/files/move-files.ts:8` - `Payload` - S.Class (missing annotations in second argument)
- [ ] `src/rpc/v1/files/delete-folders.ts:8` - `Payload` - S.Class (missing annotations in second argument)
- [ ] `src/rpc/v1/files/get-files-by-keys.ts:8` - `Payload` - S.Class (missing annotations in second argument)

### Entity Folder Schemas (S.Class)
- [ ] `src/entities/Folder/schemas/WithUploadedFiles.ts:8` - `WithUploadedFiles` - S.Class (missing annotations in second argument)

### Entity Organization Schemas (BS.StringLiteralKit extending S.Schema)
- [ ] `src/entities/Organization/schemas/SubscriptionTier.schema.ts:4` - `SubscriptionTier` - BS.StringLiteralKit (missing annotations)
- [ ] `src/entities/Organization/schemas/SubscriptionStatus.schema.ts:4` - `SubscriptionStatus` - BS.StringLiteralKit (missing annotations)

### EncryptionService Schemas (S.Struct, S.Literal)
- [ ] `src/services/EncryptionService/schemas.ts:27` - `EncryptionAlgorithm` - S.Literal (missing annotations)
- [ ] `src/services/EncryptionService/schemas.ts:36` - `EncryptedPayloadBinary` - S.Struct (missing annotations)
- [ ] `src/services/EncryptionService/schemas.ts:52` - `EncryptedPayload` - S.Struct (missing annotations)

### EncryptionService Errors (BS.StringLiteralKit without proper identity annotations)
- [ ] `src/services/EncryptionService/errors.ts:16` - `EncryptionPhase` - BS.StringLiteralKit (missing $I.annotations)
- [ ] `src/services/EncryptionService/errors.ts:29` - `DecryptionPhase` - BS.StringLiteralKit (missing $I.annotations)
- [ ] `src/services/EncryptionService/errors.ts:92` - `SigningPhase` - BS.StringLiteralKit (missing $I.annotations)

### Policy Schemas
- [ ] `src/policy/permissions.ts:7` - `CommonPermissions` - BS.LiteralKit (missing annotations)

---

## Detailed Findings

### Properly Annotated Schemas (62)

#### M.Class Models (All Annotated)
- `src/entities/File/File.model.ts:15` - `Model` (FileModel)
- `src/entities/Folder/Folder.model.ts:14` - `Model` (FolderModel)
- `src/entities/Organization/Organization.model.ts:18` - `Model` (OrganizationModel)
- `src/entities/Session/Session.model.ts:15` - `Model` (SessionModel)
- `src/entities/Team/Team.model.ts:15` - `Model` (TeamModel)
- `src/entities/User/User.model.ts:16` - `Model` (UserModel)
- `src/entities/AuditLog/AuditLog.model.ts:13` - `Model` (AuditLogModel)
- `src/entities/UploadSession/UploadSession.model.ts:26` - `Model` (UploadSessionModel)

#### S.Class Schemas (Annotated)
- `src/entities/File/File.model.ts:85` - `CreateUploadKeyInput`
- `src/rpc/v1/files/initiate-upload.ts:10` - `Payload` (InitiateUploadPayload)
- `src/rpc/v1/files/initiate-upload.ts:27` - `Success` (InitiateUploadSuccess)
- `src/rpc/v1/files/list-files.ts:8` - `Success` (ListFilesSuccess)
- `src/rpc/v1/files/create-folder.ts:8` - `Payload` (CreateFolderPayload)
- `src/rpc/v1/files/create-folder.ts:17` - `Success` (CreateFolderSuccess)
- `src/rpc/v1/files/delete-files.ts:8` - `Payload` (DeleteFilesPayload)
- `src/entities/UploadSession/schemas/UploadSessionMetadata.ts:9` - `UploadSessionMetadata`

#### S.TaggedError Classes (Annotated)
- `src/errors.ts:6` - `UploadError`
- `src/services/EncryptionService/errors.ts:42` - `EncryptionError`
- `src/services/EncryptionService/errors.ts:55` - `DecryptionError`
- `src/services/EncryptionService/errors.ts:67` - `KeyDerivationError`
- `src/services/EncryptionService/errors.ts:81` - `HashError`
- `src/services/EncryptionService/errors.ts:105` - `SigningError`
- `src/services/EncryptionService/errors.ts:164` - `InvalidSignatureError`
- `src/services/EncryptionService/errors.ts:225` - `SignatureExpiredError`

#### S.Struct / S.transformOrFail / S.Union Schemas (Annotated)
- `src/entities/File/schemas/UploadKey.ts:47` - `ShardPrefixEncoded`
- `src/entities/File/schemas/UploadKey.ts:73` - `ShardPrefixDecoded`
- `src/entities/File/schemas/UploadKey.ts:111` - `ShardPrefix`
- `src/entities/File/schemas/UploadKey.ts:230` - `UploadKeyEncoded`
- `src/entities/File/schemas/UploadKey.ts:268` - `UploadKeyParser`
- `src/entities/File/schemas/UploadKey.ts:305` - `UploadKeyDecoded`
- `src/entities/File/schemas/UploadKey.ts:385` - `UploadKey`
- `src/services/EncryptionService/schemas.ts:363` - `HmacSignature`
- `src/Actor.ts:7` - `ActorId`

#### BS.StringLiteralKit Schemas (Annotated)
- `src/entities/Organization/schemas/OrganizationType.schema.ts:7` - `OrganizationType`
- `src/entities/User/schemas/UserRole.ts:5` - `UserRole`
- `src/value-objects/EntitySource.ts:3` - `EntitySource`
- `src/entity-ids/entity-kind.ts:11` - `EntityKind`
- `src/entity-ids/shared/table-name.ts:8` - `TableName` (SharedTableName)
- `src/entity-ids/iam/table-name.ts:8` - `TableName` (IamTableName)
- `src/entity-ids/documents/table-name.ts:8` - `TableName` (DocumentsTableName)
- `src/entity-ids/customization/table-name.ts:8` - `TableName` (CustomizationTableName)

#### EntityId Schemas (Annotated via EntityId.make pattern)
- `src/entity-ids/shared/ids.ts:7` - `OrganizationId`
- `src/entity-ids/shared/ids.ts:20` - `TeamId`
- `src/entity-ids/shared/ids.ts:33` - `FileId`
- `src/entity-ids/shared/ids.ts:46` - `AuditLogId`
- `src/entity-ids/shared/ids.ts:59` - `UserId`
- `src/entity-ids/shared/ids.ts:72` - `SessionId`
- `src/entity-ids/shared/ids.ts:85` - `FolderId`
- `src/entity-ids/shared/ids.ts:98` - `UploadSessionId`
- `src/entity-ids/shared/ids.ts:111` - `AgentId`
- `src/entity-ids/iam/ids.ts:7` - `AccountId`
- `src/entity-ids/iam/ids.ts:20` - `ScimProviderId`
- `src/entity-ids/iam/ids.ts:33` - `ApiKeyId`
- `src/entity-ids/iam/ids.ts:46` - `InvitationId`
- `src/entity-ids/iam/ids.ts:59` - `JwksId`
- `src/entity-ids/iam/ids.ts:72` - `MemberId`
- `src/entity-ids/iam/ids.ts:85` - `OAuthAccessTokenId`
- `src/entity-ids/iam/ids.ts:98` - `OAuthApplicationId`
- `src/entity-ids/iam/ids.ts:111` - `OAuthConsentId`
- `src/entity-ids/iam/ids.ts:124` - `PasskeyId`
- `src/entity-ids/iam/ids.ts:137` - `RateLimitId`
- `src/entity-ids/iam/ids.ts:150` - `SsoProviderId`
- `src/entity-ids/iam/ids.ts:163` - `SubscriptionId`
- `src/entity-ids/iam/ids.ts:176` - `TeamMemberId`
- `src/entity-ids/iam/ids.ts:189` - `TwoFactorId`
- `src/entity-ids/iam/ids.ts:202` - `VerificationId`
- `src/entity-ids/iam/ids.ts:215` - `WalletAddressId`
- `src/entity-ids/iam/ids.ts:228` - `OrganizationRoleId`
- `src/entity-ids/iam/ids.ts:241` - `DeviceCodeId`
- `src/entity-ids/documents/ids.ts:6` - `DocumentId`
- `src/entity-ids/documents/ids.ts:19` - `DocumentVersionId`
- `src/entity-ids/documents/ids.ts:32` - `DiscussionId`
- `src/entity-ids/documents/ids.ts:45` - `CommentId`
- `src/entity-ids/documents/ids.ts:58` - `DocumentFileId`
- `src/entity-ids/customization/ids.ts:7` - `UserHotkeyId`

#### S.Union (Any ID aggregates - Annotated)
- `src/entity-ids/any-entity-id.ts:10` - `AnyEntityId`
- `src/entity-ids/shared/any-id.ts:7` - `AnyId` (AnySharedId)
- `src/entity-ids/iam/any-id.ts:7` - `AnyId` (AnyIamId)
- `src/entity-ids/documents/any-id.ts:7` - `AnyId` (AnyDocumentsId)
- `src/entity-ids/customization/any-id.ts:7` - `AnyId` (AnyCustomizationId)

---

## Notes

1. **Excluded from count**: Generic utility functions like `makeFields`, `SignedPayloadStruct`, `SignedPayload`, `SignedPayloadWithExpiration`, `EncryptedStringFromPlaintext`, `EncryptedBinaryFromPlaintext`, `EncryptedPayloadFromBytes`, `EncryptedBinaryFromBytes`, `Sha256HashFromString` - these are schema factories/builders that take parameters and create schemas dynamically.

2. **Excluded from count**: Re-exports and index files.

3. **Pattern observed**: The codebase uses `$I = $SharedDomainId.create("...")` pattern consistently for creating identity annotations. Schemas missing annotations typically lack the second argument to `S.Class(...)` or `.annotations(...)` call.

4. **BS.StringLiteralKit**: Extends schema classes that accept annotations. Missing annotations should use the standard `.annotations($I.annotations(...))` pattern.
