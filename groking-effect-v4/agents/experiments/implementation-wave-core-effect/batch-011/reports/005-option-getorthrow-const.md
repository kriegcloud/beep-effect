## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/getOrThrow.const.ts` to replace generic callable probing with executable, source-aligned examples for `Option.getOrThrow`.
- Kept the existing playground program shell and runtime inspection example.
- Added concrete behavior examples:
  - `getOrThrow(Option.some(1))` extraction.
  - `getOrThrow(Option.none())` failure mode with captured error message.
- Removed unused probe helper import and switched `effect/Option` import alias to `O` per prompt alias guidance.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/getOrThrow.const.ts`
- Outcome: Passed (exit code 0). All examples completed, including expected `None` throw behavior logging `getOrThrow called on a None`.

## Notes / residual risks
- Error output check is message-based; if upstream library changes the default error message text, the logged string will change accordingly.
