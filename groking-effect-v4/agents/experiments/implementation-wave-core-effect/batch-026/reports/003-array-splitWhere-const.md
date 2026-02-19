## Changes made
- Replaced probe-only examples in `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/splitWhere.const.ts` with executable, behavior-focused `splitWhere` demonstrations.
- Switched the module import alias to `import * as A from "effect/Array"` to match alias guidance.
- Removed stale runtime inspection/probe helpers and related `moduleRecord` scaffolding.
- Added two semantic examples:
  - Source-aligned predicate split showing boundary inclusion in the second segment.
  - Curried index-aware predicate plus a no-match case showing an empty second segment.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/splitWhere.const.ts`
- Outcome: Passed (exit code `0`).
- Observed key outputs:
  - `splitWhere([1, 2, 3, 4, 5], n > 3) -> [[1,2,3],[4,5]]`
  - `splitWhere(index === 2)(["warmup","check","deploy","verify"]) -> [["warmup","check"],["deploy","verify"]]`
  - `splitWhere(["alpha","beta","gamma"], label === "missing") -> [["alpha","beta","gamma"],[]]`

## Notes / residual risks
- Examples are deterministic and align with current `effect/Array.splitWhere` behavior and docs.
- No additional automated lint/type/test suite was run beyond the required `bun run` verification for this file.
