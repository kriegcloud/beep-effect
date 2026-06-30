# Gov/Legal Data Driver Codegen

## Status

Lifecycle: `active`

Source: [`ops/manifest.json`](./ops/manifest.json)

Graduated from [`explorations/gov-legal-data-driver-codegen`](../../explorations/gov-legal-data-driver-codegen)
on 2026-06-29 (all 8 ALIGN questions resolved; see `SPEC.md` Decision Log).

## Mission

Stand up the gov/legal driver **substrate** — a tiered OpenAPI→Effect-Schema
codegen path plus one shared hand-authored auth/retry/cache/rate-limit transport
transformer — and prove it on two reference verticals: finish `@beep/govinfo`
(keyed) and build one keyless driver (eCFR or FedReg). CourtListener and DOL come
last, on the proven rails.

## Launch

Use this command for execution-capable sessions:

```text
/goal follow the instructions in goals/gov-legal-data-driver-codegen/GOAL.md
```

`GOAL.md` is the compact launcher. `SPEC.md` remains the normative contract.

## Read This First

1. [`GOAL.md`](./GOAL.md) - compact `/goal` launcher.
2. [`SPEC.md`](./SPEC.md) - normative source of truth (incl. the Q1–Q8 Decision Log).
3. [`PLAN.md`](./PLAN.md) - active execution plan (P0–P3).
4. [`ops/manifest.json`](./ops/manifest.json) - machine-readable routing.
5. [`research/`](./research/) - back-links to the source exploration's research.
6. [`history/`](./history/) - evidence and closeouts, if present.

## Current Phase

**P0 — govinfo-finish + transformer-incubate.** Next concrete action: repair
`packages/drivers/govinfo/package.json` (add `@beep/identity` + `@beep/schema`),
then add a hand-authored `Govinfo.service.ts` / `Govinfo.config.ts` on top of the
existing `Search` contract + value models and incubate the shared transformer via
`HttpApiClient.make`'s `transformClient`.

## Latest Evidence

Not started.

## Notes

- Do **not** restart `govinfo` — finish it (Q4).
- The shared transformer **incubates inside govinfo** and only promotes to
  `foundation/capability/<name>` once a 2nd driver imports it (Q6; the
  `07-non-slice-families` ≥2-consumer gate).
- P2 (CourtListener + DOL) is **gated** on a per-upstream data/source-terms matrix
  — default-deny until it exists (Q8).
- The `gov-legal-mcp` sibling server is a deferred follow-on goal, not v1 (Q3).
