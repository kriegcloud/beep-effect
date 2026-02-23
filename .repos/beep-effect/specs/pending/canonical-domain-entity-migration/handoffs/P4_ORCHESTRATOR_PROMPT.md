# Phase 4 Orchestrator Prompt

Copy-paste this prompt to start Phase 4 implementation.

---

## Prompt

You are implementing Phase 4 of the canonical-domain-entity-migration spec: Wave 3 Knowledge Entity Migration.

### Context

Phase 3 migrated 14 entities (8 Shared + 6 Documents) to the canonical pattern. All pass type checks. Total canonical so far: 37 of 58. Phase 4 will migrate 19 Knowledge entities to reach 56 of 58.

**Key Phase 3 learnings (MANDATORY rules for this phase)**:
1. **Single barrel owner rule**: The ORCHESTRATOR updates barrel files AFTER all agents complete. Agents MUST NOT modify barrel files (`entities/index.ts`).
2. **Entity complexity budget**: Entities with >8 custom methods get their own agent. SameAsLink has 7 methods — borderline but OK to batch.
3. **Turn budget**: Use `max_turns: 150` for agents handling entities with >5 custom methods total in their batch.
4. **Cleanup as orchestrator step**: Agents do NOT delete old directories. One cleanup agent at the end (though for Knowledge, no directories need renaming or deleting).
5. **Pre-flight EntityId verification**: Orchestrator verifies all EntityIds before spawning agents.

### Your Mission

Orchestrate a swarm of 5 parallel agents to migrate 19 Knowledge entities to the canonical domain entity pattern.

**Important**: All 19 Knowledge entity directories are already PascalCase. There is NO rename step -- agents just add canonical files to existing directories.

---

### Pre-flight Checklist

Before spawning agents, perform these verification steps:

```
1. Verify all KnowledgeEntityIds exist:
   Read: packages/shared/domain/src/entity-ids/knowledge/ids.ts
   Confirm these 19 IDs exist:
   - KnowledgeAgentId, BatchExecutionId, ClassDefinitionId
   - EmailThreadId, EmailThreadMessageId, EmbeddingId
   - KnowledgeEntityId, EntityClusterId, ExtractionId
   - MeetingPrepBulletId, MeetingPrepEvidenceId, MentionId
   - MentionRecordId, MergeHistoryId, OntologyId
   - PropertyDefinitionId, RelationId, RelationEvidenceId, SameAsLinkId

2. Read barrel file state:
   Read: packages/knowledge/domain/src/entities/index.ts
   Confirm: 18 exports (Agent omitted), all PascalCase paths

3. Confirm canonical reference is accessible:
   Read: packages/documents/domain/src/entities/Comment/Comment.repo.ts
   Read: packages/documents/domain/src/entities/Comment/Comment.errors.ts

4. Confirm skill file is readable:
   Read: .claude/skills/canonical-domain-entity.md
```

---

### Batch Descriptions

#### Batch 1: No-Repo Entities (5 entities)

**Entities**:
- **Agent** — `KnowledgeEntityIds.KnowledgeAgentId` — NO repo — Model file is `KnowledgeAgent.model.ts` (prefixed), NOT in barrel, ~900 lines with PipelineState ADT
- **Batch** — `KnowledgeEntityIds.BatchExecutionId` — NO repo — Uses `DocumentsEntityIds.DocumentId` array
- **EmailThread** — `KnowledgeEntityIds.EmailThreadId` — NO repo — Gmail thread aggregation, uses `IamEntityIds.AccountId`
- **EmailThreadMessage** — `KnowledgeEntityIds.EmailThreadMessageId` — NO repo — Thread-to-document mapping, uses `IamEntityIds.AccountId`
- **Extraction** — `KnowledgeEntityIds.ExtractionId` — NO repo — Extraction status tracking

**Pattern**: All CRUD-only with empty repo extensions. Create error schemas (NotFound + PermissionDenied), repo contract with empty extensions, Get + Delete contracts, RPC/HTTP/Tool/Entity files.

