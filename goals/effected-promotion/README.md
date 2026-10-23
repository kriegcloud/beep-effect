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

P1 Implement — waves 1a (#1956), 1b (#1981), 2a (#1988), 2b (#1992, #1994,
#2002), 2c (#2016, D-37) and 2d-1 (#2102, `@beep/markdown`, D-38..D-46)
merged. 2d-A (four adopter sites, D-47) merged in #2114. Wave 2d-2 (`@beep/md`
`Md.syntax`/`Md.parse`, D-48..D-51) merged in #2121; the evidence-gated 2d-3
writer fixes (D-52, `math` on by default) are in review. P0
research is complete:
see [`research/promotion-map-2026-10-20.md`](./research/promotion-map-2026-10-20.md),
[`research/wave-2b-plan-2026-10-21.md`](./research/wave-2b-plan-2026-10-21.md)
and [`research/wave-2d-plan-2026-10-22.md`](./research/wave-2d-plan-2026-10-22.md).

## Latest Evidence

- 2026-10-20 discovery workflow: 34-row package map (30 now, 4 deferred), 6
  waves, 312 deduplicated reuse sites (29 confirmed, 209 partial, 74 refuted),
  three scored `@beep/md` merge designs.
- Decisions D-01..D-46 are in [`SPEC.md`](./SPEC.md).

## Notes

- Port provenance: `scratchpad/EFFECTED_PORT_GOAL.md`, `scratchpad/effected/PORT_LEDGER.json`,
  and the per-module review reports archived under `history/port-reviews/`.
- Deferred modules stay in `scratchpad/effected` until their first consumer (D-05).
