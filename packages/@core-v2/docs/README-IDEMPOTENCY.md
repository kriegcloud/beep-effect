# Unified Idempotency Scheme for Extraction System

## Quick Start

This directory contains a complete design for a unified identity/idempotency system that eliminates cache bypass vulnerabilities in the extraction pipeline.

**Problem**: Current architecture has inconsistent identity across RPC, Orchestrator, and Entity Clustering layers, allowing client resubmissions with new `requestId` to bypass cache.

**Solution**: Single idempotency key formula that propagates through ALL layers and includes ontology VERSION for proper invalidation.

## Documents Overview

### 1. `idempotency-design.md` (PRIMARY SPEC)
**Reading Time**: 30 minutes

The authoritative design document containing:

- **Part 1: Key Formula Design**
  - Proposed formula with 4 components
  - Why each component matters
  - Text normalization strategy
  - Ontology versioning (content-based)
  - Extraction parameters hashing
  - Hash function (SHA256)

- **Part 2: Data Flow Architecture**
  - Complete key propagation flow (Client → RPC → Orchestrator → Workflow → Cache)
  - How each layer uses the idempotency key
  - Table showing responsibility by layer

- **Part 3: Cache Invalidation Strategy**
  - Invalidation triggers (ontology update, TTL, manual clear)
  - Ontology change detection (content hash)
  - Concurrent request deduplication
  - Code examples for invalidation handlers

- **Part 4: Implementation Guide**
  - TypeScript type definitions
  - RPC handler implementation
  - Orchestrator implementation
  - Workflow integration
  - Database schema with indexes
  - Audit trail tables

- **Part 5-10: Deep Dives & FAQ**
  - Monitoring & observability
  - FAQ & troubleshooting
  - Migration path (6 phases)
  - Examples (ontology update, parameter change)

### 2. `idempotency-implementation.ts` (REFERENCE CODE)
**Reading Time**: 20 minutes

Production-ready TypeScript code showing:

```typescript
// Core functions
normalizeText()                    // Text preprocessing
hashExtractionParams()             // Parameter hashing
computeOntologyVersion()           // Content-based versioning
computeIdempotencyKey()            // Main computation

// Deduplication
ExecutionDeduplicator              // In-flight concurrent dedup
makeExecutionDeduplicator()        // Service factory

// Invalidation
OntologyInvalidationStrategy       // Cache invalidation
makeOntologyInvalidationStrategy() // Invalidation factory

// Orchestration
ExtractionOrchestrator             // Main orchestrator
makeExtractionOrchestrator()       // Orchestrator factory

// Utilities
debugIdempotencyKey()              // Debug helper
assertIdempotencyKeyDeterministic()// Test helper
assertTextNormalizationIdempotent()// Test helper
```

All code is directly implementable - copy/paste ready.

### 3. `idempotency-architecture.md` (VISUAL GUIDE)
**Reading Time**: 20 minutes

Visual architecture showing:

- **Current (Problematic) Architecture**
  - Why `requestId` breaks caching
  - How Client B resubmit causes double extraction
  - Visual flow showing the problem

- **Proposed (Fixed) Architecture**
  - How idempotency key ensures cache reuse
  - How Client B gets instant cached response
  - Visual flow showing the solution

- **Concurrent Request Deduplication**
  - How Request B waits for Request A
  - Latency comparison (3000ms vs ~100ms)
  - Deferred-based coordination

- **Ontology Invalidation Flow**
  - Step-by-step invalidation process
  - Cache deletion by pattern
  - Version hash differences

- **Data Flow Diagram**
  - Complete request lifecycle
  - Key propagation through all layers
  - Cache hit/miss paths

- **Migration Checklist** (6 weeks)
  - Week 1: Design & validation
  - Week 2-3: Core implementation
  - Week 4: Workflow integration
  - Week 5: Testing
  - Week 6: Deployment
  - Week 7+: Gradual rollout

## Key Concepts

### The Unified Idempotency Key Formula

```
IDEMPOTENCY_KEY = sha256-hash(
  normalizedText +
  ontologyId +
  ontologyVersion +
  hashExtractionParams
)
```

**Example**:
```
Input:
  text: "Cristiano Ronaldo plays for Al-Nassr"
  ontologyId: "http://example.org/sports-ontology"
  ontologyVersion: "sha256:a1b2c3d4e5f6g7h8" (content hash)
  extractionParams: { model: "claude-3-5-sonnet", temp: 0.0, ... }

Output:
  IDEMPOTENCY_KEY = "sha256-x1y2z3a4b5c6d7e8"
```

### Key Benefits

1. **Cache Reuse**: Same text + ontology + version = same key = cache hit
2. **Version Safety**: Ontology changes invalidate old cached results
3. **Parameter Safety**: Different extraction params get different keys
4. **Concurrent Dedup**: Multiple concurrent requests share single execution
5. **Deterministic**: Same input always produces same key (testable)

### Cache Invalidation Triggers

| Trigger | Action | Scope |
|---------|--------|-------|
| Ontology updated | New version hash → different key | All results for that ontology |
| TTL expires | Auto-delete old entries | Individual entry (7-day default) |
| Manual clear | DELETE all entries | Entire cache |
| Parameter change | Different key → different entry | New parameter combinations only |

## Migration Path (6 Weeks)