**Agent special case**: ALL files must use `KnowledgeAgent.*` prefix (e.g., `KnowledgeAgent.errors.ts`, `KnowledgeAgent.repo.ts`). Do NOT use `Agent.*` prefix. Agent is NOT in barrel -- do NOT add it.

#### Batch 2: CRUD-Only Repos (3 entities)

**Entities**:
- **ClassDefinition** — `KnowledgeEntityIds.ClassDefinitionId` — CRUD-only repo — OWL/RDFS class definitions
- **Ontology** — `KnowledgeEntityIds.OntologyId` — CRUD-only repo — OWL/RDFS metadata
- **PropertyDefinition** — `KnowledgeEntityIds.PropertyDefinitionId` — CRUD-only repo — OWL/RDFS properties

**Pattern**: Same as Batch 1 but these have existing server repos (CRUD only, zero custom methods). Empty repo extensions, Get + Delete contracts only.

**Server repo files to read** (for verification only -- no custom methods to extract):
- `packages/knowledge/server/src/db/repos/ClassDefinition.repo.ts`
- `packages/knowledge/server/src/db/repos/Ontology.repo.ts`
- `packages/knowledge/server/src/db/repos/PropertyDefinition.repo.ts`

#### Batch 3: Simple Custom Repos (4 entities)

**Entities**:
- **MeetingPrepBullet** — `KnowledgeEntityIds.MeetingPrepBulletId` — 1 custom method
- **MeetingPrepEvidence** — `KnowledgeEntityIds.MeetingPrepEvidenceId` — 1 custom method
- **Mention** — `KnowledgeEntityIds.MentionId` — 3 custom methods — Entity mentions with char offsets
- **RelationEvidence** — `KnowledgeEntityIds.RelationEvidenceId` — 3 custom methods — ILIKE text search

**8 custom methods total**. Read actual server repo implementations for exact method signatures:
- `packages/knowledge/server/src/db/repos/MeetingPrepBullet.repo.ts`
- `packages/knowledge/server/src/db/repos/MeetingPrepEvidence.repo.ts`
- `packages/knowledge/server/src/db/repos/Mention.repo.ts`
- `packages/knowledge/server/src/db/repos/RelationEvidence.repo.ts`

Create contracts for each custom method + Get + Delete.

#### Batch 4: Medium Custom Repos (4 entities)

**Entities**:
- **Embedding** — `KnowledgeEntityIds.EmbeddingId` — 4 custom methods — pgvector, custom `SimilarityResult` return type, `EMBEDDING_DIMENSION` constant
- **MentionRecord** — `KnowledgeEntityIds.MentionRecordId` — 4 custom methods — `updateResolvedEntityId` uses raw UPDATE SQL (non-DbRepo pattern)
- **MergeHistory** — `KnowledgeEntityIds.MergeHistoryId` — 4 custom methods — Entity merge audit trail
- **EntityCluster** — `KnowledgeEntityIds.EntityClusterId` — 5 custom methods — JSONB `@>` containment operators

**17 custom methods total**. Higher complexity.

**Server repo files to read**:
- `packages/knowledge/server/src/db/repos/Embedding.repo.ts`
- `packages/knowledge/server/src/db/repos/MentionRecord.repo.ts`
- `packages/knowledge/server/src/db/repos/MergeHistory.repo.ts`
- `packages/knowledge/server/src/db/repos/EntityCluster.repo.ts`

**Special notes**:
- Embedding: Read model file to find `SimilarityResult` type and `EMBEDDING_DIMENSION` constant. The repo returns custom result types for similarity search -- define these as schemas in the domain.
- MentionRecord: `updateResolvedEntityId` bypasses DbRepo CRUD. Still capture the method signature in repo extensions.
- EntityCluster: JSONB containment queries. Capture exact method signatures from server repo.

#### Batch 5: Complex Repos (3 entities)

