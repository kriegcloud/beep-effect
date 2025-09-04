---
description: Auth emails (OTP and Verification) - Phase 2 Requirements
---

# Scope
Define the requirements for two email templates implemented in `@beep/email` under `packages/email/src/components/auth-emails/` and integrated by `AuthEmailService` in `packages/adapters/better-auth/src/AuthEmail.service.ts`.

Templates:
- send-otp.tsx → SendOtpEmail + wrapper(s)
- send-verification.tsx → SendVerificationEmail + wrapper(s)

MUI documentation consulted (via mui-mcp): Typography and Button, used to guide content hierarchy, CTAs, and accessibility.

# Functional requirements
- __FR1: Template rendering__
  - Use `@react-email/components` with Tailwind utility classes, consistent with `reset-password.tsx` and `invitation.tsx`.
  - Each template must export a wrapper function that returns a React element suitable for `renderEmail()`.
- __FR2: Exports__
  - Canonical export names: `reactSendOtpEmail`, `reactSendVerificationEmail` (align with existing `reactResetPasswordEmail`).
  - Provide alias exports to match requested names exactly: `sendOTPEmail` and `sendVerificationEmail` (re-exporting the canonical wrappers).
  - Ensure both new modules are re-exported from `packages/email/src/components/auth-emails/index.ts` and transitively from `packages/email/src/index.ts`.
- __FR3: OTP email content__
  - Prominent OTP code (high contrast, easily copyable; consider monospaced style if feasible with Tailwind utilities supported by `@react-email`).
  - Context: greeting line that optionally includes `username`.
  - Instructions: indicate code usage and optional expiry.
  - Security note and optional `supportUrl` link.
  - Include `<Preview>` text summarizing purpose (e.g., "Your verification code").
- __FR4: Verification email content__
  - Clear heading; explanatory body.
  - Primary CTA button linking to `verificationLink` and a copyable text fallback link below.
  - Optional expiry copy.
  - Include `<Preview>` text summarizing purpose (e.g., "Verify your email").
- __FR5: Accessibility & copy__
  - Clear heading (~24px), body copy 14px, sufficient color contrast.
  - Button text is explicit (e.g., "Verify email").
  - Links have descriptive text; do not rely solely on images.
- __FR6: Integration with `AuthEmailService`__
  - Service must call `renderEmail(wrapper(props))` and pass the resulting HTML to Resend via the `html` field (NOT `react`) to avoid double rendering.
  - Subjects:
    - OTP: `Your {appName ?? "Better Auth"} verification code`.
    - Verification: `Verify your email{appName ? ` for ${appName}` : ""}`.
  - Service must populate `to` with the user's email; no empty placeholders.

# Non-functional requirements
- __NFR1: TypeScript strict mode__
  - Exported props interfaces must be fully typed with optional vs. required properties correctly marked.
- __NFR2: No external images or web fonts__
  - Avoid external asset dependencies to maximize deliverability and privacy.
- __NFR3: Minimal inline styling__
  - Prefer Tailwind utility classes available to `@react-email/components`.
- __NFR4: Deliverability aware__
  - Avoid spammy language; keep HTML simple and semantic.

# Public API (templates)
- File: `send-otp.tsx`
  - Interface:
    - `export interface SendOtpEmailProps {`
    - `  otp: string;`
    - `  username?: string;`
    - `  expiresInMinutes?: number;`
    - `  appName?: string;`
    - `  supportUrl?: string;`
    - `}`
  - Exports:
    - `export const SendOtpEmail: React.FC<SendOtpEmailProps>`
    - `export function reactSendOtpEmail(props: SendOtpEmailProps): React.ReactElement`
    - Alias: `export { reactSendOtpEmail as sendOTPEmail }`

- File: `send-verification.tsx`
  - Interface:
    - `export interface SendVerificationEmailProps {`
    - `  verificationLink: string;`
    - `  username?: string;`
    - `  expiresInMinutes?: number;`
    - `  appName?: string;`
    - `}`
  - Exports:
    - `export const SendVerificationEmail: React.FC<SendVerificationEmailProps>`
    - `export function reactSendVerificationEmail(props: SendVerificationEmailProps): React.ReactElement`
    - Alias: `export { reactSendVerificationEmail as sendVerificationEmail }`

# Integration requirements (AuthEmailService)
- __IR1: OTP send function__
  - Signature (service-internal): accepts `{ user: { email: string; username?: string }, otp: string, expiresInMinutes?: number, appName?: string, supportUrl?: string }`.
  - Implementation: `const html = yield* renderEmail(reactSendOtpEmail({ ... }))` then `send({ from, to: user.email, subject, html })`.
- __IR2: Verification send function__
  - Signature (service-internal): accepts `{ user: { email: string; username?: string }, verificationLink: string, expiresInMinutes?: number, appName?: string }`.
  - Implementation: `const html = yield* renderEmail(reactSendVerificationEmail({ ... }))` then `send({ from, to: user.email, subject, html })`.
- __IR3: Error handling__
  - Continue using `renderEmail` to capture and tag render errors with `EmailTemplateRenderError` and log via Effect tap.

# Validation rules
- `otp` must be a non-empty string (service may apply additional validation: digits-only, length 4–8 as policy allows).
- `verificationLink` must be an absolute URL (service-level validation recommended).
- Optional values (`expiresInMinutes`, `appName`, `supportUrl`, `username`) may be omitted; templates must render gracefully without them.

# Content specifics
- OTP email body must include:
  - Greeting: "Hello{, username}" with fallback to "Hello".
  - Prominent OTP (e.g., large font, letter-spaced block) and a sentence: "Use this code to continue signing in.".
  - Optional expiry line when `expiresInMinutes` provided.
  - Security note: "If you didn't request this, you can ignore this email.".
  - Optional support link if `supportUrl` provided.
- Verification email body must include:
  - Greeting: optional username.
  - Explanation: "Please verify your email to continue".
  - Primary CTA button to `verificationLink`.
  - Fallback: copyable URL printed as text link.
  - Optional expiry line when `expiresInMinutes` provided.

# Testing and acceptance
- __Unit tests (email package)__
  - Render each template via `renderEmail(wrapper(props))` and assert HTML contains key markers:
    - OTP template: exact `otp` string present; preview text present; security note present.
    - Verification template: `verificationLink` present in href; preview text and CTA copy present.
  - Ensure no `undefined`/`null` are serialized when optional props omitted.
- __Service integration tests (adapter package)__
  - Mock `ResendService.send` and assert it is called with `html` (not `react`), correct `to`, and subject lines.

# Deliverables (Phase 5 reference)
- Implement `send-otp.tsx` and `send-verification.tsx` per API above.
- Update `packages/email/src/components/auth-emails/index.ts` to export both modules and their alias exports.
- Update `AuthEmailService` to use `html` field and the new wrappers.
- Add unit tests in `packages/email/test/` and integration tests in adapter package as appropriate.

# Open decisions (resolution for implementation)
- __Export naming__: implement both canonical `react*` and alias `sendOTPEmail` / `sendVerificationEmail` to satisfy consistency and the requested names.
- __appName default__: service should supply appName; templates may default to "Better Auth" if not provided.
- __Expiry copy when absent__: omit line entirely if not provided.
- __Branding__: keep minimalist for now; future enhancement may add logo and theme colors.
