# LLM Control Strategy: Deployment Guide

This document provides deployment guidance, operational procedures, and visual diagrams for the LLM control strategy.

---

## 1. Architecture Diagrams

### 1.1 Control Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                      Extraction Request                              │
│                    (Text + Ontology Config)                          │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                    ┌────────────▼──────────────┐
                    │ RequestSupervisor         │
                    │                           │
                    │ - Allocate token budget   │
                    │ - Spawn stage fibers      │
                    │ - Aggregate results       │
                    │ - Handle cancellation     │
                    └────────────┬──────────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
        ▼                        ▼                        ▼
    ┌─────────────┐   ┌──────────────────┐   ┌──────────────────┐
    │ StageTimeout│   │ StageTimeout     │   │ StageTimeout     │
    │ (Chunking)  │   │ (Entity Extract) │   │ (Relations)      │
    │             │   │                  │   │                  │
    │ 5s timeout  │   │ 60s timeout      │   │ 60s timeout      │
    │ No retry    │   │ 3x retry         │   │ 2x retry         │
    └─────┬───────┘   └────────┬─────────┘   └────────┬─────────┘
          │                    │                      │
          │         ┌──────────▼──────────┐           │
          │         │ TokenBudgetService  │           │
          │         │                     │           │
          │         │ Check budget limits │           │
          │         │ Track token usage   │           │
          │         │ Warn on overage     │           │
          │         └──────────┬──────────┘           │
          │                    │                      │
          │         ┌──────────▼──────────┐           │
          │         │ CentralRateLimiter  │           │
          │         │                     │           │
          │         │ Request bucket: 50/m            │
          │         │ Token bucket: 100k/m            │
          │         │ Max concurrent: 5               │
          │         │ Circuit breaker                 │
          │         └──────────┬──────────┘           │
          │                    │                      │
          └────────────────────┼──────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │ LanguageModel.LLM  │
                    │ (Anthropic, OpenAI,│
                    │  Google, etc.)      │
                    └─────────────────────┘
```

### 1.2 Timeline: Concurrent Extractions

```
Time (seconds)  │ Request 1            │ Request 2            │ Request 3
────────────────┼──────────────────────┼──────────────────────┼───────────
0               │ Acquire rate permit  │                      │
0-5             │ Chunking (5s)        │                      │
5               │ Acquire rate permit  │ Acquire rate permit  │
5-65            │ Entity Extract       │ Chunking (5s)        │ Acquire rate permit
10              │                      │ Acquire rate permit  │ Chunking (5s)
10-70           │                      │ Entity Extract       │ Acquire rate permit
15              │                      │                      │ Entity Extract (60s)
65              │ Record tokens        │ Record tokens        │
65-125          │ Relation Extract     │ Relation Extract     │
70              │                      │ Record tokens        │
125             │ Record tokens        │                      │
125-155         │ Grounding (batch)    │ Relation Extract     │
155             │                      │ Record tokens        │
155-185         │ Serialization        │ Grounding (batch)    │
185             │ Return result        │ Record tokens        │
185-215         │                      │ Serialization        │
215             │                      │ Return result        │
...             │                      │                      │ In progress...

Concurrency: 3 / 5 max
Request rate: 3 / 50 min (well below limit)
Token rate: ~3500 / 100k min (well below limit)
```

### 1.3 Token Budget Allocation Timeline

```
Request 0-4096 tokens total
├─ Chunking         273 tokens (6%) - text splitting (no LLM)
├─ Mention Extract  0 tokens - mention extraction (no LLM)
├─ Entity Extract   1440 tokens (35%)
│  ├─ Prompt: 850 tokens
│  ├─ Response: 590 tokens
│  └─ Remaining: 0 tokens (can overflow)
├─ Property Scope   328 tokens (8%)
├─ Relation Extract 1440 tokens (35%)
│  ├─ Prompt: 900 tokens
│  ├─ Response: 540 tokens
│  └─ Remaining: 0 tokens
├─ Grounding        615 tokens (15%)
│  ├─ Prompt: 420 tokens
│  └─ Response: 195 tokens
└─ Serialization    0 tokens - turtle writing (no LLM)

