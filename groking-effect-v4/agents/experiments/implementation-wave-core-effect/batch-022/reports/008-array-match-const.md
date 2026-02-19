## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/match.const.ts` to remove generic runtime probe examples.
- Replaced probe-style blocks with two executable, source-aligned `Array.match` examples:
  - Documented empty vs non-empty branch behavior.
  - Queue summarization flow showing branch selection on empty/non-empty arrays.
- Cleaned imports by removing unused inspection/probe helpers and switching to `import * as A from "effect/Array"`.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/match.const.ts`
- Outcome: Success (exit code 0). Both examples completed and logged expected branch outputs.

## Notes / residual risks
- `Array.match` behavior was validated through runtime examples in this playground file only.
- No additional test suite was executed beyond the required `bun run` command.
