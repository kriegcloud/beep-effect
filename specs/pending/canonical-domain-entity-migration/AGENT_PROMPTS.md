# canonical-domain-entity-migration: Agent Prompts

> Pre-configured prompts for swarm agent delegation across all migration waves.

---

## Reference Implementations

Before delegating, point ALL agents to these files:

| File | What It Shows |
|------|---------------|
| `.claude/skills/canonical-domain-entity.md` | **Pattern source of truth** -- complete module structure, all file patterns, 8 anti-patterns |
| `packages/documents/domain/src/entities/Comment/Comment.model.ts` | Model with `M.Class`, `makeFields`, `modelKit` |
| `packages/documents/domain/src/entities/Comment/Comment.errors.ts` | `S.TaggedError` with HTTP annotations, aggregate `Errors` union |
| `packages/documents/domain/src/entities/Comment/Comment.repo.ts` | `DbRepo.DbRepoSuccess` with `DbRepo.Method` extensions |
| `packages/documents/domain/src/entities/Comment/Comment.rpc.ts` | `RpcGroup.make(...)` aggregating contract RPCs |
| `packages/documents/domain/src/entities/Comment/Comment.http.ts` | `HttpApiGroup.make(...)` aggregating contract HTTP endpoints |
| `packages/documents/domain/src/entities/Comment/Comment.tool.ts` | `AiToolkit.make(...)` aggregating contract AI tools |
| `packages/documents/domain/src/entities/Comment/Comment.entity.ts` | `ClusterEntity.fromRpcGroup(...)` |
| `packages/documents/domain/src/entities/Comment/contracts/Get.contract.ts` | Complete GET contract: Payload, Success, Failure, Contract + static Rpc, Tool, Http |
| `packages/documents/domain/src/entities/Comment/contracts/Create.contract.ts` | Complete CREATE contract with `{ status: 201 }` |
| `packages/documents/domain/src/entities/Comment/contracts/Delete.contract.ts` | Complete DELETE contract with `S.Void` success |
| `packages/documents/domain/src/entities/Comment/contracts/index.ts` | Namespace barrel exports for contracts |
| `packages/documents/domain/src/entities/Comment/index.ts` | Entity barrel with flat/namespace exports |

---

## 1. Entity Migration Agent (effect-code-writer)

This is the primary prompt template used for all waves. Replace template variables (`{SLICE_NAME}`, `{ENTITY_LIST}`, etc.) with concrete values for each agent batch.

### Prompt Template

