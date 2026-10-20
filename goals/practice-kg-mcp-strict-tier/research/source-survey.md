# P0 source survey: practice-kg-mcp strict tier

Date: 2026-10-15. Branch `feat/practice-kg-mcp-strict-tier` off main `91b585e425`.
Effect installed: 4.0.4 (`node_modules/effect/src`, cited as `EFX/`). Bun 1.4.2.
Inputs: `SPEC.md`, `explorations/observability-palantiri/research/strict-tier-exporter.md` (the
"strict-tier note"), `explorations/observability-palantiri/DECISIONS.md` (D2, D3, align round 1
"What does shape-only mean", "Tier tags — invert"), `goals/observability-kernel-catalog/research/p2b-design.md`.

Correction to the strict-tier note: it cites `@beep/observability` calling `Otlp.layerProtobuf`.
Since #1727 it calls `Otlp.layer` with an injectable serializer (§2.1).

## 1. `apps/practice-kg-mcp`

### Layout
- `src/bin.ts` (stdio host CLI), `src/entrypoint.ts` (BunRuntime boundary), `src/package.ts` (.mcpb lane),
  `src/smoke.ts` (compiled smoke + fixture bundle), `src/build.ts`/`claims.ts`/`verify.ts` (workstation-only,
  excluded from the archive), `src/Version.ts` (`PRACTICE_KG_EXTENSION_VERSION`),
  `src/runtime/{Host,Layer,Pglite,DuckDb,SelfCheck}.ts`, tests in `test/`.
- Deps: no `@beep/observability`, no direct `@beep/mcp-kit` (reached transitively via
  `@beep/law-practice-server`).

### Build and start
- `src/bin.ts` `serve`: resolve the bundle (flags, then `PRACTICE_KG_BUNDLE_DIR`/`BUNDLE_DIR`),
  self-check, load context, `Layer.launch(makePracticeKgHostLayer(context))`.
- `src/entrypoint.ts` `runEntrypoint`: `BunServices.layer` + `BunRuntime.runMain(main)`.
- `src/runtime/Host.ts` `makePracticeKgHostLayer` → `makePracticeKgServerLayer`
  (`packages/law-practice/server/src/Tools.ts`) = `PracticeKgToolkitLayer` over
  `McpServer.layerStdio({ protocols: handshakeMcpProtocols })`. Transport: stdio only; the host is
  Claude Desktop.
- Toolkit registration: `sanitizedToolkit(PracticeKgToolkit)` from `@beep/mcp-kit` (§3).

### Logger / stderr today
- No `Logger.layer` and no `Logger.LogToStderr` anywhere in the app or the server package.
- Effect's default logger writes with `console.error` only when `LogToStderr` is true, otherwise
  `console.log` (`EFX/internal/effect.ts`). `McpServer.layerStdio` does not set it. So any `Effect.log*`
  reaching the default logger during `serve` writes to **stdout, the protocol channel**.
- Direct stderr writes: `src/bin.ts` `Console.error(error.message)`; the `PracticeKgHostError` messages in
  `src/runtime/Host.ts` interpolate bundle and manifest paths, and Claude Desktop persists them.
- `runMain` reports unreported failures via `Effect.logError(cause)` (`EFX/Runtime.ts`), the same default
  logger; stack traces contain Windows profile paths.

### Telemetry / OTLP
- None. No OTLP, tracer or metrics layer in `apps/practice-kg-mcp` or `packages/law-practice/server/src`.
- Spans are still created by Effect's native tracer (unexported): `PracticeKgTools.<tool>` via `Effect.fn`
  in `packages/law-practice/server/src/PracticeKg.tool-handlers.ts`; `PracticeKgHost.loadBundle`;
  `PracticeKgSelfCheck.*`; `PracticeKg.lookupMatters`/`lookupCorrespondents`/`readEmail*`; `McpKit.handle`
  and `mcp.tool.call.<tool>` (§3); `McpServer.<method>` RPC spans; DuckDB `db.query`/`db.export`/
  `db.transaction` (`packages/drivers/duckdb/src/DuckDb.service.ts`); Effect SQL statement spans carrying
  `db.query.text` (`EFX/sql/Statement.ts`).

