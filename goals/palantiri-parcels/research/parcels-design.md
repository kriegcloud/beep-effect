# Parcels design (P0)

2026-10-14. Built from [`source-survey.md`](./source-survey.md) and
[`explorations/observability-palantiri/MAP.md`](../../../explorations/observability-palantiri/MAP.md).
Order: schema, then the `Context.Service` contract, then implementation.

## Package boundary

Every local source a parcel reads (`AccountsUsage`, `SessionLedger`, the yeet
inbox and proof jobs, admission and memory stats) lives in `@beep/repo-cli`,
and no package may depend on the CLI. So:

- `@beep/palantiri` (`packages/tooling/library/palantiri`, created with
  `beep create-package --family tooling --kind library`) owns the schemas,
  `Freshness`, `ParcelSpec`, the five parcel classes and their pure reducers,
  one source port (`Context.Service`) per parcel, the `Parcels` service, the
  HttpApi contract, and `Palantiri.instruments.ts`. Reducers take inputs
  decoded by the library's own input schemas; the library never imports the CLI.
- `@beep/repo-cli` adds `commands/Palantiri/`: it implements each port from
  its existing services and serves the contract twice, as
  `beep palantiri parcel <name> [--json]` and as `beep palantiri mcp`, an MCP
  stdio host. Both run the same handlers through an in-process HttpApi client,
  so the CLI and MCP JSON are identical by construction. Precedent:
  `beep agent-message` already hosts `McpServer.layerStdio`
  (`commands/AgentMessage/AgentMessage.tools.ts`).
- No `packages/tooling/tool/palantiri-mcp` package. The SPEC target surface
  is replaced by `beep palantiri mcp` (Decision Log).

## Schemas

```text
Freshness   = Fresh { asOf }
            | Unknown { reason: stale | unreachable | attribution-incomplete | no-source, asOf?: DateTime, detail?: string }
ParcelKey   = session | lane | host | pr | app | account      (LiteralKit)
ParcelSpec  = { id, key: ParcelKey, freshnessBound: Duration, sources: NonEmpty<SourceId> }
Parcel<A>   = { spec, freshness: Freshness, summary: string, items: A[], receipt: { shown, total } }
```

- `Freshness` is checked at read time, at two levels (revised 2026-10-14
  after P1's live run, where one 14-hour-old collector snapshot made the
  whole parcel read stale):
  - **Item freshness.** Every item carries its own `freshness`. A reading
    within the parcel's bound is `Fresh{asOf}`; an older one is
    `Unknown{stale, asOf}`; an item whose source failed (a failed poll, a
    login that needs renewing) is `Unknown{unreachable}`.
  - **Envelope freshness** describes the read itself. It is `Fresh` when
    the poll or snapshot it served from is within the bound;
    `Unknown{stale}` only when it served a snapshot past the bound because
    the live poll failed; `Unknown{attribution-incomplete}` when an expected
    emitter produced no item at all (for account headroom: a provider the
    host has configured, from its stored logins and collector snapshot
    files). `no-source` is for a parcel whose source does not exist yet (app
    error classes before the query adapter); `unreachable` is for a source
    port that failed outright.
  - The summary leads with the split, for example
    `11 of 13 accounts fresh; 1 stale (grok-bot), 1 unreachable (codex)`.
  - Gauges emit only items whose own freshness is `Fresh`, so a stale
    reading never looks current in Grafana.
- Responses are capped at a budget (default 20 items) and summary-first, with
  an "N of M" receipt.

| Parcel | Key | Bound | Source (port) | Notes |
| --- | --- | --- | --- | --- |
| account-headroom | account | 5 min | `AccountsUsage` report, cached | Ordinal identity per provider, never a label or email. A live poll takes up to 20 s per account, so the CLI writes a snapshot under `$HOME/.local/state/beep/palantiri/` and serves it while fresh. |
| lane-reds | lane | 10 min | yeet inbox `.beep/inbox` + proof jobs `.beep/yeet/jobs` | Per checkout. Open P0/P1 rows and failed jobs. |
| host-pressure | host | 1 min | `/proc/pressure/{cpu,memory,io}`, `/proc/meminfo`, admission slots | PSI is a new reader. A vendor cloud VM without PSI is `Unknown{unreachable}`. |
| app-error-classes | app | 15 min | Grafana datasource query of the local dev sink, when reachable | `Unknown{no-source}` until the query adapter lands (deferred in P2, Decision Log). |
| since-last-check | session | none (event-sourced) | session ledger + a per-session read cursor | The cursor is new state next to the ledger. |

## P2 as built (2026-10-15)

Deviations from the table above, each with a Decision Log row in `SPEC.md`:

- **Items are tagged by item kind**, not parcel kind. `ParcelItem` is
  `AccountHeadroom | LaneRed | PressureStall | HostMemory | AdmissionSlots |
  SessionChange`; host pressure serves three item kinds.
- **lane-reds** reads the current checkout plus every live checkout the
  session ledger lists for the repository (a checkout that no longer exists
  is skipped). An inbox row is a red when it is P0 or P1, asks for work (not
  `base-drift`, `pr-merge-ready` or `proof-job-finished`), and is neither
  acknowledged nor superseded. A proof job is a red when it is the newest
  settled job on its branch and it failed (failure verdict, or terminated for
  any reason but a cancel). Item freshness is the observation time against
  the 10-minute bound. Envelope: `Fresh` when every checkout read cleanly,
  `attribution-incomplete` for an unreadable inbox or job listing or skipped
  inbox lines, `unreachable` when nothing could be read. Summaries are built
  from structured fields only, never a comment excerpt or author.
- **host-pressure** parses `/proc/pressure/{cpu,memory,io}` in the library
  (`parsePressureLine` tokenizes, the `PressureLine` schema decodes; an
  unknown scope, a non-number or a percent outside 0..100 is malformed). The
  CLI port reads the files, `MemoryStats` and the admission snapshot. No
  `/proc/pressure` is `Unknown{unreachable}`; a missing or unparsable
  resource file, or a missing memory or admission reading, is
  `attribution-incomplete`. Gauge `beep.host.pressure_stall` (`%`, label
  `beep.resource`: cpu, memory, io) records PSI some avg10 from fresh
  readings only.
- **app-error-classes** has no source port: it is served as
  `Unknown{no-source}` with no items until the query adapter exists.
- **since-last-check** has an infinite bound (`Duration.infinity`). The
  session is `--session`, else `CLAUDE_CODE_SESSION_ID`, else
  `CODEX_THREAD_ID`; none is `Unknown{attribution-incomplete}` and moves no
  cursor. The cursor is `cursors/<host>__<owner>__<name>/<session>.json` under
  the Palantiri state directory (`$HOME/.local/state/beep/palantiri/` by
  default), written to a uniquely named temporary file and renamed over the
  cursor. With no cursor, the baseline is the session's own newest ledger
  note; with neither, everything is new. The session's own notes are left
  out. The cursor moves to the read time taken before the sources are read,
  so a row written during the read shows up again rather than never. A
  cursor that cannot be saved is noted in the summary.
- **Free text is redacted** (`redactText`): addresses become `[email]`, any
  other `@` is dropped, and home-absolute paths start with `$HOME`. A parcel
  never carries `@`.
- **Summaries name at most five labels per unknown reason**, then `+N more`
  (the first live lane-reds run had 19 stale lanes).
- `beep palantiri parcels` lists every parcel's key, bound and sources;
  every `parcel <id>` takes `--json` and `--budget N`.

## Contract

- `Parcels` (`Context.Service`): `read(id, options) -> Effect<ParcelEnvelope, ParcelError>`.
  `ParcelError` is a tagged union: `UnknownParcel`, `SourceFailed`.
  A source failure becomes `Unknown{unreachable}`, not an error.
- One port per parcel with a source, for example `AccountHeadroomSource.snapshot -> Effect<AccountsInput>`;
  `SinceLastCheckSource` also has `advance(session, at)`. App error classes has none yet.
- HttpApi group `parcels`: `GET /parcels/:id` returns the encoded envelope.

## Telemetry

- `Palantiri.instruments.ts`: the span `Parcels.read`, with attributes
  `beep.parcel` (static) and `beep.parcel_freshness` (static: fresh | unknown),
  and the gauge `beep.accounts.window_remaining` (unit `%`, labels
  `beep.provider` and `window`). Account ordinals stay span attributes, never
  metric labels.
- The CLI honours `TRACEPARENT`: it parses the W3C header into an external
  parent span, so `Parcels.read` nests under the caller's trace.
- Export: an OTLP layer for the CLI process, configured from the standard
  `OTEL_EXPORTER_OTLP_ENDPOINT` or the `beep` config. The scope finalizer
  flushes on exit. With no endpoint configured, nothing is exported. The MCP
  host carries its own exporter config, because Claude Code strips `OTEL_*`
  from MCP children.
- Attribution keys come from `AiMetricsInstruments` (#1806).

## Phases

- P1 slice: package, schemas, the account-headroom parcel, `beep palantiri parcel account-headroom --json`, the `Parcels.read` span, the gauge, and `TRACEPARENT` handling.
- P2: parcels 2–5 (complete 2026-10-15; see "P2 as built").
- P3: `beep palantiri mcp`, the hot parcels in `beep session open`, and the staged hot file for the SessionStart hook.
