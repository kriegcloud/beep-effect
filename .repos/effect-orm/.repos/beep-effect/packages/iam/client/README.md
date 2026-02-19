# @beep/iam-client

Client SDK and presentation layer for the IAM system, providing Effect-first authentication flows, contracts, and React integration via better-auth.

## Purpose

The IAM SDK provides a complete client-side authentication system built on better-auth with Effect's contract-based architecture. It offers type-safe contracts, contract implementations, reactive atoms, and form helpers for all authentication flows including sign-in, sign-up, multi-session, OAuth, SSO, passkeys, two-factor, and user management. This package bridges better-auth's authentication primitives with Effect's type-safety and composability through the `@beep/contract` system, while providing React hooks and form utilities for seamless UI integration.

## Key Exports

### Core Types & Errors

| Export                | Description                                                                                |
|-----------------------|--------------------------------------------------------------------------------------------|
| `AuthClient`          | Type alias for better-auth client with all configured plugins                              |
| `IamError`            | Tagged error with metadata for all IAM operations (code, status, plugin, method)           |
| `IamErrorMetadata`    | Metadata schema for structured error handling                                              |

### Contract Implementations

Each feature exports an `Implementations` object with contract handlers:

| Export                              | Description                                                                    |
|-------------------------------------|--------------------------------------------------------------------------------|
| `SignInImplementations`             | Sign-in contract implementations (email, social, credential)                   |
| `SignUpImplementations`             | User registration contract implementations                                     |
| `UserImplementations`               | User management implementations (update profile, change email/password, phone) |
| `SessionImplementations`            | Session management and validation implementations                              |
| `MultiSessionImplementations`       | Multi-session support (list, switch, revoke sessions)                          |
| `TwoFactorImplementations`          | TOTP two-factor authentication implementations                                 |
| `OAuthImplementations`              | OAuth provider integration implementations (Google, GitHub, etc.)              |
| `OidcImplementations`               | OpenID Connect flow implementations                                            |
| `OrganizationImplementations`       | Organization/tenant management implementations                                 |
| `DeviceAuthorizationImplementations`| Device authorization flow implementations for CLI/IoT devices                  |
| `ApiKeyImplementations`             | API key generation and validation implementations                              |
| `VerifyImplementations`             | Email and phone verification implementations                                   |
| `RecoverImplementations`            | Password recovery and reset implementations                                    |
| `SignOutImplementations`            | Sign-out implementations with session cleanup                                  |
| `AdminImplementations`              | Admin operations (user impersonation, bans)                                    |

### Individual Contracts

Contracts are exported individually by name (e.g., `SignInEmailContract`, `SignInSocialContract`, `ChangePasswordContract`). Each contract includes:
- `payloadSchema` - Input validation schema
- `successSchema` - Success response schema
- `failureSchema` - Error schema (IamError)
- `implement()` - Method to create Effect-based implementation
- `decodeUnknownSuccess()` - Response decoder

### React Integration

| Export                        | Description                                                        |
|-------------------------------|--------------------------------------------------------------------|
| `useChangePasswordForm`       | React hook for password change form with validation                |
| `useUpdateUserIdentityForm`   | Form helper for updating user name                                 |
| `useUpdateUsernameForm`       | Form helper for updating username                                  |
| `useUpdatePhoneNumberForm`    | Form helper for updating phone number                              |
| `useSignUpEmailForm`          | Form helper for email registration with validation                 |
| `useSignInEmailForm`          | Form helper for email sign-in with validation                      |
| `useResetPasswordForm`        | Form helper for password reset                                     |
| `useRequestResetPasswordForm` | Form helper for requesting password reset                          |
| `useAddPasskeyForm`           | Form helper for adding passkey                                     |
| `useUpdatePasskeyForm`        | Form helper for updating passkey                                   |

### Atoms & Runtimes

Most client modules export atoms and runtimes for reactive state management. Notable exports include:
- `passkeysAtom`, `addPasskeyAtom`, `removePasskeyAtom`, `updatePasskeyAtom`, `editingPasskeyAtom` (Passkey management)
- `resetPasswordAtom`, `requestResetPasswordAtom` (Password recovery)
- Module-specific runtimes: `adminRuntime`, `apiKeyRuntime`, `deviceAuthorizationRuntime`, `multiSessionRuntime`, `oauthRuntime`, `oidcRuntime`, `organizationRuntime`, `recoverRuntime`

