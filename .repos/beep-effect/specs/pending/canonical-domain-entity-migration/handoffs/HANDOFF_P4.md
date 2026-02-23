# Phase 4 Handoff: Wave 3 — Knowledge Entity Migration

## Phase 3 Summary

Phase 3 migrated 14 entities (8 Shared + 6 Documents) to the canonical pattern:

- All 14 entities now have: PascalCase directories, error schemas (NotFound + PermissionDenied), repo contracts (empty or typed extensions), Get + Delete contracts (+ custom method contracts), RPC/HTTP/Tool/Entity infrastructure, barrel exports
- All domain packages pass type checks: `@beep/shared-domain`, `@beep/documents-domain`
- Downstream consumers verified: `@beep/shared-tables`, `@beep/shared-server`, `@beep/iam-server`, `@beep/documents-tables`, `@beep/documents-server`
- Total canonical entities after Phase 3: **37 of 58**

### Key Phase 3 Learnings

1. **Single barrel owner rule**: The ORCHESTRATOR updates barrel files AFTER all agents complete. Agents MUST NOT modify barrel files. Two agents updating the same barrel caused partial overwrites requiring manual reconciliation.
2. **Entity complexity budget**: Entities with >8 custom methods should get their own dedicated agent. Document (13 methods) exhausted agent turns when sharing a batch with 2 other entities.
3. **Turn budget**: Use `max_turns` parameter for complex agents. Estimate ~4 tool calls per simple entity, ~15 per custom-method entity, ~25 per legacy RPC entity.
4. **Cleanup as orchestrator step**: Agents do NOT delete old directories. One cleanup agent at the end handles all deletion with `bypassPermissions`.
5. **Pre-flight EntityId verification**: Orchestrator verifies all EntityIds exist before spawning agents. Missing EntityIds discovered mid-agent-execution waste turns.

---

## Wave 3 Scope

### Entity Inventory

**19 entities to migrate** in the Knowledge slice:

| Entity | Current Dir | Naming | Has Repo | Custom Methods | EntityId | Special Notes |
|--------|-----------|--------|----------|---------------|----------|---------------|
| Agent | `Agent/` | PascalCase | NO | 0 | `KnowledgeAgentId` | Model file is `KnowledgeAgent.model.ts` (prefixed); NOT in barrel; ~900 lines with PipelineState ADT |
| Batch | `Batch/` | PascalCase | NO | 0 | `BatchExecutionId` | Uses `DocumentsEntityIds.DocumentId` array |
| ClassDefinition | `ClassDefinition/` | PascalCase | YES | 0 (CRUD) | `ClassDefinitionId` | OWL/RDFS class definitions |
| EmailThread | `EmailThread/` | PascalCase | NO | 0 | `EmailThreadId` | Gmail thread aggregation |
| EmailThreadMessage | `EmailThreadMessage/` | PascalCase | NO | 0 | `EmailThreadMessageId` | Thread-to-document mapping |
| Embedding | `Embedding/` | PascalCase | YES | 4 | `EmbeddingId` | pgvector, custom `SimilarityResult` return type, `EMBEDDING_DIMENSION` constant |
| Entity | `Entity/` | PascalCase | YES | 5 | `KnowledgeEntityId` | pg_trgm fuzzy search, JSONB containment |
| EntityCluster | `EntityCluster/` | PascalCase | YES | 5 | `EntityClusterId` | JSONB `@>` containment operators |
| Extraction | `Extraction/` | PascalCase | NO | 0 | `ExtractionId` | Extraction status tracking |
| MeetingPrepBullet | `MeetingPrepBullet/` | PascalCase | YES | 1 | `MeetingPrepBulletId` | Simple ordered list |
| MeetingPrepEvidence | `MeetingPrepEvidence/` | PascalCase | YES | 1 | `MeetingPrepEvidenceId` | Citation rows |
| Mention | `Mention/` | PascalCase | YES | 3 | `MentionId` | Entity mentions with char offsets |
| MentionRecord | `MentionRecord/` | PascalCase | YES | 4 | `MentionRecordId` | Raw UPDATE SQL (non-DbRepo pattern) |
| MergeHistory | `MergeHistory/` | PascalCase | YES | 4 | `MergeHistoryId` | Entity merge audit trail |
| Ontology | `Ontology/` | PascalCase | YES | 0 (CRUD) | `OntologyId` | OWL/RDFS metadata |
| PropertyDefinition | `PropertyDefinition/` | PascalCase | YES | 0 (CRUD) | `PropertyDefinitionId` | OWL/RDFS properties |
| Relation | `Relation/` | PascalCase | YES | 5 | `RelationId` | Subject-predicate-object triples |
| RelationEvidence | `RelationEvidence/` | PascalCase | YES | 3 | `RelationEvidenceId` | ILIKE text search |
| SameAsLink | `SameAsLink/` | PascalCase | YES | 7 | `SameAsLinkId` | **Recursive CTE** for canonical resolution |

