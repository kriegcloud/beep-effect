# Unified Identity/Idempotency Scheme - Executive Proposal

**Date**: December 2025
**Status**: Design Complete - Ready for Review
**Location**: `packages/@core-v2/docs/`

## Problem Statement

The current extraction system has **inconsistent identity across layers**, creating a critical cache bypass vulnerability:

### Current Architecture Problems

| Layer | Identity Key | Problem |
|-------|--------------|---------|
| **RPC Cache** | `hash(text + ontologyId)` | Missing ontology VERSION |
| **Orchestrator** | `hash(text + ontologyId)` | Missing ontology VERSION |
| **Entity Clustering** | `requestId` (UUID) | **Different UUID = Bypass cache!** |
| **Result Cache** | `requestId` | Different requestId = cache miss |

### The Vulnerability

**Scenario**: Client resubmits extraction with identical text/ontology/params but new `requestId`

```
Request 1: text, ontologyId, params, requestId="abc"
  → Cache miss (no cache yet)
  → Run extraction
  → Cache result under requestId="abc"

Request 2: text, ontologyId, params, requestId="def" [SAME TEXT!]
  → Cache miss (different requestId!)
  → Run extraction AGAIN ❌
  → Wasted LLM API calls
  → Defeated idempotency guarantee
```

**Cost**: $0.05 per unnecessary extraction × thousands of resubmissions = thousands of dollars wasted monthly.

## Proposed Solution

### The Unified Idempotency Key Formula

```
IDEMPOTENCY_KEY = sha256(
  normalizedText +
  ontologyId +
  ontologyVersion (content-based) +
  extractionParamsHash
)
```

**Example Output**: `sha256-x1y2z3a4b5c6d7e8`

### Key Features

1. **Deterministic**: Same input always → same key (testable)
2. **Version-Aware**: Ontology changes invalidate old cache
3. **Parameter-Safe**: Different params get different keys
4. **Concurrent Dedup**: Multiple concurrent requests share one execution
5. **Propagates Through All Layers**: Client → RPC → Orchestrator → Workflow → Cache

## Expected Impact

### Performance Gains

| Metric | Current | After Implementation |
|--------|---------|----------------------|
| Cached request latency | N/A | <100ms (instant) |
| Cache hit rate | None | ~60% estimated |
| LLM API calls on hit | N/A | 0 |
| Concurrent request efficiency | Duplicates | 100% deduplicated |

### Cost Savings

```
Assumptions:
- 100,000 requests/month
- 40% resubmissions with identical params
- $0.05 per API call

Current cost: 100K × 1.4 × $0.05 = $7,000/month

After idempotency:
- 100K × (1 + 0.4×0) = 100K effective requests
- Cost: 100K × $0.05 = $5,000/month

Savings: $2,000/month = $24,000/year
```

## What's Included in This Proposal

### 📋 Four Comprehensive Documents

Located in `/packages/@core-v2/docs/`:

1. **README-IDEMPOTENCY.md** (Quick Start, 10 min read)
   - Overview of all documents
   - Quick reference guide
   - File structure

2. **idempotency-design.md** (Authoritative Spec, 30 min read)
   - ✅ Part 1: Key formula (4 components, why each matters)
   - ✅ Part 2: Data flow (Client → Cache)
   - ✅ Part 3: Invalidation strategy (Ontology changes)
   - ✅ Part 4: Implementation guide (TypeScript code patterns)
   - ✅ Part 5: Database schema with indexes
   - ✅ Parts 6-10: Monitoring, FAQ, examples, migration path

3. **idempotency-implementation.ts** (Reference Code, 20 min read)
   - Production-ready TypeScript functions
   - Copy-paste ready implementations
   - Test utilities
   - Service factories

4. **idempotency-architecture.md** (Visual Guide, 20 min read)
   - Current (problematic) architecture diagram
   - Proposed (fixed) architecture diagram
   - Concurrent deduplication flow
   - Ontology invalidation flow
   - 6-week migration checklist
   - Pre/Post migration metrics

## Decision Points for Review

### 1. Idempotency Key Formula
**Proposed**: `hash(text + ontologyId + ontologyVersion + extractionParams)`

**Questions for team**:
- ✅ Text normalization approach (trim + LF)?
- ✅ Ontology versioning: content-hash vs semantic?
- ✅ Include extraction params in key?

### 2. Ontology Versioning Strategy
**Proposed**: Content-based hash (SHA256 of canonical JSON structure)

**Advantages**:
- Automatic detection of schema changes
- No manual versioning required
- Deterministic

**Questions for team**:
- ✅ Accept automatic versioning?
- ✅ Alternative: manual semantic versioning?

### 3. Cache Invalidation
**Proposed**: Pattern-based deletion (`*:ontologyId:*`)

**When to invalidate**:
- Ontology updated (automatic)
- TTL expires (7 days default)
- Manual cache clear (admin)
- Parameter change (new key, separate entry)

