# CSF-033: Predictable /tmp paths for AI metrics proof data

## Metadata

| Field | Value |
|---|---|
| Severity | Low |
| Codex status | Closed |
| Repository | kriegcloud/beep-effect |
| Source commit | 7033ed3 |
| Reported age | 1w ago |
| Capture method | dom-fallback |
| Owner area | initiatives/ai-metrics-stack |
| Triage verdict | fixed |
| Codex close reason | Already fixed |

## Summary

Introduced. The commit adds new P7 mirror/retention command gates and ledger guidance that stage sensitive AI metrics data under predictable /tmp paths without any ownership, permission, symlink, or cleanup safeguards.

## Current-HEAD Triage

- Verdict: `fixed`
- Rationale: The P7 proof-data and restore-drill command gates now create disposable roots with umask 077 and mktemp -d templates instead of staging sensitive AI metrics proof data under predictable /tmp paths.
- Remediation status: `fixed-in-current-head`
- Verification command: `rg -n 'umask 077; .*mktemp -d -t ai-metrics-p7-(proof-data|restore)' initiatives/ai-metrics-stack/ops/manifest.json && ! rg -n '/tmp/ai-metrics-p7|/tmp/beep-ai-metrics' initiatives/ai-metrics-stack/ops/manifest.json`
- Changed files:
  - none
- Verification notes:
  - Current HEAD uses random mktemp directories for the disposable proof copy and restore-drill paths.

## Evidence Paths

- initiatives/ai-metrics-stack/history/outputs/p6-pre-may16-readiness-ledger.md
- initiatives/ai-metrics-stack/ops/manifest.json

## Validation Notes From Codex

- Confirm the commit introduced fixed, shared /tmp paths in operator-facing/machine-readable P7 gates.
- Confirm those gates operate on the active .beep/ai-metrics data root and documentation describes sensitive/large raw and derived inventory.
- Confirm the new guidance/commands lack private temp directory creation, restrictive permissions, ownership checks, symlink checks, realpath validation, and cleanup.
- Dynamically show a local pre-created /tmp/ai-metrics-p7-proof-data symlink redirects the documented rsync -a --delete copy and causes copied data disclosure plus unintended deletion in the redirected target.
- Trace the restore-drill implementation to verify --restore-root is accepted and written under without equivalent path safety checks; full restore-drill runtime was not executed because it requires a real DuckDB/raw archive/key fixture.

## Sanitized Finding Content

