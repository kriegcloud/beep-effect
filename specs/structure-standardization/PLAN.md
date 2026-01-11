# Structure Standardization Plan

> Generated: 2026-01-07
> Updated: 2026-01-09 (Lexical editor exclusion decision)
> Total Changes: ~206 (Lexical editor directories excluded)

## Summary

| Category                 | Count | Complexity |
|--------------------------|-------|------------|
| Directory Renames        | 47    | High       |
| File Renames             | ~150  | Medium     |
| Missing Index Files      | 0     | Low        |
| Structure Reorganization | 0     | High       |

Note: 44 Lexical editor directories excluded per decision on 2026-01-09 (see Notes section).

## Corrections Log (2026-01-07)

### Initial Updates
- Added missing packages: @beep/shared-tables, @beep/constants, @beep/contract, @beep//identity, @beep/db-admin
- Added @beep/todox to execution order (new package)
- Marked Lexical editor directories as [VERIFY] - follows React component conventions

### Final Verification Pass
- **Fixed directory count**: 44 non-Lexical + 47 Lexical = 91 total (was incorrectly stated as 47+47)
- **Fixed import counts**: @beep/iam-domain has 313 imports (was 857), @beep/shared-domain has 353 imports (was 577)
- **Removed false positives**: All 3 "missing" index files actually exist
- **Added missing packages**: @beep/-schema (~20 files), @beep/shared-env (2 files)
- **Added missed files**:
  - @beep/iam-server/adapters/better-auth: 4 additional PascalCase files (BetterAuthBridge.ts, Emails.ts, Options.ts)
  - @beep/shared-domain root files: ManualCache.ts, Policy.ts, Actor.ts, Retry.ts
  - @beep/shared-server: Email.ts
- **Updated file rename count**: ~150 (was ~115)

## Impact Analysis

### Packages by Change Count

| Package                    | Changes | Priority |
|----------------------------|---------|----------|
| @beep/iam-domain           | 36      | P1       |
| @beep/ui                   | 3       | P3       |
| @beep/shared-domain        | 16      | P1       |
| @beep/iam-server           | 30      | P1       |
| @beep/shared-server        | 7       | P1       |
| @beep/documents-domain     | 10      | P2       |
| @beep/documents-server     | 9       | P2       |
| @beep/iam-tables           | 14      | P2       |
| @beep/documents-tables     | 2       | P3       |
| @beep/comms-domain         | 2       | P3       |
| @beep/comms-server         | 2       | P3       |
| @beep/customization-domain | 2       | P3       |
| @beep/customization-server | 2       | P3       |
| @beep/runtime-server       | 12      | P2       |
| @beep/iam-client           | 1       | P3       |
| @beep/shared-client        | 8       | P2       |
| @beep/shared-tables        | 2       | P3       |
| @beep/constants            | 10      | P2       |
| @beep/contract             | 3       | P3       |
| @beep/identity             | 1       | P3       |
| @beep/db-admin             | 1       | P3       |
| @beep/schema               | ~20     | P2       |
| @beep/shared-env           | 2       | P3       |

### Import Impact Analysis

| Package             | Import Count | Risk   |
|---------------------|--------------|--------|
| @beep/shared-domain | 353          | MEDIUM |
| @beep/iam-domain    | 313          | MEDIUM |

---

## Execution Order (Reverse Topological)

Process packages in this exact order (consumers first, providers last).
Verified via `bun run topo-sort` on 2026-01-07.

1. @beep/web
2. @beep/iam-ui
3. @beep/todox *(new)*
4. @beep/server
5. @beep/shared-ui
6. @beep/runtime-server
7. @beep/iam-client
8. @beep/db-admin
9. @beep/shared-client
10. @beep/iam-server
11. @beep/customization-server
12. @beep/documents-server
13. @beep/comms-server
14. @beep/runtime-client
15. @beep/iam-tables
16. @beep/documents-tables
17. @beep/customization-tables
18. @beep/comms-tables
19. @beep/ui *(3 directory renames)*
20. @beep/shared-tables
21. @beep/shared-server
22. @beep/shared-env
23. @beep/iam-domain
24. @beep/documents-domain
25. @beep/customization-domain
26. @beep/comms-domain
27. @beep/shared-domain
28. @beep/constants *(common package)*
29. @beep/contract *(common package)*
30. @beep/identity *(common package)*

---

## Category A: Directory Renames

