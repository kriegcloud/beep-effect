# MVP Persistence Surface - Design & Implementation Guide

**Status**: Design Phase Complete (2025-12-09)
**Scope**: Minimal persistence for document extraction MVP
**Problem Solved**: Eliminated persistence overbuild (4+ overlapping concerns → 2 unified surfaces)

---

## Quick Start

### New to this project?
→ Start with **[DELIVERY_SUMMARY.md](./DELIVERY_SUMMARY.md)** (5 min read)

### Need the full story?
→ Read **[PERSISTENCE_SUMMARY.md](./PERSISTENCE_SUMMARY.md)** (5 min)
→ Then **[mvp-persistence-surface.md](./mvp-persistence-surface.md)** (30 min)

### Ready to implement?
→ Follow **[MVP_PERSISTENCE_CHECKLIST.md](./MVP_PERSISTENCE_CHECKLIST.md)** (~2 days work)

### Need to debug a run?
→ Use **[DEBUGGING_GUIDE.md](./DEBUGGING_GUIDE.md)** (practical guide)

### Lost? Need navigation?
→ Go to **[PERSISTENCE_INDEX.md](./PERSISTENCE_INDEX.md)** (document index)

---

## The Problem

Current architecture overbuild with:
- `ExtractionRunService` (file-based)
- `MessageStorage` (cluster mailbox) - planned
- `RunnerStorage` (shard locks) - planned
- `EventJournal` (audit) - planned
- `PersistedCache` (L1/L2) - planned
- SQL database layer
- Ontology cache

**Result**: 4+ overlapping storage concerns, unclear ownership, too much complexity

---

## The Solution

### Two Surfaces, One Approach

**Surface 1: Results**
- **What**: Extracted knowledge graphs + outputs
- **Where**: FileSystem (`./output/runs/{runId}/outputs/`)
- **How**: JSON files
- **Why**: Simple, idempotent, deterministic (by text hash)

**Surface 2: Audit Trail**
- **What**: Event log of extraction lifecycle
- **Where**: `metadata.json` events array
- **How**: JSON array of `{timestamp, type, data}`
- **Why**: Portable with run, zero overhead, debugging-friendly

**Effect Primitive**: `@effect/platform/FileSystem` (already present)

**External Dependencies**: ZERO new packages

---

## File Overview

### Core Documents

| Document | Purpose | Pages | Read Time |
|----------|---------|-------|-----------|
| [DELIVERY_SUMMARY.md](./DELIVERY_SUMMARY.md) | Overview of entire design | 4 | 5 min |
| [PERSISTENCE_SUMMARY.md](./PERSISTENCE_SUMMARY.md) | Executive summary | 4 | 5 min |
| [mvp-persistence-surface.md](./mvp-persistence-surface.md) | Comprehensive design | 30 | 30 min |
| [MVP_PERSISTENCE_CHECKLIST.md](./MVP_PERSISTENCE_CHECKLIST.md) | Implementation tasks | 8 | 15 min |
| [DEBUGGING_GUIDE.md](./DEBUGGING_GUIDE.md) | Operations guide | 12 | 15 min |
| [PERSISTENCE_INDEX.md](./PERSISTENCE_INDEX.md) | Navigation hub | 6 | 10 min |

### Examples

| File | Purpose | Size |
|------|---------|------|
| [examples/metadata.json](./examples/metadata.json) | Success case (45 entities, 23 relations) | ~4KB |
| [examples/metadata-failed.json](./examples/metadata-failed.json) | Failure case (LLM rate limit) | ~2KB |

---

## Design at a Glance

### MVP Schema

**Two new types** (in `ExtractionRun.ts`):

```typescript
interface AuditEvent {
  timestamp: string
  type: "run.created" | "extraction.complete" | ...
  data?: Record<string, unknown>
}

interface AuditError {
  timestamp: string
  type: string
  message: string
  context?: Record<string, unknown>
}
```

**Added to ExtractionRun**:
- `events: AuditEvent[]` (NEW)
- `errors?: AuditError[]` (NEW)

### File Structure

```
./output/runs/doc-abc123def456/
├── input/
│   ├── document.txt
│   └── chunks/chunk-{N}.txt
├── outputs/
│   ├── knowledge-graph.json
│   ├── entity-resolution-graph.json
│   ├── mermaid-diagram.md
│   └── rdf-turtle.ttl
└── metadata.json ← Includes events[]
```

### Implementation

**Phase 1 (MVP)**: ~16 hours, 2 days
1. Add AuditEvent/AuditError types
2. Add emitEvent/emitError methods to ExtractionRunService
3. Emit events at key extraction points
4. Tests + documentation

**Phase 2 (Q2 2025)**: SQL + cross-document queries
**Phase 3 (Q3 2025)**: Distribution

---

## Key Decisions

