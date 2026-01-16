# HANDOFF_P5C.md - Member Management Handlers

## Phase Overview

**Phase**: 5C of 6 (Sub-phase 3 of 4)
**Focus**: Organization Member Management handlers
**Package**: `@beep/iam-client`
**Handler Count**: 4 handlers

## Prerequisites Checklist

- [ ] Phase 5A (Shared Schemas) completed
- [ ] Phase 5B (Organization CRUD) completed
- [ ] Shared schemas exist in `src/organization/_common/`
- [ ] CRUD handlers exist in `src/organization/crud/`
- [ ] Type check passes: `bun run check --filter @beep/iam-client`

## Directory Structure

```
packages/iam/client/src/organization/
├── _common/                    # From Phase 5A
├── crud/                       # From Phase 5B
├── members/
│   ├── add/
│   │   ├── add.contract.ts
│   │   ├── add.handler.ts
│   │   └── index.ts
│   ├── remove/
│   │   ├── remove.contract.ts
│   │   ├── remove.handler.ts
│   │   └── index.ts
│   ├── update-role/
│   │   ├── update-role.contract.ts
│   │   ├── update-role.handler.ts
│   │   └── index.ts
│   ├── list/
│   │   ├── list.contract.ts
│   │   ├── list.handler.ts
│   │   └── index.ts
│   └── index.ts
└── index.ts                    # Update to export members
```

## Handler Specifications

| Handler | Client Method | Payload | Success Schema | mutatesSession |
|---------|---------------|---------|----------------|----------------|
| Add | `client.organization.addMember()` | `{ organizationId?, userId, role }` | `Member` | `false` |
| Remove | `client.organization.removeMember()` | `{ organizationId?, memberIdOrUserId }` | `Member` | `false` |
| UpdateRole | `client.organization.updateMemberRole()` | `{ organizationId?, memberId, role }` | `Member` | `false` |
| List | `client.organization.listMembers()` | `{ organizationId? }` | `S.Array(FullMember)` | `false` |

## Implementation Details

### 1. Add Member Handler

**Contract** (`members/add/add.contract.ts`):
```typescript
import { $IamClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { Member } from "../../_common/index.ts";

const $I = $IamClientId.create("organization/members/add");

export class Payload extends S.Class<Payload>($I`Payload`)({
  organizationId: S.optional(S.String),  // Uses active org if omitted
  userId: S.String,
  role: S.String,
}) {}

export const Success = Member;
```

**Handler** (`members/add/add.handler.ts`):
```typescript
import { createHandler } from "../../../_common/handler.factory.ts";
import { client } from "../../../adapters/better-auth/client.ts";
import * as Contract from "./add.contract.ts";

export const Handler = createHandler({
  domain: "organization/members",
  feature: "add",
  execute: (encoded) => client.organization.addMember(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: false,
});
```

### 2. Remove Member Handler

**Contract** (`members/remove/remove.contract.ts`):
```typescript
import { $IamClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { Member } from "../../_common/index.ts";

const $I = $IamClientId.create("organization/members/remove");

export class Payload extends S.Class<Payload>($I`Payload`)({
  organizationId: S.optional(S.String),  // Uses active org if omitted
  memberIdOrUserId: S.String,  // Can use either member ID or user ID
}) {}

export const Success = Member;
```

**Handler** (`members/remove/remove.handler.ts`):
```typescript
import { createHandler } from "../../../_common/handler.factory.ts";
import { client } from "../../../adapters/better-auth/client.ts";
import * as Contract from "./remove.contract.ts";

export const Handler = createHandler({
  domain: "organization/members",
  feature: "remove",
  execute: (encoded) => client.organization.removeMember(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: false,
});
```

### 3. Update Role Handler

**Contract** (`members/update-role/update-role.contract.ts`):
```typescript
import { $IamClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { Member } from "../../_common/index.ts";

const $I = $IamClientId.create("organization/members/update-role");

export class Payload extends S.Class<Payload>($I`Payload`)({
  organizationId: S.optional(S.String),  // Uses active org if omitted
  memberId: S.String,
  role: S.String,
}) {}

export const Success = Member;
```