```
You are migrating domain entities to the canonical TaggedRequest contract pattern.

## CRITICAL: Read These First

1. Load and read the canonical pattern skill: `.claude/skills/canonical-domain-entity.md`
   - This is the AUTHORITATIVE pattern document. Follow it exactly.

2. Read the Comment entity as your reference implementation:
   - `packages/documents/domain/src/entities/Comment/Comment.model.ts`
   - `packages/documents/domain/src/entities/Comment/Comment.errors.ts`
   - `packages/documents/domain/src/entities/Comment/Comment.repo.ts`
   - `packages/documents/domain/src/entities/Comment/Comment.rpc.ts`
   - `packages/documents/domain/src/entities/Comment/Comment.http.ts`
   - `packages/documents/domain/src/entities/Comment/Comment.tool.ts`
   - `packages/documents/domain/src/entities/Comment/Comment.entity.ts`
   - `packages/documents/domain/src/entities/Comment/contracts/Get.contract.ts`
   - `packages/documents/domain/src/entities/Comment/contracts/Create.contract.ts`
   - `packages/documents/domain/src/entities/Comment/contracts/Delete.contract.ts`
   - `packages/documents/domain/src/entities/Comment/contracts/index.ts`
   - `packages/documents/domain/src/entities/Comment/index.ts`

## Your Assignment

**Slice**: `{SLICE_NAME}`
**Identity Builder**: `{IDENTITY_BUILDER}` from `@beep/identity/packages`
**EntityIds Import**: `{ENTITY_IDS_IMPORT}` from `@beep/shared-domain`
**Domain Package**: `packages/{SLICE_PATH}/domain/`

**Entities to migrate**: {ENTITY_LIST}

## For Each Entity, Do the Following

### Step 0: Rename to PascalCase (if kebab-case)

Check the entity's current directory and file naming convention. If it uses kebab-case:

1. Use `mcp__mcp-refactor-typescript__file_operations` with `operation: "rename_file"` to rename each existing file:
   - `{kebab-name}.model.ts` -> `{PascalName}.model.ts`
   - `{kebab-name}.errors.ts` -> `{PascalName}.errors.ts` (if exists)
   - `{kebab-name}.rpc.ts` -> `{PascalName}.rpc.ts` (if exists)
   - Any other existing files

2. Use `mcp__mcp-refactor-typescript__file_operations` with `operation: "move_file"` to rename the directory:
   - `entities/{kebab-name}` -> `entities/{PascalName}`

3. Update `index.ts` barrel imports to use new file names

This ensures ALL cross-codebase imports are automatically updated by the TypeScript compiler.

If the entity already uses PascalCase (Knowledge slice, Documents canonical), skip this step.

### Step 1: Read the existing model

Read `packages/{SLICE_PATH}/domain/src/entities/{Entity}/{Entity}.model.ts` to understand:
- The entity's fields and their types
- Which EntityId is used for the primary key
- Which cross-slice EntityIds are referenced

### Step 2: Read the server repo (if one exists)

Read `{SERVER_REPO_PATH}/{Entity}.repo.ts` (or similar name) to catalog custom methods.
For each custom method, note:
- Method name
- Input parameters (these become the contract Payload fields)
- Return type (this becomes the contract Success shape)
- Whether it can fail (this determines the contract Failure)

If no server repo exists for this entity, skip this step. The repo contract will have empty extensions.

### Step 3: Create `{Entity}.errors.ts`

Create error classes using `S.TaggedError` with `$I.annotationsHttp`. At minimum:
- `{Entity}NotFoundError` (status 404) -- for any entity that has a Get operation
- `{Entity}PermissionDeniedError` (status 403) -- if the entity has mutation operations (create/update/delete)

Add additional errors as needed based on the server repo methods.

End the file with an aggregate `Errors` union + type alias.

### Step 4: Create contracts

For each operation, create `contracts/{Operation}.contract.ts` with:
- `Payload` -- S.Class with `$I` identity builder
- `Success` -- S.Class wrapping the result (or S.Void for delete)
- `Failure` -- const + type (S.Never for infallible, single error, or S.Union)
- `Contract` -- S.TaggedRequest with static `Rpc`, `Tool`, `Http`

**Minimum contracts for entities WITH server repos**:
- `Get.contract.ts` -- findById
- `Create.contract.ts` -- insert (if not read-only)
- `Update.contract.ts` -- update (if not read-only)
- `Delete.contract.ts` -- hardDelete or delete
- One contract per custom method that represents a distinct operation

**Minimum contracts for entities WITHOUT server repos**:
- `Get.contract.ts` -- findById
- `Delete.contract.ts` -- delete

**For CRUD-only entities** (no custom server methods beyond base CRUD):
- `Get.contract.ts`
- `Create.contract.ts`
- `Update.contract.ts`
- `Delete.contract.ts`

### Step 5: Create `contracts/index.ts`

Namespace barrel exports for all contracts:
```typescript
export * as Create from "./Create.contract";
export * as Delete from "./Delete.contract";
export * as Get from "./Get.contract";
// ... one per contract, alphabetically sorted
```

### Step 6: Create `{Entity}.repo.ts`

Define the repository contract shape:
```typescript
import { {IDENTITY_BUILDER} } from "@beep/identity/packages";
import type * as DbRepo from "@beep/shared-domain/factories/db-repo";
import * as Context from "effect/Context";
import type * as {Entity} from "./{Entity}.model";
import type { Get, Create, ... } from "./contracts";

