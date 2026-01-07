# Schema Annotations Audit: @beep/iam-server

## Summary
- Total Schemas Found: 5
- Annotated: 5
- Missing Annotations: 0

## Findings

All Effect Schemas in this package are properly annotated.

### Annotated Schemas (All Compliant)

| File | Line | Schema Name | Type | Status |
|------|------|-------------|------|--------|
| `src/adapters/better-auth/Emails.ts` | 13 | `SendVerificationEmailPayload` | S.Class | Annotated |
| `src/adapters/better-auth/Emails.ts` | 25 | `SendChangeEmailVerificationPayload` | S.Class | Annotated |
| `src/adapters/better-auth/Emails.ts` | 37 | `SendOTPEmailPayload` | S.Class | Annotated |
| `src/adapters/better-auth/Emails.ts` | 47 | `SendResetPasswordEmailPayload` | S.Class | Annotated |
| `src/adapters/better-auth/Emails.ts` | 60 | `InvitationEmailPayload` | S.Class | Annotated |

## Annotationless Schemas Checklist

(None - all schemas are properly annotated)

## Notes

- All S.Class declarations use the `$I` pattern for identifier generation and include `$I.annotations()` calls
- The package contains 179 TypeScript files in total
- Other patterns found (not schemas):
  - `Effect.Service` declarations (24 total) - service definitions, not schemas
  - `Context.Tag` declarations (2 total) - context tags, not schemas
  - `Data.TaggedError` (1 total) - error class from effect/Data, not effect/Schema
