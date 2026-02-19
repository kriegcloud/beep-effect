## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/flatMapNullishOr.const.ts` to replace the generic callable probe with executable, semantics-focused examples for `Array.flatMapNullishOr`.
- Kept the top-level playground program shell and runtime inspection example, and added:
  - A source-aligned invocation mirroring the JSDoc behavior (`[1, 2, 3]` with `null` for evens).
  - A deterministic `Map.get` example showing both data-first and data-last call styles with `undefined` filtered out.
- Removed stale probe helper usage/import and aligned the `effect/Array` import alias to `A`.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/flatMapNullishOr.const.ts`
- Outcome: Success (exit code 0). All three examples completed, including source-aligned and data-first/data-last map lookup outputs.

## Notes / residual risks
- The examples assume the current `effect/Array` overload behavior for `flatMapNullishOr` (both data-first and data-last forms). If upstream signatures change, this file may need updates.
