# OVERVIEW Legacy Knowledge Integration Explained

## 1. Why This Document Exists
This is the **human-readable companion** to the technical exploration file:
- [OVERVIEW_LEGACY_KNOWLEDGE_INTEGRATION_EXPLORATION.md](./OVERVIEW_LEGACY_KNOWLEDGE_INTEGRATION_EXPLORATION.md)

That exploration file is comprehensive, evidence-dense, and highly structured. It is excellent for audits and traceability, but harder to read for learning and idea development.

This document translates the same findings into a **teaching narrative** so you can:
- understand what the legacy knowledge slice was actually doing,
- see what still has value for the current architecture,
- generate better ideas for the next greenfield spec.

It keeps the same evidence grounding and opportunity IDs, but explains them in plain language first.

---

## 2. How to Read This Companion
Use this like a guided walkthrough:
1. Read Sections 3-8 to build shared understanding.
2. Read Sections 9-13 to see where legacy ideas map into current `OVERVIEW`.
3. Use Sections 14-16 to turn ideas into next-spec prompts.
4. Use the appendices for full lists, scores, and source trails.

### Badge Meanings
- `Legacy Verified`: found in old code, not just docs.
- `Legacy Planned`: documented in legacy docs but not fully landed.
- `Current Opportunity`: candidate idea for the current system.

---

## 3. What the Legacy Knowledge System Actually Was
At a high level, the old knowledge slice was trying to build a **deterministic, ontology-guided extraction system** with controlled LLM usage.

### What it did conceptually
It processed text in phases:
- chunk text,
- retrieve relevant ontology/context,
- extract mentions/entities/relations,
- assemble and normalize graph output,
- persist artifacts with enough metadata to debug runs.

The key architectural philosophy was not “let the model decide everything,” but rather:
- use schema/ontology constraints,
- make each stage explicit,
- bound LLM behavior with policy.

### Why that matters now
This is directly compatible with your current deterministic-first direction in [OVERVIEW.md](./OVERVIEW.md), especially around:
- validation loops,
- bounded enrichment,
- explainability and provenance.

Evidence:
- `.repos/beep-effect/packages/knowledge/_docs/functional_spec.md`
- `.repos/beep-effect/packages/knowledge/_docs/architecture/system-architecture.md`
- `.repos/beep-effect/packages/knowledge/_docs/PRODUCTION_SPEC.md`

Badges: `Legacy Planned`, `Current Opportunity`

---

## 4. What Was Real vs What Was Aspirational
This is the most important distinction for clean planning.

### What was real (`Legacy Verified`)
The old **server/runtime layer** had substantial implementation:
- orchestration workflows,
- extraction pipeline,
- progress stream primitive,
- LLM control services (timeouts, rate limits, token budgets, retries),
- workflow persistence,
- domain/tables for ontology and extraction evidence.

### What was mostly aspirational (`Legacy Planned`)
Several high-value ideas remained incomplete:
- truly unified end-to-end idempotency propagation,
- fully realized claim/assertion lifecycle model,
- complete SHACL enforcement wiring,
- full client/UI streaming experience (timeline, cancel/retry UX).

### Why this matters now
You can safely reuse many **patterns** without pretending the whole old product vision was fully delivered.

Evidence:
- `.repos/beep-effect/packages/knowledge/server/src/Workflow/BatchOrchestrator.ts`
- `.repos/beep-effect/packages/knowledge/server/src/Extraction/ExtractionPipeline.ts`
- `.repos/beep-effect/packages/knowledge/server/src/LlmControl/LlmResilience.ts`
- `.repos/beep-effect/packages/knowledge/client/src/index.ts`
- `.repos/beep-effect/packages/knowledge/ui/src/index.ts`
- `.repos/beep-effect/packages/knowledge/_docs/README-IDEMPOTENCY.md`

Badges: `Legacy Verified`, `Legacy Planned`

---

## 5. The Big Architectural Lessons
### Lesson 1: Deterministic scaffolding around LLM stages improves reliability
What: keep extraction/enrichment stages explicit and constrained.
Why: easier to debug, tune, and verify.
How now: keep deterministic-first in the current system and treat LLM outputs as candidate facts until validated.