const $I = {IDENTITY_BUILDER}.create("entities/{Entity}/{Entity}.repo");

export type RepoShape = DbRepo.DbRepoSuccess<
  typeof {Entity}.Model,
  {
    // One DbRepo.Method per custom method from server repo
    readonly customMethodName: DbRepo.Method<{
      payload: typeof CustomOperation.Payload;
      success: typeof CustomOperation.Success;
      failure?: typeof CustomOperation.Failure;  // omit for infallible
    }>;
  }
>;

export class Repo extends Context.Tag($I`Repo`)<Repo, RepoShape>() {}
```

For CRUD-only entities with no custom methods:
```typescript
export type RepoShape = DbRepo.DbRepoSuccess<typeof {Entity}.Model, {}>;
```

### Step 7: Create `{Entity}.rpc.ts`

```typescript
import * as RpcGroup from "@effect/rpc/RpcGroup";
import { Get, Create, Update, Delete, ... } from "./contracts";

export class Rpcs extends RpcGroup.make(
  Get.Contract.Rpc,
  Create.Contract.Rpc,
  Update.Contract.Rpc,
  Delete.Contract.Rpc,
  // ... one per contract
) {}
```

### Step 8: Create `{Entity}.http.ts`

```typescript
import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import { Get, Create, Update, Delete, ... } from "./contracts";

export class Http extends HttpApiGroup.make("{plural-entity-name}")
  .add(Get.Contract.Http)
  .add(Create.Contract.Http)
  .add(Update.Contract.Http)
  .add(Delete.Contract.Http)
  .prefix("/{plural-entity-name}") {}
```

### Step 9: Create `{Entity}.tool.ts`

```typescript
import * as AiToolkit from "@effect/ai/Toolkit";
import { Get, Create, Update, Delete, ... } from "./contracts";

export const Toolkit = AiToolkit.make(
  Get.Contract.Tool,
  Create.Contract.Tool,
  Update.Contract.Tool,
  Delete.Contract.Tool,
);
```

### Step 10: Create `{Entity}.entity.ts`

```typescript
import * as ClusterSchema from "@effect/cluster/ClusterSchema";
import * as ClusterEntity from "@effect/cluster/Entity";
import { Rpcs } from "./{Entity}.rpc";

export const Entity = ClusterEntity.fromRpcGroup("Entity", Rpcs)
  .annotateRpcs(ClusterSchema.Persisted, true);
```

### Step 11: Update `index.ts`

```typescript
export * from "./{Entity}.entity";
export * from "./{Entity}.http";
export * from "./{Entity}.model";
export * from "./{Entity}.repo";
export * from "./{Entity}.tool";
export * as {Entity}Errors from "./{Entity}.errors";
export * as Rpcs from "./{Entity}.rpc";
export * as Contracts from "./contracts";
```

## Verification

After completing ALL entities in your batch:

```bash
bun run check --filter @beep/{SLICE_NAME}-domain
```

If this fails with type errors, fix them before marking your task as complete.

## Anti-Patterns to Avoid

Review the 8 anti-patterns in `.claude/skills/canonical-domain-entity.md`:
1. DO NOT pass union schema to `.addError()` -- chain `.addError()` individually
2. DO NOT forget `type Failure = typeof Failure.Type` (not `typeof Failure`)
3. DO NOT use plain `S.String` for entity IDs -- use branded EntityIds
4. DO NOT use runtime imports in repo files -- use `type` imports
5. DO NOT forget `$I.annotations(...)` on Payload/Success/Contract
6. DO NOT forget `static readonly` on contract derivations
7. DO NOT use flat exports for errors/rpcs/contracts -- use namespace exports
8. DO NOT add `cause` field to error schemas

## What NOT to Change

- DO NOT modify the existing `*.model.ts` file (unless it needs trivial fixes)
- DO NOT modify server repo implementations
- DO NOT modify table schemas
- DO NOT modify client or UI code
- DO NOT change existing business logic
```

