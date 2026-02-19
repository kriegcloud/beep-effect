# Iteration 6 Synthesis

## Inputs
- `reports/agent-array-make.md`
- `reports/agent-array-tail.md`
- `reports/agent-cause-stacktrace.md`
- `reports/agent-cause-interface.md`

## Cross-Agent Findings
- `value-like`: semantically strong overall; remaining risk is insufficient explicit boundary messaging for variadic runtime permissiveness.
- `function-like`: still confirms need for hard enforcement against zero-arg primary probes on required-arity exports.
- `class-like`: semantic round-trip is stable; explicit synthetic fixture disclaimer should be made standard when handcrafted metadata is used.
- `type-like`: reflective-only drift remains the main quality risk when source runnable companion APIs exist.

## Final Improvements Applied After Iteration 6

### Prompt updates
- Updated `prompts/kinds/value-like.md`:
  - prohibit relying only on `function.length` for variadic/rest signatures.
- Updated `prompts/kinds/class-like.md`:
  - require explicit synthetic fixture disclosure for deterministic metadata fixtures.

### Config updates
- Updated `configs/dry-run.worker.jsonc` with final gates:
  - `require_contract_boundary_observation_for_variadic_callable`
  - `disallow_zero_arg_probe_based_only_on_function_length`
  - `require_synthetic_fixture_disclaimer_when_marker_fixture_used`
  - `require_explicit_failure_only_risk_callout`
  - `fail_when_type_like_source_example_not_executed`

## Final Assessment
Additional dry runs converged the prompt pack and config set around the remaining weak spots:
- source-example coverage enforcement,
- reflective-only risk callouts,
- function required-arity behavior rules,
- class fixture transparency.

The system is now ready for broader implementation deployment across core `effect` exports.
