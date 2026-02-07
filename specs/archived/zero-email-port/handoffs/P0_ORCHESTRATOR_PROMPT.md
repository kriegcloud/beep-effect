# Phase 0 Orchestrator Prompt

Copy-paste this prompt to start Phase 0 execution.

---

## Pre-Flight Checklist

Before executing this phase, verify:
- [ ] `specs/zero-email-port/README.md` exists (spec entry point)
- [ ] `specs/zero-email-port/MAPPING.md` exists (tRPC to Effect mapping)
- [ ] `packages/comms/domain/` directory exists (package to extend)
- [ ] `packages/shared/domain/src/entity-ids/comms/` directory exists

If any items are missing, request clarification before proceeding.

---

## Prompt

You are implementing Phase 0 (Foundation) of the Zero Email Port spec.

### Context

This phase establishes the foundational types for porting Zero email client features to beep-effect. The existing `@beep/comms-domain` package has partial scaffolding (EmailTemplateId, some value objects) that needs extension.

**Key Insight**: Use `@beep/iam-domain` as the pattern reference for domain model structure.

### Your Mission

Create the type infrastructure for email functionality:
1. **EntityIds** in `@beep/shared-domain` (5 new IDs)
2. **Domain models** in `@beep/comms-domain` (5 entities)
3. **Error types** in `@beep/comms-domain` (9 error classes)
4. **Tables package** `@beep/comms-tables` (new package, 5 tables)

### Critical Patterns

**EntityId Pattern**:
```typescript
import { EntityId } from "@beep/schema";

export const ConnectionId = EntityId.make("comms_connection", {
  brand: "ConnectionId",
  actions: ["create", "read", "update", "delete", "*"],
});
```

**Domain Model Pattern**:
```typescript
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";

export class Model extends M.Class<Model>($I`ConnectionModel`)(
  makeFields(CommsEntityIds.ConnectionId, {
    userId: SharedEntityIds.UserId,
    email: BS.Email,
    accessToken: BS.FieldSensitiveOptionOmittable(S.String), // SENSITIVE!
  }),
  $I.annotations("ConnectionModel", {...})
) {
  static readonly utils = modelKit(Model);
}
```

**Table Column with EntityId Type**:
```typescript
userId: pg.text("user_id").notNull()
  .$type<SharedEntityIds.UserId.Type>(), // CRITICAL for type-safe joins
```

**Tagged Error Pattern**:
```typescript
export class ConnectionNotFoundError extends S.TaggedError<ConnectionNotFoundError>()(
  "ConnectionNotFoundError",
  { connectionId: S.String }
) {}
```

### Reference Files

- Pattern: `packages/iam/domain/src/entities/` - Domain model structure
- Pattern: `packages/shared/domain/src/entity-ids/` - EntityId definitions
- Pattern: `packages/iam/tables/` - Table package structure
- Extend: `packages/comms/domain/src/value-objects/mail.value.ts` - Existing value objects

### Implementation Order

1. EntityIds first (all other types depend on these)
2. Domain models (depend on EntityIds)
3. Error types (parallel with models)
4. Domain exports (after models complete)
5. Tables package (last - depends on EntityIds)

### Verification

After each major step:

```bash
# EntityIds
bun run check --filter @beep/shared-domain

# Domain models
bun run check --filter @beep/comms-domain

# Tables (after creation)
bun run check --filter @beep/comms-tables
```

### Success Criteria

- [ ] 5 EntityIds created: `ConnectionId`, `ThreadSummaryId`, `NoteId`, `UserSettingsId`, `UserHotkeysId`
- [ ] 5 domain models created with `M.Class` + `makeFields` pattern
- [ ] 9 error types created: `MailError`, `ConnectionNotFoundError`, `ConnectionExpiredError`, `ProviderApiError`, `ThreadNotFoundError`, `DraftNotFoundError`, `LabelOperationError`, `SendEmailError`, `AiServiceError`
- [ ] `@beep/comms-tables` package created with 5 tables
- [ ] All type checks pass
- [ ] REFLECTION_LOG.md updated

### Handoff Document

Full context: `specs/zero-email-port/handoffs/HANDOFF_P0.md`

### Next Steps

After completing Phase 0:
1. Update `REFLECTION_LOG.md` with learnings
2. Verify `HANDOFF_P1.md` exists (context for email drivers)
3. Use `P1_ORCHESTRATOR_PROMPT.md` to start Phase 1
