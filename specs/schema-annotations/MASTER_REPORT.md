# Schema Annotations Audit Master Report

This report consolidates all identified Effect Schemas without annotations across the beep-effect monorepo.

## Overview

**Audit Status**: Complete
**Last Updated**: 2026-01-06

### Summary Statistics

| Category | Count |
|----------|-------|
| Total Packages Scanned | 35 |
| Packages with Issues | 17 |
| Total Annotationless Schemas | 62 |

---

## Annotation Pattern Reference

### Regular Schemas (S.Class, S.Struct)
```typescript
const $I = $PackageId.create("path/to/module");

export class MySchema extends S.Class<MySchema>("MySchema")(
  { field: S.String }
).annotations(
  $I.annotations("MySchema", {
    description: "Description of the schema"
  })
) {}
```

### M.Class (SQL Models)
```typescript
const $I = $PackageId.create("entities/Model/Model.model");

export class Model extends M.Class<Model>($I`ModelName`)(
  makeFields(EntityId, { /* fields */ }),
  $I.annotations("ModelName", {
    description: "Description of the model"
  })
) {}
```

---

## Packages with Annotationless Schemas

### @beep/constants

| File | Line | Schema Name | Type |
|------|------|-------------|------|
| `src/AuthProviders.ts` | 82 | `TaggedAuthProviderNameValue` | Union |

### @beep/contract

| File | Line | Schema Name | Type |
|------|------|-------------|------|
| `src/internal/contract-kit/contract-kit.ts` | 191 | `LiftServiceMode` | BS.StringLiteralKit |
| `src/internal/contract/annotations.ts` | 77 | `SupportsAbort` | Context.Reference |

### @beep/errors

| File | Line | Schema Name | Type |
|------|------|-------------|------|
| `src/errors.ts` | 27 | `Es5Error` | Data.Error |

### @beep/invariant

| File | Line | Schema Name | Type |
|------|------|-------------|------|
| `src/meta.ts` | 39 | `CallMetadata` | S.Struct |

### @beep/schema

| File | Line | Schema Name | Type |
|------|------|-------------|------|
| `src/integrations/files/utils/formatSize.ts` | 39 | `InvalidFileSizeInput` | S.TaggedError |
| `src/integrations/files/utils/formatSize.ts` | 119 | `FormattedNumberStruct` | S.Struct |
| `src/primitives/number/formatted-number.ts` | 8 | `BigIntToSiSymbol` | MappedLiteralKit |
| `src/integrations/sql/dsl/errors.ts` | 78 | `AutoIncrementTypeError` | S.TaggedError |
| `src/integrations/sql/dsl/errors.ts` | 93 | `IdentifierTooLongError` | S.TaggedError |
| `src/integrations/sql/dsl/errors.ts` | 110 | `InvalidIdentifierCharsError` | S.TaggedError |
| `src/integrations/sql/dsl/errors.ts` | 128 | `NullablePrimaryKeyError` | S.TaggedError |
| `src/integrations/sql/dsl/errors.ts` | 149 | `MissingVariantSchemaError` | S.TaggedError |
| `src/integrations/sql/dsl/errors.ts` | 166 | `UnsupportedColumnTypeError` | S.TaggedError |
| `src/integrations/sql/dsl/errors.ts` | 190 | `EmptyModelIdentifierError` | S.TaggedError |
| `src/integrations/sql/dsl/errors.ts` | 204 | `MultipleAutoIncrementError` | S.TaggedError |
| `src/integrations/sql/dsl/errors.ts` | 225 | `ModelValidationAggregateError` | S.TaggedError |
| `src/primitives/json/json.ts` | 173 | `JsonArray` | S.Array |
| `src/primitives/json/json.ts` | 225 | `NonEmptyJsonArray` | S.NonEmptyArray |

### @beep/utils

| File | Line | Schema Name | Type |
|------|------|-------------|------|
| `src/md5/worker.ts` | 31 | `HashRequest` | S.TaggedRequest |
| `src/md5/worker.ts` | 53 | `WorkerRequestSchema` | S.Union |
| `src/topo-sort/topo-sort.ts` | 12 | `NodeId` | S.brand |
| `src/topo-sort/topo-sort.ts` | 15 | `DirectedAcyclicGraph` | S.HashMap |
| `src/topo-sort/topo-sort.ts` | 24 | `TaskList` | S.Array |
| `src/topo-sort/topo-sort.graph.ts` | 13 | `NodeId` | S.brand |
| `src/topo-sort/topo-sort.graph.ts` | 16 | `DirectedAcyclicGraph` | S.HashMap |
| `src/topo-sort/topo-sort.graph.ts` | 25 | `TaskList` | S.Array |

