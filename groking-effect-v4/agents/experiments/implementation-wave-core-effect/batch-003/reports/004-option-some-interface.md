## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/Some.interface.ts` while preserving the top-level program shell and import contract.
- Switched the `effect/Option` module alias to `O` to match project alias style.
- Kept the type-erasure check and made the log explicit that `Some` is compile-time only.
- Replaced generic module inspection of the erased symbol with companion export inspection of runtime `some`.
- Added a concrete companion API flow that demonstrates presence semantics via `some`, `none`, `map`, `isSome`, and `match`.
- Updated example titles/descriptions to be behavior-focused instead of probe-only.

## Verification command + outcome
- Command:
  - `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/Some.interface.ts`
- Outcome:
  - Exit code `0` (success).
  - All three examples completed, including the new runtime companion flow:
    - `isSome(presentCount): true`
    - `match(Some): Count: 4`
    - `match(None): No count available.`

## Notes / residual risks
- `Some` is an interface and therefore erased at runtime; behavior is intentionally demonstrated via companion `Option` APIs.
- No additional lint/typecheck suite was run beyond the required `bun run` verification command.
