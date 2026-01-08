# @beep/customization-server

Infrastructure layer for the Customization vertical slice, providing Effect-first database access, repositories, and service implementations for user preferences and theme management.

## Purpose

`@beep/customization-server` implements the infrastructure concerns for the Customization slice. It provides:
- **Database Client**: PostgreSQL client with Drizzle ORM for Customization schema
- **Repository Implementations**: CRUD operations for customization entities
- **Service Layer**: Business logic for theme management and user preferences
- **Integration Points**: External customization provider adapters

This package sits in the infrastructure layer and is consumed by applications (apps/server, apps/web).

## Installation

```bash
# This package is internal to the monorepo
# Add as a dependency in your package.json:
"@beep/customization-server": "workspace:*"
```

## Key Exports

| Export | Type | Description |
|--------|------|-------------|
| `CustomizationDb` | Service | Customization database service with preferences schema |

## Usage

### Database

#### Creating the CustomizationDb Layer

```typescript
import { Db } from "@beep/shared-server";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Context from "effect/Context";
import * as customizationSchema from "@beep/customization-tables";

type CustomizationSchema = typeof customizationSchema;
type CustomizationDb = Db.Shape<CustomizationSchema>;

export class CustomizationDb extends Context.Tag("CustomizationDb")<CustomizationDb, CustomizationDb>() {
  static readonly Live: Layer.Layer<CustomizationDb, never, Db.PgClientServices> = Layer.scoped(
    CustomizationDb,
    Db.make({ schema: customizationSchema })
  );
}
```

#### Using CustomizationDb

```typescript
import { CustomizationDb } from "@beep/customization-server";
import * as Effect from "effect/Effect";

const program = Effect.gen(function* () {
  const db = yield* CustomizationDb.CustomizationDb;
  const result = yield* db.makeQuery((execute) =>
    execute((client) => client.query.theme.findMany())
  );
});
```

## Effect Patterns

### Import Conventions

```typescript
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Context from "effect/Context";
import * as Config from "effect/Config";
import * as S from "effect/Schema";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as Str from "effect/String";
```

## Development

```bash
# Type check
bun run --filter @beep/customization-server check

# Lint
bun run --filter @beep/customization-server lint
bun run --filter @beep/customization-server lint:fix

# Test
bun run --filter @beep/customization-server test

# Circular dependency check
bun run --filter @beep/customization-server lint:circular
```

## Dependencies

**Peer Dependencies**:
- `effect` — Effect runtime
- `@effect/platform` — Platform abstractions
- `@effect/sql` + `@effect/sql-pg` + `@effect/sql-drizzle` — SQL client
- `drizzle-orm` — ORM toolkit
- Workspace packages: `@beep/schema`, `@beep/shared-domain`, `@beep/shared-server`, `@beep/shared-env`, `@beep/customization-domain`, `@beep/customization-tables`

## Integration

### Applications

**`apps/server`**: Composes Customization infrastructure layers with other slices in the server runtime.

**`apps/web`**: Uses Customization services for theme and preference management.

### Feature Slices

**Customization** (`packages/customization/*`):
- Uses `Db.make` to create `CustomizationDb` with Customization-specific Drizzle schema
- Leverages `Repo.make` for theme and preference repositories

## Related Packages

- `@beep/customization-domain` — Entity models and domain logic
- `@beep/customization-tables` — Drizzle table definitions
- `@beep/customization-client` — Client-side services
- `@beep/customization-ui` — UI components
- `@beep/shared-server` — Shared infrastructure services
- `@beep/shared-domain` — Shared entities
- `@beep/shared-env` — Environment configuration
