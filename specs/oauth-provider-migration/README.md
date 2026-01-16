# OAuth Provider Migration Spec

> Implementation of the new `oauthProvider` plugin tables and domain models for better-auth.

---

## Quick Links

| Document | Purpose |
|----------|---------|
| [QUICK_START.md](./QUICK_START.md) | 5-minute overview for fast triage |
| [MASTER_ORCHESTRATION.md](./MASTER_ORCHESTRATION.md) | Full phase-by-phase details |
| [REFLECTION_LOG.md](./REFLECTION_LOG.md) | Learnings from execution |
| [handoffs/](./handoffs/) | Phase handoff documents |

---

## Purpose

The `oidcProvider` plugin from better-auth has been deprecated. This spec implements the replacement `oauthProvider` from `@better-auth/oauth-provider`.

### Scope
- **4 Entity IDs**: OAuthClientId, OAuthAccessTokenId, OAuthRefreshTokenId, OAuthConsentId
- **4 Domain Models**: With M.Class and makeFields
- **4 Database Tables**: Using Table.make
- **Relations + Type Checks**: Drizzle relations and domain/table alignment

### Source Schema
Reference schema in `scratchpad/auth.schema.ts`

---

## Phase Overview

| Phase | Focus | Package | Handoff |
|-------|-------|---------|---------|
| 1 | Entity IDs | `@beep/shared-domain` | [P1](./handoffs/P1_ORCHESTRATOR_PROMPT.md) |
| 2 | Domain Models | `@beep/iam-domain` | [P2](./handoffs/P2_ORCHESTRATOR_PROMPT.md) |
| 3 | Tables | `@beep/iam-tables` | [P3](./handoffs/P3_ORCHESTRATOR_PROMPT.md) |
| 4 | Relations | `@beep/iam-tables` | [P4](./handoffs/P4_ORCHESTRATOR_PROMPT.md) |
| 5 | Type Checks | `@beep/iam-tables` | [P5](./handoffs/P5_ORCHESTRATOR_PROMPT.md) |
| 6 | Admin DB | `@beep/db-admin` | [P6](./handoffs/P6_ORCHESTRATOR_PROMPT.md) |
| 7 | Migration | All | [P7](./handoffs/P7_ORCHESTRATOR_PROMPT.md) |

**Execute sequentially**: Each phase depends on previous phases.

---

## Key Patterns

### Effect Imports (Required)
```typescript
import * as S from "effect/Schema";
import * as M from "@effect/sql/Model";
```

### Domain Model Pattern
```typescript
export class Model extends M.Class<Model>($I`OAuthClientModel`)(
  makeFields(IamEntityIds.OAuthClientId, { /* fields */ }),
  $I.annotations("OAuthClientModel", { /* metadata */ })
) {
  static readonly utils = modelKit(Model);
}
```

### Table Pattern
```typescript
export const oauthClient = Table.make(IamEntityIds.OAuthClientId)(
  { /* columns */ },
  (t) => [/* indexes */]
);
```

### Critical: Foreign Key Design
OAuth tokens reference `oauthClient.clientId` (public identifier), **not** `oauthClient.id` (internal key).

---

## Success Criteria

### Per Phase
- [ ] Phase 1: `bun run check --filter @beep/shared-domain` passes
- [ ] Phase 2: `bun run check --filter @beep/iam-domain` passes
- [ ] Phase 3-5: `bun run check --filter @beep/iam-tables` passes
- [ ] Phase 6: `bun run check --filter @beep/db-admin` passes
- [ ] Phase 7: `bun run db:generate && bun run db:migrate` succeeds

### Final Verification
```bash
bun run build
bun run lint
bun run test --filter @beep/iam-domain @beep/iam-tables
```

---

## Getting Started

1. **Read** [QUICK_START.md](./QUICK_START.md) for fast overview
2. **Follow** [MASTER_ORCHESTRATION.md](./MASTER_ORCHESTRATION.md) for detailed steps
3. **Execute** handoff prompts sequentially
4. **Log** learnings to [REFLECTION_LOG.md](./REFLECTION_LOG.md)

---

## Related Specs

| Spec | Purpose |
|------|---------|
| [oidc-provider-deprecation](../oidc-provider-deprecation/) | Removal of deprecated OIDC code |

---

## Reference Files

| File | Purpose |
|------|---------|
| `scratchpad/auth.schema.ts` | Source schema from better-auth |
| `packages/iam/domain/CLAUDE.md` | Domain entity authoring guide |
| `documentation/EFFECT_PATTERNS.md` | Effect patterns reference |
