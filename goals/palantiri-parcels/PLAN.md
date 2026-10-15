# Palantiri Parcels Plan

## Status

Status: `pending`

## Phases

| Phase | Status | Goal | Exit criteria |
| --- | --- | --- | --- |
| P0 Research | complete | Parcel specs, sources per parcel, HttpApi contract. | Schemas drafted; sources verified. |
| P1 Slice | complete | Account-headroom parcel + gauge + CLI. | First vertical slice verified live. |
| P2 Parcels | complete | Remaining four parcels + completeness check. | Decode + freshness tests green. |
| P3 MCP + session | pending | palantiri-mcp host; session-open push. | MCP handshake smoke green. |
| P4 Yeet | pending | PR to mergeable. | Merge gate passes. |
| P5 Close | pending | Reflection; packet flip. | completed-retained. |

## Closeout Checklist

Before marking the packet closed:

1. Write a closeout reflection via the `/reflect` skill to
   `history/reflections/<YYYY-MM-DD>-<agent>.md`. Its YAML frontmatter must
   validate against `ReflectionFrontmatter`.
2. Run `bun run beep lint reflection-artifacts`.
3. Update `README.md` (status, latest evidence) and `ops/manifest.json` phase
   statuses + `initiative.status`.

## Execution Notes

### P0 Research (complete, 2026-10-14)

- Design: [`research/parcels-design.md`](./research/parcels-design.md);
  sources: [`research/source-survey.md`](./research/source-survey.md).
  Decisions are in the `SPEC.md` Decision Log.

### P1 Slice (complete 2026-10-15)

- `@beep/palantiri` (`packages/tooling/library/palantiri`, private, created
  with `beep create-package palantiri --family tooling --kind library`):
  `Freshness` + `checkFreshness`, `Parcel.models` (key, id, source, spec,
  budget, receipt, read options), `ParcelEnvelope.models` (item union, draft,
  envelope), `AccountHeadroom.models` (accounts-status/v2 input decoded
  locally, anonymized item), `AccountHeadroom` (spec, 5-minute bound, pure
  reducer), `Parcels.errors`, `Parcels.service` (`AccountHeadroomSource`
  port, `Parcels`, `layerParcels`), `Parcels.api` (`PalantiriApi`, group
  `parcels`, `GET /parcels/:id`, in-process `PalantiriClient`),
  `TraceParent` (W3C `TRACEPARENT` parent span), `Palantiri.instruments`.
- `@beep/repo-cli`: `commands/Palantiri/` registers
  `beep palantiri parcel account-headroom [--json]`; the source is the
  accounts poller behind a snapshot at
  `$HOME/.local/state/beep/palantiri/account-headroom.json` (served while
  under 5 minutes old); OTLP export only when `OTEL_EXPORTER_OTLP_ENDPOINT`
  is set.
- Catalog: `Parcels.read` span (`beep.parcel`, `beep.parcel_freshness`) and
  `beep.accounts.window_remaining` gauge (`%`, `beep.provider`,
  `beep.window`), regenerated with `beep observability catalog --write`.
- Cache baseline re-recorded for `@beep/palantiri` and `@beep/repo-cli`:
  [`research/cache-baseline-review-palantiri-p1.md`](./research/cache-baseline-review-palantiri-p1.md),
  request [`research/cache-baseline-request-palantiri-p1.json`](./research/cache-baseline-request-palantiri-p1.json).
- Two-level freshness (2026-10-15, SPEC Decision Log): every item carries
  its own `freshness` (`Fresh`, `Unknown{stale, asOf}`,
  `Unknown{unreachable}`); the envelope's describes the read (`Fresh` when
  the served poll or snapshot is within 5 minutes, `Unknown{stale}` only for
  a stale snapshot served after a failed live poll,
  `Unknown{attribution-incomplete}` when a configured provider has no item).
  The source port serves `AccountHeadroomInput` (report plus the providers of
  the stored logins and collector snapshot files). The gauge emits only
  fresh items. The first live run read `Unknown{stale}` for the whole parcel
  because one collector snapshot was 14 hours old; that is now an item-level
  fact.
- Live run (2026-10-15, workstation, `--json`): envelope freshness
  `Fresh{asOf: 2026-10-15T04:47:34.327Z}`, summary `10 of 13 accounts fresh;
  2 stale (cursor, grok-bot), 1 unreachable (codex); most weekly headroom:
  claude #3 at 100%`, receipt 13 of 13, no `@` in the JSON.
- `bun run beep lint policy-fingerprint --write` added the palantiri paths to
  `//#lint:policy-fingerprint` inputs in `turbo.json` (the CLI's policy-tool
  closure now includes `@beep/palantiri`); the root subject is in the same
  cache baseline review.
