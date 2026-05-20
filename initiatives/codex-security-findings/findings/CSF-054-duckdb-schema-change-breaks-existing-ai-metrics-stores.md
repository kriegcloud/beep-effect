# CSF-054: DuckDB schema change breaks existing AI metrics stores

## Metadata

| Field | Value |
|---|---|
| Severity | Informational |
| Codex status | Closed |
| Repository | kriegcloud/beep-effect |
| Source commit | d20bea9 |
| Reported age | 1w ago |
| Capture method | dom-fallback |
| Owner area | packages/tooling/library/ai-metrics |
| Triage verdict | needs-current-head-review |
| Codex close reason | pending |

## Summary

Introduced a compatibility/crash bug in durable AI metrics ingest. Existing local or deployed metrics stores are not migrated before the new insert shape is used.

## Current-HEAD Triage

- Verdict: `needs-current-head-review`
- Rationale: Pending validation against current `HEAD`.
- Remediation status: `not-started`
- Verification command: `pending`

## Evidence Paths

- packages/tooling/library/ai-metrics/src/derived-storage.ts

## Validation Notes From Codex

- Confirm the parent commit schema for ai_metrics_raw_archive_objects lacks archive_run_object_id and uses archive_object_id as primary key.
- Confirm the current commit changed the DDL to include archive_run_object_id but kept CREATE TABLE IF NOT EXISTS.
- Confirm the current durable write path replays only createTableStatements and has no migration/schema-version/ALTER path before writing.
- Confirm the current archive object upsert always inserts into archive_run_object_id.
- Reproduce the upgrade failure condition: create old table, replay new guarded DDL, then execute new insert and observe a missing-column error; note that fresh DBs pass because the new column is created initially.

## Sanitized Finding Content

