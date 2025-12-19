# @beep/iam-ui

React UI components for IAM authentication flows, bridging Effect-based RPC contracts to client-side user experiences.

## Purpose

Provides the client-side IAM entry points (sign-in, sign-up, password recovery, verification, organization invitations) consumed by `apps/web` and any application embedding IAM flows. This package bridges Effect-based RPC contracts from `@beep/iam-client` to React components using `@beep/ui` form primitives, `@beep/runtime-client` runners, and `@beep/shared-domain` navigation paths.

Owns the UX orchestration layer (headings, dividers, CTA links, reCAPTCHA wiring, social provider grids) so that route-level pages remain declarative and avoid duplicating validation or RPC orchestration logic.

## Architecture Fit

- **Vertical Slice UI Layer**: Implements the presentation layer for the IAM slice
- **Effect-First**: All RPC interactions use `Effect.gen`, `Effect.fn`, and Effect combinators
- **Runtime Integration**: Leverages `@beep/runtime-client` for ManagedRuntime execution
- **Better Auth Bridge**: Wraps Better Auth authentication contracts with React components
- **Path Alias**: Import as `@beep/iam-ui`. Feature exports available via subpaths like `@beep/iam-ui/sign-in`

## Installation

This package is internal to the beep-effect monorepo. Add it as a dependency in your package.json:

```json
{
  "dependencies": {
    "@beep/iam-ui": "workspace:*"
  }
}
```

Then run `bun install` to link the workspace dependency.

## Key Exports

Main exports from the package root (`@beep/iam-ui`):

| Export                     | Description                                                    |
|----------------------------|----------------------------------------------------------------|
| `IamProvider`              | Top-level provider wrapping reCAPTCHA v3 context for IAM flows |
| `SignInView`               | Complete sign-in UI with email, social, and passkey options    |
| `SignUpView`               | Sign-up UI with email and social registration options          |
| `RequestResetPasswordView` | Password reset request form                                    |
| `ResetPasswordView`        | Password reset form with token validation                      |
| `VerifyPhoneView`          | Phone verification UI                                          |
| `EmailVerificationSent`    | Email verification sent confirmation component                 |
| `AcceptInvitationView`     | Organization invitation acceptance UI                          |
| `PasskeysView`             | Passkey management UI (list, add, remove)                      |

Subpath exports (import via `@beep/iam-ui/<subpath>`):

| Subpath                        | Primary Exports                                   |
|--------------------------------|---------------------------------------------------|
| `/sign-in`                     | `SignInView`                                      |
| `/sign-up`                     | `SignUpView`                                      |
| `/recover`                     | `RequestResetPasswordView`, `ResetPasswordView`   |
| `/verify`                      | `VerifyPhoneView`, `EmailVerificationSent`        |
| `/passkey`                     | `PasskeysView`                                    |
| `/organization/accept-invitation` | `AcceptInvitationView`                         |

Advanced subpath exports (for granular component access):

| Subpath Pattern                | Description                                                      |
|--------------------------------|------------------------------------------------------------------|
| `/<feature>/<component-file>`  | Direct file imports (e.g., `/sign-in/sign-in-email.form`)        |
| `/_components/*`               | Shared IAM UI atoms (`FormHead`, `FormDivider`, `SocialIconButton`, etc.) |
| `/_common/*`                   | Shared utilities (`useCaptcha`, `RecaptchaV3Provider`, etc.)     |

## Module Structure