```text
Finding
Predictable /tmp paths for AI metrics proof data
Report
Chat
Severity
Low
Adjust to improve accuracy in future scans
Commit
7033ed3
7:25 AM May 12, 2026
by elpresidank
Repository
kriegcloud/beep-effect
Summary
Introduced. The commit adds new P7 mirror/retention command gates and ledger guidance that stage sensitive AI metrics data under predictable /tmp paths without any ownership, permission, symlink, or cleanup safeguards.
This commit adds machine-readable/manual command gates and proof documentation that use predictable, shared temporary directories such as /tmp/ai-metrics-p7-proof-data and /tmp/ai-metrics-p7-restore for AI metrics mirror and retention workflows. The copied source is the active .beep/ai-metrics data root, and the ledger records that this includes a multi-GB copy plus raw archive object inventory. On a multi-user workstation or CI runner, another local user/process could pre-create these paths, monitor them, or replace them with symlinks before an operator runs the commands. Because the copy command uses rsync -a --delete and the restore drill writes into the fixed restore root, this can cause disclosure of copied metrics artifacts or unintended writes/deletes through path redirection. The safer pattern is to use mktemp-created 0700 directories, set a restrictive umask, verify ownership and realpath, avoid following pre-existing symlinks, and clean up after use.
Validation
Confirm the commit introduced fixed, shared /tmp paths in operator-facing/machine-readable P7 gates.
Confirm those gates operate on the active .beep/ai-metrics data root and documentation describes sensitive/large raw and derived inventory.
Confirm the new guidance/commands lack private temp directory creation, restrictive permissions, ownership checks, symlink checks, realpath validation, and cleanup.
Dynamically show a local pre-created /tmp/ai-metrics-p7-proof-data symlink redirects the documented rsync -a --delete copy and causes copied data disclosure plus unintended deletion in the redirected target.
Trace the restore-drill implementation to verify --restore-root is accepted and written under without equivalent path safety checks; full restore-drill runtime was not executed because it requires a real DuckDB/raw archive/key fixture.
Validation artifact
Evidence
initiatives/ai-metrics-stack/history/outputs/p6-pre-may16-readiness-ledger.md
277
- Copied the active proof data root to disposable root
278
`/tmp/ai-metrics-p7-proof-data` for mirror build proof.
279
- Disposable copy size: `3.5G`.
280
- Mirror build succeeded:
281
- bundle id: `p7-mirror-1778587546832`
282
- bundle root:
283
`/tmp/ai-metrics-p7-proof-data/mirror/bundles/p7-mirror-1778587546832`
284
- privacy proof: `safe=true`, `forbiddenMatches=[]`
285
- omitted table: `ai_metrics_raw_archive_objects`
286
- mirror work DuckDB was cleaned after build
287
- Mirror row counts:
288
289
| table | rows |
290
| --- | ---: |
291
| `ai_metrics_ingest_runs` | 117 |
292
| `ai_metrics_source_files` | 595 |
293
| `ai_metrics_agent_tasks` | 69 |
294
| `ai_metrics_sessions` | 595 |
295
| `ai_metrics_turns` | 412929 |
296
| `ai_metrics_model_calls` | 0 |
297
| `ai_metrics_tool_invocations` | 0 |
298
| `ai_metrics_outcome_labels` | 1 |
299
| `ai_metrics_benchmark_cases` | 2 |
300
| `ai_metrics_benchmark_runs` | 3 |
301
| `ai_metrics_scorecards` | 24 |
302
303
- Mirror sync stayed dry-run and planned only:
304
- `ssh dankserver-yubi mkdir -p /srv/data/ai-metrics/p7-derived-mirror`
305
- `rsync -az --delete ... dankserver-yubi:/srv/data/ai-metrics/p7-derived-mirror/`
306
- confirmation token remains `p7-derived-mirror`
307
- Remote mirror status is not present yet. Direct remote check showed
308
`/srv/data/ai-metrics/p7-derived-mirror/manifest.json` is `missing`, which is
309
expected because no confirmed sync was run.
310
- Retention inventory against the active root succeeded without mutation:
311
- raw archive object rows: `595`
312
- derived export directories: `122`
313
- report files: `18`
314
- Restore drill first rejected the disposable copy because copied DuckDB rows
315
still point at the active raw archive layout; that path validation is
316
expected for copied data roots.
317
- Restore drill then used the active root as read source and
318
`/tmp/ai-metrics-p7-restore` as disposable restore target for the bounded
319
window `2026-05-12T11:00:00Z` to `2026-05-12T13:00:00Z`:
initiatives/ai-metrics-stack/ops/manifest.json
184
"id": "ai-metrics-p7-disposable-proof-copy",
185
"command": "rsync -a --delete /home/elpresidank/YeeBois/projects/beep-effect/.beep/ai-metrics/ /tmp/ai-metrics-p7-proof-data/"
186
},
187
{
188
"id": "ai-metrics-p7-mirror-build",
189
"command": "bun run beep ai-metrics mirror build --target dankserver --data-root /tmp/ai-metrics-p7-proof-data --json"
190
},
191
{
192
"id": "ai-metrics-p7-mirror-sync-dry-run",
193
"command": "bun run beep ai-metrics mirror sync --bundle latest --data-root /tmp/ai-metrics-p7-proof-data --json"
194
},
195
{
196
"id": "ai-metrics-p7-remote-mirror-presence-check",
197
"command": "ssh -o BatchMode=yes -o ConnectTimeout=10 dankserver-yubi \"sh -lc 'if test -f /srv/data/ai-metrics/p7-derived-mirror/manifest.json; then echo present; else echo missing; fi'\""
198
},
199
{
200
"id": "ai-metrics-p7-retention-list",
201
"command": "bun run beep ai-metrics retention list --data-root /home/elpresidank/YeeBois/projects/beep-effect/.beep/ai-metrics --json"
202
},
203
{
204
"id": "ai-metrics-p7-retention-restore-drill",
205
"command": "BEEP_AI_METRICS_RAW_ARCHIVE_KEY=\"$(op read 'op://TBK/ai-metrics/raw-archive-key')\" bun run beep ai-metrics retention restore-drill --data-root /home/elpresidank/YeeBois/projects/beep-effect/.beep/ai-metrics --restore-root /tmp/ai-metrics-p7-restore --before <iso> --json"
Attack-path analysis
Kept at low. The vulnerable pattern is evidenced in repository artifacts and the validation PoC demonstrates the core symlink/rsync behavior, so it is not a false positive. But reachability is limited to internal local/operator tooling, with no public service exposure, no network port, and required user interaction/CI execution. Impact is local data disclosure and possible redirected deletion under the invoking user's privileges, not remote code execution, tenant compromise, or broad credential exposure.
Path
Local attacker/process on same host --pre-creates fixed path or symlink--> Predictable shared /tmp path --waits for documented workflow--> Operator runs P7 AI metrics ops command --uses fixed destination without path hardening--> rsync/restore writes through attacker-prepared path --copies data and applies --delete under redirected destination--> Metrics artifact disclosure or unintended deletion
The finding is real for the local operator workflow. The ops manifest adds fixed shared /tmp paths for copying the active AI metrics data root and for restore drills, and the ledger confirms a 3.5G active proof data copy plus raw archive inventory. The restore CLI passes restoreRoot through, and the library creates and writes under it without evident symlink/ownership/permission validation. Validation evidence also demonstrated the rsync symlink behavior with a dummy fixture. The issue is not remotely reachable and requires local same-host access plus operator or CI execution, so the original low severity is appropriate.
Likelihood
Low - Exploitation requires same-host local access or a malicious co-tenant process, successful pre-creation of the predictable path before the workflow, and an operator or CI job running these specific P7 commands. There is no internet-facing entry point.
Impact
Low - A successful attack can disclose local AI metrics artifacts copied into the redirected temporary path and can cause unintended deletion or writes under an operator-writable redirected destination due to rsync --delete. The data may include derived metrics, session/turn metadata, archive inventory, and encrypted raw archive objects; however, it is local-only, operator-triggered, and not a direct credential compromise or remote runtime compromise.
Assumptions
An operator or CI job runs the P7 AI metrics commands from the repository ops manifest.
The host uses standard world-writable shared /tmp semantics and the fixed /tmp paths do not already belong securely to the operator.
A local unprivileged user or process can pre-create /tmp/ai-metrics-p7-proof-data or /tmp/ai-metrics-p7-restore before the operator command runs.
The active .beep/ai-metrics data root can contain sensitive local AI metrics artifacts, derived databases, archive inventory, or encrypted raw archive objects.
local same-host access or control of another process on the runner/workstation
ability to create the predictable /tmp path before the operator workflow
operator interaction or CI execution of the documented AI metrics P7 command gate
Controls
No public ingress, load balancer, or listening port is introduced by this finding.
Mirror sync was documented as dry-run in the ledger, limiting remote propagation in the recorded run.
Restore-drill validates selected source archive paths against the expected source data-root layout, but this does not protect the destination restoreRoot.
No mktemp, restrictive umask, chmod, ownership validation, realpath/readlink validation, symlink refusal, or cleanup control was found in the affected ops command gate.
Blindspots
Static-only review did not execute the full real restore-drill because the real AI metrics DuckDB/raw archive/key material is not present in the checkout.
The exact permissions and lifecycle of the operator's real /tmp, workstation, or CI runner are not knowable from repository artifacts.
The precise sensitivity of production .beep/ai-metrics contents cannot be fully determined from the checkout; the ledger shows size and inventory but not actual contents.
.specs was excluded as requested.
Finding content copied
Finding content copied
```
