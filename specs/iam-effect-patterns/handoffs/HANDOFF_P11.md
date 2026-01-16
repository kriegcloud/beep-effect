# Phase 11 Handoff: Full IAM Client Implementation

**Date**: 2026-01-15
**From**: Phase 10 (E2E Testing)
**To**: New Spec - `full-iam-client`
**Status**: Ready for new spec creation

---

## Mission Statement

Create a new multi-phase specification `full-iam-client` that implements idiomatic Effect wrappers for ALL better-auth client methods. This spec will apply the patterns established in `iam-effect-patterns` to systematically wrap every promise-based client method with Effect-first handlers.

**Target Features:**
- Multi-session management
- Password recovery flow
- Email verification flow
- Two-factor authentication (TOTP, backup codes)
- Organization management
- Team management

---

## Quick Start for New Instance

1. **Create spec structure**:
   ```bash
   cd /home/elpresidank/YeeBois/projects/beep-effect
   mkdir -p specs/full-iam-client/{outputs,templates,handoffs}
   touch specs/full-iam-client/{README.md,REFLECTION_LOG.md,MASTER_ORCHESTRATION.md,AGENT_PROMPTS.md,RUBRICS.md}
   ```

2. **Copy this handoff for reference**:
   ```bash
   cp specs/iam-effect-patterns/handoffs/HANDOFF_P11.md specs/full-iam-client/handoffs/HANDOFF_FROM_IAM_PATTERNS.md
   ```

3. **Start with Phase 0**: Verify Better Auth methods exist before planning (see Phase 0 details below).

---

## Context: What Was Accomplished in `iam-effect-patterns`

### Patterns Established

1. **Handler Factory Pattern** (`_common/handler.factory.ts`)
   - `createHandler()` reduces handler boilerplate by 50-70%
   - Auto-generates Effect.fn span name: `"{domain}/{feature}/handler"`
   - Properly checks `response.error` before decoding
   - Notifies `$sessionSignal` when `mutatesSession: true`
   - Two overloads: with-payload and no-payload

2. **Error Hierarchy** (`_common/errors.ts`)
   - `Data.TaggedError` variants for yieldable errors in generators
   - `BetterAuthResponseError` - API response errors
   - `SessionExpiredError`, `InvalidCredentialsError`, `RateLimitedError`
   - `HandlerFactoryError` union type for handler signatures

3. **Schema Helpers** (`_common/schema.helpers.ts`)
   - `extractBetterAuthErrorMessage()` utility
   - `BetterAuthErrorSchema` for parsing error responses
   - Re-exports `withFormAnnotations` helper

4. **Contract Pattern**
   - Each feature has: `*.contract.ts` (schemas), `*.handler.ts` (Effect logic)
   - Payload schemas use `S.Struct` with field validation
   - Success schemas decode `response.data` shape

### Critical Bugs Fixed

| Issue | Handler | Fix Applied |
|-------|---------|-------------|
| Missing `$sessionSignal` | sign-out | Added notification after success |
| Missing `$sessionSignal` | sign-up-email | Added notification after success |
| No `response.error` check | sign-in-email | Added check before decode |
| No `response.error` check | sign-up-email | Added check before decode |
| No `response.error` check | sign-out | Added check before decode |

### Factory Pattern Limitations

The factory doesn't work for all handlers. Manual handlers are needed when:
1. **Different response shape**: `client.getSession()` returns different structure
2. **Computed fields in payload**: `sign-up/email` has `name` computed from `firstName`+`lastName`
3. **Complex transforms**: When `transformOrFailFrom` loses fields during encoding

### Handler Pattern Reference

**Using Factory (simple cases):**
```typescript
import { client } from "@beep/iam-client/adapters";
import { createHandler } from "../../_common/handler.factory.ts";
import * as Contract from "./feature-name.contract.ts";

export const Handler = createHandler({
  domain: "domain-name",
  feature: "feature-name",
  execute: (encoded) => client.someMethod(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: true, // Set true if changes session state
});
```

