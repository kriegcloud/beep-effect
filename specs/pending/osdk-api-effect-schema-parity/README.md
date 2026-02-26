# OSDK API Effect Schema Parity (`@osdk/api` -> `@beep/ontology`)

## Status
PENDING

## Owner
@elpresidank

## Created
2026-02-26

## Updated
2026-02-26

## Quick Navigation
- [Quick Start](./QUICK_START.md)
- [Master Orchestration](./MASTER_ORCHESTRATION.md)
- [Agent Prompts](./AGENT_PROMPTS.md)
- [Rubrics](./RUBRICS.md)
- [Reflection Log](./REFLECTION_LOG.md)
- [Outputs Manifest](./outputs/manifest.json)
- [Handoff P0](./handoffs/HANDOFF_P0.md)
- [Handoff P1](./handoffs/HANDOFF_P1.md)
- [Handoff P2](./handoffs/HANDOFF_P2.md)
- [Handoff P3](./handoffs/HANDOFF_P3.md)
- [Handoff P4](./handoffs/HANDOFF_P4.md)
- [Handoff P5](./handoffs/HANDOFF_P5.md)
- [Handoff P6](./handoffs/HANDOFF_P6.md)
- [Handoff P7](./handoffs/HANDOFF_P7.md)

## Purpose

**Problem:** `packages/common/ontology` currently contains a partial Effect Schema port of `@osdk/api`, with many missing modules and stubs.

**Solution:** Define and execute a decision-complete, multi-phase implementation plan that reaches full stable parity and gated unstable parity while preserving repository laws and existing `@beep/ontology` alias surfaces.

**Why it matters:** This makes `@beep/ontology` a production-grade, Schema-first equivalent of OSDK API contracts, enabling typed boundaries, runtime decoding, and consistent Effect-first patterns.

## Source-of-Truth Contract

All implementation and parity decisions must follow this order:

1. Local upstream clone:
   - `../dev/references/osdk-ts/packages/api/src/**`
2. Local current implementation:
   - `packages/common/ontology/src/**`
3. Palantir ontology KG artifacts (fallback/reference material):
   - `specs/completed/reverse-engineering-palantir-ontology/outputs/p1-schema-design/kg-schema-design.md`
   - `specs/completed/reverse-engineering-palantir-ontology/outputs/p4b-repo-analysis/osdk-ts.json`

## Baseline Parity Facts (Locked P0)

| Metric | Value |
|---|---:|
| Stable export modules in upstream index | 52 |
| Present in `@beep/ontology/src` | 24 |
| Missing stable modules | 28 |
| Present but stubbed (`<=15` lines) | 10 |
| Unstable export modules in upstream | 7 |
| Present unstable modules in `@beep/ontology/src` | 0 |

## Locked Defaults

1. API shape target: `Hybrid parity + aliases`
2. Unstable scope: `Include as final phase`
3. Type fidelity target: `High type fidelity`
4. Effect conventions:
   - Alias modules: `A/O/P/R/S`
   - No v3 APIs, no `any`, no assertions, no `ts-ignore`
   - Tagged unions via `S.Union(...).pipe(S.toTaggedUnion(...))`
   - `$OntologyId` annotations on exported schema surfaces

## Public API and Interface Changes (Planned)

1. Stable parity exports in `packages/common/ontology/src/index.ts` to mirror `@osdk/api` stable surface.
2. New unstable entrypoint `packages/common/ontology/src/public/unstable.ts` with package export `./unstable`.
3. Add missing stable modules (aggregate/actions/objectSet/queries/timeseries/utilities/definitions).
4. Add transitive type-fidelity modules (`OsdkMetadata`, `OsdkObjectPrimaryKeyType`, filters/helpers, derived-property support).
5. Preserve alias compatibility:
   - `OntologyBase` -> `OsdkBase`
   - `OntologyObject` -> `OsdkObject`
   - `OntologyObjectFrom` -> `OsdkObjectFrom`
   - `OntologyObjectPrimaryKey` -> `OsdkObjectPrimaryKeyType`
   - `definitions/LinkDefinition` -> `definitions/LinkDefinitions` compatibility bridge
