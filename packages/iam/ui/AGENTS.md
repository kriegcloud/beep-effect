# AGENTS Guide — `@beep/iam-ui`

## Purpose & Fit
- Provides the client-side IAM entry points (sign-in, sign-up, recovery, verification, invitation) consumed by `apps/web` and any app-shell embedding IAM flows.
- Bridges Effect-based RPC contracts from `@beep/iam-client` to React components that speak `@beep/ui` form primitives, `@beep/runtime-client` runners, and shared-domain navigation (`paths`).
- Owns UX glue (headings, dividers, CTA links, recaptcha wiring) so route-level pages stay declarative and do not replicate validation or RPC orchestration.

## Surface Map
- `src/index.ts` — re-exports feature bundles (`sign-in`, `sign-up`, `recover`, `verify`, `organization`).
- `sign-in/` — `SignInView`, `SignInEmailForm`, `SignInSocial`, `SignInPasskey`; wraps `iam.signIn.*` contracts with runtime runners and social button grid.
- `sign-up/` — `SignUpView`, `SignUpEmailForm`, `SignUpSocial`; manages verification notice splash + recaptcha gate, delegates to `iam.signUp.email`.
- `recover/` — `RequestResetPasswordView`, `ResetPasswordView` plus corresponding forms; executes `iam.recover.*` flows and handles token presence (current redirect behaviour requires review, see Guardrails).
- `verify/` — `VerifyPhoneView`, `VerifyPhoneForm`, `EmailVerificationSent`; composes `iam.verify.phone`.
- `organization/accept-invitation` — placeholder `AcceptInvitationView` and production-ready `InvitationError` card for invalid invite paths.
- `_components/` — shared UI atoms (`FormHead`, `FormDivider`, `FormReturnLink`, `SocialIconButton`, `Terms`, `Privacy`, etc.) specialised for IAM flows.
- `two-factor/` — empty stub reserved for upcoming MFA entrypoint (documented as TODO).
- `test/Dummy.test.ts` — placeholder Bun test (signals need for real coverage).

## Usage Snapshots
- Next.js auth routes render views like `<SignInView />`, `<SignUpView />`, and `<RequestResetPasswordView />` directly.
- Password reset routes consume `ResetPasswordView` guarded by reset token.
- Reset password forms demonstrate `useSearchParams` token gate with `Effect.Option` utilities.
- Sign-up views show `Effect.gen` orchestration around sign-up contracts.

## Authoring Guardrails
- **Effect pipelines only:** ALWAYS compose RPC invocations with `F.pipe`, `Effect.flatMap`, or `Effect.gen`. NEVER introduce `async/await` in new logic; existing `async` wrappers remain for compatibility but MUST NOT expand.
- **No native collection helpers:** Respect repo rule-set. If you need to merge `sx` overrides, pipe through `@beep/ui` helpers or lift into `A.prepend/append`. Document tech debt where legacy `Array.isArray` persists before touching it.
- **Runtime linking:** Every networked action MUST be routed through `makeRunClientPromise(runtime, "<port>")`. NEVER call `iam.*` effects directly without the runtime runner; this preserves Layer injection and Better Auth session context.
- **Schema-first forms:** Forms MUST lean on Effect schemas from `@beep/iam-client/clients` with `formOptionsWithSubmit`. NEVER hand-roll validation or default values—extend schemas upstream when fields change.
- **ReCAPTCHA hand-off:** Any submission that feeds Better Auth should inject `captchaResponse` prior to calling `handleSubmit`. Maintain the `executeRecaptcha` presence guard and surface telemetry rather than silently continuing.
- **Path hygiene:** Build navigation using `paths` from `@beep/shared-domain`. Hardcoded strings introduce drift across apps and server redirects.
- **Reset token redirect review:** `ResetPasswordForm` uses router navigation inside conditional branches. When adjusting this flow, ensure absence moves users to sign-in while presence keeps the form active.
- **Siblings alignment:** Mirror theming/spacing decisions with UI package documentation. Use `@beep/ui` components (icons, form groups) instead of reintroducing raw MUI primitives unless the higher-level primitive is missing.
- **Two-factor stub:** Keep `two-factor/index.ts` empty until requirements land. Document any provisional exports here rather than adding silent placeholders.