```text
Finding
DuckDB schema change breaks existing AI metrics stores
Report
Chat
Severity
Informational
Adjust to improve accuracy in future scans
Commit
d20bea9
1:34 AM May 6, 2026
by elpresidank
Repository
kriegcloud/beep-effect
Summary
Introduced a compatibility/crash bug in durable AI metrics ingest. Existing local or deployed metrics stores are not migrated before the new insert shape is used.
The ai_metrics_raw_archive_objects table definition was changed from using archive_object_id as the primary key to using a new archive_run_object_id column. However, table setup still runs CREATE TABLE IF NOT EXISTS only. On an existing ai-metrics DuckDB file created before this commit, DuckDB will keep the old table shape and will not add archive_run_object_id. The new upsert then unconditionally inserts into archive_run_object_id, causing ingestion to fail with a missing-column/binder error. This is an upgrade-time availability regression; fresh databases pass tests, which hides the issue.
Validation
Confirm the parent commit schema for ai_metrics_raw_archive_objects lacks archive_run_object_id and uses archive_object_id as primary key.
Confirm the current commit changed the DDL to include archive_run_object_id but kept CREATE TABLE IF NOT EXISTS.
Confirm the current durable write path replays only createTableStatements and has no migration/schema-version/ALTER path before writing.
Confirm the current archive object upsert always inserts into archive_run_object_id.
Reproduce the upgrade failure condition: create old table, replay new guarded DDL, then execute new insert and observe a missing-column error; note that fresh DBs pass because the new column is created initially.
Validation artifact
Evidence
packages/tooling/library/ai-metrics/src/derived-storage.ts
60
`CREATE TABLE IF NOT EXISTS ai_metrics_raw_archive_objects (
61
archive_run_object_id VARCHAR PRIMARY KEY,
62
archive_object_id VARCHAR NOT NULL,
63
ingest_run_id VARCHAR NOT NULL,
64
source_kind VARCHAR NOT NULL,
65
source_path_hash VARCHAR NOT NULL,
66
plaintext_content_hash VARCHAR NOT NULL,
67
archive_path VARCHAR NOT NULL,
68
algorithm VARCHAR NOT NULL,
69
encrypted_at_epoch_ms BIGINT NOT NULL
70
)`,
354
const archiveRunObjectId = yield* rowId("archive-object", [input.ingestRunId, archive.archiveObjectId]);
355
yield* duckdb.run(
356
`INSERT OR REPLACE INTO ai_metrics_raw_archive_objects (
357
archive_run_object_id,
358
archive_object_id,
359
ingest_run_id,
360
source_kind,
361
source_path_hash,
362
plaintext_content_hash,
363
archive_path,
364
algorithm,
365
encrypted_at_epoch_ms
366
) VALUES (
367
$archiveRunObjectId,
368
$archiveObjectId,
369
$ingestRunId,
370
$sourceKind,
371
$sourcePathHash,
372
$plaintextContentHash,
373
$archivePath,
374
$algorithm,
375
$encryptedAtEpochMillis
376
)`,
377
{
378
algorithm: archive.algorithm,
379
archiveObjectId: archive.archiveObjectId,
380
archiveRunObjectId,
510
yield* duckdb
511
.withTransaction(
512
Effect.fn(function* (transaction) {
513
yield* transaction.runMany(createTableStatements);
514
yield* upsertRun(input, completedAtEpochMillis, turnCount).pipe(Effect.provideService(DuckDb, transaction));
Attack-path analysis
The code evidence supports a real upgrade-time availability regression, but not a security vulnerability. The affected component is ai-metrics tooling/CLI storage, reached by an operator or scheduled job with access to the local DuckDB file. There is no public service, no attacker-controlled input required to trigger a security effect, no identity or authorization bypass, no secret leakage, and no code execution. Probability × impact for an attacker-driven security issue is therefore effectively out of scope, so the finding should be treated as ignore for security criticality despite being a valid low-severity reliability bug.
Path
Existing DuckDB ai_metrics_raw_archive_objects table with old primary key archive_object_id --upgrade preserves existing table shape--> Updated derived-storage DDL guarded by CREATE TABLE IF NOT EXISTS --guarded DDL is replayed during write--> Forwarder write transaction calls runMany(createTableStatements) --transaction proceeds to archive object upsert--> Upsert inserts archive_run_object_id unconditionally --new column is absent in old table--> DuckDB binder/missing-column error; metrics ingest aborts
The reported schema compatibility bug is real: the current DDL defines archive_run_object_id, but CREATE TABLE IF NOT EXISTS will not alter an existing old table, and the write path immediately inserts archive_run_object_id. This is reachable through normal ai-metrics forwarder use on an upgraded store. However, it is an availability/correctness regression in local/deployment tooling, not a security vulnerability: there is no attacker-controlled network entry, no authorization bypass, no secret disclosure, no privilege escalation, and no executable sink.
Likelihood
Ignore - The bug is plausibly triggered by legitimate upgraded installations with existing stores, but exploitation by an attacker is not realistic because no attacker-controlled entry point or remote exposure was identified.
Impact
Ignore - The impact is limited to failed AI metrics ingest/projection for an upgraded DuckDB store. It may disrupt observability data processing but does not expose or corrupt sensitive data beyond the operator-controlled metrics database and does not cross a trust boundary.
Assumptions
Assessment is limited to repository artifacts in /workspace/beep-effect and did not call cloud APIs.
The affected AI metrics DuckDB file is controlled by the operator/user running the CLI or forwarder.
The issue affects upgraded stores created before the schema change; fresh stores are not affected.
An existing ai_metrics_raw_archive_objects table created with the previous schema
Upgrade to this commit or a descendant without a migration
A subsequent ai-metrics forwarder/derived-storage write
Controls
No public ingress identified for this path
Operator/local CLI invocation required
DuckDB writes are parameterized; this finding is not SQL injection
Raw archive key and hash salt are referenced through env/secret-ref mechanisms, but the schema bug does not expose them
Blindspots
Static-only review did not execute the real Bun/DuckDB test path because dependencies were unavailable in the earlier validation stage.
Repository artifacts may not show all deployment scheduling or operational wrappers around the ai-metrics forwarder.
No cloud/IaC APIs were queried, so external deployment exposure was inferred only from checked-in code.
Finding content copied
```
