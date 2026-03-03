# Idempotency Architecture Diagrams & Migration Checklist

## Visual Architecture

### Current (Problematic) Architecture

```
┌─────────────────┐
│   Client A      │
│                 │
│ Request #1:     │
│ text, ontology, │
│ params          │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ RPC Server                          │
│                                     │
│ primaryKey = hash(text + ontId)     │
│ [MISSING VERSION!]                  │
│                                     │
│ Check RPC cache → miss              │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Orchestrator                        │
│                                     │
│ Create idempotencyKey =             │
│ hash(text + ontId)                  │
│ [MISSING VERSION!]                  │
│                                     │
│ Check execution cache → miss        │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Extraction Workflow                 │
│                                     │
│ streamingExtraction(text, ...)      │
│ [NO IDEMPOTENCY KEY THREADED]       │
│                                     │
│ Entity extraction (NO CACHE)        │
│ Relation extraction (NO CACHE)      │
│ Entity resolution:                  │
│   Cluster by requestId (UUID) ❌    │
│ [CACHE BYPASS!]                     │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Long-lived Result Cache             │
│                                     │
│ Key = requestId (changes per call)  │
│ [DIFFERENT KEYS = CACHE MISSES!]    │
└─────────────────────────────────────┘

┌─────────────────┐
│   Client B      │
│   (resubmit)    │
│                 │
│ Request #2:     │
│ SAME text       │
│ SAME ontology   │
│ SAME params     │
│ NEW requestId   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ RPC Server                          │
│                                     │
│ primaryKey = hash(text + ontId)     │
│ [DIFFERENT FROM VERSION-AWARE!]     │
│                                     │
│ Check RPC cache → MISS ❌           │
│ [Should HIT but doesn't!]           │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Orchestrator                        │
│                                     │
│ idempotencyKey = hash(text + ontId) │
│ [DIFFERENT!]                        │
│                                     │
│ Check execution cache → MISS ❌     │
│ [Should HIT but doesn't!]           │
└────────┬────────────────────────────┘
         │
         ▼
DOUBLE EXTRACTION RUN! ❌❌❌
Wasted LLM API calls and processing!
```

### Proposed (Fixed) Architecture

