# #1869 Telemetry storage completeness and stamp qualification: record

Lane `residue-telemetry-completeness`, branch `feat/residue-telemetry-completeness`
off `main` `a33ad8bed3`, 2026-10-18. Route: ruling S39, a Claude-originated residue
lane worked by a `claude-opus-5-5` child. Source evidence: finding H3-R3-001 in the
[H3 handoff](../../../repository-simplification-confidence/history/handoffs/rsc-h3-telemetry-2026-10-15.md),
the round-2 and round-3 sections of the
[H3 receipt](../../../repository-simplification-confidence/history/receipts/stage-4-h3-telemetry.md),
and the PR #1590 review thread on `derived-storage.ts` that H3-R3-001 tracks.

## Finding

Round 2 of H3 added one boolean, `session_stamp_collection_complete`, written as
"a stamp was retained AND hook collection was complete AND no refusal record was
rejected". It answered two questions at once. A `false` could mean "no stamp
qualified" or "the evidence could not be read", and nothing told them apart.

`ai_metrics_sessions` rows are content-addressed and every forwarder run rewrote
them with `INSERT OR REPLACE`. A later run that could not read `hook-events`
retained no stamp and replaced a previously verified `session_harness_hash` with
`NULL`. An unconditional `COALESCE` would not fix this. It would also hide a
complete contrary result, such as an intersecting event-loss refusal, which must
clear the stamp.

## Design

The design order was schema, then contract, then implementation.

### Schema

`@beep/repo-ai-metrics/derived-storage` gains two independent `LiteralKit` domains:

| Domain | Members | Meaning |
| --- | --- | --- |
| `AiMetricsSessionStampCompleteness` | `complete`, `partial`, `unknown` | Whether every hook shard, the shard listing, the refusal records and the disarm evidence were read and decoded for this verdict. |
| `AiMetricsSessionStampQualification` | `qualified`, `unqualified`, `unsupported`, `unknown` | Whether the join retained one fresh, identity-bound stamp outside every stamp gap. `unsupported` marks transcript sources with no hook adapter (OpenClaw). |

`AiMetricsDerivedTranscriptRecord` replaces `sessionStampCollectionComplete` with
`sessionStampCompleteness` and `sessionStampQualification`. Both use
`withConstructorDefault` and `withDecodingDefaultKey` set to `unknown`, so an
encoded record without the keys (including a round-2 record that carried only the
old boolean) decodes as `unknown`/`unknown`. A value outside a domain fails
decoding with `SchemaError`. `unqualified` is documented as "the join gates
retained no stamp", never as evidence that a harness was unused.

### Contract

Derived storage has no `Context.Service`. Its contract is the record schema, the
exported Effect functions and the OTLP attribute allowlist:

- `aiMetricsSessionStampCompletenessFor(hookCollectionComplete, stampGapCollectionComplete)`
  depends only on collection status.
- `aiMetricsSessionStampQualificationFor(supported, sessionHarnessHash)` depends
  only on adapter support and the join result.

  Neither function takes the other's input. Both are `dual` (data-first and
  pipeable) and neither ever returns `unknown`.
- `writeAiMetricsDerivedStorage` resolves the session row's stamp verdict instead
  of replacing it (rule below).
- `rollbackAiMetricsSessionStampEvidence` is the tested down path for the
  migration.
- The OTLP allowlist replaces `ai_metrics.session_stamp_collection_complete` with
  `ai_metrics.session_stamp_completeness` and `ai_metrics.session_stamp_qualification`
  on both the session and turn spans. The repository had no other consumer of the
  old attribute or column (checked with `git grep`).

### Implementation

- `forwarder.ts` computes completeness once per run from `hookCollectionComplete`
  and `stampGapCollectionComplete`, and qualification per record from the source
  kind and the retained `sessionHarnessHash`. The fail-closed join gates are
  unchanged.
- `ai_metrics_source_files` rows are per ingest run, so each row records the run's
  own observation.
- `ai_metrics_sessions` now uses `INSERT ... ON CONFLICT (agent_session_id) DO
  UPDATE`. Every descriptive column takes the new value. The stamp verdict
  (`session_harness_hash`, both new columns and the legacy marker) keeps the stored
  values together only when the new run is not `complete`, retained no stamp, and a
  stamp is already stored. A complete run, or any run that retains its own stamp,
  writes its own verdict. Complete contrary evidence therefore clears a stored
  stamp. Preservation keys on collection completeness, never on qualification.
- `otlp.ts` reads both columns with `COALESCE(..., 'unknown')` and decodes them
  through the `LiteralKit` schemas at the DuckDB boundary.
- The legacy `session_stamp_collection_complete` column is still written. Its value
  is `completeness = complete AND qualification = qualified`, exactly its round-2
  meaning, so code from before this change reads the same conservative value after
  a revert. No current reader consults it.

## Migration and historical rows

Additive columns `session_stamp_completeness` and `session_stamp_qualification`
(`VARCHAR DEFAULT 'unknown'`) are added to both tables. Transactional migration
`ai-metrics-session-stamp-evidence-v1` runs once through the existing ledger. It
backfills `NULL` to `unknown` and applies one exact translation: a row whose legacy
marker is `TRUE` and whose hash is present becomes `complete`/`qualified`, because
round 2 wrote `TRUE` only in that case. A `FALSE` or `NULL` marker stays
`unknown`/`unknown`, with or without a hash. Absence never becomes `unqualified`,
and neither field is inferred from the other.