- Gates (2026-10-15, committed slice 644650bf92 plus the freshness change):
  `bun install`, `observability catalog --check`, `lint effect-vitest`,
  `lint schema-first`, the schema-opaque codemod `--check`,
  `turbo run check` for both packages, `quality cache-policy`,
  `lint package-scripts --write`, `lint policy-fingerprint --check`,
  `tsconfig-sync --check` and `package-verify @beep/palantiri` exit 0.
  `package-verify @beep/repo-cli` exits 1 only on the four
  `deprecated-apis lint command` tests, inherited from #1791 (they reproduce
  on main). `docgen:local` refuses because root inputs changed on the
  branch; both package-verify runs passed their package docgen.
- Not done in P1 (by design): OTLP export proven against a live collector
  (the layer is wired and flushes on scope close; no endpoint was set), the
  MCP host, `beep session open`, parcels 2-5.

### P2 Parcels (complete 2026-10-15)

- `@beep/palantiri`: `LaneReds.models` + `LaneReds` (inbox row and proof job
  inputs, `LaneRed` item, 10-minute bound), `HostPressure.models` +
  `HostPressure` (`parsePressureLine`/`parsePressureFile` over the
  `PressureLine` schema, `PressureStall`/`HostMemory`/`AdmissionSlots`
  items, 1-minute bound), `AppErrorClasses` (`Unknown{no-source}`, no port),
  `SinceLastCheck.models` + `SinceLastCheck` (ledger and inbox inputs,
  `SessionCursor`, `SessionChange` item, infinite bound), `Redaction`
  (`redactText`), `Freshness` (`isFreshItem`, `unknownSplit`, shared with
  account headroom), ports `LaneRedsSource`, `HostPressureSource`,
  `SinceLastCheckSource`, `parcelSpecs`, the `session` query on
  `GET /parcels/:id`, and the `beep.host.pressure_stall` gauge with the
  `beep.resource` key.
- `@beep/repo-cli`: live ports in `Palantiri.service.ts` (lane reds over
  the inbox view and proof-job listing of this checkout and the ledger's live
  lanes; host pressure over `/proc/pressure`, `MemoryStats` and the
  admission snapshot; since-last-check over the session ledger, the inbox
  and an atomically written cursor), `beep palantiri parcel <id> [--json]
  [--budget N]` for all five ids (`since-last-check` also takes
  `--session`), and `beep palantiri parcels`.
- Decisions: `SPEC.md` Decision Log rows dated 2026-10-15 (app error
  classes deferral, lane-reds scope, PSI split and gauge, cursor, redaction,
  item tagging and label cap); design deltas in
  [`research/parcels-design.md`](./research/parcels-design.md) "P2 as
  built".
- Live run (2026-10-15, workstation, `--json`; no `@` and no `/home/` in
  any envelope):
  - account-headroom: `Fresh`; `11 of 13 accounts fresh; 1 stale
    (grok-bot), 1 unreachable (codex); most weekly headroom: claude #3 at
    100%`.
  - lane-reds: `Fresh`; `0 of 83 reds fresh; 83 stale (practice-gateway,
    beep-effect, palantiri-parcels, beep-effect9, agent-message-lint-closeout,
    +13 more); 22 P0, 61 P1 across 18 lanes` (receipt 20 of 83). The stale
    reds are old, unacknowledged inbox rows across live lanes.
  - host-pressure: `Fresh`; `5 of 5 readings fresh; cpu 1.8%, memory 0%,
    io 3.5% stalled (some, avg10); 52.2 of 125.1 GiB available; admission 0
    of 8 tokens active, 0 queued`.
  - app-error-classes: `Unknown{no-source}`; `app error classes
    unavailable: no telemetry query adapter exists yet`.
  - since-last-check: `Fresh`; `12 changes since 2026-10-15T06:11:45.427Z:
    12 session notes (...), 0 inbox rows`; the baseline is the cursor the
    previous live read wrote.
- Gates (2026-10-15): `observability catalog --write` then `--check`,
  `lint effect-vitest`, `lint schema-first`, the schema-opaque codemod
  `--check` over the changed `.ts` files, `turbo run check` for both
  packages, `package-verify @beep/palantiri` and `@beep/repo-cli`,
  `quality cache-policy` (0 blocking findings, so no baseline request),
  `lint policy-fingerprint --check` and `tsconfig-sync --check` exit 0.
  No inventory under `standards/` grew; the only `standards/` changes are
  the regenerated instrumentation catalog and its summary table.

### Standing notes


- Preserve unrelated worktree changes.
- Keep `SPEC.md` normative and update it only when the contract changes.
- Keep this plan current; archive old run outputs under `history/`.

## Verification Commands

```sh
test "$(wc -m < goals/palantiri-parcels/GOAL.md)" -le 4000
jq . goals/palantiri-parcels/ops/manifest.json
rg -n "palantiri-parcels|GOAL.md|agentLaunchers|packetAnchorDocument" goals/palantiri-parcels
git diff --check -- goals/palantiri-parcels
```
