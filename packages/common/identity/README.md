# @beep/identity

Composable identity builder for creating namespace-safe schema IDs, service tokens, and TypeId symbols across the beep-effect monorepo. Produces stable literal strings and branded symbols while enforcing runtime validation and preserving type safety.

## Purpose

This package provides the canonical identity system for all `@beep/*` namespaces. It solves the problem of maintaining consistent, type-safe identifiers throughout the monorepo for Effect services, schema annotations, and module namespacing. Every package in the beep-effect ecosystem uses this system to generate stable symbols and identity strings that are validated at both compile-time and runtime.

## Key Features

- **Tagged Template Syntax** — Create identity strings with `$SchemaId\`TenantService\`` for clean, type-safe composition
- **Branded Types** — `IdentityString` and `IdentitySymbol` brands preserve literal types through the type system
- **Runtime Validation** — Segment validation prevents empty values, invalid characters, and malformed paths
- **Schema Annotations** — Generate Effect Schema annotations with stable symbols and human-readable titles
- **Pre-configured Composers** — All workspace namespaces registered in `packages.ts` with typed accessors

## Installation

```bash
# This package is internal to the monorepo
# Add as a dependency in your package.json:
"@beep/identity": "workspace:*"
```

## Usage

### Import Strategies

This package supports multiple import patterns:

```typescript
// Recommended: Import via modules namespace
import { modules } from "@beep/identity";
const id = modules.$SchemaId`Entity`;

// Alternative: Import specific composers from packages module
import * as Packages from "@beep/identity/packages";
const id = Packages.$SchemaId`Entity`;

// Type-only imports
import type { IdentityString, IdentitySymbol } from "@beep/identity/types";
type IdString = IdentityString<"@beep/schema/Entity">;

// Create custom composers for new namespaces
import { Identifier } from "@beep/identity";
const { $CustomId } = Identifier.make("custom-namespace");
```

### Basic Identity Creation

```typescript
import { Identifier } from "@beep/identity";
import type { IdentityString } from "@beep/identity/types";

// Create a root composer
const { $BeepId } = Identifier.make("beep");
const { $SchemaId } = $BeepId.compose("schema");

// Tagged template syntax
const serviceId = $SchemaId`TenantService`;
// => IdentityString<"@beep/schema/TenantService">

// Method syntax
const entityId = $SchemaId.make("TenantEntity");
// => IdentityString<"@beep/schema/TenantEntity">
```

### Using Pre-configured Module Composers

```typescript
// Import via modules namespace (recommended)
import { modules } from "@beep/identity";

const tenantId = modules.$SchemaId`TenantProfile`;
const fileMetaId = modules.$DocumentsDomainId`FileMetadata`;
const userRepoId = modules.$IamServerId.compose("repos").make("UserRepo");

// Compose from root $I for dynamic namespace composition
import * as Packages from "@beep/identity/packages";

const { $SchemaId, $IamServerId } = Packages.$I.compose("schema", "iam-server");
const entityId = $SchemaId`Entity`;
```

### Schema Annotations

```typescript
import { modules } from "@beep/identity";
import * as S from "effect/Schema";

// Basic annotations
const annotations = modules.$SchemaId.annotations("PasskeyAddPayload");

// With extras
const extendedAnnotations = modules.$SchemaId.annotations("UserProfile", {
  description: "User profile schema with authentication metadata",
  examples: [{ email: "user@example.com" }],
});

// Apply to Effect Schema
export class PasskeyAddPayload extends S.Class<PasskeyAddPayload>("PasskeyAddPayload")(
  {
    email: S.String,
    credential: S.String,
  },
  { ...annotations }
) {}
```

### Service Tokens and TypeIds

```typescript
import { modules } from "@beep/identity";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

// Create stable service symbols
const UserRepoTypeId = modules.$IamServerId.compose("repos").symbol();

// Use in Effect services
export class UserRepo extends Context.Tag("UserRepo")<
  UserRepo,
  UserRepoService
>() {
  static readonly TypeId = UserRepoTypeId;
}
```

