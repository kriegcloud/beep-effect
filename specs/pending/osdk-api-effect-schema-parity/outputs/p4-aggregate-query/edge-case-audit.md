# P4 Edge-Case Audit (Aggregate/Filter/GroupBy/Query)

## Scope
- Audited:
  - `packages/common/ontology/src/aggregate/*`
  - `packages/common/ontology/src/groupby/*`
  - `packages/common/ontology/src/queries/Aggregations.ts`
- Focus areas:
  1. filter/discriminator correctness
  2. aggregation option type alignment with contracts
  3. composition semantics for P5 consumers

## Checks Performed
1. Contract/law discovery
- `bun run beep docs laws`

2. Memory protocol proxy evidence (required)
- `curl -sS -D - http://127.0.0.1:8123/healthz`
  - Result: connection refused (`curl: (7) Failed to connect to 127.0.0.1 port 8123`)
- `curl -sS -D - http://127.0.0.1:8123/metrics`
  - Result: connection refused (`curl: (7) Failed to connect to 127.0.0.1 port 8123`)
- Graphiti MCP preflight
  - Ran `search_memory_facts` with `group_ids=["beep-dev"]` for this task context.
- Required fallback string (verbatim): `graphiti-memory skipped: proxy unavailable`

3. Static/type audit
- File-by-file review of all target modules.
- Upstream parity diff review against `/home/elpresidank/YeeBois/dev/references/osdk-ts/packages/api/src/{aggregate,groupby,queries}`.
- Type-level composition check:
  - `bunx tstyche --config /tmp/tstyche-p4-ontology.json --root /home/elpresidank/YeeBois/projects/beep-effect`
  - Result: pass (`15 tests`, `32 assertions`).

## Findings
1. Ordering-safety helper is opt-in and can be bypassed by widened generic inputs.
- Evidence:
  - `AggregateOpts` permits ordered and unordered selects without groupBy-sensitive narrowing ([AggregateOpts.ts](/home/elpresidank/YeeBois/projects/beep-effect/packages/common/ontology/src/aggregate/AggregateOpts.ts:17)).
  - Restriction logic lives in `AggregateOptsThatErrorsAndDisallowsOrderingWithMultipleGroupBy`, but includes a branch where `{}`-assignable groupBy types fall back to non-restrictive behavior ([AggregateOptsThatErrors.ts](/home/elpresidank/YeeBois/projects/beep-effect/packages/common/ontology/src/aggregate/AggregateOptsThatErrors.ts:33)).
- Impact:
  - If P5 APIs consume `AggregateOpts<Q>` directly (or accept widened `GroupByClause<Q>` values), invalid ordered grouped combinations may compile.
- Severity: Medium.

2. Range key contract is looser in query helper types than in wire data-value mapping.
- Evidence:
  - Query aggregation `Range` allows open-ended ranges (optional `startValue` or `endValue`) ([Aggregations.ts](/home/elpresidank/YeeBois/projects/beep-effect/packages/common/ontology/src/queries/Aggregations.ts:20)).
  - Data value mapping range keys require both `startValue` and `endValue` ([DataValueMapping.ts](/home/elpresidank/YeeBois/projects/beep-effect/packages/common/ontology/src/mapping/DataValueMapping.ts:24)).
- Impact:
  - P5 consumers may type-check open-ended ranges in query helper flows that are not represented by the current wire bucket key contract.
- Severity: Medium.

3. Numeric treatment is asymmetric for `long` across filter/select/groupBy.
- Evidence:
  - `WhereClause` numeric filter set includes `long` ([WhereClause.ts](/home/elpresidank/YeeBois/projects/beep-effect/packages/common/ontology/src/aggregate/WhereClause.ts:193)).
  - Aggregation metric routing treats numeric-like client inputs as numeric (`number extends ...`) ([AggregatableKeys.ts](/home/elpresidank/YeeBois/projects/beep-effect/packages/common/ontology/src/aggregate/AggregatableKeys.ts:57)).
  - `GroupByMapper` has no `long` entry ([GroupByMapper.ts](/home/elpresidank/YeeBois/projects/beep-effect/packages/common/ontology/src/groupby/GroupByMapper.ts:21)).
- Impact:
  - A `long` field can be filtered/selected with numeric-like semantics but cannot be grouped, which can surprise P5 composition paths.
- Severity: Medium-Low.

## Residual Risks
- `$in: []` is explicitly documented as match-all in base filter options ([BaseFilter.ts](/home/elpresidank/YeeBois/projects/beep-effect/packages/common/ontology/src/aggregate/BaseFilter.ts:37)); this is high surprise potential in caller-provided filters.
- Geo filter types are locally modeled (tuple-based) rather than imported `geojson` types; this may reject some externally typed GeoJSON payloads that upstream typings would accept ([WhereClause.ts](/home/elpresidank/YeeBois/projects/beep-effect/packages/common/ontology/src/aggregate/WhereClause.ts:22), [GeoFilter.ts](/home/elpresidank/YeeBois/projects/beep-effect/packages/common/ontology/src/aggregate/GeoFilter.ts:10)).
- With-properties aggregation option unions are currently inlined in `AggregatableKeys.ts`; risk of drift when P5 introduces dedicated derived-properties option modules.

## Recommended P5 Guardrails
1. Standardize all aggregate entrypoints on `AggregateOptsThatErrorsAndDisallowsOrderingWithMultipleGroupBy<...>` instead of raw `AggregateOpts<...>`.
2. Add dedicated type tests for widened-generic callsites (non-literal `groupBy`) to ensure ordering restrictions are still enforced.
3. Choose and document one canonical range-key contract (open-ended vs closed) and align `queries/Aggregations.ts` with `mapping/DataValueMapping.ts`.
4. Decide and document `long` groupBy policy explicitly (support it in `GroupByMapper` or explicitly block it in aggregate/select/filter-facing docs/types).
5. Add caller-facing validation at P5 boundaries to block accidental `$in: []` unless explicitly intended.
