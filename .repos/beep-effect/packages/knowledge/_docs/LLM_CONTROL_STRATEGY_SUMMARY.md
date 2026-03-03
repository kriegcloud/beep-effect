# LLM Control Strategy - Executive Summary

## Overview

This is a comprehensive strategy for controlling LLM API usage in the knowledge graph extraction pipeline. It replaces the current coarse-grained approach (single 5-minute timeout, service-level semaphore) with a sophisticated multi-layer control system.

## Key Documents

### 1. **llm-control-strategy.md** (Strategic Design)
The comprehensive design document covering:
- Per-stage timeout configuration (6 stages with different budgets)
- Per-request token budget allocation (4096 tokens total)
- Central rate limiter design (token bucket algorithm)
- Partial result handling policy (graceful degradation)
- Cancellation semantics (cascade behavior)

**Key concepts**:
- 6 extraction stages: chunking, entity extract, property scope, relation extract, grounding, serialization
- Dual timeout model: soft (warn) and hard (abort) limits
- Token budget with 35% to entity extraction, 35% to relation extraction
- Anthropic rate limits: 50 req/min, 100k tokens/min
- Max 5 concurrent requests

### 2. **llm-control-implementation.md** (Code Implementation)
Concrete Effect TypeScript implementations:
- `TokenBudgetService` - Track per-request token usage
- `StageTimeoutService` - Apply stage-level timeouts with escalation
- `CentralRateLimiterService` - Token bucket + circuit breaker
- `RequestSupervisorService` - Coordinate stages and manage partial results

**Ready-to-implement services with full code**.

### 3. **llm-control-deployment.md** (Operations)
Deployment guide with:
- Architecture diagrams and visual flows
- Operational procedures and monitoring checklist
- Troubleshooting guide with common scenarios
- Metrics and Prometheus alerts
- Performance tuning matrix
- 5-phase deployment plan
- 3 configuration profiles (conservative, balanced, aggressive)
- Runbooks for common incidents
- Disaster recovery procedures

## Problem Statement

**Current Issues**:
```
❌ Single 5-minute DurableClock wrapper (too coarse-grained)
❌ Semaphore at service level (5 permits, doesn't track tokens)
❌ No per-request budget (can exhaust API quota mid-extraction)
❌ No stage-level timeouts (slow stage blocks detection of fast stages)
❌ No policy for partial results (all-or-nothing)
❌ Hard to distinguish which stage is causing delays
❌ No circuit breaker for API resilience
```

**Solution**:
```
✅ 6 per-stage timeouts with different budgets
✅ Per-request token budget (4096 total, allocated across stages)
✅ Central rate limiter respecting both API limits
✅ Graceful degradation with partial results
✅ Stage-specific timeout escalation (5 levels)
✅ Clear observability of which stage is slow
✅ Circuit breaker for API resilience
```

## Solution Architecture

```
Request → RequestSupervisor → 6 Stages (with timeouts) → Rate Limiter → LLM API
                ↓ (allocate budget)
         TokenBudgetService
                ↓ (enforce per-stage limits)
         StageTimeoutService
                ↓ (acquire permit)
         CentralRateLimiter
```

## Key Features

### 1. Per-Stage Timeouts

| Stage | Hard Timeout | Soft Timeout | Max Retries | LLM Call |
|-------|-------------|------------|------------|----------|
| Chunking | 5s | 3s | 0 | No |
| Entity Extract | 60s | 45s | 3 | Yes |
| Property Scope | 15s | 10s | 1 | No |
| Relation Extract | 60s | 45s | 2 | Yes |
| Grounding | 30s | 20s | 1 | Yes |
| Serialization | 10s | 5s | 0 | No |

### 2. Token Budget Allocation (4096 tokens)

```
Entity Extraction:    1440 tokens (35%)
Relation Extraction:  1440 tokens (35%)
Grounding:             615 tokens (15%)
Property Scoping:      328 tokens (8%)
Other/Buffer:          273 tokens (7%)
```

### 3. Central Rate Limiter

- **Request bucket**: 50/min (Anthropic limit)
- **Token bucket**: 100k/min (Anthropic limit)
- **Max concurrent**: 5 requests
- **Circuit breaker**: Opens after 5 failures, resets after 2 minutes

### 4. Partial Result Policy

```
Entity timeout → Return entities only, skip relations
Relation timeout → Return all entities + relations extracted so far
Grounding timeout → Return all relations unverified
```

### 5. Timeout Escalation (5 Levels)

1. **WARN_CONTINUE** - Log warning, keep going
2. **REDUCE_SCOPE_RETRY** - Skip features, retry once
3. **FALLBACK_CACHE** - Use cached results from previous run
4. **SKIP_STAGE** - Skip entire stage, continue pipeline
5. **ABORT_PIPELINE** - Stop everything

