## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/difference.const.ts` to replace probe-only behavior with executable, semantic examples.
- Kept the runtime inspection example, removed `probeNamedExportFunction`, and removed its stale import.
- Switched `effect/Array` import to alias style `import * as A from "effect/Array"` and updated module record wiring.
- Added two behavior-focused examples:
  - Source-aligned two-argument invocation of `A.difference`.
  - Curried invocation showing practical filtering and immutability of the input array.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/difference.const.ts`
- Outcome: Passed (exit code 0). All three examples completed successfully and logged expected results.

## Notes / residual risks
- Examples currently validate primitive/string behavior and overload usage only; they do not demonstrate custom equivalence (covered by `differenceWith`).
