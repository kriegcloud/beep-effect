# Practice KG MCP Strict Telemetry Tier

## Status

Lifecycle: `completed-retained`

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

Closed 2026-10-20 (`completed-retained`). All six acceptance criteria are met;
the DPAPI smoke (acceptance #4) passed on `tom-pc-1` with `keyPath: dpapi-ffi`.
The strict-tier host (0.5.0) is installed on the PC (#1933, #1948); a
chat tool call against it is recorded in
[`history/2026-10-21-pc-chat-tool-call.md`](./history/2026-10-21-pc-chat-tool-call.md). Reflection:
[`history/reflections/2026-10-20-claude.md`](./history/reflections/2026-10-20-claude.md).

## Latest Evidence

P1: strict gate golden, per-rule, seam and boundary tests in
`@beep/observability`; canary acceptance test across all 11 tools in
`apps/practice-kg-mcp/test/Host.test.ts`. P2: spool round-trip, tamper,
looser-tier, epoch, eviction and permission tests
(`packages/foundation/capability/observability/test/StrictSpool.test.ts`), the
341-case tier resolver table (`test/StrictTier.test.ts`), DPAPI key wrap and
rotation through injected ports, the PowerShell stdin path, the bundle-graph
check and the spooled canary (`apps/practice-kg-mcp/test/TelemetryKey.test.ts`,
`test/Host.test.ts`). P3: the kernel and host mutation tables (one red test
per gate rule, `test/StrictGate.test.ts`, `apps/practice-kg-mcp/test/Host.test.ts`),
the privacy receipt golden and end-to-end tests
(`apps/practice-kg-mcp/test/PrivacyReceipt.test.ts`) and the process-metrics
TestClock tests (`test/ProcessMetrics.test.ts`). See `PLAN.md` execution notes.

## Notes

<Record high-signal constraints or resume notes that do not belong in the
normative spec.>