Down path: `rollbackAiMetricsSessionStampEvidence` drops the two columns from both
tables and deletes the ledger row in one transaction. It leaves the legacy marker
and the hashes untouched. A later ensure reapplies the migration and reproduces the
same translation. Rows written after this change and then rolled back keep only the
legacy projection, so a `partial`/`qualified` row reads back as `unknown`/`unknown`
after a rollback and reapply. It never reads as verified.

## Fixtures

All fixtures are paired tests in `@beep/repo-ai-metrics`.

| Case | Where | Result |
| --- | --- | --- |
| Complete stamped | forwarder matrix `qualified`, `closed-before-refusal`; storage run 1 | `complete`/`qualified`, legacy `true` |
| Complete unstamped | forwarder matrix `missing`, `unknown`, `mixed`, `late`, `reused`, `mismatch`, `prefix`; storage run 4 | `complete`/`unqualified`, hash `NULL` |
| Partial stamped | forwarder matrix `corrupt` (malformed shard), `unreadable` (unreadable shard), `rejected-refusal` (malformed refusal record beside a non-intersecting refusal); storage run 3 | `partial`/`qualified` |
| Partial unstamped / refusal | forwarder matrix `mixed-refusal` (malformed record beside an intersecting refusal), `empty-sentinel` and `custom-sentinel` (undecodable disarm sentinels, so gap evidence fails to load); storage runs 2, 5 | `partial`/`unqualified` |
| Complete refusal or disarm gap | forwarder matrix `refused`, `trailing-refusal`, `disarmed`, `future-sentinel` | `complete`/`unqualified`; the gap withholds the stamp |
| Stored stamp kept under incomplete collection | forwarder `qualified` follow-up: `hook-events` taken offline, rerun; storage run 2 | session keeps hash and `complete`/`qualified`; that run's source-file row is `partial`/`unqualified` |
| Complete contrary evidence clears it | forwarder `qualified` follow-up: evidence restored plus an intersecting refusal, rerun; storage run 4 | session hash `NULL`, `complete`/`unqualified` |
| Historical-default record never clears a stamp | storage run 7 (`unknown`/`unknown`, no hash) | stored stamp kept |
| Historical rows | migration test: five legacy rows (`TRUE`+hash, `FALSE`+hash, `FALSE` without hash, `NULL` without hash, `NULL`+hash) | only `TRUE`+hash becomes `complete`/`qualified`; every other row is `unknown`/`unknown`; ensure is idempotent |
| Historical record decode | record without the keys plus the old boolean; record with `sessionStampCompleteness: "done"` | `unknown`/`unknown`; `SchemaError` |
| Down path | migration test | columns and ledger row removed, legacy marker and hashes intact, reapply reproduces the translation |
| Independence | property test over every boolean/Option input; record codec property over every pairing; forwarder matrix asserts that all four pairings `complete`/`partial` × `qualified`/`unqualified` occur | neither field determines the other |

The forwarder matrix also asserts both OTLP attributes on every session and turn
span, and asserts that the old attribute is absent.

## Verification

Commands ran in the lane worktree against the uncommitted tree. Heavy commands ran
through `beep-heavy`.

| Command | Result |
| --- | --- |
| `bunx vitest run` in `packages/tooling/library/ai-metrics` (Node) | 31 files, 441 tests pass |
| `bunx --bun vitest run` in the same package (Bun) | 31 files, 441 tests pass |
| `bunx vitest run --coverage` (package, json-summary) | total lines 90.94 / statements 90.95 / branches 82.15 / functions 80.15 against the 90.78 / 90.78 / 81.87 / 79.92 floors. `derived-storage.ts` 94.47 / 94.7 / 100 / 83.87 (floors 94.15 / 94.3 / 100 / 80.85); `forwarder.ts` and `otlp.ts` at or above their floors. The only per-file metric under a floor is `privacy.ts` functions, 92.15 against 92.3, a file this change does not touch: its uncovered-function count (4) equals the baseline and only the local function total differs (51 against 52). Attribution: environment-only measurement difference. |
| `bun run beep lint effect-vitest` | `introduced=0` (`resolved=66` predates this lane) |
| `bun run beep lint schema-first` | parity ratchet ok, `introduced=0` |
| `bun run beep quality effect-diagnostics --filter repo-ai-metrics` | check and test overlays, 0 errors, 0 warnings |
| `bunx oxlint <changed source and test files>` | exit 0 |
| `bunx biome check .` (package) | clean |
| `bunx turbo run check --filter=@beep/repo-ai-metrics` | 16 of 16 tasks pass |
| `bun run beep quality package-verify @beep/repo-ai-metrics` | audit and docgen ok |
| `bun run beep observability catalog --check` | current after `--write`; the owner shard gains one conforming span, `AiMetrics.rollbackAiMetricsSessionStampEvidence` |
| `bun run beep lint schema-catalog` | current after `--write`; the owner shard gains the two `LiteralKit` entries and an updated record description |
| `bun run beep quality fallow audit --base origin/main --check` | exit 0, 0 findings |
| `bun run beep laws retired-effect-paths` | 0 findings |
| `bun run beep quality changeset-graph` | 0 missing references |
| `bun run beep goals doctor` | 0 blocking findings |

Knowledge refs, goals doctor and changeset status read the committed tree, so the
driver reruns them after committing. `@beep/repo-ai-metrics` is `private: true` and
`privatePackages.version` is `false`, so the change needs no changeset.

No baseline, inventory, exception or suppression row is added (S31). The two
generated shards change only through their owner commands.

## Reversal

Revert the PR. The added columns are additive and code from before this change
ignores them. The legacy marker keeps its round-2 meaning, so that code reads the
same conservative values. To restore the exact prior table shape on a store, run
`rollbackAiMetricsSessionStampEvidence` before reverting. It is transactional and
covered by the migration test.