**Entities**:
- **Entity** — `KnowledgeEntityIds.KnowledgeEntityId` — 5 custom methods — pg_trgm fuzzy search, JSONB containment
- **Relation** — `KnowledgeEntityIds.RelationId` — 5 custom methods — Subject-predicate-object triples
- **SameAsLink** — `KnowledgeEntityIds.SameAsLinkId` — 7 custom methods — **Recursive CTE** for canonical resolution

**17 custom methods total**. Most complex Knowledge entities.

**Server repo files to read**:
- `packages/knowledge/server/src/db/repos/Entity.repo.ts`
- `packages/knowledge/server/src/db/repos/Relation.repo.ts`
- `packages/knowledge/server/src/db/repos/SameAsLink.repo.ts`

**Special notes**:
- Entity: Uses pg_trgm for fuzzy text search. Define fuzzy search payload/result types carefully.
- SameAsLink: `resolveCanonical` uses a recursive CTE to walk sameAs chains. The repo extension must capture the recursive resolution method signature accurately.
- Relation: Subject-predicate-object triple queries. Read actual repo for join patterns.

---

### Swarm Execution Steps

**Step 1: Create Team**
```
TeamCreate:
  team_name: "entity-migration-wave3"
  description: "Wave 3: Migrate 19 Knowledge entities to canonical pattern"
```

**Step 2: Create Tasks (5 tasks, one per batch)**

Task 1 (no-repo):
```
TaskCreate:
  subject: "Migrate Agent, Batch, EmailThread, EmailThreadMessage, Extraction to canonical pattern"
  description: "Migrate 5 Knowledge entities with no server repos. All use empty repo extensions + Get + Delete contracts. Agent uses KnowledgeAgent prefix and stays omitted from barrel."
  activeForm: "Migrating no-repo Knowledge entities"
```

Task 2 (crud-repos):
```
TaskCreate:
  subject: "Migrate ClassDefinition, Ontology, PropertyDefinition to canonical pattern"
  description: "Migrate 3 Knowledge entities with CRUD-only server repos. Empty repo extensions, Get + Delete contracts only. OWL/RDFS ontology infrastructure."
  activeForm: "Migrating CRUD-only Knowledge entities"
```

Task 3 (simple-custom):
```
TaskCreate:
  subject: "Migrate MeetingPrepBullet, MeetingPrepEvidence, Mention, RelationEvidence with custom repo methods"
  description: "Migrate 4 Knowledge entities with 8 custom methods total. Standard query patterns. Read server repos for exact signatures. Create contracts for each custom method."
  activeForm: "Migrating simple custom Knowledge entities"
```

Task 4 (medium-custom):
```
TaskCreate:
  subject: "Migrate Embedding, MentionRecord, MergeHistory, EntityCluster with custom repo methods"
  description: "Migrate 4 Knowledge entities with 17 custom methods total. Embedding has SimilarityResult + EMBEDDING_DIMENSION. MentionRecord has raw UPDATE. EntityCluster has JSONB containment. max_turns: 150."
  activeForm: "Migrating medium custom Knowledge entities"
```

Task 5 (complex):
```
TaskCreate:
  subject: "Migrate Entity, Relation, SameAsLink with complex custom repo methods"
  description: "Migrate 3 Knowledge entities with 17 custom methods total. Entity has pg_trgm. SameAsLink has recursive CTE. Most complex Knowledge entities. max_turns: 150."
  activeForm: "Migrating complex Knowledge entities"
```

**Step 3: Spawn Teammates (5 agents)**