**Key facts**:
- All 19 directories are already PascalCase -- NO renaming needed
- 18 exported via barrel (Agent is omitted from `entities/index.ts`)
- 14 have server repos, 5 have no repo (Agent, Batch, EmailThread, EmailThreadMessage, Extraction)
- 46 total custom repo methods across 14 repos
- All entities are bare -- only have `*.model.ts`, need full canonical structure

---

## Batching Strategy

### Batch 1: No-Repo Entities (5 entities)

**Entities**: Agent, Batch, EmailThread, EmailThreadMessage, Extraction

**Characteristics**:
- All have no server repo -- create full module with empty repo extensions
- Agent uses `KnowledgeAgent` prefix for all files and is NOT in barrel (keep it omitted)
- Agent model is ~900 lines with `PipelineState` ADT -- preserve entire model, just add canonical scaffolding around it
- Simplest batch, follows exact Wave 1 CRUD-only pattern

**Identity builder**: `$KnowledgeDomainId` from `@beep/identity/packages`

### Batch 2: CRUD-Only Repos (3 entities)

**Entities**: ClassDefinition, Ontology, PropertyDefinition

**Characteristics**:
- All have server repos but CRUD-only (zero custom extensions)
- OWL/RDFS ontology infrastructure
- Empty repo extensions with Get + Delete contracts only

**Identity builder**: `$KnowledgeDomainId`

### Batch 3: Simple Custom Repos (4 entities)

**Entities**: MeetingPrepBullet (1 method), MeetingPrepEvidence (1 method), Mention (3 methods), RelationEvidence (3 methods)

**Characteristics**:
- 8 custom methods total
- Standard query patterns (findBy, listBy, bulk insert)
- RelationEvidence uses ILIKE text search

**Identity builder**: `$KnowledgeDomainId`

### Batch 4: Medium Custom Repos (4 entities)

**Entities**: Embedding (4 methods), MentionRecord (4 methods), MergeHistory (4 methods), EntityCluster (5 methods)

**Characteristics**:
- 17 custom methods total
- Embedding has custom `SimilarityResult` return type + `EmbeddingVector` transform schema + `EMBEDDING_DIMENSION` constant
- MentionRecord has non-standard raw UPDATE SQL (not using DbRepo pattern)
- EntityCluster has JSONB `@>` containment operators
- Higher complexity requires `max_turns: 150`

**Identity builder**: `$KnowledgeDomainId`

### Batch 5: Complex Repos (3 entities)

**Entities**: Entity (5 methods), Relation (5 methods), SameAsLink (7 methods)

**Characteristics**:
- 17 custom methods total
- Entity has pg_trgm fuzzy search + JSONB containment
- SameAsLink has **recursive CTE** for canonical resolution (`resolveCanonical`)
- Most complex Knowledge entities
- Requires `max_turns: 150`

**Identity builder**: `$KnowledgeDomainId`

---

## Critical Patterns for Wave 3

### Identity Builder

```typescript
// ALL Knowledge entities use the same builder
import { $KnowledgeDomainId } from "@beep/identity/packages";
const $I = $KnowledgeDomainId.create("entities/Entity/Entity.model");
```

### Repo Contract with Custom Extensions

```typescript
import { DbRepo } from "@beep/shared-server/factories";
import * as Context from "effect/Context";

// Example: Entity repo with 5 custom methods
export type RepoShape = DbRepo.DbRepoSuccess<
  typeof Entity.Model,
  {
    readonly findByName: DbRepo.Method<{
      payload: {
        readonly organizationId: SharedEntityIds.OrganizationId.Type;
        readonly name: string;
      };
      success: ReadonlyArray<Entity.Model.Type>;
    }>;
    readonly fuzzySearch: DbRepo.Method<{
      payload: {
        readonly organizationId: SharedEntityIds.OrganizationId.Type;
        readonly query: string;
        readonly limit?: number;
      };
      success: ReadonlyArray<Entity.Model.Type>;
    }>;
    // ... other custom methods
  }
>;

export class Repo extends Context.Tag($I`Repo`)<Repo, RepoShape>() {}
```

