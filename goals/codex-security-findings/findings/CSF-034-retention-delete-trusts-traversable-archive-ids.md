# CSF-034: Retention delete trusts traversable archive IDs

## Metadata

| Field | Value |
|---|---|
| Severity | Low |
| Codex status | Closed |
| Repository | kriegcloud/beep-effect |
| Source commit | 408f4c2 |
| Reported age | 1w ago |
| Capture method | dom-fallback |
| Owner area | packages/tooling/library/ai-metrics |
| Triage verdict | fixed |
| Codex close reason | Already fixed |

## Summary

Introduced: packages/tooling/library/ai-metrics/src/retention.ts is new in this commit and adds the vulnerable retention delete path validation.

## Current-HEAD Triage

- Verdict: `fixed`
- Rationale: Retention delete and restore workflows validate raw archive object ids against the generated raw digest format and verify selected archive paths exactly match the expected data-root raw archive layout before reading or deleting them.
- Remediation status: `fixed-in-current-head`
- Verification command: `bunx --bun vitest run packages/tooling/library/ai-metrics/test/ingest.test.ts --testNamePattern 'fails restore drills|supports explicit-window compact'`
- Changed files:
  - none
- Verification notes:
  - The retention restore-drill test mutates a stored archive_path outside the data root and now fails closed.

## Evidence Paths

- packages/tooling/library/ai-metrics/src/retention.ts

## Validation Notes From Codex

- Confirm retention reads archive_object_id and archive_path from ai_metrics_raw_archive_objects without path-safe/generated-ID validation.
- Confirm legitimate archive IDs are generated as raw-${digest}, but schemas/retention accept arbitrary strings.
- Confirm the delete path compares path.resolve(archivePath) to an expected path built from the untrusted archiveObjectId, allowing normalization of traversal.
- Confirm confirmed non-dry-run delete mode reaches removeRawArchivePaths for selected raw archive items.
- Demonstrate with a targeted PoC that a traversal archive_object_id and matching archive_path pass validation while resolving outside the archive base and deleting the outside file.

## Sanitized Finding Content

