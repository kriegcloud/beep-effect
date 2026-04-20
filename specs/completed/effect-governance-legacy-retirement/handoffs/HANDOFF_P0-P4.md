# Effect Governance Legacy Retirement - P0 Through P4 Handoff

## Package Intent

This package exists to determine how much of the remaining legacy `lint:effect-laws` or `beep-laws` or effect-lane ESLint surface can now be retired safely after the earlier governance replacement package promoted `lint:effect-governance` to `full replacement`.

The package does not assume that repo-wide ESLint removal is required. The allowed outcomes remain:

- `full retirement`
- `minimal shim retained`
- `no-go yet`

## Cross-Phase Rules

- keep the Effect lane separate from the JSDoc and TSDoc lane
- do not reopen the earlier `full replacement` verdict
- P0, P1, and P2 are read-only outside this spec package
- P1 must lock the live inventory and the remove-or-retain matrix
- P2 must choose one retirement posture
- P3 implements that posture only
- P4 verifies retirement, docs-lane safety, and dependency or performance or operational evidence

## Tracked Artifacts

- [../outputs/legacy-surface-inventory.md](../outputs/legacy-surface-inventory.md)
- [../outputs/removal-matrix.md](../outputs/removal-matrix.md)
- [../outputs/dependency-cut-map.md](../outputs/dependency-cut-map.md)
- [../outputs/candidate-scorecard.md](../outputs/candidate-scorecard.md)
- [../outputs/grill-log.md](../outputs/grill-log.md)

## Phase Responsibilities

### P0

- inventory the remaining legacy surface
- map dependency edges
- seed remove-or-retain hypotheses
- initialize the option scorecard

### P1

- validate the inventory
- reject weak retirement options
- lock the remove-or-retain matrix
- leave a credible shortlist

### P2

- rank the shortlist
- choose one primary retirement posture
- define rollback and retained-shim posture

### P3

- implement the chosen retirement path
- record removed, split, rewritten, and retained surfaces

### P4

- verify retirement against the locked matrix
- verify docs-lane safety
- verify dependency or performance or operational simplification
- issue the final conclusion
