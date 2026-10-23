# Cache baseline review: @beep/markdown manifest regeneration (2026-10-23)

`bun run beep lint package-scripts --check` reported `packages/foundation/modeling/markdown/package.json` as drifting on main after #2157 (`doctest: missing-task`, `beep:doctest: missing-impl`), which reds Heavy / Lint Policy. `bun run beep lint package-scripts --write` regenerated the scripts block: it adds `doctest` and `beep:doctest` and re-orders the generated keys. No hand edits.

The manifest bytes are part of every task identity of the subject, so the regeneration drifts these tasks (configuration-drift): build, check, docgen, lint, lint:deprecated-apis, lint:jsdoc, lint:laws, test; and adds one new task, doctest (unreviewed-expansion). The task commands other than the new doctest pair are unchanged.

This request re-records the baseline for the `@beep/markdown` subject only. No qualification is granted.
