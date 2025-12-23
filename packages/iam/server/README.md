# @beep/iam-server

Infrastructure layer for the IAM slice. Provides Effect Layers, repositories, and Better Auth integration that bind IAM domain models to Postgres and external auth providers without leaking raw clients to application code.

## Purpose

`@beep/iam-server` implements the infrastructure layer for Identity and Access Management, providing:
- Database repositories for all IAM entities (23 repos) using the `@beep/shared-server/Repo` factory pattern
- Better Auth service integration with custom plugins and database hooks
- Effect-based API route handlers for authentication flows
- Email service for authentication-related communications
- Type-safe Effect Layers that compose into server runtimes

This package sits between `@beep/iam-domain` (business logic) and consuming applications, ensuring infrastructure concerns remain isolated from domain models.

## Installation

```bash
# This package is internal to the monorepo
# Add as a dependency in your package.json:
"@beep/iam-server": "workspace:*"
```

## Key Exports

| Export | Description |
|--------|-------------|
| `IamDb.IamDb` | Context tag and Layer for Drizzle-backed Postgres access with IAM schema |
| `IamRepos.layer` | Merged Layer providing 23 repository services |
| `Auth.Service` | Better Auth integration with plugin aggregation and session management |
| `Auth.AuthEmailService` | Email delivery for verification, password reset, invitations, and OTP |
| `IamApiLive` | Merged Layer for all IAM API route handlers |
| `IamApiV1` | Namespace export for v1 API handlers (SignIn, SignUp, Admin, etc.) |

## Usage

### Basic Layer Composition

```typescript
import { Auth, IamDb, IamRepos } from "@beep/iam-server";
import * as Layer from "effect/Layer";

const IamInfraLayer = Layer.mergeAll(
  IamDb.IamDb.Live,
  IamRepos.layer,
  Auth.AuthEmailService.Default,
  Auth.Service.layer
);
```

### Using Repository Services

```typescript
import { UserRepo } from "@beep/iam-server";
import { IamEntityIds } from "@beep/shared-domain";
import * as Effect from "effect/Effect";

const program = Effect.gen(function* () {
  const userRepo = yield* UserRepo;
  const userId = IamEntityIds.UserId.create();

  const user = yield* userRepo.findById(userId);
  return user;
});
```

### Using Auth Service

```typescript
import { Auth } from "@beep/iam-server";
import * as Effect from "effect/Effect";

const program = Effect.gen(function* () {
  const authService = yield* Auth.Service;

  // Better Auth instance is available for use
  const session = yield* Effect.tryPromise(() =>
    authService.auth.api.getSession({ headers: request.headers })
  );

  return session;
});
```

## Key Features

### Database & Repositories

The package provides a complete repository layer for all IAM entities:

- **User Management**: `UserRepo`, `AccountRepo`, `SessionRepo`, `VerificationRepo`
- **Organizations**: `OrganizationRepo`, `MemberRepo`, `TeamRepo`, `TeamMemberRepo`, `InvitationRepo`, `OrganizationRoleRepo`
- **Authentication**: `PasskeyRepo`, `TwoFactorRepo`, `ApiKeyRepo`, `WalletAddressRepo`
- **OAuth & OIDC**: `OAuthApplicationRepo`, `OAuthAccessTokenRepo`, `OAuthConsentRepo`, `DeviceCodeRepo`, `JwksRepo`
- **Enterprise**: `SsoProviderRepo`, `ScimProviderRepo`, `SubscriptionRepo`, `RateLimitRepo`

All repositories extend `Effect.Service` and use the `Repo.make` factory pattern for consistent CRUD operations and type safety.

### Better Auth Integration

`Auth.Service` provides a fully-configured Better Auth instance with:

- **Account Linking**: Unified identity across multiple OAuth providers
- **Email Verification**: Automated flows for signup and email changes
- **Password Management**: Secure reset flows with templated emails
- **Session Management**: 30-day sessions with cookie caching and organization context
- **Database Hooks**: Automatic personal organization creation on user signup, active organization context on session creation
- **Rate Limiting**: Built-in protection against brute force attacks

