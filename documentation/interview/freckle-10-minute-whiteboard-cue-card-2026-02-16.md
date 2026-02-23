## Goal
Show architecture depth without over-indexing on tech.
Anchor everything to:

- operator trust
- predictable workflows
- fast time-to-value

---
## Board Layout (first 20 seconds)

Write across the top:

- `1) Enrichment`
- `2) Sync Conflicts`
- `3) Ontology Upgrade`

Opening line:
- \"I’ll walk from baseline enrichment, to conflict-safe sync, then an ontology-based quality upgrade, all tied to operator outcomes.\"

---

## 0:00-4:30 — Flow 1: Enrichment Pipeline

Draw in order:

1. `Source Events -> Ingestion + Normalization -> Identity Resolution + Dedupe`
2. `Enrichment Waterfall -> Provider Confidence Scoring -> Field Policy Engine`
3. `Transactional Write Stage -> CRM Sync Writer -> Success Path`
4. Side rails:
   - `Transient Failure -> Retry with Backoff`
   - `Permanent Failure -> DLQ`
   - `Invariant Failure -> Rollback + Safe Response`
   - `Tracing/Metrics/Logs`

Say:

- \"I normalize all inbound sources into one canonical shape.\"
- \"Waterfall improves coverage; confidence scoring controls trust.\"
- \"Field policy prevents low-confidence writes from clobbering trusted CRM data.\"
- \"Transactions protect invariants; retries + DLQ preserve throughput; telemetry preserves diagnosability.\"

One-liner close:
- \"Success is fresh, trusted CRM data, not just successful API calls.\"

---

## 4:30-7:00 — Flow 2: Sync Conflict Resolution

Draw in order:

1. `Incoming Update -> Load Existing Record + Version -> Per-Field Conflict Check`
2. Decision inputs:
   - `Source Trust`
   - `Confidence`
   - `Recency`
   - `Manual Override / Locked Fields`
3. `Decision Engine -> Apply / Preserve / Queue Review`
4. `Optimistic Concurrency Write`
5. `Version Conflict -> Re-read + Re-evaluate (idempotent)`
6. `Operator Review Queue + Audit Trail`

Say:

- \"Conflicts are field-level, not record-level.\"
- \"Decisioning combines trust, confidence, freshness, and lock semantics.\"
- \"Optimistic concurrency avoids lost updates; ambiguous cases go to human review.\"

One-liner close:
- \"The objective is safe automation with clear human escape hatches.\"

---

## 7:00-9:15 — Flow 3: Ontology-Augmented Upgrade

Draw in order:

1. `Ontology Load/Cache -> Ontology Context`
2. Merge with enrichment path:
   - `Provider Candidates + Ontology Context -> Ontology-Guided Typing`
3. `Graph Assembly -> Grounding/Confidence Filter -> Entity Resolution + Clustering`
4. Back into sync:
   - `Field Policy -> Transactional Write -> CRM Sync -> Operator View`
5. Side lane:
   - `Low-Confidence/Ambiguous -> Human Review`

Say:

- \"Ontology gives semantic constraints, so enrichment maps to valid concepts.\"
- \"Grounding filters weak facts before sync; clustering improves canonical identity.\"
- \"Operators get cleaner records and better explainability.\"

One-liner close:
- \"This turns enrichment from value scraping into governed, trustable workflow infrastructure.\"

---

## 9:15-10:00 — Close (tradeoff + impact)

Say:

- \"Tradeoff: ontology guidance adds modeling overhead.\"
- \"Rollout plan: start with highest-impact workflows first.\"
- \"Expected win: fewer bad overwrites, higher trust, faster operator decisions.\"

Pick one metric:

- \"Up to 40% reduction in picking travel time from workflow optimization.\"
- \"Mozilla Observatory A+ (115/100) as an external trust hardening signal.\"

Final sentence:
- \"I optimize for operator trust by combining idempotent execution, conflict-safe policy, transactional invariants, and observability.\"

---

## If You Get Interrupted

### 5-minute cut

- 2 min: baseline enrichment flow
- 2 min: conflict-safe sync logic
- 1 min: ontology quality layer

### 2-minute cut

Say this:
- \"I normalize inbound data, enrich via a confidence-scored waterfall, apply per-field conflict-safe policy, write transactionally, and sync idempotently with retries + DLQ + observability. Then I add ontology guidance to improve precision and explainability while keeping a human-review lane for ambiguity.\"

---

## High-Risk Questions (quick responses)

\"Why not just keep it simple without ontology?\"
- \"For low complexity use cases, I would. For high-value CRM workflows, ontology adds precision and reduces costly misclassification/overwrite errors.\"

\"What fails most often?\"
- \"Provider variability, identity ambiguity, and sync conflicts. That’s why I separate transient vs permanent failures and keep a review lane.\"

\"How do you keep this user-first?\"
- \"By hiding internal complexity behind predictable sync behavior, clear statuses, and fast time-to-first-value.\"