### Constants & Utilities

| Export                | Description                                                                    |
|-----------------------|--------------------------------------------------------------------------------|
| `AuthCallback`        | Constants and helpers for OAuth/SSO callback URL sanitization                  |

## Architecture Fit

- **Vertical Slice + Hexagonal**: SDK layer bridges IAM domain/server with UI, exposing only contracts and client-safe operations
- **Effect-first**: All contract implementations return `Effect<Success, IamError, never>` with structured error handling
- **Contract-driven**: Uses `@beep/contract` for type-safe request/response schemas with metadata annotations (`Contract.make`, `ContractKit`)
- **Better Auth Integration**: Wraps better-auth client methods through `Contract.implement` with continuation-based error handling
- **Reactive**: Atoms via `@effect-atom/atom-react` with `withToast` wrapper for optimistic UI updates and notifications
- **Path alias**: Import as `@beep/iam-client`

## Module Structure

```
src/
├── index.ts                    # Main package exports
├── adapters/
│   ├── index.ts               # Adapter re-exports
│   └── better-auth/           # Better-auth client wrapper, error normalization
│       ├── client.ts          # Better-auth client instance with plugins
│       ├── errors.ts          # BetterAuthError wrapper
│       ├── types.ts           # Type definitions
│       └── index.ts           # Re-exports client, $store, types
├── api-client/
│   └── index.ts               # API client exports
├── clients/
│   ├── index.ts               # Re-exports all client modules
│   ├── admin/                 # Admin operations (user impersonation, bans)
│   ├── api-key/               # API key contracts, implementations, service
│   ├── device-authorization/  # Device flow for CLI/IoT
│   ├── last-login-method/     # Track last used login method
│   ├── multi-session/         # Multi-session management
│   ├── oauth/                 # OAuth provider integration
│   ├── oidc/                  # OpenID Connect flows
│   ├── organization/          # Organization/tenant management
│   ├── last-login-method/     # Track last used login method
│   ├── passkey/               # WebAuthn passkey support (contracts, forms, atoms, layer)
│   ├── recover/               # Password recovery (contracts, forms, atoms)
│   ├── session/               # Session validation and management
│   ├── sign-in/               # Sign-in flows (atoms, contracts, implementations, forms, service)
│   ├── sign-out/              # Sign-out with cleanup
│   ├── sign-up/               # Registration (contracts, forms, atoms, implementations, service)
│   ├── two-factor/            # TOTP 2FA (contracts, atoms, implementations, service)
│   ├── user/                  # User management (profile, email, password, phone)
│   ├── verify/                # Email/phone verification
│   └── _internal/             # Shared client helpers (_id.ts, client-method-helpers.ts)
├── constants/
│   ├── index.ts               # Constants re-exports
│   └── AuthCallback/          # OAuth/SSO callback URL sanitization
│       ├── AuthCallback.ts    # Callback helper implementation
│       └── index.ts           # Re-exports
└── errors.ts                  # IamError and IamErrorMetadata schemas
```

### Client Module Pattern

Each client module (under `src/clients/*`) follows this pattern:

- **`index.ts`**: Re-exports all module exports (contracts, implementations, atoms, forms, service)
- **`*.contracts.ts`**: Individual contract definitions using `Contract.make`, grouped with `ContractKit.make`
- **`*.implementations.ts`**: Contract implementations via `ContractName.implement()`, exported as single `*Implementations` object via `ContractKit.of()`
- **`*.atoms.ts`** (optional): Reactive atoms with toast notifications using `@effect-atom/atom-react`
- **`*.forms.ts`** (optional): React hook form helpers with schema validation
- **`*.service.ts`** (optional): Effect service layer for some modules (legacy pattern)

## Installation

```bash
# This package is internal to the monorepo
# Add as a dependency in your package.json:
"@beep/iam-client": "workspace:*"
```

### Package Exports

The package exports are configured to allow flexible imports:

```typescript
// Main package exports (recommended)
import { UserImplementations, SignInEmailContract } from "@beep/iam-client";

// Error types (from errors module)
import { IamError, IamErrorMetadata } from "@beep/iam-client/errors";

// Deep imports to adapters (for guard usage)
import { client, $store } from "@beep/iam-client/adapters/better-auth";

// Deep imports to specific feature modules
import { SignInEmailContract } from "@beep/iam-client/clients/sign-in";
```

## Usage

### Namespace Import

Prefer named imports for implementations, individual contracts, and errors:

```typescript
import {
  UserImplementations,
  SignInImplementations,
  SignInEmailContract,
  ChangePasswordContract
} from "@beep/iam-client";
import { IamError } from "@beep/iam-client/errors";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
```

### Contract Implementation Usage

Contract implementations provide Effect-based wrappers around better-auth operations. Each `Implementations` object contains methods corresponding to the contracts:

```typescript
import { UserImplementations } from "@beep/iam-client";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";

// Use contract implementation directly
const updateProfile = F.pipe(
  UserImplementations.UpdateUserInformation({
    firstName: "John",
    lastName: "Doe",
    image: "https://example.com/avatar.jpg"
  }),
  Effect.catchTag("IamError", (error) =>
    Effect.log(`Update failed: ${error.message}`)
  )
);

// Execute with client runtime
import { clientRuntimeLayer } from "@beep/runtime-client";
import { Atom } from "@effect-atom/atom-react";

const runtime = Atom.runtime(clientRuntimeLayer);
runtime.runPromise(updateProfile);
```

### Contracts

Contracts define type-safe schemas with domain/method metadata using `@beep/contract`. Individual contracts are exported by name:

```typescript
import { ChangePasswordContract } from "@beep/iam-client";
import * as S from "effect/Schema";
import * as F from "effect/Function";

// Access contract schemas
ChangePasswordContract.payloadSchema;  // Input validation schema
ChangePasswordContract.successSchema;  // Success response schema
ChangePasswordContract.failureSchema;  // Error schema (IamError)

// Decode payload with schema
const payload = F.pipe(
  {
    password: "NewPass123!",
    passwordConfirm: "NewPass123!",
    currentPassword: "OldPass123!",
    revokeOtherSessions: false
  },
  S.decodeUnknownSync(ChangePasswordContract.payloadSchema)
);

// Or use contract implementation directly
import { UserImplementations } from "@beep/iam-client";

const changePassword = UserImplementations.ChangePassword({
  password: "NewPass123!",
  passwordConfirm: "NewPass123!",
  currentPassword: "OldPass123!",
  revokeOtherSessions: false
});
```

### React Hooks with Atoms

Atoms provide reactive, optimistic updates with toast notifications via `withToast` wrapper:

```typescript
import { UserImplementations } from "@beep/iam-client";
import { clientRuntimeLayer } from "@beep/runtime-client";
import { withToast } from "@beep/ui/common/with-toast";
import { Atom } from "@effect-atom/atom-react";
import * as F from "effect/Function";
import * as O from "effect/Option";

// Create atom with toast feedback
const runtime = Atom.runtime(clientRuntimeLayer);

const changePasswordAtom = runtime.fn(
  F.flow(
    UserImplementations.ChangePassword,
    withToast({
      onWaiting: "Changing password...",
      onSuccess: "Password changed successfully",
      onFailure: O.match({
        onNone: () => "Failed with unknown error",
        onSome: (err) => err.message
      })
    })
  )
);

// Use in React component
function ProfileSettings() {
  const changePassword = Atom.useAtom(changePasswordAtom);

  const handlePasswordChange = async (data: ChangePasswordPayload) => {
    // Atom automatically shows toast notifications based on Effect result
    await changePassword(data);
  };

  return (
    <form onSubmit={handlePasswordChange}>
      {/* form fields */}
    </form>
  );
}
```

### Form Helpers

Form hooks integrate Effect schemas with react-hook-form:

```typescript
import { useChangePasswordForm, useSignUpEmailForm } from "@beep/iam-client";

function PasswordChangeForm() {
  const { form } = useChangePasswordForm({
    onSuccess: () => {
      // Navigate or close dialog
    }
  });

  return (
    <form onSubmit={form.handleSubmit}>
      <input {...form.register("currentPassword")} type="password" />
      <input {...form.register("password")} type="password" />
      <input {...form.register("passwordConfirm")} type="password" />
      <button type="submit">Change Password</button>
    </form>
  );
}
```

