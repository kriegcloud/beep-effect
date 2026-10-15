# Practice KG MCP Strict Telemetry Tier

## Status

Lifecycle: `active`

Source: [`ops/manifest.json`](./ops/manifest.json)

## Mission

Shape-only telemetry for practice-kg-mcp on the attorney workstation: serializer gate, on-PC HMAC salt, encrypted spool, fail-closed tier, canary proof.

## Launch

Use this command for execution-capable sessions:

```text
/goal follow the instructions in goals/practice-kg-mcp-strict-tier/GOAL.md
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

P1 Gate — complete (2026-10-15). Next: P2 Spool + tier.

## Latest Evidence

P1: strict gate golden, per-rule, seam and boundary tests in
`@beep/observability`; canary acceptance test across all 11 tools in
`apps/practice-kg-mcp/test/Host.test.ts`. See `PLAN.md` execution notes.

## Notes

<Record high-signal constraints or resume notes that do not belong in the
normative spec.>
