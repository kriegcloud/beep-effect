# MVP Persistence Surface Design

**Status**: Design Phase
**Target**: core-v2 MVP (Q1 2025)
**Author**: @pooks
**Last Updated**: 2025-12-09

---

## Executive Summary

Current persistence architecture is **overbuilt** with 4+ overlapping storage concerns:
- `ExtractionRunService` (file-based, run metadata + chunks + outputs)
- Potential `MessageStorage` (cluster mailbox for distributed work)
- Potential `RunnerStorage` (shard locks for parallel safety)
- Potential `EventJournal` (audit trail)
- Potential `PersistedCache` (L1/L2 caching with invalidation)
- SQL database layer (from core package)
- Ontology cache (in-memory, gets regenerated)

**MVP approach**: Strip to **2 tables + 1 file system**, support **ONE use case** (document extraction), defer **orchestration**, **clustering**, and **advanced caching**.

---

## Part 1: MVP Persistence Needs Analysis

### Current Dataflow (from main.ts + streamingExtraction.ts)

```
1. User provides: inputText
2. Create run (hash-based ID): doc-{12hexchars}
3. Save chunks: input/{chunks}/chunk-{N}.txt
4. Extract in parallel: entities + relations
5. Build entity resolution graph (in-memory)
6. Refine knowledge graph
7. Save outputs:
   - knowledge-graph.json
   - entity-resolution-graph.json
   - mermaid-diagram.md
   - rdf-turtle.ttl
8. Update run stats
9. Complete run
```

### Three Persistence Concerns

#### 1. **Results** (Critical for MVP)
**Question**: Where does the extracted knowledge graph live?

**Current State**:
- ExtractionRunService saves JSON outputs to disk
- Path: `./output/runs/{runId}/outputs/{type}.json`
- Chunks saved as backup: `./output/runs/{runId}/input/chunks/chunk-{N}.txt`
- Run metadata: `./output/runs/{runId}/metadata.json`

**MVP Requirement**:
- Must be able to retrieve KG results by run ID
- Must survive process restart
- Should be queryable (list runs, get run status)

**Recommendation**: **Keep ExtractionRunService exactly as-is**
- FileSystem is already available via @effect/platform
- No SQL layer needed yet
- Simple, deterministic paths
- Supports idempotent writes (text hash → same run ID)

---

#### 2. **Audit** (Minimal for MVP)
**Question**: How do we debug what happened?

**Current State**:
- Effect logs (JSON-structured via OpenTelemetry)
- Span annotations during extraction
- Error propagation with typed exceptions

**Minimal MVP Audit Trail**:
Instead of EventJournal table, add **structured event logging to run metadata**:

```typescript
// In ExtractionRun metadata.json
{
  "runId": "doc-abc123def456",
  "createdAt": "2025-12-09T10:30:00Z",
  "completedAt": "2025-12-09T10:31:45Z",
  "status": "completed",  // or "running", "failed"
  "stats": { ... },

  // NEW: Minimal audit trail
  "events": [
    {
      "timestamp": "2025-12-09T10:30:00Z",
      "type": "run.created",
      "data": { "textHash": "abc123..." }
    },
    {
      "timestamp": "2025-12-09T10:30:05Z",
      "type": "chunking.complete",
      "data": { "chunkCount": 8 }
    },
    {
      "timestamp": "2025-12-09T10:30:45Z",
      "type": "extraction.complete",
      "data": { "entityCount": 45, "relationCount": 23 }
    },
    {
      "timestamp": "2025-12-09T10:31:30Z",
      "type": "resolution.complete",
      "data": { "resolvedCount": 12, "clusterCount": 8 }
    },
    {
      "timestamp": "2025-12-09T10:31:45Z",
      "type": "run.completed",
      "data": { "outputFiles": [...] }
    }
  ],

  "errors": [
    // Only if run failed
    { "timestamp": "...", "type": "...", "message": "..." }
  ]
}
```

**Why embedded in metadata.json?**
- No additional table/DB needed
- Audit trail moves with the run
- Easy to inspect (`cat ./output/runs/{runId}/metadata.json`)
- 90% of debugging needs covered

---

#### 3. **Orchestration State** (Defer for MVP)
**Question**: Do we need to resume partial extractions or coordinate distributed work?

