# Quick Start

5-minute triage guide for the IAM Client Domain Schema Alignment spec.

---

## Current Status

| Phase | Status | Next Action |
|-------|--------|-------------|
| 0: Discovery | COMPLETED | N/A |
| 1A: Create Transformation Schemas | READY | Start here |
| 1B: Update Contracts | BLOCKED | Wait for 1A |
| 1C: Cleanup | BLOCKED | Wait for 1B |
| 2: Documentation | BLOCKED | Wait for 1C |

---

## 5-Minute Triage

### 1. Verify Phase 0 Completion

Check that `additionalFields` are configured in Options.ts:

```bash
grep -A 20 "additionalFields" packages/iam/server/src/adapters/better-auth/Options.ts | head -30
```

### 2. Review Reference Pattern

Read the canonical transformation pattern:

```bash
head -50 packages/iam/client/src/_internal/session.schemas.ts
```

Key elements:
- `S.Struct + S.Record` extension for unknown plugin fields
- `S.transformOrFail` with decode/encode functions
- ID validation using `EntityId.is()` branded type guard
- `toDate()` helper for Date → DateTime conversion

### 3. Start Implementation

Begin with `member.schemas.ts` (reference implementation):

```bash
# Create the file
touch packages/iam/client/src/_internal/member.schemas.ts
```

---

## Copy-Paste Orchestrator

For full implementation prompt, see:

```
specs/iam-client-domain-alignment/handoffs/P1_ORCHESTRATOR_PROMPT.md
```

---

## Verification Checkpoint

After Phase 1A, verify:

```bash
bun run check --filter @beep/iam-client
bun run test --filter @beep/iam-client
```

---

## Key Files

| Purpose | Location |
|---------|----------|
| Reference pattern | `packages/iam/client/src/_internal/session.schemas.ts` |
| Member domain model | `packages/iam/domain/src/entities/Member/Member.model.ts` |
| Invitation domain model | `packages/iam/domain/src/entities/Invitation/Invitation.model.ts` |
| Organization domain model | `packages/shared/domain/src/entities/Organization/Organization.model.ts` |
| Better Auth config | `packages/iam/server/src/adapters/better-auth/Options.ts` |

---

## Common Pitfalls

1. **Forgetting S.Record extension** - Causes unknown plugin fields to be rejected
2. **Direct role assignment** - Must decode to `MemberRole` branded type
3. **Using domain defaults for status** - Preserve Better Auth's "active" default
4. **Transforming embedded user to User.Model** - Use client-specific 4-field schema

---

## Navigation

| Document | Purpose |
|----------|---------|
| [README.md](./README.md) | Overview and success criteria |
| [MASTER_ORCHESTRATION.md](./MASTER_ORCHESTRATION.md) | Full phase workflow |
| [REFLECTION_LOG.md](./REFLECTION_LOG.md) | Methodology learnings |
| [RUBRICS.md](./RUBRICS.md) | Quality scoring criteria |
| [handoffs/HANDOFF_P1.md](./handoffs/HANDOFF_P1.md) | Detailed implementation guide |
| [handoffs/P1_ORCHESTRATOR_PROMPT.md](./handoffs/P1_ORCHESTRATOR_PROMPT.md) | Copy-paste prompt |
