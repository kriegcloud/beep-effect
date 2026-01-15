# @beep/iam-client

React client integration for the IAM system, providing Effect-first authentication flows via better-auth.

## Purpose

Provides the React client layer for authentication and identity management. This package:
- Wraps better-auth React client with all required plugins (passkey, SSO, organizations, multi-session, etc.)
- Exports React hooks for sign-in and sign-up forms with schema validation
- Provides session management utilities and callback URL sanitization
- Sits in the IAM slice client layer, consumed by `@beep/iam-ui` and `apps/web`

## Installation

```bash
# This package is internal to the monorepo
# Add as a dependency in your package.json:
"@beep/iam-client": "workspace:*"
```

### Package Exports

The package is configured to allow flexible imports:

```typescript
// Main package exports (AuthClient type, constants)
import { AuthCallback } from "@beep/iam-client";
import type { AuthClient } from "@beep/iam-client";

// Better-auth client via adapter (for guards and direct usage)
import { client, $store } from "@beep/iam-client/adapters/better-auth";

// Error types
import { IamError, IamErrorMetadata } from "@beep/iam-client/errors";

// React form hooks via deep imports
import { useSignInEmailForm } from "@beep/iam-client/atom/sign-in";
import { useSignUpEmailForm } from "@beep/iam-client/atom/sign-up";
```

## Key Exports

### Better Auth Client

| Export        | Description                                                  |
|---------------|--------------------------------------------------------------|
| `AuthClient`  | Type alias for better-auth client with all configured plugins |
| `client`      | Configured better-auth React client instance                 |
| `$store`      | Better-auth reactive store for session state                 |
| `signIn`      | Sign-in methods from better-auth client                      |
| `signUp`      | Sign-up methods from better-auth client                      |

### React Form Hooks

These hooks are available via deep imports from the `atom/` directory:

| Export                 | Import Path                              | Description                                       |
|------------------------|------------------------------------------|---------------------------------------------------|
| `useSignInEmailForm`   | `@beep/iam-client/atom/sign-in`          | Form helper for email sign-in with validation    |
| `useSignUpEmailForm`   | `@beep/iam-client/atom/sign-up`          | Form helper for email registration with validation |

### Error Types

| Export             | Description                                               |
|--------------------|-----------------------------------------------------------|
| `IamError`         | Tagged error for all IAM operations with metadata         |
| `IamErrorMetadata` | Metadata schema for structured error handling             |
| `BetterAuthError`  | Wrapper for better-auth native errors                     |

### Constants & Utilities

| Export          | Description                                            |
|-----------------|--------------------------------------------------------|
| `AuthCallback`  | Constants and helpers for OAuth/SSO callback URL sanitization |

## Architecture Fit

- **Vertical Slice + Hexagonal**: Client layer bridges Better Auth React client with UI components
- **Effect-first**: Schema validation via Effect Schema, form state management with Effect patterns
- **Better Auth Integration**: Direct usage of better-auth React client with comprehensive plugin configuration
- **Reactive**: Session state management via better-auth `$store` with `$sessionSignal` listener
- **Path alias**: Import as `@beep/iam-client`

## Module Structure

```
src/
├── index.ts                    # Main package exports (AuthClient, constants)
├── adapters/
│   └── better-auth/
│       ├── client.ts           # Better-auth client instance with plugins
│       ├── errors.ts           # BetterAuthError wrapper
│       └── index.ts            # Re-exports client, $store, types
├── atom/
│   ├── get-session/            # Session retrieval atoms
│   ├── sign-in/
│   │   └── sign-in.forms.ts    # useSignInEmailForm hook
│   └── sign-up/
│       └── sign-up.forms.ts    # useSignUpEmailForm hook
├── constants/
│   └── AuthCallback/           # OAuth/SSO callback URL sanitization
└── errors.ts                   # IamError and IamErrorMetadata schemas
```

### Better Auth Client Configuration

The client is configured with the following plugins:
- **adminClient**: User impersonation and admin operations
- **anonymousClient**: Anonymous session support
- **jwtClient**: JWT token handling
- **apiKeyClient**: API key authentication
- **genericOAuthClient**: Generic OAuth provider integration
- **multiSessionClient**: Multiple concurrent session management
- **oidcClient**: OpenID Connect flows
- **oneTapClient**: Google One Tap sign-in
- **oneTimeTokenClient**: One-time password tokens
- **organizationClient**: Organization/tenant management with teams and dynamic access control
- **passkeyClient**: WebAuthn/FIDO2 passkey support
- **phoneNumberClient**: Phone number authentication
- **siweClient**: Sign-in with Ethereum (Web3)
- **ssoClient**: Enterprise SSO (SAML/OIDC)
- **stripeClient**: Stripe billing integration
- **deviceAuthorizationClient**: Device flow for CLI/IoT devices
- **lastLoginMethodClient**: Track last used authentication method

