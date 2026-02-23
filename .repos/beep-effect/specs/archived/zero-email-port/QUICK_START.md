# Quick Start: Zero Email Port

> 5-minute triage document for quick onboarding.

---

## 30-Second Summary

**What**: Port Zero email client (tmp/Zero) from tRPC to @effect/rpc within the beep-effect comms slice.

**Problem**: Zero has 16 tRPC routers with Zod schemas, imperative Promise chains, and raw Drizzle ORM. This port converts everything to Effect patterns:
- tRPC -> @effect/rpc contracts and handlers
- Zod -> effect/Schema
- Drizzle ORM -> @effect/sql/Model + beep-effect table patterns
- Promise chains -> Effect.gen

**Scope**: Gmail/Outlook OAuth, email CRUD, drafts, labels, AI features (compose assist, auto-labeling, summaries), templates, notes, settings.

---

## Current Status

### Quick Check Commands

```bash
# What's implemented?
ls packages/comms/*/src/

# Type check
bun run check --filter @beep/comms-domain
bun run check --filter @beep/comms-tables
bun run check --filter @beep/comms-server

# Full comms slice check
bun run check --filter @beep/comms-*

# Test
bun run test --filter @beep/comms-*
```

### Current Implementation State

| Package | Status | Contents |
|---------|--------|----------|
| `@beep/comms-domain` | Partial | EmailTemplate entity, MailValues, LoggingValues |
| `@beep/comms-tables` | Scaffolded | email-template.table.ts only |
| `@beep/comms-server` | Minimal | Db service, placeholder repo |
| `@beep/comms-client` | Empty | Index only |
| `@beep/comms-ui` | Empty | Index only |

---

## Phase Identification

Determine your current phase by checking what exists:

### P0: Foundation (EntityIds + Domain Models)
```bash
# Check if CommsEntityIds exist beyond EmailTemplateId
grep -r "ConnectionId\|ThreadSummaryId\|NoteId" packages/shared/domain/src/

# Check if error types exist
ls packages/comms/domain/src/errors/

# Check if domain models exist
ls packages/comms/domain/src/entities/
```
**Signs you're in P0**: Only EmailTemplate entity exists, no ConnectionId/NoteId EntityIds, no error types.

### P1: Email Drivers
```bash
# Check for driver services
ls packages/comms/server/src/services/mail/

# Check for OAuth token management
grep -r "GmailDriver\|OutlookDriver" packages/comms/
```
**Signs you're in P1**: EntityIds exist but no driver services.

### P2: Core Email RPC
```bash
# Check for mail/drafts/labels/connections handlers
ls packages/comms/server/src/rpc/

# Check for RPC contracts in domain
ls packages/comms/domain/src/rpc/v1/
```
**Signs you're in P2**: Drivers exist but no RPC handlers.

### P3: User Features RPC
```bash
# Check for templates/notes/shortcuts/settings handlers
grep -r "template\|note\|shortcut\|setting" packages/comms/server/src/rpc/
```
**Signs you're in P3**: Core RPC handlers exist (mail, drafts, labels, connections).

### P4: AI Features RPC
```bash
# Check for AI service integration
grep -r "ComposeAssist\|Brain\|Summary" packages/comms/
```
**Signs you're in P4**: User feature handlers exist, no AI integration.

### P5: UI Components
```bash
# Check for React components
ls packages/comms/ui/src/components/
```
**Signs you're in P5**: All RPC handlers exist, no UI components.

---

## Common Failure Modes

### Type Errors in Cascade

**Symptom**: `bun run check --filter @beep/comms-tables` fails with errors in `@beep/comms-domain`.

**Cause**: Turborepo's `--filter` cascades through ALL dependencies.

**Fix**: Check upstream packages first:
```bash
# Isolate error source
bun run check --filter @beep/comms-domain  # Check this FIRST
bun run check --filter @beep/comms-tables  # Then this
```

### Missing EntityId Types

**Symptom**: `Type 'string' is not assignable to type 'ConnectionId'`

**Cause**: EntityId not defined in `@beep/shared-domain`.

**Fix**:
```bash
# 1. Add EntityId to shared-domain
# packages/shared/domain/src/entity-ids/comms/ids.ts

# 2. Rebuild shared-domain
bun run check --filter @beep/shared-domain
```

### RPC Contract/Handler Mismatch

**Symptom**: Handler doesn't satisfy contract type, payload/success schema mismatch.

**Cause**: Contract in domain and handler in server have different schemas.

