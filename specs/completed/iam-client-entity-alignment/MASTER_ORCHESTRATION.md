# Master Orchestration

> Complete workflow for implementing the IAM Client Entity Alignment spec.

---

## Phase State Machine

```
P0: Inventory → P1: Foundation → P2: Payloads → P3: Success → P4: Verification → Complete
      ↑              ↑                ↑              ↑              ↑
      └──── Each phase has quality gate before proceeding ────────────┘
```

---

## Phase 0: Inventory & Analysis

### Objective
Create an exhaustive catalog of ALL files and fields that need updates.

### Tasks

1. **Enumerate all schema files** in `packages/iam/client/src/`
2. **Document each file** with:
   - Exact file path
   - Schema class names
   - Each field using `S.String` that should use a branded EntityId
   - The correct EntityId type to use
   - Whether a transformation schema is needed

### Categorization

| Category | Pattern | Description |
|----------|---------|-------------|
| Common schemas | `_common/*.schema.ts` | Shared entity schemas (Member, Organization, Team, Invitation) |
| Internal schemas | `_internal/*.schemas.ts` | Internal schemas (ApiKey, common schemas) |
| Contracts | `*/contract.ts` | Payload and Success schemas |

### Output

Create `outputs/P0-inventory.md` with format:

```markdown
# P0 Inventory

## _common/ Directory

### organization/_common/member.schema.ts
- **Member** class
  - `id: S.String` → `IamEntityIds.MemberId`
  - `organizationId: S.String` → `SharedEntityIds.OrganizationId`
  - `userId: S.String` → `SharedEntityIds.UserId`
- **FullMember** class
  - Same fields as Member
  - Needs transformation schema

### organization/_common/organization.schema.ts
...
```

### Quality Gate
- Inventory file complete and comprehensive
- All files in `packages/iam/client/src/` audited

---

## Phase 1: Foundation Schemas

### Objective
Update `_common/*.schema.ts` files and create transformation schemas.

### Scope
- `packages/iam/client/src/organization/_common/*.schema.ts`
- `packages/iam/client/src/two-factor/_common/*.schema.ts`
- `packages/iam/client/src/_internal/api-key.schemas.ts` (if exists)
- `packages/iam/client/src/_internal/common.schemas.ts`

### Implementation Pattern

#### Step 1: Add EntityId Imports
```typescript
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
```

#### Step 2: Replace String Fields
```typescript
// Before
export class Member extends S.Class<Member>($I`Member`)({
  id: S.String,
  organizationId: S.String,
  userId: S.String,
  ...
}) {}

// After
export class Member extends S.Class<Member>($I`Member`)({
  id: IamEntityIds.MemberId,
  organizationId: SharedEntityIds.OrganizationId,
  userId: SharedEntityIds.UserId,
  ...
}) {}
```

#### Step 3: Create Transformation Schemas (where needed)
For entities returned by Better Auth that need domain mapping:

```typescript
export const DomainMemberFromBetterAuthMember = S.transformOrFail(
  BetterAuthMemberSchema,
  DomainMember.Model,
  {
    strict: true,
    decode: Effect.fn(function* (betterAuthMember, _options, ast) {
      // Validate IDs
      if (!IamEntityIds.MemberId.is(betterAuthMember.id)) {
        return yield* ParseResult.fail(
          new ParseResult.Type(ast, betterAuthMember.id, `Invalid member ID format`)
        );
      }
      // ... rest of transformation
    }),
    encode: Effect.fn(function* (domain) {
      // Reverse transformation
    }),
  }
);
```

### Quality Gate
```bash
bun run check --filter @beep/iam-client
```

---

## Phase 2: Contract Payloads

### Objective
Update all `Payload` classes in `*/contract.ts` to use branded EntityIds.

### Scope
All contract files with Payload classes that have ID fields:
- `organization/*/contract.ts`
- `admin/*/contract.ts`
- `api-key/*/contract.ts`
- `oauth2/*/contract.ts`
- `multi-session/*/contract.ts`
- etc.

### Implementation Pattern

