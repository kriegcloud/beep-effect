# Run the typecheck and build gates on tsc-rs

## Status

Lifecycle: `active`

Source: [`ops/manifest.json`](./ops/manifest.json)

## Mission

Move beep-effect's typecheck and build gates from the Effect-patched tsgo to tsc-rs (pingdotgg/ts-rust), keeping @effect/tsgo for editors; measured 3.7x faster at half the peak RSS with identical diagnostics on 2026-10-13.

## Launch

Use this command for execution-capable sessions:

```text
/goal follow the instructions in goals/tsc-rs-gates/GOAL.md
```

`GOAL.md` is the compact launcher. `SPEC.md` remains the normative contract.

## Read This First

1. [`GOAL.md`](./GOAL.md) - compact `/goal` launcher.
2. [`SPEC.md`](./SPEC.md) - normative source of truth.
3. [`PLAN.md`](./PLAN.md) - active execution plan.
4. [`ops/manifest.json`](./ops/manifest.json) - machine-readable routing.
5. [`research/`](./research/) - supporting research, if present.
6. [`history/`](./history/) - evidence and closeouts, if present.

## Current Phase

P0 Research — complete. P1 Implement — in progress (the tsc-rs swap of the generated script defaults).

## Latest Evidence

- `research/measurements-2026-10-13.md`: tsc-rs 0.6.0 vs tsgo, 3.7× geomean faster on the check projects at half the peak RSS, identical diagnostics on 283 of 284 projects.
- The eleven upstream TypeScript 7.1-dev diagnostics (10 TS7031, 1 TS5088) are fixed in `@beep/repo-cli` and `@beep/utils` and verified green under tsgo 0.51.1, tsc-rs 0.6.0 and stock `typescript@7.1.0-dev.20261008.1`.

## Notes

- `@effect/tsgo` and `tsc-rs` must move together: tsc-rs compiles a fixed Effect rule set in, and 0.51.1 fails the `tsgo-rules` gate on unknown severity keys, so 0.52 rules cannot be pre-registered.
- `--fast` must follow `-b`; a wrapper that prepends it breaks `tsc-rs -b`. Failure exit code is 2.
