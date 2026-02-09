# @beep/iam-server

Infrastructure layer for the IAM slice. Provides Effect Layers, repositories, and Better Auth integration that bind IAM domain models to Postgres and external auth providers without leaking raw clients to application code.

## Purpose

`@beep/iam-server` implements the infrastructure layer for Identity and Access Management, providing:
- Database repositories for all IAM entities (23 repos) using the `DbRepo.make` factory pattern from `@beep/shared-domain/factories`
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
| `IamDb.Db` | Context tag and Layer for Drizzle-backed Postgres access with IAM schema |
| `IamRepos.layer` | Merged Layer providing 23 repository services |
| `Auth.Service` | Better Auth integration with plugin aggregation and session management |
| `Auth.Options` | Better Auth configuration effect with all plugins and IAM-specific schemas |
| `Auth.BetterAuthBridge` | Type bridge for Better Auth organization plugin operations |
| Individual repos | `AccountRepo`, `UserRepo`, `SessionRepo`, etc. exported directly |

## Usage

### Basic Layer Composition

```typescript
import { Auth, IamDb, IamRepos } from "@beep/iam-server";
import * as Layer from "effect/Layer";

const IamInfraLayer = Layer.mergeAll(
  IamDb.Db.Live,
  IamRepos.layer,
  Auth.Service.Default
);
```

### Using Repository Services

```typescript
import { UserRepo } from "@beep/iam-server";
import { IamEntityIds } from "@beep/shared-domain";
import * as Effect from "effect/Effect";

const program = Effect.gen(function* () {
  const userRepo = yield* UserRepo;
  const userId = IamEntityIds.UserId.make("shared_user__abc123");

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

### Email Integration

Authentication emails (verification, password reset, invitations, OTP) are handled internally by the Better Auth service through `@beep/shared-server/Email` with React-based templates. Email sending is configured via the `Auth.Service` Layer and requires `Email.ResendService` from `@beep/shared-server`.

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
IamDb.Db.Live
  ├─> IamRepos.layer (requires IamDb.Db)
  └─> Auth.Service.Default
        ├─> Auth.AuthEmailService.Default
        └─> IamDb.Db.Live
```

Route handlers depend on:
- `Auth.Service` for Better Auth operations
- `HttpServerRequest.HttpServerRequest` for request context

### Integration

`@beep/iam-server` integrates with the following packages:

- **Consumed by**: `apps/server` (runtime composition),  (Better Auth routes)
- **Consumes**: `@beep/iam-domain` (entity models), `@beep/iam-tables` (schema definitions)
- **Shared infrastructure**: `@beep/shared-server` (Db, Email, Repo factories)

## Notes

- All services extend `Effect.Service` with explicit dependencies declared via Layer composition
- Use `Effect.withSpan` and `Effect.annotateLogs` for observability tracing
- Database hooks automatically create personal organizations on signup and set session context
- All secrets use `Redacted<string>` to prevent accidental logging exposure
- Better Auth integration is exposed via `Auth.Service` - never import `better-auth` directly in application code
- Repositories follow the `DbRepo.make` factory pattern from `@beep/shared-domain/factories`
- Email functionality is integrated into `Auth.Service` via `@beep/shared-server/Email` with React templates

## Examples

### Adding a New Repository (Internal Development Pattern)

When extending the IAM infrastructure with a new entity repository within this package:

```typescript
// File: src/db/repos/AuditLog.repo.ts
import { DbRepo } from "@beep/shared-domain/factories";
import { Entities } from "@beep/iam-domain";
import { IamDb } from "@beep/iam-server/db";
import { $IamServerId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

const $I = $IamServerId.create("db/repos/AuditLog.repo");

export class AuditLogRepo extends Effect.Service<AuditLogRepo>()(
  $I`AuditLogRepo`,
  {
    dependencies: [IamDb.layer] as const,
    accessors: true,
    effect: DbRepo.make(
      SharedEntityIds.AuditLogId,
      Entities.AuditLog.Model,
      Effect.gen(function* () {
        yield* IamDb.Db; // Ensure database is injected
        return {};
      })
    ),
  }
) {}

// 1. Export via src/db/repos/index.ts
export * from "./AuditLog.repo";

// 2. Add to IamRepos.layer in src/db/repositories.ts
export const layer = Layer.mergeAll(
  // ...existing repos...
  AuditLogRepo.Default
);
```

### Using Better Auth API

```typescript
import { Auth } from "@beep/iam-server";
import * as Effect from "effect/Effect";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";

const program = Effect.gen(function* () {
  const authService = yield* Auth.Service;
  const request = yield* HttpServerRequest.HttpServerRequest;

  // Access Better Auth API methods
  const session = yield* Effect.tryPromise(() =>
    authService.auth.api.getSession({
      headers: request.headers,
    })
  );

  return session;
});
```

### Creating Custom Better Auth Integration

```typescript
import { Auth } from "@beep/iam-server";
import { IamDb } from "@beep/iam-server";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

// Extend Better Auth service with custom logic
const CustomAuthLayer = Layer.effect(
  Auth.Service,
  Effect.gen(function* () {
    const db = yield* IamDb.Db;
    const authOptions = yield* Auth.Options;

    // Create custom Better Auth instance with additional plugins
    return {
      auth: authOptions,
      // Add custom methods here
    };
  })
);
```

## Related Documentation

For implementation details and architectural guidance:
- `AGENTS.md` - Agent-specific patterns and guardrails
- Repository root `CLAUDE.md` - Repository-wide conventions

## Related Packages

- `@beep/iam-domain` - IAM entity models and business logic
- `@beep/iam-tables` - Drizzle schemas for IAM entities
- `@beep/iam-client` - Client-side contracts for IAM operations
- `@beep/iam-ui` - React components for IAM flows
- `@beep/shared-server` - Shared infrastructure utilities (Db, Email, Repo)
- `@beep/shared-domain` - Cross-slice entity IDs and domain models
