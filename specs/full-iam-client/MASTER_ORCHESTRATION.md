# Master Orchestration

> Complete phase workflows for the `full-iam-client` specification.

---

## Phase 0: Discovery & Audit

### Objective
Verify Better Auth client methods exist and catalog their response shapes before implementation.

### Better Auth Source Code Reference

**CRITICAL**: Better Auth source code is cloned to `tmp/better-auth/`. This is the **authoritative source** for all method signatures and response shapes.

| What You Need | Where to Find It |
|---------------|------------------|
| Response shapes | `tmp/better-auth/packages/better-auth/src/api/routes/{domain}.ts` |
| Usage examples | `tmp/better-auth/packages/better-auth/src/client/{domain}.test.ts` |
| Method signatures | `tmp/better-auth/packages/better-auth/src/client/index.ts` |
| Plugin methods | `tmp/better-auth/packages/better-auth/src/plugins/{plugin}/client.ts` |

**CamelCase Path Conversion Pattern**: Endpoint paths become camelCase client method names:
- `/request-password-reset` → `client.requestPasswordReset()`
- `/verify-email` → `client.verifyEmail()`
- `/get-session` → `client.getSession()`

### Tasks

#### 0.1: Verify Method Existence (CRITICAL)

The handoff lists core auth methods that need verification:

```typescript
// VERIFY THESE EXIST - check Better Auth client types
client.forgetPassword     // Password reset request
client.resetPassword      // Password reset with token
client.changePassword     // Password change when logged in
client.sendVerificationEmail  // Email verification request
client.verifyEmail        // Email verification with token
```

**Action**: Create verification script or inspect client types directly.

#### 0.2: Catalog Plugin Methods

Plugin methods are confirmed via `packages/iam/client/src/adapters/better-auth/client.ts`:

| Plugin | Namespace | Methods to Catalog |
|--------|-----------|-------------------|
| multiSessionClient | `client.multiSession.*` | listDeviceSessions, setActiveSession, revokeDeviceSession, revokeSessions |
| twoFactorClient | `client.twoFactor.*` | getTOTPURI, enable, disable, verifyTOTP, generateBackupCodes, verifyBackupCode |
| organizationClient | `client.organization.*` | create, update, delete, list, setActive, member operations |

#### 0.3: Document Response Shapes (MANDATORY VERIFICATION)

**CRITICAL**: Do NOT assume response shapes. ALWAYS verify against Better Auth source code.

For each method, consult Better Auth source:

1. **Find the route implementation**:
   ```bash
   # Example for password methods
   cat tmp/better-auth/packages/better-auth/src/api/routes/password.ts
   ```

2. **Extract exact response shape from `ctx.json()` calls**:
   ```typescript
   // Look for patterns like:
   return ctx.json({ status: true, message: "Reset email sent" })
   ```

3. **Verify with test files**:
   ```bash
   # Example for password methods
   cat tmp/better-auth/packages/better-auth/src/client/password.test.ts
   ```
   Test assertions show exact field structures and types.

