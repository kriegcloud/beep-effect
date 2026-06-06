# Quality Review Inventory

Status: `round-2-plus-batch-2-fixed-in-packet`

This file records quality-review-fix-loop findings against the packet itself.
Final P6 closure must rerun the panel and update this file to `zero-blocker` or
record explicit waivers.

| Id | Reviewer | Blocking status | Status | Fix |
| --- | --- | --- | --- | --- |
| RQT-EXEC-001 | Execution Completeness | blocking | fixed | Research agents now return reports; orchestrator persists assigned paths. |
| RQT-EXEC-002 | Execution Completeness | blocking | fixed | PLAN requires batch closeouts before launching the next batch. |
| RQT-EXEC-003 | Execution Completeness | blocking | fixed | Task schema adds status-specific selected/done/deferred/rejected blocks plus acceptance and rollback commands. |
| RQT-EXEC-004 | Execution Completeness | blocking | fixed | Added implementation, CI, check-name, parity, and review closeout artifacts. |
| RQT-PERF-001 | Performance Benefit | blocking | fixed | Task inventory now includes selected current-PR tasks and Batch 1 evidence. |
| RQT-PERF-002 | Performance Benefit | blocking | fixed | Schema and SPEC require materiality evidence before `done`. |
| RQT-PERF-003 | Performance Benefit | blocking | fixed | Matrix includes required closeout rows and forbids closing completed tasks with `TBD` evidence. |
| RQT-PERF-004 | Performance Benefit | blocking | fixed | Stale predecessor wins are represented as regression guards or rejected/deferred work. |
| RQT-PERF-005 | Performance Benefit | blocking | fixed | Coverage classification is explicit task work and a P6 acceptance criterion. |
| RQT-PSR-001 | Proof And Safety | blocking | fixed | Yeet promotion is blocked until dedicated proof PR and Yeet agent skill gates pass. |
| RQT-PSR-002 | Proof And Safety | blocking | fixed | Waiver and rollback command requirements added. |
| RQT-PSR-003 | Proof And Safety | blocking | fixed | Check-name baseline artifact and proof requirement added. |
| RQT-PSR-004 | Proof And Safety | blocking | fixed | Proof parity map added. |
| RQT-PSR-005 | Proof And Safety | blocking | fixed | CI sample requirement tightened for workflow/action behavior changes. |
| RQT-PSR-006 | Proof And Safety | non-blocking | fixed | Mandatory process snapshot added before batches and heavy commands. |
| RQT-TASK-001 | Task Inventory | blocking | fixed | Inventory no longer contains only seeded hypotheses. |
| RQT-TASK-002 | Task Inventory | blocking | fixed | Batch 1 reports and synthesis are persisted. |
| RQT-TASK-003 | Task Inventory | blocking | fixed | Added `lint:fix` regression-guard task. |
| RQT-TASK-004 | Task Inventory | blocking | fixed | Added external tooling candidate task. |
| RQT-TASK-005 | Task Inventory | blocking | fixed | Split metadata/config/tooling lanes more explicitly. |
| RQT-TASK-006 | Task Inventory | blocking | fixed | Added acceptance commands and rollback commands. |
| RQT-R2-001 | Proof And Safety Round 2 | blocking | fixed | Batch 3 is return-only; orchestrator owns synthesis writes. |
| RQT-R2-002 | Proof And Safety Round 2 | blocking | fixed | Added process snapshot artifact and a Batch 1 closeout waiver; Batch 2 requires a fresh pre-batch snapshot. |
| RQT-B2-001 | Batch 2 Repo CLI | blocking | implemented-in-working-tree | Implemented Yeet verify/publish duplicate-feedback removal; focused proof recorded. |
| RQT-B2-002 | Batch 2 Metadata | blocking | fixed-in-packet | Repo-export catalog red/slow gate recorded; package-shard aggregate design selected as rqt-007. |
| RQT-B2-003 | Batch 2 Test/Coverage | blocking | fixed-in-packet | Coverage classified full-only/scheduled; integration/type-test participation gaps recorded under rqt-008. |
| RQT-B2-004 | User Review | non-blocking | fixed-in-packet | Captured docgen-style package-local repo-export shard idea as selected work. |
| RQT-QA-001 | Local Quality Proof | blocking | fixed | `audit:github quality` emitted two PackageVerify JSDoc warnings; added useful `@param`/`@returns`, then targeted ESLint passed. |
| RQT-QA-002 | Generated Docs Proof | blocking | fixed | Post-warning scoped `beep docgen run -p @beep/repo-cli` passed and produced no tracked doc drift. |
| RQT-QA-003 | Performance Evidence | non-blocking | fixed-in-packet | Full quality bottlenecks were recorded: docgen example typecheck workers, repo-export check, serial no-op integration probes, and repo-cli test/type-test hotspots. |

## Final P6 Gate

Do not mark the packet closed until a fresh reviewer panel returns zero
blocking findings, or every remaining blocker has a waiver record with owner,
expiry or follow-up, residual risk, and acceptance evidence.
