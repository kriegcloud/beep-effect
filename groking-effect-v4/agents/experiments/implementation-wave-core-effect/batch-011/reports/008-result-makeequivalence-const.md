## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Result/exports/makeEquivalence.const.ts` to replace probe-only behavior with executable, semantically aligned examples.
- Removed the zero-argument callable probe and added:
  - A source-aligned strict-equivalence example using `Result.makeEquivalence(Equivalence.strictEqual<number>(), Equivalence.strictEqual<string>())`.
  - A custom equivalence example showing separate success/failure comparison rules and cross-variant behavior.
- Kept the runtime shell and top-level program structure intact.
- Cleaned imports by removing the unused probe helper and adding `effect/Equivalence` for documented invocation.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Result/exports/makeEquivalence.const.ts`
- Outcome: Passed (exit code 0). All examples completed successfully.

## Notes / residual risks
- `makeEquivalence` behavior demonstrated here is deterministic and aligned with the JSDoc contract.
- No additional residual risks identified beyond normal upstream API behavior changes.