**Manual Handler (complex cases):**
```typescript
import { client } from "@beep/iam-client/adapters";
import { extractBetterAuthErrorMessage } from "@beep/iam-client/_common";
import { BetterAuthResponseError, IamError } from "../../_common/errors.ts";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import * as Contract from "./feature-name.contract.ts";

export const Handler = Effect.fn("domain/feature/handler")(function* (params: {
  readonly payload: Contract.Payload;
  readonly fetchOptions?: ClientFetchOption;
}) {
  // 1. Encode payload
  const encoded = yield* S.encode(Contract.Payload)(params.payload);

  // 2. Execute Better Auth call
  const response = yield* Effect.tryPromise({
    try: () => client.someMethod(encoded),
    catch: IamError.fromUnknown,
  });

  // 3. Check Better Auth error (CRITICAL)
  if (response.error !== null) {
    return yield* new BetterAuthResponseError({
      message: extractBetterAuthErrorMessage(response.error),
      code: response.error.code,
      status: response.error.status,
    });
  }

  // 4. Notify session signal if mutation
  client.$store.notify("$sessionSignal");

  // 5. Decode and return success
  return yield* S.decodeUnknown(Contract.Success)(response.data);
});
```

---

## Better Auth Client Method Inventory

The client is configured at `packages/iam/client/src/adapters/better-auth/client.ts`.

### Enabled Plugins

| Plugin | Client Variable | Features |
|--------|-----------------|----------|
| `inferAdditionalFields<Auth.Auth>()` | - | Type inference for custom fields |
| `adminClient()` | `client.admin.*` | Admin user management |
| `anonymousClient()` | `client.signIn.anonymous()` | Anonymous sign-in |
| `jwtClient()` | `client.jwt.*` | JWT token management |
| `apiKeyClient()` | `client.apiKey.*` | API key management |
| `genericOAuthClient()` | `client.signIn.oauth2()` | Generic OAuth2 |
| `multiSessionClient()` | `client.multiSession.*` | Multi-session management |
| `oidcClient()` | `client.oidc.*` | OIDC provider |
| `oneTapClient()` | `client.oneTap.*` | Google One Tap |
| `oneTimeTokenClient()` | `client.oneTimeToken.*` | Magic links |
| `organizationClient()` | `client.organization.*` | Org + team management |
| `passkeyClient()` | `client.passkey.*` | WebAuthn passkeys |
| `phoneNumberClient()` | `client.phoneNumber.*` | Phone auth |
| `siweClient()` | `client.siwe.*` | Sign-In With Ethereum |
| `ssoClient()` | `client.sso.*` | SAML SSO |
| `usernameClient()` | `client.signIn.username()` | Username auth |
| `stripeClient()` | `client.stripe.*` | Subscription billing |
| `deviceAuthorizationClient()` | `client.device.*` | Device OAuth flow |
| `lastLoginMethodClient()` | - | Tracks login method |

### Methods to Wrap (Priority Features)

#### Multi-Session (`client.multiSession.*`)

```typescript
// Core methods from multiSessionClient
client.multiSession.listDeviceSessions() // List all sessions
client.multiSession.setActiveSession({ sessionToken }) // Switch session
client.multiSession.revokeDeviceSession({ sessionToken }) // Revoke specific
client.multiSession.revokeSessions() // Revoke all
```

#### Password Recovery (core auth methods - VERIFY EXISTENCE)

> **WARNING**: These methods are from Better Auth core, NOT plugins. Verify they exist in Phase 0.

```typescript
// Password reset flow (may be client.* or different namespace)
client.forgetPassword({ email, redirectTo }) // Request reset email
client.resetPassword({ newPassword, token }) // Set new password with token
client.changePassword({ currentPassword, newPassword }) // Change when logged in
```

#### Email Verification (core auth methods - VERIFY EXISTENCE)

> **WARNING**: These methods are from Better Auth core, NOT plugins. Verify they exist in Phase 0.

```typescript
// Email verification flow (may be client.* or different namespace)
client.sendVerificationEmail({ email, callbackURL }) // Send verification
client.verifyEmail({ token }) // Verify with token
```

#### Two-Factor (`client.twoFactor.*`)

```typescript
// TOTP setup
client.twoFactor.getTOTPURI() // Get QR code URI
client.twoFactor.enable({ code }) // Enable with TOTP code
client.twoFactor.disable({ code }) // Disable
client.twoFactor.verifyTOTP({ code }) // Verify during sign-in

// Backup codes
client.twoFactor.generateBackupCodes() // Generate new codes
client.twoFactor.verifyBackupCode({ code }) // Use backup code
```

#### Organization (`client.organization.*`)

