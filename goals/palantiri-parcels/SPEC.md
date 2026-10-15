# Palantiri Parcels Spec

## Objective

Agent-facing Palantiri: schema-typed, freshness-checked parcels served through beep palantiri and palantiri-mcp, starting with account headroom.

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

- `packages/tooling/library/palantiri/**` (NET-NEW)
- `beep palantiri mcp` (stdio MCP host in `@beep/repo-cli`; replaces the planned `palantiri-mcp` package, Decision Log)
- `packages/tooling/tool/cli/src/commands/Palantiri/**` (NET-NEW group) and `Accounts/` (quota gauge)
- `SessionLedger` / `beep session open` push

## Constraints

- Every parcel is an `S.Class` from a ParcelSpec: typed key (session | lane | host | pr | app | account), freshness bound, sources, pure reducer; `Freshness = Fresh | Unknown{reason}` checked at read time.
- One HttpApi contract serves both the CLI and the MCP server; CLI-first, honouring `TRACEPARENT`.
- Responses are budget-capped with "N of M" receipts and summary-first shape (Axiom pattern, `explorations/observability-palantiri/research/handoff/agent_facing_tooling.md`).
- The MCP server and CLI carry their own exporter config (Claude Code strips `OTEL_*` from MCP children).
- Completeness check downgrades to `Unknown{attribution-incomplete}` when expected emitters are silent; vendor cloud VMs report `Unknown{unreachable}`.
- Account identity is an ordinal or salted hash, never an email.
- Schema → `Context.Service` contract → implementation; Effect v4 only, validated against `.repos/effect`; `effect/<Module>` imports; `HashMap`/`HashSet`; `Effect.fn`/`fnUntraced`.
- Names, metrics, events and attribute keys come from the instrumentation catalog (`goals/observability-kernel-catalog`); names are static literals, never interpolated.
- Public repo: no client data, tokens, `op://` resolutions, LAN IPs, tailnet suffixes or account identifiers in packet or code.
- Totals use `increase()` over the panel range; per-process identity never becomes a metric label; promoted labels come only from the registry's metric-safe set.

## Acceptance Criteria

- [ ] First vertical slice (`explorations/observability-palantiri/MAP.md`): `beep palantiri parcel account-headroom --json` decodes to `Fresh`/`Unknown{stale}`, and the run exports a `beep.accounts.window_remaining` gauge and a `Parcels.read` span carrying `beep.*` v2 attributes, nested under the caller's trace.
- [ ] Five parcels ship: account headroom, lane reds, host pressure, app error classes, since-last-check.
- [ ] `beep palantiri mcp` exposes the same parcels with identical encoded JSON; stdio host pins `Logger.LogToStderr`.
- [ ] `beep session open` prints the hot parcels.
- [ ] No unrelated refactors or formatting churn.

## Verification Matrix