## Usage

### Namespace Imports

```typescript
import { client, $store, AuthCallback } from "@beep/iam-client";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
```

### Using Better Auth Client Directly

The better-auth client provides direct access to all authentication methods:

```typescript
import { client } from "@beep/iam-client/adapters/better-auth";

// Sign in with email
await client.signIn.email({
  email: Redacted.value(emailRedacted),
  password: Redacted.value(passwordRedacted),
  rememberMe: true
});

// Sign up with email
await client.signUp.email({
  email: Redacted.value(emailRedacted),
  password: Redacted.value(passwordRedacted),
  name: fullName
});

// Sign in with OAuth provider
await client.signIn.social({
  provider: "google",
  callbackURL: AuthCallback.getURL("/dashboard")
});

// Access current session
const session = client.useSession();
```

### React Form Hooks

Form hooks integrate Effect Schema validation with react-hook-form. Import via deep paths:

```typescript
import { useSignInEmailForm } from "@beep/iam-client/atom/sign-in";
import { useSignUpEmailForm } from "@beep/iam-client/atom/sign-up";
import * as Redacted from "effect/Redacted";

function SignInForm() {
  const executeCaptcha = async () => {
    // Get reCAPTCHA token
    const token = await grecaptcha.execute();
    return Redacted.make(token);
  };

  const { form } = useSignInEmailForm({ executeCaptcha });

  return (
    <form onSubmit={form.handleSubmit}>
      <input {...form.register("email")} type="email" />
      <input {...form.register("password")} type="password" />
      <input {...form.register("rememberMe")} type="checkbox" />
      <button type="submit">Sign In</button>
    </form>
  );
}

function SignUpForm() {
  const executeRecaptcha = async () => {
    const token = await grecaptcha.execute();
    return Redacted.make(token);
  };

  const onSuccess = async () => {
    // Navigate after successful registration
    router.push("/verify-email");
  };

  const { form } = useSignUpEmailForm({ executeRecaptcha, onSuccess });

  return (
    <form onSubmit={form.handleSubmit}>
      <input {...form.register("email")} type="email" />
      <input {...form.register("password")} type="password" />
      <input {...form.register("passwordConfirm")} type="password" />
      <input {...form.register("firstName")} />
      <input {...form.register("lastName")} />
      <button type="submit">Sign Up</button>
    </form>
  );
}
```

### Session State Management

Use `$store` and `$sessionSignal` for reactive session updates:

```typescript
import { client, $store } from "@beep/iam-client/adapters/better-auth";
import * as React from "react";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const session = client.useSession();

  React.useEffect(() => {
    // Notify session signal on mount to trigger guards
    $store.notify("$sessionSignal");
  }, []);

  if (!session.data) {
    return <Navigate to="/sign-in" />;
  }

  return <>{children}</>;
}
```

### OAuth Callback URL Sanitization

Always sanitize callback URLs to prevent open redirect vulnerabilities:

```typescript
import { AuthCallback } from "@beep/iam-client";
import * as Str from "effect/String";
import * as F from "effect/Function";

// Get sanitized callback URL for OAuth flow
const callbackURL = AuthCallback.getURL("/dashboard");

// Sanitize user-provided redirect target
const sanitizeRedirect = (raw: string | null | undefined) =>
  AuthCallback.sanitizePath(
    F.pipe(raw ?? AuthCallback.defaultTarget, Str.trim)
  );

// Use with OAuth sign-in
await client.signIn.social({
  provider: "github",
  callbackURL: AuthCallback.getURL("/dashboard")
});
```

### Error Handling

Handle authentication errors with structured metadata:

```typescript
import { IamError } from "@beep/iam-client/errors";
import * as Effect from "effect/Effect";

const signIn = Effect.tryPromise({
  try: async () => {
    return await client.signIn.email({
      email: Redacted.value(email),
      password: Redacted.value(password)
    });
  },
  catch: (error) => IamError.match(error, {
    method: "signIn.email",
    domain: "authentication"
  })
});

// Handle specific error cases
const program = signIn.pipe(
  Effect.catchTag("IamError", (error) => {
    console.error({
      message: error.message,
      code: error.code,
      status: error.status,
      method: error.method
    });
    return Effect.fail(error);
  })
);
```

### Multi-Session Management

Handle multiple concurrent sessions:

```typescript
import { client } from "@beep/iam-client/adapters/better-auth";

// List all active sessions
const sessions = await client.session.listSessions();

// Switch to different session
await client.session.switchSession({ sessionId });

// Revoke a specific session
await client.session.revokeSession({ sessionId });
```

### Passkey/WebAuthn Support

Add and manage passkeys for passwordless authentication:

