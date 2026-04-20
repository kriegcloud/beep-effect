# P3 Handoff

## Goal

Implement the chosen primary path from P2: `full retirement` of the remaining Effect-lane ESLint surface with a docs-only ESLint split, an engine-neutral native-runtime rewrite, and late deletion of the legacy lane.

## Required Reads

- `PLANNING.md`
- `outputs/legacy-surface-inventory.md`
- `outputs/removal-matrix.md`
- `outputs/dependency-cut-map.md`
- `outputs/candidate-scorecard.md`

## Must Produce

- `EXECUTION.md`
- command, config, docs, and dependency evidence for the chosen path

## Must Answer

- how the docs lane was split away from the legacy mixed `ESLintConfig`
- how `NoNativeRuntime.ts` stopped depending on `eslint/Linter`, or why fallback `B` was triggered instead
- what legacy scripts, rule modules, tests, and trust surfaces were removed or retained
- what `tooling/cli` and `tooling/configs` dependency changes were made
- what residual risks remain for P4

## Stop Conditions

- stop if execution requires reopening whether `lint:effect-governance` is authoritative
- stop if a second primary path starts to emerge
- stop if the native-runtime rewrite would force a broad repo-wide ESLint redesign instead of the bounded cut chosen in P2
- route strategic surprises back to P2 explicitly