```
src/
├── IamProvider.tsx           # Top-level reCAPTCHA context provider
├── sign-in/                  # Sign-in flow components
│   ├── sign-in.view.tsx      # Main sign-in view
│   ├── sign-in-email.form.tsx # Email/password form
│   ├── sign-in-social.tsx    # Social provider buttons
│   └── sign-in-passkey.tsx   # Passkey authentication
├── sign-up/                  # Sign-up flow components
│   ├── sign-up.view.tsx      # Main sign-up view
│   ├── sign-up-email.form.tsx # Email registration form
│   └── sign-up-social.tsx    # Social provider registration
├── recover/                  # Password recovery components
│   ├── request-reset-password.view.tsx
│   ├── request-reset-password.form.tsx
│   ├── reset-password.view.tsx
│   └── reset-password.form.tsx
├── verify/                   # Verification components
│   ├── verify-phone.view.tsx
│   ├── verify-phone.form.tsx
│   └── components/
│       └── email-verification-sent.tsx
├── organization/             # Organization invitation flows
│   └── accept-invitation/
│       ├── accept-invitation.view.tsx
│       └── accept-invitation.error.tsx
├── passkey/                  # Passkey management components
│   ├── passkeys.view.tsx
│   ├── passkeys.list.tsx
│   ├── passkey.item.tsx
│   ├── passkey.form.tsx
│   ├── passkeys.empty.tsx
│   ├── passkeys.skeleton.tsx
│   └── passkeys.fallback.tsx
├── _components/              # Shared UI atoms for IAM flows
│   ├── form-head.tsx
│   ├── form-divider.tsx
│   ├── form-return-link.tsx
│   ├── form-resend-code.tsx
│   ├── form-socials.tsx
│   ├── social-icon-button.tsx
│   ├── social-provider-icons.tsx
│   ├── terms.tsx
│   └── privacy.tsx
├── _common/                  # Common utilities
│   ├── use-captcha.ts        # reCAPTCHA hook with Effect integration
│   ├── use-success-transition.ts
│   ├── recaptcha-v3.tsx      # reCAPTCHA v3 provider component
│   └── recaptcha-badge.tsx
├── shared/                   # Shared atoms and utilities
│   └── shared.atoms.tsx
├── two-factor/               # Two-factor authentication (stub for future)
└── types/                    # Extended theme types
    └── extended-theme-types.ts
```

## Usage

### Provider Setup

Wrap your IAM routes with the `IamProvider` to enable reCAPTCHA v3:

```typescript
import { IamProvider } from "@beep/iam-ui";

export default function AuthLayout({ children }: React.PropsWithChildren) {
  return (
    <IamProvider>
      {children}
    </IamProvider>
  );
}
```

### Sign-In Flow

Complete sign-in view with email, social, and passkey options:

```typescript
// Import from package root
import { SignInView } from "@beep/iam-ui";

// Or from subpath for direct access to all sign-in components
import { SignInView } from "@beep/iam-ui/sign-in";

export default function SignInPage() {
  return <SignInView />;
}
```

Custom email sign-in form with explicit runtime wiring:

```typescript
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

### Social Provider Authentication

Custom social provider buttons with filtered providers:

```typescript
import { clientEnv } from "@beep/shared-server/ClientEnv";
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

### Sign-Up Flow

Complete sign-up view with email and social registration:

```typescript
// Import from package root
import { SignUpView } from "@beep/iam-ui";

export default function SignUpPage() {
  return <SignUpView />;
}
```

### Password Recovery

Request password reset:

```typescript
// Import from package root
import { RequestResetPasswordView } from "@beep/iam-ui";

export default function RequestResetPage() {
  return <RequestResetPasswordView />;
}
```

Reset password with token validation:

```typescript
// Import from package root
import { ResetPasswordView } from "@beep/iam-ui";

export default function ResetPasswordPage() {
  return <ResetPasswordView />;
}
```

### Phone Verification

Phone verification form with Effect integration:

```typescript
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

### Organization Invitations

Accept organization invitation:

```typescript
// Import from package root
import { AcceptInvitationView } from "@beep/iam-ui";

// Or from subpath
import { AcceptInvitationView } from "@beep/iam-ui/organization/accept-invitation";

export default function AcceptInvitationPage() {
  return <AcceptInvitationView />;
}
```

### Passkey Management

Passkey management view:

```typescript
// Import from package root
import { PasskeysView } from "@beep/iam-ui";

export default function PasskeysPage() {
  return <PasskeysView />;
}
```

### reCAPTCHA Integration

Use the `useCaptcha` hook for manual reCAPTCHA execution:

```typescript
import { useCaptcha } from "@beep/iam-ui/_common";
import { paths } from "@beep/shared-domain";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";

