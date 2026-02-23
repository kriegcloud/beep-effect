# Reflection Log: Knowledge Graph Integration

> Cumulative learnings from each phase of the knowledge graph integration.

---

## How to Use This Log

After completing each phase:

1. Add a new entry under the appropriate phase section
2. Document what worked, what didn't, and what was learned
3. Include specific examples (file paths, code patterns)
4. Note any changes to the spec based on learnings
5. Update prompts in AGENT_PROMPTS.md if needed

---

## Spec Creation (Pre-Phase 0)

### Session: 2026-01-18

**Duration**: Spec review and enhancement

#### What Worked

- **Pre-research approach**: Creating `outputs/codebase-context.md` and `outputs/effect-ontology-analysis.md` before Phase 0 provides valuable context for the orchestrator
- **Template files**: Creating concrete `templates/*.template.ts` files gives implementers copy-paste-ready patterns instead of abstract descriptions
- **HANDOFF_P0.md creation**: Having a full context document alongside the orchestrator prompt ensures no information is lost between sessions
- **Existing entity ID discovery**: Found that `packages/shared/domain/src/entity-ids/knowledge/ids.ts` already exists with placeholder content - avoiding duplicate file creation

#### What Didn't Work

- **Initial spec review score (4.2/5)**: Missing template files and outputs directory content reduced completeness
- **Empty directories**: Creating directories without content is insufficient - templates and outputs need actual files

#### Learnings

1. **Discovery before creation**: Always run codebase-researcher BEFORE defining domain models to find existing patterns and partial implementations

2. **Two-file handoff pattern**: Both `HANDOFF_P[N].md` (full context) and `P[N]_ORCHESTRATOR_PROMPT.md` (copy-paste ready) are essential for multi-session specs

3. **Template specificity**: Abstract code examples in markdown are less useful than concrete `.ts` template files with `{{Placeholder}}` markers

4. **Effect-ontology alignment**: The reference implementation at `tmp/effect-ontology/` uses compatible Effect.Service patterns - direct adaptation is feasible with multi-tenant extensions

5. **Entity ID namespace**: Knowledge entity IDs should use the `"knowledge"` namespace prefix to align with existing `EntityId.builder("knowledge")` pattern

6. **Partial implementation exists**: `packages/shared/domain/src/entity-ids/knowledge/ids.ts` already has `EmbeddingId` defined with proper annotations - Phase 0 only needs to ADD the remaining IDs (EntityId, RelationId, ExtractionId, OntologyId), not replace the file

#### Spec Updates Made

- Added `templates/entity.template.ts` - Entity schema pattern
- Added `templates/service.template.ts` - Effect.Service pattern
- Added `templates/extraction-stage.template.ts` - Pipeline stage pattern
- Added `outputs/codebase-context.md` - Beep-effect patterns analysis
- Added `outputs/effect-ontology-analysis.md` - Reference implementation mapping
- Created `handoffs/HANDOFF_P0.md` - Full Phase 0 context document
- Updated this REFLECTION_LOG.md with spec creation learnings

#### Key Design Decisions Documented

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Multi-tenancy | `organizationId` on all tables + RLS | Aligns with existing beep-effect patterns |
| Embedding storage | pgvector with HNSW index | Production-ready similarity search |
| Entity ID prefix | `knowledge_{entity}__uuid` | Follows existing namespace convention |
| Table factory | OrgTable.make | Auto-wires organization FK + cascade |

---

## Phase 0: Foundation

### Session 1

**Date**: 2026-01-18
**Duration**: ~2 hours

#### What Worked

- **OrgTable.make pattern**: Using `OrgTable.make(KnowledgeEntityIds.XxxId)` for table creation auto-wires organization FK, cascade, and standard columns
- **makeFields for domain models**: The `makeFields` helper correctly merges entity ID, audit columns, and custom fields
- **Entity ID builder**: `EntityId.builder("knowledge")` creates properly branded IDs with table name inference
- **Existing Embedding model as reference**: Following the pattern from `Embedding.model.ts` ensured consistency
- **Value objects**: Creating separate files for `EvidenceSpan` and `Attributes` keeps the domain clean

#### What Didn't Work

- **Field name conflict with `version`**: The Ontology model initially had a `version` field which conflicted with `makeFields` default audit field. All fields were inferred as `never` with cryptic error messages.
- **Entity type imports in tables**: Importing `Entity.Attributes` from domain failed because `Attributes` wasn't re-exported from the Entity namespace
- **EntityId naming collision**: Initially named the knowledge entity ID schema `EntityId` which conflicted with the import `EntityId as EntityIdBuilder` from `@beep/schema/identity`
- **Turborepo cache**: Stale cache occasionally caused build issues with newly added IDs