### Tool handlers (the span-name / `tool_id` allowlist source)
`PracticeKgToolkit` = `packages/law-practice/use-cases/src/Tools.ts`; tools are declared through `readTool`
in `packages/law-practice/use-cases/src/PracticeKg.tools.ts` with `failureMode: "return"`. The eleven tools:
`kg_clients`, `kg_docket_family`, `kg_application_lookup`, `kg_find`, `corpus_search_text`,
`corpus_get_document`, `email_search`, `kg_candidate_claims`, `kg_matter_lookup`,
`kg_correspondent_lookup`, `kg_provenance`. Handlers are in `PracticeKg.tool-handlers.ts`.

- Derive the enum from `R.keys(PracticeKgToolkit.tools)`, as packaging already does (`src/package.ts`;
  `ManifestToolDescriptions` is a compile-checked record keyed by tool name). Pin with a test that the
  LiteralKit equals the toolkit keys.
- Error class source: `PracticeKgToolError` with `reason: PracticeKgToolFailureReason =
  "store-query-failed" | "row-decode-failed" | "invalid-input"`. `message` is free text and must never be
  projected. Because of `failureMode: "return"`, a failing tool **does not fail its span** (exit is
  Success), so the gate cannot read an error tag from span status (Gaps 1).

### Packaging / shipping to the attorney PC
- `src/package.ts`: `bun build --compile --target=bun-windows-x64 apps/practice-kg-mcp/src/bin.ts`, a
  SHA-512-checked DuckDB win32 native sidecar, `manifest.json` from `manifestFor` (`server.type: "binary"`,
  env `BUNDLE_DIR`, `NODE_PATH`, `PRACTICE_KG_CORPUS_ROOT`), zipped to
  `apps/practice-kg-mcp/dist/mcpb/practice-kg-mcp-windows-x64.mcpb`, with archive allowlist `assertArchive`
  and `ForbiddenArchiveFragments`.
- Scripts: `package:mcpb`, `package:mcpb:linux`, `smoke:compiled`.
- Runbook: `goals/practice-kg-mcp/research/install-runbook.md`. Claude Desktop's extension storage for the
  Microsoft Store build is virtualised under
  `%LOCALAPPDATA%\Packages\Claude_<id>\LocalCache\Roaming\Claude`. **AC-5 zero egress**: "Any connection
  attempt from `practice-kg-mcp` fails AC-5."
- Static-check hook for "no `@effect/opentelemetry` in the bundle": extend `ForbiddenArchiveFragments`/
  `assertArchive`, or add a bundle-graph check after `bun build` (the compiled exe is opaque to `unzip -Z1`).

## 2. `@beep/observability` (`packages/foundation/capability/observability`)

### 2.1 The `OtlpSerialization` seam (#1727)
- `src/server/Layer.ts` `layerLocalLgtmServer(config, { otlpSerialization?, shouldPublishDevToolsSpan? })`
  provides `options?.otlpSerialization ?? OtlpSerialization.layerProtobuf` under `Otlp.layer`. Intervals are
  hard-coded (logger 1 s, metrics 10 s, tracer 5 s), `loggerMergeWithExisting: true`, the resource comes
  from config, and it merges `Metric.enableRuntimeMetricsLayer`. Not reusable for strict: strict needs
  5-minute windows, `loggerMergeWithExisting: false`, no runtime metrics and a constant resource.
- Precedent serializer wrapper: `src/experimental/server/OtlpPacketLab.ts` decorates a base
  `OtlpSerialization` and captures each body. Its test `test/OtlpPacketLab.test.ts` is the capture-harness
  pattern for the canary and golden tests.
