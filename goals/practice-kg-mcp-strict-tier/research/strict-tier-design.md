# Strict-tier design (P0)

2026-10-15. Built from [`source-survey.md`](./source-survey.md) and
[`strict-tier-exporter.md`](../../../explorations/observability-palantiri/research/strict-tier-exporter.md).
Order: schema, then the `Context.Service` contract, then implementation.

## Placement

- **Kernel export `@beep/observability/strict`.** It imports only `./catalog`, `effect/observability/*`
  and `effect/http`, never `./server` or `@effect/opentelemetry`. A fourth boundary fixture
  (`test/fixtures/strict-safe.ts`) pins this.
- **`apps/practice-kg-mcp`** owns the tool-id domain, its instruments file, and the host wiring.
- **Handler failure reason.** `packages/law-practice/server` stamps a literal failure reason on the tool
  span, because `failureMode: "return"` leaves failed tools with Ok status. This is a scope extension
  (Decision Log).

## Schemas (`src/strict/StrictGate.schemas.ts`)

```text
GateRule      = span-name | span-attributes | span-events | span-links | span-status-message
              | span-ids | span-timestamps | resource | logs | metric-names | metric-attributes
              | metric-values
              (LiteralKit; one switch per rule, so the mutation table can turn each one off)
GateRules     = Record<GateRule, boolean>; the production value is all-on and is a constant.
ShapeOnlySpan = { name: ToolId, startWindow, endWindow, durationBucketMs, status: Ok|Error,
                  traceId/spanId/parentSpanId: HmacId, attributes: Record<ShapeOnlyKey, literal> }
ShapeOnlyResource = constants: service.name, service.version, beep.privacy_tier="shape-only", beep.key_epoch
RefusalLedger = HashMap<TelemetryRefusalTag, count>, drained into beep.telemetry.refused points
```

- **New `TelemetryRefusalTag` values in the kernel instruments:** `span-name-not-allowed`,
  `span-link-dropped`, `span-status-message-dropped`, `log-record-dropped`, `resource-rebuilt`,
  `metric-not-allowed`, `metric-attribute-not-allowed`, `egress-refused`.
- **Windows and buckets.** The export window is 5 minutes, and timestamps are floored to it.
  Durations fall into fixed buckets: 10, 50, 100, 250, 500 ms, 1 s, 2.5 s, 5 s, 10 s, and over 10 s.
- **Metric values.** Points are rebuilt from named fields, never spread. Each `asInt`, `asDouble`, histogram
  `count` and `bucketCounts` entry is floored onto a 1/2.5/5-per-decade ladder (0, 1, 2, 5, 10, 25, 50, 100,
  ...) that saturates at 10^12; histograms keep their static `explicitBounds` and drop `sum`, `min` and `max`
  (`metric-value-dropped`); exponential histograms and summaries are refused (`metric-not-allowed`). The
  `metric-values` gate rule switches this off for the mutation table. (Added after the P1 review, #1838.)
- **Ids.** Trace and span ids are `HMAC-SHA256(salt ‖ batchNonce, id)`, truncated to the OTLP width. The
  per-batch nonce makes ids unlinkable across batches. The salt is an injected service. P1 uses an
  in-memory salt; P2 brings the DPAPI-backed one.

## Contract (`src/strict/StrictGate.service.ts`)

- `StrictGate`: a `Context.Service` providing `serialization: OtlpSerialization` (three synchronous
  functions) and `ledger: Effect<RefusalLedger>`. It is built from `{ toolIds, catalog, rules, salt, clock }`.
- `StrictEgress`: the `HttpClient` that `Otlp.layer` uses. It byte-scans the body against the canary
  registry; in tests, a hit fails the test. In P1 it never sends: each export is counted as
  `egress-refused`, and the body is written to the P2 spool. The send path stays disabled until the
  fleet gateway goal lands, so install-runbook AC-5 (zero egress) remains true.
- `layerStrictOtlp(options)`: `Otlp.layer` with 5-minute intervals, `loggerMergeWithExisting: false`, a
  high `maxBatchSize`, no runtime metrics, and a constant resource, plus `StrictGate` and `StrictEgress`.
- **Fail-closed tier.** `effectiveTier(StrictDesktop, requested)` is always `shape-only`. An untagged or
  unresolvable context resolves to `StrictDesktop`. Env and flags can only lower the tier.

## Host (`apps/practice-kg-mcp/src/runtime/Telemetry.ts`)

- A shape-only stderr logger replaces every logger (`mergeWithExisting: false`) and pins `LogToStderr`.
  Its lines carry only a level, a tool id and a refusal tag, never a message body.
- `bin.ts` `Console.error` and the `runMain` error report are routed through it.

## Phases

- **P1 Gate:** schemas, `StrictGate`, `StrictEgress` (no send), the stderr logger and host wiring, the
  handler failure reason, the boundary fixture, the type-level seam pin, the golden key and refusal-tag
  snapshots, and the canary test across all 11 tools including failing paths and every encoding.
- **P2 Spool + tier:** an AES-GCM spool written after the gate, reusing the `ai-metrics` archive envelope;
  the DPAPI-wrapped key (`bun:ffi` `crypt32` with a PowerShell fallback); fail-closed tier resolution;
  replay never under a looser tier; and a bundle-graph check that `@effect/opentelemetry` is unreachable.
- **P3 Proof:** the mutation table over `GateRules`, the weekly privacy receipt (counts and key names), the
  operator-run DPAPI smoke command, and coarsened process CPU/RSS samples.