### Custom Namespace Composers

```typescript
import { Identifier } from "@beep/identity";

// Create composer for new namespace
const { $IntegrationsId } = Identifier.make("integrations");
const { $StripeId, $PaypalId } = $IntegrationsId.compose("stripe", "paypal");

const stripeClientId = $StripeId`Client`;
// => IdentityString<"@beep/integrations/stripe/Client">
```

### Multi-segment Composition

```typescript
import { modules } from "@beep/identity";

// Compose multiple segments at once
const { $ReposId, $ServicesId, $AdaptersId } = modules.$IamServerId.compose(
  "repos",
  "services",
  "adapters"
);

const userRepoId = $ReposId`UserRepo`;
const authServiceId = $ServicesId.make("AuthService");
const betterAuthId = $AdaptersId`BetterAuth`;
```

## API Reference

### Identifier

Core builder factory for creating identity composers.

#### `Identifier.make<Base>(base: Base)`

Creates a root identity composer for the given base namespace.

```typescript
const { $BeepId } = Identifier.make("beep");
const { $CustomId } = Identifier.make("custom-namespace");
```

### TaggedComposer

The identity composer interface returned by `make()` and `compose()`.

#### Tagged Template Call

```typescript
const id = $SchemaId`ServiceName`;
```

#### `compose(...segments)`

Creates multiple child composers from the current namespace.

```typescript
const { $ReposId, $ServicesId } = $IamServerId.compose("repos", "services");
```

#### `make(segment)`

Creates an identity string by appending a segment.

```typescript
const id = $SchemaId.make("TenantEntity");
```

#### `create(segment)`

Creates a single new composer from the current namespace. Use this when you need to create one composer and continue chaining.

```typescript
const $EntitiesId = $SchemaId.create("entities");
// Same as compose but returns a single composer instead of a record
```

**When to use `compose()` vs `create()`:**
- Use `compose(...segments)` when creating multiple composers at once (returns a record)
- Use `create(segment)` when creating a single composer for further chaining (returns a composer)

#### `string()`

Returns the current identity as a branded string.

```typescript
const value = $SchemaId.string();
// => IdentityString<"@beep/schema">
```

#### `symbol()`

Returns a stable symbol for the current identity.

```typescript
const sym = $SchemaId.symbol();
// => IdentitySymbol<"@beep/schema">
```

#### `annotations(identifier, extras?)`

Creates schema annotations with stable symbols and titles.

```typescript
const annotations = $SchemaId.annotations("UserProfile", {
  description: "User profile metadata",
});
```

### Pre-configured Modules

All workspace composers are exported via the `modules` namespace or directly from `packages`:

```typescript
import { modules } from "@beep/identity";
// OR
import * as Packages from "@beep/identity/packages";

// Root beep namespace
modules.$I;  // or Packages.$I

// Common packages
modules.$SchemaId;
modules.$ErrorsId;
modules.$UtilsId;
modules.$ContractId;
modules.$InvariantId;
modules.$ConstantsId;
modules.$MockId;
modules.$TypesId;
modules.$IdentityId;

// Feature slices - IAM
modules.$IamDomainId;
modules.$IamServerId;
modules.$IamClientId;
modules.$IamUiId;
modules.$IamTablesId;

// Feature slices - Documents
modules.$DocumentsDomainId;
modules.$DocumentsServerId;
modules.$DocumentsClientId;
modules.$DocumentsUiId;
modules.$DocumentsTablesId;

// Shared packages
modules.$SharedDomainId;
modules.$SharedServerId;
modules.$SharedClientId;
modules.$SharedUiId;
modules.$SharedTablesId;

// Runtime
modules.$RuntimeClientId;
modules.$RuntimeServerId;

// UI
modules.$UiId;
modules.$UiCoreId;

// Applications
modules.$WebId;
modules.$ServerId;
modules.$NotesId;

// Tooling
modules.$RepoScriptsId;
modules.$RepoCliId;
modules.$TestkitId;
modules.$ToolingUtilsId;
modules.$BuildUtilsId;
modules.$ScraperId;

// Internal
modules.$DbAdminId;
modules.$ScratchpadId;
modules.$LexicalSchemasId;
```