- Service contract (`EFX/observability/OtlpSerialization.ts`):
  `{ traces: (TraceData) => HttpBody; metrics: (MetricsData) => HttpBody; logs: (LogsData) => HttpBody }`.
  A custom serializer must, synchronously and per call:
  1. ignore the input `resource` and emit one rebuilt from constants;
  2. construct spans rather than filter them: the name must be in the tool enum (map
     `PracticeKgTools.<tool>` / `mcp.tool.call.<tool>`), otherwise drop; floor
     `start/endTimeUnixNano` to the window; regenerate or HMAC `traceId/spanId/parentSpanId` per batch; emit
     `events: []`, `links: []` and `status: { code }` only (no `message`); attributes only from the
     shape-only union;
  3. logs: drop every record (counted) and return a body the egress client never sends;
  4. metrics: keep only allowlisted names and attribute keys, coarsen values, and append the gate's own
     refusal points from its in-memory refusal ledger (it cannot call `Metric.update` from a sync serializer);
  5. return JSON (`HttpBody.jsonUnsafe`) so the egress client can byte-scan; never protobuf.

### 2.2 Catalog kernel (`src/catalog/*`, export `./catalog`)
- `TelemetryTier` (`shape-only | standard | dev-verbose`), `isStricterTier`, `SignalKind`
  (`span | metric | event | log`), `IdentitySource` (`vouched | self-claimed`): `src/catalog/Catalog.literals.ts`.
- `EmitterContext` tagged union with variants `Workstation, Server, StrictDesktop, CiRunner, CloudVm,
  Serverless, Browser`: `src/catalog/Catalog.models.ts`.
- `tierCeiling` (`StrictDesktop` and `Browser` → `shape-only`) and `effectiveTier(context, requested)` =
  the stricter of ceiling and request, so a request can only lower: `src/catalog/Catalog.behavior.ts`.
- `allowedAttributes(catalog, signal, tier)` → `HashSet<AttributeKeyName>`; `packageOf`.
- `TelemetryRefusalTag` = `attribute-not-allowed | stamped-key-override | span-event-dropped`,
  `SchemaFailureTagKey = "beep.schema_failure_tag"`, the `TelemetryRefused` counter
  (`beep.telemetry.refused`, `minTier: shape-only`): `src/Observability.instruments.ts`.
- `layerCatalogEnrichment`: `src/catalog/Catalog.enrichment.ts`. It stamps package/family/tier/identity,
  overrides `span.attribute` under shape-only and replaces `span.event` with a counting no-op. It does
  **not** touch `status`, links, `name` or timestamps, and it is no fence for `exception` events (built later
  in `makeOtlpSpan`).
- Naming: SPEC says `telemetry_refused_total`; the catalog instrument is `beep.telemetry.refused` (the
  Prometheus translation adds `_total`). Use the catalog instrument and extend `TelemetryRefusalTag` with
  gate tags (for example `span-name-not-allowed`, `log-record-dropped`, `resource-rebuilt`,
  `metric-not-allowed`, `link-dropped`, `status-message-dropped`, `spool-evicted`, `egress-refused`).

### 2.3 `/server` vs kernel split
- `package.json` exports: `.`, `./catalog` (kernel), `./server` (Config, DevTools, ErrorReporting,
  HttpApiTelemetry, Layer, **NodeSdk**, Prometheus, TraceContext), `./experimental/server`, `./web`.
- `test/Boundary.test.ts` enforces explicit exports, keeps root/web free of server imports, and typechecks
  `test/fixtures/{browser,server,experimental-server}-safe.ts`.
- `@effect/opentelemetry` and `@opentelemetry/*` are package dependencies, and importing `./server` pulls
  `NodeSdk.ts` into the bundle graph. The strict layer must be a new export (for example `./strict`) that
  imports only `./catalog`, `effect/observability/*` and `effect/http`, with a fourth boundary fixture
  asserting no `./server` / `@effect/opentelemetry` reach.

