## Changes made
- Replaced generic runtime inspection and zero-arg probe examples in `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/annotations.const.ts` with two executable, semantics-focused `Cause.annotations` demos.
- Added a merge example showing annotations contributed by different reasons are visible in the merged `ServiceMap`.
- Added a key-collision example showing that when keys collide, the later reason's annotation value is returned.
- Removed stale probe/inspection helpers and added `effect/ServiceMap` import used by the new examples.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/annotations.const.ts`
- Outcome: Success (exit code 0). Both examples completed and logged expected merged values (`source=read-through-cache, attempt=3` and collision resolution `resolved source=storage`).

## Notes / residual risks
- `Cause.annotations` returns `ServiceMap<never>` at the type level, so reads in the example intentionally use `ServiceMap.getOrElse` (runtime-safe) rather than strongly-typed `ServiceMap.get`.
- The example demonstrates observable merge behavior but does not assert against upstream internals; behavior depends on current Effect implementation contract.
