# Phase 3 Handoff: User Features RPC

**Date**: 2026-01-29
**From**: Phase 2 (Core Email RPC)
**To**: Phase 3 (User Features RPC)
**Status**: Ready for implementation

---

## Context for Phase 3

### Working Context (Current Objectives)

**Current Task**: Implement user customization RPC contracts and handlers for templates, notes, shortcuts, and settings.

**Success Criteria**:
- Templates RPC (list, create, delete) operational
- Notes RPC (list, create, update, delete) operational
- Shortcuts RPC (get, save) operational
- Settings RPC (get, save) operational
- All handlers pass type check
- Repositories implemented with proper database queries

**Blocking Issues**: None expected - these are database-focused features with simpler patterns than P2.

**Immediate Dependencies**:
- `@beep/comms-domain` entities (existing)
- `CommsEntityIds` from `@beep/shared-domain`
- `CommsDb` service for database operations
- `Policy.AuthContext` for authenticated RPC middleware

### Episodic Context (Previous Phase Summary)

**Phase 2 Outcome**: Core email RPC contracts and handlers were implemented, establishing:
- RPC contract pattern with `$CommsDomainId.create()` for schema identifiers
- Handler pattern using `Effect.fn()` with `Policy.AuthContext` middleware
- Layer composition for RPC groups using `RpcGroup.make().prefix()`
- Active connection middleware pattern for email driver injection

**Key Decisions Made**:
1. Use `S.Class<T>($I\`Name\`)` pattern for all RPC schemas
2. Handlers use `Effect.fn()` wrapper for automatic span creation
3. Repositories are Context services with `Layer.effect()` implementation
4. All handlers return success schemas, catching errors to domain error types

**Patterns Discovered**:
- RPC groups use `.middleware()` chain for auth and connection context
- Barrel files export both contract namespaces and combined `Rpcs` class
- Handlers destructure session from `Policy.AuthContext` for user scoping

### Semantic Context (Tech Stack Constants)

**Tech Stack**:
- Effect 3, `@effect/rpc`, `effect/Schema`
- Drizzle ORM via `@beep/core-db`
- `@beep/testkit` for testing

**Package Structure**:
```
packages/comms/
  domain/src/rpc/v1/{templates,notes,shortcuts,settings}/
  server/src/repos/{EmailTemplateRepo,NoteRepo,UserSettingsRepo,UserHotkeysRepo}.ts
  server/src/rpc/v1/{templates,notes,shortcuts,settings}/*.handler.ts
```

**Standards**:
- Path aliases: `@beep/comms-domain`, `@beep/shared-domain`
- EntityIds: `CommsEntityIds.{EmailTemplateId, NoteId}`
- Schema imports: `import * as S from "effect/Schema"`

### Procedural Context (Reference Links)

- Effect patterns: `.claude/rules/effect-patterns.md`
- Testing patterns: `.claude/commands/patterns/effect-testing-patterns.md`
- Phase planning: `specs/zero-email-port/phases/P3-user-features-rpc.md`
- RPC examples: `packages/shared/domain/src/rpc/`

---

## Methods to Implement

### Templates Router (P3-1)

| Method | RPC Name | Parameters | Returns |
|--------|----------|------------|---------|
| List templates | `templates_listTemplates` | `{}` | `{ templates: TemplateItem[] }` |
| Create template | `templates_createTemplate` | `{ name, subject?, body?, to?, cc?, bcc? }` | `{ template: TemplateItem }` |
| Delete template | `templates_deleteTemplate` | `{ id }` | `{ success: boolean }` |

### Notes Router (P3-2)

| Method | RPC Name | Parameters | Returns |
|--------|----------|------------|---------|
| List notes | `notes_listNotes` | `{ threadId }` | `{ notes: NoteItem[] }` |
| Create note | `notes_createNote` | `{ threadId, content, color?, isPinned? }` | `{ note: NoteItem }` |
| Update note | `notes_updateNote` | `{ id, content?, color?, isPinned?, order? }` | `{ note: NoteItem }` |
| Delete note | `notes_deleteNote` | `{ id }` | `{ success: boolean }` |

### Shortcuts Router (P3-3)

| Method | RPC Name | Parameters | Returns |
|--------|----------|------------|---------|
| Get shortcuts | `shortcuts_getShortcuts` | `{}` | `{ shortcuts: ShortcutsData }` |
| Save shortcuts | `shortcuts_saveShortcuts` | `{ shortcuts }` | `{ success: boolean }` |

### Settings Router (P3-4)

| Method | RPC Name | Parameters | Returns |
|--------|----------|------------|---------|
| Get settings | `settings_getSettings` | `{}` | `{ settings: SettingsData }` |
| Save settings | `settings_saveSettings` | `{ settings }` | `{ success: boolean }` |

