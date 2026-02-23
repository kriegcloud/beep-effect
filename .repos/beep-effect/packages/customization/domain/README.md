# @beep/customization-domain

The domain layer for the Customization vertical slice, providing pure entity models, value objects, and domain contracts for user preferences, themes, and application customization.

## Purpose

Centralizes Customization domain models via `M.Class` definitions that provide schema variants for user preferences, theme configurations, and customization settings. This package exports Effect-first entity models and type-safe error channels that integrate seamlessly with Drizzle ORM and Effect SQL while maintaining type safety and compile-time guarantees.

## Installation

```bash
# This package is internal to the monorepo
# Add as a dependency in your package.json:
"@beep/customization-domain": "workspace:*"
```

## Key Exports

| Export | Description |
|--------|-------------|
| `Entities.UserHotkey` | User-configurable keyboard shortcuts model with userId reference and shortcuts JSON record |

## Architecture Fit

- **Vertical Slice**: Pure domain layer with no infrastructure dependencies
- **Hexagonal**: Entity models serve as the core, consumed by repositories and application services
- **Effect-First**: All entities built on `@effect/sql/Model` with Effect Schema validation
- **Shared Kernel**: Re-exports cross-slice entities where needed for unified imports
- **Path Alias**: Import as `@beep/customization-domain`. All exports available from `src/index.ts`

## Usage

### Namespace Import

Prefer the namespace import pattern for entities:

```typescript
import { Entities } from "@beep/customization-domain";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import * as F from "effect/Function";

// Access entity models
const UserHotkeyModel = Entities.UserHotkey.Model;
```

### Creating Entity Insert Payloads

Use `Model.insert.make` for type-safe insert operations:

```typescript
import { Entities } from "@beep/customization-domain";
import { CustomizationEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";

export const makeUserHotkeyInsert = Effect.gen(function* () {
  const now = yield* DateTime.now;
  const nowDate = DateTime.toDate(now);
  const hotkeyId = CustomizationEntityIds.UserHotkeyId.create();

  return Entities.UserHotkey.Model.insert.make({
    id: hotkeyId,
    userId: SharedEntityIds.UserId.make("user_1"),
    shortcuts: { "ctrl+s": "save", "ctrl+z": "undo" },
    createdAt: nowDate,
    updatedAt: nowDate,
  });
});
```

## What Belongs Here

- **Pure entity models** built on `@effect/sql/Model` with Effect Schema
- **Value objects** like entity IDs, enums, and customization types
- **Schema kits** for literals with Postgres enum helpers
- **Domain utilities** that are pure and stateless

## What Must NOT Go Here

- **No I/O or side effects**: no database queries, network calls, or file system operations
- **No infrastructure**: no Drizzle clients, repositories, or external service adapters
- **No application logic**: keep orchestration in `@beep/customization-server`
- **No framework dependencies**: avoid Next.js, React, or platform-specific code
- **No cross-slice domain imports**: only depend on `@beep/shared-domain` and `@beep//*`

Domain models should be pure, testable, and reusable across all infrastructure implementations.

## Dependencies

| Package | Purpose |
|---------|---------|
| `effect` | Core Effect runtime and Schema system |
| `@effect/sql` | SQL model base classes and annotations |
| `@beep/shared-domain` | Shared entities (User, Organization, Team, Session) and entity ID factories |
| `@beep/identity` | Package identity utilities for stable schema symbols |

## Development

```bash
# Type check
bun run --filter @beep/customization-domain check

# Lint
bun run --filter @beep/customization-domain lint

# Lint and auto-fix
bun run --filter @beep/customization-domain lint:fix

# Build
bun run --filter @beep/customization-domain build

# Run tests
bun run --filter @beep/customization-domain test

# Test with coverage
bun run --filter @beep/customization-domain coverage

# Check for circular dependencies
bun run --filter @beep/customization-domain lint:circular
```

## Relationship to Other Packages

- `@beep/customization-server` — Infrastructure layer implementing domain models as repositories and services
- `@beep/customization-tables` — Drizzle table definitions that consume these entity models
- `@beep/customization-client` — Client-side contracts (may consume domain types)
- `@beep/customization-ui` — React components for customization flows
- `@beep/shared-domain` — Shared kernel entities (User, Organization, Team, Session)
- `@beep/shared-tables` — Table factories (`Table.make`, `OrgTable.make`) used by Customization tables
