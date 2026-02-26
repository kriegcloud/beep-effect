# P1 Orchestrator Prompt

## 1. Context
P0 baseline is complete. This phase freezes contracts to make implementation decision-complete.

## 2. Mission
Lock schema, type-fidelity, API compatibility, and test contracts with `TBD=0`.

## 3. Inputs
1. `README.md`
2. `MASTER_ORCHESTRATION.md`
3. `outputs/p0-baseline/*`
4. `handoffs/HANDOFF_P1.md`

## 4. Non-negotiable locks
1. High type fidelity.
2. Hybrid parity + aliases.
3. Unstable deferred to P6.

## 5. Agent assignments
1. `schema-contract`
2. `type-fidelity-contract`
3. `api-compat-contract`

## 6. Required outputs
1. `outputs/p1-contract-freeze/schema-contract.md`
2. `outputs/p1-contract-freeze/type-fidelity-contract.md`
3. `outputs/p1-contract-freeze/public-api-compat-contract.md`
4. `outputs/p1-contract-freeze/test-contract.md`

## 7. Required checks
1. Discovery commands
2. `rg -n "TBD" outputs/p1-contract-freeze` must return empty.

## 8. Exit gate
All P1 contracts complete with `TBD=0`, and P2 handoff/prompt authored.

## 9. Memory protocol
Apply proxy health and metrics checks; fallback string on failure is mandatory.

## 10. Handoff document pointer
`handoffs/HANDOFF_P1.md`
