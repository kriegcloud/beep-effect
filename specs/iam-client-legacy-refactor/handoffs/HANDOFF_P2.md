# Handoff: Phase 2 Design + Dry Run Complete

> **Status**: Phase 2 Complete — Proceed to Phase 3 Implementation

---

## Summary

Phase 2 completed comprehensive design work and validated patterns through dry run implementations:

1. **Source Verification**: All 30 Better Auth methods verified against contract schemas
2. **Migration Design**: Complete design documentation for all 5 modules
3. **Dry Run**: 3 representative handlers implemented, type-checked, and rolled back

---

## Key Deliverables

| Artifact | Location | Description |
|----------|----------|-------------|
| API Audit | `outputs/better-auth-api-audit.md` | Complete 30-method verification |
| Migration Design | `outputs/migration-design.md` | Per-module design decisions |
| Dry Run Reflection | `outputs/dry-run-reflection.md` | Implementation learnings |
| Legacy Inventory | `outputs/legacy-inventory.md` | From Phase 1 (unchanged) |

---

## Phase 2A: Source Verification Results

All 30 handlers verified. Key findings:

| Category | Finding |
|----------|---------|
| Response Pattern | All use `{ data: T, error?: { message?, code?, status? } }` |
| Date Fields | Better Auth client returns JavaScript `Date` objects (not ISO strings) |
| Nullable Fields | `password/change.token` is nullable (null when revokeOtherSessions=false) |
| Optional Fields | `two-factor/backup/verify.token` is optional (absent when disableSession=true) |

### Schema Corrections Identified

| Handler | Issue | Fix |
|---------|-------|-----|
| `password/change` | `password: S.String` | Use `S.Redacted(S.String)` |
| `password/reset` | `newPassword: S.String` | Use `S.Redacted(S.String)` |
| `password/change` | Local `User` class | Keep local (endpoint returns simpler user) |
| `organization/create` | `isPersonal` type issue | Fix `Boolean()` workaround |

---

## Phase 2B: Migration Design Summary

### Module-Level Files Required

Each module needs:
- `index.ts` — Namespace export
- `mod.ts` — Barrel file
- `layer.ts` — WrapperGroup composition
- `service.ts` — Effect.Service definition
- `atoms.ts` — React hooks
- `form.ts` — Form hooks (where applicable)

### WrapperGroup Composition

```typescript
// email-verification: 1 wrapper
Group = Wrap.WrapperGroup.make(SendVerification.Wrapper);

// multi-session: 3 wrappers
Group = Wrap.WrapperGroup.make(ListSessions.Wrapper, Revoke.Wrapper, SetActive.Wrapper);

// password: 3 wrappers
Group = Wrap.WrapperGroup.make(Change.Wrapper, RequestReset.Wrapper, Reset.Wrapper);

// two-factor: 8 wrappers
Group = Wrap.WrapperGroup.make(Enable.Wrapper, Disable.Wrapper, ...);

// organization: 15 wrappers
Group = Wrap.WrapperGroup.make(CrudCreate.Wrapper, CrudDelete.Wrapper, ...);
```

### Form Requirements

| Module | Forms Needed |
|--------|--------------|
| `email-verification` | None |
| `multi-session` | None |
| `password` | 3 forms (change, request-reset, reset) |
| `two-factor` | 7 forms (enable, disable, backup-generate, backup-verify, otp-verify, totp-get-uri, totp-verify) |
| `organization` | 4 forms (create, update, invite-member, update-role) |

---

## Phase 2C: Dry Run Findings

### Handlers Tested

| Handler | Pattern | Result |
|---------|---------|--------|
| `multi-session/list-sessions` | No-payload | ✅ Passed |
| `email-verification/send-verification` | Simple with-payload | ✅ Passed |
| `password/change` | With-payload + session mutation | ✅ Passed |

### Key Learnings

1. **Wrapper addition is trivial** — Just add `W.Wrapper.make()` to contract
2. **wrapIamMethod migration is mechanical** — Direct mapping from createHandler
3. **S.Redacted works transparently** — Encoded type is plain string, no manual extraction
4. **JSDoc adds bulk but is necessary** — Consider templates for faster documentation

### Validated Patterns

```typescript
// No-Payload Pattern
export const Wrapper = W.Wrapper.make("Name", {
  success: Success,
  error: Common.IamError,
});

export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })(() => client.method())
);

// With-Payload Pattern
export const Wrapper = W.Wrapper.make("Name", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});

export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: true,
  })((encodedPayload) => client.method(encodedPayload))
);
```

### Estimated Migration Time

| Module | Handlers | Est. Time |
|--------|----------|-----------|
| `email-verification` | 1 | ~35 min |
| `multi-session` | 3 | ~55 min |
| `password` | 3 | ~75 min |
| `two-factor` | 8 | ~120 min |
| `organization` | 15 | ~180 min |
| **Total** | **30** | **~8 hours** |