6. Update `packages/common/ontology/package.json` exports for stable + unstable parity.
7. Preserve heavy generic type contracts (`Osdk.Instance`, `ConvertProps`, `ExtractOptions`, `PropertyKeys`) while adding runtime schemas where data-bearing.

## Graphiti Memory Routing Policy (Effective 2026-02-26)

Required policy for all orchestration and sub-agents:

1. Route all `graphiti-memory` traffic to `http://127.0.0.1:8123/mcp`.
2. Do not route Graphiti calls directly to `http://127.0.0.1:8000/mcp`.
3. Before heavy parallel work, run:
   - `curl -fsS http://127.0.0.1:8123/healthz`
4. During high fan-out runs, monitor:
   - `curl -fsS http://127.0.0.1:8123/metrics`
5. If proxy/tool is unavailable, continue implementation and report exactly:
   - `graphiti-memory skipped: proxy unavailable`
6. If metrics show `rejected > 0` or queue growth is too high, reduce parallelism.

Host-side startup instruction (operator-managed):

```bash
bun run graphiti:proxy
# optional tuning:
# GRAPHITI_PROXY_CONCURRENCY=1 GRAPHITI_PROXY_MAX_QUEUE=500 bun run graphiti:proxy
```

## Orchestrator Contract

Every `P*_ORCHESTRATOR_PROMPT.md` must include these sections, in this exact order:

1. Context
2. Mission
3. Inputs
4. Non-negotiable locks
5. Agent assignments
6. Required outputs
7. Required checks
8. Exit gate
9. Memory protocol
10. Handoff document pointer

Mandatory checks for every phase:

1. Discovery commands first:
   - `bun run beep docs laws`
   - `bun run beep docs skills`
   - `bun run beep docs policies`
2. If prompt/handoff/agent-instruction text is edited:
   - `bun run agents:pathless:check`
3. Phase is complete only when:
   - Declared outputs exist
   - Exit checks pass
   - Next-phase handoff + orchestrator prompt exist

## Phase Breakdown

| Phase | Focus | Required Outputs |
|---|---|---|
| P0 | Baseline and lock freeze | `outputs/p0-baseline/*` |
| P1 | Schema/type-fidelity contract freeze | `outputs/p1-contract-freeze/*` |
| P2 | Foundation modules | `outputs/p2-foundation/*` |
| P3 | Ontology core + compile-time metadata | `outputs/p3-ontology-core/*` |
| P4 | Aggregate/groupby/query primitives | `outputs/p4-aggregate-query/*` |
| P5 | ObjectSet + Osdk core + actions/queries | `outputs/p5-objectset-osdk/*` |
| P6 | Public surface + aliases + unstable | `outputs/p6-public-surface/*` |
| P7 | Verification + docs + readiness | `outputs/p7-verification/*` |

## Locked Phase Module Scopes

### P2 — Foundation modules

```text
src/Logger.ts
src/object/Attachment.ts
src/object/Media.ts
src/object/PropertySecurity.ts
src/object/Result.ts
src/PageResult.ts
src/ontology/OntologyMetadata.ts
src/ontology/PrimaryKeyTypes.ts
src/ontology/WirePropertyTypes.ts
src/ontology/VersionString.ts
src/ontology/valueFormatting/PropertyBooleanFormattingRule.ts
src/ontology/valueFormatting/PropertyKnownTypeFormattingRule.ts
src/ontology/valueFormatting/PropertyValueFormattingUtils.ts
src/ontology/valueFormatting/PropertyDateAndTimestampFormattingRule.ts
src/ontology/valueFormatting/PropertyNumberFormattingRule.ts
src/ontology/valueFormatting/PropertyValueFormattingRule.ts
src/mapping/DurationMapping.ts
src/mapping/DataValueMapping.ts
src/timeseries/timeseries.ts
src/OsdkMetadata.ts
src/OsdkObjectPrimaryKeyType.ts
src/util/IncludeValuesExtending.ts
```

### P3 — Ontology core + compile-time metadata