### Lesson 2: “Control plane” is not optional
What: stage policies for timeout/rate/budget/retries.
Why: without this, LLM-heavy systems are hard to operate and expensive.
How now: map these controls onto current enrichment/verification stages.

### Lesson 3: Provenance and temporal fields are product features, not metadata trivia
What: timestamps and evidence spans enable meaningful trust and timeline reasoning.
Why: you cannot answer “what did we know when?” without them.
How now: make temporal/provenance fields deliberate in contract design.

### Lesson 4: Plans often overstate end-to-end maturity
What: docs can show complete architecture while UX surfaces remain stubs.
Why: prevents overconfidence in reuse assumptions.
How now: separate pattern reuse from runtime reuse.

Evidence:
- `.repos/beep-effect/packages/knowledge/_docs/LLM_CONTROL_STRATEGY_SUMMARY.md`
- `.repos/beep-effect/packages/knowledge/_docs/audits/AUDIT_SUMMARY.md`
- `.repos/beep-effect/packages/knowledge/_docs/PROGRESS_STREAMING_SUMMARY.md`

Badges: `Legacy Verified`, `Legacy Planned`, `Current Opportunity`

---

## 6. Reasoning Lessons Worth Carrying Forward
**Reasoning** here means deriving additional facts from existing facts using bounded rule profiles.

### Core lesson
Use **targeted reasoning**, not unconstrained ontology inference.

The legacy recommendation is clear:
- prefer lightweight profiles (RDFS-style + custom rules),
- validate after reasoning with SHACL,
- avoid aggressive `owl:sameAs` behavior for entity resolution because of explosion risk.

### Why this matters now
Your current architecture already contemplates reasoning integration. The biggest value is in:
- consistency checks,
- safer enrichment validation,
- better relation closure where rules are explicit and bounded.

### Example scenario: reasoning-before-validation
- You ingest deterministic facts.
- You infer safe transitive/domain/range facts.
- You run validation over the enriched graph.
- You only publish validated outcomes.

This sequence catches issues that neither extraction-only nor validation-only flows catch.

Evidence:
- `.repos/beep-effect/packages/knowledge/_docs/ontology_research/REASONING_RECOMMENDATIONS.md`
- `.repos/beep-effect/packages/knowledge/_docs/ontology_research/owl_reasoning_validation_production.md`
- [OVERVIEW.md](./OVERVIEW.md)

Badges: `Legacy Planned`, `Current Opportunity`

---

## 7. Validation and Trust Patterns
Validation in this context is about making generated/derived facts trustworthy.

### Pattern A: enforce shape constraints, do not just log them
Legacy docs show the pain of “validation exists but is not hard-gated.”

### Pattern B: keep evidence attached to facts
Mention spans, relation evidence, extraction identifiers, and confidence values make review and debugging practical.

### Pattern C: keep temporal dimensions explicit
Different timestamps answer different questions:
- when event occurred,
- when document was published,
- when data was ingested,
- when fact was asserted,
- when fact was derived.

### Why this matters now
Your de-hallucinator and contradiction workflows will be far more explainable if trust artifacts are first-class.

Evidence:
- `.repos/beep-effect/packages/knowledge/tables/src/tables/mention.table.ts`
- `.repos/beep-effect/packages/knowledge/tables/src/tables/relation-evidence.table.ts`
- `.repos/beep-effect/packages/knowledge/_docs/audits/2025-12-18-medium-severity-modeling-audit.md`

Badges: `Legacy Verified`, `Legacy Planned`, `Current Opportunity`

---

## 8. Operational Patterns (LLM Control, Idempotency, Streaming)
This is where the legacy corpus is strongest as a reusable idea set.

### LLM Control Pattern
- Stage-level hard/soft timeouts.
- Per-stage token budgets.
- Central rate limiter and breaker behavior.
- Partial-result policies.

### Idempotency Pattern
- Build one fingerprint from normalized input + ontology identity/version + extraction parameters.
- Use it consistently across orchestration/execution/cache boundaries.
- Prevent expensive duplicate work.