---

## Schema Patterns

### TemplateItem Schema

```typescript
export class TemplateItem extends S.Class<TemplateItem>($I`TemplateItem`)({
  id: CommsEntityIds.EmailTemplateId,
  name: S.String,
  subject: S.NullOr(S.String),
  body: S.NullOr(S.String),
  to: S.optional(S.Array(S.String)),
  cc: S.optional(S.Array(S.String)),
  bcc: S.optional(S.Array(S.String)),
  createdAt: S.Date,
  updatedAt: S.Date,
}) {}
```

### NoteItem Schema

```typescript
export class NoteItem extends S.Class<NoteItem>($I`NoteItem`)({
  id: CommsEntityIds.NoteId,
  threadId: S.String,
  content: S.String,
  color: NoteColor,  // From @beep/comms-domain/entities/note
  isPinned: S.Boolean,
  order: S.Int,
  createdAt: S.Date,
  updatedAt: S.Date,
}) {}
```

---

## Implementation Order

1. **Templates contracts** - Simplest, establishes pattern
2. **Notes contracts** - Similar CRUD with color enum
3. **Shortcuts contracts** - Uses existing `ShortcutsData` schema
4. **Settings contracts** - Uses existing `SettingsData` schema
5. **Repositories** - `EmailTemplateRepo`, `NoteRepo`, `UserSettingsRepo`, `UserHotkeysRepo`
6. **Handlers** - One per RPC method
7. **RPC Groups** - Barrel files and `CommsRpcsLive` extension

---

## Repository Pattern

```typescript
export interface EmailTemplateRepo {
  readonly findByUserId: (
    userId: SharedEntityIds.UserId.Type
  ) => Effect.Effect<ReadonlyArray<Entities.EmailTemplate.Model>>;

  readonly findById: (
    id: CommsEntityIds.EmailTemplateId.Type
  ) => Effect.Effect<Option.Option<Entities.EmailTemplate.Model>>;

  readonly create: (
    data: typeof Entities.EmailTemplate.Model.insert.Type
  ) => Effect.Effect<Entities.EmailTemplate.Model>;

  readonly delete: (
    id: CommsEntityIds.EmailTemplateId.Type
  ) => Effect.Effect<void>;
}

export const EmailTemplateRepo = Context.GenericTag<EmailTemplateRepo>(
  "@beep/comms/EmailTemplateRepo"
);
```

---

## Verification Steps

After implementing each component:

```bash
# Check domain contracts
bun run check --filter @beep/comms-domain

# Check server handlers
bun run check --filter @beep/comms-server

# Run tests
bun run test --filter @beep/comms-server

# Lint
bun run lint --filter @beep/comms-*
```

---

## Known Issues & Gotchas

1. **NoteColor enum**: Import from `@beep/comms-domain/entities/note` - ensure it exists or create it
2. **ShortcutsData/SettingsData**: These schemas should exist in domain entities; verify structure
3. **User scoping**: All queries must filter by `session.userId` from `Policy.AuthContext`
4. **EntityId creation**: Use `CommsEntityIds.{Type}.create()` for new records

---

## Success Criteria

Phase 3 is complete when:

- [ ] `packages/comms/domain/src/rpc/v1/templates/` - 3 contracts + `_rpcs.ts`
- [ ] `packages/comms/domain/src/rpc/v1/notes/` - 4 contracts + `_rpcs.ts`
- [ ] `packages/comms/domain/src/rpc/v1/shortcuts/` - 2 contracts + `_rpcs.ts`
- [ ] `packages/comms/domain/src/rpc/v1/settings/` - 2 contracts + `_rpcs.ts`
- [ ] `packages/comms/server/src/repos/EmailTemplateRepo.ts` - implemented
- [ ] `packages/comms/server/src/repos/NoteRepo.ts` - implemented
- [ ] `packages/comms/server/src/repos/UserSettingsRepo.ts` - implemented
- [ ] `packages/comms/server/src/repos/UserHotkeysRepo.ts` - implemented
- [ ] Handlers for all 11 RPCs implemented
- [ ] `CommsRpcsLive` extended with P3 RPC groups
- [ ] Type check passes: `bun run check --filter @beep/comms-*`
- [ ] Lint passes: `bun run lint --filter @beep/comms-*`
- [ ] `REFLECTION_LOG.md` updated with P3 learnings
- [ ] `HANDOFF_P4.md` created
- [ ] `P4_ORCHESTRATOR_PROMPT.md` created

---

## Agent Recommendations

| Agent | Task |
|-------|------|
| `test-writer` | Create repository and handler tests |
| `doc-writer` | Document RPC contracts in AGENTS.md |
