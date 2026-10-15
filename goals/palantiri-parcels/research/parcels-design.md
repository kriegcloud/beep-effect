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

- `Freshness` is checked at read time: `Fresh` only when every source's
  `asOf` is within `freshnessBound` and every expected emitter reported.
  Otherwise the first failing rule names the reason. `no-source` is for a
  parcel whose source does not exist yet (app error classes before the query
  adapter).
- Responses are capped at a budget (default 20 items) and summary-first, with
  an "N of M" receipt.

| Parcel | Key | Bound | Source (port) | Notes |
| --- | --- | --- | --- | --- |
| account-headroom | account | 5 min | `AccountsUsage` report, cached | Ordinal identity per provider, never a label or email. A live poll takes up to 20 s per account, so the CLI writes a snapshot under `$HOME/.local/state/beep/palantiri/` and serves it while fresh. |
| lane-reds | lane | 10 min | yeet inbox `.beep/inbox` + proof jobs `.beep/yeet/jobs` | Per checkout. Open P0/P1 rows and failed jobs. |
| host-pressure | host | 1 min | `/proc/pressure/{cpu,memory,io}`, `/proc/meminfo`, admission slots | PSI is a new reader. A vendor cloud VM without PSI is `Unknown{unreachable}`. |
| app-error-classes | app | 15 min | Grafana datasource query of the local dev sink, when reachable | `Unknown{no-source}` until the query adapter lands (P2). |
| since-last-check | session | none (event-sourced) | session ledger + a per-session read cursor | The cursor is new state next to the ledger. |

## Contract

- `Parcels` (`Context.Service`): `read(id, options) -> Effect<ParcelEnvelope, ParcelError>`.
  `ParcelError` is a tagged union: `UnknownParcel`, `SourceFailed`.
  A source failure becomes `Unknown{unreachable}`, not an error.
- One port per parcel, for example `AccountHeadroomSource.snapshot -> Effect<AccountsInput>`.
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
- P2: parcels 2–5.
- P3: `beep palantiri mcp`, the hot parcels in `beep session open`, and the staged hot file for the SessionStart hook.
