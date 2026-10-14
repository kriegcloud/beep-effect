# Bounded recovery amendment for families 5, 7, 8 and 9

Status: approved by the orchestrator's 2026-10-14T11:14Z ruling;
engine PR required on main before any recovery launch. No recovery has run.
This update supersedes the unbound-engine draft published with #1718.
All sealed first-wave families, ledgers, outputs, claims and immutable
manifests remain untouched. Partial repairs are evidence only, never
accepted children.

## Engine binding and the two authorized changes

The recorded chain is libpff first pass, byte-signature attachment repair,
then the same Java/Tika second pass. There is no next fallback engine.
Retain /usr/bin/pffexport, /usr/bin/bwrap, /usr/bin/java and the existing
Tika 3.3.1 jar. Do not add another engine or change the frozen wave launcher.

1. Raise the recovery attempt's attachment-repair elapsed budget through
   the existing --max-elapsed-millis flag to 22,320,000 ms. Family 9's
   measured family elapsed time is 7,222,485 ms; no successful attempt-time
   field exists. Use that observed family duration as the sizing input, multiply by
   three and add ten minutes: 3 × 7,222,485 + 600,000 = 22,267,455 ms.
   Round upward to a whole minute: 22,320,000 ms (6 hours 12 minutes).
   This adds headroom without claiming that timing proves the parser cause
   or predicts completion. The existing attempt/second-pass/finish checks
   use this same option. No default or timeout bypass is introduced.
2. Retain the original cause class and allowlisted stable fields in the
   terminal mail-store-exception row. A schema-defined optional failureCause
   preserves elapsed budgets, second-pass exit/truncated/empty status,
   capture timeout/pipe classes and operation reasons. It excludes messages,
   paths, command lines, stdout/stderr, stacks and arbitrary driver details.
   Existing ledgers decode unchanged. Engine-failure stays unapproved;
   warning, child-reconciliation, source-stability, output and family-clock
   acceptance rules stay in force.

## Recovery execution contract

Exactly four failed occurrences, first-wave ordinals 5, 7, 8 and 9, each
gets one new bounded attempt. The existing selector binds one occurrence
per tool family, so implement this recovery batch as four fresh tool-owned
families, sequentially, concurrency one; never select full scope. The
membership remains history/evidence/p2-first-wave-membership.json, with
only the four approved object identities selected. Do not retry any sealed
first-wave family or run a third attempt for an occurrence.

Per fresh family: ratio 4, attempt 22,320,000 ms, family 43,200,000 ms,
total output 2,147,483,648 bytes, 100 GB free-space floor. The new attempt
budget is 20,880,000 ms below the family ceiling. The family clock remains
cumulative, including post-start hashing and scheduling; a floor is checked
before each launch. No global increase applies to the other five accepted
families or the eighteen larger occurrences.

Code, tests and this amendment must merge to main first through the
final-file protocol. Integrate that merged commit in this lane; verify
owned source equality with main and renew admitted sandbox smokes and
focused restoration proof. Before family-run-start, commit a separate
recovery manifest per occurrence with its new run label, source identity,
merged codeHead, actual engine versions, jar digest, launcher digest and
these ceilings. Fill policySha256 once from family-run-start as already
ruled. Never claim execution identity with the old 6eb3d03677 codeHead.
No recovery manifest or launcher is created during this engine-PR run.

If the second pass fails again, record an explicit unsupported recovery
occurrence disposition with its retained cause class, stable fields,
ledger digest and byte/time aggregates. That disposition does not approve
the sealed engine failure, promote partial repairs, or claim accepted
children. Retain every artifact and never make a third attempt. Stop and
diagnose any other failure before further launches. The orchestrator's
approved ruling authorizes this amendment; launch still requires the
engine PR's actual merge and complete pre-launch freeze records.

## Reversal and remaining scope

Before launch: revert this amendment and the engine PR. After launch:
revert the decisions while retaining every new and old ledger, output,
claim and immutable manifest. @beep/repo-cli is private and ignored by
changesets; no changeset is written (#1566 standing ruling).
Eighteen larger occurrences and estate/recycle/DOC gates remain open for
P3; no action on them in this run. P2 remains in-progress.
