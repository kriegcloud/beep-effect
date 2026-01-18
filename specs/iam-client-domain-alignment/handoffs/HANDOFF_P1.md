# IAM Client Domain Schema Alignment — Phase 1 Handoff

## Mission

Align all IAM client contract success schemas with domain entities from `@beep/iam-domain/entities` and `@beep/shared-domain/entities`. Currently, many contracts define inline schemas that duplicate domain entity definitions instead of using proper transformation schemas.

---

## Key Context

### Embedded Entity Handling (FullMember.user)

`FullMember` includes an embedded `user` object with only 4 fields (`id`, `name`, `email`, `image`), but `User.Model` has 25+ fields.

**Approach**: Create `BetterAuthEmbeddedUserSchema` — a minimal user schema for embedded contexts that only includes fields Better Auth returns. This is for **display purposes only**; full user data should be fetched separately if needed. Do NOT attempt to transform to `User.Model`.

---

## Phase 0: Discovery (COMPLETED)

This section documents the actual Better Auth response shapes discovered by analyzing source code.

### Key Finding: additionalFields ARE Returned

Better Auth's `additionalFields` configuration (in `packages/iam/server/src/adapters/better-auth/Options.ts`) causes these fields to be stored in the database AND returned in API responses. Per Better Auth docs: "When you add extra fields to a model, the relevant API endpoints will automatically accept and return these new properties."

**Consequence**: ALL domain model fields align with Better Auth responses. The only consideration is:
- **Embedded user** — only 4 fields returned, not full User.Model (for display purposes only)

### Better Auth Response Shapes

#### Member (from `plugins/organization/schema.ts` + additionalFields)

```typescript
// Base Zod schema from Better Auth source
const memberSchema = z.object({
  id: z.string().default(generateId),
  organizationId: z.string(),
  userId: z.coerce.string(),
  role: roleSchema,  // string literal union
  createdAt: z.date().default(() => new Date()),
});

// Additional fields configured in Options.ts (returned in responses)
const memberAdditionalFields = {
  status: { type: "string", required: true, defaultValue: "active" },
  invitedBy: { type: "string", required: false },
  invitedAt: { type: "date", required: false },
  joinedAt: { type: "date", required: false },
  lastActiveAt: { type: "date", required: false },
  permissions: { type: "string", required: false },  // JSON string
};

// Effect Schema equivalent for transformation (uses S.Record extension for plugin fields)
const BetterAuthMemberSchema = S.Struct(
  {
    id: S.String,
    organizationId: S.String,
    userId: S.String,
    role: S.String,
    createdAt: S.DateFromSelf,
    // additionalFields (member-specific, returned by Better Auth)
    status: S.String,
    invitedBy: S.optional(S.String),
    invitedAt: S.optional(S.DateFromSelf),
    joinedAt: S.optional(S.DateFromSelf),
    lastActiveAt: S.optional(S.DateFromSelf),
    permissions: S.optional(S.String),
    // additionalFieldsCommon (audit columns, returned by Better Auth)
    _rowId: S.optional(S.Number),
    version: S.optional(S.Number),
    source: S.optional(S.String),
    createdBy: S.optional(S.NullOr(S.String)),
    updatedBy: S.optional(S.NullOr(S.String)),
    updatedAt: S.optional(S.DateFromSelf),
    deletedAt: S.optional(S.DateFromSelf),
    deletedBy: S.optional(S.NullOr(S.String)),
  },
  S.Record({ key: S.String, value: S.Unknown })
);
```

#### FullMember (from `routes/crud-members.ts`)

```typescript
// Better Auth response shape for listMembers (uses S.Record extension)
const BetterAuthFullMemberSchema = S.Struct(
  {
    id: S.String,
    organizationId: S.String,
    userId: S.String,
    role: S.String,
    createdAt: S.DateFromSelf,
    user: S.Struct({
      id: S.String,
      name: S.String,
      email: S.String,
      image: S.NullOr(S.String),
    }),
    // additionalFields (member-specific, returned by Better Auth)
    status: S.String,
    invitedBy: S.optional(S.String),
    invitedAt: S.optional(S.DateFromSelf),
    joinedAt: S.optional(S.DateFromSelf),
    lastActiveAt: S.optional(S.DateFromSelf),
    permissions: S.optional(S.String),
    // additionalFieldsCommon (audit columns, returned by Better Auth)
    _rowId: S.optional(S.Number),
    version: S.optional(S.Number),
    source: S.optional(S.String),
    createdBy: S.optional(S.NullOr(S.String)),
    updatedBy: S.optional(S.NullOr(S.String)),
    updatedAt: S.optional(S.DateFromSelf),
    deletedAt: S.optional(S.DateFromSelf),
    deletedBy: S.optional(S.NullOr(S.String)),
  },
  S.Record({ key: S.String, value: S.Unknown })
);
```

#### Invitation (from `plugins/organization/schema.ts`)

