# P4 Rollout Readiness

## Decision
Recommended rollout stage: **Hold at `R0 Shadow`** (no promotion).

## Decision Basis

### 1. Quantitative threshold evaluation completeness
All README quantitative thresholds were evaluated and statused in P4 reports; multiple thresholds are blocked/unmet.

### 2. Gate outcome by category
- Coverage/correctness: **Not ready** (3 key metrics unmeasured at required depth)
- Semantic enrichment quality: **Not ready** (all quality thresholds unmeasured)
- Query usefulness: **Partially ready** (latency pass, usefulness/relevance unmeasured)
- Agentic impact: **Not ready** (3/4 outcome deltas fail with current benchmark artifacts)

### 3. Fallback readiness
Fallback drill evidence is positive and contract-consistent (see `fallback-drill-report.md`).

## Lock Integrity Check
No contradictions found against locked defaults/interfaces:
- CLI commands unchanged
- Node ID shape unchanged
- Provenance values unchanged
- `AstKgEpisodeV1` envelope unchanged
- Hook timeout/no-throw behavior preserved

## Promotion Matrix Assessment

| Stage | Promotion Requirement | Current P4 Status |
|---|---|---|
| R0 -> R1 | Coverage/correctness targets met | FAIL |
| R1 -> R2 | Query usefulness targets met | FAIL |
| R2 -> R3 | Early benchmark lift + `p95<=1.5s` | FAIL (lift not shown) |
| R3 steady state | Full performance thresholds met | FAIL |

## Required Actions Before Next Promotion Decision
1. Produce repo-scale coverage/correctness metrics with manual precision samples per frozen sample sizes.
2. Publish semantic parse success, precision, and recall artifacts.
3. Run curated query usefulness study (top-5 hit rate + human relevance panel).
4. Run live benchmark suite (`--live`) to establish non-simulated agentic impact deltas.

## Final Readiness Status
**NO-GO for promotion beyond R0 Shadow.**
