---
description: Auth emails (OTP and Verification) - Phase 1 Instructions
---

# Overview
Create two React email templates under `packages/email/src/components/auth-emails/` for Better Auth flows, to be rendered via `renderEmail()` and sent by `AuthEmailService` (`packages/adapters/better-auth/src/AuthEmail.service.ts`).

Templates to add:
- sendOTPEmail – used by `sendOTP()` flow
- sendVerificationEmail – used by `sendVerification()` flow

References (existing patterns):
- `reactResetPasswordEmail` in `reset-password.tsx`
- `reactInvitationEmail` in `invitation.tsx`
- Renderer: `packages/email/src/renderEmail.ts`

MUI docs consulted (for content hierarchy and accessibility guidance): Typography, Button.

# Goals
- Provide accessible, brand-consistent email templates for OTP and Email Verification.
- Match existing export and folder patterns used by current auth email templates.
- Ensure `AuthEmailService` can render and send these templates with minimal change.

# Out of scope
- Actual sending logic (handled by `AuthEmailService` and `@beep/resend`).
- Full i18n/l10n; initial copy is English-only.
- Theming beyond Tailwind utility classes already used in existing templates.

# User stories
- As a user requesting an OTP, I receive an email containing a clearly visible one-time code and instructions, so I can complete sign-in securely.
- As a newly registered user (or when email verification is needed), I receive an email with a clear CTA to verify my email and a fallback link.
- As a developer, I can import strongly-typed React email templates and render them to HTML using `renderEmail()` without extra wiring.

# Acceptance criteria
- Common
  - Uses `@react-email/components` and Tailwind classes (consistent with `invitation.tsx` and `reset-password.tsx`).
  - Includes `<Preview>` text for inbox previews.
  - Accessible copy and hierarchy (clear heading, 14px body), informed by MUI Typography/Button content guidelines.
  - No remote fonts; minimal or no images; all links have clear purpose text.
  - Exports follow the established pattern: component + wrapper function that returns the element to pass to `renderEmail()`.
  - Files live in `packages/email/src/components/auth-emails/` and are exported via that folder's `index.ts`.

- sendOTPEmail
  - Props include: `otp: string` (required), `username?: string`, `expiresInMinutes?: number`, `appName?: string`, `supportUrl?: string`.
  - Subject recommendation: `Your {appName ?? "Better Auth"} verification code`.
  - Body shows the OTP prominently (large, monospaced or high-contrast block), explains expiry if provided, and includes security note + support link if provided.
  - Contains a short note: “If you didn’t request this, you can ignore this email.”
  - Includes copy-only fallback (no reliance on button links).

- sendVerificationEmail
  - Props include: `verificationLink: string` (required), `username?: string`, `expiresInMinutes?: number`, `appName?: string`.
  - Subject recommendation: `Verify your email` (optionally append `for {appName}`).
  - Body has a primary CTA button linking to `verificationLink`, plus a copyable plain URL fallback.
  - Includes a brief explanation of why the email was sent and what happens next.

# API shape (proposed)
- `send-otp.tsx`
  - `export interface SendOtpEmailProps { otp: string; username?: string; expiresInMinutes?: number; appName?: string; supportUrl?: string }`
  - `export const SendOtpEmail: React.FC<SendOtpEmailProps>`
  - `export function reactSendOtpEmail(props: SendOtpEmailProps): React.ReactElement`

- `send-verification.tsx`
  - `export interface SendVerificationEmailProps { verificationLink: string; username?: string; expiresInMinutes?: number; appName?: string }`
  - `export const SendVerificationEmail: React.FC<SendVerificationEmailProps>`
  - `export function reactSendVerificationEmail(props: SendVerificationEmailProps): React.ReactElement`

# Integration notes for `AuthEmailService`
- `sendOTP` should call `renderEmail(reactSendOtpEmail({ ... }))` and use a subject like “Your verification code”.
- `sendVerification` should call `renderEmail(reactSendVerificationEmail({ verificationLink, ... }))` with subject “Verify your email”.
- `from` continues to use `serverEnv.email.from`.
- `to` will be the intended recipient’s email based on the Better Auth flow parameters.

# File and export plan
- Add/implement:
  - `packages/email/src/components/auth-emails/send-otp.tsx`
  - `packages/email/src/components/auth-emails/send-verification.tsx`
- Update exports:
  - `packages/email/src/components/auth-emails/index.ts` to export both new modules.
  - `packages/email/src/index.ts` already re-exports `./components`.

# Accessibility and content guidelines (from MUI docs consulted)
- Maintain clear hierarchy: heading (~24px), body (14px), sufficient contrast for OTP code and CTA.
- Button copy should be explicit (e.g., “Verify email”).
- Provide link fallback under the CTA for copy/paste.

# Constraints
- TypeScript strict mode compatible; no implicit any.
- No cross-slice imports; keep within the `@beep/email` package.
- Keep templates pure (no side effects); `renderEmail` handles HTML generation.

# Open decisions
- Naming:
  - Wrapper functions: `reactSendOtpEmail` / `reactSendVerificationEmail` (matches existing `react*` pattern) vs. user-specified `sendOTPEmail` naming. Recommend the `react*` prefix for consistency; alias exports can be added if desired.
- Default `appName` source: explicit prop vs. pulling from env in service. Recommend service supplies it.
- Default expiry copy when `expiresInMinutes` is missing: omit vs. generic note (“This code may expire soon”).
- Branding (logo/brand colors): keep minimalist for now; can be added later.
