# Handoff: Phase 1 Discovery Complete

> **Status**: Phase 1 Complete — Proceed to Phase 2 Design + Dry Run

---

## Summary

Phase 1 Discovery has completed a comprehensive inventory of all 30 legacy handlers across 5 modules in `@beep/iam-client`. All handlers have been analyzed for:
- Current file structure and naming patterns
- Payload and Success schemas
- Better Auth API methods used
- Session mutation requirements
- Pattern type (Simple vs Transform)
- Form integration needs

---

## Key Deliverables

| Artifact | Location | Description |
|----------|----------|-------------|
| Legacy Inventory | `outputs/legacy-inventory.md` | Complete 30-handler inventory with migration details |
| Handler Template | `templates/handler-migration.template.md` | Per-handler migration checklist |
| Module Template | `templates/module-completion.template.md` | Per-module completion checklist |
| Reflection Log | `REFLECTION_LOG.md` | Phase 1 findings and checkpoint answers |

---

## Phase 1 Findings

### Handler Count Verification

| Module | Handlers | Confirmed |
|--------|----------|-----------|
| `email-verification` | 1 | ✅ |
| `multi-session` | 3 | ✅ |
| `password` | 3 | ✅ |
| `two-factor` | 8 | ✅ |
| `organization` | 15 | ✅ |
| **Total** | **30** | ✅ |

### Pattern Analysis

**Critical Finding**: All 30 handlers can use the **Simple Pattern** (direct `Payload` class).

- No computed fields required
- No password confirmation validation needed
- Fields map 1:1 to Better Auth API
- No Transform Pattern (`PayloadFrom` + `Payload`) needed

This significantly simplifies the migration — all handlers follow the same pattern.

### Session Mutation Analysis

8 handlers require `mutatesSession: true`:

| Module | Handler | Reason |
|--------|---------|--------|
| multi-session | revoke | Removes a session |
| multi-session | set-active | Switches active session |
| password | change | May revoke other sessions |
| two-factor | disable | Changes user 2FA state |
| two-factor | backup/verify | Creates session after 2FA |
| two-factor | otp/verify | Creates session after 2FA |
| two-factor | totp/verify | Creates session after 2FA |
| organization | crud/set-active | Changes active organization context |

### Middleware Requirements

- **CaptchaMiddleware**: NOT needed for any legacy handler
- **IamError**: All handlers should use `Common.IamError` for consistent error handling

### Schema Issues Identified

1. **Password fields in `password/*`**: Use plain `S.String`, should migrate to `S.Redacted(S.String)`
2. **Date fields**: `multi-session` uses `S.Date` (correct for Better Auth client Date objects)
3. **Custom User schemas**: `password/change` defines local User class — should use `Common.DomainUserFromBetterAuthUser`
4. **Known type error**: `organization/crud/create/create.handler.ts` has `Boolean(encoded.isPersonal)` workaround

### Form Requirements

| Module | Forms Needed | Rationale |
|--------|--------------|-----------|
| `email-verification` | ❌ No | Triggered by email links, not user forms |
| `multi-session` | ❌ No | Programmatic session management (list, revoke buttons) |
| `password` | ✅ 3 forms | User-facing change/reset password forms |
| `two-factor` | ✅ 7 forms | TOTP setup, OTP/backup code entry forms |
| `organization` | ✅ 4 forms | Create/update org, invite member, update role forms |

---

## Reflection Checkpoint Answers

### Which Better Auth APIs have nullable vs optional response fields?
- `password/change` — `token: S.NullOr(S.String)` (null when `revokeOtherSessions` is false)
- `two-factor/backup/verify` — `token: S.optional(S.String)` (absent when `disableSession` is true)
- Most other handlers return consistent shapes

### Which handlers mutate session?
8 handlers identified — see Session Mutation Analysis above

### Which handlers require computed payload fields (Transform Pattern)?
**None** — all 30 handlers can use Simple Pattern

### Which handlers have middleware requirements?
**None** require CaptchaMiddleware. All should use Common.IamError.

### What error patterns are currently used?
All handlers use `createHandler` factory which handles errors internally via `response.error` checking. After migration, `wrapIamMethod` will provide consistent `IamError` mapping.

---

## Source Verification (MANDATORY)

