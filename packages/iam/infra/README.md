# @beep/iam-infra

Infrastructure layer for the IAM slice. Provides Effect Layers, repositories, and Better Auth integration that bind IAM domain models to Postgres, Redis, and external auth providers without leaking raw clients to application code.

## Contents

- **Database**: `IamDb.IamDb` tag and `IamDb.IamDb.Live` layer for Drizzle-backed Postgres access with IAM schema.
- **Repositories**: `IamRepos.layer` merging 21+ repositories (User, Session, Organization, Member, etc.) built on `@beep/shared-infra/Repo` conventions.
- **Configuration**: `IamConfig` tag plus helpers to project `@beep/shared-infra/ServerEnv` into auth-ready settings.
- **Auth Services**:
  - `AuthService`: Better Auth integration with plugin aggregation, database hooks, and session management.
  - `AuthEmailService`: Email delivery for verification, password reset, invitations, and OTP.
- **Better Auth Plugins**: 25+ custom plugins for passkeys, SSO, organizations, Stripe billing, JWT, multi-session, SCIM, OIDC, and more.

## Usage

Compose layers in runtimes:

```typescript
import { IamDb, IamRepos, IamConfig, AuthService, AuthEmailService } from "@beep/iam-infra";
import * as Layer from "effect/Layer";

const IamInfraLayer = Layer.mergeAll(
  IamDb.IamDb.Live,
  IamRepos.layer,
  IamConfig.Live,
  AuthEmailService.Default,
  AuthService.Default
);
```

See `packages/iam/infra/AGENTS.md` for detailed surface map, guardrails, and usage snapshots.

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

`AuthService` provides a fully-configured Better Auth instance with:

- **Account Linking**: Unified identity across multiple OAuth providers
- **Email Verification**: Automated flows for signup and email changes
- **Password Management**: Secure reset flows with templated emails
- **Session Management**: 30-day sessions with cookie caching and organization context
- **Database Hooks**: Automatic personal organization creation on user signup, active organization context on session creation
- **Rate Limiting**: Built-in protection against brute force attacks

### Email Service

`AuthEmailService` handles all authentication-related email delivery:

- Verification emails for new accounts and email changes
- Password reset emails with branded templates
- Organization invitation emails
- OTP delivery for two-factor authentication

All emails use Resend via `@beep/shared-infra/Email` with React-based templating.

### Better Auth Plugins

The package includes custom plugins extending Better Auth functionality:

- **Authentication**: Passkeys (WebAuthn), Two-Factor (TOTP), Phone Number, Username, Anonymous
- **Enterprise**: SSO (SAML, OIDC), SCIM, Organization Management, Custom Session
- **OAuth**: Generic OAuth, OAuth Proxy, OIDC Provider, Device Authorization, One-Tap
- **Security**: reCAPTCHA, Have I Been Pwned, JWT, Bearer Token, API Key
- **Integrations**: Stripe Billing, Dub Analytics, SIWE (Sign-In with Ethereum)
- **Features**: Multi-Session, Last Login Method, Localization, MCP, Cookies, One-Time Token, OpenAPI

## Configuration

`IamConfig` provides type-safe access to environment configuration:

```typescript
import { IamConfig } from "@beep/iam-infra";
import * as Effect from "effect/Effect";

const program = Effect.gen(function* () {
  const config = yield* IamConfig;

  // Access nested configuration
  const authUrl = config.app.authUrl;
  const oauthProviders = config.oauth.authProviderNames;
  const secret = config.auth.secret; // Redacted<string>
});
```

For testing, use `IamConfig.layerFrom` to override defaults:

```typescript
import { serverEnv } from "@beep/shared-infra";
import { IamConfig } from "@beep/iam-infra";

const TestConfig = IamConfig.layerFrom({
  ...serverEnv,
  app: { ...serverEnv.app, env: "test" },
});
```

## Development

```bash
# Type checking
bun run check --filter=@beep/iam-infra

# Linting
bun run lint --filter=@beep/iam-infra
bun run lint:fix --filter=@beep/iam-infra

# Testing
bun run test --filter=@beep/iam-infra

# Testing with Docker (repositories)
bun run test --filter=@beep/db-admin -- --grep "@beep/iam-infra"
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
  ├─> IamRepos.layer (requires IamDb + Db.PgClientServices)
  ├─> IamConfig.Live (requires ServerEnv)
  └─> AuthService.Default
        ├─> AuthEmailService.DefaultWithoutDependencies
        ├─> IamDb.IamDb.Live
        └─> IamConfig.Live
```

### Import Rules

- Cross-slice imports only through `@beep/shared-*` or `@beep/common-*`
- Use `@beep/*` path aliases (defined in `tsconfig.base.jsonc`)
- Never direct cross-slice imports or relative `../../../` paths
- Namespace imports for Effect modules: `import * as Effect from "effect/Effect"`
- Single-letter aliases for frequent modules: `import * as A from "effect/Array"`

## Notes

- Avoid direct `process.env` reads; consume config through `IamConfig`
- Keep new API surface aligned with tagged errors and Effect namespace import rules
- Use `Effect.withSpan` and `Effect.annotateLogs` for telemetry
- Database hooks auto-create personal organizations and set session context
- All secrets use `Redacted<string>` to prevent accidental logging
- Better Auth plugins are aggregated via `AllPlugins` effect for consistency

## Examples

### Using a Repository

```typescript
import { UserRepo } from "@beep/iam-infra";
import { SharedEntityIds } from "@beep/shared-domain";
import * as Effect from "effect/Effect";

const program = Effect.gen(function* () {
  const userRepo = yield* UserRepo;
  const userId = SharedEntityIds.UserId.create();

  const user = yield* userRepo.findById(userId);
  // ...
});
```

### Adding a New Repository

```typescript
import { Repo } from "@beep/shared-infra/Repo";
import { Entities } from "@beep/iam-domain";
import { dependencies } from "@beep/iam-infra/adapters/repos/_common";
import { IamDb } from "@beep/iam-infra/db";
import { IamEntityIds } from "@beep/shared-domain";
import * as Effect from "effect/Effect";

export class AuditLogRepo extends Effect.Service<AuditLogRepo>()(
  "@beep/iam-infra/adapters/repos/AuditLogRepo",
  {
    dependencies,
    accessors: true,
    effect: Repo.make(
      IamEntityIds.AuditLogId,
      Entities.AuditLog.Model,
      Effect.gen(function* () {
        yield* IamDb.IamDb; // ensure Db injected
        return {};
      })
    ),
  }
) {}

// Then export via src/adapters/repos/index.ts
// and append AuditLogRepo.Default to IamRepos.layer
```

### Using Auth Service

```typescript
import { AuthService } from "@beep/iam-infra";
import * as Effect from "effect/Effect";

const program = Effect.gen(function* () {
  const { auth } = yield* AuthService;

  // Better Auth instance is available
  const session = await auth.api.getSession({ headers: request.headers });
});
```

## Related Packages

- `@beep/iam-domain` - IAM entity models and business logic
- `@beep/iam-tables` - Drizzle schemas for IAM entities
- `@beep/iam-sdk` - Client-side contracts for IAM operations
- `@beep/shared-infra` - Shared infrastructure utilities (Db, Email, Repo)
- `@beep/shared-domain` - Cross-slice entity IDs and domain models

## License

MIT
