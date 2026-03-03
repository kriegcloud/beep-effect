# MVP Persistence Implementation Checklist

## Phase 0: Design Validation (DONE)
- [x] Analyze current persistence architecture
- [x] Define MVP needs (results + audit only)
- [x] Justify FileSystem vs SQL
- [x] Design metadata.json schema with events
- [x] Document deferral strategy
- [x] Create implementation roadmap

---

## Phase 1: MVP Implementation (IN PROGRESS)

### 1.1 Update Domain Models
- [ ] Add `AuditEvent` interface to `ExtractionRun.ts`
- [ ] Add `AuditError` interface to `ExtractionRun.ts`
- [ ] Add `AuditEventType` union type
- [ ] Add `events: ReadonlyArray<AuditEvent>` to ExtractionRun
- [ ] Add `errors?: ReadonlyArray<AuditError>` to ExtractionRun
- [ ] Update `ExtractionRunSchema` for validation
- [ ] Add test cases for new fields in ExtractionRun model

**File**: `/packages/@core-v2/src/Domain/Model/ExtractionRun.ts`

### 1.2 Enhance ExtractionRunService
- [ ] Add `emitEvent()` method to interface
- [ ] Add `emitError()` method to interface
- [ ] Implement `emitEvent()` in live service
  - [ ] Append to `metadata.json` events array
  - [ ] Handle concurrent access safely (read-modify-write)
  - [ ] Log errors without throwing (fire-and-forget semantics)
- [ ] Implement `emitError()` in live service
  - [ ] Append to `metadata.json` errors array
  - [ ] Include timestamp and context
- [ ] Update `createRun()` to initialize empty events array
- [ ] Add test cases for event emission

**File**: `/packages/@core-v2/src/Service/ExtractionRun.ts`

### 1.3 Integrate Events into Streaming Extraction
- [ ] Emit "chunking.complete" after NLP chunking
- [ ] Emit "chunk_extraction.complete" after each chunk (in mapEffect)
- [ ] Emit "extraction.complete" after all chunks merged
- [ ] Handle errors gracefully (emit "run.failed" on systemic errors)
- [ ] Annotate logs with stage information

**File**: `/packages/@core-v2/src/Workflow/StreamingExtraction.ts`

### 1.4 Integrate Events into Main Program
- [ ] Emit "resolution.complete" after entity resolution
- [ ] Emit "refine.complete" after KG refinement
- [ ] Emit "rdf.complete" after RDF generation
- [ ] Emit "run.completed" after all outputs saved
- [ ] Calculate and include duration in completed event

**File**: `/packages/@core-v2/src/main.ts`

### 1.5 Add Metadata Inspection Utilities
- [ ] Create `ExtractionRunUtils` with helper functions
  - [ ] `getRunTimeline(run): Array<{timestamp, type, summary}>`
  - [ ] `getRunDuration(run): number | undefined`
  - [ ] `getRunStatus(run): "pending" | "running" | "completed" | "failed"`
  - [ ] `formatRunSummary(run): string`
- [ ] Add tests for utility functions

**File**: `/packages/@core-v2/src/Service/ExtractionRunUtils.ts` (NEW)

### 1.6 Documentation & Examples
- [ ] Document file structure in code comments
- [ ] Add example metadata.json to docs
- [ ] Document event types and data fields
- [ ] Create debugging guide (how to inspect failed runs)
- [ ] Add mermaid diagram of run lifecycle

**Files**:
- Updated: `/packages/@core-v2/src/Service/ExtractionRun.ts` (JSDoc)
- New: `/packages/@core-v2/docs/DEBUGGING_GUIDE.md`
- New: `/packages/@core-v2/docs/examples/metadata.json`

### 1.7 Testing
- [ ] Unit test: ExtractionRunService.emitEvent()
- [ ] Unit test: ExtractionRunService.emitError()
- [ ] Unit test: Concurrent event emission
- [ ] Integration test: Full extraction with events
- [ ] Integration test: Error case with error events
- [ ] Snapshot test: metadata.json structure

**Files**:
- New: `/packages/@core-v2/test/Service/ExtractionRunService.test.ts`
- New: `/packages/@core-v2/test/Workflow/EventIntegration.test.ts`

---

## Phase 2: SQL Migration (Q2 2025) - NOT IN MVP

### 2.1 Add SQL Layer (Skipped for MVP)
- [ ] Add @effect/sql-sqlite-bun to package.json
- [ ] Create Database service
- [ ] Create migration system
- [ ] Create `extraction_results` table

### 2.2 Async Materialization (Skipped for MVP)
- [ ] Watch FileSystem for new runs
- [ ] Materialize to SQL on completion
- [ ] Keep FS as source of truth