4. **Document ACTUAL response shapes**:
   - Include ALL fields (don't omit `message`, `token`, nested objects)
   - Note `null` vs `undefined` distinctions
   - Note optional fields with `?` or `| undefined`

**Common Mistake**: Assuming `{ status: boolean }` when actual response is `{ status: boolean, message: string }`.

### Checkpoints

- [ ] All core auth methods verified (or alternatives documented)
- [ ] All plugin methods cataloged with types
- [ ] **Response shapes verified against Better Auth source code** (MANDATORY)
- [ ] **Better Auth test files consulted for exact structures** (MANDATORY)
- [ ] `outputs/method-inventory.md` created
- [ ] Phase 0 reflection logged

### Output
`outputs/method-inventory.md` containing:
- Verified method list with namespaces
- **Verified response shapes from Better Auth source** (NOT assumed)
- Factory vs Manual pattern classification
- **Better Auth source file references** for each method

---

## Phase 1: Multi-Session Implementation

### Objective
Implement Effect wrappers for session management methods.

### Target Directory
`packages/iam/client/src/multi-session/`

### Methods

| Method | Handler | Pattern |
|--------|---------|---------|
| listDeviceSessions | `list-sessions/` | Factory (no payload) |
| setActiveSession | `set-active/` | Factory |
| revokeDeviceSession | `revoke-session/` | Factory |
| revokeSessions | `revoke-all/` | Factory (no payload) |

### Implementation Steps

1. Create `multi-session/` directory structure
2. For each method:
   - Create `*.contract.ts` with Payload (if any) and Success schemas
   - Create `*.handler.ts` using factory pattern
   - Create `index.ts` barrel export
3. Update `packages/iam/client/src/index.ts` exports

### Checkpoints

- [ ] All 4 handlers implemented
- [ ] All handlers check `response.error`
- [ ] Session-mutating handlers notify `$sessionSignal`
- [ ] Type check passes (`bun run --filter @beep/iam-client check`)
- [ ] Phase 1 reflection logged

---

## Phase 2: Password Recovery Implementation

### Objective
Implement password recovery flow handlers.

### Target Directory
`packages/iam/client/src/password/`

### Methods

| Method | Handler | Pattern | Notes |
|--------|---------|---------|-------|
| forgetPassword | `forgot/` | Factory | Sends reset email |
| resetPassword | `reset/` | Factory | Uses token from email |
| changePassword | `change/` | Factory | Requires current password |

### Implementation Steps

1. Create `password/` directory structure
2. For each method:
   - Create contract with appropriate schemas
   - Create handler (factory or manual based on response shape)
   - Add barrel exports
3. Update package exports

### Checkpoints

- [ ] All 3 handlers implemented
- [ ] Password fields use `Redacted<string>` type
- [ ] Type check passes
- [ ] Phase 2 reflection logged

---

## Phase 3: Email Verification Implementation

### Objective
Implement email verification flow handlers.

### Target Directory
`packages/iam/client/src/verification/`

### Methods

| Method | Handler | Pattern |
|--------|---------|---------|
| sendVerificationEmail | `send/` | Factory |
| verifyEmail | `verify/` | Factory |

### Checkpoints

- [ ] All 2 handlers implemented
- [ ] Type check passes
- [ ] Phase 3 reflection logged

---

## Phase 4: Two-Factor Authentication Implementation

### Objective
Implement TOTP and backup code handlers.

### Target Directory
`packages/iam/client/src/two-factor/`

### Methods

| Method | Handler | Pattern | Notes |
|--------|---------|---------|-------|
| getTOTPURI | `totp/setup/` | Manual | Returns QR code URI |
| enable | `totp/enable/` | Factory | Requires TOTP code |
| disable | `totp/disable/` | Factory | Requires TOTP code |
| verifyTOTP | `totp/verify/` | Factory | During sign-in |
| generateBackupCodes | `backup/generate/` | Factory | Returns code array |
| verifyBackupCode | `backup/verify/` | Factory | Single-use codes |

### Implementation Steps

1. Create `two-factor/totp/` and `two-factor/backup/` directories
2. Implement TOTP handlers first (dependent on setup flow)
3. Implement backup code handlers
4. Test complete 2FA setup flow manually

### Checkpoints

- [ ] All 6 handlers implemented
- [ ] TOTP codes validated as 6-digit strings
- [ ] Backup codes validated as proper format
- [ ] Type check passes
- [ ] Phase 4 reflection logged

---

## Phase 5: Organization Management Implementation

### Objective
Implement organization CRUD and membership handlers.

### Target Directory
`packages/iam/client/src/organization/`

### Methods (CRUD)

| Method | Handler | Pattern |
|--------|---------|---------|
| create | `create/` | Factory |
| update | `update/` | Factory |
| delete | `delete/` | Factory |
| listOrganizations | `list/` | Factory (no payload) |
| getFullOrganization | `get-full/` | Factory |
| setActiveOrganization | `set-active/` | Factory |

### Methods (Membership)

| Method | Handler | Pattern |
|--------|---------|---------|
| getActiveMember | `membership/get-active/` | Factory |
| inviteMember | `membership/invite/` | Factory |
| cancelInvitation | `membership/cancel-invite/` | Factory |
| acceptInvitation | `membership/accept-invite/` | Factory |
| rejectInvitation | `membership/reject-invite/` | Factory |
| removeMember | `membership/remove/` | Factory |
| updateMemberRole | `membership/update-role/` | Factory |
| hasPermission | `membership/has-permission/` | Factory |

### Checkpoints

- [ ] All 14 handlers implemented
- [ ] Organization ID validated as UUID
- [ ] Role enum validated
- [ ] Type check passes
- [ ] Phase 5 reflection logged

---

## Phase 6: Team Management Implementation

### Objective
Implement team CRUD and membership handlers.

### Target Directory
`packages/iam/client/src/team/`

### Methods

| Method | Handler | Pattern |
|--------|---------|---------|
| createTeam | `create/` | Factory |
| updateTeam | `update/` | Factory |
| deleteTeam | `delete/` | Factory |
| listTeams | `list/` | Factory |
| addTeamMember | `members/add/` | Factory |
| removeTeamMember | `members/remove/` | Factory |

### Checkpoints

- [ ] All 6 handlers implemented
- [ ] Team ID validated
- [ ] Type check passes
- [ ] Phase 6 reflection logged

---

## Phase 7: Integration Testing & Documentation

### Objective
Validate complete flows and update documentation.

### Tasks

#### 7.1: E2E Flow Testing

Test complete user flows:
1. Multi-session: Sign in on multiple devices, switch, revoke
2. Password: Forgot password flow end-to-end
3. Email: Verification request and completion
4. 2FA: Setup TOTP, verify, use backup codes
5. Organizations: Create org, invite member, accept invite
6. Teams: Create team, add member, remove member

#### 7.2: AGENTS.md Updates

Add recipes for each feature area:
- Multi-session management examples
- Password recovery flow examples
- Email verification patterns
- 2FA setup and verification
- Organization CRUD with permissions
- Team management

#### 7.3: Test Coverage

Create tests for each handler:
- Unit tests for schema encoding/decoding
- Integration tests for handler execution
- Error case coverage

### Checkpoints

- [ ] All flows tested manually
- [ ] AGENTS.md updated with all recipes
- [ ] Test coverage created
- [ ] Final type check passes
- [ ] Final lint check passes
- [ ] Phase 7 reflection logged

---

## Verification Commands

```bash
# Handler count (compare against method inventory)
find packages/iam/client/src -name "*.handler.ts" | wc -l

# Session signal coverage
grep -r "\$sessionSignal" packages/iam/client/src --include="*.handler.ts" | wc -l

# Error checking coverage
grep -r "response.error !== null" packages/iam/client/src --include="*.handler.ts" | wc -l

# No unsafe types
grep -r "any\|@ts-ignore" packages/iam/client/src --include="*.ts" | grep -v "Schema.Any" | wc -l

# Type check
bun run --filter @beep/iam-client check

# Lint check
bun run --filter @beep/iam-client lint
```

---

## Handoff Protocol

**CRITICAL**: At the end of each phase, orchestrators MUST create optimized handoff prompts using lessons learned for continuous spec improvement.

**READ FIRST**: [HANDOFF_CREATION_GUIDE.md](./HANDOFF_CREATION_GUIDE.md) documents mandatory requirements for creating handoffs, including Better Auth source verification.

### After Each Phase Complete:

#### 1. Update REFLECTION_LOG.md

Log learnings immediately while context is fresh:
```markdown
## Phase [N]: [Name]

**Date**: YYYY-MM-DD

### What Was Done
- [Specific accomplishments, handlers implemented, files created]

### What Worked Well
- [Patterns, tools, approaches that succeeded]
- [Prompts that were effective]

### What Needed Adjustment
- [Issues encountered and resolutions]
- [Deviations from original prompt]

### Learnings for Future Phases
- [Insights that should inform next phase]
- [Pattern refinements discovered]

### Metrics
- Handlers implemented: X
- Tests passing: X/X
- Type errors fixed: X
```

#### 2. Create Optimized HANDOFF_P[N+1].md

Use learnings to improve the next handoff:

```markdown
# Phase [N+1] Handoff: [Name]

**From**: Phase [N] ([Name])
**To**: Phase [N+1] ([Name])
**Status**: Ready for implementation

## Phase [N] Summary
[What was accomplished, key outcomes]

## Lessons Applied to This Handoff
[Specific improvements made based on Phase N experience]
- Prompt refinement: [What changed and why]
- Pattern clarification: [Any new understanding]
- Gotchas added: [Issues to avoid]

## Better Auth Source Verification (MANDATORY)

**CRITICAL**: All response schemas in this handoff MUST be verified against Better Auth source code:

| Method | Route File | Test File | Verified |
|--------|-----------|-----------|----------|
| `methodName` | `tmp/better-auth/packages/better-auth/src/api/routes/{domain}.ts` | `tmp/better-auth/packages/better-auth/src/client/{domain}.test.ts` | ✅ |

**Verification Process**:
1. Located route implementation in `src/api/routes/{domain}.ts`
2. Extracted exact response shape from `ctx.json()` calls
3. Cross-referenced with test assertions in `src/client/{domain}.test.ts`
4. Documented ALL fields including optional/null fields

## Methods to Implement
[Verified methods with confirmed signatures from Better Auth source]

**Response Shapes** (verified from source):
```typescript
// Example:
// methodName response (verified from password.ts line 42):
{ status: boolean, message: string }
```

## Pattern Decisions
[Factory vs Manual with reasoning from actual experience]

## Known Issues & Gotchas
[Problems discovered that next phase should avoid]

## Improved Instructions
[Refined steps based on what actually worked]
```

#### 3. Create Optimized P[N+1]_ORCHESTRATOR_PROMPT.md

**Key Principle**: Each orchestrator prompt should be BETTER than the previous one.

Optimization requirements:
- **Incorporate specific discoveries** from completed phase
- **Refine vague instructions** that caused confusion
- **Add gotchas** encountered during execution
- **Update method signatures** with actual verified types
- **Include timing estimates** if patterns emerge
- **Add verification steps** for issues that slipped through

Template for continuous improvement:
```markdown
# Phase [N+1] Orchestrator Prompt: [Name]

## Improvements from Phase [N]
[List specific refinements made to this prompt based on prior phase learnings]

## Context
[Updated context with new discoveries]

## Tasks
[Refined tasks with clearer instructions]

## Known Gotchas (from Phase [N])
[Issues discovered that this phase should avoid]

## Verification Checkpoints
[Updated based on what actually needs checking]

## Completion Protocol
[Ensure this creates HANDOFF_P[N+2].md and P[N+2]_ORCHESTRATOR_PROMPT.md]
```

### Handoff Quality Checklist

Before finalizing any handoff:

- [ ] REFLECTION_LOG.md updated with Phase [N] learnings
- [ ] HANDOFF_P[N+1].md includes "Lessons Applied" section
- [ ] P[N+1]_ORCHESTRATOR_PROMPT.md includes "Improvements from Phase [N]"
- [ ] Known gotchas documented
- [ ] Method signatures updated with verified types
- [ ] Pattern decisions include reasoning from experience
- [ ] Next phase prompt is MORE specific than current phase prompt

### Anti-Pattern: Static Handoffs

**WRONG**: Copy-paste handoff templates without incorporating learnings
```markdown
# Phase 2 Handoff
[Same generic content as Phase 1 handoff]
```

**RIGHT**: Each handoff evolves based on actual experience
```markdown
# Phase 2 Handoff

## Lessons Applied from Phase 1
- Discovered that `forgetPassword` is actually `client.auth.forgetPassword`
- Factory pattern works for all multi-session methods (verified)
- Added explicit verification step for session signal notification
```

### Continuous Improvement Loop

```
┌─────────────────────────────────────────────────────────────┐
│                 PHASE COMPLETION LOOP                        │
├─────────────────────────────────────────────────────────────┤
│  1. Execute Phase [N] using P[N]_ORCHESTRATOR_PROMPT.md     │
│  2. Log learnings to REFLECTION_LOG.md                       │
│  3. Identify what worked and what didn't                    │
│  4. Create HANDOFF_P[N+1].md with "Lessons Applied"         │
│  5. Create P[N+1]_ORCHESTRATOR_PROMPT.md with improvements  │
│  6. Verify handoff is MORE SPECIFIC than input prompt       │
│  7. If work remains, go to step 1 with P[N+1]               │
└─────────────────────────────────────────────────────────────┘
```

Each iteration should produce:
- **Better prompts** (more specific, fewer ambiguities)
- **Better patterns** (refined based on experience)
- **Better estimates** (informed by actual execution)
- **Fewer surprises** (gotchas documented for next phase)