> **CRITICAL**: Before implementing Phase 2, verify ALL Better Auth API response shapes against source code or LSP hover types. NEVER assume response shapes.

### Verification Protocol

1. **Hover over client method** in IDE to get TypeScript signature
2. **Check return type** — `{ data: T, error?: E }` vs direct value
3. **Verify optional vs required** fields in response
4. **Document any discrepancies** in `outputs/better-auth-api-audit.md`

### Verification Status

| Module | Method | Verified | Notes |
|--------|--------|----------|-------|
| email-verification | `client.sendVerificationEmail` | ☐ | |
| multi-session | `client.multiSession.listDeviceSessions` | ☐ | |
| multi-session | `client.multiSession.revoke` | ☐ | |
| multi-session | `client.multiSession.setActive` | ☐ | |
| password | `client.changePassword` | ☐ | token nullable |
| password | `client.requestPasswordReset` | ☐ | |
| password | `client.resetPassword` | ☐ | |
| two-factor | `client.twoFactor.enable` | ☐ | |
| two-factor | `client.twoFactor.disable` | ☐ | |
| two-factor | `client.twoFactor.generateBackupCodes` | ☐ | |
| two-factor | `client.twoFactor.verifyBackupCode` | ☐ | token optional |
| two-factor | `client.twoFactor.sendOtp` | ☐ | |
| two-factor | `client.twoFactor.verifyOtp` | ☐ | |
| two-factor | `client.twoFactor.getTotpUri` | ☐ | |
| two-factor | `client.twoFactor.verifyTotp` | ☐ | |
| organization | `client.organization.create` | ☐ | |
| organization | `client.organization.delete` | ☐ | |
| organization | `client.organization.getFullOrganization` | ☐ | |
| organization | `client.organization.list` | ☐ | |
| organization | `client.organization.setActive` | ☐ | |
| organization | `client.organization.update` | ☐ | |
| organization | `client.organization.acceptInvitation` | ☐ | |
| organization | `client.organization.cancelInvitation` | ☐ | |
| organization | `client.organization.inviteMember` | ☐ | |
| organization | `client.organization.listInvitations` | ☐ | |
| organization | `client.organization.rejectInvitation` | ☐ | |
| organization | `client.organization.listMembers` | ☐ | |
| organization | `client.organization.removeMember` | ☐ | |
| organization | `client.organization.updateMemberRole` | ☐ | |

**Output**: Document findings in `outputs/better-auth-api-audit.md`

---

## Migration Priority Recommendation

Based on complexity analysis:

1. **email-verification** (1 handler) — Validate patterns with simplest module
2. **multi-session** (3 handlers) — Test WrapperGroup without forms
3. **password** (3 handlers) — Introduce form.ts pattern
4. **two-factor** (8 handlers) — Complex sub-module structure
5. **organization** (15 handlers) — Most complex, save for last

---

## Phase 2 Requirements

### Design Tasks

For each of the 5 modules:
1. Design WrapperGroup composition
2. Plan Effect.Service definition with accessors
3. Define atom patterns (what hooks are needed)
4. Plan form integration (where applicable)
5. Document file renames (legacy → canonical naming)

### Validation Dry Run (REQUIRED)

Select 3 representative handlers for trial implementation:

| Category | Recommended Handler | Why |
|----------|---------------------|-----|
| No-payload | `multi-session/list-sessions` | Tests no-payload handler pattern |
| Simple with-payload | `email-verification/send-verification` | Simplest with-payload handler |
| Typical with-payload | `password/change` | Representative case with session mutation |

**Note**: Since no handlers require Transform Pattern, we substitute a representative "typical" handler instead of "complex handler with computed fields".

### Dry Run Protocol

For each handler:
1. Implement following canonical patterns exactly
2. Note any friction or confusion
3. Verify type-check passes: `bun run check --filter @beep/iam-client`
4. Document learnings

After all 3:
1. Synthesize what worked and what didn't
2. Update prompts/methodology based on learnings
3. Rollback implementations (this is research, not final implementation)
4. Commit only spec improvements

---

## Key References

| Document | Purpose |
|----------|---------|
| `documentation/patterns/iam-client-patterns.md` | **Primary pattern reference** |
| `outputs/legacy-inventory.md` | Complete handler inventory |
| `templates/handler-migration.template.md` | Per-handler checklist |
| `templates/module-completion.template.md` | Per-module checklist |