### Streaming Pattern
- Standardized event envelopes.
- Backpressure warning/strategy semantics.
- Clear cancellation and partial result behaviors.

### Example scenario: idempotency in practice
Two requests are semantically identical but have different request IDs.
- Without unified fingerprint: duplicate execution and cost.
- With unified fingerprint: shared execution or cache hit.

Evidence:
- `.repos/beep-effect/packages/knowledge/_docs/LLM_CONTROL_STRATEGY_SUMMARY.md`
- `.repos/beep-effect/packages/knowledge/_docs/README-IDEMPOTENCY.md`
- `.repos/beep-effect/packages/knowledge/_docs/PROGRESS_STREAMING_SUMMARY.md`
- `.repos/beep-effect/packages/knowledge/server/src/LlmControl/LlmResilience.ts`
- `.repos/beep-effect/packages/knowledge/server/src/Workflow/ProgressStream.ts`

Badges: `Legacy Verified`, `Legacy Planned`, `Current Opportunity`

---

## 9. Where These Ideas Fit in the Current OVERVIEW Architecture
This is the bridge from legacy insights to current system shape.

### Highest-fit mappings
- Reasoning + validation: `OVERVIEW` sections 10/11/14.
- LLM control: sections 11/14/15.
- Idempotency + runtime safety: sections 9/14/16.
- Retrieval improvements: sections 12/15.
- Temporal/provenance claim model: sections 11/13/15.

### Why this matters now
These integrations strengthen existing architecture intent rather than introducing an unrelated direction.

Evidence:
- [OVERVIEW.md](./OVERVIEW.md)
- `.repos/beep-effect/packages/knowledge/_docs/ontology_research/REASONING_RECOMMENDATIONS.md`
- `.repos/beep-effect/packages/knowledge/_docs/LLM_CONTROL_STRATEGY_SUMMARY.md`

Badges: `Current Opportunity`

---

## 10. Definitive Benefits (High Confidence)
These are high-confidence because they are backed by both legacy docs and verified runtime patterns.

1. Better reliability for LLM-heavy stages through explicit control policies.
2. Stronger validation integrity when reasoning and validation are sequenced properly.
3. Cost control via real idempotency and dedup behavior.
4. Better debugging and trust through evidence/provenance fields.
5. Better long-run transparency through structured progress events.

Evidence:
- `.repos/beep-effect/packages/knowledge/server/src/LlmControl/*.ts`
- `.repos/beep-effect/packages/knowledge/_docs/REASONING_RECOMMENDATIONS.md`
- `.repos/beep-effect/packages/knowledge/_docs/README-IDEMPOTENCY.md`
- `.repos/beep-effect/packages/knowledge/_docs/PROGRESS_STREAMING_SUMMARY.md`

Badges: `Legacy Verified`, `Current Opportunity`

---

## 11. Potential Benefits (Good Ideas, Context Dependent)
These are promising but require contextual decisions.

1. Claim/Assertion-first storage model for richer contradiction explainability.
2. Retrieval fusion and query expansion layers for better relevance.
3. TBox/ABox separation for portability and testing discipline.
4. External reasoner strategy for larger-scale workloads.
5. Timeline-heavy UI instrumentation patterns.

Why “potential”: each adds value, but also introduces complexity and sequencing dependencies.

Evidence:
- `.repos/beep-effect/packages/knowledge/_docs/ontology_research/sota_review.md`
- `.repos/beep-effect/packages/knowledge/_docs/audits/2025-12-18-medium-severity-modeling-audit.md`
- `.repos/beep-effect/packages/knowledge/_docs/mvp/UI_UX_RESEARCH_KNOWLEDGE_GRAPH_VIS.md`

Badges: `Legacy Planned`, `Current Opportunity`

---

## 12. Top Opportunities Explained (Narrative Top 15)
Below are the top opportunities from the ranked list, translated for readability.

