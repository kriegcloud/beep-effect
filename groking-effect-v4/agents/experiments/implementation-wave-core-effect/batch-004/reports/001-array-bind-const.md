## Changes made
- Replaced generic probe-only examples in `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/bind.const.ts` with executable, behavior-focused `Array.bind` examples.
- Kept the existing top-level playground structure and runtime shell (`createPlaygroundProgram` + `BunRuntime.runMain(program)`).
- Switched `effect/Array` import to alias style (`import * as A from "effect/Array"`) and removed now-unused probe helper import.
- Added source-aligned cartesian binding example (`Array.Do` + two `bind` calls) and a dependent binding example where callbacks use prior scope values.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/bind.const.ts`
- Outcome: Success (exit code 0). All three examples completed and logged expected bind behavior, including documented cartesian-product output.

## Notes / residual risks
- Logs validate runtime behavior and representative usage paths, but they are example-run outputs rather than assertion-based tests.
- `bind.length` is runtime metadata from the dual implementation and should be treated as informational only.
