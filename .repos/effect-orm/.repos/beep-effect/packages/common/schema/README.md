# @beep/schema

Effect Schema toolkit with primitives, nominal IDs, and integrations

## Purpose

Canonical, environment-agnostic schemas and helpers built on top of `effect/Schema`. This package centralizes reusable validators/codecs, JSON Schema generation, nominal IDs, and SQL-adjacent schema helpers so every slice (domain, application, api, db, ui) speaks the same types and constraints. It exports runtime schema values (not just types), but they are intentionally pure and side-effect-free.

## Key Exports

| Export                | Description                                                                                   |
|-----------------------|-----------------------------------------------------------------------------------------------|
| `BS`                  | Single namespace aggregating all primitives, derived kits, integrations, and identity helpers |
| `BS.Email`            | Lowercased, trimmed email schema with RFC-leaning pattern validation                          |
| `BS.Phone`            | Phone number validation schema                                                                |
| `BS.Url`              | URL schema with validation                                                                    |
| `BS.Slug`             | URL-safe slug schema                                                                          |
| `BS.Password`         | Password validation with strength requirements                                                |
| `BS.UUID`             | UUID literal schema and validation                                                            |
| `BS.EntityId`         | Factory for nominal `${table}__uuid` branded identifiers with Drizzle column builders         |
| `BS.StringLiteralKit` | Literal kit builder with `.Options`, `.Enum`, and transformation helpers                      |
| `BS.DateTimeUtcFromAllAcceptable` | Converts acceptable inputs (Date, ISO string, timestamp) to Effect DateTime.Utc |
| `BS.DateFromAllAcceptable` | Converts acceptable inputs to canonical JavaScript Date                             |
| `BS.DateTimeFromDate` | SQL-tuned temporal schema wrapper (from `integrations/sql`)                                |
| `BS.DurationFromSeconds` | Duration schemas with tagged representations from numeric seconds                           |
| `BS.StreetLine`       | Street address line schema                                                                    |
| `BS.Locality`         | City/town locality schema                                                                     |
| `BS.PostalCode`       | Postal/ZIP code schema                                                                        |
| `BS.CountryCodeValue` | ISO country code schema                                                                       |
| `BS.toPgEnum`         | Convert literal kits to Postgres enum definitions                                             |
| `BS.Csp`              | Content Security Policy parsing and rendering utilities                                        |
| `BS.HttpMethod`       | HTTP method validation schema                                                                 |
| `BS.File`             | File schemas with metadata, MIME types, and validation                                         |
| `BS.FileAttributes`   | File attribute schemas (size, type, lastModified, name, paths)                                 |
| `BS.FileHash`         | File hash computation service and schemas                                                      |
| `BS.FileSize`         | File size schemas with human-readable formatting                                               |
| `BS.SignedFile`       | Signed file schemas for secure upload/download workflows                                       |
| `BS.MimeType`         | MIME type schemas and validation (video, text, misc categories)                                |
| `BS.ExifMetadata`     | EXIF metadata schemas for image files                                                          |
| `BS.AspectRatio`      | Aspect ratio schemas for media files                                                           |

## Architecture Fit

- **Vertical Slice + Hexagonal**: Safe for all layers because schemas are pure runtime values
- **Shared language**: Slices build on the same primitives (e.g., email, URL, entity IDs)
- **Persistence alignment**: `EntityId` and `sql` helpers align schema types with Drizzle/@effect/sql models without introducing DB execution
- **Path alias**: Import as `@beep/schema`. The public surface is the `BS` namespace re-export from `src/index.ts`

## Module Structure

```
src/
├── primitives/     # String, email, phone, URL, temporal, network, geo, duration,
│                   # array, bool, number, person, regex, locales, currency
├── identity/       # EntityId factory for branded ${table}__uuid identifiers
├── derived/        # Kits (StringLiteralKit, LiteralKit, nullables, transformations,
│                   # tuple/struct helpers, ArrayLookup, KeyOrderLookup)
├── builders/       # JSON Schema helpers and form field builders
│   ├── json-schema/# JsonSchema, JsonProp, JsonType schemas for validation
│   └── form/       # Form field and form metadata builders
├── integrations/   # HTTP headers/methods, SQL helpers, CSP config, file schemas
│   ├── config/     # CSP parsing and rendering
│   ├── files/      # File, FileHash, FileSize, SignedFile, MIME types, EXIF/PDF metadata
│   ├── http/       # HTTP method, headers, request schemas
│   └── sql/        # Postgres enum helpers, column transformers, DateTimeFromDate
├── core/           # Annotations, extended schemas, generics, variance, brands, defaults
└── schema.ts       # Main barrel re-exporting all modules through BS namespace
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

Derive JSON Schema for forms and API documentation using Effect's JSONSchema:

```typescript
import { BS } from "@beep/schema";
import * as S from "effect/Schema";
import * as JSONSchema from "effect/JSONSchema";
import * as F from "effect/Function";