```typescript
import { client } from "@beep/iam-client/adapters/better-auth";

// Add a new passkey
await client.passkey.addPasskey({
  name: "My MacBook Pro"
});

// Sign in with passkey
await client.signIn.passkey();

// List user's passkeys
const passkeys = await client.passkey.listPasskeys();

// Remove a passkey
await client.passkey.removePasskey({ passkeyId });
```

## What Must NOT Go Here

- **Server-side operations**: Database queries, session creation, token signing belong in `@beep/iam-server`
- **Domain models**: Entity definitions and business logic belong in `@beep/iam-domain`
- **UI components**: Presentational components belong in `@beep/iam-ui`
- **Backend authentication logic**: Better-auth server configuration belongs in `@beep/iam-server`

## Dependencies

### Core Dependencies

| Package                      | Purpose                                                    |
|------------------------------|------------------------------------------------------------|
| `effect`                     | Core Effect runtime and Schema system                      |
| `better-auth`                | Authentication framework with React integration            |
| `@beep/iam-server`           | Better-auth server configuration and types                 |
| `@beep/shared-domain`        | Shared domain entities (paths, routing)                    |
| `@beep/shared-env`           | Environment configuration utilities                        |
| `@beep/schema`               | Reusable Effect schemas (Email, Password, etc.)            |
| `@beep/errors`               | Error types and utilities                                  |
| `@beep/identity`             | Package identity system                                    |
| `@beep/utils`                | Pure runtime helpers                                       |

### UI & React Integration

| Package                      | Purpose                                                    |
|------------------------------|------------------------------------------------------------|
| `@beep/ui`                   | UI components and form utilities                           |
| `react`                      | React library                                              |
| `react-dom`                  | React DOM rendering                                        |
| `next`                       | Next.js for routing and server components                  |

### Better-auth Plugins

| Package                      | Purpose                                                    |
|------------------------------|------------------------------------------------------------|
| `@better-auth/passkey`       | Passkey/WebAuthn plugin                                    |
| `@better-auth/sso`           | Enterprise SSO plugin (SAML/OIDC)                          |
| `@better-auth/stripe`        | Stripe billing integration                                 |
| `@better-auth/core`          | Better-auth core types                                     |
| `@better-auth/utils`         | Better-auth utility functions                              |

### Additional Dependencies

| Package                      | Purpose                                                    |
|------------------------------|------------------------------------------------------------|
| `jose`                       | JWT utilities for token handling                           |
| `@simplewebauthn/server`     | WebAuthn server utilities                                  |
| `@effect-atom/atom-react`    | Reactive atoms for React integration                       |

## Development

```bash
# Type check
bun run --filter @beep/iam-client check

# Lint
bun run --filter @beep/iam-client lint

# Lint and auto-fix
bun run --filter @beep/iam-client lint:fix

# Build
bun run --filter @beep/iam-client build

# Run tests
bun run --filter @beep/iam-client test

# Test with coverage
bun run --filter @beep/iam-client coverage

# Watch mode for development
bun run --filter @beep/iam-client dev
```

## Guidelines for Contributors

- **Effect patterns**: Use namespace imports (`import * as Effect from "effect/Effect"`), never named imports
- **Native method ban**: Use Effect utilities (`A.map`, `Str.split`) instead of native array/string methods
- **Redacted values**: ALWAYS use `Redacted.value()` to unwrap credentials before passing to better-auth
- **Session notifications**: Fire `$store.notify("$sessionSignal")` after operations that mutate session state
- **Callback validation**: ALWAYS use `AuthCallback.sanitizePath` for user-provided redirect URLs
- **Error handling**: Wrap better-auth calls in `Effect.tryPromise` and map to `IamError` for consistency
- **TypeScript**: Avoid `any`, use branded types from `@beep/schema`, validate with Effect Schema

## Testing

- Use Bun test for form and client integration tests
- Mock better-auth client responses for unit tests
- Test error normalization from `BetterAuthError` to `IamError`
- Verify form validation rules and schema transformations
- Test session state reactivity with `$sessionSignal`
- Located in `test/` directory (currently placeholder suite)

## Relationship to Other Packages

- `@beep/iam-domain` — Entity models consumed by forms and client
- `@beep/iam-server` — Server-side better-auth configuration and handlers
- `@beep/iam-ui` — UI components consuming these client utilities and hooks
- `@beep/ui` — UI utilities and form abstractions

## Notes

- The better-auth client is configured with comprehensive plugin support including passkeys, SSO, multi-session, organizations, and more
- Session state is managed reactively via `$store` with `$sessionSignal` notification pattern
- All credential fields (email, password, tokens) use `Redacted` type for type-safe secret handling
- Callback URLs are sanitized through `AuthCallback` utilities to prevent open redirect vulnerabilities
- Forms integrate Effect Schema validation with react-hook-form for type-safe field validation
