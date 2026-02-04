# Agent Prompts: Knowledge Workflow Durability

> Ready-to-use prompts for specialized agents working on @effect/workflow integration for durable extraction pipelines.

---

## Agent Selection Matrix

| Phase | Primary Agent | Secondary Agent | Research Agent |
|-------|---------------|-----------------|----------------|
| **P1: Workflow Integration** | `effect-code-writer` | `test-writer` | `codebase-researcher` |
| **P2: Workflow Definition** | `effect-code-writer` | `test-writer` | `mcp-researcher` |
| **P3: SSE Streaming** | `effect-code-writer` | `test-writer` | `mcp-researcher` |
| **P4: Batch State Machine** | `effect-code-writer` | `test-writer` | `code-reviewer` |

### Agent Capabilities Reference

| Agent | Capability | Output |
|-------|------------|--------|
| `codebase-researcher` | read-only | Informs orchestrator |
| `mcp-researcher` | read-only | Effect documentation |
| `effect-code-writer` | write-files | `.ts` source files |
| `test-writer` | write-files | `*.test.ts` files |
| `code-reviewer` | write-reports | `outputs/review.md` |
| `doc-writer` | write-files | Documentation files |

---

## Phase 1: Workflow Integration & Persistence

### Research Agent: codebase-researcher