const Person = S.Struct({
  name: S.NonEmptyString,
  email: BS.Email,
  phone: BS.Phone
}).annotations({
  identifier: "Person",
  description: "User profile information"
});

const jsonSchema = JSONSchema.make(Person);
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

Work with dates and times using flexible input schemas:

```typescript
import { BS } from "@beep/schema";
import * as S from "effect/Schema";
import * as F from "effect/Function";

const Event = S.Struct({
  id: BS.EntityId.make("event", { brand: "EventId", annotations: {} }),
  createdAt: BS.DateTimeUtcFromAllAcceptable,
  updatedAt: S.OptionFromNullOr(BS.DateTimeUtcFromAllAcceptable)
});

// Parse and validate - accepts Date, ISO string, or timestamp
const event = F.pipe(
  {
    id: "event__550e8400-e29b-41d4-a716-446655440000",
    createdAt: new Date(),
    updatedAt: null
  },
  S.decodeUnknownSync(Event)
);
```

### Additional Primitives

The package provides many other primitive schemas for common use cases:

```typescript
import { BS } from "@beep/schema";
import * as S from "effect/Schema";
import * as F from "effect/Function";
import * as Duration from "effect/Duration";

// Duration schemas with tagged representations
const Task = S.Struct({
  name: S.NonEmptyString,
  durationSeconds: BS.DurationFromSeconds,
  timeout: S.OptionFromNullOr(BS.DurationFromSeconds)
});

const task = F.pipe(
  { name: "Process data", durationSeconds: 300, timeout: null },
  S.decodeUnknownSync(Task)
);
// task.durationSeconds is Duration.Duration (5 minutes)

// Geographic primitives (country codes, postal codes, localities)
const Address = S.Struct({
  streetLine: BS.StreetLine,
  locality: BS.Locality,
  postalCode: BS.PostalCode,
  countryCode: BS.CountryCodeValue
});

// Array transformations
const CommaDelimitedNumbers = BS.arrayToCommaSeparatedString(S.Number);
const numbers = F.pipe("1,2,3,4", S.decodeUnknownSync(CommaDelimitedNumbers));
// Result: [1, 2, 3, 4]
```

### File Schemas

Work with file metadata, MIME types, and validation:

```typescript
import { BS } from "@beep/schema";
import * as S from "effect/Schema";
import * as F from "effect/Function";

// File with metadata
const UploadedFile = S.Struct({
  file: BS.File,
  size: BS.FileSize,
  mimeType: BS.MimeType,
  hash: S.OptionFromNullOr(S.String)
});

// Signed file for secure uploads
const SignedUpload = BS.SignedFile;

// EXIF metadata for images
const ImageWithMetadata = S.Struct({
  file: BS.File,
  exif: S.OptionFromNullOr(BS.ExifMetadata)
});
```

### Integration Helpers

Use integration schemas for HTTP, SQL, and configuration:

```typescript
import { BS } from "@beep/schema";
import * as S from "effect/Schema";
import * as F from "effect/Function";

// Content Security Policy
const cspString = "default-src 'self'; script-src 'unsafe-inline';";
const csp = BS.Csp.fromString(cspString);
const header = F.pipe(csp, BS.Csp.toHeader);

// HTTP method validation
const RequestMetadata = S.Struct({
  method: BS.HttpMethod,
  path: BS.Url,
  headers: S.Record({ key: S.String, value: S.String })
});

// Postgres enum from StringLiteralKit
class Status extends BS.StringLiteralKit("draft", "published", "archived") {}
const statusEnum = BS.toPgEnum(Status); // For Drizzle schema
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
| `@faker-js/faker`   | Schema arbitrary/mock data generation               |
| `uuid`              | UUID generation for EntityId.create()               |
| `randexp-ts`        | Regex-based arbitrary generation                    |
| `music-metadata`    | File metadata schema support                        |
| `@effect/experimental` | Experimental Effect features                     |
| `mutative`          | Immutable update utilities                          |

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