---

## Implementation Order

Recommended order based on complexity:

1. **email-verification** (1 handler) — Simplest, validate patterns
2. **multi-session** (3 handlers) — Test WrapperGroup without forms
3. **password** (3 handlers) — Introduce form.ts pattern + schema corrections
4. **two-factor** (8 handlers) — Complex sub-module structure
5. **organization** (15 handlers) — Most complex, multiple sub-modules

---

## Phase 3 Implementation Protocol

For each module:

### Step 1: Feature Updates
For each handler in the module:
1. Add `Wrapper` to contract with `Common.IamError`
2. Add JSDoc with `@fileoverview`, `@module`, `@category`, `@since`
3. Update handler to use `wrapIamMethod`
4. Create `mod.ts` barrel file
5. Update `index.ts` to namespace export

### Step 2: Module-Level Files
1. Create `layer.ts` with WrapperGroup
2. Create `service.ts` with Effect.Service + runtime
3. Create `atoms.ts` with use() hook
4. Create `form.ts` with useAppForm hooks (if applicable)
5. Create module `mod.ts` barrel
6. Update module `index.ts`

### Step 3: Verification
1. Run `bun run check --filter @beep/iam-client`
2. Fix any type errors
3. Run `bun run lint:fix`
4. Commit with descriptive message

---

## Files Changed in Phase 2

### Created
- `outputs/better-auth-api-audit.md`
- `outputs/migration-design.md`
- `outputs/dry-run-reflection.md`
- `handoffs/HANDOFF_P2.md` (this file)

### Unchanged
- `outputs/legacy-inventory.md` (from Phase 1)
- `templates/*` (from Phase 1)
- `README.md`
- `REFLECTION_LOG.md`

### Rolled Back (Dry Run)
- `packages/iam/client/src/multi-session/list-sessions/*`
- `packages/iam/client/src/email-verification/send-verification/*`
- `packages/iam/client/src/password/change/*`

---

## Phase 3 Orchestrator Prompt (Copy-Paste Ready)

**Recommended Agents**: `effect-code-writer` (for implementation), `package-error-fixer` (for errors)

```
You are beginning Phase 3 (Implementation) for the IAM Client Legacy Refactor spec.

## Context

Read these documents first:
- specs/iam-client-legacy-refactor/handoffs/HANDOFF_P2.md (this handoff)
- specs/iam-client-legacy-refactor/outputs/migration-design.md (per-module designs)
- specs/iam-client-legacy-refactor/outputs/dry-run-reflection.md (validated patterns)
- documentation/patterns/iam-client-patterns.md (canonical patterns)

## Implementation Order

1. email-verification (1 handler)
2. multi-session (3 handlers)
3. password (3 handlers)
4. two-factor (8 handlers)
5. organization (15 handlers)

## Per-Module Protocol

For each module, complete these steps IN ORDER:

### Step 1: Feature Updates
For each handler:
a. Edit contract.ts:
   - Add Wrapper with W.Wrapper.make()
   - Add JSDoc documentation
   - Apply schema corrections if needed (S.Redacted, etc.)
b. Edit handler.ts:
   - Replace createHandler with wrapIamMethod pattern
   - Add JSDoc documentation
c. Create mod.ts (feature level)
d. Update index.ts (feature level)

### Step 2: Module-Level Files
a. Create layer.ts with WrapperGroup.make(...)
b. Create service.ts with Effect.Service + runtime
c. Create atoms.ts with use() hook
d. Create form.ts if forms are needed
e. Create mod.ts (module level)
f. Update index.ts (module level)

### Step 3: Verification
a. Run: bun run check --filter @beep/iam-client
b. Fix any errors
c. Run: bun run lint:fix
d. Commit with message: "feat(iam-client): migrate {module} to canonical patterns"

## Critical Rules

- NEVER skip Step 3 verification between modules
- ALWAYS use namespace imports (import * as Common from "@beep/iam-client/_internal")
- ALWAYS add proper JSDoc documentation
- Use git mv for file renames to preserve history
- Follow existing patterns in sign-in/email as reference

## Success Criteria

- [ ] All 30 handlers migrated to canonical patterns
- [ ] All 5 modules have complete module-level files
- [ ] bun run check passes for @beep/iam-client
- [ ] bun run lint passes
- [ ] All changes committed

## Outputs

Create these artifacts:
- handoffs/HANDOFF_P3.md (completion handoff)
- Update REFLECTION_LOG.md with Phase 3 findings
```

---

## Session Context

**Completed by**: Claude Code session
**Date**: 2026-01-18
**Phase**: 2 of 4+ (Design + Dry Run)
**Next Phase**: 3 (Implementation)