### @beep/yjs

| File | Line | Schema Name | Type |
|------|------|-------------|------|
| `src/protocol/Ai.ts` | 30 | `ContextualPromptResponseOther` | S.Class |
| `src/protocol/Groups.ts` | 17 | `GroupScopes` | S.Struct |

### @beep/iam-domain

| File | Line | Schema Name | Type |
|------|------|-------------|------|
| `src/entities/DeviceCode/schemas/DeviceCodeStatus.ts` | 4 | `DeviceCodeStatus` | StringLiteralKit |

### @beep/documents-domain

| File | Line | Schema Name | Type |
|------|------|-------------|------|
| `src/entities/Discussion/Discussion.rpc.ts` | 16 | `DiscussionWithComments` | S.Struct |
| `src/entities/Document/Document.rpc.ts` | 11 | `SearchResult` | S.Struct |

### @beep/documents-server

| File | Line | Schema Name | Type |
|------|------|-------------|------|
| `src/db/repos/Discussion.repo.ts` | 19 | `DiscussionWithCommentsSchema` | S.Struct |
| `src/db/repos/Document.repo.ts` | 16 | `SearchResultSchema` | S.Struct |
| `src/db/repos/Document.repo.ts` | 24 | `SearchRequest` | S.Struct |
| `src/db/repos/DocumentVersion.repo.ts` | 24 | `VersionWithAuthorSchema` | S.Struct |
| `src/db/repos/DocumentFile.repo.ts` | 17 | `FileNotFoundError` | Data.TaggedError |
| `src/db/repos/DocumentVersion.repo.ts` | 17 | `VersionNotFoundError` | Data.TaggedError |

### @beep/iam-client

| File | Line | Schema Name | Type |
|------|------|-------------|------|
| `src/adapters/better-auth/errors.ts` | 3 | `BetterAuthError` | Data.TaggedError |
| `src/clients/user/user.contracts.ts` | 57 | `ChangeEmailPayload` | S.Class |
| `src/clients/user/user.contracts.ts` | 72 | `ChangePasswordPayload` | S.Class |
| `src/clients/verify/verify.contracts.ts` | 116 | `VerifyEmailUser` | S.Struct |

### @beep/runtime-client

| File | Line | Schema Name | Type |
|------|------|-------------|------|
| `src/workers/image-compression-rpc.ts` | 5 | `ImageCompressionRpc` | RpcGroup.make |
| `src/workers/worker-rpc.ts` | 12 | `WorkerRpc` | RpcGroup.make |
| `src/services/unsafe-http-api-client.ts` | 46 | `HttpBodyFromSelf` | S.declare |

### @beep/shared-client

| File | Line | Schema Name | Type |
|------|------|-------------|------|
| `src/atom/files/types.ts` | 78 | `StartUploadFolder` | S.TaggedClass |

### @beep/shared-domain

| File | Line | Schema Name | Type |
|------|------|-------------|------|
| `src/rpc/v1/health.ts` | 8 | `Success` | S.Class |
| `src/rpc/v1/files/move-files.ts` | 8 | `Payload` | S.Class |
| `src/rpc/v1/files/delete-folders.ts` | 8 | `Payload` | S.Class |
| `src/rpc/v1/files/get-files-by-keys.ts` | 8 | `Payload` | S.Class |
| `src/entities/Folder/schemas/WithUploadedFiles.ts` | 8 | `WithUploadedFiles` | S.Class |
| `src/entities/Organization/schemas/SubscriptionTier.schema.ts` | 4 | `SubscriptionTier` | BS.StringLiteralKit |
| `src/entities/Organization/schemas/SubscriptionStatus.schema.ts` | 4 | `SubscriptionStatus` | BS.StringLiteralKit |
| `src/services/EncryptionService/schemas.ts` | 27 | `EncryptionAlgorithm` | S.Literal |
| `src/services/EncryptionService/schemas.ts` | 36 | `EncryptedPayloadBinary` | S.Struct |
| `src/services/EncryptionService/schemas.ts` | 52 | `EncryptedPayload` | S.Struct |

### @beep/shared-env

| File | Line | Schema Name | Type |
|------|------|-------------|------|
| `src/ClientEnv.ts` | 15 | `AuthProviderNames` | Transformed Schema |
| `src/ClientEnv.ts` | 19 | `ClientEnvSchema` | S.Struct |

### @beep/shared-server

