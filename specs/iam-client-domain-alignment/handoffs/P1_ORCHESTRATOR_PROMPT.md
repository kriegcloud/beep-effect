# Phase 1 Orchestrator Prompt

Copy-paste this prompt to start Phase 1 implementation.

---

## Prompt

You are implementing Phase 1 of the IAM Client Domain Schema Alignment spec.

### Context

Phase 0 (Discovery) is complete. Key findings:
- Better Auth returns ALL `additionalFields` configured in `Options.ts`
- All domain model fields align with Better Auth responses
- Embedded user in FullMember has only 4 fields (display-only, not transformable to User.Model)
- Reference pattern: `packages/iam/client/src/_internal/session.schemas.ts` (lines 20-38)

### Your Mission

Implement Phase 1A: Create transformation schemas in `packages/iam/client/src/_internal/`:

1. **`member.schemas.ts`**
   - `BetterAuthMemberSchema` (capture BA response shape with S.Struct + S.Record)
   - `BetterAuthEmbeddedUserSchema` (minimal 4-field user for display)
   - `BetterAuthFullMemberSchema` (member with embedded user)
   - `DomainMemberFromBetterAuthMember` (S.transformOrFail to Member.Model)
   - `FullMemberSuccess` (S.Class combining member + embedded user)

2. **`invitation.schemas.ts`**
   - `BetterAuthInvitationSchema`
   - `DomainInvitationFromBetterAuthInvitation`

3. **`organization.schemas.ts`**
   - `BetterAuthOrganizationSchema`
   - `DomainOrganizationFromBetterAuthOrganization`

### Critical Patterns

**S.Struct + S.Record Extension**:
```typescript
S.Struct(
  { /* known fields */ },
  S.Record({ key: S.String, value: S.Unknown })
)
```

**Role Field - MUST validate**:
```typescript
// BetterAuthMemberSchema uses S.String, but Member.Model expects MemberRole
role: yield* S.decode(MemberRole)(ba.role),
```

**Status Field - Preserve BA value**:
```typescript
status: ba.status,  // Required field, always present if additionalFields configured
```

**ID Validation**:
```typescript
const isValidMemberId = IamEntityIds.MemberId.is(ba.id);
if (!isValidMemberId) {
  return yield* ParseResult.fail(
    new ParseResult.Type(ast, ba, `Invalid member ID format: expected "iam_member__<uuid>", got "${ba.id}"`)
  );
}
```

### Reference Files

- Pattern: `packages/iam/client/src/_internal/session.schemas.ts`
- Domain: `packages/iam/domain/src/entities/Member/Member.model.ts`
- Domain: `packages/iam/domain/src/entities/Invitation/Invitation.model.ts`
- Shared: `packages/shared/domain/src/entities/Organization/Organization.model.ts`
- Options: `packages/iam/server/src/adapters/better-auth/Options.ts`

### Verification

After each schema file:
```bash
bun run check --filter @beep/iam-client
bun run test --filter @beep/iam-client
```

### Success Criteria

- [ ] All transformation schemas created
- [ ] `_internal/index.ts` exports all new schemas
- [ ] Type check passes
- [ ] Tests pass with ≥90% coverage

### Handoff Document

Read full context in: `specs/iam-client-domain-alignment/handoffs/HANDOFF_P1.md`