```typescript
// Organization management
client.organization.create({ name, slug, logo }) // Create org
client.organization.update({ organizationId, data }) // Update org
client.organization.delete({ organizationId }) // Delete org
client.organization.getFullOrganization({ query }) // Get with members
client.organization.listOrganizations() // List user's orgs
client.organization.setActiveOrganization({ organizationId }) // Switch active

// Membership
client.organization.getActiveMember() // Get current member
client.organization.inviteMember({ email, role, organizationId }) // Invite
client.organization.cancelInvitation({ invitationId }) // Cancel invite
client.organization.acceptInvitation({ invitationId }) // Accept invite
client.organization.rejectInvitation({ invitationId }) // Reject invite
client.organization.removeMember({ memberId }) // Remove member
client.organization.updateMemberRole({ memberId, role }) // Change role

// Access control (dynamic)
client.organization.hasPermission({ permission }) // Check permission
```

#### Teams (`client.organization.team.*`)

```typescript
// Team management (organization plugin with teams enabled)
client.organization.createTeam({ name, organizationId }) // Create team
client.organization.updateTeam({ teamId, data }) // Update team
client.organization.deleteTeam({ teamId }) // Delete team
client.organization.listTeams({ organizationId }) // List teams
client.organization.addTeamMember({ teamId, memberId }) // Add member
client.organization.removeTeamMember({ teamId, memberId }) // Remove member
```

---

## Current Package State

### Implemented Handlers (4 total)

| Feature | Location | Pattern | Status |
|---------|----------|---------|--------|
| sign-in/email | `sign-in/email/` | Factory | Complete |
| sign-up/email | `sign-up/email/` | Manual (computed name) | Complete |
| sign-out | `core/sign-out/` | Factory | Complete |
| get-session | `core/get-session/` | Manual (different shape) | Complete |

### Empty Scaffolded Directories

These directories were created during initial package setup as placeholders but contain NO implementation files:
- `organization/` - empty (target for Phase 5)
- `two-factor/` - empty (target for Phase 4)
- `passkey/` - empty (future phase)
- `admin/` - empty (future phase)
- `api-key/` - empty (future phase)
- `sso/` - empty (future phase)
- `oauth2/` - empty (future phase)

**Strategy**: Ignore these during planning. Create new directories as needed per phase structure. Delete empty dirs if they cause confusion.

### Partially Scaffolded

- `sign-in/social/` - has files but needs verification
- `sign-in/anonymous/` - has files but needs verification
- `sign-in/phone-number/` - has files but needs verification
- `sign-in/username/` - has files but needs verification
- `sign-in/oauth2/` - has files but needs verification

---

## Suggested Phase Structure for `full-iam-client`

### Phase 0: Discovery & Audit (CRITICAL)

**Step 1: Verify Better Auth Client Methods Exist**

Before planning, verify all methods listed in this handoff actually exist. The plugin methods are confirmed, but core auth methods (password, verification) need verification.

Create a verification script:
```typescript
// packages/iam/client/src/_dev/method-catalog.ts
import { client } from "@beep/iam-client/adapters";

// Catalog available methods using TypeScript
const catalog = {
  // Plugin methods (confirmed via client.ts)
  multiSession: {
    listDeviceSessions: typeof client.multiSession?.listDeviceSessions,
    setActiveSession: typeof client.multiSession?.setActiveSession,
    revokeDeviceSession: typeof client.multiSession?.revokeDeviceSession,
  },

  // Core auth methods (VERIFY THESE EXIST)
  forgetPassword: typeof client.forgetPassword,
  resetPassword: typeof client.resetPassword,
  changePassword: typeof client.changePassword,
  sendVerificationEmail: typeof client.sendVerificationEmail,
  verifyEmail: typeof client.verifyEmail,

  // Two-factor plugin
  twoFactor: {
    getTOTPURI: typeof client.twoFactor?.getTOTPURI,
    enable: typeof client.twoFactor?.enable,
    disable: typeof client.twoFactor?.disable,
  },

  // Organization plugin (confirmed)
  organization: typeof client.organization,
};

// Run: bun run packages/iam/client/src/_dev/method-catalog.ts
console.log(JSON.stringify(catalog, null, 2));
```

**If methods don't exist**: Check Better Auth docs for correct method names/namespaces.

**Step 2: Standard Discovery Tasks**
- Catalog response shapes for each verified method
- Identify which methods can use factory vs manual pattern
- Create priority matrix based on user-facing importance
- Update method inventory in spec based on findings

### Phase 1: Multi-Session Implementation
**Target**: `packages/iam/client/src/multi-session/`

