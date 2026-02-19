## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/fromRecord.const.ts` to replace generic callable probing with executable, source-aligned examples.
- Switched the Array module import to the required alias style: `import * as A from "effect/Array"`.
- Kept runtime inspection and added two behavior-focused examples:
  - Documented invocation: `A.fromRecord({ a: 1, b: 2, c: 3 })`.
  - Own-enumerable behavior: inherited and non-enumerable properties are excluded.
- Removed stale helper usage/import for `probeNamedExportFunction`.

## Verification command + outcome
- Command:
  - `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/fromRecord.const.ts`
- Outcome:
  - Exit code `0`.
  - All three examples completed successfully.
  - Logged results include:
    - `[["a",1],["b",2],["c",3]]` for the source-aligned call.
    - `[["visible",1]]` for own-enumerable-key behavior.

## Notes / residual risks
- The property-selection behavior example reflects JavaScript own-enumerable key semantics at runtime.
- Upstream source path referenced in file comments was not present locally, so source alignment was based on embedded JSDoc and observed runtime behavior.
