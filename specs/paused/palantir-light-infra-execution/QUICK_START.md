# Quick Start

## Purpose

Run P0-P3 execution work in sequence using locked inputs from the prior cloud architecture spec.

## Steps

1. Confirm locked inputs and current decision state.

```sh
sed -n '1,200p' specs/pending/palantir-light-cloud-architecture-research/outputs/p2-validation/final-recommendation.md
sed -n '1,200p' specs/pending/palantir-light-cloud-architecture-research/outputs/p2-validation/risk-register.md
```

2. Validate this execution spec is complete.

```sh
find specs/pending/palantir-light-infra-execution -type f | sort
rg -n "^## (Owner|Inputs|Exact Tasks|Entry Criteria|Exit Criteria|Verification Commands|Rollback/Safety Notes)" specs/pending/palantir-light-infra-execution/outputs
```

3. Execute phases in order:
- P0: `outputs/p0-execution-readiness/`
- P1: `outputs/p1-foundation-build/`
- P2: `outputs/p2-runtime-and-controls/`
- P3: `outputs/p3-cutover-and-validation/`

4. Enforce gate checks before moving forward:
- G0 before P0 close
- G1 before P1 start
- G2 before P2 start
- G3 before P3 start
- G4 before production cutover

5. Track phase status in manifest after each gate.

```sh
cat specs/pending/palantir-light-infra-execution/outputs/manifest.json
```

## Operational Rule

If any gate fails, stop phase progression, execute rollback/safety notes for the current phase, and re-run verification commands.
