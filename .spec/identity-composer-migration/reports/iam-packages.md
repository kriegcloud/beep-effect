# Identity Composer Migration Report: IAM Packages

## Composer Status
All IAM composers exist in packages.ts: **YES**
- `$IamDomainId` - iam-domain
- `$IamServerId` - iam-server
- `$IamClientId` - iam-client
- `$IamTablesId` - iam-tables
- `$IamUiId` - iam-ui

## Files Requiring Migration

### packages/iam/server/src/db/repos/User.repo.ts
- **Line 8**: `Effect.Service` - Current: `"@beep/iam-server/db/repos/UserRepo"` → Should be: `$I`UserRepo``

### packages/iam/client/src/errors.ts
- **Line 6**: `S.Class` - Current: `"@beep/iam-client/errors/IamErrorMetadata"` → Should be: `$I`IamErrorMetadata``
- **Line 16**: `S.TaggedError` - Current: `"@beep/iam-client/errors/IamError"` → Should be: `$I`IamError``

### packages/iam/client/src/clients/user/user.contracts.ts
- **Line 54**: `S.Class` - Current: `"@beep/iam-client/clients/user/ChangeEmailPayload"` → Should be: `$I`ChangeEmailPayload``
- **Line 71**: `S.Class` - Current: `"@beep/iam-client/clients/user/ChangePasswordPayload"` → Should be: `$I`ChangePasswordPayload``

### packages/iam/domain/src/api/common/errors.ts
- **Line 33**: `S.TaggedError` - Current: `"IamAuthError"` → Should be: `$I`IamAuthError``

### packages/iam/domain/src/entities/Account/Account.model.ts
- **Line 15**: `M.Class` - Current: `"AccountModel"` → Should be: `$I`AccountModel``

### packages/iam/domain/src/entities/ApiKey/ApiKey.model.ts
- **Line 14**: `M.Class` - Current: `"ApikeyModel"` → Should be: `$I`ApikeyModel``

### packages/iam/domain/src/entities/DeviceCode/DeviceCode.model.ts
- **Line ~15**: `M.Class` - Current: `"DeviceCodeModel"` → Should be: `$I`DeviceCodeModel``

### packages/iam/domain/src/entities/Invitation/Invitation.model.ts
- **Line ~15**: `M.Class` - Current: `"InvitationModel"` → Should be: `$I`InvitationModel``

### packages/iam/domain/src/entities/Jwks/Jwks.model.ts
- **Line ~15**: `M.Class` - Current: `"JwksModel"` → Should be: `$I`JwksModel``

### packages/iam/domain/src/entities/Member/Member.model.ts
- **Line ~15**: `M.Class` - Current: `"MemberModel"` → Should be: `$I`MemberModel``

### packages/iam/domain/src/entities/OAuthAccessToken/OAuthAccessToken.model.ts
- **Line ~15**: `M.Class` - Current: `"OAuthAccessTokenModel"` → Should be: `$I`OAuthAccessTokenModel``

### packages/iam/domain/src/entities/OAuthApplication/OAuthApplication.model.ts
- **Line ~15**: `M.Class` - Current: `"OAuthApplicationModel"` → Should be: `$I`OAuthApplicationModel``

### packages/iam/domain/src/entities/OAuthConsent/OAuthConsent.model.ts
- **Line ~15**: `M.Class` - Current: `"OAuthConsentModel"` → Should be: `$I`OAuthConsentModel``

### packages/iam/domain/src/entities/OrganizationRole/OrganizationRole.model.ts
- **Line ~15**: `M.Class` - Current: `"OrganizationRoleModel"` → Should be: `$I`OrganizationRoleModel``

### packages/iam/domain/src/entities/Passkey/Passkey.model.ts
- **Line ~15**: `M.Class` - Current: `"PasskeyModel"` → Should be: `$I`PasskeyModel``

### packages/iam/domain/src/entities/RateLimit/RateLimit.model.ts
- **Line ~15**: `M.Class` - Current: `"RateLimitModel"` → Should be: `$I`RateLimitModel``

### packages/iam/domain/src/entities/ScimProvider/ScimProvider.model.ts
- **Line ~15**: `M.Class` - Current: `"ScimProviderModel"` → Should be: `$I`ScimProviderModel``

### packages/iam/domain/src/entities/SsoProvider/SsoProvider.model.ts
- **Line ~15**: `M.Class` - Current: `"SsoProviderModel"` → Should be: `$I`SsoProviderModel``

### packages/iam/domain/src/entities/Subscription/Subscription.model.ts
- **Line ~15**: `M.Class` - Current: `"SubscriptionModel"` → Should be: `$I`SubscriptionModel``

### packages/iam/domain/src/entities/TeamMember/TeamMember.model.ts
- **Line ~15**: `M.Class` - Current: `"TeamMemberModel"` → Should be: `$I`TeamMemberModel``

### packages/iam/domain/src/entities/TwoFactor/TwoFactor.model.ts
- **Line ~15**: `M.Class` - Current: `"TwoFactorModel"` → Should be: `$I`TwoFactorModel``

### packages/iam/domain/src/entities/Verification/Verification.model.ts
- **Line ~15**: `M.Class` - Current: `"VerificationModel"` → Should be: `$I`VerificationModel``

### packages/iam/domain/src/entities/WalletAddress/WalletAddress.model.ts
- **Line ~15**: `M.Class` - Current: `"WalletAddressModel"` → Should be: `$I`WalletAddressModel``

## Summary
- **Total Files**: 24
- **Effect.Service violations**: 1
- **S.Class violations**: 2
- **S.TaggedError violations**: 2
- **M.Class violations**: 19
