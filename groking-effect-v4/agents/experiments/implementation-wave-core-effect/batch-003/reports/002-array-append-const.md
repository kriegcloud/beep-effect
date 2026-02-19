## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/append.const.ts` to replace the generic callable probe example with executable, semantically aligned `append` examples.
- Kept runtime inspection and added two behavior-focused examples:
  - Source-aligned two-argument invocation: `append([1, 2, 3], 4)`.
  - Curried/data-last invocation against an iterable (`Set`): `append("!")(new Set(["a", "b"]))`.
- Removed stale helper import `probeNamedExportFunction` and adopted the requested array alias style (`import * as A from "effect/Array"`).

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/append.const.ts`
- Outcome: Success (exit code 0). All three examples completed, including documented and curried invocation behavior logs.

## Notes / residual risks
- Runtime inspection output includes the library-internal function preview, which may vary if upstream implementation internals change, but behavior examples are deterministic.