#### Learnings

1. **makeFields reserved fields**: Never use these names in custom fields: `id`, `_rowId`, `version`, `source`, `createdAt`, `updatedAt`, `deletedAt`, `createdBy`, `updatedBy`, `deletedBy`. Rename conflicts (e.g., `version` → `ontologyVersion`).

2. **Entity ID naming convention**: Use unique, descriptive names like `KnowledgeEntityId` instead of generic `EntityId` to avoid import collisions with the builder utility.

3. **Table type annotations**: Prefer inline types (`$type<Record<string, string>>()`) over domain imports when the domain type may not be exported or may change.

4. **Cache clearing**: When encountering unexplainable type errors after adding new exports, clear turborepo cache with `rm -rf .turbo node_modules/.cache`.

5. **Two-phase verification**: First run `build` to catch TypeScript errors, then `check` for full type verification including downstream packages.

#### Files Created

| File | Purpose |
|------|---------|
| `packages/shared/domain/src/entity-ids/knowledge/ids.ts` | Added KnowledgeEntityId, RelationId, OntologyId, ExtractionId, MentionId |
| `packages/shared/domain/src/entity-ids/knowledge/any-id.ts` | AnyKnowledgeId union |
| `packages/shared/domain/src/entity-ids/knowledge/table-name.ts` | KnowledgeTableName literals |
| `packages/knowledge/domain/src/value-objects/EvidenceSpan.ts` | Character-level provenance |
| `packages/knowledge/domain/src/value-objects/Attributes.ts` | Entity attribute schema |
| `packages/knowledge/domain/src/entities/Entity/Entity.model.ts` | Knowledge graph entity model |
| `packages/knowledge/domain/src/entities/Relation/Relation.model.ts` | Triple/relation model |
| `packages/knowledge/domain/src/entities/Ontology/Ontology.model.ts` | Ontology definition model |
| `packages/knowledge/domain/src/entities/Extraction/Extraction.model.ts` | Extraction run model |
| `packages/knowledge/domain/src/entities/Mention/Mention.model.ts` | Entity mention model |
| `packages/knowledge/domain/src/errors/extraction.errors.ts` | Extraction error types |
| `packages/knowledge/domain/src/errors/ontology.errors.ts` | Ontology error types |
| `packages/knowledge/domain/src/errors/grounding.errors.ts` | Grounding error types |
| `packages/knowledge/tables/src/tables/entity.table.ts` | Entity table |
| `packages/knowledge/tables/src/tables/relation.table.ts` | Relation table |
| `packages/knowledge/tables/src/tables/ontology.table.ts` | Ontology table |
| `packages/knowledge/tables/src/tables/extraction.table.ts` | Extraction run table |
| `packages/knowledge/tables/src/tables/mention.table.ts` | Mention table |
| `packages/_internal/db-admin/drizzle/0001_enable_rls_policies.sql` | RLS policies for all tables |

#### Spec Updates Made

- Updated this REFLECTION_LOG.md with Phase 0 learnings
- Created HANDOFF_P1.md for next phase context
- Created P1_ORCHESTRATOR_PROMPT.md for next implementer

---

## Phase 1: Ontology Service

### Session 1

**Date**: 2026-01-18
**Duration**: ~3 hours

#### What Worked

- **N3.js for RDF parsing**: The N3.js library provides excellent TypeScript support and handles Turtle/RDF-XML parsing with async callbacks that integrate well with Effect.async
- **OntologyContext pattern**: Creating an in-memory context object with lookup methods (`findClass`, `getPropertiesForClass`, `isSubClassOf`) enables efficient querying without repeated database access
- **DbRepo.make factory**: Using `DbRepo.make(EntityId, Model, Effect.succeed({}))` pattern from `@beep/shared-domain/factories` for repositories keeps code minimal and consistent
- **Effect.Service with dependencies**: The `OntologyService` correctly declares dependencies on `OntologyParser` and `OntologyCache`, ensuring proper Layer composition
- **Memoized ancestor computation**: Caching ancestor sets prevents exponential traversal cost for deep class hierarchies
- **Separate parser/cache/service**: Splitting responsibilities across three services enables independent testing and clear contracts

#### What Didn't Work

