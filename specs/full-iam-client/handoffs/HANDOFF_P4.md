# Phase 4 Handoff: Two-Factor Authentication

**Date**: 2026-01-15
**From**: Phase 3 (Email Verification)
**To**: Phase 4 (Two-Factor Authentication)
**Status**: Ready for implementation

---

## Phase 3 Summary

Phase 3 successfully implemented 1 email verification handler:

| Handler | Pattern | mutatesSession |
|---------|---------|----------------|
| send-verification | Factory (with-payload) | false |

### Key Learnings Applied

1. **verifyEmail is redirect-based** - GET endpoint handled by server, not client handler
2. **Simple responses exist** - `sendVerificationEmail` returns only `{ status: boolean }`, no `message` field
3. **Continue verifying ALL schemas from source** - Phase 3 confirmed handoff accuracy

---

## Better Auth Source Verification (MANDATORY)

**CRITICAL**: All response schemas in this handoff have been verified against Better Auth source code.

| Method | Route File | Test File | Verified |
|--------|-----------|-----------|----------|
| `getTotpUri` | `tmp/better-auth/.../two-factor/totp/index.ts:128-196` | `tmp/better-auth/.../two-factor/two-factor.test.ts:580-588` | YES |
| `enable` | `tmp/better-auth/.../two-factor/index.ts:91-202` | `tmp/better-auth/.../two-factor/two-factor.test.ts:53-83` | YES |
| `disable` | `tmp/better-auth/.../two-factor/index.ts:218-295` | `tmp/better-auth/.../two-factor/two-factor.test.ts:510-535` | YES |
| `verifyTotp` | `tmp/better-auth/.../two-factor/totp/index.ts:199-295` | `tmp/better-auth/.../two-factor/two-factor.test.ts:115-143` | YES |
| `generateBackupCodes` | `tmp/better-auth/.../two-factor/backup-codes/index.ts:398-489` | `tmp/better-auth/.../two-factor/two-factor.test.ts:265-280` | YES |
| `verifyBackupCode` | `tmp/better-auth/.../two-factor/backup-codes/index.ts:190-382` | `tmp/better-auth/.../two-factor/two-factor.test.ts:282-361` | YES |
| `sendOtp` | `tmp/better-auth/.../two-factor/otp/index.ts:157-217` | `tmp/better-auth/.../two-factor/two-factor.test.ts:176-180` | YES |
| `verifyOtp` | `tmp/better-auth/.../two-factor/otp/index.ts:219-378` | `tmp/better-auth/.../two-factor/two-factor.test.ts:182-199` | YES |

**Verification Process**:
1. Located route implementations in `src/plugins/two-factor/` directory
2. Extracted exact response shapes from `ctx.json()` and `return` statements
3. Cross-referenced with test assertions in `two-factor.test.ts`
4. Documented ALL fields including optional/null fields

**CamelCase Conversion**:
- Endpoint: `/two-factor/get-totp-uri` -> Client: `client.twoFactor.getTotpUri()`
- Endpoint: `/two-factor/enable` -> Client: `client.twoFactor.enable()`
- Endpoint: `/two-factor/disable` -> Client: `client.twoFactor.disable()`
- Endpoint: `/two-factor/verify-totp` -> Client: `client.twoFactor.verifyTotp()`
- Endpoint: `/two-factor/generate-backup-codes` -> Client: `client.twoFactor.generateBackupCodes()`
- Endpoint: `/two-factor/verify-backup-code` -> Client: `client.twoFactor.verifyBackupCode()`
- Endpoint: `/two-factor/send-otp` -> Client: `client.twoFactor.sendOtp()`
- Endpoint: `/two-factor/verify-otp` -> Client: `client.twoFactor.verifyOtp()`

---

## Methods to Implement

### Two-Factor (`client.twoFactor.*`)

| Method | Client Call | Parameters | Returns | Mutates Session | Pattern |
|--------|-------------|------------|---------|-----------------|---------|
| getTotpUri | `client.twoFactor.getTotpUri()` | `{ password: string }` | `{ totpURI: string }` | No | Factory |
| enable | `client.twoFactor.enable()` | `{ password: string, issuer?: string }` | `{ totpURI: string, backupCodes: string[] }` | Conditional* | Factory |
| disable | `client.twoFactor.disable()` | `{ password: string }` | `{ status: boolean }` | Yes | Factory |
| verifyTotp | `client.twoFactor.verifyTotp()` | `{ code: string, trustDevice?: boolean }` | `{ token: string, user: User }` | Yes | Factory |
| generateBackupCodes | `client.twoFactor.generateBackupCodes()` | `{ password: string }` | `{ status: boolean, backupCodes: string[] }` | No | Factory |
| verifyBackupCode | `client.twoFactor.verifyBackupCode()` | `{ code: string, trustDevice?: boolean, disableSession?: boolean }` | `{ token: string, user: User }` | Yes | Factory |
| sendOtp | `client.twoFactor.sendOtp()` | `{ trustDevice?: boolean }` (optional) | `{ status: boolean }` | No | Factory |
| verifyOtp | `client.twoFactor.verifyOtp()` | `{ code: string, trustDevice?: boolean }` | `{ token: string, user: User }` | Yes | Factory |