export const CustomFormWithCaptcha = () => {
  const { executeCaptchaEffect, getCaptchaHeaders } = useCaptcha();

  const handleSubmit = async () => {
    // Execute reCAPTCHA and get headers
    const headers = await getCaptchaHeaders(paths.auth.signUp);

    // Use headers in your RPC call
    // ...
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
};
```

## What Belongs Here

- **Authentication UI flows**: Sign-in, sign-up, password recovery, verification, invitations
- **IAM form components**: Email forms, social provider buttons, passkey authentication
- **RPC orchestration**: Wiring `@beep/iam-client` contracts to React components via `@beep/runtime-client`
- **UX composition**: Headings, dividers, links, icons specialized for IAM flows
- **reCAPTCHA integration**: reCAPTCHA v3 provider and execution hooks with Effect integration
- **Navigation helpers**: CTA links using `@beep/shared-domain` paths
- **Social provider UI**: Icon buttons and provider grids for OAuth flows

## What Must NOT Go Here

- **Business logic**: Belongs in `@beep/iam-domain` or `@beep/iam-server`
- **RPC contracts**: Defined in `@beep/iam-client`, not here
- **Database access**: Belongs in `@beep/iam-server` repository layers
- **Better Auth configuration**: Lives in `@beep/iam-server`
- **Generic UI components**: Should go in `@beep/ui` or `@beep/shared-ui`
- **Server-side logic**: Belongs in `apps/server` or `@beep/iam-server`

## Dependencies

| Package                         | Purpose                                              |
|---------------------------------|------------------------------------------------------|
| `@beep/iam-client`                 | IAM RPC contracts and Better Auth client utilities   |
| `@beep/iam-domain`              | IAM entity models and value objects                  |
| `@beep/iam-server`               | Better Auth configuration and infrastructure         |
| `@beep/runtime-client`          | Browser ManagedRuntime for Effect execution          |
| `@beep/shared-domain`           | Shared paths and navigation utilities                |
| `@beep/shared-client`              | Shared SDK contracts                                 |
| `@beep/shared-ui`               | Shared UI components                                 |
| `@beep/ui`                      | Core component library                               |
| `@beep/ui-core`                 | Design tokens and MUI theme configuration            |
| `@beep/schema`                  | Effect Schema utilities for validation               |
| `@beep/constants`               | Schema-backed enums and constants                    |
| `@beep/utils`                   | Pure runtime helpers                                 |
| `@beep/invariant`               | Assertion contracts                                  |
| `@beep/errors`                  | Error logging and telemetry                          |
| `effect`                        | Core Effect runtime                                  |
| `better-auth`                   | Authentication library                               |
| `@tanstack/react-form`          | Form state management                                |
| `@mui/material`                 | Material-UI components                               |
| `@wojtekmaj/react-recaptcha-v3` | reCAPTCHA v3 React integration                       |
| `framer-motion`                 | Animation library                                    |
| `next`                          | Next.js framework (routing, navigation)              |
| `react`                         | React library                                        |

## Development

```bash
# Type check
bun run --filter @beep/iam-ui check

# Lint
bun run --filter @beep/iam-ui lint

# Lint and auto-fix
bun run --filter @beep/iam-ui lint:fix

# Check for circular dependencies
bun run --filter @beep/iam-ui lint:circular

# Build (generates ESM, CJS, and annotated outputs)
bun run --filter @beep/iam-ui build

# Run tests
bun run --filter @beep/iam-ui test

# Test with coverage
bun run --filter @beep/iam-ui coverage

# Watch mode for development
bun run --filter @beep/iam-ui dev
```

## Guidelines for Adding Components

### Effect-First Development

Always compose RPC invocations with `F.pipe`, `Effect.flatMap`, or `Effect.gen`. Avoid introducing `async/await` in new logic; existing async wrappers remain for compatibility but should not expand:

```typescript
// Good - Effect pipeline
const handleSubmit = (valueEffect: Effect.Effect<SignInInput>) =>
  runEmail(
    F.pipe(
      valueEffect,
      Effect.flatMap(iam.signIn.email),
      Effect.tap(() => Effect.log("Sign-in successful"))
    )
  );

// Avoid - async/await (legacy compatibility only)
const handleSubmit = async (value: SignInInput) => {
  await auth.signIn.email(value);
};
```

### Runtime Linking

Every networked action should be routed through `makeRunClientPromise(runtime, "<port>")`. Never call `iam.*` effects directly without the runtime runner; this preserves Layer injection and Better Auth session context:

```typescript
// Good - runtime wiring
const runtime = useRuntime();
const runEmail = makeRunClientPromise(runtime, "iam.signIn.email");
runEmail(F.pipe(valueEffect, Effect.flatMap(iam.signIn.email)));

// Bad - direct effect call (no runtime context)
iam.signIn.email(value);
```

### Schema-First Forms

Forms must lean on Effect schemas from `@beep/iam-client/clients` with `formOptionsWithSubmit`. Do not hand-roll validation or default values; extend schemas upstream when fields change:

```typescript
import { signInEmailSchema } from "@beep/iam-client/clients/sign-in";
import { formOptionsWithSubmit } from "@beep/ui/forms";

const form = useForm(formOptionsWithSubmit(signInEmailSchema, onSubmit));
```

### reCAPTCHA Integration

Any submission that feeds Better Auth should inject `captchaResponse` prior to calling `handleSubmit`. Maintain the `executeRecaptcha` presence guard and surface telemetry rather than silently continuing:

```typescript
const { executeCaptcha } = useCaptcha();

const handleSubmit = async (value: SignInInput) => {
  const captchaResponse = await executeCaptcha(paths.auth.signIn);
  return runSignIn(
    iam.signIn.email({ ...value, captchaResponse })
  );
};
```

### Path Hygiene

Build navigation using `paths` from `@beep/shared-domain`. Hardcoded strings introduce drift across apps and server redirects:

```typescript
// Good - shared paths
import { paths } from "@beep/shared-domain";
<Link href={paths.auth.signUp}>Sign up</Link>

// Bad - hardcoded strings
<Link href="/auth/sign-up">Sign up</Link>
```

### Effect Collection Utilities

Respect monorepo rule-set. Use Effect Array utilities (`A.*`) instead of native array methods:

```typescript
import * as A from "effect/Array";
import * as F from "effect/Function";

// Good - Effect Array utilities
F.pipe(
  providers,
  A.filter((p) => p !== "twitter"),
  A.map((p) => <SocialButton key={p} provider={p} />)
);

// Bad - native array methods
providers
  .filter((p) => p !== "twitter")
  .map((p) => <SocialButton key={p} provider={p} />);
```

### Component Alignment

Mirror theming and spacing decisions with `@beep/ui` package documentation. Use `@beep/ui` components (icons, form groups) instead of reintroducing raw MUI primitives unless the higher-level primitive is missing:

```typescript
// Good - use @beep/ui components
import { FormGroup } from "@beep/ui/forms";
import { Icon } from "@beep/ui/icons";

// Avoid - raw MUI unless necessary
import FormGroup from "@mui/material/FormGroup";
```

## Testing

- Unit tests colocated in `test/` directory
- Use Vitest/Bun for testing framework
- Test form validation, reCAPTCHA integration, and Effect pipelines
- Mock runtime and RPC calls for isolated component testing

Currently, the package has placeholder tests (`test/Dummy.test.ts`). Add real test coverage alongside new features.

## Authoring Guardrails

- **No native collection helpers**: Use `A.*`, `Str.*`, `Record.*` from Effect
- **Export through index files**: Update `src/index.ts` and feature `index.ts` files for new components
- **Source schemas from SDK**: Import validation schemas from `@beep/iam-client/clients`, never duplicate
- **Coordinate with UI packages**: New primitives should go to `@beep/ui` or `@beep/shared-ui`
- **Document divergences**: Record intentional deviations from Effect patterns and open follow-up tasks
- **Two-factor stub**: Keep `two-factor/index.ts` empty until requirements land

## Related Documentation

- **AGENTS.md**: Detailed package authoring guidelines and quick recipes
- **apps/web**: Next.js application consuming these components
- **@beep/iam-client**: RPC contracts and Better Auth client utilities
- **@beep/runtime-client**: Browser ManagedRuntime documentation
- **@beep/ui**: Core component library documentation

## Versioning and Changes

- Widely consumed UI package — prefer **additive** changes
- For breaking changes, update consuming applications in the same PR
- Document migration guides for major API changes
- Maintain backward compatibility for form component props where possible
