# Phase 1 Handoff: @effect/workflow Integration & Persistence Tables

**Date**: 2026-02-03
**From**: Spec Scaffolding
**To**: Phase 1 (@effect/workflow Integration)
**Status**: Ready for implementation
**Estimated tokens**: ~3,200 (under 4K budget)

---

## Context for Phase 1

### Working Context (current task focus)

**Objective**: Integrate @effect/workflow runtime with PostgreSQL backend and create workflow persistence tables

**Success Criteria**:
- [ ] @effect/workflow runtime integrated in `@beep/knowledge-server`
- [ ] Workflow persistence tables created in `@beep/knowledge-tables`
- [ ] WorkflowService abstraction wraps @effect/workflow runtime
- [ ] `bun run check --filter @beep/knowledge-server` passes
- [ ] `bun run check --filter @beep/knowledge-tables` passes
- [ ] `bun run db:generate` generates migration for new tables

**Files to Create**:
1. `packages/knowledge/tables/src/tables/workflow-execution.table.ts`
2. `packages/knowledge/tables/src/tables/workflow-activity.table.ts`
3. `packages/knowledge/tables/src/tables/workflow-signal.table.ts`
4. `packages/knowledge/server/src/Workflow/WorkflowPersistence.ts`
5. `packages/knowledge/server/src/Workflow/WorkflowService.ts`
6. `packages/knowledge/server/src/Workflow/index.ts`

### Episodic Context (prior decisions)

From `knowledge-architecture-foundation` spec:
- **Package allocation**: Workflow implementation in `@beep/knowledge-server`, tables in `@beep/knowledge-tables`
- **Layer boundaries**: Domain types in domain, implementations in server, tables in tables
- **Dependencies**: knowledge-server → knowledge-tables → knowledge-domain

### Semantic Context (constants)

**Tech Stack**:
- @effect/workflow (version: latest compatible with Effect 3)
- PostgreSQL for workflow state persistence
- Drizzle ORM for table definitions
- Effect 3, Effect Schema

**Key Concepts**:
- **Workflow**: Durable execution unit that survives restarts
- **Activity**: Atomic operation within workflow (can be retried)
- **Signal**: External event sent to workflow
- **Checkpoint**: Persistence point in workflow execution

### Procedural Context (patterns to follow)

**Reference Files**:
- Table patterns: `documentation/patterns/database-patterns.md`
- Effect patterns: `.claude/rules/effect-patterns.md`
- Existing tables: `packages/knowledge/tables/src/tables/*.table.ts`
- Existing services: `packages/knowledge/server/src/services/*.ts`

---

## Implementation Order

### Part A: Workflow Persistence Tables (3 tables)

1. **workflow-execution.table.ts** - Core workflow state
2. **workflow-activity.table.ts** - Activity execution history
3. **workflow-signal.table.ts** - Signal event log
4. **Update tables/index.ts** - Export new tables

### Part B: Workflow Service Layer (3 files)

5. **WorkflowPersistence.ts** - PostgreSQL adapter for @effect/workflow
6. **WorkflowService.ts** - Service abstraction over workflow runtime
7. **Workflow/index.ts** - Barrel exports

---

## Table Schemas

### workflow-execution.table.ts

```typescript
import { KnowledgeEntityIds } from "@beep/knowledge-domain";
import { SharedEntityIds } from "@beep/shared-domain";
import { Table } from "@beep/table-prelude";
import * as pg from "drizzle-orm/pg-core";

export const workflowExecutionTable = Table.make(KnowledgeEntityIds.WorkflowExecutionId)({
  organizationId: pg.text("organization_id").notNull()
    .$type<SharedEntityIds.OrganizationId.Type>(),

  // Workflow identification
  workflowType: pg.text("workflow_type").notNull(), // 'extraction', etc.
  workflowVersion: pg.integer("workflow_version").notNull(), // For schema evolution

  // Execution state
  status: pg.text("status").notNull(), // 'running', 'completed', 'failed', 'cancelled'
  currentActivity: pg.text("current_activity"), // Current executing activity name

  // Input/Output
  input: pg.jsonb("input").notNull(), // Workflow input parameters
  output: pg.jsonb("output"), // Workflow result (when completed)
  error: pg.jsonb("error"), // Error details (when failed)

  // Checkpointing
  checkpoint: pg.jsonb("checkpoint"), // Last checkpoint state

  // Timestamps
  startedAt: pg.timestamp("started_at", { withTimezone: true }).notNull(),
  completedAt: pg.timestamp("completed_at", { withTimezone: true }),
  updatedAt: pg.timestamp("updated_at", { withTimezone: true }).notNull(),
});
```