```typescript
// Zod schema from Better Auth source
const invitationSchema = z.object({
  id: z.string().default(generateId),
  organizationId: z.string(),
  email: z.string(),
  role: roleSchema,
  status: invitationStatus,  // "pending" | "accepted" | "rejected" | "canceled"
  teamId: z.string().nullish(),
  inviterId: z.string(),
  expiresAt: z.date(),
  createdAt: z.date().default(() => new Date()),
});

// Effect Schema equivalent for transformation (uses S.Record extension for plugin fields)
const BetterAuthInvitationSchema = S.Struct(
  {
    id: S.String,
    organizationId: S.String,
    email: S.String,
    role: S.String,
    status: S.String,
    teamId: S.optionalWith(S.String, { nullable: true }),
    inviterId: S.String,
    expiresAt: S.DateFromSelf,
    createdAt: S.DateFromSelf,
    // additionalFieldsCommon (audit columns, returned by Better Auth)
    _rowId: S.optional(S.Number),
    version: S.optional(S.Number),
    source: S.optional(S.String),
    createdBy: S.optional(S.NullOr(S.String)),
    updatedBy: S.optional(S.NullOr(S.String)),
    updatedAt: S.optional(S.DateFromSelf),
    deletedAt: S.optional(S.DateFromSelf),
    deletedBy: S.optional(S.NullOr(S.String)),
  },
  S.Record({ key: S.String, value: S.Unknown })
);
```

#### Organization (from `plugins/organization/schema.ts` + additionalFields)

```typescript
// Base Zod schema from Better Auth source
const organizationSchema = z.object({
  id: z.string().default(generateId),
  name: z.string(),
  slug: z.string(),
  logo: z.string().nullish().optional(),
  metadata: z.record(z.string(), z.unknown())
    .or(z.string().transform((v) => JSON.parse(v)))
    .optional(),
  createdAt: z.date(),
});

// Additional fields configured in Options.ts (returned in responses)
const organizationAdditionalFields = {
  type: { type: "string", required: false, defaultValue: "individual" },
  ownerUserId: { type: "string", required: false },
  isPersonal: { type: "boolean", required: true },
  maxMembers: { type: "number", required: false },
  features: { type: "json", required: false },
  settings: { type: "json", required: false },
  subscriptionTier: { type: "string", required: false, defaultValue: "free" },
  subscriptionStatus: { type: "string", required: false, defaultValue: "active" },
};

// Effect Schema equivalent for transformation (uses S.Record extension for plugin fields)
const BetterAuthOrganizationSchema = S.Struct(
  {
    id: S.String,
    name: S.String,
    slug: S.String,
    logo: S.optionalWith(S.String, { nullable: true }),
    metadata: S.optional(S.Unknown),
    createdAt: S.DateFromSelf,
    // additionalFields (organization-specific, returned by Better Auth)
    type: S.optional(S.String),
    ownerUserId: S.optional(S.String),
    isPersonal: S.Boolean,
    maxMembers: S.optional(S.Number),
    features: S.optional(S.Unknown),  // JSON
    settings: S.optional(S.Unknown),  // JSON
    subscriptionTier: S.optional(S.String),
    subscriptionStatus: S.optional(S.String),
    // additionalFieldsCommon (audit columns, returned by Better Auth)
    _rowId: S.optional(S.Number),
    version: S.optional(S.Number),
    source: S.optional(S.String),
    createdBy: S.optional(S.NullOr(S.String)),
    updatedBy: S.optional(S.NullOr(S.String)),
    updatedAt: S.optional(S.DateFromSelf),
    deletedAt: S.optional(S.DateFromSelf),
    deletedBy: S.optional(S.NullOr(S.String)),
  },
  S.Record({ key: S.String, value: S.Unknown })
);
```

### Field Mismatch Analysis

#### Member.Model vs Better Auth Member

| Field | In Better Auth | In Domain Model | Resolution |
|-------|---------------|-----------------|------------|
| `id` | ✅ | ✅ | Direct map (validate branded ID format) |
| `userId` | ✅ | ✅ | Direct map (validate branded ID format) |
| `organizationId` | ✅ | ✅ | Direct map (validate branded ID format) |
| `role` | ✅ | ✅ | Direct map (string → MemberRole) |
| `createdAt` | ✅ | ✅ | Direct map (Date → DateTime) |
| `status` | ✅ (additionalField) | ✅ | Direct map |
| `invitedBy` | ✅ (additionalField) | ✅ | Direct map (optional, UserId) |
| `invitedAt` | ✅ (additionalField) | ✅ | Direct map (Date → DateTime, optional) |
| `joinedAt` | ✅ (additionalField) | ✅ | Direct map (Date → DateTime, optional) |
| `lastActiveAt` | ✅ (additionalField) | ✅ | Direct map (Date → DateTime, optional) |
| `permissions` | ✅ (additionalField) | ✅ | Direct map (optional, JSON string) |
| `_rowId` | ✅ (additionalFieldsCommon) | ✅ | Direct map (optional) |
| `version` | ✅ (additionalFieldsCommon) | ✅ | Direct map (optional) |
| `source` | ✅ (additionalFieldsCommon) | ✅ | Direct map (optional) |
| `createdBy` | ✅ (additionalFieldsCommon) | ✅ | Direct map (optional) |
| `updatedBy` | ✅ (additionalFieldsCommon) | ✅ | Direct map (optional) |
| `updatedAt` | ✅ (additionalFieldsCommon) | ✅ | Direct map (Date → DateTime, optional) |

