---
path: packages/iam/ui
summary: React IAM components - sign-in, sign-up views with Effect RPC and ReCAPTCHA integration
tags: [iam, ui, react, nextjs, effect, authentication, forms]
---

# @beep/iam-ui

Client-side IAM entry points for authentication flows (sign-in, sign-up) consumed by Next.js apps. Bridges Effect-based RPC contracts from `@beep/iam-client` to React components using `@beep/ui` form primitives and `@beep/runtime-client` runners. Handles ReCAPTCHA, navigation, and session management.

## Architecture

```
|-------------------|     |-------------------|     |-------------------|
|   apps/web        | --> |  @beep/iam-ui     | --> | @beep/iam-client  |
|   (routes)        |     |  (views, forms)   |     | (RPC contracts)   |
|-------------------|     |-------------------|     |-------------------|
                                  |
                                  v
                          |-------------------|
                          | @beep/runtime-    |
                          | client            |
                          | (Effect runners)  |
                          |-------------------|
                                  |
                                  v
                          |-------------------|
                          | @beep/ui          |
                          | (form primitives) |
                          |-------------------|
```

## Core Modules

| Module | Purpose |
|--------|---------|
| `src/index.ts` | Re-exports feature bundles |
| `IamProvider.tsx` | React context for IAM runtime |
| `sign-in/SignInView.tsx` | Sign-in page composition |
| `sign-in/SignInEmailForm.tsx` | Email/password form with validation |
| `sign-up/SignUpView.tsx` | Sign-up page with verification splash |
| `sign-up/SignUpEmailForm.tsx` | Registration form with ReCAPTCHA |
| `_components/` | Shared atoms (FormHead, FormDivider, SocialIconButton) |
| `_common/RecaptchaV3Atom.tsx` | ReCAPTCHA v3 integration |

## Usage Patterns

### Basic Sign-In Form
```typescript
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import { iam } from "@beep/iam-client";
import { SignInEmailForm } from "@beep/iam-ui/sign-in";
import { makeRunClientPromise, useRuntime } from "@beep/runtime-client";

export const MinimalEmailSignIn = () => {
  const runtime = useRuntime();
  const runEmail = makeRunClientPromise(runtime, "iam.signIn.email");
  return (
    <SignInEmailForm
      onSubmit={(valueEffect) =>
        runEmail(F.pipe(valueEffect, Effect.flatMap(iam.signIn.email)))
      }
    />
  );
};
```

### Full Auth Page with Provider
```typescript
import { SignUpView } from "@beep/iam-ui/sign-up";
import { IamProvider } from "@beep/iam-ui";

export const AuthPage = () => (
  <IamProvider>
    <SignUpView />
  </IamProvider>
);
```

### Custom Social Buttons
```typescript
import * as A from "effect/Array";
import * as F from "effect/Function";
import { iam } from "@beep/iam-client";
import { SocialIconButton, SocialProviderIcons } from "@beep/iam-ui/_components";
import { makeRunClientPromise, useRuntime } from "@beep/runtime-client";

export const CustomSocialButtons = () => {
  const runtime = useRuntime();
  const runSocial = makeRunClientPromise(runtime, "iam.signIn.social");
  return F.pipe(
    ["google", "github"],
    A.map((provider) => (
      <SocialIconButton
        key={provider}
        name={provider}
        onClick={() => runSocial(iam.signIn.social({ provider }))}
      >
        {SocialProviderIcons[provider]}
      </SocialIconButton>
    ))
  );
};
```

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| `makeRunClientPromise` for all RPC | Preserves Layer injection and session context |
| Schema-first forms | Validation from `@beep/iam-client` schemas, not hand-rolled |
| ReCAPTCHA on auth forms | Required for Better Auth submission security |
| `paths` for navigation | Type-safe routing, no hardcoded strings |
| `"use client"` directive | Required for hooks (useState, useForm, useRuntime) |

## Dependencies

**Internal**: `@beep/iam-client` (contracts), `@beep/ui` (form primitives), `@beep/ui-core` (theming), `@beep/runtime-client` (Effect runners), `@beep/shared-domain` (paths), `@beep/shared-client`, `@beep/shared-env`, `@beep/constants`

**External**: `react`, `next`, `effect`, `@mui/material`, `@tanstack/react-form`, `framer-motion`, `better-auth`, `@wojtekmaj/react-recaptcha-v3`, `@effect-atom/atom-react`

## Related

- **AGENTS.md** - Detailed contributor guidance with security patterns and gotchas
- **@beep/iam-client** - RPC contracts powering these components
- **@beep/ui** - Base component library
- **@beep/runtime-client** - Effect runtime integration for React
