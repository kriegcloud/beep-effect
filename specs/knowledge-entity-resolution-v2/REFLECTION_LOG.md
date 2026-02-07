# Reflection Log

> Cumulative learnings from implementing entity resolution enhancements.

---

## Purpose

This log captures patterns, gotchas, and improvements discovered during implementation. Use it to refine future phases and promote successful patterns to the pattern registry.

---

## Entry Template

```markdown
## Phase [N] - [Feature Name] (YYYY-MM-DD)

### What Worked
- [Pattern or approach that succeeded]

### What Didn't Work
- [Pattern or approach that failed]

### Key Learnings
- [Insights that will inform future work]

### Pattern Candidates (score if ≥75)
- [Pattern name]: [Brief description] (Score: X/102)
```

---

## Entries

## Phase 0: Scaffolding - 2026-02-03

### What Worked
- Complexity formula yielded clear classification (36 points → Medium)
- Two-tier architecture (MentionRecord → Entity) provides clean separation of concerns
- Parallel track structure (Phases 0, 1, 3) enables independent progress on RDF/SPARQL/Workflow
- Forward-only migration strategy avoids synthetic provenance complexity

### What Didn't Work
- (To be filled during Phase 1 execution)

### Key Learnings
- **MentionRecords must be immutable** - Extraction outputs should never change after creation
- **Cross-batch resolution requires organization-wide lookups** - Comparing new MentionRecords against existing entities across all past extractions
- **EntityId branded types essential for type safety** - Prevents mixing different entity types in joins and queries
- **Bloom filters reduce candidate search space** - Necessary for performance at scale (10K+ entities)
- **Merge history enables conflict resolution** - Audit trail critical for debugging resolution decisions

### Pattern Candidates

#### Pattern: immutable-extraction-artifact
- **Description**: Extraction outputs (MentionRecord) are append-only, never mutated. Resolution updates only the link field (`resolvedEntityId`).
- **Applicability**: Any pipeline where extraction results feed into resolution or deduplication
- **Benefits**: Preserves raw evidence, enables auditing, supports split/unmerge operations
- **Confidence**: high

#### Pattern: two-tier-resolution
- **Description**: Separate raw extraction layer (MentionRecord) from resolved entity layer (Entity). Evidence layer is immutable, resolution layer evolves.
- **Applicability**: Entity resolution, NER pipelines, knowledge extraction, any deduplication workflow
- **Benefits**: Audit trails, conflict resolution, provenance preservation
- **Confidence**: high

#### Pattern: cross-batch-entity-registry
- **Description**: Organization-wide entity lookup using normalized text + bloom filter + embedding similarity
- **Applicability**: Multi-batch entity resolution, incremental clustering, deduplication across time
- **Benefits**: Finds duplicate entities across extraction runs, enables incremental updates
- **Confidence**: medium (requires performance validation)

---

## Phase 3 - Full EntityRegistry Implementation (2026-02-04)

### What Worked

**1. Infrastructure Discovery Before Implementation**
- Thorough codebase exploration revealed EntityRepo, MergeHistoryRepo, and EmbeddingService already existed in server package
- Avoided duplicate implementation by wiring existing services instead of recreating them
- Parallel agent exploration (4 agents) quickly mapped the landscape

**2. AuthContext Pattern for Organization Scoping**
- Domain service interfaces don't need `organizationId` parameter
- Live layers inject `AuthContext` and extract `session.activeOrganizationId`
- Clean separation: domain contracts are org-agnostic, server implementations handle multi-tenancy

**3. Parallel Task Execution**
- Tasks 1, 2, 4, 5 ran in parallel (no dependencies)
- Task 3 (main EntityRegistry) waited for 1 and 2
- Significant time savings vs sequential execution

**4. Effect.Service Pattern with Dependency Injection**
- Services declare dependencies via `yield* ServiceName` in effect
- Live layers compose dependencies via `Layer.provideMerge`
- Test layers can substitute mock implementations

**5. BloomFilter with Simple Implementation**
- Custom bloom filter using Uint32Array (122KB for 1M bits)
- Three hash functions (djb2, sdbm, FNV-1a) provide good distribution
- 100% pruning rate on unknown texts in tests
- No external library dependency

### What Didn't Work

**1. Initial Handoff Misconceptions**
- Handoff document suggested creating EntityRepo in domain package
- Actual architecture: domain = contracts, server = implementations
- Required architectural clarification before proceeding

**2. Domain Service Interface Mismatch**
- Domain `getMergeHistory(entityId)` lacked `organizationId` parameter
- Server repo required `findByTargetEntity(entityId, organizationId)`
- Resolution: AuthContext injection in Live layer (not interface change)

**3. Unused Variable Warnings in Benchmarks**
- TypeScript flagged `_normalized` and `_mayExist` as unused
- Even with underscore prefix, `noUnusedLocals` was strict
- Fixed with `void` expression: `void normalizeText(text)`

### Key Learnings

**Architecture: Domain vs Server Package Separation**
- Domain package: Service contracts (interfaces), value objects, domain models
- Server package: Repository implementations, Live layers, database operations
- Domain services are STUBS designed to be provided via Layer from server