Agent 1 (no-repo):
```
Task tool:
  subagent_type: "effect-code-writer"
  team_name: "entity-migration-wave3"
  name: "no-repo"
  mode: "bypassPermissions"
  run_in_background: true
  prompt: |
    You are migrating 5 Knowledge entities (with NO server repos) to the canonical domain entity pattern.

    ## IMPORTANT RULES
    1. Do NOT modify the barrel file (entities/index.ts). The orchestrator handles barrel updates.
    2. Do NOT delete old directories. The orchestrator handles cleanup.
    3. Since all Knowledge entities are already PascalCase, there is NO rename step — just add canonical files to existing directories.
    4. Read .claude/skills/canonical-domain-entity.md for the authoritative pattern.
    5. Read packages/documents/domain/src/entities/Comment/ for the canonical reference implementation.

    ## Identity Builder
    ALL Knowledge entities use:
    ```typescript
    import { $KnowledgeDomainId } from "@beep/identity/packages";
    const $I = $KnowledgeDomainId.create("entities/<EntityDir>/<EntityName>.model");
    ```

    ## Entities to migrate

    ### 1. Agent
    - Directory: `packages/knowledge/domain/src/entities/Agent/`
    - EntityId: `KnowledgeEntityIds.KnowledgeAgentId`
    - **CRITICAL**: ALL files must use `KnowledgeAgent` prefix:
      - `KnowledgeAgent.errors.ts` (NOT `Agent.errors.ts`)
      - `KnowledgeAgent.repo.ts` (NOT `Agent.repo.ts`)
      - `KnowledgeAgent.rpc.ts`, `KnowledgeAgent.http.ts`, `KnowledgeAgent.tool.ts`, `KnowledgeAgent.entity.ts`
    - The model file is already `KnowledgeAgent.model.ts` — preserve it as-is
    - Identity path: `$KnowledgeDomainId.create("entities/Agent/KnowledgeAgent.model")`
    - NO repo, empty repo extensions
    - Do NOT add Agent to the barrel (it is intentionally omitted)

    ### 2. Batch
    - Directory: `packages/knowledge/domain/src/entities/Batch/`
    - EntityId: `KnowledgeEntityIds.BatchExecutionId`
    - NO repo, empty repo extensions
    - Uses `DocumentsEntityIds.DocumentId` array in its model

    ### 3. EmailThread
    - Directory: `packages/knowledge/domain/src/entities/EmailThread/`
    - EntityId: `KnowledgeEntityIds.EmailThreadId`
    - NO repo, empty repo extensions
    - Uses `IamEntityIds.AccountId`

    ### 4. EmailThreadMessage
    - Directory: `packages/knowledge/domain/src/entities/EmailThreadMessage/`
    - EntityId: `KnowledgeEntityIds.EmailThreadMessageId`
    - NO repo, empty repo extensions
    - Uses `IamEntityIds.AccountId`, `DocumentsEntityIds.DocumentId`, `DocumentsEntityIds.DocumentVersionId`

    ### 5. Extraction
    - Directory: `packages/knowledge/domain/src/entities/Extraction/`
    - EntityId: `KnowledgeEntityIds.ExtractionId`
    - NO repo, empty repo extensions
    - Extraction status tracking

    ## For each entity:
    1. Read the existing model file to understand the entity structure
    2. Create error schemas (NotFound + PermissionDenied) with `$I.annotationsHttp`
    3. Create repo contract with empty extensions: `DbRepo.DbRepoSuccess<typeof Model, {}>`
    4. Create contracts/ directory with Get.contract.ts + Delete.contract.ts
    5. Create RPC, HTTP, Tool, Entity infrastructure files
    6. Update the entity's own `index.ts` to re-export all new files
```