```markdown
## Task: Research Workflow Patterns

Research existing patterns for @effect/workflow integration and persistence.

### Mission

Gather information to inform WorkflowService and table design.

### Research Questions

1. **Existing Workflow Implementations**
   - Are there any @effect/workflow usages in the codebase?
   - Search: `grep -r "@effect/workflow" packages/`
   - What patterns exist for durable execution?

2. **@effect/workflow API Surface**
   - Locate @effect/workflow in node_modules/@effect/workflow/
   - What is the Workflow.make API signature?
   - What is the Activity.make API signature?
   - What persistence interface does @effect/workflow expect?
   - How are checkpoints managed?

3. **Service Layer Patterns**
   - How do other packages structure Effect services?
   - Examine: `packages/*/server/src/services/*.ts`
   - What Layer composition patterns are used?

4. **Table Persistence Patterns**
   - How are state-heavy tables designed?
   - Examine: `packages/*/tables/src/tables/*.table.ts`
   - What JSONB patterns exist for storing structured data?
   - How are foreign key relationships structured?

### Files to Examine

- `node_modules/@effect/workflow/` - API reference
- `packages/*/server/src/services/` - Service patterns
- `packages/*/tables/src/tables/` - Table patterns
- `documentation/patterns/database-patterns.md` - Database conventions
- `.claude/rules/effect-patterns.md` - Effect patterns

### Output Format

Provide a summary with:

1. **@effect/workflow API**
   ```typescript
   // Workflow.make signature
   // Activity.make signature
   // Persistence interface requirements
   ```

2. **Service Pattern**
   ```typescript
   // Standard Effect.Service pattern
   // Layer composition example
   ```

3. **Table Pattern**
   ```typescript
   // JSONB columns for workflow state
   // Foreign key relationships
   ```

4. **Recommendations**
   - Persistence layer design
   - Service abstraction approach
   - Checkpoint strategy
```

### Primary Agent: effect-code-writer (Task 1.2-1.5)

```markdown
## Task: Implement Workflow Integration

You are implementing Phase 1 of the Knowledge Workflow Durability spec.

### Mission

Integrate @effect/workflow runtime with PostgreSQL persistence and create workflow service abstraction.

### Context

The ExtractionPipeline currently runs as a single Effect. We need to add workflow durability so extractions survive server restarts.

### Files to Modify

1. **packages/knowledge/domain/src/entities/EntityIds.ts**
   - Add WorkflowExecutionId, WorkflowActivityId, WorkflowSignalId
   - Pattern: `EntityId.make("knowledge_workflow_execution")`

2. **packages/knowledge/domain/src/entities/index.ts**
   - Export new EntityIds

### Files to Create

3. **packages/knowledge/tables/src/tables/workflow-execution.table.ts**

```typescript
import { KnowledgeEntityIds } from "@beep/knowledge-domain";
import { SharedEntityIds } from "@beep/shared-domain";
import { Table } from "@beep/table-prelude";
import * as pg from "drizzle-orm/pg-core";

export const workflowExecutionTable = Table.make(KnowledgeEntityIds.WorkflowExecutionId)({
  organizationId: pg.text("organization_id").notNull()
    .$type<SharedEntityIds.OrganizationId.Type>(),

  // Workflow identification
  workflowType: pg.text("workflow_type").notNull(), // 'extraction'
  workflowVersion: pg.integer("workflow_version").notNull(), // Schema version

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

4. **packages/knowledge/tables/src/tables/workflow-activity.table.ts**

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
  activityName: pg.text("activity_name").notNull(), // 'chunk-text', 'extract-mentions-0', etc.
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

5. **packages/knowledge/tables/src/tables/workflow-signal.table.ts**

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

6. **packages/knowledge/tables/src/tables/index.ts**
   - Add exports for new tables

7. **packages/knowledge/server/src/Workflow/WorkflowPersistence.ts**

```typescript
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Context from "effect/Context";
import { Sql } from "@effect/sql";
import { workflowExecutionTable, workflowActivityTable, workflowSignalTable } from "@beep/knowledge-tables";

export class WorkflowPersistence extends Effect.Service<WorkflowPersistence>()(
  "@beep/knowledge-server/WorkflowPersistence",
  {
    accessors: true,
    effect: Effect.gen(function* () {
      const sql = yield* Sql.Sql;

      return {
        saveExecution: (execution: WorkflowExecution) =>
          Effect.gen(function* () {
            yield* sql`
              INSERT INTO ${workflowExecutionTable} (
                id, organization_id, workflow_type, workflow_version,
                status, current_activity, input, checkpoint,
                started_at, updated_at
              ) VALUES (
                ${execution.id}, ${execution.organizationId}, ${execution.workflowType},
                ${execution.workflowVersion}, ${execution.status}, ${execution.currentActivity},
                ${execution.input}, ${execution.checkpoint}, ${execution.startedAt},
                ${execution.updatedAt}
              )
            `.pipe(Effect.withSpan("WorkflowPersistence.saveExecution"));
          }),

        loadExecution: (executionId: WorkflowExecutionId) =>
          Effect.gen(function* () {
            const result = yield* sql`
              SELECT * FROM ${workflowExecutionTable}
              WHERE id = ${executionId}
            `.pipe(Effect.withSpan("WorkflowPersistence.loadExecution"));

            return result[0];
          }),

        saveActivity: (activity: WorkflowActivity) =>
          Effect.gen(function* () {
            yield* sql`
              INSERT INTO ${workflowActivityTable} (
                id, workflow_execution_id, organization_id, activity_name,
                activity_type, status, attempt_number, input, started_at
              ) VALUES (
                ${activity.id}, ${activity.workflowExecutionId}, ${activity.organizationId},
                ${activity.activityName}, ${activity.activityType}, ${activity.status},
                ${activity.attemptNumber}, ${activity.input}, ${activity.startedAt}
              )
            `.pipe(Effect.withSpan("WorkflowPersistence.saveActivity"));
          }),

        loadActivities: (executionId: WorkflowExecutionId) =>
          Effect.gen(function* () {
            const results = yield* sql`
              SELECT * FROM ${workflowActivityTable}
              WHERE workflow_execution_id = ${executionId}
              ORDER BY started_at ASC
            `.pipe(Effect.withSpan("WorkflowPersistence.loadActivities"));

            return results;
          }),

        saveSignal: (signal: WorkflowSignal) =>
          Effect.gen(function* () {
            yield* sql`
              INSERT INTO ${workflowSignalTable} (
                id, workflow_execution_id, organization_id, signal_name,
                payload, created_at
              ) VALUES (
                ${signal.id}, ${signal.workflowExecutionId}, ${signal.organizationId},
                ${signal.signalName}, ${signal.payload}, ${signal.createdAt}
              )
            `.pipe(Effect.withSpan("WorkflowPersistence.saveSignal"));
          }),

        loadSignals: (executionId: WorkflowExecutionId) =>
          Effect.gen(function* () {
            const results = yield* sql`
              SELECT * FROM ${workflowSignalTable}
              WHERE workflow_execution_id = ${executionId}
              ORDER BY created_at ASC
            `.pipe(Effect.withSpan("WorkflowPersistence.loadSignals"));

            return results;
          }),
      };
    }),
  }
) {}
```

8. **packages/knowledge/server/src/Workflow/WorkflowService.ts**

```typescript
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Context from "effect/Context";
import { WorkflowPersistence } from "./WorkflowPersistence.js";

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
            const execution = yield* persistence.loadExecution(executionId);
            return {
              id: execution.id,
              status: execution.status,
              currentActivity: execution.currentActivity,
              startedAt: execution.startedAt,
              completedAt: execution.completedAt,
            };
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

9. **packages/knowledge/server/src/Workflow/index.ts**

```typescript
export * from "./WorkflowPersistence.js";
export * from "./WorkflowService.js";
```

### Critical Patterns

#### REQUIRED: Namespace Imports

```typescript
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Context from "effect/Context";
import * as S from "effect/Schema";
import * as A from "effect/Array";
```

#### REQUIRED: EntityId .$type<>() on Table Columns

```typescript
workflowExecutionId: pg.text("workflow_execution_id").notNull()
  .$type<KnowledgeEntityIds.WorkflowExecutionId.Type>()
  .references(() => workflowExecutionTable.columns.id)
```

#### REQUIRED: Effect.gen for Async Operations

```typescript
const program = Effect.gen(function* () {
  const data = yield* someEffect;
  return data;
});
```

### FORBIDDEN Patterns

- NO `async/await` inside Effect.gen
- NO native array methods - use `A.map`, `A.filter`
- NO missing `.$type<>()` on ID columns
- NO plain `S.String` for entity IDs (use branded EntityIds)
- NO direct imports like `import { Effect } from "effect"`

### Verification

After implementation, run:

```bash
# Type check
bun run check --filter @beep/knowledge-domain
bun run check --filter @beep/knowledge-tables
bun run check --filter @beep/knowledge-server

# Generate migration
bun run db:generate

# Check migration file created
ls packages/knowledge/tables/drizzle/

# Lint
bun run lint:fix --filter @beep/knowledge-*
```

### Success Criteria

- [ ] EntityIds added to knowledge-domain
- [ ] All 3 workflow tables created
- [ ] WorkflowPersistence implemented
- [ ] WorkflowService implemented
- [ ] TypeScript compilation passes
- [ ] Database migration generated
```

### Secondary Agent: test-writer

```markdown
## Task: Create Workflow Integration Tests

Create tests for WorkflowPersistence and WorkflowService.

### Mission

Verify persistence layer and service abstraction work correctly.

### Files to Create

1. **packages/knowledge/server/test/Workflow/WorkflowPersistence.test.ts**

```typescript
import { effect, layer, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import { WorkflowPersistence } from "../../src/Workflow/WorkflowPersistence.js";
import { TestLayer } from "../TestLayer.js";

layer(TestLayer)("WorkflowPersistence", (it) => {
  it.effect("saves and loads workflow execution", () =>
    Effect.gen(function* () {
      const persistence = yield* WorkflowPersistence;

      const execution = {
        id: "workflow_1",
        organizationId: "org_1",
        workflowType: "extraction",
        workflowVersion: 1,
        status: "running",
        currentActivity: "chunk-text",
        input: { documentId: "doc_1" },
        checkpoint: null,
        startedAt: new Date(),
        updatedAt: new Date(),
      };

      yield* persistence.saveExecution(execution);
      const loaded = yield* persistence.loadExecution(execution.id);

      strictEqual(loaded.id, execution.id);
      strictEqual(loaded.status, "running");
    })
  );

  it.effect("saves and loads workflow activities", () =>
    Effect.gen(function* () {
      const persistence = yield* WorkflowPersistence;

      const activity = {
        id: "activity_1",
        workflowExecutionId: "workflow_1",
        organizationId: "org_1",
        activityName: "chunk-text",
        activityType: "chunk",
        status: "completed",
        attemptNumber: 1,
        input: { text: "Sample text" },
        output: { chunks: [] },
        error: null,
        startedAt: new Date(),
        completedAt: new Date(),
      };

      yield* persistence.saveActivity(activity);
      const loaded = yield* persistence.loadActivities("workflow_1");

      strictEqual(loaded.length, 1);
      strictEqual(loaded[0].id, activity.id);
    })
  );

  it.effect("saves and loads workflow signals", () =>
    Effect.gen(function* () {
      const persistence = yield* WorkflowPersistence;

      const signal = {
        id: "signal_1",
        workflowExecutionId: "workflow_1",
        organizationId: "org_1",
        signalName: "progress",
        payload: { stage: "chunk", progress: 50 },
        createdAt: new Date(),
      };

      yield* persistence.saveSignal(signal);
      const loaded = yield* persistence.loadSignals("workflow_1");

      strictEqual(loaded.length, 1);
      strictEqual(loaded[0].signalName, "progress");
    })
  );
});
```

2. **packages/knowledge/server/test/Workflow/WorkflowService.test.ts**

```typescript
import { effect, layer, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import { WorkflowService } from "../../src/Workflow/WorkflowService.js";
import { TestLayer } from "../TestLayer.js";

layer(TestLayer)("WorkflowService", (it) => {
  it.effect("starts workflow and returns execution ID", () =>
    Effect.gen(function* () {
      const service = yield* WorkflowService;

      const executionId = yield* service.start("extraction", {
        documentId: "doc_1",
      });

      strictEqual(typeof executionId, "string");
    })
  );

  it.effect("gets workflow status", () =>
    Effect.gen(function* () {
      const service = yield* WorkflowService;

      const executionId = yield* service.start("extraction", {
        documentId: "doc_1",
      });

      const status = yield* service.getStatus(executionId);

      strictEqual(status.id, executionId);
      strictEqual(status.status, "running");
    })
  );

  it.effect("sends signal to workflow", () =>
    Effect.gen(function* () {
      const service = yield* WorkflowService;

      const executionId = yield* service.start("extraction", {
        documentId: "doc_1",
      });

      yield* service.signal(executionId, "progress", { stage: "chunk" });

      // Verify signal was persisted
      const persistence = yield* WorkflowPersistence;
      const signals = yield* persistence.loadSignals(executionId);

      strictEqual(signals.length, 1);
    })
  );

  it.effect("cancels workflow", () =>
    Effect.gen(function* () {
      const service = yield* WorkflowService;

      const executionId = yield* service.start("extraction", {
        documentId: "doc_1",
      });

      yield* service.cancel(executionId);

      const status = yield* service.getStatus(executionId);
      strictEqual(status.status, "cancelled");
    })
  );
});
```

### Testing Patterns

REQUIRED: Use @beep/testkit, NOT raw bun:test

```typescript
import { effect, layer, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";

// Unit test
effect("test name", () =>
  Effect.gen(function* () {
    const result = yield* someEffect();
    strictEqual(result, expected);
  })
);

// Integration test with shared Layer
layer(TestLayer)("suite name", (it) => {
  it.effect("test name", () =>
    Effect.gen(function* () {
      const service = yield* Service;
      const result = yield* service.method();
      strictEqual(result, expected);
    })
  );
});
```

### Verification

```bash
bun run test --filter @beep/knowledge-server
```

### Success Criteria

- [ ] All tests pass
- [ ] Persistence round-trip works (save + load)
- [ ] WorkflowService methods work
- [ ] Signal persistence verified
```

---

## Phase 2: ExtractionWorkflow Definition & Durable Activities

### Research Agent: mcp-researcher

```markdown
## Task: Research @effect/workflow Workflow Definition API

Research the official @effect/workflow API for workflow and activity definitions.

### Mission

Verify the exact API signatures for Workflow.make, Activity.make, checkpoint hooks, and error handling.

### Topics to Research

1. **Workflow.make API**
   - What parameters does it accept?
   - How is the execute function defined?
   - What return type is expected?
   - How are checkpoints managed?

2. **Activity.make API**
   - What parameters does it accept?
   - How is the execute function defined?
   - What error handling is built-in?
   - How are retries configured?

3. **Checkpoint Mechanism**
   - How does `Workflow.checkpoint` work?
   - When are checkpoints persisted?
   - How to resume from checkpoint?

4. **Error Handling**
   - How are activity errors handled?
   - What retry strategies are available?
   - How to implement custom error handling?

5. **Parallel Execution**
   - How to execute activities in parallel?
   - What concurrency controls exist?
   - How to coordinate parallel results?

### Research Sources

- @effect/workflow official documentation via MCP
- @effect/workflow source code in node_modules/@effect/workflow/
- @effect/workflow test files

### Output Format

Provide exact API signatures and usage examples:

```typescript
// Workflow.make API
Workflow.make({
  name: string,
  version?: number,
  execute: (input: I) => Effect<O, E>,
  // ... other options
});

// Activity.make API
Activity.make({
  name: string,
  execute: (input: I) => Effect<O, E>,
  retry?: RetryPolicy,
  // ... other options
});

// Checkpoint API
Workflow.checkpoint(state: CheckpointState): Effect<void, never>

// Parallel execution
Effect.all([activity1, activity2], { concurrency: "unbounded" })
```

### Recommendations

Based on research, provide:
1. Recommended workflow structure
2. Checkpoint strategy
3. Error handling approach
4. Parallel activity patterns
```

### Primary Agent: effect-code-writer (Tasks 2.2-2.7)

```markdown
## Task: Implement ExtractionWorkflow and Durable Activities

You are implementing Phase 2 of the Knowledge Workflow Durability spec.

### Mission

Transform the existing ExtractionPipeline into a durable workflow with checkpointed activities.

### Context

The current ExtractionPipeline runs as a single Effect - if it fails, all progress is lost. We're converting it to a workflow with 5 durable activities that checkpoint progress.

### Reference Implementation

Review existing ExtractionPipeline:
- `packages/knowledge/server/src/services/ExtractionPipeline.ts`

### Files to Create

1. **packages/knowledge/server/src/Workflow/ExtractionWorkflow.ts**

Main workflow definition orchestrating all activities.

2. **packages/knowledge/server/src/Workflow/activities/ChunkTextActivity.ts**

Wraps ChunkingService in durable activity.

3. **packages/knowledge/server/src/Workflow/activities/ExtractMentionsActivity.ts**

Parallel execution of mention detection per chunk.

4. **packages/knowledge/server/src/Workflow/activities/ClassifyEntitiesActivity.ts**

Batched entity classification with LLM.

5. **packages/knowledge/server/src/Workflow/activities/ExtractRelationsActivity.ts**

Parallel relation extraction per chunk.

6. **packages/knowledge/server/src/Workflow/activities/AssembleGraphActivity.ts**

Final graph assembly and persistence.

7. **packages/knowledge/server/src/Workflow/activities/index.ts**

Barrel exports for all activities.

### Workflow Pattern

```typescript
import * as Effect from "effect/Effect";
import { Workflow } from "@effect/workflow";
import * as A from "effect/Array";

export const ExtractionWorkflow = Workflow.make({
  name: "ExtractionWorkflow",
  version: 1,
  execute: (input: ExtractionInput) =>
    Effect.gen(function* () {
      // Stage 1: Chunk text
      const chunks = yield* ChunkTextActivity.execute(input);
      yield* Workflow.checkpoint({ stage: "chunked", chunkCount: chunks.length });

      // Stage 2: Extract mentions (parallel per chunk)
      const mentionsPerChunk = yield* Effect.all(
        A.map(chunks, (chunk) => ExtractMentionsActivity.execute(chunk)),
        { concurrency: "unbounded" }
      );
      const mentions = A.flatten(mentionsPerChunk);
      yield* Workflow.checkpoint({ stage: "mentions", mentionCount: mentions.length });

      // Stage 3: Classify entities (batched for LLM efficiency)
      const entities = yield* ClassifyEntitiesActivity.execute(mentions);
      yield* Workflow.checkpoint({ stage: "entities", entityCount: entities.length });

      // Stage 4: Extract relations (parallel per chunk)
      const relationsPerChunk = yield* Effect.all(
        A.map(chunks, (chunk) => ExtractRelationsActivity.execute({ chunk, entities })),
        { concurrency: "unbounded" }
      );
      const relations = A.flatten(relationsPerChunk);
      yield* Workflow.checkpoint({ stage: "relations", relationCount: relations.length });

      // Stage 5: Assemble final graph
      const graph = yield* AssembleGraphActivity.execute({ entities, relations });

      return graph;
    }),
});
```

### Activity Pattern

```typescript
import * as Effect from "effect/Effect";
import { Activity } from "@effect/workflow";
import { SomeService } from "../../services/SomeService.js";

export const SomeActivity = Activity.make({
  name: "activity-name",
  execute: (input: ActivityInput) =>
    Effect.gen(function* () {
      // Get required services
      const service = yield* SomeService;

      // Perform work
      const result = yield* service.doWork(input);

      // Persist to database (checkpoint)
      const repo = yield* SomeRepo;
      yield* repo.insert(result);

      return result;
    }).pipe(
      Effect.withSpan("SomeActivity.execute", { captureStackTrace: false })
    ),
});
```

### Critical Patterns

REQUIRED: Effect namespace imports, Effect.gen, yield* for async

```typescript
import * as Effect from "effect/Effect";
import * as A from "effect/Array";
import * as F from "effect/Function";

// Parallel execution
const results = yield* Effect.all(
  A.map(items, (item) => processItem(item)),
  { concurrency: "unbounded" }
);

// Sequential with checkpoint
const step1 = yield* Activity1.execute(input);
yield* Workflow.checkpoint({ step: 1, data: step1 });
const step2 = yield* Activity2.execute(step1);
```

### Verification

```bash
# Type check
bun run check --filter @beep/knowledge-server

# Run tests
bun run test --filter @beep/knowledge-server

# Lint
bun run lint:fix --filter @beep/knowledge-server
```

### Success Criteria

- [ ] ExtractionWorkflow compiles without errors
- [ ] All 5 activities implemented
- [ ] Checkpoints after each stage
- [ ] Parallel activities use Effect.all with concurrency
- [ ] Services properly integrated
```

### Secondary Agent: test-writer

```markdown
## Task: Create ExtractionWorkflow Tests

Create tests for workflow execution and resumption.

### Mission

Verify workflow executes correctly and resumes from checkpoints after failure.

### Files to Create

1. **packages/knowledge/server/test/Workflow/ExtractionWorkflow.test.ts**

```typescript
import { effect, layer, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import { ExtractionWorkflow } from "../../src/Workflow/ExtractionWorkflow.js";
import { WorkflowService } from "../../src/Workflow/WorkflowService.js";
import { TestLayer } from "../TestLayer.js";

layer(TestLayer)("ExtractionWorkflow", (it) => {
  it.effect("executes workflow end-to-end", () =>
    Effect.gen(function* () {
      const workflowService = yield* WorkflowService;

      const input = {
        documentId: "doc_1",
        text: "John Smith works at Acme Corp.",
      };

      const executionId = yield* workflowService.start("extraction", input);

      // Wait for completion
      const status = yield* waitForCompletion(executionId);

      strictEqual(status.status, "completed");
    })
  );

  it.effect("resumes workflow from checkpoint after failure", () =>
    Effect.gen(function* () {
      const workflowService = yield* WorkflowService;

      const input = {
        documentId: "doc_1",
        text: "John Smith works at Acme Corp.",
      };

      const executionId = yield* workflowService.start("extraction", input);

      // Simulate failure after Stage 2 (mentions)
      yield* simulateFailureAfterStage(executionId, 2);

      // Verify checkpoint exists
      const persistence = yield* WorkflowPersistence;
      const execution = yield* persistence.loadExecution(executionId);
      strictEqual(execution.checkpoint.stage, "mentions");

      // Resume workflow
      yield* workflowService.resume(executionId);

      // Verify completion
      const finalStatus = yield* waitForCompletion(executionId);
      strictEqual(finalStatus.status, "completed");
    })
  );

  it.effect("handles activity failures with retry", () =>
    Effect.gen(function* () {
      const workflowService = yield* WorkflowService;

      // Configure activity to fail first attempt
      const input = {
        documentId: "doc_1",
        text: "Sample text",
        failFirstAttempt: true,
      };

      const executionId = yield* workflowService.start("extraction", input);

      // Wait for completion (should retry and succeed)
      const status = yield* waitForCompletion(executionId);

      strictEqual(status.status, "completed");

      // Verify retry occurred
      const activities = yield* persistence.loadActivities(executionId);
      const retriedActivity = activities.find((a) => a.attemptNumber > 1);
      strictEqual(retriedActivity !== undefined, true);
    })
  );
});
```

2. **packages/knowledge/server/test/Workflow/activities/*.test.ts**

Create tests for each activity.

### Verification

```bash
bun run test --filter @beep/knowledge-server
```

### Success Criteria

- [ ] Workflow execution test passes
- [ ] Resumption test passes
- [ ] Retry test passes
- [ ] All activities have unit tests
```

---

## Phase 3: SSE Progress Streaming

(Similar structure to Phase 1 and 2, with prompts for progress event schema, SSE service, workflow signal integration, and client hooks)

---

## Phase 4: Batch State Machine & Cross-Batch Orchestration

### Primary Agent: effect-code-writer

```markdown
## Task: Implement Batch State Machine

You are implementing Phase 4 of the Knowledge Workflow Durability spec.

### Mission

Create batch orchestration for processing multiple documents with coordinated state management.

### Files to Create

1. **packages/knowledge/domain/src/value-objects/workflow/BatchState.ts**

```typescript
import * as S from "effect/Schema";

export const BatchState = S.Literal(
  "queued",
  "processing",
  "completed",
  "failed",
  "retry",
  "abandoned"
);

export type BatchState = S.Schema.Type<typeof BatchState>;
```

2. **packages/knowledge/server/src/Workflow/BatchStateMachine.ts**

```typescript
import * as Effect from "effect/Effect";
import * as Match from "effect/Match";

export class BatchStateMachine extends Effect.Service<BatchStateMachine>()(
  "@beep/knowledge-server/BatchStateMachine",
  {
    accessors: true,
    effect: Effect.gen(function* () {
      return {
        transition: (currentState: BatchState, event: BatchEvent) =>
          Match.value(currentState).pipe(
            Match.when("queued", () =>
              event.type === "start" ? "processing" : currentState
            ),
            Match.when("processing", () =>
              Match.value(event.type).pipe(
                Match.when("complete", () => "completed"),
                Match.when("fail", () => "failed"),
                Match.orElse(() => currentState)
              )
            ),
            Match.when("failed", () =>
              event.type === "retry" ? "retry" : "abandoned"
            ),
            Match.when("retry", () =>
              event.type === "start" ? "processing" : currentState
            ),
            Match.orElse(() => currentState)
          ),
      };
    }),
  }
) {}
```

3. **packages/knowledge/server/src/Workflow/BatchOrchestrator.ts**

Orchestrates multiple workflow executions as a batch.

### Critical Patterns

REQUIRED: Use Match.value for state transitions (NO switch statements)

```typescript
import * as Match from "effect/Match";

const nextState = Match.value(currentState).pipe(
  Match.when("queued", () => "processing"),
  Match.when("processing", () => "completed"),
  Match.orElse(() => currentState)
);
```

REQUIRED: Limit concurrency for parallel workflows

```typescript
yield* Effect.all(
  A.map(documents, (doc) => workflowService.start("extraction", doc)),
  { concurrency: 5 } // Limit to 5 concurrent workflows
);
```

### Verification

```bash
bun run check --filter @beep/knowledge-server
bun run test --filter @beep/knowledge-server
```

### Success Criteria

- [ ] BatchState schema defined
- [ ] BatchStateMachine transitions correctly
- [ ] BatchOrchestrator queues and monitors batches
- [ ] Tests verify state transitions
- [ ] Tests verify batch processing
```

### Review Agent: code-reviewer

```markdown
## Task: Review Phase 4 Implementation

Conduct comprehensive review of Phase 4 batch state machine code.

### Mission

Verify Effect patterns compliance, state machine correctness, and batch orchestration safety.

### Review Areas

#### 1. Effect Patterns Compliance

Check all files for:
- [ ] Namespace imports (`import * as Effect from "effect/Effect"`)
- [ ] Match.value for conditionals (NO switch statements)
- [ ] Effect.gen for async operations
- [ ] Proper error types (NO native Error)

#### 2. State Machine Correctness

- [ ] All state transitions defined
- [ ] No unreachable states
- [ ] Retry logic handles transient failures
- [ ] Abandoned state prevents infinite retries

#### 3. Batch Orchestration Safety

- [ ] Concurrency limits prevent resource exhaustion
- [ ] Workflow failures don't block entire batch
- [ ] Batch state persisted to database
- [ ] Cross-batch entity resolution coordinated

#### 4. Error Handling

- [ ] All Effect operations have error types
- [ ] Errors logged with Effect.log
- [ ] Recovery procedures documented

### Output Format

Create `outputs/p4-code-review.md`:

```markdown
# Phase 4 Code Review

## Summary
- Files reviewed: X
- Issues found: Y
- Critical issues: Z

## Effect Patterns
| File | Issue | Severity | Line |
|------|-------|----------|------|
| ... | ... | ... | ... |

## State Machine
| Issue | Impact | Recommendation |
|-------|--------|----------------|
| ... | ... | ... |

## Batch Orchestration
| Issue | Impact | Recommendation |
|-------|--------|----------------|
| ... | ... | ... |

## Recommendations
1. ...
2. ...

## Verification Commands
...
```
```

---

## Cross-Phase Agents

### reflector: Phase Synthesis

```markdown
## Task: Analyze Phase Learnings

Synthesize learnings from the completed phase.

### Input

- Current REFLECTION_LOG.md entries
- Phase implementation artifacts
- Any issues encountered

### Analysis Areas

1. **What Worked Well**
   - Effective patterns discovered
   - Smooth integrations
   - Time-saving approaches

2. **What Was Challenging**
   - Unexpected issues
   - Documentation gaps
   - Integration difficulties

3. **Pattern Candidates**
   - Reusable approaches
   - Worth promoting to skills
   - Scoring against quality rubric

4. **Next Phase Improvements**
   - Prompt refinements needed
   - Process changes
   - Research gaps

### Output Format

Update `REFLECTION_LOG.md`:

```markdown
## Phase [N]: [Name] - YYYY-MM-DD

### What Worked
- Pattern 1: [description]
- Pattern 2: [description]

### What Didn't Work
- Issue 1: [description] -> [solution]
- Issue 2: [description] -> [solution]

### Key Learnings
- Insight 1
- Insight 2

### Pattern Candidates
| Pattern | Score | Description |
|---------|-------|-------------|
| Workflow persistence pattern | 80 | PostgreSQL adapter for @effect/workflow |
| Durable activity pattern | 75 | Checkpoint logic with database persistence |
```
```

---

## Usage Notes

### Launching Agents

Use the Task tool with appropriate subagent_type:

```
Task tool:
  subagent_type: "effect-code-writer"
  prompt: [paste prompt from above]
```

### Agent Output Handling

| Agent Type | Handle Output |
|------------|---------------|
| `codebase-researcher` | Review findings, inform implementation |
| `mcp-researcher` | Extract API patterns for implementation |
| `effect-code-writer` | Verify files created, run type check |
| `test-writer` | Run tests, verify coverage |
| `code-reviewer` | Address issues in `outputs/` |

### Parallel Execution Rules

**Safe to parallelize:**
- `codebase-researcher` + `mcp-researcher`
- Multiple `test-writer` tasks (different files)

**Must be sequential:**
- `effect-code-writer` BEFORE `test-writer`
- Implementation BEFORE `code-reviewer`
- All phases BEFORE final documentation

### @effect/workflow Source Verification (CRITICAL)

Before implementing ANY @effect/workflow API usage:

1. Locate source: `node_modules/@effect/workflow/`
2. Extract exact signatures from source files
3. Cross-reference with test files
4. Document ALL required parameters
5. NEVER assume API signatures - always verify

See HANDOFF_P1.md "Source Verification Table" for tracking.