## Quick Recipes
```tsx
import { iam } from "@beep/iam-client";
import { SignInEmailForm } from "@beep/iam-ui/sign-in";
import { makeRunClientPromise, useRuntime } from "@beep/runtime-client";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";

export const MinimalEmailSignIn = () => {
  const runtime = useRuntime();
  const runEmail = makeRunClientPromise(runtime, "iam.signIn.email");
  return (
    <SignInEmailForm
      onSubmit={(valueEffect) =>
        runEmail(
          F.pipe(
            valueEffect,
            Effect.flatMap(iam.signIn.email)
          )
        )
      }
    />
  );
};
```

```tsx
import { clientEnv } from "@beep/shared-env/ClientEnv";
import { SocialIconButton, SocialProviderIcons } from "@beep/iam-ui/_components";
import { makeRunClientPromise, useRuntime } from "@beep/runtime-client";
import { iam } from "@beep/iam-client";
import { AuthProviderNameValue } from "@beep/constants";
import Box from "@mui/material/Box";
import * as A from "effect/Array";
import * as F from "effect/Function";

export const CustomSocialButtons = () => {
  const runtime = useRuntime();
  const runSocial = makeRunClientPromise(runtime, "iam.signIn.social");
  const providers = F.pipe(
    clientEnv.authProviderNames,
    AuthProviderNameValue.filter,
    A.filter((provider) => provider !== "twitter")
  );
  return (
    <Box sx={{ gap: 1.5, display: "flex", flexWrap: "wrap" }}>
      {F.pipe(
        providers,
        A.map((provider) => {
          const Icon = SocialProviderIcons[provider];
          return (
            <SocialIconButton
              key={provider}
              name={provider}
              onClick={() => runSocial(iam.signIn.social({ provider }))}
            >
              <Icon />
            </SocialIconButton>
          );
        })
      )}
    </Box>
  );
};
```

```tsx
import { VerifyPhoneForm } from "@beep/iam-ui/verify";
import { iam } from "@beep/iam-client";
import { makeRunClientPromise, useRuntime } from "@beep/runtime-client";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";

export const VerifyPhoneCard = () => {
  const runtime = useRuntime();
  const runVerifyPhone = makeRunClientPromise(runtime, "iam.verify.phone");
  return (
    <VerifyPhoneForm
      onSubmit={(valueEffect) =>
        runVerifyPhone(
          F.pipe(valueEffect, Effect.flatMap(iam.verify.phone))
        )
      }
    />
  );
};
```

## Verifications
- `bun run lint --filter=@beep/iam-ui` — Biome static analysis (ensures Effect import discipline, no uncontrolled globals).
- `bun run check --filter=@beep/iam-ui` — TypeScript program across src + tests.
- `bun run test --filter=@beep/iam-ui` — Bun test suite (currently placeholder; add Vitest/Bun cases alongside features).
- When touching Babel build targets, run `bun run build --filter=@beep/iam-ui` to regenerate CJS/ESM outputs before publishing.

## Security

### XSS Prevention
- NEVER use `dangerouslySetInnerHTML` or equivalent in IAM UI components.
- ALWAYS sanitize any user-provided content before rendering—use React's built-in escaping.
- NEVER interpolate user input directly into URLs without validation via `paths` utilities.
- ALWAYS use `@beep/ui` form components which handle input sanitization.

### CSRF Protection
- ALWAYS include ReCAPTCHA validation on authentication forms (sign-in, sign-up, password reset).
- NEVER submit auth forms without the `captchaResponse` token when ReCAPTCHA is configured.
- ALWAYS route submissions through `makeRunClientPromise` which maintains CSRF token context.

