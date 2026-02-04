# MVP Persistence Surface Design - Delivery Summary

**Date**: 2025-12-09
**Project**: effect-ontology core-v2
**Status**: Design Phase Complete - Ready for Implementation
**Deliverables**: 5 comprehensive documents + 2 example metadata files

---

## Problem Solved

### Before (Overbuild)
```
User extracts document
  → ExtractionRunService saves metadata
  → MessageStorage buffers work (planned)
  → RunnerStorage manages locks (planned)
  → EventJournal records events (planned)
  → PersistedCache stores results (planned)
  → SQL database duplicates state
  → Ontology cache regenerated

Result: 4+ overlapping concerns, unclear ownership, complexity
```

### After (Minimal MVP)
```
User extracts document
  → ExtractionRunService saves to FileSystem
  → Audit events appended to metadata.json
  → Results in ./output/runs/{runId}/

Result: 2 surfaces (results + audit), 1 storage layer (FS), clarity
```

---

## Design Decisions (Key Highlights)

| Decision | Rationale | When to Change |
|----------|-----------|----------------|
| **FileSystem for Results** | Simple, idempotent, deterministic | Phase 2: 1000+ documents → SQL |
| **Audit in metadata.json** | Portable, zero overhead, debuggable | Phase 2: cross-doc queries → SQL |
| **Fire-and-forget events** | Non-blocking, safe for MVP | Phase 2: distributed → transactions |
| **No SQL** | MVP doesn't need cross-doc queries | Phase 2 start |
| **No Checkpoints** | Reruns are deterministic, fast | Phase 2: 1M-chunk docs |
| **No Distribution** | Single-machine MVP sufficient | Phase 2/3 start |
| **No Caching** | Each extraction is independent | Phase 3: repeated extractions |

---

## Deliverables

### 1. **PERSISTENCE_SUMMARY.md** (4 pages)
Quick overview for everyone:
- Problem / Solution
- Comparison before/after
- Risk mitigation
- FAQ
- **Read time**: 5 minutes

### 2. **mvp-persistence-surface.md** (30 pages) ⭐ COMPREHENSIVE
Deep design analysis:
- Part 1: MVP needs analysis
- Part 2: Authoritative store strategy
- Part 3: Schema design with examples
- Part 4: Caching strategy (3 levels)
- Part 5: Deferral rationale (4 areas)
- Part 6: Implementation roadmap
- Part 7: Exact code changes needed
- **Read time**: 30 minutes

### 3. **MVP_PERSISTENCE_CHECKLIST.md** (8 pages)
Implementation tasks:
- Phase 1: 7 tasks, ~16 hours
- Phase 2: SQL migration (deferred)
- Phase 3: Distribution (deferred)
- Success criteria
- Testing strategy
- **Read time**: 15 minutes

### 4. **DEBUGGING_GUIDE.md** (12 pages)
Operations & support:
- Quick start for inspecting runs
- Event timeline reference
- Error scenarios + solutions
- Output quality checks
- Common issues & fixes
- Metrics & monitoring
- Support ticket template
- **Read time**: 15 minutes

### 5. **PERSISTENCE_INDEX.md** (Navigation hub)
Document guide:
- Usage scenarios
- Phase breakdown
- Interdependencies
- Validation checklist
- **Read time**: 10 minutes

### 6. **examples/metadata.json**
Success case with:
- 45 entities, 23 relations
- Complete 15-event timeline
- From creation to completion
- Real-world data structure

### 7. **examples/metadata-failed.json**
Failure case with:
- LLM rate limit error
- 3 successful chunks before failure
- Error context and retry info
- How to debug failures

---

## MVP Schema (Minimal!)

### Two New Types

```typescript
// In ExtractionRun.ts

interface AuditEvent {
  timestamp: string           // ISO-8601
  type: AuditEventType       // "run.created", "extraction.complete", etc.
  data?: Record<string, unknown>
}

type AuditEventType =
  | "run.created"
  | "chunking.complete"
  | "chunk_extraction.complete"
  | "extraction.complete"
  | "resolution.complete"
  | "refine.complete"
  | "rdf.complete"
  | "run.completed"
  | "run.failed"

interface AuditError {
  timestamp: string
  type: string                // Error class name
  message: string
  context?: Record<string, unknown>
}

interface ExtractionRun {
  // ... existing fields ...
  events: AuditEvent[]       // NEW
  errors?: AuditError[]      // NEW
}
```