### Variable Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `{SLICE_NAME}` | Package scope name | `iam`, `shared`, `documents`, `knowledge`, `calendar`, `comms`, `customization` |
| `{SLICE_PATH}` | Path segment for the slice | `iam`, `shared`, `documents`, `knowledge`, `calendar`, `comms`, `customization` |
| `{IDENTITY_BUILDER}` | Identity builder for the slice | `$IamDomainId`, `$SharedDomainId`, `$DocumentsDomainId`, `$KnowledgeDomainId`, `$CalendarDomainId`, `$CommsDomainId`, `$CustomizationDomainId` |
| `{ENTITY_IDS_IMPORT}` | EntityIds module for the slice | `IamEntityIds`, `SharedEntityIds`, `DocumentsEntityIds`, `KnowledgeEntityIds`, `CalendarEntityIds` |
| `{ENTITY_LIST}` | Comma-separated entity names | `Account, ApiKey, DeviceCode, Invitation, Jwks` |
| `{ENTITY_DIR}` | Current directory name | `api-key` (kebab) or `ApiKey` (PascalCase) |
| `{ENTITY_FILE_PREFIX}` | Current file prefix | `api-key` (kebab) or `ApiKey` (PascalCase) |
| `{PASCAL_NAME}` | Target PascalCase name | `ApiKey`, `UploadSession`, `CalendarEvent` |
| `{SERVER_REPO_PATH}` | Path to server repos | `packages/iam/server/src/db/repos` |

---

## 2. Verification Agent (package-error-fixer)

Used in Phase 5 for cleanup.

### Prompt

```
You are fixing type and lint errors across domain packages after a large-scale entity migration.

## Context

56 domain entities were migrated to the canonical TaggedRequest contract pattern across 7 slices.
Each entity now has: *.model.ts, *.errors.ts, *.repo.ts, *.rpc.ts, *.http.ts, *.tool.ts,
*.entity.ts, contracts/, and index.ts.

The canonical pattern is documented in `.claude/skills/canonical-domain-entity.md`.
The reference implementation is `packages/documents/domain/src/entities/Comment/`.

## Your Task

### Step 1: Regenerate Barrel Exports

Run for each domain package:
```bash
bunx effect generate --cwd packages/shared/domain
bunx effect generate --cwd packages/iam/domain
bunx effect generate --cwd packages/documents/domain
bunx effect generate --cwd packages/knowledge/domain
bunx effect generate --cwd packages/calendar/domain
bunx effect generate --cwd packages/comms/domain
bunx effect generate --cwd packages/customization/domain
```

### Step 2: Run Type Check

```bash
bun run check
```

### Step 3: Fix Errors Per Slice

For each slice with errors:
1. Read the error output to identify the failing file and line
2. Read the failing file
3. Fix the error following the canonical pattern
4. Re-run `bun run check --filter @beep/<slice>-domain` to verify

Common error patterns:
- Missing imports (EntityIds, S, etc.)
- Wrong identity builder path string
- Missing `type` keyword on imports in repo files
- Barrel export conflicts (flat vs namespace)
- Missing `.addError()` chains in HTTP endpoints
- Wrong HTTP method for operation type

### Step 4: Run Lint

```bash
bun run lint:fix && bun run lint
```

Fix any remaining lint errors.

### Step 5: Document Pre-Existing Failures

If any failures exist that are NOT caused by this migration (they exist on the main branch too),
document them in `specs/pending/canonical-domain-entity-migration/outputs/pre-existing-failures.md`.

## What NOT to Change

- DO NOT modify server repos or table schemas
- DO NOT modify client or UI packages
- DO NOT add new business logic
- DO NOT change Entity model fields
```

