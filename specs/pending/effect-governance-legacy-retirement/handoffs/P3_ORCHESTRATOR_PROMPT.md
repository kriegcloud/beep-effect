Read `handoffs/HANDOFF_P3.md`, `PLANNING.md`, `outputs/legacy-surface-inventory.md`, `outputs/removal-matrix.md`, `outputs/dependency-cut-map.md`, and `outputs/candidate-scorecard.md`. Implement only the chosen primary path plus strictly necessary glue, then record the work in `EXECUTION.md`.

You are implementing option `A` unless a real fallback trigger from `PLANNING.md` is hit:

- split the docs lane away from the mixed `ESLintConfig`
- rewrite `tooling/cli/src/commands/Laws/NoNativeRuntime.ts` so the live Effect-lane path no longer depends on `eslint/Linter`
- remove the root legacy `lint:effect-laws` lane and the leftover rule corpus only after the replacement path is proven
- update stale docs and trust surfaces that still advertise the old lane

You must verify:

- `lint:jsdoc` still has an explicit docs-only ESLint path
- the active Effect-lane path no longer depends on the legacy engine runtime, unless fallback `B` is explicitly invoked
- deletions happen late enough that execution does not become needlessly fragile
- any retained allowlist or hotspot surfaces are clearly justified as governance data rather than legacy runtime debt
- residual risks and any fallback posture are explicit enough for P4 to audit honestly

Before ending the phase, update `EXECUTION.md`, any changed trackers, and `outputs/manifest.json` so the implementation state and routing are explicit.