### Error Handling

Structured error handling with metadata:

```typescript
import { UserImplementations } from "@beep/iam-client";
import { IamError } from "@beep/iam-client/errors";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";

const program = F.pipe(
  UserImplementations.ChangeEmail({
    newEmail: "new@example.com",
    callbackURL: "https://app.example.com/verify"
  }),
  Effect.catchTag("IamError", (error) => {
    // Access structured error metadata
    console.error({
      message: error.message,
      code: error.code,           // "EMAIL_ALREADY_EXISTS"
      status: error.status,        // 409
      statusText: error.statusText, // "Conflict"
      plugin: error.plugin,        // "email-verification"
      method: error.method         // "changeEmail"
    });
    return Effect.fail(error);
  })
);
```

### Better Auth Client Access

For guard usage and session state management, access the client directly from the adapter:

```typescript
import { client, $store } from "@beep/iam-client/adapters/better-auth";

// Access session state
const session = client.useSession();

// Notify session signal after mutations
$store.notify("$sessionSignal");

// Use in guards
function AuthGuard({ children }: { children: React.ReactNode }) {
  const session = client.useSession();

  React.useEffect(() => {
    $store.notify("$sessionSignal");
  }, []);

  if (!session.data) {
    return <Navigate to="/sign-in" />;
  }

  return <>{children}</>;
}
```

### Multi-Session Management

Handle multiple concurrent sessions:

```typescript
import { MultiSessionImplementations } from "@beep/iam-client";
import * as Effect from "effect/Effect";
import * as A from "effect/Array";
import * as F from "effect/Function";

const listSessions = F.pipe(
  MultiSessionImplementations.ListSessions(),
  Effect.map((sessions) =>
    F.pipe(
      sessions,
      A.map((session) => ({
        id: session.id,
        deviceName: session.deviceName,
        lastActive: session.lastActiveAt
      }))
    )
  )
);

const switchSession = (sessionId: string) =>
  MultiSessionImplementations.SwitchSession({ sessionId });

const revokeSession = (sessionId: string) =>
  MultiSessionImplementations.RevokeSession({ sessionId });
```

### OAuth Integration

OAuth flows with callback URL sanitization:

```typescript
import { OAuthImplementations, AuthCallback } from "@beep/iam-client";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Str from "effect/String";

// OAuth with provider
const signInWithGoogle = F.pipe(
  OAuthImplementations.SignIn({
    provider: "google",
    callbackURL: AuthCallback.getURL("/dashboard")
  })
);

// Sanitize callback targets before redirecting
const resolveCallbackTarget = (raw: string | null | undefined) =>
  AuthCallback.sanitizePath(F.pipe(raw ?? AuthCallback.defaultTarget, Str.trim));
```

### Two-Factor Authentication

TOTP-based 2FA setup and verification:

```typescript
import { TwoFactorImplementations } from "@beep/iam-client";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";

// Enable 2FA and get QR code
const enable2FA = F.pipe(
  TwoFactorImplementations.Enable(),
  Effect.map((result) => ({
    qrCode: result.qrCode,
    backupCodes: result.backupCodes
  }))
);

// Verify TOTP code
const verify2FA = (code: string) =>
  TwoFactorImplementations.Verify({ code });

// Disable 2FA
const disable2FA = (password: string) =>
  TwoFactorImplementations.Disable({ password });
```

### Implementing New Contract Handlers

When creating new contract implementations, follow the continuation-based pattern:

```typescript
import { client, $store } from "@beep/iam-client/adapters/better-auth";
import { addFetchOptions, requireData } from "@beep/iam-client/clients/_internal";
import { SignInSocialContract } from "@beep/iam-client/clients/sign-in/sign-in.contracts";
import { IamError } from "@beep/iam-client/errors";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";

// Define implementation using Contract.implement
export const SignInWithProviderHandler = SignInSocialContract.implement(
  Effect.fn(function* (payload, { continuation }) {
    // 1. Run better-auth call via continuation
    const result = yield* continuation.run((handlers) =>
      client.signIn.social(
        addFetchOptions(handlers, {
          provider: payload.provider,
          callbackURL: payload.callbackURL ?? undefined,
        })
      )
    );

    // 2. Raise result for telemetry/error handling
    yield* continuation.raiseResult(result);

    // 3. Notify session signal if successful
    if (result.error == null) {
      $store.notify("$sessionSignal");
    }

    // 4. Require data or fail with structured error
    const data = yield* requireData(result.data, "SignInWithProviderHandler", continuation.metadata);

    // 5. Decode and validate response
    return yield* SignInSocialContract.decodeUnknownSuccess(data);
  }, Effect.catchTags({
    ParseError: (error) => Effect.fail(IamError.match(error, continuation.metadata)),
  }))
);
```

Key steps in the continuation pattern:

1. **Run the operation**: Use `continuation.run` to execute better-auth calls with fetch handlers
2. **Raise result**: Call `continuation.raiseResult` for telemetry and error tracking
3. **Notify session**: Fire `$store.notify("$sessionSignal")` for session-mutating operations (import `$store` from `@beep/iam-client/adapters/better-auth`)
4. **Validate data**: Use `requireData` helper to ensure data exists or fail gracefully
5. **Decode response**: Use contract's `decodeUnknownSuccess` for type-safe validation
6. **Handle errors**: Catch `ParseError` and other errors, normalize to `IamError`

## What Belongs Here

- **Client contracts** for IAM operations defined with `Contract.make` from `@beep/contract`
- **Contract implementations** wrapping better-auth operations via `Contract.implement` with continuation handlers
- **React integration** via atoms, hooks, and form helpers
- **Error normalization** from better-auth to structured `IamError` with metadata
- **Client-safe operations** only (no direct database or server-only operations)
- **Form validation** schemas for registration, login, password changes, etc.
- **OAuth/SSO helpers** for third-party authentication flows with callback URL sanitization
- **Better-auth adapter** wrapping client instantiation and session state management

## What Must NOT Go Here

- **Server-side operations**: database queries, session creation, token signing belong in `@beep/iam-server`
- **Domain models**: entity definitions and business logic belong in `@beep/iam-domain`
- **Database schemas**: Drizzle table definitions belong in `@beep/iam-tables`
- **Server ManagedRuntime**: use `@beep/runtime-client` for client-side runtime
- **UI components**: presentational components belong in `@beep/iam-ui`
- **Handler services**: avoid resurrecting `AuthHandler` or `auth-wrapper` patterns; keep implementations focused on transport and error shaping

This is the SDK/contract layer. Keep it focused on client-facing Effect contracts, contract implementations via better-auth, and React integration.

## Dependencies

### Core Dependencies

| Package                      | Purpose                                                    |
|------------------------------|------------------------------------------------------------|
| `effect`                     | Core Effect runtime and Schema system                      |
| `better-auth`                | Authentication framework                                   |
| `@beep/contract`             | Contract system for type-safe request/response schemas    |
| `@beep/iam-domain`           | IAM domain models and entities                             |
| `@beep/iam-server`           | Better-auth server configuration and types                 |
| `@beep/iam-tables`           | Drizzle schemas for IAM tables                             |
| `@beep/shared-domain`        | Shared domain entities (User, Organization)                |
| `@beep/shared-client`        | Shared SDK patterns and utilities                          |
| `@beep/schema`               | Reusable Effect schemas (Email, Password, EntityId, etc.)  |
| `@beep/errors`               | Error logging and telemetry                                |
| `@beep/constants`            | Schema-backed enums and constants                          |
| `@beep/identity`             | Package identity system                                    |
| `@beep/invariant`            | Assertion contracts                                        |
| `@beep/utils`                | Pure runtime helpers                                       |

### UI & React Integration

| Package                      | Purpose                                                    |
|------------------------------|------------------------------------------------------------|
| `@effect-atom/atom`          | Core atom system                                           |
| `@effect-atom/atom-react`    | Reactive atoms for React integration                       |
| `@beep/ui`                   | UI components and form utilities                           |
| `@beep/ui-core`              | Design tokens and MUI theme                                |
| `react`                      | React library                                              |
| `react-dom`                  | React DOM rendering                                        |
| `next`                       | Next.js for routing and server components                  |

