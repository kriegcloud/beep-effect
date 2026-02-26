# Handoff P4

## Objective
Implement aggregate/filter/groupby/query primitives and validate composition semantics.

## Inputs
1. P1 contracts
2. P3 outputs
3. Upstream aggregate/groupby/query primitive modules

## Required Work
Implement this exact P4 scope, focusing on filter unions, aggregate option typing, and query primitive wiring:

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

## Deliverables
- `outputs/p4-aggregate-query/implementation-log.md`
- `outputs/p4-aggregate-query/edge-case-audit.md`

## Completion Checklist
- [ ] Aggregate stack compiles end-to-end.
- [ ] GroupBy and WhereClause scenarios covered.
- [ ] P5 handoff + prompt authored.

## Memory Protocol
Proxy-only routing and fallback text are mandatory.

## Exit Gate
P4 closes when P5 heavy object/action/query layers can build on a stable primitive stack.