Total: 4096 tokens
```

### 1.4 Error Escalation Flow

```
LLM Call Error
│
├─ Type: Timeout
│  ├─ Soft Timeout (45s on 60s budget)
│  │  └─ Log warning, continue with lower quality
│  │     └─ Use entities extracted so far
│  │
│  └─ Hard Timeout (60s exceeded)
│     ├─ Cancel stage fiber
│     ├─ Release rate limit permit
│     ├─ Mark stage as failed
│     └─ Escalate to next stage
│        ├─ EntityExtraction timeout
│        │  └─ Skip RelationExtraction
│        │  └─ Return PARTIAL_ENTITY_ONLY
│        │
│        └─ RelationExtraction timeout
│           └─ Skip Grounding
│           └─ Return PARTIAL_EARLY_EXIT
│
├─ Type: Rate Limit (429/503)
│  ├─ Increment failure count
│  ├─ Check circuit breaker
│  ├─ If < 5 failures: Schedule exponential backoff retry
│  └─ If >= 5 failures: Open circuit
│     └─ Reject all requests for 2 minutes
│     └─ Then try half-open test
│
├─ Type: Invalid Response
│  ├─ Retry with feedback (up to 3x)
│  ├─ Log warning with response preview
│  └─ If final retry fails: Use partial results
│
└─ Type: Network Error
   ├─ Transient (ECONNREFUSED, ETIMEDOUT)
   │  └─ Schedule exponential backoff (up to 8x)
   │
   └─ Persistent (ENOTFOUND, CERT error)
      └─ Fail immediately, return error
```

---

## 2. Operational Procedures

### 2.1 Startup Sequence

```typescript
/**
 * Application startup with LLM control services
 */
import { BunRuntime } from "@effect/platform-bun"
import { Layer } from "effect"
import { ProductionInfrastructure } from "./Runtime/ProductionRuntime"
import {
  TokenBudgetService,
  StageTimeoutService,
  CentralRateLimiterService,
  RequestSupervisorService
} from "./Runtime"

// 1. Create layer stack
const layers = ProductionInfrastructure.pipe(
  Layer.provide(TokenBudgetService.Default),
  Layer.provide(StageTimeoutService.Default),
  Layer.provide(CentralRateLimiterService.Default),
  Layer.provide(RequestSupervisorService.Default)
)

// 2. Launch runtime
const runtime = BunRuntime.make(layers)

// 3. Health check
const healthCheck = yield* HealthCheckService.deep()
console.log("Services healthy:", healthCheck.healthy)

// 4. Ready for requests
console.log("Extraction service ready on port 8080")
```

### 2.2 Monitoring Checklist

Every 60 seconds, monitor:

```
✓ Rate Limiter State
  - Current concurrency: 0-5 range normal
  - Request bucket: should refill each minute
  - Token bucket: should refill each minute
  - Circuit breaker: closed = healthy
  - If open > 2 mins: investigate LLM API status

✓ Token Budget Health
  - Average tokens/request: ~3000-4000
  - Requests exceeding budget: should be 0
  - Overflow events: should be rare (<1%)

✓ Timeout Events
  - Soft timeout count: log if > 10/min
  - Hard timeout count: log if > 2/min
  - Abort escalations: log immediately

✓ Partial Result Rates
  - Complete results: target > 95%
  - Partial results: 0-5% (timeouts)
  - Empty results: should be 0

✓ Error Rates
  - Success rate: target > 98%
  - Retry count: log if average > 2 retries/request
```

### 2.3 Troubleshooting Guide

#### Symptom: Rate limiter queue growing

```
1. Check circuit breaker state
   → If OPEN: LLM API unhealthy, wait 2 min

2. Check token bucket
   → If < 1000 tokens: At token limit
   → Solution: Reduce max concurrent to 3-4

3. Check request bucket
   → If < 1 request: Hit 50/min limit
   → Solution: Reduce extraction frequency

4. Check concurrency
   → If = 5: All permits in use
   → This is normal, queue will process
```

#### Symptom: Many timeouts

```
1. Check hard timeout count
   → If > 5/min: Stages too slow

2. Verify stage timeout configs
   → Entity Extract: 60s is generous
   → If hardware slow: increase to 90s

3. Check token budget
   → If stage using too many tokens
   → May leave no budget for later stages

4. Solutions:
   → Increase hard timeout: +30s
   → Reduce chunk size: faster per-chunk processing
   → Reduce ontology size: faster retrieval
```

#### Symptom: Partial results increasing

```
1. Check which stages are failing
   → Log shows stage-specific failures

2. If Entity Extraction timing out:
   → May indicate LLM is slow
   → Check Anthropic status page