**MVP Answer**: **NO - defer to Phase 2**

Justifications:
- Single-process per document (no sharding)
- Streaming extraction already handles partial chunk failures gracefully
- Each run is deterministic by document hash
- If process crashes, rerun with same text = same extraction

**What we defer**:
- Workflow checkpoints (capture state mid-extraction for resume)
- Shard/runner state (for distributed extraction across machines)
- Message buffers (for async work queues)
- Transaction semantics (complex ACID requirements)

**Will be needed when**:
- Running 1000s of documents in parallel
- Machines are unreliable
- Need to track extraction progress across distributed systems
- Want to resume failed batches without re-processing everything

---

## Part 2: Authoritative Storage Strategy

### Principle: Single Source of Truth

| Concern | Storage | Mechanism | Queries |
|---------|---------|-----------|---------|
| **Results** | FileSystem | JSON files in `./output/runs/{runId}/` | List runs, get run, read outputs |
| **Audit** | FileSystem | `metadata.json` event array | Read events in metadata |
| **Chunks** | FileSystem | `input/chunks/chunk-{N}.txt` | Read by chunk ID |

### Why FileSystem for MVP?

```
PROS:
✓ Already available (@effect/platform/FileSystem)
✓ No database setup/migration needed
✓ Idempotent writes (retry-safe)
✓ Human-inspectable (read as JSON/text)
✓ Cheap storage (local disk in dev, S3-compatible later)
✓ Deterministic paths (content-addressable by run hash)
✓ No schema versioning problems
✓ Easy to back up (copy directory tree)
✓ Scales to 10Ks of documents

CONS:
✗ No cross-document queries (find all entities named "X")
✗ No transactions (multi-file updates aren't atomic)
✗ No SQL joins (would need post-processing)

WHEN NOT SUITABLE:
→ Need cross-document entity resolution (Phase 2)
→ Need to query "find all extractions with >100 entities" (Phase 2)
→ Scale beyond millions of documents (Phase 3)
```

**When we migrate to SQL (Phase 2)**:
- Create `extraction_results` table (replicate of outputs)
- Keep files as blob storage (reference from DB)
- Build indices for queries
- No data loss (files stay as backup)

---

## Part 3: Schema Design (Minimal MVP)

### File Structure (Unchanged)

```
./output/runs/
├── doc-abc123def456/              # runId (from text hash)
│   ├── input/
│   │   ├── document.txt           # Original input
│   │   └── chunks/
│   │       ├── chunk-0.txt
│   │       ├── chunk-1.txt
│   │       └── ...
│   ├── outputs/
│   │   ├── knowledge-graph.json         # Final KG (refined)
│   │   ├── entity-resolution-graph.json # ERG with canonical mapping
│   │   ├── mermaid-diagram.md          # Visualization
│   │   └── rdf-turtle.ttl              # RDF Turtle format
│   └── metadata.json              # Run metadata + audit events
│
├── doc-xyz789abc123/
│   └── ...
```

### Metadata Schema (metadata.json)

```typescript
// packages/@core-v2/src/Domain/Model/ExtractionRun.ts

export interface ExtractionRun {
  readonly runId: ExtractionRunId
  readonly documentId: ExtractionRunId
  readonly createdAt: string                // ISO-8601 timestamp
  readonly completedAt?: string             // ISO-8601 timestamp (if done)
  readonly config: RunConfig
  readonly outputDir: string
  readonly stats?: RunStats
  readonly outputs: ReadonlyArray<OutputMetadata>

  // NEW: Minimal audit trail
  readonly events: ReadonlyArray<AuditEvent>
  readonly errors?: ReadonlyArray<AuditError>
}

export interface AuditEvent {
  readonly timestamp: string                 // ISO-8601
  readonly type: AuditEventType              // "run.created", "extraction.complete", etc.
  readonly data?: Record<string, unknown>   // Event-specific data
}

export type AuditEventType =
  | "run.created"                // Run initialized
  | "chunking.complete"          // Text chunked
  | "chunk_extraction.complete"  // Chunk processed
  | "extraction.complete"        // All chunks processed
  | "resolution.complete"        // Entity resolution done
  | "refine.complete"            // KG refinement done
  | "rdf.complete"               // RDF generation done
  | "run.completed"              // Run finalized
  | "run.failed"                 // Run failed (error in "errors" array)

export interface AuditError {
  readonly timestamp: string
  readonly type: string                     // Error class name
  readonly message: string
  readonly context?: Record<string, unknown>
}

export interface RunStats {
  readonly chunkCount: number
  readonly entityCount: number
  readonly relationCount: number
  readonly resolvedCount: number
  readonly clusterCount: number
}

export interface OutputMetadata {
  readonly type: OutputType
  readonly path: string                     // Relative: outputs/{filename}
  readonly hash: string                     // Content hash for integrity
  readonly size: number                     // Bytes
  readonly savedAt: string                  // ISO-8601 timestamp
}

export type OutputType =
  | "knowledge-graph"
  | "entity-resolution-graph"
  | "mermaid-diagram"
  | "rdf-turtle"
```