## Type Safety

### Branded Types

```typescript
import type { IdentityString, IdentitySymbol } from "@beep/identity/types";

// Strings are branded to preserve literals
type ServiceId = IdentityString<"@beep/schema/TenantService">;

// Symbols are branded with description
type RepoSymbol = IdentitySymbol<"@beep/iam-server/repos/UserRepo">;
```

### Segment Validation

Segments are validated at both type-level and runtime:

```typescript
// Type-level validation via ModuleSegmentValue
type Valid = ModuleSegmentValue<"valid-name">;     // ✓
type Invalid = ModuleSegmentValue<"1invalid">;     // ✗ starts with digit
type Invalid2 = ModuleSegmentValue<"has/slash">;   // ✗ contains slash

// Runtime validation throws descriptive errors
$SchemaId.compose("1invalid");  // throws InvalidModuleSegmentError
$SchemaId.compose("");          // throws InvalidSegmentError
```

## Validation Rules

### Base Segments

- Must be non-empty strings
- Can contain alphanumeric characters, hyphens, underscores
- Must start and end with alphanumeric characters
- `@beep/` prefix is automatically normalized

### Module Segments

- Must be non-empty strings
- Must start with an alphabetic character (for valid accessors)
- Can contain only alphanumeric characters, hyphens, underscores
- Cannot start or end with `/`

### General Segments

- Must be non-empty strings
- Cannot start or end with `/`
- Allow any characters except leading/trailing slashes

## Effect Patterns

This package follows strict Effect conventions:

```typescript
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as Str from "effect/String";
import * as S from "effect/Schema";

// All string operations use Effect utilities
const title = F.pipe(
  identifier,
  Str.replace(/[_-]+/g, " "),
  Str.trim,
  Str.split(" "),
  A.map(Str.capitalize),
  A.join(" ")
);

// Schema validation with tagged errors
const decoded = S.decodeUnknownEither(Segment)(value);
if (E.isLeft(decoded)) {
  throw new InvalidSegmentError({ value, reason: decoded.left.message });
}
```

## Error Handling

Three tagged error classes from `schema.ts` provide validation failure details:

```typescript
import { InvalidSegmentError, InvalidModuleSegmentError, InvalidBaseError } from "@beep/identity/schema";

try {
  const { $BeepId } = Identifier.make("beep");
  $BeepId.compose("1invalid");
} catch (error) {
  if (error instanceof InvalidModuleSegmentError) {
    console.error(error.message);
    // => "Module segments must start with an alphabetic character..."
  }
}

// InvalidSegmentError: Empty segments or segments with leading/trailing "/"
// InvalidModuleSegmentError: Invalid characters or numeric leading character
// InvalidBaseError: Invalid base namespace format
```

## Testing

```typescript
import { describe, expect, expectTypeOf, it } from "bun:test";
import { Identifier } from "@beep/identity";
import type { IdentityString } from "@beep/identity/types";

describe("identity creation", () => {
  it("creates branded identity strings", () => {
    const { $BeepId } = Identifier.make("beep");
    const { $SchemaId } = $BeepId.compose("schema");

    const id = $SchemaId`TenantService`;

    expect(id).toBe("@beep/schema/TenantService");
    expectTypeOf(id).toMatchTypeOf<IdentityString<"@beep/schema/TenantService">>();
  });
});
```

## Package Structure

```
packages/common/identity/
├── src/
│   ├── Identifier.ts      # Core builder with tagged template support
│   ├── packages.ts        # Pre-configured workspace composers
│   ├── schema.ts          # Validation schemas and error classes
│   ├── types.ts           # Type definitions and brands
│   └── index.ts           # Public API exports
├── test/
│   └── Identity.test.ts   # Test suite
├── AGENTS.md              # AI agent collaboration guide
└── README.md              # This file
```

