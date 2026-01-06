# Identity Composer Migration TODO

Synthesized from exploration reports. All packages have existing composers in `packages/common/identity/src/packages.ts`.

## Summary

| Package Area | Files | Violations | Status |
|--------------|-------|------------|--------|
| IAM | 24 | 24 | Pending |
| Documents | 6 | 6 | Pending |
| Shared | 7 | 9 | Pending |
| Runtime | 4 | 4 | Pending |
| UI | 4 | 4 | Pending |
| Customization | 0 | 0 | Complete |
| Apps (web) | 10 | 16 | Pending |
| **Total** | **55** | **63** | - |

---

## IAM Packages (24 files)

### iam-server (1 file)
- [ ] `packages/iam/server/src/db/repos/User.repo.ts` - Effect.Service

### iam-client (2 files)
- [ ] `packages/iam/client/src/errors.ts` - S.Class, S.TaggedError
- [ ] `packages/iam/client/src/clients/user/user.contracts.ts` - S.Class (2x)

### iam-domain (21 files)

#### API Errors
- [ ] `packages/iam/domain/src/api/common/errors.ts` - S.TaggedError

#### Entity Models (M.Class)
- [ ] `packages/iam/domain/src/entities/Account/Account.model.ts`
- [ ] `packages/iam/domain/src/entities/ApiKey/ApiKey.model.ts`
- [ ] `packages/iam/domain/src/entities/DeviceCode/DeviceCode.model.ts`
- [ ] `packages/iam/domain/src/entities/Invitation/Invitation.model.ts`
- [ ] `packages/iam/domain/src/entities/Jwks/Jwks.model.ts`
- [ ] `packages/iam/domain/src/entities/Member/Member.model.ts`
- [ ] `packages/iam/domain/src/entities/OAuthAccessToken/OAuthAccessToken.model.ts`
- [ ] `packages/iam/domain/src/entities/OAuthApplication/OAuthApplication.model.ts`
- [ ] `packages/iam/domain/src/entities/OAuthConsent/OAuthConsent.model.ts`
- [ ] `packages/iam/domain/src/entities/OrganizationRole/OrganizationRole.model.ts`
- [ ] `packages/iam/domain/src/entities/Passkey/Passkey.model.ts`
- [ ] `packages/iam/domain/src/entities/RateLimit/RateLimit.model.ts`
- [ ] `packages/iam/domain/src/entities/ScimProvider/ScimProvider.model.ts`
- [ ] `packages/iam/domain/src/entities/SsoProvider/SsoProvider.model.ts`
- [ ] `packages/iam/domain/src/entities/Subscription/Subscription.model.ts`
- [ ] `packages/iam/domain/src/entities/TeamMember/TeamMember.model.ts`
- [ ] `packages/iam/domain/src/entities/TwoFactor/TwoFactor.model.ts`
- [ ] `packages/iam/domain/src/entities/Verification/Verification.model.ts`
- [ ] `packages/iam/domain/src/entities/WalletAddress/WalletAddress.model.ts`

---

## Documents Packages (6 files)

### documents-server (6 files)
- [ ] `packages/documents/server/src/db/repos/Document.repo.ts` - Effect.Service
- [ ] `packages/documents/server/src/db/repos/DocumentFile.repo.ts` - Effect.Service
- [ ] `packages/documents/server/src/db/repos/DocumentVersion.repo.ts` - Effect.Service
- [ ] `packages/documents/server/src/SignedUrlService.ts` - Effect.Service
- [ ] `packages/documents/server/src/files/ExifToolService.ts` - Effect.Service
- [ ] `packages/documents/server/src/files/PdfMetadataService.ts` - Effect.Service

---

## Shared Packages (7 files)

### shared-domain (3 files)
- [ ] `packages/shared/domain/src/Policy.ts` - Context.Tag (2x)
- [ ] `packages/shared/domain/src/services/EncryptionService/EncryptionService.ts` - Context.Tag
- [ ] `packages/shared/domain/src/policy/policy-types.ts` - S.Class (2x)