```
┌──────────────────────────┐
│   Client A               │
│                          │
│ POST /api/v1/extract {   │
│   text,                  │
│   ontologyId,            │
│   extractionParams       │
│ }                        │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────┐
│ RPC Server / Request Handler                     │
│                                                  │
│ 1. Fetch ontology version (content-based)        │
│    version = "sha256:a1b2c3d4e5f6g7h8"          │
│                                                  │
│ 2. Compute UNIFIED idempotency key               │
│    idempotencyKey = sha256-hash(                 │
│      normalizedText +                            │
│      ontologyId +                                │
│      ontologyVersion +                           │
│      extractionParamsHash                        │
│    )                                             │
│    = "sha256-x1y2z3a4b5c6d7e8"                  │
│                                                  │
│ 3. Query result cache                            │
│    cached = resultCache.get(idempotencyKey)      │
│    → CACHE HIT! Return immediately ✓             │
└──────────────────────────────────────────────────┘
                     │
                     ▼ (if cache miss)
┌──────────────────────────────────────────────────┐
│ Orchestrator / Workflow Manager                  │
│                                                  │
│ 1. Check execution cache                         │
│    handle = executionCache.get(idempotencyKey)   │
│    if running: await(handle.deferred)            │
│    → Deduplicate concurrent requests ✓           │
│                                                  │
│ 2. Mark as in-flight                             │
│    executionCache.set(idempotencyKey, {          │
│      status: 'running',                          │
│      deferred: Deferred<Result>()                │
│    })                                            │
│                                                  │
│ 3. Orchestrate with idempotencyKey passed        │
└────────┬─────────────────────────────────────────┘
         │ idempotencyKey carried as context
         ▼
┌──────────────────────────────────────────────────┐
│ Extraction Workflow / StreamingExtraction        │
│                                                  │
│ 6-Phase Pipeline:                                │
│ 1. Chunking: Split text                          │
│    Each chunk: { text, idempotencyKey, ... }     │
│                                                  │
│ 2. Entity Extraction:                            │
│    entityExtractor.extract(chunk, {              │
│      cacheKey: idempotencyKey:entities           │
│    })                                            │
│    → Cache hits on repeated entities ✓           │
│                                                  │
│ 3. Property Scoping:                             │
│    Filter properties by entity types             │
│                                                  │
│ 4. Entity Resolution:                            │
│    Cluster entities by idempotencyKey ✓          │
│    [NOT by requestId anymore!]                   │
│                                                  │
│ 5. Relation Extraction:                          │
│    relationExtractor.extract(entities, {         │
│      cacheKey: idempotencyKey:relations          │
│    })                                            │
│    → Cache hits on repeated relations ✓          │
│                                                  │
│ 6. Merge & Finalize:                             │
│    KnowledgeGraph stored with idempotencyKey     │
└────────┬─────────────────────────────────────────┘
         │ idempotencyKey as primary key
         ▼
┌──────────────────────────────────────────────────┐
│ Result Cache (Long-lived)                        │
│                                                  │
│ Key: "sha256-x1y2z3a4b5c6d7e8"                  │
│ Value: {                                         │
│   entities: [...],                               │
│   relations: [...],                              │
│   metadata: {                                    │
│     computedAt: "2025-12-09T10:00:00Z",         │
│     model: "claude-3-5-sonnet",                 │
│     temperature: 0.0,                            │
│     computedIn: 2500                             │
│   }                                              │
│ }                                                │
│ TTL: 7 days (configurable)                       │
│                                                  │
│ GUARANTEED TO BE REUSED! ✓                       │
└──────────────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────┐
│ RPC Response to Client A                         │
│                                                  │
│ {                                                │
│   idempotencyKey: "sha256-x1y2z3a4b5c6d7e8",    │
│   entities: [...],                               │
│   relations: [...],                              │
│   cacheHit: true,                                │
│   computedAt: "2025-12-09T10:00:00Z"            │
│ }                                                │
└──────────────────────────────────────────────────┘

═════════════════════════════════════════════════════════════════════════

┌──────────────────────────┐
│   Client B (Resubmit)    │
│                          │
│ POST /api/v1/extract {   │
│   text: SAME,            │
│   ontologyId: SAME,      │
│   extractionParams: SAME │
│ }                        │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────┐
│ RPC Server / Request Handler                     │
│                                                  │
│ 1. Fetch ontology version (content-based)        │
│    version = "sha256:a1b2c3d4e5f6g7h8" [SAME]   │
│                                                  │
│ 2. Compute UNIFIED idempotency key               │
│    idempotencyKey = "sha256-x1y2z3a4b5c6d7e8"   │
│    [SAME AS CLIENT A!] ✓                         │
│                                                  │
│ 3. Query result cache                            │
│    cached = resultCache.get(idempotencyKey)      │
│    → CACHE HIT IMMEDIATELY! ✓✓✓                 │
│    Return cached result without any extra work!  │
└──────────────────────────────────────────────────┘
                     │
         INSTANT RESPONSE TO CLIENT B!
         (stored from Client A's work)
                     ▼
┌──────────────────────────────────────────────────┐
│ RPC Response to Client B                         │
│                                                  │
│ {                                                │
│   idempotencyKey: "sha256-x1y2z3a4b5c6d7e8",    │
│   entities: [...],                               │
│   relations: [...],                              │
│   cacheHit: true,                                │
│   computedAt: "2025-12-09T10:00:00Z"            │
│ }                                                │
│                                                  │
│ ✓ Same result as Client A                        │
│ ✓ No redundant extraction                        │
│ ✓ Instant response                               │
│ ✓ Lower API costs                                │
└──────────────────────────────────────────────────┘
```

## Concurrent Request Deduplication