#### Organization.Model vs Better Auth Organization

| Field | In Better Auth | In Domain Model | Resolution |
|-------|---------------|-----------------|------------|
| `id` | ✅ | ✅ | Direct map (validate branded ID format) |
| `name` | ✅ | ✅ | Direct map |
| `slug` | ✅ | ✅ | Direct map |
| `logo` | ✅ | ✅ | Direct map (nullable) |
| `metadata` | ✅ | ✅ | Direct map (serialize to string if needed) |
| `createdAt` | ✅ | ✅ | Direct map (Date → DateTime) |
| `type` | ✅ (additionalField) | ✅ | Direct map |
| `ownerUserId` | ✅ (additionalField) | ✅ | Direct map (optional) |
| `isPersonal` | ✅ (additionalField) | ✅ | Direct map |
| `maxMembers` | ✅ (additionalField) | ✅ | Direct map (optional) |
| `features` | ✅ (additionalField) | ✅ | Direct map (optional, JSON) |
| `settings` | ✅ (additionalField) | ✅ | Direct map (optional, JSON) |
| `subscriptionTier` | ✅ (additionalField) | ✅ | Direct map |
| `subscriptionStatus` | ✅ (additionalField) | ✅ | Direct map |
| `_rowId`, `version`, `source` | ✅ (additionalFieldsCommon) | ✅ | Direct map (optional) |
| `createdBy`, `updatedBy` | ✅ (additionalFieldsCommon) | ✅ | Direct map (optional) |
| `updatedAt` | ✅ (additionalFieldsCommon) | ✅ | Direct map (Date → DateTime, optional) |

**Note**: All fields are aligned thanks to `additionalFields` + `additionalFieldsCommon` configuration. No domain package changes needed.

#### Invitation.Model vs Better Auth Invitation

| Field | In Better Auth | In Domain Model | Resolution |
|-------|---------------|-----------------|------------|
| `id` | ✅ | ✅ | Direct map (validate branded ID format) |
| `email` | ✅ | ✅ | Direct map |
| `role` | ✅ | ✅ | Direct map |
| `teamId` | ✅ (additionalField) | ✅ | Direct map (optional) |
| `status` | ✅ | ✅ | Direct map (string → InvitationStatus) |
| `expiresAt` | ✅ | ✅ | Direct map (Date → DateTime) |
| `inviterId` | ✅ | ✅ | Direct map (validate branded ID format) |
| `organizationId` | ✅ | ✅ | Direct map (validate branded ID format) |
| `createdAt` | ✅ | ✅ | Direct map (Date → DateTime) |
| `_rowId`, `version`, `source` | ✅ (additionalFieldsCommon) | ✅ | Direct map (optional) |
| `createdBy`, `updatedBy` | ✅ (additionalFieldsCommon) | ✅ | Direct map (optional) |
| `updatedAt` | ✅ (additionalFieldsCommon) | ✅ | Direct map (Date → DateTime, optional) |

All fields are aligned — both business fields and audit columns are returned by Better Auth.

---

## Current State Analysis

### Existing Pattern (Correct)

The `_internal` folder already has transformation schemas for User and Session:

```typescript
// packages/iam/client/src/_internal/user.schemas.ts
export const DomainUserFromBetterAuthUser = S.transformOrFail(
  BetterAuthUserSchema,
  User.Model,
  { decode: ..., encode: ... }
);

// packages/iam/client/src/_internal/session.schemas.ts
export const DomainSessionFromBetterAuthSession = S.transformOrFail(
  BetterAuthSessionSchema,
  Session.Model,
  { decode: ..., encode: ... }
);
```

These are used correctly in:
- `src/sign-in/email/contract.ts` — uses `Common.DomainUserFromBetterAuthUser`
- `src/core/get-session/contract.ts` — uses both transformation schemas

### Problem Areas (Need Alignment)

Contracts with inline schemas that should use domain entities:

| Contract | Current Schema | Target Domain Entity |
|----------|---------------|---------------------|
| `multi-session/list-sessions/contract.ts` | Inline `Session` class | `Session.Model` via `DomainSessionFromBetterAuthSession` |
| `organization/_common/member.schema.ts` | Inline `Member`, `FullMember` | `Member.Model` from `@beep/iam-domain/entities` |
| `organization/_common/invitation.schema.ts` | Inline `Invitation` | `Invitation.Model` from `@beep/iam-domain/entities` |
| `organization/_common/organization.schema.ts` | Inline `Organization`, `EmbeddedUser` | `Organization.Model` from `@beep/shared-domain/entities` |

