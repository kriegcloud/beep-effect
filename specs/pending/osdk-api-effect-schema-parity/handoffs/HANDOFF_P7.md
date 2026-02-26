# Handoff P7

## Objective
Execute verification matrix and produce release-readiness evidence.

## Inputs
1. P1 test contract
2. P6 export and alias reports
3. Full code changes from P2-P6

## Required Work
1. Execute required package and repo commands.
2. Run type/runtime/export/alias/docgen scenario suite.
3. Record evidence and unresolved risks.

Required test scenarios:

1. Type parity suites adapted from upstream:
   - `ObjectDefinitions`
   - `SimplePropertyDef`
   - `ObjectSpecifier`
   - `GroupByClause`
   - `AggregationsClause`
   - `LinkDefinitions`
   - `ObjectSet`
   - `OsdkObjectFrom`
2. Runtime schema decode/encode scenarios:
   - `PropertySecurity` discriminants
   - `QueryDataTypeDefinition` recursive unions
   - `ActionMetadata.Parameter` union branches
   - `WhereClause` filter branches
3. Export parity checks:
   - Stable export path presence vs upstream index
   - Unstable export path presence vs upstream unstable barrel
4. Alias compatibility checks:
   - Existing `Ontology*` alias surfaces still resolve
5. Docgen sanity checks:
   - New modules appear without broken examples

Required command matrix:

1. `cd packages/common/ontology && bun run check`
2. `cd packages/common/ontology && bun run lint`
3. `cd packages/common/ontology && bun run test`
4. `cd packages/common/ontology && bun run docgen`
5. `bun run check`
6. `bun run lint`
7. `bun run test`
8. `bun run docgen`

## Deliverables
- `outputs/p7-verification/report.md`
- `outputs/p7-verification/command-evidence.md`
- `outputs/p7-verification/open-risks.md`

## Completion Checklist
- [ ] Required commands executed and recorded.
- [ ] Scenario suites completed.
- [ ] Any failures categorized as new or pre-existing with proof.
- [ ] Final readiness summary complete.

## Memory Protocol
Proxy-only routing and fallback text are mandatory.

## Exit Gate
P7 closes only when gates pass or documented pre-existing blockers are proven and accepted.
