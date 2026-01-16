# HANDOFF_P5B.md - Organization CRUD Handlers

## Phase Overview

**Phase**: 5B of 6 (Sub-phase 2 of 4)
**Focus**: Organization CRUD handlers (create, get-full, list, update, delete, set-active)
**Package**: `@beep/iam-client`
**Handler Count**: 6 handlers

## Prerequisites Checklist

- [ ] Phase 5A (Shared Schemas) completed
- [ ] Shared schemas exist in `src/organization/_common/`
- [ ] Type check passes: `bun run check --filter @beep/iam-client`

## Directory Structure

```
packages/iam/client/src/organization/
├── _common/                    # From Phase 5A
│   └── ...
├── crud/
│   ├── create/
│   │   ├── create.contract.ts
│   │   ├── create.handler.ts
│   │   └── index.ts
│   ├── get-full/
│   │   ├── get-full.contract.ts
│   │   ├── get-full.handler.ts
│   │   └── index.ts
│   ├── list/
│   │   ├── list.contract.ts
│   │   ├── list.handler.ts
│   │   └── index.ts
│   ├── update/
│   │   ├── update.contract.ts
│   │   ├── update.handler.ts
│   │   └── index.ts
│   ├── delete/
│   │   ├── delete.contract.ts
│   │   ├── delete.handler.ts
│   │   └── index.ts
│   ├── set-active/
│   │   ├── set-active.contract.ts
│   │   ├── set-active.handler.ts
│   │   └── index.ts
│   └── index.ts
└── index.ts                    # Update to export crud
```

## Handler Specifications

| Handler | Client Method | Payload | Success Schema | mutatesSession |
|---------|---------------|---------|----------------|----------------|
| Create | `client.organization.create()` | `{ name, slug?, logo?, metadata? }` | `Organization` | `false` |
| GetFull | `client.organization.getFullOrganization()` | `{ query: { organizationId? } }` | `FullOrganization` | `false` |
| List | `client.organization.list()` | None | `S.Array(Organization)` | `false` |
| Update | `client.organization.update()` | `{ organizationId?, data: { name?, slug?, logo?, metadata? } }` | `Organization` | `false` |
| Delete | `client.organization.delete()` | `{ organizationId }` | `{ success: boolean }` | `false` |
| SetActive | `client.organization.setActive()` | `{ organizationId }` | `Organization \| null` | `true` |

## Implementation Details

### 1. Create Handler

**Contract** (`crud/create/create.contract.ts`):
```typescript
import { $IamClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { Organization } from "../../_common/index.ts";

const $I = $IamClientId.create("organization/crud/create");

export class Payload extends S.Class<Payload>($I`Payload`)({
  name: S.String,
  slug: S.optional(S.String),
  logo: S.optional(S.String),
  metadata: S.optional(S.Unknown),
}) {}

export const Success = Organization;
```

**Handler** (`crud/create/create.handler.ts`):
```typescript
import { createHandler } from "../../../_common/handler.factory.ts";
import { client } from "../../../adapters/better-auth/client.ts";
import * as Contract from "./create.contract.ts";

export const Handler = createHandler({
  domain: "organization",
  feature: "create",
  execute: (encoded) => client.organization.create(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: false,
});
```

### 2. GetFull Handler

**Contract** (`crud/get-full/get-full.contract.ts`):
```typescript
import { $IamClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { FullOrganization } from "../../_common/index.ts";

const $I = $IamClientId.create("organization/crud/get-full");

export class Payload extends S.Class<Payload>($I`Payload`)({
  query: S.optional(S.Struct({
    organizationId: S.optional(S.String),
  })),
}) {}

export const Success = FullOrganization;
```

**Handler** (`crud/get-full/get-full.handler.ts`):
```typescript
import { createHandler } from "../../../_common/handler.factory.ts";
import { client } from "../../../adapters/better-auth/client.ts";
import * as Contract from "./get-full.contract.ts";

export const Handler = createHandler({
  domain: "organization",
  feature: "get-full",
  execute: (encoded) => client.organization.getFullOrganization(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: false,
});
```

### 3. List Handler (No Payload)

**Contract** (`crud/list/list.contract.ts`):
```typescript
import { $IamClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { Organization } from "../../_common/index.ts";

const $I = $IamClientId.create("organization/crud/list");

// No payload - list returns all user's organizations
export const Success = S.Array(Organization);
```

**Handler** (`crud/list/list.handler.ts`):
```typescript
import { createHandler } from "../../../_common/handler.factory.ts";
import { client } from "../../../adapters/better-auth/client.ts";
import * as Contract from "./list.contract.ts";

export const Handler = createHandler({
  domain: "organization",
  feature: "list",
  execute: () => client.organization.list(),
  successSchema: Contract.Success,
  // No payloadSchema - this is a no-payload handler
  mutatesSession: false,
});
```