### No-Repo Entity Pattern (Agent, Batch, etc.)

For entities without server repos, still create full module structure with empty repo extensions:

```typescript
export type RepoShape = DbRepo.DbRepoSuccess<typeof Batch.Model, {}>;
export class Repo extends Context.Tag($I`Repo`)<Repo, RepoShape>() {}
```

### Agent Entity Prefix Convention

The Agent entity uses `KnowledgeAgent` prefix for ALL files to avoid ambiguity:

```
Agent/
  KnowledgeAgent.model.ts     (existing, preserve)
  KnowledgeAgent.errors.ts    (new)
  KnowledgeAgent.repo.ts      (new)
  KnowledgeAgent.rpc.ts       (new)
  KnowledgeAgent.http.ts      (new)
  KnowledgeAgent.tool.ts      (new)
  KnowledgeAgent.entity.ts    (new)
  contracts/
    Get.contract.ts            (new)
    Delete.contract.ts         (new)
  index.ts                     (new/updated)
```

### No Renaming Needed

All 19 Knowledge entity directories are already PascalCase. This means:
- No directory rename step
- No downstream import path breakage
- No old-directory cleanup needed
- Barrel file (`entities/index.ts`) should not need path changes (already uses PascalCase)
- Agent remains omitted from barrel (intentional)

---

## Downstream Consumer Verification

After migration, verify ALL consumers:

```bash
# Knowledge domain + all consumers
bun run check --filter @beep/knowledge-domain
bun run check --filter @beep/knowledge-tables
bun run check --filter @beep/knowledge-server

# Import path sweep (should find nothing since already PascalCase)
grep -r 'from "@beep/knowledge-domain/entities/[a-z]' packages/
```

---

## Cross-Slice References

Knowledge entities reference EntityIds from multiple slices:

| Cross-Slice EntityId | Used By |
|---------------------|---------|
| `SharedEntityIds.OrganizationId` | ALL 19 entities |
| `SharedEntityIds.UserId` | MergeHistory |
| `DocumentsEntityIds.DocumentId` | Entity, Extraction, Batch, Mention, MentionRecord, RelationEvidence, MeetingPrepEvidence, EmailThreadMessage |
| `DocumentsEntityIds.DocumentVersionId` | Extraction, Mention, RelationEvidence, MeetingPrepEvidence, EmailThreadMessage |
| `IamEntityIds.AccountId` | EmailThread, EmailThreadMessage |

**Impact**: These are import-only references (no cross-slice repo access). All EntityIds come from `@beep/shared-domain` which is an allowed dependency for all packages.

---

## EntityId Reference for Wave 3

### Knowledge EntityIds (from `@beep/shared-domain`)

All Knowledge EntityIds are defined in `packages/shared/domain/src/entity-ids/knowledge/ids.ts` and exported via the `KnowledgeEntityIds` namespace:

```typescript
import { KnowledgeEntityIds } from "@beep/shared-domain";

KnowledgeEntityIds.KnowledgeAgentId    // Agent entity
KnowledgeEntityIds.BatchExecutionId     // Batch entity
KnowledgeEntityIds.ClassDefinitionId    // ClassDefinition entity
KnowledgeEntityIds.EmailThreadId        // EmailThread entity
KnowledgeEntityIds.EmailThreadMessageId // EmailThreadMessage entity
KnowledgeEntityIds.EmbeddingId          // Embedding entity
KnowledgeEntityIds.KnowledgeEntityId    // Entity entity
KnowledgeEntityIds.EntityClusterId      // EntityCluster entity
KnowledgeEntityIds.ExtractionId         // Extraction entity
KnowledgeEntityIds.MeetingPrepBulletId  // MeetingPrepBullet entity
KnowledgeEntityIds.MeetingPrepEvidenceId // MeetingPrepEvidence entity
KnowledgeEntityIds.MentionId            // Mention entity
KnowledgeEntityIds.MentionRecordId      // MentionRecord entity
KnowledgeEntityIds.MergeHistoryId       // MergeHistory entity
KnowledgeEntityIds.OntologyId           // Ontology entity
KnowledgeEntityIds.PropertyDefinitionId // PropertyDefinition entity
KnowledgeEntityIds.RelationId           // Relation entity
KnowledgeEntityIds.RelationEvidenceId   // RelationEvidence entity
KnowledgeEntityIds.SameAsLinkId         // SameAsLink entity
```

