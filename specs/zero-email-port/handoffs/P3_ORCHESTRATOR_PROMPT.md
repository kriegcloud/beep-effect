# Phase 3 Orchestrator Prompt

Copy-paste this prompt to start Phase 3 implementation.

---

## Pre-Flight Checklist

Before executing this phase, verify Phase 2 context is preserved:

- [ ] P2 RPC contracts exist in `packages/comms/domain/src/rpc/v1/{connections,mail,drafts,labels}/`
- [ ] P2 handlers exist in `packages/comms/server/src/rpc/v1/`
- [ ] `CommsRpcsLive` layer exists with P2 RPC groups
- [ ] `CommsDb` service is configured
- [ ] `REFLECTION_LOG.md` contains Phase 2 learnings

If Phase 2 artifacts are missing, complete P2 before proceeding.

---

## Prompt

You are implementing Phase 3 of the Zero Email Port spec.

### Context

Phase 2 completed core email RPC (connections, mail, drafts, labels). Now we implement user customization features: templates, notes, shortcuts, and settings.

These handlers are simpler than P2 because they primarily interact with the database rather than external email providers.

### Your Mission

Implement RPC contracts and handlers for user customization features.

**Work Items**:
1. Templates RPC contracts (list, create, delete)
2. Notes RPC contracts (list, create, update, delete)
3. Shortcuts RPC contracts (get, save)
4. Settings RPC contracts (get, save)
5. Repository implementations for each feature
6. Handler implementations for each RPC
7. Extend `CommsRpcsLive` with new RPC groups

### Critical Patterns

**RPC Contract Pattern**:
```typescript
import { $CommsDomainId } from "@beep/identity/packages";
import { CommsEntityIds } from "@beep/shared-domain";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $CommsDomainId.create("rpc/templates/list");

export class Payload extends S.Class<Payload>($I`Payload`)({}) {}

export class Success extends S.Class<Success>($I`Success`)({
  templates: S.Array(TemplateItem),
}) {}

export const Contract = Rpc.make("listTemplates", {
  payload: Payload,
  success: Success,
});
```

**Handler Pattern**:
```typescript
import * as Effect from "effect/Effect";
import { Policy } from "@beep/shared-domain";
import { EmailTemplateRepo } from "../../../repos/EmailTemplateRepo";
import { ListTemplates } from "@beep/comms-domain/rpc/v1/templates";

export const Handler = Effect.fn("templates_listTemplates")(
  function* (_payload) {
    const { session } = yield* Policy.AuthContext;
    const repo = yield* EmailTemplateRepo;

    const templates = yield* repo.findByUserId(session.userId);

    return new ListTemplates.Success({
      templates: templates.map((t) => new ListTemplates.TemplateItem({
        id: t.id,
        name: t.name,
        // ... map all fields
      })),
    });
  }
);
```

**Repository Pattern**:
```typescript
export const EmailTemplateRepoLive = Layer.effect(
  EmailTemplateRepo,
  Effect.gen(function* () {
    const db = yield* CommsDb;

    return {
      findByUserId: (userId) => Effect.gen(function* () {
        return yield* db.query(/* Drizzle query */);
      }),
      // ... other methods
    };
  })
);
```

**RPC Group Pattern**:
```typescript
export class Rpcs extends RpcGroup.make(
  ListTemplates.Contract,
  CreateTemplate.Contract,
  DeleteTemplate.Contract
).prefix("templates_") {}
```

### Reference Files

- Phase plan: `specs/zero-email-port/phases/P3-user-features-rpc.md`
- P2 handler example: `packages/comms/server/src/rpc/v1/mail/*.handler.ts`
- P2 contract example: `packages/comms/domain/src/rpc/v1/mail/*.ts`
- Domain entities: `packages/comms/domain/src/entities/`
- Effect patterns: `.claude/rules/effect-patterns.md`

### Implementation Order

1. **Templates** (simplest) - establishes pattern
2. **Notes** - similar CRUD with color enum
3. **Shortcuts** - uses existing ShortcutsData schema
4. **Settings** - uses existing SettingsData schema

For each feature:
1. Create contracts in `domain/src/rpc/v1/{feature}/`
2. Create `_rpcs.ts` barrel file
3. Create repository in `server/src/repos/`
4. Create handlers in `server/src/rpc/v1/{feature}/`
5. Add to `CommsRpcsLive`

### Verification

After each feature implementation:

```bash
bun run check --filter @beep/comms-domain
bun run check --filter @beep/comms-server
bun run lint --filter @beep/comms-*
```

### Success Criteria

- [ ] Templates RPC: 3 contracts + handlers + repository
- [ ] Notes RPC: 4 contracts + handlers + repository
- [ ] Shortcuts RPC: 2 contracts + handlers + repository
- [ ] Settings RPC: 2 contracts + handlers + repository
- [ ] `CommsRpcsLive` extended with 4 new RPC groups
- [ ] Type check passes
- [ ] Lint passes

### Handoff Document

Full context: `specs/zero-email-port/handoffs/HANDOFF_P3.md`

### Next Phase

After completing Phase 3:
1. Update `REFLECTION_LOG.md` with learnings
2. Create `HANDOFF_P4.md` (AI Features RPC context)
3. Create `P4_ORCHESTRATOR_PROMPT.md` (copy-paste prompt)

Phase 4 implements AI-powered features using `@effect/ai` including compose assist, summaries, and Brain auto-labeling.
