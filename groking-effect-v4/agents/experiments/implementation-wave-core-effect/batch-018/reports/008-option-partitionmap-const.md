## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/partitionMap.const.ts` to replace generic callable probing with executable, semantically aligned `Option.partitionMap` examples.
- Switched the `effect/Option` import to `import * as O from "effect/Option"` (alias-style requirement) and added `effect/Result` for source-aligned mapping behavior.
- Removed the stale `probeNamedExportFunction` helper import and added concise formatting helpers for partitioned `Option` output.
- Added behavior-focused examples covering:
  - Source-aligned partitioning of `Some("42")` and `Some("abc")` via `Result.succeed` / `Result.fail`.
  - `None` short-circuit semantics, including deterministic proof that the mapper is not invoked.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/partitionMap.const.ts`
- Outcome: Success (exit code `0`).
- Observed behavior matched intent:
  - Valid input routed to success lane: `[failures: None, successes: Some(42)]`.
  - Invalid input routed to failure lane: `[failures: Some(Not a number), successes: None]`.
  - `None` produced `[failures: None, successes: None]` with `mapper calls: 0`.

## Notes / residual risks
- No blocking issues in the owned file.
- Runtime inspection metadata such as module export count may vary with upstream Effect version changes, but semantic examples are deterministic.
