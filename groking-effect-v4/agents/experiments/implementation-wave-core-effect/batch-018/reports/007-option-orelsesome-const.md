## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/orElseSome.const.ts` to replace the generic zero-arg callable probe with executable, source-aligned examples for `Option.orElseSome`.
- Switched the `effect/Option` import to `import * as O from "effect/Option"` (alias-style requirement).
- Added `formatUnknown` usage for concise behavior-focused output and removed now-unused probe helper import.
- Added two semantic behavior examples:
  - Documented fallback behavior (`none` gets fallback value, `some` preserves original value).
  - Fallback laziness (fallback thunk invoked only for `None`, with deterministic call counts).

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/orElseSome.const.ts`
- Outcome: Success (exit code `0`).
- Observed behavior matched intent:
  - `none()` produced `Some("b")`.
  - `some("a")` remained `Some("a")`.
  - Fallback thunk call count stayed `0` for `Some`, then incremented for each `None` case.

## Notes / residual risks
- No blocking issues found in this file.
- Runtime export count in inspection output may vary with upstream library version changes, but behavior examples are stable and deterministic.
