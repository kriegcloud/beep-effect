# P7 Orchestrator Prompt

## 1. Context
Public surfaces are finalized. Verification and readiness reporting remains.

## 2. Mission
Run full verification matrix and produce final evidence-backed readiness report.

## 3. Inputs
1. P1 test contract
2. P6 parity outputs
3. `handoffs/HANDOFF_P7.md`

## 4. Non-negotiable locks
1. Required command suite must be executed and recorded.
2. Failures must be categorized with proof (new vs pre-existing).
3. No silent gate bypass.

## 5. Agent assignments
1. command runner/evidence recorder
2. type/runtime scenario verifier
3. risk/report synthesis owner

## 6. Required outputs
1. `outputs/p7-verification/report.md`
2. `outputs/p7-verification/command-evidence.md`
3. `outputs/p7-verification/open-risks.md`

## 7. Required checks
1. Discovery commands
2. Ontology package checks: `check`, `lint`, `test`, `docgen`
3. Repo checks: `check`, `lint`, `test`, `docgen`

Required scenario matrix:

1. Type parity suites:
   - `ObjectDefinitions`
   - `SimplePropertyDef`
   - `ObjectSpecifier`
   - `GroupByClause`
   - `AggregationsClause`
   - `LinkDefinitions`
   - `ObjectSet`
   - `OsdkObjectFrom`
2. Runtime schema suites:
   - `PropertySecurity` discriminants
   - `QueryDataTypeDefinition` recursion
   - `ActionMetadata.Parameter` unions
   - `WhereClause` unions
3. Export parity suites:
   - Stable index export presence
   - Unstable barrel export presence
4. Alias compatibility suite:
   - `Ontology*` alias compatibility surfaces

## 8. Exit gate
All gates pass, or blocked items are proven pre-existing and documented in final report.

## 9. Memory protocol
Apply proxy health and metrics checks; fallback string on failure is mandatory.

## 10. Handoff document pointer
`handoffs/HANDOFF_P7.md`