### Which Effect Persistence Primitive?

**Answer**: **FileSystem from @effect/platform** ✓

```typescript
import { FileSystem, Path } from "@effect/platform"

// What we use:
- fs.readDirectory(dir)        // List runs
- fs.readFileString(path)      // Get outputs
- fs.writeFileString(path, content)  // Save outputs
- fs.makeDirectory(dir, recursive)   // Create structure
- fs.remove(dir, recursive)    // Delete runs

// What we DON'T need:
✗ SqlClient (Phase 2)
✗ Transactional writes (Phase 2)
✗ Distributed locks (Phase 2)
✗ Event sourcing (Phase 3)
```

**Layer implementation**:
- ExtractionRunService already exists (perfect)
- Just enhance metadata.json schema to include events/errors
- Add helper functions to emit audit events

---

## Part 4: Caching Strategy

### Three Levels of Caching

| Level | What | How | TTL | Invalidation |
|-------|------|-----|-----|--------------|
| **L1: Request** | Run objects | In-memory Map during extraction | Request lifetime | End of extraction |
| **L2: Session** | Ontology classes/properties | Memory with lazy-load | Session lifetime | New session |
| **L3: Persistent** | Extracted KGs | FileSystem JSON | Indefinite | Manual delete |

### L1: Request-Level Cache (for single extraction)

**Problem**: During `streamingExtraction`, we repeatedly:
- Load run metadata
- Load chunks
- Append to outputs array

**Solution**: Keep run object in-memory during extraction

```typescript
// In StreamingExtraction or wrapper
const streamingExtractionWithRunCache = (
  text: string,
  config: RunConfig
): Effect.Effect<KnowledgeGraph, ExtractionError, ...> =>
  Effect.gen(function*() {
    const runService = yield* ExtractionRunService

    // Create run once
    const run = yield* runService.createRun(text, config)

    // Cache in-memory for duration of extraction
    const runRef = { current: run }

    // Proceed with extraction (no re-reading run metadata)
    const graph = yield* streamingExtraction(text, config)

    // Save outputs and update stats in cached run
    yield* runService.saveOutput(run.runId, "knowledge-graph", JSON.stringify(graph))

    // ... save other outputs ...

    // Mark complete
    yield* runService.completeRun(run.runId)

    return graph
  })

// No need for Cache<RunId, ExtractionRun> - request is short-lived
```

### L2: Session-Level Cache (ontology data)

**What gets cached**: OntologyService (already has this)
- Classes loaded once per session
- Properties computed once per session
- Search indices built once per session

**Current implementation**: OntologyService.Default provides cached layer
- **No changes needed** ✓

### L3: FileSystem Cache (extracted results)

**What**: KnowledgeGraph JSON files in `./output/runs/`

**Cache validity**:
- Immutable (never overwrite a saved run)
- Deterministic (same text → same run ID)
- Content-addressed (run ID is text hash)

**Invalidation**: Manual only
```typescript
// User decides when to clear
runService.deleteRun(runId)  // Remove directory
```

**When to NOT cache**:
- During testing (use temp directories)
- When text is dynamic (different each time)

---

## Part 5: What Gets Deferred and Why

### Phase 2: Cross-Document Queries
**Deferred**: SQL table for search + indexing

When needed:
- "Find all runs with >50 entities"
- "Find all entities named 'Barcelona'"
- "Find relations of type 'plays_for'"
- Dashboard with run statistics

Implementation:
- Add `extraction_results` SQL table
- Index on: status, createdAt, entityCount, etc.
- Async materialization from JSON files
- Keep files as source of truth

