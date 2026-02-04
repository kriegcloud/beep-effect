# MVP Persistence Surface: Complete Documentation Index

**Project**: effect-ontology core-v2
**Scope**: Minimal persistence for document extraction MVP
**Deliverables**: Design, checklist, debugging guide, examples
**Date**: 2025-12-09

---

## Document Structure

This package contains a complete design for MVP persistence, from strategic decisions to implementation details.

### Start Here: Executive Summary (5 min read)
**File**: `/docs/PERSISTENCE_SUMMARY.md`

Quick overview of:
- The problem (overbuild with 4+ overlapping concerns)
- The solution (2 surfaces: Results + Audit)
- What's deferred and why (Phase 2, Phase 3)
- Comparison before/after
- Risk mitigation

**Best for**: Quick understanding, design review, stakeholder communication

---

### For Deep Understanding: Full Design (30 min read)
**File**: `/docs/mvp-persistence-surface.md`

Comprehensive analysis covering:

1. **Problem Analysis** (Section 1)
   - Current dataflow
   - Three persistence concerns
   - Why MVP doesn't need all of them

2. **Storage Strategy** (Section 2)
   - Authoritative source (FileSystem)
   - Why FileSystem vs SQL
   - Migration path to Phase 2

3. **Schema Design** (Section 3)
   - File structure
   - metadata.json with audit events
   - Which Effect primitive to use

4. **Caching Strategy** (Section 4)
   - L1 (request-level)
   - L2 (session-level, ontology)
   - L3 (persistent, results)

5. **Deferral Strategy** (Section 5)
   - Phase 2: Cross-document queries (SQL)
   - Phase 2: Workflow resumption (checkpoints)
   - Phase 2: Distributed orchestration (message queues)
   - Phase 3: Caching layer (TTL + invalidation)

6. **Implementation Roadmap** (Section 6)
   - MVP (now)
   - Phase 2 (Q2 2025)
   - Phase 3 (Q3 2025)

7. **Code Changes** (Section 7)
   - Exact file locations
   - Schema additions
   - API changes

**Best for**: Design validation, code architecture, team alignment

---

### For Implementation: Checklist (30 min to 2 days work)
**File**: `/docs/MVP_PERSISTENCE_CHECKLIST.md`

Task-oriented guide with:

1. **Phase 0: Design Validation** ✓ DONE
   - Problem analyzed
   - Solution designed
   - Deferral justified

2. **Phase 1: MVP Implementation** ← YOU ARE HERE
   - 1.1 Update domain models (AuditEvent, AuditError)
   - 1.2 Enhance ExtractionRunService (emitEvent, emitError)
   - 1.3 Integrate into StreamingExtraction
   - 1.4 Integrate into main program
   - 1.5 Add utilities (ExtractionRunUtils)
   - 1.6 Write documentation
   - 1.7 Write tests

   **Effort**: ~16 hours (~2 days focused work)

3. **Phase 2: SQL Migration** (Q2 2025)
   - Add @effect/sql layer
   - Create extraction_results table
   - Async materialization from FS

4. **Phase 3: Distribution** (Q3 2025)
   - Distributed ExtractionRunService
   - Runner state + load balancing
   - Checkpoints + recovery

**Best for**: Implementation planning, task management, progress tracking

---

### For Production: Debugging Guide (Practical)
**File**: `/docs/DEBUGGING_GUIDE.md`

Hands-on guide for:

1. **Quick Start** (2 min)
   - Find run ID
   - View audit trail
   - Check outputs
   - Inspect input

2. **Event Timeline** (reference)
   - Event types and meanings
   - Expected durations
   - Data fields

3. **Error Scenarios**
   - Run failed (no completion)
   - Partial extraction (chunks ok, resolution failed)
   - Slow extraction (timing analysis)

4. **Output Quality Checks**
   - Sanity checks for KG
   - Entity/relation counts
   - Mermaid diagrams
   - RDF validation

5. **Comparing Runs**
   - Same text, different results
   - A/B testing configurations

6. **Advanced Debugging**
   - Following logs in real-time
   - Inspecting specific chunks
   - Entity resolution details

7. **Cleanup**
   - Delete failed runs
   - Batch cleanup
   - Archive old runs

8. **Common Issues & Solutions**
   - Run not found
   - Extraction too slow
   - No relations extracted
   - Metric tracking

**Best for**: Operations, support tickets, production debugging

---

## File Tree

