## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/isNone.const.ts` to replace the generic callable probe with executable, behavior-focused examples for `Option.isNone`.
- Kept the existing program shell and runtime inspection block, and added:
  - A source-aligned example covering `O.isNone(O.some(1))` and `O.isNone(O.none())`.
  - A deterministic batch scenario showing how `isNone` identifies absent entries across multiple `Option` values.
- Removed unused probe helper import and adopted `import * as O from "effect/Option"` alias style.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/isNone.const.ts`
- Outcome: Failed in this environment with module resolution error:
  - `Cannot find module '@effect/platform-bun/BunContext' from '/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/runtime/Playground.ts'`

## Notes / residual risks
- Verification could not complete due to missing runtime dependency resolution for `@effect/platform-bun/BunContext` in the local environment.
- No files outside ownership were edited, aside from this required report artifact.