### Contracts Requiring No Change

These contracts have primitive success schemas with no domain entity equivalent:

- `core/sign-out` — returns `{ status: boolean }`
- `password/change` — returns `{ status: boolean }`
- `password/request-reset` — returns `{ status: boolean }`
- `password/reset` — returns `{ status: boolean }`
- `email-verification/send-verification` — returns `{ status: boolean }`
- `two-factor/enable` — returns `{ totpURI, backupCodes }`
- `two-factor/disable` — returns `{ status: boolean }`
- `two-factor/totp/get-uri` — returns `{ totpURI, backupCodes }`
- `two-factor/totp/verify` — returns `{ status: boolean }`
- `two-factor/otp/send` — returns `{ status: boolean }`
- `two-factor/otp/verify` — returns `{ status: boolean }`
- `two-factor/backup/generate` — returns `{ backupCodes }`
- `two-factor/backup/verify` — returns `{ status: boolean }`

---

## Implementation Strategy

### Transformation Schema Pattern

All entity transformations MUST use `S.transformOrFail` to map Better Auth responses to domain models. There is no viable "direct domain model usage" option because Better Auth responses never match domain model encoded forms exactly.

**CRITICAL**: Better Auth response schemas MUST use the `S.Struct` with `S.Record` extension pattern to capture unknown properties from plugins:

```typescript
S.Struct(
  { /* known fields */ },
  S.Record({ key: S.String, value: S.Unknown })
)
```

This pattern (demonstrated in `session.schemas.ts` lines 20-38) allows:
- Strongly typed access to known fields
- Passthrough of unknown plugin fields for transformation
- Clean extraction of additionalFields via `require*` helpers

**Important**: Unknown fields captured by `S.Record` are **preserved in the schema-validated object** but are **not automatically passed through to the domain model**. The transformation's `decode` function must explicitly extract and map any unknown fields if needed for the domain model. In practice, we enumerate all expected `additionalFields` in the schema, so `S.Record` serves as a safety net for any unexpected plugin extensions.

Follow the established pattern from `session.schemas.ts`:

```typescript
import { $IamClientId } from "@beep/identity/packages";
import { Member, MemberRole } from "@beep/iam-domain/entities";
import { IamEntityIds } from "@beep/shared-domain";
import * as Effect from "effect/Effect";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import { requireString, toDate } from "./transformation-helpers.ts";

const $I = $IamClientId.create("_internal/member.schemas");

// 1. Capture Better Auth response shape using S.Struct + S.Record pattern
//    The S.Record extension allows unknown plugin fields to pass through
export const BetterAuthMemberSchema = S.Struct(
  {
    id: S.String,
    organizationId: S.String,
    userId: S.String,
    role: S.String,
    createdAt: S.DateFromSelf,
    // additionalFields (member-specific, configured in Options.ts)
    status: S.String,
    invitedBy: S.optional(S.String),
    invitedAt: S.optional(S.DateFromSelf),
    joinedAt: S.optional(S.DateFromSelf),
    lastActiveAt: S.optional(S.DateFromSelf),
    permissions: S.optional(S.String),
    // additionalFieldsCommon (audit columns, all entities)
    _rowId: S.optional(S.Number),
    version: S.optional(S.Number),
    source: S.optional(S.String),
    createdBy: S.optional(S.NullOr(S.String)),
    updatedBy: S.optional(S.NullOr(S.String)),
    updatedAt: S.optional(S.DateFromSelf),
    deletedAt: S.optional(S.DateFromSelf),
    deletedBy: S.optional(S.NullOr(S.String)),
  },
  S.Record({ key: S.String, value: S.Unknown })
).annotations($I.annotations("BetterAuthMember", {
  description: "The member object returned from Better Auth with plugin extensions."
}));

export type BetterAuthMember = S.Schema.Type<typeof BetterAuthMemberSchema>;

// 2. Type alias for encoded form
type MemberModelEncoded = S.Schema.Encoded<typeof Member.Model>;

// 3. Transformation schema — all fields map directly (including audit columns from additionalFieldsCommon)
export const DomainMemberFromBetterAuthMember = S.transformOrFail(
  BetterAuthMemberSchema,
  Member.Model,
  {
    strict: true,
    decode: Effect.fn(function* (ba, _options, ast) {
      // Validate branded ID format using type guards (NOT string prefix checking)
      // The canonical pattern uses EntityId.is() method from @beep/shared-domain
      const isValidMemberId = IamEntityIds.MemberId.is(ba.id);
      if (!isValidMemberId) {
        return yield* ParseResult.fail(
          new ParseResult.Type(
            ast,
            ba,
            `Invalid member ID format: expected "iam_member__<uuid>", got "${ba.id}"`
          )
        );
      }

      const encoded: MemberModelEncoded = {
        // Direct mappings from core fields
        id,
        userId: yield* requireString(ba, "userId", ast),
        organizationId: yield* requireString(ba, "organizationId", ast),
        role: yield* S.decode(MemberRole)(ba.role),  // Validate against branded type
        createdAt: toDate(ba.createdAt),

        // Direct mappings from additionalFields (member-specific)
        status: ba.status,
        invitedBy: ba.invitedBy,
        invitedAt: ba.invitedAt ? toDate(ba.invitedAt) : undefined,
        joinedAt: ba.joinedAt ? toDate(ba.joinedAt) : undefined,
        lastActiveAt: ba.lastActiveAt ? toDate(ba.lastActiveAt) : undefined,
        permissions: ba.permissions,

        // Direct mappings from additionalFieldsCommon (audit columns)
        _rowId: ba._rowId,
        version: ba.version,
        source: ba.source,
        createdBy: ba.createdBy,
        updatedBy: ba.updatedBy,
        updatedAt: ba.updatedAt ? toDate(ba.updatedAt) : toDate(ba.createdAt),
      };

      return encoded;
    }),
    encode: Effect.fn(function* (member, _options, _ast) {
      const ba: BetterAuthMember = {
        id: member.id,
        organizationId: member.organizationId,
        userId: member.userId,
        role: member.role,
        createdAt: new Date(member.createdAt),
        // Include audit columns for round-trip encoding
        _rowId: member._rowId,
        version: member.version,
        source: member.source,
        createdBy: member.createdBy,
        updatedBy: member.updatedBy,
        updatedAt: new Date(member.updatedAt),
      };
      return ba;
    }),
  }
).annotations($I.annotations("DomainMemberFromBetterAuthMember", {
  description: "Transforms Better Auth member response to domain Member.Model"
}));
```