3. If Relation Extraction timing out:
   → May indicate too many entities
   → Or ontology too large

4. Solutions:
   → Enable logging at DEBUG level
   → Trace specific slow requests
   → Consider async relation extraction
```

---

## 3. Metrics and Observability

### 3.1 Key Metrics to Export

```typescript
/**
 * Prometheus metrics for LLM control
 */
export const metrics = {
  // Rate limiter
  rateLimiter: {
    requestsTotal: Counter("llm_requests_total", "Total LLM requests"),
    requestsQueued: Gauge("llm_requests_queued", "Queued LLM requests"),
    tokensUsedPerMinute: Gauge("llm_tokens_per_minute", "Token consumption rate"),
    circuitBreakerTrips: Counter("llm_circuit_breaker_trips", "Circuit breaker state changes"),
    concurrencyGauge: Gauge("llm_concurrency", "Current concurrent requests")
  },

  // Token budget
  tokenBudget: {
    tokensAllocated: Counter("llm_tokens_allocated", "Tokens allocated per request"),
    tokensUsed: Counter("llm_tokens_used", "Tokens consumed"),
    budgetExceeded: Counter("llm_budget_exceeded", "Requests exceeding budget"),
    overflowEvents: Counter("llm_overflow_events", "Budget overflow incidents")
  },

  // Timeouts
  timeouts: {
    softTimeoutTotal: Counter("llm_soft_timeouts_total", "Soft timeout count"),
    hardTimeoutTotal: Counter("llm_hard_timeouts_total", "Hard timeout count"),
    escalationTotal: Counter("llm_escalations_total", "Timeout escalations"),
    timeoutDurationHistogram: Histogram("llm_timeout_duration_ms", "Time to timeout")
  },

  // Partial results
  partialResults: {
    completeResults: Counter("llm_complete_results_total", "Complete results"),
    partialResults: Counter("llm_partial_results_total", "Partial results"),
    emptyResults: Counter("llm_empty_results_total", "Empty results")
  },

  // Performance
  performance: {
    extractionDurationHistogram: Histogram(
      "llm_extraction_duration_ms",
      "End-to-end extraction time"
    ),
    stageDurationHistogram: Histogram(
      "llm_stage_duration_ms",
      "Per-stage execution time"
    ),
    rateLimiterWaitHistogram: Histogram(
      "llm_rate_limiter_wait_ms",
      "Rate limiter wait time"
    )
  }
}
```

### 3.2 Grafana Dashboard Queries

```promql
# Current concurrency
llm_concurrency

# Requests per minute
rate(llm_requests_total[1m])

# Token consumption rate
llm_tokens_per_minute

# Success rate
(rate(llm_complete_results_total[1m])) /
(rate(llm_complete_results_total[1m]) + rate(llm_partial_results_total[1m]))

# Average extraction time
histogram_quantile(0.95, llm_extraction_duration_ms)

# Timeout rate
(rate(llm_hard_timeouts_total[1m])) / rate(llm_requests_total[1m])

# Circuit breaker health
changes(llm_circuit_breaker_trips[5m]) > 0 ? 1 : 0
```

### 3.3 Alert Rules

```yaml
# Alert when circuit breaker open
- alert: LLMCircuitBreakerOpen
  expr: llm_circuit_breaker_trips > 0
  for: 2m
  annotations:
    summary: "LLM API circuit breaker is OPEN"
    description: "LLM API is failing, rejecting all requests"

# Alert when queue backing up
- alert: LLMQueueBacklog
  expr: llm_requests_queued > 20
  for: 1m
  annotations:
    summary: "LLM request queue > 20"
    description: "Rate limiter queue is growing, may indicate API slowness"

# Alert on high timeout rate
- alert: LLMHighTimeoutRate
  expr: rate(llm_hard_timeouts_total[1m]) > 0.1
  for: 5m
  annotations:
    summary: "Hard timeout rate > 10%"
    description: "Many extraction requests are timing out"

# Alert on budget overages
- alert: LLMBudgetExceeded
  expr: increase(llm_budget_exceeded[1m]) > 2
  annotations:
    summary: "Token budget exceeded"
    description: "Requests are running out of token budget"
```

---

## 4. Performance Tuning

### 4.1 Load Profile Analysis

```
Scenario: Extract 100 documents per hour

