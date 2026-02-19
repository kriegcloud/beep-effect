# @beep/iam-domain

The domain layer for the IAM (Identity and Access Management) vertical slice, providing pure entity models and value objects for authentication, authorization, and user management.

## Purpose

Centralizes IAM domain models via `M.Class` definitions that merge shared audit fields through `makeFields`, giving infrastructure and table layers a single source of truth for schema variants. This package:
- Exports Effect-first entity models built on `@effect/sql/Model`
- Provides type-safe entity IDs and branded types via `@beep/schema`
- Defines value objects for IAM view paths and navigation
- Re-exports shared kernel entities (User, Organization, Team, Session) for unified IAM context
- Sits in the domain layer with no infrastructure dependencies or side effects

## Installation

```bash
# This package is internal to the monorepo
# Add as a dependency in your package.json:
"@beep/iam-domain": "workspace:*"
```

## Key Exports

| Export | Description |
|--------|-------------|
| **Entities** | |
| `Entities.*` | Namespaced entity models for all IAM domain objects |
| `Entities.Account` | OAuth account linkage with sensitive token wrappers and expiry metadata |
| `Entities.ApiKey` | API key issuance, hashed secrets, and rate limit defaults |
| `Entities.DeviceCode` | Device authorization flow state with status enum |
| `Entities.Invitation` | Organization invitation management with expiry logic |
| `Entities.Jwks` | JSON Web Key Sets for token signing |
| `Entities.Member` | Organization membership with roles, status, and permissions |
| `Entities.OAuthAccessToken` | OAuth access token records |
| `Entities.OAuthApplication` | OAuth client application registrations |
| `Entities.OAuthConsent` | User consent records for OAuth applications |
| `Entities.OrganizationRole` | Custom role definitions within organizations |
| `Entities.Passkey` | WebAuthn passkey credentials for passwordless authentication |
| `Entities.RateLimit` | Rate limiting state per user/organization |
| `Entities.ScimProvider` | SCIM provider integration configuration |
| `Entities.SsoProvider` | SSO provider metadata and configuration |
| `Entities.Subscription` | Billing subscription records |
| `Entities.TeamMember` | Team-level membership and access control |
| `Entities.TwoFactor` | TOTP two-factor authentication settings |
| `Entities.Verification` | Email and phone verification tokens with expiry logic |
| `Entities.WalletAddress` | Crypto wallet addresses for Web3 authentication |
| **Shared Kernel Entities** | |
| `Entities.Session` | Re-exported from shared domain for session management |
| `Entities.User` | Re-exported from shared domain for user identity |
| `Entities.Organization` | Re-exported from shared domain for organization context |
| `Entities.Team` | Re-exported from shared domain for team grouping |
| **Value Objects** | |
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
├── entities/              # Entity model definitions
│   ├── Account/          # OAuth provider accounts
│   ├── ApiKey/           # API key authentication
│   ├── DeviceCode/       # Device authorization flow
│   ├── Invitation/       # Organization invitations
│   ├── Jwks/             # JSON Web Key Sets
│   ├── Member/           # Organization membership
│   ├── OAuthAccessToken/ # OAuth access tokens
│   ├── OAuthApplication/ # OAuth client applications
│   ├── OAuthConsent/     # OAuth user consent records
│   ├── OrganizationRole/ # Organization role definitions
│   ├── Passkey/          # WebAuthn credentials
│   ├── RateLimit/        # Rate limiting records
│   ├── ScimProvider/     # SCIM provider configuration
│   ├── SsoProvider/      # SSO provider metadata
│   ├── Subscription/     # Billing subscriptions
│   ├── TeamMember/       # Team membership
│   ├── TwoFactor/        # TOTP two-factor settings
│   ├── Verification/     # Email/phone verification tokens
│   ├── WalletAddress/    # Crypto wallet addresses
│   └── index.ts          # Entity barrel export
├── value-objects/        # Value objects and utilities
│   ├── paths.ts          # Type-safe path builders for IAM views
│   └── index.ts          # Value object exports
├── entities.ts           # Entities re-export
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

### Entity Schema Validation

Use entity schemas for runtime validation of external data:

