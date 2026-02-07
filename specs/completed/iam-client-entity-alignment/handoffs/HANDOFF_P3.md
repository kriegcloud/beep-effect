# Phase 3 Handoff: Contract Success Schemas

---

## Mission
Update all `Success` classes to use the updated `_common/` schemas (which now have branded EntityIds). Create transformation schemas where Better Auth responses need domain mapping.

---

## Working Memory (Current Tasks)

### Task 3.1: Audit Success Classes
Identify all Success classes that reference:
- `Member`, `FullMember` from `_common/member.schema.ts`
- `Organization` from `_common/organization.schema.ts`
- `Invitation` from `_common/invitation.schema.ts`
- Other entity schemas from `_common/`

### Task 3.2: Verify Import Paths
Success classes that import from updated `_common/` schemas should automatically pick up the EntityId changes. Verify imports are correct:
```typescript
import { Member, FullMember } from "../_common/member.schema.ts";
```

### Task 3.3: Create Transformation Schemas (if needed)
If Better Auth returns data that needs validation/transformation to domain entities:

```typescript
export const DomainMemberFromBetterAuthMember = S.transformOrFail(
  BetterAuthMemberSchema,  // Raw Better Auth response
  Member,                   // Updated _common schema with EntityIds
  {
    strict: true,
    decode: Effect.fn(function* (raw, _options, ast) {
      // Validate ID formats
      if (!IamEntityIds.MemberId.is(raw.id)) {
        return yield* ParseResult.fail(
          new ParseResult.Type(ast, raw.id, "Invalid member ID format")
        );
      }
      return raw;  // Pass through if valid
    }),
    encode: (domain) => Effect.succeed(domain),
  }
);
```

### Task 3.4: Update Success Classes
If transformation schemas are created, update Success classes to use them:
```typescript
export class Success extends S.Class<Success>($I`Success`)({
  member: DomainMemberFromBetterAuthMember,  // Use transformation
}) {}
```

---

## Episodic Memory (Previous Phases)

**P0**: Created inventory at `outputs/P0-inventory.md`
**P1**: Updated `_common/` schemas - Member, Organization, Invitation now use EntityIds
**P2**: Updated all Payload classes with EntityIds

Success classes reference `_common/` schemas. Since P1 updated those, many Success classes may already be correct.

---

## Semantic Memory (Project Constants)

### Transformation Schema Pattern
Reference: `packages/iam/client/src/_internal/user.schemas.ts`
- `BetterAuthUserSchema` - raw response shape
- `DomainUserFromBetterAuthUser` - transformation with validation

### When Transformation Is Needed
- Better Auth returns plain string IDs
- Domain expects branded EntityIds
- Need to validate ID format before accepting

### When Transformation Is NOT Needed
- Schema already uses EntityIds and Better Auth response matches
- No validation needed beyond schema decode

---

## Critical Decision: Transformation vs Direct Use

**Direct Use** (simpler):
If the `_common/` schema with EntityIds can decode the Better Auth response directly:
```typescript
export class Success extends S.Class<Success>($I`Success`)({
  member: Member,  // Uses updated Member schema directly
}) {}
```

**Transformation** (safer):
If you need to validate IDs before accepting:
```typescript
export class Success extends S.Class<Success>($I`Success`)({
  member: DomainMemberFromBetterAuthMember,  // Validates ID format
}) {}
```

**Recommendation**: Start with direct use. Add transformation only if type errors occur because Better Auth returns plain strings that don't match branded types.

---

## Procedural Memory (References)

| Document | Purpose |
|----------|---------|
| `outputs/P0-inventory.md` | Success class inventory |
| `packages/iam/client/src/_internal/user.schemas.ts` | Transformation pattern |

---

## Success Criteria

- [x] All Success classes audited
- [x] Transformation schemas created where needed (none required - direct schema use works)
- [x] Type check passes: `bun run check --filter @beep/iam-client`

---

## P3 Completion Notes

**Date**: 2026-01-22

**Key Findings**:
1. No new transformation schemas were required
2. All Success classes using `_common/` and `_internal/` schemas compile correctly
3. EntityIds are branded types where `Encoded` = `string`, so Better Auth's plain string IDs decode correctly
4. Existing transformation schemas in `_internal/` already handle domain model conversions with full ID validation

**Output**: See `outputs/P3-verification.md` for detailed analysis

---

## Verification

```bash
# Type check
bun run check --filter @beep/iam-client

# Find Success classes
grep -r "class Success" packages/iam/client/src/ -l | head -20
```

---

## Next Phase
After P3 completion, proceed to P4 (Verification) using:
`specs/iam-client-entity-alignment/handoffs/P4_ORCHESTRATOR_PROMPT.md`