Current setup:
- 5 concurrent extractions
- ~60s per extraction (median)
- ~50 token/sec consumption
- Throughput: 5 concurrent × 60 docs/hour = 300 docs/hour ✓

If latency increases to 90s per extraction:
- Throughput: 5 × 40 docs/hour = 200 docs/hour
- Consider: ↑ maxConcurrent to 7-8
- But: Check token budget (increases linearly)

Token budget impact:
- 100 docs/hour × 4000 tokens/doc ÷ 60 min
- = 6666 tokens/min average
- Limit: 100,000 tokens/min ✓
- Headroom: 93,334 tokens/min (can go 15x higher)

Recommendation: Can increase concurrency to 8-10 safely
```

### 4.2 Concurrency Tuning Matrix

```
Concurrency │ Throughput    │ Token Rate  │ Risk Level
────────────┼───────────────┼─────────────┼──────────
1           │ 60 docs/hr    │ 3.3k/min    │ Very Low
2           │ 120 docs/hr   │ 6.7k/min    │ Very Low
3           │ 180 docs/hr   │ 10k/min     │ Low
4           │ 240 docs/hr   │ 13.3k/min   │ Low
5           │ 300 docs/hr   │ 16.7k/min   │ Medium (current)
6           │ 360 docs/hr   │ 20k/min     │ Medium-High
7           │ 420 docs/hr   │ 23.3k/min   │ High
8           │ 480 docs/hr   │ 26.7k/min   │ Very High
...
50          │ 3000 docs/hr  │ 166.7k/min  │ WAY OVER LIMIT
```

### 4.3 Token Budget Tuning

```
If extraction timeouts are frequent:

Current: 4096 tokens/request
│ Entity Extract:    1440 (35%)
│ Relation Extract:  1440 (35%)
├─ Problem: May be too aggressive
│
├─ Option A: Reduce expectations
│  Entity:    1000 tokens (preserve quality)
│  Relation:  1000 tokens
│  Total:     3000 tokens
│  Savings:   1096 tokens → more requests/min
│
└─ Option B: Increase budget (if available)
   Current: 4000 tokens
   New:     6000 tokens (if LLM limit allows)
   Entity:  2000 tokens
   Relation: 2000 tokens
   Better quality but fewer concurrent requests
```

---

## 5. Deployment Stages

### Phase 1: Foundation (Week 1-2)

```
Tasks:
- [ ] Deploy TokenBudgetService (observability only)
- [ ] Deploy StageTimeoutService (with warnings)
- [ ] Update ConfigService with new fields
- [ ] Add test coverage
- [ ] Monitor metrics

Risk: Low (observability only, no behavior changes)
Rollback: Revert config, redeploy
```

### Phase 2: Integration (Week 3-4)

```
Tasks:
- [ ] Deploy CentralRateLimiterService (queuing)
- [ ] Deploy RequestSupervisorService (coordination)
- [ ] Integrate with EntityExtractor
- [ ] Integrate with RelationExtractor
- [ ] Run canary: 10% traffic

Risk: Medium (changes request flow)
Monitoring: Track queue depth, concurrency
Rollback: Route 10% back to old service
```

### Phase 3: Rollout (Week 5)

```
Tasks:
- [ ] Increase traffic: 25% → 50% → 100%
- [ ] Monitor metrics each step
- [ ] Watch for rate limit errors
- [ ] Verify timeout escalations work
- [ ] Collect baseline metrics

Success criteria:
- ✓ 99%+ request success rate
- ✓ < 2% soft timeout rate
- ✓ < 0.1% hard timeout rate
- ✓ Concurrency stays 0-5 range
```

### Phase 4: Hardening (Weeks 6+)

```
Tasks:
- [ ] Implement circuit breaker
- [ ] Add auto-scaling (concurrency adjustment)
- [ ] Enable partial result caching
- [ ] Implement graceful degradation
- [ ] Add dashboard alerts