## 3. `@beep/mcp-kit` `SanitizedSpan`
- `packages/foundation/capability/mcp-kit/src/SanitizedSpan.ts`. Upstream `Toolkit` annotates the current
  span with raw `parameters` before decoding (`EFX/ai/Toolkit.ts`). `sanitizeTracerAttributes(tracer, keys =
  ["parameters"])` returns a fully delegating span proxy whose only override is `attribute`.
  `withSanitizedToolSpan(effect, spanName)` opens a fresh span through that proxy, and
  `sanitizedToolkit(toolkit)` registers every tool with `handle: Effect.fn("McpKit.handle")` wrapping
  dispatch in `withSanitizedToolSpan(..., \`mcp.tool.call.${tool.name}\`)`.
- Reuse: keep it as the first fence for `parameters`. It still lets the tool name through, and the span name
  is interpolated but bounded by the toolkit keys. The strict gate maps both `mcp.tool.call.<tool>` and
  `PracticeKgTools.<tool>` to `tool_id` and drops the rest. Any new span proxy should follow its explicit
  getter/delegate pattern (prototype methods are lost by spread).
- Tests: `packages/foundation/capability/mcp-kit/test/SanitizedSpan.test.ts`, `SanitizedToolkit.test.ts`.

## 4. Effect v4 OTLP internals (4.0.4)
- `Otlp.layer` (`EFX/observability/Otlp.ts`) merges `OtlpLogger.layer`, `OtlpMetrics.layer` and
  `OtlpTracer.layer`, requiring `HttpClient | OtlpSerialization`. `layerJson`/`layerProtobuf` close over the
  serializer and must not be used.
- Exporter (`EFX/observability/OtlpExporter.ts`): `body: (items) => [HttpBody, onSuccess]` is synchronous;
  `runExport` swaps the buffer, calls `body` and posts via the context `HttpClient` with `retryTransient` ×3,
  tracer disabled for the call. On failure it clears the buffer, disables export for 60 s and
  `Effect.logDebug`s the cause. The timer is an `Effect.sleep(exportInterval)` loop. **Early flush** when
  `buffer.length >= maxBatchSize` (tracer/logger default 1000), so windows are not strict: set `maxBatchSize`
  high and floor timestamps in the gate anyway. Final flush on scope close; `Flusher` / `layerFlusher` are
  provided by each signal layer.
- Traces (`EFX/observability/OtlpTracer.ts`): builds `{ resourceSpans: [{ resource, scopeSpans: [{ scope,
  spans }] }] }` and calls `serialization.traces`. Spans have no creation-time attributes, so attributes
  arrive only through `span.attribute`. `makeOtlpSpan`: a failure sets `status.message = errors[0].message`
  and adds `exception` events with `exception.type/message/stacktrace`; an interrupt adds
  `effect.fiber.interrupted`; links carry attributes.
- Metrics (`EFX/observability/OtlpMetrics.ts`): a snapshot of the **global** registry; scope name =
  `service.name`; frequency metrics emit the observed string as an attribute value; exemplars typed but
  unset; `maxBatchSize: "disabled"`, `exportEmpty: true`, default interval 10 s. Runtime metrics
  (`child_fibers_*`) only when `enableRuntimeMetricsLayer` is provided.
- Logs (`EFX/observability/OtlpLogger.ts`): records carry annotations, `effect.fiberId`,
  `effect.log_span.<label>`, `exception.*`, the message as body, and trace/span ids. `tracerLogger` turns log
  messages into span events.
- Resource: `OtlpResource.make` adds `telemetry.sdk.*` and `service.*`; `fromConfig` merges
  `OTEL_RESOURCE_ATTRIBUTES`, `OTEL_SERVICE_NAME` and `OTEL_SERVICE_VERSION`. The gate emits its own resource:
  `service.name = "practice-kg-mcp"`, `service.version = PRACTICE_KG_EXTENSION_VERSION`,
  `beep.privacy_tier = "shape-only"` and a key epoch; no host identity.
- Synchronous feasibility: yes. The three serializer functions are pure and synchronous and the exporter
  calls them inside `Effect.suspend`. Schema `decodeUnknownExit`/`encodeSync` and `Bun.CryptoHasher` HMAC are
  synchronous; WebCrypto belongs only in the egress client.