**Fix**: Verify schemas match exactly:
```typescript
// Domain contract (source of truth)
export class Payload extends S.Class<Payload>($I`Payload`)({
  connectionId: CommsEntityIds.ConnectionId,
  // ...
}) {}

// Handler MUST use exact same schema
const handler = makeHandler(Contract, (payload) =>
  // payload type matches Payload class
);
```

### Layer Composition Errors

**Symptom**: `Service not found: MailDriver`, missing context error.

**Cause**: Layer not provided in dependency chain.

**Fix**: Trace the layer graph:
```
CommsRpcs <- needs MailService <- needs GmailDriver + CommsDb
```

Ensure all layers are composed:
```typescript
const CommsRpcsLive = Layer.provide(
  CommsRpcs,
  Layer.mergeAll(
    MailServiceLive,
    CommsDbLive,
    // ... all dependencies
  )
);
```

### Schema Validation Failures

**Symptom**: `ParseError: expected X, got Y`

**Cause**: External API returns data not matching Effect Schema.

**Fix**: Add transformation schema for external APIs:
```typescript
export const DomainFromExternal = S.transformOrFail(
  ExternalApiSchema,
  DomainModel,
  {
    decode: (external) => Effect.gen(function* () {
      // Transform and validate
    }),
  }
);
```

---

## Emergency Rollback Commands

### Discard All Comms Changes
```bash
git checkout -- packages/comms/
```

### Stash Work in Progress
```bash
git stash push -m "comms-wip" -- packages/comms/
# Later: git stash pop
```

### Reset to Last Working State
```bash
# Find last working commit
git log --oneline packages/comms/ | head -5

# Reset specific files
git checkout <commit-hash> -- packages/comms/domain/
```

### Restore Single File
```bash
git checkout HEAD -- packages/comms/domain/src/entities/index.ts
```

---

## Key Files to Check First

### Domain Layer
| File | Purpose |
|------|---------|
| `packages/comms/domain/src/entities/index.ts` | Entity exports |
| `packages/comms/domain/src/index.ts` | Package exports |
| `packages/comms/domain/src/errors/index.ts` | Error types (if exists) |
| `packages/comms/domain/src/value-objects/mail.value.ts` | Mail value objects |

### Tables Layer
| File | Purpose |
|------|---------|
| `packages/comms/tables/src/tables/index.ts` | Table exports |
| `packages/comms/tables/src/schema.ts` | Full schema object |

### Server Layer
| File | Purpose |
|------|---------|
| `packages/comms/server/src/db/Db/Db.ts` | Database service |
| `packages/comms/server/src/rpc/` | RPC handlers (when implemented) |
| `packages/comms/server/src/services/mail/` | Email drivers (when implemented) |

### Shared Domain (EntityIds)
| File | Purpose |
|------|---------|
| `packages/shared/domain/src/entity-ids/comms/ids.ts` | CommsEntityIds |
| `packages/shared/domain/src/entity-ids/comms/table-name.ts` | Table name literals |

---

## Contact Points

### Help Resources

| Resource | Location | Purpose |
|----------|----------|---------|
| Reflection Log | `specs/zero-email-port/REFLECTION_LOG.md` | Accumulated learnings |
| Phase Docs | `specs/zero-email-port/phases/` | Detailed task breakdown |
| Mapping Doc | `specs/zero-email-port/MAPPING.md` | tRPC to Effect translation |
| Effect Patterns | `.claude/rules/effect-patterns.md` | Code standards |
| DB Patterns | `documentation/patterns/database-patterns.md` | Table creation |

### Handoff Documents

After completing work, create:
```
specs/zero-email-port/handoffs/HANDOFF_P{N}.md
```

Include:
- What was completed
- What's blocked
- Next steps
- Known issues

### Existing Slice Examples

Study these for patterns:
- `packages/iam/` - Mature slice with all layers
- `packages/documents/` - Similar domain complexity
- `packages/knowledge/` - EntityId patterns

---

## Quick Phase Checklist

### Before Starting Any Phase

1. [ ] Run `bun run check --filter @beep/comms-*` to assess current state
2. [ ] Read the phase doc: `specs/zero-email-port/phases/P{N}-*.md`
3. [ ] Check REFLECTION_LOG.md for accumulated learnings
4. [ ] Look for existing handoffs in `specs/zero-email-port/handoffs/`

### After Completing Any Phase

1. [ ] Verify: `bun run check --filter @beep/comms-*`
2. [ ] Lint: `bun run lint --filter @beep/comms-*`
3. [ ] Test: `bun run test --filter @beep/comms-*`
4. [ ] Update REFLECTION_LOG.md with learnings
5. [ ] Create handoff document if switching sessions