### 2.3 Query API (Skipped for MVP)
- [ ] List runs with filtering
- [ ] Search by status, date, entity count
- [ ] Get statistics dashboard

---

## Phase 3: Distribution (Q3 2025) - NOT IN MVP

### 3.1 Distributed State (Skipped for MVP)
- [ ] Refactor ExtractionRunService for distributed backends
- [ ] Add distributed locks
- [ ] Add runner state table

### 3.2 Checkpoints (Skipped for MVP)
- [ ] Save entity registry at checkpoints
- [ ] Resume from checkpoint on restart
- [ ] Test recovery scenarios

---

## Success Criteria for MVP

- [x] MVP persistence design complete
- [ ] AuditEvent + AuditError models in code
- [ ] emitEvent() + emitError() implemented
- [ ] Events emitted at key extraction points
- [ ] metadata.json persists audit trail
- [ ] Tests pass (100% of new code)
- [ ] Debugging guide available
- [ ] Example metadata.json in docs
- [ ] No external dependencies added (FileSystem already present)
- [ ] Backward compatible (old runs still readable)

---

## Definition of Done

Per item:
- [x] Code implemented
- [x] Unit tests pass
- [x] Integration tests pass
- [x] Documentation complete
- [x] No regressions
- [x] Type-safe (TypeScript strict mode)
- [x] Effect-idiomatic (follows patterns from source)

---

## Notes

### Concurrency Considerations
- FileSystem operations are atomic at the OS level
- Metadata.json read-modify-write is not transactional
- With concurrent writes, last-write-wins
- This is acceptable for MVP (single process per run)
- Phase 2 SQL + transactions will fix this

### Error Handling
- Don't throw from emitEvent() - use fire-and-forget
- If metadata.json is corrupted, log warning but continue
- Allow the extraction to succeed even if audit trail fails
- This makes the audit trail "best effort" (sufficient for MVP)

### Timestamp Precision
- Use ISO-8601 timestamps (standard for logs)
- Millisecond precision (via `new Date().toISOString()`)
- Use for ordering events in timeline

### Future Extensibility
- AuditEventType is union - easy to add new event types
- data field is open Record - event-specific info
- errors array is separate - can grow independently
- No schema versioning problems (JSON structure is flexible)

---

## Review Checklist

Before considering Phase 1 complete:
- [ ] All items in 1.1-1.7 completed
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] No Effect violations
- [ ] At least one full extraction run with complete event trail
- [ ] Example metadata.json checked in
- [ ] Code review approved
- [ ] One team member validates the design

---

## Post-MVP Maintenance

### Monitoring Queries (Once Phase 2 SQL added)
```sql
-- How many runs completed successfully?
SELECT COUNT(*) FROM extraction_results WHERE status = 'completed'

-- What's the average extraction time?
SELECT AVG(duration) FROM extraction_results

-- Which runs failed and why?
SELECT runId, error FROM extraction_results WHERE status = 'failed'

-- Most common error types?
SELECT type, COUNT(*) FROM extraction_errors GROUP BY type ORDER BY COUNT(*) DESC
```

### Debugging Queries (Once Phase 2 added)
```
$ ls ./output/runs/doc-abc123def456/
$ cat ./output/runs/doc-abc123def456/metadata.json | jq '.events'
$ cat ./output/runs/doc-abc123def456/metadata.json | jq '.errors'
$ cat ./output/runs/doc-abc123def456/outputs/*.json | jq '.entities | length'
```

---

## Blockers / Dependencies

None for MVP phase:
- All required Effect modules already present (@effect/platform)
- No new external dependencies
- No blocking architecture changes

---

## Time Estimate

| Task | Hours | Notes |
|------|-------|-------|
| 1.1 Domain models | 1 | Straightforward schema addition |
| 1.2 Service enhancement | 3 | Read-modify-write concurrency handling |
| 1.3 Streaming integration | 2 | Add emit calls at key points |
| 1.4 Main integration | 1 | Add final emit calls |
| 1.5 Utilities | 2 | Helpers for run inspection |
| 1.6 Documentation | 2 | Docs + examples |
| 1.7 Testing | 5 | Unit + integration tests |
| **Total** | **~16 hours** | ~2 days of focused work |

---

## Questions to Validate

Before starting Phase 1:
- [ ] Is FileSystem approach acceptable for MVP scope?
- [ ] Are audit event types comprehensive enough?
- [ ] Should we track more granular events (e.g., per-entity)?
- [ ] Is fire-and-forget error handling acceptable?
- [ ] Should events have unique IDs for tracing?
- [ ] Do we need event filtering/querying in Phase 1?

---

## Sign-off

**Design approved by**: [TBD]
**Implementation started**: [TBD]
**Phase 1 complete**: [TBD]
