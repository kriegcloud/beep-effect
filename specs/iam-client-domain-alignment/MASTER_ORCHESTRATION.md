# Master Orchestration

This document defines the complete workflow for aligning IAM client contract success schemas with domain entities.

---

## Phase Overview

| Phase | Name | Status | Duration | Checkpoint |
|-------|------|--------|----------|------------|
| 0 | Discovery | COMPLETED | 2-3 hours | Field mapping tables complete |
| 1A | Create Transformation Schemas | READY | 3-4 hours | All 3 schema files created |
| 1B | Update Contracts | BLOCKED (1A) | 2-3 hours | All contracts use domain models |
| 1C | Cleanup | BLOCKED (1B) | 1 hour | Deprecated files deleted |
| 2 | Documentation | BLOCKED (1C) | 1 hour | CLAUDE.md updated |

---

## Phase 0: Discovery (COMPLETED)

### Objective

Determine actual Better Auth response shapes and verify field alignment with domain entities.

### Key Findings

1. **additionalFields ARE returned**: Better Auth returns all fields configured via `additionalFields` in `Options.ts`
2. **All business fields align**: No domain package changes needed
3. **Embedded user limitation**: FullMember returns only 4 user fields (display-only)
4. **Audit columns available**: `additionalFieldsCommon` provides `_rowId`, `version`, `source`, etc.

### Artifacts Produced

- Field mapping tables (in HANDOFF_P1.md)
- Better Auth schema definitions (Zod → Effect Schema equivalents)
- Current inline schemas inventory

### Checkpoint Criteria

- [x] Field mapping tables for Member, Invitation, Organization
- [x] Better Auth schema definitions captured
- [x] Reference pattern identified (`session.schemas.ts`)
- [x] Embedded user strategy decided

---

## Phase 1A: Create Transformation Schemas

### Objective

Create transformation schemas in `src/_internal/` that map Better Auth responses to domain models.

### Prerequisites

- Phase 0 completed
- Understanding of `S.Struct + S.Record` extension pattern
- Access to `session.schemas.ts` as reference

### Work Items

| File | Schemas to Create | Domain Model |
|------|-------------------|--------------|
| `member.schemas.ts` | `BetterAuthMemberSchema`, `BetterAuthEmbeddedUserSchema`, `BetterAuthFullMemberSchema`, `DomainMemberFromBetterAuthMember`, `FullMemberSuccess` | `Member.Model` |
| `invitation.schemas.ts` | `BetterAuthInvitationSchema`, `DomainInvitationFromBetterAuthInvitation` | `Invitation.Model` |
| `organization.schemas.ts` | `BetterAuthOrganizationSchema`, `DomainOrganizationFromBetterAuthOrganization` | `Organization.Model` |

### Implementation Order

1. **`member.schemas.ts`** (reference implementation)
2. **`invitation.schemas.ts`** (simpler fields)
3. **`organization.schemas.ts`** (more complex JSON fields)

### Critical Patterns

#### S.Struct + S.Record Extension

```typescript
export const BetterAuthMemberSchema = S.Struct(
  {
    // Known fields
    id: S.String,
    // ... other fields
  },
  S.Record({ key: S.String, value: S.Unknown })  // Capture unknown plugin fields
);
```

#### ID Validation (Branded Type Guards)

```typescript
const isValidMemberId = IamEntityIds.MemberId.is(ba.id);
if (!isValidMemberId) {
  return yield* ParseResult.fail(
    new ParseResult.Type(ast, ba, `Invalid member ID format: expected "iam_member__<uuid>", got "${ba.id}"`)
  );
}
```

#### Role Field Handling

The `role` field requires decode validation because `BetterAuthMemberSchema` uses `S.String`, but `Member.Model` expects `MemberRole` (a branded union type).

```typescript
// CORRECT - Validate role against domain type
role: yield* S.decode(MemberRole)(ba.role),

// WRONG - Direct assignment (type mismatch: string vs MemberRole)
// role: ba.role,
```

#### Status Field Handling