```
Week 1: Design & Validation
  - Team review
  - Test suite design
  - Database schema

Week 2-3: Core Implementation
  - Key computation
  - Ontology versioning
  - RPC handler updates
  - Result cache layer

Week 4: Workflow Integration
  - Orchestrator updates
  - Extraction workflow threading
  - Service integration

Week 5: Testing
  - Unit tests
  - Integration tests
  - Load tests
  - Compatibility tests

Week 6: Deployment
  - Feature flag
  - Database migration
  - Monitoring setup
  - Documentation

Week 7+: Gradual Rollout
  - Staging validation
  - Canary 5%
  - Increment by 25% daily
  - 100% rollout
```

## File Structure

```
packages/@core-v2/
├── docs/
│   ├── README-IDEMPOTENCY.md           ← You are here
│   ├── idempotency-design.md            ← Authoritative spec (10 parts)
│   ├── idempotency-implementation.ts    ← Reference code
│   ├── idempotency-architecture.md      ← Visual guide + checklist
│   └── ...
├── src/
│   ├── Utils/
│   │   ├── Idempotency.ts               ← (To create) Core functions
│   │   └── ...
│   ├── Service/
│   │   ├── ExtractionOrchestrator.ts    ← (To create) Main orchestrator
│   │   ├── ExtractionCache.ts           ← (To create) Cache service
│   │   └── ...
│   ├── Workflow/
│   │   ├── StreamingExtraction.ts       ← (To update) Thread key through pipeline
│   │   └── ...
│   └── ...
└── ...
```

## Getting Started

### For Architects/Leads:
1. Read `idempotency-design.md` Parts 1-2 (Key Formula + Data Flow)
2. Review architecture diagrams in `idempotency-architecture.md`
3. Discuss with team and approve design

### For Implementation Teams:
1. Read `idempotency-implementation.ts` (Production-ready code)
2. Follow Migration Checklist in `idempotency-architecture.md`
3. Implement services using reference code as guide
4. Use included test utilities to verify determinism

### For Reviewers:
1. Check Part 4 (Implementation Guide) for code patterns
2. Verify cache invalidation in Part 3
3. Review database schema in Part 5

### For Operations:
1. Read Migration Path overview
2. Review Deployment section in `idempotency-architecture.md`
3. Set up monitoring metrics from Part 8
4. Prepare rollback plan

## Key Decisions Made

### 1. Ontology Versioning Strategy
**Decision**: Content-based hash (SHA256 of canonical JSON)
**Rationale**:
- Automatic detection of schema changes
- No manual versioning required
- Deterministic and reproducible

### 2. Text Normalization
**Decision**: Trim + LF line endings + trim trailing whitespace
**Rationale**:
- Eliminate whitespace-only cache misses
- Deterministic and testable
- Matches user intent (same text semantically)

### 3. Cache TTL
**Decision**: 7 days (with optional manual invalidation)
**Rationale**:
- Balance between disk usage and cache hits
- Long enough for typical resubmissions
- Automatic cleanup prevents unbounded growth

### 4. Concurrent Deduplication
**Decision**: In-memory execution cache with Deferred-based coordination
**Rationale**:
- Zero-copy result sharing
- Type-safe (Effect-native)
- Optional Redis backing for distributed systems

### 5. Invalidation Strategy
**Decision**: Pattern-based deletion (`*:ontologyId:*`)
**Rationale**:
- Simple and clear
- No complex cache coherency protocols
- Works with distributed caches (Redis)

## Common Questions

### Q: What if text whitespace differs?
**A**: Normalization handles it - "text " and "text" get same key.

### Q: What if ontology has no version field?
**A**: Use `computeOntologyVersion()` to auto-generate content hash.

### Q: What about non-serializable params?
**A**: Don't include them - they shouldn't affect extraction output anyway.

### Q: How long before cache hits kick in?
**A**: Immediately on second identical request (same client or different client).

### Q: What if extraction params change?
**A**: Different key → different cache entry → fresh extraction (correct behavior).

### Q: How do I debug idempotency key issues?
**A**: Use `debugIdempotencyKey()` utility from implementation code.

## Performance Impact

### Expected Improvements

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Cached request latency | N/A | <100ms | New capability |
| LLM API calls on hit | N/A | 0 | New capability |
| Concurrent handling | Duplicates | Deduplicated | 100% efficiency |
| Cache hit rate | N/A | ~60% | Estimated |
| Cost per cached request | ~$0.05 | ~$0.001 | 50x savings |

### No Performance Regression
- Non-cached requests: +5-10ms (key computation, cache lookup)
- Cache infrastructure: Lightweight (SHA256 hash + in-memory map)
- Database: Indexed queries (rapid lookups)

## Testing Strategy

### Unit Tests
- Determinism (100 iterations must be identical)
- Text normalization edge cases
- Ontology version computation consistency
- Parameter hashing correctness

### Integration Tests
- Cache hit on repeat request
- Cache miss with different text
- Concurrent request deduplication
- Ontology invalidation cascades

### Load Tests
- Cache performance under high throughput
- Memory usage with millions of entries
- Concurrent request handling
- TTL cleanup efficiency

## Support & Questions

### Design Questions
→ See `idempotency-design.md`

### Implementation Questions
→ See `idempotency-implementation.ts`

### Architecture Questions
→ See `idempotency-architecture.md`

### Operational Questions
→ Contact DevOps/SRE team

## Next Steps

1. **Schedule team review** (30 min) for `idempotency-design.md` Parts 1-2
2. **Get approval** on key formula and versioning strategy
3. **Assign implementation tasks** using Migration Checklist
4. **Create feature branch** for Phase 1 work
5. **Begin Week 1 activities** (design validation, test suite)

## Document Versions

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Dec 2025 | Initial comprehensive design |

---

**Last Updated**: December 2025
**Status**: Ready for Review & Implementation
**Estimated Effort**: 6 weeks (1 team of 2-3 engineers)
