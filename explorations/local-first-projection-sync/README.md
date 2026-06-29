# Local-First Projection Sync

## Status

Stage: `research`
Status: `active`

Source: [`ops/manifest.json`](./ops/manifest.json)

## Spark

After an authority write, the local-first desktop has no way to push graph/claim
mutation events to open workspace windows and threads, so FalkorDB/UI projections
fall stale or get polled. A per-user `EventStreamHub` (a scoped Effect.Service
fanning typed events out to every live connection and pruning dead mailboxes)
would keep projections fresh without polling.

## Next Open Question

**Q1: Build the in-repo per-user fan-out hub, or buy a sync engine?** — the
trunk fork; every downstream decision (scope, first slice, primitive, placement)
assumes "build." DECISIONS.md pre-drafts Q1–Q7 with recommended answers; ratify
them via `/grill-with-docs local-first-projection-sync`.

## Read This First

1. [`ops/manifest.json`](./ops/manifest.json) - machine state: stage, status, open questions.
2. [`CAPTURE.md`](./CAPTURE.md) - raw dump (stage 0).
3. [`RESEARCH.md`](./RESEARCH.md) - prior art + capability inventory (stage 1, if present).
4. [`DECISIONS.md`](./DECISIONS.md) - grilling log (stage 2, if present).
5. [`BRIEF.md`](./BRIEF.md) - shaped pitch (stage 3, if present).
6. [`MAP.md`](./MAP.md) - decomposition (stage 4, if present).

## Trail

<Dated one-liners, newest first: what each session did and where it stopped.>

- 2026-06-29: research-complete — RESEARCH.md synthesized, codex gate-1 folded, DECISIONS pre-drafted.
- 2026-06-29: packet opened from gold-intake cluster 'Local-first projection sync (EventStreamHub)' (1 nugget).
