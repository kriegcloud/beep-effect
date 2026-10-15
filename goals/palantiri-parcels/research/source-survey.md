# Palantiri Parcels — P0 Source Survey

Date: 2026-10-14. Branch `feat/palantiri-parcels`, fresh from `main`.
Scope: what each of the five parcels can reduce from today, with no backend
store, and which repo infrastructure the goal reuses. Paths are repo-relative;
user state is written `$HOME/...` or `$XDG_STATE_HOME/...`.

## Headline constraint

Every local source a parcel needs (`AccountsUsage`, `SessionLedger`, the yeet
inbox and proof jobs, `MemoryStats`/admission) lives **inside
`@beep/repo-cli`** (`packages/tooling/tool/cli`). No package depends on
`@beep/repo-cli` today (only its own `package.json` names it), and a
`tooling/library` package importing a `tooling/tool` package would invert the
tooling dependency direction (`standards/architecture/07-non-slice-families.md:238-256`).
So `@beep/palantiri` cannot import the readers as-is. Options, in order of preference:

1. **Contract in the library, readers behind service tags.** `@beep/palantiri` owns the
   parcel schemas, `Freshness`, `ParcelSpec`, the pure reducers, the `Parcels`
   `Context.Service` contract and the HttpApi; it declares narrow source-port
   tags (`AccountHeadroomSource`, `LaneRedsSource`, ...). The CLI provides
   them from its existing services. `palantiri-mcp` then needs the same
   implementations, which brings back option 2 or 3.
2. **Extract the readers** (account usage poll, ledger list, inbox view, job list) into
   `@beep/palantiri` (or a `tooling/library` they both import) and have the CLI
   re-export them. It's the right long-term shape, but it's a refactor that the
   SPEC's "no unrelated refactors" limits.
3. **MCP shells out to the CLI** (`bun run beep palantiri parcel <k> --json`),
   decodes with the same schema and returns it. Identical encoded JSON comes for
   free, and the CLI stays the single implementation (it's also the surface the
   research rates highest). The cost is process spawn latency and
   `TRACEPARENT` handed down through env.

Recommendation: do (1) plus (3) for P1. Extract (2) per source only when a
second consumer needs it in-process.

---

## Parcel 1 — Account headroom (key: `account`)

