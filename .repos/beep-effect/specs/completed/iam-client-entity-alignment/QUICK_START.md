# Quick Start

> Pattern reference with before/after examples for implementing EntityId alignment.

---

## Pattern 1: Common Schema EntityId Replacement

### Before (Wrong)
```typescript
// packages/iam/client/src/organization/_common/member.schema.ts
import { $IamClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $IamClientId.create("organization/_common/member");

export class Member extends S.Class<Member>($I`Member`)(
  {
    id: S.String,
    organizationId: S.String,
    userId: S.String,
    role: S.String,
    createdAt: S.DateFromString,
  }
) {}
```

### After (Correct)
```typescript
// packages/iam/client/src/organization/_common/member.schema.ts
import { $IamClientId } from "@beep/identity/packages";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $IamClientId.create("organization/_common/member");

export class Member extends S.Class<Member>($I`Member`)(
  {
    id: IamEntityIds.MemberId,
    organizationId: SharedEntityIds.OrganizationId,
    userId: SharedEntityIds.UserId,
    role: S.String,  // role is NOT an ID, keep as S.String
    createdAt: S.DateFromString,
  }
) {}
```

---

## Pattern 2: Contract Payload EntityId Replacement

### Before (Wrong)
```typescript
// packages/iam/client/src/organization/add-team-member/contract.ts
import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import { Wrap } from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("organization/add-team-member");

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
```

### After (Correct)
```typescript
// packages/iam/client/src/organization/add-team-member/contract.ts
import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain";
import { Wrap } from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("organization/add-team-member");

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

---

## Pattern 3: Transformation Schema (Reference)

Study this pattern from `packages/iam/client/src/_internal/user.schemas.ts`:

```typescript
import { SharedEntityIds } from "@beep/shared-domain";
import { User } from "@beep/shared-domain/entities";
import * as Effect from "effect/Effect";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";

/**
 * Better Auth user schema (what the API returns)
 */
export const BetterAuthUserSchema = S.Struct({
  id: S.String,  // Plain string from Better Auth
  email: S.String,
  name: S.String,
  // ... other fields
});

/**
 * Transform Better Auth response to domain entity
 */
export const DomainUserFromBetterAuthUser = S.transformOrFail(
  BetterAuthUserSchema,
  User.Model,
  {
    strict: true,
    decode: Effect.fn(function* (betterAuthUser, _options, ast) {
      // Validate ID format
      if (!SharedEntityIds.UserId.is(betterAuthUser.id)) {
        return yield* ParseResult.fail(
          new ParseResult.Type(
            ast,
            betterAuthUser.id,
            `Invalid user ID format: expected "shared_user__<uuid>", got "${betterAuthUser.id}"`
          )
        );
      }

      // Return encoded form of domain entity
      return {
        id: betterAuthUser.id,
        email: betterAuthUser.email,
        name: betterAuthUser.name,
        // ... map all required fields
      };
    }),
    encode: Effect.fn(function* (domain) {
      // Reverse transformation for encoding
      return {
        id: domain.id,
        email: domain.email,
        name: domain.name,
        // ...
      };
    }),
  }
);
```

---

## ID Type Quick Reference

| Field Pattern | EntityId Type | Import From |
|---------------|---------------|-------------|
| `id` (member) | `IamEntityIds.MemberId` | `@beep/shared-domain` |
| `id` (invitation) | `IamEntityIds.InvitationId` | `@beep/shared-domain` |
| `id` (organization) | `SharedEntityIds.OrganizationId` | `@beep/shared-domain` |
| `id` (team) | `SharedEntityIds.TeamId` | `@beep/shared-domain` |
| `id` (user) | `SharedEntityIds.UserId` | `@beep/shared-domain` |
| `id` (session) | `SharedEntityIds.SessionId` | `@beep/shared-domain` |
| `id` (api-key) | `IamEntityIds.ApiKeyId` | `@beep/shared-domain` |
| `id` (account) | `IamEntityIds.AccountId` | `@beep/shared-domain` |
| `id` (passkey) | `IamEntityIds.PasskeyId` | `@beep/shared-domain` |
| `organizationId` | `SharedEntityIds.OrganizationId` | `@beep/shared-domain` |
| `userId` | `SharedEntityIds.UserId` | `@beep/shared-domain` |
| `teamId` | `SharedEntityIds.TeamId` | `@beep/shared-domain` |
| `memberId` | `IamEntityIds.MemberId` | `@beep/shared-domain` |
| `invitationId` | `IamEntityIds.InvitationId` | `@beep/shared-domain` |
| `inviterId` | `SharedEntityIds.UserId` | `@beep/shared-domain` |
| `sessionId` | `SharedEntityIds.SessionId` | `@beep/shared-domain` |

---

## Fields That Should NOT Be Changed

| Field | Type | Reason |
|-------|------|--------|
| `role` | `S.String` or `S.Literal(...)` | Role names, not IDs |
| `email` | `S.String` or `BS.EmailBase` | Email addresses |
| `name` | `S.String` | Display names |
| `slug` | `S.String` | URL slugs |
| `token` | `S.String` | Auth tokens (not entity IDs) |
| `code` | `S.String` | Verification codes |
| `status` | `S.Literal(...)` | Enum values |

---

## Common Import Block

```typescript
import { $IamClientId } from "@beep/identity/packages";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Effect from "effect/Effect";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
```

---

## Verification Commands

```bash
# Type check
bun run check --filter @beep/iam-client

# Lint and fix
bun run lint:fix --filter @beep/iam-client

# Find remaining plain string IDs
grep -r ": S.String" packages/iam/client/src/ | grep -iE "(id|Id):"
# Should return empty when complete
```
