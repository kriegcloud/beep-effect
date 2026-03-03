# MVP Persistence Surface: Executive Summary

**Status**: Design Complete
**Scope**: core-v2 MVP (document extraction)
**Problem Solved**: Eliminated persistence overbuild (4+ overlapping concerns → 2 unified surfaces)
**Date**: 2025-12-09

---

## The Problem

Current architecture overbuild with:
- `ExtractionRunService` (file-based run management)
- Potential `MessageStorage` (cluster mailbox)
- Potential `RunnerStorage` (shard locks)
- Potential `EventJournal` (audit)
- Potential `PersistedCache` (L1/L2 caching)
- SQL database layer
- Ontology cache

**Result**: 4+ copies of similar information, complex dependencies, unclear ownership.

---

## The Solution: Two Surfaces + One Approach

### Surface 1: Results Storage
**What**: Extracted knowledge graphs + outputs
**Where**: FileSystem (`./output/runs/{runId}/outputs/`)
**How**: JSON files
**Why**: Simple, idempotent, deterministic (by text hash)

```
./output/runs/doc-abc123def456/
├── outputs/
│   ├── knowledge-graph.json         ← Final KG
│   ├── entity-resolution-graph.json ← ERG
│   ├── mermaid-diagram.md          ← Visualization
│   └── rdf-turtle.ttl              ← RDF
├── input/
│   ├── document.txt                ← Original text
│   └── chunks/chunk-{N}.txt        ← Provenance
└── metadata.json                   ← Run metadata + audit events
```

**Queries**:
- `listRuns()` → filter locally (100s of runs is fine)
- `getRun(runId)` → read metadata.json
- `getOutput(runId, type)` → read JSON file

**No SQL needed yet** (Phase 2 adds it for cross-document queries).

---

### Surface 2: Audit Trail
**What**: Event log of extraction lifecycle
**Where**: `metadata.json` events array
**How**: JSON array of `{timestamp, type, data}`
**Why**: Portable with run, zero overhead, debugging-friendly

```json
{
  "runId": "doc-abc123def456",
  "createdAt": "2025-12-09T10:30:00Z",
  "completedAt": "2025-12-09T10:31:45Z",
  "events": [
    {"timestamp": "...", "type": "run.created", "data": {...}},
    {"timestamp": "...", "type": "chunking.complete", "data": {...}},
    {"timestamp": "...", "type": "extraction.complete", "data": {...}},
    {"timestamp": "...", "type": "resolution.complete", "data": {...}},
    {"timestamp": "...", "type": "run.completed", "data": {...}}
  ],
  "errors": [
    {"timestamp": "...", "type": "ExtractionError", "message": "..."}
  ]
}
```

**Queries**:
- `cat metadata.json | jq '.events'` → timeline
- `cat metadata.json | jq '.errors'` → failures
- Utility: `getRunTimeline(run)` → formatted timeline

**No EventJournal table needed** (audit trail is just events array).

---

### Approach: Fire-and-Forget Event Emission

Events are emitted at key stages in extraction:

```typescript
// In streamingExtraction
yield* runService.emitEvent(runId, "chunking.complete", {chunkCount})

// In main program
yield* runService.emitEvent(runId, "extraction.complete", {entityCount})
yield* runService.emitEvent(runId, "resolution.complete", {resolvedCount})
yield* runService.emitEvent(runId, "run.completed", {duration})

// On errors
yield* runService.emitError(runId, "ExtractionError", message, {context})
```