### Embedded Entity Handling

For `FullMember` with embedded user data, create a client-specific embedded user schema:

```typescript
// Client-specific embedded user (not the full domain User.Model)
export const BetterAuthEmbeddedUserSchema = S.Struct({
  id: S.String,
  name: S.String,
  email: S.String,
  image: S.NullOr(S.String),
});

export type BetterAuthEmbeddedUser = S.Schema.Type<typeof BetterAuthEmbeddedUserSchema>;

// FullMember uses S.Record extension for plugin fields
export const BetterAuthFullMemberSchema = S.Struct(
  {
    ...BetterAuthMemberSchema.fields,
    user: BetterAuthEmbeddedUserSchema,
  },
  S.Record({ key: S.String, value: S.Unknown })
);

// The Success schema for list-members includes both transformed member and raw embedded user
export class FullMemberSuccess extends S.Class<FullMemberSuccess>($I`FullMemberSuccess`)({
  member: DomainMemberFromBetterAuthMember,
  user: BetterAuthEmbeddedUserSchema,  // Keep as client schema, not full User.Model
}) {}
```

**Rationale**: Embedded users from Better Auth only have 4 fields. Attempting to transform them to `User.Model` (25+ fields) would require inventing data or making too many fields optional. The embedded user is for display purposes only.

### Critical Field Transformations

When implementing transformation schemas, pay special attention to these fields. Each transformation requires **both decode AND encode directions** for round-trip correctness.

#### 1. `permissions` — JSON string ↔ PolicyRecord

**Required Import**:
```typescript
import { PolicyRecord } from "@beep/shared-domain/Policy";
```

```typescript
// DECODE: Better Auth JSON string → domain PolicyRecord
decode: Effect.fn(function* (ba, _options, ast) {
  const encoded: MemberModelEncoded = {
    // ...
    permissions: ba.permissions
      ? yield* S.decode(BS.JsonFromStringOption(PolicyRecord))(ba.permissions)
      : undefined,
  };
  return encoded;
}),

// ENCODE: Domain PolicyRecord → Better Auth JSON string
encode: Effect.fn(function* (member, _options, _ast) {
  const ba: BetterAuthMember = {
    // ...
    permissions: member.permissions
      ? yield* S.encode(BS.JsonFromStringOption(PolicyRecord))(member.permissions)
      : undefined,
  };
  return ba;
}),
```

#### 2. `role` — MUST decode to branded type

**Type Mismatch Alert**: `BetterAuthMemberSchema` uses `S.String` for the `role` field, but `Member.Model` expects `MemberRole` (a branded union type with runtime constraints).

```typescript
// CORRECT — Decode to validate against branded type
role: yield* S.decode(MemberRole)(ba.role),

// WRONG — Direct assignment (type mismatch: string vs MemberRole)
// role: ba.role,  // TypeScript will catch this, but be explicit about why
```

**Why decode is required**: Even though the Better Auth schema accepts the value, the domain model has stricter type constraints. The `MemberRole` branded type ensures only valid role values (`"owner"`, `"admin"`, `"member"`) are accepted. Without explicit decode, invalid role strings would cause runtime errors when the domain model is used.

#### 3. `status` — Preserve Better Auth value (required field)

**Important Default Mismatch**:
- Better Auth default: `"active"` (configured in Options.ts:665)
- Domain model default: `"inactive"` (Member.Model.ts:20)

