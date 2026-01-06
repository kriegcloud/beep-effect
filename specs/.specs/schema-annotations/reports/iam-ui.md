# Schema Annotations Audit: @beep/iam-ui

## Summary
- Total Schemas Found: 0
- Annotated: 0
- Missing Annotations: 0

## Notes

The `@beep/iam-ui` package is a React UI component library containing:
- Authentication forms (sign-in, sign-up, password recovery)
- Verification flows (email, phone, 2FA)
- Passkey management UI
- Organization invitation handling
- Social provider integration
- reCAPTCHA integration

### Excluded from Audit

1. **`CaptchaError` in `src/_common/use-captcha.ts:25`**
   - Uses `Data.TaggedError` from `effect/Data`, NOT `S.TaggedError` from `effect/Schema`
   - `Data.TaggedError` creates runtime error classes but is NOT an Effect Schema
   - Does not participate in schema serialization/validation
   - Therefore NOT subject to schema annotation requirements

2. **Schema Imports from External Packages**
   - `VerifyPhonePayload` from `@beep/iam-client/clients` - re-export
   - `paths` from `@beep/shared-domain` - re-export
   - `AuthProviderNameValue` from `@beep/constants` - re-export
   - These schemas are defined and annotated in their source packages

## Annotationless Schemas Checklist

(No schemas requiring annotations found in this package)
