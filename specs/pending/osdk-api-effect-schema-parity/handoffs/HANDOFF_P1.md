# Handoff P1

## Objective
Freeze contract surfaces for schema strategy, high-fidelity type behavior, public API compatibility, and tests with `TBD=0`.

## Inputs
1. `README.md`
2. `MASTER_ORCHESTRATION.md`
3. `handoffs/HANDOFF_P0.md`
4. `outputs/p0-baseline/*`

## Required Work
1. Define runtime schema strategy for data-bearing contracts.
2. Lock recursion and tagged union conventions for complex modules.
3. Lock high-fidelity generic requirements for heavy type modules.
4. Define stable/unstable parity acceptance contract.
5. Define test strategy contract (type parity + runtime behavior + export parity).
6. Author P2 handoff and orchestrator prompt.

## Deliverables
- `outputs/p1-contract-freeze/schema-contract.md`
- `outputs/p1-contract-freeze/type-fidelity-contract.md`
- `outputs/p1-contract-freeze/public-api-compat-contract.md`
- `outputs/p1-contract-freeze/test-contract.md`

## Completion Checklist
- [ ] All contracts are `TBD=0`.
- [ ] Recursion/discriminator/error strategy frozen.
- [ ] Export parity and alias policy frozen.
- [ ] Test contract covers type + runtime + exports.
- [ ] P2 handoff + prompt authored.

## Memory Protocol
Apply proxy-only Graphiti routing; on failure report `graphiti-memory skipped: proxy unavailable` and continue.

## Exit Gate
P1 closes only when P2 can implement without architecture decisions.