### @beep/iam-domain

- [ ] `packages/iam/domain/src/entities/Account/` → `packages/iam/domain/src/entities/account/`
  - Files: Account.model.ts, index.ts
  - Imports to update: ~5

- [ ] `packages/iam/domain/src/entities/ApiKey/` → `packages/iam/domain/src/entities/api-key/`
  - Files: ApiKey.model.ts, index.ts
  - Imports to update: ~5

- [ ] `packages/iam/domain/src/entities/DeviceCode/` → `packages/iam/domain/src/entities/device-code/`
  - Files: DeviceCode.model.ts, index.ts, schemas/
  - Imports to update: ~5

- [ ] `packages/iam/domain/src/entities/Invitation/` → `packages/iam/domain/src/entities/invitation/`
  - Files: Invitation.model.ts, index.ts, schemas/
  - Imports to update: ~5

- [ ] `packages/iam/domain/src/entities/Jwks/` → `packages/iam/domain/src/entities/jwks/`
  - Files: Jwks.model.ts, index.ts
  - Imports to update: ~3

- [ ] `packages/iam/domain/src/entities/Member/` → `packages/iam/domain/src/entities/member/`
  - Files: Member.model.ts, index.ts, schemas/
  - Imports to update: ~5

- [ ] `packages/iam/domain/src/entities/OAuthAccessToken/` → `packages/iam/domain/src/entities/oauth-access-token/`
  - Files: OAuthAccessToken.model.ts, index.ts
  - Imports to update: ~3

- [ ] `packages/iam/domain/src/entities/OAuthApplication/` → `packages/iam/domain/src/entities/oauth-application/`
  - Files: OAuthApplication.model.ts, index.ts
  - Imports to update: ~3

- [ ] `packages/iam/domain/src/entities/OAuthConsent/` → `packages/iam/domain/src/entities/oauth-consent/`
  - Files: OAuthConsent.model.ts, index.ts
  - Imports to update: ~3

- [ ] `packages/iam/domain/src/entities/OrganizationRole/` → `packages/iam/domain/src/entities/organization-role/`
  - Files: OrganizationRole.model.ts, index.ts
  - Imports to update: ~3

- [ ] `packages/iam/domain/src/entities/Passkey/` → `packages/iam/domain/src/entities/passkey/`
  - Files: Passkey.model.ts, index.ts, schemas/
  - Imports to update: ~5

- [ ] `packages/iam/domain/src/entities/RateLimit/` → `packages/iam/domain/src/entities/rate-limit/`
  - Files: RateLimit.model.ts, index.ts
  - Imports to update: ~3

- [ ] `packages/iam/domain/src/entities/ScimProvider/` → `packages/iam/domain/src/entities/scim-provider/`
  - Files: ScimProvider.model.ts, index.ts
  - Imports to update: ~3

- [ ] `packages/iam/domain/src/entities/SsoProvider/` → `packages/iam/domain/src/entities/sso-provider/`
  - Files: SsoProvider.model.ts, index.ts
  - Imports to update: ~3

- [ ] `packages/iam/domain/src/entities/Subscription/` → `packages/iam/domain/src/entities/subscription/`
  - Files: Subscription.model.ts, index.ts
  - Imports to update: ~3

- [ ] `packages/iam/domain/src/entities/TeamMember/` → `packages/iam/domain/src/entities/team-member/`
  - Files: TeamMember.model.ts, index.ts
  - Imports to update: ~3

- [ ] `packages/iam/domain/src/entities/TwoFactor/` → `packages/iam/domain/src/entities/two-factor/`
  - Files: TwoFactor.model.ts, index.ts
  - Imports to update: ~3

- [ ] `packages/iam/domain/src/entities/Verification/` → `packages/iam/domain/src/entities/verification/`
  - Files: Verification.model.ts, index.ts
  - Imports to update: ~3

- [ ] `packages/iam/domain/src/entities/WalletAddress/` → `packages/iam/domain/src/entities/wallet-address/`
  - Files: WalletAddress.model.ts, index.ts
  - Imports to update: ~3

### @beep/shared-domain

- [ ] `packages/shared/domain/src/entities/AuditLog/` → `packages/shared/domain/src/entities/audit-log/`
  - Files: AuditLog.model.ts, index.ts
  - Imports to update: ~3