Better Auth defaults `status` to "active"; domain defaults to "inactive". The transformation MUST preserve Better Auth's value, not apply domain defaults.

```typescript
// CORRECT - Use Better Auth value as-is (required field, always present)
status: ba.status,

// WRONG - Defensive fallback (unnecessary if additionalFields configured correctly)
// status: ba.status ?? "active",
```

If `additionalFields` is configured correctly, `status` is REQUIRED and always present. If it's missing, that indicates a configuration error that should fail loudly, not silently fallback.

### Checkpoint Criteria

- [ ] `member.schemas.ts` created with all schemas
- [ ] `invitation.schemas.ts` created with all schemas
- [ ] `organization.schemas.ts` created with all schemas
- [ ] `_internal/index.ts` exports all new schemas
- [ ] Type check passes: `bun run check --filter @beep/iam-client`
- [ ] Tests pass with ≥90% coverage

### Agent Selection

- **Primary**: `effect-code-writer` (transformation schema implementation)
- **Support**: `codebase-researcher` (verify patterns), `test-writer` (generate tests)

---

## Phase 1B: Update Contracts

### Objective

Update contracts to use transformation schemas instead of inline schemas.

### Prerequisites

- Phase 1A completed and verified
- All transformation schemas exported from `_internal/index.ts`

### Work Items

| Contract | Current Schema | New Schema |
|----------|---------------|------------|
| `multi-session/list-sessions/contract.ts` | Inline `Session` class | `S.Array(Common.DomainSessionFromBetterAuthSession)` |
| `organization/members/list/contract.ts` | `FullMember` import | `Common.FullMemberSuccess` |
| `organization/invitations/list/contract.ts` | `Invitation` import | `S.Array(Common.DomainInvitationFromBetterAuthInvitation)` |
| `organization/crud/create/contract.ts` | `Organization` usage | `Common.DomainOrganizationFromBetterAuthOrganization` |
| `organization/crud/list/contract.ts` | `Organization` usage | `Common.DomainOrganizationFromBetterAuthOrganization` |
| `organization/crud/update/contract.ts` | `Organization` usage | `Common.DomainOrganizationFromBetterAuthOrganization` |
| `organization/crud/get-full/contract.ts` | `Organization` usage | `Common.DomainOrganizationFromBetterAuthOrganization` |
| `organization/crud/set-active/contract.ts` | `Organization` usage | `Common.DomainOrganizationFromBetterAuthOrganization` |

### Checkpoint Criteria

- [ ] All contracts updated to use transformation schemas
- [ ] No remaining imports of deprecated `_common/*.schema.ts` files
- [ ] Type check passes: `bun run check --filter @beep/iam-client`
- [ ] Tests pass: `bun run test --filter @beep/iam-client`

### Agent Selection

- **Primary**: `effect-code-writer` (contract updates)
- **Support**: `code-reviewer` (verify changes)

---

## Phase 1C: Cleanup

### Objective

Remove deprecated inline schema files after contracts are updated.

### Prerequisites

- Phase 1B completed and verified
- No remaining imports of deprecated files

### Work Items

Files to delete:

1. `src/organization/_common/member.schema.ts`
2. `src/organization/_common/invitation.schema.ts`
3. `src/organization/_common/organization.schema.ts`
4. `src/organization/_common/full-organization.schema.ts`

### Pre-Deletion Verification

```bash
# Ensure no remaining imports
grep -r "from.*_common/member.schema" packages/iam/client/src/
grep -r "from.*_common/invitation.schema" packages/iam/client/src/
grep -r "from.*_common/organization.schema" packages/iam/client/src/
grep -r "from.*_common/full-organization.schema" packages/iam/client/src/
```

### Checkpoint Criteria

- [ ] All deprecated files deleted
- [ ] No import errors: `bun run check --filter @beep/iam-client`
- [ ] Tests pass: `bun run test --filter @beep/iam-client`

---

## Phase 2: Documentation

### Objective

Update `packages/iam/client/CLAUDE.md` to document transformation schema patterns.

### Prerequisites