Agent 2 (crud-repos):
```
Task tool:
  subagent_type: "effect-code-writer"
  team_name: "entity-migration-wave3"
  name: "crud-repos"
  mode: "bypassPermissions"
  run_in_background: true
  prompt: |
    You are migrating 3 Knowledge entities (with CRUD-only server repos) to the canonical domain entity pattern.

    ## IMPORTANT RULES
    1. Do NOT modify the barrel file (entities/index.ts). The orchestrator handles barrel updates.
    2. Do NOT delete old directories. The orchestrator handles cleanup.
    3. Since all Knowledge entities are already PascalCase, there is NO rename step — just add canonical files to existing directories.
    4. Read .claude/skills/canonical-domain-entity.md for the authoritative pattern.
    5. Read packages/documents/domain/src/entities/Comment/ for the canonical reference implementation.

    ## Identity Builder
    ```typescript
    import { $KnowledgeDomainId } from "@beep/identity/packages";
    const $I = $KnowledgeDomainId.create("entities/<EntityDir>/<EntityName>.model");
    ```

    ## Entities to migrate

    ### 1. ClassDefinition
    - Directory: `packages/knowledge/domain/src/entities/ClassDefinition/`
    - EntityId: `KnowledgeEntityIds.ClassDefinitionId`
    - CRUD-only repo, empty repo extensions
    - Server repo (read only for verification): `packages/knowledge/server/src/db/repos/ClassDefinition.repo.ts`
    - OWL/RDFS class definitions

    ### 2. Ontology
    - Directory: `packages/knowledge/domain/src/entities/Ontology/`
    - EntityId: `KnowledgeEntityIds.OntologyId`
    - CRUD-only repo, empty repo extensions
    - Server repo: `packages/knowledge/server/src/db/repos/Ontology.repo.ts`
    - OWL/RDFS metadata

    ### 3. PropertyDefinition
    - Directory: `packages/knowledge/domain/src/entities/PropertyDefinition/`
    - EntityId: `KnowledgeEntityIds.PropertyDefinitionId`
    - CRUD-only repo, empty repo extensions
    - Server repo: `packages/knowledge/server/src/db/repos/PropertyDefinition.repo.ts`
    - OWL/RDFS properties

    ## For each entity:
    1. Read the existing model file to understand the entity structure
    2. Read the server repo file to confirm CRUD-only (no custom methods)
    3. Create error schemas (NotFound + PermissionDenied) with `$I.annotationsHttp`
    4. Create repo contract with empty extensions: `DbRepo.DbRepoSuccess<typeof Model, {}>`
    5. Create contracts/ directory with Get.contract.ts + Delete.contract.ts
    6. Create RPC, HTTP, Tool, Entity infrastructure files
    7. Update the entity's own `index.ts` to re-export all new files
```

Agent 3 (simple-custom):
```
Task tool:
  subagent_type: "effect-code-writer"
  team_name: "entity-migration-wave3"
  name: "simple-custom"
  mode: "bypassPermissions"
  run_in_background: true
  prompt: |
    You are migrating 4 Knowledge entities with simple custom repo methods to the canonical domain entity pattern.

    ## IMPORTANT RULES
    1. Do NOT modify the barrel file (entities/index.ts). The orchestrator handles barrel updates.
    2. Do NOT delete old directories. The orchestrator handles cleanup.
    3. Since all Knowledge entities are already PascalCase, there is NO rename step — just add canonical files to existing directories.
    4. Read .claude/skills/canonical-domain-entity.md for the authoritative pattern.
    5. Read packages/documents/domain/src/entities/Comment/ for the canonical reference implementation.
    6. Read packages/documents/domain/src/entities/Comment/Comment.repo.ts for custom repo extension patterns.

    ## Identity Builder
    ```typescript
    import { $KnowledgeDomainId } from "@beep/identity/packages";
    const $I = $KnowledgeDomainId.create("entities/<EntityDir>/<EntityName>.model");
    ```

    ## Entities to migrate

    ### 1. MeetingPrepBullet — 1 custom method
    - Directory: `packages/knowledge/domain/src/entities/MeetingPrepBullet/`
    - EntityId: `KnowledgeEntityIds.MeetingPrepBulletId`
    - Server repo: `packages/knowledge/server/src/db/repos/MeetingPrepBullet.repo.ts`
    - Read server repo for exact method signatures

    ### 2. MeetingPrepEvidence — 1 custom method
    - Directory: `packages/knowledge/domain/src/entities/MeetingPrepEvidence/`
    - EntityId: `KnowledgeEntityIds.MeetingPrepEvidenceId`
    - Server repo: `packages/knowledge/server/src/db/repos/MeetingPrepEvidence.repo.ts`
    - Read server repo for exact method signatures

    ### 3. Mention — 3 custom methods
    - Directory: `packages/knowledge/domain/src/entities/Mention/`
    - EntityId: `KnowledgeEntityIds.MentionId`
    - Server repo: `packages/knowledge/server/src/db/repos/Mention.repo.ts`
    - Entity mentions with char offsets
    - Read server repo for exact method signatures

    ### 4. RelationEvidence — 3 custom methods
    - Directory: `packages/knowledge/domain/src/entities/RelationEvidence/`
    - EntityId: `KnowledgeEntityIds.RelationEvidenceId`
    - Server repo: `packages/knowledge/server/src/db/repos/RelationEvidence.repo.ts`
    - ILIKE text search
    - Read server repo for exact method signatures

    ## CRITICAL: Read server repo implementations FIRST
    You MUST read each server repo file to understand exact method signatures before defining repo extensions.
    Define repo extensions with `DbRepo.Method<{payload, success, failure?}>` for EACH custom method.
    Create a contract file for each custom method + Get + Delete.

    ## For each entity:
    1. Read the existing model file
    2. Read the server repo file to extract custom method signatures
    3. Create error schemas (NotFound + PermissionDenied) with `$I.annotationsHttp`
    4. Create repo contract with typed extensions matching server implementation
    5. Create contracts/ directory with Get + Delete + per-custom-method contracts
    6. Create RPC, HTTP, Tool, Entity infrastructure files
    7. Update the entity's own `index.ts` to re-export all new files
```