---

## 3. Swarm Orchestrator Instructions

Detailed step-by-step for the orchestrating instance on how to run a migration wave as a swarm.

### Pre-Swarm Checklist

Before launching any swarm wave:

- [ ] Phase N-1 is fully complete with BOTH handoff documents
- [ ] `outputs/verified-inventory.md` exists with confirmed entity batches
- [ ] You have read the AGENT_PROMPTS.md template and customized variables
- [ ] Agents have access to `mcp__mcp-refactor-typescript` MCP tools (verify with ToolSearch)

### Step-by-Step Swarm Execution

#### 1. Create the Team

```
Use TeamCreate tool:
- team_name: "entity-migration-wave<N>"
- description: "Wave <N>: <brief purpose>"
```

This creates the team and its associated task list.

#### 2. Create Tasks

Use TaskCreate for each agent batch:

```
TaskCreate:
- subject: "Migrate Account, ApiKey, DeviceCode, Invitation, Jwks to canonical pattern"
- description: "Full agent prompt with all template variables filled in (copy from AGENT_PROMPTS.md Section 1 with variables replaced)"
- activeForm: "Migrating IAM batch 1 entities"
```

Repeat for each batch. You should have 3-5 tasks per wave.

#### 3. Spawn Teammates

For each task, spawn a teammate using the Task tool:

```
Task tool:
- team_name: "entity-migration-wave<N>"
- name: "iam-batch-1" (descriptive name matching the batch)
- subagent_type: "general-purpose" (needs file write access)
- prompt: "You are a teammate on the entity-migration-wave<N> team. Check TaskList for your assigned task, read the task description for your full instructions, and begin work."
```

IMPORTANT: Use a general-purpose agent type that has file write access. Read-only agents cannot create files.

#### 4. Assign Tasks to Teammates

```
TaskUpdate:
- taskId: "<task-id-from-step-2>"
- owner: "iam-batch-1"
```

#### 5. Monitor Progress

Periodically check TaskList to see status:
- `pending` -- not yet started
- `in_progress` -- agent is working
- `completed` -- agent finished successfully

Messages from teammates are delivered automatically. You do NOT need to poll.

#### 6. Handle Failures

If a teammate reports errors or goes idle without completing:

1. Read their last message for context
2. If the error is pattern-related, send a corrective message via SendMessage
3. If the agent is stuck, create a new task with refined instructions and spawn a new agent
4. If the same entity fails repeatedly, note it for manual handling in Phase 5

#### 7. Post-Wave Verification

After ALL teammates have completed their tasks:

```bash
bun run check --filter @beep/<slice>-domain
```

Run this for each slice modified in the wave.

#### 8. Shutdown the Swarm

```
For each teammate:
  SendMessage:
  - type: "shutdown_request"
  - recipient: "<agent-name>"
  - content: "Wave complete, shutting down."

Wait for all shutdown confirmations.

TeamDelete (cleans up team resources)
```

#### 9. Create Handoff Documents

Create BOTH:
- `handoffs/HANDOFF_P<N+1>.md`
- `handoffs/P<N+1>_ORCHESTRATOR_PROMPT.md`

Include:
- Which entities were completed
- Any patterns that worked well or failed
- Any entities that need manual attention
- Batch assignments for the next wave
- Learnings from REFLECTION_LOG.md

### Agent Concurrency Guidelines

| Wave | Entities | Recommended Agents | Entities per Agent |
|------|----------|-------------------|-------------------|
| Wave 1 (Simple) | ~22 | 4 | 5-7 |
| Wave 2 (Medium) | ~14 | 4 | 3-4 |
| Wave 3 (Complex) | 19 | 5 | 2-6 (complexity-based) |

**Rationale**: 4-5 agents is the sweet spot. More agents increases coordination overhead without proportional speedup. Fewer agents leaves parallelism on the table.
