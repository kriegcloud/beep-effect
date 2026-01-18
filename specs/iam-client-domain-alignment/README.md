# IAM Client Domain Schema Alignment

## Overview

This specification tracks the alignment of IAM client contract success schemas with domain entities from `@beep/iam-domain/entities` and `@beep/shared-domain/entities`.

## Problem Statement

Many IAM client contracts define inline schemas that duplicate domain entity definitions instead of using the canonical domain models. This creates:

1. **Schema drift** — Inline schemas may diverge from domain entities over time
2. **Duplicated maintenance** — Changes to domain entities must be mirrored in contracts
3. **Type inconsistency** — UI consumers get different types than domain layer
4. **Missing validation** — Inline schemas lack domain model validations (branded IDs, constraints)

## Solution

Replace inline contract schemas with transformation schemas that map Better Auth responses to domain entities:

```typescript
// Before (inline schema)
export class Session extends S.Class<Session>($I`Session`)({
  id: S.String,
  userId: S.String,
  // ... duplicated fields
}) {}

// After (domain transformation)
export const Success = S.Array(Common.DomainSessionFromBetterAuthSession);
```

## Phases

### Phase 0: Discovery (COMPLETED)

Captured actual Better Auth response shapes and verified field alignment. Key findings:

- **additionalFields ARE returned**: Better Auth returns all fields configured via `additionalFields` in `Options.ts`
- **Member**: All business fields align (core + additionalFields like `status`, `lastActiveAt`, `permissions`)
- **Organization**: All business fields align (core + additionalFields like `type`, `ownerUserId`, `isPersonal`, etc.)
- **Invitation**: Best alignment — all business fields present
- **Audit columns**: Only these need synthetic values (`_rowId`, `version`, `source`, `createdBy`, `updatedBy`)

### Phase 1: Implementation

#### Phase 1A: Create Transformation Schemas

Create missing transformation schemas in `src/_internal/`:
- `member.schemas.ts` — `Member.Model` transformation with embedded user handling
- `invitation.schemas.ts` — `Invitation.Model` transformation
- `organization.schemas.ts` — `Organization.Model` transformation

#### Phase 1B: Update Contracts

Update contracts to use transformation schemas:
- `multi-session/list-sessions/contract.ts`
- `organization/members/list/contract.ts`
- `organization/invitations/list/contract.ts`
- `organization/crud/*.ts`

#### Phase 1C: Cleanup

Remove deprecated inline schemas:
- `src/organization/_common/member.schema.ts`
- `src/organization/_common/invitation.schema.ts`
- `src/organization/_common/organization.schema.ts`
- `src/organization/_common/full-organization.schema.ts`

### Phase 2: Documentation

Update `packages/iam/client/CLAUDE.md` to document transformation schema patterns.

## Prerequisites

Before starting Phase 1B, the following strategies apply:

1. **P1: Audit Column Strategy** — Provide synthetic values (`_rowId: 0`, `source: "better-auth"`, etc.)
2. **P2: Embedded Entity Strategy** — Create client-specific `EmbeddedUser` schema for FullMember

See [handoffs/HANDOFF_P1.md](./handoffs/HANDOFF_P1.md) for detailed strategy decisions.

## Documentation

| Document | Purpose |
|----------|---------|
| [QUICK_START.md](./QUICK_START.md) | 5-minute triage guide |
| [MASTER_ORCHESTRATION.md](./MASTER_ORCHESTRATION.md) | Full phase workflow |
| [REFLECTION_LOG.md](./REFLECTION_LOG.md) | Methodology learnings |
| [RUBRICS.md](./RUBRICS.md) | Quality scoring criteria |

## Handoffs

| Phase | Document | Status |
|-------|----------|--------|
| P0 | [handoffs/HANDOFF_P1.md](./handoffs/HANDOFF_P1.md) (Phase 0 section) | Completed |
| P1 | [handoffs/HANDOFF_P1.md](./handoffs/HANDOFF_P1.md) | Ready |
| P1 | [handoffs/P1_ORCHESTRATOR_PROMPT.md](./handoffs/P1_ORCHESTRATOR_PROMPT.md) | Copy-paste prompt |

## Templates

| Template | Purpose |
|----------|---------|
| [templates/transformation-schema.template.ts](./templates/transformation-schema.template.ts) | Schema implementation template |
| [templates/transformation-test.template.ts](./templates/transformation-test.template.ts) | Test file template |

## Related Packages

- `@beep/iam-domain` — IAM entity definitions (Member, Invitation, TwoFactor)
- `@beep/shared-domain` — Shared entity definitions (Session, User, Organization)
- `@beep/iam-client` — Target package for this alignment work

## Verification

```bash
# After each Phase 1 sub-phase
bun run check --filter @beep/iam-client
bun run lint --filter @beep/iam-client
bun run test --filter @beep/iam-client

# Final verification
bun run check
bun run test
```

## Success Criteria

1. All entity-returning contracts use domain models via transformation schemas
2. No inline schema duplication of domain entities
3. Transformation schemas use `S.Struct({...}, S.Record({ key: S.String, value: S.Unknown }))` pattern
4. Transformation schemas have comprehensive test coverage (≥90% lines)
5. All verification commands pass
6. CLAUDE.md updated to document transformation pattern