### 1) O01 - ReasoningValidationPipeline
What: explicit flow from inferred facts to validation to publish.
Why: improves trust and catches cross-stage inconsistencies.
How now: treat as contract seam in current reasoning integration.

### 2) O02 - SHACL hard-gating
What: validation should block invalid publish paths.
Why: prevents quality drift from becoming production truth.
How now: define gate semantics in future spec.

### 3) O06 - LlmControlPolicy transfer
What: stage-level timeout/rate/budget/retry policy.
Why: predictable runtime behavior and better cost control.
How now: map policies to claim decomposition/enrichment stages.

### 4) O21 - Entity-resolution link discipline
What: avoid naive `owl:sameAs` explosion patterns.
Why: reduces false identity merges and inference blowups.
How now: define cautious alias/canonicalization rules.

### 5) O14 - Reasoning profiles
What: explicit reasoning profile taxonomy.
Why: bounds inference scope and operational risk.
How now: start with conservative profiles.

### 6) O05 - Unified idempotency fingerprint
What: single dedup key across request->workflow->cache.
Why: avoids duplicate expensive executions.
How now: define normalized fingerprint contract.

### 7) O17 - Workflow state-return discipline
What: return state, then synchronize externally.
Why: reduces race conditions and state drift.
How now: apply to multi-stage graph updates.

### 8) O03 - TemporalProvenance core
What: five key time dimensions.
Why: enables timeline truth and post-hoc analysis.
How now: add as candidate contract in next spec.

### 9) O07 - ProgressEventEnvelope
What: one event model across orchestration/transport/client.
Why: consistency and operability.
How now: define envelope before transport implementations.

### 10) O08 - Backpressure strategy
What: explicit behavior when consumers lag.
Why: avoids silent stream quality degradation.
How now: make strategy configurable and observable.

### 11) O09 - Partial-result semantics
What: structured degraded outcomes rather than hard failures.
Why: better UX and operational continuity.
How now: define per-stage degraded result policy.

### 12) O10 - Evidence span normalization
What: consistent mention/relation evidence model.
Why: reliable explainability and validation traceability.
How now: align evidence contracts with claim-level verification.

### 13) O24 - Concurrent deduplicator service
What: coalesce in-flight equivalent executions.
Why: immediate efficiency and API cost reduction.
How now: pair with idempotency fingerprint.

### 14) O12 - Deterministic audit trail
What: consistent run-level event artifact.
Why: simplifies debugging and incident analysis.
How now: keep simple first; evolve later.

### 15) O19 - Operational profile presets
What: conservative/balanced/aggressive control templates.
Why: practical rollout and tuning.
How now: start balanced, measure, then tune.

Evidence:
- Ranked source: [OVERVIEW_LEGACY_KNOWLEDGE_INTEGRATION_EXPLORATION.md](./OVERVIEW_LEGACY_KNOWLEDGE_INTEGRATION_EXPLORATION.md)

Badges: `Current Opportunity`

---

## 13. Recommended Exploratory Lanes (A-D)
### Lane A: Deterministic Guardrails First
- Focus: O01, O02, O06, O14, O27.
- Goal: harden correctness boundaries and execution safety first.

### Lane B: Reasoning + Validation Tightening
- Focus: O03, O04, O11, O15, O23.
- Goal: improve contradiction explainability and lifecycle semantics.

### Lane C: Retrieval/Context Intelligence
- Focus: O13, O18, O20, O21.
- Goal: improve relevance and context quality.

### Lane D: Operational Control Plane
- Focus: O05, O07, O08, O09, O12, O19, O24.
- Goal: improve run-time reliability, deduplication, and observability.

### What to do with this
Use lanes as drafting tracks for future spec packages, not implementation mandates.

Evidence:
- [OVERVIEW_LEGACY_KNOWLEDGE_INTEGRATION_EXPLORATION.md](./OVERVIEW_LEGACY_KNOWLEDGE_INTEGRATION_EXPLORATION.md)

Badges: `Current Opportunity`

---

## 14. Candidate Contract Concepts (Human Explanations)
These are concept-level additions for future specs.

