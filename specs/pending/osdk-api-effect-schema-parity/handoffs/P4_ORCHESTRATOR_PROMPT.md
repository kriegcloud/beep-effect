# P4 Orchestrator Prompt

## 1. Context
Core ontology models are available. Aggregate/query primitive layer is next.

## 2. Mission
Implement aggregate/filter/groupby/query primitive stack and validate composition semantics.

## 3. Inputs
1. P1 contracts
2. P3 outputs
3. `handoffs/HANDOFF_P4.md`

## 4. Non-negotiable locks
1. Preserve filter/discriminator correctness.
2. Keep aggregation option types aligned with contracts.
3. Ensure stack composes for P5 consumers.

## 5. Agent assignments
1. aggregate/filter owner
2. groupby/query owner
3. edge-case audit owner

## 6. Required outputs
1. `outputs/p4-aggregate-query/implementation-log.md`
2. `outputs/p4-aggregate-query/edge-case-audit.md`

Locked module scope for this phase:

```text
src/aggregate/BaseFilter.ts
src/aggregate/ArrayFilter.ts
src/aggregate/BooleanFilter.ts
src/aggregate/DatetimeFilter.ts
src/aggregate/NumberFilter.ts
src/aggregate/StringFilter.ts
src/aggregate/Just.ts
src/aggregate/GeoFilter.ts
src/aggregate/WhereClause.ts
src/aggregate/AggregatableKeys.ts
src/aggregate/AggregationsClause.ts
src/aggregate/AggregateOpts.ts
src/aggregate/AggregateOptsThatErrors.ts
src/aggregate/AggregationResultsWithoutGroups.ts
src/aggregate/AggregationResultsWithGroups.ts
src/aggregate/AggregationsResults.ts
src/groupby/GroupByMapper.ts
src/groupby/GroupByClause.ts
src/queries/Aggregations.ts
```

## 7. Required checks
1. Discovery commands
2. Ontology package compile + targeted test checks

## 8. Exit gate
Aggregate stack compiles end-to-end; P5 handoff/prompt authored.

## 9. Memory protocol
Apply proxy health and metrics checks; fallback string on failure is mandatory.

## 10. Handoff document pointer
`handoffs/HANDOFF_P4.md`