```text
Finding
Retention delete trusts traversable archive IDs
Report
Chat
Severity
Low
Adjust to improve accuracy in future scans
Commit
408f4c2
5:20 AM May 12, 2026
by elpresidank
Repository
kriegcloud/beep-effect
Summary
Introduced: packages/tooling/library/ai-metrics/src/retention.ts is new in this commit and adds the vulnerable retention delete path validation.
The retention workflow reads archive_object_id and archive_path directly from ai_metrics_raw_archive_objects. During confirmed delete, it attempts to validate the archive path by recomputing an expected path with path.resolve(dataRoot, "raw", sourceKind, `${archiveObjectId}.json`) and comparing it to path.resolve(archivePath). Because archiveObjectId is not validated before being interpolated into the path, values containing ../ are normalized by path.resolve. A malicious or corrupted DuckDB row can therefore set both archive_object_id and archive_path to resolve to the same file outside the archive tree, and the equality check will pass. When an operator runs a confirmed retention delete for a matching window, fs.remove(selectedArchivePath) will remove that outside file. The fix should validate archiveObjectId against the generated raw object format, reject path separators/traversal, and additionally enforce that the resolved selected path is under the resolved dataRoot/raw/<sourceKind>/ directory.
Validation
Confirm retention reads archive_object_id and archive_path from ai_metrics_raw_archive_objects without path-safe/generated-ID validation.
Confirm legitimate archive IDs are generated as raw-${digest}, but schemas/retention accept arbitrary strings.
Confirm the delete path compares path.resolve(archivePath) to an expected path built from the untrusted archiveObjectId, allowing normalization of traversal.
Confirm confirmed non-dry-run delete mode reaches removeRawArchivePaths for selected raw archive items.
Demonstrate with a targeted PoC that a traversal archive_object_id and matching archive_path pass validation while resolving outside the archive base and deleting the outside file.
Validation artifact
Evidence
packages/tooling/library/ai-metrics/src/retention.ts
367
const rawRows = yield* duckdb.query(
368
`SELECT archive_run_object_id AS "archiveRunObjectId",
369
archive_object_id AS "archiveObjectId",
370
ingest_run_id AS "ingestRunId",
371
source_kind AS "sourceKind",
372
source_path_hash AS "sourcePathHash",
373
plaintext_content_hash AS "plaintextContentHash",
374
archive_path AS "archivePath",
375
encrypted_at_epoch_ms AS "encryptedAtEpochMillis"
376
FROM ai_metrics_raw_archive_objects
377
ORDER BY encrypted_at_epoch_ms ASC`
378
);
379
const rawArchiveItems = pipe(
380
rawRows,
381
A.map((row): RawArchivePlanItem => {
382
const sourceKind = stringValue(row.sourceKind);
383
return {
384
archiveObjectId: stringValue(row.archiveObjectId),
385
archivePath: stringValue(row.archivePath),
386
archiveRunObjectId: stringValue(row.archiveRunObjectId),
387
encryptedAtEpochMillis: numberValue(row.encryptedAtEpochMillis),
388
ingestRunId: stringValue(row.ingestRunId),
389
plaintextContentHash: stringValue(row.plaintextContentHash),
390
sourceKind: S.is(AiMetricsTranscriptSource)(sourceKind) ? sourceKind : AiMetricsTranscriptSource.Enum.codex,
391
sourcePathHash: stringValue(row.sourcePathHash),
392
};
636
const expectedArchivePath = path.resolve(dataRoot, "raw", item.sourceKind, `${item.archiveObjectId}.json`);
637
const selectedArchivePath = path.resolve(item.archivePath);
638
if (selectedArchivePath !== expectedArchivePath) {
639
return yield* retentionFailure("AI metrics raw archive path is outside the expected storage layout.", {
640
archiveObjectId: item.archiveObjectId,
641
expectedArchivePath,
642
selectedArchivePath,
643
});
644
}
645
yield* fs
646
.remove(selectedArchivePath, { force: true })
647
.pipe(
685
if (!dryRun) {
686
yield* removePlanPaths(plan.derivedExportItems);
687
yield* removePlanPaths(plan.reportItems);
688
if (mode === "delete") {
689
yield* removeRawArchivePaths(input.dataRoot, plan.rawArchiveItems);
690
yield* deleteRowsForPlan(plan).pipe(
Attack-path analysis
The code issue is valid: untrusted database values can satisfy the path.resolve equality check and reach fs.remove outside the archive tree. However, probability × impact is lower than the original medium in this repository context. The affected path is local AI metrics tooling, documented as operator-led and local-first, with dry-run default, a required confirmation token, and a bounded-window requirement. There is no evidence of public ingress, an HTTP route, or unauthenticated remote reachability. The attacker must first control protected local DuckDB rows or a data root that the operator chooses to process, and the deletion is limited to files writable by the invoking OS user. This is best treated as a low-severity local hardening/security bug, not a high-impact remotely reachable vulnerability.
Path
Local AI metrics DuckDB row --SELECT raw archive metadata--> readRetentionPlan trusts archive_object_id/archive_path --archiveObjectId and archivePath copied into plan--> path.resolve equality check built from untrusted ID --outside path passes equality after normalization--> Confirmed retention delete --non-dry-run delete removes selectedArchivePath--> fs.remove outside archive root
The finding is a real path validation flaw in the local AI metrics retention workflow. retention.ts reads archive_object_id and archive_path from ai_metrics_raw_archive_objects without validating archiveObjectId. Later, removeRawArchivePaths builds expectedArchivePath from the same untrusted archiveObjectId and compares it with path.resolve(archivePath); traversal in archiveObjectId is normalized, so a malicious row can make both paths resolve to the same file outside dataRoot/raw/<sourceKind>. A confirmed non-dry-run retention delete then removes that path. The practical exposure is limited: the workflow is local/operator-led, defaults to dry-run unless a confirmation token and bounded window are provided, and exploitation requires control over the local metrics DuckDB metadata or a malicious data root. This supports a downgrade from medium to low rather than high/critical.
Likelihood
Low - No public or localhost service path to the vulnerable delete was identified. Exploitation requires malicious/corrupt local DuckDB metadata or a malicious data root plus an operator running a confirmed bounded non-dry-run retention delete. Normal archive creation generates raw-<digest> object IDs, so ordinary transcript/repository input does not directly control the vulnerable field.
Impact
Low - If the preconditions are met, the delete can remove arbitrary files writable by the operator outside the intended raw archive directory, causing local integrity and availability loss. It does not provide code execution, credential disclosure, cross-tenant access, or privilege escalation, and OS file permissions still bound the damage.
Assumptions
The affected AI metrics retention workflow is invoked as local/operator tooling through beep-cli, not as an unauthenticated network endpoint.
The local DuckDB metrics database is normally protected by local filesystem permissions; attacker control of ai_metrics_raw_archive_objects requires database corruption, local write access, or convincing an operator to use a malicious data root.
The process can only delete files writable by the OS user running the retention command.
Attacker can write or corrupt rows in the local ai_metrics_raw_archive_objects DuckDB table, or provide a malicious dataRoot containing such a database.
The malicious row's encrypted_at_epoch_ms falls inside the operator-selected retention window.
The row sets archive_object_id to a traversal-containing value and archive_path to the same resolved outside path.
An operator runs ai-metrics retention delete in non-dry-run mode with the required confirmation token and bounded window.
The target outside file is removable by the OS user running the CLI.
Controls
Local/operator-led CLI workflow rather than public network endpoint
Dry-run by default when confirmation is absent
Required confirmation token for real retention mutations
Required bounded/ordered retention window before non-dry-run mutation
Legitimate archive writes generate raw-<digest> IDs, although this is not enforced on database read
Blindspots
Static-only review; no cloud APIs or live deployment inspection were performed.
Repository dependencies were unavailable in prior validation, so the full Bun test path was not executed in this environment.
No exhaustive review of all possible import/restore workflows was performed to prove whether any external artifact can populate ai_metrics_raw_archive_objects.
Local filesystem ownership and permissions for real deployments are not visible from repository artifacts.
Finding content copied
Finding content copied
```