- [ ] `packages/shared/domain/src/entities/File/` → `packages/shared/domain/src/entities/file/`
  - Files: File.model.ts, index.ts, schemas/
  - Imports to update: ~5

- [ ] `packages/shared/domain/src/entities/Folder/` → `packages/shared/domain/src/entities/folder/`
  - Files: Folder.model.ts, index.ts, schemas/
  - Imports to update: ~5

- [ ] `packages/shared/domain/src/entities/Organization/` → `packages/shared/domain/src/entities/organization/`
  - Files: Organization.model.ts, index.ts, schemas/
  - Imports to update: ~5

- [ ] `packages/shared/domain/src/entities/Session/` → `packages/shared/domain/src/entities/session/`
  - Files: Session.model.ts, index.ts
  - Imports to update: ~3

- [ ] `packages/shared/domain/src/entities/Team/` → `packages/shared/domain/src/entities/team/`
  - Files: Team.model.ts, Team.policy.ts, index.ts
  - Imports to update: ~5

- [ ] `packages/shared/domain/src/entities/UploadSession/` → `packages/shared/domain/src/entities/upload-session/`
  - Files: UploadSession.model.ts, index.ts, schemas/
  - Imports to update: ~5

- [ ] `packages/shared/domain/src/entities/User/` → `packages/shared/domain/src/entities/user/`
  - Files: User.model.ts, User.constants.ts, index.ts, schemas/
  - Imports to update: ~10

- [ ] `packages/shared/domain/src/services/EncryptionService/` → `packages/shared/domain/src/services/encryption/`
  - Files: EncryptionService.ts, index.ts
  - Imports to update: ~3

- [ ] `packages/shared/domain/src/factories/path-builder/PathBuilder/` → `packages/shared/domain/src/factories/path-builder/`
  - Note: Flatten directory structure
  - Imports to update: ~2

### @beep/documents-domain

- [ ] `packages/documents/domain/src/entities/Comment/` → `packages/documents/domain/src/entities/comment/`
  - Files: Comment.model.ts, Comment.errors.ts, Comment.rpc.ts, index.ts
  - Imports to update: ~5

- [ ] `packages/documents/domain/src/entities/Discussion/` → `packages/documents/domain/src/entities/discussion/`
  - Files: Discussion.model.ts, Discussion.rpc.ts, index.ts
  - Imports to update: ~5

- [ ] `packages/documents/domain/src/entities/Document/` → `packages/documents/domain/src/entities/document/`
  - Files: Document.model.ts, Document.errors.ts, Document.rpc.ts, index.ts
  - Imports to update: ~5

- [ ] `packages/documents/domain/src/entities/DocumentFile/` → `packages/documents/domain/src/entities/document-file/`
  - Files: DocumentFile.model.ts, index.ts
  - Imports to update: ~3

- [ ] `packages/documents/domain/src/entities/DocumentVersion/` → `packages/documents/domain/src/entities/document-version/`
  - Files: DocumentVersion.model.ts, index.ts
  - Imports to update: ~3

### @beep/comms-domain

- [ ] `packages/comms/domain/src/entities/Placeholder/` → `packages/comms/domain/src/entities/placeholder/`
  - Files: Placeholder.model.ts, index.ts
  - Imports to update: ~2

### @beep/customization-domain

- [ ] `packages/customization/domain/src/entities/UserHotkey/` → `packages/customization/domain/src/entities/user-hotkey/`
  - Files: UserHotkey.model.ts, index.ts
  - Imports to update: ~2

### @beep/shared-server

- [ ] `packages/shared/server/src/db/Db/` → `packages/shared/server/src/db/client/`
  - Files: Db.ts, index.ts
  - Imports to update: ~10
  - Note: Also rename Db.ts → client.ts

### @beep/iam-server

- [ ] `packages/iam/server/src/db/Db/` → `packages/iam/server/src/db/client/`
  - Files: internal files
  - Imports to update: ~10

### @beep/documents-server

- [ ] `packages/documents/server/src/db/Db/` → `packages/documents/server/src/db/client/`
  - Files: internal files
  - Imports to update: ~5

### @beep/comms-server

- [ ] `packages/comms/server/src/db/Db/` → `packages/comms/server/src/db/client/`
  - Files: internal files
  - Imports to update: ~2

### @beep/customization-server

- [ ] `packages/customization/server/src/db/Db/` → `packages/customization/server/src/db/client/`
  - Files: internal files
  - Imports to update: ~2

