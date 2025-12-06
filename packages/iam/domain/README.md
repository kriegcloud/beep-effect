# @beep/iam-domain

The domain layer for the IAM (Identity and Access Management) vertical slice, providing pure entity models, value objects, and tagged errors for authentication, authorization, and user management.

## Purpose

Centralizes IAM domain models via `M.Class` definitions that merge shared audit fields through `makeFields`, giving infrastructure and table layers a single source of truth for schema variants. This package exports Effect-first entity models that integrate seamlessly with Better Auth, Drizzle ORM, and Effect SQL while maintaining type safety and compile-time guarantees.

## Key Exports

| Export | Description |
|--------|-------------|
| `Entities.*` | Namespaced entity models for all IAM domain objects |
| `Entities.Account` | OAuth account linkage with sensitive token wrappers and expiry metadata |
| `Entities.ApiKey` | API key issuance, hashed secrets, and rate limit defaults |
| `Entities.Member` | Organization membership with roles, status, and permissions |
| `Entities.Invitation` | Organization invitation management with expiry logic |
| `Entities.Passkey` | WebAuthn passkey credentials for passwordless authentication |
| `Entities.TwoFactor` | TOTP two-factor authentication settings |
| `Entities.Session` | Re-exported from shared domain for session management |
| `Entities.User` | Re-exported from shared domain for user identity |
| `Entities.Organization` | Re-exported from shared domain for organization context |
| `Entities.Team` | Re-exported from shared domain for team grouping |
| `IamError` | Base tagged error for IAM-specific failures |
| `IamUnknownError` | Unknown error fallback blending shared error contract |
| Error Categories | Specialized errors across admin, auth, captcha, OAuth, passkey, organization, subscription, and more |
| `authViewPaths` | Type-safe path builders for authentication views |
| `accountViewPaths` | Type-safe path builders for account settings |
| `organizationViewPaths` | Constants for organization-scoped views |

## Architecture Fit

- **Vertical Slice**: Pure domain layer with no infrastructure dependencies
- **Hexagonal**: Entity models serve as the core, consumed by repositories and application services
- **Effect-First**: All entities built on `@effect/sql/Model` with Effect Schema validation
- **Shared Kernel**: Re-exports cross-slice entities (User, Organization, Team, Session) for unified imports
- **Path Alias**: Import as `@beep/iam-domain`. All exports available from `src/index.ts`

## Module Structure

```
src/
├── entities/               # Entity model definitions
│   ├── Account/           # OAuth provider accounts
│   ├── ApiKey/            # API key authentication
│   ├── DeviceCode/        # Device authorization flow
│   ├── Invitation/        # Organization invitations
│   ├── Jwks/              # JSON Web Key Sets
│   ├── Member/            # Organization membership
│   ├── OAuthAccessToken/  # OAuth access tokens
│   ├── OAuthApplication/  # OAuth client applications
│   ├── OAuthConsent/      # OAuth user consent records
│   ├── OrganizationRole/  # Organization role definitions
│   ├── Passkey/           # WebAuthn credentials
│   ├── RateLimit/         # Rate limiting records
│   ├── ScimProvider/      # SCIM provider configuration
│   ├── SsoProvider/       # SSO provider metadata
│   ├── Subscription/      # Billing subscriptions
│   ├── TeamMember/        # Team membership
│   ├── TwoFactor/         # TOTP two-factor settings
│   ├── Verification/      # Email/phone verification tokens
│   └── WalletAddress/     # Crypto wallet addresses
├── errors/                # Tagged error definitions
│   ├── admin.errors.ts         # Admin operation errors
│   ├── anonymous.errors.ts     # Anonymous authentication errors
│   ├── api-key.errors.ts       # API key errors
│   ├── captcha.errors.ts       # CAPTCHA validation errors
│   ├── core.errors.ts          # Core authentication errors
│   ├── device-authorization.errors.ts  # Device flow errors
│   ├── email-otp.errors.ts     # Email OTP errors
│   ├── generic-oauth.errors.ts # Generic OAuth errors
│   ├── haveibeenpwned.errors.ts # Password breach check errors
│   ├── multi-session.errors.ts # Multi-session errors
│   ├── organization.errors.ts  # Organization management errors
│   ├── passkey.errors.ts       # Passkey/WebAuthn errors
│   ├── phone-number.errors.ts  # Phone number errors
│   ├── subscription.errors.ts  # Subscription errors
│   ├── two-factor.errors.ts    # 2FA errors
│   └── username.errors.ts      # Username errors
├── value-objects/         # Value objects and utilities
│   └── paths.ts          # Type-safe path builders for IAM views
├── IamError.ts           # Base IAM error classes
├── entities.ts           # Entity barrel export
├── errors.ts             # Error barrel export
└── index.ts              # Package root export
```