### `ReasoningValidationPipeline`
- Plain definition: the explicit sequence from inference to validation to publication.
- Why it helps: avoids publishing unvalidated inferred facts.
- Tradeoff: adds stage complexity and policy decisions.
- Mapping: `OVERVIEW` sections 10, 11, 14.

### `TemporalProvenance`
- Plain definition: a standard set of timestamps for event/publish/ingest/assert/derive.
- Why it helps: supports timeline, audit, and causality explanations.
- Tradeoff: more schema and data handling complexity.
- Mapping: sections 11, 13, 15.

### `ClaimRecord` / `AssertionRecord`
- Plain definition: claim-level objects separate from raw edge storage.
- Why it helps: better contradiction and lifecycle handling.
- Tradeoff: additional storage/model overhead.
- Mapping: sections 11, 13, 15.

### `IdempotencyFingerprint`
- Plain definition: normalized execution identity used across layers.
- Why it helps: dedup and cost control.
- Tradeoff: key design and invalidation discipline required.
- Mapping: sections 9, 14, 16.

### `ProgressEventEnvelope`
- Plain definition: one consistent progress event format across system boundaries.
- Why it helps: predictable observability and client behavior.
- Tradeoff: requires cross-layer contract management.
- Mapping: sections 9, 14, 15.

### `LlmControlPolicy`
- Plain definition: explicit runtime guardrail policy per stage.
- Why it helps: deterministic operations under variable model behavior.
- Tradeoff: tuning burden.
- Mapping: sections 11, 14, 15.

### `ConflictLifecycle`
- Plain definition: explicit state machine for contradiction/supersession outcomes.
- Why it helps: transparent fact evolution instead of silent replacement.
- Tradeoff: more nuanced decision logic.
- Mapping: sections 11, 13, 16.

### `OpportunityScore`
- Plain definition: fixed scoring contract for prioritization.
- Why it helps: repeatable ranking discussions.
- Tradeoff: scoring still requires judgment on inputs.
- Mapping: section 18 + appendix.

Evidence:
- [OVERVIEW.md](./OVERVIEW.md)
- [OVERVIEW_LEGACY_KNOWLEDGE_INTEGRATION_EXPLORATION.md](./OVERVIEW_LEGACY_KNOWLEDGE_INTEGRATION_EXPLORATION.md)

Badges: `Current Opportunity`

---

## 15. Risks and Common Failure Modes
1. Over-ambitious reasoning scope causes complexity and inference noise.
2. Idempotency is defined but not consistently propagated.
3. Validation exists but remains advisory instead of enforceable.
4. Progress event systems exist without strong consumer surfaces.
5. Rich claim lifecycle models may add complexity before immediate value is proven.
6. Control policies can be mis-tuned and degrade quality or throughput.

### Example scenario: contradiction lifecycle risk
If contradictions are handled as overwrites instead of lifecycle transitions:
- you lose historical context,
- debugging becomes harder,
- trust in outputs decreases.

Evidence:
- `.repos/beep-effect/packages/knowledge/_docs/audits/AUDIT_SUMMARY.md`
- `.repos/beep-effect/packages/knowledge/_docs/README-IDEMPOTENCY.md`
- `.repos/beep-effect/packages/knowledge/_docs/PROGRESS_STREAMING_SUMMARY.md`

Badges: `Legacy Planned`, `Current Opportunity`

---

## 16. How to Turn This into the Next Spec
Use this sequence for the next concrete spec package.

1. Select one exploratory lane (A-D) as the primary scope.
2. Freeze candidate contracts needed for that lane.
3. Define phase fit (P0-P7) and gate criteria in `OVERVIEW` terms.
4. Define negative test paths (timeouts, dedup collisions, contradiction cases).
5. Define rollout profile and observability requirements.
6. Define ADR prompts before changing canonical lock surfaces.

### Spec-seeding prompts
- “What is the minimum safe reasoning profile set for first rollout?”
- “Which stages need hard failure vs partial-result behavior?”
- “Where must idempotency keys be computed, stored, and checked?”
- “What evidence is mandatory before a fact can be published?”
- “Which contradiction states are allowed to auto-resolve?”

