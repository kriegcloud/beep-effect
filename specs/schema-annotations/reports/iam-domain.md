# Schema Annotations Audit: @beep/iam-domain

## Summary
- Total Schemas Found: 135
- Annotated: 134
- Missing Annotations: 1

## Analysis

This package has excellent annotation coverage. All schemas follow the identity-based annotation pattern using `$I.annotations()` or the `$I\`TemplateString\`` syntax.

### Schema Categories

| Category | Count | Annotated | Notes |
|----------|-------|-----------|-------|
| M.Class (Entity Models) | 18 | 18 | All use `$I\`ModelName\`` pattern |
| S.Class (API Payload/Success) | ~110 | ~110 | All use `$I.annotations()` |
| S.TaggedError | 1 | 1 | `IamAuthError` uses identity annotations |
| StringLiteralKit | 6 | 5 | 1 missing annotations |

### Entity Models (All Annotated)

All entity models in `src/entities/*/` properly use the identity annotation pattern:

- `Account/Account.model.ts` - `$I\`AccountModel\``
- `ApiKey/ApiKey.model.ts` - `$I\`ApikeyModel\``
- `DeviceCode/DeviceCode.model.ts` - `$I\`DeviceCodeModel\``
- `Invitation/Invitation.model.ts` - `$I\`InvitationModel\``
- `Jwks/Jwks.model.ts` - `$I\`JwksModel\``
- `Member/Member.model.ts` - `$I\`MemberModel\``
- `OAuthAccessToken/OAuthAccessToken.model.ts` - `$I\`OAuthAccessTokenModel\``
- `OAuthApplication/OAuthApplication.model.ts` - `$I\`OAuthApplicationModel\``
- `OAuthConsent/OAuthConsent.model.ts` - `$I\`OAuthConsentModel\``
- `OrganizationRole/OrganizationRole.model.ts` - `$I\`OrganizationRoleModel\``
- `Passkey/Passkey.model.ts` - `$I\`PasskeyModel\``
- `RateLimit/RateLimit.model.ts` - `$I\`RateLimitModel\``
- `ScimProvider/ScimProvider.model.ts` - `$I\`ScimProviderModel\``
- `SsoProvider/SsoProvider.model.ts` - `$I\`SsoProviderModel\``
- `Subscription/Subscription.model.ts` - `$I\`SubscriptionModel\``
- `TeamMember/TeamMember.model.ts` - `$I\`TeamMemberModel\``
- `TwoFactor/TwoFactor.model.ts` - `$I\`TwoFactorModel\``
- `Verification/Verification.model.ts` - `$I\`VerificationModel\``
- `WalletAddress/WalletAddress.model.ts` - `$I\`WalletAddressModel\``

### Annotated StringLiteralKit Schemas

- `InvitationStatus` - Has full annotations (schemaId, identifier, title, description)
- `MemberRole` - Has full annotations
- `MemberStatus` - Has full annotations
- `AuthenticatorAttachment` - Has annotations via `$IamDomainId.annotations()`
- `AccountSettingsTabSearchParamValue` - Has full annotations

## Annotationless Schemas Checklist

- [ ] `src/entities/DeviceCode/schemas/DeviceCodeStatus.ts:4` - `DeviceCodeStatus` - StringLiteralKit

## Recommendations

1. **DeviceCodeStatus** needs annotations added. The pattern used by sibling schemas like `InvitationStatus` should be followed:

```typescript
export class DeviceCodeStatus extends BS.StringLiteralKit("pending", "approved", "denied").annotations({
  schemaId: Symbol.for("@beep/iam-domain/DeviceCode/schemas/DeviceCodeStatus"),
  identifier: "DeviceCodeStatus",
  title: "Device Code Status",
  description: "Status of a device authorization code (pending, approved, or denied)",
}) {}
```

## Notes

- The package uses `@beep/identity/packages` for generating identity-based annotations (`$IamDomainId`)
- The identity system creates consistent schema identifiers across the codebase
- API endpoint schemas (Payload/Success classes) consistently use `$I.annotations()` with title/description
- Error classes extend `S.TaggedError` with identity-based naming

---

*Audit completed: 2026-01-06*