> **Note on `enable`**: Session mutation depends on server config `skipVerificationOnEnable`. Default behavior does NOT mutate session until `verifyTotp` is called. Set `mutatesSession: false` for safety.

> **Note on `viewBackupCodes`**: This endpoint is SERVER-ONLY (returns 404 from client). Do NOT implement a client handler for it.

### Directory Structure

```
packages/iam/client/src/two-factor/
├── index.ts                                  # Re-exports (create LAST)
├── totp/
│   ├── index.ts
│   ├── get-uri/
│   │   ├── index.ts
│   │   ├── get-uri.contract.ts
│   │   └── get-uri.handler.ts
│   └── verify/
│       ├── index.ts
│       ├── verify.contract.ts
│       └── verify.handler.ts
├── enable/
│   ├── index.ts
│   ├── enable.contract.ts
│   └── enable.handler.ts
├── disable/
│   ├── index.ts
│   ├── disable.contract.ts
│   └── disable.handler.ts
├── backup/
│   ├── index.ts
│   ├── generate/
│   │   ├── index.ts
│   │   ├── generate.contract.ts
│   │   └── generate.handler.ts
│   └── verify/
│       ├── index.ts
│       ├── verify.contract.ts
│       └── verify.handler.ts
└── otp/
    ├── index.ts
    ├── send/
    │   ├── index.ts
    │   ├── send.contract.ts
    │   └── send.handler.ts
    └── verify/
        ├── index.ts
        ├── verify.contract.ts
        └── verify.handler.ts
```

---

## Schema Shapes

### Shared User Schema

Multiple methods return a user object. Create a shared schema:

```typescript
// packages/iam/client/src/two-factor/_common/user.schema.ts
import * as S from "effect/Schema";

export const TwoFactorUser = S.Struct({
  id: S.String,
  email: S.NullOr(S.String),
  emailVerified: S.NullOr(S.Boolean),
  name: S.NullOr(S.String),
  image: S.NullOr(S.String),
  createdAt: S.DateFromString,
  updatedAt: S.DateFromString,
});
```

### totp/get-uri.contract.ts

**Client Method**: `client.twoFactor.getTotpUri()`

**Verified Response Shape** (from `totp/index.ts:193-195`):
```typescript
{
  totpURI: string
}
```

**Contract Implementation**:
```typescript
import { $IamClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $IamClientId.create("two-factor/totp/get-uri");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    password: S.Redacted(S.String),
  },
  $I.annotations("Payload", {
    description: "The payload for getting the TOTP URI.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    totpURI: S.String,
  },
  $I.annotations("Success", {
    description: "The success response containing the TOTP URI for authenticator setup.",
  })
) {}
```

### enable.contract.ts

**Client Method**: `client.twoFactor.enable()`

**Verified Response Shape** (from `index.ts:200`):
```typescript
{
  totpURI: string,
  backupCodes: string[]
}
```

**Contract Implementation**:
```typescript
import { $IamClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $IamClientId.create("two-factor/enable");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    password: S.Redacted(S.String),
    issuer: S.optional(S.String),
  },
  $I.annotations("Payload", {
    description: "The payload for enabling two-factor authentication.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    totpURI: S.String,
    backupCodes: S.Array(S.String),
  },
  $I.annotations("Success", {
    description: "The success response containing TOTP URI and backup codes.",
  })
) {}
```

### disable.contract.ts

**Client Method**: `client.twoFactor.disable()`

**Verified Response Shape** (from `index.ts:293`):
```typescript
{
  status: boolean
}
```

**Contract Implementation**:
```typescript
import { $IamClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $IamClientId.create("two-factor/disable");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    password: S.Redacted(S.String),
  },
  $I.annotations("Payload", {
    description: "The payload for disabling two-factor authentication.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    status: S.Boolean,
  },
  $I.annotations("Success", {
    description: "The success response for disabling two-factor authentication.",
  })
) {}
```

### totp/verify.contract.ts

**Client Method**: `client.twoFactor.verifyTotp()`

**Verified Response Shape** (from `verify-two-factor.ts:103-114`):
```typescript
{
  token: string,
  user: {
    id: string,
    email: string | null,
    emailVerified: boolean | null,
    name: string | null,
    image: string | null,
    createdAt: Date,
    updatedAt: Date
  }
}
```