| File | Line | Schema Name | Type |
|------|------|-------------|------|
| `src/internal/email/adapters/resend/errors.ts` | 9 | `ResendErrorCode` | BS.StringLiteralKit |
| `src/internal/email/adapters/resend/errors.ts` | 40 | `ResendError` | S.TaggedError |
| `src/internal/email/adapters/resend/errors.ts` | 61 | `EmailTemplateRenderError` | S.TaggedError |
| `src/db/repos/UploadSession.repo.ts` | 61 | `UploadSessionRepoError` | S.TaggedError |

### @beep/shared-tables

| File | Line | Schema Name | Type |
|------|------|-------------|------|
| `src/columns/custom-datetime.ts` | 17 | `DateTimeToIsoString` | S.transformOrFail |

### @beep/ui-core

| File | Line | Schema Name | Type |
|------|------|-------------|------|
| `src/i18n/constants.ts` | 14 | `LangValueToAdapterLocale` | S.transformLiterals |
| `src/i18n/SupportedLangValue.ts` | 3 | `SupportedLangValue` | StringLiteralKit |

### @beep/ui

| File | Line | Schema Name | Type |
|------|------|-------------|------|
| `src/components/editor/use-chat.ts` | 71 | `ToolName` | S.Class |

---

## Package Reports Index

| Package | Report | Status | Issues Found |
|---------|--------|--------|--------------|
| @beep/constants | [common-constants.md](reports/common-constants.md) | Complete | 1 |
| @beep/contract | [common-contract.md](reports/common-contract.md) | Complete | 2 |
| @beep/customization-client | [customization-client.md](reports/customization-client.md) | Complete | 0 |
| @beep/customization-domain | [customization-domain.md](reports/customization-domain.md) | Complete | 0 |
| @beep/customization-server | [customization-server.md](reports/customization-server.md) | Complete | 0 |
| @beep/customization-tables | [customization-tables.md](reports/customization-tables.md) | Complete | 0 |
| @beep/customization-ui | [customization-ui.md](reports/customization-ui.md) | Complete | 0 |
| @beep/db-admin | [internal-db-admin.md](reports/internal-db-admin.md) | Complete | 0 |
| @beep/documents-client | [documents-client.md](reports/documents-client.md) | Complete | 0 |
| @beep/documents-domain | [documents-domain.md](reports/documents-domain.md) | Complete | 2 |
| @beep/documents-server | [documents-server.md](reports/documents-server.md) | Complete | 6 |
| @beep/documents-tables | [documents-tables.md](reports/documents-tables.md) | Complete | 0 |
| @beep/documents-ui | [documents-ui.md](reports/documents-ui.md) | Complete | 0 |
| @beep/errors | [common-errors.md](reports/common-errors.md) | Complete | 1 |
| @beep/iam-client | [iam-client.md](reports/iam-client.md) | Complete | 4 |
| @beep/iam-domain | [iam-domain.md](reports/iam-domain.md) | Complete | 1 |
| @beep/iam-server | [iam-server.md](reports/iam-server.md) | Complete | 0 |
| @beep/iam-tables | [iam-tables.md](reports/iam-tables.md) | Complete | 0 |
| @beep/iam-ui | [iam-ui.md](reports/iam-ui.md) | Complete | 0 |
| @beep/invariant | [common-invariant.md](reports/common-invariant.md) | Complete | 1 |
| @beep/lexical-schemas | [common-lexical-schemas.md](reports/common-lexical-schemas.md) | Complete | 0 |
| @beep/mock | [common-mock.md](reports/common-mock.md) | Complete | 0 |
| @beep/runtime-client | [runtime-client.md](reports/runtime-client.md) | Complete | 3 |
| @beep/runtime-server | [runtime-server.md](reports/runtime-server.md) | Complete | 0 |
| @beep/schema | [common-schema.md](reports/common-schema.md) | Complete | 14 |
| @beep/shared-client | [shared-client.md](reports/shared-client.md) | Complete | 1 |
| @beep/shared-domain | [shared-domain.md](reports/shared-domain.md) | Complete | 10 |
| @beep/shared-env | [shared-env.md](reports/shared-env.md) | Complete | 2 |
| @beep/shared-server | [shared-server.md](reports/shared-server.md) | Complete | 4 |
| @beep/shared-tables | [shared-tables.md](reports/shared-tables.md) | Complete | 1 |
| @beep/shared-ui | [shared-ui.md](reports/shared-ui.md) | Complete | 0 |
| @beep/ui | [ui-ui.md](reports/ui-ui.md) | Complete | 1 |
| @beep/ui-core | [ui-core.md](reports/ui-core.md) | Complete | 2 |
| @beep/utils | [common-utils.md](reports/common-utils.md) | Complete | 9 |
| @beep/yjs | [common-yjs.md](reports/common-yjs.md) | Complete | 2 |

