## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/intersperse.const.ts` to replace probe-only behavior with executable, semantics-focused examples.
- Switched the `effect/Array` import to alias style (`import * as A from "effect/Array"`) and removed the stale `probeNamedExportFunction` import.
- Kept the program shell and runtime inspection example, then added:
  - A source-aligned invocation example using `Array.intersperse([1, 2, 3], 0)`.
  - A curried iterable/boundary example showing `A.intersperse("|")` with a `Set`, plus single-item and empty-input behavior.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/intersperse.const.ts`
- Outcome: Passed (exit code `0`). All three examples executed successfully and produced expected intersperse outputs.

## Notes / residual risks
- The examples validate runtime behavior for common and boundary inputs; no additional risks observed in this isolated export playground file.
