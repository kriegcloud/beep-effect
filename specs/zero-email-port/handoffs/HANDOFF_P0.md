# Phase 0 Handoff: Foundation

**Date**: 2025-01-29
**From**: Initial spec creation
**To**: Phase 0 (Foundation)
**Status**: Ready for implementation

---

## Context for Phase 0

### Working Context (Critical - Read First)

**Current Task**: Establish EntityIds, domain models, tables, and error types for the comms slice.

**Success Criteria**:
- All EntityIds have proper prefix format (`comms_*`)
- Domain models use `M.Class` with `makeFields` pattern
- Tables use `Table.make()` or `OrgTable.make()` factories
- Error types extend `S.TaggedError`
- All packages pass type check

**Blocking Issues**: None (foundation phase)

**Immediate Dependencies**:
- `@beep/shared-domain` - for EntityId factories
- `@beep/comms-domain` - existing package to extend
- `@beep/tables` - for table factories

### Episodic Context (Previous Phase Summary)

This is the initial phase. Key findings from spec research:

1. **Existing Infrastructure**: `@beep/comms-domain` already has `EmailTemplateId` and some value objects
2. **Pattern Source**: Use `@beep/iam-domain` and `@beep/shared-domain` as reference implementations
3. **Zero Source**: `tmp/Zero` contains tRPC routers to port (~70 procedures)

### Semantic Context (Tech Stack)

- **Domain Models**: `M.Class` from `@effect/sql/Model` with `makeFields` from `@beep/shared-domain/common`
- **EntityIds**: `EntityId.make("prefix")` from `@beep/schema`
- **Tables**: `Table.make()` / `OrgTable.make()` from `@beep/tables`
- **Errors**: `S.TaggedError` from `effect/Schema`

### Procedural Context (Reference Links)

- Effect patterns: `.claude/rules/effect-patterns.md`
- Database patterns: `documentation/patterns/database-patterns.md`
- Existing IAM domain: `packages/iam/domain/src/entities/`

---

## Source Verification (MANDATORY)

**Note**: This is a foundation phase creating new types. No external API verification needed. Schema shapes are derived from Zero's Drizzle tables.

| Table (Zero Source) | Effect Model Target | Verified |
|---------------------|---------------------|----------|
| `mail0_connection` | `Connection.Model` | Y |
| `mail0_summary` | `ThreadSummary.Model` | Y |
| `mail0_note` | `Note.Model` | Y |
| `mail0_user_settings` | `UserSettings.Model` | Y |
| `mail0_user_hotkeys` | `UserHotkeys.Model` | Y |

---

## Deliverables

### 1. EntityIds

**File**: `packages/shared/domain/src/entity-ids/comms/ids.ts`

| EntityId | Prefix | Purpose |
|----------|--------|---------|
| `ConnectionId` | `comms_connection__` | OAuth connection to email provider |
| `ThreadSummaryId` | `comms_thread_summary__` | AI-generated thread summary |
| `NoteId` | `comms_note__` | User annotation on thread |
| `UserSettingsId` | `comms_user_settings__` | User email preferences |
| `UserHotkeysId` | `comms_user_hotkeys__` | User keyboard shortcuts |
| `EmailTemplateId` | `comms_email_template__` | (EXISTS - verify) |

### 2. Domain Models

| Model | Location | Pattern |
|-------|----------|---------|
| `Connection` | `packages/comms/domain/src/entities/connection/` | `M.Class` + `makeFields` |
| `ThreadSummary` | `packages/comms/domain/src/entities/thread-summary/` | `M.Class` + `makeFields` |
| `Note` | `packages/comms/domain/src/entities/note/` | `M.Class` + `makeFields` |
| `UserSettings` | `packages/comms/domain/src/entities/user-settings/` | `M.Class` + `makeFields` |
| `UserHotkeys` | `packages/comms/domain/src/entities/user-hotkeys/` | `M.Class` + `makeFields` |

### 3. Tables Package

**Package**: `@beep/comms-tables`

**Directory**: `packages/comms/tables/`

Tables to create:
- `connection.table.ts` - OAuth connections
- `thread-summary.table.ts` - AI summaries
- `note.table.ts` - Thread annotations
- `user-settings.table.ts` - Preferences
- `user-hotkeys.table.ts` - Keyboard shortcuts
- `email-template.table.ts` - Templates (may exist)

### 4. Error Types

**File**: `packages/comms/domain/src/errors/index.ts`

