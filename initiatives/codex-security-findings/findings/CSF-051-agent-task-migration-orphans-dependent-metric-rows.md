# CSF-051: Agent task migration orphans dependent metric rows

## Metadata

| Field | Value |
|---|---|
| Severity | Informational |
| Codex status | Closed |
| Repository | kriegcloud/beep-effect |
| Source commit | deb5047 |
| Reported age | 1w ago |
| Capture method | dom-fallback |
| Owner area | packages/tooling/library/ai-metrics |
| Triage verdict | needs-current-head-review |
| Codex close reason | pending |

## Summary

Introduced bug: the migration mutates only ai_metrics_agent_tasks.agent_task_id. It should also update all dependent tables that store agent_task_id, at least ai_metrics_sessions and ai_metrics_outcome_labels, before deleting or rewriting legacy task rows.

## Current-HEAD Triage

- Verdict: `needs-current-head-review`
- Rationale: Pending validation against current `HEAD`.
- Remediation status: `not-started`
- Verification command: `pending`

## Evidence Paths

- packages/tooling/library/ai-metrics/src/derived-storage.ts
- packages/tooling/library/ai-metrics/src/scorecard.ts

## Validation Notes From Codex

- Identify whether dependent tables store agent_task_id values that must track ai_metrics_agent_tasks.agent_task_id.
- Verify the new ai-metrics-agent-task-id-v2 migration only mutates ai_metrics_agent_tasks and omits dependent tables.
- Confirm the migration is run automatically during derived storage initialization.
- Reproduce both migration branches: legacy-only UPDATE and duplicate legacy DELETE.
- Demonstrate downstream scorecard/label joins lose historical sessions/labels after migration.

## Sanitized Finding Content

