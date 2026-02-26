# Replay Receipt Contract

## Contract Update
`AstKgWriteReceiptV1` now contains sink-level dedupe counters:

| Field | Type | Meaning |
|---|---|---|
| `target` | `falkor | graphiti` | Sink receipt scope |
| `attempted` | number | Candidate envelopes for sink |
| `written` | number | New writes committed |
| `replayed` | number | Deterministic replay hits (same sink/group/commit/file/hash) |
| `failed` | number | Sink write failures |
| `durationMs` | number | Sink execution duration |
| `dedupeHits` | number | Same as replayed; explicit dedupe counter |
| `dedupeMisses` | number | Envelopes requiring writes |

Code: `tooling/cli/src/commands/kg.ts`

## Deterministic Repeat Replay Evidence
Run group: `beep-ast-kg-replay-p7-20260226T004924Z`

- First replay artifact: `outputs/p7-kg-excellence/evidence/20260226T004924Z-replay-both-first.json`
- Second replay artifact: `outputs/p7-kg-excellence/evidence/20260226T004924Z-replay-both-second.json`

### First replay
- Falkor: attempted 244, written 244, replayed 0, dedupeHits 0, failed 0.
- Graphiti: attempted 244, written 244, replayed 0, dedupeHits 0, failed 0.

### Second replay (same spool, same group)
- Falkor: attempted 244, written 0, replayed 244, dedupeHits 244, failed 0.
- Graphiti: attempted 244, written 0, replayed 244, dedupeHits 244, failed 0.

## Acceptance Decision
Receipt schema now exposes sink-level dedupe/replay semantics with deterministic repeat behavior: **PASS**.
