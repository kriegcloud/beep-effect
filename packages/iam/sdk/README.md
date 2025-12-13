# @beep/iam-sdk

Client SDK and presentation layer for the IAM system, providing Effect-first authentication flows, contracts, and React integration via better-auth.

## Purpose

The IAM SDK provides a complete client-side authentication system built on better-auth with Effect's contract-based architecture. It offers type-safe contracts, contract implementations, reactive atoms, and form helpers for all authentication flows including sign-in, sign-up, multi-session, OAuth, SSO, passkeys, two-factor, and user management. This package bridges better-auth's authentication primitives with Effect's type-safety and composability through the `@beep/contract` system, while providing React hooks and form utilities for seamless UI integration.

## Key Exports

| Export                          | Description                                                                                |
|---------------------------------|--------------------------------------------------------------------------------------------|
| `AuthClient`                    | Type alias for better-auth client with all configured plugins                              |
| `client`                        | Better-auth client instance (from `adapters/better-auth`)                                  |
| `$store`                        | Better-auth store for session state notifications (from `adapters/better-auth`)            |
| `BetterAuthError`               | Tagged error for better-auth specific failures                                             |
| `IamError`                      | Tagged error with metadata for all IAM operations (code, status, plugin, method)           |
| `IamErrorMetadata`              | Metadata schema for structured error handling                                              |
| `SignInContracts`               | Contract definitions for sign-in operations (email, social, credential)                    |
| `SignInImplementations`         | Contract implementations for sign-in flows                                                 |
| `SignUpContracts`               | Contract definitions for user registration                                                 |
| `SignUpImplementations`         | Contract implementations for sign-up flows                                                 |
| `UserContracts`                 | Contracts for user management (update profile, change email/password, phone)               |
| `UserImplementations`           | Implementations for user operations                                                        |
| `SessionContracts`              | Contracts for session management and validation                                            |
| `SessionImplementations`        | Session operation implementations                                                          |
| `MultiSessionContracts`         | Contracts for multi-session support (list, switch, revoke sessions)                        |
| `MultiSessionImplementations`   | Multi-session implementations                                                              |
| `TwoFactorContracts`            | Contracts for TOTP two-factor authentication flows                                         |
| `TwoFactorImplementations`      | 2FA operation implementations                                                              |
| `PasskeyContracts`              | Contracts for WebAuthn passkey registration and authentication                             |
| `PasskeyImplementations`        | Passkey operation implementations                                                          |
| `OAuthContracts`                | Contracts for OAuth provider integration (Google, GitHub, etc.)                            |
| `OAuthImplementations`          | OAuth flow implementations                                                                 |
| `SSOContracts`                  | Contracts for enterprise SSO via SAML/OIDC                                                 |
| `SSOImplementations`            | SSO operation implementations                                                              |
| `OrganizationContracts`         | Contracts for organization/tenant management                                               |
| `OrganizationImplementations`   | Organization operation implementations                                                     |
| `DeviceAuthorizationContracts`  | Contracts for device authorization flow for CLI/IoT devices                                |
| `DeviceAuthorizationImplementations` | Device authorization implementations                                                  |
| `ApiKeyContracts`               | Contracts for API key generation and validation                                            |
| `ApiKeyImplementations`         | API key operation implementations                                                          |
| `VerifyContracts`               | Contracts for email and phone verification                                                 |
| `VerifyImplementations`         | Verification operation implementations                                                     |
| `RecoverContracts`              | Contracts for password recovery and reset flows                                            |
| `RecoverImplementations`        | Password recovery implementations                                                          |
| `SignOutContracts`              | Contracts for sign-out operations                                                          |
| `SignOutImplementations`        | Sign-out implementations with session cleanup                                              |
| `useChangePassword`             | React hook for password change form                                                        |
| `useUpdateUsername`             | React hook for username update                                                             |
| `useSignUpForm`                 | Form helper for registration with validation                                               |
| `AuthCallback`                  | Constants and helpers for OAuth/SSO callback URL sanitization                              |

## Architecture Fit