### ✓ FileSystem for Results
- **Why**: Simple, idempotent, deterministic
- **When to change**: Phase 2 (1000+ documents) → SQL
- **Migration**: Zero-copy (FS stays as source of truth)

### ✓ Audit Events in metadata.json
- **Why**: Portable with run, zero overhead, JSON debuggable
- **Fire-and-forget**: Non-blocking, safe for MVP
- **When to change**: Phase 2 (distributed) → SQL with transactions

### ✓ No SQL Yet
- **Why**: MVP doesn't need cross-document queries
- **When needed**: Phase 2 ("find all runs with >50 entities")

### ✓ No Checkpoints
- **Why**: Reruns are deterministic and fast
- **When needed**: Phase 2 (1M-chunk documents)

### ✓ No Distribution
- **Why**: Single-machine MVP sufficient
- **When needed**: Phase 2/3 (10,000+ documents)

---

## How to Use This Documentation

### Use Case 1: Design Review
1. Read [PERSISTENCE_SUMMARY.md](./PERSISTENCE_SUMMARY.md) (5 min)
2. Read [mvp-persistence-surface.md](./mvp-persistence-surface.md) (30 min)
3. Discuss any concerns with team

### Use Case 2: Implementation
1. Review [MVP_PERSISTENCE_CHECKLIST.md](./MVP_PERSISTENCE_CHECKLIST.md)
2. Follow checklist item by item
3. Reference [mvp-persistence-surface.md](./mvp-persistence-surface.md) Section 7 for code changes
4. Use examples for testing

### Use Case 3: Production Debugging
1. Check [DEBUGGING_GUIDE.md](./DEBUGGING_GUIDE.md) for your scenario
2. Use provided shell commands to inspect run
3. Refer to [examples/metadata.json](./examples/metadata.json) for expected structure
4. Review [examples/metadata-failed.json](./examples/metadata-failed.json) for error cases

### Use Case 4: Understanding the Design
1. Start with [PERSISTENCE_INDEX.md](./PERSISTENCE_INDEX.md)
2. Read [PERSISTENCE_SUMMARY.md](./PERSISTENCE_SUMMARY.md)
3. Deep dive into [mvp-persistence-surface.md](./mvp-persistence-surface.md)
4. Check FAQ sections for questions

---

## What Gets Deferred

| Concern | MVP | Phase 2 | Rationale |
|---------|-----|---------|-----------|
| Cross-document queries | ❌ | ✓ | Not needed for MVP scope |
| Workflow checkpoints | ❌ | ✓ | Reruns fast enough |
| Distributed state | ❌ | ✓ | Single-machine MVP |
| Result caching | ❌ | ❌ | Each extraction independent |

All deferrals have detailed justification in [mvp-persistence-surface.md](./mvp-persistence-surface.md) Section 5.

---

## Quick Reference

### Implementation Effort
- **Phase 1 (MVP)**: ~16 hours (~2 days focused work)
- **New types**: 2 (AuditEvent, AuditError)
- **Files to change**: ~5
- **Lines of code**: ~200 new
- **External dependencies**: 0 (uses existing @effect/platform)

### Audit Trail
- **Events per run**: ~15
- **Overhead**: <100ms per run
- **Size**: ~15KB per run
- **10K runs**: 150MB total

### Queries (All documented in DEBUGGING_GUIDE.md)
```bash
# View audit trail
cat ./output/runs/doc-{runId}/metadata.json | jq '.events'

# Check for errors
cat ./output/runs/doc-{runId}/metadata.json | jq '.errors'

# List all runs
ls ./output/runs/ | head -20
```

---

## Validation

### Design Complete ✓
- [x] Problem identified (4+ overlapping concerns)
- [x] Solution designed (2 surfaces, 1 storage layer)
- [x] Schema minimal (2 types only)
- [x] Deferral justified (4 areas with detailed rationale)
- [x] Implementation roadmap (3 phases)
- [x] Migration path (zero-copy)
- [x] Examples provided (success & failure cases)

### Before Implementation
- [ ] Tech lead reviews design
- [ ] Team alignment confirmed
- [ ] Questions answered

### Success Criteria (Phase 1)
- [ ] All new code typed (no `any`)
- [ ] Unit tests pass (100%)
- [ ] Integration tests pass
- [ ] Backward compatible
- [ ] Debugging guide complete
- [ ] No performance regression

---

## FAQ (Expanded)

**Q: Is FileSystem sufficient for MVP?**
A: Yes. Handles 100s of documents easily. Phase 2 adds SQL for 1000s+.

**Q: Can we migrate to SQL without data loss?**
A: Yes. Zero-copy design: FileSystem is source of truth, SQL mirrors.

**Q: Is event emission too expensive?**
A: No. <1ms per event, ~100 events per run = <100ms total overhead.

**Q: What if metadata.json gets corrupted?**
A: Run still succeeds (audit is optional). User loses event trail but has outputs.

