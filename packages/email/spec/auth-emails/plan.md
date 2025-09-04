---
description: Auth emails (OTP and Verification) - Phase 4 Implementation Plan
---

# Tasks

- __[T1] Implement templates__
  - Implement `packages/email/src/components/auth-emails/send-otp.tsx`
    - Export: `SendOtpEmail`, `reactSendOtpEmail`, alias `sendOTPEmail`
  - Implement `packages/email/src/components/auth-emails/send-verification.tsx`
    - Export: `SendVerificationEmail`, `reactSendVerificationEmail`, alias `sendVerificationEmail`

- __[T2] Update exports__
  - Update `packages/email/src/components/auth-emails/index.ts` to export the two new modules

- __[T3] Integrate in `AuthEmailService`__
  - Update `packages/adapters/better-auth/src/AuthEmail.service.ts`
    - Use `renderEmail(reactSendOtpEmail(...))` / `renderEmail(reactSendVerificationEmail(...))`
    - Pass the returned string to Resend as `html`
    - Set proper `to` address from params, not placeholders
    - Subjects per design: OTP "Your {appName ?? 'Better Auth'} verification code"; Verification "Verify your email{appName ? ` for ${appName}` : ''}"

- __[T4] Tests__
  - Email package unit tests (`packages/email/test/`)
    - OTP template: renders with required props; includes otp string; preview and security note present; no `undefined`
    - Verification template: CTA href equals `verificationLink`; preview present; fallback link visible; no `undefined`
  - Adapter integration tests
    - Mock `ResendService.send`, assert `html` used and correct `to`/subject

- __[T5] Lint, typecheck, build__
  - `direnv exec . pnpm lint`
  - `direnv exec . pnpm check`
  - `direnv exec . pnpm -w build` (or package-level builds)

# Acceptance
- Templates match design and requirements, exports available from `@beep/email`
- `AuthEmailService` uses `html` and correct subjects
- Tests pass
- Lint and type checks clean
