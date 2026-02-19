## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/liftNullishOr.const.ts` with executable, semantically aligned examples for `Array.liftNullishOr`.
- Replaced the generic callable zero-arg probe with two behavior-focused examples: a source-aligned numeric parser lift and a multi-argument domain lift showing `null`/`undefined` normalization.
- Kept runtime inspection, preserved the top-level program shell, removed the unused probe helper import, and switched the `effect/Array` import alias to `A` per batch alias style.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/liftNullishOr.const.ts`
- Outcome: Passed (exit code 0). All three examples completed successfully.

## Notes / residual risks
- The vendored source path in the generated header was not present locally, so implementation alignment was validated against the in-repo surface contract and runtime preview output.
- Behavior is deterministic for provided inputs; no environment-dependent branches were introduced.