**Q: How do we handle concurrent extractions?**
A: Each run has unique ID (text hash). Same text = same ID = idempotent.

**Q: When do we need Phase 2?**
A: When you want to query across documents ("find all runs with >50 entities").

**Q: What if same text is extracted 100 times?**
A: Same text → same runId → same directory → idempotent (last write wins).

**Q: Will Phase 1 need rewriting for Phase 2?**
A: No. Phase 1 design supports zero-copy migration.

More Q&A in individual documents.

---

## Next Steps

### 1. Review Design (1-2 hours)
→ Tech lead + team review [PERSISTENCE_SUMMARY.md](./PERSISTENCE_SUMMARY.md)
→ Discuss any concerns
→ Approve design

### 2. Implement Phase 1 (2 days)
→ Follow [MVP_PERSISTENCE_CHECKLIST.md](./MVP_PERSISTENCE_CHECKLIST.md)
→ Create PR with all changes
→ Code review + merge

### 3. Validate
→ Extract test document
→ Inspect metadata.json
→ Verify event timeline

### 4. Plan Phase 2
→ Reference deferral strategy from [mvp-persistence-surface.md](./mvp-persistence-surface.md) Section 5
→ Design SQL schema
→ Plan materialization job

---

## Document Network

```
README.md (You are here)
    ↓
    ├→ DELIVERY_SUMMARY.md (Overview)
    │   ↓
    ├→ PERSISTENCE_SUMMARY.md (Executive Summary)
    │   ↓
    ├→ mvp-persistence-surface.md (Full Design) ⭐
    │   ├→ Part 1: Problem Analysis
    │   ├→ Part 2: Storage Strategy
    │   ├→ Part 3: Schema Design
    │   ├→ Part 4: Caching Strategy
    │   ├→ Part 5: Deferral Strategy
    │   ├→ Part 6: Roadmap
    │   └→ Part 7: Code Changes
    │
    ├→ MVP_PERSISTENCE_CHECKLIST.md (Implementation)
    │   ├→ Phase 0: Design Validation ✓
    │   ├→ Phase 1: MVP (16 hours)
    │   ├→ Phase 2: SQL (Q2 2025)
    │   └→ Phase 3: Distribution (Q3 2025)
    │
    ├→ DEBUGGING_GUIDE.md (Operations)
    │   ├→ Quick Start (5 min)
    │   ├→ Event Timeline Reference
    │   ├→ Error Scenarios
    │   ├→ Output Quality Checks
    │   ├→ Common Issues & Solutions
    │   └→ Metrics & Monitoring
    │
    ├→ PERSISTENCE_INDEX.md (Navigation)
    │   ├→ Document Structure
    │   ├→ Phase Breakdown
    │   └→ FAQ
    │
    └→ examples/
        ├→ metadata.json (Success case)
        └→ metadata-failed.json (Failure case)
```

---

## File Locations

**All documentation**:
```
/packages/@core-v2/docs/
├── README.md                        ← Start here
├── DELIVERY_SUMMARY.md
├── PERSISTENCE_SUMMARY.md
├── PERSISTENCE_INDEX.md
├── mvp-persistence-surface.md
├── MVP_PERSISTENCE_CHECKLIST.md
├── DEBUGGING_GUIDE.md
└── examples/
    ├── metadata.json
    └── metadata-failed.json
```

**Code changes needed**:
```
/packages/@core-v2/src/
├── Domain/Model/ExtractionRun.ts        (update)
├── Service/ExtractionRun.ts             (update)
├── Service/ExtractionRunUtils.ts        (NEW)
├── Workflow/StreamingExtraction.ts      (update)
└── main.ts                              (update)

/packages/@core-v2/test/
├── Service/ExtractionRunService.test.ts (NEW)
└── Workflow/EventIntegration.test.ts    (NEW)
```

---

## Status

| Item | Status |
|------|--------|
| **Design** | ✓ Complete |
| **Documentation** | ✓ Complete |
| **Examples** | ✓ Complete |
| **Implementation** | ⏳ Ready to start |
| **Phase 1** | 🔄 In progress (or waiting for approval) |
| **Phase 2** | 📅 Q2 2025 |
| **Phase 3** | 📅 Q3 2025+ |

---

## Contact & Questions

For questions about:
- **Design**: See FAQ sections in individual documents
- **Implementation**: Follow MVP_PERSISTENCE_CHECKLIST.md
- **Debugging**: Use DEBUGGING_GUIDE.md
- **Navigation**: Check PERSISTENCE_INDEX.md

---

**Created**: 2025-12-09
**Design Status**: Complete
**Ready for**: Implementation review + approval
**Next Milestone**: Phase 1 completion (~2 days)

Start with [DELIVERY_SUMMARY.md](./DELIVERY_SUMMARY.md) or jump to your use case above.