```typescript
// CORRECT — Use Better Auth value directly (required field, always present)
status: ba.status,

// WRONG — Defensive fallback (unnecessary and misleading)
// status: ba.status ?? "active",  // Don't add fallbacks for required fields
```

**Why no fallback?** Better Auth's `additionalFields` configuration makes `status` a REQUIRED field with default `"active"`. If `status` is missing, it indicates a configuration error that should fail loudly, not silently use a fallback. The schema validation will catch this case.

**Key principle**: The domain model's default ("inactive") is for *new* members created directly via domain code, not for transforming existing Better Auth data. When transforming, always trust the source value.

#### 4. Embedded `user` extraction (FullMember only)

Better Auth returns `user` **nested inside** the member object. The `BetterAuthFullMemberSchema` already validates the embedded `user` via `BetterAuthEmbeddedUserSchema`. The transformation simply **extracts** the pre-validated user object without additional processing.

```typescript
// Better Auth response shape:
{
  id: "iam_member__<uuid>",
  user: { id: "shared_user__<uuid>", name, email, image },  // <-- embedded INSIDE member
  organizationId: "shared_organization__<uuid>",
  // ... other member fields
}

// Transformation extracts and flattens:
decode: Effect.fn(function* (ba, _options, ast) {
  // 1. Transform member fields (excluding user)
  const member = { /* ... member field mappings ... */ };

  // 2. Extract embedded user as-is (already validated by BetterAuthEmbeddedUserSchema)
  // No transformation needed — it's for display purposes only
  const user = ba.user;

  return { member, user };  // Flattened structure
}),
```

**Important**: The embedded user is NOT transformed to `User.Model` because Better Auth only returns 4 fields (`id`, `name`, `email`, `image`). Attempting to transform to `User.Model` (25+ fields) would require inventing data. Use `BetterAuthEmbeddedUserSchema` directly for display purposes.

---

## Work Items

### Implementation Order

**Suggested order** (for learning curve — no hard dependencies between files):

1. **`member.schemas.ts`** — Reference implementation (use `session.schemas.ts` as pattern)
2. **`invitation.schemas.ts`** — Similar pattern, simpler fields
3. **`organization.schemas.ts`** — More complex with additional JSON fields

**Reference Pattern**: `packages/iam/client/src/_internal/session.schemas.ts` (lines 20-38) demonstrates the canonical `S.Struct + S.Record` extension pattern.

### M.Sensitive Field Handling

The `Invitation.Model` uses `M.Sensitive` for the `email` field:

```typescript
// From Invitation.model.ts
email: M.Sensitive(BS.EmailBase.annotations({ ... }))
```

**Handling in transformations**:
- `M.Sensitive` suppresses the field value in logs and error messages
- For decode: Assign directly — `email: ba.email` (the domain schema wraps it)
- For encode: The encoded form will have the raw string (unwrapped for wire format)
- **No special transformation logic needed** — `M.Sensitive` is a type wrapper that affects logging/redaction, not the actual data transformation

### Phase 1A: Create Transformation Schemas

Create in `packages/iam/client/src/_internal/`:

1. **`member.schemas.ts`**
   - `BetterAuthMemberSchema` — captures Better Auth member response shape (includes additionalFields)
   - `BetterAuthEmbeddedUserSchema` — minimal embedded user for FullMember
   - `BetterAuthFullMemberSchema` — member with embedded user
   - `DomainMemberFromBetterAuthMember` — transforms to `Member.Model`
   - `FullMemberSuccess` — class combining transformed member + embedded user

2. **`invitation.schemas.ts`**
   - `BetterAuthInvitationSchema` — captures Better Auth invitation response shape
   - `DomainInvitationFromBetterAuthInvitation` — transforms to `Invitation.Model`

3. **`organization.schemas.ts`**
   - `BetterAuthOrganizationSchema` — captures Better Auth organization response shape (includes additionalFields)
   - `DomainOrganizationFromBetterAuthOrganization` — transforms to `Organization.Model`

### Phase 1B: Update Contracts

Update contracts to use transformation schemas:

1. **`multi-session/list-sessions/contract.ts`**
   - Replace inline `Session` class with `S.Array(Common.DomainSessionFromBetterAuthSession)`

2. **`organization/members/list/contract.ts`**
   - Replace `FullMember` import with `Common.FullMemberSuccess`

3. **`organization/invitations/list/contract.ts`**
   - Replace `Invitation` import with `S.Array(Common.DomainInvitationFromBetterAuthInvitation)`

4. **`organization/crud/*.ts`**
   - Replace `Organization` usage with `Common.DomainOrganizationFromBetterAuthOrganization`

### Phase 1C: Deprecate Inline Schemas

**IMPORTANT**: Only delete these files AFTER Phase 1A and 1B are complete and verified.

Files to delete (in order):
1. `src/organization/_common/member.schema.ts`
2. `src/organization/_common/invitation.schema.ts`
3. `src/organization/_common/organization.schema.ts`
4. `src/organization/_common/full-organization.schema.ts`
5. Inline `Session` class in `multi-session/list-sessions/contract.ts`