### workflow-activity.table.ts

```typescript
import { KnowledgeEntityIds } from "@beep/knowledge-domain";
import { SharedEntityIds } from "@beep/shared-domain";
import { Table } from "@beep/table-prelude";
import * as pg from "drizzle-orm/pg-core";

export const workflowActivityTable = Table.make(KnowledgeEntityIds.WorkflowActivityId)({
  workflowExecutionId: pg.text("workflow_execution_id").notNull()
    .$type<KnowledgeEntityIds.WorkflowExecutionId.Type>()
    .references(() => workflowExecutionTable.columns.id),

  organizationId: pg.text("organization_id").notNull()
    .$type<SharedEntityIds.OrganizationId.Type>(),

  // Activity identification
  activityName: pg.text("activity_name").notNull(), // 'chunk', 'mentions-0', etc.
  activityType: pg.text("activity_type").notNull(), // 'chunk', 'mentions', 'entities', etc.

  // Execution state
  status: pg.text("status").notNull(), // 'pending', 'running', 'completed', 'failed'
  attemptNumber: pg.integer("attempt_number").notNull().default(1),

  // Input/Output
  input: pg.jsonb("input").notNull(), // Activity input parameters
  output: pg.jsonb("output"), // Activity result (when completed)
  error: pg.jsonb("error"), // Error details (when failed)

  // Timestamps
  startedAt: pg.timestamp("started_at", { withTimezone: true }).notNull(),
  completedAt: pg.timestamp("completed_at", { withTimezone: true }),
});
```

### workflow-signal.table.ts

```typescript
import { KnowledgeEntityIds } from "@beep/knowledge-domain";
import { SharedEntityIds } from "@beep/shared-domain";
import { Table } from "@beep/table-prelude";
import * as pg from "drizzle-orm/pg-core";

export const workflowSignalTable = Table.make(KnowledgeEntityIds.WorkflowSignalId)({
  workflowExecutionId: pg.text("workflow_execution_id").notNull()
    .$type<KnowledgeEntityIds.WorkflowExecutionId.Type>()
    .references(() => workflowExecutionTable.columns.id),

  organizationId: pg.text("organization_id").notNull()
    .$type<SharedEntityIds.OrganizationId.Type>(),

  // Signal identification
  signalName: pg.text("signal_name").notNull(), // 'progress', etc.

  // Signal data
  payload: pg.jsonb("payload").notNull(), // Signal event data

  // Timestamp
  createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull(),
});
```

---

## Service Interface Design

### WorkflowService.ts

```typescript
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Context from "effect/Context";

export class WorkflowService extends Effect.Service<WorkflowService>()(
  "@beep/knowledge-server/WorkflowService",
  {
    accessors: true,
    effect: Effect.gen(function* () {
      const persistence = yield* WorkflowPersistence;

      return {
        // Start workflow execution
        start: <I, O>(
          workflowType: string,
          input: I
        ): Effect.Effect<WorkflowExecutionId, WorkflowStartError> =>
          Effect.gen(function* () {
            // Initialize @effect/workflow runtime
            // Persist initial state
            // Return execution ID
          }).pipe(
            Effect.withSpan("WorkflowService.start", { captureStackTrace: false })
          ),

        // Get workflow status
        getStatus: (
          executionId: WorkflowExecutionId
        ): Effect.Effect<WorkflowStatus, WorkflowNotFoundError> =>
          Effect.gen(function* () {
            // Query workflow state from persistence
          }).pipe(
            Effect.withSpan("WorkflowService.getStatus", { captureStackTrace: false })
          ),

        // Send signal to workflow
        signal: <T>(
          executionId: WorkflowExecutionId,
          signalName: string,
          payload: T
        ): Effect.Effect<void, WorkflowNotFoundError> =>
          Effect.gen(function* () {
            // Send signal to running workflow
            // Persist signal event
          }).pipe(
            Effect.withSpan("WorkflowService.signal", { captureStackTrace: false })
          ),

        // Cancel workflow execution
        cancel: (
          executionId: WorkflowExecutionId
        ): Effect.Effect<void, WorkflowNotFoundError> =>
          Effect.gen(function* () {
            // Cancel running workflow
            // Update status to 'cancelled'
          }).pipe(
            Effect.withSpan("WorkflowService.cancel", { captureStackTrace: false })
          ),
      };
    }),
  }
) {}
```