Methods to implement:
- `list-sessions/` - listDeviceSessions
- `set-active/` - setActiveSession
- `revoke-session/` - revokeDeviceSession
- `revoke-all/` - revokeSessions

**Why first**: Foundation for secure session management, needed before other features.

### Phase 2: Password Recovery Implementation
**Target**: `packages/iam/client/src/password/`

Methods to implement:
- `forgot/` - forgetPassword
- `reset/` - resetPassword
- `change/` - changePassword

**Why second**: Critical user flow, frequently requested feature.

### Phase 3: Email Verification Implementation
**Target**: `packages/iam/client/src/verification/`

Methods to implement:
- `send/` - sendVerificationEmail
- `verify/` - verifyEmail

**Why third**: Required for secure sign-up flow.

### Phase 4: Two-Factor Authentication Implementation
**Target**: `packages/iam/client/src/two-factor/`

Methods to implement:
- `totp/setup/` - getTOTPURI
- `totp/enable/` - enable
- `totp/disable/` - disable
- `totp/verify/` - verifyTOTP
- `backup/generate/` - generateBackupCodes
- `backup/verify/` - verifyBackupCode

**Why fourth**: Security enhancement, complex state machine needed.

### Phase 5: Organization Implementation
**Target**: `packages/iam/client/src/organization/`

Methods to implement:
- `create/`, `update/`, `delete/` - CRUD operations
- `list/`, `get-full/` - Read operations
- `set-active/` - Switch active org
- `membership/` subdirectory for member operations
- `invitations/` subdirectory for invite operations
- `permissions/` subdirectory for access control

**Why fifth**: Large scope, depends on solid foundation.

### Phase 6: Team Implementation
**Target**: `packages/iam/client/src/team/`

Methods to implement:
- `create/`, `update/`, `delete/` - CRUD operations
- `list/` - List teams
- `members/` subdirectory for team membership

**Why sixth**: Extends organization functionality.

### Phase 7: Integration Testing & Documentation
- E2E tests for complete flows
- Update AGENTS.md with new patterns
- Create usage examples for each feature
- Verify all handlers in browser context

---

## Success Criteria for `full-iam-client`

### Quantitative
- [ ] 100% of target Better Auth methods have Effect wrappers
- [ ] All session-mutating handlers call `$sessionSignal`
- [ ] All handlers check `response.error` before decoding
- [ ] Handler boilerplate reduced by 50%+ where factory applies
- [ ] Type coverage 100% (no `any` or `@ts-ignore`)

### Qualitative
- [ ] Consistent naming convention: `"{domain}/{feature}/handler"`
- [ ] All contracts follow established pattern (Payload, Success schemas)
- [ ] Error messages are user-friendly (no raw Better Auth errors)
- [ ] AGENTS.md updated with recipes for each feature
- [ ] Test coverage for each handler

### Verification Commands

After completing all phases, verify success criteria:

```bash
# 1. Handler count (compare against method inventory)
find packages/iam/client/src -name "*.handler.ts" | wc -l

# 2. Session signal coverage (all session-mutating handlers)
grep -r "\$sessionSignal" packages/iam/client/src --include="*.handler.ts" | wc -l

# 3. Error checking coverage (all handlers)
grep -r "response.error !== null" packages/iam/client/src --include="*.handler.ts" | wc -l

# 4. No unsafe types (should be 0, excluding Schema.Any)
grep -r "any\|@ts-ignore" packages/iam/client/src --include="*.ts" | grep -v "Schema.Any" | wc -l

# 5. Type coverage (should compile without errors)
bun run --filter @beep/iam-client check

# 6. Lint check
bun run --filter @beep/iam-client lint
```

---

## Anti-Patterns to Avoid

### From `iam-effect-patterns` Experience

1. **Don't blindly decode `response.data`**
   ```typescript
   // WRONG - may decode null if error present
   return yield* S.decodeUnknown(Success)(response.data);

   // RIGHT - check error first
   if (response.error !== null) {
     return yield* new BetterAuthResponseError({...});
   }
   return yield* S.decodeUnknown(Success)(response.data);
   ```

2. **Don't forget `$sessionSignal` notification**
   ```typescript
   // WRONG - UI won't react to session change
   return yield* S.decodeUnknown(Success)(response.data);

   // RIGHT - notify after success
   client.$store.notify("$sessionSignal");
   return yield* S.decodeUnknown(Success)(response.data);
   ```