**Questions for team**:
- ✅ 7-day TTL appropriate?
- ✅ Automatic invalidation on update acceptable?

### 4. Concurrent Request Deduplication
**Proposed**: In-memory execution cache with Deferred-based coordination

**Mechanism**:
- Request A starts extraction
- Request B (same key) waits for Request A's Deferred
- Result shared between both, only 1 LLM call

**Questions for team**:
- ✅ In-memory acceptable or need Redis backing?
- ✅ 5-minute retry window for failures acceptable?

## Implementation Roadmap

### Phase Timeline: 6 Weeks

```
Week 1: Design & Validation
  ✓ Team review & approval
  ✓ Test suite design
  ✓ Database schema preparation

Week 2-3: Core Implementation
  ✓ Idempotency key functions
  ✓ Ontology versioning
  ✓ RPC handler updates
  ✓ Result cache layer

Week 4: Workflow Integration
  ✓ Orchestrator updates
  ✓ Extraction workflow threading
  ✓ Service integration

Week 5: Testing
  ✓ Unit tests (determinism, normalization)
  ✓ Integration tests (cache hits, invalidation)
  ✓ Load tests (throughput, memory)

Week 6: Deployment
  ✓ Feature flag setup
  ✓ Database migration
  ✓ Monitoring configuration

Week 7+: Gradual Rollout
  ✓ Staging validation (24h)
  ✓ Canary 5% (24h)
  ✓ Scale to 100% (4 days, 25% increments)
```

### Effort Estimate
- **Team Size**: 2-3 engineers
- **Total Effort**: 6 weeks
- **Prerequisite Knowledge**: Effect, TypeScript, caching patterns

## Risk Mitigation

### Identified Risks

| Risk | Mitigation |
|------|-----------|
| Wrong hash function | Test determinism in 100 iterations; use SHA256 (battle-tested) |
| Cache bloat | TTL cleanup (7 days) + monitoring of cache size |
| Ontology invalidation fails | Event-driven invalidation with fallback manual clear |
| Concurrent dedup fails | Timeout mechanism (5 min) allows retry |
| Regression in extraction quality | Comprehensive test suite before rollout |

### Rollback Plan

If critical issues arise:
1. Set `ENABLE_IDEMPOTENCY_KEY = false`
2. Verify old code path functional
3. Investigate root cause
4. Fix in feature branch
5. Redeploy with feature flag enabled

## Success Criteria

### Launch Readiness
- [ ] Code review complete (2+ reviewers)
- [ ] Test coverage ≥ 90%
- [ ] All 4 documents reviewed by team leads
- [ ] Database migration tested in staging

### Post-Launch Validation (Week 1)
- [ ] Cache hit rate ≥ 50%
- [ ] No regressions in extraction quality
- [ ] Concurrent dedup working (test with load generator)
- [ ] Ontology invalidation cascading correctly

### Long-term Metrics (Ongoing)
- [ ] Cache hit rate ≥ 60% (steady state)
- [ ] Cost savings ≥ 30% (vs. baseline)
- [ ] P99 latency improved ≥ 20%
- [ ] No increase in error rate

## Getting Started

### For Team Review (30 min)
1. Read `README-IDEMPOTENCY.md` (Quick Start)
2. Review **idempotency-design.md Parts 1-2** (Key Formula + Data Flow)
3. Look at architecture diagrams in **idempotency-architecture.md**

### For Approval
1. Discuss decision points (formula, versioning, invalidation, dedup)
2. Review rollback plan
3. Approve 6-week roadmap
4. Assign implementation team

### For Implementation
1. Create feature branch from `main`
2. Start Week 1 activities (test suite, database schema)
3. Follow Migration Checklist in **idempotency-architecture.md**
4. Use **idempotency-implementation.ts** as reference code

## Document Access

All documents are in `/packages/@core-v2/docs/`:

```
├── README-IDEMPOTENCY.md              ← Start here
├── idempotency-design.md              ← Authoritative spec
├── idempotency-implementation.ts      ← Reference code
├── idempotency-architecture.md        ← Visual guide & checklist
└── [other docs]
```

## Next Steps

1. **Schedule 30-min team review** (this week)
2. **Discuss decision points** (formula, versioning, invalidation)
3. **Get approval** from tech lead + product
4. **Assign implementation team** (2-3 engineers)
5. **Create implementation branch**
6. **Begin Week 1 activities**

## Questions?

For specific questions about:
- **Design**: See `idempotency-design.md`
- **Implementation**: See `idempotency-implementation.ts`
- **Architecture**: See `idempotency-architecture.md`
- **Migration**: See Migration Checklist in `idempotency-architecture.md`

---

**Proposal Status**: ✅ Complete & Ready for Review
**Document Version**: 1.0
**Last Updated**: December 2025

**Recommendation**: Approve and begin Phase 1 planning this week.
