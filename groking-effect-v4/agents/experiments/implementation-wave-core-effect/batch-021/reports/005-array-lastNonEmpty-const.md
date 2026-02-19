## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/lastNonEmpty.const.ts` to replace probe-only examples with executable, semantics-focused examples.
- Switched `effect/Array` import to `import * as A from "effect/Array"` and removed the unused `probeNamedExportFunction` helper import.
- Kept the existing file shell/sections intact while adding:
  - a runtime inspection example with callable metadata,
  - a source-aligned invocation (`[1, 2, 3, 4] -> 4`),
  - a structured-input example (single-element and object arrays).

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/lastNonEmpty.const.ts`
- Outcome: success (exit code `0`); all three examples completed and logged expected last-element behavior.

## Notes / residual risks
- `lastNonEmpty` is type-constrained to non-empty arrays; this playground demonstrates valid non-empty inputs only and does not simulate invalid empty-input calls.
