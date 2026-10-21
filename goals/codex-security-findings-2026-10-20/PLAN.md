# Codex Security Findings (2026-10-20) Plan

## Status

Status: `active`.

PR [#1930](https://github.com/beep-effect/beep-effect/pull/1930) is published; the parent-confirmed remote head is
`02b5bd3f47`. It contains the eight Cloud remediations and scoped remediation for
all 123 captured Dependabot alerts. PR #1928 merged at
`426d494b3433ccddf797a2d896984f1ad23c81ad`; its execution hold is released.
Focused regressions, dependency/runtime proof and affected package receipts
are recorded in `research/`. Hosted checks and review remain in progress.
The initial-head coverage gap now has additional tests and passing local proof
(205 tests across 15 files); see `research/law-practice-coverage-proof.md`.
Coverage baselines and security controls remain unchanged. The consolidated
repair still requires publication and exact-next-head hosted proof.

No Cloud or Dependabot status has been changed. Merge, merged-revision proof
and exact-ID external closure remain mandatory; lifecycle stays `active`.

## Phases

| Phase | Status | Goal | Exit criteria |
| --- | --- | --- | --- |
| P0 bootstrap | complete | Create feature branch and packet scaffold. | Branch and launcher exist; packet JSON parses. |
| P1 capture | complete | Capture all live findings via the signed-in CSV export. | 8 IDs reconcile: 3 Low, 5 Informational. |
| P2 validate | complete | Validate full detail evidence and source reachability; retain exploit limits. | Every item has strict verdict, disposition, rationale, and owner surface. |
| P3 lane-partition | complete | Group shared root causes and disjoint paths. | Lanes recorded without overlapping file ownership. |
| P4 remediate | complete | Fix all real findings with focused checks. | Changed files and passing targeted proof recorded per finding. |
| P5 repo-proof | in-progress | Run packet validation and Yeet repair/verify. | No packet drift; local proof green. |
| P6 publish | complete | Publish one intentional PR through Yeet. | Exact branch head pushed and PR opened. |
| P7 monitor | in-progress | Close hosted checks and actionable reviews. | PR green and mergeable. |
| P8 merge-and-close | pending | Merge and close captured findings. | PR merged; all 8 IDs resolved. |
| P9 close | pending | Record evidence, reflection, and lifecycle. | Final addendum and derived `completed-retained` receipt recorded only after merge and exact-ID closure. |

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

All 123 captured alert IDs in `ops/dependabot.json` remain in scope, alongside
and separate from the eight complete `commit:` Cloud identities. Scoped
fixture, Python and Rust remediation/proof is recorded and published in PR
#1930. Hosted coverage repair passed locally; use one consolidated next push and
retain the current baselines. No externally open alert is declared resolved.

## Closeout ordering

P4 records implementation and scoped regression proof, not external closure.
P5/P7 stay in progress while the locally passing coverage repair awaits publication and next-head checks
remain pending. P6 records actual publication; it does not imply readiness or merge.
P8 requires the merged revision plus observed closure for all eight Cloud IDs
and 123 Dependabot IDs. P9 remains pending: the existing same-PR reflection is
interim, and the final reflection/addendum and lifecycle flip land together
only after the acceptance criteria are actually satisfied. Do not pre-flip
completion merely to satisfy the same-PR documentation convention.
