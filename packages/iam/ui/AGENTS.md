# AGENTS Guide — `@beep/iam-ui`

## Purpose & Fit
- Provides the client-side IAM entry points (sign-in, sign-up, recovery, verification, invitation) consumed by `apps/web` and any app-shell embedding IAM flows.
- Bridges Effect-based RPC contracts from `@beep/iam-sdk` to React components that speak `@beep/ui` form primitives, `@beep/runtime-client` runners, and shared-domain navigation (`paths`).
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
- `apps/web/src/app/auth/sign-in/page.tsx:2` — Next.js route renders `<SignInView />` directly.
- `apps/web/src/app/auth/sign-up/page.tsx:2` — imports `SignUpView` for registration flow.
- `apps/web/src/app/auth/request-reset-password/page.tsx:2` — pulls `RequestResetPasswordView` for forgot-password.
- `apps/web/src/app/auth/reset-password/page.tsx:2` — consumes `ResetPasswordView` guarded by reset token.
- `packages/iam/ui/src/recover/reset-password.form.tsx:22` — demonstrates `useSearchParams` token gate with `Effect.Option` utilities.
- `packages/iam/ui/src/sign-up/sign-up.view.tsx:66` — shows `Effect.gen` orchestration around `iam.signUp.email`.

## Tooling & Docs Shortcuts
- `effect_docs__get_effect_doc` payload for generator ergonomics: `{"documentId":5844}`
- `effect_docs__get_effect_doc` payload for sequencing effects: `{"documentId":5994}`
- `effect_docs__get_effect_doc` payload for `effect/Array.map`: `{"documentId":4847}`
- `context7__get-library-docs` payload for TanStack Form defaults: `{"context7CompatibleLibraryID":"/tanstack/form","tokens":1200,"topic":"react formOptions"}`
- `effect_docs__effect_docs_search` payload when tracing combinators: `{"query":"Effect flatMap"}`

## Authoring Guardrails
- **Effect pipelines only:** Always compose RPC invocations with `F.pipe`, `Effect.flatMap`, or `Effect.gen`. Avoid introducing `async/await` in new logic; existing `async` wrappers remain for compatibility but should not expand.
- **No native collection helpers:** Respect repo rule-set. If you need to merge `sx` overrides, pipe through `@beep/ui` helpers or lift into `A.prepend/append`. Document tech debt where legacy `Array.isArray` persists before touching it.
- **Runtime linking:** Every networked action should be routed through `makeRunClientPromise(runtime, "<port>")`. Never call `iam.*` effects directly without the runtime runner; this preserves Layer injection and Better Auth session context.
- **Schema-first forms:** Forms must lean on Effect schemas from `@beep/iam-sdk/clients` with `formOptionsWithSubmit`. Do not hand-roll validation or default values—extend schemas upstream when fields change.
- **ReCAPTCHA hand-off:** Any submission that feeds Better Auth should inject `captchaResponse` prior to calling `handleSubmit`. Maintain the `executeRecaptcha` presence guard and surface telemetry rather than silently continuing.
- **Path hygiene:** Build navigation using `paths` from `@beep/shared-domain`. Hardcoded strings introduce drift across apps and server redirects.
- **Reset token redirect review:** `ResetPasswordForm` currently issues `router.push(paths.auth.signIn)` inside the `O.match` `onSome` branch (`packages/iam/ui/src/recover/reset-password.form.tsx:26`). When adjusting this flow, ensure absence moves users to sign-in while presence keeps the form active.
- **Siblings alignment:** Mirror theming/spacing decisions with `packages/ui/AGENTS.md` and `packages/ui-core/AGENTS.md`. Use `@beep/ui` components (icons, form groups) instead of reintroducing raw MUI primitives unless the higher-level primitive is missing.
- **Two-factor stub:** Keep `two-factor/index.ts` empty until requirements land. Document any provisional exports here rather than adding silent placeholders.

## Quick Recipes
```tsx
import { iam } from "@beep/iam-sdk";
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
import { clientEnv } from "@beep/core-env/client";
import { SocialIconButton, SocialProviderIcons } from "@beep/iam-ui/_components";
import { makeRunClientPromise, useRuntime } from "@beep/runtime-client";
import { iam } from "@beep/iam-sdk";
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
import { iam } from "@beep/iam-sdk";
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
- `bun run --filter @beep/iam-ui lint` — Biome static analysis (ensures Effect import discipline, no uncontrolled globals).
- `bun run --filter @beep/iam-ui check` — TypeScript program across src + tests.
- `bun run --filter @beep/iam-ui test` — Bun test suite (currently placeholder; add Vitest/Bun cases alongside features).
- When touching Babel build targets, run `bun run --filter @beep/iam-ui build` to regenerate CJS/ESM outputs before publishing.

## Contributor Checklist
- [ ] Updated or added exports in `src/index.ts` and feature `index.ts` files so consumers receive new components.
- [ ] Wrapped every RPC call with `makeRunClientPromise` and Effect combinators; no direct `iam.*` invocation escapes runtime wiring.
- [ ] Sourced schemas and enums from `@beep/iam-sdk/clients` and `@beep/shared-domain`; no duplicated literal unions.
- [ ] Ensured UI atoms lean on `@beep/ui` (forms, icons, routing). If a new primitive is required, coordinate with `packages/ui`.
- [ ] Recorded new docs references or guardrails in this guide when adding flows or changing defaults.
- [ ] Added or amended tests in `packages/iam/ui/test` mirroring the feature (snapshot, interaction, or effect contract).
- [ ] Documented any intentional divergence from Effect string/array rules and opened follow-up tasks for remediation.