| Error | Tag | Purpose |
|-------|-----|---------|
| `MailError` | `MailError` | Base mail operation failure |
| `ConnectionNotFoundError` | `ConnectionNotFoundError` | Connection lookup failed |
| `ConnectionExpiredError` | `ConnectionExpiredError` | OAuth token expired |
| `ProviderApiError` | `ProviderApiError` | Gmail/Outlook API failure |
| `ThreadNotFoundError` | `ThreadNotFoundError` | Thread lookup failed |
| `DraftNotFoundError` | `DraftNotFoundError` | Draft lookup failed |
| `LabelOperationError` | `LabelOperationError` | Label CRUD failure |
| `SendEmailError` | `SendEmailError` | Email send failure |
| `AiServiceError` | `AiServiceError` | AI operation failure |

---

## Implementation Order

1. **EntityIds** (Task 0.1-0.2) - Foundation for all types
2. **Domain Models** (Tasks 0.3-0.7) - Depends on EntityIds
3. **Error Types** (Task 0.8) - Parallel with models
4. **Update Exports** (Task 0.9) - After models complete
5. **Tables Package** (Task 0.10) - Depends on EntityIds and models

---

## Critical Patterns

### EntityId Creation

```typescript
import { EntityId } from "@beep/schema";

export const ConnectionId = EntityId.make("comms_connection", {
  brand: "ConnectionId",
  actions: ["create", "read", "update", "delete", "*"],
});
```

### Domain Model with makeFields

```typescript
import { $CommsDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { CommsEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $CommsDomainId.create("entities/connection");

export class Model extends M.Class<Model>($I`ConnectionModel`)(
  makeFields(CommsEntityIds.ConnectionId, {
    userId: SharedEntityIds.UserId,
    email: BS.Email,
    // ... fields
  }),
  $I.annotations("ConnectionModel", {
    description: "OAuth connection to email provider",
  })
) {
  static readonly utils = modelKit(Model);
}
```

### Tagged Error

```typescript
export class ConnectionNotFoundError extends S.TaggedError<ConnectionNotFoundError>()(
  "ConnectionNotFoundError",
  {
    connectionId: S.String,
  }
) {}
```

### Table Definition

```typescript
import { Table } from "@beep/tables";
import { CommsEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as pg from "drizzle-orm/pg-core";

export const connectionTable = Table.make(CommsEntityIds.ConnectionId)({
  userId: pg.text("user_id").notNull()
    .$type<SharedEntityIds.UserId.Type>(),
  // ... columns
}, (t) => ({
  userIdIdx: pg.index("connection_user_id_idx").on(t.userId),
}));
```

---

## Verification Steps

After implementing each component:

```bash
# Check EntityIds
bun run check --filter @beep/shared-domain

# Check domain models
bun run check --filter @beep/comms-domain

# Check tables (after package creation)
bun run check --filter @beep/comms-tables

# Lint
bun run lint --filter @beep/comms-*
```

---

## Known Issues & Gotchas

1. **Sensitive Fields**: Use `BS.FieldSensitiveOptionOmittable` for OAuth tokens to suppress logging
2. **EntityId Types**: Add `.$type<EntityId.Type>()` to ALL foreign key columns
3. **Package Setup**: New `@beep/comms-tables` needs `package.json`, tsconfig files
4. **Existing EmailTemplateId**: Verify format matches new convention before reusing

---

## Success Criteria

Phase 0 is complete when:
- [ ] All 5 new EntityIds created and exported from `CommsEntityIds`
- [ ] All 5 domain models created with proper `M.Class` pattern
- [ ] All 9 error types created extending `S.TaggedError`
- [ ] `@beep/comms-tables` package created with all tables
- [ ] Domain exports updated to include new entities/errors
- [ ] `bun run check --filter @beep/comms-*` passes
- [ ] `bun run check --filter @beep/shared-domain` passes
- [ ] `REFLECTION_LOG.md` updated with Phase 0 learnings
- [ ] `HANDOFF_P1.md` created for Phase 1

---

## Agent Recommendations

| Agent | Task |
|-------|------|
| `codebase-researcher` | Research existing patterns in `@beep/iam-domain` |
| `doc-writer` | Create CLAUDE.md for `@beep/comms-tables` |
| `architecture-pattern-enforcer` | Validate layer dependencies |

---

## Next Phase

After Phase 0 completes, proceed to Phase 1 (Email Drivers) using `P1_ORCHESTRATOR_PROMPT.md`.
