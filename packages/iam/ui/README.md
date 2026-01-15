# @beep/iam-ui

React UI components for IAM authentication flows (sign-in, sign-up), bridging Effect-based RPC contracts to client-side user experiences.

## Purpose

Provides client-side IAM entry points consumed by `apps/web` and any application embedding IAM flows. This package bridges Effect-based RPC contracts from `@beep/iam-client` to React components using `@beep/ui` form primitives, `@beep/runtime-client` runners, and `@beep/shared-domain` navigation paths.

Owns the UX orchestration layer (headings, dividers, CTA links, reCAPTCHA wiring) so that route-level pages remain declarative and avoid duplicating validation or RPC orchestration logic.

**Current Status**: This package is in active development. Currently implements basic sign-in and sign-up flows with email authentication. Social provider authentication, passkey support, password recovery, verification flows, and organization invitations are planned but not yet implemented.

## Architecture Fit

- **Vertical Slice UI Layer**: Implements the presentation layer for the IAM slice
- **Effect-First**: All RPC interactions use `Effect.gen`, `Effect.fn`, and Effect combinators
- **Runtime Integration**: Leverages `@beep/runtime-client` for ManagedRuntime execution
- **Better Auth Bridge**: Wraps Better Auth authentication contracts with React components
- **Path Alias**: Import as `@beep/iam-ui`

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

| Export         | Description                                         | Status         |
|----------------|-----------------------------------------------------|----------------|
| `IamProvider`  | Top-level provider wrapping reCAPTCHA v3 context    | ✅ Implemented |
| `SignInView`   | Email sign-in UI (social/passkey planned)           | ✅ Implemented |
| `SignUpView`   | Email sign-up UI (social authentication planned)    | ✅ Implemented |

### Subpath Exports

Currently available subpath exports:

| Subpath        | Exported Components | Description                  |
|----------------|---------------------|------------------------------|
| `/sign-in`     | `SignInView`        | Sign-in view component       |
| `/sign-up`     | `SignUpView`        | Sign-up view component       |

**Note**: The package exports structure uses wildcard exports (`"./*": "./src/*.ts"`), but most components are internal implementation details. Only the exports listed above are part of the stable public API.

### Internal Components

The following directories contain internal implementation details and are subject to change:

- `_components/` - Shared UI atoms (FormHead, FormDivider, FormReturnLink, etc.)
- `_common/` - Internal utilities (useCaptcha, useSuccessTransition, RecaptchaV3Provider)
- `types/` - Extended theme types

## Module Structure

```
src/
├── IamProvider.tsx           # Top-level reCAPTCHA context provider
├── sign-in/                  # Sign-in flow components
│   ├── sign-in.view.tsx      # Main sign-in view (email only)
│   ├── sign-in-email.form.tsx # Email/password form
│   ├── sign-in-social.tsx    # Social provider buttons (commented out)
│   └── sign-in-passkey.tsx   # Passkey authentication (commented out)
├── sign-up/                  # Sign-up flow components
│   ├── sign-up.view.tsx      # Main sign-up view (email only)
│   ├── sign-up-email.form.tsx # Email registration form
│   └── sign-up-social.tsx    # Social provider registration (commented out)
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

Complete sign-in view with email authentication:

```typescript
import { SignInView } from "@beep/iam-ui";

export default function SignInPage() {
  return <SignInView />;
}
```

Custom email sign-in form with explicit runtime wiring:

```typescript
import { SignInEmailForm } from "@beep/iam-ui/sign-in/sign-in-email.form";
import { iam } from "@beep/iam-client";
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

### Sign-Up Flow

Complete sign-up view with email registration:

```typescript
import { SignUpView } from "@beep/iam-ui";

export default function SignUpPage() {
  return <SignUpView />;
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

## Planned Features

The following features are planned but not yet implemented:

### Password Recovery
- `RequestResetPasswordView` - Password reset request form
- `ResetPasswordView` - Password reset form with token validation

### Verification Flows
- `VerifyPhoneView` - Phone verification UI
- `EmailVerificationSent` - Email verification sent confirmation component

### Organization Management
- `AcceptInvitationView` - Organization invitation acceptance UI

### Passkey Management
- `PasskeysView` - Passkey management UI (list, add, remove)

### Social Provider Authentication
- Social provider sign-in buttons (Google, GitHub, etc.)
- Social provider registration buttons

### Two-Factor Authentication
- MFA/2FA flows (reserved for future implementation)

## What Belongs Here

- **Authentication UI flows**: Sign-in, sign-up, password recovery, verification, invitations
- **IAM form components**: Email forms, social provider buttons, passkey authentication
- **RPC orchestration**: Wiring `@beep/iam-client` contracts to React components via `@beep/runtime-client`
- **UX composition**: Headings, dividers, links, icons specialized for IAM flows
- **reCAPTCHA integration**: reCAPTCHA v3 provider and execution hooks with Effect integration
- **Navigation helpers**: CTA links using `@beep/shared-domain` paths

## What Must NOT Go Here

- **Business logic**: Belongs in `@beep/iam-domain` or `@beep/iam-server`
- **RPC contracts**: Defined in `@beep/iam-client`, not here
- **Database access**: Belongs in `@beep/iam-server` repository layers
- **Better Auth configuration**: Lives in `@beep/iam-server`
- **Generic UI components**: Should go in `@beep/ui` or `@beep/shared-ui`
- **Server-side logic**: Belongs in `apps/server` or `@beep/iam-server`

## Dependencies

| Package                         | Purpose                                                |
|---------------------------------|--------------------------------------------------------|
| `@beep/iam-client`              | IAM RPC contracts and Better Auth client utilities     |
| `@beep/runtime-client`          | Browser ManagedRuntime for Effect execution            |
| `@beep/shared-domain`           | Shared paths and navigation utilities                  |
| `@beep/shared-env`              | Client and server environment configuration            |
| `@beep/ui`                      | Core component library                                 |
| `@beep/ui-core`                 | Design tokens and MUI theme configuration              |
| `@beep/constants`               | Schema-backed enums and constants                      |
| `effect`                        | Core Effect runtime                                    |
| `better-auth`                   | Authentication library                                 |
| `@tanstack/react-form`          | Form state management                                  |
| `@mui/material`                 | Material-UI components                                 |
| `@wojtekmaj/react-recaptcha-v3` | reCAPTCHA v3 React integration                         |
| `@effect-atom/atom-react`       | Effect-based state atoms for React                     |
| `framer-motion`                 | Animation library                                      |
| `next`                          | Next.js framework (routing, navigation)                |
| `react`                         | React library                                          |

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

Always compose RPC invocations with `F.pipe`, `Effect.flatMap`, or `Effect.gen`. Avoid introducing `async/await` in new logic:

```typescript
// REQUIRED - Effect pipeline
const handleSubmit = (valueEffect: Effect.Effect<SignInInput>) =>
  runEmail(
    F.pipe(
      valueEffect,
      Effect.flatMap(iam.signIn.email),
      Effect.tap(() => Effect.log("Sign-in successful"))
    )
  );