### @beep/iam-client

- [ ] `packages/iam/client/src/constants/AuthCallback/` → `packages/iam/client/src/constants/auth-callback/`
  - Files: internal files
  - Imports to update: ~2

### @beep/shared-client

- [ ] `packages/shared/client/src/atom/services/Upload/` → `packages/shared/client/src/atom/services/upload/`
  - Files: Upload.service.ts, Upload.errors.ts, index.ts
  - Imports to update: ~5

### @beep/ui (3 directories)

Non-Lexical directories requiring standardization:

- [ ] `packages/ui/ui/src/organisms/visualize-audio/AudioVisualizer/` → `packages/ui/ui/src/organisms/visualize-audio/audio-visualizer/`
  - Files: index.tsx
  - Imports to update: ~2

- [ ] `packages/ui/ui/src/organisms/visualize-audio/LiveAudioVisualizer/` → `packages/ui/ui/src/organisms/visualize-audio/live-audio-visualizer/`
  - Files: index.tsx
  - Imports to update: ~2

- [ ] `packages/ui/ui/src/molecules/SimpleBar/` → `packages/ui/ui/src/molecules/simple-bar/`
  - Files: internal files
  - Imports to update: ~3

### @beep//utils

- [ ] `packages/common/utils/src/data/array.utils/NonEmptyReadonly/` → `non-empty-readonly/`
  - Note: Flatten or rename
  - Imports to update: ~2

### @beep/shared-tables (MISSING FROM ORIGINAL)

- [ ] `packages/shared/tables/src/table/Table.ts` → `table.ts`
  - Imports to update: ~20
- [ ] `packages/shared/tables/src/org-table/OrgTable.ts` → `org-table.ts`
  - Imports to update: ~15

### @beep/db-admin (MISSING FROM ORIGINAL)

- [ ] `packages/_internal/db-admin/src/db/AdminDb.ts` → `admin-db.ts`
  - Imports to update: ~5

---

## Category B: File Renames

### @beep/iam-domain (19 files)

Model files (PascalCase → kebab-case):

- [ ] `Account/Account.model.ts` → `account/account.model.ts`
- [ ] `ApiKey/ApiKey.model.ts` → `api-key/api-key.model.ts`
- [ ] `DeviceCode/DeviceCode.model.ts` → `device-code/device-code.model.ts`
- [ ] `Invitation/Invitation.model.ts` → `invitation/invitation.model.ts`
- [ ] `Jwks/Jwks.model.ts` → `jwks/jwks.model.ts`
- [ ] `Member/Member.model.ts` → `member/member.model.ts`
- [ ] `OAuthAccessToken/OAuthAccessToken.model.ts` → `oauth-access-token/oauth-access-token.model.ts`
- [ ] `OAuthApplication/OAuthApplication.model.ts` → `oauth-application/oauth-application.model.ts`
- [ ] `OAuthConsent/OAuthConsent.model.ts` → `oauth-consent/oauth-consent.model.ts`
- [ ] `OrganizationRole/OrganizationRole.model.ts` → `organization-role/organization-role.model.ts`
- [ ] `Passkey/Passkey.model.ts` → `passkey/passkey.model.ts`
- [ ] `RateLimit/RateLimit.model.ts` → `rate-limit/rate-limit.model.ts`
- [ ] `ScimProvider/ScimProvider.model.ts` → `scim-provider/scim-provider.model.ts`
- [ ] `SsoProvider/SsoProvider.model.ts` → `sso-provider/sso-provider.model.ts`
- [ ] `Subscription/Subscription.model.ts` → `subscription/subscription.model.ts`
- [ ] `TeamMember/TeamMember.model.ts` → `team-member/team-member.model.ts`
- [ ] `TwoFactor/TwoFactor.model.ts` → `two-factor/two-factor.model.ts`
- [ ] `Verification/Verification.model.ts` → `verification/verification.model.ts`
- [ ] `WalletAddress/WalletAddress.model.ts` → `wallet-address/wallet-address.model.ts`

Schema files (PascalCase → kebab-case.schema.ts):

- [ ] `DeviceCode/schemas/DeviceCodeStatus.ts` → `device-code/schemas/device-code-status.schema.ts`
- [ ] `Invitation/schemas/InvitationStatus.ts` → `invitation/schemas/invitation-status.schema.ts`
- [ ] `Member/schemas/MemberRole.ts` → `member/schemas/member-role.schema.ts`
- [ ] `Member/schemas/MemberStatus.ts` → `member/schemas/member-status.schema.ts`
- [ ] `Passkey/schemas/AuthenticatorAttachment.ts` → `passkey/schemas/authenticator-attachment.schema.ts`

