# Palantiri Parcels Plan

## Status

Status: `pending`

## Phases

| Phase | Status | Goal | Exit criteria |
| --- | --- | --- | --- |
| P0 Research | complete | Parcel specs, sources per parcel, HttpApi contract. | Schemas drafted; sources verified. |
| P1 Slice | in-progress | Account-headroom parcel + gauge + CLI. | First vertical slice verified live. |
| P2 Parcels | pending | Remaining four parcels + completeness check. | Decode + freshness tests green. |
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

### P1 Slice (2026-10-14)

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
- Live run (2026-10-14, workstation): 13 accounts across 7 providers in
  about 7 s cold, instant from the snapshot; the encoded JSON carried no
  `@`. Freshness read `Unknown{stale}` because a collector snapshot
  (grok-bot) was 14 hours old: the parcel is fresh only when every reading
  is within the bound. Open for P2: decide whether retained collector
  readings should carry their own per-item freshness instead of downgrading
  the whole parcel.
- `bun run beep lint policy-fingerprint --write` added the palantiri paths to
  `//#lint:policy-fingerprint` inputs in `turbo.json` (the CLI's policy-tool
  closure now includes `@beep/palantiri`); the root subject is in the same
  baseline review.
- Gates (2026-10-14, uncommitted tree): `observability catalog --check`,
  `lint effect-vitest` (one reviewed EV010 row for the CLI test's real
  filesystem), `lint schema-first`, the schema-opaque codemod `--check`,
  `turbo run check` for both packages, `quality cache-policy`,
  `lint policy-fingerprint --check`, `tsconfig-sync --check` and
  `package-verify @beep/palantiri` exit 0. `package-verify @beep/repo-cli`
  exits 1 on 5 tests outside this slice's code: the knowledge-doctor
  evaluator compares `HEAD` against the live tree, so it fails until
  `@beep/palantiri` is committed; the four `deprecated-apis lint command`
  tests are inherited from #1791 (they pass on main at b8fe0030e4, and the
  fake `oxlint` fixture prints no assignment summary). P1 stays in progress
  until the committed tree re-runs `package-verify @beep/repo-cli`.
- Not done in P1 (by design): OTLP export proven against a live collector
  (the layer is wired and flushes on scope close; no endpoint was set), the
  MCP host, `beep session open`, parcels 2-5.

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