```
TIME →

Request A arrives                   Request B arrives (0.5s later)
     │                                   │
     ▼                                   ▼
Compute idempotencyKey          Compute idempotencyKey
key = "sha256-xyz"              key = "sha256-xyz" [SAME!]
     │                                   │
     ▼                                   ▼
Check executionCache            Check executionCache
Found: status='running'         Found: status='running'
Deferred(pending)               Wait for same Deferred!
     │                                   │
     │  Start extraction...              │
     │  (3 seconds)                      │
     │                                   │
     ▼                                   │
Extraction complete             │
Result: KnowledgeGraph          │
     │                          │
Deferred.resolve(result)        │
     │                          ▼
     ▼                    Deferred resolves
Store in resultCache      with SAME result
     │                          │
     ▼                          ▼
Return to Client A        Return to Client B
Latency: 3000ms          Latency: ~100ms ✓
                         [Waited for concurrent exec!]

═══════════════════════════════════════════════════════════════════

BENEFIT:
- Client B doesn't start duplicate extraction
- Client B waits for Client A's result
- Same result, fraction of the latency
- Only 1 LLM API call instead of 2
```

## Ontology Invalidation Flow

```
┌──────────────────────────────────────────────┐
│ Ontology Service: updateOntology()           │
│                                              │
│ newContent = {                               │
│   classes: [...],  [MODIFIED!]               │
│   properties: [...]                          │
│ }                                            │
└────────┬─────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────┐
│ Step 1: Compute new version                  │
│                                              │
│ oldVersion = "sha256:abc123def456"          │
│ newVersion = "sha256:xyz789uvw012"          │
│ [Different because content changed!]         │
└────────┬─────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────┐
│ Step 2: Update database                      │
│                                              │
│ UPDATE ontologies                            │
│ SET content = newContent,                    │
│     version = newVersion,                    │
│     updated_at = NOW()                       │
│ WHERE id = 'ontology-id'                     │
└────────┬─────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────┐
│ Step 3: Publish invalidation event           │
│                                              │
│ eventBus.publish({                           │
│   type: 'ontology-updated',                  │
│   ontologyId: 'ontology-id',                 │
│   oldVersion: 'sha256:abc123def456',         │
│   newVersion: 'sha256:xyz789uvw012'          │
│ })                                           │
└────────┬─────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────┐
│ Step 4: Cache invalidation handler           │
│                                              │
│ resultCache.deletePattern(                   │
│   '*:ontology-id:*'  [Match all versions!]   │
│ )                                            │
│                                              │
│ Deletes entries:                             │
│   sha256-xyz:ontology-id:sha256:abc123:...   │
│   sha256-abc:ontology-id:sha256:abc123:...   │
│   sha256-uvw:ontology-id:sha256:abc123:...   │
│ [Old version entries → GONE!]                │
│                                              │
│ Keeps entries with other ontologies:         │
│   sha256-123:other-ontology:...              │
│   [Unaffected!]                              │
└────────┬─────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────┐
│ Next extraction request with updated ontology│
│                                              │
│ computeIdempotencyKey({                      │
│   text: same,                                │
│   ontologyId: same,                          │
│   ontologyVersion: 'sha256:xyz789uvw012'     │
│   [NEW VERSION!]                             │
│   extractionParams: same                     │
│ })                                           │
│ = "sha256-NEW-KEY"                           │
│ [Different from old key!]                    │
│                                              │
│ Query cache:                                 │
│   resultCache.get("sha256-NEW-KEY")          │
│   → CACHE MISS ✓                             │
│   [Correct! New ontology = new result]       │
│                                              │
│ Run fresh extraction with new classes        │
│ Cache new result under new key               │
└──────────────────────────────────────────────┘
```

## Data Flow Diagram: Key Propagation