- Phase 1C completed
- All verification commands pass

### Work Items

Add section to CLAUDE.md documenting:

1. **Transformation schema location**: `src/_internal/*.schemas.ts`
2. **Pattern reference**: `S.Struct + S.Record` extension
3. **When to create new transformations**: When adding new entity-returning endpoints
4. **Testing requirements**: ≥90% coverage, 13 test case categories

### Checkpoint Criteria

- [ ] CLAUDE.md updated with transformation pattern documentation
- [ ] Documentation reviewed for accuracy

---

## Verification Commands

### Per-Phase Verification

```bash
# Type checking (includes dependencies via Turborepo)
bun run check --filter @beep/iam-client

# Isolated type check (no dependency cascade)
bun tsc --noEmit packages/iam/client/tsconfig.json

# Lint
bun run lint --filter @beep/iam-client

# Tests
bun run test --filter @beep/iam-client
```

### Final Verification

```bash
# Full monorepo check
bun run check
bun run test
```

### Turborepo Cascading Note

The `--filter @beep/iam-client` flag checks the package AND all its dependencies. If errors appear from unrelated packages, isolate:

```bash
# Check if error is in upstream dependency
bun run check --filter @beep/iam-domain
bun run check --filter @beep/shared-domain
```

---

## Error Recovery

### Type Errors After Phase 1A

If type errors occur after creating transformation schemas:

1. Verify `S.Struct + S.Record` pattern is correct
2. Check that all fields match Better Auth response shape
3. Verify branded ID type guards use `EntityId.is()` method
4. Ensure imports from `@beep/iam-domain/entities` are correct

### Import Errors After Phase 1B

If import errors occur after updating contracts:

1. Verify `_internal/index.ts` exports all new schemas
2. Check import path uses `Common.` prefix
3. Ensure transformation schema names match expected format

### Test Failures

If tests fail:

1. Check test fixtures match actual Better Auth response shapes
2. Verify round-trip encode/decode preserves data
3. Check date/DateTime conversions preserve timezone

---

## Agent Handoff Protocol

### Starting a New Session

1. Read `README.md` for context
2. Read `REFLECTION_LOG.md` for methodology learnings
3. Read relevant `handoffs/P[N]_ORCHESTRATOR_PROMPT.md` for current phase
4. Read `handoffs/HANDOFF_P[N].md` for detailed context if available
5. Begin work on checkpoint

### Ending a Session (MANDATORY)

**CRITICAL**: At the end of EVERY phase, you MUST:

1. Update `REFLECTION_LOG.md` with learnings from this phase
2. Create or update `handoffs/HANDOFF_P[N].md` with:
   - Completed work items
   - Remaining work items
   - Any blockers or decisions needed
3. Run verification commands and document results
4. **CREATE NEXT PHASE HANDOFF**: `handoffs/P[N+1]_ORCHESTRATOR_PROMPT.md`
   - This ensures the next agent has a ready-to-use prompt
   - Include current state, prerequisites, work items, and verification commands
   - Reference the HANDOFF document for detailed context

### Handoff File Naming Convention

| File Type | Naming | Purpose |
|-----------|--------|---------|
| Orchestrator Prompt | `P[N]_ORCHESTRATOR_PROMPT.md` | Copy-paste prompt to start phase |
| Detailed Handoff | `HANDOFF_P[N].md` | Full context, field mappings, edge cases |

---

## Success Criteria

1. All entity-returning contracts use domain models via transformation schemas
2. No inline schema duplication of domain entities
3. BetterAuth schemas use `S.Struct({...}, S.Record({ key: S.String, value: S.Unknown }))` pattern
4. Transformation schemas have comprehensive test coverage (≥90% lines)
5. Type checks pass: `bun run check --filter @beep/iam-client`
6. Lint passes: `bun run lint --filter @beep/iam-client`
7. Tests pass: `bun run test --filter @beep/iam-client`
8. `_internal/index.ts` exports all transformation schemas
9. Deprecated inline schema files are deleted
10. CLAUDE.md updated to document transformation pattern