Agent 4 (medium-custom):
```
Task tool:
  subagent_type: "effect-code-writer"
  team_name: "entity-migration-wave3"
  name: "medium-custom"
  mode: "bypassPermissions"
  run_in_background: true
  max_turns: 150
  prompt: |
    You are migrating 4 Knowledge entities with medium-complexity custom repo methods to the canonical domain entity pattern.

    ## IMPORTANT RULES
    1. Do NOT modify the barrel file (entities/index.ts). The orchestrator handles barrel updates.
    2. Do NOT delete old directories. The orchestrator handles cleanup.
    3. Since all Knowledge entities are already PascalCase, there is NO rename step — just add canonical files to existing directories.
    4. Read .claude/skills/canonical-domain-entity.md for the authoritative pattern.
    5. Read packages/documents/domain/src/entities/Comment/ for the canonical reference implementation.
    6. Read packages/documents/domain/src/entities/Comment/Comment.repo.ts for custom repo extension patterns.

    ## Identity Builder
    ```typescript
    import { $KnowledgeDomainId } from "@beep/identity/packages";
    const $I = $KnowledgeDomainId.create("entities/<EntityDir>/<EntityName>.model");
    ```

    ## Entities to migrate

    ### 1. Embedding — 4 custom methods
    - Directory: `packages/knowledge/domain/src/entities/Embedding/`
    - EntityId: `KnowledgeEntityIds.EmbeddingId`
    - Server repo: `packages/knowledge/server/src/db/repos/Embedding.repo.ts`
    - **Special**: Has custom `SimilarityResult` return type — define as a schema in domain
    - **Special**: Has `EMBEDDING_DIMENSION` constant — preserve from model file
    - **Special**: Has `EmbeddingVector` transform schema — preserve from model file
    - pgvector similarity search operations

    ### 2. MentionRecord — 4 custom methods
    - Directory: `packages/knowledge/domain/src/entities/MentionRecord/`
    - EntityId: `KnowledgeEntityIds.MentionRecordId`
    - Server repo: `packages/knowledge/server/src/db/repos/MentionRecord.repo.ts`
    - **Special**: `updateResolvedEntityId` uses raw UPDATE SQL (non-DbRepo pattern)
    - Still capture the method signature in repo extensions even though implementation is non-standard

    ### 3. MergeHistory — 4 custom methods
    - Directory: `packages/knowledge/domain/src/entities/MergeHistory/`
    - EntityId: `KnowledgeEntityIds.MergeHistoryId`
    - Server repo: `packages/knowledge/server/src/db/repos/MergeHistory.repo.ts`
    - Entity merge audit trail

    ### 4. EntityCluster — 5 custom methods
    - Directory: `packages/knowledge/domain/src/entities/EntityCluster/`
    - EntityId: `KnowledgeEntityIds.EntityClusterId`
    - Server repo: `packages/knowledge/server/src/db/repos/EntityCluster.repo.ts`
    - **Special**: JSONB `@>` containment operators for querying
    - Cluster management operations

    ## CRITICAL: Read server repo implementations FIRST
    You MUST read each server repo file to understand exact method signatures before defining repo extensions.
    For Embedding, also read the model file to find SimilarityResult, EMBEDDING_DIMENSION, and EmbeddingVector.
    Define repo extensions with `DbRepo.Method<{payload, success, failure?}>` for EACH custom method.
    Create a contract file for each custom method + Get + Delete.

    ## For each entity:
    1. Read the existing model file
    2. Read the server repo file to extract custom method signatures
    3. Create error schemas (NotFound + PermissionDenied) with `$I.annotationsHttp`
    4. Create repo contract with typed extensions matching server implementation
    5. Create contracts/ directory with Get + Delete + per-custom-method contracts
    6. Create RPC, HTTP, Tool, Entity infrastructure files
    7. Update the entity's own `index.ts` to re-export all new files
```