**Contract Implementation**:
```typescript
import { $IamClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { TwoFactorUser } from "../_common/user.schema.ts";

const $I = $IamClientId.create("two-factor/totp/verify");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    code: S.String,
    trustDevice: S.optional(S.Boolean),
  },
  $I.annotations("Payload", {
    description: "The payload for verifying a TOTP code.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    token: S.String,
    user: TwoFactorUser,
  },
  $I.annotations("Success", {
    description: "The success response containing session token and user data.",
  })
) {}
```

### backup/generate.contract.ts

**Client Method**: `client.twoFactor.generateBackupCodes()`

**Verified Response Shape** (from `backup-codes/index.ts:484-487`):
```typescript
{
  status: boolean,
  backupCodes: string[]
}
```

**Contract Implementation**:
```typescript
import { $IamClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $IamClientId.create("two-factor/backup/generate");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    password: S.Redacted(S.String),
  },
  $I.annotations("Payload", {
    description: "The payload for generating backup codes.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    status: S.Boolean,
    backupCodes: S.Array(S.String),
  },
  $I.annotations("Success", {
    description: "The success response containing newly generated backup codes.",
  })
) {}
```

### backup/verify.contract.ts

**Client Method**: `client.twoFactor.verifyBackupCode()`

**Verified Response Shape** (from `backup-codes/index.ts:369-380` and `verify-two-factor.ts:103-114`):
```typescript
{
  token: string,
  user: {
    id: string,
    email: string | null,
    emailVerified: boolean | null,
    name: string | null,
    image: string | null,
    createdAt: Date,
    updatedAt: Date
  }
}
```

> **Note**: When `disableSession: true`, response omits `session` object but structure is similar.

**Contract Implementation**:
```typescript
import { $IamClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { TwoFactorUser } from "../_common/user.schema.ts";

const $I = $IamClientId.create("two-factor/backup/verify");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    code: S.String,
    trustDevice: S.optional(S.Boolean),
    disableSession: S.optional(S.Boolean),
  },
  $I.annotations("Payload", {
    description: "The payload for verifying a backup code.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    token: S.optional(S.String),
    user: TwoFactorUser,
  },
  $I.annotations("Success", {
    description: "The success response after backup code verification.",
  })
) {}
```

### otp/send.contract.ts

**Client Method**: `client.twoFactor.sendOtp()`

**Verified Response Shape** (from `otp/index.ts:215`):
```typescript
{
  status: boolean
}
```

**Contract Implementation**:
```typescript
import { $IamClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $IamClientId.create("two-factor/otp/send");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    trustDevice: S.optional(S.Boolean),
  },
  $I.annotations("Payload", {
    description: "The payload for sending an OTP code.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    status: S.Boolean,
  },
  $I.annotations("Success", {
    description: "The success response for sending an OTP.",
  })
) {}
```

### otp/verify.contract.ts

**Client Method**: `client.twoFactor.verifyOtp()`

**Verified Response Shape** (from `otp/index.ts:354-365` and `verify-two-factor.ts:103-114`):
```typescript
{
  token: string,
  user: {
    id: string,
    email: string | null,
    emailVerified: boolean | null,
    name: string | null,
    image: string | null,
    createdAt: Date,
    updatedAt: Date
  }
}
```

**Contract Implementation**:
```typescript
import { $IamClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { TwoFactorUser } from "../_common/user.schema.ts";

const $I = $IamClientId.create("two-factor/otp/verify");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    code: S.String,
    trustDevice: S.optional(S.Boolean),
  },
  $I.annotations("Payload", {
    description: "The payload for verifying an OTP code.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    token: S.String,
    user: TwoFactorUser,
  },
  $I.annotations("Success", {
    description: "The success response after OTP verification.",
  })
) {}
```

---

## Pattern Decisions

### All Methods: Factory Pattern

All two-factor methods follow the standard `{ data, error }` response shape and can use the factory pattern.

### Session Signal Notification

| Method | `mutatesSession` Setting | Reason |
|--------|-------------------------|--------|
| getTotpUri | `false` | Read-only, fetches URI for existing 2FA setup |
| enable | `false` | Only initializes 2FA, doesn't complete verification |
| disable | `true` | Disables 2FA and refreshes session |
| verifyTotp | `true` | Completes 2FA setup OR verifies during sign-in |
| generateBackupCodes | `false` | Only generates codes, no session change |
| verifyBackupCode | `true` | Completes 2FA verification, creates session |
| sendOtp | `false` | Only sends OTP email/SMS |
| verifyOtp | `true` | Completes 2FA verification, creates session |

---

## Implementation Order