Evidence:
- [OVERVIEW.md](./OVERVIEW.md)
- [OVERVIEW_LEGACY_KNOWLEDGE_INTEGRATION_EXPLORATION.md](./OVERVIEW_LEGACY_KNOWLEDGE_INTEGRATION_EXPLORATION.md)

Badges: `Current Opportunity`

---

## 17. Appendix A: Exhaustive Opportunity List
For the full exhaustive list and detailed mapping, reuse the technical reference:
- [OVERVIEW_LEGACY_KNOWLEDGE_INTEGRATION_EXPLORATION.md](./OVERVIEW_LEGACY_KNOWLEDGE_INTEGRATION_EXPLORATION.md) Section 12 (`O01`-`O28`).

Short list of IDs for convenience:
`O01, O02, O03, O04, O05, O06, O07, O08, O09, O10, O11, O12, O13, O14, O15, O16, O17, O18, O19, O20, O21, O22, O23, O24, O25, O26, O27, O28`

---

## 18. Appendix B: Ranking Method and Full Scores
### Ranking Method
The companion uses the same scoring method as the exploration file:

`Score = 0.35*Impact + 0.25*Confidence + 0.2*EffortInverse + 0.1*RiskInverse + 0.1*PhaseReadiness`

### Full Scores
For the exact ranked table (all opportunities), see:
- [OVERVIEW_LEGACY_KNOWLEDGE_INTEGRATION_EXPLORATION.md](./OVERVIEW_LEGACY_KNOWLEDGE_INTEGRATION_EXPLORATION.md), Section 13.

Rationale for keeping full table there:
- avoids duplicating dense matrices,
- keeps this companion easier to read,
- preserves one canonical ranking surface.

---

## 19. Appendix C: Source Trail
Primary source clusters:
- `.repos/beep-effect/packages/knowledge/_docs/INDEX.md`
- `.repos/beep-effect/packages/knowledge/_docs/functional_spec.md`
- `.repos/beep-effect/packages/knowledge/_docs/PRODUCTION_SPEC.md`
- `.repos/beep-effect/packages/knowledge/_docs/README-IDEMPOTENCY.md`
- `.repos/beep-effect/packages/knowledge/_docs/LLM_CONTROL_STRATEGY_SUMMARY.md`
- `.repos/beep-effect/packages/knowledge/_docs/PROGRESS_STREAMING_SUMMARY.md`
- `.repos/beep-effect/packages/knowledge/_docs/ontology_research/REASONING_RECOMMENDATIONS.md`
- `.repos/beep-effect/packages/knowledge/_docs/audits/AUDIT_SUMMARY.md`
- `.repos/beep-effect/packages/knowledge/_docs/audits/2025-12-18-medium-severity-modeling-audit.md`

Verification paths:
- `.repos/beep-effect/packages/knowledge/server/src/**`
- `.repos/beep-effect/packages/knowledge/domain/src/**`
- `.repos/beep-effect/packages/knowledge/tables/src/**`
- `.repos/beep-effect/packages/knowledge/client/src/index.ts`
- `.repos/beep-effect/packages/knowledge/ui/src/index.ts`

Current architecture anchor:
- [OVERVIEW.md](./OVERVIEW.md)

---

## 20. Appendix D: Quick Glossary for New Readers
- **Deterministic-first**: compute what can be computed from structure/types before using LLM inference.
- **Reasoning profile**: bounded rule set used to derive additional facts.
- **SHACL validation**: shape constraints used to check graph data quality.
- **Idempotency fingerprint**: normalized key identifying semantically equivalent executions.
- **Backpressure**: behavior when event producers are faster than consumers.
- **Partial result policy**: explicit degraded-output behavior under failures/timeouts.
- **Claim lifecycle**: status evolution of a claim/fact over time (accepted/superseded/etc.).
- **Temporal provenance**: timestamp dimensions that explain when and how facts entered or changed in the system.
- **Operational profile**: predefined runtime control settings (e.g., conservative vs aggressive).
- **Lane**: thematic grouping of opportunities for planning and spec drafting.

