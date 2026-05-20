# CSF-050: Worker migration drops existing assignee data

## Metadata

| Field | Value |
|---|---|
| Severity | Informational |
| Codex status | Closed |
| Repository | kriegcloud/beep-effect |
| Source commit | b99c7b8 |
| Reported age | 1w ago |
| Capture method | dom-fallback |
| Owner area | packages/_internal/db-admin/drizzle |
| Triage verdict | needs-current-head-review |
| Codex close reason | pending |

## Summary

Introduced: the new migration drops the existing assignee column after adding assignee_id, but does not backfill assignee_id, preserve the old assignee in a legacy column, or otherwise migrate the data.

## Current-HEAD Triage

- Verdict: `needs-current-head-review`
- Rationale: Pending validation against current `HEAD`.
- Remediation status: `not-started`
- Verification command: `pending`

## Evidence Paths

- packages/_internal/db-admin/drizzle/20260512000000_architecture_lab_work_item/migration.sql
- packages/_internal/db-admin/drizzle/20260512001000_architecture_lab_worker_archetype/migration.sql
- packages/architecture-lab/tables/src/aggregates/WorkItem/WorkItem.table.ts

## Validation Notes From Codex

- Confirm the pre-existing schema had a persisted architecture_lab_work_item.assignee column that could contain data.
- Confirm the new commit adds a migration that alters the same table and drops assignee.
- Check the migration for any safe data migration mechanism such as UPDATE backfill, RENAME, legacy column preservation, or conversion logic.
- Confirm application/table mapping now uses assignee_id rather than assignee, making old values inaccessible after migration.
- Reproduce the data-loss effect with a bounded local SQL PoC using a row populated before the migration.

## Sanitized Finding Content

```text
Finding
Worker migration drops existing assignee data
Report
Chat
Severity
Informational
Adjust to improve accuracy in future scans
Commit
b99c7b8
4:31 AM May 12, 2026
by elpresidank
Repository
kriegcloud/beep-effect
Summary
Introduced: the new migration drops the existing assignee column after adding assignee_id, but does not backfill assignee_id, preserve the old assignee in a legacy column, or otherwise migrate the data.
The commit adds a new migration that changes architecture_lab_work_item from the previous text assignee column to assignee_id and priority. The migration uses DROP COLUMN assignee without copying or preserving existing assignee values. Any deployed database that has WorkItem rows with assignee populated by the earlier schema will irreversibly lose that data when this migration runs. This is a data-loss migration bug rather than a security vulnerability.
Validation
Confirm the pre-existing schema had a persisted architecture_lab_work_item.assignee column that could contain data.
Confirm the new commit adds a migration that alters the same table and drops assignee.
Check the migration for any safe data migration mechanism such as UPDATE backfill, RENAME, legacy column preservation, or conversion logic.
Confirm application/table mapping now uses assignee_id rather than assignee, making old values inaccessible after migration.
Reproduce the data-loss effect with a bounded local SQL PoC using a row populated before the migration.
Validation artifact
Evidence
packages/_internal/db-admin/drizzle/20260512000000_architecture_lab_work_item/migration.sql
1
CREATE TABLE architecture_lab_work_item (
2
id TEXT PRIMARY KEY,
3
title TEXT NOT NULL,
4
status TEXT NOT NULL,
5
assignee TEXT,
packages/_internal/db-admin/drizzle/20260512001000_architecture_lab_worker_archetype/migration.sql
16
ALTER TABLE architecture_lab_work_item
17
ADD COLUMN assignee_id INTEGER,
18
ADD COLUMN priority TEXT,
19
DROP COLUMN assignee;
packages/architecture-lab/tables/src/aggregates/WorkItem/WorkItem.table.ts
30
export const workItemTable = pgTable(WORK_ITEM_TABLE_NAME, {
31
id: text("id").primaryKey().$type<DomainWorkItem.WorkItemId>(),
32
title: text("title").notNull().$type<DomainWorkItem.WorkItemTitle>(),
33
status: text("status").notNull().$type<DomainWorkItem.WorkItemStatus>(),
34
assigneeId: integer("assignee_id").$type<DomainWorker.WorkerId>(),
35
priority: text("priority").$type<DomainWorkPriority.WorkPriority>(),
Attack-path analysis
Although the migration bug is real, the security severity should be adjusted from low to ignore for vulnerability triage. Evidence shows a destructive DROP COLUMN on a prior persisted assignee field, so the correctness issue exists. But the affected component is an internal/private db-admin migration for an architecture-lab proof area, not an exposed service in the stated threat model. The only reachable path is an authorized operator/developer/CI migration run against a database with pre-existing assignee data. There is no public exposure, no identity/privilege boundary crossed, no attacker-controlled input, no secrets handling issue, and no confidentiality/authentication/authorization/code-execution impact. Therefore this is an operational data migration defect rather than a security vulnerability.
Path
Authorized operator/CI migration execution --runs migration--> db-admin architecture-lab migration target --applies SQL--> ALTER TABLE architecture_lab_work_item --schema change includes--> DROP COLUMN assignee --removes persisted column without data migration--> Loss of pre-existing assignee values
The reported statement is valid as a data-loss bug: the earlier migration creates architecture_lab_work_item.assignee, and the newer migration drops that column after adding assignee_id and priority. The current table mapping then reads/writes assigneeId rather than the old assignee text field. However, this does not establish a security vulnerability. The affected component is an internal/private db-admin migration and architecture-lab proof area, with no public ingress, listener, identity boundary, or attacker-controlled input path shown. Exploitation requires an authorized migration run against a database that already has legacy assignee values. The resulting harm is loss of application metadata, not unauthorized access, secret disclosure, privilege escalation, code execution, or cross-tenant compromise.
Likelihood
Ignore - The data-loss condition is plausible during normal migration use if legacy rows exist, but there is no attacker-controlled or network-reachable path. A malicious external actor cannot reasonably trigger this without already controlling the deployment or migration process.
Impact
Ignore - The impact is limited to loss of WorkItem assignee metadata during an authorized schema migration. This may be operationally important but is not a demonstrated security impact such as data exfiltration, auth bypass, privilege escalation, RCE, or cross-boundary compromise.
Assumptions
Static repository-only review; no cloud APIs or deployed databases were queried.
The migration is executed by a developer/operator or CI migration job, not directly by an unauthenticated end user.
No evidence was found that the affected architecture-lab proof/db-admin migration target is part of the main desktop sidecar, repo-memory runtime, or AI SDK network threat-model surface.
A database already contains rows in architecture_lab_work_item with non-null assignee values from the prior schema
An authorized operator/developer/CI migration process applies packages/_internal/db-admin/drizzle/20260512001000_architecture_lab_worker_archetype/migration.sql
Controls
Affected package is private/internal db-admin tooling
No public ingress or listening port identified for the migration path
Migration execution requires operator/developer/CI authority
No executable sink, command execution path, or tenant boundary impact identified
No secret references in the affected migration files
Blindspots
Static-only review cannot prove how operators deploy or schedule db-admin migrations outside the repository.
No production database contents or migration history were inspected.
No external infrastructure manifests proving non-deployment of architecture-lab were found in the reviewed evidence; scope assessment relies on repository metadata and the provided threat model.
The validation PoC demonstrates data-loss semantics but does not demonstrate attacker reachability or security impact.
Finding content copied
Finding content copied
```