### File Structure (Already exists, enhanced)

```
./output/runs/doc-{12hex}/
├── input/
│   ├── document.txt
│   └── chunks/chunk-{N}.txt
├── outputs/
│   ├── knowledge-graph.json         ← Final KG
│   ├── entity-resolution-graph.json
│   ├── mermaid-diagram.md
│   └── rdf-turtle.ttl
└── metadata.json                    ← NEW: events[] array
```

---

## Implementation Roadmap

### Phase 1 (MVP) - 2 days, ~16 hours
- [x] Design complete
- [ ] Update ExtractionRun model (1h)
- [ ] Add emitEvent/emitError methods (3h)
- [ ] Integrate into StreamingExtraction (2h)
- [ ] Integrate into main.ts (1h)
- [ ] Add utilities (2h)
- [ ] Documentation (2h)
- [ ] Tests (5h)

### Phase 2 (Q2 2025) - SQL + Queries
- SQL schema for cross-document queries
- Async materialization from FileSystem
- Query API for dashboard
- Checkpoint support (optional)

### Phase 3 (Q3 2025) - Distribution
- Distributed ExtractionRunService
- Runner state + load balancing
- Cross-machine checkpoints

---

## What's Deferred (and Why)

### Phase 2: Cross-Document Queries (SQL)
**When needed**: Dashboard, "find all runs with >50 entities"
**Current**: Not needed for MVP (few documents, in-memory filtering fine)
**Migration**: Zero-copy (FS stays as source of truth, SQL mirrors)

### Phase 2: Workflow Checkpoints
**When needed**: Extracting 1M-chunk documents, recovery from crashes
**Current**: Not needed (reruns are deterministic and fast)
**Rationale**: 99% of time is LLM, not local processing

### Phase 2: Distributed State
**When needed**: 10,000 documents across 10 machines
**Current**: Not needed (single-machine MVP)
**Deferral**: ExtractionRunService interface designed for future refactor

### Phase 3: Caching Layer
**When needed**: Same extraction requested 100 times
**Current**: Not needed (each extraction independent)
**Rationale**: Overhead not justified at scale

---

## Key Numbers

| Metric | Value | Notes |
|--------|-------|-------|
| Events per run | ~15 | Manageable |
| Audit overhead | <100ms | Negligible |
| Event size | ~1KB each | 15KB per run |
| 10K runs total | 150MB | Acceptable |
| FileSystem scale | 1M documents | Phase 3 triggers rewrite |
| New types | 2 | AuditEvent, AuditError |
| New dependencies | 0 | Uses existing @effect/platform |
| Code changes | ~5 files | ~200 lines new code |
| Testing effort | ~5 hours | Unit + integration |
| Phase 1 time | ~16 hours | 2 days focused work |

---

## How to Use These Documents

### For Quick Understanding (5 min)
→ Read: **PERSISTENCE_SUMMARY.md**

### For Design Review (30 min)
→ Read: **PERSISTENCE_SUMMARY.md** + **mvp-persistence-surface.md**

### For Implementation (2 days)
→ Follow: **MVP_PERSISTENCE_CHECKLIST.md**
→ Reference: **mvp-persistence-surface.md** Section 7

### For Production Debugging
→ Use: **DEBUGGING_GUIDE.md**
→ Examples: **examples/metadata.json**, **metadata-failed.json**

### For Team Alignment
→ Start: **PERSISTENCE_INDEX.md**
→ Review: **PERSISTENCE_SUMMARY.md**
→ Discuss: Any concerns?

---

## Validation Checklist

### Design Completeness
- [x] MVP persistence needs defined
- [x] Authoritative store chosen (FileSystem)
- [x] Schema minimal (2 types)
- [x] Deferral strategy justified (4 areas with rationale)
- [x] Implementation roadmap clear (3 phases)
- [x] Migration path documented (zero-copy)
- [x] FAQ answered (10+ questions)
- [x] Examples provided (success & failure cases)

### Before Implementation
- [ ] Design reviewed by tech lead
- [ ] Team alignment on scope
- [ ] Questions answered
- [ ] Risk mitigation approved

### Success Criteria (Phase 1)
- [ ] All new code has types (no `any`)
- [ ] Unit tests pass (100% coverage)
- [ ] Integration tests pass
- [ ] Backward compatible
- [ ] Debugging guide complete
- [ ] Example metadata.json present
- [ ] No performance regression

