# Documentation lint migration plan

Status: implementing and verifying; publication belongs to the orchestrator.

| Phase | Status | Exit criteria |
| --- | --- | --- |
| P0 Research | done | Compatibility spike and scope split recorded. |
| P1 Implement | done | Repo-owned rules and all docs runners ported; invalid-case parity proved. |
| P2 Verify | active | Package, cheap and hosted-parity gates recorded and attributed. |
| P3 Publish | pending | Orchestrator reviews, commits and publishes the diff. |
| P4 Close | pending | Orchestrator records merge, reflection and completed-retained lifecycle. |

Execution evidence: research/spike.md, research/verification.tsv and per-command logs.
No ESLint deletion or laws-helper moves in this run. Retained files are follow-up dependencies.

2026-10-14 merge recovery: preserve merged lane A and docs Oxlint workers; require positive tsgolint assignment-summary evidence (comment 4276915577). Verification logs and merge-resolution report are held externally by the orchestrator. ESLint deletion remains PR B2 after this merge. Packet remains active until orchestrator merge closeout.
