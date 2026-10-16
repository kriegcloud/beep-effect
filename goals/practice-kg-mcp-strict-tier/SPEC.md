# Practice KG MCP Strict Telemetry Tier Spec

## Objective

Shape-only telemetry for practice-kg-mcp on the attorney workstation: serializer gate, on-PC HMAC salt, encrypted spool, fail-closed tier, canary proof.

## Non-Goals

- Any spend: SaaS backends, Vercel drains, Grafana Cloud above free, Tailscale paid tiers (exploration D9).
- Choosing the logs/traces store; that waits for the hub gate (D1).
- Mutating dankserver, the tailnet policy, `tom-pc-1` or any host directly; ship exact commands as proposals the operator applies.
- `tbk-ubuntu` and its security-sensitive VM (gated host; never instrumented).
- Developer-AI analytics (`@beep/repo-ai-metrics`), cache policy (`goals/turborepo-cache-trust-observability`) and CI step forensics (`goals/ci-step-watchdog`) — consume, never absorb.
- Dashboards hand-built in the Grafana UI or copied from the existing generated ones.

## Source Hierarchy

1. The graduating exploration: [`explorations/observability-palantiri`](../../explorations/observability-palantiri/) — `BRIEF.md`, `MAP.md`, `DECISIONS.md` (back-links, not copies).
2. `AGENTS.md`, `CLAUDE.md`, and required skills.
3. Governing architecture/package standards.
4. This `SPEC.md`.
5. `PLAN.md`.
6. `GOAL.md`.
7. Supporting `research/`, `ops/`, and `history/` files.

Higher sources outrank lower sources when they conflict.

## Target Surfaces

- `apps/practice-kg-mcp` (runtime layer, stderr pinning, packaging)
- `@beep/observability` kernel: shape-only gate + egress `HttpClient`
- `@beep/mcp-kit` `SanitizedSpan` (reuse)

## Constraints

- Gate = custom `OtlpSerialization` with `Otlp.layer` (never `layerJson`/`layerProtobuf`/NodeSdk in this build); synchronous; HMAC via `Bun.CryptoHasher`; pinned by a test (`explorations/observability-palantiri/research/strict-tier-exporter.md`).
- Shape-only spans allowed but scrubbed: names only from the tool enum, timestamps rounded to the export window, ids unlinkable across batches, events/links/status messages/log bodies always dropped; every drop counted in `telemetry_refused_total`.
- Resource rebuilt from constants; the PC sends no host identity (gateway vouches via `whois`).
- Fail closed: untagged or unresolvable tag → shape-only; env/flags can lower the tier, never raise it.
- Stderr pinned to a shape-only logger (Claude Desktop persists MCP stderr).
- Process CPU/RSS coarsened (10 s samples, 5 min windows, 5% / 32 MiB steps); no disk I/O counters.
- Spool after the gate, AES-GCM with a DPAPI-wrapped key (bun:ffi `crypt32`, PowerShell fallback); replay never under a looser tier.
- Nothing leaves `tom-pc-1` until the fleet goal's tier-aware gateway replaces the open ingest.
- Schema → `Context.Service` contract → implementation; Effect v4 only, validated against `.repos/effect`; `effect/<Module>` imports; `HashMap`/`HashSet`; `Effect.fn`/`fnUntraced`.
- Names, metrics, events and attribute keys come from the instrumentation catalog (`goals/observability-kernel-catalog`); names are static literals, never interpolated.
- Public repo: no client data, tokens, `op://` resolutions, LAN IPs, tailnet suffixes or account identifiers in packet or code.
- Totals use `increase()` over the panel range; per-process identity never becomes a metric label; promoted labels come only from the registry's metric-safe set.

## Acceptance Criteria

- [x] Canary tokens through every tool handler (incl. failing paths) never appear in any exported byte in any encoding.
- [x] Golden per-tier allowlist snapshot test: exported key set equals the golden; refusal tags match.
- [x] Mutation tests: disabling any gate rule turns a test red.
- [ ] A DPAPI smoke run on `tom-pc-1` (operator-run command) succeeds or the fallback is recorded.
- [x] Weekly privacy receipt (counts + key names, no values) renders locally.
- [ ] No unrelated refactors or formatting churn.

## Verification Matrix

