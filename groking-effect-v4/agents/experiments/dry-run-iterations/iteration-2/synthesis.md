# Iteration 2 Synthesis

## Inputs
- `reports/agent-array-make.md`
- `reports/agent-cause-stacktrace.md`

## Cross-Agent Findings
- Reports improved in semantic analysis quality after Iteration 1 prompt updates.
- Remaining gap: explicit hard-blocker status should be required as a separate section.
- Value-like callable guidance still needs stronger enforcement for documented invocation behavior.
- Class-like guidance needs explicit anti-pattern rule to prevent constructor-only examples for semantic-key exports.

## Improvements Applied After Iteration 2

### Prompt updates
- Updated `prompts/shared/dry-run-overlay.md`:
  - explicit `Hard blocker status` requirement (including explicit `none`)
- Updated `prompts/kinds/class-like.md`:
  - constructor-probe-only anti-pattern prohibition for semantic key exports
  - trigger phrase heuristic (`ServiceMap key`, `annotation`, `reference`)

### Config updates
- Expanded `configs/dry-run.worker.jsonc` with enforcement flags:
  - `require_documented_invocation_for_callable_value_like`
  - `disallow_zero_arg_probe_when_required_arity_detected`
  - `require_explicit_hard_blocker_status`
  - `require_alignment_contradiction_callout`
  - `require_domain_semantic_round_trip_for_key_markers`
  - `semantic_trigger_phrases`
  - `require_safe_lookup_for_optional_metadata`
- Added `Hard Blockers` to required report sections.

### Report template updates
- Updated `templates/agent-feedback-report.md` with `Hard Blockers` section.

## Plan for Iteration 3
- Re-run two dry-run agents on the same targets.
- Validate that reports explicitly include hard blocker status and stronger prompt/config delta specificity.
- Finalize a stable prompt-pack for real implementation agents.
