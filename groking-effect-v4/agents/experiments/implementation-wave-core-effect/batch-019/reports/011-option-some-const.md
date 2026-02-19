## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/some.const.ts` to replace generic callable probing with executable `Option.some` behavior examples.
- Removed the stale `probeNamedExportFunction` import and added `formatUnknown` for readable value logs.
- Switched the Option import to alias style (`import * as O from "effect/Option"`) and updated `moduleRecord` accordingly.
- Kept the existing top-level structure and runtime shell, with three focused examples:
  - Runtime shape inspection for `some`
  - Source-aligned `O.some(1)` behavior
  - Additional present-value behavior (`null`, object payload, and composition with `O.map`)

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/some.const.ts`
- Outcome: Success (exit code 0). All three examples completed and the program ended with `Demo complete for effect/Option.some`.

## Notes / residual risks
- The examples are deterministic and align with the export summary/JSDoc intent.
- No residual runtime errors observed in the required verification run.