**Performance: Multi-Stage Candidate Search Pipeline**
1. Text normalization (pure function, no service)
2. Bloom filter negative test (prunes >90% of candidates)
3. GIN trigram database query (leverages PostgreSQL pg_trgm)
4. Embedding similarity ranking (cosine similarity threshold 0.85)

Early exit at each stage ensures <100ms performance for 10K entities.

**Testing: Benchmark Patterns**
- Use `live()` from `@beep/testkit` for real clock access
- Use `Effect.clockWith` for timing, not `Date.now()`
- Synthetic data generation for reproducible benchmarks
- Document baselines in console output for regression detection

**Layer Composition: Shared Dependencies**
- `Layer.provideMerge` shares single instance between services
- Critical for mutable dependencies (repos, stores)
- `Layer.merge` creates separate instances (wrong for shared state)

### Pattern Candidates

#### Pattern: auth-context-org-scoping (Score: 85/102)
- **Description**: Domain services don't include organizationId; Live layers inject AuthContext and extract activeOrganizationId
- **Applicability**: Any multi-tenant service needing organization scoping
- **Benefits**: Clean domain contracts, automatic multi-tenancy, single source of truth for current org
- **Confidence**: high (proven in MergeHistoryLive, EntityRegistry)

#### Pattern: multi-stage-candidate-search (Score: 90/102)
- **Description**: Pipeline of increasingly expensive filters (bloom → text → embedding)
- **Applicability**: Entity resolution, search, deduplication at scale
- **Benefits**: Early exit on cheap operations, <100ms at 10K entities, composable stages
- **Confidence**: high (implemented and benchmarked)

#### Pattern: custom-bloom-filter (Score: 75/102)
- **Description**: Uint32Array-based bloom filter with multiple hash functions, no external dependencies
- **Applicability**: Probabilistic set membership, candidate pruning
- **Benefits**: ~122KB for 1M bits, <1ms lookup, 100% pruning on unknown texts
- **Confidence**: medium (works well but could use external library for edge cases)

### Performance Baselines (Phase 3)

| Metric | Target | Achieved | Notes |
|--------|--------|----------|-------|
| Bloom filter pruning | >90% | 100% | Unknown texts correctly identified |
| BulkAdd 10K items | <100ms | 8ms | Fast initialization |
| Contains lookup | <1ms | 0.02ms | Sub-millisecond |
| Memory (10K items) | <200KB | 122KB | Efficient Uint32Array |
| Fill ratio (10K items) | <10% | 2.96% | Low saturation |
| Stress test (100K items) | N/A | 43ms, 1.64% FP | Acceptable false positive rate |

### Pre-existing Issues (Not Phase 3 Scope)

- `packages/knowledge/domain/src/entities/mention-record/mention-record.model.ts`: `documentId: S.String` should be `DocumentsEntityIds.DocumentId`
- Similar EntityId branding issues in other domain models
- These are historical and require separate cleanup spec

---

## Phase 4 - IncrementalClusterer & SplitService (2026-02-04)

### What Worked

**1. Wave-Based Parallel Delegation**
- Wave 1: IncrementalClustererLive + MentionRecordRepo (agent 1) in parallel with SplitService domain+server (agent 2)
- Wave 2: ExtractionPipeline wiring (agent 3) in parallel with unit tests (agent 4)
- Clear dependency ordering prevented conflicts between agents

**2. Effect.serviceOption for Optional Dependencies**
- ExtractionPipeline uses `Effect.serviceOption(IncrementalClusterer)` to make clustering opt-in
- Pipeline doesn't break when IncrementalClusterer layer isn't provided
- `O.match` cleanly handles present/absent service case
- Non-breaking additive integration pattern

**3. Fault Isolation in IncrementalClustererLive**
- Per-mention `Effect.catchAll` with warning log prevents one bad mention from failing entire batch
- Concurrency of 5 balances throughput with DB pressure
- Each mention independently resolves or creates, with merge history tracked

**4. MentionRecordRepo Creation Following Existing Patterns**
- No MentionRecordRepo existed - discovered during initial exploration
- Created following `Entity.repo.ts` pattern with `DbRepo.make` + custom extensions
- Extensions: `findByExtractionId`, `findByResolvedEntityId`, `findUnresolved`, `updateResolvedEntityId`

**5. SplitService Using Existing MergeReason Union**
- Used `"manual_override"` for split/unmerge operations since `"manual_split"` doesn't exist in the literal union
- Direction of sourceEntityId/targetEntityId captures split vs merge semantics
- Avoids schema migration for a new literal variant

### What Didn't Work

**1. Drizzle `.default()` vs Domain Model Required Fields**
- `merge-history.table.ts` had `.default(sql\`now()\`)` on `mergedAt` making it optional in Drizzle's InferInsertModel
- Domain model requires `mergedAt` as non-optional, causing `_check.ts` type alignment failure
- Same issue with `mention-record.table.ts` `extractedAt` field
- **Fix**: Remove `.default()` from columns that domain model requires; let application provide values

