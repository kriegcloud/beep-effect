# Replay Receipt Contract

## Contract Update
 now contains sink-level dedupe counters:

| Field | Type | Meaning |
|---|---|---|
|  |  | Sink receipt scope |
|  | number | Candidate envelopes for sink |
|  | number | New writes committed |
|  | number | Deterministic replay hits (same sink/group/commit/file/hash) |
|  | number | Sink write failures |
|  | number | Sink execution duration |
|  | number | Same as replayed; explicit dedupe counter |
|  | number | Envelopes requiring writes |

Code: [](tooling/cli/src/commands/kg.ts)

## Deterministic Repeat Replay Evidence
Run group: 

- First replay artifact: 
- Second replay artifact: 

### First replay
- Falkor: attempted 244, written 244, replayed 0, dedupeHits 0, failed 0.
- Graphiti: attempted 244, written 244, replayed 0, dedupeHits 0, failed 0.

### Second replay (same spool, same group)
- Falkor: attempted 244, written 0, replayed 244, dedupeHits 244, failed 0.
- Graphiti: attempted 244, written 0, replayed 244, dedupeHits 244, failed 0.

## Acceptance Decision
Receipt schema now exposes sink-level dedupe/replay semantics with deterministic repeat behavior: **PASS**.
