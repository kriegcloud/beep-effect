## Changes made
- Replaced generic runtime probe content in `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/void.const.ts` with executable, semantic examples specific to `Option.void`.
- Updated the file header overview/JSDoc-example comment so it matches upstream `Option.void` docs.
- Updated metadata constants to match source semantics:
  - `sourceSummary` is now `A pre-built \`Some(undefined)\` constant.`
  - `sourceExample` now includes the upstream JSDoc usage snippet for `Option.void`.
- Switched `effect/Option` import to alias style (`import * as O from "effect/Option"`) and removed stale callable-probe helper import.
- Added behavior-focused examples:
  - Runtime inspection of the exported constant.
  - Source-aligned check that `Option.void` is `Some(undefined)`.
  - Comparison of constant identity/shape against `Option.asVoid(Option.some(123))`.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/void.const.ts`
- Outcome: Success (exit code `0`). All examples completed.

## Notes / residual risks
- `formatUnknown` uses JSON serialization, so `Some(undefined)` previews do not print a `value` field even when `value` is `undefined`; behavior was additionally confirmed with `Option.match` to avoid ambiguity.