**Semantics**:
- Non-blocking (doesn't fail the extraction)
- Appends to events array in metadata.json
- Last-write-wins (concurrent emits safe)
- Acceptable for MVP (single-process per run)

---

## What We Defer (and Why)

### Phase 2: Cross-Document Queries (SQL)
**When needed**: Dashboard, analytics, "find all runs with >50 entities"
**Current MVP**: Not needed (few runs, in-memory filtering fine)
**Migration**: Zero-copy (FileSystem stays as source of truth, SQL mirrors it)

### Phase 2: Workflow Checkpoints
**When needed**: Extracting 1M-chunk documents, recovery from crashes
**Current MVP**: Not needed (reruns are deterministic and fast)
**Rationale**: 99% of extraction time is LLM, not local processing

### Phase 2: Distributed State
**When needed**: 10,000 documents across 10 machines
**Current MVP**: Not needed (single-machine, single-process)
**Deferral**: Will be addressed by refactoring ExtractionRunService

### Phase 3: Caching Layer
**When needed**: Same extraction requested 100 times
**Current MVP**: Not needed (each extraction is independent)
**Rationale**: Would add complexity for zero benefit at scale

---

## Impact Analysis

### What Changes (for MVP Phase 1)

| Component | Change | Effort | Risk |
|-----------|--------|--------|------|
| ExtractionRun model | Add events/errors fields | 1h | Low |
| ExtractionRunService | Add emitEvent/emitError methods | 2h | Low |
| StreamingExtraction | Emit events at key points | 2h | Very Low |
| Main program | Emit final events | 1h | Very Low |
| Tests | Add event emission tests | 4h | Low |
| **Total** | | **10 hours** | **Low** |

### What Doesn't Change

- FileSystem abstraction (already present)
- Effect.platform dependencies (no new ones)
- Extraction logic (orthogonal)
- Serialization (JSON is already used)

### Backward Compatibility

Old runs (without events array) remain readable:
- `events?: ReadonlyArray<AuditEvent>` is optional
- Empty array if missing

---

## File Locations (Design Docs)

| Document | Purpose | Path |
|----------|---------|------|
| **This file** | Executive summary | `/docs/PERSISTENCE_SUMMARY.md` |
| Full design | 30-page detailed analysis | `/docs/mvp-persistence-surface.md` |
| Checklist | Phase 1 implementation tasks | `/docs/MVP_PERSISTENCE_CHECKLIST.md` |
| Debugging | Guide to inspect runs | `/docs/DEBUGGING_GUIDE.md` |

---

## How to Validate This Design

### 1. Completeness Check
- [x] MVP persistence needs defined (results + audit)
- [x] Authoritative store chosen (FileSystem)
- [x] Schema minimal (2 new types: AuditEvent, AuditError)
- [x] Deferral strategy justified (4 areas deferred with rationale)
- [x] Implementation roadmap clear (Phase 1, 2, 3)
- [x] Migration path documented (FS → SQL in Phase 2)

### 2. Design Review Questions
- Is FileSystem sufficient for MVP? **Yes** (100s of documents)
- Can we migrate to SQL later? **Yes** (zero-copy design)
- Is event emission too expensive? **No** (<1ms per event)
- Is fire-and-forget safe? **Yes** (metadata.json is append-only)
- Do we need distributed state? **No** (deferred to Phase 2)

### 3. Practical Walkthrough

**User extracts a document**:
1. Text → hash → runId: `doc-abc123def456`
2. Extraction pipeline emits events
3. Results saved to `./output/runs/doc-abc123def456/outputs/`
4. Events appended to `metadata.json`
5. User views: `cat metadata.json | jq '.events'`

**Debugging a failed run**:
1. List runs: `ls ./output/runs/`
2. Check errors: `cat metadata.json | jq '.errors'`
3. View timeline: `cat metadata.json | jq '.events'`
4. Inspect inputs: `cat ./input/document.txt`

**Scaling to 1000s of documents (Phase 2)**:
1. Create `extraction_results` SQL table
2. Async job watches FileSystem
3. Materializes runs to DB
4. Enables cross-document queries
5. FileSystem remains source of truth

---

## Comparison: Before vs After

### Before (Overbuild)
```
User extracts document
  → ExtractionRunService saves metadata
  → Potentially MessageStorage buffers work
  → Potentially RunnerStorage locks process
  → Potentially EventJournal records events
  → Potentially PersistedCache stores results
  → Potentially SQL database stores everything

Result: 4+ overlapping storage layers, unclear ownership
```

### After (Minimal)
```
User extracts document
  → ExtractionRunService saves metadata + audit events
  → Files written to FileSystem (already available)
  → Results in ./output/runs/{runId}/

Result: 2 surfaces (results + audit), 1 storage layer (FS)
```

---

## Success Metrics

### Immediate (Phase 1)
- [ ] All new code has types (no `any`)
- [ ] Unit tests pass (100% coverage of new functions)
- [ ] Integration tests pass (full extraction with events)
- [ ] Backward compatible (old runs still readable)
- [ ] Documentation complete (3 guides + examples)
- [ ] No performance regression

### Medium-term (Phase 2)
- [ ] SQL migration is zero-copy (no data loss)
- [ ] Queries run in <100ms on 10K documents
- [ ] Audit trail remains immutable in FS

### Long-term (Phase 3)
- [ ] Distributed extraction works without changes to audit layer
- [ ] Checkpoints don't break existing audit events
- [ ] Cache invalidation doesn't affect FileSystem

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|-----------|
| Event array grows unbounded | Low | Low | ~100 events/run, 10KB/run |
| metadata.json corruption | Low | Med | Fire-and-forget design (audit is optional) |
| FileSystem limits (1M files) | Low | High | Migrate to SQL in Phase 2 |
| Concurrent writes conflict | Low | Low | Last-write-wins, acceptable for single-process |

---

## Next Steps

1. **Review & Approve** (this design)
   - [ ] Tech lead reviews design
   - [ ] Team aligns on scope
   - [ ] Questions answered

2. **Implement Phase 1** (~2 days)
   - Follow MVP_PERSISTENCE_CHECKLIST.md
   - Create PR with all changes
   - Get code review

3. **Validate**
   - Run existing test suite (no regressions)
   - Extract a document and inspect metadata.json
   - Verify events appear in timeline

4. **Plan Phase 2** (Q2 2025)
   - SQL schema design
   - Materialization job
   - Query API spec

---

## FAQ

**Q: Why not use SQL from the start?**
A: FileSystem is simpler, sufficient for MVP, and provides a zero-copy migration path to SQL in Phase 2.

**Q: What if someone runs the same extraction 100 times?**
A: Same text → same runId → same directory. Last extraction overwrites (idempotent). Not a problem, and Phase 2 adds deduplication.

**Q: Can we resume partial extractions?**
A: No in MVP. If extraction fails, rerun with same text (deterministic). Checkpoints added in Phase 2 if needed.

**Q: How do we query across documents?**
A: Phase 2 adds SQL table. Phase 1 uses local filtering (fine for <1000 documents).

**Q: Is audit overhead acceptable?**
A: Yes. Event emission is <1ms per event, appends are cheap. ~100 events per run = <100ms overhead.

---

## Document Index

- **Full Design**: `mvp-persistence-surface.md` (comprehensive, 30 pages)
- **Implementation**: `MVP_PERSISTENCE_CHECKLIST.md` (tasks, estimates, success criteria)
- **Debugging**: `DEBUGGING_GUIDE.md` (how to inspect runs in production)
- **This File**: `PERSISTENCE_SUMMARY.md` (executive summary, 2 pages)

---

## Sign-Off

| Role | Name | Date | Status |
|------|------|------|--------|
| **Designer** | @pooks | 2025-12-09 | ✓ Designed |
| **Tech Lead** | [TBD] | [TBD] | [ ] Approved |
| **Implementation** | [TBD] | [TBD] | [ ] In Progress |
| **Testing** | [TBD] | [TBD] | [ ] Complete |

---

**Last Updated**: 2025-12-09
**Status**: Design Phase Complete, Ready for Review