### shared-server (4 files)
- [ ] `packages/shared/server/src/factories/db-client/pg/PgClient.ts` - Context.Tag
- [ ] `packages/shared/server/src/rpc/v1/event-stream-hub.ts` - Effect.Service
- [ ] `packages/shared/server/src/internal/email/adapters/resend/service.ts` - Effect.Service
- [ ] `packages/shared/server/src/db/repos/UploadSession.repo.ts` - S.TaggedError

---

## Runtime Packages (4 files)

### runtime-client (3 files)
- [ ] `packages/runtime/client/src/workers/worker-client.ts` - Effect.Service
- [ ] `packages/runtime/client/src/services/network-monitor.ts` - Effect.Service
- [ ] `packages/runtime/client/src/workers/worker-rpc.ts` - Schema.TaggedError

### runtime-server (1 file)
- [ ] `packages/runtime/server/src/Rpc.layer.ts` - RpcMiddleware.Tag

---

## UI Packages (4 files)

### ui (4 files)
- [ ] `packages/ui/ui/src/services/toaster.service.ts` - Effect.Service
- [ ] `packages/ui/ui/src/services/zip.service.ts` - Effect.Service
- [ ] `packages/ui/ui/src/data-display/markdown/markdown.tsx` - Data.TaggedError
- [ ] `packages/ui/ui/test/form/makeFormOptions.test.ts` - S.Class (test file)

---

## Apps (10 files)

### apps/web (10 files)

#### Upload Feature
- [ ] `apps/web/src/features/upload/UploadFileService.ts` - Effect.Service
- [ ] `apps/web/src/features/upload/UploadModels.ts` - S.Class (6x)
- [ ] `apps/web/src/features/upload/errors.ts` - Data.TaggedError (3x)
- [ ] `apps/web/src/features/upload/requestPresignedUrls.ts` - Data.TaggedError
- [ ] `apps/web/src/features/upload/uploadToS3.ts` - Data.TaggedError
- [ ] `apps/web/src/features/upload/completeUpload.ts` - Data.TaggedError
- [ ] `apps/web/src/features/upload/UploadPipeline.ts` - Data.TaggedError

#### Account Feature
- [ ] `apps/web/src/features/account/account-notifications.tsx` - S.Class
- [ ] `apps/web/src/features/account/account-socials.tsx` - S.Class

---

## Migration Pattern Reference

### For each file:

1. **Add import** at top:
```typescript
import { $PackageId } from "@beep/identity/packages";
```

2. **Create `$I` constant** after imports:
```typescript
const $I = $PackageId.create("relative/path/from/src");
```

3. **Replace string identifiers** with tagged template:
```typescript
// Before
Context.Tag("@beep/pkg/Name")
Effect.Service<T>()("Name", {...})
S.Class<T>("Name")({...})
M.Class<T>("Name")({...})
S.TaggedError<T>()("Name", {...})

// After
Context.Tag($I`Name`)
Effect.Service<T>()($I`Name`, {...})
S.Class<T>($I`Name`)({...})
M.Class<T>($I`Name`)({...})
S.TaggedError<T>()($I`Name`, {...})
```

4. **Add annotations** where appropriate:
```typescript
S.Class<T>($I`Name`)({...}, $I.annotations("Name", { description: "..." }))
```

### Composer Mapping

| Package | Composer Import |
|---------|-----------------|
| iam-domain | `$IamDomainId` |
| iam-server | `$IamServerId` |
| iam-client | `$IamClientId` |
| documents-server | `$DocumentsServerId` |
| shared-domain | `$SharedDomainId` |
| shared-server | `$SharedServerId` |
| runtime-client | `$RuntimeClientId` |
| runtime-server | `$RuntimeServerId` |
| ui | `$UiId` |
| web | `$WebId` |
