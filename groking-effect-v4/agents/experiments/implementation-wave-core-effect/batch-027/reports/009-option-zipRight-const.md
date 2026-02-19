## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/zipRight.const.ts` to replace generic probe-only behavior with executable `Option.zipRight` examples.
- Kept the runtime inspection example and added two source-aligned semantic examples:
  - `zipRight(Some(1), Some("hello")) => Some("hello")`
  - `None` short-circuit behavior when either input is `None`.
- Removed stale `probeNamedExportFunction` import and switched `effect/Option` import to alias style `import * as O from "effect/Option"`.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/zipRight.const.ts`
- Outcome: Passed (exit code `0`).
- Verified examples executed successfully, including right-value preservation and `None` short-circuit semantics.

## Notes / residual risks
- No functional blockers observed for this export file.
- Residual risk is limited to upstream API behavior changes in `effect/Option`; current examples match the runtime behavior shown by the required verification run.
