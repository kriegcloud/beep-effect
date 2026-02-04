---
path: packages/common/schema
summary: Pure runtime schema toolkit - BS namespace with primitives, EntityIds, literal kits, SQL helpers
tags: [schema, effect, validation, common, helpers, branded-ids]
---

# @beep/schema

Pure runtime schema toolkit built on `effect/Schema`. Provides the `BS` namespace aggregating primitives, branded EntityIds, literal kits, JSON Schema builders, and SQL annotations. Domain-agnostic foundation used by all slices.

## Architecture

```
|------------------|     |------------------|     |------------------|
|    primitives/   | --> |     derived/     | --> |    builders/     |
| string,temporal, |     | kits,tagged-     |     | json-schema,     |
| network,locale   |     | unions,nullable  |     | form-metadata    |
|------------------|     |------------------|     |------------------|
        |                        |
        v                        v
|------------------|     |------------------|
|    identity/     |     |  integrations/   |
| EntityId.make,   |     | sql,http,csp     |
| uuid,brands      |     | helpers          |
|------------------|     |------------------|
                \           /
                 \         /
                  v       v
              |---------------|
              |  BS namespace |
              | (schema.ts)   |
              |---------------|
```

## Core Modules

| Module | Purpose |
|--------|---------|
| `primitives/` | Annotated string/email/password/slug/phone, URL/IP, temporal, number/bool |
| `identity/entity-id/` | `EntityId.make` factory for `${table}__uuid` branded schemas |
| `derived/kits/` | `StringLiteralKit` with `.Options/.Enum`, tagged unions, nullables |
| `core/` | Annotations, extended combinators, tagged struct/union factories |
| `builders/` | JSON Schema DSL, form field/metadata helpers |
| `integrations/sql/` | Postgres enum/serial helpers, Drizzle column annotations |
| `integrations/config/` | CSP parsing/rendering utilities |

## Usage Patterns

### Branded EntityId
```typescript
import { BS } from "@beep/schema";
import * as S from "effect/Schema";

const ProjectId = BS.EntityId.make("project", {
  brand: "ProjectId",
  annotations: { description: "Primary project identifier" },
});

const Project = S.Struct({
  id: ProjectId,
  name: S.NonEmptyString,
  url: BS.Url,
});
```

### String Literal Kit
```typescript
import { BS } from "@beep/schema";

class Status extends BS.StringLiteralKit("draft", "active", "archived")
  .annotations({ identifier: "Status" }) {}

const pgEnum = BS.toPgEnum(Status);
```

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| Single BS namespace | Consistent import pattern across all slices |
| Pure runtime only | No I/O, platform hooks, or side effects |
| Slice-agnostic | Never imports from `@beep/iam-*` or domain packages |
| Rich annotations | Enables JSON Schema, forms, and docs generation |

## Dependencies

**Internal**: `@beep/identity`, `@beep/invariant`, `@beep/utils`
**External**: `effect`, `@effect/sql`, `drizzle-orm`

## Related

- **AGENTS.md** - Detailed contributor guidance with recipes
