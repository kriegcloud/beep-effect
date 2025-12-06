# @beep/schema

A library for `effect/Schema` stuff

## Purpose

Canonical, environment-agnostic schemas and helpers built on top of `effect/Schema`. This package centralizes reusable validators/codecs, JSON Schema generation, nominal IDs, and SQL-adjacent schema helpers so every slice (domain, application, api, db, ui) speaks the same types and constraints. It exports runtime schema values (not just types), but they are intentionally pure and side-effect-free.

## Key Exports

| Export                | Description                                                                                   |
|-----------------------|-----------------------------------------------------------------------------------------------|
| `BS`                  | Single namespace aggregating all primitives, derived kits, integrations, and identity helpers |
| `BS.Email`            | Lowercased, trimmed email schema with RFC-leaning pattern validation                          |
| `BS.Phone`            | Phone number validation schema                                                                |
| `BS.Url`              | URL schema with validation                                                                    |
| `BS.EntityId`         | Factory for nominal `${table}__uuid` branded identifiers with Drizzle column builders         |
| `BS.StringLiteralKit` | Literal kit builder with `.Options`, `.Enum`, and transformation helpers                      |
| `BS.DateTimeFromDate` | Postgres-tuned temporal schema for date/time handling                                         |
| `BS.toJsonSchema`     | JSON Schema derivation from Effect schemas                                                    |
| `BS.toPgEnum`         | Convert literal kits to Postgres enum definitions                                             |
| `BS.Slug`             | URL-safe slug schema                                                                          |
| `BS.Password`         | Password validation with strength requirements                                                |
| `BS.UUID`             | UUID literal schema and validation                                                            |

## Architecture Fit

- **Vertical Slice + Hexagonal**: Safe for all layers because schemas are pure runtime values
- **Shared language**: Slices build on the same primitives (e.g., email, URL, entity IDs)
- **Persistence alignment**: `EntityId` and `sql` helpers align schema types with Drizzle/@effect/sql models without introducing DB execution
- **Path alias**: Import as `@beep/schema`. The public surface is the `BS` namespace re-export from `src/index.ts`

## Module Structure

```
src/
├── primitives/     # String, email, phone, URL, temporal, network, geo, etc.
├── identity/       # EntityId factory for branded ${table}__uuid identifiers
├── derived/        # Kits (StringLiteralKit, nullables, transformations)
├── builders/       # JSON Schema and form field builders
├── integrations/   # HTTP headers, SQL helpers, CSP config, file types
├── core/          # Annotations, extended schemas, generics, variance
└── schema.ts      # Main barrel re-exporting all modules
```

## Usage

### Namespace Import

Prefer the single-namespace import in application code:

```typescript
import { BS } from "@beep/schema";
import * as S from "effect/Schema";
import * as F from "effect/Function";

// Use primitives
const email = BS.Email;
const url = BS.Url;
```

### Entity IDs

Create nominal, branded identifiers for database entities:

```typescript
import { BS } from "@beep/schema";
import * as F from "effect/Function";

const OrganizationId = BS.EntityId.make("organization", {
  brand: "OrganizationId",
  annotations: {
    description: "Primary key for organization records"
  }
});

// Create new ID
const id = OrganizationId.create();
// type: `organization__${UUID}` & Brand<'OrganizationId'>

// Validate existing ID
const validated = F.pipe(
  "organization__550e8400-e29b-41d4-a716-446655440000",
  S.decodeUnknownSync(OrganizationId)
);
```

### String Literal Kits

Build type-safe literal unions with enum helpers:

```typescript
import { BS } from "@beep/schema";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as Str from "effect/String";

class Visibility extends BS.StringLiteralKit("private", "team", "public").annotations({
  identifier: "Visibility",
  description: "Visibility level for a project"
}) {
  static readonly Upper = F.pipe(
    Visibility.Options,
    A.map(Str.toUpperCase)
  );
}

// Access options
const options = Visibility.Options; // ["private", "team", "public"]

// Convert to Postgres enum
const visibilityEnum = BS.toPgEnum(Visibility);
```

### JSON Schema Derivation

Derive JSON Schema for forms and API documentation:

```typescript
import { BS } from "@beep/schema";
import * as S from "effect/Schema";
import * as F from "effect/Function";

const Person = S.Struct({
  name: S.NonEmptyString,
  email: BS.Email,
  phone: BS.Phone
}).annotations({
  identifier: "Person",
  description: "User profile information"
});

const jsonSchema = BS.toJsonSchema(Person);
```

### Drizzle Integration

Compose with shared table helpers for multi-tenant models:

```typescript
import { BS } from "@beep/schema";
import { Table } from "@beep/shared-tables/Table";
import * as S from "effect/Schema";

const UserId = BS.EntityId.make("user", {
  brand: "UserId",
  annotations: {}
});

export const user = Table.make("user", UserId)({
  email: BS.Email.publicId(),
  displayName: S.String,
  avatarUrl: S.OptionFromNullOr(BS.Url)
});
```

### Temporal Schemas

Work with dates and times using Postgres-tuned schemas:

```typescript
import { BS } from "@beep/schema";
import * as S from "effect/Schema";
import * as F from "effect/Function";

const Event = S.Struct({
  id: BS.EntityId.make("event", { brand: "EventId", annotations: {} }),
  createdAt: BS.DateTimeFromDate,
  updatedAt: BS.OptionFromDateTime
});

// Parse and validate
const event = F.pipe(
  {
    id: "event__550e8400-e29b-41d4-a716-446655440000",
    createdAt: new Date(),
    updatedAt: null
  },
  S.decodeUnknownSync(Event)
);
```

## What Belongs Here

- **Pure schema values and helpers** for validation, parsing/encoding, and safe construction
- **Cross-cutting primitives**: strings, emails, phones, URLs, UUIDs, durations, arrays, regexes, etc.
- **Nominal identifiers** via `EntityId` with Drizzle column helpers for tables
- **JSON Schema utilities** to derive JSON Schema for forms and API docs
- **SQL modeling helpers** (annotations only) to align with `@effect/sql`/Drizzle models
- **Effect-first ergonomics**: small utilities and extended schemas that compose with `effect/Schema`

## What Must NOT Go Here

- **No I/O or side effects**: no network, DB, file system, timers, logging, or env reads
- **No platform/framework dependencies**: avoid Node APIs, DOM/React/Next, `@effect/platform-*`, `@effect/sql-*` clients
- **No domain-specific business rules**: domain policies belong in slice `domain` or `application` code
- **No cross-slice imports**: do not depend on `@beep/iam-*`, `@beep/documents-*`, etc.

Schemas here should be generic, reusable, and environment-agnostic. If a schema depends on infrastructure or on a specific domain's policies, keep it in the slice.

## Dependencies

| Package           | Purpose                                             |
|-------------------|-----------------------------------------------------|
| `effect`          | Core Effect runtime and Schema system               |
| `@beep/invariant` | Assertion contracts and tagged error schemas        |
| `@beep/identity`  | Package identity helpers                            |
| `@beep/utils`     | Pure runtime string/entity transform helpers        |
| `@effect/sql`     | SQL modeling types (annotations only, no execution) |
| `drizzle-orm`     | Column builder types for EntityId integration       |
| `@faker-js/faker` | Schema arbitrary/mock data generation               |
| `uuid`            | UUID generation for EntityId.create()               |
| `randexp-ts`      | Regex-based arbitrary generation                    |
| `exifreader`      | File metadata schema support                        |

## Development

```bash
# Type check
bun run --filter @beep/schema check

# Lint
bun run --filter @beep/schema lint

# Lint and auto-fix
bun run --filter @beep/schema lint:fix

# Build
bun run --filter @beep/schema build

# Run tests
bun run --filter @beep/schema test

# Test with coverage
bun run --filter @beep/schema coverage
```

## Guidelines for Adding New Schemas

- **Stay generic**: if the concept is domain-specific, keep it in the slice; contribute here only if it's broadly reusable
- **Side-effect-free**: schemas and helpers must be pure; no I/O/platform hooks
- **Provide annotations**: add reasonable `title`, `identifier`, `description`, `pretty`, and `jsonSchema` annotations when useful
- **Round-trip safety**: define encode/decode transformations when needed; add tests for parse/encode round-trips
- **Drizzle alignment** (if relevant): mirror Drizzle types only; do not introduce DB execution here
- **Effect patterns**: use `F.pipe`, Effect Array/String utilities (`A.*`, `Str.*`), never native array/string/object methods
- **Export through BS namespace**: add new exports through `src/schema.ts` to maintain the stable public surface

## Relationship to Other Packages

- `@beep/types` — compile-time only helpers used by schemas as needed
- `@beep/utils` — small pure runtime helpers (no validation responsibilities)
- `@beep/shared-tables` — table builders (`Table`, `OrgTable`) that compose with `EntityId` for multi-tenant models
- `packages/documents/*` — dedicated slice for file business logic. This package only models file shapes

## Testing

- Use Vitest for schema behavior and round-trip tests
- Prefer table-driven tests and property-based checks for codecs where feasible
- Tests located in `test/` directory mirroring source structure

## Versioning and Changes

- Widely consumed package — prefer **additive** changes
- For breaking changes, update affected slices in the same PR and document migrations