**Verification before deletion**:
```bash
# Ensure no remaining imports of deprecated schemas
bun run check --filter @beep/iam-client
grep -r "from.*_common/member.schema" packages/iam/client/src/
grep -r "from.*_common/invitation.schema" packages/iam/client/src/
grep -r "from.*_common/organization.schema" packages/iam/client/src/
```

---

## Runtime Verification Checklist

After implementing each transformation schema, verify with actual Better Auth responses:

### Browser DevTools Verification

1. Open browser devtools Network tab
2. Trigger the relevant Better Auth operation
3. Capture the actual JSON response
4. Verify schema fields match response shape

### Unit Test Verification

Each transformation schema MUST have tests covering:

```typescript
describe("DomainMemberFromBetterAuthMember", () => {
  it("decodes valid Better Auth member response", () => {
    const baResponse = {
      id: "iam_member__abc12345-1234-1234-1234-123456789012",
      organizationId: "shared_organization__def45678-1234-1234-1234-123456789012",
      userId: "shared_user__ghi78901-1234-1234-1234-123456789012",
      role: "admin",
      status: "active",  // Better Auth default
      createdAt: new Date("2024-01-15T10:00:00Z"),
    };

    const result = S.decodeUnknownSync(DomainMemberFromBetterAuthMember)(baResponse);

    expect(result.id).toBe("iam_member__abc12345-1234-1234-1234-123456789012");
    expect(result.status).toBe("active");  // Preserves Better Auth value
  });

  it("fails on invalid ID format", () => {
    const baResponse = {
      id: "invalid-uuid",  // Not iam_member__<uuid> format
      organizationId: "shared_organization__def45678-1234-1234-1234-123456789012",
      userId: "shared_user__ghi78901-1234-1234-1234-123456789012",
      role: "admin",
      status: "active",
      createdAt: new Date("2024-01-15T10:00:00Z"),
    };

    // Uses IamEntityIds.MemberId.is() branded type guard internally
    expect(() => S.decodeUnknownSync(DomainMemberFromBetterAuthMember)(baResponse))
      .toThrow(/Invalid member ID format/);
  });

  it("encodes back to Better Auth format", () => {
    const member = { /* Member.Model instance */ };
    const result = S.encodeSync(DomainMemberFromBetterAuthMember)(member);

    expect(result.createdAt).toBeInstanceOf(Date);
  });
});
```

### Integration Test Verification

Test the full flow through handlers:

```typescript
describe("organization/members/list handler", () => {
  it("returns domain Member models", async () => {
    // Setup: Create test organization with members

    const result = await Effect.runPromise(
      ListMembersHandler({ organizationId: testOrgId })
    );

    // Verify: Response uses domain Member.Model type
    expect(result.members[0]).toHaveProperty("status");
    expect(result.members[0]).toHaveProperty("_rowId");
  });
});
```

---

## Test Coverage Requirements

### Required Test Files

| Transformation Schema | Test File |
|----------------------|-----------|
| `DomainMemberFromBetterAuthMember` | `test/_internal/member.schemas.test.ts` |
| `DomainInvitationFromBetterAuthInvitation` | `test/_internal/invitation.schemas.test.ts` |
| `DomainOrganizationFromBetterAuthOrganization` | `test/_internal/organization.schemas.test.ts` |

### Test Case Categories

Each test file MUST include:

1. **Happy Path**: Valid Better Auth response → valid domain model
2. **Default Application**: Missing optional fields → defaults applied correctly
3. **ID Validation**: Invalid branded ID format → descriptive error (uses `EntityId.is()` guard)
4. **Date Handling**: Date objects → DateTime.Utc conversion (preserves timezone)
5. **Encode Round-Trip**: Domain model → Better Auth format → domain model (verify equality)
6. **Extra Fields**: Unknown fields via `S.Record` extension → passed through for transformation
7. **Plugin Fields**: additionalFields from `Options.ts` → correctly extracted and mapped
8. **Configuration Errors**: Missing or malformed additionalFields → descriptive error
9. **Partial Responses**: Better Auth omits optional fields → handled gracefully
10. **Malformed JSON**: Invalid JSON in `permissions` field → ParseError with field context
11. **Invalid Enum Values**: Unexpected role/status strings → ParseError listing valid options
12. **Null vs Undefined**: Better Auth nullable fields (`string | null`) → domain optional (`string | undefined`)
13. **Timezone Handling**: Better Auth `Date` (local) → domain `DateTime.Utc` (preserves instant)

**Configuration Error Example**:

```typescript
it("fails gracefully when additionalFields are missing", () => {
  const baResponse = {
    id: "iam_member__abc12345-1234-1234-1234-123456789012",
    organizationId: "shared_organization__def45678-1234-1234-1234-123456789012",
    userId: "shared_user__ghi78901-1234-1234-1234-123456789012",
    role: "admin",
    createdAt: new Date("2024-01-15T10:00:00Z"),
    // Missing: status, _rowId, version, etc. (additionalFields not configured)
  };

  // Should fail with descriptive error about missing required field
  expect(() => S.decodeUnknownSync(DomainMemberFromBetterAuthMember)(baResponse))
    .toThrow(/status/);  // Required additionalField
});
```