**Sources today**
- `AccountsUsage` service: `packages/tooling/tool/cli/src/commands/Accounts/AccountsUsage.service.ts:121-126`
  (shape: `accounts`, `poll`, `signedIn`, `snapshots`), tag `:143`
  (`Context.Service<AccountsUsage, AccountsUsageShape>()($I\`AccountsUsage\`)`).
  Layer `layerAccountsUsageLive` `:1201` (needs `FileSystem`, `Path`, `HttpClient`;
  the CLI's `BaseLayers` supply them, `packages/tooling/tool/cli/src/bin-main.ts:119`).
- Aggregators: `pollAccounts` `:1218` (concurrency 4, dedupe, appends snapshots),
  `retainLastGood` `:1255`, `loadAccountsReport` `:1321` (returns `AccountsStatusReport`).
- Inputs: proxy auth dir `$HOME/.cli-proxy-api` or `BEEP_ACCOUNTS_AUTH_DIR`
  (`resolveAccountsAuthDir` `:660`); collector snapshots in
  `$XDG_STATE_HOME/beep/accounts` or `BEEP_ACCOUNTS_SNAPSHOT_DIR` (`:1116-1123`,
  via `resolveWorkstationStateDir`, `packages/tooling/tool/cli/src/internal/state/WorkstationState.ts:66`).
  The snapshot writer is outside this repo (only the schema and tests name `accounts-snapshot/v1`).
- Live provider HTTP: Claude, Codex, Muse, Grok and Junie endpoints (`:145-150`), 20 s timeout (`REQUEST_TIMEOUT`).
- Schemas (`Accounts.schemas.ts`): `AccountProvider` `:34`, `AccountRef` `:133`
  (`label` **is often an email**, see the example near `:126`), `UsageWindow` `:190`
  (`kind`, `usedPercent`, `resetsAt`), `CreditBalance` `:242`,
  `AccountUsageOutcome` `:279` (`Ok{identity, windows, credits, asOf}` | `NeedsLogin` | `Failed`),
  `AccountRanking` `:466` (`weeklyRemainingPercent`, `hoursUntilWeeklyReset`,
  `burnRate`, `dataAgeHours`, `estimated`), `AccountSnapshot` `:505`,
  `AccountsStatusReport` `:569` (`accounts-status/v2`, `generatedAt`), `rankAccounts` `:762`.
- CLI: `beep accounts status --json` `Accounts.command.ts:51`, live TUI `accountsCommand` `:111`
  (`watchAccounts` `Accounts.tui.ts:107` keeps last-good in a `Ref`, memory only).

**Missing**
- No persisted last-poll cache: every read polls live (about 1-20 s, network-dependent).
  A parcel cache file (`$XDG_STATE_HOME/beep/palantiri/account-headroom.json`)
  lets `session open` and MCP serve without polling.
- No ordinal or salted-hash identity. `label`, `source` and `Ok.identity` carry emails and
  paths, so the reducer must drop all three and emit `provider` + ordinal (index
  in sorted `label` order, or HMAC with a local salt).
- No `beep.accounts.window_remaining` gauge (catalog name is NET-NEW).

**Freshness**
- Bound: 60 s (MAP first slice). `asOf` = poll time for live `Ok`;
  `Ok.asOf`/`AccountSnapshot.capturedAt` for snapshot or last-good entries.
- `stale`: `now - asOf > 60 s`, or `AccountRanking.estimated` (a lapsed window reset
  locally rather than re-read).
- `unreachable`: outcome `Failed` (timeout, HTTP error) with no last-good;
  `NeedsLogin` is its own state, not a freshness reason. Report it per account.
- `attribution-incomplete`: an auth file is present, but its provider is not
  polled and no snapshot exists (`"... is read from a snapshot, not polled"`, `:1106`).

## Parcel 2 — Lane reds (key: `lane` / `pr`)

**Sources today** (all under the checkout, `packages/tooling/tool/cli/src/commands/Yeet/internal/`)
- Yeet inbox `.beep/inbox/{failures.ndjson,active.ndjson,acks/,sessions/}`:
  `yeetInboxPaths` `Inbox.ts:1639`, `YeetInboxPaths` `:1609`. **Not** under `.beep/yeet`.
  Row union `YeetInboxRow` `:922`: `check-failed` (`YeetCheckFailedRow` `:213`, capsule
  `YeetFailureCapsule` `:152` with `lane`, `bucket`, `prNumber`, `headSha`, `observedAt`),
  `local-shard-failed` `:738`, `base-conflict` `:530`, `sibling-collision` `:288`,
  `review-thread` `:354`, `pr-comment` `:667`, `base-drift` `:417`, `pr-merge-ready` `:840`,
  `proof-job-finished` `:870`. Severity `YeetInboxSeverity` `:102` (P0/P1/P2).
- Reader: `loadYeetInboxView(repoRoot)` `InboxView.ts:357` (requires
  `Crypto | FileSystem | Path`, never fails, reports `skippedLines`/`unreadable`).
  Entry = row + `ack` + `liveness` (`YeetInboxLiveness` `:109`: live/superseded/unknown), `YeetInboxEntry` `:238`.
- Proof jobs `.beep/yeet/jobs/<uuid>.json` (+ `.log`): `ProofJobLauncher` service
  `ProofJobLauncher.ts:756` (`list` `:208`, jobs root `:264`), record schema
  `ProofJobRecord` `ProofJob.ts:968` (`phase`, `outcome`, `terminationReason`, `prNumber`, `submittedAt`).
- Proof ledger `.beep/yeet/proof-ledger.ndjson` (`ArtifactPaths.ts:426`, `ProofLedger` `ProofLedger.ts:320`).
- Per-PR session registry `$XDG_STATE_HOME/beep/yeet` (`PrSessionRegistry.ts:239`, layer `:297`).

**Missing**
- No cross-checkout view. Each checkout has its own `.beep/inbox`, so "all lane reds" must
  enumerate checkouts. The session ledger's `checkout` column provides that list.
- Hosted CI state is only what yeet monitors wrote. There is no direct `gh` poll in the parcel.

**Freshness**
- Bound: 10 min. `asOf` = newest row `ts` per (pr, headSha), and newest
  `failures.ndjson` mtime when no rows.
- `stale`: no inbox append and no monitor heartbeat for an open PR within the bound
  (monitor not running).
- `unreachable`: checkout path in the ledger missing or inbox `unreadable: true`.
- `attribution-incomplete`: `skippedLines > 0`, or entries with liveness `unknown`.

## Parcel 3 — Host pressure (key: `host`)

**Sources today**
- `MemoryStats` service `packages/tooling/tool/cli/src/internal/repo-run/QualityScheduler.ts:237-263`
  (`availableGib`, `totalGib` from `/proc/meminfo` `:226`), layer `MemoryStatsLive` `:309`
  (provided in `bin-main.ts:288`).
- Admission snapshot `admissionStatus()` `QualityScheduler.ts:2376` →
  `AdmissionSnapshot` `QualityScheduler.schemas.ts:731` (`capacityTokens`, `activeTokens`,
  `memAvailableGib`, `hardFloorEngaged`, leases, tickets, dead, quarantined);
  CLI `beep quality ... status` (`Quality.command.ts:4026`).
- Per-unit telemetry: `readRunScopeTelemetry` `RunScope.ts:325`
  (`systemctl --user show <unit> -p MemoryPeak,TasksCurrent`).

**Missing**
- **No PSI reader.** Nothing reads `/proc/pressure/{cpu,memory,io}` or cgroup
  `*.pressure`, and nothing reads `/proc/loadavg`. A small `HostPressure` reader is NET-NEW.
- Remote hosts (dankserver, fleet) need Prometheus over the tailnet. No query driver exists
  (backend adapters go to `packages/drivers/*` per DECISIONS "Where do the Palantiri MCP
  server and CLI live?").

**Freshness**
- Bound: 15 s for the local host (PSI `avg10` is a 10 s window). `asOf` = read time.
- `stale`: never for a live local read. A cached parcel goes stale after 15 s.
- `unreachable`: `/proc/pressure` absent (kernel without PSI, macOS, container) or a remote
  host; vendor cloud VMs always (BRIEF / DECISIONS).
- `attribution-incomplete`: PSI present but the admission state dir is unreadable, or leases
  reference dead units (`dead` non-empty).

## Parcel 4 — App error classes (key: `app`)

**Sources today**
- No local error telemetry store. Shapes exist: `CauseClassification` and `CauseFingerprint`
  (`packages/foundation/capability/observability/src/CauseDiagnostics.ts:63,140`,
  `fingerprintCause` `:452`), `ObservedExitSummary` `:279`, and `layerErrorReporter`
  (`server/ErrorReporting.ts:155`, console only).
- The local dev sink `grafana/otel-lgtm` (`docker-compose.yml:35-41`) exposes only Grafana
  (`127.0.0.1:4000`) and OTLP ingest. Tempo/Loki are not published, and queries need
  Grafana API auth.
- `@beep/phoenix` (`packages/drivers/phoenix/src/Phoenix.service.ts:18`) only annotates spans.
  There is no span query.
- `HttpApiTelemetry` (`server/HttpApiTelemetry.ts:257,606`) emits status-class metrics,
  but only to an exporter.

**Missing**
- Everything. With the store deferred (D1), this parcel can only answer
  `Unknown{unreachable}` (or a new `no-source` reason) until a Tempo/Phoenix query
  adapter lands in `packages/drivers/*`. Optional local stopgap: count
  `ProofJobRecord.terminationReason`/`outcome` classes (repo tooling, not apps). Don't
  label that "app".

**Freshness**
- Bound: 5 min once a store exists. Today `Unknown{unreachable}` always, with the reason
  naming the missing adapter.

## Parcel 5 — Since last check (key: `session`)

**Sources today**
- `SessionLedger` `packages/tooling/tool/cli/src/commands/Session/SessionLedger.service.ts:58-61`
  (`append`, `list(repository)`), tag `:78`, `makeSessionLedgerLive` `:142` (dir from
  `BEEP_SESSION_STATE_ROOT` or `$XDG_STATE_HOME/beep/sessions` /
  `$HOME/.local/state/beep/sessions`, file `<host>__<owner>__<name>.jsonl`,
  `WorkstationState.ts:66-80`), layer `layerSessionLedgerLive` `:176`.
- `SessionLedgerRow` `Session.schemas.ts:112` (`checkout`, `lane`, `branch`, `state`, `pr`,
  `harness`, `sessionId`, `recordedAt`). `openSessionRows` `:210` = newest per checkout,
  not done.
- Yeet hook state `.beep/inbox/sessions/*` (`YeetHookSessionState` `InboxView.ts:740`:
  `seenIds`, `firstSeenAt`; `loadYeetHookFirstSeen` `:836`): a per-harness-session record of
  which inbox rows were already handed over.

**Missing**
- No per-session parcel-read cursor. NET-NEW: a cursor JSONL under
  `resolveWorkstationStateDir({ override: "BEEP_PALANTIRI_STATE_ROOT", store: "palantiri" })`,
  keyed by `sessionId` (from harness env) or by checkout. Default "last check" = that
  session's newest ledger `recordedAt`.
- The reducer composes deltas of parcels 1-3 (and 4 when it exists) against cursor-time
  snapshots. That requires the parcel cache files above.

**Freshness**
- Bound: inherits the min of the composed parcels. The output carries each child's
  `Freshness`.
- `attribution-incomplete`: no `sessionId` (ledger `sessionId: null`, so the cursor falls
  back to checkout) or a corrupt ledger (`DecodedSessionLedger.corruptLineCount > 0`,
  `SessionLedger.service.ts:80`).

---

## Infrastructure to reuse

### MCP host pattern (`@beep/mcp-kit`)
- Kit: `packages/foundation/capability/mcp-kit/src/` exports `sanitizedToolkit`
  (`SanitizedSpan.ts:604`), `gatedLayer`/`composeGatedLayers` (`ToolkitComposition.ts:90,136`),
  `handshakeMcpProtocols`, `annotateFourHints`/`readOnlyToolHints` (`ToolAnnotations.ts`),
  `FieldTier`, `TierGate`.
- Template: **`packages/drivers/gov-legal-mcp`** (the only host that pins stderr logging)
  and the smaller `packages/drivers/uspto-mcp`. Layout: `src/{bin,Server,Tools,Handlers,index}.ts`,
  `AGENTS.md`, `README.md`, `docgen.json`, `tsconfig{,.check}.json`, `package.json`
  `exports` `"./*": "./src/*.ts"`.
  - `bin.ts`: `Layer.launch(makeServerLayer(cfg).pipe(Layer.provide(NodeStdio.layer)))`
    `.pipe(Effect.provideService(Logger.LogToStderr, true), NodeRuntime.runMain)`
    (`gov-legal-mcp/src/bin.ts:48-52`), with an `import.meta.main` guard.
  - `Server.ts`: `McpServer.layerStdio({ name, version, instructions, protocols: handshakeMcpProtocols })`
    under `composeGatedLayers(gatedLayer(auth, sanitizedToolkit(Toolkit).pipe(Layer.provide(HandlersLive))))`,
    `Layer.orDie` (`uspto-mcp/src/Server.ts`).
  - Tools: `annotateFourHints(Tool.make("name", { parameters, success, failure }))`;
    handlers `Toolkit.toLayer({ name: Effect.fn("X.name")(...) })` (`uspto-mcp/src/UsptoHandlers.ts:109-122`).
  - The palantiri tools are read-only and need no credential, so `gatedLayer` stays trivial (or is skipped).
- Exporter: MCP children lose `OTEL_*` (SPEC), so `palantiri-mcp` reads its own config,
  e.g. `BEEP_PALANTIRI_OTLP_URL`.

### CLI command groups
- Group = `commands/<Group>/` with `<Group>.command.ts` / `.schemas.ts` / `.errors.ts` /
  `.service.ts` / `index.ts` (`07-non-slice-families.md:333-362`). Accounts example:
  `Accounts.command.ts` builds `Command.make("status", { json }, Effect.fn(...))` with
  `Command.provide(layerAccountsUsageLive)` (`:51-82`). The group `Command.make("accounts", ...)`
  takes `Command.withSubcommands([...])` (`:111-123`). `index.ts` is `export *` facades.
- Registration: import in `packages/tooling/tool/cli/src/commands/Root.ts` and add to
  `rootCommand`'s `withSubcommands` list (`Root.ts:78-125`). Re-export from
  `src/index.ts` (`:21`) and add `./commands/Palantiri` to `package.json` `exports`.
- `--json` convention: one encoded document via a `JsonStringCodec`
  (`src/internal/schema/JsonCodec.ts`, CLI-internal; outside the CLI use `S.fromJsonString`).
- **No CLI command serves through HttpApi today.** In-repo HttpApi precedents: tooling contract
  `QaCollectorApi` (`packages/tooling/library/qa-capture/src/Collector.api.ts:341`) served by
  `HttpApiBuilder.layer` (`Collector.service.ts:445`), imports from `effect/http-api`.
  For in-process use without a socket: `HttpRouter.toWebHandler`
  (`.repos/effect/packages/effect/src/http/HttpRouter.ts:1449`) + `HttpClient.make`
  (`http/HttpClient.ts:680`) + `HttpApiClient.make` (`http-api/HttpApiClient.ts:524`).
  `HttpApiTest.groups` (`http-api/HttpApiTest.ts:44`) does exactly that, but it's marked testing.
- **`TRACEPARENT`: nothing honours it.** The only parser is header-based:
  `extractTraceContextHeaders` (`packages/foundation/capability/observability/src/server/TraceContext.ts:32`)
  → `HttpTraceContext.fromHeaders` (`effect/http/HttpTraceContext.ts:67`). Plan: read
  `TRACEPARENT`/`TRACESTATE` via `Config.option`, build `{ traceparent }` headers, then
  `Effect.withParentSpan(external)` around the handler. With the in-process HttpApi client,
  the client propagates it as a header for free.

### `beep session open` (push hook point)
- `sessionOpenCommand` `packages/tooling/tool/cli/src/commands/Session/Session.command.ts:193-230`:
  reads `sessionCheckoutFacts(cwd)` + `SessionLedger.list`, then prints JSON
  (`SessionOpenReport` `session-open/v1`, `Session.schemas.ts:166`) or text lines via `Console.log`
  (`:210-223`). Hot parcels go after `:223`, and as an optional field on a
  `session-open/v2` report.
- **Caveat:** the Claude SessionStart hook does *not* run this command. `.claude/hooks/session-ledger.sh`
  reads the ledger JSONL directly with `jq` for speed (`:16-33`). Pushing parcels at session start
  therefore means either the hook also `jq`-reads a pre-staged parcel cache file, or it calls
  `beep palantiri hot` with a tight timeout. A live account poll is too slow for a hook.

### Instrumentation catalog
- `@beep/observability/catalog` (`packages/foundation/capability/observability/src/catalog/index.ts`)
  re-exports `Observability.instruments.ts`, behaviour, errors, literals, models, names.
  - `InstrumentDeclarations` `Catalog.models.ts:438` (`attributes`, `instruments`);
    `MetricInstrument` `:169` (`name`, `owner`, `attributes`, `minTier`, `description`, `kind`,
    `unit`, `boundaries?`); `SpanInstrument` `:253` (`name`, `owner`, `family`, `attributes`,
    `minTier`, `kind`, ...); `AttributeKey` `:105`; `EmitterContext` `:852` (Workstation, Server,
    StrictDesktop, CiRunner, CloudVm, Serverless, Browser); `TelemetryTier`
    `Catalog.literals.ts:41`; `MetricName` pattern `beep.<area>.<noun>` (`Catalog.names.ts:137`);
    `SpanName` `Concept.action` (example literally `Parcels.read`, `:51-60`).
  - Example declarations file: `packages/foundation/capability/observability/src/Observability.instruments.ts`
    (`InstrumentDeclarations.make({ attributes: [AttributeKey.make({...})] })`).
- Discovery: `InstrumentationCatalog` (`packages/tooling/tool/cli/src/commands/Observability/Observability.service.ts:92`)
  globs `packages/**/src/**/*.instruments.ts` and `apps/**/src/**/*.instruments.ts` (`:50`),
  `import()`s each, and keeps every export passing `isInstrumentDeclarations`. A file with none fails (`:134-155`).
  Run `bun run beep observability catalog --write|--check`.
  So `packages/tooling/library/palantiri/src/Palantiri.instruments.ts` exporting
  `PalantiriInstruments` (gauge `beep.accounts.window_remaining`, unit `%`; span `Parcels.read`) is
  picked up with no wiring. Note: the `beep.*` v2 attribution keys (`beep.harness`, `beep.lane`,
  `beep.session`, ...) are still owed by `observability-kernel-catalog` P2 (its `PLAN.md:31`).

### Package creation
- `bun run beep create-package <name> --family tooling --kind library|tool [--description ...] [--dry-run]`
  (`packages/tooling/tool/cli/src/commands/CreatePackage/CreatePackage.command.ts:1148-1210`;
  tooling kinds `library, tool, policy-pack, test-kit` `:150`). It registers the `$...Id` identity
  composer automatically (`CreatePackage/internal/IdentityRegistration.ts`).
- `packages/tooling/library/palantiri` → `--family tooling --kind library` (name `palantiri`).
- `packages/tooling/tool/palantiri-mcp` → `--family tooling --kind tool`. It would be the
  first MCP host outside `packages/drivers/*`. That's consistent with DECISIONS (repo-ops → tooling),
  but check whether the arch lints assume `*-mcp` lives in drivers.

### OTLP exporter for a CLI process
- **The `beep` CLI sets up no tracing or exporter.** `bin-main.ts` builds `BaseLayers`
  (`BunServices`, `BunHttpClient`, `BunCrypto`, `:119`) and `DerivedLayers` (`:288`) only. Spans from
  `Effect.fn` names go nowhere.
- Reusable: `layerLocalLgtmServer(config)` (`packages/foundation/capability/observability/src/server/Layer.ts:54-108`):
  `Otlp.layer({ baseUrl, resource, ...intervals, shutdownTimeout: 3s })` with protobuf serialization,
  config `ServerObservabilityConfig` (`server/Config.ts:39`, `otlpBaseUrl`, `otlpEnabled`,
  `otlpResourceAttributes`). It needs `HttpClient` (already in `BaseLayers`). For short CLI runs the
  metric/trace intervals (10 s / 5 s) mean data only leaves on scope shutdown, so the 3 s
  `shutdownTimeout` must cover the flush. Provide it per command (`Command.provide`), not globally,
  so other commands stay exporter-free.

---

## Gaps and risks

1. **Dependency direction:** every reader lives in `@beep/repo-cli`, and the library and MCP can't import it.
   Decide between ports + CLI-shell-out and extraction (see headline) before P1 code.
2. **Identity leakage:** `AccountRef.label`/`source` and `Ok.identity` contain emails and home paths.
   The reducer must project to ordinal/hash. Add a test that the encoded parcel matches no `@` or `/`.
3. **Latency:** account poll is network-bound, up to 20 s per account. `session open` and the SessionStart hook
   need a pre-staged cache, so add a cache writer (on each `palantiri parcel` read, or a timer).
4. **No PSI reader**, and no remote host source until a Prometheus driver exists.
5. **App error classes has no source**, so it ships honestly as `Unknown`. Consider a `no-source` reason
   distinct from `unreachable`.
6. **No CLI exporter / no `TRACEPARENT` handling:** both NET-NEW, and the kernel goal owns the exporter
   (MAP sequencing). Coordinate so the CLI layer lands once.
7. **Short-lived process flush:** OTLP batching with a 5-10 s interval loses data unless scope finalizers run.
   Verify with an in-memory capture.
8. **Cardinality:** the gauge's labels are `provider`, `window.kind` and the account ordinal (bounded). Never
   lane/session/label; registry `cardinality` must say so.
9. **Inbox location:** `.beep/inbox`, not `.beep/yeet`. Cross-checkout reads depend on the session ledger's
   checkout list being current.
10. **HttpApi in-process client** rides `HttpRouter.toWebHandler`. `HttpApiTest` is test-flavoured;
    confirm stability tags in `.repos/effect` before relying on it.
11. **MCP placement:** `palantiri-mcp` would be the first MCP host outside `packages/drivers/*`. Check that
    the architecture lints accept it.

## Proposed P1 slice (account headroom, end to end)

Create `@beep/palantiri` (`--family tooling --kind library`) with
`src/Freshness.ts` (`Fresh | Unknown{reason: stale|unreachable|attribution-incomplete}` tagged union),
`src/ParcelSpec.ts`, `src/AccountHeadroom.parcel.ts` (`AccountHeadroomParcel` S.Class: `provider`,
`accountOrdinal`, `windows[{kind, remainingPercent, resetsAt}]`, `asOf`, `sources[]`, `freshness`, plus
the pure reducer from an `AccountUsage`-shaped input decoded locally, so the library does not import the CLI),
`src/Parcels.service.ts` (contract + `AccountHeadroomSource` port tag), `src/Parcels.api.ts` (HttpApi
group `parcels`, endpoint `GET /parcels/account-headroom`), and `src/Palantiri.instruments.ts`
(`beep.accounts.window_remaining` gauge, `Parcels.read` span). In the CLI add
`commands/Palantiri/{Palantiri.command.ts,Palantiri.service.ts,index.ts}`: `parcel account-headroom --json`
provides the port from `layerAccountsUsageLive`, serves the handler through the in-process HttpApi client,
wraps it in `Parcels.read` under the `TRACEPARENT` parent, sets the gauge, and provides an OTLP layer built
from `layerLocalLgtmServer`. Register it in `Root.ts`, `src/index.ts` and `package.json` exports. Tests:
a vitest decoding `Fresh` and `Unknown{stale}` (an `asOf` older than 60 s via `TestClock`), and an
in-memory OTLP capture asserting gauge name/unit/attribute keys against the catalog. `palantiri-mcp`,
`session open` push and parcels 2-5 follow in later phases.
