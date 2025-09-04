---
description: Auth emails (OTP and Verification) - Phase 3 Design
---

# Overview
Design for two React email templates under `packages/email/src/components/auth-emails/`, rendered via `renderEmail()` and sent by `AuthEmailService`.

- OTP template: `send-otp.tsx` → `SendOtpEmail` + `reactSendOtpEmail` (+ alias `sendOTPEmail`)
- Verification template: `send-verification.tsx` → `SendVerificationEmail` + `reactSendVerificationEmail` (+ alias `sendVerificationEmail`)

Uses `@react-email/components` with Tailwind classes, following patterns in `reset-password.tsx` and `invitation.tsx`.

MUI docs (via mui-mcp) informed hierarchy and CTA design: Typography and Button.

# Files and exports
- `packages/email/src/components/auth-emails/send-otp.tsx`
  - Imports: `{ Html, Head, Preview, Tailwind, Body, Container, Heading, Text, Section, Hr, Link }` from `@react-email/components`.
  - Interface: `SendOtpEmailProps`.
  - Component: `SendOtpEmail`.
  - Wrapper: `reactSendOtpEmail(props)` returns `<SendOtpEmail {...props} />`.
  - Alias: `export { reactSendOtpEmail as sendOTPEmail }`.

- `packages/email/src/components/auth-emails/send-verification.tsx`
  - Imports: `{ Html, Head, Preview, Tailwind, Body, Container, Heading, Text, Section, Hr, Link, Button }` from `@react-email/components`.
  - Interface: `SendVerificationEmailProps`.
  - Component: `SendVerificationEmail`.
  - Wrapper: `reactSendVerificationEmail(props)` returns `<SendVerificationEmail {...props} />`.
  - Alias: `export { reactSendVerificationEmail as sendVerificationEmail }`.

- `packages/email/src/components/auth-emails/index.ts`
  - Add: `export * from "./send-otp";`
  - Add: `export * from "./send-verification";`

- `packages/email/src/index.ts` already re-exports `./components`.

# Props
- `SendOtpEmailProps`
  - `otp: string` (required) — one-time code to display prominently
  - `username?: string`
  - `expiresInMinutes?: number`
  - `appName?: string` — default fallback: `"Better Auth"`
  - `supportUrl?: string`

- `SendVerificationEmailProps`
  - `verificationLink: string` (required)
  - `username?: string`
  - `expiresInMinutes?: number`
  - `appName?: string` — default fallback: `"Better Auth"`

# Layout and markup
Common structure (both files):
- `<Html>`
  - `<Head />`
  - `<Preview>` short summary
  - `<Tailwind>`
    - `<Body className="bg-white my-auto mx-auto font-sans px-2">`
      - `<Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">`
        - `<Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">` … `</Heading>`
        - Content sections (`<Text>` size 14px, `<Section>`, CTA where applicable)
        - `<Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />`
        - Footer/help text in 12px gray

## OTP template specifics
- Preview: `Your verification code`
- Heading: `Your ${appName ?? 'Better Auth'} verification code`
- Greeting line: `Hello{, username}` if provided, else `Hello`
- OTP block:
  - `<Section className="text-center mt-[24px] mb-[24px]">`
    - `<Text className="text-black text-[20px] tracking-[0.3em] font-semibold bg-[#f5f5f5] rounded px-4 py-3 inline-block">{otp}</Text>`
- Instruction: `Use this code to continue signing in.`
- Optional expiry: `This code expires in ${expiresInMinutes} minutes.`
- Security note: `If you didn’t request this, you can ignore this email.`
- Optional support link: `Need help?` linking to `supportUrl`.

## Verification template specifics
- Preview: `Verify your email`
- Heading: `Verify your email${appName ? ` for ${appName}` : ''}` (keep concise)
- Greeting line: optional username
- Explanation: brief single paragraph about verifying to continue
- CTA:
  - `<Section className="text-center mt-[32px] mb-[32px]">`
    - `<Button className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3" href={verificationLink}>Verify email</Button>`
- Fallback link paragraph with `<Link href={verificationLink}>` rendered visibly
- Optional expiry line

# Subjects and preview
- OTP subject (service): `Your ${appName ?? 'Better Auth'} verification code`
- Verification subject (service): `Verify your email${appName ? ` for ${appName}` : ''}`
- Preview texts as above; keep <= 90 chars.

# Rendering and sending
- `renderEmail()` returns HTML; `AuthEmailService` must pass `html` (not `react`) to Resend:
  - `const html = yield* renderEmail(reactSendOtpEmail(props))`
  - `yield* send({ from, to, subject, html })`

# Accessibility and content
- Typography hierarchy: 24px heading; 14px body; 12px footer text.
- High-contrast OTP block; ensure legibility and spacing (tracking) for manual entry.
- Button copy: “Verify email” (explicit action). Provide text link fallback.
- Links must have descriptive text.
- No external images or fonts.

# Error handling
- Template components are pure and do not throw; rendering failures are surfaced by `renderEmail()` as `EmailTemplateRenderError`.

# Testing plan
- Email package unit tests:
  - Render with required props and assert presence of key strings (otp, verificationLink), preview text, headings, security note.
  - Render without optional props and assert no `undefined`/`null` leaks.
- Adapter integration tests:
  - Mock `ResendService.send` and assert `html` (not `react`) used, correct `to`, and subjects.

# Index and re-exports
- Update `packages/email/src/components/auth-emails/index.ts` to export `send-otp` and `send-verification` modules (which themselves export canonical and alias names).

# Open decisions carried into implementation
- Include both canonical `react*` exports and alias `sendOTPEmail` / `sendVerificationEmail`.
- Templates default `appName` to "Better Auth" if not provided; `AuthEmailService` should ideally pass explicit appName.
- Omit expiry line when `expiresInMinutes` is not provided.
