# Iteration 4 Synthesis

## Inputs
- `reports/agent-array-make.md`
- `reports/agent-array-tail.md`
- `reports/agent-cause-stacktrace.md`
- `reports/agent-cause-interface.md`

## Cross-Agent Findings
- `value-like`: major improvements landed; remaining gap is explicit type-vs-runtime failure-mode note.
- `function-like`: zero-arg probing still leaks into required-arity functions and should be hard-blocked.
- `class-like`: semantic round-trip path is now good; minor clarity gap around synthetic fixture disclaimer.
- `type-like`: reflective-only examples are still too weak when source docs provide runnable runtime helpers.

## Improvements Applied After Iteration 4

### Prompt updates
- Updated `prompts/kinds/function-like.md`:
  - required-arity rule and anti-zero-arg-primary rule
  - boundary-case expectation when docs show multiple outcomes
- Updated `prompts/kinds/type-like.md`:
  - require runtime companion API example when source docs are runnable
  - disallow undefined-lookup-only behavioral example
  - require explicit compile-time vs runtime bridge note
- Updated `prompts/shared/base-system.md`:
  - require at least one source-aligned behavior when source JSDoc includes runnable examples

### Config updates
- Updated `configs/dry-run.worker.jsonc` with new gates:
  - `require_documented_invocation_for_function_like`
  - `fail_if_invocation_example_only_shows_failure`
  - `require_documented_invocation_for_type_like_when_source_example_present`
  - `disallow_undefined_lookup_as_primary_context_example`
  - `require_runtime_companion_bridge_note_for_type_like`

### Report template updates
- Updated `templates/agent-feedback-report.md` with `Source Example Coverage` section.

## Plan for Iteration 5
- Re-run same 4 targets to test whether prompt/config changes now reduce function-like and type-like ambiguity.