```
packages/@core-v2/
├── docs/
│   ├── PERSISTENCE_INDEX.md                ← You are here
│   ├── PERSISTENCE_SUMMARY.md              ← Start here (executive summary)
│   ├── mvp-persistence-surface.md          ← Deep dive (full design)
│   ├── MVP_PERSISTENCE_CHECKLIST.md        ← Implementation tasks
│   ├── DEBUGGING_GUIDE.md                  ← Ops/support guide
│   └── examples/
│       └── metadata.json                   ← Example run metadata (TODO)
│
├── src/
│   ├── Domain/Model/
│   │   └── ExtractionRun.ts                ← Add AuditEvent, AuditError (TODO)
│   ├── Service/
│   │   ├── ExtractionRun.ts                ← Add emitEvent, emitError (TODO)
│   │   └── ExtractionRunUtils.ts           ← NEW: helpers (TODO)
│   ├── Workflow/
│   │   └── StreamingExtraction.ts          ← Add event emissions (TODO)
│   └── main.ts                             ← Add final events (TODO)
│
└── test/
    ├── Service/
    │   └── ExtractionRunService.test.ts    ← NEW: event tests (TODO)
    └── Workflow/
        └── EventIntegration.test.ts        ← NEW: integration tests (TODO)
```

---

## Usage Scenarios

### Scenario 1: Designer Reviewing MVP
1. Read: PERSISTENCE_SUMMARY.md (5 min)
2. Review: mvp-persistence-surface.md (30 min)
3. Discuss: Is design complete? Any concerns?

### Scenario 2: Developer Implementing Phase 1
1. Review: PERSISTENCE_SUMMARY.md (understand scope)
2. Follow: MVP_PERSISTENCE_CHECKLIST.md (task by task)
3. Reference: mvp-persistence-surface.md (when questions arise)
4. Test: Using examples and test cases
5. Verify: Against success criteria in checklist

### Scenario 3: Operations Debugging Production Issue
1. Check: DEBUGGING_GUIDE.md (find relevant scenario)
2. Run: Provided commands to inspect run
3. Analyze: Audit events and errors
4. Report: Including diagnostic JSON

### Scenario 4: Future Phase 2 Planning
1. Review: mvp-persistence-surface.md sections 2 & 5 (deferral strategy)
2. Follow: MVP_PERSISTENCE_CHECKLIST.md Phase 2 (what to build)
3. Plan: SQL schema and materialization logic

---

## Key Decisions (Summary)

| Decision | Rationale | When Reconsidered |
|----------|-----------|-------------------|
| FileSystem for results | Simple, idempotent, deterministic | Phase 2 (1000+ documents) |
| JSON in metadata.json for audit | Portable, zero overhead, debuggable | Phase 2 (cross-doc queries) |
| Fire-and-forget events | Non-blocking, acceptable for MVP | Phase 2 (distributed systems) |
| No SQL yet | Not needed for MVP scope | Phase 2 start |
| No checkpoints | Reruns are fast and deterministic | Phase 2 (1M-chunk documents) |
| No distribution | Single-machine MVP | Phase 2 start |
| No caching | Each extraction is independent | Phase 3 (repeated extractions) |

---

## Phase Breakdown

### MVP (Now) - ~2 days work
- Add AuditEvent/AuditError types
- Add emitEvent/emitError methods to ExtractionRunService
- Emit events at key extraction points
- Tests + docs

**Deliverable**: Audit trail in metadata.json

### Phase 2 (Q2 2025) - SQL + Queries
- Add @effect/sql layer
- Create extraction_results table
- Async materialization from FileSystem
- Query API for dashboard
- Checkpoint support (optional)

**Deliverable**: Cross-document queries, multi-run analytics

### Phase 3 (Q3 2025+) - Distribution
- Distributed ExtractionRunService
- Runner state + load balancing
- Cross-machine checkpoints

**Deliverable**: Horizontal scaling

---

## Interdependencies

```
Phase 1 (MVP)
  ↓ (uses)
  - @effect/platform/FileSystem (already present)
  - No new external dependencies

Phase 2 (SQL)
  ↓ (builds on)
  - Phase 1 (FileSystem storage)
  - Adds: @effect/sql-sqlite-bun
  - Adds: Async materialization job

Phase 3 (Distribution)
  ↓ (builds on)
  - Phase 2 (SQL for coordination)
  - Refactors Phase 1 (ExtractionRunService interface)
```

---

## Validation Checklist

Before starting implementation:

- [x] Design complete and documented
- [x] Schema minimal (2 new types)
- [x] Deferral strategy justified
- [x] Migration path documented
- [x] No blocking dependencies
- [ ] Design reviewed by tech lead
- [ ] Team alignment on scope
- [ ] Questions answered

Before completing Phase 1:

- [ ] All code has types (no `any`)
- [ ] Unit tests pass (100% new code coverage)
- [ ] Integration tests pass
- [ ] Backward compatible
- [ ] Debugging guide complete
- [ ] Example metadata.json present
- [ ] No performance regression

---

## Questions & Discussions

### Design Questions
**Q: Is FileSystem sufficient for MVP?**
A: Yes. 100s of documents is fine. Scale beyond 1000 triggers SQL in Phase 2.

**Q: Can we migrate to SQL without data loss?**
A: Yes. Zero-copy design: FileSystem stays as source of truth, SQL mirrors it.

**Q: Is event emission too expensive?**
A: No. <1ms per event, ~100 events per run = <100ms total overhead.

**Q: Do we need distributed state?**
A: No. Deferred to Phase 2. Single-machine MVP uses run ID as distributed lock.

### Implementation Questions
**Q: Should emitEvent throw on failure?**
A: No. Fire-and-forget semantics (log warning, continue). Audit is optional.

**Q: How do we handle concurrent event emission?**
A: Last-write-wins. Safe for single-process. Phase 2 adds transactional writes.

**Q: What if metadata.json gets corrupted?**
A: Run still succeeds (audit is optional). User loses event trail but has outputs.

**Q: How granular should events be?**
A: Per-phase (not per-entity). ~8 events per run is the right granularity.

### Operational Questions
**Q: How do I find a run?**
A: By text hash → `getRunIdFromText(text)` or `ls ./output/runs/ | grep doc-`

**Q: How do I debug a failure?**
A: `cat metadata.json | jq '.errors'` and `cat metadata.json | jq '.events'`

**Q: How do I clean up old runs?**
A: `rm -rf ./output/runs/doc-{runId}` or batch cleanup script

---

## Related Files

**In this codebase**:
- `/packages/@core-v2/src/Domain/Model/ExtractionRun.ts` - Current model
- `/packages/@core-v2/src/Service/ExtractionRun.ts` - Current service
- `/packages/@core-v2/src/main.ts` - Current usage
- `/packages/@core-v2/src/Workflow/StreamingExtraction.ts` - Extraction logic

**In effect-source** (for reference):
- `docs/effect-source/platform/src/FileSystem.ts` - Effect FileSystem API
- `docs/effect-source/effect/src/Layer.ts` - Effect Layer patterns

**Design documents** (this package):
- PERSISTENCE_SUMMARY.md
- mvp-persistence-surface.md
- MVP_PERSISTENCE_CHECKLIST.md
- DEBUGGING_GUIDE.md

---

## Document Sizes & Reading Time

| Document | Pages | Size | Read Time | Audience |
|----------|-------|------|-----------|----------|
| PERSISTENCE_SUMMARY.md | 4 | 11KB | 5 min | Everyone |
| mvp-persistence-surface.md | 30 | 20KB | 30 min | Designers, architects |
| MVP_PERSISTENCE_CHECKLIST.md | 8 | 8.3KB | 15 min | Implementers |
| DEBUGGING_GUIDE.md | 12 | 12KB | 15 min | Operations, support |

**Total**: ~70 minutes to read all documentation

---

## How to Stay Updated

As Phase 1 progresses:
1. Update MVP_PERSISTENCE_CHECKLIST.md with progress
2. Add examples to `/docs/examples/`
3. Update DEBUGGING_GUIDE.md with real-world issues
4. Keep PERSISTENCE_SUMMARY.md as single source of truth for scope

When starting Phase 2:
1. Create `docs/PHASE2_SQL_MIGRATION.md`
2. Reference deferral strategy from Section 5 of mvp-persistence-surface.md
3. Design materialization logic

---

## Quick Links

- **Start here**: `/docs/PERSISTENCE_SUMMARY.md`
- **Full design**: `/docs/mvp-persistence-surface.md`
- **Do this**: `/docs/MVP_PERSISTENCE_CHECKLIST.md`
- **Debug that**: `/docs/DEBUGGING_GUIDE.md`
- **What's next**: `/docs/mvp-persistence-surface.md#phase-2-cross-document-queries-sql`

---

## Feedback & Refinement

This design is ready for:
- [ ] Technical review (architect/tech lead)
- [ ] Team alignment discussion
- [ ] Scope validation with stakeholders
- [ ] Risk review with ops

After Phase 1 implementation:
- [ ] Validate against success criteria
- [ ] Collect team feedback
- [ ] Refine based on real-world usage
- [ ] Plan Phase 2 with confidence

---

**Created**: 2025-12-09
**Status**: Design Complete, Ready for Implementation
**Owner**: @pooks
**Maintainer**: [To be assigned]

**Next Step**: Review PERSISTENCE_SUMMARY.md and approve design