### Coverage Threshold

- Minimum 90% line coverage for transformation schemas
- 100% branch coverage for validation logic

---

## Files to Create/Modify

### New Files
- `src/_internal/member.schemas.ts`
- `src/_internal/invitation.schemas.ts`
- `src/_internal/organization.schemas.ts`
- `test/_internal/member.schemas.test.ts`
- `test/_internal/invitation.schemas.test.ts`
- `test/_internal/organization.schemas.test.ts`

### Files to Modify
- `src/_internal/index.ts` — export new schemas
- `src/multi-session/list-sessions/contract.ts` — use domain session
- `src/organization/members/list/contract.ts` — use domain member
- `src/organization/invitations/list/contract.ts` — use domain invitation
- `src/organization/crud/create/contract.ts` — use domain organization
- `src/organization/crud/list/contract.ts` — use domain organization
- `src/organization/crud/update/contract.ts` — use domain organization
- `src/organization/crud/get-full/contract.ts` — use domain organization
- `src/organization/crud/set-active/contract.ts` — use domain organization

### Files to Delete
- `src/organization/_common/member.schema.ts`
- `src/organization/_common/invitation.schema.ts`
- `src/organization/_common/organization.schema.ts`
- `src/organization/_common/full-organization.schema.ts`

---

## Verification Commands

```bash
# After each work item (Phase 1A-1C)
bun run check --filter @beep/iam-client
bun run lint --filter @beep/iam-client
bun run test --filter @beep/iam-client

# Final verification
bun run check
bun run test
```

**Turborepo Cascading Note**: The `--filter @beep/iam-client` flag checks the package AND all its dependencies due to Turborepo's cascading behavior. If errors appear from unrelated packages, isolate the source:

```bash
# Isolate to just @beep/iam-client (no dependency cascade)
bun tsc --noEmit packages/iam/client/tsconfig.json

# Check if error is in an upstream dependency
bun run check --filter @beep/iam-domain
bun run check --filter @beep/shared-domain
```

---

## Success Criteria

1. ✅ All entity-returning contracts use domain models via transformation schemas
2. ✅ No inline schema duplication of domain entities
3. ✅ BetterAuth schemas use `S.Struct({...}, S.Record({ key: S.String, value: S.Unknown }))` pattern
4. ✅ Transformation schemas have comprehensive test coverage (≥90% lines)
5. ✅ Type checks pass: `bun run check --filter @beep/iam-client`
6. ✅ Lint passes: `bun run lint --filter @beep/iam-client`
7. ✅ Tests pass: `bun run test --filter @beep/iam-client`
8. ✅ `_internal/index.ts` exports all transformation schemas
9. ✅ Deprecated inline schema files are deleted
10. ✅ CLAUDE.md updated to document transformation pattern

---

## Related Documentation

- `/home/elpresidank/YeeBois/projects/beep-effect/packages/iam/domain/CLAUDE.md` — IAM domain entity guide
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/shared/domain/CLAUDE.md` — Shared domain entity guide
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/iam/client/CLAUDE.md` — IAM client patterns

---

## Appendix: Current Inline Schemas (for reference)

These are the inline schemas that will be replaced:

### multi-session/list-sessions/contract.ts - Session
```typescript
export class Session extends S.Class<Session>($I`Session`)({
  id: S.String,
  userId: S.String,
  token: S.String,
  expiresAt: S.Date,
  ipAddress: S.optionalWith(S.String, { nullable: true }),
  userAgent: S.optionalWith(S.String, { nullable: true }),
  createdAt: S.Date,
  updatedAt: S.Date,
}) {}
```

### organization/_common/member.schema.ts - Member
```typescript
export class Member extends S.Class<Member>($I`Member`)({
  id: S.String,
  organizationId: S.String,
  userId: S.String,
  role: S.String,
  createdAt: S.DateFromString,
}) {}

export class FullMember extends S.Class<FullMember>($I`FullMember`)({
  id: S.String,
  organizationId: S.String,
  userId: S.String,
  role: S.String,
  createdAt: S.DateFromString,
  user: EmbeddedUser,
}) {}
```

### organization/_common/invitation.schema.ts - Invitation
```typescript
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

### organization/_common/organization.schema.ts - Organization
```typescript
export class Organization extends S.Class<Organization>($I`Organization`)({
  id: S.String,
  name: S.String,
  slug: S.String,
  logo: S.NullOr(S.String),
  metadata: S.optional(S.Unknown),
  createdAt: S.DateFromString,
}) {}

export class EmbeddedUser extends S.Class<EmbeddedUser>($I`EmbeddedUser`)({
  id: S.String,
  name: S.String,
  email: S.String,
  image: S.NullOr(S.String),
}) {}
```