- **Vertical Slice + Hexagonal**: SDK layer bridges IAM domain/infra with UI, exposing only contracts and client-safe operations
- **Effect-first**: All contract implementations return `Effect<Success, IamError, never>` with structured error handling
- **Contract-driven**: Uses `@beep/contract` for type-safe request/response schemas with metadata annotations (`Contract.make`, `ContractKit`)
- **Better Auth Integration**: Wraps better-auth client methods through `Contract.implement` with continuation-based error handling
- **Reactive**: Atoms via `@effect-atom/atom-react` with `withToast` wrapper for optimistic UI updates and notifications
- **Path alias**: Import as `@beep/iam-sdk`

## Module Structure

```
src/
├── adapters/
│   └── better-auth/       # Better-auth client wrapper, error normalization
├── clients/
│   ├── admin/             # Admin operations (user impersonation, bans)
│   ├── api-key/           # API key contracts, atoms, service
│   ├── device-authorization/ # Device flow for CLI/IoT
│   ├── last-login-method/ # Track last used login method
│   ├── multi-session/     # Multi-session management
│   ├── oauth/             # OAuth provider integration
│   ├── oidc/              # OpenID Connect flows
│   ├── organization/      # Organization/tenant management
│   ├── passkey/           # WebAuthn passkey support
│   ├── recover/           # Password recovery (contracts, forms, atoms)
│   ├── session/           # Session validation and management
│   ├── sign-in/           # Sign-in flows (atoms, contracts, service)
│   ├── sign-out/          # Sign-out with cleanup
│   ├── sign-up/           # Registration (contracts, forms, atoms, service)
│   ├── sso/               # Enterprise SSO (SAML/OIDC)
│   ├── stripe/            # Stripe billing integration
│   ├── two-factor/        # TOTP 2FA (contracts, atoms, service)
│   ├── user/              # User management (profile, email, password, phone)
│   ├── verify/            # Email/phone verification
│   └── _internal/         # Shared client helpers
├── constants/
│   └── AuthCallback/      # OAuth/SSO callback URL constants
└── errors.ts              # IamError and IamErrorMetadata schemas
```

Each client module follows a consistent pattern:

- **`*.contracts.ts`**: Effect contracts defining payload, success, and failure schemas using `Contract.make`
- **`*.implementations.ts`**: Contract implementations calling better-auth via `Contract.implement` with continuation handlers
- **`*.atoms.ts`**: Reactive atoms with toast notifications and reactivity keys using `@effect-atom/atom-react`
- **`*.forms.ts`**: React hook form helpers with schema validation
- **`*.service.ts`**: (Legacy) Some modules may still have service-based exports for compatibility

## Installation

```bash
# This package is internal to the monorepo
# Add as a dependency in your package.json:
"@beep/iam-sdk": "workspace:*"
```

## Usage

### Namespace Import

Prefer named imports for implementations, contracts, and errors:

```typescript
import { UserImplementations, SignInImplementations, IamError } from "@beep/iam-sdk";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
```

### Contract Implementation Usage

Contract implementations provide Effect-based wrappers around better-auth operations:

```typescript
import { UserImplementations } from "@beep/iam-sdk";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";

// Use contract implementation directly
const updateProfile = F.pipe(
  UserImplementations.UpdateUserIdentity({
    firstName: "John",
    lastName: "Doe"
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

Contracts define type-safe schemas with domain/method metadata using `@beep/contract`:

```typescript
import { UserContracts } from "@beep/iam-sdk";
import * as S from "effect/Schema";
import * as F from "effect/Function";

// Access contract schemas
UserContracts.ChangePassword.payloadSchema;  // Input validation schema
UserContracts.ChangePassword.successSchema;  // Success response schema
UserContracts.ChangePassword.failureSchema;  // Error schema (IamError)

// Decode payload with schema
const payload = F.pipe(
  {
    password: "NewPass123!",
    passwordConfirm: "NewPass123!",
    currentPassword: "OldPass123!",
    revokeOtherSessions: false
  },
  S.decodeUnknownSync(UserContracts.ChangePassword.payloadSchema)
);