```
╔════════════════════════════════════════════════════════════════════╗
║                     REQUEST LIFECYCLE                             ║
╚════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  Client Submits:                                                    │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ {                                                           │   │
│  │   "text": "Cristiano Ronaldo plays for Al-Nassr",         │   │
│  │   "ontologyId": "http://example.org/sports-ontology",     │   │
│  │   "extractionParams": {                                    │   │
│  │     "llmModel": "claude-3-5-sonnet-20241022",             │   │
│  │     "temperature": 0.0,                                    │   │
│  │     "maxTokens": 4096,                                     │   │
│  │     "concurrency": 4                                       │   │
│  │   }                                                         │   │
│  │ }                                                           │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│ RPC Handler: computeIdempotencyKey()                                │
│                                                                     │
│ Input: text, ontologyId, extractionParams                          │
│ Output: idempotencyKey = "sha256-a1b2c3d4e5f6g7h8"                │
│                                                                     │
│ Formula:                                                            │
│   hash(                                                             │
│     normalizeText(text) +                                          │
│     ontologyId +                                                   │
│     computeOntologyVersion(ontology) +                             │
│     hashExtractionParams(params)                                   │
│   )                                                                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴──────────┐
                    │                    │
                    ▼                    ▼
         ┌────────────────────┐  ┌──────────────────────┐
         │  Result Cache      │  │ Execution Cache      │
         │  Lookup            │  │ Lookup               │
         │                    │  │                      │
         │ If FOUND:          │  │ If FOUND (running):  │
         │ → Return cached    │  │ → Await deferred     │
         │   result           │  │   (concurrent dedup) │
         │ → Cache HIT ✓      │  │                      │
         └────────────────────┘  └──────────────────────┘
                    │                    │
                    └─────────┬──────────┘
                              │
                    ┌─────────▼──────────┐
                    │   NOT IN CACHE     │
                    │                    │
                    │ idempotencyKey:    │
                    │ "sha256-a1b2c3..." │
                    └─────────┬──────────┘
                              │
                              ▼
         ┌────────────────────────────────────────────┐
         │ Orchestrator: streamingExtraction()        │
         │                                            │
         │ Receive idempotencyKey in context          │
         │ Pass to all sub-services                   │
         └────────────────────────────────────────────┘
                              │
                    ┌─────────┼─────────┐
                    │         │         │
                    ▼         ▼         ▼
         ┌──────────────┐ ┌─────────┐ ┌──────────────┐
         │   Phase 1    │ │ Phase 2 │ │   Phase 3    │
         │  Chunking    │ │ Mention │ │   Entity     │
         │              │ │Extraction│ │ Extraction   │
         │ {            │ │         │ │              │
         │  text,       │ │Cache    │ │ Cache under: │
         │  idempKey,   │ │under:   │ │ ${idempKey}: │
         │  ...         │ │${idempK}│ │ entities     │
         │ }            │ │:mention │ │ ✓            │
         └──────────────┘ └─────────┘ └──────────────┘
                    │         │         │
                    └─────────┼─────────┘
                              │
         ┌────────────┬───────▼──────────┬────────────┐
         │            │                  │            │
         ▼            ▼                  ▼            ▼
      ┌──────┐  ┌───────────┐   ┌───────────┐  ┌────────┐
      │Phase4│  │  Phase 5  │   │   Phase 6 │  │Finalize│
      │Scope │  │ Relations │   │  Merge    │  │        │
      │Props │  │ Extraction│   │  Graphs   │  │        │
      │      │  │           │   │           │  │        │
      │      │  │Cache under│   │Store with │  │        │
      │      │  │${idempKey}│   │idempKey   │  │        │
      │      │  │:relations │   │in DB      │  │        │
      │      │  │✓          │   │✓          │  │        │
      └──────┘  └───────────┘   └───────────┘  └────────┘
                                      │
                                      ▼
         ┌────────────────────────────────────────────┐
         │ Result Cache: Store KnowledgeGraph         │
         │                                            │
         │ Key: "sha256-a1b2c3d4e5f6g7h8"             │
         │ Value: {                                   │
         │   entities: [...],                         │
         │   relations: [...],                        │
         │   metadata: {                              │
         │     computedAt: "2025-12-09T...",          │
         │     model: "claude-3-5-sonnet",            │
         │     temperature: 0.0,                      │
         │     computedIn: 2345                       │
         │   }                                        │
         │ }                                          │
         │ TTL: 7 days                                │
         │                                            │
         │ READY FOR REUSE! ✓                         │
         └────────────────────────────────────────────┘
                              │
                              ▼
         ┌────────────────────────────────────────────┐
         │ RPC Response to Client                     │
         │                                            │
         │ {                                          │
         │   "idempotencyKey": "sha256-a1b2c...",     │
         │   "entities": [...],                       │
         │   "relations": [...],                      │
         │   "cacheHit": false,                       │
         │   "computedAt": "2025-12-09T..."           │
         │ }                                          │
         └────────────────────────────────────────────┘
```

