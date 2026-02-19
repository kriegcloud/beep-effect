## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/join.const.ts` to replace generic callable probing with executable, semantically aligned `Array.join` examples.
- Kept runtime shape inspection, but made its log concise and behavior-focused.
- Added a source-aligned invocation example using `Array.join(["a", "b", "c"], "-")`.
- Added a curried/data-last + boundary example covering iterable input (`Set`), single-element array, and empty array behavior.
- Removed the now-unused `probeNamedExportFunction` import.
- Normalized `effect/Array` import alias to `A` per batch alias style guidance.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/join.const.ts`
- Outcome: Success (exit code `0`).
- Observed behavior:
  - `Array.join(["a", "b", "c"], "-") => a-b-c`
  - `Array.join("/")(Set("usr","local","bin")) => usr/local/bin`
  - `Array.join([], ",") => ""`

## Notes / residual risks
- Examples are deterministic and align with the export summary/JSDoc intent.
- No additional residual risks identified beyond normal upstream API-change risk in `effect/Array`.
