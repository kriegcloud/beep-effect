# Bounded recovery progress


## Recovery ordinal 5 sealed failure — reboot resume

Unit beep-heavy-corpus-restore-p2-recovery-2026-10-14-5.service is inactive.
Result stamp 1; private log four lines. Journal count confirms one
code-exited entry and one 30.1G memory-peak entry; no log lines copied.
The existing tool seal at 14:05:05.106Z is family-acceptance-failure.
No ledger append, output mutation or retry was performed.

Object identity: 492971fd43294de2fc1f47e58ad0ec78fa0438af9004fcb1166ad42ffd09437d.
Input bytes: 157975552. Retained output: 354621761 bytes
(2.245x input, below ratio four); family elapsed 1264398 ms,
below 43,200,000 ms. Queue less than two seconds; archive re-verification
301,680 ms from started stamp to family-run-start. Total launch to seal
1,566,083 ms. No accepted attempt duration or accepted child reconciliation
is claimed. One start, one attempt, one exception, one summary, one failure;
325 repair rows (108 repaired, 217 unsupported), zero store/child/warning
passes. Partial repairs are retained evidence only.

Retained cause: TikaSecondPassFailure; exitCode 1, emptyOutput true,
truncated false. This repeats the second-pass failure, not elapsed-budget
exhaustion or evidence of a memory kill. Recovery disposition: unsupported;
the underlying engine-failure remains unapproved. One bounded recovery
attempt exhausted; no third attempt permitted. Memory peak 30.1G.
Ledger SHA-256: c2652e8afcd04013aac611852fe541f258d00e5575ff411f3257f98e87315899.
Policy SHA-256 filled once from family-run-start:
149ffa8a6938ff97e79f2ec44aafa0a49f6c1f2b746463215d25194f25562c9d.
All other manifest fields remain unchanged. Three recovery ordinals remain
unstarted: 7, 8, 9. The latest successor ruling authorizes sequential
continuation after this reconciliation and main integration.
Reversal: revert packet disposition decisions, retaining all immutable
ledgers, outputs, claims and manifests. P2 remains in-progress; eighteen
larger occurrences and estate/recycle/DOC gates stay open for P3.