## Usage

### Namespace Import

Prefer the namespace import pattern for entities:

```typescript
import { Entities } from "@beep/iam-domain";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import * as F from "effect/Function";

// Access entity models
const AccountModel = Entities.Account.Model;
const MemberModel = Entities.Member.Model;
```

### Creating Entity Insert Payloads

Use `Model.insert.make` for type-safe insert operations:

```typescript
import { Entities } from "@beep/iam-domain";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { BS } from "@beep/schema";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";

export const makeInvitationInsert = Effect.gen(function* () {
  const now = yield* DateTime.now;
  const nowDate = DateTime.toDate(now);
  const invitationId = IamEntityIds.InvitationId.create();

  return Entities.Invitation.Model.insert.make({
    id: invitationId,
    email: BS.EmailBase.make("new-user@example.com"),
    inviterId: SharedEntityIds.UserId.make("user_1"),
    organizationId: O.some(SharedEntityIds.OrganizationId.create()),
    expiresAt: nowDate,
    createdAt: nowDate,
    updatedAt: nowDate,
    source: O.some("api"),
    createdBy: O.some("user_1"),
    updatedBy: O.some("user_1"),
  });
});
```

### Updating Entities

Use `Model.update.make` for type-safe updates:

```typescript
import { Entities } from "@beep/iam-domain";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";

export const promoteMember = (member: Entities.Member.Model.Type) =>
  Effect.gen(function* () {
    const now = yield* DateTime.now;
    const updated = Entities.Member.Model.update.make({
      ...member,
      role: Entities.Member.MemberRoleEnum.admin,
      updatedAt: DateTime.toDate(now),
    });
    return updated;
  });
```

### Working with Schema Kits

Entity enums use StringLiteralKit for type-safe literals with helpers:

```typescript
import { Entities } from "@beep/iam-domain";
import * as A from "effect/Array";
import * as F from "effect/Function";

// Access enum options
const roles = Entities.Member.MemberRole.Options;
// ["owner", "admin", "member"]

// Use enum values
const defaultRole = Entities.Member.MemberRoleEnum.member;

// Get Postgres enum helper
const memberRoleEnum = Entities.Member.makeMemberRolePgEnum();
```

### Decoding External Data

Validate and parse external JSON data:

```typescript
import { Entities } from "@beep/iam-domain";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

export const parseSessionPayload = (payload: unknown) =>
  Effect.flatMap(
    S.decodeUnknown(Entities.Session.Model.json)(payload),
    (session) =>
      Effect.succeed({
        token: session.token,
        expiresAt: session.expiresAt,
        activeOrganizationId: session.activeOrganizationId,
      })
  );
```

### Working with Errors

Use typed error channels for better error handling:

```typescript
import { IamError } from "@beep/iam-domain";
import {
  UserNotFound,
  InvalidEmailOrPassword,
  SessionExpired,
} from "@beep/iam-domain/errors/core.errors";
import * as Effect from "effect/Effect";

export const authenticateUser = (
  email: string,
  password: string
): Effect.Effect<User, UserNotFound | InvalidEmailOrPassword, UserRepo> =>
  Effect.gen(function* () {
    // Implementation
  });

// Handle specific errors
const program = F.pipe(
  authenticateUser(email, password),
  Effect.catchTag("UserNotFound", (error) =>
    Effect.fail(new InvalidEmailOrPassword({ message: "Invalid credentials" }))
  ),
  Effect.catchTag("InvalidEmailOrPassword", (error) =>
    Effect.fail(error)
  )
);
```