- **Stale Turborepo build cache**: After adding new entity IDs (`ClassDefinitionId`, `PropertyDefinitionId`) to `@beep/shared-domain`, the build output was stale. Required `rm -rf .turbo node_modules/.cache` and explicit rebuild
- **Wrong import pattern for errors**: Initially imported `OntologyErrors` namespace, but the error class is exported directly as `OntologyParseError`
- **createdAt/updatedAt in insert types**: Attempted to manually set audit timestamps in `toClassInsert`/`toPropertyInsert`, but `makeFields` auto-generates these. The insert type doesn't include them
- **Unused import detection**: TypeScript flagged `import * as A from "effect/Array"` as unused when `A.some` calls were removed during refactoring

#### Learnings

1. **Entity ID propagation**: After adding new entity IDs, rebuild the affected package explicitly: `bun run build --filter @beep/shared-domain`. The type check will cascade to dependent packages.

2. **Error import pattern**: Domain errors are exported directly, not via namespace:
   ```typescript
   // WRONG
   import { OntologyErrors } from "@beep/knowledge-domain/errors";
   new OntologyErrors.ParseError(...)

   // CORRECT
   import { OntologyParseError } from "@beep/knowledge-domain/errors";
   new OntologyParseError(...)
   ```

3. **Insert types exclude auto-generated fields**: The `Model.insert` schema from `makeFields` only includes user-provided fields. Don't include `createdAt`, `updatedAt`, `deletedAt`, etc.

4. **Effect.sync for pure computations**: When converting parsed data to insert models, use `Effect.sync()` not `Effect.gen()`. No async operations needed.

5. **N3.js callback completion**: The N3 parser calls the callback multiple times (once per quad, once with null for completion). Track completion by checking for null quad:
   ```typescript
   parser.parse(content, (error, quad, _prefixes) => {
     if (error) { resume(Effect.fail(...)); }
     else if (quad) { store.addQuad(quad); }
     else { resume(Effect.succeed(store)); }  // Parsing complete
   });
   ```

6. **Style warnings vs type errors**: The Effect language service plugin emits TS41/TS5 messages for style suggestions. These are not blocking type errors but cause `tsc` to exit with code 2. Focus on actual `error` diagnostics first.

#### Files Created

| File | Purpose |
|------|---------|
| `packages/shared/domain/src/entity-ids/knowledge/ids.ts` | Added ClassDefinitionId, PropertyDefinitionId |
| `packages/knowledge/domain/src/entities/ClassDefinition/ClassDefinition.model.ts` | Class definition schema |
| `packages/knowledge/domain/src/entities/PropertyDefinition/PropertyDefinition.model.ts` | Property definition schema |
| `packages/knowledge/tables/src/tables/classDefinition.table.ts` | Class definition table |
| `packages/knowledge/tables/src/tables/propertyDefinition.table.ts` | Property definition table |
| `packages/knowledge/server/src/Ontology/constants.ts` | RDF/OWL/SKOS namespace constants |
| `packages/knowledge/server/src/Ontology/OntologyParser.ts` | N3.js-based Turtle parser |
| `packages/knowledge/server/src/Ontology/OntologyCache.ts` | LRU cache with content-hash validation |
| `packages/knowledge/server/src/Ontology/OntologyService.ts` | High-level ontology API |
| `packages/knowledge/server/src/db/repos/Ontology.repo.ts` | Ontology CRUD operations |
| `packages/knowledge/server/src/db/repos/ClassDefinition.repo.ts` | ClassDefinition CRUD |
| `packages/knowledge/server/src/db/repos/PropertyDefinition.repo.ts` | PropertyDefinition CRUD |

#### Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Parser library | N3.js | Mature, TypeScript types, handles Turtle + RDF-XML |
| Cache strategy | Content-hash + LRU | Invalidates on ontology change, bounds memory |
| Hierarchy storage | In-memory at load time | Ontologies are small, hierarchies queried often |
| SKOS vocabulary | Full support | Labels, definitions, broader/narrower, mappings |
| OWL vocabulary | Classes + properties | Supports inheritance, domains, ranges, functional properties |

#### Spec Updates Made

- Updated REFLECTION_LOG.md with Phase 1 learnings
- Created HANDOFF_P2.md for next phase context
- Created P2_ORCHESTRATOR_PROMPT.md for next implementer

---

## Phase 2: Extraction Pipeline

### Session 1

**Date**: 2026-01-18
**Duration**: ~2 hours

#### What Worked

