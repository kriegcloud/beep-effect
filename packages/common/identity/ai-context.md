---
path: packages/common/identity
summary: Type-safe identity string/symbol builder - namespace validation, branded types, schema annotations
tags: [identity, symbols, branded-types, effect-schema, di-tokens]
---

# @beep/identity

Provides the canonical identity builder for all `@beep/*` namespaces, producing stable literal strings and `Symbol.for` tokens for services, schemas, and DI layers. Enforces namespace hygiene at runtime while preserving literal types via branded `IdentityString`/`IdentitySymbol` types.

## Architecture

```
|------------------|     |------------------|     |------------------|
|   Identifier.ts  | --> |   packages.ts    | --> |   Consumer Code  |
| (core builder)   |     | (pre-baked $I)   |     |                  |
|------------------|     |------------------|     |------------------|
        |                        |
        v                        v
|------------------|     |------------------|
|    schema.ts     |     |    types.ts      |
| (validation)     |     | (branded types)  |
|------------------|     |------------------|
```

## Core Modules

| Module | Purpose |
|--------|---------|
| `Identifier.ts` | Core builder factory: `make()`, `compose()`, `symbol()`, `annotations()`, tagged template support |
| `packages.ts` | Pre-baked composers for all workspaces (`$I`, `$SchemaId`, `$IamServerId`, etc.) |
| `schema.ts` | Segment validation schemas (`Segment`, `ModuleSegment`, `BaseSegment`) and error classes |
| `types.ts` | Branded types (`IdentityString`, `IdentitySymbol`), `IdentityComposer` interface |

## Usage Patterns

### Tagged Template Syntax

```typescript
import * as Effect from "effect/Effect";
import { modules } from "@beep/identity";

const { $SchemaId } = modules.$I.compose("schema");
const entityId = $SchemaId`TenantEntity`;
// Result: IdentityString<"@beep/schema/TenantEntity">
```

### Schema Annotations

```typescript
import * as S from "effect/Schema";
import { modules } from "@beep/identity";

const annotations = modules.$SchemaId.annotations("PasskeyAddPayload", {
  description: "IAM passkey add payload",
});
// Returns: { schemaId, identifier, title, description }
```

### Service TypeId for DI

```typescript
import * as Effect from "effect/Effect";
import * as Context from "effect/Context";
import { modules } from "@beep/identity";

export const UserRepoId = modules.$IamServerId.compose("repos").symbol();
// Result: IdentitySymbol<"@beep/iam-server/repos">

export class UserRepo extends Context.Tag("UserRepo")<UserRepo, UserRepoImpl>() {
  static readonly TypeId = UserRepoId;
}
```

### Custom Namespace Composers

```typescript
import { Identifier } from "@beep/identity";

const { $IntegrationsId } = Identifier.make("integrations-core");
const stripeClientId = $IntegrationsId.compose("clients").make("Stripe");
// Result: IdentityString<"@beep/integrations-core/clients/Stripe">
```

### Multi-Segment Composition

```typescript
import { modules } from "@beep/identity";

const { $ReposId, $ServicesId, $AdaptersId } = modules.$IamServerId.compose(
  "repos",
  "services",
  "adapters"
);

const userRepoId = $ReposId`UserRepo`;
const authServiceId = $ServicesId.make("AuthService");
```

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| Branded types over plain strings | Prevents accidental mixing of identity strings with arbitrary strings at compile time |
| `Symbol.for` over `Symbol()` | Ensures stable symbols across module boundaries for Effect Context/Layer compatibility |
| Segment validation at runtime | Catches invalid namespace paths early; no empty segments, no leading/trailing `/` |
| Tagged template syntax | Enables ergonomic literal type preservation: `$SchemaId\`Entity\`` vs `$SchemaId.make("Entity")` |
| Centralized workspace registry | Single source of truth in `packages.ts` prevents namespace drift from actual package scopes |
| `MutableHashSet` registry | Detects duplicate identity creation that would cause Effect DI conflicts |

## Dependencies

**Internal**: `@beep/types`

**External**: `effect` (Schema, Array, String, Function, Either, Record, MutableHashSet)

## Related

- **AGENTS.md** - Detailed contributor guidance and authoring guardrails