All EntityIds are confirmed to exist in the ids file. No new EntityIds need to be created.

---

## Known Gotchas

1. **Agent model is `KnowledgeAgent.model.ts`** -- All new files must use `KnowledgeAgent.*` prefix, NOT `Agent.*`. The entity directory is `Agent/` but the model avoids the generic name.
2. **Agent is NOT in barrel** -- The barrel file (`entities/index.ts`) exports 18 entities, omitting Agent. Keep it omitted -- the orchestrator barrel update step should preserve this omission.
3. **Entity uses `KnowledgeEntityId`** -- The entity named "Entity" uses `KnowledgeEntityIds.KnowledgeEntityId`, not a plain `EntityId`. This disambiguates from the generic term.
4. **Embedding has `EMBEDDING_DIMENSION` constant** -- Preserve this constant. The model file likely exports it alongside the model.
5. **Embedding has custom `SimilarityResult`** -- The repo returns a custom result type for similarity searches, not just `Embedding.Model.Type`. This must be defined as a schema and used in contract Success types.
6. **SameAsLink `resolveCanonical` uses recursive CTE** -- The most complex repo method in the Knowledge slice. The repo contract must capture the recursive resolution signature accurately.
7. **MentionRecord uses raw UPDATE SQL** -- `updateResolvedEntityId` bypasses the standard DbRepo CRUD pattern and uses raw SQL. The repo extension must still capture this method's signature.
8. **EntityCluster uses JSONB `@>` containment** -- Custom query patterns for searching within JSONB arrays. Repo extensions must capture these method signatures.
9. **No renaming needed** -- All directories are already PascalCase. Do NOT attempt to rename directories.
10. **All bare entities** -- Every Knowledge entity only has `*.model.ts` (and `index.ts`). All canonical files (errors, repo, rpc, http, tool, entity, contracts/) must be created from scratch.
11. **Pre-existing test failures** -- 32 failures in PromptTemplates tests (knowledge-server) and 2 type errors (TestLayers.ts, GmailExtractionAdapter.test.ts) are pre-existing and unrelated to this migration.

---

## Success Criteria

Phase 4 is complete when:
- [ ] All 19 entities have full canonical module structure (errors, repo, rpc, http, tool, entity, contracts/)
- [ ] All entities have error schemas with correct HTTP status annotations via `$I.annotationsHttp`
- [ ] No-repo entities (5) have empty repo extensions + Get + Delete contracts
- [ ] CRUD-only entities (3) have empty repo extensions + Get + Delete contracts
- [ ] Custom method entities (11) have typed repo extensions + full contract sets matching server implementations
- [ ] Agent entity uses `KnowledgeAgent` prefix consistently and remains omitted from barrel
- [ ] Embedding entity preserves `EMBEDDING_DIMENSION` constant and defines `SimilarityResult` schema
- [ ] SameAsLink entity captures recursive CTE method signature in repo contract
- [ ] All Knowledge packages pass type checks: `@beep/knowledge-domain`, `@beep/knowledge-tables`, `@beep/knowledge-server`
- [ ] `REFLECTION_LOG.md` updated with Phase 4 learnings
- [ ] `handoffs/HANDOFF_P5.md` created if remaining entities exist (should be 0 after P4)
- [ ] Total canonical entities: **56 of 58** (37 from P2+P3 + 19 from P4)

---

## Reference Files

- **Canonical entity**: `packages/documents/domain/src/entities/Comment/` (5 contracts with custom repo methods)
- **Complex canonical entity**: `packages/documents/domain/src/entities/Page/` (15 contracts)
- **Skill reference**: `.claude/skills/canonical-domain-entity.md`
- **Server repos (Knowledge)**: `packages/knowledge/server/src/db/repos/`
- **Knowledge EntityIds**: `packages/shared/domain/src/entity-ids/knowledge/ids.ts`
- **Knowledge barrel**: `packages/knowledge/domain/src/entities/index.ts`
- **Agent model (prefix reference)**: `packages/knowledge/domain/src/entities/Agent/KnowledgeAgent.model.ts`
- **Phase 3 reflection**: `specs/pending/canonical-domain-entity-migration/REFLECTION_LOG.md`
- **Verified inventory**: `specs/pending/canonical-domain-entity-migration/outputs/verified-inventory.md`

---

*Created: 2026-02-12*
*Spec: canonical-domain-entity-migration*
*Phase: 4 (Wave 3: Knowledge)*