---

## Migration Checklist

### Pre-Migration (Week 1)

- [ ] **Design Review**
  - [ ] Team reviews idempotency design document
  - [ ] Discuss formula components (text, ontologyId, version, params)
  - [ ] Decide on version strategy (semantic vs content-hash)
  - [ ] Approve cache invalidation strategy

- [ ] **Test Suite**
  - [ ] Create unit tests for `computeIdempotencyKey()`
  - [ ] Test text normalization idempotency
  - [ ] Test ontology version computation consistency
  - [ ] Test that changing any input produces different key

- [ ] **Database Preparation**
  - [ ] Design cache schema (see idempotency-design.md Part 5)
  - [ ] Create migration scripts
  - [ ] Set up audit logging tables
  - [ ] Create necessary indexes

### Phase 1: Core Implementation (Week 2-3)

- [ ] **Idempotency Key Computation**
  - [ ] Implement `normalizeText()`
  - [ ] Implement `hashExtractionParams()`
  - [ ] Implement `computeOntologyVersion()`
  - [ ] Implement `computeIdempotencyKey()`
  - [ ] Add to src/Utils/Idempotency.ts

- [ ] **Ontology Versioning**
  - [ ] Update OntologyService to load/store version
  - [ ] Implement version migration for existing ontologies
  - [ ] Add version field to ontology metadata
  - [ ] Create `getOntologyVersion()` function

- [ ] **RPC Handler Updates**
  - [ ] Update extraction endpoint to compute idempotencyKey
  - [ ] Add idempotencyKey to RPC request context
  - [ ] Propagate key through dependency injection
  - [ ] Add response field: `idempotencyKey`

- [ ] **Result Cache Layer**
  - [ ] Implement ExtractionCache interface
  - [ ] Create cache backend (Redis, database, or memory)
  - [ ] Implement get/set/delete/deletePattern operations
  - [ ] Add TTL support (7 days default)
  - [ ] Create tests for cache operations

### Phase 2: Workflow Integration (Week 4)

- [ ] **Orchestrator Updates**
  - [ ] Implement ExecutionDeduplicator service
  - [ ] Add execution cache (in-memory with optional backing)
  - [ ] Update workflow manager to check execution cache
  - [ ] Implement concurrent request deduplication
  - [ ] Add Deferred-based coordination

- [ ] **Extraction Workflow**
  - [ ] Update `streamingExtraction()` signature to receive idempotencyKey
  - [ ] Thread key through 6-phase pipeline
  - [ ] Update entity extraction to use cache
  - [ ] Update relation extraction to use cache
  - [ ] Update entity resolution clustering to use idempotencyKey
  - [ ] Add logging at each phase with key

- [ ] **Service Integration**
  - [ ] Update EntityExtractor to accept cache context
  - [ ] Update RelationExtractor to accept cache context
  - [ ] Update EntityResolutionService to use idempotencyKey for clustering
  - [ ] Add cache key computation to each service

### Phase 3: Testing (Week 5)

- [ ] **Unit Tests**
  - [ ] Test idempotency key determinism (100 iterations)
  - [ ] Test text normalization edge cases
  - [ ] Test ontology version changes
  - [ ] Test parameter hash computation
  - [ ] Test cache operations (get/set/delete)

- [ ] **Integration Tests**
  - [ ] Test cache hit on repeat request
  - [ ] Test cache miss with different text
  - [ ] Test concurrent request deduplication
  - [ ] Test ontology invalidation
  - [ ] Test end-to-end flow with caching

- [ ] **Load Tests**
  - [ ] Test cache performance under load
  - [ ] Test concurrent request handling
  - [ ] Measure cache hit rates
  - [ ] Profile memory usage

- [ ] **Compatibility Tests**
  - [ ] Run existing test suite
  - [ ] Verify no breaking changes
  - [ ] Test with different LLM models
  - [ ] Test with various ontology sizes

### Phase 4: Deployment (Week 6)

- [ ] **Feature Flag**
  - [ ] Add feature flag: `ENABLE_IDEMPOTENCY_KEY`
  - [ ] Make all new code conditional on flag
  - [ ] Default to `false` for safe rollout