### Better-auth Plugins

| Package                      | Purpose                                                    |
|------------------------------|------------------------------------------------------------|
| `@better-auth/passkey`       | Passkey/WebAuthn plugin                                    |
| `@better-auth/sso`           | Enterprise SSO plugin (SAML/OIDC)                          |
| `@better-auth/stripe`        | Stripe billing integration                                 |
| `@better-auth/scim`          | SCIM user provisioning                                     |
| `@better-auth/utils`         | Better-auth utility functions                              |
| `better-auth-localization`   | Internationalization support                               |

### Additional Dependencies

| Package                      | Purpose                                                    |
|------------------------------|------------------------------------------------------------|
| `jose`                       | JWT utilities for token handling                           |
| `@simplewebauthn/server`     | WebAuthn server utilities                                  |
| `dub`                        | URL shortening integration                                 |
| `stripe`                     | Stripe SDK                                                 |
| `sonner`                     | Toast notifications                                        |
| `mutative`                   | Immutable state updates                                    |

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

## Guidelines for Adding New Clients

- **Follow the pattern**: each client needs `*.contracts.ts`, `*.implementations.ts`, optionally `*.atoms.ts`, `*.forms.ts`, and `*.service.ts`
- **Contract definition**: define individual contracts with `Contract.make` from `@beep/contract`, include metadata annotations
- **Contract grouping**: group related contracts with `ContractKit.make` to create a `*ContractKit`
- **Contract implementation**: implement via `ContractName.implement(Effect.fn(function* (payload, { continuation }) { ... }))`
- **Error handling**: all contracts must fail with `IamError` for consistent error handling; use `IamError.match` to normalize errors
- **Continuation handlers**: call better-auth with `continuation.run` and fetch option helpers, raise results via `continuation.raiseResult`, decode with `ContractName.decodeUnknownSuccess`
- **Session notifications**: import `$store` from `@beep/iam-client/adapters/better-auth` and fire `$store.notify("$sessionSignal")` after successful operations that mutate session state
- **Atoms with toasts**: use `withToast` wrapper from `@beep/ui/common/with-toast` for user feedback in atom definitions
- **Effect patterns**: use `F.pipe`, Effect Array/String utilities (`A.*`, `Str.*`), never native methods
- **TypeScript**: avoid `any`, use branded types from domain, validate with schemas
- **Internal helpers**: use `_internal` helpers like `addFetchOptions`, `requireData`, `withFetchOptions` when calling better-auth
- **Export pattern**: export individual contracts by name, then create and export one `*Implementations` object via `ContractKit.of()`

## Testing

- Use Bun test for contract and implementation tests
- Mock better-auth client responses via `_internal` helpers
- Test error normalization from `BetterAuthError` to `IamError` with metadata preservation
- Verify contract schema validation (payload, success, failure)
- Test continuation handler flows (encode, run, raise, decode)
- Verify form validation rules and schema transformations
- Test atom reactivity and toast notifications with `withToast`
- Located in `test/` directory (currently placeholder suite, expand alongside new logic)

## Relationship to Other Packages

- `@beep/contract` — Contract system providing `Contract.make`, `ContractKit`, and continuation handlers
- `@beep/iam-domain` — Entity models and business logic consumed by contracts
- `@beep/iam-server` — Server-side implementations of IAM operations (better-auth server setup)
- `@beep/iam-tables` — Drizzle schemas for IAM tables
- `@beep/iam-ui` — UI components consuming these SDK contract implementations and forms
- `@beep/shared-client` — Shared SDK patterns and utilities
- `@beep/runtime-client` — Client ManagedRuntime for executing Effect programs in browser
- `@beep/ui` — UI utilities including `withToast` for atom feedback

## Versioning and Changes

- Breaking changes to contracts require coordination with `@beep/iam-server` and `@beep/iam-ui`
- Prefer additive changes (new contracts, new implementations)
- Document contract changes in PR descriptions with metadata updates
- Update AGENTS.md when contract patterns or continuation handlers evolve
- Maintain backward compatibility for atoms and form hooks consumed by UI layers