// Or use contract implementation directly
import { UserImplementations } from "@beep/iam-sdk";

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
import { UserImplementations } from "@beep/iam-sdk";
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
import { useChangePasswordForm, useSignUpForm } from "@beep/iam-sdk";

function PasswordChangeForm() {
  const { form } = useChangePasswordForm({
    onSuccess: () => {
      // Navigate or close dialog
    }
  });

  return (
    <form onSubmit={form.handleSubmit}>
      <input {...form.register("currentPassword")} />
      <input {...form.register("password")} />
      <input {...form.register("passwordConfirm")} />
      <button type="submit">Change Password</button>
    </form>
  );
}
```

### Error Handling

Structured error handling with metadata:

```typescript
import { IamError, UserImplementations } from "@beep/iam-sdk";
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

For guard usage and session state management:

```typescript
import { client, $store } from "@beep/iam-sdk/adapters";

// Access session state
const session = client.useSession();

// Notify session signal after mutations
client.$store.notify("$sessionSignal");

// Use in guards
function AuthGuard({ children }: { children: React.ReactNode }) {
  const session = client.useSession();

  React.useEffect(() => {
    client.$store.notify("$sessionSignal");
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
import { MultiSessionImplementations } from "@beep/iam-sdk";
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

### OAuth/SSO Integration

OAuth and SSO flows with callback URL sanitization:

```typescript
import { OAuthImplementations, SSOImplementations, AuthCallback } from "@beep/iam-sdk";
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

// Enterprise SSO
const signInWithSAML = F.pipe(
  SSOImplementations.SignIn({
    organizationSlug: "acme-corp",
    callbackURL: AuthCallback.getURL("/workspace")
  })
);

// Sanitize callback targets before redirecting
const resolveCallbackTarget = (raw: string | null | undefined) =>
  AuthCallback.sanitizePath(F.pipe(raw ?? AuthCallback.defaultTarget, Str.trim));
```

### Passkey Support

WebAuthn passkey registration and authentication:

```typescript
import { PasskeyImplementations } from "@beep/iam-sdk";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";

const registerPasskey = F.pipe(
  PasskeyImplementations.Register({
    deviceName: "MacBook Pro"
  })
);

const signInWithPasskey = F.pipe(
  PasskeyImplementations.Authenticate()
);
```

### Two-Factor Authentication

TOTP-based 2FA setup and verification:

```typescript
import { TwoFactorImplementations } from "@beep/iam-sdk";
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
import { client } from "@beep/iam-sdk/adapters";
import { addFetchOptions, requireData } from "@beep/iam-sdk/clients/_internal";
import { SignInContracts } from "@beep/iam-sdk/clients/sign-in/sign-in.contracts";
import { IamError } from "@beep/iam-sdk/errors";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";

