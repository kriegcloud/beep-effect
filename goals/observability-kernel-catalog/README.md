# Observability Kernel and Instrumentation Catalog

## Status

Lifecycle: `completed-retained`

Source: [`ops/manifest.json`](./ops/manifest.json)

## Mission

Fix @beep/observability defects, split kernel from server wiring, and ship the instrumentation catalog (names, metrics, events, beep.* v2 registry, EmitterContext, TelemetryTier).

## Launch

Use this command for execution-capable sessions:

```text
/goal follow the instructions in goals/observability-kernel-catalog/GOAL.md
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

Complete (completed-retained, 2026-10-14).

## Latest Evidence

Shipped in four PRs: #1727 (P1 defects and the `OtlpSerialization` seam), #1762 (catalog kernel subpath, `beep observability catalog`, generated catalog and doctrine, counter and span-name migrations), #1796 (effect 4.0.4) and #1806 (agent-attribution keys, `layerCatalogEnrichment`, closeout). Reflection: [`history/reflections/2026-10-14-claude.md`](./history/reflections/2026-10-14-claude.md).

## Notes

- Follow-on goals consume the catalog: `goals/practice-kg-mcp-strict-tier` (serializer gate sharing `allowedAttributes`), `goals/harness-emitters-all-providers` (imports the `AiMetrics.instruments.ts` value domains), `goals/palantiri-parcels`.
- The 518 non-conforming harvested span names and 147 non-literal sites are reported inventory (`beep observability catalog`), not packet debt.