- **Effect.Service with Context.GenericTag**: Using `Context.GenericTag<AiService>` for the interface-based AiService allows pluggable implementations (mock for testing, real for production)
- **Structured LLM output with S.Class**: The `MentionOutput`, `EntityOutput`, and `RelationOutput` schemas define clear contracts for LLM responses that validate automatically
- **OntologyContext integration**: Passing the loaded `OntologyContext` to extractors enables type validation without additional database queries
- **Stream-based chunking**: Using `Stream.fromIterable` for `NlpService.chunkText` enables processing large documents without loading everything into memory
- **Offset adjustment pattern**: Tracking character offsets through the pipeline by adjusting relative offsets (chunk-level) to absolute offsets (document-level)
- **Pipeline orchestration with Effect.gen**: The `ExtractionPipeline.run` method cleanly sequences all stages with proper error handling and logging
- **Deduplication helpers**: Both `MentionExtractor.mergeMentions` and `RelationExtractor.deduplicateRelations` handle overlapping extractions across chunk boundaries

#### What Didn't Work

- **Initial circular import**: First attempt had `PromptTemplates.ts` importing from `Extraction/schemas/*` which imported from `Nlp/`, creating a circular dependency. Fixed by moving schema types to standalone files
- **Batch size tuning**: Default batch size of 20 for entity classification may exceed token limits for ontologies with many classes. Made configurable via `config.entityBatchSize`
- **Entity-to-chunk mapping complexity**: The `mapEntitiesToChunks` helper needed careful offset comparison to correctly associate entities back to their source chunks for relation extraction

#### Learnings

1. **Interface + GenericTag for pluggable services**: When a service needs multiple implementations (mock, test, production), use an interface with `Context.GenericTag` instead of `Effect.Service`:
   ```typescript
   export interface AiService {
     readonly generateObject: <A, I>(schema: S.Schema<A, I>, prompt: string) => Effect.Effect<...>;
   }
   export const AiService = Context.GenericTag<AiService>("@beep/knowledge-server/AiService");
   ```

2. **LLM output validation**: Always define Effect Schema classes for LLM structured output. The schema acts as both documentation and runtime validation:
   ```typescript
   export class MentionOutput extends S.Class<MentionOutput>("...")({
     mentions: S.Array(ExtractedMention),
     reasoning: S.optional(S.String),
   }) {}
   ```

3. **Offset tracking through pipeline**: Maintain character offsets through all stages for evidence linking:
   - Chunks have `startOffset`/`endOffset` relative to document
   - Mentions have `startChar`/`endChar` relative to chunk, adjusted to document level
   - Evidence spans carry absolute document offsets for UI highlighting

4. **Entity resolution keying**: Use lowercase canonical name (or mention text if no canonical name) as the grouping key:
   ```typescript
   const key = (entity.canonicalName ?? entity.mention).toLowerCase();
   ```

5. **Confidence threshold propagation**: Each stage can have its own `minConfidence` threshold, allowing progressive filtering from mentions → entities → relations

6. **Graph assembly ID generation**: Use `crypto.randomUUID()` for entity/relation IDs during assembly, with proper branded ID formatting:
   ```typescript
   const id = `knowledge_entity__${crypto.randomUUID()}`;
   ```

#### Files Created

| File | Purpose |
|------|---------|
| `packages/knowledge/server/src/Nlp/TextChunk.ts` | TextChunk and ChunkingConfig schemas |
| `packages/knowledge/server/src/Nlp/NlpService.ts` | Sentence-aware text chunking service |
| `packages/knowledge/server/src/Ai/AiService.ts` | AI provider abstraction interface |
| `packages/knowledge/server/src/Ai/PromptTemplates.ts` | Mention/entity/relation extraction prompts |
| `packages/knowledge/server/src/Extraction/schemas/MentionOutput.ts` | LLM output schema for mentions |
| `packages/knowledge/server/src/Extraction/schemas/EntityOutput.ts` | LLM output schema for entities |
| `packages/knowledge/server/src/Extraction/schemas/RelationOutput.ts` | LLM output schema for relations |
| `packages/knowledge/server/src/Extraction/MentionExtractor.ts` | Stage 2: mention detection |
| `packages/knowledge/server/src/Extraction/EntityExtractor.ts` | Stage 3: entity classification |
| `packages/knowledge/server/src/Extraction/RelationExtractor.ts` | Stage 4: triple extraction |
| `packages/knowledge/server/src/Extraction/GraphAssembler.ts` | Stage 5: graph construction |
| `packages/knowledge/server/src/Extraction/ExtractionPipeline.ts` | Full pipeline orchestration |

#### Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Chunking strategy | Sentence-aware with overlap | Preserves context across boundaries, avoids mid-sentence splits |
| Mention detection | LLM-powered | More robust than NER for domain-specific entities |
| Type validation | Against OntologyContext | Runtime validation ensures only ontology types are used |
| Relation filtering | Predicate IRI validation | Rejects hallucinated predicates not in ontology |
| Graph assembly | In-memory with entity index | Fast lookup for relation resolution, merges duplicates |
| AI interface | Interface + GenericTag | Supports mock for testing, real implementation for production |

#### Spec Updates Made

- Updated REFLECTION_LOG.md with Phase 2 learnings
- Created HANDOFF_P3.md for next phase context
- Created P3_ORCHESTRATOR_PROMPT.md for next implementer

---

## Phase 3: Embedding & Grounding

*(To be completed after Phase 3)*

---

## Phase 4: Entity Resolution

*(To be completed after Phase 4)*

---

## Phase 5: GraphRAG

*(To be completed after Phase 5)*

---

## Phase 6: Todox Integration

*(To be completed after Phase 6)*

---

## Phase 7: UI Components

*(To be completed after Phase 7)*

---

## Cross-Phase Patterns

### Patterns to Reuse

| Pattern | Description | Example Location |
|---------|-------------|------------------|
| Entity ID builder | `EntityId.builder("namespace")` creates branded IDs | `packages/shared/domain/src/entity-ids/knowledge/ids.ts` |
| OrgTable factory | Multi-tenant table with auto organization FK | `packages/shared/tables/src/org-table/OrgTable.ts` |
| Db service | Scoped database client per slice | `packages/iam/server/src/db/Db/Db.ts` |
| Effect.Service | Service with dependencies, accessors: true | `packages/iam/server/src/adapters/` |
| DbRepo.make factory | Creates standard CRUD repo from EntityId + Model | `packages/knowledge/server/src/db/repos/Ontology.repo.ts` |
| Effect.async for callbacks | Wraps callback-based APIs in Effect | `packages/knowledge/server/src/Ontology/OntologyParser.ts` |
| In-memory context | Load-once, query-many pattern for reference data | `packages/knowledge/server/src/Ontology/OntologyService.ts` |

### Anti-Patterns to Avoid

| Anti-Pattern | Why It Fails | Better Approach |
|--------------|--------------|-----------------|
| Creating new entity ID file when one exists | Duplicate definitions, import confusion | Update existing placeholder file |
| Empty template directories | Provides no implementation guidance | Create concrete template files |
| Single handoff file | Orchestrator prompt too long, context diluted | Two files: HANDOFF + ORCHESTRATOR_PROMPT |
| Abstract code examples only | Hard to copy-paste, easy to misremember | Concrete `.template.ts` files |
| Using raw @effect/sql-drizzle in repos | Inconsistent with codebase patterns | Use DbRepo.make factory from @beep/shared-domain |
| Manual createdAt/updatedAt in inserts | makeFields auto-generates audit fields | Only include user-provided fields |
| Importing error namespaces | Errors are exported directly | Import individual error classes |

---

## Prompt Improvements

Track improvements made to AGENT_PROMPTS.md based on learnings:

| Date | Prompt Changed | Issue | Fix Applied |
|------|----------------|-------|-------------|
| 2026-01-18 | Phase 4 agent prompts | Missing entirely | Added complete P4 agent prompts |
| 2026-01-18 | Phase 7 agent prompts | Missing entirely | Added complete P7 agent prompts |

---

## Open Questions

Questions that arose during implementation, to be addressed in future phases:

- [ ] How should entity resolution handle type conflicts across sources?
- [ ] What's the optimal grounding threshold for different ontology domains?
- [ ] Should embeddings be cached per-organization or globally?
- [ ] How to handle ontology version upgrades with existing extracted data?

---

## References

Files frequently referenced during implementation:

| Purpose | Path |
|---------|------|
| Effect patterns | `.claude/rules/effect-patterns.md` |
| Database patterns | `documentation/patterns/database-patterns.md` |
| Effect-ontology reference | `tmp/effect-ontology/packages/@core-v2/src/` |
| Beep-effect IAM slice | `packages/iam/` |
| Codebase context | `specs/knowledge-graph-integration/outputs/codebase-context.md` |
| Effect-ontology analysis | `specs/knowledge-graph-integration/outputs/effect-ontology-analysis.md` |
| OntologyParser implementation | `packages/knowledge/server/src/Ontology/OntologyParser.ts` |
| OntologyService implementation | `packages/knowledge/server/src/Ontology/OntologyService.ts` |
| DbRepo factory | `packages/shared/domain/src/factories/DbRepo.ts` |
| Embedding repo reference | `packages/knowledge/server/src/db/repos/Embedding.repo.ts` |