### @beep/shared-domain (20 files)

Model files:

- [ ] `AuditLog/AuditLog.model.ts` → `audit-log/audit-log.model.ts`
- [ ] `File/File.model.ts` → `file/file.model.ts`
- [ ] `Folder/Folder.model.ts` → `folder/folder.model.ts`
- [ ] `Organization/Organization.model.ts` → `organization/organization.model.ts`
- [ ] `Session/Session.model.ts` → `session/session.model.ts`
- [ ] `Team/Team.model.ts` → `team/team.model.ts`
- [ ] `Team/Team.policy.ts` → `team/team.policy.ts`
- [ ] `UploadSession/UploadSession.model.ts` → `upload-session/upload-session.model.ts`
- [ ] `User/User.model.ts` → `user/user.model.ts`
- [ ] `User/User.constants.ts` → `user/user.constants.ts`

Schema files:

- [ ] `File/schemas/UploadKey.ts` → `file/schemas/upload-key.schema.ts`
- [ ] `Folder/schemas/WithUploadedFiles.ts` → `folder/schemas/with-uploaded-files.schema.ts`
- [ ] `UploadSession/schemas/UploadSessionMetadata.ts` → `upload-session/schemas/upload-session-metadata.schema.ts`
- [ ] `User/schemas/UserRole.ts` → `user/schemas/user-role.schema.ts`

Service files:

- [ ] `services/EncryptionService/EncryptionService.ts` → `services/encryption/encryption.service.ts`

Root-level files (ADDED in final verification):

- [ ] `ManualCache.ts` → `manual-cache.ts`
- [ ] `Policy.ts` → `policy.ts`
- [ ] `Actor.ts` → `actor.ts`
- [ ] `Retry.ts` → `retry.ts`

### @beep/documents-domain (10 files - corrected)

- [ ] `Comment/Comment.model.ts` → `comment/comment.model.ts`
- [ ] `Comment/Comment.errors.ts` → `comment/comment.errors.ts`
- [ ] `Comment/Comment.rpc.ts` → `comment/comment.rpc.ts`
- [ ] `Discussion/Discussion.model.ts` → `discussion/discussion.model.ts` *(MISSING FROM ORIGINAL)*
- [ ] `Discussion/Discussion.errors.ts` → `discussion/discussion.errors.ts` *(MISSING FROM ORIGINAL)*
- [ ] `Discussion/Discussion.rpc.ts` → `discussion/discussion.rpc.ts`
- [ ] `Document/Document.model.ts` → `document/document.model.ts`
- [ ] `Document/Document.errors.ts` → `document/document.errors.ts`
- [ ] `Document/Document.rpc.ts` → `document/document.rpc.ts`
- [ ] `DocumentFile/DocumentFile.model.ts` → `document-file/document-file.model.ts`
- [ ] `DocumentVersion/DocumentVersion.model.ts` → `document-version/document-version.model.ts`

### @beep/comms-domain (1 file)

- [ ] `Placeholder/Placeholder.model.ts` → `placeholder/placeholder.model.ts`

### @beep/customization-domain (1 file)

- [ ] `UserHotkey/UserHotkey.model.ts` → `user-hotkey/user-hotkey.model.ts`

### @beep/iam-server (30 files)

Repo files (PascalCase → kebab-case):