### Email Service

`Auth.AuthEmailService` handles all authentication-related email delivery:

- Verification emails for new accounts and email changes
- Password reset emails with branded templates
- Organization invitation emails
- OTP delivery for two-factor authentication

All emails use Resend via `@beep/shared-server/Email` with React-based templating.

### API Routes

The package provides Effect-based HTTP route handlers that integrate with `@effect/platform/HttpServer`:

```typescript
import { IamApiLive, IamApiV1 } from "@beep/iam-server";
import * as Layer from "effect/Layer";

// Use the complete IAM API layer
const serverLayer = Layer.mergeAll(
  IamApiLive,
  // ...other layers
);

// Or access individual route groups
const signInHandlers = IamApiV1.SignIn;
const signUpHandlers = IamApiV1.SignUp;
```

Route groups available via `IamApiV1`:
- **SignIn**: Social, SSO, username, anonymous authentication
- **SignUp**: Email registration flows
- **Admin**: User management, impersonation, permissions
- **Organization**: Teams, members, roles, invitations
- **Passkey**: WebAuthn registration and authentication
- **TwoFactor**: TOTP enablement and verification
- **ApiKey**: API key creation and management
- **OAuth2**: OAuth client operations
- **SSO**: SAML and OIDC integration

All route handlers follow Effect patterns with tagged errors from `@beep/iam-domain`.

### Better Auth Plugins

The package includes custom plugins extending Better Auth functionality:

- **Authentication**: Passkeys (WebAuthn), Two-Factor (TOTP), Phone Number, Username, Anonymous
- **Enterprise**: SSO (SAML, OIDC), SCIM, Organization Management, Custom Session
- **OAuth**: Generic OAuth, OAuth Proxy, OIDC Provider, Device Authorization, One-Tap
- **Security**: reCAPTCHA, Have I Been Pwned, JWT, Bearer Token, API Key
- **Integrations**: Stripe Billing, Dub Analytics, SIWE (Sign-In with Ethereum)
- **Features**: Multi-Session, Last Login Method, Localization, MCP, Cookies, One-Time Token, OpenAPI

## Dependencies

| Package | Purpose |
|---------|---------|
| `@beep/iam-domain` | IAM entity models, schemas, and business logic |
| `@beep/iam-tables` | Drizzle schema definitions for IAM entities |
| `@beep/shared-server` | Database factory, Email service, Repo patterns |
| `@beep/shared-domain` | Entity ID factories and cross-slice domain models |
| `@beep/schema` | Effect Schema utilities and branded types |
| `better-auth` | Authentication framework with plugin system |
| `effect` | Core Effect runtime and data structures |
| `@effect/platform` | HTTP server abstractions and platform utilities |

## Development

```bash
# Type check
bun run --filter @beep/iam-server check

# Lint
bun run --filter @beep/iam-server lint
bun run --filter @beep/iam-server lint:fix

# Build
bun run --filter @beep/iam-server build

# Test
bun run --filter @beep/iam-server test

# Test repositories with Docker
bun run --filter @beep/db-admin test -- --grep "@beep/iam-server"
```

## Architecture Notes

### Effect-First Design

All services follow Effect-first patterns:

- Services extend `Effect.Service` with explicit dependencies
- Layers compose via `Layer.mergeAll` and `Layer.provideMerge`
- No async/await or bare Promises in application code
- Tagged errors via `Schema.TaggedError` from `effect/Schema`
- Collections via Effect utilities (`Array`, `Option`, `HashMap`)

### Layer Composition

The package follows a strict dependency hierarchy:

```
IamDb.IamDb.Live
  ├─> IamRepos.layer (requires IamDb + Db.SliceDbRequirements)
  └─> Auth.Service.layer
        ├─> Auth.AuthEmailService.Default
        └─> IamDb.IamDb.Live
```

Route handlers depend on:
- `Auth.Service` for Better Auth operations
- `HttpServerRequest.HttpServerRequest` for request context

### Integration

`@beep/iam-server` integrates with the following packages:

