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
- [ ] Mutation tests: disabling any gate rule turns a test red.
- [ ] A DPAPI smoke run on `tom-pc-1` (operator-run command) succeeds or the fallback is recorded.
- [ ] Weekly privacy receipt (counts + key names, no values) renders locally.
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
| 2026-10-15 | #1838 round-3 follow-up: a coarsened histogram's `count` is the sum of its coarsened `bucketCounts` rather than its own floored value. | Flooring the count and the buckets independently can disagree (1000 vs 1012), which makes the point OTLP-inconsistent. | Floor the count independently and drop `bucketCounts`/`explicitBounds` instead. |
| 2026-10-15 | P2 review: key files are `<telemetry dir>/key.<epoch>.dpapi` and are never overwritten. A new key is written owner-only to a pending name and published with a hard link, which fails when the name exists; the highest epoch on disk is the current key. A host that loses the race for an epoch re-reads the directory and uses the winner's key (bounded retries). This replaces the single overwritten `key.dpapi`. | Two hosts starting together could mint the same epoch with different material and the last rename won, orphaning the other's segments; a link is an atomic exclusive publish on POSIX and NTFS, and epoch-suffixed names make the rotation path exclusive the same way, with no lock file to go stale. | Return to one `key.dpapi` guarded by a lock file. |
| 2026-10-15 | P2 review: a failed eviction no longer fails an append (the body is on disk; the next append evicts again), so an append fails only when the body was not written, and the sink counts that as `spool-write-failed` rather than `spool-evicted`. The bundle-graph fence also refuses `@beep/observability/experimental/server` and its `src/experimental/server/` sources. | Eviction counts must mean evictions; the experimental server (`OtlpPacketLab`, `DevToolsRelay`) is no safer in the strict bundle than the server entrypoint. | Count write failures as evictions; allow the experimental server. |

## Exception Ledger

| Exception | Scope | Owner | Rationale | Removal condition |
| --- | --- | --- | --- | --- |
| None | N/A | N/A | N/A | N/A |