// FORBIDDEN - async/await
const handleSubmit = async (value: SignInInput) => {
  await auth.signIn.email(value);
};
```

### Runtime Linking

Every networked action must be routed through `makeRunClientPromise(runtime, "<port>")`. Never call `iam.*` effects directly without the runtime runner:

```typescript
// REQUIRED - runtime wiring
const runtime = useRuntime();
const runEmail = makeRunClientPromise(runtime, "iam.signIn.email");
runEmail(F.pipe(valueEffect, Effect.flatMap(iam.signIn.email)));

// FORBIDDEN - direct effect call
iam.signIn.email(value);
```

### Schema-First Forms

Forms must use Effect schemas from `@beep/iam-client/clients` with `formOptionsWithSubmit`. Do not hand-roll validation:

```typescript
import { signInEmailSchema } from "@beep/iam-client/clients/sign-in";
import { formOptionsWithSubmit } from "@beep/ui/forms";

const form = useForm(formOptionsWithSubmit(signInEmailSchema, onSubmit));
```

### Effect Collection Utilities

Use Effect Array utilities instead of native array methods:

```typescript
import * as A from "effect/Array";
import * as F from "effect/Function";

// REQUIRED - Effect Array utilities
F.pipe(
  providers,
  A.filter((p) => p !== "twitter"),
  A.map((p) => <SocialButton key={p} provider={p} />)
);

// FORBIDDEN - native array methods
providers
  .filter((p) => p !== "twitter")
  .map((p) => <SocialButton key={p} provider={p} />);
```

### Path Hygiene

Build navigation using `paths` from `@beep/shared-domain`:

```typescript
// REQUIRED - shared paths
import { paths } from "@beep/shared-domain";
<Link href={paths.auth.signUp}>Sign up</Link>

// FORBIDDEN - hardcoded strings
<Link href="/auth/sign-up">Sign up</Link>
```

## Testing

- Unit tests colocated in `test/` directory
- Use Bun for testing framework
- Test form validation, reCAPTCHA integration, and Effect pipelines
- Mock runtime and RPC calls for isolated component testing

Currently, the package has placeholder tests (`test/Dummy.test.ts`). Add real test coverage alongside new features.

## Security Considerations

### Credential Handling
- NEVER log form values containing passwords or tokens
- NEVER store credentials in component state beyond immediate submission
- ALWAYS clear password fields after submission

### Session Security
- ALWAYS rely on Better Auth session management
- NEVER cache session state locally
- NEVER expose session tokens in URLs or localStorage

### Callback URL Security
- ALWAYS sanitize callback URLs before redirects
- NEVER allow arbitrary redirect URLs
- ALWAYS validate callback URLs server-side

## Related Documentation

- **AGENTS.md** (CLAUDE.md): Detailed package authoring guidelines and quick recipes
- **apps/web**: Next.js application consuming these components
- **@beep/iam-client**: RPC contracts and Better Auth client utilities
- **@beep/runtime-client**: Browser ManagedRuntime documentation
- **@beep/ui**: Core component library documentation

## Contributing

When adding new features:

- [ ] Update exports in `src/index.ts` and feature `index.ts` files
- [ ] Wrap every RPC call with `makeRunClientPromise` and Effect combinators
- [ ] Source schemas from `@beep/iam-client/clients`
- [ ] Use `@beep/ui` components where possible
- [ ] Add or amend tests in `packages/iam/ui/test`
- [ ] Update this README with new exports and usage examples
- [ ] Document any intentional divergence from Effect patterns

## Versioning and Changes

- Widely consumed UI package — prefer **additive** changes
- For breaking changes, update consuming applications in the same PR
- Document migration guides for major API changes
- Maintain backward compatibility for form component props where possible
