# P3 Graphiti Engineer Report

## Delivered
- Implemented `AstKgEpisodeV1` envelope payload construction.
- Implemented deterministic episode UUID from tuple:
  - `group_id|workspace|commitSha|file|schemaVersion`
- Implemented replay ledger with idempotency semantics:
  - same UUID + same hash => replay hit/no-op
  - same UUID + different hash => deterministic conflict/fail
- Implemented outage spool fallback writer:
  - `tooling/ast-kg/.cache/graphiti-spool/<commitSha>.jsonl`

## Checks
- Idempotent replay validated in CLI test.
- Outage path validated in smoke check with `BEEP_KG_FORCE_GRAPHITI_OUTAGE=true`.

## Exit
- Group and envelope locks preserved.