```text
Finding
Agent task migration orphans dependent metric rows
Report
Chat
Severity
Informational
Adjust to improve accuracy in future scans
Commit
deb5047
12:07 AM May 9, 2026
by elpresidank
Repository
kriegcloud/beep-effect
Summary
Introduced bug: the migration mutates only ai_metrics_agent_tasks.agent_task_id. It should also update all dependent tables that store agent_task_id, at least ai_metrics_sessions and ai_metrics_outcome_labels, before deleting or rewriting legacy task rows.
The commit adds a one-time DuckDB migration that converts legacy agent task IDs to the current ID format and deletes legacy rows when a current-format row already exists. However, ai_metrics_sessions.agent_task_id and ai_metrics_outcome_labels.agent_task_id are not migrated at the same time. Existing labels and sessions that pointed at the legacy task ID become orphaned after the task row is updated or deleted. Downstream scorecard queries join sessions and labels through ai_metrics_agent_tasks.agent_task_id, so migrated historical tasks can show zero turns, appear unlabeled, or disappear from aggregate label/report calculations. This is a data integrity/regression bug in the migration, not a security vulnerability.
Validation
Identify whether dependent tables store agent_task_id values that must track ai_metrics_agent_tasks.agent_task_id.
Verify the new ai-metrics-agent-task-id-v2 migration only mutates ai_metrics_agent_tasks and omits dependent tables.
Confirm the migration is run automatically during derived storage initialization.
Reproduce both migration branches: legacy-only UPDATE and duplicate legacy DELETE.
Demonstrate downstream scorecard/label joins lose historical sessions/labels after migration.
Validation artifact
Evidence
packages/tooling/library/ai-metrics/src/derived-storage.ts
381
const legacyAgentTaskIdMigrationStatements = [
382
`DELETE FROM ai_metrics_agent_tasks AS legacy
383
WHERE legacy.agent_task_id = ${legacyAgentTaskIdExpression("legacy")}
384
AND EXISTS (
385
SELECT 1
386
FROM ai_metrics_agent_tasks AS current
387
WHERE current.agent_task_id = ${currentAgentTaskIdExpression("legacy")}
388
AND current.agent_task_id <> legacy.agent_task_id
389
)`,
390
`UPDATE ai_metrics_agent_tasks AS task
391
SET agent_task_id = ${currentAgentTaskIdExpression("task")}
392
WHERE task.agent_task_id = ${legacyAgentTaskIdExpression("task")}`,
407
const derivedStorageMigrations = [
408
{
409
migrationId: "ai-metrics-p6a-default-backfill-v1",
410
statements: migrationBackfillStatements,
411
},
412
{
413
migrationId: "ai-metrics-agent-task-id-v2",
414
requiredColumns: [
415
{ columnName: "agent_task_id", tableName: "ai_metrics_agent_tasks" },
416
{ columnName: "config_snapshot_id", tableName: "ai_metrics_agent_tasks" },
417
{ columnName: "source_kind", tableName: "ai_metrics_agent_tasks" },
418
{ columnName: "source_path_hash", tableName: "ai_metrics_agent_tasks" },
419
{ columnName: "source_role", tableName: "ai_metrics_agent_tasks" },
420
],
421
statements: legacyAgentTaskIdMigrationStatements,
422
},
packages/tooling/library/ai-metrics/src/scorecard.ts
537
.query(
538
`SELECT
539
t.agent_task_id AS "agentTaskId",
540
t.title AS "title",
541
t.source_kind AS "sourceKind",
542
t.source_path_hash AS "sourcePathHash",
543
COALESCE(t.source_role, 'primary') AS "sourceRole",
544
t.config_snapshot_id AS "configSnapshotId",
545
t.created_at_epoch_ms::DOUBLE AS "createdAtEpochMillis",
546
count(turns.turn_id)::INTEGER AS "turnCount"
547
FROM ai_metrics_agent_tasks t
548
LEFT JOIN ai_metrics_sessions s ON s.agent_task_id = t.agent_task_id
549
LEFT JOIN ai_metrics_turns turns ON turns.agent_session_id = s.agent_session_id
550
LEFT JOIN ai_metrics_outcome_labels labels ON labels.agent_task_id = t.agent_task_id
867
const rows = yield* duckdb
868
.query(
869
`SELECT
870
t.config_snapshot_id AS "configSnapshotId",
871
count(DISTINCT t.agent_task_id)::INTEGER AS "taskCount",
872
count(DISTINCT labels.label_id)::INTEGER AS "labelCount",
873
COALESCE(avg(CASE WHEN labels.passed THEN 1.0 ELSE 0.0 END), 0.5)::DOUBLE AS "passRate",
874
COALESCE(avg(labels.rating), 3.0)::DOUBLE AS "averageRating",
875
COALESCE(avg(
876
CASE labels.quality_gate
877
WHEN 'passed' THEN 1.0
878
WHEN 'failed' THEN 0.0
879
ELSE 0.5
880
END
881
), 0.5)::DOUBLE AS "averageQualityGateScore",
882
COALESCE(avg(labels.intervention_count), 0.0)::DOUBLE AS "averageInterventionCount",
883
count(CASE WHEN labels.follow_up_fix THEN 1 END)::INTEGER AS "followUpFixCount"
884
FROM ai_metrics_agent_tasks t
885
LEFT JOIN ai_metrics_outcome_labels labels ON labels.agent_task_id = t.agent_task_id
Attack-path analysis
Downgraded from low security relevance to ignore for security triage. Static evidence and the validation PoC show a real data-integrity regression in the AI metrics migration, but the component is private/local tooling, the vector is not network-exposed, attacker control is absent, and the outcome is limited to incorrect analytics/reporting. There is no demonstrated path to secret exposure, RCE, authentication or authorization bypass, privilege escalation, cross-tenant access, or other security-impacting behavior. This should be fixed as a correctness bug, not tracked as a vulnerability.
Path
Local AI metrics CLI/tooling --command opens configured local DuckDB path--> DuckDB derived storage initialization --runs registered migration once--> agent_task_id migration mutates ai_metrics_agent_tasks only --dependent tables are not cascaded--> sessions/labels retain legacy agent_task_id --joins by task id no longer match--> scorecard joins undercount labels and turns
The underlying defect is real: sessions and outcome labels store agent_task_id, but the new migration only deletes or updates rows in ai_metrics_agent_tasks. Scorecard queries later join sessions and labels through the current task id, so legacy references can be orphaned and reports become incorrect. However, this is local/private AI metrics tooling and no realistic attacker-controlled network, identity, secret, code-execution, or authorization path was found. The appropriate criticality is ignore for security triage, while tracking it as a low-priority data integrity bug in normal engineering workflow.
Likelihood
Ignore - The data bug can occur during normal local AI metrics use if legacy rows exist, but exploitation by an attacker is not realistic because no attacker-controlled public or in-scope network entry point was found and the path requires local/operator access to metrics workflows or data.
Impact
Ignore - The proven impact is incorrect local AI metrics data: historical sessions and outcome labels may stop joining to migrated task rows, causing zero turns, missing labels, and wrong aggregate scorecard/report values. This is not confidentiality, integrity of security controls, availability, identity, authorization, or code execution impact.
Assumptions
The affected AI metrics DuckDB database is created and accessed by local CLI/tooling or operator-controlled scheduled jobs, not by unauthenticated public users.
A realistic attacker for the main desktop/runtime threat model cannot directly invoke this one-time schema migration unless they already control the local operator environment or the metrics database inputs.
.specs was excluded from review as requested.
An existing AI metrics DuckDB database containing legacy-format ai_metrics_agent_tasks rows
Dependent ai_metrics_sessions or ai_metrics_outcome_labels rows still referencing the legacy task id
A local operator or scheduled local tooling run that calls ensureAiMetricsDerivedStorageRaw via AI metrics commands such as label queue/report/forwarder
Controls
Affected component is a private tooling library/CLI workflow rather than a public HTTP endpoint.
Derived storage uses an operator-configured local DuckDB file path.
Local Phoenix compose binds to 127.0.0.1:6006.
Non-local AI metrics installs require secret references for hash salt and raw archive key.
No executable sink, authentication bypass, tenant-boundary bypass, or secret disclosure was identified in the migration path.
Blindspots
Static-only review; the repository dependencies were not installed in this container, so the actual Bun/Vitest test path was not re-run here.
Validation evidence used a deterministic PoC that modeled the DuckDB statements with SQLite UDFs; it demonstrates the migration logic but not a live deployed environment.
No cloud APIs were called and no runtime deployment was inspected outside repository artifacts.
A separate compromise of the local operator account or scheduled job environment could manipulate metrics data directly, but that would not be caused by this migration defect.
Finding content copied
Finding content copied
```