---

## File Locations

### Documentation
```
/packages/@core-v2/docs/
├── DELIVERY_SUMMARY.md              ← This file
├── PERSISTENCE_INDEX.md             ← Navigation hub
├── PERSISTENCE_SUMMARY.md           ← Executive summary
├── mvp-persistence-surface.md       ← Full design
├── MVP_PERSISTENCE_CHECKLIST.md     ← Implementation
├── DEBUGGING_GUIDE.md               ← Ops guide
└── examples/
    ├── metadata.json                ← Success case
    └── metadata-failed.json         ← Failure case
```

### Code Changes Needed
```
/packages/@core-v2/src/
├── Domain/Model/ExtractionRun.ts            (update)
├── Service/ExtractionRun.ts                 (update)
├── Service/ExtractionRunUtils.ts            (NEW)
├── Workflow/StreamingExtraction.ts          (update)
└── main.ts                                  (update)

/packages/@core-v2/test/
├── Service/ExtractionRunService.test.ts     (NEW)
└── Workflow/EventIntegration.test.ts        (NEW)
```

---

## Questions for Review

**Q: Is FileSystem sufficient for MVP?**
A: Yes. 100s documents fine. Phase 2 adds SQL for 1000s.

**Q: Can we migrate to SQL without losing data?**
A: Yes. Zero-copy design. FS stays as source of truth, SQL mirrors.

**Q: Is event emission too expensive?**
A: No. <1ms per event, ~100 events per run = <100ms total.

**Q: Do we need distributed state?**
A: No. Deferred to Phase 2. Single-machine MVP uses hash as lock.

**Q: What if someone runs same extraction 100 times?**
A: Same text → same runId → idempotent (last write wins). Fine for MVP.

**Q: How do we scale beyond 1000 documents?**
A: Phase 2 adds SQL table + indices. FS files stay as source of truth.

**Q: Will we need to rewrite Phase 1 for Phase 2?**
A: No. Phase 1 design supports zero-copy migration.

**Q: What's the backward compatibility story?**
A: `events?: AuditEvent[]` is optional. Old runs still readable.

---

## Next Steps

### 1. Review & Approve (1-2 hours)
- Tech lead reviews PERSISTENCE_SUMMARY.md
- Team discusses deferred concerns
- Validation checklist signed off
- Questions answered

### 2. Implement Phase 1 (~2 days)
- Follow MVP_PERSISTENCE_CHECKLIST.md step by step
- Create PR with all changes
- Code review + merge

### 3. Validate & Deploy
- Extract test document
- Inspect metadata.json
- Verify event timeline appears

### 4. Plan Phase 2 (Q2 2025)
- Reference deferral strategy
- Design SQL schema
- Plan materialization job

---

## Summary

This design package provides:

✓ **Clear problem identification**: 4+ overlapping concerns → 2 surfaces
✓ **Minimal solution**: FileSystem + audit events in JSON
✓ **Phased roadmap**: MVP, Phase 2 SQL, Phase 3 distribution
✓ **Implementation guide**: 16 hours of work, clear tasks
✓ **Production debugging**: Operations-ready docs
✓ **Example metadata**: Success & failure cases
✓ **Zero new dependencies**: Uses @effect/platform already present
✓ **Migration path**: Phase 2 is zero-copy (no data rewrite)
✓ **Comprehensive docs**: 5 guides, ~70KB of detailed design

---

## Document Navigation

| Document | Size | Time | Audience |
|----------|------|------|----------|
| PERSISTENCE_SUMMARY.md | 4 pages | 5 min | Everyone |
| mvp-persistence-surface.md | 30 pages | 30 min | Designers, architects |
| MVP_PERSISTENCE_CHECKLIST.md | 8 pages | 15 min | Implementers |
| DEBUGGING_GUIDE.md | 12 pages | 15 min | Operations, support |
| PERSISTENCE_INDEX.md | Navigation | 10 min | Navigation hub |
| **Total** | **70+ pages** | **70 minutes** | **Complete reference** |

---

**Status**: Design Complete, Ready for Review
**Next**: Tech lead reviews PERSISTENCE_SUMMARY.md
**Timeline**: 2 days for Phase 1, Q2 2025 for Phase 2
