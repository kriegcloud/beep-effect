## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/getSomes.const.ts` to replace probe-only behavior with executable, semantics-focused examples for `Array.getSomes`.
- Switched `effect/Array` import alias to `A` and added `effect/Option` alias as `O` per alias requirements.
- Removed stale `probeNamedExportFunction` usage/import and added two source-aligned runtime examples:
  - Documented `Option.some`/`Option.none` mixed input case.
  - Iterable (`Set`) input plus all-`None` empty-output edge case.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/getSomes.const.ts`
- Outcome: Passed (exit code `0`), all three examples completed successfully.

## Notes / residual risks
- Output formatting uses `JSON.stringify`, so arrays print compactly (e.g. `[1,2]`), which is expected.
- This task only updates the owned export file; related `getSomes` exports in other modules remain unchanged.
