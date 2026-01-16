# IAM Client Methods Final - Orchestrator Handoff

> **Purpose**: Orchestrate research and implementation of remaining Better Auth client method handlers in `@beep/iam-client`.

**Date**: 2026-01-15
**Reference Spec**: `specs/full-iam-client/` (MANDATORY reference)
**Target Package**: `packages/iam/client/`

---

## Executive Summary

This spec covers the remaining Better Auth client methods that were not implemented in the `full-iam-client` spec. The previous spec implemented 35+ handlers across multi-session, password, email-verification, two-factor, and organization domains. This spec will complete IAM client coverage by implementing handlers for the remaining plugins and core methods.

### Reference Spec Location

**CRITICAL**: Before implementing ANY handler, the orchestrator MUST reference:
- `specs/full-iam-client/HANDOFF_CREATION_GUIDE.md` - Mandatory verification requirements
- `specs/full-iam-client/REFLECTION_LOG.md` - Phase-by-phase learnings
- `specs/full-iam-client/handoffs/HANDOFF_REFLECTOR_SYNTHESIS.md` - Synthesized patterns
- `packages/iam/client/CLAUDE.md` - Package-specific patterns and gotchas

---

## Current State Audit

### Already Implemented (from `full-iam-client`)

| Domain | Features | Handler Count |
|--------|----------|---------------|
| Core | sign-out, get-session | 2 |
| sign-in | email | 1 |
| sign-up | email | 1 |
| multi-session | list-sessions, set-active, revoke | 3 |
| password | request-reset, reset, change | 3 |
| email-verification | send-verification | 1 |
| two-factor | enable, disable, totp/get-uri, totp/verify, backup/generate, backup/verify, otp/send, otp/verify | 8 |
| organization | crud/*, members/*, invitations/* | 15+ |

**Total implemented**: ~35 handlers

### Remaining Methods to Implement

#### Plugin Domains (NEW)

| Domain | Plugin | Methods | Priority |
|--------|--------|---------|----------|
| **scim** | N/A (server-side) | TBD - Research needed | P4 |
| **admin** | `adminClient()` | user management, ban, impersonate | P2 |
| **sso** | `ssoClient()` | SSO sign-in flow | P2 |
| **api-key** | `apiKeyClient()` | create, list, revoke API keys | P2 |
| **device-authorization** | `deviceAuthorizationClient()` | device code flow | P3 |
| **anonymous** | `anonymousClient()` | anonymous sign-in, delete | P3 |

#### Sign-In Methods

| Method | Client Call | Priority |
|--------|-------------|----------|
| sign-in/username | `client.signIn.username()` | P1 |
| sign-in/passkey | `client.signIn.passkey()` | P2 |
| sign-in/sso | `client.signIn.sso()` | P2 |
| sign-in/phoneNumber | `client.signIn.phoneNumber()` | P3 |
| sign-in/anonymous | `client.signIn.anonymous()` | P3 |

#### Core Methods (Not yet implemented)

| Method | Client Call | Notes | Priority |
|--------|-------------|-------|----------|
| verifyEmail | Redirect-based | May not need handler | P4 |
| changeEmail | `client.changeEmail()` | Verify existence | P2 |
| updateUser | `client.updateUser()` | User profile updates | P2 |
| deleteUser | `client.deleteUser()` | Account deletion | P2 |
| listSessions | `client.listSessions()` | Core session list | P2 |
| revokeSession | `client.revokeSession()` | Single session revoke | P2 |
| revokeSessions | `client.revokeSessions()` | Bulk revoke | P2 |
| revokeOtherSessions | `client.revokeOtherSessions()` | Revoke all but current | P2 |
| linkSocial | `client.linkSocial()` | Link social provider | P3 |
| listAccounts | `client.listAccounts()` | List linked accounts | P3 |
| unlinkAccount | `client.unlinkAccount()` | Unlink social provider | P3 |
| accountInfo | TBD | Verify existence | P4 |

---

## Orchestration Protocol

### Phase Structure

Based on `full-iam-client` learnings, use this phase structure:

```
Phase 0: Discovery & Method Verification
Phase 1: Sign-In Methods (username, passkey, sso, phoneNumber, anonymous)
Phase 2: Core Session Methods (listSessions, revokeSession, revokeSessions, revokeOtherSessions)
Phase 3: Core Account Methods (changeEmail, updateUser, deleteUser)
Phase 4: Account Linking (linkSocial, listAccounts, unlinkAccount)
Phase 5: Admin Plugin
Phase 6: API Key Plugin
Phase 7: SSO Plugin
Phase 8: Device Authorization Plugin
Phase 9: Anonymous Plugin (delete-anonymous-user)
Phase 10: Verification & Documentation
```

### Pre-Implementation Requirements (MANDATORY)

From `HANDOFF_CREATION_GUIDE.md`:

1. **Verify method exists** in Better Auth client
   - Check `tmp/better-auth/packages/better-auth/src/client/`
   - Check plugin client files for each plugin

2. **Document exact method signature**
   ```typescript
   // Example verification format:
   // Method: client.signIn.username()
   // Parameters: { username: string, password: string }
   // Response: { data: { user, session }, error }
   // Source: tmp/better-auth/packages/better-auth/src/plugins/username/client.ts
   ```

3. **Determine pattern**
   - Factory: Standard `{ data, error }` response, no computed fields
   - Manual: Computed fields, different response shape, multi-step flow

4. **Determine `mutatesSession`**
   - `true`: sign-in, sign-out, session operations, authentication changes
   - `false`: read-only queries, profile reads

### Handoff Requirements

Each phase handoff MUST include:

```markdown
## Pre-Implementation Checklist
- [ ] Method verified in Better Auth source
- [ ] Response shape documented with source file reference
- [ ] Pattern selected (Factory/Manual) with justification
- [ ] `mutatesSession` flag determined with justification
- [ ] Contract schemas drafted with correct Effect Schema types

## Implementation Checklist
- [ ] Contract file created with Payload, Success, Error schemas
- [ ] Handler file created using correct pattern
- [ ] Index.ts barrel exports added
- [ ] Parent domain index.ts updated
- [ ] Main package index.ts exports verified
```

---

## Pattern Reference

### Factory Pattern Template

```typescript
import { client } from "@beep/iam-client/adapters";
import { createHandler } from "../../_common/handler.factory.ts";
import * as Contract from "./feature.contract.ts";

export const Handler = createHandler({
  domain: "domain-name",
  feature: "feature-name",
  execute: (encoded) => client.pluginName.methodName(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,  // Omit for no-payload handlers
  mutatesSession: true,             // true for auth-mutating operations
});
```

### Manual Pattern Template

```typescript
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import * as Redacted from "effect/Redacted";
import { client } from "@beep/iam-client/adapters";
import { IamError } from "@beep/iam-client/errors";
import * as Contract from "./feature.contract.ts";

export const Handler = Effect.fn("domain/feature/handler")(function* (
  payload: typeof Contract.Payload.Type
) {
  const encoded = yield* S.encode(Contract.Payload)(payload);

  // Transform if needed (computed fields, etc.)
  const transformed = {
    ...encoded,
    computedField: computeValue(encoded),
  };

  const response = yield* Effect.tryPromise({
    try: () => client.pluginName.methodName(transformed),
    catch: (error) => IamError.match(error, {
      method: "methodName",
      domain: "domain"
    }),
  });

  if (response.error) {
    return yield* Effect.fail(
      IamError.new(response.error, "Operation failed", {
        method: "methodName",
        domain: "domain",
      })
    );
  }

  client.$store.notify("$sessionSignal"); // If mutates session

  return yield* S.decode(Contract.Success)(response.data);
});
```

---

## Schema Type Selection Reference

From `HANDOFF_REFLECTOR_SYNTHESIS.md`:

| Runtime Value | Effect Schema |
|---------------|---------------|
| JavaScript `Date` | `S.Date` |
| ISO 8601 string | `S.DateFromString` |
| `string \| undefined` | `S.optional(S.String)` |
| `string \| null \| undefined` | `S.optionalWith(S.String, { nullable: true })` |
| User credential | `S.Redacted(S.String)` |

**Critical**: Better Auth returns `null` (not `undefined`) for optional fields. Use `S.optionalWith({ nullable: true })`.

---

## Plugin Client Locations

For method verification:

| Plugin | Client Source |
|--------|---------------|
| admin | `better-auth/client/plugins` → `adminClient` |
| anonymous | `better-auth/client/plugins` → `anonymousClient` |
| api-key | `better-auth/client/plugins` → `apiKeyClient` |
| device-authorization | `better-auth/client/plugins` → `deviceAuthorizationClient` |
| sso | `@better-auth/sso/client` → `ssoClient` |
| username | `better-auth/client/plugins` → `usernameClient` |
| passkey | `@better-auth/passkey/client` → `passkeyClient` |
| phone-number | `better-auth/client/plugins` → `phoneNumberClient` |

---

## Known Gotchas (from `full-iam-client`)

### 1. Method Name Discrepancies

Better Auth method names often differ from documentation:
- `forgetPassword` → `requestPasswordReset`
- `setActiveSession` → `setActive`
- `getTOTPURI` → `getTotpUri`

**Action**: Always verify against source code, not documentation.

### 2. CamelCase Path Conversion

Better Auth uses camelCase for client method paths:
- `/multi-session/list-device-sessions` → `client.multiSession.listDeviceSessions()`

### 3. Response Shape Variations

Some plugins use different response shapes:
- Most: `{ data: T, error }`
- Some (passkey): May have different shapes

**Action**: Check route implementation for actual response shape.

### 4. Empty Payload vs No Payload

- Empty object `{}` passed: `client.plugin.method({})`
- No argument: `client.plugin.method()`

Check which pattern each method expects.

---

## Directory Structure Template

```
packages/iam/client/src/
├── [domain]/
│   ├── index.ts                    # Barrel exports
│   ├── [feature]/
│   │   ├── index.ts                # Feature barrel
│   │   ├── [feature].contract.ts   # Schemas
│   │   └── [feature].handler.ts    # Handler implementation
```

---

## Success Criteria

### Per-Phase
- [ ] All methods verified against Better Auth source
- [ ] All handlers type-check (`bun run check --filter @beep/iam-client`)
- [ ] All handlers lint-clean (`bun run lint:fix`)
- [ ] Barrel exports complete
- [ ] Integration with main index.ts

### Spec Completion
- [ ] All listed methods implemented
- [ ] REFLECTION_LOG.md updated after each phase
- [ ] Documentation updated (CLAUDE.md)
- [ ] Final verification pass

---

## Invocation Instructions

To start this spec:

1. **Create spec directory**:
   ```bash
   mkdir -p specs/iam-client-methods-final/handoffs
   mkdir -p specs/iam-client-methods-final/outputs
   ```

2. **Read reference materials**:
   - `specs/full-iam-client/HANDOFF_CREATION_GUIDE.md`
   - `specs/full-iam-client/REFLECTION_LOG.md`
   - `specs/full-iam-client/handoffs/HANDOFF_REFLECTOR_SYNTHESIS.md`
   - `packages/iam/client/CLAUDE.md`

3. **Begin Phase 0 Discovery**:
   - For each method in the "Remaining Methods" list:
     - Verify existence in Better Auth client
     - Document signature and response shape
     - Classify as Factory or Manual pattern
   - Create `outputs/method-inventory-final.md`

4. **Create Phase Handoffs**:
   - Follow `HANDOFF_CREATION_GUIDE.md` format
   - Include all mandatory checklists
   - Reference source files for all schemas

---

## Appendix: Full Method List

### Priority 1 - Core Sign-In Methods
1. `sign-in/username` - Username/password authentication
2. (Already have: sign-in/email, sign-in/social)

### Priority 2 - Core Operations
3. `core/listSessions` - List user's sessions
4. `core/revokeSession` - Revoke specific session
5. `core/revokeSessions` - Revoke all sessions
6. `core/revokeOtherSessions` - Revoke all except current
7. `core/changeEmail` - Change user email
8. `core/updateUser` - Update user profile
9. `core/deleteUser` - Delete user account
10. `sign-in/passkey` - Passkey authentication
11. `sign-in/sso` - SSO authentication
12. `admin/*` - Admin user management
13. `api-key/*` - API key management
14. `sso/*` - SSO configuration

### Priority 3 - Extended Features
15. `sign-in/phoneNumber` - Phone number sign-in
16. `sign-in/anonymous` - Anonymous sign-in
17. `core/linkSocial` - Link social provider
18. `core/listAccounts` - List linked accounts
19. `core/unlinkAccount` - Unlink provider
20. `device-authorization/*` - Device auth flow
21. `anonymous/delete-anonymous-user` - Delete anonymous user

### Priority 4 - Research Required
22. `scim/*` - SCIM provisioning (may be server-only)
23. `core/verifyEmail` - May be redirect-based
24. `core/verifyPassword` - Verify existence
25. `core/accountInfo` - Verify existence

---

## Notes for Orchestrator

1. **Use phased execution** - Don't try to implement everything at once
2. **Verify before implementing** - Method verification prevents wasted effort
3. **Update reflection log** - Capture learnings immediately after each phase
4. **Cross-reference patterns** - Check existing handlers for similar patterns
5. **Test incrementally** - Run type checks after each handler

The `full-iam-client` spec took 6 phases to implement 35 handlers. This spec may require 8-10 phases depending on complexity.
