# Phase 1 Orchestrator Prompt

Copy-paste this prompt to start Phase 1 implementation.

---

## Prompt

You are implementing Phase 1 of the knowledge-workflow-durability spec: @effect/workflow integration and workflow persistence tables.

### Context

This is Phase 3 from the knowledge-ontology-comparison roadmap. The current ExtractionPipeline runs as a single Effect with no durability - if it fails mid-extraction, all progress is lost.

Phase 1 establishes the foundation:
- @effect/workflow runtime integration
- PostgreSQL persistence tables (workflow-execution, workflow-activity, workflow-signal)
- WorkflowService abstraction

### Your Mission

Implement the following in order:

**Part A: EntityIds (prerequisite)**
1. Add WorkflowExecutionId, WorkflowActivityId, WorkflowSignalId to `packages/knowledge/domain/src/entities/EntityIds.ts`

**Part B: Workflow Persistence Tables**
2. Create `packages/knowledge/tables/src/tables/workflow-execution.table.ts`
3. Create `packages/knowledge/tables/src/tables/workflow-activity.table.ts`
4. Create `packages/knowledge/tables/src/tables/workflow-signal.table.ts`
5. Update `packages/knowledge/tables/src/tables/index.ts` to export new tables

**Part C: Workflow Service Layer**
6. Create `packages/knowledge/server/src/Workflow/WorkflowPersistence.ts`
7. Create `packages/knowledge/server/src/Workflow/WorkflowService.ts`
8. Create `packages/knowledge/server/src/Workflow/index.ts`

### Critical Patterns

**Table Schema Pattern**:
```typescript
import { KnowledgeEntityIds } from "@beep/knowledge-domain";
import { SharedEntityIds } from "@beep/shared-domain";
import { Table } from "@beep/table-prelude";
import * as pg from "drizzle-orm/pg-core";

export const workflowExecutionTable = Table.make(KnowledgeEntityIds.WorkflowExecutionId)({
  organizationId: pg.text("organization_id").notNull()
    .$type<SharedEntityIds.OrganizationId.Type>(),
  // ... rest of schema
});
```

**Service Pattern**:
```typescript
import * as Effect from "effect/Effect";

export class WorkflowService extends Effect.Service<WorkflowService>()(
  "@beep/knowledge-server/WorkflowService",
  {
    accessors: true,
    effect: Effect.gen(function* () {
      const persistence = yield* WorkflowPersistence;
      return {
        start: (workflowType, input) => Effect.gen(function* () {
          // implementation
        }).pipe(Effect.withSpan("WorkflowService.start", { captureStackTrace: false })),
      };
    }),
  }
) {}
```

### Reference Files

**Table patterns**: `documentation/patterns/database-patterns.md`
**Effect patterns**: `.claude/rules/effect-patterns.md`
**Existing tables**: `packages/knowledge/tables/src/tables/*.table.ts`
**Existing services**: `packages/knowledge/server/src/services/*.ts`

### Verification

After each file:
```bash
bun run check --filter @beep/knowledge-domain
bun run check --filter @beep/knowledge-tables
bun run check --filter @beep/knowledge-server
```

After all files:
```bash
bun run db:generate
```

### Success Criteria

- [ ] WorkflowExecutionId, WorkflowActivityId, WorkflowSignalId added to knowledge-domain
- [ ] All 3 workflow tables created with correct schemas
- [ ] WorkflowService and WorkflowPersistence implemented
- [ ] TypeScript compilation passes for all packages
- [ ] Database migration generated successfully
- [ ] REFLECTION_LOG.md updated with learnings
- [ ] HANDOFF_P2.md created for next phase
- [ ] P2_ORCHESTRATOR_PROMPT.md created for next phase

### Handoff Document

Read full context in: `specs/knowledge-workflow-durability/handoffs/HANDOFF_P1.md`

**Table schemas, service interfaces, and gotchas are documented in the handoff file above.**