- [ ] `db/repos/Account.repo.ts` → `db/repos/account.repo.ts`
- [ ] `db/repos/ApiKey.repo.ts` → `db/repos/api-key.repo.ts`
- [ ] `db/repos/DeviceCode.repo.ts` → `db/repos/device-code.repo.ts`
- [ ] `db/repos/Invitation.repo.ts` → `db/repos/invitation.repo.ts`
- [ ] `db/repos/Jwks.repo.ts` → `db/repos/jwks.repo.ts`
- [ ] `db/repos/Member.repo.ts` → `db/repos/member.repo.ts`
- [ ] `db/repos/OAuthAccessToken.repo.ts` → `db/repos/oauth-access-token.repo.ts`
- [ ] `db/repos/OAuthApplication.repo.ts` → `db/repos/oauth-application.repo.ts`
- [ ] `db/repos/OAuthConsent.repo.ts` → `db/repos/oauth-consent.repo.ts`
- [ ] `db/repos/Organization.repo.ts` → `db/repos/organization.repo.ts`
- [ ] `db/repos/OrganizationRole.repo.ts` → `db/repos/organization-role.repo.ts`
- [ ] `db/repos/Passkey.repo.ts` → `db/repos/passkey.repo.ts`
- [ ] `db/repos/RateLimit.repo.ts` → `db/repos/rate-limit.repo.ts`
- [ ] `db/repos/ScimProvider.repo.ts` → `db/repos/scim-provider.repo.ts`
- [ ] `db/repos/Session.repo.ts` → `db/repos/session.repo.ts`
- [ ] `db/repos/SsoProvider.repo.ts` → `db/repos/sso-provider.repo.ts`
- [ ] `db/repos/Subscription.repo.ts` → `db/repos/subscription.repo.ts`
- [ ] `db/repos/Team.repo.ts` → `db/repos/team.repo.ts`
- [ ] `db/repos/TeamMember.repo.ts` → `db/repos/team-member.repo.ts`
- [ ] `db/repos/TwoFactor.repo.ts` → `db/repos/two-factor.repo.ts`
- [ ] `db/repos/User.repo.ts` → `db/repos/user.repo.ts`
- [ ] `db/repos/Verification.repo.ts` → `db/repos/verification.repo.ts`
- [ ] `db/repos/WalletAddress.repo.ts` → `db/repos/wallet-address.repo.ts`

Adapter files (better-auth):

- [ ] `adapters/better-auth/Service.ts` → `adapters/better-auth/better-auth.service.ts`
- [ ] `adapters/better-auth/BetterAuthBridge.ts` → `adapters/better-auth/better-auth-bridge.ts`
- [ ] `adapters/better-auth/Emails.ts` → `adapters/better-auth/emails.ts`
- [ ] `adapters/better-auth/Options.ts` → `adapters/better-auth/options.ts`

### @beep/shared-server (5 files)

- [ ] `db/repos/File.repo.ts` → `db/repos/file.repo.ts`
- [ ] `db/repos/Folder.repo.ts` → `db/repos/folder.repo.ts`
- [ ] `db/repos/UploadSession.repo.ts` → `db/repos/upload-session.repo.ts`
- [ ] `db/Db/Db.ts` → `db/client/client.ts`
- [ ] `Email.ts` → `email.ts`

### @beep/documents-server (6 files)

Repo files:

- [ ] `db/repos/Comment.repo.ts` → `db/repos/comment.repo.ts`
- [ ] `db/repos/Discussion.repo.ts` → `db/repos/discussion.repo.ts`
- [ ] `db/repos/Document.repo.ts` → `db/repos/document.repo.ts`
- [ ] `db/repos/DocumentFile.repo.ts` → `db/repos/document-file.repo.ts`
- [ ] `db/repos/DocumentVersion.repo.ts` → `db/repos/document-version.repo.ts`

Handler files:

- [ ] `handlers/Comment.handlers.ts` → `handlers/comment.handlers.ts`
- [ ] `handlers/Discussion.handlers.ts` → `handlers/discussion.handlers.ts`
- [ ] `handlers/Document.handlers.ts` → `handlers/document.handlers.ts`

Service files:

- [ ] `files/ExifToolService.ts` → `files/exif-tool.service.ts`
- [ ] `files/PdfMetadataService.ts` → `files/pdf-metadata.service.ts`
- [ ] `SignedUrlService.ts` → `signed-url.service.ts`

### @beep/comms-server (1 file)

- [ ] `db/repos/Placeholder.repo.ts` → `db/repos/placeholder.repo.ts`

### @beep/customization-server (1 file)

- [ ] `db/repos/UserHotkey.repo.ts` → `db/repos/user-hotkey.repo.ts`

### @beep/iam-tables (14 files)

Table files (camelCase → kebab-case):

