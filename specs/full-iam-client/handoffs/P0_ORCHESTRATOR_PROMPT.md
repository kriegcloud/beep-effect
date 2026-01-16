# Phase 0 Orchestrator Prompt: Discovery & Audit

**Spec**: `full-iam-client`
**Phase**: 0 (Discovery & Audit)
**Status**: READY FOR EXECUTION
**Objective**: Verify Better Auth client methods exist and catalog response shapes before implementation

---

## Context

You are beginning the `full-iam-client` specification. This spec implements Effect wrappers for ALL Better Auth client methods using patterns established in `iam-effect-patterns`.

### Background Reading (Priority Order)

1. **This prompt** - Current phase instructions
2. **`handoffs/HANDOFF_FROM_IAM_PATTERNS.md`** - Context from prior spec (602 lines of rich patterns)
3. **`packages/iam/client/src/adapters/better-auth/client.ts`** - Better Auth client configuration

### Patterns Already Established

From `iam-effect-patterns`, these patterns are canonical:
- **Handler factory** (`createHandler`) for standard request/response
- **Manual handlers** for computed fields or different response shapes
- **Error hierarchy** with `BetterAuthResponseError`
- **Session signal** notification via `client.$store.notify("$sessionSignal")`

---

## Phase 0 Tasks

### Task 0.1: Verify Core Auth Methods Exist (CRITICAL)

The handoff lists core auth methods that need verification. These are NOT from plugins and may have different namespaces.

**Methods to verify:**
```typescript
// Password recovery (may be client.* or different namespace)
client.forgetPassword     // Request reset email
client.resetPassword      // Set new password with token
client.changePassword     // Change when logged in

// Email verification (may be client.* or different namespace)
client.sendVerificationEmail  // Send verification email
client.verifyEmail            // Verify with token
```

**Action**: Inspect `packages/iam/client/src/adapters/better-auth/client.ts` and Better Auth types to determine:
1. Do these methods exist on the client?
2. What is their correct namespace/path?
3. What are their parameter and return types?

If methods don't exist, check Better Auth documentation for correct method names.

### Task 0.2: Catalog Plugin Methods

Plugin methods are confirmed via client configuration. Catalog each with their signatures:

**Multi-Session (`client.multiSession.*`)**
| Method | Parameters | Returns | Mutates Session |
|--------|------------|---------|-----------------|
| listDeviceSessions | none | `{ data: Session[], error }` | No |
| setActiveSession | `{ sessionToken }` | `{ data, error }` | Yes |
| revokeDeviceSession | `{ sessionToken }` | `{ data, error }` | Yes |
| revokeSessions | none | `{ data, error }` | Yes |

**Two-Factor (`client.twoFactor.*`)**
| Method | Parameters | Returns | Mutates Session |
|--------|------------|---------|-----------------|
| getTOTPURI | ? | `{ data: { uri }, error }` | No |
| enable | `{ code }` | `{ data, error }` | Yes |
| disable | `{ code }` | `{ data, error }` | Yes |
| verifyTOTP | `{ code }` | `{ data, error }` | Yes |
| generateBackupCodes | ? | `{ data: { codes }, error }` | No |
| verifyBackupCode | `{ code }` | `{ data, error }` | Yes |

**Organization (`client.organization.*`)**
- CRUD: create, update, delete, list, getFullOrganization, setActiveOrganization
- Membership: getActiveMember, inviteMember, cancelInvitation, acceptInvitation, rejectInvitation, removeMember, updateMemberRole
- Permissions: hasPermission

**Team (`client.organization.team.*` or `client.organization.*`)**
- CRUD: createTeam, updateTeam, deleteTeam, listTeams
- Members: addTeamMember, removeTeamMember

**Action**: For each method:
1. Verify it exists in client types
2. Document exact parameter types
3. Document return type (`data` structure)
4. Classify: Factory pattern vs Manual pattern

### Task 0.3: Pattern Classification

For each verified method, determine pattern:

| Condition | Pattern | Example |
|-----------|---------|---------|
| Standard request/response | Factory | `client.signIn.email` |
| No payload | Factory (no-payload) | `client.signOut` |
| Computed payload fields | Manual | `sign-up/email` (name computed) |
| Different response shape | Manual | `client.getSession` |