**Handler** (`members/update-role/update-role.handler.ts`):
```typescript
import { createHandler } from "../../../_common/handler.factory.ts";
import { client } from "../../../adapters/better-auth/client.ts";
import * as Contract from "./update-role.contract.ts";

export const Handler = createHandler({
  domain: "organization/members",
  feature: "update-role",
  execute: (encoded) => client.organization.updateMemberRole(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: false,
});
```

### 4. List Members Handler

**Contract** (`members/list/list.contract.ts`):
```typescript
import { $IamClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { FullMember } from "../../_common/index.ts";

const $I = $IamClientId.create("organization/members/list");

export class Payload extends S.Class<Payload>($I`Payload`)({
  organizationId: S.optional(S.String),  // Uses active org if omitted
}) {}

// Returns members with embedded user data
export const Success = S.Array(FullMember);
```

**Handler** (`members/list/list.handler.ts`):
```typescript
import { createHandler } from "../../../_common/handler.factory.ts";
import { client } from "../../../adapters/better-auth/client.ts";
import * as Contract from "./list.contract.ts";

export const Handler = createHandler({
  domain: "organization/members",
  feature: "list",
  execute: (encoded) => client.organization.listMembers(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: false,
});
```

## Barrel Files

### Individual Handler Index Files

Each handler directory needs an `index.ts`:
```typescript
// Example: members/add/index.ts
export * as Contract from "./add.contract.ts";
export { Handler } from "./add.handler.ts";
```

### Members Barrel (`members/index.ts`):
```typescript
export * as Add from "./add/index.ts";
export * as Remove from "./remove/index.ts";
export * as UpdateRole from "./update-role/index.ts";
export * as List from "./list/index.ts";
```

### Update Organization Barrel (`organization/index.ts`):
```typescript
// Shared schemas
export * from "./_common/index.ts";

// CRUD handlers
export * as Crud from "./crud/index.ts";

// Member handlers
export * as Members from "./members/index.ts";

// Invitation handlers - Phase 5D
// export * as Invitations from "./invitations/index.ts";
```

## Implementation Order

1. Create `members/` directory
2. Implement handlers in this order:
   - `list/` (simple payload, returns FullMember array)
   - `add/` (adds new member)
   - `remove/` (removes member)
   - `update-role/` (changes member role)
3. Create individual `index.ts` files for each handler
4. Create `members/index.ts` barrel
5. Update `organization/index.ts` to export Members

## Key Notes

### Member vs FullMember
- **Member**: Basic member entity (id, organizationId, userId, role, createdAt)
- **FullMember**: Member with embedded user data (includes user.id, user.name, user.email, user.image)

`listMembers` returns `FullMember[]` while mutation operations (add, remove, updateRole) return `Member`.

### Optional organizationId Pattern
All member handlers accept optional `organizationId`:
- If omitted, Better Auth uses the user's **active organization** from session
- This is the common pattern for organization-scoped operations

### memberIdOrUserId in Remove
The `removeMember` endpoint accepts either:
- The member record ID (`member.id`)
- The user's ID (`member.userId`)

Better Auth resolves either to find the member record.

## Verification

```bash
# Type check
bun run check --filter @beep/iam-client

# Lint
bun run lint:fix
```

## Success Criteria

- [ ] All 4 handler directories created under `members/`
- [ ] Each handler has contract.ts, handler.ts, and index.ts
- [ ] `members/index.ts` barrel exports all handlers
- [ ] `organization/index.ts` updated to export Members
- [ ] Type check passes
- [ ] Lint passes

## Next Phase

After completing P5C, proceed to **HANDOFF_P5D.md** for Invitation handlers.

---

**Note**: No handlers in this phase require `mutatesSession: true` - member operations don't affect the current user's session state.