## Metrics & Observability

**Key metrics**:
- Request rate: requests/minute
- Token consumption: tokens/minute
- Concurrency: current count (0-5 range)
- Timeout rate: soft/hard timeouts per minute
- Partial result rate: % of non-complete results
- Circuit breaker state: open/half-open/closed

**Alerts**:
- Circuit breaker opens → immediate alert
- Queue depth > 20 → alert
- Timeout rate > 10% → alert
- Budget exceeded → alert

## Deployment Plan

**Phase 1 (Week 1-2)**: Foundation
- Deploy TokenBudgetService (observation only)
- Deploy StageTimeoutService (warnings)
- Low risk

**Phase 2 (Week 3-4)**: Integration
- Deploy CentralRateLimiter, RequestSupervisor
- Canary: 10% traffic
- Medium risk

**Phase 3 (Week 5)**: Rollout
- Increase traffic: 25% → 50% → 100%
- Monitor metrics each step

**Phase 4 (Weeks 6+)**: Hardening
- Auto-scaling, partial result caching
- Long-term optimization

## Performance Impact

**Expected throughput**:
- Current: ~300 docs/hour (5 concurrent, 60s per doc)
- With optimization: ~300-500 docs/hour (tuned concurrency + reduced tokens)

**Expected error rate**:
- Target: > 98% success rate
- Soft timeout: < 2%
- Hard timeout: < 0.1%

## Implementation Timeline

```
Week 1-2: Services foundation
Week 3-4: Integration + canary
Week 5:   Gradual rollout
Week 6+:  Production hardening
```

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Tokens exhausted mid-request | High | Per-request budget + monitoring |
| Too aggressive timeouts | Medium | Conservative defaults + tuning |
| Circuit breaker thrashing | Low | Exponential backoff + reset timeout |
| Rate limiter queue growth | Medium | Monitoring + auto-scaling |

## Configuration Profiles

### Conservative (Safe)
- 2 concurrent, 120s timeouts, small token allocations
- Throughput: ~120 docs/hour
- **Use for**: Development, testing

### Balanced (Recommended)
- 5 concurrent, 60s timeouts, standard allocations
- Throughput: ~300 docs/hour
- **Use for**: Production

### Aggressive (High Throughput)
- 8 concurrent, 45s timeouts, minimal allocations
- Throughput: ~480 docs/hour
- **Use for**: High-volume, proven-fast APIs

## Success Criteria

✅ All extraction requests have per-stage timeout control
✅ Token budget never exceeded
✅ Circuit breaker protects API
✅ Partial results enable graceful degradation
✅ Observability shows which stage is slow
✅ > 98% request success rate
✅ Metrics align with Prometheus/Grafana

## Next Steps

1. **Review** this strategy document
2. **Implement** the 4 services (2-3 weeks)
3. **Test** with mock LLM (1 week)
4. **Deploy** to staging (1 week canary)
5. **Monitor** metrics and tune (ongoing)

## Document Organization

```
packages/@core-v2/docs/
├── llm-control-strategy.md          (Strategic design - 12 sections)
├── llm-control-implementation.md    (Code examples - 8 sections)
├── llm-control-deployment.md        (Operations - 9 sections)
└── LLM_CONTROL_STRATEGY_SUMMARY.md  (This file)
```

## Files Created

- `/Users/pooks/Dev/effect-ontology/packages/@core-v2/docs/llm-control-strategy.md`
- `/Users/pooks/Dev/effect-ontology/packages/@core-v2/docs/llm-control-implementation.md`
- `/Users/pooks/Dev/effect-ontology/packages/@core-v2/docs/llm-control-deployment.md`

## Key Decisions

### Why per-stage timeouts vs global?
- Global timeout too coarse
- Per-stage enables early failure detection
- Allows stage-specific escalation

### Why token budget vs just rate limit?
- Token costs unpredictable until completion
- Budget enables resource-aware decisions
- Can skip/defer expensive stages

### Why central rate limiter vs service-level?
- Respects both request and token limits
- Includes circuit breaker
- Better observability

## References

- Effect Timeout: https://effect.website/docs/guides/error-handling/timeout
- Token Bucket: https://en.wikipedia.org/wiki/Token_bucket
- Circuit Breaker: https://martinfowler.com/bliki/CircuitBreaker.html
- Anthropic Limits: 50 req/min, 100k tokens/min
- Current code: `packages/@core-v2/src/Runtime/`

---

**Status**: Ready for implementation
**Created**: 2025-12-09
**Estimated implementation time**: 4-5 weeks

