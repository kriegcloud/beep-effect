## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/None.interface.ts` example blocks to replace generic reflection-only flow with executable `None`-aligned runtime behavior.
- Kept file shell/import structure intact and retained type-erasure coverage.
- Added a runtime companion bridge by inspecting `Option.none` and a concrete behavior flow using `Option.none`, `Option.some`, `Option.match`, and `Option.isNone`.
- Updated example metadata (titles/descriptions) to match the new behavior-focused examples.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/None.interface.ts`
- Outcome: Passed (exit code `0`).
- Key output signals:
  - `"None" visible at runtime: no`
  - Runtime companion `none` export detected as function.
  - Behavior flow output:
    - `isNone(absentUser): true`
    - `match(None): No user available.`
    - `match(Some): User: Ava`

## Notes / residual risks
- This change is scoped to the owned file only; other type-like export playground files may still use generic reflective examples.
- Behavior relies on current `effect/Option` runtime API signatures (`none`, `some`, `match`, `isNone`) remaining stable.
