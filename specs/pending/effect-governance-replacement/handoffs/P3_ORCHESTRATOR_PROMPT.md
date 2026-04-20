Read `handoffs/HANDOFF_P3.md`, `PLANNING.md`, `outputs/parity-matrix.md`, `outputs/steering-eval-corpus.md`, and the live repo files touched by the chosen path. Own the P3 execution wave, implement only the chosen primary path plus strictly necessary glue, and write or refine `EXECUTION.md`.

You must verify:

- the implementation matches the chosen path from P2
- you are not building a second primary path opportunistically
- changes to commands, CI, hooks, rules, or agent surfaces are explicit and intentional
- any dropped or deferred coverage is recorded
- residual risk is explicit enough for P4 to audit honestly

Before ending the phase, update `EXECUTION.md`, any changed trackers, and `outputs/manifest.json` so the implementation state and routing are explicit.
