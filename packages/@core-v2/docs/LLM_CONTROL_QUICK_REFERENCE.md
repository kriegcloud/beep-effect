# LLM Control Strategy - Quick Reference Card

## One-Page Overview

### Problem
```
Current: Single 5-min timeout, no per-request budget, no stages timeouts
Need:    Per-stage control, token budget, rate limiting, graceful degradation
```

### Solution Components

#### 1. TokenBudgetService
```typescript
// Allocate 4096 tokens across stages
Service.recordUsage(stage: string, tokens: number)
Service.canAfford(stage: string, tokens: number): boolean
Service.getRemainingTokens(): number
```

**Allocation**:
```
entityExtraction:    1440 (35%)
relationExtraction:  1440 (35%)
grounding:            615 (15%)
propertyScoping:      328 (8%)
other:                273 (7%)
```

#### 2. StageTimeoutService
```typescript
// Apply per-stage timeouts with escalation
Service.withTimeout(stage: string, effect: Effect): Effect
Service.getMetrics(stage: string): TimeoutMetrics
```

**Timeouts**:
```
chunking:           5s hard / 3s soft
entityExtraction:  60s hard / 45s soft
propertyScoping:   15s hard / 10s soft
relationExtraction: 60s hard / 45s soft
grounding:         30s hard / 20s soft
serialization:     10s hard / 5s soft
```

**Escalation Levels**:
```
Soft timeout    → WARN_CONTINUE
Hard timeout    → REDUCE_SCOPE_RETRY → FALLBACK_CACHE → SKIP_STAGE → ABORT_PIPELINE
```

#### 3. CentralRateLimiterService
```typescript
// Rate limit + circuit breaker
Service.acquire(estimatedTokens: number): Effect<void>
Service.release(actualTokens: number, success: boolean): Effect<void>
Service.getMetrics(): RateLimiterState
```

**Rate Limits** (Anthropic):
```
Requests:    50/min
Tokens:      100k/min
Concurrency: 5 max
```

**Circuit Breaker**:
```
CLOSED       → normal operation
OPEN         → reject all (after 5 failures)
HALF_OPEN    → test recovery (after 2 min timeout)
```

#### 4. RequestSupervisorService
```typescript
// Orchestrate all stages
Service.executeExtraction(requestId, effect): PartialExtractionResult
```

**Result Types**:
```
COMPLETE            → all stages succeeded
PARTIAL_ENTITY_ONLY → no relations (entity timeout)
PARTIAL_EARLY_EXIT  → early pipeline exit (mid-timeout)
FALLBACK_CACHE      → used previous results
EMPTY               → no results
```

---

## Integration Pattern

```typescript
// Wrap LLM calls like this:
const result = yield* Effect.gen(function*() {
  const tokenBudget = yield* TokenBudgetService
  const timeout = yield* StageTimeoutService
  const rateLimiter = yield* CentralRateLimiterService

  // 1. Check budget
  const canAfford = yield* tokenBudget.canAfford("entityExtraction", 1440)
  if (!canAfford) return yield* Effect.fail(new Error("Budget exceeded"))

  // 2. Acquire rate permit
  yield* rateLimiter.acquire(1440)

  // 3. Execute with timeout
  const result = yield* timeout.withTimeout(
    "entityExtraction",
    llm.generateObject({ schema, prompt })
  )

  // 4. Release permit + record usage
  yield* rateLimiter.release(result.totalTokens, true)
  yield* tokenBudget.recordUsage({
    stage: "entityExtraction",
    totalTokens: result.totalTokens
  })

  return result
})
```

---

## Configuration Profiles

### CONSERVATIVE (Development)
```
Concurrency:    2
Entity timeout: 120s
Relation timeout: 120s
Token budget:   4096
Throughput:     ~120 docs/hour
Risk:           Very Low
```

### BALANCED (Production - Recommended)
```
Concurrency:    5
Entity timeout: 60s
Relation timeout: 60s
Token budget:   4096
Throughput:     ~300 docs/hour
Risk:           Medium (optimal)
```

### AGGRESSIVE (High Throughput)
```
Concurrency:    8
Entity timeout: 45s
Relation timeout: 45s
Token budget:   3000
Throughput:     ~480 docs/hour
Risk:           High (only if API proven fast)
```

---

## Monitoring Dashboard

### Key Metrics
```
✓ llm_concurrency             (0-5 normal)
✓ llm_requests_total          (rate/min)
✓ llm_tokens_per_minute       (should refill each min)
✓ llm_circuit_breaker_trips   (0 = healthy)
✓ llm_soft_timeouts_total     (should be rare)
✓ llm_hard_timeouts_total     (should be rare)
✓ llm_partial_results_total   (< 5%)
✓ llm_extraction_duration_ms  (histogram)
```

