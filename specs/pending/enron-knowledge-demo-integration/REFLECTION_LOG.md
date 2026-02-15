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

- Enumerating exact RPC contracts up front clarified that extraction should use `Batch` RPC pathways rather than ad hoc extraction hooks.
- Building a current-vs-target matrix made the mock-removal scope concrete and reviewable.
- Locking deterministic scenario selection early reduced later UI ambiguity.

### What Didn't Work

- Assuming a full, reusable knowledge client SDK exists was incorrect; app-local Atom RPC wiring is likely required for this spec.
- Discovery artifacts initially under-specified retry/idempotency details for ingestion lifecycle behavior.

### Patterns Discovered

- Runtime RPC composition is already stable server-side; highest risk is client protocol alignment and state handling.
- Meeting prep quality and evidence-link integrity are separate axes and must be validated independently.

### Prompt Refinements

- Discovery prompts should explicitly ask whether domain RPC groups are fully implemented server-side.
- Include a mandatory protocol parity section (endpoint + serialization + org context propagation).

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