---

## Verification Steps

### After Table Creation

```bash
# Generate migration
bun run db:generate

# Check for SQL migration file
ls packages/knowledge/tables/drizzle/

# Verify TypeScript compilation
bun run check --filter @beep/knowledge-tables
```

### After Service Implementation

```bash
# Verify TypeScript compilation
bun run check --filter @beep/knowledge-server

# Verify imports
bun run lint --filter @beep/knowledge-server
```

---

## Known Issues & Gotcas

1. **@effect/workflow version**: Ensure version is compatible with Effect 3
2. **EntityId types**: Add new WorkflowExecutionId, WorkflowActivityId, WorkflowSignalId to `@beep/knowledge-domain`
3. **Table relationships**: workflow-activity and workflow-signal reference workflow-execution (foreign key)
4. **JSONB fields**: Use `pg.jsonb()` for input/output/checkpoint fields
5. **Timestamps**: Use `pg.timestamp(..., { withTimezone: true })` for all timestamps

---

## EntityId Additions Required

Before creating tables, add to `packages/knowledge/domain/src/entities/EntityIds.ts`:

```typescript
export const WorkflowExecutionId = EntityId.make("knowledge_workflow_execution");
export const WorkflowActivityId = EntityId.make("knowledge_workflow_activity");
export const WorkflowSignalId = EntityId.make("knowledge_workflow_signal");
```

---

## Success Criteria

Phase 1 is complete when:
- [ ] All 3 workflow tables created with correct schemas
- [ ] WorkflowService and WorkflowPersistence implemented
- [ ] EntityIds added to knowledge-domain
- [ ] TypeScript compilation passes for knowledge-tables and knowledge-server
- [ ] Database migration generated successfully
- [ ] REFLECTION_LOG.md updated with learnings
- [ ] HANDOFF_P2.md created for next phase
- [ ] P2_ORCHESTRATOR_PROMPT.md created for next phase

---

## Source Verification (@effect/workflow API)

**CRITICAL**: All @effect/workflow API patterns must be verified against library source.

| API Method | Source Reference | Verified |
|------------|-----------------|----------|
| Workflow.make | @effect/workflow API | N - Verify during P1 |
| Workflow.checkpoint | @effect/workflow API | N - Verify during P1 |
| Activity.make | @effect/workflow API | N - Verify during P1 |
| Workflow.signal | @effect/workflow API | N - Verify during P1 |
| Workflow.getStatus | @effect/workflow API | N - Verify during P1 |
| Persistence interface | @effect/workflow API | N - Verify during P1 |

**Verification Process**:
1. Locate @effect/workflow source in `node_modules/@effect/workflow/`
2. Extract exact API signatures for Workflow.make, Activity.make, checkpoint, etc.
3. Cross-reference with @effect/workflow test files in source
4. Document ALL required parameters and response shapes
5. Update this table with "Y - [date]" after verification

**DO NOT implement workflow integration until source verification is complete.**

---

## Delegation Protocol

### When to Delegate

| Task | Condition | Delegate To |
|------|-----------|-------------|
| Research @effect/workflow patterns | Before table design | codebase-researcher |
| Verify @effect/workflow API | Before WorkflowService implementation | mcp-researcher |
| Create table schemas | After research | Orchestrator (direct) |
| Create WorkflowService | After API verification | Orchestrator (direct) |
| Generate barrel exports | After service | Orchestrator (direct) |
| Create tests | After service implementation | test-writer |

### Research Outputs Expected

From `codebase-researcher`:
- @effect/workflow persistence interface requirements
- Service layer patterns from existing packages
- Table persistence patterns for JSONB state

From `mcp-researcher`:
- Official @effect/workflow documentation links
- Canonical workflow definition examples
- Activity retry configuration patterns

---

## Next Phase Preview

Phase 2 will implement the ExtractionWorkflow definition and durable activities (ChunkText, ExtractMentions, ClassifyEntities, ExtractRelations, AssembleGraph).
