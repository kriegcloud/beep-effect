# UsageRecord Append Evidence

Date: 2026-06-13
Agent: Codex

## Scope

P1 implementation slice for epistemic `UsageRecord` attribution and the
turn-finalization append path.

## Implemented

- Replaced the fixture-shaped `UsageRecord` payload with typed attribution
  fields: linked `activityId`, provider, model, credential reference, token
  counts, unit count, latency, approximate cost, actor attribution, and
  metadata.
- Kept credential attribution as a branded `OnePasswordReference`; no secret
  value is stored.
- Modeled approximate cost as `costUsdApproxMicros` so persistence remains an
  integer value instead of an untyped decimal.
- Added `TurnFinalizationUsageAppend` as the boundary command shape and
  `appendTurnFinalizationUsageRecord(...)` as the domain append constructor
  that yields the linked `UsageRecord`.

## Verification

```sh
bun run --cwd packages/epistemic/domain check
bun run --cwd packages/epistemic/domain test
bun run --cwd packages/epistemic/domain lint
cd packages/epistemic/domain && bunx tstyche dtslint/EpistemicDomain.tst.ts
```

All commands passed.