```text
src/ontology/SimplePropertyDef.ts
src/ontology/InterfaceDefinition.ts
src/ontology/ObjectTypeDefinition.ts
src/ontology/ObjectOrInterface.ts
src/ontology/ObjectSpecifier.ts
src/ontology/ActionDefinition.ts
src/ontology/QueryDefinition.ts
src/mapping/PropertyValueMapping.ts
src/OsdkObject.ts
src/Definitions.ts
src/object/FetchPageArgs.ts
```

### P4 — Aggregate / groupby / query primitives

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

### P5 — ObjectSet + Osdk core + actions/queries

```text
src/OsdkBase.ts
src/object/FetchPageResult.ts
src/objectSet/BaseObjectSet.ts
src/objectSet/ObjectSetLinks.ts
src/objectSet/ObjectSetListener.ts
src/objectSet/ObjectSet.ts
src/objectSet/BulkLinkResult.ts
src/definitions/LinkDefinitions.ts
src/definitions.ts
src/derivedProperties/WithPropertiesAggregationOptions.ts
src/derivedProperties/Expressions.ts
src/derivedProperties/DerivedProperty.ts
src/OsdkObjectFrom.ts
src/actions/NullValue.ts
src/actions/ActionResults.ts
src/actions/Actions.ts
src/actions/ActionReturnTypeForOptions.ts
src/queries/Queries.ts
src/util/LinkUtils.ts
```

### P6 — Public surface + aliases + unstable

```text
src/index.ts
src/public/unstable.ts
src/experimental/Experiment.ts
src/experimental/createMediaReference.ts
src/experimental/fetchOneByRid.ts
src/experimental/fetchPageByRid.ts
src/experimental/getBulkLinks.ts
src/OntologyBase.ts
src/OntologyObject.ts
src/OntologyObjectFrom.ts
src/OntologyObjectPrimaryKey.ts
src/definitions/LinkDefinition.ts
packages/common/ontology/package.json
```

## Knowledge Graph Protocol

At every phase start:

1. Query memory for phase objective in both groups:
   - `group_ids: ["beep-dev"]`
   - `group_ids: ["palantir-ontology"]`
2. If no facts are returned, fall back to:
   - `specs/completed/reverse-engineering-palantir-ontology/outputs/p1-schema-design/kg-schema-design.md`
   - `specs/completed/reverse-engineering-palantir-ontology/outputs/p4b-repo-analysis/osdk-ts.json`

During each phase:

1. Write implementation decisions and hard bug root causes to `beep-dev`.
2. Write Palantir ontology concept mapping discoveries to `palantir-ontology`.

If Graphiti write/read fails:

1. Record failure in phase output.
2. Continue with local source-of-truth files.
3. Retry once at phase end.

## Phase Completion Invariant

No phase can be marked complete until:

1. Phase artifacts are present and non-empty.
2. Required checks and gates pass.
3. Next phase prompt + handoff set is authored.

## Dependencies

1. Local upstream clone at `../dev/references/osdk-ts/packages/api`.
2. `@beep/ontology` package at `packages/common/ontology`.
3. Local repo tooling commands (`bun run check`, `bun run lint`, `bun run test`, `bun run docgen`).
4. Graphiti proxy availability at `127.0.0.1:8123` (optional for continuation, required for memory mode).

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Heavy generic type regressions | High | Lock type parity tests in P1 and enforce during P3/P5 |
| Recursive schema complexity (`QueryDefinition`, filters) | High | Freeze recursion strategy in P1 and gate P2/P3 on no unresolved blockers |
| Export drift from upstream index | High | P6 export parity matrix as hard gate |
| Proxy instability for memory | Medium | Proxy health/metrics checks + explicit skip fallback text |
| Scope creep in unstable area | Medium | Keep unstable strictly in P6 after stable parity gates |

## Required Verification Commands (P7 Gate)

1. `cd packages/common/ontology && bun run check`
2. `cd packages/common/ontology && bun run lint`
3. `cd packages/common/ontology && bun run test`
4. `cd packages/common/ontology && bun run docgen`
5. `bun run check`
6. `bun run lint`
7. `bun run test`
8. `bun run docgen`
