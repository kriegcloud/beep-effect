# Iteration 5 Synthesis

## Inputs
- `reports/agent-array-make.md`
- `reports/agent-array-tail.md`
- `reports/agent-cause-stacktrace.md`
- `reports/agent-cause-interface.md`

## Cross-Agent Findings
- `value-like` guidance is now mostly stable; remaining asks are precision tweaks around type-vs-runtime contract notes.
- `function-like` still exposes a known weakness in generated files: required-arity exports can still show zero-arg failure as primary invocation.
- `class-like` key-marker flow is stable; main remaining request is explicit synthetic fixture disclaimer when using deterministic frame objects.
- `type-like` still needs stronger enforcement that source-aligned runtime companion API flows replace reflective-only examples.

## Improvements Applied After Iteration 5

### Prompt updates
- Updated `prompts/kinds/function-like.md`:
  - require at least one source-mirroring invocation when source example exists
- Updated `prompts/kinds/type-like.md`:
  - mark reflective-only strategies as insufficient when runtime companion flow exists
- Updated `prompts/shared/dry-run-overlay.md`:
  - require explicit source example coverage section

### Config updates
- Updated `configs/dry-run.worker.jsonc`:
  - `require_reflective_only_quality_risk_callout`
  - `require_source_example_coverage_section`
  - `require_source_mirroring_invocation_for_function_like_when_source_exists`
- Added `Source Example Coverage` to required report sections.

## Plan for Iteration 6
- Re-run the same 4 targets.
- Confirm reporting consistency with new source-coverage and reflective-risk requirements.
- Finalize prompt pack for next implementation wave.
