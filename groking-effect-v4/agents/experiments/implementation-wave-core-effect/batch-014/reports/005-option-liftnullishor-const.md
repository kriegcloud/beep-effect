## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/liftNullishOr.const.ts` to replace generic callable probing with executable, semantically aligned examples.
- Kept runtime inspection and added two concrete behavior examples:
  - Source-aligned numeric parsing lifted into `Option`.
  - `null`/`undefined` normalization into `None`.
- Switched `effect/Option` import to alias style `import * as O from "effect/Option"` and removed the unused probe helper import.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/liftNullishOr.const.ts`
- Outcome: Passed (exit code 0). All examples completed successfully.

## Notes / residual risks
- The examples validate documented runtime behavior for both successful and nullish-return paths.
- No additional cross-file checks were run, per ownership/task constraints.
