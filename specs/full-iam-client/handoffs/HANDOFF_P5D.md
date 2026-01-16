# HANDOFF_P5D.md - Invitation Handlers

## Phase Overview

**Phase**: 5D of 6 (Sub-phase 4 of 4 - Final Organization Phase)
**Focus**: Organization Invitation handlers
**Package**: `@beep/iam-client`
**Handler Count**: 5 handlers

## Prerequisites Checklist

- [ ] Phase 5A (Shared Schemas) completed
- [ ] Phase 5B (Organization CRUD) completed
- [ ] Phase 5C (Member Management) completed
- [ ] All organization directories exist: `_common/`, `crud/`, `members/`
- [ ] Type check passes: `bun run check --filter @beep/iam-client`

## Directory Structure

```
packages/iam/client/src/organization/
├── _common/                    # From Phase 5A
├── crud/                       # From Phase 5B
├── members/                    # From Phase 5C
├── invitations/
│   ├── create/
│   │   ├── create.contract.ts
│   │   ├── create.handler.ts
│   │   └── index.ts
│   ├── accept/
│   │   ├── accept.contract.ts
│   │   ├── accept.handler.ts
│   │   └── index.ts
│   ├── reject/
│   │   ├── reject.contract.ts
│   │   ├── reject.handler.ts
│   │   └── index.ts
│   ├── cancel/
│   │   ├── cancel.contract.ts
│   │   ├── cancel.handler.ts
│   │   └── index.ts
│   ├── list/
│   │   ├── list.contract.ts
│   │   ├── list.handler.ts
│   │   └── index.ts
│   └── index.ts
└── index.ts                    # Final update to export all
```

## Handler Specifications

| Handler | Client Method | Payload | Success Schema | mutatesSession |
|---------|---------------|---------|----------------|----------------|
| Create | `client.organization.inviteMember()` | `{ organizationId?, email, role }` | `Invitation` | `false` |
| Accept | `client.organization.acceptInvitation()` | `{ invitationId }` | `Invitation` | `true` |
| Reject | `client.organization.rejectInvitation()` | `{ invitationId }` | `Invitation` | `false` |
| Cancel | `client.organization.cancelInvitation()` | `{ invitationId }` | `Invitation` | `false` |
| List | `client.organization.listInvitations()` | `{ organizationId? }` | `S.Array(Invitation)` | `false` |

## Implementation Details

### 1. Create Invitation Handler

**Contract** (`invitations/create/create.contract.ts`):
```typescript
import { $IamClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { Invitation } from "../../_common/index.ts";

const $I = $IamClientId.create("organization/invitations/create");

export class Payload extends S.Class<Payload>($I`Payload`)({
  organizationId: S.optional(S.String),  // Uses active org if omitted
  email: S.String,
  role: S.String,
}) {}

export const Success = Invitation;
```

**Handler** (`invitations/create/create.handler.ts`):
```typescript
import { createHandler } from "../../../_common/handler.factory.ts";
import { client } from "../../../adapters/better-auth/client.ts";
import * as Contract from "./create.contract.ts";

export const Handler = createHandler({
  domain: "organization/invitations",
  feature: "create",
  execute: (encoded) => client.organization.inviteMember(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: false,
});
```

### 2. Accept Invitation Handler

**Contract** (`invitations/accept/accept.contract.ts`):
```typescript
import { $IamClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { Invitation } from "../../_common/index.ts";

const $I = $IamClientId.create("organization/invitations/accept");

export class Payload extends S.Class<Payload>($I`Payload`)({
  invitationId: S.String,
}) {}

export const Success = Invitation;
```

**Handler** (`invitations/accept/accept.handler.ts`):
```typescript
import { createHandler } from "../../../_common/handler.factory.ts";
import { client } from "../../../adapters/better-auth/client.ts";
import * as Contract from "./accept.contract.ts";

export const Handler = createHandler({
  domain: "organization/invitations",
  feature: "accept",
  execute: (encoded) => client.organization.acceptInvitation(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: true,  // User joins organization, affects session
});
```

### 3. Reject Invitation Handler

**Contract** (`invitations/reject/reject.contract.ts`):
```typescript
import { $IamClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { Invitation } from "../../_common/index.ts";

const $I = $IamClientId.create("organization/invitations/reject");

export class Payload extends S.Class<Payload>($I`Payload`)({
  invitationId: S.String,
}) {}

export const Success = Invitation;
```

**Handler** (`invitations/reject/reject.handler.ts`):
```typescript
import { createHandler } from "../../../_common/handler.factory.ts";
import { client } from "../../../adapters/better-auth/client.ts";
import * as Contract from "./reject.contract.ts";

export const Handler = createHandler({
  domain: "organization/invitations",
  feature: "reject",
  execute: (encoded) => client.organization.rejectInvitation(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: false,
});
```

### 4. Cancel Invitation Handler

**Contract** (`invitations/cancel/cancel.contract.ts`):
```typescript
import { $IamClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { Invitation } from "../../_common/index.ts";

const $I = $IamClientId.create("organization/invitations/cancel");

export class Payload extends S.Class<Payload>($I`Payload`)({
  invitationId: S.String,
}) {}

export const Success = Invitation;
```

