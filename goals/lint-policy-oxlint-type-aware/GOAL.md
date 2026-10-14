# GOAL: Deprecated-API law lane on oxlint type-aware

Parent: `goals/lint-policy-single-digit` (completed-retained; history immutable).
Packet: `goals/lint-policy-oxlint-type-aware`; SPEC.md is normative.

Outcome: re-spike coverage, parity and timing before replacing the ESLint
no-deprecated lane with one bounded Oxlint process. Original NO-GO interpretation is superseded:
preconditions are now repaired, strict coverage and corpus parity pass, and the
full baseline is complete with an empty normalized diff. Hosted cold scan passed
in 71s wall (job 116063131680 on 9aa802c5bb, 20:06:46Z–20:07:57Z, --threads=4);
no RSS was logged and no OOM occurred. Memory sizing belongs to lane F. Read history/2026-10-14-p2b-re-spike.md and research/triage-2026-10-14.md.

This lane is executing the orchestrator remediation ruling. The orchestrator owns git,
publishing and packet completion; do not mark this packet completed locally.
No git add/commit/push, gh, or Yeet command belongs to the implementation lane.

Resume only against the documented preconditions: fix the two test rootDir
boundaries, intentionally suppress eight DOM-interface mock keys, remove two
obsolete Accordion controls, and resolve the caption XML decoder API boundary.
Use research/candidate-projects.json and root-fallback.patch.txt to restore the
strict assignment experiment. The eight-case corpus must stay unregistered and
must be removed before publication. Prove zero eligible unassigned paths,
corpus identities, full sharded baseline parity, then cold wall/RSS. Hosted
<=150s evidence is recorded in SPEC; the >150s rollback trigger was not triggered.

Only after GO, preserve --package/--full/--base and script names, cut over in the
CLI, update worker/quality/cache tests, remove the deprecated ESLint config,
and regenerate fingerprints/scripts and the reviewed cache baseline if any
script word changes. Lane B has not merged: retain its typescript-eslint
packages and shared profile environment. Follow tsc-rs-gates for compiler pins.

Heavy checks use beep-heavy with the documented user-manager environment.
Effect API changes require current declarations/reference evidence and repo
skills. Preserve unrelated work and record each decision with reversal in SPEC.

At handoff validate packet JSON, GOAL length and whitespace; update report-A.md.
The orchestrator reviews the measured verdict and handles publication/lifecycle.