## Development

```bash
# Type checking
bun run --filter @beep/identity check

# Linting
bun run --filter @beep/identity lint
bun run --filter @beep/identity lint:fix

# Circular dependency check
bun run --filter @beep/identity lint:circular

# Build
bun run --filter @beep/identity build

# Tests
bun run --filter @beep/identity test
bun run --filter @beep/identity coverage
```

## Contributing

When adding new workspace namespaces:

1. Update `packages.ts` with new composer in `$I.compose(...)` call
2. Export the new composer constant (e.g., `export const $NewPackageId = composers.$NewPackageId`)
3. Ensure segment name follows validation rules (starts with letter, alphanumeric/hyphens/underscores only)
4. Add tests verifying the new composer
5. Run `bun run --filter @beep/identity check` and `bun run --filter @beep/identity lint` to verify

## Integration Examples

### With Effect Schema

```typescript
import { modules } from "@beep/identity";
import * as S from "effect/Schema";

const { $SchemaId } = modules.$I.compose("schema");

export class TenantProfile extends S.Class<TenantProfile>("TenantProfile")(
  {
    id: S.String,
    name: S.String,
  },
  { ...$SchemaId.annotations("TenantProfile") }
) {}
```

### With Effect Services

```typescript
import { modules } from "@beep/identity";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

export class UserRepo extends Context.Tag(
  modules.$IamServerId.compose("repos").make("UserRepo")
)<UserRepo, UserRepoService>() {}

export const UserRepoLive = Layer.succeed(UserRepo, {
  // implementation
});
```

### With Drizzle Schemas

```typescript
import { modules } from "@beep/identity";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable(
  modules.$IamTablesId.make("users"),
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  }
);
```

## Key Exports

| Export | Description |
|--------|-------------|
| `Identifier` | Core builder factory with `make()` for creating root composers |
| `modules` | Namespace containing all pre-configured workspace composers |
| `types` | Type definitions including `IdentityString`, `IdentitySymbol`, and validation types |
| `packages` | Direct access to `$I` root composer and all workspace composers |

## Dependencies

| Package | Purpose |
|---------|---------|
| `effect` | Schema validation, branded types, and Effect utilities |

**Note**: `@beep/types` is referenced via workspace path aliases defined in `tsconfig.base.jsonc` for type-level `StringTypes.NonEmptyString` constraints.

## Integration

The `@beep/identity` package is a foundational dependency consumed across the entire monorepo:

- **Schema Packages** (`@beep/schema`, slice domain packages): Use `.annotations()` for Effect Schema class decorators with stable TypeIds
- **Server Packages** (slice infra/server): Use `.symbol()` for service tokens in Effect Context.Tag definitions
- **Table Packages** (slice tables): Use `.make()` for consistent table naming in Drizzle schemas
- **Client Packages** (slice client): Use for contract identifiers and handler naming
- **UI Packages**: Use for component keys and stable element identifiers

All workspace packages are pre-registered in `packages.ts`. When adding new packages to the monorepo, update the `$I.compose(...)` call to register the new namespace.

## Notes

- Segments are validated at runtime to prevent accidental `/` characters or invalid identifiers
- `make()` returns branded identity strings, `compose()` creates child composers, `create()` creates a single child composer
- Use `Identifier.make("custom")` to create composers for new namespaces outside `@beep/*`
- All exports include comprehensive JSDoc with examples and `@since 0.1.0` tags
- Title generation splits on `_`/`-` and capitalizes words for human-readable schema annotations
- Tagged template syntax prevents interpolations to maintain type safety

## License

MIT

## Links

- [GitHub Repository](https://github.com/kriegcloud/beep-effect/tree/main/packages/common/identity)
- [AGENTS.md](./AGENTS.md) — AI agent collaboration guide
- [Effect Documentation](https://effect.website) — Learn about Effect ecosystem