**Current MVP**: List/filter done in-memory (small number of runs)

---

### Phase 2: Workflow Resumption
**Deferred**: Checkpoint tables + recovery

When needed:
- Document with 1M chunks, extraction takes 8 hours
- Process crashes at chunk 500K
- Need to resume from checkpoint, not restart

Implementation:
- `extraction_checkpoints` table
- Save entity registry + graph state every N chunks
- On restart, load checkpoint and continue

**Current MVP**: No checkpoints
- If extraction fails, user reruns the whole thing
- Reruns are fast (99% of time is LLM, not local processing)
- Simple to reason about

---

### Phase 2: Distributed Orchestration
**Deferred**: Message queues + runner state

When needed:
- 10,000 documents in flight across 10 machines
- Need load balancing, failure tracking, retry logic

Implementation:
- MessageStorage (task queue)
- RunnerStorage (who's working on what)
- Distributed locks (prevent double-processing)

**Current MVP**: Single machine, single process
- ExtractionRunService is local-only
- No need for distributed state
- Will be refactored to distributed layer in Phase 2

---

### Phase 3: Caching Layer
**Deferred**: L1/L2 result caching with TTL

When needed:
- Same extraction run requested 100 times
- Want to serve from cache instead of recomputing

Implementation:
- Extraction result cache with TTL
- Invalidate on ontology change
- Lazy-compute on cache miss

**Current MVP**: No caching
- Each extraction is independent
- Recomputation is acceptable
- Would add complexity now

---

## Part 6: Implementation Roadmap

### MVP (Done Now)
- [x] FileSystem-based storage (ExtractionRunService)
- [x] JSON serialization of KGs
- [x] Run metadata with stats
- [ ] **NEW**: Add audit events to metadata.json
- [ ] **NEW**: Add error tracking to metadata.json
- [ ] Document file structure

### Phase 2 (Q2 2025)
- [ ] Add `extraction_results` SQL table
- [ ] Async materialization from JSON → SQL
- [ ] Query API for runs
- [ ] Dashboard backend (count, filter, search)
- [ ] Checkpoint support for large documents
- [ ] Refactor ExtractionRunService to support SQL + FS

### Phase 3 (Q3 2025)
- [ ] Distributed ExtractionRunService
- [ ] Runner state + load balancing
- [ ] Cross-machine checkpoints
- [ ] Result caching layer

---

## Part 7: Code Changes (MVP)

### 1. Update ExtractionRun model

**File**: `/packages/@core-v2/src/Domain/Model/ExtractionRun.ts`

Add audit event types:

```typescript
export interface AuditEvent {
  readonly timestamp: string
  readonly type: AuditEventType
  readonly data?: Record<string, unknown>
}

export type AuditEventType =
  | "run.created"
  | "chunking.complete"
  | "chunk_extraction.complete"
  | "extraction.complete"
  | "resolution.complete"
  | "refine.complete"
  | "rdf.complete"
  | "run.completed"
  | "run.failed"

export interface AuditError {
  readonly timestamp: string
  readonly type: string
  readonly message: string
  readonly context?: Record<string, unknown>
}

export interface ExtractionRun {
  readonly runId: ExtractionRunId
  readonly documentId: ExtractionRunId
  readonly createdAt: string
  readonly completedAt?: string
  readonly config: RunConfig
  readonly outputDir: string
  readonly stats?: RunStats
  readonly outputs: ReadonlyArray<OutputMetadata>

  // NEW
  readonly events: ReadonlyArray<AuditEvent>
  readonly errors?: ReadonlyArray<AuditError>
}
```

### 2. Enhance ExtractionRunService

**File**: `/packages/@core-v2/src/Service/ExtractionRun.ts`

Add methods to emit events:

```typescript
export interface ExtractionRunService {
  // Existing methods
  createRun(text: string, config: RunConfig): Effect<ExtractionRun, Error, FS>
  saveChunk(...): Effect<ChunkId, Error, FS>
  saveOutput(...): Effect<OutputMetadata, Error, FS>
  updateStats(...): Effect<void, Error, FS>
  completeRun(...): Effect<ExtractionRun, Error, FS>
  getRun(...): Effect<ExtractionRun, Error, FS>
  listRuns(): Effect<ReadonlyArray<ExtractionRun>, Error, FS>

  // NEW: Audit trail
  emitEvent(
    runId: ExtractionRunId,
    type: AuditEventType,
    data?: Record<string, unknown>
  ): Effect<void, Error, FS>

  emitError(
    runId: ExtractionRunId,
    type: string,
    message: string,
    context?: Record<string, unknown>
  ): Effect<void, Error, FS>
}
```

Implementation appends to metadata.json events array.

### 3. Integrate events into streamingExtraction

**File**: `/packages/@core-v2/src/Workflow/StreamingExtraction.ts`

Call `emitEvent` at key points:

```typescript
// After chunking
yield* runService.emitEvent(run.runId, "chunking.complete", {
  chunkCount: chunks.length
})

// After all chunks processed
yield* runService.emitEvent(run.runId, "extraction.complete", {
  entityCount: graphFragments.entities.length,
  relationCount: graphFragments.relations.length
})

// On error
yield* runService.emitError(run.runId, "ExtractionError", error.message, {
  stage: "chunk-processing",
  chunkIndex: chunk.index
})
```

### 4. Update main.ts to emit events

**File**: `/packages/@core-v2/src/main.ts`

```typescript
const program = Effect.gen(function*() {
  // ... existing code ...

  yield* runService.emitEvent(runId, "resolution.complete", {
    resolvedCount: erg.stats.resolvedCount,
    clusterCount: erg.stats.clusterCount
  })

  yield* runService.emitEvent(runId, "refine.complete", {
    originalEntities: kg.entities.length,
    refinedEntities: refinedKg.entities.length,
    originalRelations: kg.relations.length,
    refinedRelations: refinedKg.relations.length
  })

  yield* runService.emitEvent(runId, "rdf.complete", {})

  // Update stats and complete
  yield* runService.updateStats(runId, stats)
  yield* runService.completeRun(runId)

  yield* runService.emitEvent(runId, "run.completed", {
    duration: /* compute from timestamps */
  })
})
```

---

## Summary: MVP Persistence Contract

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| **Results Store** | FileSystem (ExtractionRunService) | No DB setup, idempotent, human-readable |
| **Audit Trail** | Metadata.json events array | Minimal overhead, portable with run |
| **Caching** | None (Phase 2) | Request-level caching sufficient |
| **Queries** | In-memory (Phase 2) | Small number of runs, SQL later |
| **Checkpoints** | None (Phase 2) | Fast reruns acceptable for MVP |
| **Distribution** | None (Phase 2) | Single-machine, single-process |
| **Schema** | 2 types (AuditEvent, AuditError) | Embedded in metadata.json |
| **Dependencies** | @effect/platform (FileSystem) | Already required |
| **Migration Path** | FileSystem → SQL (Phase 2) | Idempotent design allows this |

---

## FAQ

**Q: Why not use SQLite from the start?**
A: MVP doesn't need queries. Adding @effect/sql, schema migrations, and DB setup adds complexity for zero benefit. FileSystem is simpler and suffices for 100s of documents.

**Q: What if runs get too numerous?**
A: Phase 2 adds SQL for indexing/search. Running `listRuns()` on 10K directories is still <1s. Scale to millions triggers rewrite (Phase 3).

**Q: Can we resume partial extractions?**
A: Not in MVP. If extraction fails, rerun with same text (deterministic, fast). Checkpoints added in Phase 2 if needed.

**Q: How do we handle concurrent extractions?**
A: Each run has unique ID (text hash). Concurrent extractions of different texts = different directories. Concurrent extractions of same text = idempotent (same outputs, last write wins). Lock-free by design.

**Q: Will metadata.json grow unbounded?**
A: Events array is ~100 entries per run (chunking, chunk extraction, resolution phases). ~10KB per run. 10K runs = 100MB. Not a problem for MVP.

---

## References

- Current ExtractionRunService: `/packages/@core-v2/src/Service/ExtractionRun.ts`
- Domain Models: `/packages/@core-v2/src/Domain/Model/`
- Streaming Extraction: `/packages/@core-v2/src/Workflow/StreamingExtraction.ts`
- Main Program: `/packages/@core-v2/src/main.ts`
- Effect FileSystem: `docs/effect-source/platform/src/FileSystem.ts`