### Task 0.4: Create Method Inventory

Output to `outputs/method-inventory.md`:

```markdown
# Better Auth Method Inventory

## Summary
- Total methods: X
- Factory pattern: X
- Manual pattern: X
- Methods not found: X

## Core Auth Methods
[Status: Verified/Not Found]
...

## Plugin Methods

### Multi-Session
[Table with method, params, returns, pattern]

### Two-Factor
[Table...]

### Organization
[Table...]

### Team
[Table...]

## Methods Requiring Verification
[List any methods that couldn't be verified]

## Pattern Decisions
[Reasoning for Factory vs Manual for each method]
```

---

## Verification Checkpoints

Before completing Phase 0, verify:

- [ ] All core auth methods verified (or alternatives documented)
- [ ] All plugin methods cataloged with types
- [ ] Pattern classification complete for all methods
- [ ] `outputs/method-inventory.md` created
- [ ] Any missing methods documented with alternatives

---

## Effect Patterns Reminder

All code in this spec must follow Effect patterns:

```typescript
// REQUIRED - Namespace imports
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import * as A from "effect/Array";

// REQUIRED - PascalCase constructors
S.String    // Correct
S.string    // WRONG

// REQUIRED - No native methods
A.map(array, fn)    // Correct
array.map(fn)       // WRONG
```

---

## Completion Protocol

After completing Phase 0:

### 1. Update REFLECTION_LOG.md

```markdown
## Phase 0: Discovery & Audit

**Date**: [DATE]

### What Was Done
- [List accomplishments]

### What Worked Well
- [Patterns that helped discovery]

### What Needed Adjustment
- [Any deviations from this prompt]

### Learnings
- [Key insights for Phase 1+]
- [Pattern decisions made and why]

### Metrics
- Methods verified: X
- Methods not found: X
- Factory pattern candidates: X
- Manual pattern candidates: X
```

### 2. Create HANDOFF_P1.md

Create `handoffs/HANDOFF_P1.md` optimized with Phase 0 learnings:

```markdown
# Phase 1 Handoff: Multi-Session Implementation

**From**: Phase 0 (Discovery)
**To**: Phase 1 (Multi-Session)
**Status**: Ready for implementation

## Phase 0 Summary
[What was discovered]

## Methods to Implement
[Verified methods from inventory]

## Pattern Decisions
[Factory vs Manual with reasoning]

## Improved Instructions
[Any refinements based on Phase 0 experience]

## Known Issues
[Any gotchas discovered during Phase 0]
```

### 3. Create P1_ORCHESTRATOR_PROMPT.md

Create `handoffs/P1_ORCHESTRATOR_PROMPT.md` optimized from Phase 0 learnings:
- Incorporate specific method signatures discovered
- Include any pattern refinements
- Address any issues encountered in Phase 0

---

## Agent Recommendations

| Task | Agent | Rationale |
|------|-------|-----------|
| Method verification | `codebase-researcher` | Type inspection, file exploration |
| Pattern decisions | Human/Orchestrator | Judgment calls on edge cases |
| Documentation | Orchestrator | Write inventory and handoff |

---

## Quick Reference

### Files to Examine
- `packages/iam/client/src/adapters/better-auth/client.ts` - Client config
- `packages/iam/client/src/_common/handler.factory.ts` - Factory pattern
- `packages/iam/client/src/sign-in/email/` - Factory example
- `packages/iam/client/src/sign-up/email/` - Manual example

### Better Auth Docs
- [Multi-Session Plugin](https://better-auth.com/docs/plugins/multi-session)
- [Two-Factor Plugin](https://better-auth.com/docs/plugins/two-factor)
- [Organization Plugin](https://better-auth.com/docs/plugins/organization)

---

## Success Criteria

Phase 0 is complete when:
1. All target methods verified or alternatives documented
2. Method inventory created with complete type information
3. Pattern classification done for all methods
4. REFLECTION_LOG.md updated with learnings
5. HANDOFF_P1.md created for next phase
6. P1_ORCHESTRATOR_PROMPT.md ready for next session

---

**Begin Phase 0 execution now.**
