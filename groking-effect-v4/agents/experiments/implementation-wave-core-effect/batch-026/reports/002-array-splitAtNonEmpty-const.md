## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/splitAtNonEmpty.const.ts` to replace generic runtime inspection/probe-only examples with executable behavior-focused examples.
- Switched `effect/Array` import to alias style: `import * as A from "effect/Array"`.
- Removed stale probe/inspection helpers and unused module-record value.
- Added three deterministic examples:
  - Source-aligned split at index `3`.
  - Clamp + floor behavior (`n = 0` and `n = 2.9`).
  - Curried invocation with oversized index and copy-behavior check.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/splitAtNonEmpty.const.ts`
- Outcome: Passed (exit code `0`). All three examples completed successfully and produced expected split results.

## Notes / residual risks
- Examples assume typed non-empty inputs; they do not demonstrate invalid empty-array runtime calls.
- Behavior shown is aligned to current source implementation (`Math.max(1, Math.floor(n))` and copy-on-oversized index).
