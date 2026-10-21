# Codex Security Findings (2026-10-20) Plan

## Status

Status: `active`. The batch is captured and all full Cloud details are enriched. All eight
findings have assigned remediation surfaces and draft changes. PR #1928 merged at `426d494b3433`; main is integrated. Scoped proof is
passing; broader checks and publication are in progress.

## Phases

| Phase | Status | Goal | Exit criteria |
| --- | --- | --- | --- |
| P0 bootstrap | complete | Create feature branch and packet scaffold. | Branch and launcher exist; packet JSON parses. |
| P1 capture | complete | Capture all live findings via the signed-in CSV export. | 8 IDs reconcile: 3 Low, 5 Informational. |
| P2 validate | pending | Reproduce each report at current HEAD. | Every item has strict verdict, disposition, rationale, and owner surface. |
| P3 lane-partition | pending | Group shared root causes and disjoint paths. | Lanes recorded without overlapping file ownership. |
| P4 remediate | pending | Fix all real findings with focused checks. | Changed files and passing targeted proof recorded per finding. |
| P5 repo-proof | pending | Run packet validation and Yeet repair/verify. | No packet drift; local proof green. |
| P6 publish | pending | Publish one intentional PR through Yeet. | Exact branch head pushed and PR opened. |
| P7 monitor | pending | Close hosted checks and actionable reviews. | PR green and mergeable. |
| P8 merge-and-close | pending | Merge and close captured findings. | PR merged; all 8 IDs resolved. |
| P9 close | pending | Record evidence, reflection, and lifecycle. | Packet set to `completed-retained` in the same closeout PR state. |

## Execution Rules

- Validate before repairing; classify failures as introduced, inherited,
  unrelated, or environment-only.
- Prefer one shared root-cause fix when multiple reports traverse the same code.
- Keep global files and ledgers serialized.
- Use focused tests first, then package checks, then Yeet.
- Never stage ignored raw evidence.

## Packet Verification

```sh
test "$(wc -m < goals/codex-security-findings-2026-10-20/GOAL.md)" -le 4000
jq . goals/codex-security-findings-2026-10-20/ops/manifest.json
jq . goals/codex-security-findings-2026-10-20/ops/triage.json
test "$(find goals/codex-security-findings-2026-10-20/findings -maxdepth 1 -name 'CSF-*.md' | wc -l | tr -d ' ')" = 8
git diff --check -- goals/codex-security-findings-2026-10-20
```

## Expanded dependency work

Reconcile all 104 captured alerts in `ops/dependabot.json` alongside the eight
Cloud findings, retaining separate identities. Research fixture execution and
prior packet overlap, Python wheel compatibility and the GTK/GLib constraint
in parallel. After #1928 merges, merge main, regenerate all affected lockfiles
with their supported tooling, execute regressions and package checks, then
publish one combined PR. Close or confirm automatic closure only against
merged-revision evidence, retaining every captured alert number.
