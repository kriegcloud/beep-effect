# HANDOFF_P5A.md - Organization Shared Schemas

## Phase Overview

**Phase**: 5A of 6 (Sub-phase 1 of 4)
**Focus**: Shared schemas for Organization Management
**Package**: `@beep/iam-client`
**Scope**: Schema definitions only (no handlers)

## Prerequisites Checklist

- [x] Phase 4 (Two-Factor Authentication) completed
- [x] `organizationClient()` plugin already configured in Better Auth client
- [x] Response schemas verified from Better Auth source code
- [ ] All type checks passing (`bun run check --filter @beep/iam-client`)

## Directory Structure

```
packages/iam/client/src/organization/
├── _common/
│   ├── index.ts
│   ├── organization.schema.ts    # Organization, FullOrganization
│   ├── member.schema.ts          # Member, FullMember
│   └── invitation.schema.ts      # Invitation
└── index.ts                      # Placeholder barrel (exports _common only)
```

## Schema Specifications

### Source Files Reviewed
- `tmp/better-auth/packages/better-auth/src/plugins/organization/routes/crud-org.ts`
- `tmp/better-auth/packages/better-auth/src/plugins/organization/routes/crud-members.ts`
- `tmp/better-auth/packages/better-auth/src/plugins/organization/routes/crud-invites.ts`
- `tmp/better-auth/packages/better-auth/src/plugins/organization/schema.ts`

### 1. Organization Schema (`organization.schema.ts`)

```typescript
import { $IamClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $IamClientId.create("organization/_common/organization");

/**
 * Base Organization entity from Better Auth organization plugin.
 * Used in create, update, list, setActive responses.
 */
export class Organization extends S.Class<Organization>($I`Organization`)({
  id: S.String,
  name: S.String,
  slug: S.String,
  logo: S.NullOr(S.String),
  metadata: S.optional(S.Unknown),
  createdAt: S.DateFromString,
}) {}

/**
 * Embedded user data within FullMember.
 * Subset of user fields returned by Better Auth.
 */
export class EmbeddedUser extends S.Class<EmbeddedUser>($I`EmbeddedUser`)({
  id: S.String,
  name: S.String,
  email: S.String,
  image: S.NullOr(S.String),
}) {}

/**
 * Full organization with members and invitations.
 * Returned by getFullOrganization endpoint.
 *
 * Note: Import FullMember from member.schema.ts and Invitation from invitation.schema.ts
 * This schema will be completed after those are defined.
 */
// FullOrganization defined after Member and Invitation schemas are available
```

### 2. Member Schema (`member.schema.ts`)

```typescript
import { $IamClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { EmbeddedUser } from "./organization.schema.ts";

const $I = $IamClientId.create("organization/_common/member");

/**
 * Organization member entity.
 * Used in addMember, removeMember, updateMemberRole responses.
 */
export class Member extends S.Class<Member>($I`Member`)({
  id: S.String,
  organizationId: S.String,
  userId: S.String,
  role: S.String,
  createdAt: S.DateFromString,
}) {}

/**
 * Organization member with embedded user details.
 * Used in listMembers response and FullOrganization.members.
 */
export class FullMember extends S.Class<FullMember>($I`FullMember`)({
  id: S.String,
  organizationId: S.String,
  userId: S.String,
  role: S.String,
  createdAt: S.DateFromString,
  user: EmbeddedUser,
}) {}
```

### 3. Invitation Schema (`invitation.schema.ts`)

```typescript
import { $IamClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $IamClientId.create("organization/_common/invitation");

/**
 * Invitation status enum.
 */
export const InvitationStatus = S.Literal("pending", "accepted", "rejected", "canceled");
export type InvitationStatus = S.Schema.Type<typeof InvitationStatus>;

/**
 * Organization invitation entity.
 * Used in invitation CRUD responses.
 */
export class Invitation extends S.Class<Invitation>($I`Invitation`)({
  id: S.String,
  organizationId: S.String,
  email: S.String,
  role: S.String,
  status: InvitationStatus,
  expiresAt: S.DateFromString,
  inviterId: S.String,
}) {}
```

### 4. FullOrganization Schema (add to `organization.schema.ts`)

After Member and Invitation schemas are defined, add FullOrganization:

```typescript
import { FullMember } from "./member.schema.ts";
import { Invitation } from "./invitation.schema.ts";

/**
 * Full organization with members and invitations.
 * Returned by getFullOrganization endpoint.
 */
export class FullOrganization extends S.Class<FullOrganization>($I`FullOrganization`)({
  id: S.String,
  name: S.String,
  slug: S.String,
  logo: S.NullOr(S.String),
  metadata: S.optional(S.Unknown),
  createdAt: S.DateFromString,
  members: S.Array(FullMember),
  invitations: S.Array(Invitation),
}) {}
```

## Implementation Steps

### Step 1: Create Directory Structure
```bash
mkdir -p packages/iam/client/src/organization/_common
```

### Step 2: Create Schema Files (in order)

1. **Create `organization.schema.ts`** with Organization and EmbeddedUser only (defer FullOrganization)
2. **Create `member.schema.ts`** with Member and FullMember
3. **Create `invitation.schema.ts`** with Invitation and InvitationStatus
4. **Update `organization.schema.ts`** to add FullOrganization (imports from other schemas)

### Step 3: Create Barrel Files

**`_common/index.ts`**:
```typescript
// Organization schemas
export { Organization, EmbeddedUser, FullOrganization } from "./organization.schema.ts";

// Member schemas
export { Member, FullMember } from "./member.schema.ts";

// Invitation schemas
export { Invitation, InvitationStatus } from "./invitation.schema.ts";
```

**`organization/index.ts`** (placeholder):
```typescript
// Shared schemas
export * from "./_common/index.ts";

// CRUD handlers - Phase 5B
// export * as Crud from "./crud/index.ts";

// Member handlers - Phase 5C
// export * as Members from "./members/index.ts";

// Invitation handlers - Phase 5D
// export * as Invitations from "./invitations/index.ts";
```

### Step 4: Verify Type Check
```bash
bun run check --filter @beep/iam-client
```

## Schema Design Notes

### Why EmbeddedUser is Separate
Better Auth returns a subset of user fields in member responses. Using a dedicated `EmbeddedUser` class:
- Avoids importing full User schema from elsewhere
- Documents exactly which fields Better Auth returns
- Allows for schema evolution if Better Auth adds fields

### Circular Import Prevention
The schema file order prevents circular imports:
1. `organization.schema.ts` - defines EmbeddedUser (no imports from sibling files)
2. `member.schema.ts` - imports EmbeddedUser
3. `invitation.schema.ts` - no sibling imports
4. `organization.schema.ts` (updated) - imports from member and invitation

### Optional Fields Pattern
- `metadata: S.optional(S.Unknown)` - Better Auth allows arbitrary metadata
- `logo: S.NullOr(S.String)` - Can be explicitly null or a URL string

## Success Criteria

- [ ] Directory `packages/iam/client/src/organization/_common/` created
- [ ] `organization.schema.ts` with Organization, EmbeddedUser, FullOrganization
- [ ] `member.schema.ts` with Member, FullMember
- [ ] `invitation.schema.ts` with Invitation, InvitationStatus
- [ ] `_common/index.ts` barrel file exporting all schemas
- [ ] `organization/index.ts` placeholder barrel file
- [ ] Type check passes: `bun run check --filter @beep/iam-client`

## Next Phase

After completing P5A, proceed to **HANDOFF_P5B.md** for Organization CRUD handlers.

---

**DO NOT** update the main package index.ts yet - that happens in Phase 5D after all handlers are complete.
