# @beep/iam-sdk

Client SDK and presentation layer for the IAM system, providing Effect-first authentication flows, contracts, and React integration via better-auth.

## Purpose

The IAM SDK provides a complete client-side authentication system built on better-auth with Effect patterns. It offers type-safe contracts, reactive atoms, form helpers, and service layers for all authentication flows including sign-in, sign-up, multi-session, OAuth, SSO, passkeys, two-factor, and user management. This package bridges better-auth's authentication primitives with Effect's type-safety and composability, while providing React hooks and form utilities for seamless UI integration.

## Key Exports

| Export                     | Description                                                                         |
|----------------------------|-------------------------------------------------------------------------------------|
| `AuthClient`               | Type alias for better-auth client with all configured plugins                       |
| `BetterAuthError`          | Tagged error for better-auth specific failures                                      |
| `IamError`                 | Tagged error with metadata for all IAM operations (code, status, plugin, method)    |
| `SignInService`            | Effect service with sign-in contracts and implementations                           |
| `SignUpService`            | Effect service for user registration flows                                          |
| `UserService`              | User management service (update profile, change email/password, phone)              |
| `SessionService`           | Session management and validation                                                   |
| `MultiSessionService`      | Multi-session support (list, switch, revoke sessions)                               |
| `TwoFactorService`         | TOTP two-factor authentication flows                                                |
| `PasskeyService`           | WebAuthn passkey registration and authentication                                    |
| `OAuthService`             | OAuth provider integration (Google, GitHub, etc.)                                   |
| `SSOService`               | Enterprise SSO via SAML/OIDC                                                        |
| `OrganizationService`      | Organization/tenant management                                                      |
| `DeviceAuthorizationService` | Device authorization flow for CLI/IoT devices                                     |
| `ApiKeyService`            | API key generation and validation                                                   |
| `VerifyService`            | Email and phone verification                                                        |
| `RecoverService`           | Password recovery and reset flows                                                   |
| `SignOutService`           | Sign-out with session cleanup                                                       |
| `useChangePassword`        | React hook for password change form                                                 |
| `useUpdateUsername`        | React hook for username update                                                      |
| `useSignUpForm`            | Form helper for registration with validation                                        |
| `AuthCallback`             | Constants for OAuth/SSO callback URLs                                               |

## Architecture Fit

- **Vertical Slice + Hexagonal**: SDK layer bridges IAM domain/infra with UI, exposing only contracts and client-safe operations
- **Effect-first**: All services return `Effect<Success, IamError, never>` with structured error handling
- **Contract-driven**: Uses `@beep/contract` for type-safe request/response schemas with metadata annotations
- **Reactive**: Atoms via `@effect-atom/atom-react` for optimistic UI updates with reactivity keys
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

- **`*.contracts.ts`**: Effect contracts defining payload, success, and failure schemas
- **`*.service.ts`**: Effect service with dependencies and live layer
- **`*.implementations.ts`**: Contract implementations calling better-auth
- **`*.atoms.ts`**: Reactive atoms with toast notifications and reactivity keys
- **`*.forms.ts`**: React hook form helpers with schema validation

## Usage

### Namespace Import

Prefer named imports for services and errors:

```typescript
import { UserService, SignInService, IamError } from "@beep/iam-sdk";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
```

### Service Layer Usage

Services follow Effect's dependency injection pattern:

```typescript
import { UserService } from "@beep/iam-sdk";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";

// Use service in Effect context
const updateProfile = F.pipe(
  UserService.UpdateUserIdentity({
    firstName: "John",
    lastName: "Doe"
  }),
  Effect.catchTag("IamError", (error) =>
    Effect.log(`Update failed: ${error.message}`)
  )
);

// Run with live layer
const program = updateProfile.pipe(
  Effect.provide(UserService.Live)
);
```

### Contracts

Contracts provide type-safe schemas with domain/method metadata:

```typescript
import { ChangePasswordContract } from "@beep/iam-sdk";
import * as S from "effect/Schema";
import * as F from "effect/Function";

// Contract structure
ChangePasswordContract.payloadSchema;  // Input validation schema
ChangePasswordContract.successSchema;  // Success response schema
ChangePasswordContract.failureSchema;  // Error schema (IamError)

// Decode payload
const payload = F.pipe(
  {
    password: "NewPass123!",
    passwordConfirm: "NewPass123!",
    currentPassword: "OldPass123!",
    revokeOtherSessions: false
  },
  S.decodeUnknownSync(ChangePasswordContract.payloadSchema)
);
```

### React Hooks with Atoms

Atoms provide reactive, optimistic updates with toast notifications:

```typescript
import { useChangePassword, useUpdateUsername } from "@beep/iam-sdk";

function ProfileSettings() {
  const { changePassword } = useChangePassword();
  const { updateUsername } = useUpdateUsername();

  const handlePasswordChange = async (data: ChangePasswordPayload) => {
    // Atom automatically shows toast notifications:
    // - "Changing password..." (waiting)
    // - "Password changed successfully" (success)
    // - Error message (failure)
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
import { IamError, UserService } from "@beep/iam-sdk";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";

const program = F.pipe(
  UserService.ChangeEmail({
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

### Multi-Session Management

Handle multiple concurrent sessions:

```typescript
import { MultiSessionService } from "@beep/iam-sdk";
import * as Effect from "effect/Effect";
import * as A from "effect/Array";
import * as F from "effect/Function";

const listSessions = F.pipe(
  MultiSessionService.ListSessions(),
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
  MultiSessionService.SwitchSession({ sessionId });

const revokeSession = (sessionId: string) =>
  MultiSessionService.RevokeSession({ sessionId });
```

### OAuth/SSO Integration

OAuth and SSO flows with callback constants:

```typescript
import { OAuthService, SSOService, AuthCallback } from "@beep/iam-sdk";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";

// OAuth with provider
const signInWithGoogle = F.pipe(
  OAuthService.SignIn({
    provider: "google",
    callbackURL: AuthCallback.OAUTH_CALLBACK
  })
);

// Enterprise SSO
const signInWithSAML = F.pipe(
  SSOService.SignIn({
    organizationSlug: "acme-corp",
    callbackURL: AuthCallback.SSO_CALLBACK
  })
);
```

### Passkey Support

WebAuthn passkey registration and authentication:

```typescript
import { PasskeyService } from "@beep/iam-sdk";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";

const registerPasskey = F.pipe(
  PasskeyService.Register({
    deviceName: "MacBook Pro"
  })
);

const signInWithPasskey = F.pipe(
  PasskeyService.Authenticate()
);
```

### Two-Factor Authentication

TOTP-based 2FA setup and verification:

```typescript
import { TwoFactorService } from "@beep/iam-sdk";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";

// Enable 2FA and get QR code
const enable2FA = F.pipe(
  TwoFactorService.Enable(),
  Effect.map((result) => ({
    qrCode: result.qrCode,
    backupCodes: result.backupCodes
  }))
);

// Verify TOTP code
const verify2FA = (code: string) =>
  TwoFactorService.Verify({ code });

// Disable 2FA
const disable2FA = (password: string) =>
  TwoFactorService.Disable({ password });
```

## What Belongs Here

- **Client contracts** for IAM operations with Effect schemas
- **Service layers** exposing better-auth operations as Effect services
- **React integration** via atoms, hooks, and form helpers
- **Error normalization** from better-auth to structured `IamError`
- **Client-safe operations** only (no direct database or server-only operations)
- **Form validation** schemas for registration, login, password changes, etc.
- **OAuth/SSO helpers** for third-party authentication flows

## What Must NOT Go Here

- **Server-side operations**: database queries, session creation, token signing belong in `@beep/iam-infra`
- **Domain models**: entity definitions and business logic belong in `@beep/iam-domain`
- **Database schemas**: Drizzle table definitions belong in `@beep/iam-tables`
- **Server ManagedRuntime**: use `@beep/runtime-client` for client-side runtime
- **UI components**: presentational components belong in `@beep/iam-ui`

This is the SDK/contract layer. Keep it focused on client-facing Effect contracts, service wrappers, and React integration.

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

- **Follow the pattern**: each client needs contracts, service, implementations, atoms, and optionally forms
- **Contract annotations**: always annotate contracts with `Contract.Title`, `Contract.Domain`, and `Contract.Method`
- **Error handling**: all contracts must fail with `IamError` for consistent error handling
- **Atoms with toasts**: provide user feedback via `withToast` wrapper in atom definitions
- **Reactivity keys**: specify appropriate reactivity keys for atom invalidation (e.g., `["session"]`)
- **Form validation**: compose contract payload schemas with additional validation (e.g., password confirmation)
- **Effect patterns**: use `F.pipe`, Effect Array/String utilities (`A.*`, `Str.*`), never native methods
- **Service layer**: expose via `Effect.Service` with `Live` layer for dependency injection
- **TypeScript**: avoid `any`, use branded types from domain, validate with schemas

## Testing

- Use Vitest for contract and service tests
- Mock better-auth client responses
- Test error normalization from `BetterAuthError` to `IamError`
- Verify form validation rules and schema transformations
- Test atom reactivity and toast notifications
- Located in `test/` directory

## Relationship to Other Packages

- `@beep/iam-domain` — Entity models and business logic consumed by contracts
- `@beep/iam-infra` — Server-side implementations of IAM operations
- `@beep/iam-tables` — Drizzle schemas for IAM tables
- `@beep/iam-ui` — UI components consuming these SDK services and forms
- `@beep/shared-sdk` — Shared SDK patterns and utilities
- `@beep/runtime-client` — Client ManagedRuntime for executing Effect programs in browser

## Versioning and Changes

- Breaking changes to contracts require coordination with `@beep/iam-infra` and `@beep/iam-ui`
- Prefer additive changes (new contracts, new service methods)
- Document contract changes in PR descriptions
- Update AGENTS.md when patterns evolve