- [ ] `tables/apiKey.table.ts` → `tables/api-key.table.ts`
- [ ] `tables/deviceCodes.table.ts` → `tables/device-codes.table.ts`
- [ ] `tables/oauthAccessToken.table.ts` → `tables/oauth-access-token.table.ts`
- [ ] `tables/oauthApplication.table.ts` → `tables/oauth-application.table.ts`
- [ ] `tables/oauthConsent.table.ts` → `tables/oauth-consent.table.ts`
- [ ] `tables/organizationRole.table.ts` → `tables/organization-role.table.ts`
- [ ] `tables/rateLimit.table.ts` → `tables/rate-limit.table.ts`
- [ ] `tables/scimProvider.table.ts` → `tables/scim-provider.table.ts`
- [ ] `tables/ssoProvider.table.ts` → `tables/sso-provider.table.ts`
- [ ] `tables/teamMember.table.ts` → `tables/team-member.table.ts`
- [ ] `tables/twoFactor.table.ts` → `tables/two-factor.table.ts`
- [ ] `tables/walletAddress.table.ts` → `tables/wallet-address.table.ts`

### @beep/documents-tables (2 files)

- [ ] `tables/documentFile.table.ts` → `tables/document-file.table.ts`
- [ ] `tables/documentVersion.table.ts` → `tables/document-version.table.ts`

### @beep/runtime-server (12 files)

Layer files (PascalCase → kebab-case):

- [ ] `AuthContext.layer.ts` → `auth-context.layer.ts`
- [ ] `Authentication.layer.ts` → `authentication.layer.ts`
- [ ] `BetterAuthRouter.layer.ts` → `better-auth-router.layer.ts`
- [ ] `DataAccess.layer.ts` → `data-access.layer.ts`
- [ ] `Email.layer.ts` → `email.layer.ts`
- [ ] `HttpRouter.layer.ts` → `http-router.layer.ts`
- [ ] `Logger.layer.ts` → `logger.layer.ts`
- [ ] `Persistence.layer.ts` → `persistence.layer.ts`
- [ ] `Rpc.layer.ts` → `rpc.layer.ts`
- [ ] `Server.layer.ts` → `server.layer.ts`
- [ ] `Tooling.layer.ts` → `tooling.layer.ts`
- [ ] `Tracer.layer.ts` → `tracer.layer.ts`

### @beep/shared-client (8 files - updated count)

- [ ] `atom/services/Upload/Upload.service.ts` → `atom/services/upload/upload.service.ts`
- [ ] `atom/services/Upload/Upload.errors.ts` → `atom/services/upload/upload.errors.ts`
- [ ] `atom/files/services/FilePicker.service.ts` → `file-picker.service.ts`
- [ ] `atom/files/services/FileSync.service.ts` → `file-sync.service.ts`
- [ ] `atom/files/services/FileCompletionSignals.ts` → `file-completion-signals.ts`
- [ ] `atom/services/FilesApi.service.ts` → `files-api.service.ts`
- [ ] `atom/services/FilesEventStream.service.ts` → `files-event-stream.service.ts`
- [ ] `atom/services/FilesRpcClient.service.ts` → `files-rpc-client.service.ts`
- [ ] `atom/services/ImageCompressionClient.service.ts` → `image-compression-client.service.ts`
- [ ] `constructors/RpcClient.ts` → `rpc-client.ts`

### @beep//constants (MISSING FROM ORIGINAL - 10 files)

- [ ] `AllowedHeaders.ts` → `allowed-headers.ts`
- [ ] `AllowedHttpMethods.ts` → `allowed-http-methods.ts`
- [ ] `AuthProviders.ts` → `auth-providers.ts`
- [ ] `Csp.ts` → `csp.ts`
- [ ] `EnvValue.ts` → `env-value.ts`
- [ ] `LogFormat.ts` → `log-format.ts`
- [ ] `LogLevel.ts` → `log-level.ts`
- [ ] `NodeEnvValue.ts` → `node-env-value.ts`
- [ ] `Pagination.ts` → `pagination.ts`
- [ ] `SubscriptionPlanValue.ts` → `subscription-plan-value.ts`

### @beep//contract (MISSING FROM ORIGINAL - 3 files)

- [ ] `Contract.ts` → `contract.ts`
- [ ] `ContractKit.ts` → `contract-kit.ts`
- [ ] `ContractError.ts` → `contract-error.ts`

### @beep//identity (MISSING FROM ORIGINAL - 1 file)

- [ ] `Identifier.ts` → `identifier.ts`

### @beep//schema (ADDED in final verification - ~20 files)

Files integration:

- [ ] `integrations/files/FileSize.ts` → `file-size.ts`
- [ ] `integrations/files/SignedFile.ts` → `signed-file.ts`
- [ ] `integrations/files/File.ts` → `file.ts`
- [ ] `integrations/files/AspectRatio.ts` → `aspect-ratio.ts`
- [ ] `integrations/files/FileAttributes.ts` → `file-attributes.ts`
- [ ] `integrations/files/FileHash.service.ts` → `file-hash.service.ts`
- [ ] `integrations/files/metadata/Metadata.service.ts` → `metadata.service.ts`
- [ ] `integrations/files/pdf-metadata/PdfMetadata.ts` → `pdf-metadata.ts`
- [ ] `integrations/files/exif-metadata/ExifMetadata.ts` → `exif-metadata.ts`
- [ ] `integrations/files/file-types/FileTypes.ts` → `file-types.ts`
- [ ] `integrations/files/file-types/FileSignature.ts` → `file-signature.ts`
- [ ] `integrations/files/file-types/FileInfo.ts` → `file-info.ts`

Derived files:

- [ ] `derived/StructToTuple.ts` → `struct-to-tuple.ts`
- [ ] `derived/KeyOrderLookup.ts` → `key-order-lookup.ts`
- [ ] `derived/OptionArrayToOptionStruct.ts` → `option-array-to-option-struct.ts`
- [ ] `derived/OptionArrayToOptionTuple.ts` → `option-array-to-option-tuple.ts`
- [ ] `derived/TupleToStruct.ts` → `tuple-to-struct.ts`
- [ ] `derived/ArrayLookup.ts` → `array-lookup.ts`

Other files:

- [ ] `primitives/currency/Currencies.ts` → `currencies.ts`
- [ ] `core/VariantSchema.ts` → `variant-schema.ts`

### @beep/shared-env (ADDED in final verification - 2 files)

- [ ] `ServerEnv.ts` → `server-env.ts`
- [ ] `ClientEnv.ts` → `client-env.ts`

---

## Category C: Missing Index Files

All previously suspected missing index files have been verified to exist:
- ✓ `packages/documents/server/src/files/index.ts` - EXISTS
- ✓ `packages/iam/server/src/adapters/better-auth/index.ts` - EXISTS
- ✓ `packages/shared/server/src/internal/email/adapters/resend/index.ts` - EXISTS

**Post-rename action**: Verify all renamed directories have index.ts exports updated

---

## Category D: Structure Reorganization

No major restructuring needed beyond directory renames.

---

## Validation Commands

After each package:

```bash
# Type check
bun run check --filter @beep/[package]

# Build
bun run build --filter @beep/[package]

# Test
bun run test --filter @beep/[package]

# Lint fix
bun run lint:fix --filter @beep/[package]
```

Final validation:

```bash
# Full monorepo validation
bun run check
bun run build
bun run test
```

---

## Completion Log

| Package | Date | Changes | Commit |
|---------|------|---------|--------|
|         |      |         |        |

---

## Notes

### Medium-Risk Packages

2. **@beep/shared-domain**: 353 imports across codebase
3. **@beep/iam-domain**: 313 imports across codebase

### Execution Guidance

4. **Import updates**: After directory renames, grep for imports like:
   - `from "@beep/iam-domain/entities/Account"` → `from "@beep/iam-domain/entities/account"`
   - Barrel exports should handle most cases if `index.ts` is updated

5. **Build artifacts**: After running `bun run build`, the build/dist directories will regenerate with correct structure.

6. **Common packages**: The @beep/constants, @beep/contract, and @beep/identity packages have many PascalCase files. These are widely used - consider coordinating the rename in a single batch.

### Verification Notes

7. **Discovery commands used**:
   ```bash
   # Verify directory violations
   find packages -path "*/src/*" -type d | grep -E '/[A-Z][a-zA-Z]+$' | grep -v node_modules

   # Verify file violations
   find packages -name "*.ts" | grep -E '/[A-Z][a-zA-Z]+\.(model|service|repo|layer)\.ts$'

   # Check execution order
   bun run topo-sort
   ```

8. **Counts verified on 2026-01-09** (post Lexical exclusion):
   - 91 PascalCase directories in src/ (excluding build/dist/docs)
   - 47 directories requiring rename (44 non-UI + 3 UI non-Lexical)
   - 44 Lexical editor directories (EXCLUDED per decision on 2026-01-09)
   - ~150 PascalCase files requiring rename
   - Import counts: @beep/shared-domain=353, @beep/iam-domain=313