1. **_common/user.schema.ts** - Shared user schema (used by multiple handlers)
2. **enable** - First step in 2FA setup flow
3. **totp/get-uri** - Get existing URI (requires 2FA enabled)
4. **totp/verify** - Complete TOTP verification
5. **disable** - Disable 2FA
6. **backup/generate** - Generate backup codes
7. **backup/verify** - Verify backup code during sign-in
8. **otp/send** - Send OTP (alternative to TOTP)
9. **otp/verify** - Verify OTP
10. **two-factor/index.ts** - Barrel file (create LAST)

---

## Verification Steps

After implementing each handler:

1. **Type Check**:
   ```bash
   bun run check --filter @beep/iam-client
   ```

2. **Lint**:
   ```bash
   bun run lint:fix --filter @beep/iam-client
   ```

---

## Files to Reference

### Pattern Templates
- `packages/iam/client/src/_common/handler.factory.ts` - Factory implementation
- `packages/iam/client/src/password/request-reset/` - Factory handler with payload
- `packages/iam/client/src/email-verification/send-verification/` - Phase 3 handler

### Better Auth Source (CRITICAL)
- `tmp/better-auth/packages/better-auth/src/plugins/two-factor/index.ts` - enable/disable endpoints
- `tmp/better-auth/packages/better-auth/src/plugins/two-factor/totp/index.ts` - TOTP endpoints
- `tmp/better-auth/packages/better-auth/src/plugins/two-factor/backup-codes/index.ts` - Backup code endpoints
- `tmp/better-auth/packages/better-auth/src/plugins/two-factor/otp/index.ts` - OTP endpoints
- `tmp/better-auth/packages/better-auth/src/plugins/two-factor/verify-two-factor.ts` - Shared verification logic
- `tmp/better-auth/packages/better-auth/src/plugins/two-factor/two-factor.test.ts` - Test cases

---

## Gotchas

### From Previous Phases

1. **Verify ALL response fields** - Phase 2 had incorrect assumed schemas
2. **Test file assertions are authoritative** - Shows exact response shapes
3. **Note null vs undefined** - Better Auth uses `null` for optional user fields

### Phase 4 Specific

1. **viewBackupCodes is server-only** - Do NOT implement as client handler (returns 404 from client)
2. **User fields are nullable** - `email`, `emailVerified`, `name`, `image` can all be `null`
3. **Date fields are ISO strings** - Use `S.DateFromString` not `S.Date`
4. **Password fields should use Redacted** - Apply `S.Redacted(S.String)` for password parameters
5. **`enable` conditional session mutation** - Default behavior does NOT mutate session; only mutates if `skipVerificationOnEnable: true` in server config. Set `mutatesSession: false` for client handler.
6. **trustDevice creates cookie** - The `trustDevice` parameter sets a cookie for 30-day device trust, but doesn't change the response shape

---

## Success Criteria

Phase 4 is complete when:
- [ ] 8 handlers implemented (getTotpUri, enable, disable, verifyTotp, generateBackupCodes, verifyBackupCode, sendOtp, verifyOtp)
- [ ] Shared `TwoFactorUser` schema created and used
- [ ] All handlers use factory pattern
- [ ] Session-mutating handlers have `mutatesSession: true` (disable, verifyTotp, verifyBackupCode, verifyOtp)
- [ ] Non-mutating handlers have `mutatesSession: false` (getTotpUri, enable, generateBackupCodes, sendOtp)
- [ ] `two-factor/index.ts` barrel file exports all handlers
- [ ] Package `index.ts` exports `TwoFactor` module
- [ ] Type check passes: `bun run check --filter @beep/iam-client`
- [ ] Lint passes: `bun run lint --filter @beep/iam-client`
- [ ] REFLECTION_LOG.md updated with Phase 4 learnings
- [ ] HANDOFF_P5.md created for Organization phase (with verified schemas)

---

## Phase 5 Preview: Organization Management

Phase 5 will implement the `client.organization.*` plugin methods:

| Method | Description | Pattern |
|--------|-------------|---------|
| `create` | Create organization | Factory |
| `update` | Update organization | Factory |
| `delete` | Delete organization | Factory |
| `listOrganizations` | List user's organizations | Factory |
| `getFullOrganization` | Get organization details | Factory |
| `setActiveOrganization` | Set active organization | Factory |
| `inviteMember` | Invite member to org | Factory |
| `acceptInvitation` | Accept org invitation | Factory |
| `cancelInvitation` | Cancel pending invitation | Factory |
| `rejectInvitation` | Reject org invitation | Factory |
| `removeMember` | Remove member from org | Factory |
| `updateMemberRole` | Update member's role | Factory |
| `getActiveMember` | Get active member info | Factory |
| `hasPermission` | Check member permission | Factory |

> **IMPORTANT for P5**: Verify ALL response shapes from `tmp/better-auth/packages/better-auth/src/plugins/organization/` BEFORE creating HANDOFF_P5.md.