Long-term:
- Monitor LLM API changes (rate limits)
- Tune timeouts based on production data
- Consider request prioritization
- Implement user feedback loop
```

---

## 6. Configuration Examples

### 6.1 Conservative Configuration (Safe)

```typescript
export const CONSERVATIVE_CONFIG = {
  stageTimeouts: {
    chunking: { hardTimeoutMs: 10_000, softTimeoutMs: 5_000 },
    entityExtraction: { hardTimeoutMs: 120_000, softTimeoutMs: 90_000 },
    propertyScoping: { hardTimeoutMs: 30_000, softTimeoutMs: 20_000 },
    relationExtraction: { hardTimeoutMs: 120_000, softTimeoutMs: 90_000 },
    grounding: { hardTimeoutMs: 60_000, softTimeoutMs: 45_000 },
    serialization: { hardTimeoutMs: 20_000, softTimeoutMs: 10_000 }
  },

  tokenBudget: {
    requestMaxTokens: 4096,
    allocations: {
      entityExtraction: 1000,
      relationExtraction: 1000,
      grounding: 400,
      propertyScoping: 200,
      other: 1496
    }
  },

  rateLimiting: {
    maxConcurrent: 2,
    requestsPerMinute: 30,
    tokensPerMinute: 50_000,
    circuitBreakerMaxFailures: 3
  }
}
// Throughput: ~120 docs/hour, very safe
```

### 6.2 Balanced Configuration (Default)

```typescript
export const BALANCED_CONFIG = {
  stageTimeouts: {
    chunking: { hardTimeoutMs: 5_000, softTimeoutMs: 3_000 },
    entityExtraction: { hardTimeoutMs: 60_000, softTimeoutMs: 45_000 },
    propertyScoping: { hardTimeoutMs: 15_000, softTimeoutMs: 10_000 },
    relationExtraction: { hardTimeoutMs: 60_000, softTimeoutMs: 45_000 },
    grounding: { hardTimeoutMs: 30_000, softTimeoutMs: 20_000 },
    serialization: { hardTimeoutMs: 10_000, softTimeoutMs: 5_000 }
  },

  tokenBudget: {
    requestMaxTokens: 4096,
    allocations: {
      entityExtraction: 1440,
      relationExtraction: 1440,
      grounding: 615,
      propertyScoping: 328,
      other: 273
    }
  },

  rateLimiting: {
    maxConcurrent: 5,
    requestsPerMinute: 50,
    tokensPerMinute: 100_000,
    circuitBreakerMaxFailures: 5
  }
}
// Throughput: ~300 docs/hour, recommended for production
```

### 6.3 Aggressive Configuration (High Throughput)

```typescript
export const AGGRESSIVE_CONFIG = {
  stageTimeouts: {
    chunking: { hardTimeoutMs: 3_000, softTimeoutMs: 1_500 },
    entityExtraction: { hardTimeoutMs: 45_000, softTimeoutMs: 30_000 },
    propertyScoping: { hardTimeoutMs: 10_000, softTimeoutMs: 5_000 },
    relationExtraction: { hardTimeoutMs: 45_000, softTimeoutMs: 30_000 },
    grounding: { hardTimeoutMs: 20_000, softTimeoutMs: 10_000 },
    serialization: { hardTimeoutMs: 5_000, softTimeoutMs: 2_000 }
  },

  tokenBudget: {
    requestMaxTokens: 3000,
    allocations: {
      entityExtraction: 1000,
      relationExtraction: 1000,
      grounding: 400,
      propertyScoping: 300,
      other: 300
    }
  },

  rateLimiting: {
    maxConcurrent: 8,
    requestsPerMinute: 50,
    tokensPerMinute: 100_000,
    circuitBreakerMaxFailures: 3
  }
}
// Throughput: ~480 docs/hour, higher error rate
// Use only if API proven to be very fast
```

---

## 7. Runbooks

### 7.1 Runbook: Circuit Breaker Opened

**Symptom**: `LLM API circuit breaker is OPEN` alert

**Diagnosis**:
```bash
# 1. Check LLM API status
curl https://api.anthropic.com/health

# 2. Check metrics
curl http://localhost:9090/api/v1/query?query=llm_circuit_breaker_trips

# 3. Check logs
kubectl logs -f -l app=extraction-service | grep CircuitBreaker
```

**Resolution**:
```bash
# Option 1: Wait for automatic recovery (2 minutes)
# Circuit will transition to HALF_OPEN, then CLOSED if API recovers

# Option 2: Force manual recovery (if API is up)
# Restart service to reset circuit state
kubectl rollout restart deployment/extraction-service

# Option 3: Scale down concurrency while recovering
kubectl set env deployment/extraction-service LLM_MAX_CONCURRENT=1
# Then gradually increase back to 5
```

### 7.2 Runbook: High Timeout Rate

**Symptom**: Hard timeout rate > 10%

**Diagnosis**:
```bash
# 1. Which stage is timing out?
kubectl logs -f extraction-service | grep "hard timeout"