- **Consumed by**: `apps/server` (runtime composition), `apps/web` (Better Auth routes)
- **Consumes**: `@beep/iam-domain` (entity models), `@beep/iam-tables` (schema definitions)
- **Shared infrastructure**: `@beep/shared-server` (Db, Email, Repo factories)

## Notes

- All services extend `Effect.Service` with explicit dependencies declared
- Use `Effect.withSpan` and `Effect.annotateLogs` for observability
- Database hooks auto-create personal organizations and set session context
- All secrets use `Redacted<string>` to prevent accidental logging
- Better Auth integration is exposed via `Auth.Service` - never import Better Auth directly
- Route handlers follow Effect patterns with pipe, namespace imports, and tagged errors
- Email templates use React components via `@beep/shared-server/Email`

## Examples

### Adding a New Repository

When adding a new IAM entity, create a repository following this pattern:

```typescript
import { Repo } from "@beep/shared-server/Repo";
import { Entities } from "@beep/iam-domain";
import { dependencies } from "@beep/iam-server/adapters/repos/_common";
import { IamDb } from "@beep/iam-server/db";
import { IamEntityIds } from "@beep/shared-domain";
import * as Effect from "effect/Effect";

export class AuditLogRepo extends Effect.Service<AuditLogRepo>()(
  "@beep/iam-server/adapters/repos/AuditLogRepo",
  {
    dependencies,
    accessors: true,
    effect: Repo.make(
      IamEntityIds.AuditLogId,
      Entities.AuditLog.Model,
      Effect.gen(function* () {
        yield* IamDb.IamDb; // Ensure database is injected
        return {};
      })
    ),
  }
) {}

// Export via src/adapters/repos/index.ts
export * from "./AuditLog.repo";

// Add to IamRepos.layer in src/adapters/repositories.ts
export const layer: IamReposLive = Layer.mergeAll(
  // ...existing repos...
  AuditLogRepo.Default
);
```

### Creating a Custom Route Handler

```typescript
import { Auth } from "@beep/iam-server";
import { IamAuthError } from "@beep/iam-domain";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as HttpServerResponse from "@effect/platform/HttpServerResponse";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";

type HandlerEffect = (args: { readonly payload: MyPayload }) =>
  Effect.Effect<
    HttpServerResponse.HttpServerResponse,
    IamAuthError,
    Auth.Service | HttpServerRequest.HttpServerRequest
  >;

export const Handler: HandlerEffect = Effect.fn("MyHandler")(
  function* ({ payload }) {
    const authService = yield* Auth.Service;
    const request = yield* HttpServerRequest.HttpServerRequest;

    const result = yield* Effect.tryPromise(() =>
      authService.auth.api.someMethod({
        body: payload,
        headers: request.headers,
      })
    );

    return yield* F.pipe(result, HttpServerResponse.json);
  },
  IamAuthError.flowMap("my-operation")
);
```

### Sending Authentication Emails

```typescript
import { Auth } from "@beep/iam-server";
import { BS } from "@beep/schema";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";

const program = Effect.gen(function* () {
  const emailService = yield* Auth.AuthEmailService;

  yield* emailService.sendVerification({
    email: Redacted.make("user@example.com" as BS.Email.Type),
    url: new URL("https://app.example.com/verify?token=xyz"),
  });

  yield* emailService.sendResetPassword({
    username: "johndoe",
    email: Redacted.make("user@example.com" as BS.Email.Type),
    url: new URL("https://app.example.com/reset?token=abc"),
  });
});
```

## Related Documentation

For implementation details and architectural guidance:
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/iam/server/AGENTS.md` - Agent-specific patterns and guardrails
- `/home/elpresidank/YeeBois/projects/beep-effect/AGENTS.md` - Repository-wide conventions

## Related Packages

- `@beep/iam-domain` - IAM entity models and business logic
- `@beep/iam-tables` - Drizzle schemas for IAM entities
- `@beep/iam-client` - Client-side contracts for IAM operations
- `@beep/iam-ui` - React components for IAM flows
- `@beep/shared-server` - Shared infrastructure utilities (Db, Email, Repo)
- `@beep/shared-domain` - Cross-slice entity IDs and domain models
