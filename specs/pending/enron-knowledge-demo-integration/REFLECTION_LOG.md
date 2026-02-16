# Reflection Log: Enron Knowledge Demo Integration

> Cumulative learnings from each phase of this spec.

---

## Phase 0: Spec Initialization

### What Worked

- Capturing locked product decisions early reduced ambiguity around transport, ingestion UX, and meeting prep behavior.
- Defining protocol constraints up front (`/v1/knowledge/rpc`, NDJSON) prevented early architecture drift.
- Raising structure to critical-spec shape surfaced missing dual-handoff and delegation evidence issues before implementation began.

### What Didn't Work

- Initial scaffolding was too shallow for critical complexity; reviewer penalties appeared immediately for missing depth and placeholder sections.
- The first handoff draft omitted context-budget audit details, creating avoidable review churn.

### Patterns Discovered

- This integration spans `apps/todox`, `apps/server`, `runtime-server`, and `knowledge-server`; phase guards are required to control coupling risk.
- Spec quality degrades quickly when handoff and delegation artifacts are not treated as first-class outputs.

### Prompt Refinements

- Bootstrap prompts must require context-budget tables in every handoff from P1 onward.
- Bootstrap prompts should explicitly require a delegation log file for complex specs.

---

## Phase 1: Discovery & Design

### What Worked

- Re-validating the route implementation file-by-file (`page.tsx`, `actions.ts`, input/query components) exposed every mock seam and removed ambiguity about migration scope.
- Anchoring scenario definitions to `meeting-prep-quality.json` produced a deterministic catalog with stable IDs, thread/document references, and query seeds.
- Mapping ingest lifecycle directly to `BatchState` tags gave a concrete UI state machine rather than ad hoc loading flags.

### What Didn't Work

- The original assumption that merged RPC groups implied full method readiness was incorrect; several methods are currently `not implemented` server-side (`relation_*`, some `entity_*`, `graphrag_queryFromSeeds`).
- Shared client RPC constructor parity was weaker than expected: existing default points to `/v1/shared/rpc`, while knowledge runtime is `/v1/knowledge/rpc`.

### Patterns Discovered

- The highest P2 risk is protocol mismatch and runtime wiring, not UI rendering complexity.
- Contract-declared failures and runtime behavior can diverge (for example, duplicate batch-start constraints are defined in contract types but not fully enforced in current start handler path), so client-side gating is required for deterministic UX.
- Meeting prep remains a separate axis: handler/persistence path exists, but synthesis quality is intentionally deferred to Phase 3.

### Prompt Refinements

- Discovery prompts must include a method-level implementation matrix, not only contract listing.
- Require explicit “client constructor parity” checks (`/v1/shared/rpc` vs `/v1/knowledge/rpc`, serialization, auth context propagation).
- Require feature-gate implementation status checks in discovery outputs, not only as later-phase TODOs.

---

## Phase 2: RPC Client Migration

### What Worked

- Planning around `AtomRpc.Tag` and typed query/mutation boundaries keeps UI migration incremental while preserving component reuse.
- Treating ingest status transitions as a formal state machine reduces hidden race conditions in async rendering.

### What Didn't Work

- Early planning drafts did not fully define scenario-switch semantics against persisted org data.
- Initial migration notes did not force explicit rejection of default mock fallback behavior, which can create mixed-source demos.

### Patterns Discovered

- Transport mismatches are most likely at protocol-construction boundaries, not in individual query atoms.
- A deterministic ingest lifecycle requires both backend idempotency and frontend transition gating.

### Prompt Refinements

- Phase 2 prompts must require a "no-default-mock-path" assertion in output artifacts.
- Add an explicit checklist item for scenario switching behavior under partially completed ingest operations.

---

## Phase 3: Meeting Prep Rewrite

### What Worked

- Splitting goals into synthesis quality, evidence integrity, and recoverable-failure safety creates a clearer acceptance model than a single quality score.
- Preserving existing persistence contracts while changing synthesis internals reduces downstream RPC/UI breakage risk.

### What Didn't Work

- Early rewrite framing focused on bullet quality but underemphasized evidence mismatch classification.
- Failure-mode expectations were initially broad and needed explicit deterministic fallback requirements.

### Patterns Discovered

- Evidence-chain regressions usually surface as weak-support or cross-thread leakage before hard missing-reference failures.
- Handler safety depends on translating recoverable failures to typed outcomes, not defects.

### Prompt Refinements

- Phase 3 prompts now require explicit mismatch mode reporting: missing evidence, wrong span, weak support, cross-thread leakage.
- Include a mandatory "no template relation-id bullets" regression check in review prompts.

---

## Phase 4: Demo Validation

### What Worked

- Defining a fixed ingest->query->meeting-prep evidence trail enables reproducible demo validation over multiple scenarios.
- Separating functional validation (`demo-validation.md`) from risk prioritization (`demo-risks.md`) avoids conflating status and planning.

### What Didn't Work

- Validation plans initially lacked strict gate-on/gate-off expectations for `ENABLE_ENRON_KNOWLEDGE_DEMO`.
- Early drafts did not require per-scenario summaries, which weakens comparative analysis.

### Patterns Discovered

- Internal demo quality drops sharply if one feature still uses dummy data while others use real data.
- Multi-scenario demos need deterministic ordering and stable seeds to make regressions debuggable.

### Prompt Refinements

- Phase 4 prompts must require per-scenario output sections with explicit pass/fail criteria.
- Add a required feature-gate verification subsection for both enabled and disabled states.

---

## Phase 5: Closure

### What Worked

- Treating review score targets as explicit deliverables (`5.0/5`) makes closure objective and auditable.
- Requiring closure handoff plus orchestrator prompt ensures session continuity if final transition is delayed.

### What Didn't Work

- Closure readiness can be overestimated when reflection and delegation evidence are incomplete.
- Final review quality can lag if the last pass is run before handoff chain and budgets are fully updated.

### Patterns Discovered

- Final scoring improves when unresolved blockers are patched as a delta set and immediately re-reviewed.
- Critical specs benefit from closing with both rubric evidence and artifact inventory in one place.

### Prompt Refinements

- Closure prompts should always include a "remaining blockers" section even when none are expected.
- Final reviewer prompts must ask for exact blocking items, not only an overall grade.