| Check | Command or evidence | Required result |
| --- | --- | --- |
| Packet launcher size | `test "$(wc -m < goals/practice-kg-mcp-strict-tier/GOAL.md)" -le 4000` | Passes |
| Manifest JSON | `jq . goals/practice-kg-mcp-strict-tier/ops/manifest.json` | Passes |
| Whitespace | `git diff --check -- goals/practice-kg-mcp-strict-tier` | Passes |

## Stop Conditions

- Required source files are missing or materially contradictory.
- Any spend: purchases, paid services, quota top-ups or plan changes need the
  operator.
- The same blocker repeats after reasonable investigation.

Scope growth, destructive side effects and policy calls are not stops: decide
them and record each in the Decision Log.

## Decision Log

| Date | Decision | Reason | How to reverse |
| --- | --- | --- | --- |
| 2026-10-14 | Inherit exploration decisions D1–D9 and the align/agent-decided entries in `explorations/observability-palantiri/DECISIONS.md`. | Graduated from `explorations/observability-palantiri`. | Reopen the exploration at `decompose`. |
| 2026-10-15 | P0: the gate ships as a new kernel export `@beep/observability/strict` (catalog + `effect/observability` + `effect/http` only), pinned by a boundary fixture; the practice app owns the tool-id domain and host wiring. Design: `research/strict-tier-design.md`. | `./server` pulls `NodeSdk` / `@effect/opentelemetry` into the bundle graph (`research/source-survey.md` §2.3). | Move the gate into `apps/practice-kg-mcp`. |
| 2026-10-15 | P0: until the fleet gateway goal lands, `StrictEgress` never sends. Each export is counted `egress-refused` and goes to the encrypted spool (P2), so install-runbook AC-5 (zero egress) stays true. | Nothing leaves the PC until the tier-aware gateway replaces the open ingest (Constraints); any send would break AC-5. | Enable the send path behind a signed gateway config once `goals/fleet-telemetry-tailnet` closes, with an AC-5 decision. |
| 2026-10-15 | P0: scope extension. `packages/law-practice/server` stamps a literal `beep.practice_kg.failure_reason` (from `PracticeKgToolFailureReason`) on the tool span. | Tools use `failureMode: "return"`, so a failed call ends its span with Ok status and the gate has no failure signal otherwise; free-text messages must never be projected. | Drop the attribute and report failures as a counter only. |
| 2026-10-15 | P0: mutation tests use an explicit `GateRules` table (one switch per rule, production value all-on) instead of a mutation-testing tool. | The repo has no Stryker or equivalent; a typed table makes "disable any rule → red" exhaustive and cheap. | Adopt a mutation tool and drop the table. |
| 2026-10-15 | P1: `layerStrictOtlp` installs the OTLP gate logger with `loggerMergeWithExisting: false`, and the host adds the shape-only stderr logger beside it (`mergeWithExisting: true` over that set). The process-wide `layerShapeOnlyStderr` (used by `bin.ts` before the host exists) replaces every logger with `mergeWithExisting: false`. | Both replace the default logger; keeping the gate logger lets every dropped log record be counted as `log-record-dropped`. | Install only the stderr logger in the host and drop the gate logger. |
| 2026-10-15 | P1: the duration-bucket domain (`TelemetryDurationBucket`) and its key `beep.duration_bucket` are kernel declarations, not app declarations; the app declares `beep.practice_kg.tool` and `beep.practice_kg.failure_reason`. | The kernel gate stamps the bucket, so it owns the key and its literal values. | Move the key into the app instruments file and pass it in `StrictGateConfig`. |
| 2026-10-15 | P1: the kernel owns the salt construction (`layerInMemoryStrictSalt(hmac)`, key = salt ‖ per-batch nonce); the host passes `Bun.CryptoHasher` as the synchronous HMAC-SHA256 primitive. | `@beep/observability/strict` stays free of platform types (its boundary fixture typechecks without node types); the DPAPI salt in P2 replaces only the service. | Type the kernel against Bun and call `Bun.CryptoHasher` there. |
| 2026-10-15 | P1: an attribute passes the gate only when the catalog allows its key on that signal at `shape-only` and lists the value; keys without a literal value list are refused. A metric point with any refused label is dropped whole. | Shape-only spans carry literals only; dropping one label from a point would merge series silently. | Allow bounded keys without value lists and strip single labels. |
| 2026-10-15 | P1: `StrictGateConfig.toolSpanPrefixes` (`mcp.tool.call.`, `PracticeKgTools.`) maps span names to tool ids, so each call exports two `<tool>` spans (dispatch and handler). `StrictEgress` answers each held-back export with a synthetic `204` so the exporter keeps its window. | The kernel cannot know the app's span naming; a failed send would disable the exporter for 60 s. | Keep only the handler span; return an error and accept the exporter backoff. |
| 2026-10-15 | P1: the canary acceptance test lives in `apps/practice-kg-mcp/test/Host.test.ts`, which already owns the host's real-filesystem tests, and drives the production server over the mcp-kit stdio conformance kit. Startup refusals on stderr are now one shape-only line; `--self-check` keeps the full refusal on stdout. | PGlite and DuckDB need a real filesystem; a new test file importing it would add an effect-vitest platform finding to the inventory (S31). | Split the canary into its own file with a reviewed inventory entry. |
| 2026-10-15 | P2: the spool sits behind `StrictEgressSink`. `record` never fails and returns the refusals it caused, which the egress client adds to the gate ledger (`StrictGate.absorb`). Kernel tags: `spool-evicted` (an old segment evicted for space), `spool-write-failed` (a body that could not be sealed, encoded or written; added after review), `spool-tier-refused`, `spool-segment-invalid` (undecodable, failed authentication, or another key epoch). | The sink sits outside `layerStrictOtlp`, so it cannot read the gate; returning a ledger keeps every drop counted without a shared mutable service. | Extract a shared refusal-ledger service that the gate and the spool both require. |
| 2026-10-15 | P2: spool segments mirror the `@beep/repo-ai-metrics` archive envelope (algorithm literal, 12-byte nonce, ciphertext with its 16-byte tag, linear Base64 checks) inside the kernel instead of importing it, and bind the header (signal, tier, key epoch, seal time) as AES-GCM additional data. One 32-byte root key derives the spool key and the span-id salt with HKDF-SHA256 under separate info strings. | The foundation kernel cannot depend on a tooling library; authenticating the header makes a rewritten tier fail closed. | Promote the envelope schemas to a shared foundation module and import them from both. |
| 2026-10-15 | P2: the root key lives in owner-only files `<telemetry dir>/key.<epoch>.dpapi` (`{version, epoch, protection, wrappedBase64}`; one file per epoch since review, see below). A current key that does not decode or unwrap is superseded by a new key under the next epoch, so the old spool replays as `spool-segment-invalid`. Production picks the `bun:ffi` `crypt32` port when it loads and round-trips, else PowerShell `ProtectedData`; both use the same DPAPI entropy so either unwraps the other's blob. Off Windows the key is stored unwrapped and marked `dev-file`. | One file cannot disagree with itself; rotating instead of failing keeps the host serving after a profile reset; the shared entropy keeps the fallback interoperable. | Split `key.dpapi` and `epoch`; fail the host when the stored key does not unwrap. |
| 2026-10-15 | P2: the host resolves its tier with `resolveStrictTier(None, [PRACTICE_KG_TELEMETRY_TIER])`: it reads no emitter-context tag, because nothing vouches for one on the PC until the fleet gateway lands, and a request that is not a tier name lowers to `shape-only`. No CLI flag was added. | A self-claimed tag could only raise the tier; the env request covers the "lower" path. | Read a gateway-signed tag once `goals/fleet-telemetry-tailnet` closes; add a `--telemetry-tier` flag. |
| 2026-10-15 | P2: when no telemetry directory resolves, or the key or spool cannot be opened, the host falls back to the in-memory telemetry (still gated, nothing on disk) and keeps serving. | Telemetry must never take the attorney's tools down, and the fallback writes nothing unencrypted. | Fail host startup on a telemetry error. |
| 2026-10-15 | P2: the DPAPI smoke is `practice-kg-mcp.exe --self-check-telemetry`, a separate flag that prints `{ok, keyPath, telemetryDir}` and writes nothing, rather than new fields on the `--self-check` bundle report. It is delivered in P2 (the design listed it under P3) and its operator command is in the install runbook; acceptance #4 stays open until the operator runs it on the PC. | The bundle report is a decoded contract in the smoke and tests; the telemetry check needs no bundle. | Fold the fields into the `--self-check` report. |
| 2026-10-15 | P2: bundle hygiene is a `Bun.build` metafile check over `src/bin.ts` (`src/BundleGraph.ts`), run by `src/package.ts` before compiling and by a test; it fails on any input under `@effect/opentelemetry/`, `@opentelemetry/` or the observability `src/server/`. The P1 canary acceptance test now exports through the encrypted spool and scans the segments at rest as well as the replayed bodies. | The compiled executable is opaque to the archive inventory; the module graph is what can be checked. | Extend `assertArchive` with a strings scan of the executable. |
| 2026-10-15 | P1 review fix: the gate rebuilds every metric point from named fields (never spreading the input) and, under the `metric-values` gate rule, floors each `asInt`, `asDouble`, histogram `count` and `bucketCounts` entry onto a fixed 1/2.5/5-per-decade ladder (0, 1, 2, 5, 10, 25, 50, 100, 250, 500, 1 000, ...; negatives keep their sign) saturating at 10^12 (`coarsenMetricValue`). Histograms keep their static `explicitBounds` and drop `sum`, `min` and `max`, each counted as `metric-value-dropped`; exponential-histogram and summary series are refused whole and counted as `metric-not-allowed`. | Raw counter values and histogram aggregates can encode content-derived magnitudes (row counts, sizes); an order-of-magnitude ladder keeps operational shape while removing exact values. | Turn the `metric-values` rule off or replace the ladder with finer steps. |
| 2026-10-15 | P3: the mutation table is two typed tables keyed by `GateRule`, each with a completeness test and one test per rule (rule off, needle exported; all rules on, no needle). Kernel: `gateMutants` in `test/StrictGate.test.ts` over the representative batches. Host: `hostNeedles` in `apps/practice-kg-mcp/test/Host.test.ts`, made sensitive by a test-only leak probe that runs beside the production server under the same telemetry layer and writes the canary into a span name, span attributes, an event, a link, a status message, a log body, the resource (`OTEL_RESOURCE_ATTRIBUTES`), a metric name, a metric label and a raw gauge value, under an external parent with a known trace id and a clock with an unaligned start. The all-rules-on canary test now runs the probe too. The tables iterate `GateRule.literals` (a `LiteralKit` has no `Options` member). | The P1 finding: no production path puts a canary into pre-gate telemetry, so without a test-side leak the host canary test cannot go red. The probe lives only in the test harness. | Drop the host table and keep the kernel table only. |
| 2026-10-15 | P3: `layerPracticeKgTelemetryFor(config)` is exported so the host mutation tests can build the production telemetry with one rule off; production passes only the all-on configurations (`PracticeKgStrictGateConfig`, or the spooled one under the key epoch). | The rule switches already live in `StrictGateConfig.rules`; exporting the builder adds no leak path, only lets the test turn a rule off in the real composition. | Keep the builder private and assemble the host telemetry inside the test. |
| 2026-10-15 | P3 finding: the OTLP exporters read `OTEL_RESOURCE_ATTRIBUTES` from the environment into the pre-gate resource, so an attorney PC with that variable set would carry it to the gate. The `resource` rule rebuilds the resource from constants and drops it; the host leak probe uses this path. | It is the one pre-gate leak path that exists in production today. | None needed; the rule is on in production. |
| 2026-10-15 | P3: the privacy receipt is `practice-kg-mcp --privacy-receipt` (`src/runtime/PrivacyReceipt.ts`): Markdown on stdout for the last 7 days, writing nothing. It reads the key with the new read-only `readPracticeKgSpoolKey` (a missing key is reported, never created) and the spool with the new kernel `surveyStrictSpool` (never creates the directory; seal time from the segment name, size, opened body or refusal tag; `StrictSpool.replay` now reads through the same reader). Refusal counts are the growth of each `beep.telemetry.refused` series (tag and process start) in the window: the largest value sealed in it minus the largest sealed before it. Attribute keys and metric names print only when the catalog (plus the three constant resource keys) lists them; any other name is counted. Paths print only as `<telemetry dir>`. | The receipt must be counts and names only and runnable while the host serves; the cumulative counter series is the ledger the gate already spools. Two processes started in the same 5-minute window share a series and are undercounted, never overcounted. | Count refusals from a separate ledger file the host writes; print raw totals. |
| 2026-10-15 | P3: process CPU and RSS are two label-free gauges declared in the app instruments file (`beep.practice_kg.process.cpu`, `%`; `beep.practice_kg.process.rss`, `By`). A Bun sampler (`process.cpuUsage`, `process.memoryUsage.rss`) runs every 10 s; each 5-minute window records CPU time over wall time of the intervals ending in it and the peak RSS, floored to 5% and 32 MiB, at the first sample of the next window. No disk I/O counter is read. The gate's value ladder then floors the recorded values again (35% exports as 25, 96 MiB as 100 000 000 bytes). | The constraint's steps bound what the host records; the gate's ladder bounds every exported value, and keeping both means no metric is exempt from the gate. | Exempt the two gauges from the ladder under a catalog flag, or record them in ladder-friendly units. |
| 2026-10-15 | #1838 round-3 follow-up: a coarsened histogram's `count` is the sum of its coarsened `bucketCounts` rather than its own floored value. | Flooring the count and the buckets independently can disagree (1000 vs 1012), which makes the point OTLP-inconsistent. | Floor the count independently and drop `bucketCounts`/`explicitBounds` instead. |
| 2026-10-15 | P2 review: key files are `<telemetry dir>/key.<epoch>.dpapi` and are never overwritten. A new key is written owner-only to a pending name and published with a hard link, which fails when the name exists; the highest epoch on disk is the current key. A host that loses the race for an epoch re-reads the directory and uses the winner's key (bounded retries). This replaces the single overwritten `key.dpapi`. | Two hosts starting together could mint the same epoch with different material and the last rename won, orphaning the other's segments; a link is an atomic exclusive publish on POSIX and NTFS, and epoch-suffixed names make the rotation path exclusive the same way, with no lock file to go stale. | Return to one `key.dpapi` guarded by a lock file. |
| 2026-10-15 | P2 review: a failed eviction no longer fails an append (the body is on disk; the next append evicts again), so an append fails only when the body was not written, and the sink counts that as `spool-write-failed` rather than `spool-evicted`. The bundle-graph fence also refuses `@beep/observability/experimental/server` and its `src/experimental/server/` sources. | Eviction counts must mean evictions; the experimental server (`OtlpPacketLab`, `DevToolsRelay`) is no safer in the strict bundle than the server entrypoint. | Count write failures as evictions; allow the experimental server. |
| 2026-10-15 | P3, after P2 round 2: the receipt reads the current key through the host's own highest-epoch scan (`latestKeyFile`), so it follows `key.<epoch>.dpapi` and still creates nothing; it renders the key as `<telemetry dir>/key.<epoch>.dpapi`. Spool refusals get their own table listing every `spool-*` tag, zeros included: `spool-evicted` and `spool-write-failed` from the gate counter growth, `spool-tier-refused` and `spool-segment-invalid` from the survey; the gate table lists the other tags. `--self-check-telemetry` reads no key file, so it needed no change. | One resolver means the receipt can never disagree with the host about which key is current; a fixed spool table makes a zero visible. | Print only non-zero spool tags in the gate table. |
| 2026-10-15 | P3, closing the #1843 round-3 follow-up: spool eviction removes one segment at a time and records one outcome per segment, so `spool-evicted` counts exactly the segments removed and a remove that fails is counted under the new kernel tag `spool-evict-failed` without stopping the removes after it; a directory that cannot be listed or sized counts one `spool-evict-failed`. Eviction still never fails or miscounts the append. The privacy receipt's spool table gains the `spool-evict-failed` row (five rows). | One `Effect.forEach` over the removes failed whole on the first error, and the caller's fallback then reported zero evictions for segments already deleted and silently stopped evicting. | Revert to a single all-or-nothing eviction pass and drop the tag. |
| 2026-10-16 | P3 review round 1 (#1847): the receipt's spool section carries a tagged status (`read`, `no-key`, `survey-failed` with the `StrictSpoolOperation` only) instead of a boolean, so a survey that fails after the key loaded is no longer printed as "no key loaded" with zero refusals. A refusal series whose process started before the window but has no surviving point before it (its earlier segments were evicted) takes its earliest surviving point as the baseline, and its tag is listed in `truncated` and rendered as `≥ N, baseline truncated`; a series started inside the window still counts its whole value. P3 is marked in progress (code complete, operator smoke pending) in PLAN, README and the manifest. | A swallowed survey failure misreported the spool; a zero baseline counted a whole pre-window history as in-window growth once eviction removed the earlier points. | Fold `survey-failed` into `no-key`; use a zero baseline. |

## Exception Ledger

| Exception | Scope | Owner | Rationale | Removal condition |
| --- | --- | --- | --- | --- |
| None | N/A | N/A | N/A | N/A |