- [ ] **Database Migration**
  - [ ] Run migration scripts in staging
  - [ ] Verify cache tables created
  - [ ] Verify indexes created
  - [ ] Backup production database

- [ ] **Monitoring Setup**
  - [ ] Add cache hit rate metric
  - [ ] Add idempotency key computation timing
  - [ ] Add execution deduplication metrics
  - [ ] Set up alerts for cache errors

- [ ] **Documentation**
  - [ ] Write API documentation
  - [ ] Document cache invalidation procedure
  - [ ] Create debug guide
  - [ ] Write runbooks for troubleshooting

### Phase 5: Gradual Rollout (Week 7+)

- [ ] **Staging Validation**
  - [ ] Enable feature flag in staging
  - [ ] Run full test suite
  - [ ] Validate cache behavior
  - [ ] Monitor for 24+ hours
  - [ ] Check logs and metrics

- [ ] **Canary Deployment**
  - [ ] Enable for 5% of production traffic
  - [ ] Monitor cache hit rates
  - [ ] Monitor error rates
  - [ ] Collect performance metrics
  - [ ] Run for 24 hours

- [ ] **Incremental Rollout**
  - [ ] 25% of traffic
  - [ ] 50% of traffic
  - [ ] 75% of traffic
  - [ ] 100% of traffic
  - [ ] (5% increase every 24 hours)

- [ ] **Validation at Each Stage**
  - [ ] Cache hit rate ≥ 60% (expected)
  - [ ] P99 latency improved
  - [ ] No increase in error rate
  - [ ] No increase in failed extractions

- [ ] **Final Cleanup (After 1 week at 100%)**
  - [ ] Remove feature flag conditional logic
  - [ ] Remove old idempotency code (if different)
  - [ ] Update documentation
  - [ ] Archive migration scripts

### Post-Migration (Ongoing)

- [ ] **Monitoring**
  - [ ] Daily check: cache hit rates
  - [ ] Weekly check: cache size
  - [ ] Monthly review: TTL effectiveness
  - [ ] Track cost savings from reduced LLM calls

- [ ] **Maintenance**
  - [ ] Implement cache cleanup job (auto-expire old entries)
  - [ ] Monitor cache bloat
  - [ ] Optimize cache backend if needed
  - [ ] Review and adjust TTL based on usage patterns

- [ ] **Documentation**
  - [ ] Update troubleshooting guides
  - [ ] Document cache behavior
  - [ ] Create migration notes for team
  - [ ] Add to runbooks

---

## Rollback Plan

If critical issues arise:

```
1. IMMEDIATE: Set feature flag to false
   ENABLE_IDEMPOTENCY_KEY = false

2. VERIFY: Old code path still working
   - Extractions complete without cache
   - Request processing unchanged
   - No orphaned resources

3. INVESTIGATE: Analyze issue
   - Check logs for error patterns
   - Review metrics
   - Identify root cause

4. FIX: Patch in feature branch
   - Fix bug
   - Run full test suite
   - Get code review

5. REDEPLOY: Retry with fixed code
   - Fix in staging first
   - Canary 5% again
   - Monitor closely
   - Full rollout when confident

6. POST-MORTEM: Document lesson learned
   - What went wrong?
   - How to prevent next time?
   - Update tests to catch issue
```

---

## Success Metrics

### Before Implementation
```
Baseline metrics:
- Extraction latency: 2500ms avg
- LLM API calls per request: 2-3
- Cache hit rate: N/A (no unified cache)
- Concurrent request handling: Duplicates
```

### After Implementation (Target)
```
Success criteria:
- Cache hit rate: ≥ 60% (estimated)
- Cached request latency: < 100ms
- LLM API calls on cache hit: 0
- Concurrent deduplicated requests: 100%
- Cost savings: ~40% reduction in API calls
- No regression in extraction quality
```

---

## Questions & Support

For questions during migration:

1. **Design questions**: See `idempotency-design.md` Parts 1-4
2. **Implementation questions**: See `idempotency-implementation.ts`
3. **Architecture questions**: See this document (architecture diagrams)
4. **Operational questions**: Contact DevOps team

---

**Document Version**: 1.0
**Last Updated**: December 2025