### 4. Update Handler

**Contract** (`crud/update/update.contract.ts`):
```typescript
import { $IamClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { Organization } from "../../_common/index.ts";

const $I = $IamClientId.create("organization/crud/update");

export class Payload extends S.Class<Payload>($I`Payload`)({
  organizationId: S.optional(S.String),  // Uses active org if omitted
  data: S.Struct({
    name: S.optional(S.String),
    slug: S.optional(S.String),
    logo: S.optional(S.String),
    metadata: S.optional(S.Unknown),
  }),
}) {}

export const Success = Organization;
```

**Handler** (`crud/update/update.handler.ts`):
```typescript
import { createHandler } from "../../../_common/handler.factory.ts";
import { client } from "../../../adapters/better-auth/client.ts";
import * as Contract from "./update.contract.ts";

export const Handler = createHandler({
  domain: "organization",
  feature: "update",
  execute: (encoded) => client.organization.update(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: false,
});
```

### 5. Delete Handler

**Contract** (`crud/delete/delete.contract.ts`):
```typescript
import { $IamClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $IamClientId.create("organization/crud/delete");

export class Payload extends S.Class<Payload>($I`Payload`)({
  organizationId: S.String,  // Required - must specify which org to delete
}) {}

export class Success extends S.Class<Success>($I`Success`)({
  success: S.Boolean,
}) {}
```

**Handler** (`crud/delete/delete.handler.ts`):
```typescript
import { createHandler } from "../../../_common/handler.factory.ts";
import { client } from "../../../adapters/better-auth/client.ts";
import * as Contract from "./delete.contract.ts";

export const Handler = createHandler({
  domain: "organization",
  feature: "delete",
  execute: (encoded) => client.organization.delete(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: false,
});
```

### 6. SetActive Handler

**Contract** (`crud/set-active/set-active.contract.ts`):
```typescript
import { $IamClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { Organization } from "../../_common/index.ts";

const $I = $IamClientId.create("organization/crud/set-active");

export class Payload extends S.Class<Payload>($I`Payload`)({
  organizationId: S.String,
}) {}

// Returns the organization or null
export const Success = S.NullOr(Organization);
```

**Handler** (`crud/set-active/set-active.handler.ts`):
```typescript
import { createHandler } from "../../../_common/handler.factory.ts";
import { client } from "../../../adapters/better-auth/client.ts";
import * as Contract from "./set-active.contract.ts";

export const Handler = createHandler({
  domain: "organization",
  feature: "set-active",
  execute: (encoded) => client.organization.setActive(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: true,  // Changes active organization in session
});
```

## Barrel Files

### Individual Handler Index Files

Each handler directory needs an `index.ts`:
```typescript
// Example: crud/create/index.ts
export * as Contract from "./create.contract.ts";
export { Handler } from "./create.handler.ts";
```

### CRUD Barrel (`crud/index.ts`):
```typescript
export * as Create from "./create/index.ts";
export * as GetFull from "./get-full/index.ts";
export * as List from "./list/index.ts";
export * as Update from "./update/index.ts";
export * as Delete from "./delete/index.ts";
export * as SetActive from "./set-active/index.ts";
```

### Update Organization Barrel (`organization/index.ts`):
```typescript
// Shared schemas
export * from "./_common/index.ts";

// CRUD handlers
export * as Crud from "./crud/index.ts";

// Member handlers - Phase 5C
// export * as Members from "./members/index.ts";

// Invitation handlers - Phase 5D
// export * as Invitations from "./invitations/index.ts";
```

## Implementation Order

1. Create `crud/` directory
2. Implement handlers in this order (simplest to most complex):
   - `list/` (no payload)
   - `create/` (simple payload)
   - `delete/` (required organizationId)
   - `set-active/` (mutatesSession: true)
   - `update/` (nested data object)
   - `get-full/` (nested query object)
3. Create individual `index.ts` files for each handler
4. Create `crud/index.ts` barrel
5. Update `organization/index.ts` to export crud

## Verification

```bash
# Type check
bun run check --filter @beep/iam-client

# Lint
bun run lint:fix
```

## Success Criteria

- [ ] All 6 handler directories created under `crud/`
- [ ] Each handler has contract.ts, handler.ts, and index.ts
- [ ] `crud/index.ts` barrel exports all handlers
- [ ] `organization/index.ts` updated to export Crud
- [ ] Type check passes
- [ ] Lint passes

## Next Phase

After completing P5B, proceed to **HANDOFF_P5C.md** for Member Management handlers.

---

**Note**: Only `set-active` has `mutatesSession: true` - it changes the user's active organization in session state.