**2. Turborepo Cascading Build Failures**
- `bun run check --filter @beep/knowledge-server` fails if upstream `knowledge-tables` has errors
- Direct `tsc --noEmit` on knowledge-server passed clean, but Turbo gate blocked
- Required fixing table-level type issues before server tests could run via Turbo

**3. Pre-existing Test Failures Obscured P4 Results**
- 32 pre-existing failures in PromptTemplates tests unrelated to Phase 4
- 2 pre-existing type errors (readonly array mismatches in TestLayers.ts and GmailExtractionAdapter.test.ts)
- Required isolating P4-specific tests to verify correctness

### Key Learnings

**Architecture: Optional Service Dependencies**
- `Effect.serviceOption(Service)` returns `Option<Service>` - perfect for opt-in features
- Pattern: check config flag → `O.match(maybeService, { onNone: logSkip, onSome: useService })`
- Keeps pipeline backward-compatible while adding new capabilities

**Domain-Table Type Alignment: _check.ts**
- Drizzle's `InferInsertModel` treats `.default()` columns as optional (`| undefined`)
- Domain Model `insert` type requires the field
- Mismatch surfaces in `_check.ts` compile-time verification
- **Rule**: Only use `.default()` on columns where the domain model also makes the field optional

**Testing: Isolating P4 Changes from Pre-existing Issues**
- `bun test <specific-file>` for targeted verification when Turbo cascading fails
- `tsc --noEmit -p tsconfig.json` for direct type checking without Turbo build dependency
- Document pre-existing issues separately from P4 scope

**Repository Pattern: Custom Extensions with DbRepo.make**
- `DbRepo.make(EntityId, Model, makeExtensions)` gives CRUD + custom queries
- Extensions use `SqlSchema.findAll` for typed query results
- Extension functions wrap with `Effect.catchTag("ParseError", Effect.die)` and `Effect.mapError(DatabaseError.$match)`

### Pattern Candidates

#### Pattern: optional-service-injection (Score: 88/102)
- **Description**: Use `Effect.serviceOption(Service)` for opt-in features in pipelines, paired with config flag check
- **Applicability**: Any pipeline where a capability is additive and shouldn't break existing consumers
- **Benefits**: Non-breaking integration, clean opt-in/opt-out, no layer composition changes for consumers who don't use the feature
- **Confidence**: high (proven in ExtractionPipeline with IncrementalClusterer)

#### Pattern: fault-isolated-batch-processing (Score: 82/102)
- **Description**: Per-item `Effect.catchAll` with warning log inside batch operations, bounded concurrency
- **Applicability**: Batch entity resolution, bulk imports, any operation where individual failures shouldn't fail the batch
- **Benefits**: Resilient processing, observability via warning logs, controlled concurrency
- **Confidence**: high (proven in IncrementalClustererLive with concurrency: 5)

#### Pattern: drizzle-domain-type-alignment (Score: 78/102)
- **Description**: Drizzle `.default()` makes InferInsertModel treat column as optional; remove `.default()` when domain Model requires the field
- **Applicability**: Any table where `_check.ts` validates Model ↔ Table type alignment
- **Benefits**: Compile-time detection of insert type mismatches, prevents runtime surprises
- **Confidence**: high (two instances fixed in Phase 4)

### Deliverables Summary

| Deliverable | Status | Files |
|-------------|--------|-------|
| IncrementalClustererLive | Complete | `server/src/EntityResolution/IncrementalClustererLive.ts` |
| MentionRecordRepo | Complete | `server/src/db/repos/MentionRecord.repo.ts` |
| SplitService (domain) | Complete | `domain/src/services/Split.service.ts`, `domain/src/errors/split.errors.ts` |
| SplitService (server) | Complete | `server/src/EntityResolution/SplitService.ts` |
| ExtractionPipeline integration | Complete | `server/src/Extraction/ExtractionPipeline.ts` |
| Unit tests (15 pass) | Complete | `server/test/EntityResolution/IncrementalClusterer.test.ts`, `SplitService.test.ts` |
| Table type fixes | Complete | `tables/src/tables/merge-history.table.ts`, `mention-record.table.ts` |
| Performance benchmarks | Complete | `server/test/benchmarks/IncrementalClusterer.bench.ts` |

### Quality Gate Results

| Gate | Result | Notes |
|------|--------|-------|
| `tsc --noEmit` (knowledge-server) | PASS | Zero errors |
| `tsc -b` (knowledge-tables) | PASS | After `.default()` fixes |
| P4 unit tests (15/15) | PASS | IncrementalClusterer + SplitService |
| Pre-existing test failures | 32 fail | PromptTemplates - not P4 scope |

---

## Next Entry Template

```markdown
## Phase 5 - [Feature Name] (YYYY-MM-DD)

### What Worked
- [Pattern or approach that succeeded]

### What Didn't Work
- [Pattern or approach that failed]

### Key Learnings
- [Insights that will inform future work]

### Pattern Candidates (score if ≥75)
- [Pattern name]: [Brief description] (Score: X/102)
```