```typescript
import { Entities } from "@beep/iam-domain";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

export const validateMemberPayload = (payload: unknown) =>
  S.decodeUnknown(Entities.Member.Model.json)(payload).pipe(
    Effect.mapError((error) => ({
      _tag: "ValidationError" as const,
      message: "Invalid member payload",
      cause: error,
    }))
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

## What Belongs Here

- **Pure entity models** built on `@effect/sql/Model` with Effect Schema
- **Value objects** like entity IDs, enums, and path builders
- **Schema kits** for literals with Postgres enum helpers
- **Domain utilities** that are pure and stateless
- **Shared kernel re-exports** (User, Organization, Team, Session) for unified IAM context

## What Must NOT Go Here

- **No I/O or side effects**: no database queries, network calls, or file system operations
- **No infrastructure**: no Drizzle clients, repositories, or Better Auth runtime
- **No HTTP handlers, routes, or API contracts**: implement these in `@beep/iam-server` or server layers
- **No application logic**: keep orchestration in `@beep/iam-server` or application layers
- **No framework dependencies**: avoid Next.js, React, or platform-specific code
- **No cross-slice domain imports**: only depend on `@beep/shared-domain` and `@beep/common/*`

Domain models should be pure, testable, and reusable across all infrastructure implementations.

## Dependencies

| Package | Purpose |
|---------|---------|
| `effect` | Core Effect runtime and Schema system |
| `@effect/sql` | SQL model base classes and annotations |
| `@effect/experimental` | Experimental Effect features |
| `@beep/shared-domain` | Shared entities (User, Organization, Team, Session) and common utilities |
| `@beep/schema` | Schema utilities (BS namespace, EntityId, StringLiteralKit) |
| `@beep/constants` | Shared constants |
| `@beep/identity` | Package identity helpers |
| `drizzle-orm` | Type definitions (no runtime execution) |
| `mutative` | Immutable state updates |

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
- **BS helpers**: Use `BS.FieldOptionOmittable`, `BS.FieldSensitiveOptionOmittable`, `BS.BoolWithDefault` for field optionality
- **Model utilities**: Attach `static readonly utils = modelKit(Model)` for consistent helper methods
- **Schema kits**: For enums, create StringLiteralKit classes with `.Options`, `.Enum`, and Postgres helpers
- **Effect patterns**: Use `F.pipe`, Effect Array/String utilities (`A.*`, `Str.*`), never native methods
- **Namespace exports**: Export entity modules through `src/entities/index.ts` for consistent access patterns

## Relationship to Other Packages

- `@beep/iam-server` — Infrastructure layer implementing repositories, Better Auth integration, and HTTP routes
- `@beep/iam-tables` — Drizzle table definitions that consume these entity models
- `@beep/iam-client` — Client-side contracts and Better Auth handlers
- `@beep/iam-ui` — React components for IAM flows
- `@beep/shared-domain` — Shared kernel entities (User, Organization, Team, Session) and common utilities
- `@beep/shared-tables` — Table factories (`Table.make`, `OrgTable.make`) used by IAM tables

### Entity Flow

```
@beep/iam-domain (entity models)
    ↓
@beep/iam-tables (Drizzle schema)
    ↓
@beep/iam-server (repositories + infrastructure)
    ↓
apps/server (runtime + HTTP handlers)
```

Domain defines the "what" (entity structure), tables define the "storage", infrastructure defines the "how" (persistence, side effects).

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
  - Update affected repositories in `@beep/iam-server`
  - Update UI components in `@beep/iam-ui`
- Document migrations in commit messages and update AGENTS.md

## Next Steps

After modifying entities:

1. Regenerate database types and migrations
2. Update corresponding table definitions in `@beep/iam-tables`
3. Adjust repositories in `@beep/iam-server` if persistence logic changes
4. Update CLIENT contracts in `@beep/iam-client` if client-facing types change
5. Verify UI components in `@beep/iam-ui` still compile
6. Run full verification: `bun run check && bun run lint && bun run test`

## Additional Resources

- `AGENTS.md` — Detailed agent guide with recipes and guardrails
- `packages/iam/server/AGENTS.md` — Infrastructure layer patterns
- `packages/iam/tables/AGENTS.md` — Table schema definitions
- `documentation/patterns/` — Repository-wide implementation patterns