**Handler** (`invitations/cancel/cancel.handler.ts`):
```typescript
import { createHandler } from "../../../_common/handler.factory.ts";
import { client } from "../../../adapters/better-auth/client.ts";
import * as Contract from "./cancel.contract.ts";

export const Handler = createHandler({
  domain: "organization/invitations",
  feature: "cancel",
  execute: (encoded) => client.organization.cancelInvitation(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: false,
});
```

### 5. List Invitations Handler

**Contract** (`invitations/list/list.contract.ts`):
```typescript
import { $IamClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { Invitation } from "../../_common/index.ts";

const $I = $IamClientId.create("organization/invitations/list");

export class Payload extends S.Class<Payload>($I`Payload`)({
  organizationId: S.optional(S.String),  // Uses active org if omitted
}) {}

export const Success = S.Array(Invitation);
```

**Handler** (`invitations/list/list.handler.ts`):
```typescript
import { createHandler } from "../../../_common/handler.factory.ts";
import { client } from "../../../adapters/better-auth/client.ts";
import * as Contract from "./list.contract.ts";

export const Handler = createHandler({
  domain: "organization/invitations",
  feature: "list",
  execute: (encoded) => client.organization.listInvitations(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: false,
});
```

## Barrel Files

### Individual Handler Index Files

Each handler directory needs an `index.ts`:
```typescript
// Example: invitations/accept/index.ts
export * as Contract from "./accept.contract.ts";
export { Handler } from "./accept.handler.ts";
```

### Invitations Barrel (`invitations/index.ts`):
```typescript
export * as Create from "./create/index.ts";
export * as Accept from "./accept/index.ts";
export * as Reject from "./reject/index.ts";
export * as Cancel from "./cancel/index.ts";
export * as List from "./list/index.ts";
```

### Final Organization Barrel (`organization/index.ts`):
```typescript
// Shared schemas
export * from "./_common/index.ts";

// CRUD handlers
export * as Crud from "./crud/index.ts";

// Member handlers
export * as Members from "./members/index.ts";

// Invitation handlers
export * as Invitations from "./invitations/index.ts";
```

## Final Integration: Update Package Index

After all organization handlers are complete, update the main package index:

**`packages/iam/client/src/index.ts`** - Add Organization export:
```typescript
// ... existing exports ...

// Organization Management
export * as Organization from "./organization/index.ts";
```

## Implementation Order

1. Create `invitations/` directory
2. Implement handlers in this order:
   - `list/` (simple list operation)
   - `create/` (inviteMember)
   - `accept/` (mutatesSession: true)
   - `reject/`
   - `cancel/`
3. Create individual `index.ts` files for each handler
4. Create `invitations/index.ts` barrel
5. Update `organization/index.ts` to export Invitations
6. **Update main package index** (`src/index.ts`) to export Organization

## Key Notes

### Accept Invitation Session Effect
`acceptInvitation` has `mutatesSession: true` because:
- User becomes a member of the organization
- This may affect their available organizations list
- Session state needs to reflect the new membership

### Invitation Status Flow
Invitations follow this state machine:
```
pending → accepted (via acceptInvitation)
pending → rejected (via rejectInvitation)
pending → canceled (via cancelInvitation)
```

### Client Method Naming
Note the difference between handler names and client methods:
- **Create** handler → `client.organization.inviteMember()`
- **Accept/Reject/Cancel** handlers → `client.organization.{action}Invitation()`

## Verification

```bash
# Type check
bun run check --filter @beep/iam-client

# Lint
bun run lint:fix
```

## Success Criteria

- [ ] All 5 handler directories created under `invitations/`
- [ ] Each handler has contract.ts, handler.ts, and index.ts
- [ ] `invitations/index.ts` barrel exports all handlers
- [ ] `organization/index.ts` exports all sub-modules (Crud, Members, Invitations)
- [ ] Main package `src/index.ts` exports Organization module
- [ ] Type check passes
- [ ] Lint passes

## MANDATORY: Create HANDOFF_P6.md

After completing Phase 5D, you **MUST** create `HANDOFF_P6.md` for the final phase: Multi-Session Management.

### Phase 6 Preview: Multi-Session Management

The final phase covers session management:
- `listSessions` - List user's active sessions
- `revokeSession` - Revoke a specific session
- `revokeOtherSessions` - Revoke all sessions except current
- `revokeSessions` - Revoke all sessions

### Before Creating HANDOFF_P6.md

**VERIFY** response schemas from Better Auth source:
```
tmp/better-auth/packages/better-auth/src/client/plugins/multi-session.ts
```

Or check the `multiSessionClient` plugin type definitions in:
```
node_modules/better-auth/dist/client/plugins/multi-session.d.ts
```

### HANDOFF_P6.md Template Structure

```markdown
# HANDOFF_P6.md - Multi-Session Management

## Phase Overview
- Phase: 6 of 6 (Final Phase)
- Focus: Session Management handlers
- Handler Count: 4 handlers

## Directory Structure
packages/iam/client/src/multi-session/
├── list/
├── revoke/
├── revoke-others/
├── revoke-all/
└── index.ts

## Handler Specifications
[Verify from Better Auth source and document]

## Implementation Details
[Based on verified schemas]
```

---

**Note**: Only `acceptInvitation` has `mutatesSession: true` in this phase - it adds the user to an organization.
