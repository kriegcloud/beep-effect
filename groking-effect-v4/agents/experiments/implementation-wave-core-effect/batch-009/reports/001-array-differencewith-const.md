## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/differenceWith.const.ts` to replace generic callable probing with executable `differenceWith` examples.
- Kept runtime inspection and added two behavior-focused examples:
  - Source-aligned numeric equality usage.
  - Custom object equivalence by `id`, demonstrating both curried and two-argument forms.
- Switched `effect/Array` import alias to `A` and removed the unused probe helper import.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/differenceWith.const.ts`
- Outcome: Passed (exit code 0). All three examples completed successfully.

## Notes / residual risks
- The examples are deterministic and aligned with current local `effect/Array` behavior.
- Residual risk is low and mostly limited to potential upstream API/signature changes in future `effect` releases.