Agent 5 (complex):
```
Task tool:
  subagent_type: "effect-code-writer"
  team_name: "entity-migration-wave3"
  name: "complex"
  mode: "bypassPermissions"
  run_in_background: true
  max_turns: 150
  prompt: |
    You are migrating 3 Knowledge entities with the most complex custom repo methods to the canonical domain entity pattern.

    ## IMPORTANT RULES
    1. Do NOT modify the barrel file (entities/index.ts). The orchestrator handles barrel updates.
    2. Do NOT delete old directories. The orchestrator handles cleanup.
    3. Since all Knowledge entities are already PascalCase, there is NO rename step — just add canonical files to existing directories.
    4. Read .claude/skills/canonical-domain-entity.md for the authoritative pattern.
    5. Read packages/documents/domain/src/entities/Comment/ for the canonical reference implementation.
    6. Read packages/documents/domain/src/entities/Comment/Comment.repo.ts for custom repo extension patterns.

    ## Identity Builder
    ```typescript
    import { $KnowledgeDomainId } from "@beep/identity/packages";
    const $I = $KnowledgeDomainId.create("entities/<EntityDir>/<EntityName>.model");
    ```

    ## Entities to migrate

    ### 1. Entity — 5 custom methods
    - Directory: `packages/knowledge/domain/src/entities/Entity/`
    - EntityId: `KnowledgeEntityIds.KnowledgeEntityId`
    - Server repo: `packages/knowledge/server/src/db/repos/Entity.repo.ts`
    - **Special**: pg_trgm fuzzy search — read repo for exact fuzzy search query signatures
    - **Special**: JSONB containment queries
    - Note: The entity is named "Entity" but its EntityId is `KnowledgeEntityId` (disambiguated)

    ### 2. Relation — 5 custom methods
    - Directory: `packages/knowledge/domain/src/entities/Relation/`
    - EntityId: `KnowledgeEntityIds.RelationId`
    - Server repo: `packages/knowledge/server/src/db/repos/Relation.repo.ts`
    - Subject-predicate-object triples
    - Read repo carefully for join patterns and query signatures

    ### 3. SameAsLink — 7 custom methods
    - Directory: `packages/knowledge/domain/src/entities/SameAsLink/`
    - EntityId: `KnowledgeEntityIds.SameAsLinkId`
    - Server repo: `packages/knowledge/server/src/db/repos/SameAsLink.repo.ts`
    - **Special**: `resolveCanonical` uses a **recursive CTE** to walk sameAs chains
    - This is the most complex repo method in the Knowledge slice
    - Capture the recursive resolution signature accurately in repo extensions

    ## CRITICAL: Read server repo implementations FIRST
    You MUST read each server repo file to understand exact method signatures before defining repo extensions.
    Pay special attention to:
    - Entity.repo: pg_trgm and JSONB containment patterns
    - SameAsLink.repo: Recursive CTE for resolveCanonical
    - Relation.repo: Triple query patterns with joins

    Define repo extensions with `DbRepo.Method<{payload, success, failure?}>` for EACH custom method.
    Create a contract file for each custom method + Get + Delete.

    ## For each entity:
    1. Read the existing model file
    2. Read the server repo file to extract custom method signatures
    3. Create error schemas (NotFound + PermissionDenied) with `$I.annotationsHttp`
    4. Create repo contract with typed extensions matching server implementation
    5. Create contracts/ directory with Get + Delete + per-custom-method contracts
    6. Create RPC, HTTP, Tool, Entity infrastructure files
    7. Update the entity's own `index.ts` to re-export all new files
```

