# CSF-052: Agent task ID migration orphans related metrics rows

## Metadata

| Field | Value |
|---|---|
| Severity | Informational |
| Codex status | Closed |
| Repository | kriegcloud/beep-effect |
| Source commit | 1ec6e3a |
| Reported age | 1w ago |
| Capture method | dom-fallback |
| Owner area | packages/tooling/library/ai-metrics |
| Triage verdict | needs-current-head-review |
| Codex close reason | pending |

## Summary

Introduced bug: the migration updates the primary task table but does not cascade or remap agent_task_id references in ai_metrics_sessions and ai_metrics_outcome_labels before changing/deleting task IDs.

## Current-HEAD Triage

- Verdict: `needs-current-head-review`
- Rationale: Pending validation against current `HEAD`.
- Remediation status: `not-started`
- Verification command: `pending`

## Evidence Paths

- packages/tooling/library/ai-metrics/src/derived-storage.ts
- packages/tooling/library/ai-metrics/src/scorecard.ts

## Validation Notes From Codex

- Confirm the commit introduced a one-time migration for legacy agent_task_id values.
- Verify the migration mutates only ai_metrics_agent_tasks and does not update child/reference tables.
- Verify ai_metrics_sessions and ai_metrics_outcome_labels store agent_task_id as independent plain columns.
- Verify reporting/queue queries join sessions and labels back to tasks by exact agent_task_id.
- Execute a minimal PoC for both migration branches showing orphaned sessions/labels and incorrect scorecard/report query results.

## Sanitized Finding Content