### Credential Handling in Forms
- NEVER log form values containing passwords or tokens—use Effect telemetry with redaction.
- NEVER store credentials in component state beyond the immediate form submission lifecycle.
- ALWAYS clear password fields after submission (success or failure).
- NEVER display password values in error messages or validation feedback.

### Session Security
- ALWAYS rely on `client.$store.notify("$sessionSignal")` for session state changes—NEVER cache session locally.
- ALWAYS redirect to sign-in on session expiry; NEVER show stale authenticated UI.
- NEVER expose session tokens in URLs, localStorage, or component props.

### Callback URL Security
- ALWAYS sanitize callback URLs using `AuthCallback.sanitizePath` before redirects.
- NEVER allow arbitrary redirect URLs; constrain to known `privatePrefix` paths.
- ALWAYS validate callback URLs server-side in addition to client-side checks.

### Password Requirements UI
- ALWAYS display password strength requirements to users before submission.
- ALWAYS validate password requirements client-side before server round-trip.
- NEVER reveal whether an email exists during password reset (use generic success messages).

## Gotchas

### React 19 / Next.js 16 App Router
- The `"use client"` directive MUST appear at the file top BEFORE any imports. Placing it after imports causes silent server-side rendering failures.
- `useSearchParams()` suspends in Next.js 16 App Router. Wrap components using it with `<Suspense>` or use `useSearchParams` only in client components wrapped appropriately.
- Server Actions cannot be passed as props to Client Components directly. Use callback patterns or route handlers for auth flows.

### TanStack Query Invalidation
- Auth state changes (sign-in, sign-out) MUST invalidate relevant queries using `queryClient.invalidateQueries()`. Forgetting this causes stale UI showing logged-out state after login.
- NEVER rely on automatic refetch for auth state. Use `client.$store.notify("$sessionSignal")` and explicit query invalidation.
- Form submission success should invalidate user-related queries before navigation to prevent flash of stale data.

### Server vs Client Component Boundaries
- IAM form components require `"use client"` because they use hooks (`useState`, `useForm`, `useRuntime`).
- NEVER import `@beep/iam-client` contracts in Server Components. They are designed for client-side Effect runtime execution.
- Better Auth session checks in Server Components use different APIs than client-side. Do not mix patterns.

### Effect Integration in React
- `makeRunClientPromise` returns a Promise wrapper. Inside `onSubmit` handlers, the returned Promise is compatible with React's async event handling.
- Effect pipelines are lazy. NEVER expect side effects from constructing an Effect — they only run when passed to a runner.
- Form validation with Effect schemas happens synchronously via `@tanstack/react-form`. Do not wrap schema validation in Effect unless the validation itself is async.
- ReCAPTCHA `executeRecaptcha` is async and returns a Promise. Integrate it before the Effect pipeline, not inside.

### Common IAM UI Pitfalls
- Password fields auto-fill behavior varies by browser. Test with saved credentials enabled.
- Social sign-in redirects lose React state. Store any pre-auth state (like return URL) in sessionStorage or URL params via `AuthCallback`.
- Reset password token expiry is checked server-side. Always handle `TokenExpiredError` gracefully with user-friendly messaging.

## Contributor Checklist
- [ ] Updated or added exports in `src/index.ts` and feature `index.ts` files so consumers receive new components.
- [ ] Wrapped every RPC call with `makeRunClientPromise` and Effect combinators; no direct `iam.*` invocation escapes runtime wiring.
- [ ] Sourced schemas and enums from `@beep/iam-client/clients` and `@beep/shared-domain`; no duplicated literal unions.
- [ ] Ensured UI atoms lean on `@beep/ui` (forms, icons, routing). If a new primitive is required, coordinate with `packages/ui`.
- [ ] Recorded new docs references or guardrails in this guide when adding flows or changing defaults.
- [ ] Added or amended tests in `packages/iam/ui/test` mirroring the feature (snapshot, interaction, or effect contract).
- [ ] Documented any intentional divergence from Effect string/array rules and opened follow-up tasks for remediation.
