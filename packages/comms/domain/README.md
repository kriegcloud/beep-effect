# @beep/comms-domain

The domain layer for the Communications vertical slice, providing pure entity models, value objects, and domain contracts for messaging, notifications, and communication workflows.

## Purpose

Centralizes Communications domain models via `M.Class` definitions that provide schema variants for messaging entities, notification preferences, and communication channels. This package exports Effect-first entity models and type-safe error channels that integrate seamlessly with Drizzle ORM and Effect SQL while maintaining type safety and compile-time guarantees.

## Installation

```bash
# This package is internal to the monorepo
# Add as a dependency in your package.json:
"@beep/comms-domain": "workspace:*"
```

## Key Exports

| Export | Description |
|--------|-------------|
| `Entities.EmailTemplate` | Email template entity model with subject, body, to/cc/bcc fields |

## Architecture Fit

- **Vertical Slice**: Pure domain layer with no infrastructure dependencies
- **Hexagonal**: Entity models serve as the core, consumed by repositories and application services
- **Effect-First**: All entities built on `@effect/sql/Model` with Effect Schema validation
- **Shared Kernel**: Re-exports cross-slice entities where needed for unified imports
- **Path Alias**: Import as `@beep/comms-domain`. All exports available from `src/index.ts`

## Usage

### Namespace Import

Prefer the namespace import pattern for entities:

```typescript
import { Entities } from "@beep/comms-domain";
import * as Effect from "effect/Effect";

// Access email template entity model
const EmailTemplateModel = Entities.EmailTemplate.Model;
```

### Creating Entity Insert Payloads

Use `Model.insert.make` for type-safe insert operations:

```typescript
import { Entities } from "@beep/comms-domain";
import { CommsEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";

export const makeEmailTemplateInsert = Effect.gen(function* () {
  const now = yield* DateTime.now;
  const nowDate = DateTime.toDate(now);

  return Entities.EmailTemplate.Model.insert.make({
    id: CommsEntityIds.EmailTemplateId.make("comms_email_template__123"),
    organizationId: SharedEntityIds.OrganizationId.make("shared_organization__456"),
    userId: SharedEntityIds.UserId.make("shared_user__789"),
    name: "Welcome Email",
    subject: "Welcome to Beep!",
    body: "Thank you for joining us.",
    createdAt: nowDate,
    updatedAt: nowDate,
  });
});
```

## What Belongs Here

- **Pure entity models** built on `@effect/sql/Model` with Effect Schema
- **Value objects** like entity IDs, enums, and communication types
- **Schema kits** for literals with Postgres enum helpers
- **Domain utilities** that are pure and stateless

## What Must NOT Go Here

- **No I/O or side effects**: no database queries, network calls, or file system operations
- **No infrastructure**: no Drizzle clients, repositories, or external service adapters
- **No application logic**: keep orchestration in `@beep/comms-server`
- **No framework dependencies**: avoid Next.js, React, or platform-specific code
- **No cross-slice domain imports**: only depend on `@beep/shared-domain` and `@beep//*`

Domain models should be pure, testable, and reusable across all infrastructure implementations.

## Dependencies

| Package | Purpose |
|---------|---------|
| `effect` | Core Effect runtime and Schema system |
| `@effect/sql` | SQL model base classes and annotations |
| `@beep/shared-domain` | Shared entities (User, Organization, Team, Session) |
| `@beep/schema` | Schema utilities (BS namespace, EntityId) |

## Development

```bash
# Type check
bun run --filter @beep/comms-domain check

# Lint
bun run --filter @beep/comms-domain lint

# Lint and auto-fix
bun run --filter @beep/comms-domain lint:fix

# Build
bun run --filter @beep/comms-domain build

# Run tests
bun run --filter @beep/comms-domain test

# Test with coverage
bun run --filter @beep/comms-domain coverage

# Check for circular dependencies
bun run --filter @beep/comms-domain lint:circular
```

## Relationship to Other Packages

- `@beep/comms-server` — Infrastructure layer implementing domain models as repositories and services
- `@beep/comms-tables` — Drizzle table definitions that consume these entity models
- `@beep/comms-client` — Client-side contracts (may consume domain types)
- `@beep/comms-ui` — React components for communication flows
- `@beep/shared-domain` — Shared kernel entities (User, Organization, Team, Session)
- `@beep/shared-tables` — Table factories (`Table.make`, `OrgTable.make`) used by Communications tables
