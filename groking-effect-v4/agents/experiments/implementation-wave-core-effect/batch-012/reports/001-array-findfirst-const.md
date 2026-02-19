## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/findFirst.const.ts` only (owned export file).
- Preserved the playground program shell and runtime inspection example.
- Replaced the generic zero-arg callable probe with executable, source-aligned behavior examples:
  - Predicate-based invocation aligned to JSDoc (`A.findFirst([1,2,3,4,5], x => x > 3)`).
  - Option-mapping overload invocation showing both `Option.some` and `Option.none` outcomes.
- Removed stale probe helper import and added `effect/Option` usage to format Option outcomes clearly.
- Switched `effect/Array` import alias to `A` per alias style guidance.

## Verification command + outcome
- Command:
  - `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/findFirst.const.ts`
- Outcome:
  - Failed in this environment with:
    - `error: Cannot find module '@effect/platform-bun/BunContext' from '/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/runtime/Playground.ts'`

## Notes / residual risks
- The implementation itself is deterministic and source-aligned, but runtime verification is currently blocked by the missing `@effect/platform-bun/BunContext` module resolution in this workspace.