| Check | Command or evidence | Required result |
| --- | --- | --- |
| Packet launcher size | `test "$(wc -m < goals/palantiri-parcels/GOAL.md)" -le 4000` | Passes |
| Manifest JSON | `jq . goals/palantiri-parcels/ops/manifest.json` | Passes |
| Whitespace | `git diff --check -- goals/palantiri-parcels` | Passes |

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
| 2026-10-14 | P0: parcel schemas, reducers, source ports, the `Parcels` service, the HttpApi contract and the instruments live in `@beep/palantiri` (tooling library); `@beep/repo-cli` implements the ports and serves the contract. Design: `research/parcels-design.md`. | Every source lives in the CLI and nothing may depend on it (`research/source-survey.md`). | Extract the source readers into a shared library and move the port implementations there. |
| 2026-10-14 | P0: the MCP host is the `beep palantiri mcp` stdio subcommand instead of a `packages/tooling/tool/palantiri-mcp` package. It runs the same handlers as `beep palantiri parcel`, so the encoded JSON is identical. | Same dependency constraint; the CLI already hosts `McpServer.layerStdio` (`beep agent-message`); one boot per session, not per call. | Create the package and have it call the CLI. |
| 2026-10-14 | P0: `Freshness.Unknown` gains the reason `no-source` for a parcel whose source does not exist yet. App error classes answer it until the Grafana datasource query adapter lands in P2. | Honest output beats a fake parcel; the exploration's three reasons don't cover a missing source. | Drop the reason and hold the parcel back. |
| 2026-10-14 | P0: account headroom serves a CLI-written snapshot under `$HOME/.local/state/beep/palantiri/` while it is within 5 minutes, and polls live otherwise. | A live `AccountsUsage` poll takes up to 20 s per account. | Always poll live. |
| 2026-10-14 | P1: the quota gauge's window label is `beep.window`, not `window`. | Catalog attribute keys must be dotted (`AttributeKeyName` pattern); `beep.provider` stays the key `@beep/repo-ai-metrics` declares. | Relax the catalog key pattern and rename the label. |
| 2026-10-14 | P1: `beep.accounts.window_remaining` carries one series per provider, window and `beep.window_scope` (the model group of a scoped window, or `all`), valued at the most headroom any of that provider's accounts has within that group; `beep.provider` uses the `AgentProvider` spellings (claude → anthropic, codex → openai, grok and grok-bot → xai, muse → meta, junie → jetbrains, cursor → cursor). A snapshot provider outside that map emits no gauge. | Account ordinals must never be metric labels, so several accounts share a series; "best headroom" is the actionable value. | Add `beep.provider_account` as a label (bounded) and emit per account. |
| 2026-10-14 | P1: the `Parcels.read` span and the gauge are emitted inside the library's `Parcels.read`, owned by `@beep/palantiri`; hosts only add the `TRACEPARENT` parent (`withTraceParent`, also in the library so the MCP host reuses it). | The catalog owner of both instruments is the library; every host gets them for free. | Move emission into each host. |
| 2026-10-14 | P1: the in-process client is `HttpApiTest.groups` (`HttpRouter.toHttpEffect` + `HttpApiClient.makeWith`), not `HttpRouter.toWebHandler`. | `toWebHandler` builds its own runtime, so the handler would lose the caller's tracer, parent span and metric registry; `toHttpEffect` runs it in the caller's fiber through the same encode/route/decode pipeline. | Swap in `toWebHandler` with the telemetry layer inside its app layer. |
| 2026-10-14 | P1: `Parcels.read` fails only with `UnknownParcel`; `SourceFailed` from a port becomes `Unknown{unreachable}`. A live poller that cannot start becomes a source whose every read fails. Parcel items carry `state` (ok, needs-login, failed) and each window's `scope`; envelopes carry `schemaVersion` and `readAt`, and an optional `budget` query (default 20). | Honest unknowns over command failures; scoped windows are otherwise indistinguishable. | Drop the fields and widen the error channel. |
| 2026-10-14 | P1: freshness has two levels. Each item carries its own (`Fresh`, `Unknown{stale, asOf}` past the bound, `Unknown{unreachable}` for a failed poll or expired login); the envelope's describes the read: `Fresh` when the served poll or snapshot is within the bound, `Unknown{stale}` only when a stale snapshot was served because the live poll failed, `Unknown{attribution-incomplete}` when a configured provider produced no item. The summary leads with the split, and the gauge emits only fresh items. The source port now serves `AccountHeadroomInput` (report plus expected providers). | The P1 live run read `Unknown{stale}` because one collector snapshot was 14 hours old: a single stale reading made the whole parcel look stale, so it nearly always would. | Collapse back to one envelope freshness over every reading's `asOf`. |
| 2026-10-15 | #1817 review round 2: the account snapshot directory is created `0700` and the file written `0600` (it carries account labels), and a failed provider listing is `None` on `AccountHeadroomInput.expectedProviders`, which makes a fresh read `Unknown{attribution-incomplete}` ("provider listing unavailable") instead of treating it as "no providers expected". | Another local user must not read account labels; an unknown provider set must not look like complete attribution, while the stale-snapshot fallback still serves. | Revert the modes and return to an empty-list fallback. |

## Exception Ledger

| Exception | Scope | Owner | Rationale | Removal condition |
| --- | --- | --- | --- | --- |
| None | N/A | N/A | N/A | N/A |