3. **Don't over-engineer with factories**
   - If a handler needs special logic (computed fields, different response shape), write manual handler
   - Factory is for simple request/response with standard shape

4. **Don't use native array/string methods**
   ```typescript
   // WRONG
   array.map(x => x.id)

   // RIGHT
   A.map(array, x => x.id)
   ```

5. **Don't use `any` type casts**
   - Use `S.is()` for runtime type guards
   - Use TypeScript overloads for variant handling
   - Accept `unknown` and validate with schemas

---

## Key Files to Reference

### Pattern Templates
- `packages/iam/client/src/_common/handler.factory.ts` - Factory implementation
- `packages/iam/client/src/_common/errors.ts` - Error hierarchy
- `packages/iam/client/src/_common/schema.helpers.ts` - Schema utilities

### Example Handlers
- `packages/iam/client/src/sign-in/email/sign-in-email.handler.ts` - Factory pattern
- `packages/iam/client/src/sign-out/sign-out.handler.ts` - Factory (no payload)
- `packages/iam/client/src/sign-up/email/sign-up-email.handler.ts` - Manual pattern

### Example Contracts
- `packages/iam/client/src/sign-in/email/sign-in-email.contract.ts` - Payload + Success
- `packages/iam/client/src/core/get-session/get-session.contract.ts` - Response schema

### Better Auth Client
- `packages/iam/client/src/adapters/better-auth/client.ts` - All plugin configuration

### Documentation
- `packages/iam/client/AGENTS.md` - Package guide with recipes
- `specs/iam-effect-patterns/outputs/pattern-proposals.md` - Original pattern designs
- `specs/iam-effect-patterns/REFLECTION_LOG.md` - Complete phase history

### AGENTS.md Current State (as of Phase 10)

The AGENTS.md currently documents:
- Handler factory pattern (with/without payload variants)
- Manual handler pattern for edge cases
- Error handling with `BetterAuthResponseError`
- Session signal notification requirements (`$sessionSignal`)
- Import path conventions
- Security considerations (Redacted credentials, token handling)
- Gotchas section (response.error checking, signal timing, etc.)

**Sections to add in `full-iam-client`:**
- Multi-session management recipes
- Password recovery flow examples
- Email verification patterns
- Two-factor setup/verify/backup patterns
- Organization CRUD with permissions
- Team management with membership

---

## External References

- [Better Auth Documentation](https://better-auth.com/docs)
- [Better Auth Client Plugins](https://better-auth.com/docs/plugins)
- [Multi-Session Plugin](https://better-auth.com/docs/plugins/multi-session)
- [Organization Plugin](https://better-auth.com/docs/plugins/organization)
- [Two-Factor Plugin](https://better-auth.com/docs/plugins/two-factor)

---

## Recommended Agent Assignment

| Phase | Agent Type | Rationale |
|-------|------------|-----------|
| 0 | `codebase-researcher` | Audit existing code, catalog methods |
| 1-6 | `effect-code-writer` | Implement handlers following patterns |
| 7 | `doc-writer` | Update documentation |
| 7 | `test-writer` | Create test coverage |
| All | `reflector` | Log learnings after each phase |

---

## Pre-existing Infrastructure Issues

**Test Failure**: `ClientEnv.ts` throws "Invalid environment variables" during test setup
- Cause: Test environment lacks required env vars
- Impact: Some tests can't run without proper test setup
- Workaround: Skip env-dependent tests or mock ClientEnv

**Build Warning**: testkit tsconfig project reference
- Cause: TypeScript project reference configuration issue
- Impact: Build warnings but doesn't block completion
- Workaround: None needed, builds succeed

---

## Breaking Changes

None expected. New handlers are additive. Existing handlers (sign-in/email, sign-up/email, sign-out, get-session) maintain current signatures and continue to work.

---

## Final Notes

The `iam-effect-patterns` spec established foundational patterns through 10 phases of iterative refinement. The patterns are battle-tested with real bug fixes (session signal, error checking) that directly improved user experience.

The `full-iam-client` spec should treat these patterns as canonical and focus on systematic application across all Better Auth methods. Avoid redesigning patterns - apply the established ones consistently.

**Key insight**: The handler factory reduces boilerplate significantly but doesn't replace understanding. Each new handler should be evaluated for factory fit vs manual implementation needs.

Good luck with the implementation!
