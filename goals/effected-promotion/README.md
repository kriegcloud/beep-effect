# Effected kit promotion

## Status

Lifecycle: `active`

Source: [`ops/manifest.json`](./ops/manifest.json)

## Mission

Promote the ported `scratchpad/effected` kit into dedicated `@beep/*` packages
placed per `standards/ARCHITECTURE.md`, then retire the one-off modules,
tooling and third-party dependencies they replace, ending the repo's
dependence on the upstream `@effected/*` maintainer.

## Launch

Use this command for execution-capable sessions:

```text
/goal follow the instructions in goals/effected-promotion/GOAL.md
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

P1 Implement — waves 1a (#1956) and 1b (#1981) merged; wave 2a (`@beep/npm-spec`,
`@beep/tsconfig`) is in review as #1988. Wave 2b ships as three PRs (D-31): 2b-1
(`@beep/walker` with its repo-utils and repo-cli adopters, D-32) is at zero
in-package findings on a local stack over 2a; 2b-2 (`@beep/github`), 2b-3
(`@beep/runtime-env`) and the 2c glob adoption follow. P0 research is complete:
see [`research/promotion-map-2026-10-20.md`](./research/promotion-map-2026-10-20.md)
and [`research/wave-2b-plan-2026-10-21.md`](./research/wave-2b-plan-2026-10-21.md).

## Latest Evidence

- 2026-10-20 discovery workflow: 34-row package map (30 now, 4 deferred), 6
  waves, 312 deduplicated reuse sites (29 confirmed, 209 partial, 74 refuted),
  three scored `@beep/md` merge designs.
- Decisions D-01..D-18 are in [`SPEC.md`](./SPEC.md).

## Notes

- Port provenance: `scratchpad/EFFECTED_PORT_GOAL.md`, `scratchpad/effected/PORT_LEDGER.json`,
  and the per-module review reports archived under `history/port-reviews/`.
- Deferred modules stay in `scratchpad/effected` until their first consumer (D-05).
