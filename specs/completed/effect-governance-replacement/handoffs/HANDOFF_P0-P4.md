# Effect Governance Replacement - P0 Through P4 Handoff

## Package Intent

This package exists to determine whether the repo can replace the current Effect-specific `beep-laws` / ESLint governance lane with a faster multi-surface steering system that improves default agent idiomaticity.

The package does not assume that full replacement is already justified. The allowed outcomes remain:

- full replacement
- staged cutover
- no-go yet

## Cross-Phase Rules

- keep the Effect lane separate from the JSDoc and TSDoc lane
- P0, P1, and P2 are read-only outside this spec package
- P1 must lock the fixed steering evaluation corpus
- P2 must choose one primary path
- P3 implements only the chosen path plus necessary glue
- P4 must verify parity, performance, and steering evidence

## Tracked Artifacts

- [../outputs/parity-matrix.md](../outputs/parity-matrix.md)
- [../outputs/steering-eval-corpus.md](../outputs/steering-eval-corpus.md)
- [../outputs/candidate-scorecard.md](../outputs/candidate-scorecard.md)
- [../outputs/grill-log.md](../outputs/grill-log.md)

## Phase Responsibilities

### P0

- map the current Effect-specific governance surface
- explore candidate replacement surfaces
- initialize the parity matrix
- initialize the eval corpus draft

### P1

- validate research claims
- reject weak candidates
- lock the fixed eval corpus
- leave a credible shortlist

### P2

- rank the shortlist
- choose one primary path
- define migration and rollback posture
- make P3 executable without reopening strategy

### P3

- implement the chosen path
- record all meaningful command and migration evidence

### P4

- verify parity
- verify performance
- verify steering
- issue the final `full replacement`, `staged cutover`, or `no-go yet` conclusion
