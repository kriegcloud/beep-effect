## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/bindTo.const.ts` to replace the generic callable probe with executable, semantics-focused `Option.bindTo` examples.
- Kept the runtime shell and top-level structure intact while adding:
  - A source-aligned do-notation example: `some(2) -> bindTo("x") -> bind("y") -> let("sum")`.
  - A short-circuit example showing `None` remains `None` and downstream `bind` callback is not invoked.
- Removed stale helper usage/import (`probeNamedExportFunction`) and added `formatUnknown` for concise output formatting.
- Switched Option import alias to `O` to match alias-style guidance.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/bindTo.const.ts`
- Outcome: Passed (exit code `0`). All three examples completed successfully, including expected `Some({ x: 2, y: 3, sum: 5 })` and `None` short-circuit behavior.

## Notes / residual risks
- The runtime inspection preview renders the current function wrapper shape, which may vary if upstream Effect internals change, but behavior examples remain deterministic.
