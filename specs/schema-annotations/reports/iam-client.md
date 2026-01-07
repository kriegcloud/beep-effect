# Schema Annotations Audit: @beep/iam-client

## Summary
- Total Schemas Found: 22
- Annotated: 18
- Missing Annotations: 4

## Annotationless Schemas Checklist

- [ ] `src/adapters/better-auth/errors.ts:3` - `BetterAuthError` - Data.TaggedError
- [ ] `src/clients/user/user.contracts.ts:57` - `ChangeEmailPayload` - S.Class
- [ ] `src/clients/user/user.contracts.ts:72` - `ChangePasswordPayload` - S.Class
- [ ] `src/clients/verify/verify.contracts.ts:116` - `VerifyEmailUser` - S.Struct

## Details

### Missing Annotations

#### `BetterAuthError` (Data.TaggedError)
**File:** `src/adapters/better-auth/errors.ts:3`
```typescript
export class BetterAuthError extends Data.TaggedError("BetterAuthError")<{
  readonly message: string;
}> {
```
**Issue:** Uses `Data.TaggedError` without any schema annotations. Should migrate to `S.TaggedError` with `$I` annotations pattern.

#### `ChangeEmailPayload` (S.Class)
**File:** `src/clients/user/user.contracts.ts:57`
```typescript
export class ChangeEmailPayload extends S.Class<ChangeEmailPayload>($I`ChangeEmailPayload`)({
  newEmail: User.Model.update.fields.email,
  callbackURL: S.optional(BS.URLString),
}) {}
```
**Issue:** Has the `$I` template identifier but no annotations in the second argument to provide description/title.

#### `ChangePasswordPayload` (S.Class)
**File:** `src/clients/user/user.contracts.ts:72`
```typescript
export class ChangePasswordPayload extends S.Class<ChangePasswordPayload>($I`ChangePasswordPayload`)({
  password: BS.Password,
  passwordConfirm: BS.Password,
  currentPassword: BS.Password,
  revokeOtherSessions: BS.BoolWithDefault(false),
}) {}
```
**Issue:** Has the `$I` template identifier but no annotations in the second argument to provide description/title.

#### `VerifyEmailUser` (S.Struct)
**File:** `src/clients/verify/verify.contracts.ts:116`
```typescript
export const VerifyEmailUser = S.Struct({
  id: SharedEntities.User.Model.select.fields.id,
  email: SharedEntities.User.Model.select.fields.email,
  name: SharedEntities.User.Model.select.fields.name,
  image: S.NullOr(BS.URLString),
  emailVerified: SharedEntities.User.Model.select.fields.emailVerified,
  createdAt: BS.DateTimeUtcFromAllAcceptable,
  updatedAt: BS.DateTimeUtcFromAllAcceptable,
});
```
**Issue:** Named exported struct without `.annotations()` call.

## Annotated Schemas (Reference)

| Schema | File | Type | Status |
|--------|------|------|--------|
| `IamErrorMetadata` | `src/errors.ts:9` | S.Class | Annotated |
| `IamError` | `src/errors.ts:19` | S.TaggedError | Annotated |
| `SignInEmailPayload` | `src/clients/sign-in/sign-in.contracts.ts:19` | S.Class | Annotated |
| `SignInSocialPayload` | `src/clients/sign-in/sign-in.contracts.ts:57` | S.Class | Annotated |
| `SignInUsernamePayload` | `src/clients/sign-in/sign-in.contracts.ts:85` | S.Class | Annotated |
| `SignInPhoneNumberPayload` | `src/clients/sign-in/sign-in.contracts.ts:120` | S.Class | Annotated |
| `AnonymousSignInSuccess` | `src/clients/sign-in/sign-in.contracts.ts:173` | S.Class | Annotated |
| `SignUpEmailPayload` | `src/clients/sign-up/sign-up.contracts.ts:13` | S.Struct | Annotated |
| `GetSessionSuccess` | `src/clients/session/session.contracts.ts:15` | S.Class | Annotated |
| `ListSessionsSuccess` | `src/clients/session/session.contracts.ts:43` | S.NonEmptyArray ext | Annotated |
| `RevokeSessionPayload` | `src/clients/session/session.contracts.ts:68` | S.Class | Annotated |
| `ResetPasswordPayload` | `src/clients/recover/recover.contracts.ts:19` | S.Struct | Annotated |
| `RequestResetPasswordPayload` | `src/clients/recover/recover.contracts.ts:51` | S.Class | Annotated |
| `VerifyPhonePayload` | `src/clients/verify/verify.contracts.ts:14` | S.Struct | Annotated |
| `SendEmailVerificationPayload` | `src/clients/verify/verify.contracts.ts:39` | S.Class | Annotated |
| `SendEmailVerificationSuccess` | `src/clients/verify/verify.contracts.ts:61` | S.Class | Annotated |
| `VerifyEmailPayload` | `src/clients/verify/verify.contracts.ts:93` | S.Class | Annotated |
| `VerifyEmailSuccess` | `src/clients/verify/verify.contracts.ts:126` | S.Class | Annotated |

## Excluded Items

The following were excluded from this audit:

- **Commented code**: `src/clients/passkey/passkey.contracts.ts` - Entire file is commented out
- **Inline form schemas**: `src/atom/sign-up/sign-up.forms.ts:20` - Used inline for form validation only
- **Type-only exports**: Various namespace declarations
- **Re-exports**: Various index.ts files