## 5. Crypto / runtime
- `Bun.CryptoHasher("sha256", key)` HMAC works on bun 1.4.2 (probed; 64 hex chars).
- WebCrypto precedent: AES-256-GCM envelope schemas and encrypt/decrypt in
  `packages/tooling/library/ai-metrics/src/archive.ts` (`AiMetricsArchiveAlgorithm`,
  `AiMetricsEncryptedRawArchiveEnvelope`, import/encrypt/decrypt). Reuse its envelope shape and nonce/tag
  checks for spool segments. Async HMAC via `crypto.subtle`:
  `packages/tooling/tool/cli/src/commands/Cache/Cache.producer.ts`.
- DPAPI / `bun:ffi` / `crypt32` / `ProtectedData`: **no code in the repo** (one doc mention in
  `packages/drivers/m365/src/M365.auth.ts`). New code is required, plus the operator-run smoke.
- Salt/key location: proposed `%LOCALAPPDATA%\beep\practice-kg\telemetry\` (`key.dpapi`, `epoch`, `spool\`).
  Risk: the Microsoft Store Claude Desktop virtualises AppData, so writes from a child process may land
  under `Packages\Claude_<id>\LocalCache\...`. Resolve the path once and print it in `--self-check`. Never
  store the key in the `.mcpb` or the environment.

## 6. Process metrics
- No reusable sampler. Fragments only: `process.memoryUsage().rss` and `process.resourceUsage().maxRSS` in
  `apps/labs/semantica/src/layers/`. `PhaseProfiler` measures phases, not the process.
- Effect runtime metrics (`Metric.enableRuntimeMetricsLayer`) are fiber counters; exclude them in strict.
- `process.cpuUsage()` and `process.memoryUsage.rss()` exist on bun 1.4.2 (probed); Windows behaviour is
  unverified.

## 7. Test infrastructure
- Idioms: `it` from `@beep/test-runner`, `describe`/`expect` from `@effect/vitest`,
  `it.layer(Layer.fresh(...))` (`apps/practice-kg-mcp/test/Host.test.ts`), `it.prop` + `fcRuns`.
- Golden precedent: JSON import + `toEqual`
  (`packages/tooling/library/repo-utils/test/JSDocTagDefinition.golden.test.ts` with `test/__golden__/`;
  `packages/epistemic/use-cases/test/ContradictionDetection.golden.test.ts`).
- Canary precedent: `packages/foundation/capability/file-processing/test/support/CanaryScan.ts`
  (`countCanaries`, never prints a match) and `test/fixtures/SecretScrub.fixtures.ts`;
  `packages/foundation/capability/observability/test/CredentialBank.test.ts` (runtime-assembled canary).
- Capture harness: `OtlpPacketLab` (§2.1) plus `OtlpExporter.Flusher.flush` to force export.
- Fixture bundle for running every handler: `makePracticeKgSmokeBundle` (`apps/practice-kg-mcp/src/smoke.ts`).
- Mutation testing: no Stryker or other mutation tooling, and no "disable a rule → red" precedent.
  Implement it as an explicit mutant table: the gate takes a `GateRules` record, and the test disables each
  rule in turn and asserts that the canary or golden test goes red.

## 8. Fleet gateway (`goals/fleet-telemetry-tailnet`)
- Its SPEC: the gateway resolves the peer via `tailscale whois`, overwrites `host.name`, applies inverted
  tags (untagged = shape-only), refuses batches that do not decode (4xx, counted), and closes the open OTLP
  ingest first. Not implemented yet.
- Until it exists the strict build assumes **nothing leaves the PC**: the egress client defaults to
  spool-only (no network send). Sending stays disabled until a signed config names the gateway endpoint and
  the gateway goal flips. This also keeps install-runbook AC-5 (zero egress) true; changing AC-5 is a
  separate, recorded decision once the gateway lands.

## Gaps and risks
1. **No error tag on spans.** Failing tools end Ok (`failureMode: "return"`). The gate needs a catalogued,
   literal-valued span attribute set in the handler (for example `beep.practice_kg.failure_reason` from
   `PracticeKgToolFailureReason`) or a counter, not `exception.type`.
2. **stdout pollution today.** Without `LogToStderr`, default-logger output goes to the MCP protocol stream.
   The shape-only stderr logger must replace the loggers (`mergeWithExisting: false`) and set
   `LogToStderr`; also cover `bin.ts` `Console.error` and the `runMain` error report (path-bearing messages).
3. **SQL / DuckDB spans** carry `db.query.text` and `db.operation`. The gate drops every non-tool span, and the
   canary must include search text that reaches the FTS SQL.
4. **The enrichment wrapper is not a fence.** It misses status message, links and exception events; it does
   not count toward D2.
5. **Interpolated span name** `mcp.tool.call.${tool.name}` conflicts with "names are static literals". Map
   it in the gate; changing mcp-kit's span naming is out of scope.
6. **Early-flush batches** (`maxBatchSize`) and the 60-second-disable `logDebug` (carries cause/endpoint).
   Logs are dropped by the gate, but stderr must never print debug.
7. **Global metric registry** includes any third-party metric; allowlist by name.
8. **Seam stability:** `OtlpSerialization` is `@stability unstable`. Pin `Otlp.layer`'s requirements with a
   type-level test.
9. **DPAPI:** no prior art; `bun:ffi` inside a `--compile` exe is unproven on Windows; Store-app AppData
   virtualisation.
10. **Bundle hygiene:** the `.mcpb` exe is opaque to `assertArchive`; a build-graph check must prove
    `@effect/opentelemetry` / `@beep/observability/server` are unreachable.
11. **AC-5 conflict:** any send breaks the existing zero-egress acceptance. Hold sending until the gateway
    goal closes.
12. Count-floor / per-window tool counts as a side channel remain **[lawyer to confirm]** (strict-tier note Q3).

## Proposed P1 slice
- Schema (tier gate rules), kernel, no server imports:
  - `packages/foundation/capability/observability/src/strict/StrictGate.schemas.ts`: the shape-only tool id
    (parameterised LiteralKit input), latency buckets, shape-only metric names, literal-keyed attribute
    unions, the shape-only resource, the window-floor transform and the HMAC id transform.
  - Extend `TelemetryRefusalTag` in `src/Observability.instruments.ts` with the gate tags (§2.2).
  - `apps/practice-kg-mcp/src/telemetry/PracticeKgTelemetry.instruments.ts`: the tool-id LiteralKit derived
    from `PracticeKgToolkit` keys plus the failure-reason attribute key.
- Service contract:
  - `.../src/strict/StrictGate.service.ts`: `StrictGate { serialization; ledger }` plus a `GateRules` record
    (one entry per rule, for the mutants).
  - `.../src/strict/StrictGate.layer.ts`: `layerStrictOtlp(options)` = `Otlp.layer({ 5-minute intervals,
    loggerMergeWithExisting: false, maxBatchSize high })` + the gate serializer + a spool-only `HttpClient`;
    export `./strict` and add `test/fixtures/strict-safe.ts` to `Boundary.test.ts`.
  - `apps/practice-kg-mcp/src/runtime/Telemetry.ts`: shape-only stderr logger + `LogToStderr` + the strict
    layer, composed in `Host.ts`.
- Tests:
  - `StrictGate.seam.test.ts`: type-level pin of `Otlp.layer`'s requirements.
  - `StrictGate.golden.test.ts` + `test/__golden__/shape-only.keys.json` and `shape-only.refusal-tags.json`.
  - `StrictGate.mutants.test.ts`: disable each `GateRules` entry → canary or golden goes red.
  - `apps/practice-kg-mcp/test/StrictTier.canary.test.ts`: `makePracticeKgSmokeBundle` seeded with canaries,
    all eleven tools including failing paths, captured through a serializer tap plus stderr capture; scan raw,
    lowercased, URL-encoded, base64, JSON-escaped, 8-character prefix and unsalted SHA-256 forms.