// Define implementation using Contract.implement
export const SignInWithProviderHandler = SignInContracts.Social.implement(
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
      client.$store.notify("$sessionSignal");
    }

    // 4. Require data or fail with structured error
    const data = yield* requireData(result.data, "SignInWithProviderHandler", continuation.metadata);

    // 5. Decode and validate response
    return yield* SignInContracts.Social.decodeUnknownSuccess(data);
  }, Effect.catchTags({
    ParseError: (error) => Effect.fail(IamError.match(error, continuation.metadata)),
  }))
);
```

Key steps in the continuation pattern:

1. **Run the operation**: Use `continuation.run` to execute better-auth calls with fetch handlers
2. **Raise result**: Call `continuation.raiseResult` for telemetry and error tracking
3. **Notify session**: Fire `$store.notify("$sessionSignal")` for session-mutating operations
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

- **Server-side operations**: database queries, session creation, token signing belong in `@beep/iam-infra`
- **Domain models**: entity definitions and business logic belong in `@beep/iam-domain`
- **Database schemas**: Drizzle table definitions belong in `@beep/iam-tables`
- **Server ManagedRuntime**: use `@beep/runtime-client` for client-side runtime
- **UI components**: presentational components belong in `@beep/iam-ui`
- **Handler services**: avoid resurrecting `AuthHandler` or `auth-wrapper` patterns; keep implementations focused on transport and error shaping

This is the SDK/contract layer. Keep it focused on client-facing Effect contracts, contract implementations via better-auth, and React integration.

## Dependencies

| Package                | Purpose                                                    |
|------------------------|------------------------------------------------------------|
| `effect`               | Core Effect runtime and Schema system                      |
| `better-auth`          | Authentication framework                                   |
| `@beep/contract`       | Contract system for type-safe request/response schemas    |
| `@beep/iam-domain`     | IAM domain models and entities                             |
| `@beep/iam-infra`      | IAM infrastructure implementations                         |
| `@beep/shared-domain`  | Shared domain entities (User, Organization)                |
| `@beep/schema`         | Reusable Effect schemas (Email, Password, etc.)            |
| `@beep/errors`         | Error logging and telemetry                                |
| `@beep/runtime-client` | Client-side ManagedRuntime and atom helpers                |
| `@beep/ui`             | UI components and form utilities                           |
| `@effect-atom/atom-react` | Reactive atoms for React integration                    |
| `react-hook-form`      | Form state management                                      |
| `jose`                 | JWT utilities for token handling                           |
| `@better-auth/passkey` | Passkey/WebAuthn plugin                                    |
| `@better-auth/sso`     | Enterprise SSO plugin                                      |
| `@better-auth/stripe`  | Stripe billing integration                                 |

## Development

```bash
# Type check
bun run --filter @beep/iam-sdk check

# Lint
bun run --filter @beep/iam-sdk lint

# Lint and auto-fix
bun run --filter @beep/iam-sdk lint:fix

# Build
bun run --filter @beep/iam-sdk build

# Run tests
bun run --filter @beep/iam-sdk test

# Test with coverage
bun run --filter @beep/iam-sdk coverage

# Watch mode for development
bun run --filter @beep/iam-sdk dev
```

## Guidelines for Adding New Clients

- **Follow the pattern**: each client needs `*.contracts.ts`, `*.implementations.ts`, optionally `*.atoms.ts` and `*.forms.ts`
- **Contract definition**: define contracts with `Contract.make` from `@beep/contract`, include metadata annotations
- **Contract implementation**: implement via `ContractName.implement(Effect.fn(function* (payload, { continuation }) { ... }))`
- **Error handling**: all contracts must fail with `IamError` for consistent error handling; use `IamError.match` to normalize errors
- **Continuation handlers**: encode payloads via `ContractName.encodePayload`, call better-auth with `continuation.run`, raise results via `continuation.raiseResult`, decode with `ContractName.decodeUnknownSuccess`
- **Session notifications**: fire `client.$store.notify("$sessionSignal")` after successful operations that mutate session state
- **Atoms with toasts**: use `withToast` wrapper from `@beep/ui/common/with-toast` for user feedback in atom definitions
- **Effect patterns**: use `F.pipe`, Effect Array/String utilities (`A.*`, `Str.*`), never native methods
- **TypeScript**: avoid `any`, use branded types from domain, validate with schemas
- **Internal helpers**: use `_internal` helpers like `addFetchOptions`, `requireData`, `withFetchOptions` when calling better-auth

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
- `@beep/iam-infra` — Server-side implementations of IAM operations (better-auth server setup)
- `@beep/iam-tables` — Drizzle schemas for IAM tables
- `@beep/iam-ui` — UI components consuming these SDK contract implementations and forms
- `@beep/shared-sdk` — Shared SDK patterns and utilities
- `@beep/runtime-client` — Client ManagedRuntime for executing Effect programs in browser
- `@beep/ui` — UI utilities including `withToast` for atom feedback

## Versioning and Changes

- Breaking changes to contracts require coordination with `@beep/iam-infra` and `@beep/iam-ui`
- Prefer additive changes (new contracts, new implementations)
- Document contract changes in PR descriptions with metadata updates
- Update AGENTS.md when contract patterns or continuation handlers evolve
- Maintain backward compatibility for atoms and form hooks consumed by UI layers