```typescript
// Before
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    teamId: S.String,
    userId: S.String,
  },
  formValuesAnnotation({
    teamId: "",
    userId: "",
  })
) {}

// After
import { SharedEntityIds } from "@beep/shared-domain";

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    teamId: SharedEntityIds.TeamId,
    userId: SharedEntityIds.UserId,
  },
  formValuesAnnotation({
    teamId: "" as SharedEntityIds.TeamId.Type,
    userId: "" as SharedEntityIds.UserId.Type,
  })
) {}
```

### Important Notes
- `wrapIamMethod` auto-encodes payloads - branded EntityIds encode to strings automatically
- `formValuesAnnotation` needs type assertions for default values
- Group changes by domain to minimize context switching

### Quality Gate
```bash
bun run check --filter @beep/iam-client
```

---

## Phase 3: Contract Success Schemas

### Objective
Update all `Success` classes to use transformed domain types where applicable.

### Scope
All contract files with Success classes that reference entity schemas:
- Files that import from `_common/`
- Files that return user, member, organization, invitation objects

### Implementation Pattern

If a Success schema references a `_common/` schema that now uses EntityIds:

```typescript
// The _common schema is already updated in P1
// Success classes should automatically pick up the changes

// If transformation is needed:
export class Success extends S.Class<Success>($I`Success`)({
  member: DomainMemberFromBetterAuthMember,  // Use transformation schema
}) {}
```

### Quality Gate
```bash
bun run check --filter @beep/iam-client
```

---

## Phase 4: Verification & Cleanup

### Objective
Final verification that all success criteria are met.

### Tasks

1. **Full type check**
   ```bash
   bun run check --filter @beep/iam-client
   ```

2. **Lint fix**
   ```bash
   bun run lint:fix --filter @beep/iam-client
   ```

3. **Verify no plain strings for IDs**
   ```bash
   grep -r ": S.String" packages/iam/client/src/ | grep -iE "(id|Id):"
   # Should return empty
   ```

4. **Update documentation**
   - Review `packages/iam/client/AGENTS.md`
   - Add notes about EntityId usage if patterns changed

### Quality Gate
All success criteria from README.md must pass.

---

## Entity ID Reference

### SharedEntityIds (packages/shared/domain/src/entity-ids/shared/ids.ts)
| ID | Format | Usage |
|----|--------|-------|
| `UserId` | `shared_user__<uuid>` | User references |
| `OrganizationId` | `shared_organization__<uuid>` | Organization references |
| `TeamId` | `shared_team__<uuid>` | Team references |
| `SessionId` | `shared_session__<uuid>` | Session references |
| `FileId` | `shared_file__<uuid>` | File references |

### IamEntityIds (packages/shared/domain/src/entity-ids/iam/ids.ts)
| ID | Format | Usage |
|----|--------|-------|
| `MemberId` | `iam_member__<uuid>` | Organization member |
| `InvitationId` | `iam_invitation__<uuid>` | Organization invitation |
| `TeamMemberId` | `iam_team_member__<uuid>` | Team member |
| `ApiKeyId` | `iam_apikey__<uuid>` | API key |
| `AccountId` | `iam_account__<uuid>` | User account |
| `PasskeyId` | `iam_passkey__<uuid>` | WebAuthn passkey |
| `TwoFactorId` | `iam_two_factor__<uuid>` | 2FA record |
| `VerificationId` | `iam_verification__<uuid>` | Email verification |
| `OAuthClientId` | `iam_oauth_client__<uuid>` | OAuth client |
| `OAuthConsentId` | `iam_oauth_consent__<uuid>` | OAuth consent |
| `DeviceCodeId` | `iam_device_code__<uuid>` | Device authorization code |

---

## Known Gotchas

### Better Auth Returns Plain Strings
Better Auth API returns plain string IDs. Transformation schemas validate format before accepting.

### wrapIamMethod Auto-Encoding
The `wrapIamMethod` factory automatically encodes payloads. Branded EntityIds encode to their underlying string representation.

### formValuesAnnotation Type Assertions
For branded types in form defaults, use type assertions:
```typescript
formValuesAnnotation({
  userId: "" as SharedEntityIds.UserId.Type,
})
```

### Query Wrapping
Some Better Auth methods expect `{ query: payload }`. Preserve this pattern:
```typescript
execute: (encoded) => client.organization.listMembers({ query: encoded })
```
