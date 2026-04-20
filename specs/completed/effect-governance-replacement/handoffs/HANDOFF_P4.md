# Effect Governance Replacement - P4 Handoff

## Goal

Verify the chosen replacement path using the locked parity matrix and the fixed steering evaluation corpus.

## Required Inputs

- [../PLANNING.md](../PLANNING.md)
- [../EXECUTION.md](../EXECUTION.md)
- [../outputs/parity-matrix.md](../outputs/parity-matrix.md)
- [../outputs/steering-eval-corpus.md](../outputs/steering-eval-corpus.md)
- live command and CI surfaces needed for comparison

## Deliverables

- [../VERIFICATION.md](../VERIFICATION.md)

## Must Answer

- what parity was preserved, changed, or lost
- what performance changed
- what steering quality changed on the locked corpus
- whether the honest outcome is `full replacement`, `staged cutover`, or `no-go yet`

## Stop Conditions

- stop if P4 would need to silently patch implementation rather than verify it
- route substantive implementation gaps back to P3
- do not change the evaluation corpus late
