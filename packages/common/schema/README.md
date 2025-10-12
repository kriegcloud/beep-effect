# @beep/schema — Effect Schema building blocks for the monorepo

Canonical, environment‑agnostic schemas and helpers built on top of `effect/Schema`. This package centralizes
reusable validators/codecs, JSON Schema generation, nominal IDs, and SQL‑adjacent schema helpers so every slice
(domain, application, api, db, ui) speaks the same types and constraints.

It exports runtime schema values (not just types), but they are intentionally pure and side‑effect‑free.


## What belongs here

- **Pure schema values and helpers** for validation, parsing/encoding, and safe construction.
- **Cross‑cutting primitives**: strings, emails, phones, URLs, UUIDs, durations, arrays, regexes, etc.
- **Nominal identifiers** via `EntityId` with Drizzle column helpers for tables.
- **JSON Schema utilities** to derive JSON Schema for forms and API docs.
- **SQL modeling helpers** (annotations only) to align with `@effect/sql`/Drizzle models.
- **Effect‑first ergonomics**: small utilities and extended schemas that compose with `effect/Schema`.


## What must NOT go here

- **No I/O or side effects**: no network, DB, file system, timers, logging, or env reads.
- **No platform/framework dependencies**: avoid Node APIs, DOM/React/Next, `@effect/platform-*`, `@effect/sql-*` clients.
- **No domain‑specific business rules**: domain policies belong in slice `domain` or `application` code.
- **No cross‑slice imports**: do not depend on `@beep/iam-*`, `@beep/files-*`, etc.

Schemas here should be generic, reusable, and environment‑agnostic. If a schema depends on infrastructure or on a
specific domain’s policies, keep it in the slice.


## How it fits the architecture

- **Vertical Slice + Hexagonal**: Safe for all layers because schemas are pure runtime values.
- **Shared language**: Slices build on the same primitives (e.g., email, URL, entity IDs).
- **Persistence alignment**: `EntityId` and `sql` helpers align schema types with Drizzle/@effect/sql models
  without introducing DB execution.
- **Path alias**: Import as `@beep/schema`. The public surface is the `BS` namespace re‑export from `src/index.ts`.


## Module map (current)

Top‑level entry points:
- `index.ts` — exports a single surface `BS` (short for Beep Schema) from `./schema`.
- `schema.ts` — re‑exports all public modules; prefer `import { BS } from '@beep/schema'`.

Key modules under `src/`:
- `custom/` — generic, high‑level schemas: `Email.schema.ts`, `Phone.schema.ts`, `Url.schema.ts`, `UUID.schema.ts`,
  `Json.schema.ts`, `String.schema.ts`, `Duration.schema.ts`, `Regex.schema.ts`, etc.
- `EntityId.ts` — factory for nominal, snake‑case branded identifiers plus Drizzle column builders:
  - `EntityId.make('organization', { brand: 'OrganizationId', annotations })`
  - Exposes `publicId()`/`privateId()` column builders and `.create()` for ID construction.
- `JsonSchema.ts` — JSON Schema derivation and helpers for forms/docs.
- `extended-schemas.ts` — additional combinators and struct utilities (`Struct`, `Tuple`, `Array`, `NonEmptyArray`,
  `deriveAndAttachProperty`, etc.).
- `generics/` — helpers like `TaggedUnion` and `TaggedStruct`.
- `sql/` — SQL modeling helpers (annotation‑only), e.g. `DateTimeFromDate`, `OptionFromDateTime` tuned for Postgres
  and JSON Schema formats.
- `annotations/`, `utils/`, `form/`, `kits/`, `regexes.ts` — focused utilities and presets used by the above.


## Import style

Prefer the single‑namespace import in application code:
```ts
import { BS } from '@beep/schema';

// Example: use an email schema
const Email = BS.Email; // from custom/Email.schema
```

When interacting with Drizzle tables, compose with shared table helpers (`@beep/shared-tables`) and `EntityId`:
```ts
import { BS } from '@beep/schema';
import { Table } from '@beep/shared-tables/Table';

const UserId = BS.EntityId.make('user', { brand: 'UserId', annotations: {} });

export const user = Table.make('user', UserId)({
  // ... domain columns
});
```


## Examples

- **Nominal ID**
```ts
import { BS } from '@beep/schema';

const OrganizationId = BS.EntityId.make('organization', { brand: 'OrganizationId', annotations: {} });
const id = OrganizationId.create();
// type: `${'organization'}__${UUID}` & Brand<'OrganizationId'>
```

- **JSON Schema derivation**
```ts
import * as S from 'effect/Schema';
import { BS } from '@beep/schema';

const Person = S.Struct({ name: S.NonEmptyString, email: BS.Email });
const jsonSchema = BS.toJsonSchema(Person); // using helpers in JsonSchema.ts
```


## Guidelines for adding new schemas

- **Stay generic**: if the concept is domain‑specific, keep it in the slice; contribute here only if it’s broadly reusable.
- **Side‑effect‑free**: schemas and helpers must be pure; no I/O/platform hooks.
- **Provide annotations**: add reasonable `title`, `identifier`, `pretty`, and `jsonSchema` annotations when useful.
- **Round‑trip safety**: define encode/decode transformations when needed; add tests for parse/encode round‑trips.
- **Drizzle alignment** (if relevant): mirror Drizzle types only; do not introduce DB execution here.


## Relationship to other packages

- **`@beep/types`** — compile‑time only helpers used by schemas as needed.
- **`@beep/utils`** — small pure runtime helpers (no validation responsibilities).
- **`@beep/shared-tables`** — table builders (`Table`, `OrgTable`) that compose with `EntityId` for multi‑tenant models.
- **`packages/files/*`** — dedicated slice for file business logic. This package only models file shapes.


## Testing

- Use Vitest for schema behavior and round‑trip tests.
- Prefer table‑driven tests and property‑based checks for codecs where feasible.


## Notes on local scripts

- Some packages historically included `src/execute.ts` for ad‑hoc examples.
  Treat these as **local dev only**, not part of production. The production checklist recommends removing such scripts.


## Versioning and changes

- Widely consumed package — prefer **additive** changes.
- For breaking changes, update affected slices in the same PR and document migrations.