### Canonical Examples

| File | Pattern Demonstrated |
|------|---------------------|
| `sign-in/email/contract.ts` | Simple Pattern (Payload, Success, Wrapper) |
| `sign-in/email/handler.ts` | `Wrapper.implement()` + `wrapIamMethod()` |
| `sign-in/layer.ts` | `WrapperGroup.make()` with positional args |
| `sign-in/service.ts` | `Effect.Service` with accessors |
| `sign-in/atoms.ts` | Atom hook pattern |
| `sign-in/form.ts` | Form hook pattern |

---

## Files Changed in Phase 1

- `outputs/legacy-inventory.md` — Created (complete inventory)
- `templates/handler-migration.template.md` — Created
- `templates/module-completion.template.md` — Created
- `REFLECTION_LOG.md` — Updated with Phase 1 findings
- `README.md` — Updated to mark Phase 1 complete

---

## Next Steps

1. Read this handoff document
2. Read `outputs/legacy-inventory.md` for detailed handler analysis
3. Complete source verification (see table above)
4. Begin Phase 2 Design for each module
5. Conduct Validation Dry Run with 3 handlers
6. Create `HANDOFF_P2.md` upon Phase 2 completion

---

## Phase 2 Orchestrator Prompt (Copy-Paste Ready)

**Recommended Agents**: `Explore` (for design), `effect-code-writer` (for dry run), `reflector` (for synthesis)

```
You are beginning Phase 2 (Design + Dry Run) for the IAM Client Legacy Refactor spec.

## Context

Read these documents first:
- specs/iam-client-legacy-refactor/handoffs/HANDOFF_P1.md (this handoff)
- specs/iam-client-legacy-refactor/outputs/legacy-inventory.md (complete handler details)
- documentation/patterns/iam-client-patterns.md (canonical patterns)

## Phase 2A: Source Verification

Complete the verification table in HANDOFF_P1.md:
1. For each Better Auth method, hover in IDE to verify return type
2. Check for nullable vs optional response fields
3. Document any discrepancies in outputs/better-auth-api-audit.md

## Phase 2B: Design Tasks

For each of the 5 modules, create design documentation in outputs/migration-design.md:

1. **WrapperGroup composition**
   - List all Wrappers to include
   - Use positional args: `WrapperGroup.make(Wrapper1, Wrapper2, ...)`

2. **Effect.Service definition**
   - Service name and identifier
   - accessors: true
   - Group.accessHandlers() pattern

3. **Atom patterns**
   - What hooks are needed (use() function)
   - Which handlers need toast feedback
   - Session signal notification for mutating handlers

4. **Form integration** (where applicable)
   - Which handlers have user-facing forms
   - useAppForm + formOptionsWithDefaults pattern

5. **File operations**
   - Rename legacy files to canonical naming
   - Create mod.ts barrel files
   - Update index.ts namespace exports

## Phase 2C: Validation Dry Run

Implement 3 representative handlers (trial only, rollback after):

1. `multi-session/list-sessions` — No-payload handler
2. `email-verification/send-verification` — Simple with-payload handler
3. `password/change` — With-payload + session mutation

For each:
- Follow canonical patterns exactly
- Note any friction or confusion
- Verify: bun run check --filter @beep/iam-client
- Document learnings

After all 3:
- Synthesize findings in outputs/dry-run-reflection.md
- Update methodology based on learnings
- ROLLBACK implementations (this is research)
- Commit only spec improvements

## Outputs

Create these artifacts:
- outputs/better-auth-api-audit.md (source verification findings)
- outputs/migration-design.md (per-module design decisions)
- outputs/dry-run-reflection.md (learnings from trial implementation)
- handoffs/HANDOFF_P2.md (Phase 2 completion handoff)

## Success Criteria

- [ ] All 30 Better Auth methods verified against LSP types
- [ ] Design documented for all 5 modules
- [ ] 3 handlers implemented in dry run
- [ ] Dry run findings synthesized
- [ ] All implementations rolled back
- [ ] HANDOFF_P2.md created
```

---

## Session Context

**Completed by**: Claude Code session
**Date**: 2026-01-18
**Phase**: 1 of 4+ (Discovery)
**Next Phase**: 2 (Design + Dry Run)
