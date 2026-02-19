# Iteration 1 Synthesis

## Inputs
- `reports/agent-array-make.md`
- `reports/agent-cause-stacktrace.md`

## Cross-Agent Findings
- Mechanical probes can be technically valid but pedagogically weak.
- Zero-arg invocation probing needs guardrails for parameter-sensitive APIs.
- Class examples need stronger semantic guidance when export is a key marker (`ServiceMap`-style usage).
- Feedback format should explicitly separate hard blockers from semantic risks.

## Improvements Applied After Iteration 1

### Prompt updates
- Updated `prompts/shared/base-system.md` to require summary/JSDoc behavior alignment and semantic quality emphasis.
- Updated `prompts/shared/dry-run-overlay.md` to require:
  - semantic risks section
  - behavior-alignment check
- Updated `prompts/kinds/value-like.md` with invocation policy:
  - zero-arg probing only when `function.length === 0` or semantically valid
  - prefer deterministic documented invocation otherwise
- Updated `prompts/kinds/class-like.md`:
  - add key-marker semantic round-trip requirement
  - emphasize deterministic domain-meaningful examples

### Config updates
- Updated `configs/dry-run.worker.jsonc` with:
  - `require_summary_behavior_alignment`
  - `require_semantic_risk_analysis`
  - required report section `Semantic Risks`

### Report template updates
- Updated `templates/agent-feedback-report.md` with:
  - `Semantic Risks`
  - `Behavior Alignment Check`

## Plan for Iteration 2
- Re-run two dry-run agents on same target files.
- Verify whether reports now include sharper semantic guidance and clearer prompt/config critiques.
