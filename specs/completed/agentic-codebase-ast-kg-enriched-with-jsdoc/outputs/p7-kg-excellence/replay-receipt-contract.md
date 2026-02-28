# P7-T2 Replay Receipt Contract

## Objective
Expose replay and dedupe semantics in receipts and validate deterministic repeat replay behavior.

## Contract
`AstKgWriteReceiptV1` includes sink-level dedupe counters:

- `attempted`
- `written`
- `replayed`
- `failed`
- `durationMs`
- `dedupeHits`
- `dedupeMisses`

Implementation reference:
- `tooling/cli/src/commands/kg.ts` (`AstKgWriteReceiptV1`, `publishToFalkor`, `publishToGraphiti`)

## Deterministic Replay Evidence
Replay was executed twice against the same spool and group.

Evidence files:
- Pass 1: `outputs/p7-kg-excellence/evidence/20260228T105739Z-replay-pass1.json`
- Pass 2: `outputs/p7-kg-excellence/evidence/20260228T105739Z-replay-pass2.json`
- Metadata: `outputs/p7-kg-excellence/evidence/20260228T105739Z-replay.meta.txt`

Observed behavior:
1. Pass 1 writes all envelopes (`written=509`, `replayed=0`, `dedupeMisses=509`).
2. Pass 2 writes nothing and replays all envelopes (`written=0`, `replayed=509`, `dedupeHits=509`).
3. Behavior is consistent for both Falkor and Graphiti receipts.

## Test Coverage
- `tooling/cli/test/kg.test.ts` includes idempotency validation (`second.writes === 0`, `replayHits > 0`).
- Live replay receipts above confirm sink-level counters are surfaced on the command contract.

## Acceptance Check
- Receipt schema exposes sink dedupe/replay counters: **PASS**
- Deterministic repeat replay behavior evidenced: **PASS**