### Type-Safe Path Building

Use path builders for IAM views:

```typescript
import { authViewPaths, accountViewPaths } from "@beep/iam-domain";

// Auth view paths
const signInPath = authViewPaths.signIn.path; // "/auth/sign-in"
const signUpPath = authViewPaths.signUp.path; // "/auth/sign-up"

// Account settings with query params
const settingsPath = accountViewPaths.settings("/account")("security");
// "/account?settingsTab=security"
```

## Entity Models Overview

### Authentication Entities

- **Account** — OAuth provider accounts with access/refresh tokens, expiry times, and provider metadata
- **ApiKey** — API key credentials with hashed secrets and rate limit configuration
- **Passkey** — WebAuthn passkey credentials for passwordless authentication
- **TwoFactor** — TOTP two-factor authentication configuration
- **Session** — User session management (re-exported from shared domain)
- **Verification** — Email and phone verification tokens with expiry logic

### Authorization Entities

- **Member** — Organization membership with roles (owner, admin, member), status, and permissions
- **TeamMember** — Team-level membership and access control
- **OrganizationRole** — Custom role definitions within organizations

### OAuth & SSO

- **DeviceCode** — Device authorization flow state with status enum
- **OAuthAccessToken** — OAuth access token records
- **OAuthApplication** — OAuth client application registrations
- **OAuthConsent** — User consent records for OAuth applications
- **SsoProvider** — SSO provider metadata and configuration
- **Jwks** — JSON Web Key Sets for token signing

### Organization Management

- **Invitation** — Organization invitation workflow with expiry and status tracking
- **Subscription** — Billing subscription records
- **RateLimit** — Rate limiting state per user/organization

### Identity Providers

- **ScimProvider** — SCIM provider integration configuration
- **WalletAddress** — Crypto wallet addresses for Web3 authentication

### Shared Kernel Entities

Re-exported from `@beep/shared-domain` for unified IAM context:

- **User** — Core user identity and profile
- **Organization** — Multi-tenant organization context
- **Team** — Team grouping within organizations

## Error Catalog

All errors are tagged via `S.TaggedError` for type-safe error channels:

### Core Errors

- `UserNotFound` — User lookup failed
- `InvalidEmailOrPassword` — Authentication failed
- `SessionExpired` — Session requires re-authentication
- `UserAlreadyExists` — Duplicate user registration attempt
- `AccountNotFound` — OAuth account not linked
- `CredentialAccountNotFound` — Password credentials not found

### OAuth & SSO Errors

- `ProviderNotFound` — OAuth provider not configured
- `InvalidToken` — Token validation failed
- `SocialAccountAlreadyLinked` — OAuth account already connected
- `FailedToGetUserInfo` — Provider user info fetch failed

### Security Errors

- `PasswordTooShort` / `PasswordTooLong` — Password validation
- `EmailNotVerified` — Email verification required
- `InvalidPassword` — Password check failed

### Organization Errors

- `OrganizationNotFound` — Organization lookup failed
- `MemberNotFound` — Member not in organization
- `InsufficientPermissions` — Access denied

### Additional Error Categories

Error modules for admin, anonymous auth, API keys, CAPTCHA, device authorization, email OTP, haveibeenpwned checks, multi-session, passkeys, phone numbers, subscriptions, two-factor, and usernames.

## What Belongs Here

- **Pure entity models** built on `@effect/sql/Model` with Effect Schema
- **Value objects** like entity IDs, enums, and path builders
- **Tagged errors** for IAM-specific failures
- **Schema kits** for literals with Postgres enum helpers
- **Domain utilities** that are pure and stateless

## What Must NOT Go Here

- **No I/O or side effects**: no database queries, network calls, or file system operations
- **No infrastructure**: no Drizzle clients, repositories, or Better Auth runtime
- **No application logic**: keep orchestration in `@beep/iam-infra` or application layers
- **No framework dependencies**: avoid Next.js, React, or platform-specific code
- **No cross-slice domain imports**: only depend on `@beep/shared-domain` and `@beep/common/*`