**Step 4: Assign Tasks**
```
TaskUpdate: taskId: <task-1-id>, owner: "no-repo"
TaskUpdate: taskId: <task-2-id>, owner: "crud-repos"
TaskUpdate: taskId: <task-3-id>, owner: "simple-custom"
TaskUpdate: taskId: <task-4-id>, owner: "medium-custom"
TaskUpdate: taskId: <task-5-id>, owner: "complex"
```

**Step 5: Monitor via TaskList**

Check periodically. If agents encounter issues, send follow-up messages with specific file lists.

For agents that run out of turns, send a message listing exactly what files are still missing. This is more effective than asking for status.

**Step 6: Post-Agent Orchestrator Cleanup**

After ALL 5 agents complete:

```
1. Barrel file check:
   - Read: packages/knowledge/domain/src/entities/index.ts
   - Verify: All 18 entities still exported (Agent still omitted)
   - Since directories are already PascalCase, barrel paths should be unchanged
   - If any agent accidentally modified the barrel, restore it

2. Import path sweep (should find nothing):
   grep -r 'from "@beep/knowledge-domain/entities/[a-z]' packages/

3. No old directories to delete (no renaming happened)

4. Run isolated type checks:
   bunx tsc --noEmit -p packages/knowledge/domain/tsconfig.json
   bunx tsc --noEmit -p packages/knowledge/tables/tsconfig.json
   bunx tsc --noEmit -p packages/knowledge/server/tsconfig.json
```

**Step 7: Verify Results**

```bash
# Knowledge packages
bun run check --filter @beep/knowledge-domain
bun run check --filter @beep/knowledge-tables
bun run check --filter @beep/knowledge-server
```

If errors, use `package-error-fixer` agent per package. Pre-existing errors in PromptTemplates tests (32 failures) and TestLayers.ts / GmailExtractionAdapter.test.ts type errors are NOT related to this migration.

---

### Success Criteria

Phase 4 is complete when:
- [ ] All 19 entities have full canonical module structure (errors, repo, rpc, http, tool, entity, contracts/)
- [ ] All entities have error schemas with correct HTTP status annotations via `$I.annotationsHttp`
- [ ] No-repo entities (5) have empty repo extensions + Get + Delete contracts
- [ ] CRUD-only entities (3) have empty repo extensions + Get + Delete contracts
- [ ] Custom method entities (11) have typed repo extensions + full contract sets matching server implementations
- [ ] Agent entity uses `KnowledgeAgent` prefix consistently and remains omitted from barrel
- [ ] Embedding entity preserves `EMBEDDING_DIMENSION` constant and defines `SimilarityResult` schema
- [ ] SameAsLink entity captures recursive CTE method signature in repo contract
- [ ] All Knowledge packages pass type checks
- [ ] `REFLECTION_LOG.md` updated with Phase 4 learnings
- [ ] `handoffs/HANDOFF_P5.md` created if any remaining entities exist

### Next Phase

After completing Phase 4:
- Total canonical entities: **56 of 58**
- Only 2 entities may remain un-canonical (if any stragglers from earlier phases)
- Final phase (if needed) handles stragglers + full monorepo verification with `bun run check`
- Consider running full `bun run build` as final validation