### Alert Thresholds
```
🔴 Circuit breaker OPEN        → Immediate attention
🟠 Queue depth > 20            → Monitor API slowness
🟠 Timeout rate > 10%          → Investigate stages
🟡 Budget exceeded > 2x/min    → Check token allocation
```

---

## Troubleshooting Quick Guide

### Symptom: Circuit breaker opens
```
1. Check: curl https://api.anthropic.com/health
2. Wait:  2 minutes for auto-recovery
3. Restart: kubectl rollout restart deployment/extraction
4. Reduce: kubectl set env LLM_MAX_CONCURRENT=1
```

### Symptom: Many timeouts
```
1. Check: which stage is timing out?
2. Increase: kubectl set env STAGE_TIMEOUT_ENTITY_EXTRACT=90000
3. Reduce concurrency: kubectl set env LLM_MAX_CONCURRENT=3
4. Check: ontology size, chunk size
```

### Symptom: Queue growing
```
1. Check: llm_concurrency (should be 0-5)
2. Check: token bucket (should be > 1000)
3. Reduce: incoming request rate
4. Increase: kubectl set env LLM_MAX_CONCURRENT=7
```

### Symptom: Budget exhausted
```
1. Check: average tokens/request
2. Reduce: chunk size (process faster)
3. Allocate more: entityExtraction budget
4. Add more budget: requestMaxTokens
```

---

## Deployment Checklist

### Week 1-2: Foundation
- [ ] Deploy TokenBudgetService
- [ ] Deploy StageTimeoutService
- [ ] Monitor metrics for 1 week
- [ ] Low risk, observation only

### Week 3-4: Integration
- [ ] Deploy CentralRateLimiter
- [ ] Deploy RequestSupervisor
- [ ] Integrate with EntityExtractor
- [ ] Canary: 10% traffic
- [ ] Monitor concurrency, timeouts

### Week 5: Rollout
- [ ] 25% traffic (1 day, monitor)
- [ ] 50% traffic (1 day, monitor)
- [ ] 100% traffic (full rollout)
- [ ] Success criteria: > 98% success rate

---

## Token Budget Math

```
Average extraction: 3800 tokens

Anthropic Pricing (Haiku):
- Input:  $0.80 per 1M tokens
- Output: $4.00 per 1M tokens

Cost per extraction:
- Avg 2500 input tokens → $0.002
- Avg 1300 output tokens → $0.0052
- Total: $0.0072 per extraction

100,000 extractions/month:
- Cost: $720/month

Optimization:
1. Reduce budget 4096→3000: -25% = $180/month saved
2. Batch documents: -50% = $360/month saved
3. Cache duplicates: -5% = $36/month saved
Total: ~$500/month (70% savings)
```

---

## File Locations

```
/packages/@core-v2/docs/
├── LLM_CONTROL_STRATEGY_SUMMARY.md       (executive overview)
├── LLM_CONTROL_QUICK_REFERENCE.md        (this file)
├── llm-control-strategy.md               (detailed design)
├── llm-control-implementation.md         (code examples)
└── llm-control-deployment.md             (operations guide)
```

---

## Implementation Code Structure

```typescript
// New services to implement
src/Runtime/
├── TokenBudgetService.ts              (token tracking)
├── StageTimeoutService.ts             (per-stage timeouts)
├── CentralRateLimiterService.ts        (rate limiting + circuit breaker)
└── RequestSupervisorService.ts         (orchestration)

// Integration points
Service/Extraction.ts                   (wrap EntityExtractor)
Service/Extraction.ts                   (wrap RelationExtractor)
Service/Grounder.ts                     (wrap verifyRelationBatch)

// Configuration
Service/Config.ts                       (add llmControl section)
Runtime/ProductionRuntime.ts            (add new services)
```

---

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Per-stage timeouts | Different stages have different speeds |
| Token budget per request | Enables resource-aware decisions |
| Central rate limiter | Respects both request and token limits |
| Partial results allowed | Better than complete failure |
| Circuit breaker | Protects from cascade failures |
| 5 concurrent max | Balances throughput vs overload |
| Conservative defaults | Safe for most deployments |

---

## Success Metrics (Week 6+)

```
✓ 99%+ request success rate (target)
✓ < 2% soft timeout rate (acceptable)
✓ < 0.1% hard timeout rate (target)
✓ 0 circuit breaker trips/week (ideal)
✓ < 5% partial result rate (acceptable)
✓ 300+ docs/hour throughput (maintained)
✓ Metrics align with Prometheus (live dashboards)
```

---

**Quick Start**: Start with BALANCED config, monitor Week 1, adjust based on metrics

**More Details**: See full strategy documents in `/packages/@core-v2/docs/`