Domain models should be pure, testable, and reusable across all infrastructure implementations.

## Dependencies

| Package | Purpose |
|---------|---------|
| `effect` | Core Effect runtime and Schema system |
| `@effect/sql` | SQL model base classes and annotations |
| `@beep/shared-domain` | Shared entities (User, Organization, Team, Session) |
| `@beep/schema` | Schema utilities (BS namespace, EntityId, StringLiteralKit) |
| `@beep/invariant` | Assertion contracts and error schemas |
| `@beep/utils` | Pure runtime helpers |
| `@beep/constants` | Shared constants |
| `@beep/identity` | Package identity helpers |
| `@beep/errors` | Shared error base classes |
| `drizzle-orm` | Type definitions (no runtime execution) |

## Development

```bash
# Type check
bun run --filter @beep/iam-domain check

# Lint
bun run --filter @beep/iam-domain lint

# Lint and auto-fix
bun run --filter @beep/iam-domain lint:fix

# Build
bun run --filter @beep/iam-domain build

# Run tests
bun run --filter @beep/iam-domain test

# Test with coverage
bun run --filter @beep/iam-domain coverage

# Check for circular dependencies
bun run --filter @beep/iam-domain lint:circular
```

## Guidelines for Adding New Entities

- **Use `makeFields`**: All entities must inherit audit fields (id, version, timestamps, source, createdBy, updatedBy)
- **Symbol.for identifiers**: Use `Symbol.for("@beep/iam-domain/<Entity>Model")` for stable schema metadata
- **BS helpers**: Use `BS.FieldOptionOmittable`, `BS.FieldSensitiveOptionOmittable`, `BS.toOptionalWithDefault` for field optionality
- **Model utilities**: Attach `static readonly utils = modelKit(Model)` for consistent helper methods
- **Schema kits**: For enums, create StringLiteralKit classes with `.Options`, `.Enum`, and Postgres helpers
- **Effect patterns**: Use `F.pipe`, Effect Array/String utilities (`A.*`, `Str.*`), never native methods
- **Tagged errors**: Route errors through `IamError` or create typed `S.TaggedError` subclasses

## Relationship to Other Packages

- `@beep/iam-tables` — Drizzle table definitions that consume these entity models
- `@beep/iam-infra` — Infrastructure layer with repositories and Better Auth integration
- `@beep/iam-sdk` — Client-side contracts and Better Auth handlers
- `@beep/iam-ui` — React components for IAM flows
- `@beep/shared-domain` — Shared kernel entities (User, Organization, Team, Session)
- `@beep/shared-tables` — Table factories (`Table.make`, `OrgTable.make`) used by IAM tables

## Testing

- Use Vitest for entity model tests
- Focus on schema validation, insert/update transformations, and error cases
- Tests colocated in `test/` directory
- Example: test entity creation, field optionality, and schema round-trips

## Versioning and Changes

- Widely consumed package across IAM slice — prefer **additive** changes
- For breaking entity changes:
  - Update entity model schema
  - Regenerate Drizzle types: `bun run db:generate`
  - Create migration: `bun run db:migrate`
  - Update affected repositories in `@beep/iam-infra`
  - Update UI components in `@beep/iam-ui`
- Document migrations in commit messages and update AGENTS.md

## Next Steps

After modifying entities:

1. Regenerate database types and migrations
2. Update corresponding table definitions in `@beep/iam-tables`
3. Adjust repositories in `@beep/iam-infra` if persistence logic changes
4. Update SDK contracts in `@beep/iam-sdk` if client-facing types change
5. Verify UI components in `@beep/iam-ui` still compile
6. Run full verification: `bun run check && bun run lint && bun run test`

## Additional Resources

- `AGENTS.md` — Detailed agent guide with recipes and guardrails
- `packages/iam/infra/AGENTS.md` — Infrastructure layer patterns
- `packages/iam/tables/AGENTS.md` — Table schema definitions
- `docs/patterns/` — Repository-wide implementation patterns