```text
Finding
Agent task ID migration orphans related metrics rows
Report
Chat
Severity
Informational
Adjust to improve accuracy in future scans
Commit
1ec6e3a
12:07 AM May 9, 2026
by elpresidank
Repository
kriegcloud/beep-effect
Summary
Introduced bug: the migration updates the primary task table but does not cascade or remap agent_task_id references in ai_metrics_sessions and ai_metrics_outcome_labels before changing/deleting task IDs.
The commit adds a one-time migration from legacy agent_task_id values to the current ID format. However, the migration only deletes or updates rows in ai_metrics_agent_tasks. Other tables store agent_task_id as a plain column, notably ai_metrics_sessions and ai_metrics_outcome_labels, and later scorecard/report queries join those tables back to ai_metrics_agent_tasks by exact task ID. After the migration, existing sessions and labels that still contain the legacy task ID no longer join to their task. If a duplicate current task exists, the legacy task row is deleted, which also leaves any labels or sessions for the deleted task orphaned. This corrupts historical metrics/reporting data and can cause tasks to appear unlabeled or have zero turns even though related rows still exist.
Validation
Confirm the commit introduced a one-time migration for legacy agent_task_id values.
Verify the migration mutates only ai_metrics_agent_tasks and does not update child/reference tables.
Verify ai_metrics_sessions and ai_metrics_outcome_labels store agent_task_id as independent plain columns.
Verify reporting/queue queries join sessions and labels back to tasks by exact agent_task_id.
Execute a minimal PoC for both migration branches showing orphaned sessions/labels and incorrect scorecard/report query results.
Validation artifact
Evidence
packages/tooling/library/ai-metrics/src/derived-storage.ts
94
`CREATE TABLE IF NOT EXISTS ai_metrics_sessions (
95
agent_session_id VARCHAR PRIMARY KEY,
96
agent_task_id VARCHAR,
97
ingest_run_id VARCHAR NOT NULL,
98
source_kind VARCHAR NOT NULL,
99
source_path_hash VARCHAR NOT NULL,
100
source_role VARCHAR NOT NULL,
138
`CREATE TABLE IF NOT EXISTS ai_metrics_outcome_labels (
139
label_id VARCHAR PRIMARY KEY,
140
agent_task_id VARCHAR NOT NULL,
141
rating DOUBLE NOT NULL,
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
packages/tooling/library/ai-metrics/src/scorecard.ts
547
FROM ai_metrics_agent_tasks t
548
LEFT JOIN ai_metrics_sessions s ON s.agent_task_id = t.agent_task_id
549
LEFT JOIN ai_metrics_turns turns ON turns.agent_session_id = s.agent_session_id
550
LEFT JOIN ai_metrics_outcome_labels labels ON labels.agent_task_id = t.agent_task_id
884
FROM ai_metrics_agent_tasks t
885
LEFT JOIN ai_metrics_outcome_labels labels ON labels.agent_task_id = t.agent_task_id
Attack-path analysis
Confirmed as a real data-integrity bug but not a security vulnerability. The affected code is repo-local/internal AI metrics tooling. Evidence shows the migration only mutates ai_metrics_agent_tasks while dependent tables keep separate agent_task_id columns, and scorecard joins then misreport labels/turns. The impact is historical metrics/report corruption. There is no realistic in-scope attacker path, no public ingress to the migration, no privilege or identity boundary crossed, no secrets disclosure, and no code execution. Probability x security impact therefore warrants ignoring for security criticality while fixing as a correctness/data repair issue.
Path
Local/internal ai-metrics CLI or library invocation --runs storage ensure/migration--> One-time task ID migration mutates ai_metrics_agent_tasks --does not cascade/remap dependent rows--> ai_metrics_sessions and ai_metrics_outcome_labels keep legacy IDs --legacy IDs fail exact joins--> Scorecard queries join by exact task ID --reports omit existing labels/turns--> Incorrect label queue / weekly report output
The finding is a real bug: the new migration rewrites/deletes rows only in ai_metrics_agent_tasks, while ai_metrics_sessions and ai_metrics_outcome_labels store agent_task_id separately and scorecard queries later join by exact task ID. The validation PoC demonstrates orphaned rows and incorrect reports. However, the affected component is a local/internal AI metrics tooling library and the outcome is corrupted historical metrics/reporting. There is no evidenced attacker-controlled network input, authorization bypass, secret exposure, code execution, privilege escalation, or cross-boundary impact. Therefore it should be tracked as a correctness/data-integrity issue, not a security vulnerability.
Likelihood
Ignore - The bug can trigger during normal local/internal migration of legacy data, but exploitation by an attacker is unlikely because the relevant input is the operator's derived metrics database and there is no identified public or network-accessible entry point for untrusted users.
Impact
Ignore - The proven impact is incorrect AI metrics label queues and weekly reports caused by orphaned historical rows. This may affect operational analytics integrity but does not expose sensitive data, grant access, execute code, or compromise identity.
Assumptions
The affected AI metrics DuckDB database is operated by a local developer/operator or internal metrics job, not directly exposed as an unauthenticated public API.
Historical legacy ai_metrics_agent_tasks rows may exist before the one-time migration runs.
An attacker does not normally have direct write access to the operator's local derived metrics database; if they do, they can already corrupt this data.
existing AI metrics derived storage containing legacy agent_task_id values
operator or scheduled tooling runs ensureAiMetricsDerivedStorage/scorecard paths after the commit
dependent rows exist in ai_metrics_sessions or ai_metrics_outcome_labels with legacy task IDs
Controls
Affected code is local/internal tooling rather than an exposed product request handler.
Local compose backend binds Phoenix to 127.0.0.1:6006.
Non-local installs require secret references for hash salt and raw archive key.
Install apply path is documented as dry-run-only in the CLI.
No executable sink, auth bypass, tenant-boundary violation, or secret-read path was identified for this migration bug.
Blindspots
Static-only repository review; no cloud APIs or deployed infrastructure were queried.
Could not prove how many real installations have legacy AI metrics rows, only that the migration logic can orphan them.
If a separate vulnerability allowed untrusted users to write arbitrary rows into the metrics DuckDB, this bug could become part of a broader integrity chain, but that prerequisite was not evidenced here.
Finding content copied
Finding content copied
```