# 2. Check stage duration
curl http://localhost:9090/api/v1/query?query=histogram_quantile(0.95,llm_stage_duration_ms)

# 3. Check token consumption
curl http://localhost:9090/api/v1/query?query=llm_tokens_per_minute
```

**Resolution**:
```bash
# If Entity Extraction timing out:
kubectl set env deployment/extraction-service STAGE_TIMEOUT_ENTITY_EXTRACTION=90000
# (increase from 60s to 90s)

# If LLM API is slow globally:
kubectl set env deployment/extraction-service LLM_MAX_CONCURRENT=3
# (reduce concurrency to allow more time per request)

# If token budget exceeded:
kubectl set env deployment/extraction-service TOKEN_ENTITY_EXTRACT=2000
# (allocate more tokens for entity extraction)
```

### 7.3 Runbook: Queue Growing

**Symptom**: `llm_requests_queued > 20` alert

**Diagnosis**:
```bash
# 1. Check concurrency
curl http://localhost:9090/api/v1/query?query=llm_concurrency
# Should be 0-5, if consistently 5 then queue will grow

# 2. Check token bucket
curl http://localhost:9090/api/v1/query?query=llm_token_bucket_current
# If < 1000 tokens, at rate limit

# 3. Check request bucket
curl http://localhost:9090/api/v1/query?query=llm_request_bucket_current
# If < 1 request, hit limit
```

**Resolution**:
```bash
# Option 1: Increase concurrency if token budget allows
kubectl set env deployment/extraction-service LLM_MAX_CONCURRENT=7

# Option 2: Reduce incoming request rate (at application level)
# Scale down API gateway or increase authentication requirements

# Option 3: Reduce document complexity
# Use smaller ontologies or chunks to reduce extraction time

# Option 4: Increase token limit (if provider allows)
# Contact Anthropic to increase rate limit
```

---

## 8. Disaster Recovery

### 8.1 Scenario: Service Crash with Queue

```
Situation: Service crashed with 50 queued requests

Recovery:
1. Service restart
   → All in-memory queue lost
   → Requests timeout at client level

2. Cleanup
   → Check external state (files, database)
   → Resume any partially-completed extractions

3. Prevent recurrence
   → Enable persistent queue (Redis/database)
   → Implement request deduplication
   → Add health checks
```

### 8.2 Scenario: LLM API Down (Extended Outage)

```
Situation: Anthropic API down for 4 hours

Response:
1. Immediate (0-5 min)
   → Circuit breaker opens automatically
   → Log alert: "Circuit breaker OPEN"
   → Reject all new requests with clear error

2. Short term (5 min - 1 hour)
   → Monitor API status page
   → Don't retry aggressively (preserve logs)
   → Queue requests in persistent queue

3. Recovery (1+ hours)
   → API recovers
   → Circuit transitions to HALF_OPEN
   → Allow 1-2 test requests
   → If success: close circuit
   → Process queued requests

4. Post-mortem
   → Update documentation
   → Consider fallback LLM provider
   → Implement provider auto-failover
```

---

## 9. Cost Optimization

### 9.1 Token Usage Analysis

```
Average extraction: 3800 tokens

Cost per extraction (Anthropic Haiku):
- 3800 tokens ÷ 1M = 0.0038 tokens
- Rate: $0.80 per 1M input, $4.00 per 1M output
- Input avg: 2500 tokens × $0.80/1M = $0.002
- Output avg: 1300 tokens × $4.00/1M = $0.0052
- Total per extraction: $0.0072

Cost for 100,000 extractions/month:
- 100,000 × $0.0072 = $720/month

Optimization opportunities:
1. Reduce budget from 4096 to 3000 tokens
   → Save 25% = $180/month

2. Batch small documents
   → 2 docs per request = 50% savings = $360/month

3. Cache results for duplicate documents
   → Estimated 5% duplicates = $36/month saved

Total savings with all optimizations: ~$500/month (70%)
```

---

## References

- Anthropic API Docs: https://docs.anthropic.com
- Effect Timeout: https://effect.website/docs/guides/error-handling/timeout
- Token Bucket Algorithm: https://en.wikipedia.org/wiki/Token_bucket
- Circuit Breaker Pattern: https://martinfowler.com/bliki/CircuitBreaker.html
- Prometheus Best Practices: https://prometheus.io/docs/practices/instrumentation/

